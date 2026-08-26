/**
 * ==========================================================================
 * DANNA MESA STUDIO — TESTIMONIOS: "LO DICEN ELLAS"
 * Módulo Público de Carrusel Animado Interactivo & Conexión con Firestore
 * ==========================================================================
 */

(function () {
  'use strict';

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAtDg0SFIyVI23-Ony28IKZhy9xDvaI8no",
    authDomain: "danna-mesa-studio.firebaseapp.com",
    projectId: "danna-mesa-studio",
    storageBucket: "danna-mesa-studio.firebasestorage.app",
    messagingSenderId: "709114044871",
    appId: "1:709114044871:web:f7eea39cb714a20bf039e2",
    measurementId: "G-2M73B5VMMT"
  };

  // Testimonios iniciales reales integrados directamente (fallback inmediato y offline)
  const DEFAULT_TESTIMONIALS = [
    {
      id: "default-1",
      quote: "Tienes muy buena aplicación porque la vez pasada me fue súper bien y muy buena retención.",
      clientName: "Clienta Frecuente",
      service: "Extensiones de Pestañas",
      date: "Retención & Calidad",
      image: "assets/img/testimonials/IMG_6857.jpg",
      priority: 1,
      published: true
    },
    {
      id: "default-2",
      quote: "A todo el mundo le han encantado, todos me preguntan por ellas y dónde me las hice.",
      clientName: "Laura M.",
      service: "Diseño de Mirada",
      date: "Clienta Studio",
      image: "assets/img/testimonials/IMG_6858.jpg",
      priority: 2,
      published: true
    },
    {
      id: "default-3",
      quote: "Danna de verdad que haces maravillas con las manos, cambias las miradas, las vuelves hermosas.",
      clientName: "Valentina G.",
      service: "Lifting & Pestañas",
      date: "Experiencia Studio",
      image: "assets/img/testimonials/IMG_6860.jpg",
      priority: 3,
      published: true
    },
    {
      id: "default-4",
      quote: "Pasaba por aquí para agradecerte, me encantaron mis cejas y pestañas.",
      clientName: "Camila R.",
      service: "Combo Mirada Perfecta",
      date: "Pestañas + Cejas",
      image: "assets/img/testimonials/IMG_6862.jpg",
      priority: 4,
      published: true
    },
    {
      id: "default-5",
      quote: "Las amé... Trabajas muy hermoso.",
      clientName: "Mariana S.",
      service: "Volumen Exclusivo",
      date: "Resultado Real",
      image: "assets/img/testimonials/IMG_6863.jpg",
      priority: 5,
      published: true
    },
    {
      id: "default-6",
      quote: "Mil gracias, quedé feliz, me encantaron.",
      clientName: "Sofía T.",
      service: "Lifting de Pestañas",
      date: "Clienta Verificada",
      image: "assets/img/testimonials/IMG_6859.jpg",
      priority: 6,
      published: true
    },
    {
      quote: "Voy súper bien, amé las pestañas.",
      clientName: "Carolina V.",
      service: "Extensiones Clásicas",
      date: "Clienta Studio",
      image: "assets/img/testimonials/IMG_6861.jpg",
      priority: 7,
      published: true
    }
  ];

  class TestimonialsCarouselApp {
    constructor() {
      this.testimonials = [...DEFAULT_TESTIMONIALS];
      this.currentIndex = 0;
      this.autoPlayInterval = null;
      this.autoPlayDelay = 4500;
      this.isDragging = false;
      this.startX = 0;
      this.currentTranslate = 0;
      this.prevTranslate = 0;
      this.db = null;

      this.initFirebase();
      this.initElements();
      this.bindEvents();
      this.render();
      this.fetchFromFirestore();
    }

    initFirebase() {
      try {
        if (typeof firebase !== 'undefined') {
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
          this.db = firebase.firestore();
        }
      } catch (err) {
        console.warn("[Testimonials] Firebase init fallback to local defaults:", err);
      }
    }

    initElements() {
      this.trackEl = document.getElementById("testimonialsGrid");
      this.trackContainer = document.getElementById("carouselTrackContainer");
      this.prevBtn = document.getElementById("carouselPrevBtn");
      this.nextBtn = document.getElementById("carouselNextBtn");
      this.dotsContainer = document.getElementById("testimonialsDotsContainer");
      this.lightboxModal = document.getElementById("testimonialLightboxModal");
      this.lightboxImg = document.getElementById("testimonialLightboxImg");
      this.lightboxCaption = document.getElementById("testimonialLightboxCaption");
      this.lightboxCloseBtn = document.getElementById("testimonialLightboxClose");
    }

    bindEvents() {
      // Botones de navegación
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", () => {
          this.stopAutoPlay();
          this.prevSlide();
          this.startAutoPlay();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", () => {
          this.stopAutoPlay();
          this.nextSlide();
          this.startAutoPlay();
        });
      }

      // Lightbox
      if (this.lightboxCloseBtn) {
        this.lightboxCloseBtn.addEventListener("click", () => this.closeLightbox());
      }
      if (this.lightboxModal) {
        this.lightboxModal.addEventListener("click", (e) => {
          if (e.target === this.lightboxModal) this.closeLightbox();
        });
      }
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.lightboxModal && this.lightboxModal.classList.contains("active")) {
          this.closeLightbox();
        }
      });

      // Pausa de auto-play al posar el cursor o tocar
      if (this.trackContainer) {
        this.trackContainer.addEventListener("mouseenter", () => this.stopAutoPlay());
        this.trackContainer.addEventListener("mouseleave", () => this.startAutoPlay());

        // Gestos táctiles y arrastre con mouse
        this.trackContainer.addEventListener("touchstart", (e) => this.handleDragStart(e), { passive: true });
        this.trackContainer.addEventListener("touchmove", (e) => this.handleDragMove(e), { passive: true });
        this.trackContainer.addEventListener("touchend", () => this.handleDragEnd());

        this.trackContainer.addEventListener("mousedown", (e) => this.handleDragStart(e));
        window.addEventListener("mousemove", (e) => this.handleDragMove(e));
        window.addEventListener("mouseup", () => this.handleDragEnd());
      }

      // Recalcular en redimensión de ventana
      window.addEventListener("resize", () => {
        this.updatePosition(false);
      });
    }

    async fetchFromFirestore() {
      if (!this.db) return;

      try {
        const snapshot = await this.db.collection("testimonials")
          .where("published", "==", true)
          .get();

        if (!snapshot.empty) {
          const remoteItems = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            remoteItems.push({
              id: doc.id,
              ...data
            });
          });

          remoteItems.sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));

          if (remoteItems.length > 0) {
            this.testimonials = remoteItems;
            this.currentIndex = 0;
            this.render();
          }
        }
      } catch (err) {
        console.warn("[Testimonials] Firestore fetch fallback:", err);
      }
    }

    render() {
      if (!this.trackEl) return;

      this.trackEl.innerHTML = this.testimonials.map((item) => {
        const quoteHtml = this.escapeHtml(item.quote);
        const nameHtml = this.escapeHtml(item.clientName || "Clienta Verificada");
        const serviceHtml = this.escapeHtml(item.service || "Servicio Studio");
        const dateHtml = this.escapeHtml(item.date || "Experiencia Real");
        const imgSrc = item.image || item.imageUrl || "assets/img/page_img_1.jpeg";

        return `
          <article class="testimonial-card" data-id="${item.id}">
            <div class="testimonial-card-top">
              <span class="testimonial-rating-stars">★★★★★</span>
              <span class="testimonial-badge-verified">✓ Verificado</span>
            </div>

            <p class="testimonial-quote">${quoteHtml}</p>

            <div class="testimonial-screenshot-wrap" data-img="${imgSrc}" data-caption="${quoteHtml} — ${nameHtml}">
              <img 
                src="${imgSrc}" 
                alt="Mensaje real de clienta sobre ${serviceHtml}" 
                class="testimonial-screenshot-img" 
                loading="lazy"
              >
              <div class="testimonial-screenshot-overlay">
                <span class="testimonial-zoom-pill">
                  🔍 Ver captura completa
                </span>
              </div>
            </div>

            <div class="testimonial-card-footer">
              <div class="testimonial-author-box">
                <span class="testimonial-author-name">${nameHtml}</span>
                <span class="testimonial-service-tag">${serviceHtml}</span>
              </div>
              <span class="testimonial-date-label">${dateHtml}</span>
            </div>
          </article>
        `;
      }).join("");

      // Vincular eventos de clic en screenshots para abrir Lightbox
      this.trackEl.querySelectorAll(".testimonial-screenshot-wrap").forEach((wrap) => {
        wrap.addEventListener("click", () => {
          const img = wrap.getAttribute("data-img");
          const caption = wrap.getAttribute("data-caption");
          this.openLightbox(img, caption);
        });
      });

      this.renderDots();
      this.updatePosition(false);
      this.startAutoPlay();
    }

    renderDots() {
      if (!this.dotsContainer) return;
      const totalSlides = this.testimonials.length;

      this.dotsContainer.innerHTML = Array.from({ length: totalSlides }).map((_, idx) => `
        <button 
          class="carousel-dot ${idx === this.currentIndex ? 'active' : ''}" 
          data-dot-index="${idx}" 
          aria-label="Ir al testimonio ${idx + 1}"
        ></button>
      `).join("");

      this.dotsContainer.querySelectorAll(".carousel-dot").forEach((dot) => {
        dot.addEventListener("click", () => {
          this.stopAutoPlay();
          const targetIdx = parseInt(dot.getAttribute("data-dot-index"), 10);
          this.goToSlide(targetIdx);
          this.startAutoPlay();
        });
      });
    }

    getCardsPerView() {
      const width = window.innerWidth;
      if (width <= 640) return 1;
      if (width <= 1024) return 2;
      return 3;
    }

    getMaxIndex() {
      const cardsPerView = this.getCardsPerView();
      return Math.max(0, this.testimonials.length - cardsPerView);
    }

    goToSlide(index) {
      const maxIdx = this.getMaxIndex();
      if (index < 0) {
        this.currentIndex = maxIdx;
      } else if (index > maxIdx) {
        this.currentIndex = 0;
      } else {
        this.currentIndex = index;
      }
      this.updatePosition(true);
    }

    nextSlide() {
      const maxIdx = this.getMaxIndex();
      if (this.currentIndex >= maxIdx) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
      this.updatePosition(true);
    }

    prevSlide() {
      const maxIdx = this.getMaxIndex();
      if (this.currentIndex <= 0) {
        this.currentIndex = maxIdx;
      } else {
        this.currentIndex--;
      }
      this.updatePosition(true);
    }

    updatePosition(smooth = true) {
      if (!this.trackEl) return;

      const cards = this.trackEl.querySelectorAll(".testimonial-card");
      if (cards.length === 0) return;

      const cardWidth = cards[0].offsetWidth;
      const gap = 24; // Espacio entre tarjetas
      const offset = this.currentIndex * (cardWidth + gap);

      this.trackEl.style.transition = smooth ? "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
      this.trackEl.style.transform = `translateX(-${offset}px)`;

      // Actualizar dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll(".carousel-dot");
        dots.forEach((d, i) => {
          d.classList.toggle("active", i === this.currentIndex);
        });
      }
    }

    startAutoPlay() {
      this.stopAutoPlay();
      this.autoPlayInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoPlayDelay);
    }

    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
    }

    // Drag & Touch handlers
    handleDragStart(e) {
      this.isDragging = true;
      this.stopAutoPlay();
      this.startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }

    handleDragMove(e) {
      if (!this.isDragging) return;
      const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const diffX = currentX - this.startX;

      // Resistencia en arrastre
      if (Math.abs(diffX) > 60) {
        this.isDragging = false;
        if (diffX < 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
        this.startAutoPlay();
      }
    }

    handleDragEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        this.startAutoPlay();
      }
    }

    // Lightbox
    openLightbox(imageUrl, caption) {
      if (!this.lightboxModal || !this.lightboxImg) return;
      this.stopAutoPlay();
      this.lightboxImg.src = imageUrl;
      if (this.lightboxCaption) {
        this.lightboxCaption.textContent = caption || "Conversación real con clienta de Danna Mesa Studio";
      }
      this.lightboxModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    closeLightbox() {
      if (!this.lightboxModal) return;
      this.lightboxModal.classList.remove("active");
      document.body.style.overflow = "";
      if (this.lightboxImg) {
        setTimeout(() => {
          if (!this.lightboxModal.classList.contains("active")) {
            this.lightboxImg.src = "";
          }
        }, 250);
      }
      this.startAutoPlay();
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }
  }

  // Inicializar al cargar el DOM
  document.addEventListener("DOMContentLoaded", () => {
    window.testimonialsApp = new TestimonialsCarouselApp();
  });
})();
