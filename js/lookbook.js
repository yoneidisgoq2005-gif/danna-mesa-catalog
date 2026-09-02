/**
 * ==========================================================================
 * DANNA MESA STUDIO — LOOKBOOK MAGAZINE RENDERER & INTERACTIVE PAGE EDITOR
 * Renderiza la revista editorial sincronizada en tiempo real con Firestore.
 * Si es Administrador (?admin=true, ?admin_preview=true o admin desbloqueado),
 * activa los botones interactivos de edición y modal en vivo.
 * Si es Cliente, se mantiene 100% de solo lectura y ultra-limpio.
 * ==========================================================================
 */

class LookbookManager {
  constructor() {
    window.lookbookManager = this;
    this.state = window.catalogState;
    this.container = document.getElementById("lookbookStageContainer");
    this.isRendered = false;
    this.activeEditPageKey = null;
    this.currentBase64Upload = null;

    // Suscribirse a cambios en tiempo real del catálogo
    window.addEventListener("catalogDataChanged", () => {
      this.render();
    });

    this.initAdminControls();
  }

  isPageEnabled(pageKey) {
    if (!this.state || !this.state.data) return true;
    const lb = this.state.data.lookbook || {};
    const disabled = Array.isArray(lb.disabledPages) ? lb.disabledPages : [];
    return !disabled.includes(pageKey);
  }

