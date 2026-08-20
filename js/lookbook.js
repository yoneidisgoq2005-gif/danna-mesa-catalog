/**
 * Danna Mesa Studio — Lookbook Magazine Renderer
 * Renderiza las 27 páginas editoriales de alta costura, navegación de revista y modo de impresión en PDF.
 */

class LookbookManager {
  constructor() {
    this.state = window.catalogState;
    this.container = document.getElementById("lookbookStageContainer");
    this.isRendered = false;
  }

  render() {
    if (!this.container) return;
    const data = this.state.data;

    let html = "";

    // ================= PÁGINA 1: PORTADA =================
    html += `
      <section class="lb-page lb-cover" id="lb-page-1">
        <div class="bleed"><img class="bleed-img" src="assets/img/page_img_1.jpeg" alt="Portada Danna Mesa"></div>
        <div class="scrim"></div>
        <div class="lb-run top"><span>Studio Experience</span><span class="tick">·</span><span>Colección 2026</span></div>
        <div class="brand">
          <h1 class="wm">${data.studio.name}</h1>
          <div class="sub"><span class="ln"></span><span>Catálogo Colección 2026</span></div>
        </div>
        <span class="yr">2026</span>
        <div class="lb-run bot"><span>${data.studio.location}</span><span>01</span></div>
      </section>
    `;

    // ================= PÁGINA 2: BIENVENIDA =================
    html += `
      <section class="lb-page" id="lb-page-2">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>01 — Bienvenida</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 18%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4em; color: var(--color-primary);">01 · Bienvenida</span>
          <h2 style="font-size: 8.5cqw; margin-top: 1.5cqw;">Bienvenida</h2>
          <div style="height: 1px; background: var(--color-hairline); margin: 3cqw 0;"></div>
          <p style="font-family: var(--font-serif); font-size: 3.2cqw; line-height: 1.35; color: var(--color-ink); max-width: 85%;">
            ${data.studio.welcomeLead}
          </p>
          <p style="font-size: 2.1cqw; line-height: 1.6; color: var(--color-ink-light); margin-top: 2.5cqw; max-width: 80%;">
            ${data.studio.welcomeText}
          </p>
          <div style="margin-top: 6cqw; border-top: 2px solid var(--color-primary); padding-top: 1.5cqw; display: inline-block;">
            <div style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.24em; font-size: 1.8cqw;">${data.studio.name}</div>
            <div style="font-size: 1.3cqw; text-transform: uppercase; letter-spacing: 0.3em; color: var(--color-muted);">${data.studio.tagline}</div>
          </div>
        </div>
        <div class="lb-run bot"><span>Studio Experience</span><span>02</span></div>
      </section>
    `;

    // ================= PÁGINA 3: DANNA MESA STUDIO =================
    html += `
      <section class="lb-page" id="lb-page-3">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>02 — Studio Experience</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 18%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4em; color: var(--color-primary);">02 · Danna Mesa</span>
          <h2 style="font-size: 8cqw; margin-top: 1cqw;">Danna Mesa</h2>
          <div style="height: 1px; background: var(--color-hairline); margin: 3cqw 0 4cqw;"></div>
          
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 3.2cqw; line-height: 1.35; color: var(--color-primary); margin-bottom: 2cqw;">
            "Tu mirada, nuestro sello."
          </p>
          <p style="font-size: 2.2cqw; line-height: 1.6; color: var(--color-ink-light); max-width: 85%;">
            Una experiencia creada para resaltar tu esencia natural con la más alta bioseguridad, técnicas avanzadas y atención 100% individualizada.
          </p>
          
          <div style="margin-top: 5cqw; display: flex; gap: 4cqw; border-top: 1px solid var(--color-hairline); padding-top: 2cqw;">
            <div>
              <span style="font-size: 1.3cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); font-weight: 600; display: block;">Especialidad</span>
              <span style="font-size: 2cqw; font-weight: 500;">Pestañas · Cejas · Labios</span>
            </div>
            <div>
              <span style="font-size: 1.3cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); font-weight: 600; display: block;">Ubicación</span>
              <span style="font-size: 2cqw; font-weight: 500;">${data.studio.location}</span>
            </div>
          </div>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>03</span></div>
      </section>
    `;

    // ================= PÁGINA 4: DIVIDER LIFTING =================
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-4">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Colección 1</span></div>
        <div class="big-title">Lifting</div>
        <div class="lead-quote">El servicio insignia</div>
        <div class="lb-run bot"><span>Colección 2026</span><span>04</span></div>
      </section>
    `;

    // ================= PÁGINA 5 & 6: LIFTING RESULTADOS =================
    const liftingService = data.services.find(s => s.id === "lifting-coreano");
    html += `
      <section class="lb-page" id="lb-page-5">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Lifting de Pestañas</span></div>
        <div style="position: absolute; left: 0; top: 0; width: 50%; height: 100%; overflow: hidden;">
          <img src="${liftingService.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="Lifting">
        </div>
        <div style="position: absolute; right: 0; top: 0; width: 50%; height: 100%; padding: 22% 8% 0 8%;">
          <span style="font-size: 1.4cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary); border-top: 1px solid var(--color-primary); padding-top: 1.5cqw; display: block; margin-bottom: 2cqw;">Colección 1 · Lifting</span>
          <h2 style="font-size: 5.5cqw; line-height: 1; margin-bottom: 2.5cqw;">Resalta lo que ya eres</h2>
          <p style="font-size: 2cqw; line-height: 1.6; color: var(--color-ink-light);">${liftingService.desc}</p>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>05</span></div>
      </section>

      <section class="lb-page" id="lb-page-6">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>03 — Resultados Reales</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 12%; display: flex; gap: 3.5%;">
          <div style="flex: 1;">
            <div style="aspect-ratio: 3/4; overflow: hidden; position: relative; border-radius: 4px;"><img src="assets/img/lifting_1.jpeg" style="width:100%; height:100%; object-fit:cover; object-position: center 30%;"></div>
            <div style="display:flex; justify-content:space-between; font-size:1.3cqw; font-weight:600; text-transform:uppercase; margin-top:0.8cqw;"><span style="color:var(--color-primary);">Curvatura</span><span class="tick">01</span></div>
          </div>
          <div style="flex: 1;">
            <div style="aspect-ratio: 3/4; overflow: hidden; position: relative; border-radius: 4px;"><img src="assets/img/lifting_2.jpeg" style="width:100%; height:100%; object-fit:cover; object-position: center 30%;"></div>
            <div style="display:flex; justify-content:space-between; font-size:1.3cqw; font-weight:600; text-transform:uppercase; margin-top:0.8cqw;"><span style="color:var(--color-primary);">Longitud</span><span class="tick">02</span></div>
          </div>
          <div style="flex: 1;">
            <div style="aspect-ratio: 3/4; overflow: hidden; position: relative; border-radius: 4px;"><img src="assets/img/lifting_3.jpeg" style="width:100%; height:100%; object-fit:cover; object-position: center 45%;"></div>
            <div style="display:flex; justify-content:space-between; font-size:1.3cqw; font-weight:600; text-transform:uppercase; margin-top:0.8cqw;"><span style="color:var(--color-primary);">Tinte Negro</span><span class="tick">03</span></div>
          </div>
        </div>
        <div style="position: absolute; left: 9%; right: 9%; top: 56%;">
          <h3 style="font-size: 4cqw; margin-bottom: 1cqw;">${liftingService.name}</h3>
          <p style="font-size: 1.8cqw; line-height: 1.55; color: var(--color-ink-light); max-width: 85%;">${liftingService.desc}</p>
        </div>
        <div style="position: absolute; left: 9%; right: 9%; bottom: 10%; display: flex; border-top: 1px solid var(--color-hairline); padding-top: 2cqw;">
          <div style="flex: 1; border-right: 1px solid var(--color-hairline);"><span style="font-size:1.3cqw; text-transform:uppercase; color:var(--color-primary); font-weight:600; display:block;">Duración</span><span style="font-family:var(--font-serif); font-size:2.6cqw;">${liftingService.duration}</span></div>
          <div style="flex: 1; padding-left: 4cqw; border-right: 1px solid var(--color-hairline);"><span style="font-size:1.3cqw; text-transform:uppercase; color:var(--color-primary); font-weight:600; display:block;">Tiempo</span><span style="font-family:var(--font-serif); font-size:2.6cqw;">${liftingService.appointmentTime}</span></div>
          <div style="flex: 1; padding-left: 4cqw;"><span style="font-size:1.3cqw; text-transform:uppercase; color:var(--color-primary); font-weight:600; display:block;">Valor</span><span style="font-family:var(--font-serif); font-size:3cqw; color:var(--color-primary);">${this.state.formatMoney(liftingService.price)}</span></div>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>06</span></div>
      </section>
    `;

    // ================= PÁGINA 7: DIVIDER EXTENSIONES =================
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-7">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Colección 2</span></div>
        <div class="big-title" style="font-size: 9.5cqw;">Extensiones</div>
        <div class="lead-quote">La mirada que siempre imaginaste.</div>
        <div class="lb-run bot"><span>Colección 2026</span><span>07</span></div>
      </section>
    `;

    // Renderizar resto de páginas dinámicamente con la información
    // PÁGINA 8 (Sutiles: Clásicas + Pestañina)
    const clasicas = data.services.find(s => s.id === "ext-clasicas-naturales");
    const pestanina = data.services.find(s => s.id === "ext-efecto-pestanina");
    html += this.renderTwoServicesPage(8, "Extensiones · Sutiles", "Sutiles", "Efectos naturales que realzan tu mirada sin que se noten postizos.", clasicas, pestanina);

    // PÁGINA 9 (Expresivas: Húmedo + Aura)
    const humedo = data.services.find(s => s.id === "ext-efecto-humedo");
    const aura = data.services.find(s => s.id === "ext-efecto-aura");
    html += this.renderTwoServicesPage(9, "Extensiones · Expresivas", "Expresivas", "Acabados de alto impacto para quienes disfrutan del protagonismo.", humedo, aura);

    // PÁGINA 10 (Volumen: Bloom + Hawaiano)
    const bloom = data.services.find(s => s.id === "ext-volumen-bloom");
    const hawaiano = data.services.find(s => s.id === "ext-volumen-hawaiano");
    html += this.renderTwoServicesPage(10, "Extensiones · Volumen", "Volumen Suave", "Densidad y cuerpo, del volumen más suave al más definido.", bloom, hawaiano);

    // PÁGINA 11 (Volumen: Egipcio + 5D)
    const egipcio = data.services.find(s => s.id === "ext-volumen-egipcio");
    const vol5d = data.services.find(s => s.id === "ext-volumen-5d");
    html += this.renderTwoServicesPage(11, "Extensiones · Volumen Intenso", "Volumen Intenso", "Para quienes buscan una mirada con más cuerpo, intensidad y profundidad.", egipcio, vol5d);

    // PÁGINA 12 (Artísticos: Wispy + Foxy)
    const wispy = data.services.find(s => s.id === "ext-efecto-wispy");
    const foxy = data.services.find(s => s.id === "ext-efecto-foxy");
    html += this.renderTwoServicesPage(12, "Extensiones · Artísticos", "Artísticos", "Diseños con carácter y diseño para quienes aman lo diferente.", wispy, foxy);

    // PÁGINA 13 (Artísticos: Bratz)
    const bratz = data.services.find(s => s.id === "ext-efecto-bratz");
    html += `
      <section class="lb-page" id="lb-page-13">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Extensiones · Artísticos</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 12%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Colección 2 · Extensiones</span>
          <h2 style="font-size: 7.5cqw; margin-top: 0.8cqw;">Artísticos</h2>
          <p style="font-size: 1.9cqw; color: var(--color-ink-light); margin-top: 1cqw;">El cierre de la colección: longitud, textura y mucha actitud.</p>
          <div style="height: 1px; background: var(--color-hairline); margin: 2.5cqw 0;"></div>
        </div>
        <div class="lb-service-grid" style="top: 36%;">
          <div class="lb-service-row">
            <div class="im" style="width: 42%; aspect-ratio: 4/3;"><img src="${bratz.image}" alt="${bratz.name}"></div>
            <div class="tx">
              <div class="n">03</div>
              <div class="nm">${bratz.name}</div>
              <div class="desc">${bratz.desc}</div>
              <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${bratz.duration}</span></div>
              <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(bratz.price)}</span></div>
              <div class="lb-spec-row"><span class="l">Retoque (15-21 días)</span><span class="v">${this.state.formatMoney(bratz.retouch15_21)}</span></div>
            </div>
          </div>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>13</span></div>
      </section>
    `;

    // PÁGINA 14: POLÍTICAS DE RETOQUE
    html += `
      <section class="lb-page" id="lb-page-14">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Políticas</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 12%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Condiciones del servicio</span>
          <h2 style="font-size: 7cqw; margin-top: 0.8cqw;">Políticas de retoque</h2>
          <div style="height: 1px; background: var(--color-hairline); margin: 2.5cqw 0;"></div>
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 2.2cqw; line-height: 1.4; color: var(--color-ink); margin-bottom: 2cqw;">
            Para conservar la armonía y calidad de tus pestañas, los retoques se realizan únicamente hasta los 21 días posteriores a la aplicación.
          </p>
          <ul style="list-style: none; font-size: 2cqw; line-height: 1.5; color: var(--color-ink-light); margin-bottom: 3cqw;">
            ${data.retouchPolicies.conditions.map(c => `<li style="margin-bottom: 1cqw;">• ${c}</li>`).join("")}
          </ul>
          <p style="font-size: 1.7cqw; font-style: italic; color: var(--color-muted); border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
            ${data.retouchPolicies.note}
          </p>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>14</span></div>
      </section>
    `;

    // PÁGINA 15: DIVIDER CEJAS
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-15">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Colección 3</span></div>
        <div class="big-title">Cejas</div>
        <div class="lead-quote">Un diseño pensado para tu rostro.</div>
        <div class="lb-run bot"><span>Colección 2026</span><span>15</span></div>
      </section>
    `;

    // PÁGINA 16: CEJAS DISEÑO & HENNA
    const disenoCejas = data.services.find(s => s.id === "cejas-diseno-depilacion");
    const henna = data.services.find(s => s.id === "cejas-henna");
    html += this.renderTwoServicesPage(16, "Cejas · Diseño y Color", "Cejas", "Cada rostro es único. Creamos equilibrio, definición y armonía.", disenoCejas, henna);

    // PÁGINA 17 & 18: LAMINADO DE CEJAS
    const lamPro = data.services.find(s => s.id === "cejas-laminado-pro");
    const lamPrem = data.services.find(s => s.id === "cejas-laminado-premium");
    html += this.renderTwoServicesPage(18, "Cejas · Laminado", "Planes de Laminado", "Alisa, direcciona y define el vello natural para mayor simetría y orden.", lamPro, lamPrem);

    // PÁGINA 19: DIVIDER HYDRALIPS
    html += `
      <section class="lb-page dark lb-divider" id="lb-page-19">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Colección 4</span></div>
        <div class="big-title" style="font-size: 8.5cqw;">HydraLips</div>
        <div class="lead-quote">Tus labios en su mejor versión.</div>
        <div class="lb-run bot"><span>Colección 2026</span><span>19</span></div>
      </section>
    `;

    // PÁGINA 20: HYDRALIPS HERO & PROTOCOLO
    const hydra = data.services.find(s => s.id === "hydralips-sesion");
    html += `
      <section class="lb-page" id="lb-page-20">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>HydraLips</span></div>
        <div style="position: absolute; left: 0; top: 0; width: 48%; height: 100%; overflow: hidden;">
          <img src="${hydra.image}" style="width:100%; height:100%; object-fit:cover;" alt="HydraLips">
        </div>
        <div style="position: absolute; left: 52%; right: 8%; top: 18%;">
          <span style="font-size: 1.4cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Colección 4 · HydraLips</span>
          <h2 style="font-size: 5cqw; line-height: 1; margin: 1cqw 0 2cqw;">${hydra.subtitle}</h2>
          <p style="font-size: 1.9cqw; line-height: 1.6; color: var(--color-ink-light); margin-bottom: 2cqw;">${hydra.desc}</p>
          <div style="border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
            <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${hydra.duration}</span></div>
            <div class="lb-spec-row"><span class="l">Tiempo</span><span class="v">${hydra.appointmentTime}</span></div>
            <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(hydra.price)}</span></div>
          </div>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>20</span></div>
      </section>
    `;

    // PÁGINA 21: EXPERIENCIAS EXCLUSIVAS
    const miradaPerf = data.services.find(s => s.id === "exp-mirada-perfecta");
    const esenciaSub = data.services.find(s => s.id === "exp-esencia-sublime");
    const glowLips = data.services.find(s => s.id === "exp-glow-lips");
    html += `
      <section class="lb-page" id="lb-page-21">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Experiencias Exclusivas</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 12%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.38em; color: var(--color-primary);">Colección 5 · Experiencias</span>
          <h2 style="font-size: 6cqw; margin-top: 0.5cqw;">Experiencias exclusivas</h2>
          <p style="font-size: 1.8cqw; color: var(--color-ink-light);">Combina tus servicios favoritos y disfruta de tarifas preferenciales.</p>
          <div style="height: 1px; background: var(--color-hairline); margin: 2cqw 0;"></div>
          
