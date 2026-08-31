/**
 * Danna Mesa Studio — Live Admin & Customizer (CMS Visual Total con Gestor Maestro de Fotos)
 * Permite editar el 100% de la web:
 * - GESTOR GLOBAL DE TODAS LAS FOTOS (33+ fotos de toda la web en una sola pantalla con cambio de archivo y encuadres X/Y).
 * - Editor individual de Servicios, Portada, Banners, Textos, Políticas, Precios y Redes.
 * - Compresión inteligente y guardado instantáneo en localStorage y JSON.
 */

class CatalogCustomizer {
  constructor() {
    this.state = window.catalogState;
    this.modal = null;
    this.activeTab = "all_photos"; // 'all_photos' | 'services' | 'hero' | 'combo' | 'policies' | 'studio' | 'prices' | 'theme' | 'backup'
    this.selectedServiceId = "lifting-coreano";
    this.photoCategoryFilter = "all";
    this.init();
  }

  init() {
    this.createModalDOM();
    this.bindGlobalShortcuts();
  }

  createModalDOM() {
    if (document.getElementById("customizerModalOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "customizerModalOverlay";
    overlay.className = "modal-overlay";
    overlay.style.zIndex = "250";

    overlay.innerHTML = `
      <div class="drawer-modal-content" style="max-width: 880px; max-height: 92vh; border-radius: var(--radius-lg);">
        <div class="drawer-header" style="background: var(--color-paper-alt); padding: 16px 24px;">
          <div>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary);">Panel de Administración Total</span>
            <h2 class="drawer-title" style="font-size: 22px; margin-top: 2px;">Gestor Maestro de Fotos y Contenidos</h2>
          </div>
          <button class="btn-remove-item" id="closeCustomizerModalBtn" style="font-size: 20px;">✕</button>
        </div>

        <!-- Pestañas de administración -->
        <div style="display: flex; gap: 8px; padding: 10px 24px; border-bottom: 1px solid var(--color-hairline); background: var(--color-paper-light); overflow-x: auto;">
          <button class="subfilter-chip active" data-custab="all_photos" id="cusTabAllPhotos">🖼️ TODAS LAS FOTOS DEL SITIO</button>
          <button class="subfilter-chip" data-custab="services" id="cusTabServices">📸 Textos & Servicios</button>
          <button class="subfilter-chip" data-custab="hero" id="cusTabHero">🌟 Portada & Hero</button>
          <button class="subfilter-chip" data-custab="combo" id="cusTabCombo">⭐ Banner Experiencias</button>
          <button class="subfilter-chip" data-custab="policies" id="cusTabPolicies">📜 Políticas de Retoque</button>
          <button class="subfilter-chip" data-custab="studio" id="cusTabStudio">🏢 Estudio & Redes</button>
          <button class="subfilter-chip" data-custab="prices" id="cusTabPrices">💰 Tabla de Precios</button>
          <button class="subfilter-chip" data-custab="lookbook" id="cusTabLookbook">📖 Textos Revista</button>
          <button class="subfilter-chip" data-custab="theme" id="cusTabTheme">🎨 Colores & Tema</button>
          <button class="subfilter-chip" data-custab="backup" id="cusTabBackup">💾 Respaldo JSON</button>
          <a href="admin.html" target="_blank" class="subfilter-chip" style="text-decoration: none; color: var(--color-primary); font-weight: 700;">💬 Panel Admin Completo (Firebase) ➔</a>
        </div>

        <div class="drawer-body" id="customizerBodyContainer" style="padding: 24px; overflow-y: auto;">
          <!-- Contenido dinámico según pestaña -->
        </div>

        <div class="drawer-footer" style="display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px;">
          <button class="btn btn-outline btn-sm" id="btnResetDefaults" style="color: var(--color-ink); border-color: var(--color-hairline);">Restablecer Original</button>
          <button class="btn btn-primary btn-sm" id="btnSaveCustomizer">✓ Guardar Todos los Cambios</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modal = overlay;

    // Eventos de cierre
    overlay.querySelector("#closeCustomizerModalBtn").addEventListener("click", () => this.closeModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Pestañas
    overlay.querySelectorAll("[data-custab]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.saveCurrentInputsInMemory();
        overlay.querySelectorAll("[data-custab]").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.activeTab = e.currentTarget.dataset.custab;
        this.renderTabContent();
      });
    });

    // Guardar
    overlay.querySelector("#btnSaveCustomizer").addEventListener("click", () => {
      this.saveCurrentChanges();
    });

    // Reset
    overlay.querySelector("#btnResetDefaults").addEventListener("click", () => {
      if (confirm("¿Seguro que deseas restablecer todos los textos, fotos y precios a sus valores originales de fábrica?")) {
        this.state.resetToDefaults();
        this.renderTabContent();
        if (window.catalogApp) window.catalogApp.showToast("Valores restablecidos con éxito");
      }
    });
  }

  bindGlobalShortcuts() {
    // Limpiar residuos antiguos de localStorage
    try { localStorage.removeItem("danna_mesa_admin_unlocked"); } catch (e) {}

    // 1. Mostrar botón ⚙️ SÓLO si la URL tiene ?admin=true
    const urlParams = new URLSearchParams(window.location.search);
    const openBtn = document.getElementById("openCustomizerBtn");
    if (urlParams.get("admin") === "true" || urlParams.get("admin_preview") === "true") {
      if (openBtn) openBtn.style.display = "inline-flex";
    } else {
      if (openBtn) openBtn.style.display = "none";
    }

    // 2. Atajo de teclado secreto: Alt + E o Ctrl + Shift + A
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") || (e.altKey && e.key.toLowerCase() === "e")) {
        e.preventDefault();
        if (openBtn) openBtn.style.display = "inline-flex";
        this.openModal();
      }
    });

    // 3. Toque secreto: 5 clics seguidos en el logo "Danna Mesa" para abrirlo desde el celular
    const brandLogo = document.getElementById("headerBrandName");
    if (brandLogo) {
      let clickCount = 0;
      let clickTimer = null;
      brandLogo.addEventListener("click", () => {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
        if (clickCount >= 5) {
          clickCount = 0;
          if (openBtn) openBtn.style.display = "inline-flex";
          this.openModal();
        }
      });
    }
  }

  openModal(tabToOpen) {
    this.createModalDOM();
    if (tabToOpen) {
      this.activeTab = tabToOpen;
      const overlay = this.modal;
      if (overlay) {
        overlay.querySelectorAll("[data-custab]").forEach(b => {
          if (b.dataset.custab === tabToOpen) b.classList.add("active");
          else b.classList.remove("active");
        });
      }
    }
    this.renderTabContent();
    this.modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  parsePosition(posString) {
    let posX = 50;
    let posY = 50;
    if (posString) {
      const parts = posString.split(" ");
      if (parts.length >= 2) {
        if (parts[0] === "center") posX = 50;
        else if (parts[0] === "left") posX = 0;
        else if (parts[0] === "right") posX = 100;
        else posX = parseInt(parts[0], 10) || 50;

        if (parts[1] === "center") posY = 50;
        else if (parts[1] === "top") posY = 0;
        else if (parts[1] === "bottom") posY = 100;
        else posY = parseInt(parts[1], 10) || 50;
      }
    }
    return { posX, posY };
  }

  /**
   * Recopila todas las fotos de toda la página en una sola lista maestra estructurada
   */
  getAllSitePhotos() {
    const data = this.state.data;
    const list = [];

    // 1. Portada (Hero)
    const hero = data.hero || DEFAULT_CATALOG_DATA.hero;
    list.push({
      key: "hero",
      type: "hero",
      category: "banners",
      sectionLabel: "🌟 Portada Principal",
      title: "Foto de Portada (Hero)",
      src: hero.image || "assets/img/page_img_1.jpeg",
      pos: hero.imagePosition || "center 20%",
      targetObj: hero
    });

    // 2. Banner Beneficios / Combos
    const combo = data.comboBanner || DEFAULT_CATALOG_DATA.comboBanner;
    list.push({
      key: "combo_banner",
      type: "combo_banner",
      category: "banners",
      sectionLabel: "⭐ Banner de Beneficios",
      title: "Foto Experiencias (Completo)",
      src: combo.image || "assets/img/completo2.png",
      pos: combo.imagePosition || "center 30%",
      targetObj: combo
    });

    // 3. Todos los Servicios
    data.services.forEach(s => {
      // Foto principal
      list.push({
        key: `service_${s.id}_main`,
        type: "service_main",
        serviceId: s.id,
        category: s.categoryId,
        sectionLabel: this.getCategoryLabel(s.categoryId),
        title: s.name,
        src: s.image || "assets/img/page_img_1.jpeg",
        pos: s.imagePosition || "center center",
        targetObj: s,
        prop: "image",
        posProp: "imagePosition"
      });

      // Si tiene foto Antes
      if (s.beforeImage) {
        list.push({
          key: `service_${s.id}_before`,
          type: "service_before",
          serviceId: s.id,
          category: s.categoryId,
          sectionLabel: `${s.name} (Antes)`,
          title: `${s.name} · Foto Antes`,
          src: s.beforeImage,
          pos: s.imagePosition || "center center",
          targetObj: s,
          prop: "beforeImage",
          posProp: "imagePosition"
        });
      }

      // Si tiene foto Después
      if (s.afterImage) {
        list.push({
          key: `service_${s.id}_after`,
          type: "service_after",
          serviceId: s.id,
          category: s.categoryId,
          sectionLabel: `${s.name} (Después)`,
          title: `${s.name} · Foto Después`,
          src: s.afterImage,
          pos: s.imagePosition || "center center",
          targetObj: s,
          prop: "afterImage",
          posProp: "imagePosition"
        });
      }

      // Si tiene galería adicional (Lifting)
      if (s.gallery && Array.isArray(s.gallery)) {
        s.gallery.forEach((g, idx) => {
          list.push({
            key: `service_${s.id}_gal_${idx}`,
            type: "service_gallery",
            serviceId: s.id,
            galleryIdx: idx,
            category: s.categoryId,
            sectionLabel: `Lifting · ${g.title}`,
            title: `${g.title}: ${g.subtitle}`,
            src: g.src,
            pos: g.position || "center 30%",
            targetObj: g,
            prop: "src",
            posProp: "position"
          });
        });
      }
    });

    return list;
  }

  getCategoryLabel(catId) {
    const labels = {
      lifting: "✨ Lifting Coreano",
      extensiones: "👁️ Extensiones de Pestañas",
      cejas: "🪄 Cejas & Laminado",
      hydralips: "💋 HydraLips Labios",
      experiencias: "⭐ Experiencias & Combos",
      cuidados: "🌿 Cuidado en Casa"
    };
    return labels[catId] || catId;
  }

  saveCurrentInputsInMemory() {
    const data = this.state.data;

    // Servicios
    if (this.activeTab === "services") {
      const s = data.services.find(x => x.id === this.selectedServiceId);
      if (s) {
        const nameInput = document.getElementById("custServiceName");
        const subInput = document.getElementById("custServiceSubtitle");
        const descInput = document.getElementById("custServiceDesc");
        const durInput = document.getElementById("custServiceDuration");
        const timeInput = document.getElementById("custServiceTime");
        const priceInput = document.getElementById("custServicePrice");
        const imgInput = document.getElementById("custServiceImgUrl");
        const sliderX = document.getElementById("custSliderX");
        const sliderY = document.getElementById("custSliderY");

        if (nameInput) s.name = nameInput.value;
        if (subInput) s.subtitle = subInput.value;
        if (descInput) s.desc = descInput.value;
        if (durInput) s.duration = durInput.value;
        if (timeInput) s.appointmentTime = timeInput.value;
        if (priceInput) s.price = priceInput.value.trim() === "" ? null : parseInt(priceInput.value, 10);
        if (imgInput && imgInput.value) s.image = imgInput.value;
        if (sliderX && sliderY) s.imagePosition = `${sliderX.value}% ${sliderY.value}%`;
      }
    }

    // Hero
    if (this.activeTab === "hero") {
      if (!data.hero) data.hero = {};
      const badge = document.getElementById("custHeroBadge");
      const title = document.getElementById("custHeroTitle");
      const lead = document.getElementById("custHeroLead");
      const img = document.getElementById("custHeroImgUrl");
      const sliderX = document.getElementById("custHeroSliderX");
      const sliderY = document.getElementById("custHeroSliderY");

      if (badge) data.hero.badge = badge.value;
      if (title) data.hero.title = title.value;
      if (lead) data.hero.welcomeLead = lead.value;
      if (img && img.value) data.hero.image = img.value;
      if (sliderX && sliderY) data.hero.imagePosition = `${sliderX.value}% ${sliderY.value}%`;
    }

    // Combo
    if (this.activeTab === "combo") {
      if (!data.comboBanner) data.comboBanner = {};
      const badge = document.getElementById("custComboBadge");
      const title = document.getElementById("custComboTitle");
      const desc = document.getElementById("custComboDesc");
      const f1 = document.getElementById("custComboF1");
      const f2 = document.getElementById("custComboF2");
      const f3 = document.getElementById("custComboF3");
      const img = document.getElementById("custComboImgUrl");
      const sliderX = document.getElementById("custComboSliderX");
      const sliderY = document.getElementById("custComboSliderY");

      if (badge) data.comboBanner.badge = badge.value;
      if (title) data.comboBanner.title = title.value;
      if (desc) data.comboBanner.desc = desc.value;
      if (f1) data.comboBanner.formula1 = f1.value;
      if (f2) data.comboBanner.formula2 = f2.value;
      if (f3) data.comboBanner.formula3 = f3.value;
      if (img && img.value) data.comboBanner.image = img.value;
      if (sliderX && sliderY) data.comboBanner.imagePosition = `${sliderX.value}% ${sliderY.value}%`;
    }

    // Políticas
    if (this.activeTab === "policies") {
      if (!data.retouchPolicies) data.retouchPolicies = {};
      const title = document.getElementById("custPolicyTitle");
      const itemsArea = document.getElementById("custPolicyConditions");
      const note = document.getElementById("custPolicyNote");

      if (title) data.retouchPolicies.title = title.value;
      if (itemsArea) {
        data.retouchPolicies.conditions = itemsArea.value.split("\n").map(l => l.trim()).filter(Boolean);
      }
      if (note) data.retouchPolicies.note = note.value;
    }

    // Estudio
    if (this.activeTab === "studio") {
      const nameInput = document.getElementById("custStudioName");
      if (nameInput) {
        data.studio.name = nameInput.value;
        data.studio.subtitle = document.getElementById("custStudioSubtitle").value;
        data.studio.welcomeLead = document.getElementById("custStudioWelcomeLead").value;
        data.studio.whatsapp = document.getElementById("custStudioWhatsapp").value;
        data.studio.whatsappDisplay = document.getElementById("custStudioWhatsappDisplay").value;
        data.studio.instagram = document.getElementById("custStudioInstagram").value;
        data.studio.tiktok = document.getElementById("custStudioTiktok").value;
        data.studio.location = document.getElementById("custStudioLocation").value;
      }
    }

    // Precios
    if (this.activeTab === "prices") {
      const priceInputs = document.querySelectorAll("[data-service-price-id]");
      priceInputs.forEach(input => {
        const sId = input.dataset.servicePriceId;
        const s = data.services.find(x => x.id === sId);
        if (s) {
          s.price = input.value.trim() === "" ? null : (parseInt(input.value, 10) || 0);
        }
      });
    }

    // Lookbook
    if (this.activeTab === "lookbook") {
      if (!data.lookbook) data.lookbook = {};
      const cTitle = document.getElementById("custLbCoverTitle");
      const cSub = document.getElementById("custLbCoverSubtitle");
      const cYear = document.getElementById("custLbCoverYear");
      const wLead = document.getElementById("custLbWelcomeLead");
      const wText = document.getElementById("custLbWelcomeText");
      const lTitle = document.getElementById("custLbLiftingTitle");
      const lQuote = document.getElementById("custLbLiftingQuote");
      const eTitle = document.getElementById("custLbExtTitle");
      const eQuote = document.getElementById("custLbExtQuote");
      const cjTitle = document.getElementById("custLbCejasTitle");
      const cjQuote = document.getElementById("custLbCejasQuote");

      if (cTitle) data.lookbook.coverTitle = cTitle.value.trim();
      if (cSub) data.lookbook.coverSubtitle = cSub.value.trim();
      if (cYear) data.lookbook.coverYear = cYear.value.trim();
      if (wLead) data.lookbook.welcomeLead = wLead.value.trim();
      if (wText) data.lookbook.welcomeText = wText.value.trim();
      if (lTitle) data.lookbook.liftingDividerTitle = lTitle.value.trim();
      if (lQuote) data.lookbook.liftingDividerQuote = lQuote.value.trim();
      if (eTitle) data.lookbook.extensionsDividerTitle = eTitle.value.trim();
      if (eQuote) data.lookbook.extensionsDividerQuote = eQuote.value.trim();
      if (cjTitle) data.lookbook.cejasDividerTitle = cjTitle.value.trim();
      if (cjQuote) data.lookbook.cejasDividerQuote = cjQuote.value.trim();
    }
  }

  renderTabContent() {
    const container = document.getElementById("customizerBodyContainer");
    if (!container) return;

    const data = this.state.data;

    // =========================================================================
    // 0. PESTAÑA: TODAS LAS FOTOS DEL SITIO (GESTOR MAESTRO GLOBAL)
    // =========================================================================
    if (this.activeTab === "all_photos") {
      const allPhotos = this.getAllSitePhotos();
      
      let filteredPhotos = allPhotos;
      if (this.photoCategoryFilter !== "all") {
        filteredPhotos = allPhotos.filter(p => p.category === this.photoCategoryFilter);
      }

      let cardsHtml = "";
      filteredPhotos.forEach((photoItem, idx) => {
        const { posX, posY } = this.parsePosition(photoItem.pos);

        cardsHtml += `
          <div class="photo-master-card" id="photoCard_${photoItem.key}">
            <div class="photo-master-preview">
              <img id="masterImg_${photoItem.key}" src="${photoItem.src}" alt="${photoItem.title}" style="object-position: ${posX}% ${posY}%;">
              <span class="photo-master-tag">${photoItem.sectionLabel}</span>
              <span class="photo-master-pos-badge" id="masterPosBadge_${photoItem.key}">${posX}% ${posY}%</span>
            </div>

            <div>
              <div class="photo-master-title" title="${photoItem.title}">${photoItem.title}</div>
            </div>

            <div style="display: flex; gap: 6px;">
              <label class="btn btn-primary btn-xs" style="flex: 1; cursor: pointer; text-align: center; font-size: 10px; padding: 4px 6px;">
                📁 Cambiar Foto
                <input type="file" accept="image/*" style="display: none;" onchange="catalogCustomizer.handleMasterPhotoUpload('${photoItem.key}', event)">
              </label>
              <button class="btn btn-outline btn-xs" style="font-size: 10px; padding: 4px 6px;" onclick="catalogCustomizer.setMasterPosPreset('${photoItem.key}', 50, 50)" title="Centrar">
                🎯 Centro
              </button>
            </div>

            <div class="photo-master-slider-row">
              <div class="photo-slider-label">
                <span>Vertical (↕)</span>
                <span id="masterValY_${photoItem.key}">${posY}%</span>
              </div>
              <input type="range" class="photo-master-range" id="masterSliderY_${photoItem.key}" min="0" max="100" value="${posY}" oninput="catalogCustomizer.handleMasterSliderChange('${photoItem.key}')">
            </div>

            <div class="photo-master-slider-row">
              <div class="photo-slider-label">
                <span>Horizontal (↔)</span>
                <span id="masterValX_${photoItem.key}">${posX}%</span>
              </div>
              <input type="range" class="photo-master-range" id="masterSliderX_${photoItem.key}" min="0" max="100" value="${posX}" oninput="catalogCustomizer.handleMasterSliderChange('${photoItem.key}')">
            </div>
          </div>
        `;
      });

      container.innerHTML = `
        <div class="all-photos-container">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="font-size: 18px; margin-bottom: 2px;">🖼️ Gestor Maestro de Todas las Fotos (${allPhotos.length} fotos)</h3>
              <p style="font-size: 12px; color: var(--color-muted);">Cambia cualquier foto de la página y ajusta su encuadre en tiempo real. Todas las pestañas están reunidas aquí.</p>
            </div>
          </div>

          <!-- Filtros de categoría para las fotos -->
          <div class="photo-filters-bar">
            <button class="subfilter-chip ${this.photoCategoryFilter === 'all' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('all')">✨ Todas (${allPhotos.length})</button>
            <button class="subfilter-chip ${this.photoCategoryFilter === 'banners' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('banners')">🌟 Portada & Banners</button>
            <button class="subfilter-chip ${this.photoCategoryFilter === 'lifting' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('lifting')">✨ Lifting & Resultados</button>
            <button class="subfilter-chip ${this.photoCategoryFilter === 'extensiones' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('extensiones')">👁️ Extensiones</button>
            <button class="subfilter-chip ${this.photoCategoryFilter === 'cejas' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('cejas')">🪄 Cejas</button>
            <button class="subfilter-chip ${this.photoCategoryFilter === 'hydralips' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('hydralips')">💋 HydraLips</button>
            <button class="subfilter-chip ${this.photoCategoryFilter === 'experiencias' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('experiencias')">⭐ Experiencias</button>
            <button class="subfilter-chip ${this.photoCategoryFilter === 'cuidados' ? 'active' : ''}" onclick="catalogCustomizer.setPhotoFilter('cuidados')">🌿 Cuidados</button>
          </div>

          <!-- Cuadrícula maestra de fotos -->
          <div class="photo-master-grid">
            ${cardsHtml}
          </div>
        </div>
      `;

    // =========================================================================
    // 1. PESTAÑA: SERVICIOS & TEXTOS
    // =========================================================================
    } else if (this.activeTab === "services") {
      const currentService = data.services.find(s => s.id === this.selectedServiceId) || data.services[0];
      this.selectedServiceId = currentService.id;
      const { posX, posY } = this.parsePosition(currentService.imagePosition);

      let serviceOptions = data.categories.map(cat => {
        const catServices = data.services.filter(s => s.categoryId === cat.id);
        if (catServices.length === 0) return "";
        return `
          <optgroup label="${cat.icon || '•'} ${cat.name}">
            ${catServices.map(s => `
              <option value="${s.id}" ${s.id === this.selectedServiceId ? 'selected' : ''}>
                ${s.name} ${s.price ? `($${s.price.toLocaleString('es-CO')})` : '(Dinámico)'}
              </option>
            `).join("")}
          </optgroup>
        `;
      }).join("");

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary); display: block; margin-bottom: 6px;">
              Selecciona el Servicio a Modificar:
            </label>
            <select id="custServiceSelector" style="width: 100%; padding: 12px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); font-family: var(--font-sans); font-size: 14px; font-weight: 600; background: var(--color-paper-card); color: var(--color-ink);">
              ${serviceOptions}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
            <!-- FOTO PRINCIPAL -->
            <div style="background: var(--color-paper-alt); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--color-primary); display: block; margin-bottom: 8px;">
                📸 Foto Principal del Servicio
              </span>

              <div style="position: relative; width: 100%; height: 230px; border-radius: var(--radius-sm); overflow: hidden; background: #000; box-shadow: var(--shadow-sm); margin-bottom: 14px;">
                <img id="custLiveImgPreview" src="${currentService.image || 'assets/img/page_img_1.jpeg'}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; object-position: ${posX}% ${posY}%;">
                <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; padding: 3px 8px; border-radius: var(--radius-full); font-size: 10px; font-family: monospace;" id="custPosIndicator">
                  X: ${posX}% | Y: ${posY}%
                </div>
              </div>

              <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                <label class="btn btn-primary btn-sm" style="flex: 1; cursor: pointer; text-align: center;">
                  📁 Subir Foto de tu PC
                  <input type="file" id="custUploadImgInput" accept="image/*" style="display: none;">
                </label>
                <button class="btn btn-outline btn-sm" id="custResetPosBtn" style="color: var(--color-ink); border-color: var(--color-hairline);" title="Restablecer posición al centro">
                  🎯 Centrar
                </button>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                  <span style="font-weight: 600;">Encuadre Vertical (Arriba ↕ Abajo)</span>
                  <span id="custValY" style="color: var(--color-primary); font-weight: 700;">${posY}%</span>
                </div>
                <input type="range" id="custSliderY" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
              </div>

              <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                  <span style="font-weight: 600;">Encuadre Horizontal (Izq ↔ Der)</span>
                  <span id="custValX" style="color: var(--color-primary); font-weight: 700;">${posX}%</span>
                </div>
                <input type="range" id="custSliderX" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
              </div>
            </div>

            <!-- TEXTOS Y PRECIO -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Nombre del Servicio</label>
                <input type="text" id="custServiceName" value="${currentService.name}" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-sans); font-size: 13px;">
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Subtítulo / Efecto</label>
                <input type="text" id="custServiceSubtitle" value="${currentService.subtitle || ''}" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 13px;">
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Descripción Detallada</label>
                <textarea id="custServiceDesc" rows="4" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-sans); font-size: 12.5px; line-height: 1.5; resize: vertical;">${currentService.desc}</textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Duración estimada</label>
                  <input type="text" id="custServiceDuration" value="${currentService.duration || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 12px;">
                </div>
                <div>
                  <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Tiempo de cita</label>
                  <input type="text" id="custServiceTime" value="${currentService.appointmentTime || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 12px;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Precio ($ COP)</label>
                  <input type="number" id="custServicePrice" step="1000" value="${currentService.price !== null && currentService.price !== undefined ? currentService.price : ''}" placeholder="Dinámico" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 13px; font-weight: 600;">
                </div>
                <div>
                  <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Ruta / URL Imagen</label>
                  <input type="text" id="custServiceImgUrl" value="${currentService.image || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 11px; font-family: monospace;">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const serviceSelect = container.querySelector("#custServiceSelector");
      if (serviceSelect) {
        serviceSelect.addEventListener("change", (e) => {
          this.saveCurrentInputsInMemory();
          this.selectedServiceId = e.target.value;
          this.renderTabContent();
        });
      }

      const nameInput = container.querySelector("#custServiceName");
      const subInput = container.querySelector("#custServiceSubtitle");
      const descInput = container.querySelector("#custServiceDesc");
      const durInput = container.querySelector("#custServiceDuration");
      const timeInput = container.querySelector("#custServiceTime");
      const priceInput = container.querySelector("#custServicePrice");
      const imgUrlInput = container.querySelector("#custServiceImgUrl");

      if (nameInput) nameInput.addEventListener("input", (e) => { currentService.name = e.target.value; });
      if (subInput) subInput.addEventListener("input", (e) => { currentService.subtitle = e.target.value; });
      if (descInput) descInput.addEventListener("input", (e) => { currentService.desc = e.target.value; });
      if (durInput) durInput.addEventListener("input", (e) => { currentService.duration = e.target.value; });
      if (timeInput) timeInput.addEventListener("input", (e) => { currentService.appointmentTime = e.target.value; });
      if (priceInput) priceInput.addEventListener("input", (e) => { currentService.price = e.target.value.trim() === "" ? null : parseInt(e.target.value, 10); });

      const imgPreview = container.querySelector("#custLiveImgPreview");
      const sliderX = container.querySelector("#custSliderX");
      const sliderY = container.querySelector("#custSliderY");
      const valX = container.querySelector("#custValX");
      const valY = container.querySelector("#custValY");
      const posIndicator = container.querySelector("#custPosIndicator");
      const uploadInput = container.querySelector("#custUploadImgInput");

      const updatePositionLive = () => {
        const x = sliderX.value;
        const y = sliderY.value;
        valX.textContent = `${x}%`;
        valY.textContent = `${y}%`;
        posIndicator.textContent = `X: ${x}% | Y: ${y}%`;
        imgPreview.style.objectPosition = `${x}% ${y}%`;
        currentService.imagePosition = `${x}% ${y}%`;
      };

      if (sliderX && sliderY) {
        sliderX.addEventListener("input", updatePositionLive);
        sliderY.addEventListener("input", updatePositionLive);
      }

      if (uploadInput) {
        uploadInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            this.compressImageFile(file, 800, 0.65, (optimizedBase64) => {
              imgPreview.src = optimizedBase64;
              if (imgUrlInput) imgUrlInput.value = optimizedBase64;
              currentService.image = optimizedBase64;
              if (window.catalogApp) window.catalogApp.showToast("✓ Foto cargada y optimizada");
            });
          }
        });
      }

      if (imgUrlInput) {
        imgUrlInput.addEventListener("input", (e) => {
          imgPreview.src = e.target.value;
          currentService.image = e.target.value;
        });
      }

      const resetBtn = container.querySelector("#custResetPosBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          this.setFramePreset(50, 50);
        });
      }

    // =========================================================================
    // 2. PESTAÑA: PORTADA & HERO
    // =========================================================================
    } else if (this.activeTab === "hero") {
      const hero = data.hero || DEFAULT_CATALOG_DATA.hero;
      const { posX, posY } = this.parsePosition(hero.imagePosition);

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
            <div style="background: var(--color-paper-alt); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--color-primary); display: block; margin-bottom: 8px;">
                🌟 Fotografía de Portada (Hero)
              </span>

              <div style="position: relative; width: 100%; height: 230px; border-radius: var(--radius-sm); overflow: hidden; background: #000; box-shadow: var(--shadow-sm); margin-bottom: 14px;">
                <img id="custLiveHeroImgPreview" src="${hero.image || 'assets/img/page_img_1.jpeg'}" alt="Preview Hero" style="width: 100%; height: 100%; object-fit: cover; object-position: ${posX}% ${posY}%;">
                <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; padding: 3px 8px; border-radius: var(--radius-full); font-size: 10px; font-family: monospace;" id="custHeroPosIndicator">
                  X: ${posX}% | Y: ${posY}%
                </div>
              </div>

              <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                <label class="btn btn-primary btn-sm" style="flex: 1; cursor: pointer; text-align: center;">
                  📁 Subir Foto de Portada
                  <input type="file" id="custUploadHeroImgInput" accept="image/*" style="display: none;">
                </label>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                  <span style="font-weight: 600;">Encuadre Vertical (Arriba ↕ Abajo)</span>
                  <span id="custHeroValY" style="color: var(--color-primary); font-weight: 700;">${posY}%</span>
                </div>
                <input type="range" id="custHeroSliderY" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
              </div>

              <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                  <span style="font-weight: 600;">Encuadre Horizontal (Izq ↔ Der)</span>
                  <span id="custHeroValX" style="color: var(--color-primary); font-weight: 700;">${posX}%</span>
                </div>
                <input type="range" id="custHeroSliderX" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Etiqueta / Badge Superior</label>
                <input type="text" id="custHeroBadge" value="${hero.badge || 'Colección 2026 · Studio Experience'}" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 13px;">
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título Principal de Portada</label>
                <input type="text" id="custHeroTitle" value="${hero.title || data.studio.name}" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 14px; font-weight: 600;">
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Texto de Bienvenida Destacado</label>
                <textarea id="custHeroLead" rows="4" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-serif); font-size: 13px; line-height: 1.5;">${hero.welcomeLead || data.studio.welcomeLead}</textarea>
              </div>
            </div>
          </div>
        </div>
      `;

      const heroImgPreview = container.querySelector("#custLiveHeroImgPreview");
      const heroSliderX = container.querySelector("#custHeroSliderX");
      const heroSliderY = container.querySelector("#custHeroSliderY");
      const heroValX = container.querySelector("#custHeroValX");
      const heroValY = container.querySelector("#custHeroValY");
      const heroPosInd = container.querySelector("#custHeroPosIndicator");
      const heroUpload = container.querySelector("#custUploadHeroImgInput");

      const updateHeroPosLive = () => {
        const x = heroSliderX.value;
        const y = heroSliderY.value;
        heroValX.textContent = `${x}%`;
        heroValY.textContent = `${y}%`;
        heroPosInd.textContent = `X: ${x}% | Y: ${y}%`;
        heroImgPreview.style.objectPosition = `${x}% ${y}%`;
        if (!data.hero) data.hero = {};
        data.hero.imagePosition = `${x}% ${y}%`;
      };

      if (heroSliderX && heroSliderY) {
        heroSliderX.addEventListener("input", updateHeroPosLive);
        heroSliderY.addEventListener("input", updateHeroPosLive);
      }

      if (heroUpload) {
        heroUpload.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            this.compressImageFile(file, 800, 0.65, (optimizedBase64) => {
              heroImgPreview.src = optimizedBase64;
              if (!data.hero) data.hero = {};
              data.hero.image = optimizedBase64;
              if (window.catalogApp) window.catalogApp.showToast("✓ Foto de portada actualizada");
            });
          }
        });
      }

