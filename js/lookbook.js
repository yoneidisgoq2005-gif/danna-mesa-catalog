/**
 * ==========================================================================
 * DANNA MESA STUDIO — LOOKBOOK MAGAZINE RENDERER (100% DINÁMICO & EDITABLE)
 * Renderiza la revista editorial sincronizada en tiempo real con Firestore
 * ==========================================================================
 */

class LookbookManager {
  constructor() {
    this.state = window.catalogState;
    this.container = document.getElementById("lookbookStageContainer");
    this.isRendered = false;

    // Suscribirse a cambios en tiempo real del catálogo
    window.addEventListener("catalogDataChanged", () => {
      this.render();
    });
  }

  render() {
    if (!this.container) return;
    const data = this.state.data;
    if (!data) return;

    const lb = data.lookbook || (typeof DEFAULT_CATALOG_DATA !== 'undefined' ? DEFAULT_CATALOG_DATA.lookbook : {}) || {};

    let html = "";
    let pageCounter = 1;

    // ================= PÁGINA 1: PORTADA =================
    const heroImg = (data.hero && data.hero.image) ? data.hero.image : "assets/img/page_img_1.jpeg";
    const heroPos = (data.hero && data.hero.imagePosition) ? data.hero.imagePosition : "center 20%";
    const coverTitle = lb.coverTitle || (data.studio && data.studio.name) || "Danna Mesa";
    const coverSubtitle = lb.coverSubtitle || "Catálogo Colección 2026";
    const coverYear = lb.coverYear || "2026";
    const studioLoc = (data.studio && data.studio.location) ? data.studio.location : "Armenia · Quindío, Colombia";

    html += `
      <section class="lb-page lb-cover" id="lb-page-${pageCounter}">
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

    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
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

    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
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

    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 1</span></div>
        <div class="big-title">${liftingDivTitle}</div>
        <div class="lead-quote">${liftingDivQuote}</div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>0${pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

    // ================= PÁGINA 5 & 6: LIFTING RESULTADOS =================
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

    const liftGallery = liftingService.gallery || [
      { src: "assets/img/lifting_1.jpeg", position: "center 30%", title: "Resultado 01", subtitle: "Elevación y Curvatura Natural" },
      { src: "assets/img/lifting_2.jpeg", position: "center 30%", title: "Resultado 02", subtitle: "Definición & Máxima Longitud" },
      { src: "assets/img/lifting_3.jpeg", position: "center 45%", title: "Resultado 03", subtitle: "Intenso y duradero" }
    ];

    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
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
    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
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

    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
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

      if (s1 && s2) {
        const topTag = s1.groupTitle || s1.type || "Extensiones";
        html += this.renderTwoServicesPage(pageCounter, `Extensiones · ${topTag}`, topTag, "Efectos y densidades personalizados para cada tipo de mirada.", s1, s2);
        pageCounter++;
      } else if (s1 && !s2) {
        html += `
          <section class="lb-page" id="lb-page-${pageCounter}">
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

    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
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

    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
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
      if (s1 && s2) {
        html += this.renderTwoServicesPage(pageCounter, "Cejas · Diseño & Definición", "Cejas", "Cada rostro es único. Creamos equilibrio, definición y armonía.", s1, s2);
        pageCounter++;
      } else if (s1) {
        html += this.renderTwoServicesPage(pageCounter, "Cejas · Diseño & Definición", "Cejas", "Cada rostro es único. Creamos equilibrio, definición y armonía.", s1, s1);
        pageCounter++;
      }
    }

    // ================= PÁGINA DIVIDER HYDRALIPS =================
    const lipsDivTitle = lb.hydralipsDividerTitle || "HydraLips";
    const lipsDivQuote = lb.hydralipsDividerQuote || "Tus labios en su mejor versión.";

    html += `
      <section class="lb-page dark lb-divider" id="lb-page-${pageCounter}">
        <div class="lb-run top"><span>${coverTitle}</span><span class="tick">·</span><span>Colección 4</span></div>
        <div class="big-title" style="font-size: 8.5cqw;">${lipsDivTitle}</div>
        <div class="lead-quote">${lipsDivQuote}</div>
        <div class="lb-run bot"><span>Colección ${coverYear}</span><span>${pageCounter < 10 ? '0' + pageCounter : pageCounter}</span></div>
      </section>
    `;
    pageCounter++;

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

    html += `
      <section class="lb-page" id="lb-page-${pageCounter}">
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
      html += `
        <section class="lb-page" id="lb-page-${pageCounter}">
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

    html += `
      <section class="lb-page dark" id="lb-page-${pageCounter}">
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
  }

  renderTwoServicesPage(pageNum, topTitle, mainTitle, introDesc, s1, s2) {
    if (!s1) return "";
    const pStr = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;

    return `
      <section class="lb-page" id="lb-page-${pageNum}">
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
}

// Instanciar Lookbook globalmente
window.lookbookManager = new LookbookManager();