          <div style="display: flex; flex-direction: column; gap: 2.5cqw;">
            <div style="border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
              <h3 style="font-size: 2.8cqw;">${miradaPerf.name}</h3>
              <p style="font-style: italic; font-size: 1.8cqw; color: var(--color-primary);">${miradaPerf.subtitle}</p>
              <p style="font-size: 1.8cqw; color: var(--color-ink-light); margin-top: 0.5cqw;">${miradaPerf.desc}</p>
            </div>
            <div style="border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
              <h3 style="font-size: 2.8cqw;">${esenciaSub.name}</h3>
              <p style="font-style: italic; font-size: 1.8cqw; color: var(--color-primary);">${esenciaSub.subtitle}</p>
              <p style="font-size: 1.8cqw; color: var(--color-ink-light); margin-top: 0.5cqw;">${esenciaSub.desc}</p>
            </div>
            <div style="border-top: 1px solid var(--color-hairline); padding-top: 1.5cqw;">
              <h3 style="font-size: 2.8cqw;">${glowLips.name}</h3>
              <p style="font-style: italic; font-size: 1.8cqw; color: var(--color-primary);">${glowLips.subtitle}</p>
              <p style="font-size: 1.8cqw; color: var(--color-ink-light); margin-top: 0.5cqw;">${glowLips.desc}</p>
            </div>
          </div>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>21</span></div>
      </section>
    `;

    // PÁGINA 22: RITUALES
    const ritualGlow = data.services.find(s => s.id === "ritual-glow");
    const ritualComplete = data.services.find(s => s.id === "ritual-complete");
    html += this.renderTwoServicesPage(22, "Experiencias · Rituales", "Rituales Insignia", "Transformaciones integrales para una mirada y labios impecables.", ritualGlow, ritualComplete);

    // PÁGINA 23: CIERRE Y CONTACTO
    html += `
      <section class="lb-page dark" id="lb-page-23">
        <div class="lb-run top"><span>${data.studio.name}</span><span class="tick">·</span><span>Contacto</span></div>
        <div style="position: absolute; left: 9%; right: 9%; top: 22%;">
          <span style="font-size: 1.6cqw; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4em; color: var(--color-primary);">Tu mirada, nuestro sello</span>
          <h2 style="font-size: 8cqw; margin-top: 1cqw; color: #efe8da;">Gracias por elegirnos</h2>
          <div style="height: 1px; background: var(--color-hairline-dark); margin: 3cqw 0 4cqw;"></div>
          
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 2.6cqw; line-height: 1.4; color: #c9b48f; margin-bottom: 4cqw;">
            "Una experiencia creada para resaltar tu esencia natural."
          </p>

