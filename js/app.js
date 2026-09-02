/**
 * Danna Mesa Studio — Interactive Web App Logic
 * Manejo de categorías, filtros, búsqueda, carrito de agendamiento inteligente y WhatsApp.
 */

class CatalogApp {
  constructor() {
    this.state = window.catalogState;
    this.selectedServices = new Set();
    this.activeCategory = "all";
    this.activeSubfilter = "all";
    this.searchQuery = "";
    this.currentView = "app"; // 'app' | 'lookbook'

    this.init();
  }

  /** Gets the default asset image for a specific service */
  getDefServiceImage(serviceId, type = "image") {
    if (typeof DEFAULT_CATALOG_DATA !== "undefined" && Array.isArray(DEFAULT_CATALOG_DATA.services)) {
      const def = DEFAULT_CATALOG_DATA.services.find(s => s.id === serviceId);
      if (def && def[type]) return def[type];
    }
    return "assets/img/page_img_1.jpeg";
  }

  /** Returns a usable image src, falling back if the value is an unresolved overflow ref or empty */
  safeImg(src, fallback = "assets/img/page_img_1.jpeg") {
    if (!src || (typeof src === "string" && src.startsWith("__overflow__:")) || (typeof src === "string" && src.trim() === "")) {
      return fallback;
    }
    return src;
  }

  init() {
    this.bindEvents();
    this.renderHeaderAndHero();
    this.renderCategoryTabs();
    this.renderServices();
    this.initBeforeAfterSliders();
    this.initFaqAccordion();
    this.updateCartUI();

    // Auto-activar vista de revista si viene con hash o query param
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.hash === "#lookbook" || window.location.hash === "#revista" || urlParams.get("view") === "lookbook" || urlParams.get("admin_preview") === "true") {
      this.switchView("lookbook");
    }

