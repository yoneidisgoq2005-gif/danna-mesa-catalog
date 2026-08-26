/**
 * ==========================================================================
 * DANNA MESA STUDIO — TESTIMONIOS: "LO DICEN ELLAS"
 * Carrusel Continuo Infinito (Marquee de Lujo), Interactivo y Pausable
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

  // Testimonios iniciales reales integrados directamente
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
      id: "default-7",
      quote: "Voy súper bien, amé las pestañas.",
      clientName: "Carolina V.",
      service: "Extensiones Clásicas",
      date: "Clienta Studio",
      image: "assets/img/testimonials/IMG_6861.jpg",
      priority: 7,
      published: true
    }
  ];

  class ContinuousTestimonialsMarquee {
    constructor() {
      this.testimonials = [...DEFAULT_TESTIMONIALS];
      this.currentOffset = 0;
      this.speed = 0.62; // Velocidad continua, constante, fluida y perfectamente legible
      this.isPaused = false;
      this.isDragging = false;
      this.isHovering = false;
      this.hasMoved = false;
      this.dragStartX = 0;
      this.initialOffset = 0;
      this.animationFrameId = null;
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
        console.warn("[Testimonials] Firebase init fallback:", err);
      }
    }

    initElements() {
      this.wrapperEl = document.getElementById("testimonialsCarouselWrapper");
      this.trackContainer = document.getElementById("carouselTrackContainer");
      this.trackEl = document.getElementById("testimonialsGrid");
      this.prevBtn = document.getElementById("carouselPrevBtn");
      this.nextBtn = document.getElementById("carouselNextBtn");
      this.lightboxModal = document.getElementById("testimonialLightboxModal");
      this.lightboxImg = document.getElementById("testimonialLightboxImg");
      this.lightboxCaption = document.getElementById("testimonialLightboxCaption");
      this.lightboxCloseBtn = document.getElementById("testimonialLightboxClose");
    }

    bindEvents() {
      // Botones de flechas para salto manual suave
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", () => this.nudge(-360));
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", () => this.nudge(360));
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

      // Pausa al posar el mouse (Hover)
      if (this.wrapperEl) {
        this.wrapperEl.addEventListener("mouseenter", () => {
          this.isHovering = true;
          this.isPaused = true;
        });
        this.wrapperEl.addEventListener("mouseleave", () => {
          this.isHovering = false;
          if (!this.isDragging) this.isPaused = false;
        });
      }

      // Control táctil (Touch en móviles/tablets)
      if (this.trackContainer) {
        this.trackContainer.addEventListener("touchstart", (e) => this.onDragStart(e), { passive: true });
        this.trackContainer.addEventListener("touchmove", (e) => this.onDragMove(e), { passive: true });
        this.trackContainer.addEventListener("touchend", () => this.onDragEnd());

        // Control con mouse (Drag en escritorio)
        this.trackContainer.addEventListener("mousedown", (e) => this.onDragStart(e));
        window.addEventListener("mousemove", (e) => this.onDragMove(e));
        window.addEventListener("mouseup", () => this.onDragEnd());
      }
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
            this.render();
          }
        }
      } catch (err) {
        console.warn("[Testimonials] Firestore fetch fallback:", err);
      }
    }

    render() {
      if (!this.trackEl) return;

      // Duplicamos el conjunto de testimonios para que el bucle continuo sea 100% invisible y sin cortes
      const duplicatedList = [...this.testimonials, ...this.testimonials, ...this.testimonials];

      this.trackEl.innerHTML = duplicatedList.map((item, idx) => {
        const quoteHtml = this.escapeHtml(item.quote);
        const nameHtml = this.escapeHtml(item.clientName || "Clienta Verificada");
        const serviceHtml = this.escapeHtml(item.service || "Servicio Studio");
        const dateHtml = this.escapeHtml(item.date || "Experiencia Real");
        const imgSrc = item.image || item.imageUrl || "assets/img/page_img_1.jpeg";

        return `
          <article class="testimonial-card" data-card-idx="${idx}">
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
                draggable="false"
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

      // Clics en las capturas para abrir Lightbox (solo si no fue un arrastre de scroll)
      this.trackEl.querySelectorAll(".testimonial-screenshot-wrap").forEach((wrap) => {
        wrap.addEventListener("click", (e) => {
          if (this.hasMoved) return; // Evita abrir lightbox si la clienta estaba arrastrando
          const img = wrap.getAttribute("data-img");
          const caption = wrap.getAttribute("data-caption");
          this.openLightbox(img, caption);
        });
      });

      this.startLoop();
    }

    startLoop() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      const animate = () => {
        if (!this.isPaused && !this.isDragging) {
          this.currentOffset += this.speed;
        }

        // Bucle infinito sin saltos
        const singleSetWidth = this.trackEl.scrollWidth / 3;
        if (singleSetWidth > 0) {
          if (this.currentOffset >= singleSetWidth) {
            this.currentOffset -= singleSetWidth;
            if (this.initialOffset) this.initialOffset -= singleSetWidth;
          } else if (this.currentOffset < 0) {
            this.currentOffset += singleSetWidth;
            if (this.initialOffset) this.initialOffset += singleSetWidth;
          }
        }

        this.trackEl.style.transform = `translate3d(-${this.currentOffset}px, 0, 0)`;
        this.animationFrameId = requestAnimationFrame(animate);
      };

      this.animationFrameId = requestAnimationFrame(animate);
    }

    // Nudge de flechas izquierda/derecha
    nudge(delta) {
      this.isPaused = true;
      const targetOffset = this.currentOffset + delta;
      const startTime = performance.now();
      const startOffset = this.currentOffset;
      const duration = 400; // ms

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

        this.currentOffset = startOffset + delta * ease;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setTimeout(() => {
            if (!this.isHovering && !this.isDragging) {
              this.isPaused = false;
            }
          }, 1200);
        }
      };

      requestAnimationFrame(step);
    }

    // Drag & Touch handlers
    onDragStart(e) {
      this.isDragging = true;
      this.isPaused = true;
      this.hasMoved = false;
      this.dragStartX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      this.initialOffset = this.currentOffset;
    }

    onDragMove(e) {
      if (!this.isDragging) return;
      const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const deltaX = currentX - this.dragStartX;

      if (Math.abs(deltaX) > 6) {
        this.hasMoved = true;
      }

      this.currentOffset = this.initialOffset - deltaX;
    }

    onDragEnd() {
      if (this.isDragging) {
        this.isDragging = false;
        // Reanudar movimiento constante después de un momento de lectura
        setTimeout(() => {
          if (!this.isHovering) {
            this.isPaused = false;
          }
        }, 1500);
      }
    }

    // Lightbox
    openLightbox(imageUrl, caption) {
      if (!this.lightboxModal || !this.lightboxImg) return;
      this.isPaused = true;
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
      if (!this.isHovering) {
        this.isPaused = false;
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }
  }

  // Inicializar al cargar el DOM
  document.addEventListener("DOMContentLoaded", () => {
    window.testimonialsApp = new ContinuousTestimonialsMarquee();
  });
})();
