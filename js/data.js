/**
 * Danna Mesa Studio — Catálogo Colección 2026
 * Datos centralizados y gestionables del catálogo.
 * Soporta persistencia en localStorage y exportación/importación JSON.
 */

const DEFAULT_CATALOG_DATA = {
  studio: {
    name: "Danna Mesa",
    tagline: "Studio Experience",
    subtitle: "Pestañas · Cejas · Labios",
    slogan: "Tu mirada, nuestro sello.",
    welcomeLead: "Hay un detalle que me obsesiona: que nadie pueda saber dónde termina tu pestaña y dónde empieza mi trabajo, que se vean tuyas, naturales y diseñadas para ti.",
    welcomeText: "En eso se me va el tiempo, y por eso mis clientas vuelven. Aquí tu cita es solo tuya, tú solo cierra los ojos y confía. Bienvenida.",
    location: "Armenia · Quindío, Colombia",
    whatsapp: "573006279079",
    whatsappDisplay: "+57 300 627 9079",
    instagram: "dannamesa_studio",
    tiktok: "dannamesa_studio",
    currency: "COP",
    currencySymbol: "$"
  },

  hero: {
    badge: "Colección 2026 · Studio Experience",
    title: "Danna Mesa",
    subtitle: "Pestañas · Cejas · Labios",
    welcomeLead: "Hay un detalle que me obsesiona: que nadie pueda saber dónde termina tu pestaña y dónde empieza mi trabajo, que se vean tuyas, naturales y diseñadas para ti.",
    image: "assets/img/page_img_1.jpeg",
    imagePosition: "center 20%"
  },

  comboBanner: {
    badge: "⭐ Beneficio Exclusivo",
    title: "Experiencias & Rituales",
    desc: "Combina tus servicios favoritos en una misma cita y el cotizador inteligente aplicará tu descuento automáticamente.",
    formula1: "Mirada Perfecta: Extensiones + Cejas en Henna = Ahorra $10.000 COP",
    formula2: "Esencia Sublime: Extensiones + Laminado = ¡Hidratante de regalo ($15.000)!",
    formula3: "Ritual Glow: Lifting + Laminado = $100.000 (Ahorras $15.000)",
    image: "assets/img/completo2.png",
    imagePosition: "center 30%"
  },

  theme: {
    primaryColor: "#9c7e54", // Bronce
    secondaryColor: "#1b1a16", // Carbón
    paperColor: "#f4f1ea", // Papel editorial
    paper2Color: "#efe9df",
    darkBackground: "#1c1a17",
    textColor: "#1b1a16",
    fontSerif: "'Fraunces', serif",
    fontSans: "'Archivo', sans-serif"
  },

  categories: [
    { id: "lifting", name: "Lifting Coreano", icon: "✨", subtitle: "El servicio insignia" },
    { id: "extensiones", name: "Extensiones de Pestañas", icon: "👁️", subtitle: "Sutiles, Expresivas, Volumen y Artísticas" },
    { id: "cejas", name: "Diseño y Cejas", icon: "🪄", subtitle: "Diseño, Henna y Laminado Pro/Premium" },
    { id: "hydralips", name: "HydraLips", icon: "💋", subtitle: "El ritual de hidratación profunda para labios" },
    { id: "experiencias", name: "Experiencias y Rituales", icon: "⭐", subtitle: "Combos con tarifas preferenciales" },
    { id: "cuidados", name: "Cuidado en Casa", icon: "🌿", subtitle: "Productos y asesoría post-cita" }
  ],

  services: [
    // 1. LIFTING
    {
      id: "lifting-coreano",
      categoryId: "lifting",
      name: "Lifting de Pestañas Coreano",
      type: "Lifting",
      subtitle: "Resalta lo que ya eres",
      desc: "Curvatura elegante, más definición y efecto visual de pestañas más largas, respetando la estructura natural de cada pestaña. Ideal para quienes buscan una mirada sofisticada sin extensiones.",
      duration: "6 a 8 semanas",
      appointmentTime: "60 - 90 min",
      price: 50000,
      retouchAvailable: false,
      image: "assets/img/page_img_2.jpeg",
      beforeImage: "assets/img/page_img_3.jpeg",
      afterImage: "assets/img/page_img_4.jpeg",
      gallery: [
        {
          id: "lift-res-1",
          src: "assets/img/lifting_1.jpeg",
          title: "Resultado 01",
          subtitle: "Elevación y Curvatura Natural",
          desc: "Efecto curvatura estilizada desde la raíz respetando la pestaña natural.",
          position: "center 30%"
        },
        {
          id: "lift-res-2",
          src: "assets/img/lifting_2.jpeg",
          title: "Resultado 02",
          subtitle: "Definición & Máxima Longitud",
          desc: "Mirada abierta y luminosa sin necesidad de encrespador.",
          position: "center 30%"
        },
        {
          id: "lift-res-3",
          src: "assets/img/lifting_3.jpeg",
          title: "Resultado 03",
          subtitle: "Tinte Intenso & Efecto Pestañina",
          desc: "Nutrición profunda con tinte negro azabache para un acabado sofisticado.",
          position: "center 45%"
        }
      ],
      imagePosition: "center 40%",
      featured: true,
      tags: ["Insignia", "Natural", "Top Ventas", "Galería de Resultados"]
    },

    // 2. EXTENSIONES SUTILES
    {
      id: "ext-clasicas-naturales",
      categoryId: "extensiones",
      group: "sutiles",
      groupTitle: "Sutiles",
      name: "Clásicas Naturales",
      subtitle: "01 · Resultado sutil",
      desc: "Ideal para amantes de la naturalidad y la elegancia. Realza tu mirada sin que se noten postizas, perfectas para el día a día.",
      duration: "3 a 5 semanas",
      appointmentTime: "90 - 120 min",
      price: 70000,
      retouchAvailable: true,
      retouch15_21: 50000,
      image: "assets/img/page_img_5.jpeg",
      imagePosition: "center center",
      tags: ["Natural", "Sutil"]
    },
    {
      id: "ext-efecto-pestanina",
      categoryId: "extensiones",
      group: "sutiles",
      groupTitle: "Sutiles",
      name: "Efecto Pestañina",
      subtitle: "02 · Resultado sutil",
      desc: "Mayor densidad visual y oscuridad sin perder la naturalidad de tu mirada.",
      duration: "3 a 5 semanas",
      appointmentTime: "90 - 120 min",
      price: 75000,
      retouchAvailable: true,
      retouch15_21: 55000,
      image: "assets/img/page_img_6.jpeg",
      imagePosition: "center center",
      tags: ["Densidad", "Natural"]
    },

    // 3. EXTENSIONES EXPRESIVAS
    {
      id: "ext-efecto-humedo",
      categoryId: "extensiones",
      group: "expresivas",
      groupTitle: "Expresivas",
      name: "Efecto Húmedo (Wet Look)",
      subtitle: "01 · Resultado expresivo",
      desc: "Aporta un acabado brillante y de alto impacto, perfecto para ti si te encanta el protagonismo y una mirada fresca.",
      duration: "3 a 5 semanas",
      appointmentTime: "90 - 120 min",
      price: 80000,
      retouchAvailable: true,
      retouch15_21: 60000,
      image: "assets/img/page_img_7.jpeg",
      imagePosition: "center center",
      tags: ["Impacto", "Expresivo", "Tendencia"]
    },
    {
      id: "ext-efecto-aura",
      categoryId: "extensiones",
      group: "expresivas",
      groupTitle: "Expresivas",
      name: "Efecto Aura",
      subtitle: "02 · Resultado expresivo",
      desc: "Mayor densidad y definición; si quieres algo más intenso que el húmedo, esta es tu mejor opción.",
      duration: "3 a 5 semanas",
      appointmentTime: "90 - 120 min",
      price: 80000,
      retouchAvailable: true,
      retouch15_21: 60000,
      image: "assets/img/page_img_8.jpeg",
      imagePosition: "center center",
      tags: ["Definición", "Expresivo"]
    },

    // 4. EXTENSIONES VOLUMEN
    {
      id: "ext-volumen-bloom",
      categoryId: "extensiones",
      group: "volumen",
      groupTitle: "Volumen",
      name: "Volumen Bloom",
      subtitle: "01 · Volumen suave y moderno",
      desc: "Volumen medio con un acabado uniforme y continuo; suave, esponjoso y moderno.",
      duration: "3 a 5 semanas",
      appointmentTime: "120 - 150 min",
      price: 90000,
      retouchAvailable: true,
      retouch15_17: 55000,
      retouch18_21: 60000,
      image: "assets/img/page_img_9.jpeg",
      imagePosition: "center center",
      tags: ["Volumen Medio", "Elegante"]
    },
    {
      id: "ext-volumen-hawaiano",
      categoryId: "extensiones",
      group: "volumen",
      groupTitle: "Volumen",
      name: "Volumen Hawaiano",
      subtitle: "02 · Volumen versátil",
      desc: "Un volumen de acabado elegante y versátil, ideal para una mirada con volumen suave y textura agradable.",
      duration: "3 a 5 semanas",
      appointmentTime: "120 - 150 min",
      price: 85000,
      retouchAvailable: true,
      retouch15_17: 55000,
      retouch18_21: 60000,
      image: "assets/img/page_img_10.jpeg",
      imagePosition: "center center",
      tags: ["Volumen", "Textura"]
    },
    {
      id: "ext-volumen-egipcio",
      categoryId: "extensiones",
      group: "volumen",
      groupTitle: "Volumen Intenso",
      name: "Volumen Egipcio",
      subtitle: "01 · Volumen abundante e intenso",
      desc: "Volumen abundante e intenso, ideal si te gusta lucir una mirada impactante, profunda y con mayor cobertura.",
      duration: "3 a 5 semanas",
      appointmentTime: "120 - 150 min",
      price: 90000,
      retouchAvailable: true,
      retouch15_17: 60000,
      retouch18_21: 65000,
      image: "assets/img/page_img_11.jpeg",
      imagePosition: "center center", // Centrado perfecto para que el ojo y las pestañas no se corten
      tags: ["Volumen Intenso", "Impacto"]
    },
    {
      id: "ext-volumen-5d",
      categoryId: "extensiones",
      group: "volumen",
      groupTitle: "Volumen Intenso",
      name: "Volumen 5D Glam",
      subtitle: "02 · Máxima densidad",
      desc: "Un volumen de la máxima densidad, ideal si disfrutas de una apariencia glamurosa y una mirada completamente definida.",
      duration: "3 a 5 semanas",
      appointmentTime: "120 - 150 min",
      price: 95000,
      retouchAvailable: true,
      retouch15_17: 60000,
      retouch18_21: 65000,
      image: "assets/img/page_img_12.jpeg",
      imagePosition: "center center",
      tags: ["Mega Volumen", "Glamour"]
    },

    // 5. EXTENSIONES ARTÍSTICAS
    {
      id: "ext-efecto-wispy",
      categoryId: "extensiones",
      group: "artisticos",
      groupTitle: "Artísticos & Tendencia",
      name: "Efecto Wispy (Kim K)",
      subtitle: "01 · Carácter y textura",
      desc: "Combina creatividad y vanidad con picos de longitud estratégicos; perfecto para quienes aman lo diferente y estilizado.",
      duration: "3 a 5 semanas",
      appointmentTime: "120 - 150 min",
      price: 95000,
      retouchAvailable: true,
      retouch15_21: 65000,
      image: "assets/img/page_img_13.jpeg",
      imagePosition: "center center",
      tags: ["Wispy", "Tendencia", "Favorito"]
    },
    {
      id: "ext-efecto-foxy",
      categoryId: "extensiones",
      group: "artisticos",
      groupTitle: "Artísticos & Tendencia",
      name: "Efecto Foxy Eyes",
      subtitle: "02 · Mirada alargada",
      desc: "Cargado de personalidad; proporciona una mirada alargada, sensual y estilizada en el extremo exterior.",
      duration: "3 a 5 semanas",
      appointmentTime: "120 - 150 min",
      price: 95000,
      retouchAvailable: true,
      retouch15_21: 65000,
      image: "assets/img/page_img_14.jpeg",
      imagePosition: "center center",
      tags: ["Foxy", "Alargado"]
    },
    {
      id: "ext-efecto-bratz",
      categoryId: "extensiones",
      group: "artisticos",
      groupTitle: "Artísticos & Tendencia",
      name: "Efecto Bratz Doll",
      subtitle: "03 · Longitud y actitud",
      desc: "Inspirado en las muñecas Bratz, combina longitud, textura dramática y mucha actitud para un resultado moderno y audaz.",
      duration: "3 a 5 semanas",
      appointmentTime: "120 - 150 min",
      price: 95000,
      retouchAvailable: true,
      retouch15_21: 65000,
      image: "assets/img/page_img_15.jpeg",
      imagePosition: "center center",
      tags: ["Bratz", "Audaz", "Full Actitud"]
    },

    // 6. CEJAS
    {
      id: "cejas-diseno-depilacion",
      categoryId: "cejas",
      name: "Diseño y Depilación de Cejas",
      subtitle: "Equilibrio y simetría",
      desc: "Incluye diseño personalizado con depilación en cera o hilo para lograr cejas limpias, definidas y en armonía con tus facciones.",
      duration: "2 a 3 semanas",
      appointmentTime: "30 - 45 min",
      price: 13000,
      retouchAvailable: false,
      image: "assets/img/dep.png", // Foto nueva actualizada
      imagePosition: "center 30%",
      tags: ["Básico Esencial", "Cera/Hilo"]
    },
    {
      id: "cejas-henna",
      categoryId: "cejas",
      name: "Diseño de Cejas en Henna",
      subtitle: "Definición y sombreado",
      desc: "Incluye diseño personalizado, depilación con el método de preferencia y sombreado en henna de alta calidad. Todo en armonía con tu tono de piel y gusto.",
      duration: "8 a 15 días en piel · 3-4 semanas en vello",
      appointmentTime: "45 - 60 min",
      price: 30000,
      retouchAvailable: false,
      image: "assets/img/page_img_16.jpeg",
      imagePosition: "center 30%",
      tags: ["Sombreado", "Henna Premium"]
    },
    {
      id: "cejas-laminado-pro",
      categoryId: "cejas",
      name: "Laminado de Cejas Pro",
      subtitle: "Alisa, direcciona y define",
      desc: "Incluye laminado de cejas, diseño personalizado y depilación con cera e hilo. Alisa y direcciona el vello natural creando cejas con mayor orden y simetría.",
      duration: "3 a 6 semanas",
      appointmentTime: "45 - 60 min",
      price: 50000,
      retouchAvailable: false,
      image: "assets/img/page_img_17.jpeg",
      imagePosition: "center 30%",
      tags: ["Laminado", "Definición"]
    },
    {
      id: "cejas-laminado-premium",
      categoryId: "cejas",
      name: "Laminado de Cejas Premium (Con Hidratante)",
      subtitle: "La experiencia más completa para tus cejas",
      desc: "Incluye laminado de cejas, diseño personalizado, depilación con cera e hilo + Hidratante profesional para cuidado en casa (valor individual: $15.000) para mantener el vello nutrido.",
      duration: "3 a 6 semanas",
      appointmentTime: "45 - 60 min",
      price: 60000,
      retouchAvailable: false,
      image: "assets/img/page_img_18.jpeg",
      imagePosition: "center 30%",
      tags: ["Laminado Premium", "Incluye Hidratante", "Ahorro"]
    },

    // 7. HYDRALIPS
    {
      id: "hydralips-sesion",
      categoryId: "hydralips",
      name: "HydraLips · Hidratación Profunda de Labios",
      subtitle: "El ritual de tus labios",
      desc: "Tratamiento no invasivo diseñado para hidratar profundamente, suavizar la textura y devolverles una apariencia saludable, jugosa y luminosa desde la primera sesión. No aporta volumen ni modifica la forma.",
      benefits: [
        "Hidratación profunda inmediata",
        "Labios más suaves y confortables",
        "Mejora la apariencia de líneas finas por resequedad",
        "Favorece un aspecto saludable y luminoso",
        "Ideal para labios resecos o con cueritos"
      ],
      duration: "Hasta 15 días por sesión (protocolo sugerido 4-5 sesiones)",
      appointmentTime: "30 - 40 min",
      price: 40000,
      retouchAvailable: false,
      image: "assets/img/page_img_19.jpeg",
      beforeImage: "assets/img/page_img_20.jpeg",
      afterImage: "assets/img/page_img_21.jpeg",
      imagePosition: "center 45%",
      featured: true,
      tags: ["Labios", "Hidratación", "No invasivo"]
    },

    // 8. EXPERIENCIAS / COMBOS
    {
      id: "exp-mirada-perfecta",
      categoryId: "experiencias",
      name: "Experiencia Mirada Perfecta",
      subtitle: "Extensiones + Cejas en Henna",
      desc: "Combina cualquier efecto de extensiones de pestañas con un diseño de cejas en henna a una tarifa preferencial exclusiva. Ahorras $10.000 sobre el valor individual.",
      formula: "Extensiones (cualquier efecto) + Henna ($30.000) - Descuento $10.000",
      discountAmount: 10000,
      bundleType: "extensions_plus_henna",
      customPriceLabel: "Según pestañas elegidas",
      price: null,
      appointmentTime: "120 - 150 min",
      image: "assets/img/mirada_perfecta.png", // Foto nueva actualizada
      imagePosition: "center 35%",
      featured: true,
      tags: ["Combo", "Ahorra $10.000", "Top Experiencia"]
    },
    {
      id: "exp-esencia-sublime",
      categoryId: "experiencias",
      name: "Experiencia Esencia Sublime",
      subtitle: "Extensiones + Laminado de Cejas",
      desc: "Cualquier efecto de extensiones combinado con un laminado de cejas premium. Incluye gratis un hidratante profesional para pestañas y cejas (valor individual $15.000).",
      formula: "Extensiones + Laminado + Hidratante de regalo",
      freebie: "Hidratante profesional valor $15.000",
      customPriceLabel: "Según pestañas elegidas",
      price: null,
      appointmentTime: "150 - 180 min",
      image: "assets/img/sublime.png", // Foto nueva actualizada
      imagePosition: "center 35%",
      featured: true,
      tags: ["Combo Premium", "Regalo Hidratante $15k"]
    },
    {
      id: "exp-glow-lips",
      categoryId: "experiencias",
      name: "Experiencia Glow Lips",
      subtitle: "Extensiones + HydraLips",
      desc: "Tu efecto de pestañas favorito combinado con una sesión completa de HydraLips. Ahorras $10.000 sobre el valor individual.",
      formula: "Extensiones + HydraLips ($40.000) - Descuento $10.000",
      discountAmount: 10000,
      bundleType: "extensions_plus_hydralips",
      customPriceLabel: "Según pestañas elegidas",
      price: null,
      appointmentTime: "120 - 150 min",
      image: "assets/img/glow_lips.jpg", // Foto nueva actualizada
      imagePosition: "center 40%",
      tags: ["Combo", "Ahorra $10.000", "Mirada + Labios"]
    },
    {
      id: "ritual-glow",
      categoryId: "experiencias",
      name: "Ritual Glow",
      subtitle: "Lifting de Pestañas + Laminado de Cejas",
      desc: "Dos de nuestros tratamientos insignia más solicitados en una sola cita. Incluye GRATIS un hidratante profesional para cejas y pestañas (valor $15.000) para nutrir el vello.",
      individualPrice: 115000,
      price: 100000,
      saving: 15000,
      appointmentTime: "90 - 120 min",
      image: "assets/img/ritual_glow.png", // Foto nueva actualizada
      imagePosition: "center 35%",
      featured: true,
      tags: ["Ritual Insignia", "Ahorra $15.000", "Incluye Hidratante"]
    },
    {
      id: "ritual-complete",
      categoryId: "experiencias",
      name: "Ritual Complete (Total Look)",
      subtitle: "Lifting + Laminado de Cejas + HydraLips",
      desc: "La experiencia más completa para realzar tu mirada y revitalizar tus labios en una sola cita, con una tarifa preferencial exclusiva al reservar los tres tratamientos juntos.",
      individualPrice: 140000,
      price: 125000,
      saving: 15000,
      appointmentTime: "120 - 150 min",
      image: "assets/img/page_img_23.jpeg",
      imagePosition: "center 35%",
      featured: true,
      tags: ["Transformación Total", "Ahorra $15.000"]
    },

    // 9. CUIDADO EN CASA
    {
      id: "cuidado-hidratante",
      categoryId: "cuidados",
      name: "Hidratante de Pestañas y Cejas",
      subtitle: "Cuidado profesional en casa",
      desc: "El cuidado continúa después de tu cita. Diseñado para acondicionar, nutrir y humectar pestañas y cejas. Su uso constante prolonga la retención, mantiene la suavidad y estimula el crecimiento natural.",
      instructions: "Aplica una pequeña cantidad sobre pestañas o cejas limpias, preferiblemente por la noche. Distribuye suavemente y deja actuar.",
      price: 15000,
      appointmentTime: "Producto para llevar",
      image: "assets/img/hidratante.jpeg",
      imagePosition: "center center",
      tags: ["Post Cuidado", "Nutrición", "Producto"]
    },
    {
      id: "asesoria-personalizada",
      categoryId: "cuidados",
      name: "Asesoría de Mirada Personalizada",
      subtitle: "¿No sabes qué hacerte? No tienes que saberlo",
      desc: "Antes de comenzar, estudiamos tus pestañas, facciones, estilo personal y presupuesto para recomendarte la técnica ideal para ti. Tú cuéntame qué buscas; yo me encargo de orientarte.",
      price: 0,
      isComplimentary: true,
      appointmentTime: "Incluido en tu cita",
      image: "assets/img/page_img_24.jpeg",
      imagePosition: "center center",
      tags: ["100% Gratis", "Diagnóstico"]
    }
  ],

  retouchPolicies: {
    title: "Políticas de Retoque de Extensiones",
    maxDays: 21,
    conditions: [
      "Conservar mínimo el 50% de las extensiones aplicadas.",
      "Asistir sin maquillaje en las extensiones (pestañina, delineador o residuos de productos).",
      "No haber cortado, quemado, retirado o manipulado las extensiones en casa.",
      "Llegar con las pestañas limpias y libres de aceites o cremas en la zona de los ojos.",
      "Estar dentro del rango de días permitido (21 días máximo)."
    ],
    note: "Si cualquiera de estas condiciones se incumple, el servicio se considerará una aplicación nueva y se cobrará el valor correspondiente. Estas condiciones nos permiten garantizar un resultado seguro, uniforme y de la más alta calidad."
  }
};

