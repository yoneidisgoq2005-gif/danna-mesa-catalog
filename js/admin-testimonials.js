/**
 * ==========================================================================
 * DANNA MESA STUDIO — ADMIN TESTIMONIOS: "LO DICEN ELLAS"
 * Lógica de Autenticación Firebase & CRUD de Testimonios
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

  // Testimonios iniciales reales para el botón de "Cargar Iniciales"
  const SEED_TESTIMONIALS = [
    {
      quote: "Tienes muy buena aplicación porque la vez pasada me fue súper bien y muy buena retención.",
      clientName: "Clienta Frecuente",
      service: "Extensiones de Pestañas",
      date: "Retención & Calidad",
      image: "assets/img/testimonials/IMG_6857.jpg",
      priority: 1,
      published: true
    },
    {
      quote: "A todo el mundo le han encantado, todos me preguntan por ellas y dónde me las hice.",
      clientName: "Laura M.",
      service: "Diseño de Mirada",
      date: "Clienta Studio",
      image: "assets/img/testimonials/IMG_6858.jpg",
      priority: 2,
      published: true
    },
    {
      quote: "Danna de verdad que haces maravillas con las manos, cambias las miradas, las vuelves hermosas.",
      clientName: "Valentina G.",
      service: "Lifting & Pestañas",
      date: "Experiencia Studio",
      image: "assets/img/testimonials/IMG_6860.jpg",
      priority: 3,
      published: true
    },
    {
      quote: "Pasaba por aquí para agradecerte, me encantaron mis cejas y pestañas.",
      clientName: "Camila R.",
      service: "Combo Mirada Perfecta",
      date: "Pestañas + Cejas",
      image: "assets/img/testimonials/IMG_6862.jpg",
      priority: 4,
      published: true
    },
    {
      quote: "Las amé... Trabajas muy hermoso.",
      clientName: "Mariana S.",
      service: "Volumen Exclusivo",
      date: "Resultado Real",
      image: "assets/img/testimonials/IMG_6863.jpg",
      priority: 5,
      published: true
    },
    {
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

  class AdminTestimonialsApp {
    constructor() {
      this.auth = null;
      this.db = null;
      this.currentUser = null;
      this.testimonials = [];
      this.currentCompressedBase64 = null;

      this.initFirebase();
      this.initElements();
      this.bindEvents();
    }

    initFirebase() {
      if (typeof firebase === 'undefined') {
        alert("Error cargando SDK de Firebase. Revisa tu conexión a internet.");
        return;
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Observador de estado de autenticación
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          this.showDashboard(user);
        } else {
          this.showLogin();
        }
      });
    }

    initElements() {
      // Vistas
      this.loginView = document.getElementById("adminLoginView");
      this.dashboardView = document.getElementById("adminDashboardView");

      // Login form
      this.loginForm = document.getElementById("loginForm");
      this.loginEmailInput = document.getElementById("loginEmail");
      this.loginPasswordInput = document.getElementById("loginPassword");
      this.loginAlertError = document.getElementById("loginAlertError");
      this.loginSubmitBtn = document.getElementById("loginSubmitBtn");

      // Dashboard
      this.currentUserEmail = document.getElementById("currentUserEmail");
      this.logoutBtn = document.getElementById("logoutBtn");
      this.seedDefaultsBtn = document.getElementById("seedDefaultsBtn");
      this.openNewModalBtn = document.getElementById("openNewTestimonialModalBtn");
      this.testimonialsGrid = document.getElementById("adminTestimonialsGrid");

      // Stats
      this.statTotal = document.getElementById("statTotalCount");
      this.statPublished = document.getElementById("statPublishedCount");
      this.statHidden = document.getElementById("statHiddenCount");

      // Modal & Form
      this.modal = document.getElementById("testimonialModal");
      this.modalTitle = document.getElementById("modalTitle");
      this.closeModalBtn = document.getElementById("closeModalBtn");
      this.cancelModalBtn = document.getElementById("cancelModalBtn");
      this.testimonialForm = document.getElementById("testimonialForm");

      // Form inputs
      this.formDocId = document.getElementById("testimonialDocId");
      this.dropzoneBox = document.getElementById("dropzoneBox");
      this.dropzoneText = document.getElementById("dropzoneText");
      this.fileInput = document.getElementById("screenshotFileInput");
      this.previewImg = document.getElementById("screenshotPreviewImg");
      this.formQuote = document.getElementById("formQuote");
      this.formClientName = document.getElementById("formClientName");
      this.formService = document.getElementById("formService");
      this.formDate = document.getElementById("formDate");
      this.formPriority = document.getElementById("formPriority");
      this.formPublished = document.getElementById("formPublished");
      this.saveBtn = document.getElementById("saveTestimonialBtn");
    }

    bindEvents() {
      // Login
      if (this.loginForm) {
        this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
      }

      // Logout
      if (this.logoutBtn) {
        this.logoutBtn.addEventListener("click", () => this.handleLogout());
      }

      // Modal Triggers
      if (this.openNewModalBtn) {
        this.openNewModalBtn.addEventListener("click", () => this.openModalForCreate());
      }
      if (this.closeModalBtn) {
        this.closeModalBtn.addEventListener("click", () => this.closeModal());
      }
      if (this.cancelModalBtn) {
        this.cancelModalBtn.addEventListener("click", () => this.closeModal());
      }
      if (this.modal) {
        this.modal.addEventListener("click", (e) => {
          if (e.target === this.modal) this.closeModal();
        });
      }

      // Save Form
      if (this.testimonialForm) {
        this.testimonialForm.addEventListener("submit", (e) => this.handleSaveTestimonial(e));
      }

      // Dropzone & File Upload
      if (this.dropzoneBox && this.fileInput) {
        this.dropzoneBox.addEventListener("click", () => this.fileInput.click());
        this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

        this.dropzoneBox.addEventListener("dragover", (e) => {
          e.preventDefault();
          this.dropzoneBox.classList.add("dragover");
        });
        this.dropzoneBox.addEventListener("dragleave", () => {
          this.dropzoneBox.classList.remove("dragover");
        });
        this.dropzoneBox.addEventListener("drop", (e) => {
          e.preventDefault();
          this.dropzoneBox.classList.remove("dragover");
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            this.processImageFile(e.dataTransfer.files[0]);
          }
        });
      }

      // Seed Defaults Button
      if (this.seedDefaultsBtn) {
        this.seedDefaultsBtn.addEventListener("click", () => this.handleSeedDefaults());
      }
    }

    // ================= AUTHENTICATION =================
    async handleLogin(e) {
      e.preventDefault();
      const email = this.loginEmailInput.value.trim();
      const password = this.loginPasswordInput.value;

      this.loginAlertError.style.display = "none";
      this.loginSubmitBtn.disabled = true;
      this.loginSubmitBtn.textContent = "Verificando credenciales...";

      try {
        await this.auth.signInWithEmailAndPassword(email, password);
      } catch (err) {
        console.error("Login error:", err);
        this.loginAlertError.textContent = this.getAuthErrorMessage(err.code);
        this.loginAlertError.style.display = "block";
      } finally {
        this.loginSubmitBtn.disabled = false;
        this.loginSubmitBtn.textContent = "Iniciar Sesión Segura";
      }
    }

    async handleLogout() {
      if (confirm("¿Deseas cerrar la sesión del panel de administración?")) {
        await this.auth.signOut();
      }
    }

    getAuthErrorMessage(code) {
      switch (code) {
        case "auth/invalid-email":
          return "El formato del correo electrónico no es válido.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          return "Credenciales incorrectas. Verifica el correo y la contraseña.";
        case "auth/too-many-requests":
          return "Demasiados intentos fallidos. Espera unos minutos.";
        default:
          return "Error de autenticación. Verifica tus datos.";
      }
    }

    showLogin() {
      this.loginView.style.display = "flex";
      this.dashboardView.style.display = "none";
      this.testimonials = [];
    }

    showDashboard(user) {
      this.loginView.style.display = "none";
      this.dashboardView.style.display = "flex";
      this.currentUserEmail.textContent = user.email || "Administradora";
      this.loadTestimonials();
    }

    // ================= FIRESTORE CRUD =================
    async loadTestimonials() {
      if (!this.db) return;
      this.testimonialsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-text-muted);">
          Cargando testimonios desde base de datos segura...
        </div>
      `;

      try {
        const snapshot = await this.db.collection("testimonials").get();
        const items = [];
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Ordenar por prioridad
        items.sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));
        this.testimonials = items;
        this.renderTestimonials();
        this.updateStats();
      } catch (err) {
        console.error("Error loading testimonials:", err);
        this.testimonialsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-danger);">
            Error al consultar Firestore. Si creaste la base de datos recién, verifica las reglas de seguridad.
          </div>
        `;
      }
    }

    updateStats() {
      const total = this.testimonials.length;
      const published = this.testimonials.filter(t => t.published !== false).length;
      const hidden = total - published;

      this.statTotal.textContent = total;
      this.statPublished.textContent = published;
      this.statHidden.textContent = hidden;
    }

    renderTestimonials() {
      if (this.testimonials.length === 0) {
        this.testimonialsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--admin-surface); border: 1px dashed var(--admin-border); border-radius: var(--admin-radius);">
            <p style="font-size: 16px; margin-bottom: 12px;">Aún no hay testimonios en la base de datos.</p>
            <p style="font-size: 13px; color: var(--admin-text-muted); margin-bottom: 24px;">
              Puedes presionar el botón <strong>"⚡ Cargar 7 Testimonios Iniciales"</strong> para cargar las conversaciones reales de una vez.
            </p>
          </div>
        `;
        return;
      }

      this.testimonialsGrid.innerHTML = this.testimonials.map((item) => {
        const isPub = item.published !== false;
        const imgSrc = item.image || item.imageUrl || "assets/img/page_img_1.jpeg";

        return `
          <div class="admin-testimonial-item ${!isPub ? 'is-hidden' : ''}" data-id="${item.id}">
            <div class="admin-item-header">
              <span class="admin-status-badge ${isPub ? 'published' : 'hidden'}">
                ${isPub ? '● Publicado' : '○ Oculto'}
              </span>
              <span class="admin-priority-badge">Prioridad: #${item.priority || 1}</span>
            </div>

            <p class="admin-item-quote">"${this.escapeHtml(item.quote)}"</p>

            <img src="${imgSrc}" class="admin-item-preview-img" alt="Screenshot" loading="lazy">

            <div class="admin-item-meta">
              <span><strong>${this.escapeHtml(item.clientName)}</strong></span>
              <span>${this.escapeHtml(item.service || 'Servicio')}</span>
            </div>

            <div class="admin-item-controls">
              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.openModalForEdit('${item.id}')">
                ✏️ Editar
              </button>

              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.togglePublishStatus('${item.id}')">
                ${isPub ? '👁️ Ocultar' : '✨ Publicar'}
              </button>

              <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteTestimonial('${item.id}')">
                🗑️
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    // ================= SEED INICIALES =================
    async handleSeedDefaults() {
      if (!confirm("¿Deseas cargar las 7 conversaciones reales iniciales en la base de datos de Firebase?")) {
        return;
      }

      this.seedDefaultsBtn.disabled = true;
      this.seedDefaultsBtn.textContent = "Cargando en Firebase...";

      try {
        const batch = this.db.batch();
        SEED_TESTIMONIALS.forEach((item) => {
          const newDocRef = this.db.collection("testimonials").doc();
          batch.set(newDocRef, {
            ...item,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });

        await batch.commit();
        alert("¡7 testimonios reales guardados exitosamente en Firestore!");
        await this.loadTestimonials();
      } catch (err) {
        console.error("Error seeding testimonials:", err);
        alert("Hubo un error al guardar en Firestore: " + err.message);
      } finally {
        this.seedDefaultsBtn.disabled = false;
        this.seedDefaultsBtn.textContent = "⚡ Cargar 7 Testimonios Iniciales";
      }
    }

    // ================= MODAL & FORM =================
    openModalForCreate() {
      this.formDocId.value = "";
      this.modalTitle.textContent = "Nuevo Testimonio Real";
      this.formQuote.value = "";
      this.formClientName.value = "";
      this.formService.value = "Extensiones de Pestañas";
      this.formDate.value = "Experiencia Real";
      this.formPriority.value = (this.testimonials.length + 1);
      this.formPublished.checked = true;
      this.currentCompressedBase64 = null;

      this.previewImg.style.display = "none";
      this.previewImg.src = "";
      this.dropzoneText.style.display = "block";

      this.modal.classList.add("active");
    }

    openModalForEdit(docId) {
      const item = this.testimonials.find(t => t.id === docId);
      if (!item) return;

      this.formDocId.value = docId;
      this.modalTitle.textContent = "Editar Testimonio";
      this.formQuote.value = item.quote || "";
      this.formClientName.value = item.clientName || "";
      this.formService.value = item.service || "Extensiones de Pestañas";
      this.formDate.value = item.date || "";
      this.formPriority.value = item.priority || 1;
      this.formPublished.checked = item.published !== false;
      this.currentCompressedBase64 = item.image || item.imageUrl || null;

      if (this.currentCompressedBase64) {
        this.previewImg.src = this.currentCompressedBase64;
        this.previewImg.style.display = "block";
        this.dropzoneText.style.display = "none";
      } else {
        this.previewImg.style.display = "none";
        this.dropzoneText.style.display = "block";
      }

      this.modal.classList.add("active");
    }

    closeModal() {
      this.modal.classList.remove("active");
    }

    handleFileSelect(e) {
      if (e.target.files && e.target.files[0]) {
        this.processImageFile(e.target.files[0]);
      }
    }

    processImageFile(file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Comprimir mediante canvas para mantener payload ligero (~70-90KB)
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1100;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Calidad JPEG 82%
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          this.currentCompressedBase64 = compressedDataUrl;

          this.previewImg.src = compressedDataUrl;
          this.previewImg.style.display = "block";
          this.dropzoneText.style.display = "none";
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    async handleSaveTestimonial(e) {
      e.preventDefault();

      const docId = this.formDocId.value;
      const quote = this.formQuote.value.trim();
      const clientName = this.formClientName.value.trim();
      const service = this.formService.value;
      const date = this.formDate.value.trim();
      const priority = parseInt(this.formPriority.value, 10) || 1;
      const published = this.formPublished.checked;
      const image = this.currentCompressedBase64 || "assets/img/page_img_1.jpeg";

      if (!quote || !clientName) {
        alert("Por favor completa la frase destacada y el nombre de la clienta.");
        return;
      }

      this.saveBtn.disabled = true;
      this.saveBtn.textContent = "Guardando en Firestore...";

      try {
        const payload = {
          quote,
          clientName,
          service,
          date,
          priority,
          published,
          image,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (docId) {
          // Update
          await this.db.collection("testimonials").doc(docId).update(payload);
        } else {
          // Create
          payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          await this.db.collection("testimonials").add(payload);
        }

        this.closeModal();
        await this.loadTestimonials();
      } catch (err) {
        console.error("Error saving testimonial:", err);
        alert("Error al guardar: " + err.message);
      } finally {
        this.saveBtn.disabled = false;
        this.saveBtn.textContent = "Guardar Testimonio";
      }
    }

    async togglePublishStatus(docId) {
      const item = this.testimonials.find(t => t.id === docId);
      if (!item) return;

      const newStatus = !(item.published !== false);
      try {
        await this.db.collection("testimonials").doc(docId).update({
          published: newStatus,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await this.loadTestimonials();
      } catch (err) {
        console.error("Error toggling publish status:", err);
        alert("Error al actualizar estado: " + err.message);
      }
    }

    async deleteTestimonial(docId) {
      if (!confirm("¿Estás segura de eliminar este testimonio permanentemente?")) {
        return;
      }

      try {
        await this.db.collection("testimonials").doc(docId).delete();
        await this.loadTestimonials();
      } catch (err) {
        console.error("Error deleting testimonial:", err);
        alert("Error al eliminar: " + err.message);
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }
  }

  // Inicializar globalmente
  document.addEventListener("DOMContentLoaded", () => {
    window.adminApp = new AdminTestimonialsApp();
  });
})();