    // Escuchar cambios de datos (desde el Customizer o Firestore)
    window.addEventListener("catalogDataChanged", () => {
      this.renderHeaderAndHero();
      this.renderCategoryTabs();
      this.renderServices();
      this.updateCartUI();
    });
  }

  bindEvents() {
    // Alternar entre modo Web App y Modo Revista (Lookbook)
    const btnAppView = document.getElementById("btnViewApp");
    const btnLookbookView = document.getElementById("btnViewLookbook");
    
    if (btnAppView && btnLookbookView) {
      btnAppView.addEventListener("click", () => this.switchView("app"));
      btnLookbookView.addEventListener("click", () => this.switchView("lookbook"));
    }

    // Buscador
    const searchInput = document.getElementById("catalogSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderServices();
      });
    }

    // Modal de Reserva / Carrito
    const openCartBtn = document.getElementById("openCartDrawerBtn");
    const closeCartBtn = document.getElementById("closeCartDrawerBtn");
    const modalOverlay = document.getElementById("bookingDrawerModal");

    if (openCartBtn && modalOverlay) {
      openCartBtn.addEventListener("click", () => this.openCartModal());
    }
    if (closeCartBtn && modalOverlay) {
      closeCartBtn.addEventListener("click", () => this.closeCartModal());
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) this.closeCartModal();
      });
    }

    // Botón enviar WhatsApp
    const sendWhatsAppBtn = document.getElementById("sendWhatsAppBookingBtn");
    if (sendWhatsAppBtn) {
      sendWhatsAppBtn.addEventListener("click", () => this.sendBookingToWhatsApp());
    }

    // Botón abrir Administrador / Customizer
    const openCustomizerBtn = document.getElementById("openCustomizerBtn");
    if (openCustomizerBtn) {
      openCustomizerBtn.addEventListener("click", () => {
        if (window.catalogCustomizer) {
          window.catalogCustomizer.openModal();
        }
      });
    }

    // ==========================================
    // CARRUSEL INTERACTIVO DE CATEGORÍAS (AUTO-SCROLL SUAVE & DRAG)
    // ==========================================
    const navScroll = document.getElementById("categoryNavScroll");
    const prevBtn = document.getElementById("catNavPrevBtn");
    const nextBtn = document.getElementById("catNavNextBtn");
    const slider = document.getElementById("catNavSlider");

    if (navScroll) {
      let isPaused = false;
      let resumeTimeout = null;
      let scrollDirection = 1; // 1: adelante, -1: atrás
      const autoScrollSpeed = 0.45; // Velocidad suave y elegante

      const pauseCarousel = () => {
        isPaused = true;
        if (resumeTimeout) clearTimeout(resumeTimeout);
      };

      const resumeCarousel = () => {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
          isPaused = false;
        }, 2500);
      };

      // Loop de movimiento continuo automático tipo carrusel
      const autoScrollLoop = () => {
        if (!isPaused && navScroll) {
          const maxScroll = navScroll.scrollWidth - navScroll.clientWidth;
          if (maxScroll > 10) {
            if (navScroll.scrollLeft >= maxScroll - 2) {
              scrollDirection = -1;
            } else if (navScroll.scrollLeft <= 2) {
              scrollDirection = 1;
            }
            navScroll.scrollLeft += scrollDirection * autoScrollSpeed;
          }
        }
        requestAnimationFrame(autoScrollLoop);
      };
      requestAnimationFrame(autoScrollLoop);

      // Pausar al pasar el ratón o tocar
      navScroll.addEventListener("mouseenter", pauseCarousel);
      navScroll.addEventListener("mouseleave", resumeCarousel);
      navScroll.addEventListener("touchstart", pauseCarousel, { passive: true });
      navScroll.addEventListener("touchend", resumeCarousel, { passive: true });

      // Botones de flecha
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          pauseCarousel();
          navScroll.scrollBy({ left: -260, behavior: "smooth" });
          resumeCarousel();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          pauseCarousel();
          navScroll.scrollBy({ left: 260, behavior: "smooth" });
          resumeCarousel();
        });
      }

      // Arrastre con ratón (Mouse Drag to Scroll)
      let isDown = false;
      let startX;
      let scrollLeftPos;

      navScroll.addEventListener("mousedown", (e) => {
        isDown = true;
        pauseCarousel();
        navScroll.classList.add("dragging");
        startX = e.pageX - navScroll.offsetLeft;
        scrollLeftPos = navScroll.scrollLeft;
      });

      window.addEventListener("mouseup", () => {
        if (isDown) {
          isDown = false;
          navScroll.classList.remove("dragging");
          resumeCarousel();
        }
      });

      navScroll.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - navScroll.offsetLeft;
        const walk = (x - startX) * 1.5;
        navScroll.scrollLeft = scrollLeftPos - walk;
      });

      // Sincronizar el slider al hacer scroll en las pestañas
      navScroll.addEventListener("scroll", () => {
        const maxScroll = navScroll.scrollWidth - navScroll.clientWidth;
        if (maxScroll > 0 && slider) {
          slider.value = (navScroll.scrollLeft / maxScroll) * 100;
        }
      });

      // Mover pestañas al deslizar la barra
      if (slider) {
        slider.addEventListener("input", (e) => {
          pauseCarousel();
          const maxScroll = navScroll.scrollWidth - navScroll.clientWidth;
          navScroll.scrollLeft = (e.target.value / 100) * maxScroll;
          resumeCarousel();
        });
      }

      // Scroll horizontal suave con la rueda del ratón
      navScroll.addEventListener("wheel", (e) => {
        if (e.deltaY !== 0) {
          pauseCarousel();
          e.preventDefault();
          navScroll.scrollLeft += e.deltaY;
          resumeCarousel();
        }
      }, { passive: false });
    }
  }

  switchView(viewMode) {
    this.currentView = viewMode;
    const appView = document.getElementById("appViewContainer");
    const lookbookView = document.getElementById("lookbookViewContainer");
    const btnApp = document.getElementById("btnViewApp");
    const btnLb = document.getElementById("btnViewLookbook");

    if (viewMode === "lookbook") {
      appView.classList.add("hidden");
      lookbookView.classList.add("active");
      btnApp.classList.remove("active");
      btnLb.classList.add("active");
      if (window.lookbookManager) {
        window.lookbookManager.render();
      }
    } else {
      appView.classList.remove("hidden");
      lookbookView.classList.remove("active");
      btnApp.classList.add("active");
      btnLb.classList.remove("active");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  renderHeaderAndHero() {
    const data = this.state.data;
    
    // Header
    const brandName = document.getElementById("headerBrandName");
    const brandSub = document.getElementById("headerBrandSubtitle");
    if (brandName) brandName.textContent = data.studio.name;
    if (brandSub) brandSub.textContent = data.studio.subtitle;

    // Hero
    const heroMedia = document.getElementById("heroMediaBox");
    const heroBadge = document.getElementById("heroBadgeText");
    const heroTitle = document.getElementById("heroStudioTitle");
    const heroLead = document.getElementById("heroWelcomeLead");

    const heroData = data.hero || DEFAULT_CATALOG_DATA.hero;
    if (heroMedia) {
      if (heroData.image) heroMedia.style.backgroundImage = `url('${this.safeImg(heroData.image, DEFAULT_CATALOG_DATA.hero.image)}')`;
      if (heroData.imagePosition) heroMedia.style.backgroundPosition = heroData.imagePosition;
    }
    if (heroBadge) heroBadge.textContent = heroData.badge || `${data.studio.tagline || 'Studio Experience'}`;
    if (heroTitle) heroTitle.textContent = heroData.title || data.studio.name;
    if (heroLead) heroLead.textContent = `"${heroData.welcomeLead || data.studio.welcomeLead}"`;

    // Highlight Combo Banner
    const comboData = data.comboBanner || DEFAULT_CATALOG_DATA.comboBanner;
    const comboBadge = document.getElementById("comboBadgePill");
    const comboTitle = document.getElementById("comboHighlightTitle");
    const comboDesc = document.getElementById("comboHighlightDesc");
    const comboFormula = document.getElementById("comboFormulaBox");
    const comboImg = document.getElementById("comboBannerImg");

    if (comboBadge) comboBadge.textContent = comboData.badge || "⭐ Beneficio Exclusivo";
    if (comboTitle) comboTitle.textContent = comboData.title || "Experiencias & Rituales";
    if (comboDesc) comboDesc.textContent = comboData.desc || "";
    if (comboFormula && (comboData.formula1 || comboData.formula2 || comboData.formula3)) {
      comboFormula.innerHTML = `
        ${comboData.formula1 ? `<strong>Mirada Perfecta:</strong> ${comboData.formula1.replace('Mirada Perfecta:', '')}<br>` : ''}
        ${comboData.formula2 ? `<strong>Esencia Sublime:</strong> ${comboData.formula2.replace('Esencia Sublime:', '')}<br>` : ''}
        ${comboData.formula3 ? `<strong>Ritual Glow:</strong> ${comboData.formula3.replace('Ritual Glow:', '')}` : ''}
      `;
    }
    if (comboImg && comboData.image) {
      comboImg.src = this.safeImg(comboData.image, DEFAULT_CATALOG_DATA.comboBanner.image);
      if (comboData.imagePosition) comboImg.style.objectPosition = comboData.imagePosition;
    }

    // Políticas de Retoque
    const policiesData = data.retouchPolicies || DEFAULT_CATALOG_DATA.retouchPolicies;
    const policyTitle = document.getElementById("policiesTitleText");
    const policyList = document.getElementById("policiesListItems");
    const policyNote = document.getElementById("policiesNoteText");

    if (policyTitle && policiesData.title) policyTitle.textContent = policiesData.title;
    if (policyList && policiesData.conditions) {
      policyList.innerHTML = policiesData.conditions.map(c => `<li>${c}</li>`).join("");
    }
    if (policyNote && policiesData.note) policyNote.textContent = `* ${policiesData.note}`;

    // Garantía & Salud Ocular
    const so = (data.lookbook && data.lookbook.saludOcular) ? data.lookbook.saludOcular : (typeof DEFAULT_CATALOG_DATA !== 'undefined' && DEFAULT_CATALOG_DATA.lookbook ? DEFAULT_CATALOG_DATA.lookbook.saludOcular : null);
    const garantiaSection = document.getElementById("garantia");
    if (garantiaSection && so) {
      const soTitle = garantiaSection.querySelector(".section-main-title");
      const soDesc = garantiaSection.querySelector(".section-desc-text");
      const cards = garantiaSection.querySelectorAll(".trust-pillar-card");
      if (soTitle && so.title) soTitle.textContent = so.title;
      if (soDesc && so.subtitle) soDesc.textContent = so.subtitle;
      if (cards && cards.length >= 3) {
        if (so.p1Title && cards[0].querySelector(".trust-pillar-title")) cards[0].querySelector(".trust-pillar-title").textContent = so.p1Title;
        if (so.p1Desc && cards[0].querySelector(".trust-pillar-desc")) cards[0].querySelector(".trust-pillar-desc").textContent = so.p1Desc;
        if (so.p2Title && cards[1].querySelector(".trust-pillar-title")) cards[1].querySelector(".trust-pillar-title").textContent = so.p2Title;
        if (so.p2Desc && cards[1].querySelector(".trust-pillar-desc")) cards[1].querySelector(".trust-pillar-desc").textContent = so.p2Desc;
        if (so.p3Title && cards[2].querySelector(".trust-pillar-title")) cards[2].querySelector(".trust-pillar-title").textContent = so.p3Title;
        if (so.p3Desc && cards[2].querySelector(".trust-pillar-desc")) cards[2].querySelector(".trust-pillar-desc").textContent = so.p3Desc;
      }
    }

    // Preguntas Frecuentes (FAQ)
    const faqData = (data.lookbook && data.lookbook.faq) ? data.lookbook.faq : (typeof DEFAULT_CATALOG_DATA !== 'undefined' && DEFAULT_CATALOG_DATA.lookbook ? DEFAULT_CATALOG_DATA.lookbook.faq : null);
    const faqContainer = document.getElementById("faqAccordion");
    if (faqContainer && faqData && Array.isArray(faqData.items)) {
      faqContainer.innerHTML = faqData.items.map(item => `
        <div class="faq-item">
          <button class="faq-question-btn" type="button">
            <span>${item.q}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-answer-content">
            <p>${item.a}</p>
          </div>
        </div>
      `).join("");
      this.initFaqAccordion();
    }

    // Footer
    const footerBrand = document.getElementById("footerBrandName");
    const footerLocation = document.getElementById("footerLocationText");
    const igLink = document.getElementById("footerInstagramLink");
    const ttLink = document.getElementById("footerTiktokLink");
    const waLink = document.getElementById("footerWhatsappLink");

    if (footerBrand) footerBrand.textContent = `${data.studio.name} Studio`;
    if (footerLocation) footerLocation.textContent = `${data.studio.location} · Colección 2026`;
    if (igLink) igLink.href = `https://instagram.com/${data.studio.instagram}`;
    if (ttLink) ttLink.href = `https://tiktok.com/@${data.studio.tiktok}`;
    if (waLink) waLink.href = `https://wa.me/${data.studio.whatsapp}`;
  }

  renderCategoryTabs() {
    const navContainer = document.getElementById("categoryNavScroll");
    if (!navContainer) return;

    const data = this.state.data;
    let html = `
      <button class="cat-tab-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        ✨ Todos los servicios <span class="badge-count">${data.services.length}</span>
      </button>
    `;

    data.categories.forEach(cat => {
      const count = data.services.filter(s => s.categoryId === cat.id).length;
      html += `
        <button class="cat-tab-btn ${this.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
          ${cat.icon} ${cat.name} <span class="badge-count">${count}</span>
        </button>
      `;
    });

    navContainer.innerHTML = html;

    // Eventos de click optimizados en categorías
    navContainer.querySelectorAll(".cat-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetCat = btn.dataset.cat;
        if (this.activeCategory === targetCat) return;

        this.activeCategory = targetCat;
        this.activeSubfilter = "all";

        navContainer.querySelectorAll(".cat-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.cat === targetCat));
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        this.renderSubfilters();
        this.renderServices();
      });
    });

    // Sub-filtros para Extensiones si corresponde
    this.renderSubfilters();
  }

  renderSubfilters() {
    const subfilterContainer = document.getElementById("subfilterBar");
    if (!subfilterContainer) return;

    if (this.activeCategory === "extensiones" || this.activeCategory === "all") {
      subfilterContainer.style.display = "flex";
      subfilterContainer.innerHTML = `
        <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-primary); margin-right: 4px;">Filtro Pestañas:</span>
        <button class="subfilter-chip ${this.activeSubfilter === 'all' ? 'active' : ''}" data-sub="all">Todos los efectos</button>
        <button class="subfilter-chip ${this.activeSubfilter === 'sutiles' ? 'active' : ''}" data-sub="sutiles">Sutiles (Naturales)</button>
        <button class="subfilter-chip ${this.activeSubfilter === 'expresivas' ? 'active' : ''}" data-sub="expresivas">Expresivas (Húmedo/Aura)</button>
        <button class="subfilter-chip ${this.activeSubfilter === 'volumen' ? 'active' : ''}" data-sub="volumen">Volumen (Bloom, Egipcio, 5D)</button>
        <button class="subfilter-chip ${this.activeSubfilter === 'artisticos' ? 'active' : ''}" data-sub="artisticos">Artísticos (Wispy, Foxy, Bratz)</button>
      `;

      subfilterContainer.querySelectorAll(".subfilter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          const targetSub = chip.dataset.sub;
          if (this.activeSubfilter === targetSub) return;

          this.activeSubfilter = targetSub;
          subfilterContainer.querySelectorAll(".subfilter-chip").forEach(c => c.classList.toggle("active", c.dataset.sub === targetSub));
          this.renderServices();
        });
      });
    } else {
      subfilterContainer.style.display = "none";
    }
  }

  renderServices() {
    const gridContainer = document.getElementById("servicesCardsGrid");
    if (!gridContainer) return;

    // Controlar visibilidad de las Políticas de Retoque según la pestaña activa
    const policiesSection = document.querySelector(".policies-box");
    if (policiesSection) {
      if (this.activeCategory === "lifting" || this.activeCategory === "cejas" || this.activeCategory === "hydralips" || this.activeCategory === "cuidados") {
        policiesSection.style.display = "none";
      } else {
        policiesSection.style.display = "block";
      }
    }

    const data = this.state.data;
    let filtered = data.services;

    // Filtrar por categoría
    if (this.activeCategory !== "all") {
      filtered = filtered.filter(s => s.categoryId === this.activeCategory);
    }

    // Filtrar por subfiltro (grupo de extensiones)
    if (this.activeSubfilter !== "all") {
      filtered = filtered.filter(s => s.group === this.activeSubfilter);
    }

    // Filtrar por búsqueda
    if (this.searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(this.searchQuery) ||
        s.desc.toLowerCase().includes(this.searchQuery) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(this.searchQuery)))
      );
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-muted);">
          <p style="font-size: 32px; margin-bottom: 8px;">🔍</p>
          <p style="font-size: 16px; font-weight: 600; font-family: var(--font-serif);">No encontramos servicios que coincidan con tu búsqueda.</p>
          <button class="btn btn-outline btn-sm" style="margin-top: 14px;" onclick="catalogApp.resetFilters()">Restablecer filtros</button>
        </div>
      `;
      return;
    }

    let html = "";
    filtered.forEach(service => {
      const isSelected = this.selectedServices.has(service.id);
      
      // Etiquetas elegantes sin superposición
      let tagsHtml = "";
      if (Array.isArray(service.tags) && service.tags.length > 0) {
        const displayTags = service.tags.slice(0, 2);
        tagsHtml = `
          <div class="service-badges-container">
            ${displayTags.map(t => `<span class="service-badge-tag">${t}</span>`).join("")}
          </div>
        `;
      }

      // Desglose de retoques si aplica
      let retouchHtml = "";
      if (service.retouchAvailable) {
        const singleRetouchIds = ["ext-clasicas-naturales", "ext-efecto-pestanina", "ext-efecto-humedo", "ext-efecto-aura"];
        const isSingle = singleRetouchIds.includes(service.id);

        if (isSingle) {
          const retPrice = service.retouch15_21 || service.retouch15_17;
          if (retPrice) {
            retouchHtml = `
              <div class="retouch-box">
                <div class="retouch-title">✨ Tarifas de Retoque</div>
                <div class="retouch-row"><span>Retoque (15 a 21 días)</span><b>${this.state.formatMoney(retPrice)}</b></div>
              </div>
            `;
          }
        } else {
          const ret17 = service.retouch15_17 || service.retouch15_21;
          const ret21 = service.retouch18_21;
          if (ret17 || ret21) {
            retouchHtml = `
              <div class="retouch-box">
                <div class="retouch-title">✨ Tarifas de Retoque</div>
                ${ret17 ? `<div class="retouch-row"><span>Retoque (15 a 17 días)</span><b>${this.state.formatMoney(ret17)}</b></div>` : ''}
                ${ret21 ? `<div class="retouch-row"><span>Retoque (18 a 21 días)</span><b>${this.state.formatMoney(ret21)}</b></div>` : ''}
              </div>
            `;
          }
        }
      }

      // Slider Antes/Después si tiene ambas fotos (Lifting, HydraLips)
      let mediaHtml = "";
      const defMainImg = this.getDefServiceImage(service.id, "image");
      const defBeforeImg = this.getDefServiceImage(service.id, "beforeImage");
      const defAfterImg = this.getDefServiceImage(service.id, "afterImage");

      if (service.beforeImage && service.afterImage) {
        mediaHtml = `
          <div class="before-after-container" data-service-id="${service.id}">
            <div class="ba-image-wrapper">
              <img src="${this.safeImg(service.beforeImage, defBeforeImg)}" alt="Antes - ${service.name}" loading="lazy" style="object-position: ${service.imagePosition || 'center 35%'};">
            </div>
            <div class="ba-after-layer">
              <img src="${this.safeImg(service.afterImage, defAfterImg)}" alt="Después - ${service.name}" loading="lazy" style="object-position: ${service.imagePosition || 'center 35%'};">
            </div>
            <div class="ba-handle">⬌</div>
            <span class="ba-badge before">Antes</span>
            <span class="ba-badge after">Después</span>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="service-card-media">
            <img src="${this.safeImg(service.image, defMainImg)}" alt="${service.name}" loading="lazy" style="object-position: ${service.imagePosition || 'center center'};">
            ${tagsHtml}
          </div>
        `;
      }

      // Beneficios de HydraLips o combos
      let benefitsHtml = "";
      if (service.benefits && service.benefits.length > 0) {
        benefitsHtml = `
          <ul style="list-style: none; font-size: 12px; margin: 10px 0; color: var(--color-ink-light);">
            ${service.benefits.map(b => `<li style="margin-bottom: 4px;">✓ ${b}</li>`).join("")}
          </ul>
        `;
      }

      // Manejo de precio según sea valor fijo o según pestañas elegidas
      let priceDisplayHtml = "";
      if (service.customPriceLabel || service.price === null || service.price === undefined || isNaN(Number(service.price))) {
        priceDisplayHtml = `<span style="font-size: 15px; font-weight: 600; color: var(--color-primary); font-family: var(--font-sans); line-height: 1.2;">${service.customPriceLabel || 'Según pestañas elegidas'}</span>`;
      } else {
        priceDisplayHtml = `
          ${service.individualPrice ? `<span class="price-original">${this.state.formatMoney(service.individualPrice)}</span>` : ''}
          ${this.state.formatMoney(service.price)}
        `;
      }

      // Galería interactiva si el servicio tiene fotos adicionales de clientas
      let galleryThumbsHtml = "";
      if (service.gallery && service.gallery.length > 0) {
        const isBa = service.beforeImage && service.afterImage;
        const mainLabel = isBa ? 'Antes/Desp.' : 'Principal';
        galleryThumbsHtml = `
          <div class="service-gallery-thumbs" title="Ver resultados en diferentes clientas">
            <button class="gallery-thumb-btn active" data-card-thumb="${service.id}" data-target-type="${isBa ? 'ba' : 'main'}" data-src="${this.safeImg(service.image, defMainImg)}" data-pos="${service.imagePosition || 'center 30%'}" data-title="${service.name} (Principal)" title="${isBa ? 'Ver Antes y Después' : 'Foto Principal'}">
              <img src="${isBa ? this.safeImg(service.afterImage, defAfterImg) : this.safeImg(service.image, defMainImg)}" alt="${service.name}">
              <span class="thumb-label">${mainLabel}</span>
            </button>
            ${service.gallery.map((g, idx) => `
              <button class="gallery-thumb-btn" data-card-thumb="${service.id}" data-target-type="gallery" data-src="${this.safeImg(g.src, defMainImg)}" data-pos="${g.position || 'center 30%'}" data-title="${service.name} — ${g.title || `Clienta 0${idx + 1}`}${g.subtitle ? ': ' + g.subtitle : ''}" title="${g.title || `Clienta 0${idx + 1}`}">
                <img src="${this.safeImg(g.src, defMainImg)}" alt="${g.title || `Clienta 0${idx + 1}`}">
                <span class="thumb-label">${g.title || `Clienta 0${idx + 1}`}</span>
              </button>
            `).join("")}
          </div>
        `;
      }

      html += `
        <article class="service-card" data-id="${service.id}">
          <div class="service-card-media-host" id="mediaHost_${service.id}">
            ${mediaHtml}
          </div>
          <div class="service-card-body">
            <span class="service-card-kick">${service.subtitle || service.type || ''}</span>
            <h3 class="service-card-title">${service.name}</h3>
            <p class="service-card-desc">${service.desc}</p>
            ${benefitsHtml}
            
            <div class="service-specs-row">
              <div class="spec-item">
                <span class="spec-label">Duración</span>
                <span class="spec-value">${service.duration || 'Variable'}</span>
              </div>
              <div class="spec-item" style="text-align: right;">
                <span class="spec-label">Tiempo de cita</span>
                <span class="spec-value">${service.appointmentTime || '60 min'}</span>
              </div>
            </div>

            ${retouchHtml}
            ${galleryThumbsHtml}

            <div class="service-card-footer" style="margin-top: 14px;">
              <div class="service-price-block">
                <span class="price-label">Valor</span>
                <div class="price-main-val">
                  ${priceDisplayHtml}
                </div>
              </div>

              <button class="btn-add-cart ${isSelected ? 'selected' : ''}" data-service-id="${service.id}">
                ${isSelected ? '✓ Seleccionado' : '+ Añadir a mi cita'}
              </button>
            </div>
          </div>
        </article>
      `;
    });

    // Si estamos en la categoría de Lifting, renderizar la sección de Galería de Resultados Reales
    if (this.activeCategory === "lifting" || (filtered.some(s => s.id === "lifting-coreano") && !this.searchQuery)) {
      const liftingService = data.services.find(s => s.id === "lifting-coreano");
      if (liftingService && liftingService.gallery && liftingService.gallery.length > 0) {
        html += `
          <div class="lifting-showcase-section" style="grid-column: 1 / -1;">
            <div class="lifting-showcase-header">
              <span class="section-kick">✨ Galería Exclusiva</span>
              <h3 class="section-main-title" style="font-size: 26px;">Resultados Reales de Lifting Coreano</h3>
              <p class="section-desc-text" style="font-size: 13px;">
                Observa cómo se adapta la curvatura y definición a diferentes tipos de pestañas naturales. Toca o haz clic en cualquier fotografía para verla ampliada en alta resolución.
              </p>
            </div>
            
            <div class="lifting-showcase-grid">
              ${liftingService.gallery.map(g => `
                <div class="result-photo-card" data-lightbox-src="${g.src}" data-lightbox-caption="Lifting Coreano — ${g.title}: ${g.subtitle}">
                  <div class="result-photo-media">
                    <img src="${g.src}" alt="${g.title}" loading="lazy" style="object-position: ${g.position || 'center 30%'};">
                    <span class="result-photo-tag">${g.title}</span>
                    <div class="result-photo-zoom-icon">🔍</div>
                  </div>
                  <div class="result-photo-body">
                    <div class="result-photo-subtitle">${g.subtitle}</div>
                    <div class="result-photo-desc">${g.desc}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }
    }

    gridContainer.innerHTML = html;

    // Asignar eventos a los botones de "Añadir a mi cita"
    gridContainer.querySelectorAll(".btn-add-cart").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const sId = e.currentTarget.dataset.serviceId;
        this.toggleServiceSelection(sId);
      });
    });

    // Asignar eventos a las miniaturas de galería dentro de la tarjeta
    gridContainer.querySelectorAll("[data-card-thumb]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const sId = btn.dataset.cardThumb;
        const type = btn.dataset.targetType;
        const host = document.getElementById(`mediaHost_${sId}`);
        const service = this.state.getServiceById(sId);
        if (!host || !service) return;

        // Marcar botón activo
        const parentCard = btn.closest(".service-card");
        if (parentCard) {
          parentCard.querySelectorAll("[data-card-thumb]").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        }

        const defMainImg = this.getDefServiceImage(service.id, "image");
        const defBeforeImg = this.getDefServiceImage(service.id, "beforeImage");
        const defAfterImg = this.getDefServiceImage(service.id, "afterImage");

        if (type === "ba" && service.beforeImage && service.afterImage) {
          host.innerHTML = `
            <div class="before-after-container" data-service-id="${service.id}">
              <div class="ba-image-wrapper">
                <img src="${this.safeImg(service.beforeImage, defBeforeImg)}" alt="Antes - ${service.name}" style="object-position: ${service.imagePosition || 'center 35%'};">
              </div>
              <div class="ba-after-layer">
                <img src="${this.safeImg(service.afterImage, defAfterImg)}" alt="Después - ${service.name}" style="object-position: ${service.imagePosition || 'center 35%'};">
              </div>
              <div class="ba-handle">⬌</div>
              <span class="ba-badge before">Antes</span>
              <span class="ba-badge after">Después</span>
            </div>
          `;
          this.initBeforeAfterSliders();
        } else if (type === "main") {
          host.innerHTML = `
            <div class="service-card-media" data-lightbox-src="${this.safeImg(service.image, defMainImg)}" data-lightbox-caption="${service.name} (Principal)" style="cursor: pointer;">
              <img src="${this.safeImg(service.image, defMainImg)}" alt="${service.name}" style="object-position: ${service.imagePosition || 'center center'};">
              <div class="service-badges-container">
                <span class="service-badge-tag">${service.badge || service.type || 'Principal'}</span>
              </div>
              <div class="result-photo-zoom-icon" style="opacity: 1; transform: scale(1);">🔍</div>
            </div>
          `;
          this.initLightbox();
        } else {
          const src = btn.dataset.src;
          const pos = btn.dataset.pos || "center center";
          host.innerHTML = `
            <div class="service-card-media" data-lightbox-src="${src}" data-lightbox-caption="${btn.dataset.title || service.name}" style="cursor: pointer;">
              <img src="${src}" alt="${service.name}" style="object-position: ${pos};">
              <div class="service-badges-container">
                <span class="service-badge-tag">${btn.getAttribute("title") || "Evidencia Real"}</span>
              </div>
              <div class="result-photo-zoom-icon" style="opacity: 1; transform: scale(1);">🔍</div>
            </div>
          `;
          this.initLightbox();
        }
      });
    });

    this.initBeforeAfterSliders();
    this.initLightbox();
  }

  resetFilters() {
    this.activeCategory = "all";
    this.activeSubfilter = "all";
    this.searchQuery = "";
    const searchInput = document.getElementById("catalogSearchInput");
    if (searchInput) searchInput.value = "";
    this.renderCategoryTabs();
    this.renderServices();
  }

  initBeforeAfterSliders() {
    document.querySelectorAll(".before-after-container").forEach(container => {
      const afterLayer = container.querySelector(".ba-after-layer");
      const handle = container.querySelector(".ba-handle");
      if (!afterLayer || !handle) return;

      let isDragging = false;

      const updatePosition = (clientX) => {
        const rect = container.getBoundingClientRect();
        let posX = clientX - rect.left;
        posX = Math.max(0, Math.min(posX, rect.width));
        const percentage = (posX / rect.width) * 100;

        afterLayer.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updatePosition(clientX);
      };

      const stopDrag = () => { isDragging = false; };

      container.addEventListener("mousedown", (e) => {
        isDragging = true;
        updatePosition(e.clientX);
      });

      container.addEventListener("touchstart", (e) => {
        isDragging = true;
        updatePosition(e.touches[0].clientX);
      });

      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchend", stopDrag);
    });
  }

  initLightbox() {
    let modal = document.getElementById("imageLightboxModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "imageLightboxModal";
      modal.className = "lightbox-modal";
      modal.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close-btn" id="closeLightboxBtn">✕</button>
          <img id="lightboxModalImg" src="" alt="Resultado Ampliado">
          <div class="lightbox-caption" id="lightboxModalCaption"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#closeLightboxBtn").addEventListener("click", () => {
        modal.classList.remove("open");
        document.body.style.overflow = "";
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    }

    // Asignar eventos a las fotos con lightbox
    document.querySelectorAll("[data-lightbox-src]").forEach(el => {
      el.addEventListener("click", () => {
        const src = el.dataset.lightboxSrc;
        const caption = el.dataset.lightboxCaption || "";
        const img = document.getElementById("lightboxModalImg");
        const cap = document.getElementById("lightboxModalCaption");
        if (img) img.src = src;
        if (cap) cap.textContent = caption;
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
  }

  initFaqAccordion() {
    const faqContainer = document.getElementById("faqAccordion");
    if (!faqContainer) return;
    faqContainer.querySelectorAll(".faq-item").forEach(item => {
      const btn = item.querySelector(".faq-question-btn");
      if (btn) {
        btn.addEventListener("click", () => {
          const isOpen = item.classList.contains("active");
          faqContainer.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));
          if (!isOpen) item.classList.add("active");
        });
      }
    });
  }

  toggleServiceSelection(serviceId) {
    if (serviceId === 'cejas-diseno-henna' && !this.state.getServiceById('cejas-diseno-henna')) {
      serviceId = 'cejas-henna';
    } else if (serviceId === 'cejas-henna' && !this.state.getServiceById('cejas-henna')) {
      serviceId = 'cejas-diseno-henna';
    }

    const isSelected = !this.selectedServices.has(serviceId);
    if (isSelected) {
      this.selectedServices.add(serviceId);
      this.showToast("¡Servicio añadido a tu cita!");
    } else {
      this.selectedServices.delete(serviceId);
      this.showToast("Servicio eliminado de tu cita");
    }

    // Actualización instantánea (0ms de latencia) en el botón correspondiente
    const card = document.querySelector(`.service-card[data-id="${serviceId}"]`);
    if (card) {
      const btn = card.querySelector(".btn-add-cart");
      if (btn) {
        btn.classList.toggle("selected", isSelected);
        btn.textContent = isSelected ? "✓ Seleccionado" : "+ Añadir a mi cita";
      }
    }

    this.updateCartUI();
    this.renderCartModalContent();
  }

  removeService(serviceId) {
    this.selectedServices.delete(serviceId);
    
    // Actualizar botón en la tarjeta si está visible
    const card = document.querySelector(`.service-card[data-id="${serviceId}"]`);
    if (card) {
      const btn = card.querySelector(".btn-add-cart");
      if (btn) {
        btn.classList.remove("selected");
        btn.textContent = "+ Añadir a mi cita";
      }
    }

    this.updateCartUI();
    this.renderCartModalContent();
  }

  /**
   * Cálculo Inteligente de Combos y Descuentos
   */
  calculateCartSummary() {
    const services = Array.from(this.selectedServices).map(id => this.state.getServiceById(id)).filter(Boolean);
    let subtotal = 0;
    let totalDiscount = 0;
    let appliedCombos = [];

    services.forEach(s => {
      subtotal += s.price || 0;
    });

    // Detectar Reglas de Descuento / Experiencias automáticas:
    const hasExtension = services.some(s => s.categoryId === "extensiones");
    const hasLifting = services.some(s => s.id === "lifting-coreano" || s.categoryId === "lifting");
    const hasHenna = services.some(s => s.id === "cejas-diseno-henna" || s.id === "cejas-henna" || (s.name && s.name.toLowerCase().includes("henna")));
    const hasLaminado = services.some(s => s.id === "cejas-laminado-hd" || s.id.includes("laminado") || (s.name && s.name.toLowerCase().includes("laminado")));
    const hasHydralips = services.some(s => s.id === "hydralips-sesion" || s.categoryId === "hydralips" || (s.name && s.name.toLowerCase().includes("hydralips")));

    // 1. Experiencia Mirada Perfecta (Extensiones + Henna -> Descuento $10.000 COP)
    if (hasExtension && hasHenna && !services.some(s => s.id === "exp-mirada-perfecta")) {
      totalDiscount += 10000;
      appliedCombos.push("Experiencia Mirada Perfecta (-$10.000 COP)");
    }

    // 2. Ritual Glow (Lifting + Laminado -> Descuento $15.000 COP)
    if (hasLifting && hasLaminado && !services.some(s => s.id === "exp-ritual-glow")) {
      totalDiscount += 15000;
      appliedCombos.push("Ritual Glow: Lifting + Laminado (-$15.000 COP)");
    }

    // 3. Experiencia Glow Lips (Extensiones + HydraLips -> Descuento $10.000 COP)
    if (hasExtension && hasHydralips && !services.some(s => s.id === "exp-glow-lips")) {
      totalDiscount += 10000;
      appliedCombos.push("Experiencia Glow Lips (-$10.000 COP)");
    }

    // 4. Experiencia Esencia Sublime (Extensiones + Laminado -> Regalo Hidratante)
    if (hasExtension && hasLaminado && !services.some(s => s.id === "exp-esencia-sublime")) {
      appliedCombos.push("Experiencia Esencia Sublime (¡Hidratante de regalo incluido!)");
    }

    const finalTotal = Math.max(0, subtotal - totalDiscount);

    return {
      services,
      count: services.length,
      subtotal,
      totalDiscount,
      appliedCombos,
      finalTotal
    };
  }

  updateCartUI() {
    const bar = document.getElementById("floatingBookingBar");
    const badgeCount = document.getElementById("floatingCartCount");
    const totalPriceEl = document.getElementById("floatingCartTotal");
    const comboDiscountBadge = document.getElementById("floatingComboDiscount");

    const summary = this.calculateCartSummary();

    if (summary.count > 0) {
      bar.classList.add("visible");
      if (badgeCount) badgeCount.textContent = `${summary.count} ${summary.count === 1 ? 'servicio' : 'servicios'} seleccionados`;
      if (totalPriceEl) totalPriceEl.textContent = this.state.formatMoney(summary.finalTotal);
      
      if (comboDiscountBadge) {
        if (summary.totalDiscount > 0) {
          comboDiscountBadge.style.display = "block";
          comboDiscountBadge.textContent = `Ahorras ${this.state.formatMoney(summary.totalDiscount)} por combo`;
        } else if (summary.appliedCombos.length > 0) {
          comboDiscountBadge.style.display = "block";
          comboDiscountBadge.textContent = `Beneficio combo activo ✨`;
        } else {
          comboDiscountBadge.style.display = "none";
        }
      }
    } else {
      bar.classList.remove("visible");
    }
  }

  openCartModal() {
    const modal = document.getElementById("bookingDrawerModal");
    if (!modal) return;
    this.renderCartModalContent();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  closeCartModal() {
    const modal = document.getElementById("bookingDrawerModal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  renderCartModalContent() {
    const itemsList = document.getElementById("drawerItemsList");
    const discountBox = document.getElementById("drawerDiscountAlert");
    const drawerSubtotal = document.getElementById("drawerSubtotalAmount");
    const drawerDiscount = document.getElementById("drawerDiscountAmount");
    const drawerTotal = document.getElementById("drawerFinalTotalAmount");
    const messagePreview = document.getElementById("whatsappMessagePreview");

    const summary = this.calculateCartSummary();

    if (summary.count === 0) {
      itemsList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--color-muted);">
          <p style="font-size: 28px; margin-bottom: 6px;">🛒</p>
          <p>Aún no has seleccionado ningún servicio.</p>
        </div>
      `;
      if (discountBox) discountBox.style.display = "none";
      if (drawerTotal) drawerTotal.textContent = "$ 0";
      return;
    }

    let itemsHtml = "";
    summary.services.forEach(s => {
      const priceText = (s.price === null || s.price === undefined || isNaN(Number(s.price)))
        ? (s.customPriceLabel || 'Según pestañas elegidas')
        : this.state.formatMoney(s.price);

      itemsHtml += `
        <div class="drawer-item">
          <div>
            <div class="drawer-item-title">${s.name}</div>
            <div class="drawer-item-subtitle">${s.subtitle || s.appointmentTime}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="drawer-item-price" style="font-size: 13px; font-weight: 600; color: var(--color-primary);">${priceText}</div>
            <button class="btn-remove-item" onclick="catalogApp.removeService('${s.id}')" title="Eliminar">✕</button>
          </div>
        </div>
      `;
    });
    itemsList.innerHTML = itemsHtml;

    // Descuentos y combos
    if (summary.appliedCombos.length > 0) {
      discountBox.style.display = "flex";
      discountBox.innerHTML = `
        <span>🎁</span>
        <div>
          <strong>¡Beneficios de Experiencia Aplicados!</strong><br>
          ${summary.appliedCombos.map(c => `• ${c}`).join("<br>")}
        </div>
      `;
    } else {
      discountBox.style.display = "none";
    }

    // Sugerencia inteligente de Combo / Upsell
    const upsellBox = document.getElementById("cartUpsellBox");
    if (upsellBox) {
      const hasExtensionOrLifting = summary.services.some(s => s.categoryId === "extensiones" || s.categoryId === "lifting");
      const hasHenna = summary.services.some(s => s.id === "cejas-diseno-henna" || s.id === "cejas-henna");
      if (summary.count === 1 && hasExtensionOrLifting && !hasHenna) {
        upsellBox.style.display = "flex";
      } else {
        upsellBox.style.display = "none";
      }
    }

    if (drawerSubtotal) drawerSubtotal.textContent = summary.subtotal > 0 ? this.state.formatMoney(summary.subtotal) : 'Según pestañas elegidas';
    if (drawerDiscount) drawerDiscount.textContent = summary.totalDiscount > 0 ? `-${this.state.formatMoney(summary.totalDiscount)}` : '$ 0';
    if (drawerTotal) drawerTotal.textContent = summary.finalTotal > 0 ? this.state.formatMoney(summary.finalTotal) : (summary.subtotal > 0 ? '$ 0' : 'Según pestañas elegidas');

    // Mensaje de WhatsApp
    if (messagePreview) {
      messagePreview.textContent = this.buildWhatsAppMessage(summary);
    }
  }

  buildWhatsAppMessage(summary) {
    const data = this.state.data;
    let text = `¡Hola Danna! ✨ Me gustaría agendar una cita en *${data.studio.name} Studio*.\n\n`;
    text += `📋 *Servicios solicitados:*\n`;
    
    summary.services.forEach((s, i) => {
      const priceText = (s.price === null || s.price === undefined || isNaN(Number(s.price)))
        ? (s.customPriceLabel || 'Según pestañas elegidas')
        : this.state.formatMoney(s.price);
      text += `${i + 1}. *${s.name}* (${priceText})\n`;
    });

    if (summary.appliedCombos.length > 0) {
      text += `\n🎁 *Experiencias / Beneficios:*\n`;
      summary.appliedCombos.forEach(c => {
        text += `• ${c}\n`;
      });
    }

    const totalText = summary.finalTotal > 0 ? `${this.state.formatMoney(summary.finalTotal)} COP` : 'A cotizar según pestañas';
    text += `\n💰 *Total estimado:* ${totalText}\n`;
    text += `📍 *Ubicación:* ${data.studio.location}\n\n`;
    text += `¿Qué fechas y horarios tienes disponibles? ¡Muchas gracias!`;

    return text;
  }

  sendBookingToWhatsApp() {
    const summary = this.calculateCartSummary();
    if (summary.count === 0) {
      this.showToast("Selecciona al menos un servicio");
      return;
    }

    const message = this.buildWhatsAppMessage(summary);
    const phone = this.state.data.studio.whatsapp.replace(/\D/g, "");
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  }

  showToast(msg) {
    let toast = document.getElementById("appToastNotice");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToastNotice";
      toast.className = "toast-notice";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }
}

// Instanciar aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  window.catalogApp = new CatalogApp();
});
