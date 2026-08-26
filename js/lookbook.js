/**
 * ==========================================================================
 * DANNA MESA STUDIO — LOOKBOOK MAGAZINE RENDERER & VISUAL EDITOR
 * Renderiza y permite editar el 100% de la revista editorial en tiempo real
 * ==========================================================================
 */

class LookbookManager {
  constructor() {
    this.state = window.catalogState;
    this.container = document.getElementById("lookbookStageContainer");
    this.modal = document.getElementById("lookbookPageModal");
    this.isRendered = false;
    this.currentEditingPageKey = null;
    this.currentBase64Photo = null;
    this.pagesDirectory = [];

    this.initModalElements();
    this.bindEvents();

    // Suscribirse a cambios en tiempo real del catálogo
    window.addEventListener("catalogDataChanged", () => {
      this.render();
    });
  }

  initModalElements() {
    this.modalTitle = document.getElementById("lbPageModalTitle");
    this.closeModalBtn = document.getElementById("closeLbPageModalBtn");
    this.cancelModalBtn = document.getElementById("cancelLbPageModalBtn");
    this.form = document.getElementById("lbPageEditForm");
    this.quickSelector = document.getElementById("lbPageQuickSelector");
    this.photoSection = document.getElementById("lbPagePhotoSection");
    this.previewImg = document.getElementById("lbPagePreviewImg");
    this.changePhotoBtn = document.getElementById("lbPageChangePhotoBtn");
    this.fileInput = document.getElementById("lbPageFileInput");
    this.sliderX = document.getElementById("lbPageSliderX");
    this.sliderY = document.getElementById("lbPageSliderY");
    this.posXVal = document.getElementById("lbPagePosXVal");
    this.posYVal = document.getElementById("lbPagePosYVal");
    this.dynamicFields = document.getElementById("lbPageDynamicFields");
    this.toolbarEditBtn = document.getElementById("lookbookEditBtn");
  }

