/**
 * ==========================================================================
 * DANNA MESA STUDIO — TESTIMONIOS: "LO DICEN ELLAS"
 * Módulo Público de Prueba Social & Conexión con Firestore
 * ==========================================================================
 */

(function () {
  'use strict';

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAtDg0SFiYVI23-Ony28IKZhy9xDvaI8no",
    authDomain: "danna-mesa-studio.firebaseapp.com",
    projectId: "danna-mesa-studio",
    storageBucket: "danna-mesa-studio.firebasestorage.app",
    messagingSenderId: "789114044871",
    appId: "1:789114044871:web:3cbe82d9cd2922Bff039e2",
    measurementId: "G-H17T6V6HX"
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

  class TestimonialsApp {
    constructor() {
      this.testimonials = [...DEFAULT_TESTIMONIALS];
      this.displayLimit = 6;
      this.showingAll = false;
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
      this.gridEl = document.getElementById("testimonialsGrid");
      this.loadMoreBtn = document.getElementById("loadMoreTestimonials");
      this.lightboxModal = document.getElementById("testimonialLightboxModal");
      this.lightboxImg = document.getElementById("testimonialLightboxImg");
      this.lightboxCaption = document.getElementById("testimonialLightboxCaption");
      this.lightboxCloseBtn = document.getElementById("testimonialLightboxClose");
    }

    bindEvents() {
      if (this.loadMoreBtn) {
        this.loadMoreBtn.addEventListener("click", () => {
          this.showingAll = true;
          this.render();
          this.loadMoreBtn.style.display = "none";
        });
      }

      if (this.lightboxCloseBtn) {
        this.lightboxCloseBtn.addEventListener("click", () => this.closeLightbox());
      }

      if (this.lightboxModal) {
        this.lightboxModal.addEventListener("click", (e) => {
          if (e.target === this.lightboxModal) {
            this.closeLightbox();
          }
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.lightboxModal && this.lightboxModal.classList.contains("active")) {
          this.closeLightbox();
        }
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

          // Ordenar por prioridad ascendente
          remoteItems.sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));

          if (remoteItems.length > 0) {
            this.testimonials = remoteItems;
            this.render();
          }
        }
      } catch (err) {
        console.warn("[Testimonials] Firestore fetch error (using verified fallback):", err);
      }
    }

    openLightbox(imageUrl, caption) {
      if (!this.lightboxModal || !this.lightboxImg) return;
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
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }

    render() {
      if (!this.gridEl) return;

      const itemsToRender = this.showingAll 
        ? this.testimonials 
        : this.testimonials.slice(0, this.displayLimit);

      this.gridEl.innerHTML = itemsToRender.map((item) => {
        const quoteHtml = this.escapeHtml(item.quote);
        const nameHtml = this.escapeHtml(item.clientName || "Clienta Verificada");
        const serviceHtml = this.escapeHtml(item.service || "Servicio Studio");
        const dateHtml = this.escapeHtml(item.date || "Experiencia Real");
        const imgSrc = item.image || item.imageUrl || "assets/img/page_img_1.jpeg";

        return `
          <article class="testimonial-card" data-id="${item.id}">
            <div class="testimonial-card-top">
              <span class="testimonial-badge-verified">
                <span>✦</span> Experiencia Real
              </span>
              <span class="testimonial-service-tag">${serviceHtml}</span>
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
                  🔍 Ver conversación completa
                </span>
              </div>
            </div>

            <div class="testimonial-card-footer">
              <span class="testimonial-author-name">${nameHtml}</span>
              <span class="testimonial-date-label">${dateHtml}</span>
            </div>
          </article>
        `;
      }).join("");

      // Vincular eventos de clic para abrir el lightbox en cada captura
      this.gridEl.querySelectorAll(".testimonial-screenshot-wrap").forEach((wrap) => {
        wrap.addEventListener("click", () => {
          const img = wrap.getAttribute("data-img");
          const caption = wrap.getAttribute("data-caption");
          this.openLightbox(img, caption);
        });
      });

      // Mostrar u ocultar botón de "Ver más"
      if (this.loadMoreBtn) {
        if (!this.showingAll && this.testimonials.length > this.displayLimit) {
          this.loadMoreBtn.style.display = "inline-flex";
          this.loadMoreBtn.innerHTML = `Ver más experiencias (${this.testimonials.length - this.displayLimit} más) ↓`;
        } else {
          this.loadMoreBtn.style.display = "none";
        }
      }
    }
  }

  // Inicializar al cargar el DOM
  document.addEventListener("DOMContentLoaded", () => {
    window.testimonialsApp = new TestimonialsApp();
  });
})();