  getPagesDirectory() {
    const data = this.state ? this.state.data : null;
    if (!data) return [];
    const disabled = (data.lookbook && Array.isArray(data.lookbook.disabledPages)) ? data.lookbook.disabledPages : [];

    const pages = [
      { key: "p1_cover", label: "Portada Principal (Hero)", type: "cover" },
      { key: "p2_welcome", label: "Bienvenida Editorial", type: "welcome" },
      { key: "p3_studio", label: "Studio Experience", type: "studio" },
      { key: "p_salud_ocular", label: "Garantía & Salud Ocular", type: "salud_ocular" },
      { key: "p4_lifting_divider", label: "Separador Lifting", type: "divider", divKey: "lifting" },
      { key: "p5_lifting_service", label: "Lifting Coreano", type: "service", serviceId: "lifting-coreano" },
      { key: "p6_lifting_evidence", label: "Galería Resultados Lifting (3 Fotos)", type: "evidence", serviceId: "lifting-coreano" },
      { key: "p7_ext_divider", label: "Separador Extensiones", type: "divider", divKey: "extensions" }
    ];

    // Extensiones dinámicas en pares
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

    // Cejas dinámicas en pares
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
    pages.push({ key: "p19_combos", label: "Experiencias & Combos (Banner + 3 Combos)", type: "combos" });
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
        displayLabel: `${numStr} · ${p.label}${isEnabled ? '' : ' (🚫 Oculta)'}`
      };
    });
  }

  get pagesDirectory() {
    return this.getPagesDirectory();
  }

  isAdminMode() {
    // Limpiar residuos antiguos de localStorage para que la vista del cliente sea 100% limpia
    try { localStorage.removeItem("danna_mesa_admin_unlocked"); } catch (e) {}

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("admin") === "true" || urlParams.get("admin_preview") === "true";
  }

  initAdminControls() {
    const adminMode = this.isAdminMode();
    const editBtn = document.getElementById("lookbookEditBtn");
    if (editBtn) {
      editBtn.style.display = adminMode ? "flex" : "none";
      editBtn.addEventListener("click", () => this.openPageEditor("p1_cover"));
    }

    const modal = document.getElementById("lookbookPageModal");
    if (modal) {
      const closeBtn = document.getElementById("closeLbPageModalBtn");
      const cancelBtn = document.getElementById("cancelLbPageModalBtn");
      const form = document.getElementById("lbPageEditForm");
      const quickSel = document.getElementById("lbPageQuickSelector");
      const changePhotoBtn = document.getElementById("lbPageChangePhotoBtn");
      const fileInput = document.getElementById("lbPageFileInput");
      const sliderX = document.getElementById("lbPageSliderX");
      const sliderY = document.getElementById("lbPageSliderY");

      if (closeBtn) closeBtn.addEventListener("click", () => this.closePageEditor());
      if (cancelBtn) cancelBtn.addEventListener("click", () => this.closePageEditor());
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) this.closePageEditor();
        });
      }

      if (form) form.addEventListener("submit", (e) => this.handleSavePage(e));

      // Llenar selector rápido
      if (quickSel) {
        quickSel.innerHTML = this.pagesDirectory
          .map(p => `<option value="${p.key}">${p.label}</option>`)
          .join("");
        quickSel.addEventListener("change", (e) => this.openPageEditor(e.target.value));
      }

      // Cambio de foto
      if (changePhotoBtn && fileInput) {
        changePhotoBtn.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files[0]) {
            this.compressImage(e.target.files[0], 1200, 0.85, (base64) => {
              this.currentBase64Upload = base64;
              const preview = document.getElementById("lbPagePreviewImg");
              if (preview) {
                preview.src = base64;
                preview.style.display = "block";
              }
            });
          }
        });
      }

      // Sliders en vivo
      if (sliderX) {
        sliderX.addEventListener("input", (e) => {
          const posXVal = document.getElementById("lbPagePosXVal");
          if (posXVal) posXVal.textContent = e.target.value + "%";
          const preview = document.getElementById("lbPagePreviewImg");
          if (preview) preview.style.objectPosition = `${sliderX.value}% ${sliderY.value}%`;
        });
      }

      if (sliderY) {
        sliderY.addEventListener("input", (e) => {
          const posYVal = document.getElementById("lbPagePosYVal");
          if (posYVal) posYVal.textContent = e.target.value + "%";
          const preview = document.getElementById("lbPagePreviewImg");
          if (preview) preview.style.objectPosition = `${sliderX.value}% ${sliderY.value}%`;
        });
      }
    }
  }

  render() {
    if (!this.container) return;
    const data = this.state.data;
    if (!data) return;

    const lb = data.lookbook || (typeof DEFAULT_CATALOG_DATA !== 'undefined' ? DEFAULT_CATALOG_DATA.lookbook : {}) || {};
    const admin = this.isAdminMode();

    let html = "";
    let pageCounter = 1;

    // Helper badge
    const editBadge = (key) => admin ? `<button type="button" class="lb-page-edit-badge" onclick="event.stopPropagation(); window.lookbookManager.openPageEditor('${key}')">✏️ Editar</button>` : "";

    const coverTitle = lb.coverTitle || (data.studio && data.studio.name) || "Danna Mesa";
    const coverSubtitle = lb.coverSubtitle || "Catálogo Colección 2026";
    const coverYear = lb.coverYear || "2026";
    const studioLoc = (data.studio && data.studio.location) ? data.studio.location : "Armenia · Quindío, Colombia";

    // ================= PÁGINA 1: PORTADA =================
    if (this.isPageEnabled("p1_cover")) {
      const heroImg = (data.hero && data.hero.image) ? data.hero.image : "assets/img/page_img_1.jpeg";
      const heroPos = (data.hero && data.hero.imagePosition) ? data.hero.imagePosition : "center 20%";

      html += `
        <section class="lb-page lb-cover" id="lb-page-${pageCounter}">
          ${editBadge("p1_cover")}
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
          <div class="lb-run bot"><span>${studioLoc}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= PÁGINA 2: BIENVENIDA =================
    if (this.isPageEnabled("p2_welcome")) {
      const welcomeKicker = lb.welcomeKicker || "01 · Bienvenida";
      const welcomeTitle = lb.welcomeTitle || "Bienvenida";
      const welcomeLead = lb.welcomeLead || (data.studio && data.studio.welcomeLead) || (data.hero && data.hero.welcomeLead) || "En Danna Mesa Studio entendemos que tu mirada es tu firma más personal.";
      const welcomeText = lb.welcomeText || (data.studio && data.studio.welcomeText) || "Aquí tu cita es solo tuya, tú solo cierra los ojos y confía. Bienvenida.";
      const tagline = (data.studio && data.studio.tagline) ? data.studio.tagline : "Studio Experience";

      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p2_welcome")}
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
          <div class="lb-run bot"><span>Studio Experience</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= PÁGINA 3: STUDIO EXPERIENCE =================
    if (this.isPageEnabled("p3_studio")) {
      const studioQuote = lb.studioQuote || (data.studio && data.studio.slogan) || "Tu mirada, nuestro sello.";
      const studioDesc = lb.studioDesc || "Una experiencia creada para resaltar tu esencia natural con la más alta bioseguridad, técnicas avanzadas y atención 100% individualizada.";
      const studioTitle = lb.studioTitle || "Studio Experience";

      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p3_studio")}
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
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= [NUEVA] PÁGINA: GARANTÍA & SALUD OCULAR =================
    if (this.isPageEnabled("p_salud_ocular")) {
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

      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p_salud_ocular")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Salud Ocular & Bioseguridad</span></div>
          <div style="position: absolute; left: 9%; right: 9%; top: 12%;">
            <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Bioseguridad Grado Estudio</span>
            <h2 style="font-size: 6.8cqw; margin-top: 0.6cqw;">${so.title}</h2>
            <p style="font-size: 1.9cqw; line-height: 1.5; color: var(--color-ink-light); margin-top: 0.8cqw; max-width: 88%;">${so.subtitle}</p>
            <div style="height: 1px; background: var(--color-hairline); margin: 2cqw 0 2.5cqw;"></div>
            
            <div style="display: flex; flex-direction: column; gap: 2.2cqw;">
              <div style="display: flex; gap: 3cqw; align-items: flex-start;">
                <div style="font-size: 4cqw; line-height: 1; padding: 1.2cqw; background: rgba(156,126,84,0.1); border-radius: 8px;">🌿</div>
                <div>
                  <h3 style="font-size: 2.8cqw; margin-bottom: 0.4cqw;">${so.p1Title}</h3>
                  <p style="font-size: 1.8cqw; line-height: 1.55; color: var(--color-ink-light);">${so.p1Desc}</p>
                </div>
              </div>
              <div style="display: flex; gap: 3cqw; align-items: flex-start; border-top: 1px solid var(--color-hairline); padding-top: 2cqw;">
                <div style="font-size: 4cqw; line-height: 1; padding: 1.2cqw; background: rgba(156,126,84,0.1); border-radius: 8px;">🔬</div>
                <div>
                  <h3 style="font-size: 2.8cqw; margin-bottom: 0.4cqw;">${so.p2Title}</h3>
                  <p style="font-size: 1.8cqw; line-height: 1.55; color: var(--color-ink-light);">${so.p2Desc}</p>
                </div>
              </div>
              <div style="display: flex; gap: 3cqw; align-items: flex-start; border-top: 1px solid var(--color-hairline); padding-top: 2cqw;">
                <div style="font-size: 4cqw; line-height: 1; padding: 1.2cqw; background: rgba(156,126,84,0.1); border-radius: 8px;">🧼</div>
                <div>
                  <h3 style="font-size: 2.8cqw; margin-bottom: 0.4cqw;">${so.p3Title}</h3>
                  <p style="font-size: 1.8cqw; line-height: 1.55; color: var(--color-ink-light);">${so.p3Desc}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= PÁGINA 4: DIVIDER LIFTING =================
    if (this.isPageEnabled("p4_lifting_divider")) {
      const liftingDivTitle = lb.liftingDividerTitle || "Lifting";
      const liftingDivQuote = lb.liftingDividerQuote || "El servicio insignia";

      html += `
        <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
          ${editBadge("p4_lifting_divider")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 1</span></div>
          <div class="big-title">${liftingDivTitle}</div>
          <div class="lead-quote">${liftingDivQuote}</div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= PÁGINA 5: LIFTING SERVICIO =================
    const liftingService = data.services.find(s => s.id === "lifting-coreano") || data.services.find(s => s.categoryId === "lifting") || {
      name: "Lifting de Pestañas Coreano",
      desc: "Curvatura elegante y definición natural.",
      duration: "6 a 8 semanas",
      appointmentTime: "60 - 90 min",
      price: 50000,
      image: "assets/img/page_img_2.jpeg",
      imagePosition: "center 40%",
      gallery: []
    };

    if (this.isPageEnabled("p5_lifting_service")) {
      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p5_lifting_service")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Lifting de Pestañas</span></div>
          <div style="position: absolute; left: 0; top: 0; width: 50%; height: 100%; overflow: hidden;">
            <img src="${liftingService.image || 'assets/img/page_img_2.jpeg'}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${liftingService.imagePosition || 'center 40%'};" alt="${liftingService.name}">
          </div>
          <div style="position: absolute; right: 0; top: 0; width: 50%; height: 100%; padding: 22% 8% 0 8%;">
            <span style="font-size: 1.4cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary); border-top: 1px solid var(--color-primary); padding-top: 1.5cqw; display: block; margin-bottom: 2cqw;">Colección 1 · Lifting</span>
            <h2 style="font-size: 5.5cqw; line-height: 1; margin-bottom: 2.5cqw;">${liftingService.subtitle || 'Resalta lo que ya eres'}</h2>
            <p style="font-size: 2cqw; line-height: 1.6; color: var(--color-ink-light);">${liftingService.desc}</p>
          </div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= PÁGINA 6: GALERÍA DE RESULTADOS LIFTING =================
    if (this.isPageEnabled("p6_lifting_evidence")) {
      const liftGallery = liftingService.gallery || [
        { src: "assets/img/lifting_1.jpeg", position: "center 30%", title: "Resultado 01", subtitle: "Elevación y Curvatura Natural" },
        { src: "assets/img/lifting_2.jpeg", position: "center 30%", title: "Resultado 02", subtitle: "Definición & Máxima Longitud" },
        { src: "assets/img/lifting_3.jpeg", position: "center 45%", title: "Resultado 03", subtitle: "Intenso y duradero" }
      ];

      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p6_lifting_evidence")}
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
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= PÁGINA 7: DIVIDER EXTENSIONES =================
    if (this.isPageEnabled("p7_ext_divider")) {
      const extDivTitle = lb.extensionsDividerTitle || "Extensiones";
      const extDivQuote = lb.extensionsDividerQuote || "La mirada que siempre imaginaste.";

      html += `
        <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
          ${editBadge("p7_ext_divider")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 2</span></div>
          <div class="big-title" style="font-size: 9.5cqw;">${extDivTitle}</div>
          <div class="lead-quote">${extDivQuote}</div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // Extensiones dinámicas en pares
    const extensionServices = data.services.filter(s => s.categoryId === "extensiones");
    for (let i = 0; i < extensionServices.length; i += 2) {
      const s1 = extensionServices[i];
      const s2 = extensionServices[i + 1];
      const pageKey = (s1 && s2) ? `p_ext_${s1.id}_${s2.id}` : `p_ext_${s1.id}`;

      if (this.isPageEnabled(pageKey)) {
        if (s1 && s2) {
          const topTag = s1.groupTitle || s1.type || "Extensiones";
          html += this.renderTwoServicesPage(pageCounter, `Extensiones · ${topTag}`, topTag, "Efectos y densidades personalizados para cada tipo de mirada.", s1, s2, pageKey, admin);
          pageCounter++;
        } else if (s1 && !s2) {
          html += `
            <section class="lb-page" id="lb-page-${pageCounter}">
              ${editBadge(pageKey)}
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
                    <img src="${s1.image || 'assets/img/page_img_1.jpeg'}" style="object-position: ${s1.imagePosition || 'center center'}; width:100%; height:100%; object-fit:cover;" alt="${s1.name}">
                  </div>
                  <div class="tx">
                    <div class="n">01</div>
                    <div class="nm">${s1.name}</div>
                    <div class="desc">${s1.desc}</div>
                    <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${s1.duration || '3-5 semanas'}</span></div>
                    <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(s1.price)}</span></div>
                    ${(() => {
                      const isSingle = ["ext-clasicas-naturales", "ext-efecto-pestanina", "ext-efecto-humedo", "ext-efecto-aura"].includes(s1.id);
                      if (isSingle) {
                        const retPrice = s1.retouch15_21 || s1.retouch15_17;
                        return retPrice ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(retPrice)}</span></div>` : '';
                      } else {
                        const ret17 = s1.retouch15_17 || s1.retouch15_21;
                        const ret21 = s1.retouch18_21;
                        return `
                          ${ret17 ? `<div class="lb-spec-row"><span class="l">Retoque (15-17d)</span><span class="v">${this.state.formatMoney(ret17)}</span></div>` : ''}
                          ${ret21 ? `<div class="lb-spec-row"><span class="l">Retoque (18-21d)</span><span class="v">${this.state.formatMoney(ret21)}</span></div>` : ''}
                        `;
                      }
                    })()}
                  </div>
                </div>
              </div>
              <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
            </section>
          `;
          pageCounter++;
        }
      }
    }

    // ================= PÁGINA POLÍTICAS DE RETOQUE =================
    if (this.isPageEnabled("p14_policies")) {
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

      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p14_policies")}
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
    }

    // ================= PÁGINA DIVIDER CEJAS =================
    if (this.isPageEnabled("p15_cejas_divider")) {
      const cejasDivTitle = lb.cejasDividerTitle || "Cejas";
      const cejasDivQuote = lb.cejasDividerQuote || "Un diseño pensado para tu rostro.";

      html += `
        <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
          ${editBadge("p15_cejas_divider")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 3</span></div>
          <div class="big-title">${cejasDivTitle}</div>
          <div class="lead-quote">${cejasDivQuote}</div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // Cejas dinámicas en pares
    const browServices = data.services.filter(s => s.categoryId === "cejas");
    for (let i = 0; i < browServices.length; i += 2) {
      const s1 = browServices[i];
      const s2 = browServices[i + 1];
      const pageKey = (s1 && s2) ? `p_cejas_${s1.id}_${s2.id}` : `p_cejas_${s1.id}`;

      if (this.isPageEnabled(pageKey)) {
        if (s1 && s2) {
          html += this.renderTwoServicesPage(pageCounter, "Cejas · Diseño & Definición", "Cejas", "Cada rostro es único. Creamos equilibrio, definición y armonía.", s1, s2, pageKey, admin);
          pageCounter++;
        } else if (s1) {
          html += this.renderTwoServicesPage(pageCounter, "Cejas · Diseño & Definición", "Cejas", "Cada rostro es único. Creamos equilibrio, definición y armonía.", s1, s1, pageKey, admin);
          pageCounter++;
        }
      }
    }

    // ================= PÁGINA DIVIDER HYDRALIPS =================
    if (this.isPageEnabled("p17_lips_divider")) {
      const lipsDivTitle = lb.hydralipsDividerTitle || "HydraLips";
      const lipsDivQuote = lb.hydralipsDividerQuote || "Tus labios en su mejor versión.";

      html += `
        <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
          ${editBadge("p17_lips_divider")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 4</span></div>
          <div class="big-title" style="font-size: 8.5cqw;">${lipsDivTitle}</div>
          <div class="lead-quote">${lipsDivQuote}</div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // HydraLips
    const hydra = data.services.find(s => s.id === "hydralips-sesion") || data.services.find(s => s.categoryId === "hydralips") || {
      name: "HydraLips",
      subtitle: "Hidratación Profunda de Labios",
      desc: "Tratamiento no invasivo para labios jugosos y suaves.",
      duration: "Hasta 15 días por sesión",
      appointmentTime: "30 - 40 min",
      price: 40000,
      image: "assets/img/page_img_19.jpeg",
      imagePosition: "center 45%"
    };

    if (this.isPageEnabled("p18_hydralips_service")) {
      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p18_hydralips_service")}
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
    }

    // ================= PÁGINA EXPERIENCIAS & COMBOS =================
    const expServices = data.services.filter(s => s.categoryId === "experiencias");
    if (expServices.length > 0 && this.isPageEnabled("p19_combos")) {
      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p19_combos")}
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

    // ================= [NUEVA] PÁGINA: CUIDADO EN CASA & HIDRATANTE =================
    if (this.isPageEnabled("p_cuidados_hidratante")) {
      const hidraProd = data.services.find(s => s.id === "cuidado-hidratante") || data.services.find(s => s.categoryId === "cuidados") || {
        name: "Hidratante de Pestañas y Cejas",
        subtitle: "Cuidado profesional en casa",
        desc: "Diseñado para acondicionar, nutrir y humectar pestañas y cejas. Su uso constante prolonga la retención de tus extensiones y estimula el crecimiento natural.",
        instructions: "Aplica una pequeña cantidad sobre pestañas o cejas limpias, preferiblemente por la noche. Distribuye suavemente y deja actuar.",
        price: 15000,
        image: "assets/img/hidratante.jpeg",
        imagePosition: "center center"
      };

      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p_cuidados_hidratante")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Cuidado en Casa</span></div>
          <div style="position: absolute; left: 0; top: 0; width: 48%; height: 100%; overflow: hidden;">
            <img src="${hidraProd.image || 'assets/img/hidratante.jpeg'}" style="width:100%; height:100%; object-fit:cover; object-position: ${hidraProd.imagePosition || 'center center'};" alt="${hidraProd.name}">
          </div>
          <div style="position: absolute; left: 52%; right: 8%; top: 12%;">
            <span style="font-size: 1.4cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Nutrición & Aftercare</span>
            <h2 style="font-size: 4.8cqw; line-height: 1.1; margin: 0.8cqw 0 1.5cqw;">${hidraProd.name}</h2>
            <p style="font-size: 1.8cqw; line-height: 1.55; color: var(--color-ink-light); margin-bottom: 2cqw;">${hidraProd.desc}</p>
            
            <div style="background: rgba(156,126,84,0.06); border-left: 3px solid var(--color-primary); padding: 1.5cqw; border-radius: 4px; margin-bottom: 2.5cqw;">
              <span style="font-size: 1.3cqw; text-transform: uppercase; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 0.4cqw;">Modo de Uso Sugerido:</span>
              <p style="font-size: 1.6cqw; line-height: 1.45; color: var(--color-ink); font-style: italic;">
                "${hidraProd.instructions || 'Aplica suavemente sobre pestañas o cejas limpias por la noche.'}"
              </p>
            </div>

            <div style="border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
              <div class="lb-spec-row"><span class="l">Presentación</span><span class="v">Para llevar en casa</span></div>
              <div class="lb-spec-row"><span class="l">Beneficio</span><span class="v">Mayor retención y nutrición</span></div>
              <div class="lb-spec-row"><span class="l">Valor</span><span class="v" style="font-size: 2.8cqw; color: var(--color-primary); font-weight: 700;">${this.state.formatMoney(hidraProd.price)}</span></div>
            </div>

            <div style="margin-top: 2cqw; display: flex; align-items: center; gap: 1.5cqw; background: #fdfaf6; border: 1px solid var(--color-hairline); padding: 1cqw 1.5cqw; border-radius: 6px;">
              <span style="font-size: 2.2cqw;">✨</span>
              <span style="font-size: 1.4cqw; color: var(--color-ink); font-weight: 500;">Incluido de regalo en experiencias y combos seleccionados.</span>
            </div>
          </div>
          <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
        </section>
      `;
      pageCounter++;
    }

    // ================= [NUEVA] PÁGINA: PREGUNTAS FRECUENTES =================
    if (this.isPageEnabled("p_faq")) {
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

      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
          ${editBadge("p_faq")}
          <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>FAQ</span></div>
          <div style="position: absolute; left: 9%; right: 9%; top: 11%;">
            <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Información Importante</span>
            <h2 style="font-size: 6.5cqw; margin-top: 0.6cqw;">${faqData.title}</h2>
            <p style="font-size: 1.8cqw; color: var(--color-ink-light); margin-top: 0.6cqw;">${faqData.subtitle}</p>
            <div style="height: 1px; background: var(--color-hairline); margin: 2cqw 0 2.5cqw;"></div>
            
            <div style="display: flex; flex-direction: column; gap: 2.2cqw;">
              ${faqData.items.slice(0, 4).map((item, idx) => `
                <div style="border-top: ${idx > 0 ? '1px solid var(--color-hairline)' : 'none'}; padding-top: ${idx > 0 ? '1.5cqw' : '0'};">
                  <div style="display: flex; gap: 2cqw; align-items: baseline;">
                    <span style="font-family: var(--font-serif); font-size: 2.2cqw; font-weight: 700; color: var(--color-primary);">0${idx + 1}.</span>
                    <h3 style="font-size: 2.3cqw; color: var(--color-ink);">${item.q}</h3>
                  </div>
                  <p style="font-size: 1.7cqw; line-height: 1.5; color: var(--color-ink-light); margin-top: 0.5cqw; padding-left: 4.2cqw;">
                    ${item.a}
                  </p>
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
    if (this.isPageEnabled("p20_backcover")) {
      const whatsappDisp = (data.studio && data.studio.whatsappDisplay) ? data.studio.whatsappDisplay : "+57 300 627 9079";
      const instagram = (data.studio && data.studio.instagram) ? data.studio.instagram : "dannamesa_studio";
      const backCoverTitle = lb.backCoverTitle || "Danna Mesa Studio";
      const backCoverQuote = lb.backCoverQuote || "Tu mirada, nuestro sello.";
      const backCoverCta = lb.backCoverCta || "Una experiencia creada para resaltar tu esencia natural.";

      html += `
        <section class="lb-page dark" id="lb-page-${pageCounter}">
          ${editBadge("p20_backcover")}
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
    }

    this.container.innerHTML = html;
    this.isRendered = true;
  }

  renderTwoServicesPage(pageNum, topTitle, mainTitle, introDesc, s1, s2, pageKey, isAdmin) {
    if (!s1) return "";
    const pStr = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;
    const editBadge = isAdmin ? `<button type="button" class="lb-page-edit-badge" onclick="event.stopPropagation(); window.lookbookManager.openPageEditor('${pageKey}')">✏️ Editar</button>` : "";

    return `
      <section class="lb-page" id="lb-page-${pageNum}">
        ${editBadge}
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
              ${(() => {
                const isSingle1 = ["ext-clasicas-naturales", "ext-efecto-pestanina", "ext-efecto-humedo", "ext-efecto-aura"].includes(s1.id);
                if (isSingle1) {
                  const retPrice = s1.retouch15_21 || s1.retouch15_17;
                  return retPrice ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(retPrice)}</span></div>` : '';
                } else {
                  const ret17 = s1.retouch15_17 || s1.retouch15_21;
                  const ret21 = s1.retouch18_21;
                  return `
                    ${ret17 ? `<div class="lb-spec-row"><span class="l">Retoque (15-17d)</span><span class="v">${this.state.formatMoney(ret17)}</span></div>` : ''}
                    ${ret21 ? `<div class="lb-spec-row"><span class="l">Retoque (18-21d)</span><span class="v">${this.state.formatMoney(ret21)}</span></div>` : ''}
                  `;
                }
              })()}
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
                ${(() => {
                  const isSingle2 = ["ext-clasicas-naturales", "ext-efecto-pestanina", "ext-efecto-humedo", "ext-efecto-aura"].includes(s2.id);
                  if (isSingle2) {
                    const retPrice2 = s2.retouch15_21 || s2.retouch15_17;
                    return retPrice2 ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(retPrice2)}</span></div>` : '';
                  } else {
                    const ret2_17 = s2.retouch15_17 || s2.retouch15_21;
                    const ret2_21 = s2.retouch18_21;
                    return `
                      ${ret2_17 ? `<div class="lb-spec-row"><span class="l">Retoque (15-17d)</span><span class="v">${this.state.formatMoney(ret2_17)}</span></div>` : ''}
                      ${ret2_21 ? `<div class="lb-spec-row"><span class="l">Retoque (18-21d)</span><span class="v">${this.state.formatMoney(ret2_21)}</span></div>` : ''}
                    `;
                  }
                })()}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>${pStr}</span></div>
      </section>
    `;
  }

  // ================= OPEN / CLOSE PAGE EDITOR =================
  // ================= OPEN / CLOSE PAGE EDITOR =================
  openPageEditor(pageKey) {
    const modal = document.getElementById("lookbookPageModal");
    if (!modal) return;

    this.activeEditPageKey = pageKey;
    this.currentBase64Uploads = {};

    const data = this.state.data;
    const lb = data.lookbook || {};
    const titleEl = document.getElementById("lbPageModalTitle");
    const dynamicFields = document.getElementById("lbPageDynamicFields");
    const photoSection = document.getElementById("lbPagePhotoSection");
    const previewImg = document.getElementById("lbPagePreviewImg");
    const sliderX = document.getElementById("lbPageSliderX");
    const sliderY = document.getElementById("lbPageSliderY");
    const posXVal = document.getElementById("lbPagePosXVal");
    const posYVal = document.getElementById("lbPagePosYVal");
    const quickSel = document.getElementById("lbPageQuickSelector");

    // Sincronizar selector rápido
    if (quickSel) {
      quickSel.innerHTML = this.getPagesDirectory()
        .map(p => `<option value="${p.key}">${p.displayLabel}</option>`)
        .join("");
      quickSel.value = pageKey;
    }

    let targetPhoto = null;
    let targetPos = "50% 50%";
    let fieldsHtml = "";
    photoSection.style.display = "none";

    const isPageActive = this.isPageEnabled(pageKey);
    const visibilityHeaderHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-paper-alt); padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid var(--color-hairline);">
        <div>
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary); display: block;">Visibilidad en Revista</span>
          <span style="font-size: 11px; color: ${isPageActive ? '#2e7d32' : '#d32f2f'}; font-weight: 600;">
            ${isPageActive ? '✅ Página Activa / Visible' : '🚫 Página Oculta / Desactivada'}
          </span>
        </div>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; font-weight: 600;">
          <input type="checkbox" id="editPageEnabledCheckbox" ${isPageActive ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--color-primary);">
          <span>Mostrar en Revista</span>
        </label>
      </div>
    `;

    // 1. PORTADA
    if (pageKey === "p1_cover") {
      titleEl.textContent = "Editar Portada Principal (Pág. 01)";
      photoSection.style.display = "block";
      targetPhoto = (data.hero && data.hero.image) ? data.hero.image : "assets/img/page_img_1.jpeg";
      targetPos = (data.hero && data.hero.imagePosition) ? data.hero.imagePosition : "center 20%";

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título de Portada</label><input type="text" id="editCoverTitle" value="${lb.coverTitle || data.studio.name}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
          <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Subtítulo de Portada</label><input type="text" id="editCoverSubtitle" value="${lb.coverSubtitle || 'Catálogo Colección 2026'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
        </div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Año / Temporada</label><input type="text" id="editCoverYear" value="${lb.coverYear || '2026'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
      `;
    }
    // 2. BIENVENIDA
    else if (pageKey === "p2_welcome") {
      titleEl.textContent = "Editar Bienvenida Editorial (Pág. 02)";
      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Kicker / Subtítulo Superior</label><input type="text" id="editWelcomeKicker" value="${lb.welcomeKicker || '01 · Bienvenida'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título Principal</label><input type="text" id="editWelcomeTitle" value="${lb.welcomeTitle || 'Bienvenida'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Manifiesto de Bienvenida</label><textarea id="editWelcomeLead" rows="3" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-family: inherit;">${lb.welcomeLead || data.studio.welcomeLead || ''}</textarea></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Mensaje de Confianza</label><textarea id="editWelcomeText" rows="2" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-family: inherit;">${lb.welcomeText || data.studio.welcomeText || ''}</textarea></div>
      `;
    }
    // 3. STUDIO EXPERIENCE
    else if (pageKey === "p3_studio") {
      titleEl.textContent = "Editar Studio Experience (Pág. 03)";
      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título</label><input type="text" id="editStudioTitle" value="${lb.studioTitle || 'Studio Experience'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Frase / Slogan de Marca</label><input type="text" id="editStudioQuote" value="${lb.studioQuote || data.studio.slogan || 'Tu mirada, nuestro sello.'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Descripción de la Experiencia</label><textarea id="editStudioDesc" rows="3" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-family: inherit;">${lb.studioDesc || 'Una experiencia creada para resaltar tu esencia natural con la más alta bioseguridad, técnicas avanzadas y atención 100% individualizada.'}</textarea></div>
      `;
    }
    // [NUEVO] GARANTÍA & SALUD OCULAR
    else if (pageKey === "p_salud_ocular") {
      titleEl.textContent = "Editar Garantía & Salud Ocular";
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

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título Principal</label><input type="text" id="editSoTitle" value="${so.title}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Subtítulo General</label><textarea id="editSoSubtitle" rows="2" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);">${so.subtitle}</textarea></div>
        <div style="background: var(--color-paper-alt); border: 1px solid var(--color-hairline); border-radius: 8px; padding: 12px; margin-top: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">🌿 Pilar 1: Adhesivos</span>
          <input type="text" id="editSoP1Title" value="${so.p1Title}" style="width:100%; margin: 6px 0; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline); font-weight: 600;">
          <textarea id="editSoP1Desc" rows="2" style="width:100%; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline);">${so.p1Desc}</textarea>
        </div>
        <div style="background: var(--color-paper-alt); border: 1px solid var(--color-hairline); border-radius: 8px; padding: 12px; margin-top: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">🔬 Pilar 2: Aislamiento</span>
          <input type="text" id="editSoP2Title" value="${so.p2Title}" style="width:100%; margin: 6px 0; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline); font-weight: 600;">
          <textarea id="editSoP2Desc" rows="2" style="width:100%; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline);">${so.p2Desc}</textarea>
        </div>
        <div style="background: var(--color-paper-alt); border: 1px solid var(--color-hairline); border-radius: 8px; padding: 12px; margin-top: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">🧼 Pilar 3: Bioseguridad</span>
          <input type="text" id="editSoP3Title" value="${so.p3Title}" style="width:100%; margin: 6px 0; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline); font-weight: 600;">
          <textarea id="editSoP3Desc" rows="2" style="width:100%; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline);">${so.p3Desc}</textarea>
        </div>
      `;
    }
    // 4. DIVIDERS / SEPARADORES
    else if (pageKey.includes("divider")) {
      const isLift = pageKey.includes("lifting");
      const isExt = pageKey.includes("ext");
      const isCejas = pageKey.includes("cejas");
      const isLips = pageKey.includes("lips");

      titleEl.textContent = "Editar Separador de Colección";

      let defTitle = isLift ? lb.liftingDividerTitle || "Lifting" : (isExt ? lb.extensionsDividerTitle || "Extensiones" : (isCejas ? lb.cejasDividerTitle || "Cejas" : lb.hydralipsDividerTitle || "HydraLips"));
      let defQuote = isLift ? lb.liftingDividerQuote || "El servicio insignia" : (isExt ? lb.extensionsDividerQuote || "La mirada que siempre imaginaste." : (isCejas ? lb.cejasDividerQuote || "Un diseño pensado para tu rostro." : lb.hydralipsDividerQuote || "Tus labios en su mejor versión."));

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título del Separador</label><input type="text" id="editDividerTitle" value="${defTitle}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Frase / Cita de Colección</label><input type="text" id="editDividerQuote" value="${defQuote}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
      `;
    }
    // 5. GALERÍA DE RESULTADOS LIFTING (3 FOTOS DE CLIENTAS)
    else if (pageKey === "p6_lifting_evidence") {
      titleEl.textContent = "Editar Galería de Resultados Lifting (Pág. 06)";
      const liftingService = data.services.find(s => s.id === "lifting-coreano") || data.services[0];
      const gallery = (liftingService && liftingService.gallery) ? liftingService.gallery : [];

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div style="font-size: 12px; color: var(--color-ink-light); margin-bottom: 8px;">
          Edita las 3 fotografías de resultados de clientas reales que aparecen en la página 6:
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${[0, 1, 2].map(idx => {
            const g = gallery[idx] || { src: `assets/img/lifting_${idx+1}.jpeg`, title: `Resultado 0${idx+1}`, subtitle: "", position: "50% 30%" };
            const { posX, posY } = this.parsePosition(g.position);
            return `
              <div style="background: var(--color-paper-alt); border: 1px solid var(--color-hairline); border-radius: 8px; padding: 14px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary); display: block; margin-bottom: 8px;">
                  📸 Resultado Clienta 0${idx + 1}
                </span>
                <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 10px;">
                  <div style="width: 80px; height: 80px; border-radius: 6px; overflow: hidden; background: #000; flex-shrink: 0;">
                    <img id="img_preview_lift_g_${idx}" src="${g.src}" style="width:100%; height:100%; object-fit:cover; object-position: ${posX}% ${posY}%;" alt="Clienta ${idx+1}">
                  </div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                    <label class="btn btn-outline btn-sm" style="align-self: flex-start; cursor: pointer;">
                      🔄 Cambiar Foto
                      <input type="file" accept="image/*" style="display: none;" onchange="window.lookbookManager.handleDynamicPhotoUpload('lift_g_${idx}', event)">
                    </label>
                    <div style="display: flex; gap: 8px;">
                      <div style="flex: 1;">
                        <span style="font-size: 10px; color: var(--color-muted);">X: <b id="val_x_lift_g_${idx}">${posX}%</b></span>
                        <input type="range" id="slider_x_lift_g_${idx}" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--color-primary);" oninput="window.lookbookManager.handleDynamicSliderChange('lift_g_${idx}')">
                      </div>
                      <div style="flex: 1;">
                        <span style="font-size: 10px; color: var(--color-muted);">Y: <b id="val_y_lift_g_${idx}">${posY}%</b></span>
                        <input type="range" id="slider_y_lift_g_${idx}" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--color-primary);" oninput="window.lookbookManager.handleDynamicSliderChange('lift_g_${idx}')">
                      </div>
                    </div>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Título</label><input type="text" id="input_title_lift_g_${idx}" value="${g.title || `Resultado 0${idx+1}`}" style="width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--color-hairline);"></div>
                  <div><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Subtítulo / Efecto</label><input type="text" id="input_sub_lift_g_${idx}" value="${g.subtitle || ''}" style="width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--color-hairline);"></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }
    // 6. EXPERIENCIAS & COMBOS (PÁGINA 19/20)
    else if (pageKey === "p19_combos") {
      titleEl.textContent = "Editar Experiencias & Combos";
      const comboBanner = data.comboBanner || {};
      const expServices = data.services.filter(s => s.categoryId === "experiencias");

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div style="background: var(--color-paper-alt); border: 1px solid var(--color-hairline); border-radius: 8px; padding: 14px; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary); display: block; margin-bottom: 8px;">⭐ Encabezado del Banner</span>
          <div><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Título Principal</label><input type="text" id="editComboTitle" value="${comboBanner.title || 'Experiencias & Rituales'}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid var(--color-hairline); font-weight:600;"></div>
          <div style="margin-top: 8px;"><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Descripción General</label><textarea id="editComboDesc" rows="2" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid var(--color-hairline);">${comboBanner.desc || ''}</textarea></div>
        </div>

        <div style="font-size: 12px; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 6px;">✨ Efectos / Combos Incluidos:</div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${expServices.map((exp, idx) => `
            <div style="background: var(--color-paper-light); border: 1px solid var(--color-hairline); border-radius: 8px; padding: 12px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-ink); display: block; margin-bottom: 6px;">Combo 0${idx + 1}: ${exp.name}</span>
              <input type="hidden" id="exp_id_${idx}" value="${exp.id}">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px;">
                <div><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Nombre</label><input type="text" id="exp_name_${idx}" value="${exp.name}" style="width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--color-hairline); font-weight:600;"></div>
                <div><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Subtítulo / Beneficio</label><input type="text" id="exp_sub_${idx}" value="${exp.subtitle || ''}" style="width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--color-hairline);"></div>
              </div>
              <div style="margin-bottom: 6px;"><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Descripción</label><textarea id="exp_desc_${idx}" rows="2" style="width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--color-hairline);">${exp.desc || ''}</textarea></div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Precio Fijo (COP)</label><input type="number" id="exp_price_${idx}" value="${exp.price || ''}" placeholder="Opcional" style="width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--color-hairline); font-weight:700; color:var(--color-primary);"></div>
                <div><label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Tarifa / Texto de Precio</label><input type="text" id="exp_customLabel_${idx}" value="${exp.customPriceLabel || ''}" placeholder="Ej: Según pestañas elegidas" style="width:100%; padding:6px 8px; border-radius:4px; border:1px solid var(--color-hairline);"></div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }
    // [NUEVO] CUIDADO EN CASA & HIDRATANTE
    else if (pageKey === "p_cuidados_hidratante") {
      titleEl.textContent = "Editar Cuidado en Casa & Hidratante";
      photoSection.style.display = "block";
      const hidraProd = data.services.find(s => s.id === "cuidado-hidratante") || data.services.find(s => s.categoryId === "cuidados") || {
        name: "Hidratante de Pestañas y Cejas",
        subtitle: "Cuidado profesional en casa",
        desc: "Diseñado para acondicionar, nutrir y humectar pestañas y cejas. Su uso constante prolonga la retención de tus extensiones y estimula el crecimiento natural.",
        instructions: "Aplica una pequeña cantidad sobre pestañas o cejas limpias, preferiblemente por la noche. Distribuye suavemente y deja actuar.",
        price: 15000,
        image: "assets/img/hidratante.jpeg",
        imagePosition: "center center"
      };
      targetPhoto = hidraProd.image || "assets/img/hidratante.jpeg";
      targetPos = hidraProd.imagePosition || "center center";

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Nombre del Producto</label><input type="text" id="editHidraName" value="${hidraProd.name}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
          <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Subtítulo</label><input type="text" id="editHidraSub" value="${hidraProd.subtitle || ''}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
        </div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Descripción del Producto</label><textarea id="editHidraDesc" rows="3" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);">${hidraProd.desc || ''}</textarea></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Modo de Uso Sugerido</label><textarea id="editHidraInst" rows="2" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-style: italic;">${hidraProd.instructions || ''}</textarea></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Precio Fijo (COP)</label><input type="number" id="editHidraPrice" value="${hidraProd.price || 15000}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 700; color: var(--color-primary);"></div>
      `;
    }
    // [NUEVO] PREGUNTAS FRECUENTES (FAQ)
    else if (pageKey === "p_faq") {
      titleEl.textContent = "Editar Preguntas Frecuentes (FAQ)";
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

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
          <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título de Sección</label><input type="text" id="editFaqTitle" value="${faqData.title}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
          <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Subtítulo</label><input type="text" id="editFaqSubtitle" value="${faqData.subtitle}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
        </div>
        <div style="font-size: 12px; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 6px;">❓ Preguntas & Respuestas:</div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${faqData.items.map((item, idx) => `
            <div style="background: var(--color-paper-alt); border: 1px solid var(--color-hairline); border-radius: 8px; padding: 12px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 6px;">Pregunta 0${idx + 1}</span>
              <input type="text" id="faq_q_${idx}" value="${item.q}" style="width: 100%; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline); font-weight: 600; margin-bottom: 6px;">
              <textarea id="faq_a_${idx}" rows="2" style="width: 100%; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--color-hairline); font-family: inherit;">${item.a}</textarea>
            </div>
          `).join("")}
        </div>
      `;
    }
    // 7. POLÍTICAS DE RETOQUE
    else if (pageKey === "p14_policies") {
      titleEl.textContent = "Editar Políticas de Retoque";
      const pol = data.retouchPolicies || {};
      const condStr = Array.isArray(pol.conditions) ? pol.conditions.join("\n") : "";

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título de la Sección</label><input type="text" id="editPolTitle" value="${pol.title || 'Políticas de retoque'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Subtítulo / Introducción</label><textarea id="editPolSub" rows="2" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);">${pol.subtitle || ''}</textarea></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Condiciones para Retoque (Una por línea)</label><textarea id="editPolConditions" rows="4" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-family: inherit;">${condStr}</textarea></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Nota Aclaratoria</label><input type="text" id="editPolNote" value="${pol.note || ''}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
      `;
    }
    // 8. CONTRAPORTADA & CONTACTO
    else if (pageKey === "p20_backcover") {
      titleEl.textContent = "Editar Contraportada & Contacto";
      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Título de Marca</label><input type="text" id="editBackTitle" value="${lb.backCoverTitle || data.studio.name || 'Danna Mesa Studio'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Frase / Cita de Cierre</label><input type="text" id="editBackQuote" value="${lb.backCoverQuote || data.studio.slogan || 'Tu mirada, nuestro sello.'}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);"></div>
        <div><label style="font-size: 11px; font-weight: 700; text-transform: uppercase;">Mensaje Final / Llamado a la Acción</label><textarea id="editBackCta" rows="2" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);">${lb.backCoverCta || 'Una experiencia creada para resaltar tu esencia natural.'}</textarea></div>
      `;
    }
    // 9. PÁGINAS DE SERVICIOS (1 O 2 EFECTOS CON FOTOS, ENCUADRES, TEXTOS Y PRECIOS COMPLETOS)
    else {
      // Buscar servicios asociados a esta página
      let targetServices = [];
      const pEntry = this.pagesDirectory.find(p => p.key === pageKey);

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

      titleEl.textContent = `Editar Página: ${targetServices.map(s => s.name).join(" & ")}`;

      fieldsHtml = `
        ${visibilityHeaderHtml}
        <div style="font-size: 12px; color: var(--color-ink-light); margin-bottom: 8px;">
          Esta página contiene <strong>${targetServices.length} efecto(s)</strong>. Puedes editar la foto, encuadre X/Y, textos y tarifas de cada uno:
        </div>
        <div style="display: flex; flex-direction: column; gap: 18px;">
          ${targetServices.map((s, idx) => {
            const { posX, posY } = this.parsePosition(s.imagePosition || "center center");
            return `
              <div style="background: var(--color-paper-alt); border: 1px solid var(--color-hairline); border-radius: 10px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-hairline); padding-bottom: 8px;">
                  <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-primary); letter-spacing: 0.1em;">
                    👁️ Efecto 0${idx + 1}: ${s.name}
                  </span>
                  <span style="font-size: 11px; color: var(--color-muted);">${s.groupTitle || s.categoryId}</span>
                </div>

                <input type="hidden" id="multi_srv_id_${idx}" value="${s.id}">

                <!-- Foto y Sliders X/Y del Efecto -->
                <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 14px; background: var(--color-paper-light); padding: 12px; border-radius: 8px;">
                  <div style="width: 90px; height: 90px; border-radius: 6px; overflow: hidden; background: #000; flex-shrink: 0;">
                    <img id="img_preview_srv_${idx}" src="${s.image || 'assets/img/page_img_1.jpeg'}" style="width:100%; height:100%; object-fit:cover; object-position: ${posX}% ${posY}%;" alt="${s.name}">
                  </div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                    <label class="btn btn-outline btn-sm" style="align-self: flex-start; cursor: pointer;">
                      🔄 Cambiar Foto del Efecto
                      <input type="file" accept="image/*" style="display: none;" onchange="window.lookbookManager.handleDynamicPhotoUpload('srv_${idx}', event)">
                    </label>
                    <div style="display: flex; gap: 8px;">
                      <div style="flex: 1;">
                        <span style="font-size: 10px; color: var(--color-muted);">Horizontal (X): <b id="val_x_srv_${idx}">${posX}%</b></span>
                        <input type="range" id="slider_x_srv_${idx}" min="0" max="100" value="${posX}" style="width: 100%; accent-color: var(--color-primary);" oninput="window.lookbookManager.handleDynamicSliderChange('srv_${idx}')">
                      </div>
                      <div style="flex: 1;">
                        <span style="font-size: 10px; color: var(--color-muted);">Vertical (Y): <b id="val_y_srv_${idx}">${posY}%</b></span>
                        <input type="range" id="slider_y_srv_${idx}" min="0" max="100" value="${posY}" style="width: 100%; accent-color: var(--color-primary);" oninput="window.lookbookManager.handleDynamicSliderChange('srv_${idx}')">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Textos y Tarifas -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <div>
                    <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Nombre del Efecto</label>
                    <input type="text" id="multi_srv_name_${idx}" value="${s.name}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 600;">
                  </div>
                  <div>
                    <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Subtítulo (ej: 01 · Resultado sutil)</label>
                    <input type="text" id="multi_srv_sub_${idx}" value="${s.subtitle || ''}" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline);">
                  </div>
                </div>

                <div style="margin-bottom: 10px;">
                  <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Descripción del Efecto</label>
                  <textarea id="multi_srv_desc_${idx}" rows="2" style="width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-hairline); font-family: inherit;">${s.desc || ''}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">
                  <div>
                    <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Precio (COP)</label>
                    <input type="number" id="multi_srv_price_${idx}" value="${s.price || ''}" placeholder="Opcional" style="width: 100%; padding: 8px 8px; border-radius: 6px; border: 1px solid var(--color-hairline); font-weight: 700; color: var(--color-primary);">
                  </div>
                  <div>
                    <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Duración</label>
                    <input type="text" id="multi_srv_dur_${idx}" value="${s.duration || ''}" placeholder="ej: 3 a 5 sem" style="width: 100%; padding: 8px 8px; border-radius: 6px; border: 1px solid var(--color-hairline);">
                  </div>
                  <div>
                    <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Ret. 15-17d/21d</label>
                    <input type="number" id="multi_srv_ret15_${idx}" value="${s.retouch15_17 || s.retouch15_21 || ''}" placeholder="Opcional" style="width: 100%; padding: 8px 8px; border-radius: 6px; border: 1px solid var(--color-hairline);">
                  </div>
                  <div>
                    <label style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Ret. 18-21d</label>
                    <input type="number" id="multi_srv_ret18_${idx}" value="${s.retouch18_21 || ''}" placeholder="Opcional" style="width: 100%; padding: 8px 8px; border-radius: 6px; border: 1px solid var(--color-hairline);">
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    // Set Photo & Sliders si aplica foto general
    if (targetPhoto && photoSection.style.display !== "none") {
      previewImg.src = targetPhoto;
      const { posX, posY } = this.parsePosition(targetPos);
      sliderX.value = posX;
      sliderY.value = posY;
      posXVal.textContent = posX + "%";
      posYVal.textContent = posY + "%";
      previewImg.style.objectPosition = `${posX}% ${posY}%`;
    }

    dynamicFields.innerHTML = fieldsHtml;
    modal.style.display = "flex";
    modal.classList.add("active");
    modal.classList.add("open");
  }

  handleDynamicSliderChange(key) {
    const sX = document.getElementById(`slider_x_${key}`);
    const sY = document.getElementById(`slider_y_${key}`);
    const img = document.getElementById(`img_preview_${key}`);
    const valX = document.getElementById(`val_x_${key}`);
    const valY = document.getElementById(`val_y_${key}`);

    if (sX && sY && img) {
      const x = sX.value;
      const y = sY.value;
      if (valX) valX.textContent = `${x}%`;
      if (valY) valY.textContent = `${y}%`;
      img.style.objectPosition = `${x}% ${y}%`;
    }
  }

  handleDynamicPhotoUpload(key, event) {
    const file = event.target.files[0];
    if (!file) return;

    this.compressImage(file, 800, 0.65, (compressedBase64) => {
      this.currentBase64Uploads[key] = compressedBase64;
      const img = document.getElementById(`img_preview_${key}`);
      if (img) img.src = compressedBase64;
      if (window.catalogApp) window.catalogApp.showToast("✓ Foto cargada y optimizada");
    });
  }

  closePageEditor() {
    const modal = document.getElementById("lookbookPageModal");
    if (modal) {
      modal.classList.remove("active");
      modal.classList.remove("open");
      modal.style.display = "none";
    }
    this.activeEditPageKey = null;
    this.currentBase64Upload = null;
    this.currentBase64Uploads = {};
  }

  async handleSavePage(e) {
    e.preventDefault();
    if (!this.activeEditPageKey) return;
    const pageKey = this.activeEditPageKey;
    const data = this.state.data;
    if (!data.lookbook) data.lookbook = {};

    const saveBtn = document.getElementById("saveLbPageModalBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "⏳ Guardando en la nube...";
    }

    try {
      // 0. VISIBILIDAD DE LA PÁGINA
      const isEnabledCheck = document.getElementById("editPageEnabledCheckbox");
      if (isEnabledCheck) {
        if (!Array.isArray(data.lookbook.disabledPages)) data.lookbook.disabledPages = [];
        if (isEnabledCheck.checked) {
          data.lookbook.disabledPages = data.lookbook.disabledPages.filter(p => p !== pageKey);
        } else {
          if (!data.lookbook.disabledPages.includes(pageKey)) {
            data.lookbook.disabledPages.push(pageKey);
          }
        }
      }

      // 1. PORTADA
      if (pageKey === "p1_cover") {
        const cTitle = document.getElementById("editCoverTitle");
        const cSub = document.getElementById("editCoverSubtitle");
        const cYear = document.getElementById("editCoverYear");
        const sliderX = document.getElementById("lbPageSliderX");
        const sliderY = document.getElementById("lbPageSliderY");

        if (cTitle) data.lookbook.coverTitle = cTitle.value.trim();
        if (cSub) data.lookbook.coverSubtitle = cSub.value.trim();
        if (cYear) data.lookbook.coverYear = cYear.value.trim();
        if (this.currentBase64Upload) data.hero.image = this.currentBase64Upload;
        if (sliderX && sliderY) data.hero.imagePosition = `${sliderX.value}% ${sliderY.value}%`;
      }
      // 2. BIENVENIDA
      else if (pageKey === "p2_welcome") {
        const kicker = document.getElementById("editWelcomeKicker");
        const title = document.getElementById("editWelcomeTitle");
        const lead = document.getElementById("editWelcomeLead");
        const text = document.getElementById("editWelcomeText");

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
        const sTitle = document.getElementById("editStudioTitle");
        const sQuote = document.getElementById("editStudioQuote");
        const sDesc = document.getElementById("editStudioDesc");

        if (sTitle) data.lookbook.studioTitle = sTitle.value.trim();
        if (sQuote) {
          data.lookbook.studioQuote = sQuote.value.trim();
          if (data.studio) data.studio.slogan = sQuote.value.trim();
        }
        if (sDesc) data.lookbook.studioDesc = sDesc.value.trim();
      }
      // [NUEVO] GARANTÍA & SALUD OCULAR
      else if (pageKey === "p_salud_ocular") {
        const sTitle = document.getElementById("editSoTitle");
        const sSub = document.getElementById("editSoSubtitle");
        const p1T = document.getElementById("editSoP1Title");
        const p1D = document.getElementById("editSoP1Desc");
        const p2T = document.getElementById("editSoP2Title");
        const p2D = document.getElementById("editSoP2Desc");
        const p3T = document.getElementById("editSoP3Title");
        const p3D = document.getElementById("editSoP3Desc");

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
        const dTitle = document.getElementById("editDividerTitle");
        const dQuote = document.getElementById("editDividerQuote");

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
            const titleInput = document.getElementById(`input_title_lift_g_${idx}`);
            const subInput = document.getElementById(`input_sub_lift_g_${idx}`);
            const sX = document.getElementById(`slider_x_lift_g_${idx}`);
            const sY = document.getElementById(`slider_y_lift_g_${idx}`);

            if (titleInput) g.title = titleInput.value.trim();
            if (subInput) g.subtitle = subInput.value.trim();
            if (sX && sY) g.position = `${sX.value}% ${sY.value}%`;
            if (this.currentBase64Uploads[`lift_g_${idx}`]) {
              g.src = this.currentBase64Uploads[`lift_g_${idx}`];
            }
          });
        }
      }
      // 6. COMBOS & EXPERIENCIAS
      else if (pageKey === "p19_combos") {
        const cTitle = document.getElementById("editComboTitle");
        const cDesc = document.getElementById("editComboDesc");
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
          const nameInput = document.getElementById(`exp_name_${idx}`);
          const subInput = document.getElementById(`exp_sub_${idx}`);
          const descInput = document.getElementById(`exp_desc_${idx}`);
          const priceInput = document.getElementById(`exp_price_${idx}`);
          const customLabelInput = document.getElementById(`exp_customLabel_${idx}`);

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

        const hName = document.getElementById("editHidraName");
        const hSub = document.getElementById("editHidraSub");
        const hDesc = document.getElementById("editHidraDesc");
        const hInst = document.getElementById("editHidraInst");
        const hPrice = document.getElementById("editHidraPrice");
        const sliderX = document.getElementById("lbPageSliderX");
        const sliderY = document.getElementById("lbPageSliderY");

        if (hName) hidraProd.name = hName.value.trim();
        if (hSub) hidraProd.subtitle = hSub.value.trim();
        if (hDesc) hidraProd.desc = hDesc.value.trim();
        if (hInst) hidraProd.instructions = hInst.value.trim();
        if (hPrice) hidraProd.price = hPrice.value.trim() === "" ? 15000 : parseInt(hPrice.value, 10);
        if (this.currentBase64Upload) hidraProd.image = this.currentBase64Upload;
        if (sliderX && sliderY) hidraProd.imagePosition = `${sliderX.value}% ${sliderY.value}%`;
      }
      // [NUEVO] PREGUNTAS FRECUENTES (FAQ)
      else if (pageKey === "p_faq") {
        const fTitle = document.getElementById("editFaqTitle");
        const fSub = document.getElementById("editFaqSubtitle");

        if (!data.lookbook.faq) data.lookbook.faq = { items: [] };
        if (fTitle) data.lookbook.faq.title = fTitle.value.trim();
        if (fSub) data.lookbook.faq.subtitle = fSub.value.trim();

        const items = [];
        let idx = 0;
        while (document.getElementById(`faq_q_${idx}`)) {
          const qEl = document.getElementById(`faq_q_${idx}`);
          const aEl = document.getElementById(`faq_a_${idx}`);
          if (qEl && aEl) {
            items.push({ q: qEl.value.trim(), a: aEl.value.trim() });
          }
          idx++;
        }
        if (items.length > 0) data.lookbook.faq.items = items;
      }
      // 7. POLÍTICAS
      else if (pageKey === "p14_policies") {
        const pTitle = document.getElementById("editPolTitle");
        const pSub = document.getElementById("editPolSub");
        const pCond = document.getElementById("editPolConditions");
        const pNote = document.getElementById("editPolNote");

        if (!data.retouchPolicies) data.retouchPolicies = {};
        if (pTitle) data.retouchPolicies.title = pTitle.value.trim();
        if (pSub) data.retouchPolicies.subtitle = pSub.value.trim();
        if (pCond) data.retouchPolicies.conditions = pCond.value.split("\n").map(c => c.trim()).filter(Boolean);
        if (pNote) data.retouchPolicies.note = pNote.value.trim();
      }
      // 8. CONTRAPORTADA
      else if (pageKey === "p20_backcover") {
        const bTitle = document.getElementById("editBackTitle");
        const bQuote = document.getElementById("editBackQuote");
        const bCta = document.getElementById("editBackCta");

        if (bTitle) data.lookbook.backCoverTitle = bTitle.value.trim();
        if (bQuote) data.lookbook.backCoverQuote = bQuote.value.trim();
        if (bCta) data.lookbook.backCoverCta = bCta.value.trim();
      }
      // 9. SERVICIOS (1 O MÚLTIPLES EFECTOS)
      else {
        let idx = 0;
        while (document.getElementById(`multi_srv_id_${idx}`)) {
          const sId = document.getElementById(`multi_srv_id_${idx}`).value;
          const s = data.services.find(x => x.id === sId);
          if (s) {
            const nameInput = document.getElementById(`multi_srv_name_${idx}`);
            const subInput = document.getElementById(`multi_srv_sub_${idx}`);
            const descInput = document.getElementById(`multi_srv_desc_${idx}`);
            const priceInput = document.getElementById(`multi_srv_price_${idx}`);
            const durInput = document.getElementById(`multi_srv_dur_${idx}`);
            const ret15Input = document.getElementById(`multi_srv_ret15_${idx}`) || document.getElementById(`multi_srv_ret_${idx}`);
            const ret18Input = document.getElementById(`multi_srv_ret18_${idx}`);
            const sX = document.getElementById(`slider_x_srv_${idx}`);
            const sY = document.getElementById(`slider_y_srv_${idx}`);

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
            if (this.currentBase64Uploads[`srv_${idx}`]) {
              s.image = this.currentBase64Uploads[`srv_${idx}`];
            }
          }
          idx++;
        }
      }

      await this.state.saveToCloud(this.state.data);
      this.closePageEditor();
      this.render();
      if (window.catalogApp) window.catalogApp.showToast("✓ ¡Página y todos sus efectos guardados exitosamente!");
    } catch (err) {
      this.closePageEditor();
      this.render();
      if (window.catalogApp) window.catalogApp.showToast("✓ Cambios aplicados localmente");
      console.warn("Save page notice:", err);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "💾 Guardar Cambios en Firestore";
      }
    }
  }

  parsePosition(posStr) {
    if (!posStr) return { posX: 50, posY: 50 };
    const parts = posStr.split(" ");
    let posX = 50;
    let posY = 50;

    if (parts[0] === "center") posX = 50;
    else if (parts[0] === "left") posX = 0;
    else if (parts[0] === "right") posX = 100;
    else posX = parseInt(parts[0], 10) || 50;

    if (parts[1]) {
      if (parts[1] === "center") posY = 50;
      else if (parts[1] === "top") posY = 0;
      else if (parts[1] === "bottom") posY = 100;
      else posY = parseInt(parts[1], 10) || 50;
    }

    return { posX, posY };
  }

  compressImage(file, maxDimension, quality, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Instanciar Lookbook globalmente
document.addEventListener("DOMContentLoaded", () => {
  window.lookbookManager = new LookbookManager();
  if (window.catalogState && window.catalogState.data) {
    window.lookbookManager.render();
  }
});