          <div style="display: flex; gap: 8cqw; margin-top: 4cqw;">
            <div>
              <div style="font-size: 1.4cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); margin-bottom: 1cqw;">Reservas WhatsApp</div>
              <div style="font-family: var(--font-serif); font-size: 3cqw; color: #ffffff;">${data.studio.whatsappDisplay}</div>
            </div>
            <div>
              <div style="font-size: 1.4cqw; text-transform: uppercase; letter-spacing: 0.2em; color: var(--color-primary); margin-bottom: 1cqw;">Instagram & TikTok</div>
              <div style="font-family: var(--font-serif); font-size: 3cqw; color: #ffffff;">@${data.studio.instagram}</div>
            </div>
          </div>
        </div>
        <div class="lb-run bot"><span>${data.studio.location}</span><span>23</span></div>
      </section>
    `;

    this.container.innerHTML = html;
    this.isRendered = true;
  }

  renderTwoServicesPage(pageNum, topTitle, mainTitle, introDesc, s1, s2) {
    if (!s1 || !s2) return "";
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
            <div class="im"><img src="${s1.image || 'assets/img/page_img_1.jpeg'}" alt="${s1.name}"></div>
            <div class="tx">
              <div class="n">01</div>
              <div class="nm">${s1.name}</div>
              <div class="desc">${s1.desc}</div>
              <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${s1.duration || '3-5 semanas'}</span></div>
              <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(s1.price)}</span></div>
              ${s1.retouch15_21 ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(s1.retouch15_21)}</span></div>` : ''}
            </div>
          </div>

          <div class="lb-service-row">
            <div class="im"><img src="${s2.image || 'assets/img/page_img_1.jpeg'}" alt="${s2.name}"></div>
            <div class="tx">
              <div class="n">02</div>
              <div class="nm">${s2.name}</div>
              <div class="desc">${s2.desc}</div>
              <div class="lb-spec-row"><span class="l">Duración</span><span class="v">${s2.duration || '3-5 semanas'}</span></div>
              <div class="lb-spec-row"><span class="l">Valor</span><span class="v">${this.state.formatMoney(s2.price)}</span></div>
              ${s2.retouch15_21 ? `<div class="lb-spec-row"><span class="l">Retoque (15-21d)</span><span class="v">${this.state.formatMoney(s2.retouch15_21)}</span></div>` : ''}
            </div>
          </div>
        </div>
        <div class="lb-run bot"><span>Colección 2026</span><span>0${pageNum}</span></div>
      </section>
    `;
  }
}

// Instanciar Lookbook
window.lookbookManager = new LookbookManager();
