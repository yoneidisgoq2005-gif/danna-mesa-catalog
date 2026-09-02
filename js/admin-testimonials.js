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
      this.srvRetouch15_17 = document.getElementById("srvRetouch15_17") || document.getElementById("srvRetouch15_21");
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
      // Lookbook Studio Elements & Iframe
      this.adminLbPageSelector = document.getElementById("adminLbPageSelector");
      this.adminLbDynamicPageForm = document.getElementById("adminLbDynamicPageForm");
      this.adminLbPageEditorContainer = document.getElementById("adminLbPageEditorContainer");
      this.btnSaveAdminLbPage = document.getElementById("btnSaveAdminLbPage");
      this.adminLookbookIframe = document.getElementById("adminLookbookIframe");
      this.adminLbBase64Uploads = {};

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
            this.compressImage(e.target.files[0], 1400, 0.85, (base64) => {
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
      // Lookbook Studio Events
      if (this.adminLbPageSelector) {
        this.adminLbPageSelector.addEventListener("change", (e) => {
          this.renderAdminLbPageEditor(e.target.value);
        });
      }
      if (this.adminLbDynamicPageForm) {
        this.adminLbDynamicPageForm.addEventListener("submit", (e) => this.handleSaveAdminLbPage(e));
      }
      if (this.lookbookConfigForm) {
        this.lookbookConfigForm.addEventListener("submit", (e) => this.handleSaveLookbookConfig(e));
      }
      if (this.btnReloadLookbookPreview) {
        this.btnReloadLookbookPreview.addEventListener("click", () => this.reloadLookbookIframe());
      }
      const btnSaveVis = document.getElementById("btnSaveAdminLbVisibility");
      if (btnSaveVis) {
        btnSaveVis.addEventListener("click", () => this.handleSaveAdminLbVisibility());
      }
      const btnSelectAll = document.getElementById("btnAdminLbSelectAllPages");
      if (btnSelectAll) {
        btnSelectAll.addEventListener("click", () => {
          document.querySelectorAll(".admin-lb-visibility-check").forEach(cb => cb.checked = true);
        });
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
      const isHero = photo.type === "hero" || photo.type === "comboBanner";
      const maxDim = isHero ? 1600 : 1400;
      const quality = isHero ? 0.88 : 0.85;

      this.compressImage(file, maxDim, quality, async (compressedBase64) => {
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
      if (this.srvRetouch15_17) this.srvRetouch15_17.value = "";
      if (this.srvRetouch18_21) this.srvRetouch18_21.value = "";
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
      if (this.srvRetouch15_17) this.srvRetouch15_17.value = srv.retouch15_17 || srv.retouch15_21 || "";
      if (this.srvRetouch18_21) this.srvRetouch18_21.value = srv.retouch18_21 || "";
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
      const retouch15_17 = (this.srvRetouch15_17 && this.srvRetouch15_17.value) ? parseInt(this.srvRetouch15_17.value, 10) : null;
      const retouch18_21 = (this.srvRetouch18_21 && this.srvRetouch18_21.value) ? parseInt(this.srvRetouch18_21.value, 10) : null;
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
            const isSingle = ["ext-clasicas-naturales", "ext-efecto-pestanina", "ext-efecto-humedo", "ext-efecto-aura"].includes(srv.id);
            if (isSingle) {
              srv.retouch15_21 = retouch15_17;
              srv.retouch15_17 = null;
              srv.retouch18_21 = null;
            } else {
              srv.retouch15_17 = retouch15_17;
              srv.retouch18_21 = retouch18_21;
              srv.retouch15_21 = null;
            }
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
            retouch15_17,
            retouch15_21: retouch15_17,
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
        // Lookbook Studio Pages
        this.populateLookbookPageSelector();
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

    // ================= LOOKBOOK STUDIO PAGE EDITOR =================
    getLookbookPagesList() {
      const data = this.state.data;
      const disabled = (data.lookbook && Array.isArray(data.lookbook.disabledPages)) ? data.lookbook.disabledPages : [];

      const pages = [
        { key: "p1_cover", label: "Portada Principal (Hero)", type: "cover" },
        { key: "p2_welcome", label: "Bienvenida Editorial", type: "welcome" },
        { key: "p3_studio", label: "Studio Experience", type: "studio" },
        { key: "p_salud_ocular", label: "Garantía & Salud Ocular", type: "salud_ocular" },
        { key: "p4_lifting_divider", label: "Separador Lifting", type: "divider", divKey: "lifting" },
        { key: "p5_lifting_service", label: "Lifting de Pestañas Coreano", type: "service", serviceId: "lifting-coreano" },
        { key: "p6_lifting_evidence", label: "Galería Resultados Lifting (3 Clientas)", type: "evidence", serviceId: "lifting-coreano" },
        { key: "p7_ext_divider", label: "Separador Extensiones", type: "divider", divKey: "extensions" }
      ];

      const extServices = (data.services || []).filter(s => s.categoryId === "extensiones");
      for (let i = 0; i < extServices.length; i += 2) {
        const s1 = extServices[i];
        const s2 = extServices[i + 1];
        if (s1 && s2) {
          pages.push({
            key: `p_ext_${s1.id}_${s2.id}`,
            label: `${s1.name} & ${s2.name} (2 Efectos)`,
            type: "two_services",
            s1: s1.id,
            s2: s2.id
          });
        } else if (s1) {
          pages.push({
            key: `p_ext_${s1.id}`,
            label: `${s1.name} (1 Efecto)`,
            type: "service",
            serviceId: s1.id
          });
        }
      }

      pages.push({ key: "p14_policies", label: "Políticas de Retoque", type: "policies" });
      pages.push({ key: "p15_cejas_divider", label: "Separador Cejas", type: "divider", divKey: "cejas" });

      const browServices = (data.services || []).filter(s => s.categoryId === "cejas");
      for (let i = 0; i < browServices.length; i += 2) {
        const s1 = browServices[i];
        const s2 = browServices[i + 1];
        if (s1 && s2) {
          pages.push({
            key: `p_cejas_${s1.id}_${s2.id}`,
            label: `${s1.name} & ${s2.name} (2 Efectos)`,
            type: "two_services",
            s1: s1.id,
            s2: s2.id
          });
        } else if (s1) {
          pages.push({
            key: `p_cejas_${s1.id}`,
            label: `${s1.name} (1 Efecto)`,
            type: "service",
            serviceId: s1.id
          });
        }
      }

      pages.push({ key: "p17_lips_divider", label: "Separador HydraLips", type: "divider", divKey: "hydralips" });

      const hydra = (data.services || []).find(s => s.id === "hydralips-sesion" || s.categoryId === "hydralips");
      pages.push({
        key: "p18_hydralips_service",
        label: "HydraLips Hidratación Labial",
        type: "service",
        serviceId: hydra ? hydra.id : "hydralips-sesion"
      });

      pages.push({ key: "p19_combos", label: "Experiencias & Combos", type: "combos" });
      pages.push({ key: "p_cuidados_hidratante", label: "Cuidado en Casa & Hidratante Profesional", type: "cuidados", serviceId: "cuidado-hidratante" });
      pages.push({ key: "p_faq", label: "Preguntas Frecuentes (FAQ)", type: "faq" });
      pages.push({ key: "p20_backcover", label: "Contraportada & Contacto", type: "backcover" });

      let activeNum = 1;
      return pages.map(p => {
        const isEnabled = !disabled.includes(p.key);
        const num = isEnabled ? (activeNum++) : null;
        const numStr = num !== null ? (num < 10 ? `0${num}` : `${num}`) : "--";
        return {
          ...p,
          pageNum: num,
          isEnabled,
          displayLabel: `Pág. ${numStr} — ${p.label}${isEnabled ? '' : ' (🚫 Oculta)'}`
        };
      });
    }

    populateLookbookPageSelector() {
      const selector = document.getElementById("adminLbPageSelector");
      const checklistContainer = document.getElementById("adminLbVisibilityChecklist");

      const pages = this.getLookbookPagesList();
      const currentVal = selector ? (selector.value || (pages[0] ? pages[0].key : "")) : "";

      if (selector) {
        selector.innerHTML = pages.map(p => `
          <option value="${p.key}">${p.displayLabel}</option>
        `).join("");

        if (pages.some(p => p.key === currentVal)) {
          selector.value = currentVal;
        } else if (pages[0]) {
          selector.value = pages[0].key;
        }

        this.renderAdminLbPageEditor(selector.value);
      }

      if (checklistContainer) {
        checklistContainer.innerHTML = pages.map(p => `
          <label style="display: flex; align-items: center; gap: 10px; background: var(--admin-surface-card); border: 1px solid var(--admin-border); padding: 8px 12px; border-radius: var(--admin-radius); cursor: pointer; transition: background 0.15s ease;">
            <input type="checkbox" class="admin-lb-visibility-check" data-page-key="${p.key}" ${p.isEnabled ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--admin-primary); cursor: pointer;">
            <div style="flex: 1; min-width: 0;">
              <span style="font-size: 12px; font-weight: 600; color: ${p.isEnabled ? 'var(--admin-text-main)' : 'var(--admin-text-muted)'}; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${p.displayLabel}
              </span>
            </div>
          </label>
        `).join("");
      }
    }

    async handleSaveAdminLbVisibility() {
      const btn = document.getElementById("btnSaveAdminLbVisibility");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "⏳ Guardando...";
      }

      try {
        const checkboxes = document.querySelectorAll(".admin-lb-visibility-check");
        const disabledPages = [];
        checkboxes.forEach(cb => {
          if (!cb.checked) {
            const key = cb.getAttribute("data-page-key");
            if (key) disabledPages.push(key);
          }
        });

        if (!this.state.data.lookbook) this.state.data.lookbook = {};
        this.state.data.lookbook.disabledPages = disabledPages;

        await this.state.saveToCloud(this.state.data);
        this.populateLookbookPageSelector();
        this.reloadLookbookIframe();
        this.showToast("✓ Visibilidad de páginas guardada exitosamente", "success");
      } catch (err) {
        alert("Error al guardar visibilidad: " + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "💾 Guardar Visibilidad de Páginas";
        }
      }
    }

    renderAdminLbPageEditor(pageKey) {
      const container = document.getElementById("adminLbPageEditorContainer");
      if (!container) return;

      this.adminLbBase64Uploads = {};
      const data = this.state.data;
      const lb = data.lookbook || {};
      const pages = this.getLookbookPagesList();
      const pEntry = pages.find(p => p.key === pageKey) || { label: pageKey, isEnabled: true };
      const isPageActive = pEntry.isEnabled;

      let html = "";

      const visibilityToggleHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--admin-surface-input); padding: 12px 16px; border-radius: var(--admin-radius); border: 1px solid var(--admin-border); margin-bottom: 16px;">
          <div>
            <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--admin-primary); display: block;">Estado en la Revista</span>
            <span style="font-size: 11px; font-weight: 700; color: ${isPageActive ? '#2e7d32' : '#d32f2f'};">
              ${isPageActive ? '✅ Página Visible / Activa' : '🚫 Página Oculta / Desactivada'}
            </span>
          </div>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; font-weight: 600;">
            <input type="checkbox" id="admin_page_visibility_toggle" ${isPageActive ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--admin-primary);">
            <span>Mostrar en Revista</span>
          </label>
        </div>
      `;

      // 1. PORTADA
      if (pageKey === "p1_cover") {
        const coverImg = (data.hero && data.hero.image) ? data.hero.image : "assets/img/page_img_1.jpeg";
        const { posX, posY } = this.parsePosition((data.hero && data.hero.imagePosition) ? data.hero.imagePosition : "center 20%");

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">🌟 Portada Principal (Hero)</h3>
          ${visibilityToggleHtml}
          
          <div style="display: flex; gap: 16px; align-items: center; background: var(--admin-surface-input); padding: 14px; border-radius: var(--admin-radius); border: 1px solid var(--admin-border); margin-bottom: 14px;">
            <div style="width: 110px; height: 110px; border-radius: 8px; overflow: hidden; background: #000; flex-shrink: 0;">
              <img id="admin_img_preview_cover" src="${coverImg}" style="width:100%; height:100%; object-fit:cover; object-position: ${posX}% ${posY}%;" alt="Portada">
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              <label class="admin-btn admin-btn-secondary" style="align-self: flex-start; cursor: pointer; padding: 6px 12px; font-size: 12px;">
                🔄 Cambiar Foto de Portada
                <input type="file" accept="image/*" style="display: none;" onchange="window.adminApp.handleAdminLbPhotoUpload('cover', event)">
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <span style="font-size: 11px; color: var(--admin-text-muted);">Horizontal (X): <b id="admin_val_x_cover">${posX}%</b></span>
                  <input type="range" id="admin_slider_x_cover" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('cover')">
                </div>
                <div>
                  <span style="font-size: 11px; color: var(--admin-text-muted);">Vertical (Y): <b id="admin_val_y_cover">${posY}%</b></span>
                  <input type="range" id="admin_slider_y_cover" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('cover')">
                </div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="admin-form-group">
              <label class="admin-form-label">Título de Portada</label>
              <input type="text" id="admin_lb_coverTitle" class="admin-form-input" value="${lb.coverTitle || (data.studio ? data.studio.name : '') || ''}">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Subtítulo de Portada</label>
              <input type="text" id="admin_lb_coverSubtitle" class="admin-form-input" value="${lb.coverSubtitle || 'Catálogo Colección 2026'}">
            </div>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Año / Colección</label>
            <input type="text" id="admin_lb_coverYear" class="admin-form-input" value="${lb.coverYear || '2026'}">
          </div>
        `;
      }
      // 2. BIENVENIDA
      else if (pageKey === "p2_welcome") {
        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">📜 Bienvenida Editorial</h3>
          ${visibilityToggleHtml}
          <div class="admin-form-group">
            <label class="admin-form-label">Kicker Superior</label>
            <input type="text" id="admin_lb_welcomeKicker" class="admin-form-input" value="${lb.welcomeKicker || '01 · Bienvenida'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Título de Bienvenida</label>
            <input type="text" id="admin_lb_welcomeTitle" class="admin-form-input" value="${lb.welcomeTitle || 'Bienvenida'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Manifiesto de Bienvenida</label>
            <textarea id="admin_lb_welcomeLead" class="admin-form-textarea" rows="3">${lb.welcomeLead || (data.studio ? data.studio.welcomeLead : '') || ''}</textarea>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Mensaje de Confianza</label>
            <textarea id="admin_lb_welcomeText" class="admin-form-textarea" rows="2">${lb.welcomeText || (data.studio ? data.studio.welcomeText : '') || ''}</textarea>
          </div>
        `;
      }
      // 3. STUDIO EXPERIENCE
      else if (pageKey === "p3_studio") {
        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">🏢 Studio Experience</h3>
          ${visibilityToggleHtml}
          <div class="admin-form-group">
            <label class="admin-form-label">Título</label>
            <input type="text" id="admin_lb_studioTitle" class="admin-form-input" value="${lb.studioTitle || 'Studio Experience'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Frase / Slogan de Marca</label>
            <input type="text" id="admin_lb_studioQuote" class="admin-form-input" value="${lb.studioQuote || (data.studio ? data.studio.slogan : '') || 'Tu mirada, nuestro sello.'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Descripción de la Experiencia</label>
            <textarea id="admin_lb_studioDesc" class="admin-form-textarea" rows="3">${lb.studioDesc || 'Una experiencia creada para resaltar tu esencia natural con la más alta bioseguridad, técnicas avanzadas y atención 100% individualizada.'}</textarea>
          </div>
        `;
      }
      // [NUEVO] GARANTÍA & SALUD OCULAR
      else if (pageKey === "p_salud_ocular") {
        const so = lb.saludOcular || {
          title: "Garantía & Salud Ocular",
          subtitle: "Técnicas avanzadas y bioseguridad grado estudio diseñadas para proteger la salud de tus pestañas naturales.",
          p1Title: "Adhesivos Certificados",
          p1Desc: "Fórmulas prémium que minimizan la emisión de vapores, sin ardor y con registro INVIMA.",
          p2Title: "Aislamiento Técnico 1 a 1",
          p2Desc: "Cada extensión se adhiere a una única pestaña natural, respetando su ciclo de crecimiento. Cero peso excesivo y cero daño folicular.",
          p3Title: "Bioseguridad & Esterilización",
          p3Desc: "Esterilización rigurosa de instrumental, insumos descartables de un solo uso y atención individualizada en ambiente privado."
        };

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">🛡️ Garantía & Salud Ocular (Bioseguridad Grado Estudio)</h3>
          ${visibilityToggleHtml}
          
          <div class="admin-form-group">
            <label class="admin-form-label">Título Principal</label>
            <input type="text" id="admin_lb_soTitle" class="admin-form-input" value="${so.title}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Subtítulo General</label>
            <textarea id="admin_lb_soSubtitle" class="admin-form-textarea" rows="2">${so.subtitle}</textarea>
          </div>

          <div style="background: var(--admin-surface-input); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 14px; margin-bottom: 12px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--admin-primary); text-transform: uppercase;">🌿 Pilar 1: Adhesivos Certificados</span>
            <div style="margin: 8px 0;">
              <input type="text" id="admin_lb_soP1Title" class="admin-form-input" value="${so.p1Title}" placeholder="Título del Pilar 1">
            </div>
            <textarea id="admin_lb_soP1Desc" class="admin-form-textarea" rows="2" placeholder="Descripción del Pilar 1">${so.p1Desc}</textarea>
          </div>

          <div style="background: var(--admin-surface-input); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 14px; margin-bottom: 12px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--admin-primary); text-transform: uppercase;">🔬 Pilar 2: Aislamiento Técnico 1 a 1</span>
            <div style="margin: 8px 0;">
              <input type="text" id="admin_lb_soP2Title" class="admin-form-input" value="${so.p2Title}" placeholder="Título del Pilar 2">
            </div>
            <textarea id="admin_lb_soP2Desc" class="admin-form-textarea" rows="2" placeholder="Descripción del Pilar 2">${so.p2Desc}</textarea>
          </div>

          <div style="background: var(--admin-surface-input); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 14px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--admin-primary); text-transform: uppercase;">🧼 Pilar 3: Bioseguridad & Esterilización</span>
            <div style="margin: 8px 0;">
              <input type="text" id="admin_lb_soP3Title" class="admin-form-input" value="${so.p3Title}" placeholder="Título del Pilar 3">
            </div>
            <textarea id="admin_lb_soP3Desc" class="admin-form-textarea" rows="2" placeholder="Descripción del Pilar 3">${so.p3Desc}</textarea>
          </div>
        `;
      }
      // 4. DIVIDERS
      else if (pageKey.includes("divider")) {
        const isLift = pageKey.includes("lifting");
        const isExt = pageKey.includes("ext");
        const isCejas = pageKey.includes("cejas");
        const isLips = pageKey.includes("lips");

        let defTitle = isLift ? lb.liftingDividerTitle || "Lifting" : (isExt ? lb.extensionsDividerTitle || "Extensiones" : (isCejas ? lb.cejasDividerTitle || "Cejas" : lb.hydralipsDividerTitle || "HydraLips"));
        let defQuote = isLift ? lb.liftingDividerQuote || "El servicio insignia" : (isExt ? lb.extensionsDividerQuote || "La mirada que siempre imaginaste." : (isCejas ? lb.cejasDividerQuote || "Un diseño pensado para tu rostro." : lb.hydralipsDividerQuote || "Tus labios en su mejor versión."));

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">✨ Separador de Colección (${defTitle})</h3>
          ${visibilityToggleHtml}
          <div class="admin-form-group">
            <label class="admin-form-label">Título del Separador</label>
            <input type="text" id="admin_lb_dividerTitle" class="admin-form-input" value="${defTitle}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Frase / Cita de Colección</label>
            <input type="text" id="admin_lb_dividerQuote" class="admin-form-input" value="${defQuote}">
          </div>
        `;
      }
      // 5. GALERÍA DE RESULTADOS LIFTING (3 CLIENTAS)
      else if (pageKey === "p6_lifting_evidence") {
        const liftingService = data.services.find(s => s.id === "lifting-coreano") || data.services[0];
        const gallery = (liftingService && liftingService.gallery) ? liftingService.gallery : [];

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">📸 Galería de Resultados Lifting (3 Clientas)</h3>
          ${visibilityToggleHtml}
          <p style="font-size: 12px; color: var(--admin-text-muted); margin-bottom: 14px;">Modifica las 3 fotos reales de clientas con sus títulos, subtítulos y encuadres:</p>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${[0, 1, 2].map(idx => {
              const g = gallery[idx] || { src: `assets/img/lifting_${idx+1}.jpeg`, title: `Resultado 0${idx+1}`, subtitle: "", position: "50% 30%" };
              const { posX, posY } = this.parsePosition(g.position);
              return `
                <div style="background: var(--admin-surface-input); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 14px;">
                  <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--admin-primary); display: block; margin-bottom: 8px;">
                    Clienta 0${idx + 1}
                  </span>
                  <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px;">
                    <div style="width: 80px; height: 80px; border-radius: 6px; overflow: hidden; background: #000; flex-shrink: 0;">
                      <img id="admin_img_preview_lift_g_${idx}" src="${g.src}" style="width:100%; height:100%; object-fit:cover; object-position: ${posX}% ${posY}%;" alt="Clienta ${idx+1}">
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                      <label class="admin-btn admin-btn-secondary" style="align-self: flex-start; cursor: pointer; padding: 4px 10px; font-size: 11px;">
                        🔄 Cambiar Foto
                        <input type="file" accept="image/*" style="display: none;" onchange="window.adminApp.handleAdminLbPhotoUpload('lift_g_${idx}', event)">
                      </label>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div>
                          <span style="font-size: 10px; color: var(--admin-text-muted);">X: <b id="admin_val_x_lift_g_${idx}">${posX}%</b></span>
                          <input type="range" id="admin_slider_x_lift_g_${idx}" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('lift_g_${idx}')">
                        </div>
                        <div>
                          <span style="font-size: 10px; color: var(--admin-text-muted);">Y: <b id="admin_val_y_lift_g_${idx}">${posY}%</b></span>
                          <input type="range" id="admin_slider_y_lift_g_${idx}" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('lift_g_${idx}')">
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="admin-form-group">
                      <label class="admin-form-label">Título</label>
                      <input type="text" id="admin_lift_g_title_${idx}" class="admin-form-input" value="${g.title || `Resultado 0${idx+1}`}">
                    </div>
                    <div class="admin-form-group">
                      <label class="admin-form-label">Subtítulo</label>
                      <input type="text" id="admin_lift_g_sub_${idx}" class="admin-form-input" value="${g.subtitle || ''}">
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }
      // 6. COMBOS & EXPERIENCIAS
      else if (pageKey === "p19_combos") {
        const comboBanner = data.comboBanner || {};
        const expServices = (data.services || []).filter(s => s.categoryId === "experiencias");

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">⭐ Experiencias Exclusivas & Combos</h3>
          ${visibilityToggleHtml}
          
          <div style="background: var(--admin-surface-input); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 14px; margin-bottom: 14px;">
            <div class="admin-form-group">
              <label class="admin-form-label">Título del Banner</label>
              <input type="text" id="admin_combo_bannerTitle" class="admin-form-input" value="${comboBanner.title || 'Experiencias & Rituales'}">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Descripción General</label>
              <textarea id="admin_combo_bannerDesc" class="admin-form-textarea" rows="2">${comboBanner.desc || ''}</textarea>
            </div>
          </div>

          <div style="font-size: 12px; font-weight: 700; color: var(--admin-primary); text-transform: uppercase; margin-bottom: 8px;">Combos Incluidos:</div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${expServices.map((exp, idx) => `
              <div style="background: var(--admin-surface-card); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 12px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--admin-text-main); display: block; margin-bottom: 6px;">Combo 0${idx + 1}: ${exp.name}</span>
                <input type="hidden" id="admin_exp_id_${idx}" value="${exp.id}">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px;">
                  <div>
                    <label class="admin-form-label" style="font-size: 10px;">Nombre</label>
                    <input type="text" id="admin_exp_name_${idx}" class="admin-form-input" value="${exp.name}">
                  </div>
                  <div>
                    <label class="admin-form-label" style="font-size: 10px;">Subtítulo</label>
                    <input type="text" id="admin_exp_sub_${idx}" class="admin-form-input" value="${exp.subtitle || ''}">
                  </div>
                </div>
                <div class="admin-form-group" style="margin-bottom: 6px;">
                  <label class="admin-form-label" style="font-size: 10px;">Descripción</label>
                  <textarea id="admin_exp_desc_${idx}" class="admin-form-textarea" rows="2">${exp.desc || ''}</textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div>
                    <label class="admin-form-label" style="font-size: 10px;">Precio Fijo (COP)</label>
                    <input type="number" id="admin_exp_price_${idx}" class="admin-form-input" value="${exp.price || ''}" placeholder="Opcional" style="color: var(--admin-primary); font-weight: 700;">
                  </div>
                  <div>
                    <label class="admin-form-label" style="font-size: 10px;">Tarifa / Texto</label>
                    <input type="text" id="admin_exp_customLabel_${idx}" class="admin-form-input" value="${exp.customPriceLabel || ''}" placeholder="ej: Según pestañas">
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `;
      }
      // [NUEVO] CUIDADO EN CASA & HIDRATANTE
      else if (pageKey === "p_cuidados_hidratante") {
        const hidraProd = data.services.find(s => s.id === "cuidado-hidratante") || data.services.find(s => s.categoryId === "cuidados") || {
          name: "Hidratante de Pestañas y Cejas",
          subtitle: "Cuidado profesional en casa",
          desc: "Diseñado para acondicionar, nutrir y humectar pestañas y cejas. Su uso constante prolonga la retención de tus extensiones y estimula el crecimiento natural.",
          instructions: "Aplica una pequeña cantidad sobre pestañas o cejas limpias, preferiblemente por la noche. Distribuye suavemente y deja actuar.",
          price: 15000,
          image: "assets/img/hidratante.jpeg",
          imagePosition: "center center"
        };
        const { posX, posY } = this.parsePosition(hidraProd.imagePosition || "center center");

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">🧴 Cuidado en Casa & Hidratante de Pestañas y Cejas</h3>
          ${visibilityToggleHtml}

          <div style="display: flex; gap: 16px; align-items: center; background: var(--admin-surface-input); padding: 14px; border-radius: var(--admin-radius); border: 1px solid var(--admin-border); margin-bottom: 14px;">
            <div style="width: 100px; height: 100px; border-radius: 8px; overflow: hidden; background: #000; flex-shrink: 0;">
              <img id="admin_img_preview_hidra" src="${hidraProd.image || 'assets/img/hidratante.jpeg'}" style="width:100%; height:100%; object-fit:cover; object-position: ${posX}% ${posY}%;" alt="Hidratante">
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              <label class="admin-btn admin-btn-secondary" style="align-self: flex-start; cursor: pointer; padding: 6px 12px; font-size: 12px;">
                🔄 Cambiar Foto del Hidratante
                <input type="file" accept="image/*" style="display: none;" onchange="window.adminApp.handleAdminLbPhotoUpload('hidra', event)">
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <span style="font-size: 11px; color: var(--admin-text-muted);">Horizontal (X): <b id="admin_val_x_hidra">${posX}%</b></span>
                  <input type="range" id="admin_slider_x_hidra" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('hidra')">
                </div>
                <div>
                  <span style="font-size: 11px; color: var(--admin-text-muted);">Vertical (Y): <b id="admin_val_y_hidra">${posY}%</b></span>
                  <input type="range" id="admin_slider_y_hidra" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('hidra')">
                </div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="admin-form-group">
              <label class="admin-form-label">Nombre del Producto</label>
              <input type="text" id="admin_lb_hidraName" class="admin-form-input" value="${hidraProd.name}">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Subtítulo</label>
              <input type="text" id="admin_lb_hidraSub" class="admin-form-input" value="${hidraProd.subtitle || ''}">
            </div>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label">Descripción del Producto</label>
            <textarea id="admin_lb_hidraDesc" class="admin-form-textarea" rows="3">${hidraProd.desc || ''}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label">Modo de Uso Sugerido</label>
            <textarea id="admin_lb_hidraInst" class="admin-form-textarea" rows="2">${hidraProd.instructions || ''}</textarea>
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label">Precio de Venta (COP)</label>
            <input type="number" id="admin_lb_hidraPrice" class="admin-form-input" value="${hidraProd.price || 15000}" style="font-weight: 700; color: var(--admin-primary);">
          </div>
        `;
      }
      // [NUEVO] PREGUNTAS FRECUENTES (FAQ)
      else if (pageKey === "p_faq") {
        const faqData = lb.faq || {
          title: "Preguntas Frecuentes",
          subtitle: "Resolvemos tus dudas para que disfrutes de tu cita con total confianza.",
          items: [
            { q: "¿Dolerá el procedimiento de pestañas o lifting?", a: "En lo absoluto. La técnica es completamente indolora, delicada y relajante. La mayoría de nuestras clientas aprovechan para descansar o dormir." },
            { q: "¿Se pueden caer o dañar mis pestañas naturales?", a: "No. Trabajamos con aislamiento meticuloso 1 a 1 y seleccionamos el calibre y longitud según la resistencia natural de tu pestaña." },
            { q: "¿Cómo debo prepararme para el día de mi cita?", a: "Asiste con la zona de los ojos completamente limpia, sin residuos de pestañina ni cremas oleosas para garantizar máxima adherencia." },
            { q: "¿Qué medios de pago están disponibles?", a: "Aceptamos transferencias directas por Bancolombia, Nequi, Daviplata y Efectivo el día de tu cita." }
          ]
        };

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">❓ Preguntas Frecuentes (FAQ)</h3>
          ${visibilityToggleHtml}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="admin-form-group">
              <label class="admin-form-label">Título de la Sección</label>
              <input type="text" id="admin_lb_faqTitle" class="admin-form-input" value="${faqData.title}">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Subtítulo</label>
              <input type="text" id="admin_lb_faqSubtitle" class="admin-form-input" value="${faqData.subtitle}">
            </div>
          </div>

          <div style="font-size: 12px; font-weight: 700; color: var(--admin-primary); text-transform: uppercase; margin: 12px 0 8px;">Preguntas & Respuestas:</div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${faqData.items.map((item, idx) => `
              <div style="background: var(--admin-surface-input); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 12px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--admin-primary); display: block; margin-bottom: 6px;">Pregunta 0${idx + 1}</span>
                <input type="text" id="admin_faq_q_${idx}" class="admin-form-input" value="${item.q}" style="margin-bottom: 6px; font-weight: 600;">
                <textarea id="admin_faq_a_${idx}" class="admin-form-textarea" rows="2">${item.a}</textarea>
              </div>
            `).join("")}
          </div>
        `;
      }
      // 7. POLÍTICAS DE RETOQUE
      else if (pageKey === "p14_policies") {
        const pol = data.retouchPolicies || {};
        const condStr = Array.isArray(pol.conditions) ? pol.conditions.join("\n") : "";

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">📋 Políticas de Retoque</h3>
          ${visibilityToggleHtml}
          <div class="admin-form-group">
            <label class="admin-form-label">Título de la Sección</label>
            <input type="text" id="admin_lb_polTitle" class="admin-form-input" value="${pol.title || 'Políticas de retoque'}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Subtítulo / Introducción</label>
            <textarea id="admin_lb_polSub" class="admin-form-textarea" rows="2">${pol.subtitle || ''}</textarea>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Condiciones (Una por línea)</label>
            <textarea id="admin_lb_polConditions" class="admin-form-textarea" rows="4">${condStr}</textarea>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Nota Aclaratoria</label>
            <input type="text" id="admin_lb_polNote" class="admin-form-input" value="${pol.note || ''}">
          </div>
        `;
      }
      // 8. CONTRAPORTADA & CONTACTO
      else if (pageKey === "p20_backcover") {
        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 12px;">👑 Contraportada & Cierre Editorial</h3>
          ${visibilityToggleHtml}
          <div class="admin-form-group">
            <label class="admin-form-label">Título de Marca</label>
            <input type="text" id="admin_lb_backTitle" class="admin-form-input" value="${lb.backCoverTitle || (data.studio ? data.studio.name : 'Danna Mesa Studio')}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Frase / Cita de Cierre</label>
            <input type="text" id="admin_lb_backQuote" class="admin-form-input" value="${lb.backCoverQuote || (data.studio ? data.studio.slogan : 'Tu mirada, nuestro sello.')}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Mensaje Final / Llamado a la Acción</label>
            <textarea id="admin_lb_backCta" class="admin-form-textarea" rows="2">${lb.backCoverCta || 'Una experiencia creada para resaltar tu esencia natural.'}</textarea>
          </div>
        `;
      }
      // 9. SERVICIOS (1 O 2 EFECTOS CON FOTOS, ENCUADRES, TEXTOS Y PRECIOS COMPLETOS)
      else {
        let targetServices = [];
        const pages = this.getLookbookPagesList();
        const pEntry = pages.find(p => p.key === pageKey);

        if (pEntry && pEntry.s1 && pEntry.s2) {
          const s1 = data.services.find(x => x.id === pEntry.s1);
          const s2 = data.services.find(x => x.id === pEntry.s2);
          if (s1) targetServices.push(s1);
          if (s2) targetServices.push(s2);
        } else if (pEntry && pEntry.serviceId) {
          const s = data.services.find(x => x.id === pEntry.serviceId);
          if (s) targetServices.push(s);
        } else if (pageKey.startsWith("p_ext_")) {
          const parts = pageKey.replace("p_ext_", "").split("_");
          parts.forEach(id => {
            const s = data.services.find(x => x.id === id);
            if (s && !targetServices.some(t => t.id === s.id)) targetServices.push(s);
          });
        } else if (pageKey.startsWith("p_cejas_")) {
          const parts = pageKey.replace("p_cejas_", "").split("_");
          parts.forEach(id => {
            const s = data.services.find(x => x.id === id);
            if (s && !targetServices.some(t => t.id === s.id)) targetServices.push(s);
          });
        }

        if (targetServices.length === 0) {
          targetServices.push(data.services[0]);
        }

        html = `
          <h3 style="font-size: 16px; color: var(--admin-primary); margin-bottom: 8px;">
            👁️ ${pEntry ? pEntry.label : targetServices.map(s => s.name).join(" & ")}
          </h3>
          ${visibilityToggleHtml}
          <p style="font-size: 12px; color: var(--admin-text-muted); margin-bottom: 16px;">
            Esta página contiene <strong>${targetServices.length} efecto(s)</strong>. Edita fotos, encuadres, textos y tarifas:
          </p>

          <div style="display: flex; flex-direction: column; gap: 18px;">
            ${targetServices.map((s, idx) => {
              const { posX, posY } = this.parsePosition(s.imagePosition || "center center");
              return `
                <div style="background: var(--admin-surface-card); border: 1px solid var(--admin-border); border-radius: var(--admin-radius); padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--admin-border); padding-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--admin-primary); letter-spacing: 0.08em;">
                      Efecto 0${idx + 1}: ${s.name}
                    </span>
                    <span style="font-size: 11px; color: var(--admin-text-muted);">${s.groupTitle || s.categoryId}</span>
                  </div>

                  <input type="hidden" id="admin_srv_id_${idx}" value="${s.id}">

                  <!-- Foto y Sliders X/Y del Efecto -->
                  <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 14px; background: var(--admin-surface-input); padding: 12px; border-radius: 8px; border: 1px solid var(--admin-border);">
                    <div style="width: 90px; height: 90px; border-radius: 6px; overflow: hidden; background: #000; flex-shrink: 0;">
                      <img id="admin_img_preview_srv_${idx}" src="${s.image || 'assets/img/page_img_1.jpeg'}" style="width:100%; height:100%; object-fit:cover; object-position: ${posX}% ${posY}%;" alt="${s.name}">
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                      <label class="admin-btn admin-btn-secondary" style="align-self: flex-start; cursor: pointer; padding: 4px 10px; font-size: 11px;">
                        🔄 Cambiar Foto del Efecto
                        <input type="file" accept="image/*" style="display: none;" onchange="window.adminApp.handleAdminLbPhotoUpload('srv_${idx}', event)">
                      </label>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div>
                          <span style="font-size: 10px; color: var(--admin-text-muted);">Horizontal (X): <b id="admin_val_x_srv_${idx}">${posX}%</b></span>
                          <input type="range" id="admin_slider_x_srv_${idx}" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('srv_${idx}')">
                        </div>
                        <div>
                          <span style="font-size: 10px; color: var(--admin-text-muted);">Vertical (Y): <b id="admin_val_y_srv_${idx}">${posY}%</b></span>
                          <input type="range" id="admin_slider_y_srv_${idx}" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--admin-primary);" oninput="window.adminApp.handleAdminLbSliderChange('srv_${idx}')">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Textos y Tarifas -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                      <label class="admin-form-label" style="font-size: 10px;">Nombre del Efecto</label>
                      <input type="text" id="admin_srv_name_${idx}" class="admin-form-input" value="${s.name}">
                    </div>
                    <div>
                      <label class="admin-form-label" style="font-size: 10px;">Subtítulo (ej: 01 · Resultado sutil)</label>
                      <input type="text" id="admin_srv_sub_${idx}" class="admin-form-input" value="${s.subtitle || ''}">
                    </div>
                  </div>

                  <div class="admin-form-group" style="margin-bottom: 10px;">
                    <label class="admin-form-label" style="font-size: 10px;">Descripción del Efecto</label>
                    <textarea id="admin_srv_desc_${idx}" class="admin-form-textarea" rows="2">${s.desc || ''}</textarea>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
                    <div>
                      <label class="admin-form-label" style="font-size: 10px;">Precio (COP)</label>
                      <input type="number" id="admin_srv_price_${idx}" class="admin-form-input" value="${s.price || ''}" placeholder="Opcional" style="color: var(--admin-primary); font-weight: 700;">
                    </div>
                    <div>
                      <label class="admin-form-label" style="font-size: 10px;">Duración</label>
                      <input type="text" id="admin_srv_dur_${idx}" class="admin-form-input" value="${s.duration || ''}" placeholder="ej: 3 a 5 sem">
                    </div>
                    <div>
                      <label class="admin-form-label" style="font-size: 10px;">Ret. 15-17d/21d</label>
                      <input type="number" id="admin_srv_ret15_${idx}" class="admin-form-input" value="${s.retouch15_17 || s.retouch15_21 || ''}" placeholder="Opcional">
                    </div>
                    <div>
                      <label class="admin-form-label" style="font-size: 10px;">Ret. 18-21d</label>
                      <input type="number" id="admin_srv_ret18_${idx}" class="admin-form-input" value="${s.retouch18_21 || ''}" placeholder="Opcional">
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }

      container.innerHTML = html;
    }

    handleAdminLbSliderChange(key) {
      const sX = document.getElementById(`admin_slider_x_${key}`);
      const sY = document.getElementById(`admin_slider_y_${key}`);
      const img = document.getElementById(`admin_img_preview_${key}`);
      const valX = document.getElementById(`admin_val_x_${key}`);
      const valY = document.getElementById(`admin_val_y_${key}`);

      if (sX && sY && img) {
        const x = sX.value;
        const y = sY.value;
        if (valX) valX.textContent = `${x}%`;
        if (valY) valY.textContent = `${y}%`;
        img.style.objectPosition = `${x}% ${y}%`;
      }
    }

    handleAdminLbPhotoUpload(key, event) {
      const file = event.target.files[0];
      if (!file) return;

      const isCover = key.includes("cover");
      const maxDim = isCover ? 1600 : 1400;
      const quality = isCover ? 0.88 : 0.85;

      this.compressImage(file, maxDim, quality, (compressedBase64) => {
        this.adminLbBase64Uploads[key] = compressedBase64;
        const img = document.getElementById(`admin_img_preview_${key}`);
        if (img) img.src = compressedBase64;
        this.showToast("✓ Foto en alta resolución cargada en el editor", "success");
      });
    }

    async handleSaveAdminLbPage(e) {
      e.preventDefault();
      const selector = document.getElementById("adminLbPageSelector");
      if (!selector) return;
      const pageKey = selector.value;
      const data = this.state.data;
      if (!data.lookbook) data.lookbook = {};

      const saveBtn = document.getElementById("btnSaveAdminLbPage");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "⏳ Guardando en Firestore...";
      }

      try {
        // 0. VISIBILIDAD DE LA PÁGINA
        const visToggle = document.getElementById("admin_page_visibility_toggle");
        if (visToggle) {
          if (!Array.isArray(data.lookbook.disabledPages)) data.lookbook.disabledPages = [];
          if (visToggle.checked) {
            data.lookbook.disabledPages = data.lookbook.disabledPages.filter(p => p !== pageKey);
          } else {
            if (!data.lookbook.disabledPages.includes(pageKey)) {
              data.lookbook.disabledPages.push(pageKey);
            }
          }
        }

        // 1. PORTADA
        if (pageKey === "p1_cover") {
          const cTitle = document.getElementById("admin_lb_coverTitle");
          const cSub = document.getElementById("admin_lb_coverSubtitle");
          const cYear = document.getElementById("admin_lb_coverYear");
          const sX = document.getElementById("admin_slider_x_cover");
          const sY = document.getElementById("admin_slider_y_cover");

          if (cTitle) data.lookbook.coverTitle = cTitle.value.trim();
          if (cSub) data.lookbook.coverSubtitle = cSub.value.trim();
          if (cYear) data.lookbook.coverYear = cYear.value.trim();
          if (this.adminLbBase64Uploads["cover"]) data.hero.image = this.adminLbBase64Uploads["cover"];
          if (sX && sY) data.hero.imagePosition = `${sX.value}% ${sY.value}%`;
        }
        // 2. BIENVENIDA
        else if (pageKey === "p2_welcome") {
          const kicker = document.getElementById("admin_lb_welcomeKicker");
          const title = document.getElementById("admin_lb_welcomeTitle");
          const lead = document.getElementById("admin_lb_welcomeLead");
          const text = document.getElementById("admin_lb_welcomeText");

          if (kicker) data.lookbook.welcomeKicker = kicker.value.trim();
          if (title) data.lookbook.welcomeTitle = title.value.trim();
          if (lead) {
            data.lookbook.welcomeLead = lead.value.trim();
            if (data.studio) data.studio.welcomeLead = lead.value.trim();
          }
          if (text) {
            data.lookbook.welcomeText = text.value.trim();
            if (data.studio) data.studio.welcomeText = text.value.trim();
          }
        }
        // 3. STUDIO EXPERIENCE
        else if (pageKey === "p3_studio") {
          const sTitle = document.getElementById("admin_lb_studioTitle");
          const sQuote = document.getElementById("admin_lb_studioQuote");
          const sDesc = document.getElementById("admin_lb_studioDesc");

          if (sTitle) data.lookbook.studioTitle = sTitle.value.trim();
          if (sQuote) {
            data.lookbook.studioQuote = sQuote.value.trim();
            if (data.studio) data.studio.slogan = sQuote.value.trim();
          }
          if (sDesc) data.lookbook.studioDesc = sDesc.value.trim();
        }
        // [NUEVO] GARANTÍA & SALUD OCULAR
        else if (pageKey === "p_salud_ocular") {
          const sTitle = document.getElementById("admin_lb_soTitle");
          const sSub = document.getElementById("admin_lb_soSubtitle");
          const p1T = document.getElementById("admin_lb_soP1Title");
          const p1D = document.getElementById("admin_lb_soP1Desc");
          const p2T = document.getElementById("admin_lb_soP2Title");
          const p2D = document.getElementById("admin_lb_soP2Desc");
          const p3T = document.getElementById("admin_lb_soP3Title");
          const p3D = document.getElementById("admin_lb_soP3Desc");

          if (!data.lookbook.saludOcular) data.lookbook.saludOcular = {};
          if (sTitle) data.lookbook.saludOcular.title = sTitle.value.trim();
          if (sSub) data.lookbook.saludOcular.subtitle = sSub.value.trim();
          if (p1T) data.lookbook.saludOcular.p1Title = p1T.value.trim();
          if (p1D) data.lookbook.saludOcular.p1Desc = p1D.value.trim();
          if (p2T) data.lookbook.saludOcular.p2Title = p2T.value.trim();
          if (p2D) data.lookbook.saludOcular.p2Desc = p2D.value.trim();
          if (p3T) data.lookbook.saludOcular.p3Title = p3T.value.trim();
          if (p3D) data.lookbook.saludOcular.p3Desc = p3D.value.trim();
        }
        // 4. DIVIDERS
        else if (pageKey.includes("divider")) {
          const dTitle = document.getElementById("admin_lb_dividerTitle");
          const dQuote = document.getElementById("admin_lb_dividerQuote");

          if (pageKey.includes("lifting")) {
            if (dTitle) data.lookbook.liftingDividerTitle = dTitle.value.trim();
            if (dQuote) data.lookbook.liftingDividerQuote = dQuote.value.trim();
          } else if (pageKey.includes("ext")) {
            if (dTitle) data.lookbook.extensionsDividerTitle = dTitle.value.trim();
            if (dQuote) data.lookbook.extensionsDividerQuote = dQuote.value.trim();
          } else if (pageKey.includes("cejas")) {
            if (dTitle) data.lookbook.cejasDividerTitle = dTitle.value.trim();
            if (dQuote) data.lookbook.cejasDividerQuote = dQuote.value.trim();
          } else if (pageKey.includes("lips")) {
            if (dTitle) data.lookbook.hydralipsDividerTitle = dTitle.value.trim();
            if (dQuote) data.lookbook.hydralipsDividerQuote = dQuote.value.trim();
          }
        }
        // 5. GALERÍA RESULTADOS LIFTING
        else if (pageKey === "p6_lifting_evidence") {
          const liftingService = data.services.find(s => s.id === "lifting-coreano");
          if (liftingService) {
            if (!Array.isArray(liftingService.gallery)) liftingService.gallery = [];
            [0, 1, 2].forEach(idx => {
              if (!liftingService.gallery[idx]) {
                liftingService.gallery[idx] = { id: `lift-res-${idx+1}`, src: `assets/img/lifting_${idx+1}.jpeg` };
              }
              const g = liftingService.gallery[idx];
              const titleInput = document.getElementById(`admin_lift_g_title_${idx}`);
              const subInput = document.getElementById(`admin_lift_g_sub_${idx}`);
              const sX = document.getElementById(`admin_slider_x_lift_g_${idx}`);
              const sY = document.getElementById(`admin_slider_y_lift_g_${idx}`);

              if (titleInput) g.title = titleInput.value.trim();
              if (subInput) g.subtitle = subInput.value.trim();
              if (sX && sY) g.position = `${sX.value}% ${sY.value}%`;
              if (this.adminLbBase64Uploads[`lift_g_${idx}`]) {
                g.src = this.adminLbBase64Uploads[`lift_g_${idx}`];
              }
            });
          }
        }
        // 6. COMBOS & EXPERIENCIAS
        else if (pageKey === "p19_combos") {
          const cTitle = document.getElementById("admin_combo_bannerTitle");
          const cDesc = document.getElementById("admin_combo_bannerDesc");
          if (cTitle) {
            if (!data.comboBanner) data.comboBanner = {};
            data.comboBanner.title = cTitle.value.trim();
          }
          if (cDesc) {
            if (!data.comboBanner) data.comboBanner = {};
            data.comboBanner.desc = cDesc.value.trim();
          }

          const expServices = data.services.filter(s => s.categoryId === "experiencias");
          expServices.forEach((exp, idx) => {
            const nameInput = document.getElementById(`admin_exp_name_${idx}`);
            const subInput = document.getElementById(`admin_exp_sub_${idx}`);
            const descInput = document.getElementById(`admin_exp_desc_${idx}`);
            const priceInput = document.getElementById(`admin_exp_price_${idx}`);
            const customLabelInput = document.getElementById(`admin_exp_customLabel_${idx}`);

            if (nameInput) exp.name = nameInput.value.trim();
            if (subInput) exp.subtitle = subInput.value.trim();
            if (descInput) exp.desc = descInput.value.trim();
            if (priceInput) exp.price = priceInput.value.trim() === "" ? null : parseInt(priceInput.value, 10);
            if (customLabelInput) exp.customPriceLabel = customLabelInput.value.trim();
          });
        }
        // [NUEVO] CUIDADO EN CASA & HIDRATANTE
        else if (pageKey === "p_cuidados_hidratante") {
          let hidraProd = data.services.find(s => s.id === "cuidado-hidratante") || data.services.find(s => s.categoryId === "cuidados");
          if (!hidraProd) {
            hidraProd = {
              id: "cuidado-hidratante",
              categoryId: "cuidados",
              name: "Hidratante de Pestañas y Cejas",
              subtitle: "Cuidado profesional en casa",
              desc: "Diseñado para acondicionar, nutrir y humectar pestañas y cejas. Su uso constante prolonga la retención de tus extensiones y estimula el crecimiento natural.",
              instructions: "Aplica una pequeña cantidad sobre pestañas o cejas limpias, preferiblemente por la noche. Distribuye suavemente y deja actuar.",
              price: 15000,
              image: "assets/img/hidratante.jpeg",
              imagePosition: "center center"
            };
            data.services.push(hidraProd);
          }

          const hName = document.getElementById("admin_lb_hidraName");
          const hSub = document.getElementById("admin_lb_hidraSub");
          const hDesc = document.getElementById("admin_lb_hidraDesc");
          const hInst = document.getElementById("admin_lb_hidraInst");
          const hPrice = document.getElementById("admin_lb_hidraPrice");
          const sX = document.getElementById("admin_slider_x_hidra");
          const sY = document.getElementById("admin_slider_y_hidra");

          if (hName) hidraProd.name = hName.value.trim();
          if (hSub) hidraProd.subtitle = hSub.value.trim();
          if (hDesc) hidraProd.desc = hDesc.value.trim();
          if (hInst) hidraProd.instructions = hInst.value.trim();
          if (hPrice) hidraProd.price = hPrice.value.trim() === "" ? 15000 : parseInt(hPrice.value, 10);
          if (this.adminLbBase64Uploads["hidra"]) hidraProd.image = this.adminLbBase64Uploads["hidra"];
          if (sX && sY) hidraProd.imagePosition = `${sX.value}% ${sY.value}%`;
        }
        // [NUEVO] PREGUNTAS FRECUENTES (FAQ)
        else if (pageKey === "p_faq") {
          const fTitle = document.getElementById("admin_lb_faqTitle");
          const fSub = document.getElementById("admin_lb_faqSubtitle");

          if (!data.lookbook.faq) data.lookbook.faq = { items: [] };
          if (fTitle) data.lookbook.faq.title = fTitle.value.trim();
          if (fSub) data.lookbook.faq.subtitle = fSub.value.trim();

          const items = [];
          let idx = 0;
          while (document.getElementById(`admin_faq_q_${idx}`)) {
            const qEl = document.getElementById(`admin_faq_q_${idx}`);
            const aEl = document.getElementById(`admin_faq_a_${idx}`);
            if (qEl && aEl) {
              items.push({ q: qEl.value.trim(), a: aEl.value.trim() });
            }
            idx++;
          }
          if (items.length > 0) data.lookbook.faq.items = items;
        }
        // 7. POLÍTICAS
        else if (pageKey === "p14_policies") {
          const pTitle = document.getElementById("admin_lb_polTitle");
          const pSub = document.getElementById("admin_lb_polSub");
          const pCond = document.getElementById("admin_lb_polConditions");
          const pNote = document.getElementById("admin_lb_polNote");

          if (!data.retouchPolicies) data.retouchPolicies = {};
          if (pTitle) data.retouchPolicies.title = pTitle.value.trim();
          if (pSub) data.retouchPolicies.subtitle = pSub.value.trim();
          if (pCond) data.retouchPolicies.conditions = pCond.value.split("\n").map(c => c.trim()).filter(Boolean);
          if (pNote) data.retouchPolicies.note = pNote.value.trim();
        }
        // 8. CONTRAPORTADA
        else if (pageKey === "p20_backcover") {
          const bTitle = document.getElementById("admin_lb_backTitle");
          const bQuote = document.getElementById("admin_lb_backQuote");
          const bCta = document.getElementById("admin_lb_backCta");

          if (bTitle) data.lookbook.backCoverTitle = bTitle.value.trim();
          if (bQuote) data.lookbook.backCoverQuote = bQuote.value.trim();
          if (bCta) data.lookbook.backCoverCta = bCta.value.trim();
        }
        // 9. SERVICIOS (1 O MÚLTIPLES EFECTOS)
        else {
          let idx = 0;
          while (document.getElementById(`admin_srv_id_${idx}`)) {
            const sId = document.getElementById(`admin_srv_id_${idx}`).value;
            const s = data.services.find(x => x.id === sId);
            if (s) {
              const nameInput = document.getElementById(`admin_srv_name_${idx}`);
              const subInput = document.getElementById(`admin_srv_sub_${idx}`);
              const descInput = document.getElementById(`admin_srv_desc_${idx}`);
              const priceInput = document.getElementById(`admin_srv_price_${idx}`);
              const durInput = document.getElementById(`admin_srv_dur_${idx}`);
              const ret15Input = document.getElementById(`admin_srv_ret15_${idx}`) || document.getElementById(`admin_srv_ret_${idx}`);
              const ret18Input = document.getElementById(`admin_srv_ret18_${idx}`);
              const sX = document.getElementById(`admin_slider_x_srv_${idx}`);
              const sY = document.getElementById(`admin_slider_y_srv_${idx}`);

              if (nameInput) s.name = nameInput.value.trim();
              if (subInput) s.subtitle = subInput.value.trim();
              if (descInput) s.desc = descInput.value.trim();
              if (priceInput) s.price = priceInput.value.trim() === "" ? null : parseInt(priceInput.value, 10);
              if (durInput) s.duration = durInput.value.trim();
              const isSingle = ["ext-clasicas-naturales", "ext-efecto-pestanina", "ext-efecto-humedo", "ext-efecto-aura"].includes(s.id);
              if (ret15Input) {
                const val = ret15Input.value.trim() === "" ? null : parseInt(ret15Input.value, 10);
                if (isSingle) {
                  s.retouch15_21 = val;
                  s.retouch15_17 = null;
                  s.retouch18_21 = null;
                } else {
                  s.retouch15_17 = val;
                  s.retouch15_21 = null;
                }
              }
              if (ret18Input) {
                if (!isSingle) {
                  s.retouch18_21 = ret18Input.value.trim() === "" ? null : parseInt(ret18Input.value, 10);
                } else {
                  s.retouch18_21 = null;
                }
              }
              if (sX && sY) s.imagePosition = `${sX.value}% ${sY.value}%`;
              if (this.adminLbBase64Uploads[`srv_${idx}`]) {
                s.image = this.adminLbBase64Uploads[`srv_${idx}`];
              }
            }
            idx++;
          }
        }

        await this.state.saveToCloud(this.state.data);
        this.populateLookbookPageSelector();
        this.reloadLookbookIframe();
        this.showToast("✓ ¡Página y todos sus elementos guardados en Firestore!", "success");
      } catch (err) {
        alert("Error al guardar: " + err.message);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "💾 Guardar Cambios de Esta Página en Firestore";
        }
      }
    }

    async handleSaveLookbookConfig(e) {
      e.preventDefault();
      this.state.data.lookbook = {
        coverTitle: document.getElementById("lbFormCoverTitle").value.trim(),
        coverYear: document.getElementById("lbFormCoverYear").value.trim(),
        welcomeLead: document.getElementById("lbFormWelcomeLead").value.trim(),
        liftingDividerQuote: document.getElementById("lbFormLiftingQuote").value.trim(),
        extensionsDividerQuote: document.getElementById("lbFormExtQuote").value.trim(),
        cejasDividerQuote: document.getElementById("lbFormCejasQuote").value.trim(),
        hydralipsDividerQuote: document.getElementById("lbFormLipsQuote").value.trim()
      };

      try {
        await this.state.saveToCloud(this.state.data);
        this.reloadLookbookIframe();
        this.showToast("✓ Textos globales del lookbook guardados en Firestore", "success");
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
          const targetDim = maxDim || 1400;
          const targetQuality = quality || 0.85;

          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > targetDim || height > targetDim) {
            if (width > height) {
              height = Math.round((height * targetDim) / width);
              width = targetDim;
            } else {
              width = Math.round((width * targetDim) / height);
              height = targetDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL("image/jpeg", targetQuality);
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
