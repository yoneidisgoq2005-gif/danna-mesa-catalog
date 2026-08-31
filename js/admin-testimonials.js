/**
 * ==========================================================================
 * DANNA MESA STUDIO — CENTRO DE CONTROL TOTAL EN LA NUBE (ADMIN HUB V14)
 * Gestión Unificada: Testimonios, Fotos, Servicios, Galería Multi-Clienta, Revista Editorial & Firestore
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

  // Testimonios iniciales reales para botón semilla
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

  class AdminHubApp {
    constructor() {
      this.auth = null;
      this.db = null;
      this.currentUser = null;
      this.state = window.catalogState;
      this.activeTab = "testimonials";
      this.photoCategoryFilter = "all";
      this.testimonials = [];
      this.currentTestimonialBase64 = null;
      this.currentServiceBase64 = null;
      this.currentEditingServiceGallery = [];
      this.targetPhotoChangeItem = null;

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

      // Login
      this.loginForm = document.getElementById("loginForm");
      this.loginEmailInput = document.getElementById("loginEmail");
      this.loginPasswordInput = document.getElementById("loginPassword");
      this.loginAlertError = document.getElementById("loginAlertError");
      this.loginSubmitBtn = document.getElementById("loginSubmitBtn");

      // Navbar
      this.currentUserEmail = document.getElementById("currentUserEmail");
      this.logoutBtn = document.getElementById("logoutBtn");

      // Tabs Navigation
      this.tabButtons = document.querySelectorAll(".admin-tab-btn");
      this.tabContents = document.querySelectorAll(".admin-tab-content");

      // Testimonios Elements
      this.seedDefaultsBtn = document.getElementById("seedDefaultsBtn");
      this.openNewTestimonialModalBtn = document.getElementById("openNewTestimonialModalBtn");
      this.testimonialsGrid = document.getElementById("adminTestimonialsGrid");
      this.statTotal = document.getElementById("statTotalCount");
      this.statPublished = document.getElementById("statPublishedCount");
      this.statHidden = document.getElementById("statHiddenCount");

      // Modal Testimonio
      this.testimonialModal = document.getElementById("testimonialModal");
      this.closeModalBtn = document.getElementById("closeModalBtn");
      this.cancelModalBtn = document.getElementById("cancelModalBtn");
      this.testimonialForm = document.getElementById("testimonialForm");
      this.testimonialDocId = document.getElementById("testimonialDocId");
      this.dropzoneBox = document.getElementById("dropzoneBox");
      this.dropzoneText = document.getElementById("dropzoneText");
      this.screenshotFileInput = document.getElementById("screenshotFileInput");
      this.screenshotPreviewImg = document.getElementById("screenshotPreviewImg");
      this.formQuote = document.getElementById("formQuote");
      this.formClientName = document.getElementById("formClientName");
      this.formService = document.getElementById("formService");
      this.formDate = document.getElementById("formDate");
      this.formPriority = document.getElementById("formPriority");
      this.formPublished = document.getElementById("formPublished");
      this.saveTestimonialBtn = document.getElementById("saveTestimonialBtn");

      // Master Photo Manager Elements
      this.adminMasterPhotosGrid = document.getElementById("adminMasterPhotosGrid");
      this.masterPhotoFileInput = document.getElementById("masterPhotoFileInput");
      this.photoFilterBtns = document.querySelectorAll("#photoCategoryFilters .admin-chip-btn");
      this.btnSaveAllPhotosPositions = document.getElementById("btnSaveAllPhotosPositions");

      // Services Elements
      this.adminServicesListGrid = document.getElementById("adminServicesListGrid");
      this.openNewServiceModalBtn = document.getElementById("openNewServiceModalBtn");
      this.serviceModal = document.getElementById("serviceModal");
      this.serviceModalTitle = document.getElementById("serviceModalTitle");
      this.closeServiceModalBtn = document.getElementById("closeServiceModalBtn");
      this.cancelServiceModalBtn = document.getElementById("cancelServiceModalBtn");
      this.serviceForm = document.getElementById("serviceForm");
      this.serviceFormId = document.getElementById("serviceFormId");
      this.serviceDropzoneBox = document.getElementById("serviceDropzoneBox");
      this.serviceDropzoneText = document.getElementById("serviceDropzoneText");
      this.serviceFileInput = document.getElementById("serviceFileInput");
      this.servicePreviewImg = document.getElementById("servicePreviewImg");
      this.srvSliderX = document.getElementById("srvSliderX");
      this.srvSliderY = document.getElementById("srvSliderY");
      this.srvPosXVal = document.getElementById("srvPosXVal");
      this.srvPosYVal = document.getElementById("srvPosYVal");
      this.srvName = document.getElementById("srvName");
      this.srvCategory = document.getElementById("srvCategory");
      this.srvType = document.getElementById("srvType");
      this.srvPrice = document.getElementById("srvPrice");
      this.srvCustomPriceLabel = document.getElementById("srvCustomPriceLabel");
      this.srvDuration = document.getElementById("srvDuration");
      this.srvAppointmentTime = document.getElementById("srvAppointmentTime");
      this.srvRetouch15_21 = document.getElementById("srvRetouch15_21");
      this.srvRetouch18_21 = document.getElementById("srvRetouch18_21");
      this.srvBadge = document.getElementById("srvBadge");
      this.srvDesc = document.getElementById("srvDesc");
      this.srvTags = document.getElementById("srvTags");
      this.saveServiceBtn = document.getElementById("saveServiceBtn");

      // Multi-Photo Evidence Gallery Elements in Service Modal
      this.serviceGalleryListContainer = document.getElementById("serviceGalleryListContainer");
      this.btnAddGalleryItemBtn = document.getElementById("btnAddGalleryItemBtn");
      this.addGalleryFileInput = document.getElementById("addGalleryFileInput");

      // Forms
      this.heroBannerForm = document.getElementById("heroBannerForm");
      this.policiesForm = document.getElementById("policiesForm");
      this.studioForm = document.getElementById("studioForm");
      this.lookbookConfigForm = document.getElementById("lookbookConfigForm");
      this.btnReloadLookbookPreview = document.getElementById("btnReloadLookbookPreview");

      // Lookbook Iframe
      this.adminLookbookIframe = document.getElementById("adminLookbookIframe");

      // Cloud Sync & Backups
      this.btnPushAllToCloud = document.getElementById("btnPushAllToCloud");
      this.btnResetAllToDefaults = document.getElementById("btnResetAllToDefaults");
      this.btnDownloadBackupJson = document.getElementById("btnDownloadBackupJson");
      this.btnTriggerRestoreJson = document.getElementById("btnTriggerRestoreJson");
      this.restoreJsonFileInput = document.getElementById("restoreJsonFileInput");
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

      // Tab Navigation
      this.tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const tabKey = btn.getAttribute("data-tab");
          this.switchTab(tabKey);
        });
      });

      // Photo Category Filters
      this.photoFilterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.photoFilterBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.photoCategoryFilter = btn.getAttribute("data-cat");
          this.renderMasterPhotos();
        });
      });

      // Master Photo Upload Trigger
      if (this.masterPhotoFileInput) {
        this.masterPhotoFileInput.addEventListener("change", (e) => this.handleMasterPhotoFileSelected(e));
      }

      // Botón Guardar Todos los Encuadres
      if (this.btnSaveAllPhotosPositions) {
        this.btnSaveAllPhotosPositions.addEventListener("click", () => this.handleSaveAllPhotosPositions());
      }

      // Testimonios Events
      if (this.openNewTestimonialModalBtn) {
        this.openNewTestimonialModalBtn.addEventListener("click", () => this.openTestimonialModalForCreate());
      }
      if (this.closeModalBtn) {
        this.closeModalBtn.addEventListener("click", () => this.closeTestimonialModal());
      }
      if (this.cancelModalBtn) {
        this.cancelModalBtn.addEventListener("click", () => this.closeTestimonialModal());
      }
      if (this.testimonialForm) {
        this.testimonialForm.addEventListener("submit", (e) => this.handleSaveTestimonial(e));
      }
      if (this.seedDefaultsBtn) {
        this.seedDefaultsBtn.addEventListener("click", () => this.handleSeedDefaults());
      }

      // Testimonial Dropzone
      if (this.dropzoneBox && this.screenshotFileInput) {
        this.dropzoneBox.addEventListener("click", () => this.screenshotFileInput.click());
        this.screenshotFileInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files[0]) {
            this.compressImage(e.target.files[0], 800, 0.60, (base64) => {
              this.currentTestimonialBase64 = base64;
              this.screenshotPreviewImg.src = base64;
              this.screenshotPreviewImg.style.display = "block";
              this.dropzoneText.style.display = "none";
            });
          }
        });
      }

      // Services Events
      if (this.openNewServiceModalBtn) {
        this.openNewServiceModalBtn.addEventListener("click", () => this.openServiceModalForCreate());
      }
      if (this.closeServiceModalBtn) {
        this.closeServiceModalBtn.addEventListener("click", () => this.closeServiceModal());
      }
      if (this.cancelServiceModalBtn) {
        this.cancelServiceModalBtn.addEventListener("click", () => this.closeServiceModal());
      }
      if (this.serviceForm) {
        this.serviceForm.addEventListener("submit", (e) => this.handleSaveService(e));
      }

      // Multi-Photo Evidence Gallery Add Trigger
      if (this.btnAddGalleryItemBtn && this.addGalleryFileInput) {
        this.btnAddGalleryItemBtn.addEventListener("click", () => this.addGalleryFileInput.click());
        this.addGalleryFileInput.addEventListener("change", (e) => this.handleAddGalleryFileSelected(e));
      }

      // Service Dropzone
      if (this.serviceDropzoneBox && this.serviceFileInput) {
        this.serviceDropzoneBox.addEventListener("click", () => this.serviceFileInput.click());
        this.serviceFileInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files[0]) {
            this.compressImage(e.target.files[0], 800, 0.60, (base64) => {
              this.currentServiceBase64 = base64;
              this.servicePreviewImg.src = base64;
              this.servicePreviewImg.style.display = "block";
              this.serviceDropzoneText.style.display = "none";
            });
          }
        });
      }

      // Service Sliders X/Y
      if (this.srvSliderX) {
        this.srvSliderX.addEventListener("input", (e) => {
          this.srvPosXVal.textContent = e.target.value + "%";
          if (this.servicePreviewImg) {
            this.servicePreviewImg.style.objectPosition = `${this.srvSliderX.value}% ${this.srvSliderY.value}%`;
          }
        });
      }
      if (this.srvSliderY) {
        this.srvSliderY.addEventListener("input", (e) => {
          this.srvPosYVal.textContent = e.target.value + "%";
          if (this.servicePreviewImg) {
            this.servicePreviewImg.style.objectPosition = `${this.srvSliderX.value}% ${this.srvSliderY.value}%`;
          }
        });
      }

      // Form Submits
      if (this.heroBannerForm) {
        this.heroBannerForm.addEventListener("submit", (e) => this.handleSaveHeroBanner(e));
      }
      if (this.policiesForm) {
        this.policiesForm.addEventListener("submit", (e) => this.handleSavePolicies(e));
      }
      if (this.studioForm) {
        this.studioForm.addEventListener("submit", (e) => this.handleSaveStudio(e));
      }
      if (this.lookbookConfigForm) {
        this.lookbookConfigForm.addEventListener("submit", (e) => this.handleSaveLookbookConfig(e));
      }
      if (this.btnReloadLookbookPreview) {
        this.btnReloadLookbookPreview.addEventListener("click", () => this.reloadLookbookIframe());
      }

      // Cloud Sync & Backups Buttons
      if (this.btnPushAllToCloud) {
        this.btnPushAllToCloud.addEventListener("click", () => this.handlePushAllToCloud());
      }
      if (this.btnResetAllToDefaults) {
        this.btnResetAllToDefaults.addEventListener("click", () => this.handleResetAllDefaults());
      }
      if (this.btnDownloadBackupJson) {
        this.btnDownloadBackupJson.addEventListener("click", () => this.handleDownloadBackupJson());
      }
      if (this.btnTriggerRestoreJson && this.restoreJsonFileInput) {
        this.btnTriggerRestoreJson.addEventListener("click", () => this.restoreJsonFileInput.click());
        this.restoreJsonFileInput.addEventListener("change", (e) => this.handleRestoreJsonFileSelected(e));
      }

      // Listener para cambios en datos del catálogo
      window.addEventListener("catalogDataChanged", () => {
        this.populateFormsFromState();
        if (this.activeTab === "all_photos") this.renderMasterPhotos();
        if (this.activeTab === "services") this.renderServicesList();
        if (this.activeTab === "lookbook_preview") {
          this.reloadLookbookIframe();
        }
      });
    }

    // ================= AUTHENTICATION =================
    async handleLogin(e) {
      e.preventDefault();
      const email = this.loginEmailInput.value.trim().toLowerCase();
      const password = this.loginPasswordInput.value;

      this.loginAlertError.style.display = "none";
      this.loginSubmitBtn.disabled = true;
      this.loginSubmitBtn.textContent = "Verificando credenciales...";

      try {
        await this.auth.signInWithEmailAndPassword(email, password);
      } catch (err) {
        console.error("Login error:", err);
        let msg = this.getAuthErrorMessage(err.code, err.message);
        this.loginAlertError.textContent = msg;
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

    getAuthErrorMessage(code, fullMessage) {
      switch (code) {
        case "auth/invalid-email":
          return "El formato del correo electrónico no es válido.";
        case "auth/user-not-found":
          return "No existe un usuario con este correo en Firebase.";
        case "auth/wrong-password":
        case "auth/invalid-credential":
          return "Contraseña incorrecta o usuario no registrado en Firebase.";
        case "auth/unauthorized-domain":
          return "Dominio no autorizado en Firebase Console.";
        case "auth/too-many-requests":
          return "Demasiados intentos fallidos. Espera unos minutos.";
        default:
          return fullMessage || "Error de autenticación. Verifica tus datos.";
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
      this.populateFormsFromState();
      this.renderMasterPhotos();
      this.renderServicesList();
    }

    // ================= TABS =================
    switchTab(tabKey) {
      this.activeTab = tabKey;
      this.tabButtons.forEach(b => b.classList.remove("active"));
      this.tabContents.forEach(c => c.classList.remove("active"));

      const targetBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabKey}"]`);
      if (targetBtn) targetBtn.classList.add("active");

      const targetContent = document.getElementById(`tabContent${tabKey.charAt(0).toUpperCase() + tabKey.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`);
      if (targetContent) targetContent.classList.add("active");

      if (tabKey === "testimonials") this.loadTestimonials();
      if (tabKey === "all_photos") this.renderMasterPhotos();
      if (tabKey === "services") this.renderServicesList();
      if (tabKey === "lookbook_preview") {
        this.reloadLookbookIframe();
      }
    }

    reloadLookbookIframe() {
      if (!this.adminLookbookIframe) return;
      try {
        this.adminLookbookIframe.src = "index.html#lookbook?t=" + Date.now();
      } catch (e) {}
    }

    // ================= 1. TESTIMONIOS =================
    async loadTestimonials() {
      if (!this.db) return;

      try {
        const snapshot = await this.db.collection("testimonials").get();
        const items = [];
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          });
        });

        items.sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99));
        this.testimonials = items;
        this.renderTestimonials();
        this.updateStats();
      } catch (err) {
        console.error("Error loading testimonials:", err);
        if (this.testimonialsGrid) {
          this.testimonialsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-danger);">
              ${err.message || 'Error al conectar con Firestore.'}
            </div>
          `;
        }
      }
    }

    updateStats() {
      if (!this.statTotal) return;
      const total = this.testimonials.length;
      const published = this.testimonials.filter(t => t.published !== false).length;
      const hidden = total - published;

      this.statTotal.textContent = total;
      this.statPublished.textContent = published;
      this.statHidden.textContent = hidden;
    }

    renderTestimonials() {
      if (!this.testimonialsGrid) return;
      if (this.testimonials.length === 0) {
        this.testimonialsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--admin-surface); border: 1px dashed var(--admin-border); border-radius: var(--admin-radius);">
            <p style="font-size: 16px; margin-bottom: 12px;">Aún no hay testimonios en Firestore.</p>
            <p style="font-size: 13px; color: var(--admin-text-muted); margin-bottom: 24px;">
              Haz clic en <strong>"⚡ Cargar 7 Testimonios Iniciales"</strong> para cargar las conversaciones reales de una vez.
            </p>
          </div>
        `;
        return;
      }

      this.testimonialsGrid.innerHTML = this.testimonials.map((item) => {
        const isPub = item.published !== false;
        const imgSrc = item.image || item.imageUrl || "assets/img/page_img_1.jpeg";

        return `
          <div class="admin-testimonial-item ${!isPub ? 'is-hidden' : ''}">
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
              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.openTestimonialModalForEdit('${item.id}')">
                ✏️ Editar
              </button>
              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.toggleTestimonialPublish('${item.id}')">
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

    async handleSeedDefaults() {
      if (!confirm("¿Deseas cargar las 7 conversaciones reales iniciales en la base de datos de Firebase?")) return;

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
        this.showToast("¡7 testimonios reales guardados exitosamente en Firestore!", "success");
        await this.loadTestimonials();
      } catch (err) {
        console.error("Error seeding:", err);
        alert("Error: " + err.message);
      } finally {
        this.seedDefaultsBtn.disabled = false;
        this.seedDefaultsBtn.textContent = "⚡ Cargar 7 Testimonios Iniciales";
      }
    }

    openTestimonialModalForCreate() {
      this.testimonialDocId.value = "";
      document.getElementById("modalTitle").textContent = "Nuevo Testimonio Real";
      this.formQuote.value = "";
      this.formClientName.value = "";
      this.formService.value = "Extensiones de Pestañas";
      this.formDate.value = "Experiencia Real";
      this.formPriority.value = (this.testimonials.length + 1);
      this.formPublished.checked = true;
      this.currentTestimonialBase64 = null;

      this.screenshotPreviewImg.style.display = "none";
      this.dropzoneText.style.display = "block";
      this.testimonialModal.classList.add("active");
    }

    openTestimonialModalForEdit(docId) {
      const item = this.testimonials.find(t => t.id === docId);
      if (!item) return;

      this.testimonialDocId.value = docId;
      document.getElementById("modalTitle").textContent = "Editar Testimonio";
      this.formQuote.value = item.quote || "";
      this.formClientName.value = item.clientName || "";
      this.formService.value = item.service || "Extensiones de Pestañas";
      this.formDate.value = item.date || "";
      this.formPriority.value = item.priority || 1;
      this.formPublished.checked = item.published !== false;
      this.currentTestimonialBase64 = item.image || item.imageUrl || null;

      if (this.currentTestimonialBase64) {
        this.screenshotPreviewImg.src = this.currentTestimonialBase64;
        this.screenshotPreviewImg.style.display = "block";
        this.dropzoneText.style.display = "none";
      } else {
        this.screenshotPreviewImg.style.display = "none";
        this.dropzoneText.style.display = "block";
      }

      this.testimonialModal.classList.add("active");
    }

    closeTestimonialModal() {
      this.testimonialModal.classList.remove("active");
    }

    async handleSaveTestimonial(e) {
      e.preventDefault();
      const docId = this.testimonialDocId.value;
      const quote = this.formQuote.value.trim();
      const clientName = this.formClientName.value.trim();
      const service = this.formService.value;
      const date = this.formDate.value.trim();
      const priority = parseInt(this.formPriority.value, 10) || 1;
      const published = this.formPublished.checked;
      const image = this.currentTestimonialBase64 || "assets/img/page_img_1.jpeg";

      this.saveTestimonialBtn.disabled = true;
      this.saveTestimonialBtn.textContent = "Guardando...";

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
          await this.db.collection("testimonials").doc(docId).update(payload);
        } else {
          payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          await this.db.collection("testimonials").add(payload);
        }

        this.closeTestimonialModal();
        this.showToast("✓ Testimonio guardado exitosamente en Firestore", "success");
        await this.loadTestimonials();
      } catch (err) {
        alert("Error al guardar: " + err.message);
      } finally {
        this.saveTestimonialBtn.disabled = false;
        this.saveTestimonialBtn.textContent = "Guardar Testimonio";
      }
    }

    async toggleTestimonialPublish(docId) {
      const item = this.testimonials.find(t => t.id === docId);
      if (!item) return;

      try {
        await this.db.collection("testimonials").doc(docId).update({
          published: !(item.published !== false),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await this.loadTestimonials();
      } catch (err) {
        alert("Error: " + err.message);
      }
    }

    async deleteTestimonial(docId) {
      if (!confirm("¿Eliminar este testimonio permanentemente?")) return;

      try {
        await this.db.collection("testimonials").doc(docId).delete();
        await this.loadTestimonials();
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }

    // ================= 2. GESTOR MAESTRO DE FOTOS =================
    renderMasterPhotos() {
      if (!this.adminMasterPhotosGrid) return;
      const allPhotos = this.state.getAllSitePhotos();

      const filtered = allPhotos.filter((p) => {
        if (this.photoCategoryFilter === "all") return true;
        return p.category === this.photoCategoryFilter;
      });

      this.adminMasterPhotosGrid.innerHTML = filtered.map((photo) => {
        const parts = (photo.position || "50% 30%").replace(/center/g, "50%").split(" ");
        const posX = parseInt(parts[0], 10) || 50;
        const posY = parseInt(parts[1], 10) || 30;

        return `
          <div class="admin-photo-card" data-photoid="${photo.id}">
            <div class="admin-photo-preview-box">
              <img 
                id="img_preview_${photo.id}" 
                src="${photo.currentImg}" 
                class="admin-photo-img" 
                style="object-position: ${photo.position};"
                alt="${this.escapeHtml(photo.title)}"
              >
              <span class="admin-photo-tag">${this.escapeHtml(photo.sectionLabel)}</span>
            </div>

            <div class="admin-photo-title" title="${this.escapeHtml(photo.title)}">
              ${this.escapeHtml(photo.title)}
            </div>

            <div class="admin-photo-sliders">
              <div class="admin-slider-row">
                <span class="admin-slider-label">Horizontal (X): <strong id="lbl_x_${photo.id}">${posX}%</strong></span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value="${posX}" 
                  class="admin-range-slider"
                  oninput="window.adminApp.handlePhotoSliderChange('${photo.id}', 'x', this.value)"
                  onchange="window.adminApp.savePhotoPositionToCloud('${photo.id}')"
                >
              </div>

              <div class="admin-slider-row">
                <span class="admin-slider-label">Vertical (Y): <strong id="lbl_y_${photo.id}">${posY}%</strong></span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value="${posY}" 
                  class="admin-range-slider"
                  oninput="window.adminApp.handlePhotoSliderChange('${photo.id}', 'y', this.value)"
                  onchange="window.adminApp.savePhotoPositionToCloud('${photo.id}')"
                >
              </div>
            </div>

            <button 
              class="admin-btn admin-btn-secondary admin-btn-sm" 
              style="width: 100%;"
              onclick="window.adminApp.triggerPhotoChange('${photo.id}')"
            >
              🔄 Cambiar Foto
            </button>
          </div>
        `;
      }).join("");
    }

    handlePhotoSliderChange(photoId, axis, val) {
      const img = document.getElementById(`img_preview_${photoId}`);
      const lbl = document.getElementById(`lbl_${axis}_${photoId}`);
      if (lbl) lbl.textContent = `${val}%`;

      const allPhotos = this.state.getAllSitePhotos();
      const photo = allPhotos.find(p => p.id === photoId);
      if (!photo || !img) return;

      const currentPos = (img.style.objectPosition || "50% 30%").split(" ");
      let x = currentPos[0] || "50%";
      let y = currentPos[1] || "30%";

      if (axis === "x") x = `${val}%`;
      if (axis === "y") y = `${val}%`;

      const newPos = `${x} ${y}`;
      img.style.objectPosition = newPos;

      // Actualizar en el state en memoria
      if (photo.type === "hero") {
        this.state.data.hero.imagePosition = newPos;
      } else if (photo.type === "comboBanner") {
        this.state.data.comboBanner.imagePosition = newPos;
      } else if (photo.type === "service") {
        const srv = this.state.getServiceById(photo.serviceId);
        if (srv) srv.imagePosition = newPos;
      } else if (photo.type === "service_gallery") {
        const srv = this.state.getServiceById(photo.serviceId);
        if (srv && Array.isArray(srv.gallery) && srv.gallery[photo.galleryIndex]) {
          srv.gallery[photo.galleryIndex].position = newPos;
        }
      }
    }

    async savePhotoPositionToCloud(photoId) {
      try {
        await this.state.saveToCloud(this.state.data);
        this.showToast("✓ Encuadre guardado en Firestore en tiempo real", "success");
      } catch (err) {
        console.error("Error saving position to cloud:", err);
        this.showToast("Error guardando encuadre: " + err.message, "error");
      }
    }

    async handleSaveAllPhotosPositions() {
      const btn = document.getElementById("btnSaveAllPhotosPositions");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Guardando en Firestore...";
      }

      try {
        await this.state.saveToCloud(this.state.data);
        this.showToast("✨ ¡Todos los encuadres de fotos fueron guardados en Firestore!", "success");
      } catch (err) {
        alert("Error al guardar: " + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "💾 Guardar Encuadres en la Nube";
        }
      }
    }

    triggerPhotoChange(photoId) {
      const allPhotos = this.state.getAllSitePhotos();
      const photo = allPhotos.find(p => p.id === photoId);
      if (!photo) return;

      this.targetPhotoChangeItem = photo;
      this.masterPhotoFileInput.value = "";
      this.masterPhotoFileInput.click();
    }

    async handleMasterPhotoFileSelected(e) {
      if (!e.target.files || !e.target.files[0] || !this.targetPhotoChangeItem) return;

      const file = e.target.files[0];
      const photo = this.targetPhotoChangeItem;

      this.compressImage(file, 800, 0.60, async (compressedBase64) => {
        if (photo.type === "hero") {
          this.state.data.hero.image = compressedBase64;
        } else if (photo.type === "comboBanner") {
          this.state.data.comboBanner.image = compressedBase64;
        } else if (photo.type === "service") {
          const srv = this.state.getServiceById(photo.serviceId);
          if (srv) srv.image = compressedBase64;
        } else if (photo.type === "service_gallery") {
          const srv = this.state.getServiceById(photo.serviceId);
          if (srv && Array.isArray(srv.gallery) && srv.gallery[photo.galleryIndex]) {
            srv.gallery[photo.galleryIndex].src = compressedBase64;
          }
        }

        try {
          await this.state.saveToCloud(this.state.data);
          this.renderMasterPhotos();
          this.showToast(`¡Foto de "${photo.title}" actualizada y guardada en Firestore!`, "success");
        } catch (err) {
          alert("Error guardando en la nube: " + err.message);
        }
      });
    }

    // ================= 3. SERVICIOS & NUEVOS EFECTOS =================
    renderServicesList() {
      if (!this.adminServicesListGrid) return;
      const services = this.state.data.services || [];

      this.adminServicesListGrid.innerHTML = services.map((srv) => {
        const galleryCount = (srv.gallery && Array.isArray(srv.gallery)) ? srv.gallery.length : 0;
        return `
          <div class="admin-service-card" data-srvid="${srv.id}">
            <div class="admin-service-header">
              <div>
                <h4 class="admin-service-title">${this.escapeHtml(srv.name)}</h4>
                <span style="font-size: 11px; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">
                  ${this.escapeHtml(srv.subtitle || srv.type || srv.categoryId)}
                </span>
              </div>
              <span class="admin-service-price-pill">${srv.price ? this.state.formatMoney(srv.price) : (srv.customPriceLabel || 'Tarifa Especial')}</span>
            </div>

            <div style="position: relative;">
              <img 
                src="${srv.image || 'assets/img/page_img_1.jpeg'}" 
                style="width: 100%; height: 130px; object-fit: cover; object-position: ${srv.imagePosition || 'center 30%'}; border-radius: 6px; border: 1px solid var(--admin-border);"
                alt="${this.escapeHtml(srv.name)}"
              >
              ${galleryCount > 0 ? `
                <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
                  📸 +${galleryCount} Fotos de Clientas
                </span>
              ` : ''}
            </div>

            <p style="font-size: 12.5px; color: var(--admin-text-muted); line-height: 1.4; margin: 0;">
              ${this.escapeHtml(srv.desc || '')}
            </p>

            <div style="display: flex; gap: 8px; margin-top: auto;">
              <button class="admin-btn admin-btn-secondary admin-btn-sm" style="flex: 1;" onclick="window.adminApp.openServiceModalForEdit('${srv.id}')">
                ✏️ Editar Look & Clientas
              </button>
              <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteService('${srv.id}')">
                🗑️
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    openServiceModalForCreate() {
      this.serviceFormId.value = "";
      this.serviceModalTitle.textContent = "Nuevo Efecto / Servicio";
      this.srvName.value = "";
      this.srvCategory.value = "extensiones";
      this.srvType.value = "Diseño Exclusivo";
      this.srvPrice.value = "";
      if (this.srvCustomPriceLabel) this.srvCustomPriceLabel.value = "";
      this.srvDuration.value = "3 a 5 semanas";
      this.srvAppointmentTime.value = "90 - 120 min";
      this.srvRetouch15_21.value = "";
      this.srvRetouch18_21.value = "";
      this.srvBadge.value = "✨ Tendencia 2026";
      this.srvDesc.value = "";
      this.srvTags.value = "Efecto Especial, Exclusivo Danna Mesa";
      this.srvSliderX.value = 50;
      this.srvSliderY.value = 30;
      this.srvPosXVal.textContent = "50%";
      this.srvPosYVal.textContent = "30%";
      this.currentServiceBase64 = null;
      this.currentEditingServiceGallery = [];

      this.servicePreviewImg.style.display = "none";
      this.serviceDropzoneText.style.display = "block";
      this.renderServiceModalGallery();
      this.serviceModal.classList.add("active");
    }

    openServiceModalForEdit(serviceId) {
      const srv = this.state.getServiceById(serviceId);
      if (!srv) return;

      this.serviceFormId.value = serviceId;
      this.serviceModalTitle.textContent = `Editar: ${srv.name}`;
      this.srvName.value = srv.name || "";
      this.srvCategory.value = srv.categoryId || "extensiones";
      this.srvType.value = srv.subtitle || srv.type || "";
      this.srvPrice.value = (srv.price !== null && srv.price !== undefined && !isNaN(Number(srv.price))) ? srv.price : "";
      if (this.srvCustomPriceLabel) {
        this.srvCustomPriceLabel.value = srv.customPriceLabel || (srv.price ? "" : "Según pestañas elegidas");
      }
      this.srvDuration.value = srv.duration || "";
      this.srvAppointmentTime.value = srv.appointmentTime || "";
      this.srvRetouch15_21.value = srv.retouch15_21 || "";
      this.srvRetouch18_21.value = srv.retouch18_21 || "";
      this.srvBadge.value = srv.badge || "";
      this.srvDesc.value = srv.desc || "";
      this.srvTags.value = Array.isArray(srv.tags) ? srv.tags.join(", ") : (srv.tags || "");

      const parts = (srv.imagePosition || "50% 30%").replace(/center/g, "50%").split(" ");
      const posX = parseInt(parts[0], 10) || 50;
      const posY = parseInt(parts[1], 10) || 30;

      this.srvSliderX.value = posX;
      this.srvSliderY.value = posY;
      this.srvPosXVal.textContent = posX + "%";
      this.srvPosYVal.textContent = posY + "%";

      this.currentServiceBase64 = srv.image || null;
      if (this.currentServiceBase64) {
        this.servicePreviewImg.src = this.currentServiceBase64;
        this.servicePreviewImg.style.objectPosition = `${posX}% ${posY}%`;
        this.servicePreviewImg.style.display = "block";
        this.serviceDropzoneText.style.display = "none";
      } else {
        this.servicePreviewImg.style.display = "none";
        this.serviceDropzoneText.style.display = "block";
      }

      // Cargar galería de evidencias de clientas
      this.currentEditingServiceGallery = (srv.gallery && Array.isArray(srv.gallery)) 
        ? JSON.parse(JSON.stringify(srv.gallery)) 
        : [];
      this.renderServiceModalGallery();

      this.serviceModal.classList.add("active");
    }

    closeServiceModal() {
      this.serviceModal.classList.remove("active");
    }

    // Manejo de Fotos Adicionales de Clientas (Galería)
    handleAddGalleryFileSelected(e) {
      if (!e.target.files || !e.target.files[0]) return;
      const file = e.target.files[0];

      this.compressImage(file, 800, 0.60, (compressedBase64) => {
        const itemNumber = this.currentEditingServiceGallery.length + 1;
        const newItem = {
          id: "g_" + Date.now(),
          src: compressedBase64,
          title: `Clienta 0${itemNumber}`,
          subtitle: "Resultado Real",
          desc: "Evidencia de aplicación en pestaña natural.",
          position: "center 30%"
        };

        this.currentEditingServiceGallery.push(newItem);
        this.renderServiceModalGallery();
        this.addGalleryFileInput.value = "";
      });
    }

    renderServiceModalGallery() {
      if (!this.serviceGalleryListContainer) return;

      if (!this.currentEditingServiceGallery || this.currentEditingServiceGallery.length === 0) {
        this.serviceGalleryListContainer.innerHTML = `
          <p style="font-size: 12px; color: var(--admin-text-muted); font-style: italic; padding: 12px 0;">
            Aún no has agregado fotos adicionales de otras clientas para este efecto. Haz clic en <strong>"+ Agregar Foto de Clienta"</strong> arriba para añadir más resultados.
          </p>
        `;
        return;
      }

      this.serviceGalleryListContainer.innerHTML = this.currentEditingServiceGallery.map((gItem, idx) => {
        const parts = (gItem.position || "50% 30%").replace(/center/g, "50%").split(" ");
        const posX = parseInt(parts[0], 10) || 50;
        const posY = parseInt(parts[1], 10) || 30;

        return `
          <div class="admin-gallery-item-row" data-gid="${gItem.id}">
            <img 
              id="g_prev_${gItem.id}" 
              src="${gItem.src}" 
              class="admin-gallery-item-preview" 
              style="object-position: ${gItem.position || 'center 30%'};" 
              alt="Clienta"
            >

            <div class="admin-gallery-item-fields">
              <div style="display: flex; gap: 8px;">
                <input 
                  type="text" 
                  class="admin-gallery-item-title-input" 
                  value="${this.escapeHtml(gItem.title || `Clienta 0${idx + 1}`)}" 
                  placeholder="Etiqueta (ej: Clienta 1 · Ojos Almendrados)"
                  onchange="window.adminApp.handleGalleryItemTitleChange('${gItem.id}', this.value)"
                >
              </div>

              <div class="admin-gallery-item-sliders">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 10px; color: var(--admin-text-muted);">X:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value="${posX}" 
                    class="admin-range-slider"
                    oninput="window.adminApp.handleGalleryItemSlider('${gItem.id}', 'x', this.value)"
                  >
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 10px; color: var(--admin-text-muted);">Y:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value="${posY}" 
                    class="admin-range-slider"
                    oninput="window.adminApp.handleGalleryItemSlider('${gItem.id}', 'y', this.value)"
                  >
                </div>
              </div>
            </div>

            <button 
              type="button" 
              class="admin-gallery-item-delete-btn" 
              title="Eliminar esta foto de clienta"
              onclick="window.adminApp.deleteGalleryItem('${gItem.id}')"
            >
              🗑️
            </button>
          </div>
        `;
      }).join("");
    }

    handleGalleryItemSlider(gId, axis, val) {
      const item = this.currentEditingServiceGallery.find(g => g.id === gId);
      const img = document.getElementById(`g_prev_${gId}`);
      if (!item) return;

      const currentPos = (item.position || "50% 30%").split(" ");
      let x = currentPos[0] || "50%";
      let y = currentPos[1] || "30%";

      if (axis === "x") x = `${val}%`;
      if (axis === "y") y = `${val}%`;

      item.position = `${x} ${y}`;
      if (img) img.style.objectPosition = item.position;
    }

    handleGalleryItemTitleChange(gId, val) {
      const item = this.currentEditingServiceGallery.find(g => g.id === gId);
      if (item) item.title = val.trim();
    }

    deleteGalleryItem(gId) {
      this.currentEditingServiceGallery = this.currentEditingServiceGallery.filter(g => g.id !== gId);
      this.renderServiceModalGallery();
    }

    async handleSaveService(e) {
      e.preventDefault();
      const serviceId = this.serviceFormId.value;
      const name = this.srvName.value.trim();
      const categoryId = this.srvCategory.value;
      const subtitle = this.srvType.value.trim();
      const priceVal = this.srvPrice.value.trim();
      const price = priceVal === "" ? null : parseInt(priceVal, 10);
      const customPriceLabel = this.srvCustomPriceLabel ? this.srvCustomPriceLabel.value.trim() : "";
      const effectiveCustomPriceLabel = customPriceLabel || (price === null ? "Según pestañas elegidas" : null);
      const duration = this.srvDuration.value.trim();
      const appointmentTime = this.srvAppointmentTime.value.trim();
      const retouch15_21 = this.srvRetouch15_21.value ? parseInt(this.srvRetouch15_21.value, 10) : null;
      const retouch18_21 = this.srvRetouch18_21.value ? parseInt(this.srvRetouch18_21.value, 10) : null;
      const badge = this.srvBadge.value.trim();
      const desc = this.srvDesc.value.trim();
      const tags = this.srvTags.value.split(",").map(t => t.trim()).filter(Boolean);
      const imagePosition = `${this.srvSliderX.value}% ${this.srvSliderY.value}%`;
      const image = this.currentServiceBase64 || "assets/img/page_img_1.jpeg";
      const gallery = this.currentEditingServiceGallery || [];

      this.saveServiceBtn.disabled = true;
      this.saveServiceBtn.textContent = "Guardando en la Nube...";

      try {
        if (serviceId) {
          // Editar existente
          const srv = this.state.getServiceById(serviceId);
          if (srv) {
            srv.name = name;
            srv.categoryId = categoryId;
            srv.subtitle = subtitle;
            srv.type = subtitle;
            srv.price = price;
            srv.customPriceLabel = effectiveCustomPriceLabel;
            srv.duration = duration;
            srv.appointmentTime = appointmentTime;
            if (retouch15_21) srv.retouch15_21 = retouch15_21;
            if (retouch18_21) srv.retouch18_21 = retouch18_21;
            srv.badge = badge;
            srv.desc = desc;
            srv.tags = tags;
            srv.image = image;
            srv.imagePosition = imagePosition;
            srv.gallery = gallery;
          }
        } else {
          // Crear nuevo
          const newId = "custom-" + Date.now();
          const newService = {
            id: newId,
            categoryId,
            name,
            subtitle,
            type: subtitle,
            price,
            customPriceLabel: effectiveCustomPriceLabel,
            duration,
            appointmentTime,
            retouch15_21,
            retouch18_21,
            badge,
            desc,
            tags,
            image,
            imagePosition,
            gallery
          };
          this.state.data.services.push(newService);
        }

        await this.state.saveToCloud(this.state.data);
        this.closeServiceModal();
        this.renderServicesList();
        this.showToast("✓ Servicio y fotos de clientas guardados en Firestore", "success");
      } catch (err) {
        alert("Error al guardar: " + err.message);
      } finally {
        this.saveServiceBtn.disabled = false;
        this.saveServiceBtn.textContent = "Guardar Servicio en la Nube";
      }
    }

    async deleteService(serviceId) {
      if (!confirm("¿Deseas eliminar este servicio del catálogo?")) return;

      this.state.data.services = this.state.data.services.filter(s => s.id !== serviceId);
      try {
        await this.state.saveToCloud(this.state.data);
        this.renderServicesList();
        this.showToast("✓ Servicio eliminado del catálogo", "success");
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }

    // ================= 4. FORMS DE PORTADA, POLÍTICAS Y ESTUDIO =================
    populateFormsFromState() {
      const data = this.state.data;
      if (!data) return;

      // Hero
      if (data.hero) {
        if (document.getElementById("heroFormBadge")) document.getElementById("heroFormBadge").value = data.hero.badge || "";
        if (document.getElementById("heroFormTitle")) document.getElementById("heroFormTitle").value = data.hero.title || "";
        if (document.getElementById("heroFormSubtitle")) document.getElementById("heroFormSubtitle").value = data.hero.subtitle || "";
        if (document.getElementById("heroFormWelcomeLead")) document.getElementById("heroFormWelcomeLead").value = data.hero.welcomeLead || "";
        if (document.getElementById("heroFormWelcomeText")) document.getElementById("heroFormWelcomeText").value = data.hero.welcomeText || (data.studio ? data.studio.welcomeText : "") || "";
      }

      // Combo Banner
      if (data.comboBanner) {
        if (document.getElementById("comboFormTitle")) document.getElementById("comboFormTitle").value = data.comboBanner.title || "";
        if (document.getElementById("comboFormDesc")) document.getElementById("comboFormDesc").value = data.comboBanner.desc || "";
        if (document.getElementById("comboFormFormula1")) document.getElementById("comboFormFormula1").value = data.comboBanner.formula1 || "";
        if (document.getElementById("comboFormFormula2")) document.getElementById("comboFormFormula2").value = data.comboBanner.formula2 || "";
        if (document.getElementById("comboFormFormula3")) document.getElementById("comboFormFormula3").value = data.comboBanner.formula3 || "";
      }

      // Policies
      if (data.retouchPolicies) {
        if (document.getElementById("policiesFormTitle")) document.getElementById("policiesFormTitle").value = data.retouchPolicies.title || "";
        if (document.getElementById("policiesFormSubtitle")) document.getElementById("policiesFormSubtitle").value = data.retouchPolicies.subtitle || "";
        if (document.getElementById("policiesFormConditions")) {
          document.getElementById("policiesFormConditions").value = Array.isArray(data.retouchPolicies.conditions) 
            ? data.retouchPolicies.conditions.join("\n") 
            : "";
        }
        if (document.getElementById("policiesFormNote")) document.getElementById("policiesFormNote").value = data.retouchPolicies.note || "";
      }

      // Studio
      if (data.studio) {
        if (document.getElementById("studioFormName")) document.getElementById("studioFormName").value = data.studio.name || "";
        if (document.getElementById("studioFormSlogan")) document.getElementById("studioFormSlogan").value = data.studio.slogan || "";
        if (document.getElementById("studioFormLocation")) document.getElementById("studioFormLocation").value = data.studio.location || "";
        if (document.getElementById("studioFormWhatsapp")) document.getElementById("studioFormWhatsapp").value = data.studio.whatsapp || "";
        if (document.getElementById("studioFormWhatsappDisplay")) document.getElementById("studioFormWhatsappDisplay").value = data.studio.whatsappDisplay || "";
        if (document.getElementById("studioFormInstagram")) document.getElementById("studioFormInstagram").value = data.studio.instagram || "";
        if (document.getElementById("studioFormTiktok")) document.getElementById("studioFormTiktok").value = data.studio.tiktok || "";
      }

      // Lookbook Editorial Config
      if (data.lookbook) {
        const lb = data.lookbook;
        if (document.getElementById("lbFormCoverTitle")) document.getElementById("lbFormCoverTitle").value = lb.coverTitle || (data.studio ? data.studio.name : "") || "";
        if (document.getElementById("lbFormCoverSubtitle")) document.getElementById("lbFormCoverSubtitle").value = lb.coverSubtitle || "Catálogo Colección 2026";
        if (document.getElementById("lbFormCoverYear")) document.getElementById("lbFormCoverYear").value = lb.coverYear || "2026";
        if (document.getElementById("lbFormWelcomeLead")) document.getElementById("lbFormWelcomeLead").value = lb.welcomeLead || (data.hero ? data.hero.welcomeLead : "") || "";
        if (document.getElementById("lbFormWelcomeText")) document.getElementById("lbFormWelcomeText").value = lb.welcomeText || (data.hero ? data.hero.welcomeText : "") || "";
        if (document.getElementById("lbFormLiftingTitle")) document.getElementById("lbFormLiftingTitle").value = lb.liftingDividerTitle || "Lifting";
        if (document.getElementById("lbFormLiftingQuote")) document.getElementById("lbFormLiftingQuote").value = lb.liftingDividerQuote || "El servicio insignia";
        if (document.getElementById("lbFormExtTitle")) document.getElementById("lbFormExtTitle").value = lb.extensionsDividerTitle || "Extensiones";
        if (document.getElementById("lbFormExtQuote")) document.getElementById("lbFormExtQuote").value = lb.extensionsDividerQuote || "La mirada que siempre imaginaste.";
        if (document.getElementById("lbFormCejasTitle")) document.getElementById("lbFormCejasTitle").value = lb.cejasDividerTitle || "Cejas";
        if (document.getElementById("lbFormCejasQuote")) document.getElementById("lbFormCejasQuote").value = lb.cejasDividerQuote || "Un diseño pensado para tu rostro.";
        if (document.getElementById("lbFormLipsTitle")) document.getElementById("lbFormLipsTitle").value = lb.hydralipsDividerTitle || "HydraLips";
        if (document.getElementById("lbFormLipsQuote")) document.getElementById("lbFormLipsQuote").value = lb.hydralipsDividerQuote || "Tus labios en su mejor versión.";
        if (document.getElementById("lbFormBackTitle")) document.getElementById("lbFormBackTitle").value = lb.backCoverTitle || (data.studio ? data.studio.name : "Danna Mesa Studio");
        if (document.getElementById("lbFormBackQuote")) document.getElementById("lbFormBackQuote").value = lb.backCoverQuote || "Tu mirada, nuestro sello.";
        if (document.getElementById("lbFormBackCta")) document.getElementById("lbFormBackCta").value = lb.backCoverCta || "Una experiencia creada para resaltar tu esencia natural.";
      }
    }

    async handleSaveHeroBanner(e) {
      e.preventDefault();
      if (!this.state.data.hero) this.state.data.hero = {};
      if (!this.state.data.comboBanner) this.state.data.comboBanner = {};

      this.state.data.hero.badge = document.getElementById("heroFormBadge").value;
      this.state.data.hero.title = document.getElementById("heroFormTitle").value;
      this.state.data.hero.subtitle = document.getElementById("heroFormSubtitle").value;
      this.state.data.hero.welcomeLead = document.getElementById("heroFormWelcomeLead").value;
      this.state.data.hero.welcomeText = document.getElementById("heroFormWelcomeText").value;
      if (this.state.data.studio) {
        this.state.data.studio.welcomeLead = this.state.data.hero.welcomeLead;
        this.state.data.studio.welcomeText = this.state.data.hero.welcomeText;
      }

      this.state.data.comboBanner.title = document.getElementById("comboFormTitle").value;
      this.state.data.comboBanner.desc = document.getElementById("comboFormDesc").value;
      this.state.data.comboBanner.formula1 = document.getElementById("comboFormFormula1").value;
      this.state.data.comboBanner.formula2 = document.getElementById("comboFormFormula2").value;
      this.state.data.comboBanner.formula3 = document.getElementById("comboFormFormula3").value;

      try {
        await this.state.saveToCloud(this.state.data);
        this.showToast("✓ Portada y Banners guardados exitosamente en Firestore", "success");
      } catch (err) {
        alert("Error al guardar: " + err.message);
      }
    }

    async handleSavePolicies(e) {
      e.preventDefault();
      const conditionsText = document.getElementById("policiesFormConditions").value;
      this.state.data.retouchPolicies = {
        title: document.getElementById("policiesFormTitle").value,
        subtitle: document.getElementById("policiesFormSubtitle").value,
        conditions: conditionsText.split("\n").map(c => c.trim()).filter(Boolean),
        note: document.getElementById("policiesFormNote").value
      };

      try {
        await this.state.saveToCloud(this.state.data);
        this.showToast("✓ Políticas de Retoque guardadas exitosamente en Firestore", "success");
      } catch (err) {
        alert("Error al guardar: " + err.message);
      }
    }

    async handleSaveStudio(e) {
      e.preventDefault();
      if (!this.state.data.studio) this.state.data.studio = {};

      this.state.data.studio.name = document.getElementById("studioFormName").value;
      this.state.data.studio.slogan = document.getElementById("studioFormSlogan").value;
      this.state.data.studio.location = document.getElementById("studioFormLocation").value;
      this.state.data.studio.whatsapp = document.getElementById("studioFormWhatsapp").value;
      this.state.data.studio.whatsappDisplay = document.getElementById("studioFormWhatsappDisplay").value;
      this.state.data.studio.instagram = document.getElementById("studioFormInstagram").value;
      this.state.data.studio.tiktok = document.getElementById("studioFormTiktok").value;

      try {
        await this.state.saveToCloud(this.state.data);
        this.showToast("✓ Información de Estudio & Redes guardada en Firestore", "success");
      } catch (err) {
        alert("Error al guardar: " + err.message);
      }
    }

    async handleSaveLookbookConfig(e) {
      e.preventDefault();
      this.state.data.lookbook = {
        coverTitle: document.getElementById("lbFormCoverTitle").value.trim(),
        coverSubtitle: document.getElementById("lbFormCoverSubtitle").value.trim(),
        coverYear: document.getElementById("lbFormCoverYear").value.trim(),
        welcomeKicker: "01 · Bienvenida",
        welcomeTitle: "Bienvenida",
        welcomeLead: document.getElementById("lbFormWelcomeLead").value.trim(),
        welcomeText: document.getElementById("lbFormWelcomeText").value.trim(),
        studioTitle: "Studio Experience",
        studioQuote: document.getElementById("lbFormBackQuote").value.trim(),
        studioDesc: "Una experiencia creada para resaltar tu esencia natural con la más alta bioseguridad, técnicas avanzadas y atención 100% individualizada.",
        liftingDividerTitle: document.getElementById("lbFormLiftingTitle").value.trim(),
        liftingDividerQuote: document.getElementById("lbFormLiftingQuote").value.trim(),
        extensionsDividerTitle: document.getElementById("lbFormExtTitle").value.trim(),
        extensionsDividerQuote: document.getElementById("lbFormExtQuote").value.trim(),
        cejasDividerTitle: document.getElementById("lbFormCejasTitle").value.trim(),
        cejasDividerQuote: document.getElementById("lbFormCejasQuote").value.trim(),
        hydralipsDividerTitle: document.getElementById("lbFormLipsTitle").value.trim(),
        hydralipsDividerQuote: document.getElementById("lbFormLipsQuote").value.trim(),
        backCoverTitle: document.getElementById("lbFormBackTitle").value.trim(),
        backCoverQuote: document.getElementById("lbFormBackQuote").value.trim(),
        backCoverCta: document.getElementById("lbFormBackCta").value.trim()
      };

      try {
        await this.state.saveToCloud(this.state.data);
        this.reloadLookbookIframe();
        this.showToast("✓ Configuración editorial de la Revista guardada en Firestore", "success");
      } catch (err) {
        alert("Error al guardar: " + err.message);
      }
    }

    // ================= 5. CLOUD SYNC & BACKUPS =================
    async handlePushAllToCloud() {
      if (!confirm("¿Deseas subir todo el catálogo actual a la base de datos de Firebase Firestore?")) return;

      this.btnPushAllToCloud.disabled = true;
      this.btnPushAllToCloud.textContent = "Subiendo a Firestore...";

      try {
        await this.state.saveToCloud(this.state.data);
        this.showToast("🚀 ¡Catálogo completo sincronizado con éxito en la nube!", "success");
      } catch (err) {
        alert("Error al subir a Firestore: " + err.message);
      } finally {
        this.btnPushAllToCloud.disabled = false;
        this.btnPushAllToCloud.textContent = "🚀 Subir Catálogo Completo a Firestore";
      }
    }

    handleDownloadBackupJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.data, null, 2));
      const downloadAnchor = document.createElement("a");
      const filename = `danna_mesa_catalog_backup_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.showToast("✓ Copia de seguridad JSON descargada", "success");
    }

    handleRestoreJsonFileSelected(e) {
      if (!e.target.files || !e.target.files[0]) return;
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (!parsed || typeof parsed !== "object" || !parsed.services) {
            throw new Error("El archivo no tiene la estructura de catálogo válida.");
          }

          if (confirm("¿Deseas restaurar esta copia de seguridad y reemplazar la configuración actual?")) {
            this.state.data = parsed;
            await this.state.saveToCloud(this.state.data);
            this.populateFormsFromState();
            this.renderMasterPhotos();
            this.renderServicesList();
            this.reloadLookbookIframe();
            this.showToast("✨ ¡Copia de seguridad restaurada con éxito en la nube!", "success");
          }
        } catch (err) {
          alert("Error al leer el archivo JSON: " + err.message);
        }
      };
      reader.readAsText(file);
    }

    async handleResetAllDefaults() {
      if (!confirm("⚠️ ¿Estás segura de restablecer todos los valores originales de fábrica? Se reemplazarán los cambios actuales.")) return;

      this.state.resetToDefaults();
      try {
        await this.state.saveToCloud(this.state.data);
        this.populateFormsFromState();
        this.renderMasterPhotos();
        this.renderServicesList();
        this.reloadLookbookIframe();
        this.showToast("✓ Valores originales restablecidos y sincronizados en la nube", "success");
      } catch (err) {
        alert("Error al restablecer: " + err.message);
      }
    }

    // ================= UTILITIES =================
    showToast(message, type = "success") {
      const container = document.getElementById("adminToastContainer");
      if (!container) return;

      const toast = document.createElement("div");
      toast.className = `admin-toast ${type}`;
      toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠️'}</span> <span>${this.escapeHtml(message)}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    compressImage(file, maxDim, quality, callback) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

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

          const compressed = canvas.toDataURL("image/jpeg", quality || 0.82);
          callback(compressed);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }
  }

  // Inicializar globalmente
  document.addEventListener("DOMContentLoaded", () => {
    window.adminApp = new AdminHubApp();
  });
})();