/**
 * Gestor de Estado Local / Almacenamiento
 */
class CatalogState {
  constructor() {
    this.storageKey = "danna_mesa_catalog_v2026_v7";
    this.data = this.loadData();
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("No se pudo leer de localStorage:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CATALOG_DATA));
  }

  saveData(newData) {
    this.data = newData;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent("catalogDataChanged", { detail: this.data }));
      return true;
    } catch (e) {
      console.error("Error al guardar datos:", e);
      return false;
    }
  }

  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_CATALOG_DATA));
    localStorage.removeItem(this.storageKey);
    window.dispatchEvent(new CustomEvent("catalogDataChanged", { detail: this.data }));
    return this.data;
  }

  getServiceById(id) {
    return this.data.services.find(s => s.id === id);
  }

  updateServicePrice(id, newPrice) {
    const service = this.getServiceById(id);
    if (service) {
      service.price = parseInt(newPrice, 10);
      this.saveData(this.data);
    }
  }

  updateStudioInfo(info) {
    this.data.studio = { ...this.data.studio, ...info };
    this.saveData(this.data);
  }

  updateTheme(themeSettings) {
    this.data.theme = { ...this.data.theme, ...themeSettings };
    this.saveData(this.data);
  }

  formatMoney(amount, fallbackText = "Según pestañas elegidas") {
    if (amount === null || amount === undefined || amount === "" || isNaN(Number(amount))) {
      return fallbackText;
    }
    if (Number(amount) === 0) return "Gratis";
    return this.data.studio.currencySymbol + " " + Number(amount).toLocaleString("es-CO");
  }
}

// Instancia global
window.catalogState = new CatalogState();