    // =========================================================================
    // 3. PESTAÑA: BANNER EXPERIENCIAS
    // =========================================================================
    } else if (this.activeTab === "combo") {
      const combo = data.comboBanner || DEFAULT_CATALOG_DATA.comboBanner;
      const { posX, posY } = this.parsePosition(combo.imagePosition);

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
            <div style="background: var(--color-paper-alt); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--color-primary); display: block; margin-bottom: 8px;">
                ⭐ Fotografía del Banner de Beneficios
              </span>

              <div style="position: relative; width: 100%; height: 230px; border-radius: var(--radius-sm); overflow: hidden; background: #000; box-shadow: var(--shadow-sm); margin-bottom: 14px;">
                <img id="custLiveComboImgPreview" src="${combo.image || 'assets/img/completo2.png'}" alt="Preview Combo" style="width: 100%; height: 100%; object-fit: cover; object-position: ${posX}% ${posY}%;">
                <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; padding: 3px 8px; border-radius: var(--radius-full); font-size: 10px; font-family: monospace;" id="custComboPosIndicator">
                  X: ${posX}% | Y: ${posY}%
                </div>
              </div>

              <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                <label class="btn btn-primary btn-sm" style="flex: 1; cursor: pointer; text-align: center;">
                  📁 Subir Foto del Banner
                  <input type="file" id="custUploadComboImgInput" accept="image/*" style="display: none;">
                </label>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                  <span style="font-weight: 600;">Encuadre Vertical (Arriba ↕ Abajo)</span>
                  <span id="custComboValY" style="color: var(--color-primary); font-weight: 700;">${posY}%</span>
                </div>
                <input type="range" id="custComboSliderY" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
              </div>

              <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                  <span style="font-weight: 600;">Encuadre Horizontal (Izq ↔ Der)</span>
                  <span id="custComboValX" style="color: var(--color-primary); font-weight: 700;">${posX}%</span>
                </div>
                <input type="range" id="custComboSliderX" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título del Banner</label>
                <input type="text" id="custComboTitle" value="${combo.title || 'Experiencias & Rituales'}" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-weight: 600;">
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Descripción Explicativa</label>
                <textarea id="custComboDesc" rows="2" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 12px;">${combo.desc || ''}</textarea>
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Fórmula 1 (Mirada Perfecta)</label>
                <input type="text" id="custComboF1" value="${combo.formula1 || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 12px;">
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Fórmula 2 (Esencia Sublime)</label>
                <input type="text" id="custComboF2" value="${combo.formula2 || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 12px;">
              </div>

              <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Fórmula 3 (Ritual Glow)</label>
                <input type="text" id="custComboF3" value="${combo.formula3 || ''}" style="width: 100%; padding: 8px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 12px;">
              </div>
            </div>
          </div>
        </div>
      `;

      const comboImgPreview = container.querySelector("#custLiveComboImgPreview");
      const comboSliderX = container.querySelector("#custComboSliderX");
      const comboSliderY = container.querySelector("#custComboSliderY");
      const comboValX = container.querySelector("#custComboValX");
      const comboValY = container.querySelector("#custComboValY");
      const comboPosInd = container.querySelector("#custComboPosIndicator");
      const comboUpload = container.querySelector("#custUploadComboImgInput");

      const updateComboPosLive = () => {
        const x = comboSliderX.value;
        const y = comboSliderY.value;
        comboValX.textContent = `${x}%`;
        comboValY.textContent = `${y}%`;
        comboPosInd.textContent = `X: ${x}% | Y: ${y}%`;
        comboImgPreview.style.objectPosition = `${x}% ${y}%`;
        if (!data.comboBanner) data.comboBanner = {};
        data.comboBanner.imagePosition = `${x}% ${y}%`;
      };

      if (comboSliderX && comboSliderY) {
        comboSliderX.addEventListener("input", updateComboPosLive);
        comboSliderY.addEventListener("input", updateComboPosLive);
      }

      if (comboUpload) {
        comboUpload.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            this.compressImageFile(file, 800, 0.65, (optimizedBase64) => {
              comboImgPreview.src = optimizedBase64;
              if (!data.comboBanner) data.comboBanner = {};
              data.comboBanner.image = optimizedBase64;
              if (window.catalogApp) window.catalogApp.showToast("✓ Foto del banner actualizada");
            });
          }
        });
      }

    // =========================================================================
    // 4. PESTAÑA: POLÍTICAS DE RETOQUE
    // =========================================================================
    } else if (this.activeTab === "policies") {
      const pol = data.retouchPolicies || DEFAULT_CATALOG_DATA.retouchPolicies;
      const conditionsText = (pol.conditions || []).join("\n");

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título de la Sección de Políticas</label>
            <input type="text" id="custPolicyTitle" value="${pol.title || 'Políticas de Retoque de Extensiones'}" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 14px; font-weight: 600;">
          </div>

          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Condiciones para Retoque (Una por línea)</label>
            <textarea id="custPolicyConditions" rows="6" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-sans); font-size: 13px; line-height: 1.6;">${conditionsText}</textarea>
          </div>

          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Nota Aclaratoria al Pie</label>
            <textarea id="custPolicyNote" rows="3" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-size: 12.5px; line-height: 1.5;">${pol.note || ''}</textarea>
          </div>
        </div>
      `;

    // =========================================================================
    // 5. PESTAÑA: ESTUDIO & REDES
    // =========================================================================
    } else if (this.activeTab === "studio") {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Nombre del Estudio / Marca</label>
            <input type="text" id="custStudioName" value="${data.studio.name}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-sans);">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Subtítulo / Especialidades</label>
            <input type="text" id="custStudioSubtitle" value="${data.studio.subtitle}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-sans);">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Número de WhatsApp (con código de país ej: 573006279079)</label>
            <input type="text" id="custStudioWhatsapp" value="${data.studio.whatsapp}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-sans);">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">WhatsApp Visible (Formato visual)</label>
            <input type="text" id="custStudioWhatsappDisplay" value="${data.studio.whatsappDisplay}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px; font-family: var(--font-sans);">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Usuario de Instagram</label>
              <input type="text" id="custStudioInstagram" value="${data.studio.instagram}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Usuario de TikTok</label>
              <input type="text" id="custStudioTiktok" value="${data.studio.tiktok}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px;">
            </div>
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Ciudad y Ubicación</label>
            <input type="text" id="custStudioLocation" value="${data.studio.location}" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-hairline); border-radius: var(--radius-sm); margin-top: 4px;">
          </div>
        </div>
      `;

    // =========================================================================
    // 6. PESTAÑA: PRECIOS
    // =========================================================================
    } else if (this.activeTab === "prices") {
      let servicesRows = "";
      data.services.forEach(s => {
        servicesRows += `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-hairline);">
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 13px;">${s.name}</div>
              <div style="font-size: 11px; color: var(--color-muted);">${s.subtitle || s.type || ''}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12px; color: var(--color-muted);">$</span>
              <input type="number" step="1000" data-service-price-id="${s.id}" value="${s.price !== null && s.price !== undefined ? s.price : ''}" placeholder="Dinámico" style="width: 110px; padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: var(--radius-xs); font-family: var(--font-serif); font-size: 14px; font-weight: 600; text-align: right;">
            </div>
          </div>
        `;
      });

      container.innerHTML = `
        <div>
          <p style="font-size: 12px; color: var(--color-muted); margin-bottom: 14px;">Modifica los precios en pesos colombianos (COP) para todos los servicios de forma masiva:</p>
          <div style="display: flex; flex-direction: column;">
            ${servicesRows}
          </div>
        </div>
      `;

    // =========================================================================
    // 7. PESTAÑA: COLORES & TEMA
    // =========================================================================
    } else if (this.activeTab === "theme") {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <p style="font-size: 12px; color: var(--color-muted);">Selecciona la paleta de color y estilo visual que mejor se adapte a la temporada:</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="pillar-card" style="cursor: pointer; border: 2px solid ${!document.documentElement.dataset.theme ? 'var(--color-primary)' : 'var(--color-hairline)'};" onclick="catalogCustomizer.applyTheme('')">
              <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <div style="width: 20px; height: 20px; background: #9c7e54; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #f4f1ea; border: 1px solid #ddd; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #1b1a16; border-radius: 50%;"></div>
              </div>
              <div style="font-weight: 700; font-size: 13px;">Bronce Clásico (Original)</div>
              <div style="font-size: 11px; color: var(--color-muted);">Elegante tono editorial bronce con fondo cálido.</div>
            </div>

            <div class="pillar-card" style="cursor: pointer; border: 2px solid ${document.documentElement.dataset.theme === 'rose-gold' ? 'var(--color-primary)' : 'var(--color-hairline)'};" onclick="catalogCustomizer.applyTheme('rose-gold')">
              <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <div style="width: 20px; height: 20px; background: #b76e79; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #faf5f6; border: 1px solid #ddd; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #2b1f21; border-radius: 50%;"></div>
              </div>
              <div style="font-weight: 700; font-size: 13px;">Rose Gold & Blush</div>
              <div style="font-size: 11px; color: var(--color-muted);">Toques rosados y femeninos de alta estética.</div>
            </div>

            <div class="pillar-card" style="cursor: pointer; border: 2px solid ${document.documentElement.dataset.theme === 'nude-minimal' ? 'var(--color-primary)' : 'var(--color-hairline)'};" onclick="catalogCustomizer.applyTheme('nude-minimal')">
              <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <div style="width: 20px; height: 20px; background: #85705e; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #fdfbf7; border: 1px solid #ddd; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #1c1a17; border-radius: 50%;"></div>
              </div>
              <div style="font-weight: 700; font-size: 13px;">Nude Minimalista</div>
              <div style="font-size: 11px; color: var(--color-muted);">Neutros suaves, limpios y modernos.</div>
            </div>

            <div class="pillar-card" style="cursor: pointer; border: 2px solid ${document.documentElement.dataset.theme === 'dark-luxury' ? 'var(--color-primary)' : 'var(--color-hairline)'};" onclick="catalogCustomizer.applyTheme('dark-luxury')">
              <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <div style="width: 20px; height: 20px; background: #181613; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #9c7e54; border-radius: 50%;"></div>
                <div style="width: 20px; height: 20px; background: #efe8da; border-radius: 50%;"></div>
              </div>
              <div style="font-weight: 700; font-size: 13px;">Dark Luxury Studio</div>
              <div style="font-size: 11px; color: var(--color-muted);">Modo oscuro de alto impacto y contraste.</div>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // 8. PESTAÑA: REVISTA (LOOKBOOK)
    // =========================================================================
    } else if (this.activeTab === "lookbook") {
      const lb = data.lookbook || DEFAULT_CATALOG_DATA.lookbook || {};
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="background: var(--color-paper-alt); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
            <h3 style="font-size: 14px; color: var(--color-primary); margin-bottom: 10px;">🌟 Portada & Bienvenida de la Revista</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Título Portada</label>
                <input type="text" id="custLbCoverTitle" value="${lb.coverTitle || (data.studio ? data.studio.name : '')}" style="width: 100%; padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Subtítulo</label>
                <input type="text" id="custLbCoverSubtitle" value="${lb.coverSubtitle || 'Catálogo Colección 2026'}" style="width: 100%; padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Año</label>
                <input type="text" id="custLbCoverYear" value="${lb.coverYear || '2026'}" style="width: 100%; padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: 4px;">
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Manifiesto de Bienvenida (Pág. 2)</label>
              <textarea id="custLbWelcomeLead" rows="2" style="width: 100%; padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: 4px; font-family: inherit;">${lb.welcomeLead || (data.studio ? data.studio.welcomeLead : '')}</textarea>
            </div>
            <div>
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Mensaje de Confianza</label>
              <textarea id="custLbWelcomeText" rows="2" style="width: 100%; padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: 4px; font-family: inherit;">${lb.welcomeText || (data.studio ? data.studio.welcomeText : '')}</textarea>
            </div>
          </div>

          <div style="background: var(--color-paper-alt); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--color-hairline);">
            <h3 style="font-size: 14px; color: var(--color-primary); margin-bottom: 10px;">📑 Separadores Editoriales (Dividers)</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div><label style="font-size: 10px; font-weight: 700;">Título Lifting</label><input type="text" id="custLbLiftingTitle" value="${lb.liftingDividerTitle || 'Lifting'}" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;"></div>
              <div><label style="font-size: 10px; font-weight: 700;">Frase Lifting</label><input type="text" id="custLbLiftingQuote" value="${lb.liftingDividerQuote || 'El servicio insignia'}" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;"></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div><label style="font-size: 10px; font-weight: 700;">Título Extensiones</label><input type="text" id="custLbExtTitle" value="${lb.extensionsDividerTitle || 'Extensiones'}" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;"></div>
              <div><label style="font-size: 10px; font-weight: 700;">Frase Extensiones</label><input type="text" id="custLbExtQuote" value="${lb.extensionsDividerQuote || 'La mirada que siempre imaginaste.'}" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;"></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><label style="font-size: 10px; font-weight: 700;">Título Cejas</label><input type="text" id="custLbCejasTitle" value="${lb.cejasDividerTitle || 'Cejas'}" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;"></div>
              <div><label style="font-size: 10px; font-weight: 700;">Frase Cejas</label><input type="text" id="custLbCejasQuote" value="${lb.cejasDividerQuote || 'Un diseño pensado para tu rostro.'}" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;"></div>
            </div>
          </div>
        </div>
      `;

    // =========================================================================
    // 9. PESTAÑA: RESPALDO JSON
    // =========================================================================
    } else if (this.activeTab === "backup") {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <p style="font-size: 13px; color: var(--color-ink-light);">
            Descarga una copia completa de toda la web (fotos, encuadres, textos, políticas, datos de contacto y precios) o restaura una copia guardada en un solo clic:
          </p>

          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button class="btn btn-primary btn-sm" onclick="catalogCustomizer.exportJSON()">📥 Descargar Todo el Catálogo (.json)</button>
            <label class="btn btn-outline btn-sm" style="color: var(--color-ink); border-color: var(--color-hairline); cursor: pointer;">
              📤 Restaurar Catálogo (.json)
              <input type="file" id="custImportFileInput" accept=".json" style="display: none;" onchange="catalogCustomizer.importJSON(event)">
            </label>
          </div>
        </div>
      `;
    }
  }

  setPhotoFilter(categoryKey) {
    this.photoCategoryFilter = categoryKey;
    this.renderTabContent();
  }

  handleMasterSliderChange(photoKey) {
    const sliderX = document.getElementById(`masterSliderX_${photoKey}`);
    const sliderY = document.getElementById(`masterSliderY_${photoKey}`);
    const img = document.getElementById(`masterImg_${photoKey}`);
    const valX = document.getElementById(`masterValX_${photoKey}`);
    const valY = document.getElementById(`masterValY_${photoKey}`);
    const badge = document.getElementById(`masterPosBadge_${photoKey}`);

    if (sliderX && sliderY && img) {
      const x = sliderX.value;
      const y = sliderY.value;
      if (valX) valX.textContent = `${x}%`;
      if (valY) valY.textContent = `${y}%`;
      if (badge) badge.textContent = `${x}% ${y}%`;
      img.style.objectPosition = `${x}% ${y}%`;

      // Actualizar en el objeto de datos correspondiente
      const allPhotos = this.getAllSitePhotos();
      const item = allPhotos.find(p => p.key === photoKey);
      if (item) {
        if (item.type === "hero") {
          if (!this.state.data.hero) this.state.data.hero = {};
          this.state.data.hero.imagePosition = `${x}% ${y}%`;
        } else if (item.type === "combo_banner") {
          if (!this.state.data.comboBanner) this.state.data.comboBanner = {};
          this.state.data.comboBanner.imagePosition = `${x}% ${y}%`;
        } else if (item.targetObj) {
          const posProp = item.posProp || "imagePosition";
          item.targetObj[posProp] = `${x}% ${y}%`;
        }
      }
    }
  }

  handleMasterPhotoUpload(photoKey, event) {
    const file = event.target.files[0];
    if (!file) return;

    this.compressImageFile(file, 800, 0.65, (optimizedBase64) => {
      const img = document.getElementById(`masterImg_${photoKey}`);
      if (img) img.src = optimizedBase64;

      const allPhotos = this.getAllSitePhotos();
      const item = allPhotos.find(p => p.key === photoKey);
      if (item) {
        if (item.type === "hero") {
          if (!this.state.data.hero) this.state.data.hero = {};
          this.state.data.hero.image = optimizedBase64;
        } else if (item.type === "combo_banner") {
          if (!this.state.data.comboBanner) this.state.data.comboBanner = {};
          this.state.data.comboBanner.image = optimizedBase64;
        } else if (item.targetObj) {
          const prop = item.prop || "image";
          item.targetObj[prop] = optimizedBase64;
        }
        if (window.catalogApp) window.catalogApp.showToast(`✓ Foto de "${item.title}" actualizada`);
      }
    });
  }

  setMasterPosPreset(photoKey, x, y) {
    const sliderX = document.getElementById(`masterSliderX_${photoKey}`);
    const sliderY = document.getElementById(`masterSliderY_${photoKey}`);
    if (sliderX && sliderY) {
      sliderX.value = x;
      sliderY.value = y;
      this.handleMasterSliderChange(photoKey);
    }
  }

  setFramePreset(x, y) {
    const sliderX = document.getElementById("custSliderX");
    const sliderY = document.getElementById("custSliderY");
    const valX = document.getElementById("custValX");
    const valY = document.getElementById("custValY");
    const posIndicator = document.getElementById("custPosIndicator");
    const imgPreview = document.getElementById("custLiveImgPreview");

    if (sliderX && sliderY && imgPreview) {
      sliderX.value = x;
      sliderY.value = y;
      if (valX) valX.textContent = `${x}%`;
      if (valY) valY.textContent = `${y}%`;
      if (posIndicator) posIndicator.textContent = `X: ${x}% | Y: ${y}%`;
      imgPreview.style.objectPosition = `${x}% ${y}%`;

      const currentService = this.state.data.services.find(s => s.id === this.selectedServiceId);
      if (currentService) {
        currentService.imagePosition = `${x}% ${y}%`;
      }
    }
  }

  compressImageFile(file, maxDimension = 800, quality = 0.65, callback) {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        const maxDim = maxDimension || 800;
        const q = quality || 0.65;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", q);
        callback(dataUrl);
      };
      img.onerror = () => {
        alert("No se pudo procesar la imagen seleccionada.");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async applyTheme(themeKey) {
    if (themeKey) {
      document.documentElement.dataset.theme = themeKey;
      localStorage.setItem("danna_mesa_theme", themeKey);
      if (!this.state.data.theme) this.state.data.theme = {};
      this.state.data.theme.active = themeKey;
    } else {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem("danna_mesa_theme");
      if (!this.state.data.theme) this.state.data.theme = {};
      this.state.data.theme.active = "default";
    }
    this.renderTabContent();
    try {
      await this.state.saveToCloud(this.state.data);
    } catch (e) {}
    if (window.catalogApp) window.catalogApp.showToast("Paleta de color actualizada y sincronizada");
  }

  async saveCurrentChanges() {
    this.saveCurrentInputsInMemory();
    const saveBtn = document.getElementById("btnSaveCustomizer");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "⏳ Guardando en la nube...";
    }
    try {
      await this.state.saveToCloud(this.state.data);
      this.closeModal();
      if (window.catalogApp) {
        window.catalogApp.showToast("✓ ¡Todos los cambios guardados y sincronizados en la nube!");
      }
    } catch (err) {
      this.closeModal();
      if (window.catalogApp) {
        window.catalogApp.showToast("✓ Cambios aplicados");
      }
      console.warn("Cloud save notice:", err);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "✓ Guardar Todos los Cambios";
      }
    }
  }

  exportJSON() {
    this.saveCurrentInputsInMemory();
    const jsonStr = JSON.stringify(this.state.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danna_mesa_catalogo_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && importedData.studio && importedData.services) {
          this.state.saveData(importedData);
          this.renderTabContent();
          if (window.catalogApp) window.catalogApp.showToast("✓ Configuración importada con éxito");
        } else {
          alert("El archivo JSON no tiene el formato correcto.");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

// Cargar tema guardado al inicio
const savedTheme = localStorage.getItem("danna_mesa_theme");
if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
}

// Instanciar customizer
document.addEventListener("DOMContentLoaded", () => {
  window.catalogCustomizer = new CatalogCustomizer();
});