  bindEvents() {
    // Toolbar Edit Button
    if (this.toolbarEditBtn) {
      this.toolbarEditBtn.addEventListener("click", () => {
        this.openPageEditor("page_1");
      });
    }

    // Modal Close
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () => this.closePageEditor());
    }
    if (this.cancelModalBtn) {
      this.cancelModalBtn.addEventListener("click", () => this.closePageEditor());
    }
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.closePageEditor();
      });
    }

    // Quick Page Selector Dropdown
    if (this.quickSelector) {
      this.quickSelector.addEventListener("change", (e) => {
        this.openPageEditor(e.target.value);
      });
    }

    // Sliders X / Y
    if (this.sliderX) {
      this.sliderX.addEventListener("input", (e) => {
        if (this.posXVal) this.posXVal.textContent = e.target.value + "%";
        if (this.previewImg) {
          this.previewImg.style.objectPosition = `${this.sliderX.value}% ${this.sliderY.value}%`;
        }
      });
    }
    if (this.sliderY) {
      this.sliderY.addEventListener("input", (e) => {
        if (this.posYVal) this.posYVal.textContent = e.target.value + "%";
        if (this.previewImg) {
          this.previewImg.style.objectPosition = `${this.sliderX.value}% ${this.sliderY.value}%`;
        }
      });
    }

    // Photo Change
    if (this.changePhotoBtn && this.fileInput) {
      this.changePhotoBtn.addEventListener("click", () => this.fileInput.click());
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.compressImage(e.target.files[0], 1200, 0.85, (base64) => {
            this.currentBase64Photo = base64;
            if (this.previewImg) {
              this.previewImg.src = base64;
            }
          });
        }
      });
    }

    // Save Form
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSavePage(e));
    }
  }

  render() {
    if (!this.container) return;
    const data = this.state.data;
    if (!data) return;

    const lb = data.lookbook || (typeof DEFAULT_CATALOG_DATA !== 'undefined' ? DEFAULT_CATALOG_DATA.lookbook : {}) || {};

    let html = "";
    let pageCounter = 1;
    this.pagesDirectory = [];

    // Helper to register pages
    const registerPage = (key, label, pageNum) => {
      this.pagesDirectory.push({ key, label: `Pág. ${pageNum < 10 ? '0' + pageNum : pageNum} — ${label}`, pageNum });
    };

    // ================= PÁGINA 1: PORTADA =================
    const heroImg = (data.hero && data.hero.image) ? data.hero.image : "assets/img/page_img_1.jpeg";
    const heroPos = (data.hero && data.hero.imagePosition) ? data.hero.imagePosition : "center 20%";
    const coverTitle = lb.coverTitle || (data.studio && data.studio.name) || "Danna Mesa";
    const coverSubtitle = lb.coverSubtitle || "Catálogo Colección 2026";
    const coverYear = lb.coverYear || "2026";
    const studioLoc = (data.studio && data.studio.location) ? data.studio.location : "Armenia · Quindío, Colombia";

    registerPage("page_1", "Portada Principal", pageCounter);
    html += `
      <section class="lb-page lb-cover" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_1')">✏️ Editar Portada</button>
        <div class="bleed">
          <img class="bleed-img" src="${heroImg}" style="object-position: ${heroPos}; width: 100%; height: 100%; object-fit: cover;" alt="Portada ${coverTitle}">
        </div>
        <div class="scrim"></div>
        <div class="lb-run top"><span>Studio Experience</span><span class="tick">·</span><span>Colección ${coverYear}</span></div>
        <div class="brand">
          <h1 class="wm">${coverTitle}</h1>
          <div class="sub"><span class="ln"></span><span>${coverSubtitle}</span></div>
        </div>
        <span class="yr">${coverYear}</span>
        <div class="lb-run bot"><span>${studioLoc}</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA 2: BIENVENIDA =================
    const welcomeKicker = lb.welcomeKicker || "01 · Bienvenida";
    const welcomeTitle = lb.welcomeTitle || "Bienvenida";
    const welcomeLead = lb.welcomeLead || (data.studio && data.studio.welcomeLead) || (data.hero && data.hero.welcomeLead) || "En Danna Mesa Studio entendemos que tu mirada es tu firma más personal.";
    const welcomeText = lb.welcomeText || (data.studio && data.studio.welcomeText) || "Aquí tu cita es solo tuya, tú solo cierra los ojos y confía. Bienvenida.";
    const tagline = (data.studio && data.studio.tagline) ? data.studio.tagline : "Studio Experience";

    registerPage("page_2", "Bienvenida & Manifiesto", pageCounter);
    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_2')">✏️ Editar Bienvenida</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>${welcomeKicker}</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 18%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4em; color: var(--color-primary);">${welcomeKicker}</span>
          <h2 style="font-size: 8.5cqw; margin-top: 1.5cqw;">${welcomeTitle}</h2>
          <div style="height: 1px; background: var(--color-hairline); margin: 3cqw 0;"></div>
          <p style="font-family: var(--font-serif); font-size: 3.2cqw; line-height: 1.35; color: var(--color-ink); max-width: 85%;">
            ${welcomeLead}
          </p>
          <p style="font-size: 2.1cqw; line-height: 1.6; color: var(--color-ink-light); margin-top: 2.5cqw; max-width: 80%;">
            ${welcomeText}
          </p>
          <div style="margin-top: 6cqw; border-top: 2px solid var(--color-primary); padding-top: 1.5cqw; display: inline-block;">
            <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.24em; font-size: 1.8cqw;">${coverTitle}</div>
            <div style="font-size: 1.3cqw; text-transform: uppercase; letter-spacing: 0.3em; color: var(--color-muted);">${tagline}</div>
          </div>
        </div>
        <div class="lb-run bot"><span>Studio Experience</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA 3: STUDIO EXPERIENCE =================
    const studioQuote = lb.studioQuote || (data.studio && data.studio.slogan) || "Tu mirada, nuestro sello.";
    const studioDesc = lb.studioDesc || "Una experiencia creada para resaltar tu esencia natural con la más alta bioseguridad, técnicas avanzadas y atención 100% individualizada.";
    const studioTitle = lb.studioTitle || "Studio Experience";

    registerPage("page_3", "Studio Experience & Especialidad", pageCounter);
    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_3')">✏️ Editar Experiencia</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>02 — ${studioTitle}</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 18%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4em; color: var(--color-primary);">02 · ${coverTitle}</span>
          <h2 style="font-size: 8cqw; margin-top: 1cqw;">${studioTitle}</h2>
          <div style="height: 1px; background: var(--color-hairline); margin: 3cqw 0 4cqw;"></div>
          
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 3.2cqw; line-height: 1.35; color: var(--color-primary); margin-bottom: 2cqw;">
            "${studioQuote}"
          </p>
          <p style="font-size: 2.2cqw; line-height: 1.6; color: var(--color-ink-light); max-width: 85%;">
            ${studioDesc}
          </p>
          
          <div style="margin-top: 5cqw; display: flex; gap: 4cqw; border-top: 1px solid var(--color-hairline); padding-top: 2cqw;">
            <div>
              <span style="font-size: 1.3cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); font-weight: 600; display: block;">Especialidad</span>
              <span style="font-size: 2cqw; font-weight: 500;">Pestañas · Cejas · Labios</span>
            </div>
            <div>
              <span style="font-size: 1.3cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); font-weight: 600; display: block;">Ubicación</span>
              <span style="font-size: 2cqw; font-weight: 500;">${studioLoc}</span>
            </div>
          </div>
        </div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA 4: DIVIDER LIFTING =================
    const liftingDivTitle = lb.liftingDividerTitle || "Lifting";
    const liftingDivQuote = lb.liftingDividerQuote || "El servicio insignia";

    registerPage("page_4", "Separador: Lifting", pageCounter);
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_4')">✏️ Editar Separador</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 1</span></div>
        <div class="big-title">${liftingDivTitle}</div>
        <div class="lead-quote">${liftingDivQuote}</div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA 5 & 6: LIFTING RESULTADOS =================
    const liftingService = data.services.find(s => s.id === "lifting-coreano") || data.services.find(s => s.categoryId === "lifting") || {
      id: "lifting-coreano",
      name: "Lifting de Pestañas Coreano",
      desc: "Curvatura elegante y definición natural.",
      duration: "6 a 8 semanas",
      appointmentTime: "60 - 90 min",
      price: 50000,
      image: "assets/img/page_img_2.jpeg",
      imagePosition: "center 40%",
      gallery: []
    };

    const liftGallery = liftingService.gallery || [
      { src: "assets/img/lifting_1.jpeg", position: "center 30%", title: "Resultado 01", subtitle: "Elevación y Curvatura Natural" },
      { src: "assets/img/lifting_2.jpeg", position: "center 30%", title: "Resultado 02", subtitle: "Definición & Máxima Longitud" },
      { src: "assets/img/lifting_3.jpeg", position: "center 45%", title: "Resultado 03", subtitle: "Intenso y duradero" }
    ];

    registerPage("page_5", "Lifting: Detalle Principal", pageCounter);
    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_5')">✏️ Editar Servicio</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Lifting de Pestañas</span></div>
        <div style="position: absolute; left: 0; top: 0; width: 50%; height: 100%; overflow: hidden;">
          <img src="${liftingService.image || 'assets/img/page_img_2.jpeg'}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${liftingService.imagePosition || 'center 40%'};" alt="${liftingService.name}">
        </div>
        <div style="position: absolute; right: 0; top: 0; width: 50%; height: 100%; padding: 22% 8% 0 8%;">
          <span style="font-size: 1.4cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary); border-top: 1px solid var(--color-primary); padding-top: 1.5cqw; display: block; margin-bottom: 2cqw;">Colección 1 · Lifting</span>
          <h2 style="font-size: 5.5cqw; line-height: 1; margin-bottom: 2.5cqw;">${liftingService.subtitle || 'Resalta lo que ya eres'}</h2>
          <p style="font-size: 2cqw; line-height: 1.6; color: var(--color-ink-light);">${liftingService.desc}</p>
        </div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // Galería de Resultados Lifting
    registerPage("page_6", "Lifting: Resultados Reales", pageCounter);
    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_6')">✏️ Editar Resultados</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>03 — Resultados Reales</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 12%; display: flex; gap: 3.5%;">
          ${liftGallery.slice(0, 3).map((g, idx) => `
            <div style="flex: 1;">
              <div style="aspect-ratio: 3/4; overflow: hidden; position: relative; border-radius: 4px;">
                <img src="${g.src}" style="width:100%; height:100%; object-fit:cover; object-position: ${g.position || 'center 30%'};" alt="${g.title || 'Resultado'}">
              </div>
              <div style="display:flex; justify-content:space-between; font-size:1.3cqw; font-weight:600; text-transform:uppercase; margin-top:0.8cqw;">
                <span style="color:var(--color-primary);">${g.subtitle ? g.subtitle.slice(0, 18) : 'Resultado'}</span>
                <span class="tick">0${idx + 1}</span>
              </div>
            </div>
          `).join("")}
        </div>
        <div style="position: absolute; left: 9%; right: 9%; top: 56%;">
          <h3 style="font-size: 4cqw; margin-bottom: 1cqw;">${liftingService.name}</h3>
          <p style="font-size: 1.8cqw; line-height: 1.55; color: var(--color-ink-light); max-width: 85%;">${liftingService.desc}</p>
        </div>
        <div style="position: absolute; left: 9%; right: 9%; bottom: 10%; display: flex; border-top: 1px solid var(--color-hairline); padding-top: 2cqw;">
          <div style="flex: 1; border-right: 1px solid var(--color-hairline);"><span style="font-size:1.3cqw; text-transform:uppercase; color:var(--color-primary); font-weight:600; display:block;">Duración</span><span style="font-family:var(--font-serif); font-size:2.6cqw;">${liftingService.duration || '6-8 semanas'}</span></div>
          <div style="flex: 1; padding-left: 4cqw; border-right: 1px solid var(--color-hairline);"><span style="font-size:1.3cqw; text-transform:uppercase; color:var(--color-primary); font-weight:600; display:block;">Tiempo</span><span style="font-family:var(--font-serif); font-size:2.6cqw;">${liftingService.appointmentTime || '60-90 min'}</span></div>
          <div style="flex: 1; padding-left: 4cqw;"><span style="font-size:1.3cqw; text-transform:uppercase; color:var(--color-primary); font-weight:600; display:block;">Valor</span><span style="font-family:var(--font-serif); font-size:3cqw; color:var(--color-primary);">${this.state.formatMoney(liftingService.price)}</span></div>
        </div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA 7: DIVIDER EXTENSIONES =================
    const extDivTitle = lb.extensionsDividerTitle || "Extensiones";
    const extDivQuote = lb.extensionsDividerQuote || "La mirada que siempre imaginaste.";

    registerPage("page_7", "Separador: Extensiones", pageCounter);
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_7')">✏️ Editar Separador</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 2</span></div>
        <div class="big-title" style="font-size: 9.5cqw;">${extDivTitle}</div>
        <div class="lead-quote">${extDivQuote}</div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // Extensiones dinámicas en pares
    const extensionServices = data.services.filter(s => s.categoryId === "extensiones");
    for (let i = 0; i < extensionServices.length; i += 2) {
      const s1 = extensionServices[i];
      const s2 = extensionServices[i + 1];
      const pKey = `page_ext_${i}`;

      if (s1 && s2) {
        const topTag = s1.groupTitle || s1.type || "Extensiones";
        registerPage(pKey, `${s1.name} & ${s2.name}`, pageCounter);
        html += this.renderTwoServicesPage(pageCounter, pKey, `Extensiones · ${topTag}`, topTag, "Efectos y densidades personalizados para cada tipo de mirada.", s1, s2);
        pageCounter++;
      } else if (s1 && !s2) {
        registerPage(pKey, `${s1.name}`, pageCounter);
        html += `
          <section class="lb-page" id="lb-page-${pageCounter}">
            <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('${pKey}')">✏️ Editar Página</button>
            <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Extensiones</span></div>
            <div style="position: absolute; left: 9%; right: 9%; top: 12%;">
              <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Colección 2 · Extensiones</span>
              <h2 style="font-size: 7.5cqw; margin-top: 0.8cqw;">${s1.name}</h2>
              <p style="font-size: 1.9cqw; color: var(--color-ink-light); margin-top: 1cqw;">${s1.desc || ''}</p>
              <div style="height: 1px; background: var(--color-hairline); margin: 2.5cqw 0;"></div>
            </div>
            <div class="lb-service-grid" style="top: 36%;">
              <div class="lb-service-row">
                <div class="im" style="width: 42%; aspect-ratio: 4/3;">
                  <img src="${s1.image || 'assets/img/page_img_1.jpeg'}" style="object-position: ${s1.imagePosition || 'center center'};" alt="${s1.name}">
                </div>
                <div class="tx">
                  <div class="n">01</div>
                  <div class="nm">${s1.name}</div>
                  <div class="desc">${s1.desc}</div>
                  <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${s1.duration || '3-5 semanas'}</span></div>
                  <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(s1.price)}</span></div>
                  ${s1.retouch15_21 ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(s1.retouch15_21)}</span></div>` : ''}
                </div>
              </div>
            </div>
            <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
          </section>
        `;
        pageCounter++;
      }
    }

    // ================= PÁGINA POLÍTICAS DE RETOQUE =================
    const policies = data.retouchPolicies || {
      title: "Políticas de retoque",
      subtitle: "Para conservar la armonía y calidad de tus pestañas, los retoques se realizan únicamente hasta los 21 días posteriores a la aplicación.",
      conditions: [
        "Conservar mínimo el 50% de las extensiones aplicadas.",
        "Asistir sin maquillaje en las extensiones.",
        "No haber manipulado las extensiones en casa.",
        "Llegar con las pestañas limpias y libres de aceites."
      ],
      note: "* Si cualquiera de estas condiciones se incumple, el servicio se considerará una aplicación nueva."
    };

    registerPage("page_policies", "Políticas de Retoque", pageCounter);
    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_policies')">✏️ Editar Políticas</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Políticas</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 12%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Condiciones del servicio</span>
          <h2 style="font-size: 7cqw; margin-top: 0.8cqw;">${policies.title}</h2>
          <div style="height: 1px; background: var(--color-hairline); margin: 2.5cqw 0;"></div>
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 2.2cqw; line-height: 1.4; color: var(--color-ink); margin-bottom: 2cqw;">
            ${policies.subtitle}
          </p>
          <ul style="list-style: none; font-size: 2cqw; line-height: 1.5; color: var(--color-ink-light); margin-bottom: 3cqw;">
            ${policies.conditions.map(c => `<li style="margin-bottom: 1cqw;">• ${c}</li>`).join("")}
          </ul>
          <p style="font-size: 1.7cqw; font-style: italic; color: var(--color-muted); border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
            ${policies.note}
          </p>
        </div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA DIVIDER CEJAS =================
    const cejasDivTitle = lb.cejasDividerTitle || "Cejas";
    const cejasDivQuote = lb.cejasDividerQuote || "Un diseño pensado para tu rostro.";

    registerPage("page_cejas_div", "Separador: Cejas", pageCounter);
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_cejas_div')">✏️ Editar Separador</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 3</span></div>
        <div class="big-title">${cejasDivTitle}</div>
        <div class="lead-quote">${cejasDivQuote}</div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // Cejas dinámicas en pares
    const browServices = data.services.filter(s => s.categoryId === "cejas");
    for (let i = 0; i < browServices.length; i += 2) {
      const s1 = browServices[i];
      const s2 = browServices[i + 1];
      const pKey = `page_cejas_${i}`;
      if (s1 && s2) {
        registerPage(pKey, `${s1.name} & ${s2.name}`, pageCounter);
        html += this.renderTwoServicesPage(pageCounter, pKey, "Cejas · Diseño & Definición", "Cejas", "Cada rostro es único. Creamos equilibrio, definición y armonía.", s1, s2);
        pageCounter++;
      } else if (s1) {
        registerPage(pKey, `${s1.name}`, pageCounter);
        html += this.renderTwoServicesPage(pageCounter, pKey, "Cejas · Diseño & Definición", "Cejas", "Cada rostro es único. Creamos equilibrio, definición y armonía.", s1, s1);
        pageCounter++;
      }
    }

    // ================= PÁGINA DIVIDER HYDRALIPS =================
    const lipsDivTitle = lb.hydralipsDividerTitle || "HydraLips";
    const lipsDivQuote = lb.hydralipsDividerQuote || "Tus labios en su mejor versión.";

    registerPage("page_lips_div", "Separador: HydraLips", pageCounter);
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_lips_div')">✏️ Editar Separador</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 4</span></div>
        <div class="big-title" style="font-size: 8.5cqw;">${lipsDivTitle}</div>
        <div class="lead-quote">${lipsDivQuote}</div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // HydraLips
    const hydra = data.services.find(s => s.id === "hydralips-sesion") || data.services.find(s => s.categoryId === "hydralips") || {
      id: "hydralips-sesion",
      name: "HydraLips",
      subtitle: "Hidratación Profunda de Labios",
      desc: "Tratamiento no invasivo para labios jugosos y suaves.",
      duration: "Hasta 15 días por sesión",
      appointmentTime: "30 - 40 min",
      price: 40000,
      image: "assets/img/page_img_19.jpeg",
      imagePosition: "center 45%"
    };

    registerPage("page_hydra", "HydraLips: Detalle", pageCounter);
    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_hydra')">✏️ Editar HydraLips</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>HydraLips</span></div>
        <div style="position: absolute; left: 0; top: 0; width: 48%; height: 100%; overflow: hidden;">
          <img src="${hydra.image || 'assets/img/page_img_19.jpeg'}" style="width:100%; height:100%; object-fit:cover; object-position: ${hydra.imagePosition || 'center 45%'};" alt="HydraLips">
        </div>
        <div style="position: absolute; left: 52%; right: 8%; top: 18%;">
          <span style="font-size: 1.4cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Colección 4 · HydraLips</span>
          <h2 style="font-size: 5cqw; line-height: 1; margin: 1cqw 0 2cqw;">${hydra.subtitle || hydra.name}</h2>
          <p style="font-size: 1.9cqw; line-height: 1.6; color: var(--color-ink-light); margin-bottom: 2cqw;">${hydra.desc}</p>
          <div style="border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
            <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${hydra.duration || '15 días'}</span></div>
            <div class="lb-spec-row"><span class="l">Tiempo</span><span class="v">${hydra.appointmentTime || '30-40 min'}</span></div>
            <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(hydra.price)}</span></div>
          </div>
        </div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA EXPERIENCIAS & COMBOS =================
    const expServices = data.services.filter(s => s.categoryId === "experiencias");
    if (expServices.length > 0) {
      registerPage("page_combos", "Experiencias & Combos", pageCounter);
      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_combos')">✏️ Editar Experiencias</button>
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Experiencias Exclusivas</span></div>
          <div style="position: absolute; left: 9%; right: 9%; top: 12%;">
            <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Colección 5 · Experiencias</span>
            <h2 style="font-size: 6cqw; margin-top: 0.5cqw;">${(data.comboBanner && data.comboBanner.title) ? data.comboBanner.title : 'Experiencias Exclusivas'}</h2>
            <p style="font-size: 1.8cqw; color: var(--color-ink-light);">${(data.comboBanner && data.comboBanner.desc) ? data.comboBanner.desc : 'Combina tus servicios favoritos y disfruta de tarifas preferenciales.'}</p>
            <div style="height: 1px; background: var(--color-hairline); margin: 2cqw 0;"></div>
            
            <div style="display: flex; flex-direction: column; gap: 2.2cqw;">
              ${expServices.slice(0, 3).map(exp => `
                <div style="border-top: 1px solid var(--color-hairline); padding-top: 1.2cqw;">
                  <h3 style="font-size: 2.6cqw;">${exp.name}</h3>
                  <p style="font-style: italic; font-size: 1.7cqw; color: var(--color-primary);">${exp.subtitle || ''}</p>
                  <p style="font-size: 1.7cqw; color: var(--color-ink-light); margin-top: 0.4cqw;">${exp.desc || ''}</p>
                  <div style="font-weight: 700; font-size: 1.8cqw; color: var(--color-primary); margin-top: 0.4cqw;">
                    ${exp.price ? this.state.formatMoney(exp.price) : (exp.customPriceLabel || 'Tarifa Especial')}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= PÁGINA CIERRE Y CONTACTO =================
    const whatsappDisp = (data.studio && data.studio.whatsappDisplay) ? data.studio.whatsappDisplay : "+57 300 627 9079";
    const instagram = (data.studio && data.studio.instagram) ? data.studio.instagram : "dannamesa_studio";
    const backCoverTitle = lb.backCoverTitle || "Danna Mesa Studio";
    const backCoverQuote = lb.backCoverQuote || "Tu mirada, nuestro sello.";
    const backCoverCta = lb.backCoverCta || "Una experiencia creada para resaltar tu esencia natural.";

    registerPage("page_back", "Contraportada & Cierre", pageCounter);
    html += `
      <section class="lb-page dark" id="lb-page-${pageCounter}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('page_back')">✏️ Editar Contraportada</button>
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Contacto</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 22%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4em; color: var(--color-primary);">${backCoverQuote}</span>
          <h2 style="font-size: 8cqw; margin-top: 1cqw; color: #efe8da;">${backCoverTitle}</h2>
          <div style="height: 1px; background: var(--color-hairline-dark); margin: 3cqw 0 4cqw;"></div>
          
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 2.6cqw; line-height: 1.4; color: #c9b48f; margin-bottom: 4cqw;">
            "${backCoverCta}"
          </p>

          <div style="display: flex; gap: 8cqw; margin-top: 4cqw;">
            <div>
              <div style="font-size: 1.4cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); margin-bottom: 1cqw;">Reservas WhatsApp</div>
              <div style="font-family: var(--font-serif); font-size: 3cqw; color: #ffffff;">${whatsappDisp}</div>
            </div>
            <div>
              <div style="font-size: 1.4cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); margin-bottom: 1cqw;">Instagram & TikTok</div>
              <div style="font-family: var(--font-serif); font-size: 3cqw; color: #ffffff;">@${instagram}</div>
            </div>
          </div>
        </div>
        <div class="lb-run bot"><span>${studioLoc}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
      </section>
    `;

    this.container.innerHTML = html;
    this.isRendered = true;
    this.updateQuickSelectorOptions();
  }

  renderTwoServicesPage(pageNum, pageKey, topTitle, mainTitle, introDesc, s1, s2) {
    if (!s1) return "";
    const pStr = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;

    return `
      <section class="lb-page" id="lb-page-${pageNum}">
        <button class="lb-page-edit-badge" onclick="window.lookbookManager.openPageEditor('${pageKey}')">✏️ Editar Página</button>
        <div class="lb-run top"><span>${this.state.data.studio.name}</span><span class="tick">·</span><span>${topTitle}</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 10%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">${topTitle}</span>
          <h2 style="font-size: 7.5cqw; margin-top: 0.8cqw;">${mainTitle}</h2>
          <p style="font-size: 1.9cqw; color: var(--color-ink-light); margin-top: 0.8cqw;">${introDesc}</p>
          <div style="height: 1px; background: var(--color-hairline); margin: 2cqw 0;"></div>
        </div>

        <div class="lb-service-grid" style="top: 31%;">
          <div class="lb-service-row">
            <div class="im">
              <img src="${s1.image || 'assets/img/page_img_1.jpeg'}" style="object-position: ${s1.imagePosition || 'center center'}; width: 100%; height: 100%; object-fit: cover;" alt="${s1.name}">
            </div>
            <div class="tx">
              <div class="n">01</div>
              <div class="nm">${s1.name}</div>
              <div class="desc">${s1.desc || ''}</div>
              <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${s1.duration || '3-5 semanas'}</span></div>
              <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(s1.price)}</span></div>
              ${s1.retouch15_21 ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(s1.retouch15_21)}</span></div>` : ''}
            </div>
          </div>

          ${s2 ? `
            <div class="lb-service-row">
              <div class="im">
                <img src="${s2.image || 'assets/img/page_img_1.jpeg'}" style="object-position: ${s2.imagePosition || 'center center'}; width: 100%; height: 100%; object-fit: cover;" alt="${s2.name}">
              </div>
              <div class="tx">
                <div class="n">02</div>
                <div class="nm">${s2.name}</div>
                <div class="desc">${s2.desc || ''}</div>
                <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${s2.duration || '3-5 semanas'}</span></div>
                <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(s2.price)}</span></div>
                ${s2.retouch15_21 ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(s2.retouch15_21)}</span></div>` : ''}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>${pStr}</span></div>
      </section>
    `;
  }

  updateQuickSelectorOptions() {
    if (!this.quickSelector) return;
    this.quickSelector.innerHTML = this.pagesDirectory.map(p => `
      <option value="${p.key}">${p.label}</option>
    `).join("");
  }

  // ================= OPEN VISUAL PAGE EDITOR =================
  openPageEditor(pageKey) {
    if (!this.modal) return;
    this.currentEditingPageKey = pageKey;
    if (this.quickSelector) this.quickSelector.value = pageKey;

    const data = this.state.data;
    const lb = data.lookbook || {};
    this.currentBase64Photo = null;

    let titleText = "Editar Página de Revista";
    let showPhoto = true;
    let photoSrc = "assets/img/page_img_1.jpeg";
    let photoPos = "50% 30%";
    let fieldsHtml = "";

    if (pageKey === "page_1") {
      titleText = "Página 01: Portada Principal";
      photoSrc = data.hero ? data.hero.image : "assets/img/page_img_1.jpeg";
      photoPos = data.hero ? (data.hero.imagePosition || "center 20%") : "center 20%";

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título de Portada</label>
          <input type="text" id="lbField_coverTitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.coverTitle || data.studio.name}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Subtítulo de Portada</label>
          <input type="text" id="lbField_coverSubtitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.coverSubtitle || 'Catálogo Colección 2026'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Año / Temporada</label>
          <input type="text" id="lbField_coverYear" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.coverYear || '2026'}">
        </div>
      `;
    } else if (pageKey === "page_2") {
      titleText = "Página 02: Bienvenida & Manifiesto";
      showPhoto = false;

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Kicker Superior</label>
          <input type="text" id="lbField_welcomeKicker" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.welcomeKicker || '01 · Bienvenida'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título Principal</label>
          <input type="text" id="lbField_welcomeTitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.welcomeTitle || 'Bienvenida'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Manifiesto de Bienvenida (Párrafo destacado)</label>
          <textarea id="lbField_welcomeLead" class="admin-form-textarea" rows="3" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper); font-family: inherit;">${lb.welcomeLead || data.studio.welcomeLead || ''}</textarea>
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Mensaje de Confianza</label>
          <textarea id="lbField_welcomeText" class="admin-form-textarea" rows="2" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper); font-family: inherit;">${lb.welcomeText || data.studio.welcomeText || ''}</textarea>
        </div>
      `;
    } else if (pageKey === "page_3") {
      titleText = "Página 03: Studio Experience";
      showPhoto = false;

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título de la Sección</label>
          <input type="text" id="lbField_studioTitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.studioTitle || 'Studio Experience'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Slogan / Frase Insignia</label>
          <input type="text" id="lbField_studioQuote" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.studioQuote || data.studio.slogan}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Descripción de la Experiencia</label>
          <textarea id="lbField_studioDesc" class="admin-form-textarea" rows="3" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper); font-family: inherit;">${lb.studioDesc || ''}</textarea>
        </div>
      `;
    } else if (pageKey === "page_4") {
      titleText = "Página 04: Separador Colección Lifting";
      showPhoto = false;

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título Gigante del Separador</label>
          <input type="text" id="lbField_liftingDividerTitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.liftingDividerTitle || 'Lifting'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Frase Destacada</label>
          <input type="text" id="lbField_liftingDividerQuote" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.liftingDividerQuote || 'El servicio insignia'}">
        </div>
      `;
    } else if (pageKey === "page_5") {
      const srv = data.services.find(s => s.id === "lifting-coreano") || data.services.find(s => s.categoryId === "lifting");
      titleText = "Página 05: Lifting de Pestañas Coreano";
      photoSrc = srv ? srv.image : "assets/img/page_img_2.jpeg";
      photoPos = srv ? (srv.imagePosition || "center 40%") : "center 40%";

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Subtítulo / Frase Superior</label>
          <input type="text" id="lbField_srvSubtitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${srv ? srv.subtitle : ''}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Descripción</label>
          <textarea id="lbField_srvDesc" class="admin-form-textarea" rows="3" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper); font-family: inherit;">${srv ? srv.desc : ''}</textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Precio (COP)</label>
            <input type="number" id="lbField_srvPrice" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${srv ? srv.price : 50000}">
          </div>
          <div class="form-group">
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Duración</label>
            <input type="text" id="lbField_srvDuration" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${srv ? srv.duration : '6 a 8 semanas'}">
          </div>
        </div>
      `;
    } else if (pageKey === "page_6") {
      titleText = "Página 06: Lifting Resultados Reales";
      showPhoto = false;
      const srv = data.services.find(s => s.id === "lifting-coreano") || data.services.find(s => s.categoryId === "lifting");
      const gList = srv && srv.gallery ? srv.gallery : [];

      fieldsHtml = `
        <p style="font-size: 12px; color: var(--color-muted); margin-bottom: 12px;">
          Edita los textos y etiquetas de los 3 resultados de evidencia fotográfica del Lifting:
        </p>
        ${[0, 1, 2].map(idx => {
          const g = gList[idx] || {};
          return `
            <div style="background: var(--color-paper-light); border: 1px solid var(--color-hairline); border-radius: 6px; padding: 10px; margin-bottom: 8px;">
              <strong style="font-size: 11px; color: var(--color-primary);">Resultado 0${idx + 1}:</strong>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
                <input type="text" id="lbField_liftGTitle_${idx}" placeholder="Título (ej: Resultado 01)" style="padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: 4px;" value="${g.title || `Resultado 0${idx + 1}`}">
                <input type="text" id="lbField_liftGSubtitle_${idx}" placeholder="Subtítulo" style="padding: 6px 10px; border: 1px solid var(--color-hairline); border-radius: 4px;" value="${g.subtitle || ''}">
              </div>
            </div>
          `;
        }).join("")}
      `;
    } else if (pageKey === "page_7") {
      titleText = "Página 07: Separador Colección Extensiones";
      showPhoto = false;

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título Gigante del Separador</label>
          <input type="text" id="lbField_extensionsDividerTitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.extensionsDividerTitle || 'Extensiones'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Frase Destacada</label>
          <input type="text" id="lbField_extensionsDividerQuote" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.extensionsDividerQuote || 'La mirada que siempre imaginaste.'}">
        </div>
      `;
    } else if (pageKey.startsWith("page_ext_")) {
      const idx = parseInt(pageKey.replace("page_ext_", ""), 10);
      const extServices = data.services.filter(s => s.categoryId === "extensiones");
      const s1 = extServices[idx];
      const s2 = extServices[idx + 1];

      titleText = `Página de Efectos: ${s1 ? s1.name : ''} ${s2 ? '& ' + s2.name : ''}`;
      photoSrc = s1 ? s1.image : "assets/img/page_img_1.jpeg";
      photoPos = s1 ? (s1.imagePosition || "50% 30%") : "50% 30%";

      fieldsHtml = `
        <div style="background: var(--color-paper-light); border: 1px solid var(--color-hairline); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
          <h4 style="font-size: 13px; color: var(--color-primary); margin-bottom: 8px;">Efecto 1: ${s1 ? s1.name : ''}</h4>
          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Nombre</label>
            <input type="text" id="lbField_s1_name" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s1 ? s1.name : ''}">
          </div>
          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Descripción</label>
            <textarea id="lbField_s1_desc" rows="2" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px; font-family:inherit;">${s1 ? s1.desc : ''}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <div><label style="font-size: 10px;">Precio (COP)</label><input type="number" id="lbField_s1_price" style="width:100%; padding:4px 8px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s1 ? s1.price : 0}"></div>
            <div><label style="font-size: 10px;">Duración</label><input type="text" id="lbField_s1_duration" style="width:100%; padding:4px 8px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s1 ? (s1.duration || '3-5 semanas') : ''}"></div>
            <div><label style="font-size: 10px;">Retoque 15-21d</label><input type="number" id="lbField_s1_retouch" style="width:100%; padding:4px 8px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s1 && s1.retouch15_21 ? s1.retouch15_21 : ''}"></div>
          </div>
        </div>

        ${s2 ? `
          <div style="background: var(--color-paper-light); border: 1px solid var(--color-hairline); border-radius: 6px; padding: 12px;">
            <h4 style="font-size: 13px; color: var(--color-primary); margin-bottom: 8px;">Efecto 2: ${s2.name}</h4>
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Nombre</label>
              <input type="text" id="lbField_s2_name" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s2.name}">
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Descripción</label>
              <textarea id="lbField_s2_desc" rows="2" style="width:100%; padding:6px 10px; border:1px solid var(--color-hairline); border-radius:4px; font-family:inherit;">${s2.desc}</textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div><label style="font-size: 10px;">Precio (COP)</label><input type="number" id="lbField_s2_price" style="width:100%; padding:4px 8px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s2.price}"></div>
              <div><label style="font-size: 10px;">Duración</label><input type="text" id="lbField_s2_duration" style="width:100%; padding:4px 8px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s2.duration || '3-5 semanas'}"></div>
              <div><label style="font-size: 10px;">Retoque 15-21d</label><input type="number" id="lbField_s2_retouch" style="width:100%; padding:4px 8px; border:1px solid var(--color-hairline); border-radius:4px;" value="${s2.retouch15_21 || ''}"></div>
            </div>
          </div>
        ` : ''}
      `;
    } else if (pageKey === "page_policies") {
      titleText = "Página de Políticas de Retoque";
      showPhoto = false;
      const pol = data.retouchPolicies || {};

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título Principal</label>
          <input type="text" id="lbField_polTitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${pol.title || 'Políticas de retoque'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Subtítulo / Regla de 21 Días</label>
          <textarea id="lbField_polSubtitle" class="admin-form-textarea" rows="2" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper); font-family: inherit;">${pol.subtitle || ''}</textarea>
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Condiciones (Una por línea)</label>
          <textarea id="lbField_polConditions" class="admin-form-textarea" rows="4" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper); font-family: inherit;">${Array.isArray(pol.conditions) ? pol.conditions.join("\n") : ''}</textarea>
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Nota Final / Advertencia</label>
          <input type="text" id="lbField_polNote" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${pol.note || ''}">
        </div>
      `;
    } else if (pageKey === "page_hydra") {
      const hydra = data.services.find(s => s.id === "hydralips-sesion") || data.services.find(s => s.categoryId === "hydralips");
      titleText = "Página: HydraLips Labios";
      photoSrc = hydra ? hydra.image : "assets/img/page_img_19.jpeg";
      photoPos = hydra ? (hydra.imagePosition || "center 45%") : "center 45%";

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Subtítulo</label>
          <input type="text" id="lbField_hydraSubtitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${hydra ? (hydra.subtitle || hydra.name) : ''}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Descripción</label>
          <textarea id="lbField_hydraDesc" class="admin-form-textarea" rows="3" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper); font-family: inherit;">${hydra ? hydra.desc : ''}</textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Precio (COP)</label>
            <input type="number" id="lbField_hydraPrice" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${hydra ? hydra.price : 40000}">
          </div>
          <div class="form-group">
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Duración</label>
            <input type="text" id="lbField_hydraDuration" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${hydra ? hydra.duration : 'Hasta 15 días'}">
          </div>
        </div>
      `;
    } else if (pageKey === "page_back") {
      titleText = "Contraportada & Cierre Editorial";
      showPhoto = false;

      fieldsHtml = `
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Título de Despedida</label>
          <input type="text" id="lbField_backTitle" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.backCoverTitle || data.studio.name}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Frase de Cierre / Slogan</label>
          <input type="text" id="lbField_backQuote" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.backCoverQuote || 'Tu mirada, nuestro sello.'}">
        </div>
        <div class="form-group">
          <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary);">Llamado a la Acción</label>
          <input type="text" id="lbField_backCta" class="admin-form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); background: var(--color-paper);" value="${lb.backCoverCta || 'Una experiencia creada para resaltar tu esencia natural.'}">
        </div>
      `;
    } else {
      // General fallbacks
      titleText = `Editar: ${pageKey}`;
      showPhoto = false;
      fieldsHtml = `<p style="font-size: 13px; color: var(--color-muted);">Edita el contenido de esta sección.</p>`;
    }

    // Actualizar Modal DOM
    if (this.modalTitle) this.modalTitle.textContent = titleText;
    if (this.photoSection) this.photoSection.style.display = showPhoto ? "block" : "none";

    if (showPhoto && this.previewImg) {
      this.previewImg.src = photoSrc;
      const parts = photoPos.replace(/center/g, "50%").split(" ");
      const posX = parseInt(parts[0], 10) || 50;
      const posY = parseInt(parts[1], 10) || 30;

      if (this.sliderX) this.sliderX.value = posX;
      if (this.sliderY) this.sliderY.value = posY;
      if (this.posXVal) this.posXVal.textContent = posX + "%";
      if (this.posYVal) this.posYVal.textContent = posY + "%";
      this.previewImg.style.objectPosition = `${posX}% ${posY}%`;
    }

    if (this.dynamicFields) this.dynamicFields.innerHTML = fieldsHtml;

    this.modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  closePageEditor() {
    if (this.modal) {
      this.modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  // ================= SAVE MODAL CHANGES =================
  async handleSavePage(e) {
    e.preventDefault();
    const data = this.state.data;
    if (!data.lookbook) data.lookbook = {};
    const lb = data.lookbook;
    const pageKey = this.currentEditingPageKey;
    const saveBtn = document.getElementById("saveLbPageModalBtn");

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Guardando en Firestore...";
    }

    const pos = (this.sliderX && this.sliderY) ? `${this.sliderX.value}% ${this.sliderY.value}%` : null;

    try {
      if (pageKey === "page_1") {
        lb.coverTitle = document.getElementById("lbField_coverTitle").value.trim();
        lb.coverSubtitle = document.getElementById("lbField_coverSubtitle").value.trim();
        lb.coverYear = document.getElementById("lbField_coverYear").value.trim();
        if (data.hero) {
          if (pos) data.hero.imagePosition = pos;
          if (this.currentBase64Photo) data.hero.image = this.currentBase64Photo;
        }
      } else if (pageKey === "page_2") {
        lb.welcomeKicker = document.getElementById("lbField_welcomeKicker").value.trim();
        lb.welcomeTitle = document.getElementById("lbField_welcomeTitle").value.trim();
        lb.welcomeLead = document.getElementById("lbField_welcomeLead").value.trim();
        lb.welcomeText = document.getElementById("lbField_welcomeText").value.trim();
        if (data.studio) {
          data.studio.welcomeLead = lb.welcomeLead;
          data.studio.welcomeText = lb.welcomeText;
        }
      } else if (pageKey === "page_3") {
        lb.studioTitle = document.getElementById("lbField_studioTitle").value.trim();
        lb.studioQuote = document.getElementById("lbField_studioQuote").value.trim();
        lb.studioDesc = document.getElementById("lbField_studioDesc").value.trim();
      } else if (pageKey === "page_4") {
        lb.liftingDividerTitle = document.getElementById("lbField_liftingDividerTitle").value.trim();
        lb.liftingDividerQuote = document.getElementById("lbField_liftingDividerQuote").value.trim();
      } else if (pageKey === "page_5") {
        const srv = data.services.find(s => s.id === "lifting-coreano") || data.services.find(s => s.categoryId === "lifting");
        if (srv) {
          srv.subtitle = document.getElementById("lbField_srvSubtitle").value.trim();
          srv.desc = document.getElementById("lbField_srvDesc").value.trim();
          srv.price = parseInt(document.getElementById("lbField_srvPrice").value, 10) || srv.price;
          srv.duration = document.getElementById("lbField_srvDuration").value.trim();
          if (pos) srv.imagePosition = pos;
          if (this.currentBase64Photo) srv.image = this.currentBase64Photo;
        }
      } else if (pageKey === "page_6") {
        const srv = data.services.find(s => s.id === "lifting-coreano") || data.services.find(s => s.categoryId === "lifting");
        if (srv && srv.gallery) {
          [0, 1, 2].forEach(idx => {
            const tInput = document.getElementById(`lbField_liftGTitle_${idx}`);
            const sInput = document.getElementById(`lbField_liftGSubtitle_${idx}`);
            if (srv.gallery[idx]) {
              if (tInput) srv.gallery[idx].title = tInput.value.trim();
              if (sInput) srv.gallery[idx].subtitle = sInput.value.trim();
            }
          });
        }
      } else if (pageKey === "page_7") {
        lb.extensionsDividerTitle = document.getElementById("lbField_extensionsDividerTitle").value.trim();
        lb.extensionsDividerQuote = document.getElementById("lbField_extensionsDividerQuote").value.trim();
      } else if (pageKey.startsWith("page_ext_")) {
        const idx = parseInt(pageKey.replace("page_ext_", ""), 10);
        const extServices = data.services.filter(s => s.categoryId === "extensiones");
        const s1 = extServices[idx];
        const s2 = extServices[idx + 1];

        if (s1) {
          const nameEl = document.getElementById("lbField_s1_name");
          const descEl = document.getElementById("lbField_s1_desc");
          const priceEl = document.getElementById("lbField_s1_price");
          const durEl = document.getElementById("lbField_s1_duration");
          const retEl = document.getElementById("lbField_s1_retouch");
          if (nameEl) s1.name = nameEl.value.trim();
          if (descEl) s1.desc = descEl.value.trim();
          if (priceEl) s1.price = parseInt(priceEl.value, 10) || s1.price;
          if (durEl) s1.duration = durEl.value.trim();
          if (retEl && retEl.value) s1.retouch15_21 = parseInt(retEl.value, 10);
          if (pos) s1.imagePosition = pos;
          if (this.currentBase64Photo) s1.image = this.currentBase64Photo;
        }

        if (s2) {
          const nameEl2 = document.getElementById("lbField_s2_name");
          const descEl2 = document.getElementById("lbField_s2_desc");
          const priceEl2 = document.getElementById("lbField_s2_price");
          const durEl2 = document.getElementById("lbField_s2_duration");
          const retEl2 = document.getElementById("lbField_s2_retouch");
          if (nameEl2) s2.name = nameEl2.value.trim();
          if (descEl2) s2.desc = descEl2.value.trim();
          if (priceEl2) s2.price = parseInt(priceEl2.value, 10) || s2.price;
          if (durEl2) s2.duration = durEl2.value.trim();
          if (retEl2 && retEl2.value) s2.retouch15_21 = parseInt(retEl2.value, 10);
        }
      } else if (pageKey === "page_policies") {
        if (!data.retouchPolicies) data.retouchPolicies = {};
        data.retouchPolicies.title = document.getElementById("lbField_polTitle").value.trim();
        data.retouchPolicies.subtitle = document.getElementById("lbField_polSubtitle").value.trim();
        data.retouchPolicies.conditions = document.getElementById("lbField_polConditions").value.split("\n").map(c => c.trim()).filter(Boolean);
        data.retouchPolicies.note = document.getElementById("lbField_polNote").value.trim();
      } else if (pageKey === "page_hydra") {
        const hydra = data.services.find(s => s.id === "hydralips-sesion") || data.services.find(s => s.categoryId === "hydralips");
        if (hydra) {
          hydra.subtitle = document.getElementById("lbField_hydraSubtitle").value.trim();
          hydra.desc = document.getElementById("lbField_hydraDesc").value.trim();
          hydra.price = parseInt(document.getElementById("lbField_hydraPrice").value, 10) || hydra.price;
          hydra.duration = document.getElementById("lbField_hydraDuration").value.trim();
          if (pos) hydra.imagePosition = pos;
          if (this.currentBase64Photo) hydra.image = this.currentBase64Photo;
        }
      } else if (pageKey === "page_back") {
        lb.backCoverTitle = document.getElementById("lbField_backTitle").value.trim();
        lb.backCoverQuote = document.getElementById("lbField_backQuote").value.trim();
        lb.backCoverCta = document.getElementById("lbField_backCta").value.trim();
      }

      await this.state.saveToCloud(this.state.data);
      this.closePageEditor();
      this.render();
      if (window.catalogApp) {
        window.catalogApp.showToast("✓ ¡Página de la revista actualizada y guardada en Firestore!");
      }
    } catch (err) {
      alert("Error al guardar cambios: " + err.message);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "💾 Guardar Cambios en Firestore";
      }
    }
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
}

// Instanciar Lookbook globalmente
window.lookbookManager = new LookbookManager();
