(function(){
  const $ = s => document.querySelector(s);
  const viewport = $("#ref2dViewport"),
        plane    = $("#ref2dPlane");
  const search  = $("#ref2dSearch"),
        count   = $("#ref2dCount");
  const searchClearBtn = $("#ref2dSearchClear");
  const suggestionsBox = $("#ref2dSuggestions");
  const catPanel = $("#ref2dCatPanel");
  const catGrid  = $("#ref2dCatGrid");
  const catToggle = $("#ref2dCatToggle");
  const mobileCatToggle = $("#ref2dMobileCatToggle");
  const overlay = $("#ref2dOverlay"),
        modal   = document.querySelector(".ref2d__modal");
  const closeBtn = $("#sheetClose");
  const sheetImg = $("#sheetImg"),
        sheetFig = document.querySelector(".sheet__figure");
  const sTitle  = $("#sheetTitle"),
        sAuthor = $("#sheetAuthor"),
        sCollab = $("#sheetCollab"),
        sArea   = $("#sheetArea"),
        sYear   = $("#sheetYear"),
        sTags   = $("#sheetTags"),
        sLink   = $("#sheetLink");
  const btnCenter = $("#ref2dCenter");
  const brand     = document.querySelector(".ref2d__brand");
  const viewToggle = $("#ref2dViewToggle");
  const viewMenu = $("#ref2dViewMenu");
  const multiGrid = $("#ref2dMultiGrid");
  const indexList = $("#ref2dIndexList");
  const indexBody = $("#ref2dIndexBody");
  const simpleView = $("#ref2dSimpleView");
  const simpleGrid = $("#ref2dSimpleGrid");
  const btnSimpleRefresh = $("#ref2dSimpleRefresh");
  const btnRandom = $("#ref2dRandom");
  const btnSearchRandom = $("#ref2dSearchRandom");
  const headerMoreBtn = $("#ref2dHeaderMore");
  const headerMoreDropdown = $("#ref2dHeaderMoreDropdown");

  /* Si falta el contenedor principal, salimos en silencio (para no romper otras páginas) */
  if (!viewport || !plane) {
    return;
  }

  /* Estado inicial: overlay cerrado */
  if (overlay) {
    overlay.setAttribute('hidden','');
  }
  document.body.style.overflow = '';

  /* ---- TAGS (puedes editar/añadir) ---- */
  const TAGS = [
    'editorial','ilustración','dirección de arte','Tipografía','Experimental','Publicación digital','Impresión',
    'Curaduría','Identidad exposición','Señaletica','iluminación museografica','Música','visuales','Merchandising',
    'Afiche','Vestuario','Motion Graphics','Sitio Web','educación','Exposición de arte','Museografia','Moda'
  ];

  /* ---- SUGERENCIAS DE BÚSQUEDA (puedes editar/añadir) ---- */
  const SUGGESTIONS = [
    'editorial',
    'diagramación',
    'gráfico',
    'ilustración',
    'museografía',
    'moda',
    'vestuario',
    'identidad visual',
    'dirección de arte',
    'fotografía de moda',
    'sitio web',
    'branding',
    'museo',
    'experimental',
    'tipografía',
    'impresión',
    'publicación digital',
    'curaduría',
    'exposición de arte',
    'música',
    'afiche',
    'motion graphics',
    'educación',
    'artículo académico',
    'articulo academico',
    'publicación académica',
    'publicacion academica',
    'paper',
    'pub. académica',
    'pub academica',
    'fotografía',
    'dirección creativa',
    'ux',
    'ui',
    'ux ui',
    'diseño servicio',
    'espacio',
    'exhibición',
    'web',
    'responsivo',
    'fanzine',
    'objeto editorial',
    'risografía',
    'infantil',
    'videojuego',
    'animación',
    'arte',
    'audiovisual',
    'stop-motion',
    'teatro',
    'identidad gráfica',
    'señaletica',
    'museografia',
    'cover art',
    'afiche digital',
    'afiche impreso',
    'fotografía de moda',
    'instalación'
  ];

  /* Helpers */
  const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const PALETTE = ["#ff6b6b","#ffd93d","#6bcBef","#b084f6","#26de81","#ff9f1a","#f368e0","#00d2d3","#10ac84","#a29bfe","#fd79a8","#81ecec"];
    /* =================== TAG NORMALIZATION (dedupe + Titlecase + aliases) =================== */

  // Alias: tags distintos que deben caer en UNA sola categoría (evita duplicados como 3 "Editorial")
  const TAG_ALIASES = {
    // Editorial bucket
    "diagramacion": "editorial",
    "fanzine": "editorial",
    "objeto editorial": "editorial",
    "publicacion digital": "editorial",
    "infantil": "editorial",

    // Branding bucket
    "identidad visual": "branding",
    "identidad grafica": "branding",
    "identidad gráfica": "branding",

    // Web / Digital bucket
    "sitio web": "web",
    "digital": "web",
    "responsivo": "web",
    "desarrollo web": "web",
    "portafolio web": "web",
    "ecommerce": "web",

    // UX/UI (unificado)
    "ux": "ux ui",
    "ui": "ux ui",
    "ux/ui": "ux ui",
    "ui/ux": "ux ui",

    // Diseño de servicio (unificado)
    "servicio": "diseno servicio",
    "diseño servicio": "diseno servicio",
    "diseno servicio": "diseno servicio",
    "diseño de servicio": "diseno servicio",
    "diseno de servicio": "diseno servicio",

    // Motion / Audiovisual bucket
    "motion graphics": "animación",
    "animacion": "animación",
    "audiovisual": "animación",
    "stop-motion": "animación",

    // Espacio (unificado)
    "espacios": "espacio",
    "espacio": "espacio",

    // Exhibición (unificado)
    "exhibicion": "exhibicion",
    "exhibición": "exhibicion",
    "exphibicion": "exhibicion",
    "exposición": "exhibicion",
    "exposicion": "exhibicion",
    "expo arte": "exhibicion",
    "exposición de arte": "exhibicion",
    "exposicion de arte": "exhibicion",
    "identidad exposicion": "exhibicion",
    "identidad exposición": "exhibicion",

    // Fotografía (unificado)
    "fotografia": "fotografia",
    "fotografía": "fotografia",
    "fotografia de moda": "fotografia",
    "fotografía de moda": "fotografia",

    // Impreso (unificado)
    "risografia": "impreso",
    "risografía": "impreso",
    "serigrafia": "impreso",
    "serigrafía": "impreso",
    "impresion": "impreso",
    "impresión": "impreso",

    // Textil (unificado)
    "vestuario": "textil",
    "indumentaria": "textil",
    "patronaje": "textil",

    // Publicación académica (unificado)
    "articulo academico": "pub academica",
    "artículo academico": "pub academica",
    "articulo académico": "pub academica",
    "artículo académico": "pub academica",
    "paper": "pub academica",
    "publicacion academica": "pub academica",
    "publicación academica": "pub academica",
    "publicacion académica": "pub academica",
    "publicación académica": "pub academica",

    // Biomateriales + Artesanía
    "biomaterial": "biomateriales",
    "biomateriales": "biomateriales",
    "artesania": "artesania",
    "artesanía": "artesania",
    "soundscape": "investigacion",

    // Afiche (unificado)
    "afiche": "afiche",
    "afiche impreso": "afiche",
    "afiche digital": "afiche",

    // Portada disco (unificado)
    "portada": "cover art",
    "portada de disco": "cover art",
    "portada de discos": "cover art",
    "musica": "cover art",
    "música": "cover art",

    // Museografía (mantener existente)
    "museografia": "museografía",
    "museografía": "museografía",
    "instalacion": "museografía",
    "instalación": "museografía",
    "iluminacion museografica": "museografía",
    "iluminación museografica": "museografía",

    // Gráfico bucket
    "grafico": "gráfico",
    "gráfico": "gráfico",
  };

  // Cómo se muestran (Mayúscula primero + acentos + excepciones)
  const TAG_DISPLAY = {
    "editorial": "Editorial",
    "ilustracion": "Ilustración",
    "ilustración": "Ilustración",
    "direccion de arte": "Dirección de arte",
    "dirección de arte": "Dirección de arte",
    "tipografia": "Tipografía",
    "tipografía": "Tipografía",
    "experimental": "Experimental",
    "impresion": "Impresión",
    "impresión": "Impresión",
    "curaduria": "Curaduría",
    "curaduría": "Curaduría",
    "branding": "Branding",
    "senaletica": "Señalética",
    "señaletica": "Señalética",
    "señalética": "Señalética",
    "fotografia": "Fotografía",
    "fotografía": "Fotografía",
    "exhibicion": "Exhibición",
    "espacio": "Espacio",
    "ux ui": "UX UI",
    "diseno servicio": "Diseño servicio",
    "portada disco": "Portada disco",
    "impreso": "Impreso",
    "textil": "Textil",
    "pub academica": "Pub. Académica",
    "biomateriales": "Biomateriales",
    "artesania": "Artesanía",
    "moda": "Moda",
    "vestuario": "Vestuario",
    "musica": "Música",
    "música": "Música",
    "museografia": "Museografía",
    "museografía": "Museografía",
    "web": "Web",
    "ux": "UX",
    "ui": "UI",
    "animación": "Animación",
    "animacion": "Animación",
    "gráfico": "Gráfico",
    "grafico": "Gráfico",
    "producto": "Producto",
    "servicio": "Servicio",
    "salud": "Salud",
    "investigacion": "Investigación",
    "investigación": "Investigación",
    "packaging": "Packaging",
    "serigrafia": "Serigrafía",
    "serigrafía": "Serigrafía",
    "industrial": "Industrial",
    "mobiliario": "Mobiliario",
    "espacios": "Espacios",
    "social": "Social",
    "afiche": "Afiche",
    "iluminación": "Iluminación",
    "iluminacion": "Iluminación",
  };

  const canonicalTagKey = (tag) => {
    const k = norm(tag);
    return TAG_ALIASES[k] || k;
  };

  const prettyTag = (canonicalKey) => {
    return TAG_DISPLAY[canonicalKey] ||
      (canonicalKey ? canonicalKey.charAt(0).toUpperCase() + canonicalKey.slice(1) : "—");
  };

  function normalizeProjectTags(p) {
    const raw = Array.isArray(p.tags) ? p.tags.slice() : [];
    const keys = [];
    const seen = new Set();

    raw.forEach(t => {
      const k = canonicalTagKey(t);
      if (!k) return;
      if (seen.has(k)) return;
      seen.add(k);
      keys.push(k);
    });

    // tags mostrables (Titlecase)
    p._tagKeys = keys;
    p.tags = keys.map(prettyTag);

    // índice de búsqueda (incluye raw + normalizados + texto del proyecto)
    const hay = [
      p.title || "",
      p.author || "",
      p.area || "",
      p.collab || "",
      raw.join(" "),
      p.tags.join(" "),
      keys.join(" ")
    ].join(" ");
    p._search = norm(hay);
  }

    /* Mapeo de labels para categorías (normalizado) */
    const CAT_LABELS = {
      "all": "ALL",
      "editorial": "Editorial",
      "ilustración": "Ilustración",
      "ilustracion": "Ilustración",
      "dirección de arte": "Dirección de arte",
      "direccion de arte": "Dirección de arte",
      "tipografía": "Tipografía",
      "tipografia": "Tipografía",
      "experimental": "Experimental",
      "impresión": "Impresión",
      "impresion": "Impresión",
      "curaduría": "Curaduría",
      "curaduria": "Curaduría",
      "branding": "Branding",
      "señalética": "Señalética",
      "senaletica": "Señalética",
      "museografía": "Museografía",
      "museografia": "Museografía",
      "web": "Web",
      "ux ui": "UX UI",
      "diseno servicio": "Diseño servicio",
      "espacio": "Espacio",
      "exhibicion": "Exhibición",
      "portada disco": "Portada disco",
      "impreso": "Impreso",
      "textil": "Textil",
      "pub academica": "Pub. Académica",
      "biomateriales": "Biomateriales",
      "artesania": "Artesanía",
      "ux": "UX",
      "ui": "UI",
      "animación": "Animación",
      "animacion": "Animación",
      "fotografía": "Fotografía",
      "fotografia": "Fotografía",
      "moda": "Moda",
      "vestuario": "Vestuario",
      "música": "Música",
      "musica": "Música",
      "gráfico": "Gráfico",
      "grafico": "Gráfico",
      "producto": "Producto",
      "servicio": "Servicio",
      "salud": "Salud",
      "investigación": "Investigación",
      "investigacion": "Investigación",
      "packaging": "Packaging",
      "serigrafía": "Serigrafía",
      "serigrafia": "Serigrafía",
      "industrial": "Industrial",
      "mobiliario": "Mobiliario",
      "espacios": "Espacios",
      "social": "Social",
      "afiche": "Afiche"
    };

  /* Config desde CSS */
  const getPlanePadding = () => {
    const raw = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--plane-padding'), 10);
    return Number.isFinite(raw) ? raw : 2000;
  };
  let COL_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--colw'));
  let GAP   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
  let planePadding = getPlanePadding();
  let yTopLimit = -planePadding;
  let yBotLimit = planePadding;
  function resetPlaneLimits() {
    planePadding = getPlanePadding();
    yTopLimit = -planePadding;
    yBotLimit = planePadding;
  }

  /* Cámara 2D */
  let camX = 0, camY = 0;
  const applyTransform = ()=> plane.style.transform = `translate3d(${camX}px, ${camY}px, 0)`;

  /* Columnas (masonry por columna) */
  const columns = new Map();
  const ensureColumn = (i)=>{
    if(columns.has(i)) return columns.get(i);
    const x = i*(COL_W+GAP);
    const col = { pos:x, yUp:0, yDown:0 };
    columns.set(i,col); return col;
  };

  /* =================== BASE DE DATOS (solo proyectos reales) =================== */
  const DB = [
    /* ------------- Ignacia Santillán ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/L2666098984706343401554480411331/Santillan_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Experimental","Fanzine","Objeto editorial","Gráfico"],
      title: "Encontrarse en la forma",
      author: "Ignacia Santillán",
      collab: "",
      area: "Editorial / Experimental / Fanzine / Objeto editorial / Gráfico",
      year: "2022",
      url: "https://www.behance.net/gallery/160223073/encontrarse-en-la-forma"
    },

    /* ------------------ L'uccello — Weichi He (2016) ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/X2679365385941296012751710663363/2016_Luccello.jpg",
      orientation: "h",
      span: 2,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "L'uccello",
      author: "Weichi He",
      collab: "Pablo González",
      area: "Identidad visual / Identidad gráfica / Branding",
      year: "2016",
      url: "https://weichi.works/L-ucello"
    },

    /* ------------------ Max Fett Specimen — Weichi He (2020) ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/N2679362792458206457704720315075/MaxFett_4.jpg",
      orientation: "v",
      span: 1,
      tags: ["editorial","tipografía","gráfico","impreso"],
      title: "Max Fett Specimen",
      author: "Weichi He",
      collab: "Max Fett",
      area: "Editorial / Tipografía / Gráfico / Impreso",
      year: "2020",
      url: "https://weichi.works/Max-Fett-Specimen"
    },

    {
      src: "https://freight.cargo.site/t/original/i/E2666098984632556425259642204867/Santillan_2.jpg",
      orientation: "v",
      span: 1,
      tags: ["Afiche","Afiche digital","risografía","Gráfico"],
      title: "Me gusta mucho aquí",
      author: "Ignacia Santillán",
      collab: "Malhumor Studio",
      area: "Afiche / Gráfico",
      year: "2025",
      url: "https://www.instagram.com/p/DPEx3F9j9wF/"
    },
    {
      src: "https://freight.cargo.site/t/original/i/R2666098984687896657480770859715/Santillan_3.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Experimental","Fanzine","Objeto editorial","Gráfico"],
      title: "Otras formas de medir el tiempo",
      author: "Ignacia Santillán",
      collab: "Malhumor Studio",
      area: "Editorial / Experimental / Fanzine / Objeto editorial / Gráfico",
      year: "2025",
      url: "https://www.instagram.com/reel/DQ4wuXaD_i9/?igsh=dTFpaWQ2OHgzMTRq"
    },

    /* ------------- Gracia González / FIT ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/W2666098984614109681185932653251/Gonzalez-g_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Objeto editorial","Gráfico","Infantil"],
      title: "Rayo de luz",
      author: "Gracia González",
      collab: "",
      area: "Editorial / Infantil",
      year: "2022",
      url: "https://graciastudio.cl/15/"
    },
    {
      src: "https://freight.cargo.site/t/original/i/Q2666105329021245696185729495747/gonzalez-g_2.png",
      orientation: "h",
      span: 1,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "Fundación FIT",
      author: "Gracia González",
      collab: "",
      area: "Identidad visual / Branding",
      year: "2025",
      url: "https://graciastudio.cl/68/"
    },

    /* ------------- RETORNO — Andrés Miquel  (2 vistas) ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/Q2666098984595662937112223101635/miquel_1.png",
      orientation: "v",
      span: 2,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Catalina Uribe, Andres Miquel, Fernanda Gutiérrez",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=0", "https://schonmagazine.com/retorno/"]
    },
    {
      src: "https://freight.cargo.site/t/original/i/L2578592035202173407474317996739/Captura-de-pantalla-2025-10-01-a-las-18.22.21.png",
      orientation: "v",
      span: 1,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Andres Miquel, Catalina Uribe, Fernanda Gutiérrez",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=1", "https://schonmagazine.com/retorno/"]
    },

    {
      src: "https://freight.cargo.site/t/original/i/X2831921117369892999512004702915/gutierrez-fernanda-1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Fernanda Gutiérrez, Andres Miquel, Catalina Uribe",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=1", "https://schonmagazine.com/retorno/"]
    },
    /* ------------- Paula Santa María ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/Z2666098984577216193038513550019/santa-maria_1.jpg",
      orientation: "h",
      span: 2,
      tags: ["Videojuego","animación","arte"],
      title: "A Life in a Year",
      author: "Paula Santa María",
      collab: "",
      area: "Videojuego / Animación / Arte",
      year: "2024",
      url: "https://paulasantamaria.netlify.app/"
    },

    /* ------------- Bombus Chilensis ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/Q2666098984669449913407061308099/Pinto_1.jpg",
      orientation: "h",
      span: 2,
      tags: ["Audiovisual","animación","stop-motion","Teatro"],
      title: "Bombus Chilensis",
      author: "María Jesús Pinto, Victoria De la Maza",
      collab: "",
      area: "Audiovisual / Animación / Teatro",
      year: "2023",
      url: [
        "https://www.instagram.com/bombuschilensis",
        "https://www.behance.net/gallery/204989195/Bombus-Chilensis"
      ]
    },

    /* ------------- Matías Vial / Il mato ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/G2666098984651003169333351756483/ilmato_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["dirección creativa","fotografía","gráfico"],
      title: "Misc",
      author: "Matías Vial",
      collab: "Il Mato",
      area: "Dirección creativa / Fotografía",
      year: "2022",
      url: "https://ilmato.com/paloma-mami-1"
    },
    /* ------------------ Acuerdo de Escazú — Carolina Pinochet ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/T2834736126505138764895941505731/Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Acuerdo de Escazú",
  author: "Carolina Pinochet",
  collab: "Trabajo para Ministerio de Medio Ambiente. Proyecto desarrollado en Estudio Postal",
  area: "Branding / Identidad visual / Gráfico",
  year: "2023",
  url: "https://www.estudiopostal.cl/portfolio-collections/ilustracion/acuerdo-de-escazu"
},

/* ------------------ Agenda Palpa — Macarena Valdés Domínguez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2834736126523585508969651057347/Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","editorial","gráfico"],
  title: "Agenda Palpa",
  author: "Macarena Valdés Domínguez",
  collab: "Proyecto desarrollado en Qüina Studio",
  area: "Ilustración / Editorial / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/216455243/Agenda-Palpa-2025"
},

/* ------------------ La Roi (Packaging) — Macarena Valdés Domínguez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2834736126542032253043360608963/Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico","packaging"],
  title: "La Roi",
  author: "Macarena Valdés Domínguez",
  collab: "Proyecto desarrollado en Qüina Studio",
  area: "Ilustración / Gráfico / Packaging",
  year: "2024",
  url: "https://www.behance.net/gallery/199970619/Diseno-de-packaging-Chocolate-Le-Roi-Chocolat"
},

/* ------------------ EMG-One — Franco Gnecco ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/K2834736126431351788601103299267/Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16.png",
  orientation: "sq",
  span: 1,
  tags: ["producto","industrial","salud"],
  title: "EMG-One",
  author: "Franco Gnecco",
  collab: "Equipo: Lorena O’Ryan, Alejandro Durán, Franco Gnecco",
  area: "Producto / Industrial / Salud",
  year: "2025",
  url: "https://www.instagram.com/p/DKD2iZENyWz/?img_index=1"
},

/* ------------------ Materia Lignum — Catalina Fuenzalida ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2834736126486692020822231954115/Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25.png",
  orientation: "h",
  span: 2,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Catalina Fuenzalida",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Materia Lignum — Franco Gnecco ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/P2834736126468245276748522402499/Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05.png",
  orientation: "h",
  span: 1,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Franco Gnecco",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Materia Lignum — Damian Araos ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2834736126449798532674812850883/Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21.png",
  orientation: "h",
  span: 1,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Damian Araos",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Yazmin Jiménez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2834737330487230967770956378819/Banner-web-_-Lanzamiento-de-libro-CDUR-scaled.jpg",
  orientation: "h",
  span: 2,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Yazmin Jiménez",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: ["https://www.behance.net/gallery/233641951/Libro-Como-disenar-una-revolucion","https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"]
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Pedro Álvarez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2834737090993152658799847748291/153819.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Pedro Álvarez",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: "https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Hugo Palmarola ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/A2834736126412905044527393747651/Gonzalez-Yazmin.jpeg",
  orientation: "sq",
  span: 1,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Hugo Palmarola",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: "https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"
},

/* ------------------ DASON — Patricio Fuentes ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/S2834736126394458300453684196035/fuentes-PAtricio-IMG_5086-scaled.jpeg",
  orientation: "v",
  span: 2,
  tags: ["producto","salud","investigación"],
  title: "DASON",
  author: "Patricio Fuentes",
  collab: "Desarrollado en colaboración con Stanford University",
  area: "Producto / Salud / Investigación",
  year: "2025",
  url: "https://diseno.uc.cl/2025/05/proyecto-dason-innovacion-frugal-desde-diseno-uc-para-la-salud-pediatrica-global/"
},

/* ------------------ Galería de Arte Gráfico A3 — Alejandra Amenábar ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/K2834742337136486757354070028995/A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26.png",
  orientation: "v",
  span: 1,
  tags: ["arte","galería"],
  title: "Galería de Arte Gráfico A3",
  author: "Alejandra Amenábar",
  collab: "Socia fundadora",
  area: "Arte / Galería",
  year: "N/A",
  url: "https://a3press.com"
},

/* ------------------ Olivia y el Terremoto Invisible — Antonia Piña ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2834736126376011556379974644419/pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000_.jpeg",
  orientation: "v",
  span: 2,
  tags: ["dirección creativa","dirección de arte","animación"],
  title: "Olivia y el Terremoto Invisible",
  author: "Antonia Piña",
  collab: "Dirección: Irene Iborra. Supervisión de arte en Pájaro Pip",
  area: "Dirección creativa / Dirección de arte / Animación",
  year: "2025",
  url: ["https://www.instagram.com/p/DTk-PIijiUK/?hl=es&img_index=1","https://pajaro.cl"]
},

/* ------------------ EXVIVO — Julie Carles ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2834736126339118068232555541187/Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "EXVIVO",
  author: "Julie Carles",
  collab: "Proyecto desarrollado en Draft Estudio",
  area: "Branding / Identidad visual / Gráfico",
  year: "2025",
  url: "https://draft.cl/work/project-ex-vivo/"
},

/* ------------------ DENSE — Vicente Carmona ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/V2834736126357564812306265092803/Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","investigación"],
  title: "DENSE",
  author: "Vicente Carmona",
  collab: "",
  area: "Producto / Industrial / Investigación",
  year: "2023",
  url: "https://viscente.design/dense"
},

/* ------------------ Fintual — Valentina Andrea Pavez Benítez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/P2834855301990374870633509499587/Captura-de-pantalla-2026-03-11-a-las-13.16.23.png",
  orientation: "h",
  span: 1,
  tags: ["ux","ui","web"],
  title: "Fintual",
  author: "Valentina Andrea Pavez Benítez",
  collab: "",
  area: "UX / UI / Web",
  year: "2025",
  url: "https://www.behance.net/gallery/223316221/Caso-Estudio-Fintual"
},

/* ------------------ Hackathon Junior — Sophia López Pinoleo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Y2834854149308677936744757670595/hackathon.png",
  orientation: "h",
  span: 1,
  tags: ["gráfico","ilustración"],
  title: "Hackathon Junior",
  author: "Sophia López Pinoleo",
  collab: "",
  area: "Gráfico / Ilustración",
  year: "2025",
  url: "https://www.behance.net/gallery/228796131/DIPLOMAS-HACKATHON-JUNIOR-CHICAS-SUPERPODEROSAS"
},

/* ------------------ Descartadas — Vanessa Vásquez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/K2834851674641066960460989280963/vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Descartadas",
  author: "Vanessa Vásquez",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "N/A",
  url: "https://vvasquezzumaran15fd.myportfolio.com/descartadas-identidad-grafica"
},

/* ------------------ Orniflor viaja a Chiloé — Valentina Rey Carmona ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2834851674659513704534698832579/Rey-Valentin-aportada-chiloe2.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","gráfico","diagramación"],
  title: "Orniflor viaja a Chiloé",
  author: "Valentina Rey Carmona",
  collab: "Proyecto para Fundación Juntos Incluimos",
  area: "Editorial / Gráfico / Diagramación",
  year: "2024",
  url: "https://www.behance.net/gallery/173198799/Orniflor-viaja-a-chilo"
},

/* ------------------ Libro infantil — Valentina Rey Carmona ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/H2834851674677960448608408384195/Rey-Valentina.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","infantil"],
  title: "Libro infantil",
  author: "Valentina Rey Carmona",
  collab: "",
  area: "Ilustración / Infantil",
  year: "2024",
  url: "https://www.behance.net/gallery/182931307/Ilustraciones-editoriales"
},

/* ------------------ Cartas de Póker (Coca-Cola) — Tamara Santibáñez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/P2834851674696407192682117935811/Santibanez-Tamara.png",
  orientation: "h",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Cartas de Póker (Coca-Cola)",
  author: "Tamara Santibáñez",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/233763201/Cartas-de-poker-para-Coca-Cola"
},

/* ------------------ Descargables Imanix — Sofía Daza Urzúa ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2834851674714853936755827487427/Daza-Sofia.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","editorial","gráfico"],
  title: "Descargables Imanix",
  author: "Sofía Daza Urzúa",
  collab: "",
  area: "Ilustración / Editorial / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/225293267/Descargables-Imanix"
},

/* ------------------ Talana (UX/UI) — Rafaella Espildora ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/M2834851674604173472313570177731/Espildora-Rafella.png",
  orientation: "h",
  span: 1,
  tags: ["ux","ui","servicio"],
  title: "Talana",
  author: "Rafaella Espildora",
  collab: "",
  area: "UX / UI / Servicio",
  year: "2024",
  url: "https://www.behance.net/gallery/196546331/UXUI-SaaS-HR"
},

/* ------------------ Revista N°2 Museo Histórico de Carabineros — Paulina Padilla ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2834851279235107740496750392003/PADILLA-PAULINA-1f75b2_fd084dd76c2b4662b346409b24ab3b7b.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial"],
  title: "Revista N°2 Museo Histórico de Carabineros de Chile",
  author: "Paulina Padilla",
  collab: "",
  area: "Editorial",
  year: "2013",
  url: "https://www.paulinapadilla.cl/editorial"
},

/* ------------------ Aralí — Aranda Feres Ojeda ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2835041680329330561722121401027/feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81.jpeg",
  orientation: "v",
  span: 1,
  tags: ["producto","artesanía"],
  title: "Aralí",
  author: "Aranda Feres Ojeda",
  collab: "",
  area: "Producto / Artesanía",
  year: "2024",
  url: "https://arali.store/collections/aranda-1"
},

/* ------------------ Afiche n°1 — Gianfranco Music Wachtendorff ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/A2835041680366224049869540504259/Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920.png",
  orientation: "sq",
  span: 2,
  tags: ["afiche","afiche digital","gráfico"],
  title: "Afiche n°1",
  author: "Gianfranco Music Wachtendorff",
  collab: "",
  area: "Afiche / Afiche digital / Gráfico",
  year: "2025",
  url: "https://gianfrancomw.myportfolio.com/posters-semana-novata-2023"
},

/* ------------------ Vestuario obra "Hotel O'clock" — María Soledad Albornoz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/M2836337163916842722668132643523/albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920.jpeg",
  orientation: "h",
  span: 2,
  tags: ["vestuario","teatro","indumentaria"],
  title: "Vestuario obra 'Hotel O'clock'",
  author: "María Soledad Albornoz",
  collab: "Diseño técnico, patronaje y confección de vestuario de once personajes. Estreno: Academia Club de Teatro Fernando González, julio 2025",
  area: "Vestuario / Teatro / Indumentaria",
  year: "2025",
  url: "https://solealbornoz.myportfolio.com/copia-de-escarlata"
},

/* ------------------ Vestuario obra "Bailame" — María Soledad Albornoz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2836337163898395978594423091907/albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920.jpeg",
  orientation: "h",
  span: 1,
  tags: ["vestuario","teatro","indumentaria"],
  title: "Vestuario obra 'Bailame'",
  author: "María Soledad Albornoz",
  collab: "Diseño técnico, patronaje y confección de vestuario de siete personajes",
  area: "Vestuario / Teatro / Indumentaria",
  year: "2025",
  url: "https://solealbornoz.myportfolio.com/copia-de-vestuario-obra-hotel-oclock"
},

/* ------------------ Colaboración cervecería LOA — María Jesús Lafuente ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Z2836337163879949234520713540291/Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","packaging","gráfico"],
  title: "Colaboración cervecería LOA",
  author: "María Jesús Lafuente",
  collab: "Ilustración para etiqueta de cerveza experimental. Cervecería LOA",
  area: "Ilustración / Packaging / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/206548179/Cerveza-LOA"
},

/* ------------------ Arrebol Spa — María Jesús Lafuente ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/H2836334657391704731087968613059/arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04.png",
  orientation: "h",
  span: 1,
  tags: ["afiche","ilustración","gráfico"],
  title: "Arrebol Spa",
  author: "María Jesús Lafuente",
  collab: "",
  area: "Afiche / Ilustración / Gráfico",
  year: "2024",
  url: "https://www.behance.net/gallery/215849417/Arrebol-Spa"
},

/* ------------------ alegría alegría (fotografía) — María Inés Alarcón ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2836334657410151475161678164675/Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27.png",
  orientation: "h",
  span: 1,
  tags: ["fotografía"],
  title: "alegría alegría",
  author: "María Inés Alarcón",
  collab: "Creadora y fundadora: María Inés Alarcón",
  area: "Fotografía",
  year: "N/A",
  url: ["https://www.alegria-alegria.com/portfolio","https://www.instagram.com/alegria___alegria/"]
},

/* ------------------ Rediseño portada Juan Salvador Gaviota — María Inés Alarcón ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/P2836334657428598219235387716291/Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05.png",
  orientation: "sq",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Rediseño portada Juan Salvador Gaviota",
  author: "María Inés Alarcón",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2018",
  url: "https://www.behance.net/gallery/67251153/Rediseno-portada-Juan-Salvador-Gaviota-Richard-Bach"
},

/* ------------------ Circular Pet — León Quesney Cox ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2836334657373257987014259061443/Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["packaging","servicio"],
  title: "Circular Pet",
  author: "León Quesney Cox",
  collab: "Desarrollado en Periferi.co",
  area: "Packaging / Servicio",
  year: "2021",
  url: ["https://www.behance.net/gallery/129565533/Pentawards-London-2021","https://www.periferi.co/services-1"]
},

/* ------------------ La Batea Deco — Josefina Stückrath ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2836334657336364498866839958211/Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59.png",
  orientation: "v",
  span: 1,
  tags: ["branding","gráfico","web"],
  title: "La Batea Deco",
  author: "Josefina Stückrath",
  collab: "",
  area: "Branding / Gráfico / Web",
  year: "2026",
  url: "https://www.behance.net/gallery/241350377/Diseno-grafico-web-y-fotografia-La-Batea-Deco"
},

/* ------------------ Tere Gott — Josefina Stückrath ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Z2836334657354811242940549509827/Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34.png",
  orientation: "h",
  span: 1,
  tags: ["branding","gráfico","web"],
  title: "Tere Gott",
  author: "Josefina Stückrath",
  collab: "Diseño gráfico, web y fotografía: Josefina Stückrath",
  area: "Branding / Gráfico / Web",
  year: "2025",
  url: "https://www.behance.net/gallery/241036857/Diseno-grafico-web-y-fotografia-Tere-Gott"
},

/* ------------------ ALBADELUX — Josefa González Gil ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/X2836334657317917754793130406595/Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55.png",
  orientation: "v",
  span: 1,
  tags: ["branding","packaging","gráfico"],
  title: "ALBADELUX",
  author: "Josefa González Gil",
  collab: "Rediseño de identidad corporativa ALBADELUX. Implementación en desarrollo de packaging",
  area: "Branding / Packaging / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/175998049/Packaging-Iluminacion-Industrial"
},

/* ------------------ Cajas de Puzzles (varias) — Florencia Rodríguez Errázuriz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/B2836334657299471010719420854979/Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31.png",
  orientation: "h",
  span: 1,
  tags: ["branding","packaging","gráfico"],
  title: "Cajas de Puzzles (varias)",
  author: "Florencia Rodríguez Errázuriz",
  collab: "",
  area: "Branding / Packaging / Gráfico",
  year: "2020",
  url: "https://www.behance.net/gallery/100930229/Diseno-de-cajas-para-puzzles"
},

/* ------------------ Real Travel App — Colomba Plass ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Y2836334657281024266645711303363/Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45.png",
  orientation: "v",
  span: 1,
  tags: ["audiovisual","fotografía","dirección creativa"],
  title: "Real Travel App",
  author: "Colomba Plass",
  collab: "Desarrollado en Cinco Estudio. Pieza audiovisual publicitaria para Real Travel",
  area: "Audiovisual / Fotografía / Dirección creativa",
  year: "N/A",
  url: "https://cinco-estudio.com/real-travel"
},

/* ------------------ Silla Mudra — Chiara Antillo Heilenkötter ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/X2836334657244130778498292200131/Chiara-Antillosilla-mudra-madera-escultural2.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","objeto"],
  title: "Silla Mudra",
  author: "Chiara Antillo Heilenkötter",
  collab: "Desarrollado en Anka Taller",
  area: "Producto / Industrial / Objeto",
  year: "N/A",
  url: ["https://www.instagram.com/p/DRj3ScXkWvl/?img_index=1","https://www.ankataller.com/collections/sillas/products/silla-mudra"]
},

/* ------------------ Silla alta Pliego — Chiara Antillo Heilenkötter ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2836334657262577522572001751747/Chiara-Antillosilla-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","objeto"],
  title: "Silla alta Pliego",
  author: "Chiara Antillo Heilenkötter",
  collab: "Desarrollado en Anka Taller",
  area: "Producto / Industrial / Objeto",
  year: "N/A",
  url: ["https://www.instagram.com/p/DRj3ScXkWvl/?img_index=1","https://www.ankataller.com/collections/sillas/products/silla-alta-pliego-taburete"]
},

/* ------------------ Historia de la infografía en Chile (2018) — Gonzalo Morales ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2836334753314773914377637016259/Captura-de-pantalla-2026-03-12-a-las-11.32.10.png",
  orientation: "sq",
  span: 2,
  tags: ["investigación","publicación académica"],
  title: "Historia de la infografía en Chile (2018)",
  author: "Gonzalo Morales",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://www.academia.edu/36534358/Gonzalo_Morales_Historia_de_la_Infografía_en_Chile_2018_pdf"
},

/* ------------------ Afiche n°2 — Gianfranco Music Wachtendorff ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2835041680347777305795830952643/Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200.jpeg",
  orientation: "sq",
  span: 2,
  tags: ["afiche","afiche digital","gráfico"],
  title: "Afiche n°2",
  author: "Gianfranco Music Wachtendorff",
  collab: "",
  area: "Afiche / Afiche digital / Gráfico",
  year: "2025",
  url: "https://gianfrancomw.myportfolio.com/posters-semana-novata-2023"
},

/* ------------------ Sin nombre — Gianfranco Music Wachtendorff ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2835041680384670793943250055875/Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920.jpeg",
  orientation: "v",
  span: 1,
  tags: ["fotografía","moda","editorial"],
  title: "Sin nombre",
  author: "Gianfranco Music Wachtendorff",
  collab: "",
  area: "Fotografía / Moda / Editorial",
  year: "N/A",
  url: "https://gianfrancomw.myportfolio.com/varios"
},

/* ------------------ Colección 3 Chol1: Bichos — Antonino Reinoso ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/A2835041680310883817648411849411/Captura-de-pantalla-2026-03-11-a-las-15.39.07.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial"],
  title: "Colección 3 Chol1: Bichos",
  author: "Antonino Reinoso",
  collab: "Producido en Chol1",
  area: "Producto / Industrial",
  year: "2019",
  url: "https://www.behance.net/gallery/84664443/Coleccion-3-Chol1-Bichos"
},

/* ------------------ Taboo* — Emilia Ferrari ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2835044931199038671556402688707/Captura-de-pantalla-2026-03-11-a-las-16.08.04.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Taboo*",
  author: "Emilia Ferrari",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "2024",
  url: "https://jueves13.work/taboo"
},

/* ------------------ dos2 — Emilia Ferrari ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/X2835041680476904514311797813955/Captura-de-pantalla-2026-03-11-a-las-15.42.59.png",
  orientation: "v",
  span: 1,
  tags: ["ux","ui","servicio"],
  title: "dos2",
  author: "Emilia Ferrari",
  collab: "Proyecto de título",
  area: "UX / UI / Servicio",
  year: "2025",
  url: "https://www.behance.net/gallery/225638573/dos2"
},

/* ------------------ Mueble Don Melchor — Carolina Planas ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/F2835044255826844644902298923715/43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["industrial","espacios","vitrinaje"],
  title: "Mueble Don Melchor",
  author: "Carolina Planas",
  collab: "",
  area: "Industrial / Espacios / Vitrinaje",
  year: "N/A",
  url: "https://caroplanas.wixsite.com/caroplanasi"
},

/* ------------------ RRSS - Viela — Antonella Vila Garcia ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2835041680458457770238088262339/Captura-de-pantalla-2026-03-11-a-las-15.47.30.png",
  orientation: "v",
  span: 1,
  tags: ["rrss","gráfico"],
  title: "RRSS - Viela",
  author: "Antonella Vila Garcia",
  collab: "",
  area: "RRSS / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/172562123/Post-historias-de-instagram"
},

/* ------------------ Viella — Antonella Vila Garcia ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/F2835041680440011026164378710723/Captura-de-pantalla-2026-03-11-a-las-15.48.30.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Viella",
  author: "Antonella Vila Garcia",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/161160095/Identidad-Viella"
},

/* ------------------ Proust Cerámica — Magdalena Proust Iligaray ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Y2835041680421564282090669159107/Captura-de-pantalla-2026-03-11-a-las-15.53.10.png",
  orientation: "v",
  span: 1,
  tags: ["producto","artesanía"],
  title: "Proust Cerámica",
  author: "Magdalena Proust Iligaray",
  collab: "",
  area: "Producto / Artesanía",
  year: "N/A",
  url: "https://www.instagram.com/proust.ceramica/"
},

/* ------------------ COSTA — Andrés Valdivieso Vera ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2835041680403117538016959607491/Captura-de-pantalla-2026-03-11-a-las-16.03.13.png",
  orientation: "v",
  span: 1,
  tags: ["producto"],
  title: "COSTA",
  author: "Andrés Valdivieso Vera",
  collab: "Claudia Marcano",
  area: "Producto",
  year: "2025",
  url: "https://www.behance.net/gallery/218091267/COSTA-Designed-with-HyphaLite"
},
/* ------------------ Campaña Funa y Acoso — Pilar Saavedra ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/N2834851674622620216387279729347/Saavedra-Pilar-Captura-de-pantalla-2026-03-11-a-las-13.10.59.png",
  orientation: "v",
  span: 2,
  tags: ["afiche"],
  title: "Campaña Funa y Acoso",
  author: "Pilar Saavedra",
  collab: "",
  area: "Afiche",
  year: "2023",
  url: "https://pilar-fundamental.com/campana-ugn"
},

/* ------------------ Pequén — Elisa Aguirre ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/T2836714247389257057862945288899/Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840.png",
  orientation: "h",
  span: 1,
  tags: ["branding","gráfico","educación"],
  title: "Pequén",
  author: "Elisa Aguirre",
  collab: "Proyecto estudiantil",
  area: "Branding / Gráfico / Educación",
  year: "2025",
  url: "https://elisaaguirred.myportfolio.com/pequen"
},

/* ------------------ Paneles Voladores — Hugo Palmarola ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2836714089798722436162245833411/a-740x1024-1.png",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Paneles Voladores",
  author: "Hugo Palmarola",
  collab: "Pedro Ignacio Alonso (coautor). Libro ISBN: 9789561424135",
  area: "Investigación / Publicación académica",
  year: "2019",
  url: [
    "https://www.academia.edu/43825467/Pedro_Alonso_y_Hugo_Palmarola_editores_Paneles_Voladores_Cómo_los_paneles_de_hormigón_cambiaron_el_mundo_Dom_Publishers_Ediciones_UC_Berlín_2019_Indice_Prefacio_Biografías_",
    "https://diseno.uc.cl/2020/05/libro-paneles-voladores/"
  ]
},

/* ------------------ Cosmopolitical encounters — Pablo Hermansen ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2836714089780275692088536281795/rjce_a_1433705_f0002_c.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Cosmopolitical encounters: Prototyping at the National Zoo",
  author: "Pablo Hermansen",
  collab: "Coautor: Martín Tironi. Journal of Cultural Economy 11:4",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: [
    "https://repositorio.uc.cl/handle/11534/28039",
    "https://www.researchgate.net/publication/323367706_Cosmopolitical_encounters_Prototyping_at_the_National_Zoo_in_Santiago_Chile"
  ]
},

/* ------------------ Hacer y componer — Francisco Gálvez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/K2836714089743382203941117178563/hacer_y_componer-1-768x1121.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Hacer y componer: una introducción a la tipografía",
  author: "Francisco Gálvez",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://catalogoadquisiciondelibros.cultura.gob.cl/libro/hacer-y-componer/"
},

/* ------------------ Hacer y componer 2.0 — Francisco Gálvez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/S2836714089761828948014826730179/51iAgF1DOuL._AC_UF1000-1000_QL80_.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Hacer y componer: una introducción a la tipografía 2.0",
  author: "Francisco Gálvez",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2024",
  url: "https://diseno.uc.cl/2025/05/lanzamiento-hacer-componer-2-0-una-introduccion-a-la-tipografia/"
},

/* ------------------ Pedagogías para habitar el jardín infantil — Patricia Manns ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2836724512651845939827938112195/813k52dMx9L._AC_UF1000-1000_QL80_.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Pedagogías para habitar el jardín infantil",
  author: "Patricia Manns",
  collab: "Autores: Patricia Manns, Cynthia Adlerstein, Alberto González. Editorial: Ediciones UC",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://lea.uc.cl/pedagogias-para-habitar-el-jardin-infantil-reimpresion-primera-edicion-2018/p"
},

/* ------------------ Pedagogías para habitar el jardín infantil — Alberto González ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2836725192026983430477014577859/158400-1200-auto.jpg",
  orientation: "sq",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Pedagogías para habitar el jardín infantil",
  author: "Alberto González",
  collab: "Autores: Patricia Manns, Cynthia Adlerstein, Alberto González. Editorial: Ediciones UC",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://lea.uc.cl/pedagogias-para-habitar-el-jardin-infantil-reimpresion-primera-edicion-2018/p"
},

/* ------------------ RutaCL Typeface — Rodrigo Ramírez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2836724512633399195754228560579/mini_magick20180818-12931-p4pb7n.png",
  orientation: "h",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "The design of RutaCL: Developing and measuring performance for highway typeface",
  author: "Rodrigo Ramírez",
  collab: "Autores: Francisco Gálvez Pizarro, Victoria Gallardo, Rodrigo Ramírez Montecinos",
  area: "Investigación / Publicación académica",
  year: "2016",
  url: [
    "https://bibliotecadigital.oducal.com/Record/ir-11534-38819",
    "https://repositorio.uc.cl/handle/11534/38819"
  ]
},

/* ------------------ Resistencia gráfica. Dictadura en Chile (APJ – Tallersol) — Nicole Cristi ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2834736126320671324158845989571/Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación"],
  title: "Resistencia gráfica. Dictadura en Chile (APJ – Tallersol)",
  author: "Nicole Cristi",
  collab: "Co-autora: Javiera Manzi",
  area: "Editorial / Investigación",
  year: "2016",
  url: [
    "https://www.uc.cl/agenda/actividad/presentacion-de-investigacion-resistencia-grafica-dictadura-en-chile-apj-tallersol",
    "https://artishockrevista.com/2016/06/13/resistencia-grafica-dictadura-chile-apj-tallersol"
  ]
},

    /* ------------- Sofía Garrido ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/E2578321841997036736708759466691/Sofia-Garrido.jpg",
      orientation: "v",
      span: 2,
      tags: ["editorial"],
      title: "INSTRUCCIONES PARA DIBUJAR SU CAMINAR",
      author: "Sofía Garrido",
      collab: "",
      area: "Editorial",
      year: "2020",
      url: "https://sofiagarrido.work/Instrucciones"
    },
    {
      src: "https://freight.cargo.site/t/original/i/K2578321841978589992635049915075/sofia-garrido-2.jpg",
      orientation: "v",
      span: 2,
      tags: ["editorial","Publicación digital"],
      title: "Magma Magazine",
      author: "Sofía Garrido",
      collab: "Magdalena Derosas, Esteban Sandoval",
      area: "Editorial",
      year: "2021",
      url: "https://sofiagarrido.work/Magma-Magazine"
    },

    /* ------------- Música — Vicente Acuña ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/H2578329735838441222942344295107/600x600bf-60.jpg",
      orientation: "sq",
      span: 2,
      tags: ["Música","dirección de arte","Portada de disco"],
      title: "Consideraciones Generales",
      author: "Vicente Acuña",
      collab: "Fosfenos",
      area: "Música",
      year: "2024",
      url: "https://open.spotify.com/intl-es/album/6b3ijspHJK294Ao2HM5eWJ?si=e_KzcDHuTmabWIE5BYPMFA"
    },

    /* ------------- felicidad — Vicente Acuña ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/K2831772530303672050896792400579/Acuna-Vicente-SSF_CASE_Felicidadpublica_19.png",
      orientation: "v",
      span: 2,
      tags: ["Gráfico","Branding","Museografía"],
      title: "Museum Site Santa Fe",
      author: "Felicidad Pública, Vicente Acuña",
      collab: "Design Direction: Simón Sepúlveda, Piedad Rivadeneira. Creative Direction: Simón Sepúlveda. Graphic Design: Pau Geis, Antonia Guzmán, Vicente Acuña",
      area: "Gráfico / Museografía / Branding",
      year: "2022",
      url: "https://felicidadpublica.cl/project/site-santa-fe/"
    },

    /* ------------- Gracia González — SIENTO EL VIENTO ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/O2578339362511643761230079275715/Captura-de-pantalla-2025-10-01-a-las-14.33.36.png",
      orientation: "h",
      span: 2,
      tags: ["editorial","Experimental","educación"],
      title: "SIENTO EL VIENTO",
      author: "Gracia González",
      collab: "Editorial Amanuta (colaboración editorial)",
      area: "Editorial / Experimental / Educación",
      year: "2022",
      url: "https://graciastudio.cl/"
    },

    /* ------------- DIÁLOGOS IMPRESOS ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/S2578348945336935636310210065091/IL-POSO.jpg",
      orientation: "h",
      span: 2,
      tags: ["Museografia","Exposición de arte","editorial"],
      title: "DIÁLOGOS IMPRESOS",
      author: "Gracia González, Alejandra Amenábar",
      collab: "Taller UC, Il Posto",
      area: "Museografía / Exposición / Editorial",
      year: "2024",
      url: [
        "https://graciastudio.cl/35/",
        "https://diseno.uc.cl/2024/11/estudiantes-de-diseno-uc-crean-exposicion-para-il-posto/"
      ]
    },

    /* =================== NUEVOS PROYECTOS =================== */

    /* ------------- 60 años Kérastase ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/Z2666134078142757364005956170435/finat_1.jpg",
      orientation: "sq",
      span: 1,
      tags: ["Fotografía"],
      title: "60 años Kérastase",
      author: "Francisco Finat (fotografía)",
      collab: "Fotografía: Francisco Finat",
      area: "Fotografía",
      year: "2025",
      url: "https://www.instagram.com/p/DG1Km0yyJsd/?hl=es&img_index=1"
    },

    /* ------------- Avita — imagen Bustos ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/O2666141979953155290082067296963/bustos_1.png",
      orientation: "v",
      span: 1,
      tags: ["Dirección de arte","Dirección creativa","Moda"],
      title: "Avita",
      author: "María Fernanda Gonzalez",
      collab: "Josefa Bustos, Ferni González",
      area: "Arte / Dirección creativa / Moda",
      year: "—",
      url: "https://individual-frame-992587.framer.app/art-direction"
    },
    /* ------------------ Biosfera Somos Agua — Josefina Carvalho ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2836860966243025197469608129219/Captura-de-pantalla-2026-03-12-a-las-19.28.41.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Biosfera Somos Agua",
  author: "Josefina Carvalho",
  collab: "Autor del libro: Juan Pablo Orrego. Diagramación e ilustración: Josefina Carvalho, Magdalena Larraín",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://www.instagram.com/p/CQG4mvRDHNH/?img_index=1"
},

/* ------------------ Biosfera Somos Agua — Magdalena Larraín ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2836860966224578453395898577603/Captura-de-pantalla-2026-03-12-a-las-19.28.49.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Biosfera Somos Agua",
  author: "Magdalena Larraín",
  collab: "Autor del libro: Juan Pablo Orrego. Diagramación e ilustración: Josefina Carvalho, Magdalena Larraín",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://www.instagram.com/p/CQG4mvRDHNH/?img_index=1"
},

    /* ------------- Avita — imagen González ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/N2666140515576823742723021812419/gonzalez-m_1.png",
      orientation: "v",
      span: 1,
      tags: ["Dirección de arte","Dirección creativa","Moda"],
      title: "Avita",
      author: "María Fernanda Gonzalez",
      collab: "Josefa Bustos, Ferni González",
      area: "Arte / Dirección creativa / Moda",
      year: "—",
      url: "https://individual-frame-992587.framer.app/art-direction"
    },

    /* ------------- Guided by the Moon ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/R2666145362938444455824157258435/vidosola_1.png",
      orientation: "v",
      span: 1,
      tags: ["Editorial","gráfico","diagramación"],
      title: "Guided by the Moon",
      author: "Florencia Vildósola",
      collab: "Fembith",
      area: "Editorial / Gráfico / Diagramación",
      year: "2022",
      url: "https://florenciavildosola.myportfolio.com/guiado-por-la-luna"
    },

    /* ------------- PC Factory — UX/UI ------------- */
    {
      src: "https://freight.cargo.site/t/original/i/B2666150212476780969623019795139/morales-const_1.png",
      orientation: "sq",
      span: 1,
      tags: ["UX","UI","Web","Responsivo"],
      title: "PC Factory",
      author: "Constanza Morales",
      collab: "PC Factory",
      area: "UX / UI / Web",
      year: "2021",
      url: "https://www.constanzamorales.com/projects/pcfactory"
    },

    /* ------------------ Manual Verde — Sergio Ramírez ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/G2666169531973210294520941851331/ramirez-s_1.png",
      orientation: "v",
      span: 2,
      tags: ["editorial","diagramación","gráfico","ilustración"],
      title: "Manual Verde",
      author: "Sergio Ramírez",
      collab: "Ilustraciones de Javiera Infante y diagramación de Florencia Vildósola",
      area: "Editorial / Diagramación / Ilustración / Gráfico",
      year: "2024",
      url: "https://www.ramirezflores.cl/el-manual-verde/"
    },

    /* ------------------ Museo Histórico Nacional — Sergio Ramírez ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/K2666171734403772230999147492035/ramirez-s_2.jpeg",
      orientation: "h",
      span: 2,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "Museo Histórico Nacional",
      author: "Sergio Ramírez",
      collab: "Gaggeroworks",
      area: "Identidad visual / Branding",
      year: "2021",
      url: "https://www.ramirezflores.cl/museo-historico-nacional/"
    },

    /* ------------------ TYPE SPECIMEN FANZINE — Jose Chaud ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/R2666177053153491003674164933315/chaud_1.png",
      orientation: "v",
      span: 1,
      tags: ["Afiche","Afiche digital","Gráfico","Fanzine"],
      title: "TYPE SPECIMEN FANZINE",
      author: "Jose Chaud",
      collab: "",
      area: "Afiche / Fanzine / Gráfico",
      year: "2024",
      url: "https://okeykul.com/3/"
    },

    /* ------------------ TYPE SPECIMEN FANZINE — Jose Chaud ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/P2727063650870470385298921960131/Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2.png",
      orientation: "v",
      span: 2,
      tags: ["Servicio","Salud","Producto"],
      title: "Baby.kine",
      author: "Trinidad Burgos",
      collab: "Iván Caro",
      area: "Servicio / Salud / Producto",
      year: "N/A",
      url: "https://trinidadburgos.com/baby-kine-en/"
    },

    /* ------------------ Emprendekit — Kimberly McCartney ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/I2666184354540816074578080510659/Kim_1.png",
      orientation: "v",
      span: 1,
      tags: ["diseño de servicio","ux/ui"],
      title: "Emprendekit",
      author: "Kimberly McCartney",
      collab: "",
      area: "Diseño de servicio / UX/UI",
      year: "2025",
      url: "https://www.kimberlymccartney.com/5/"
    },

    /* ------------------ FPO Módulo Bienal Arquitectura — Catalina Pérez ------------------ */
    {
      src: "https://freight.cargo.site/t/original/i/D2666188928152754733829469975235/perez-c_1.png",
      orientation: "h",
      span: 1,
      tags: ["identidad visual","Identidad gráfica","branding","museografía","instalación","exposición"],
      title: "FPO Módulo — Bienal de Arquitectura",
      author: "Catalina Pérez",
      collab: "Otros Pérez, Fernando Pérez",
      area: "Identidad visual / Museografía / Exposición",
      year: "2023",
      url: "https://otrosperez.com/portfolio/home/fpo/"
    },

    {
      id: "pastelito",
      title: "Pastelito",
      author: "Naomi Altmann",
      collab: "",
      area: "Branding / Identidad visual",
      year: 2024,
      tags: ["branding", "identidad visual", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/Q2726499716232156261692270392003/Stickers_Pastelito.jpg",
      url: "https://naomialtmann.cargo.site/pastelito"
    },
    {
      id: "add",
      orientation: "h",
      span: 2,
      title: "ADD",
      author: "Fernanda González",
      collab: "",
      area: "Servicio / Salud",
      year: 2024,
      tags: ["salud", "servicio"],
      src: "https://freight.cargo.site/t/original/i/M2726499846300148725418318836419/Captura-de-pantalla-2026-01-02-a-las-13.33.28.png",
      url: "https://fernandagn.myportfolio.com/add-proyecto-de-titulo"
    },
    {
      id: "una-clase-de-bichos",
      orientation: "v",
      span: 1,
      title: "Una Clase de Bichos",
      author: "Cristóbal Sprätz",
      collab: "Ilustraciones por Magdalena Pérez",
      area: "Ilustración / Editorial / Infantil",
      year: 2024,
      tags: ["ilustración", "editorial", "infantil"],
      src: "https://freight.cargo.site/t/original/i/B2726511460573131717762821337795/Captura-de-pantalla-2026-01-02-a-las-13.42.40.png",
      url: [
        "https://www.magdalenaperezv.com/Una-Clase-de-Bichos",
        "https://www.instagram.com/magdalenaperezv"
      ]
    },
    /* ------------------ Papel Lustre — Matías Prado ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2729666710956146180077182726851/SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13.png",
  orientation: "v",
  span: 1,
  tags: ["gráfico", "ilustración"],
  title: "Papel Lustre",
  author: "Matías Prado",
  collab: "Feoperohermoso.cl | Diseño por: Sara Gubbins",
  area: "Gráfico / Ilustración",
  year: "2025",
  url: "https://www.feoperohermoso.cl/products/papel-lustre-12-x-12-cm"
},

/* ------------------ Joyas Maite Araia — Javiera Naranjo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/F2729665819941513931758420570819/Javiera-Naranjo-image-66e65f5b-1715-43e0-ae6a-1c34883b472c.jpg",
  orientation: "v",
  span: 0,
  tags: ["fotografía", "moda", "editorial"],
  title: "Joyas Maite Araia",
  author: "Javiera Naranjo",
  collab: "Fotografía por: Javiera Naranjo",
  area: "Fotografía / Moda / Editorial",
  year: "2025",
  url: "https://readymag.website/u2667837699/JavieraNaranjoPortafolio/"
},

/* ------------------ INEDEBLE — Javiera Naranjo, Paulina Carrasco ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2729665819959960675832130122435/Javiera-Naranjo-image-723d4605-f436-4ccd-bc6f-8cdfee64515f.jpg",
  orientation: "v",
  span: 0,
  tags: ["fotografía", "moda", "dirección creativa", "editorial"],
  title: "INEDEBLE",
  author: "Javiera Naranjo, Paulina Carrasco",
  collab: "",
  area: "Fotografía / Moda / Dirección Creativa / Editorial",
  year: "2025",
  url: "https://readymag.website/u2667837699/JavieraNaranjoPortafolio/"
},

/* ------------------ Raíces vivas: nuestra fusión — Magdalena Leigh ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Z2729673748555030996934510195395/Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37.png",
  orientation: "v",
  span: 1,
  tags: ["fotografía", "moda", "editorial"],
  title: "Raíces vivas: nuestra fusión",
  author: "Magdalena Leigh",
  collab: "Fotografía por: Magdalena Leigh",
  area: "Fotografía / Moda / Editorial",
  year: "2023",
  url: "https://www.instagram.com/p/CzmeLffJDVQ/"
},

    {
      id: "la-mesa-latina",
      title: "La Mesa Latina",
      author: "Ciudad Emergente",
      collab: "Ilustraciones por Magdalena Pérez",
      area: "Ilustración / Editorial",
      year: 2019,
      tags: ["ilustración", "editorial", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/D2726525513690148695247142990531/Captura-de-pantalla-2026-01-02-a-las-14.00.36.png",
      url: [
        "https://www.magdalenaperezv.com/La-Mesa-Latina",
        "https://ciudademergente.org/construir-tacticas/2020/9/22/kit-la-mesa-latina"
      ]
    },
    {
      id: "red-apa",
      orientation: "h",
      span: 2,
      title: "Red APA",
      author: "Fernanda Romagnoli",
      collab: "",
      area: "Servicio / Salud / Social",
      year: "N/A",
      tags: ["servicio", "salud", "social"],
      src: "https://freight.cargo.site/t/original/i/U2726524557798317539691887801027/Captura-de-pantalla-2026-01-02-a-las-13.56.31.png",
      url: "https://feromagnoli.framer.website/cases/red-apa"
    },
    {
      id: "catastro-prevencion",
      title: "Catastro Modelo de Prevención",
      author: "Pilar Saavedra",
      collab: "Cliente: Corporación de Universidades Privadas",
      area: "Editorial / Dirección de arte",
      year: 2025,
      tags: ["editorial", "dirección de arte", "ilustración"],
      src: "https://freight.cargo.site/t/original/i/U2726524557798317539691887801027/Captura-de-pantalla-2026-01-02-a-las-13.56.31.png",
      url: "https://pilar-fundamental.com/ugm-catastro"
    },
    {
      id: "espacio-ede",
      title: "Espacio EDE",
      author: "Pilar Saavedra",
      collab: "Cliente: Estudio EDE",
      area: "Identidad visual",
      year: 2023,
      tags: ["identidad visual", "branding", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/G2726524557816764283765597352643/Captura-de-pantalla-2026-01-02-a-las-13.57.55.png",
      url: "https://pilar-fundamental.com/espacioede"
    },
    {
      id: "loie-fuller",
      title: "Löie Füller",
      author: "Pilar Saavedra",
      collab: "Proyecto personal",
      area: "Ilustración / Editorial",
      year: 2021,
      tags: ["ilustración", "editorial", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/A2726524557835211027839306904259/Captura-de-pantalla-2026-01-02-a-las-13.58.22.png",
      url: "https://pilar-fundamental.com/loie-fuller"
    },
    {
      id: "expo-fireflies-patagonia",
      title: "Expo Fireflies Patagonia",
      author: "Constanza Gahona",
      collab: "Fireflies Patagonia",
      area: "Afiche / Gráfico",
      year: 2022,
      tags: ["afiche", "diagramación", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/P2726531106761398588056902513347/Captura-de-pantalla-2026-01-02-a-las-14.03.58.png",
      url: "https://www.behance.net/gallery/156824561/Expo-Fireflies-Patagonia"
    },
    {
      id: "encuentro-entre-cerros",
      title: "Encuentro entre cerros",
      author: "Camila Correa",
      collab: "",
      area: "Identidad visual",
      year: "N/A",
      tags: ["identidad visual", "branding", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/X2726539009475686973744781669059/Copia-de-avatar_ig_400.jpg",
      url: "https://cargocollective.com/ccharnecker/Imagen-de-marca"
    },
    {
      id: "revolucion-solar",
      title: "Revolución Solar",
      author: "Camila Correa",
      collab: "Kittsy Flor",
      area: "Música / Dirección de arte",
      year: "N/A",
      tags: ["música", "gráfico", "dirección de arte", "portada"],
      src: "https://freight.cargo.site/t/original/i/Z2726539009494133717818491220675/kittsy_DANZA_OTONO_v6_800.png",
      url: "https://cargocollective.com/ccharnecker/Arte-discos-1"
    },
    {
      id: "ilustraciones-quanticas",
      title: "Ilustraciones Quánticas",
      author: "Camila Correa",
      collab: "Cliente: Quántica",
      area: "Ilustración",
      year: "N/A",
      tags: ["ilustración", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/K2726539009512580461892200772291/fisica1_2-botella-globo_1000.jpg",
      url: "https://cargocollective.com/ccharnecker/Ilustraciones-Quantica"
    },
    {
      id: "de-mukachevo",
      title: "De Mukachevo al fin del mundo",
      author: "Marisol Zemon Vergara",
      collab: "Colomba Medina",
      area: "Editorial / Gráfico",
      year: "N/A",
      tags: ["editorial", "diagramación", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/X2726543467352753314542444294851/d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920.jpg",
      url: "https://colombamedina.myportfolio.com/copia-de-de-mukachevo-al-fin-del-mundo"
    },
    {
      id: "milatelier",
      title: "Milatelier",
      author: "Colomba Medina",
      collab: "Cliente: Milatelier",
      area: "Identidad visual",
      year: "N/A",
      tags: ["identidad visual", "branding", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/R2726545631026705952156881990339/4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840.png",
      url: "https://colombamedina.myportfolio.com/identida-de-marca"
    },
    {
      id: "serie-matera",
      orientation: "v",
      span: 1,
      title: "1/2 Serie Matera",
      author: "Martina Abello",
      collab: "",
      area: "Fotografía / Risografía",
      year: "N/A",
      tags: ["fotografía", "risografía"],
      src: "https://freight.cargo.site/t/original/i/W2726551712327931243837344133827/Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58.png",
      url: "https://mabellov.myportfolio.com/riso-1"
    },
    {
      id: "mitologia-chiloe",
      orientation: "v",
      span: 2,
      title: "Serie mitología Chiloé",
      author: "Martina Abello",
      collab: "Myriam Aguirre",
      area: "Risografía",
      year: 2022,
      tags: ["risografía"],
      src: "https://freight.cargo.site/t/original/i/E2726551712346377987911053685443/Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59.png",
      url: "https://mabellov.myportfolio.com/riso-2"
    },
    /* ------------------ No tengo amigos tengo amores — Andrés Miquel ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2729689188073992322207602651843/Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36.png",
  orientation: "v",
  span: 2,
  tags: ["ilustración", "gráfico"],
  title: "No tengo amigos tengo amores",
  author: "Andrés Miquel",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/224616103/Poster-No-tengo-amigos-tengo-amores"
},

/* ------------------ Los Mil Nombres de María Camaleón — Andrés Miquel ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2729689188055545578133893100227/Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración", "gráfico"],
  title: "Los Mil Nombres de María Camaleón",
  author: "Andrés Miquel",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/203999631/Afiche-Los-Mil-Nombres-de-Maria-Camaleon"
},

/* ------------------ Chini and the Technicians — Karina Hyland ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2729705002246325784521688429251/Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920.jpg",
  orientation: "h",
  span: 0,
  tags: ["iluminación"],
  title: "Chini and the Technicians",
  author: "Karina Hyland",
  collab: "Iluminación por: Karina Hyland",
  area: "Iluminación",
  year: "2018",
  url: "https://karinahy.cl/stage"
},

/* ------------------ DEFAULT — Manuela Garretón, Tomás Ossandón ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2729705002264772528595397980867/Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763.jpg",
  orientation: "h",
  span: 1,
  tags: ["instalación", "web", "iluminación", "investigación"],
  title: "DEFAULT",
  author: "Manuela Garretón, Tomás Ossandón",
  collab: "Iluminación, diseño y asistencia de investigación por: Karina Hyland",
  area: "Instalación / Web / Iluminación / Investigación",
  year: "2017",
  url: [
    "https://xdefault.cl/#proyecto",
    "https://karinahy.cl/default"
  ]
},

/* ------------------ P/H<25> — Vicente Puig ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2729712403485876526415406904003/Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10.png",
  orientation: "h",
  span: 0,
  tags: ["branding", "identidad visual", "gráfico"],
  title: "P/H<25>",
  author: "Vicente Puig",
  collab: "Puchworks",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.instagram.com/p/DRVgPzziXWx/"
},

/* ------------------ REITE: rebranding — Vicente Puig ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2729712403504323270489116455619/Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20.png",
  orientation: "v",
  span: 1,
  tags: ["branding", "identidad visual", "gráfico"],
  title: "REITE: rebranding",
  author: "Vicente Puig",
  collab: "Puchworks",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.instagram.com/p/DQsJH1jCevq/"
},

/* ------------------ DRP_01 — Benjamín Becerra ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2729729462721201243755679003331/Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30.png",
  orientation: "v",
  span: 1,
  tags: ["vestuario", "moda"],
  title: "DRP_01",
  author: "Benjamín Becerra",
  collab: "Hostil",
  area: "Vestuario / Moda",
  year: "2025",
  url: "https://hostil-streetwear.com/products/hoodie_core"
},

    {
      id: "anthology",
      title: "Anthology",
      author: "Martina Abello",
      collab: "Curso VNC-2371-A Arts Books and Abstract Comics – SVA",
      area: "Risografía",
      year: "N/A",
      tags: ["risografía"],
      src: "https://freight.cargo.site/t/original/i/F2726551712364824731984763237059/Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33.png",
      url: "https://mabellov.myportfolio.com/riso-3"
    },
    {
      id: "ilustraciones-mojonas",
      title: "Ilustraciones Mojonas",
      author: "Sofía Álvarez",
      collab: "Vans",
      area: "Ilustración / Muralismo",
      year: 2024,
      tags: ["ilustración", "muralismo"],
      src: "https://freight.cargo.site/t/original/i/P2726560875508242186098885210819/Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08.png",
      url: "https://readymag.website/u3068913620/portafoliomojona/proyectomojona/"
    },
    {
      id: "toyng",
      title: "Toyng",
      author: "Sofía Álvarez",
      collab: "Toyng Travel Games",
      area: "Producto",
      year: "2024/2025",
      tags: ["producto"],
      src: "https://freight.cargo.site/t/original/i/T2726560875526688930172594762435/Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18.png",
      url: "https://readymag.website/u3068913620/portafoliomojona/proyectotoyngtravelgames/"
    },
/* ------------------ De Cancelling — Domingo Smart ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2825598558428431692792129336003/Smart-Domingo.png",
  orientation: "v",
  span: 2,
  tags: ["soundscape","experimental","investigación","museografía"],
  title: "De Cancelling",
  author: "Domingo Smart",
  collab: "Guiatura: Nicolás Morales. Colaboradores: Manuel Larraín, Lukas Yunge",
  area: "Soundscape / Investigación / Museografía",
  year: "2025",
  url: "https://www.estudioample.com/003"
},

/* ------------------ PACKAGING FL-01 — Domingo Smart ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/T2825598558705132853897772610243/Smart-Domingo-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["packaging","serigrafía","industrial"],
  title: "PACKAGING FL-01",
  author: "Domingo Smart",
  collab: "Artista: Martín Jiménez",
  area: "Packaging / Serigrafía / Industrial",
  year: "2024",
  url: "https://www.estudioample.com/002"
},

/* ------------------ Mesa Lateral — Domingo Smart ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2825598558686686109824063058627/Smart-Domingo-3.jpg",
  orientation: "v",
  span: 2,
  tags: ["mobiliario","industrial","producto"],
  title: "Mesa Lateral",
  author: "Domingo Smart",
  collab: "Estudio: Ample",
  area: "Mobiliario / Producto / Industrial",
  year: "2024",
  url: "https://www.estudioample.com/001"
},

/* ------------------ Axigo — Tomás Sánchez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/X2825598558446878436865838887619/Sanchez-Tomas.png",
  orientation: "h",
  span: 2,
  tags: ["servicio","deportes","salud"],
  title: "Axigo",
  author: "Tomás Sánchez",
  collab: "Guiatura: Tomás Vivanco",
  area: "Servicio / Deportes / Salud",
  year: "2023",
  url: "https://tomassanchezsilva.myportfolio.com/axigo"
},

/* ------------------ Centralcorp — Francisco Poulsen ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2825598558668239365750353507011/Poulsen-Francisco-1.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Centralcorp",
  author: "Francisco Poulsen",
  collab: "Trabajo realizado en IV estudio",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/229770149/Centralcorp"
},

/* ------------------ Olivo — Francisco Poulsen ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/K2825598558649792621676643955395/Poulsen-Francisco-2.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Olivo",
  author: "Francisco Poulsen",
  collab: "Trabajo realizado en IV estudio",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2026",
  url: "https://www.behance.net/gallery/241545075/Olivo"
},

/* ------------------ Délano — Francisco Poulsen ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2825598558631345877602934403779/Poulsen-Francisco-3.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","web","gráfico"],
  title: "Délano",
  author: "Francisco Poulsen",
  collab: "Co-autor: Francisco Poulsen",
  area: "Branding / Web / Gráfico",
  year: "-",
  url: "https://www.behance.net/gallery/238927891/Dlano"
},

/* ------------------ Sala simulación AVD — Valentina Navarrete ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/V2825598558612899133529224852163/Navarrete-Valentina.jpg",
  orientation: "h",
  span: 1,
  tags: ["industrial","espacios","salud"],
  title: "Sala simulación AVD",
  author: "María Fernanda Gonzalez, Clemente López, Valentina Navarrete",
  collab: "",
  area: "Industrial / Espacios / Salud",
  year: "2025",
  url: "https://sites.google.com/view/valenavarrete-portafolio/sala-simulaci%C3%B3n-avd?"
},

/* ------------------ Salud oportuna en el sistema público de Chile — Felipe Vilches Ivelić ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2825598558409984948718419784387/Vilches-Felipe-04.jpg",
  orientation: "h",
  span: 2,
  tags: ["animación","audiovisual","motion graphics","salud"],
  title: "Salud oportuna en el sistema público de Chile",
  author: "Felipe Vilches Ivelić",
  collab: "Encargo: LIP UC, Ministerio de Salud, Banco Interamericano de Desarrollo",
  area: "Animación / Audiovisual / Motion Graphics",
  year: "2020",
  url: "https://felipevilchesinc.com/trabajo/salud-oportuna"
},

/* ------------------ El delantal vestido — Felipe Vilches Ivelić ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2825598558465325180939548439235/Vilches-Felipe.png",
  orientation: "h",
  span: 2,
  tags: ["animación","audiovisual","motion graphics","museografía"],
  title: "El delantal vestido",
  author: "Felipe Vilches Ivelić",
  collab: "Curaduría: Camila Ríos Erazo. Identidad gráfica: Sergio Ramírez Flores",
  area: "Animación / Audiovisual / Motion Graphics",
  year: "2024",
  url: "https://felipevilchesinc.com/trabajo/delantal-vestido"
},

/* ------------------ De Este a Oeste, de Norte a Sur — Felipe Vilches Ivelić ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2825598558391538204644710232771/Vilches-Felipe-05.jpg",
  orientation: "v",
  span: 1,
  tags: ["animación","audiovisual","motion graphics"],
  title: "De Este a Oeste, de Norte a Sur",
  author: "Felipe Vilches Ivelić",
  collab: "Dirección: Domingo Abelli. Producción: Goroka TV",
  area: "Animación / Motion Graphics / Audiovisual",
  year: "2022",
  url: "https://felipevilchesinc.com/trabajo/titulos-deaodnas-documental"
},

/* ------------------ Péndulo — Daniela Reyes Muñoz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2825598558483771925013257990851/Reyes-Daniela.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Péndulo",
  author: "Daniela Reyes Muñoz",
  collab: "",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2024",
  url: "https://www.behance.net/gallery/211077763/PENDULO"
},

/* ------------------ Cositas Fanzine — Daniela Reyes Muñoz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/V2825598558594452389455515300547/Reyes-Daniela-cositas1_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Cositas Fanzine",
  author: "Daniela Reyes Muñoz",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2024",
  url: "https://danielawilliam.com/Fanzine-Cositas"
},

/* ------------------ Mujeres Inspiradoras — Daniela Reyes Muñoz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2825598558576005645381805748931/Reyes-Daniela-STEM2_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Mujeres Inspiradoras",
  author: "Daniela Reyes Muñoz",
  collab: "Proyecto con Mujeres Bacanas",
  area: "Ilustración / Gráfico",
  year: "2023",
  url: "https://danielawilliam.com/Illustration-work/STEM"
},

/* ------------------ Los Heroes Magazine Covers — Daniela Reyes Muñoz ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/H2825598558557558901308096197315/Reyes-Daniela-abril2023_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Los Heroes Magazine Covers",
  author: "Daniela Reyes Muñoz",
  collab: "Revista Los Héroes",
  area: "Ilustración / Editorial",
  year: "2023",
  url: "https://danielawilliam.com/Illustration-work/Los-Heroes-2023"
},

/* ------------------ Disonia — Joaquín Gajardo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/N2825598558539112157234386645699/Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9.jpg",
  orientation: "h",
  span: 1,
  tags: ["desarrollo web","servicios","portafolio"],
  title: "Disonia",
  author: "Joaquín Gajardo",
  collab: "Cliente: DISONIA. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Servicios",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/topo-colectivo"
},

/* ------------------ TOPO COLECTIVO — Joaquín Gajardo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/B2825598558520665413160677094083/Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4.jpg",
  orientation: "h",
  span: 1,
  tags: ["desarrollo web","servicios","ecommerce"],
  title: "TOPO COLECTIVO",
  author: "Joaquín Gajardo",
  collab: "Cliente: TOPO COLECTIVO. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Ecommerce",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/jose-maiza"
},
/* ------------------ La Raíz del Aire — Florencia Caro / Colomba Acosta ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2831918759230364336851473871555/Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","diagramación","gráfico"],
  title: "La Raíz del Aire",
  author: "Florencia Caro, Colomba Acosta",
  collab: "Fotografía: G. Vivanco. Realizado en Mucha Trama Estudio",
  area: "Editorial / Diagramación / Gráfico",
  year: "2025",
  url: "https://muchatrama.wixsite.com/muchatrama/portfolio-collections/my-portfolio/project-title-5"
},

/* ------------------ Raíz Rituales — Colomba Acosta / Florencia Caro ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2831918759248811080925183423171/Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","fanzine","impresión"],
  title: "Raíz Rituales",
  author: "Colomba Acosta, Florencia Caro",
  collab: "Proyecto de diseño para Raíz Rituales. Realizado en Mucha Trama Estudio",
  area: "Editorial / Fanzine / Impreso",
  year: "2025",
  url: "https://muchatrama.wixsite.com/muchatrama/portfolio-collections/my-portfolio/project-title-6-1"
},

/* ------------------ Decide Chile — Constanza Morales ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Y2831921117406786487659423806147/morales-constanza-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["ux","ui","web","responsivo"],
  title: "Decide Chile",
  author: "Constanza Morales",
  collab: "Colaboradoras: Natalia Rojo, Camila Navarrete",
  area: "UX / UI / Web",
  year: "2020",
  url: "https://www.constanzamorales.com/projects/decidechile"
},

/* ------------------ Antagonista — Bernardita Hoffmann ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/K2831918759304151313146312078019/Hoffmann-Bernardita-1.JPG",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","packaging"],
  title: "Antagonista",
  author: "Bernardita Hoffmann",
  collab: "",
  area: "Producto / Industrial / Packaging",
  year: "2023",
  url: "https://bhbouchon.myportfolio.com/antagonista"
},

/* ------------------ Batallas en el barrio — Magdalena Leigh ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2831918759285704569072602526403/leigh-magdalena.jpeg",
  orientation: "v",
  span: 1,
  tags: ["cultura","museografía","investigación"],
  title: "Batallas en el barrio",
  author: "Magdalena Leigh",
  collab: "Investigación: Magdalena Leigh. Guiatura: Pedro Álvarez",
  area: "Cultura / Museografía / Investigación",
  year: "2025",
  url: "https://www.linkedin.com/posts/magdalena-leigh-maturana-b586aa27b_despu%C3%A9s-de-varios-meses-de-investigaci%C3%B3n-activity-7415374998154207232-lamk"
},

/* ------------------ POLKA DOT — Fernanda Gutiérrez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2831921117351446255438295151299/gutierrez-fernanda-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["dirección de arte","moda","fotografía"],
  title: "POLKA DOT",
  author: "Fernanda Gutiérrez",
  collab: "Dirección creativa: @fgtzzz_, @javinaranjot. Fotografía: @diegoaguilera.p. Modelo: @agustinazegers. Estilismo: @manuela.eyz",
  area: "Dirección de arte / Moda / Fotografía",
  year: "2025",
  url: "https://readymag.website/u1773068245/6079251/2/"
},

/* ------------------ Fresca Rebeca (producto) — Fernanda Gutiérrez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/P2831921117388339743585714254531/gutierrez-fernanda-3.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["dirección de arte","moda","fotografía"],
  title: "Fresca Rebeca",
  author: "Fernanda Gutiérrez",
  collab: "Dirección de arte: @fgtzzz_. Fotografía: @crisa.a. Asistente producción: @javinaranjot",
  area: "Dirección de arte / Moda / Fotografía",
  year: "2025",
  url: "https://readymag.website/u1773068245/6079251/2/"
},

/* ------------------ Presente — Daniela Gajardo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2831918759267257824998892974787/Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","textil","gráfico","afiche"],
  title: "Presente",
  author: "Daniela Gajardo",
  collab: "Idea original: Diamela Burboa, Elisa Modak, Isidora Modak, Isidora Montalván, Josefina Stuardo. Post-producción: Carlos Nauto",
  area: "Editorial / Textil / Gráfico / Afiche",
  year: "2025",
  url: "https://www.behance.net/gallery/224614769/2025-PORTAFOLIO-DISENO-DG"
},

/* ------------------ Restaurant KrossBar — Catalina Harasic ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/V2831938879131019020006840545987/Harasic-Catalina.jpeg",
  orientation: "v",
  span: 1,
  tags: ["iluminación","industrial","espacio"],
  title: "Restaurant KrossBar",
  author: "Catalina Harasic",
  collab: "Iluminación: Harasic Diseño e Iluminación. Proyecto liderado por Diagrama Arquitectos",
  area: "Iluminación / Industrial / Espacios",
  year: "2025",
  url: "https://www.linkedin.com/in/catalina-harasic-gil-9239a844/details/projects/?profileUrn=urn%3Ali%3Afsd_profile%3AACoAAAlm0SsBad8u2IpnSwXl7YUI3xvZq3sFM20"
},
/* ------------------ Dynamics of coastal picoeukaryote communities — Alejandro Durán ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/V2838253457734292878869043557059/X01411136.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Dynamics of coastal picoeukaryote communities in response to oil spill disturbances",
  author: "Alejandro Durán",
  collab: "Desarrollado con: Benjamín Glasner, Isidora Morel-Letelier, Esteban Osses, Camilo Gálvez-Aracena, Rodrigo De la Iglesia",
  area: "Investigación / Publicación académica",
  year: "2026",
  url: "https://www.sciencedirect.com/science/article/abs/pii/S0141113625008050"
},

/* ------------------ Flora Nativa — María José Carmona ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2838253457715846134795334005443/nativa.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Flora Nativa",
  author: "María José Carmona",
  collab: "Autores: Juan Vidal y colaboradores. Ilustraciones: María José Carmona. Editorial Amanuta. Institución: IEB Senda Darwin CNCA",
  area: "Editorial / Ilustración / Ecología",
  year: "2016",
  url: "https://mjcarmona.com/libros-publicados"
},

/* ------------------ Al agua — María José Carmona ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/V2838253457697399390721624453827/824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840.JPG",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Al agua",
  author: "María José Carmona",
  collab: "Ilustrado junto a Loreto Salinas. Texto: Sam García. Editorial Manivela",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://mjcarmona.com/libros-publicados"
},

/* ------------------ Panchita recorre Chiloé — Gabriela Sandoval ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2838259050418161146130902495939/plantilla-13.jpeg",
  orientation: "h",
  span: 2,
  tags: ["exhibición","cultura","experiencia","artesanía"],
  title: "Panchita recorre Chiloé",
  author: "Gabriela Sandoval",
  collab: "Creado por: Malvina García, Gabriela Sandoval",
  area: "Exhibición / Cultura / Experiencia",
  year: "2021–2023",
  url: "https://panchitarecorrechiloe.cl"
},

/* ------------------ Mou Studio — Martina Palominos ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Y2838253457678952646647914902211/Diseno-sin-titulo-4-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["textil","indumentaria","moda"],
  title: "Mou Studio",
  author: "Martina Palominos",
  collab: "",
  area: "Textil / Indumentaria / Moda",
  year: "N/A",
  url: [
    "https://www.ed.cl/archivo/recomendados/mou-studio-el-taller-textil-donde-el-color-y-el-oficio-se-encuentran/",
    "https://www.instagram.com/moustudio/?hl=es"
  ]
},

/* ------------------ Misión Korex — Teresita Reymond ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2838253457660505902574205350595/mision-korex.jpg",
  orientation: "v",
  span: 1,
  tags: ["servicio","innovación","educación"],
  title: "Misión Korex: Estrategia gamificada para potenciar la actividad física en escolares",
  author: "Teresita de Jesús Reymond",
  collab: "Guiatura: Patricia Manns",
  area: "Servicio / Innovación / Educación",
  year: "2024",
  url: [
    "https://www.uc.cl/noticias/estudiantes-uc-se-adjudican-financiamiento-publico-para-convertir-sus-tesis-en-innovaciones-con-impacto-social/",
    "https://diseno.uc.cl/2025/09/teresita-reymond-disenadora-uc-se-adjudico-concurso-viu-2025-con-su-proyecto-de-tesis/"
  ]
},

/* ------------------ El Pescador de Chiloé — Gabriela Sandoval ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2838253457531378694058238489283/En-que-consiste_Set-Pescador-compress.jpg",
  orientation: "h",
  span: 1,
  tags: ["exhibición","cultura","experiencia","artesanía"],
  title: "El Pescador de Chiloé",
  author: "Gabriela Sandoval",
  collab: "Autoras: Gabriela Sandoval, Magdalena Schroeder, Malvina García",
  area: "Exhibición / Cultura / Experiencia",
  year: "2025",
  url: [
    "https://panchitarecorrechiloe.cl/pescador-de-chiloe/",
    "https://panchitarecorrechiloe.cl"
  ]
},

/* ------------------ Ari-test — Macarena Silva ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2838253457642059158500495798979/WhatsApp-Image-2023-09-01-at-12.49.38.jpeg",
  orientation: "h",
  span: 1,
  tags: ["investigación","salud","servicio"],
  title: "Ari-test",
  author: "Macarena Silva",
  collab: "Liderado por Macarena Silva. Desarrollado en Ari Health Design",
  area: "Investigación / Salud / Servicio",
  year: "2022",
  url: "https://alumni.uc.cl/actualidad/iniciativa-para-la-deteccion-del-vph-creada-por-disenadora-uc-macarena-silva-obtiene-premio-latinoamericano/"
},
/* ------------------ Deseo, Carne y Voluntad — Javiera Donoso ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2838275320999836480166714356419/a3407688467_16.jpg",
  orientation: "sq",
  span: 2,
  tags: ["cover art","dirección de arte"],
  title: "Deseo, Carne y Voluntad",
  author: "Javiera Donoso",
  collab: "Banda: Candelabro",
  area: "Cover Art / Dirección de arte",
  year: "2025",
  url: "https://soloartistaschilenos.cl/deseo-carne-y-voluntad-de-candelabro-un-abrazo-a-la-espiritualidad-y-una-feroz-demostracion-de-madurez-musical/"
},

/* ------------------ Ahora o nunca — Javiera Donoso ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2838275388164431652543191790275/Captura-de-pantalla-2026-03-13-a-las-16.43.15.png",
  orientation: "sq",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Ahora o nunca",
  author: "Javiera Donoso",
  collab: "Banda: Candelabro",
  area: "Cover Art / Dirección de arte",
  year: "2024",
  url: "https://www.instagram.com/p/C2vNeBzvoNz/"
},
/* ------------------ The Art of Talking About Art — María Jesús Vidal Lynch ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2839502320717933601075579269827/Captura-de-pantalla-2026-03-14-a-las-11.12.16.png",
  orientation: "v",
  span: 1,
  tags: ["servicio","cultura","exhibición"],
  title: "The Art of Talking About Art",
  author: "María Jesús Vidal Lynch",
  collab: "Research & design of the overall project",
  area: "Servicio / Cultura / Exhibición",
  year: "2023",
  url: "https://mjvidallynch.myportfolio.com/the-art-of-talking-about-art"
},

/* ------------------ Refugia — Constanza Weinreich Siraqyan ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2839495259691683810607121248963/1770321553813.jpeg",
  orientation: "v",
  span: 1,
  tags: ["dirección creativa","identidad visual"],
  title: "Refugia",
  author: "Constanza Weinreich Siraqyan",
  collab: "Vomva: branding y dirección. Constanza Weinreich: diseño visual y dirección",
  area: "Dirección creativa / Identidad visual",
  year: "2025",
  url: "https://www.linkedin.com/posts/c-weinreich_dise%C3%B1o-de-identidad-visual-y-marca-de-refugia-activity-7425266784230084608-_xkG"
},

/* ------------------ MUDA — Ignacia Bianchi ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2839495436356151804523497075395/Captura-de-pantalla-2026-03-14-a-las-10.44.05.png",
  orientation: "v",
  span: 1,
  tags: ["indumentaria","objeto","textil"],
  title: "MUDA",
  author: "Ignacia Bianchi",
  collab: "Fotografía: Dillan González",
  area: "Indumentaria / Objeto / Textil",
  year: "2025",
  url: [
    "https://ignaciabianchi.myportfolio.com/muda",
    "https://www.linkedin.com/posts/ignacia-bianchi-977853372_muy-feliz-de-contarles-que-el-pasado-22-de-activity-7415438031157186560-Xggu"
  ]
},

/* ------------------ Regularidad Irregular — Ignacia Bianchi ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2839495259673237066533411697347/d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920.JPG",
  orientation: "v",
  span: 1,
  tags: ["indumentaria","objeto","textil"],
  title: "Regularidad Irregular",
  author: "Ignacia Bianchi",
  collab: "",
  area: "Indumentaria / Objeto / Textil",
  year: "2024",
  url: "https://ignaciabianchi.myportfolio.com/pleats-pleats-pleats"
},

/* ------------------ Hati: El Equilibrio de los Espíritus — Clara Valenzuela Lowey ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/F2839500316442296504385377088195/625530226_17872909344521833_8996592620757902267_n.jpg",
  orientation: "v",
  span: 1,
  tags: ["juego de mesa","producto"],
  title: "Hati: El Equilibrio de los Espíritus",
  author: "Clara Valenzuela Lowey",
  collab: "Financiado por FONDART",
  area: "Juego de mesa / Producto",
  year: "2024",
  url: "https://www.instagram.com/p/DV11EWUFhSp/"
},

/* ------------------ La ciudad como texto — Carola Ureta ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/B2839501183845096338355913175747/Captura-de-pantalla-2026-03-14-a-las-11.12.54.png",
  orientation: "v",
  span: 1,
  tags: ["web","experiencia","cultura"],
  title: "La ciudad como texto",
  author: "Carola Ureta",
  collab: "Desarrollo web: Felipe Sologuren",
  area: "Web / Experiencia / Cultura",
  year: "2020",
  url: [
    "https://www.laciudadcomotexto.cl",
    "https://www.instagram.com/laciudadcomotexto"
  ]
},

/* ------------------ Metanoien — Tomás Corvalán Azócar ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2839495259654790322459702145731/DSC_2551-e1531948324611.jpg",
  orientation: "v",
  span: 1,
  tags: ["moda","indumentaria","cultura"],
  title: "Metanoien",
  author: "Tomás Corvalán Azócar",
  collab: "",
  area: "Moda / Indumentaria / Cultura",
  year: "2018",
  url: "https://pousta.com/tomas-corvalan-azocar-metanoien/"
},

/* ------------------ Diseño basado en Simbiogénesis — Daniela Rojas-Levy ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/T2839495259636343578385992594115/cover_issue_305_es_ES.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Desde la bio-imitación a la bioextrapolación: Diseño basado en Simbiogénesis",
  author: "Daniela Rojas-Levy",
  collab: "Durán-Vargas, A., & Rojas-Levy, D. (2021)",
  area: "Investigación / Publicación académica",
  year: "2021",
  url: "https://dspace.palermo.edu/ojs/index.php/cdc/article/view/5004"
},

/* ------------------ Humanidad Teenager — Benjamín Saíz ------------------ */
{
  src: "",
  orientation: "v",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Humanidad Teenager",
  author: "Benjamín Saíz",
  collab: "",
  area: "Cover Art / Dirección de arte",
  year: "2021",
  url: "https://www.behance.net/gallery/111240593/Humanidad-Teenager-Portada-y-Animaciones"
},

/* ------------------ CHT Lab — Benjamín Saíz ------------------ */
{
  src: "",
  orientation: "v",
  span: 1,
  tags: ["identidad visual"],
  title: "CHT Lab",
  author: "Benjamín Saíz",
  collab: "",
  area: "Identidad visual",
  year: "2021",
  url: "https://www.behance.net/gallery/111241797/CHT-Lab-2021"
},

/* ------------------ Si el mundo se acabara hoy — Pablo González ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2838277900592527747710412337859/66725.jpg",
  orientation: "sq",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Si el mundo se acabara hoy",
  author: "Pablo González",
  collab: "Banda: Ad Portas",
  area: "Cover Art / Dirección de arte",
  year: "2025",
  url: "https://portaldisc.com/contenido/single-adportas-si-el-mundo-acaba-hoy"
},

/* ------------------ Resonancias Tectónicas — Marcos Chillet ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/N2838258980855489244172183352003/Captura-de-pantalla-2026-03-13-a-las-16.31.45.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación"],
  title: "Resonancias Tectónicas",
  author: "Marcos Chilet",
  collab: "Autores: Pablo Hermansen, Martín Tironi, Carlos Chilet, Carola Ureta. Editorial: Ediciones UC",
  area: "Editorial / Investigación",
  year: "2024",
  url: [
    "https://artishockrevista.com/2021/06/14/resonancias-tectonicas-chile-bienal-diseno-londres-2021/",
    "https://lea.uc.cl/resonancias-tectonicas/p"
  ]
},

/* ------------------ Salud Oportuna — Sara Riveros ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2838253457549825438131948040899/Group-147.png.jpg",
  orientation: "v",
  span: 1,
  tags: ["servicio","innovación","investigación"],
  title: "Salud Oportuna",
  author: "Sara Riveros",
  collab: "Desarrollado en Laboratorio de Innovación Pública UC (LIP)",
  area: "Servicio / Innovación / Investigación",
  year: "2019–en curso",
  url: "https://www.saludoportuna.cl/soluciones"
},

/* ------------------ GOLDFISH — María Jesús Contreras ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/V2838253642017266175227464200899/Captura-de-pantalla-2026-03-13-a-las-16.00.11.png",
  orientation: "v",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "GOLDFISH",
  author: "María Jesús Contreras",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Stilllife 1 — María Jesús Contreras ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2838253641998819431153754649283/Captura-de-pantalla-2026-03-13-a-las-16.00.27.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Stilllife 1",
  author: "María Jesús Contreras",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ 30 Grad Mag — María Jesús Contreras ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Z2838253641980372687080045097667/Captura-de-pantalla-2026-03-13-a-las-16.01.50.png",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "30 Grad Mag",
  author: "María Jesús Contreras",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Frog Party — María Jesús Contreras ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/H2838253641961925943006335546051/Captura-de-pantalla-2026-03-13-a-las-16.02.20.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Frog Party",
  author: "María Jesús Contreras",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Metro 21 — Josefina Andreu ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2838253457623612414426786247363/metro21-4.jpg",
  orientation: "v",
  span: 1,
  tags: ["galería","cultura"],
  title: "Metro 21",
  author: "Josefina Andreu",
  collab: "Directora: Josefina Andreu",
  area: "Galería / Cultura",
  year: "2021",
  url: [
    "https://www.metro21.cl",
    "https://amosantiago.cl/galeria-metro-21-arte-conceptual-a-la-calle/"
  ]
},

/* ------------------ Confluencia — Josefina Andreu ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/S2838253457512931949984528937667/IMG-PAG-04.jpg",
  orientation: "v",
  span: 2,
  tags: ["editorial","dirección creativa"],
  title: "Confluencia: Ruta de 52 murales en la Región Metropolitana",
  author: "Josefina Andreu",
  collab: "",
  area: "Editorial / Dirección creativa",
  year: "2024",
  url: "https://www.metro21.cl/proyectos/confluencia-ruta-de-murales-de-la-region-metropolitana/"
},

/* ------------------ Borrowed Matter / Materia Prestada — Sofía Guridi ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2838253457605165670353076695747/Materia-Prestada-11.jpg",
  orientation: "v",
  span: 1,
  tags: ["exhibición","cultura","experiencia"],
  title: "Borrowed Matter / Materia Prestada",
  author: "Sofía Guridi",
  collab: "Curador: Juan Pablo Vergara. Bienal de Diseño de Londres 2023",
  area: "Exhibición / Cultura / Experiencia",
  year: "2023",
  url: [
    "https://sofiaguridi.xyz/borrowed-mattermateria-prestada",
    "https://www.zancada.com/materia-prestada-borrowed-matter/"
  ]
},

/* ------------------ Dissolvable Biotextile Keyboard — Sofía Guridi ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2838253457586718926279367144131/756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840.jpg",
  orientation: "h",
  span: 2,
  tags: ["exhibición","objeto","experiencia"],
  title: "Dissolvable Biotextile Keyboard",
  author: "Sofía Guridi",
  collab: "Fotografía: Vertti Virasjoki. Presentado en Dutch Design Week 2024",
  area: "Objeto / Exhibición",
  year: "2024",
  url: "https://sofiaguridi.xyz/dissolvable-biotextile-keyboard"
},

/* ------------------ Palpa — Josefa Cortés ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2838253457568272182205657592515/Palpa.jpg",
  orientation: "v",
  span: 1,
  tags: ["salud","servicio","investigación","producto"],
  title: "Palpa",
  author: "Josefa Cortés",
  collab: "",
  area: "Salud / Servicio / Investigación / Producto",
  year: "2019–en curso",
  url: [
    "https://palpa.cl",
    "https://alumni.uc.cl/actualidad/josefa-cortes-disenadora-uc-dentro-de-losas-100-jovenes-lideres-2020/"
  ]
},

/* ------------------ El Delantal Vestido (Iluminación) — Catalina Harasic ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2831938879149465764080550097603/Harasic-Catalina-2.jpeg",
  orientation: "v",
  span: 1,
  tags: ["iluminación","industrial","espacio"],
  title: "El Delantal Vestido",
  author: "Catalina Harasic",
  collab: "Curaduría e investigación: Camila Ríos Erazo. Fotografía: Valentina Osnovikoff",
  area: "Iluminación / Industrial / Espacios",
  year: "2024",
  url: "https://www.linkedin.com/in/catalina-harasic-gil-9239a844/details/projects/?profileUrn=urn%3Ali%3Afsd_profile%3AACoAAAlm0SsBad8u2IpnSwXl7YUI3xvZq3sFM21"
},

/* ------------------ Zipi — Maximiliano Contreras ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/B2831946269671458199149019083459/Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial"],
  title: "Zipi",
  author: "Maximiliano Contreras",
  collab: "",
  area: "Producto / Industrial",
  year: "2026",
  url: "https://www.instagram.com/zipi.cl/"
},
/* ------------------ Dulces Paula — Paulina Astudillo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/F2831958625153064817217015067331/Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Postres Paula",
  author: "Paulina Astudillo",
  collab: "Diseño gráfico: Paulina Astudillo y equipo Otros Pérez. Identidad desarrollada en Otros Pérez",
  area: "Branding / Identidad visual / Gráfico",
  year: "2026",
  url: "https://www.instagram.com/p/DU3QMA-kVtX/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
},

/* ------------------ Vestigios — Carolina Pacheco ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2831969376376679576986435662531/pacheco-Carolina-16.jpg",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "Vestigios",
  author: "Carolina Pacheco",
  collab: "Idea original, investigación, dirección creativa y ejecución: Colectivo Ronda (Yael Berkowitz, Aníbal Fuentes, Natalia Cerda, Carolina Pacheco, Francisca Feijoo, Loreto Leiva). Fotografías: Benjamín Salazar",
  area: "Museografía / Exhibición / Investigación",
  year: "2022",
  url: "https://www.caropacheco.work/vestigios"
},

/* ------------------ El Delantal Vestido — Camila Ríos ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/P2831969376413573065133854765763/Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "El Delantal Vestido",
  author: "Camila Ríos",
  collab: "Curaduría: Camila Ríos Erazo. Diseño, investigación y desarrollo etapa Textiles domésticos: Camila Ríos Erazo y Loreto Casanueva Reyes",
  area: "Museografía / Exhibición / Investigación",
  year: "2024",
  url: ["https://camilarios.com/el-delantal-vestido","https://www.instagram.com/p/DB2ONWqujBV/?img_index=1"]
},

/* ------------------ Sonic Ecologies 2.0 — Joaquín Rosas ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2832966899834431604011737494211/rosas-joaquin-1.png",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "Sonic Ecologies 2.0",
  author: "Joaquín Rosas",
  collab: "Moving Works + Low Studio. Universidad Adolfo Ibáñez (2023). Fotografías: Hurto Visual",
  area: "Museografía / Exhibición / Investigación",
  year: "2023",
  url: "https://joaquinrosas.com/SONIC-ECOLOGIES-EXHIBITION"
},

/* ------------------ Gubii Bags — Joaquín Rosas ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2832966899852878348085447045827/ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c.jpeg",
  orientation: "v",
  span: 1,
  tags: ["producto","packaging","textil"],
  title: "Gubii Bags",
  author: "Joaquín Rosas",
  collab: "Diseño de mochila infantil para la marca Gubii. Incluye: diseño de logo, identidad gráfica y sistema visual. Ilustraciones de animales chilenos",
  area: "Producto / Packaging / Textil",
  year: "2025",
  url: "https://joaquinrosas.com/GUBII-BAGS"
},

/* ------------------ Across Andes 2025 Volcano Edition — Joaquín Rosas ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2832966899815984859938027942595/rosas-joaquin-MAPAAA-2025-Final_1340_c.jpeg",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Across Andes 2025 Volcano Edition",
  author: "Joaquín Rosas",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://joaquinrosas.com/ACROSS-ANDES-MAP"
},

/* ------------------ Natural Killer — Leopoldo Herrera ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2832967861795241559817435165379/herrera-leopoldo.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","juego de mesa"],
  title: "Natural Killer",
  author: "Leopoldo Herrera",
  collab: "Co-creador: Leopoldo Herrera",
  area: "Producto / Juego de mesa",
  year: "2024",
  url: "https://www.behance.net/gallery/210222175/Natural-Killer-Boardgame"
},

/* ------------------ Con Devuelta — Isabel Díaz-del Río ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/M2832974993122033015192994394819/rios-isabel.jpg",
  orientation: "sq",
  span: 1,
  tags: ["servicio","social","ecología"],
  title: "Con Devuelta",
  author: "Isabel Díaz-del Río",
  collab: "",
  area: "Servicio / Social / Ecología",
  year: "2022",
  url: ["https://condevuelta.cl","https://www.elmostrador.cl/agenda-pais/agenda-innovacion/2023/08/31/con-devuelta-la-startup-que-busca-eliminar-el-packaging-desechable-en-los-locales-de-comida/"]
},

/* ------------------ Calcáreo — Carolina Pacheco ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2831969376395126321060145214147/pacheco-carolina-2-2-5-lateral.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","biomaterial","investigación"],
  title: "Calcáreo",
  author: "Carolina Pacheco",
  collab: "Proyecto de título en Diseño UC. Profesores guía: Alejandro Durán, María José Besoaín, Aníbal Fuentes, Alejandro Weiss. Fotografías: Omar Faundez, Antonia Valencia, Carolina Pacheco",
  area: "Producto / Biomaterial / Investigación",
  year: "2019",
  url: "https://www.caropacheco.work/calcareo"
},

/* ------------------ AjuarParn — Camila Ríos ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/B2831969376432019809207564317379/Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","packaging","textil"],
  title: "AjuarParn",
  author: "Camila Ríos",
  collab: "",
  area: "Producto / Packaging / Textil",
  year: "2017",
  url: "https://camilarios.com/parn"
},
/* ------------------ Guaico — Joaquín Gajardo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/M2825598558502218669086967542467/Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1.jpg",
  orientation: "h",
  span: 2,
  tags: ["desarrollo web","servicios","ecommerce"],
  title: "Guaico",
  author: "Joaquín Gajardo",
  collab: "Cliente: GUAICO. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Ecommerce",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/proyecto-guaico"
},

    /* ------------------ Campaña día del niño — Francisca Torres ------------------ */
    {
      id: "campana-dia-del-nino",
      title: "Campaña día del niño",
      author: "Francisca Torres",
      collab: "Entrekids.cl",
      area: "Branding / Identidad visual",
      year: 2022,
      tags: ["branding", "identidad visual", "gráfico"],
      src: "https://freight.cargo.site/t/original/i/A2726565970425168368382203343555/Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51.png",
      url: "https://flen.es/campana-dia-del-nino"
    }
    
  ];
    // Normalizar tags + crear índice de búsqueda
    DB.forEach(normalizeProjectTags);

  /* ===== Reordenamiento de proyectos al cargar ===== */
  // Opción A: Shuffle aleatorio (Fisher-Yates)
  // Opción B: Rotación persistente (por defecto)
  const USE_RANDOM_SHUFFLE = false; // Cambiar a true para usar shuffle aleatorio
  const ROTATION_STEP = 7; // Ajusta este valor para cambiar el "paso" de rotación (cuántos items se mueven por carga)

  function shuffleArray(array) {
    const shuffled = array.slice(); // Clonar para no mutar el original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function rotateArray(array, step) {
    // Obtener el offset actual del localStorage
    let currentOffset = parseInt(localStorage.getItem('ref2d_rotation_offset') || '0', 10);
    
    // Aumentar el offset con el paso
    currentOffset = (currentOffset + step) % array.length;
    
    // Guardar el nuevo offset
    localStorage.setItem('ref2d_rotation_offset', currentOffset.toString());
    
    // Rotar el array: tomar desde offset hasta el final, luego desde inicio hasta offset
    return array.slice(currentOffset).concat(array.slice(0, currentOffset));
  }

  // Aplicar reordenamiento según la opción seleccionada
  let DB_ORDERED = USE_RANDOM_SHUFFLE 
    ? shuffleArray(DB) 
    : rotateArray(DB, ROTATION_STEP);

  /* Activo + generador circular */
  let activeList = DB_ORDERED.slice();
  let genPtr = 0;
  let activeView = 'bento';
  let masonryRaf = null;
  let listSortKey = '';
  let listSortDir = 1;
  let gridRenderToken = 0;
  let filterDebounceTimer = null;
  const FILTER_DEBOUNCE_MS = 220;
  let fillAroundRaf = null;
  const BENTO_PREFETCH_X = 1.35;
  const BENTO_PREFETCH_Y = 1.35;
  const BENTO_CULL_MARGIN = 2600;
  const BENTO_MAX_ITEMS_IN_DOM = 700;
  const BENTO_MAX_NEW_PER_PASS = 190;
  const SIMPLE_CARD_COUNT = 3;
  const nextMeta = ()=> activeList.length ? activeList[(genPtr++) % activeList.length] : null;

  /* Crear tarjeta */
  let globalId = 0;
  function makeCard(i, dir, meta){
    if(!meta) return;
    const orient = meta.orientation || 'h';
    const span2  = meta.span===2;
    const tags   = (meta.tags||[]);

    const w = span2 ? (COL_W*2+GAP) : COL_W;
    const ratio = (orient==='h')? (4/3) : (orient==='v')? (3/4) : 1;
    const h = Math.round(w/ratio);

    // columnas involucradas
    const colA = ensureColumn(i);
    const colB = span2 ? ensureColumn(i+1) : null;

    let y;
    if(dir==='down'){
      if(span2){
        // ocupa dos columnas: alinea a la más "alta" y empuja ambas
        const start = Math.max(colA.yDown, colB.yDown);
        y = start;
        const next = start + h + GAP;
        colA.yDown = next;
        colB.yDown = next;
      } else {
        y = colA.yDown;
        colA.yDown += h + GAP;
      }
    } else {
      // dir === 'up'
      if(span2){
        const start = Math.min(colA.yUp, colB.yUp) - h - GAP;
        y = start;
        colA.yUp = start;
        colB.yUp = start;
      } else {
        y = colA.yUp - h - GAP;
        colA.yUp = y;
      }
    }

    const el = document.createElement('article');
    el.className = `ref2d__item ${span2?'span-2':'norm'} ratio-${orient}`;
    el.style.left = colA.pos + "px";
    el.style.top  = y + "px";
    el.style.background = meta.src ? "#000" : PALETTE[globalId % PALETTE.length];
    el.dataset.y       = String(y);
    el.dataset.h       = String(h);
    el.dataset.id      = meta.id ?? globalId;
    el.dataset.tags    = tags.join(' | ');
    el.dataset.title   = meta.title || '—';
    el.dataset.author  = meta.author || '—';
    el.dataset.area    = meta.area || '—';
    el.dataset.year    = meta.year || '—';
    el.dataset.url     = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
    el.dataset.collab  = meta.collab || '';
    el._meta = meta;

    const proxy = document.createElement('div');
    proxy.className='ratio-proxy';
    el.appendChild(proxy);

    if(meta.src){
      const img = new Image();
      img.src = meta.src;
      img.loading='lazy';
      img.decoding='async';
      img.fetchPriority = 'low';
      Object.assign(img.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'cover'});
      el.appendChild(img);
    }

    const metaBox = document.createElement('div');
    metaBox.className='ref2d__meta';
    tags.slice(0,3).forEach(t=>{
      const c=document.createElement('span');
      c.className='ref2d__chip';
      c.textContent=t;
      c.setAttribute('data-tag', t);
      // Etiquetas de la grilla también son clickeables
      c.addEventListener('click', (e)=>{
        // Suprimir click si acabamos de hacer drag
        if(performance.now() < suppressClickUntil){
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        e.stopPropagation(); // Evita que se abra el modal al hacer click en la etiqueta
        if (search) search.value=t;
        applyFilter(t);
      }); // Sin capture phase
      metaBox.appendChild(c);
    });
    el.appendChild(metaBox);

    plane.appendChild(el);
    globalId++;
  }

  function createSharedCardElement(meta, className, options = {}) {
    const maxTags = Number.isFinite(options.maxTags) ? options.maxTags : 4;
    const onImageLoad = typeof options.onImageLoad === 'function' ? options.onImageLoad : null;
    const el = document.createElement('article');
    const orient = meta.orientation || 'h';
    const isFeatured = meta.span === 2;
    el.className = `${className} is-${orient} ${isFeatured ? 'is-featured' : ''}`;
    el.dataset.tags   = (meta.tags || []).join(' | ');
    el.dataset.title  = meta.title || '—';
    el.dataset.author = meta.author || '—';
    el.dataset.area   = meta.area || '—';
    el.dataset.year   = meta.year || '—';
    el.dataset.url    = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
    el.dataset.collab = meta.collab || '';
    el._meta = meta;

    const body = document.createElement('div');
    body.className = 'ref2d__view-card-body';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'ref2d__view-card-figure';
    if (meta.src) {
      const img = new Image();
      img.src = meta.src;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.fetchPriority = 'low';
      img.alt = meta.title || '';
      if (onImageLoad) {
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageLoad);
      }
      imgWrap.appendChild(img);
    }
    body.appendChild(imgWrap);

    const head = document.createElement('div');
    head.className = 'ref2d__view-card-head';
    const title = document.createElement('h3');
    title.textContent = meta.title || '—';
    const author = document.createElement('p');
    author.textContent = meta.author || '—';
    head.appendChild(title);
    head.appendChild(author);
    body.appendChild(head);

    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'ref2d__view-card-tags';
    (meta.tags || []).slice(0, maxTags).forEach((t) => {
      const chip = document.createElement('span');
      chip.className = 'ref2d__chip';
      chip.textContent = t;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (search) search.value = t;
        applyFilter(t);
      });
      tagsWrap.appendChild(chip);
    });
    body.appendChild(tagsWrap);
    el.appendChild(body);

    el.addEventListener('click', () => openSpotlight(el));
    return el;
  }

  function layoutMultiGridMasonry() {
    if (!multiGrid || activeView !== 'grid' || multiGrid.hidden) return;

    const styles = getComputedStyle(multiGrid);
    const rowUnit = parseFloat(styles.getPropertyValue('grid-auto-rows'));
    const rowGap = parseFloat(styles.getPropertyValue('row-gap'));
    if (!rowUnit) return;

    multiGrid.querySelectorAll('.ref2d__view-card').forEach((card) => {
      const content = card.querySelector('.ref2d__view-card-body');
      if (!content) return;
      const span = Math.ceil((content.getBoundingClientRect().height + rowGap) / (rowUnit + rowGap));
      card.style.gridRowEnd = `span ${Math.max(span, 1)}`;
    });
  }

  function scheduleMultiGridLayout() {
    if (masonryRaf !== null) return;
    masonryRaf = requestAnimationFrame(() => {
      masonryRaf = null;
      layoutMultiGridMasonry();
    });
  }

  function renderMultiGridView() {
    if (!multiGrid) return;
    const renderToken = ++gridRenderToken;
    multiGrid.innerHTML = '';

    if (!activeList.length) {
      multiGrid.innerHTML = '<p class="ref2d__empty">Sin resultados para esta búsqueda.</p>';
      return;
    }

    const BATCH_SIZE = 40;
    let cursor = 0;

    const appendBatch = () => {
      if (renderToken !== gridRenderToken || activeView !== 'grid' || !multiGrid) return;
      const frag = document.createDocumentFragment();
      const end = Math.min(cursor + BATCH_SIZE, activeList.length);
      while (cursor < end) {
        const meta = activeList[cursor++];
        const card = createSharedCardElement(meta, 'ref2d__view-card', { onImageLoad: scheduleMultiGridLayout });
        frag.appendChild(card);
      }
      multiGrid.appendChild(frag);
      scheduleMultiGridLayout();
      if (cursor < activeList.length) {
        requestAnimationFrame(appendBatch);
      }
    };

    appendBatch();
  }

  function getSimpleSelectionFromCategories(projects, amount = SIMPLE_CARD_COUNT) {
    if (!projects.length) return [];
    const target = Math.min(amount, projects.length);
    const byCategory = new Map();

    projects.forEach((meta) => {
      const keys = (meta._tagKeys && meta._tagKeys.length)
        ? meta._tagKeys
        : (meta.tags || []).map(canonicalTagKey).filter(Boolean);
      const uniqueKeys = Array.from(new Set(keys));
      if (!uniqueKeys.length) {
        if (!byCategory.has('all')) byCategory.set('all', []);
        byCategory.get('all').push(meta);
        return;
      }
      uniqueKeys.forEach((key) => {
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key).push(meta);
      });
    });

    const selected = [];
    const usedProjects = new Set();
    const entries = shuffleArray(Array.from(byCategory.entries()).filter(([, list]) => list.length));

    for (let i = 0; i < entries.length && selected.length < target; i++) {
      const [key, list] = entries[i];
      const shuffledList = shuffleArray(list);
      const candidate = shuffledList.find((item) => !usedProjects.has(item)) || shuffledList[0];
      if (!candidate || usedProjects.has(candidate)) continue;
      usedProjects.add(candidate);
      selected.push({
        meta: candidate,
        categoryKey: key,
        categoryLabel: CAT_LABELS[key] || prettyTag(key)
      });
    }

    if (selected.length < target) {
      const backup = shuffleArray(projects);
      for (let i = 0; i < backup.length && selected.length < target; i++) {
        const candidate = backup[i];
        if (usedProjects.has(candidate)) continue;
        usedProjects.add(candidate);
        selected.push({
          meta: candidate,
          categoryKey: '',
          categoryLabel: ''
        });
      }
    }

    return selected;
  }

  function createSimpleCardElement(entry) {
    const card = createSharedCardElement(entry.meta, 'ref2d__simple-card');
    const body = card.querySelector('.ref2d__view-card-body');
    const head = card.querySelector('.ref2d__view-card-head');
    if (body && head && entry.categoryLabel) {
      const category = document.createElement('span');
      category.className = 'ref2d__simple-card-cat';
      category.textContent = entry.categoryLabel;
      body.insertBefore(category, head);
    }
    return card;
  }

  function renderSimpleView() {
    if (!simpleGrid) return;
    simpleGrid.innerHTML = '';

    if (!activeList.length) {
      simpleGrid.innerHTML = '<p class="ref2d__empty">Sin resultados para esta búsqueda.</p>';
      if (btnSimpleRefresh) btnSimpleRefresh.disabled = true;
      return;
    }
    if (btnSimpleRefresh) btnSimpleRefresh.disabled = false;

    const picks = getSimpleSelectionFromCategories(activeList, SIMPLE_CARD_COUNT);
    const frag = document.createDocumentFragment();
    picks.forEach((entry) => {
      frag.appendChild(createSimpleCardElement(entry));
    });
    simpleGrid.appendChild(frag);
  }

  function normalizedTextValue(value) {
    return norm((value || '').toString());
  }

  function parseYearValue(value) {
    const match = (value || '').toString().match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  }

  function compareIndexItems(a, b) {
    if (listSortKey === 'year') {
      const yearA = parseYearValue(a.year);
      const yearB = parseYearValue(b.year);
      if (yearA === null && yearB !== null) return 1;
      if (yearA !== null && yearB === null) return -1;
      if (yearA !== null && yearB !== null) {
        if (yearA < yearB) return -1 * listSortDir;
        if (yearA > yearB) return 1 * listSortDir;
      }
      const fallback = normalizedTextValue(a.title).localeCompare(normalizedTextValue(b.title), 'es');
      return fallback * listSortDir;
    }

    const valueA = listSortKey === 'author' ? a.author : a.title;
    const valueB = listSortKey === 'author' ? b.author : b.title;
    return normalizedTextValue(valueA).localeCompare(normalizedTextValue(valueB), 'es') * listSortDir;
  }

  function getSortedIndexList() {
    const list = activeList.slice();
    if (!listSortKey) return list;
    return list.sort(compareIndexItems);
  }

  function updateIndexSortUI() {
    if (!indexList) return;
    const headers = indexList.querySelectorAll('.ref2d__indexTable th[data-sort]');
    headers.forEach((th) => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.sort !== listSortKey) return;
      th.classList.add(listSortDir === 1 ? 'sort-asc' : 'sort-desc');
    });
  }

  function renderIndexListView() {
    if (!indexBody) return;
    indexBody.innerHTML = '';
    updateIndexSortUI();

    if (!activeList.length) {
      indexBody.innerHTML = '<tr><td colspan="5" class="ref2d__index-empty">Sin resultados para esta búsqueda.</td></tr>';
      return;
    }

    const list = getSortedIndexList();
    const frag = document.createDocumentFragment();
    list.forEach((meta) => {
      const tr = document.createElement('tr');
      const firstUrl = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
      tr.innerHTML = `
        <td>${meta.title || '—'}</td>
        <td>${meta.author || '—'}</td>
        <td>${meta.area || '—'}</td>
        <td>${meta.year || '—'}</td>
        <td>${firstUrl ? `<a href="${firstUrl}" target="_blank" rel="noopener">↗</a>` : '—'}</td>
      `;
      tr.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const ghost = document.createElement('div');
        ghost.dataset.tags = (meta.tags || []).join(' | ');
        ghost.dataset.title = meta.title || '—';
        ghost.dataset.author = meta.author || '—';
        ghost.dataset.area = meta.area || '—';
        ghost.dataset.year = meta.year || '—';
        ghost.dataset.url = firstUrl;
        ghost.dataset.collab = meta.collab || '';
        ghost._meta = meta;
        openSpotlight(ghost);
      });
      frag.appendChild(tr);
    });
    indexBody.appendChild(frag);
  }

  function renderActiveView() {
    if (activeView === 'bento') {
      resetWorld();
      return;
    }
    if (activeView === 'grid') {
      renderMultiGridView();
      updateCount();
      return;
    }
    if (activeView === 'simple') {
      renderSimpleView();
      updateCount();
      return;
    }
    renderIndexListView();
    updateCount();
  }

  function setView(view) {
    if (filterDebounceTimer !== null) {
      clearTimeout(filterDebounceTimer);
      filterDebounceTimer = null;
    }
    const viewMap = {
      bento: 'Vista: Infinita',
      grid: 'Vista: Grilla',
      index: 'Vista: Lista',
      simple: 'Vista: Simple'
    };
    activeView = viewMap[view] ? view : 'bento';

    const isBento = activeView === 'bento';
    const isGrid = activeView === 'grid';
    const isIndex = activeView === 'index';
    const isSimple = activeView === 'simple';

    if (viewToggle) viewToggle.textContent = viewMap[activeView];
    if (viewport) viewport.hidden = !isBento;
    if (multiGrid) multiGrid.hidden = !isGrid;
    if (indexList) indexList.hidden = !isIndex;
    if (simpleView) simpleView.hidden = !isSimple;
    if (btnCenter) btnCenter.hidden = !isBento;
    if (btnRandom) btnRandom.hidden = !isGrid;
    if (count) count.hidden = false;
    if (!isGrid) {
      gridRenderToken += 1;
    }
    if (btnSearchRandom) {
      btnSearchRandom.hidden = !isGrid;
      btnSearchRandom.textContent = 'Aleatorio';
    }
    if (btnSimpleRefresh) btnSimpleRefresh.hidden = !isSimple;

    renderActiveView();
  }

  function getViewportBounds() {
    const vw = viewport.clientWidth || 0;
    const vh = viewport.clientHeight || 0;
    const top = -camY;
    const bottom = top + vh;
    const left = -camX;
    const right = left + vw;
    return { vw, vh, top, bottom, left, right };
  }

  function cullFarItems() {
    if (!plane || activeView !== 'bento') return;
    const children = plane.children;
    const total = children.length;
    if (!total) return;

    const { top, bottom } = getViewportBounds();
    const minVisible = top - BENTO_CULL_MARGIN;
    const maxVisible = bottom + BENTO_CULL_MARGIN;
    let removed = 0;
    const aggressive = total > BENTO_MAX_ITEMS_IN_DOM;

    for (let idx = children.length - 1; idx >= 0; idx--) {
      const el = children[idx];
      const y = parseFloat(el.dataset.y || '');
      const h = parseFloat(el.dataset.h || '');
      if (!Number.isFinite(y) || !Number.isFinite(h)) continue;
      const isOut = (y + h) < minVisible || y > maxVisible;
      if (!isOut) continue;
      el.remove();
      removed++;
      if (!aggressive && removed >= 50) break;
    }
  }

  /* Relleno alrededor de la vista */
  function fillAround(){
    if(activeList.length===0) return;
    const { vw, vh, top, left, right } = getViewportBounds();
    const leftBound = left - vw * (BENTO_PREFETCH_X - 1);
    const rightBound = right + vw * (BENTO_PREFETCH_X - 1);
    const topV  = top - vh * (BENTO_PREFETCH_Y - 1);
    const bottom = top + vh * BENTO_PREFETCH_Y;
    const startIdx = Math.floor((leftBound)  / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((rightBound) / (COL_W+GAP)) + 2;
    let created = 0;

    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < bottom){
        makeCard(i,'down', nextMeta());
        created++;
        if(col.yDown > yBotLimit-(COL_W*2)) yBotLimit += 1500;
        if (created >= BENTO_MAX_NEW_PER_PASS) {
          cullFarItems();
          requestFillAround();
          return;
        }
      }
      while(col.yUp > topV){
        makeCard(i,'up',   nextMeta());
        created++;
        if(col.yUp   < yTopLimit+(COL_W*2)) yTopLimit -= 1500;
        if (created >= BENTO_MAX_NEW_PER_PASS) {
          cullFarItems();
          requestFillAround();
          return;
        }
      }
    }
    cullFarItems();
  }

  function requestFillAround() {
    if (fillAroundRaf !== null) return;
    fillAroundRaf = requestAnimationFrame(() => {
      fillAroundRaf = null;
      fillAround();
    });
  }

  /* Reset/reordenar mundo */
  function resetWorld(){
    if (fillAroundRaf !== null) {
      cancelAnimationFrame(fillAroundRaf);
      fillAroundRaf = null;
    }
    resetPlaneLimits();
    plane.innerHTML = "";
    columns.clear();
    globalId = 0;
    genPtr = 0;
    applyTransform();
    if (activeList.length === 0) {
      updateCount();
      return;
    }
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const startIdx = Math.floor((-vw*0.5) / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((vw*1.5) / (COL_W+GAP)) + 2;
    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < vh*0.8) makeCard(i,'down', nextMeta());
      while(col.yUp   > -vh*0.8) makeCard(i,'up',   nextMeta());
    }
    updateCount();
    requestFillAround();
  }
  const updateCount = ()=> count && (count.textContent = activeList.length + " ítems");

  /* ===== Pan 2D mejorado: drag vs click ===== */
  const DRAG_THRESHOLD = 10; // px - umbral para distinguir drag de click (ajustado para desktop)
  let isDown = false;
  let isDragging = false;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let downTarget = null;
  let activePid = null;
  let suppressClickUntil = 0; // Para evitar clicks fantasma después de drag
  
  function resetPointerState(){
    isDown = false;
    isDragging = false;
    downTarget = null;
    activePid = null;
    viewport.classList.remove('is-dragging', 'is-panning');
  }
  
  // Handler de pointerdown
  function onPointerDown(e){
    if (activeView !== 'bento') return;
    // Ignorar clicks en elementos interactivos (botones, links, etc.)
    if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('.ref2d__chip')){
      return;
    }
    
    isDown = true;
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    activePid = e.pointerId;
    downTarget = e.target.closest('.ref2d__item');
    
    // Agregar clase de panning
    viewport.classList.add('is-panning');
  }
  
  // Handler de pointermove
  function onPointerMove(e){
    if (activeView !== 'bento') return;
    if(!isDown || activePid === null || e.pointerId !== activePid) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    // Calcular desplazamiento desde el inicio
    const totalDx = currentX - startX;
    const totalDy = currentY - startY;
    const totalDistance = Math.hypot(totalDx, totalDy);
    
    // Si supera el umbral, activar drag
    if(!isDragging && totalDistance > DRAG_THRESHOLD){
      isDragging = true;
      viewport.classList.add('is-dragging');
      // Si había un target, cancelarlo porque ahora es drag
      if(downTarget){
        downTarget = null;
      }
      // Suprimir clicks por un tiempo después de iniciar drag
      suppressClickUntil = performance.now() + 200;
    }
    
    // Si estamos arrastrando, aplicar pan
    if(isDragging){
      const dx = currentX - lastX;
      const dy = currentY - lastY;
      
      camX += dx;
      camY += dy;
      applyTransform();
      requestFillAround();
      
      lastX = currentX;
      lastY = currentY;
      
      if (e.cancelable) e.preventDefault();
    }
  }
  
  // Handler de pointerup
  function onPointerUp(e){
    if (activeView !== 'bento') return;
    if(activePid === null || e.pointerId !== activePid) return;
    
    // Si hubo drag, suprimir clicks por un tiempo
    if(isDragging){
      suppressClickUntil = performance.now() + 200;
    }
    
    resetPointerState();
  }
  
  // Handler de pointercancel
  function onPointerCancel(e){
    if (activeView !== 'bento') return;
    if(activePid === null || e.pointerId !== activePid) return;
    resetPointerState();
  }
  
  // Agregar listeners normales
  viewport.addEventListener('pointerdown', onPointerDown, { passive: false });
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', onPointerCancel, { passive: false });
  
  // Handler de click para abrir popup (solo si no hubo drag)
  viewport.addEventListener('click', (e) => {
    if (activeView !== 'bento') return;
    // Si el click fue en una etiqueta o botón, no interferir
    if(e.target.closest('button') || e.target.closest('a') || e.target.closest('.ref2d__chip')){
      return;
    }

    // Suprimir click si acabamos de hacer drag o si isDragging estaba activo
    if(performance.now() < suppressClickUntil || isDragging){
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Buscar el item clickeado
    const item = e.target.closest('.ref2d__item');
    if(item){
      e.preventDefault();
      e.stopPropagation();
      openSpotlight(item);
    }
  });
  viewport.addEventListener('wheel',(e)=>{
    if (activeView !== 'bento') return;
    e.preventDefault();
    camX -= e.deltaX; camY -= e.deltaY;
    applyTransform();
    requestFillAround();
  },{passive:false});
  if (btnCenter) {
    btnCenter.addEventListener('click', ()=>{
      if (activeView !== 'bento') return;
      camX=camY=0;
      applyTransform();
      requestFillAround();
    });
  
  // Logo REFERENCIOTECA: recargar página completa para reordenar proyectos
  if (brand) {
    brand.addEventListener('click', (e) => {
      e.preventDefault(); // Prevenir el comportamiento por defecto del link
      // Recargar la página completamente para reordenar proyectos aleatoriamente
      window.location.reload();
    });
  }
  }

  /* ===== Spotlight - tamaño controlado por CSS responsivo ===== */
  let _onResizeWhileOpen = null;
  function sizeSheetByImage(nw, nh){
    // Ya no establecemos tamaños fijos - el CSS responsivo controla el tamaño
    // Esta función se mantiene por compatibilidad pero no hace nada
    // El CSS con max-width, max-height y object-fit: contain se encarga de todo
  }

  function formatCollabText(raw) {
    const normalized = String(raw || "").replace(/\s+/g, " ").trim();
    if (!normalized) return "—";

    const withBreaks = normalized
      .replace(/\s*\|\s*/g, "\n")
      .replace(/;\s+(?=[A-Za-zÁÉÍÓÚÜÑ][^:]{1,50}:)/g, "\n")
      .replace(/\.\s+(?=[A-Za-zÁÉÍÓÚÜÑ][^:]{1,50}:)/g, "\n");

    const lines = withBreaks
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.length ? lines.join("\n") : "—";
  }

  function openSpotlight(el){
    resetPointerState(); // por si quedó un drag “medio”
    const meta = el._meta || {};

    sTitle.textContent  = el.dataset.title  || meta.title  || "—";
    sAuthor.textContent = el.dataset.author || meta.author || "—";

    const collabText = meta.collab || el.dataset.collab || "";
    sCollab.textContent = formatCollabText(collabText);

    sArea.textContent   = el.dataset.area   || meta.area   || "—";
    sYear.textContent   = el.dataset.year   || meta.year   || "—";

    // Tags clicables → activan filtro (igual que en la grilla)
    sTags.innerHTML = "";
    (el.dataset.tags||"")
      .split("|")
      .map(s=>s.trim())
      .filter(Boolean)
      .forEach(t=>{
        const chip = document.createElement('span');
        chip.className="ref2d__chip";
        chip.textContent=t;
        chip.setAttribute('data-tag', t); // Para referencia si se necesita
        chip.addEventListener('click', (e)=>{
          e.stopPropagation(); // Evita que el click cierre el modal de otra forma
          if (search) search.value=t;
          applyFilter(t); // Esta función ya cierra el modal automáticamente
        });
        sTags.appendChild(chip);
      });

    // --------- Links (1 o varios) ----------
    // Limpia cualquier link extra generado antes
    document.querySelectorAll(".sheet__link.extra").forEach(a => a.remove());

    // Normalizamos el dato: puede venir como string o como array
    let urls = meta.url || el.dataset.url || "";
    if (!Array.isArray(urls)) {
      urls = urls ? [urls] : [];
    }

    if (!urls.length || !sLink) {
      // No hay links → escondemos el botón principal
      if (sLink) {
        sLink.style.display = "none";
      }
    } else {
      // Siempre mostramos el primer link como "Abrir proyecto ↗"
      sLink.href = urls[0];
      sLink.style.display = "inline-block";
      sLink.target = "_blank";
      sLink.rel = "noopener";
      sLink.textContent = "Abrir proyecto ↗";

      // Si hay links adicionales, creamos botones extra
      for (let i = 1; i < urls.length; i++) {
        const a = document.createElement("a");
        a.className = "sheet__link extra";
        a.href = urls[i];
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Otro enlace ↗";
        sLink.insertAdjacentElement("afterend", a);
      }
    }

    // Imagen - prioriza la miniatura existente y cae a meta.src (clave para vista lista)
    const imgNode = el.querySelector("img");
    const src =
      imgNode?.currentSrc ||
      imgNode?.src ||
      meta.src ||
      el.dataset.src ||
      "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    sheetImg.src = src;
    sheetImg.alt = el.dataset.title || meta.title || "";
    // Ya no necesitamos calcular tamaños - el CSS se encarga de todo
    // Mantenemos el listener de resize por si se necesita en el futuro
    _onResizeWhileOpen = null;

    if (overlay) {
      overlay.removeAttribute('hidden');
    }
    document.body.style.overflow = "hidden";
    // Agregar clase para ocultar botones flotantes en mobile
    document.body.classList.add('is-modal-open');
  }

  function closeSpotlight(){
    if (overlay) {
      overlay.setAttribute('hidden','');
    }
    document.body.style.overflow = "";
    // Remover clase para mostrar botones flotantes en mobile
    document.body.classList.remove('is-modal-open');
    if(_onResizeWhileOpen){
      window.removeEventListener('resize', _onResizeWhileOpen);
      _onResizeWhileOpen = null;
    }
  }

  if (overlay && modal) {
    overlay.addEventListener('click',(e)=>{
      if(!modal.contains(e.target)) closeSpotlight();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click',(e)=>{
      e.stopPropagation();
      closeSpotlight();
    });
  }
  
  // Cerrar modal de proyecto con tecla Escape
  document.addEventListener('keydown', (e) => {
    // Solo cerrar si el modal de proyecto está abierto y no hay otros modales abiertos
    if (e.key === 'Escape' && overlay && !overlay.hidden) {
      // Verificar que no esté abierto el modal de categorías ni el modal institucional
      const catPanelOpen = catPanel && !catPanel.hidden;
      const wipOverlayOpen = wipOverlay && !wipOverlay.hidden;
      
      if (!catPanelOpen && !wipOverlayOpen) {
        e.preventDefault();
        closeSpotlight();
      }
    }
  });

  /* ===== Sugerencias de búsqueda ===== */
  let activeSuggestIndex = -1;

  function showSuggestions(query) {
    if (!suggestionsBox) return;
    
    const q = query.trim().toLowerCase();

    // Resetear índice activo cuando cambian las sugerencias
    activeSuggestIndex = -1;

    if (!q) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.hidden = true;
      return;
    }

    const matches = SUGGESTIONS.filter(s =>
      s.toLowerCase().startsWith(q)
    );

    if (!matches.length) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.hidden = true;
      return;
    }

    suggestionsBox.innerHTML = matches.map(s => (
      `<div class="ref2d__suggestion-item" data-suggestion="${s}" role="option" tabindex="-1">${s}</div>`
    )).join('');

    suggestionsBox.hidden = false;
    suggestionsBox.setAttribute('role', 'listbox');
  }

  // Función para aplicar una sugerencia (reutilizable desde click y teclado)
  function applySuggestion(value) {
    if (!search) return;
    search.value = value;
    queueFilter(value, true);
    if (suggestionsBox) {
      suggestionsBox.hidden = true;
    }
    activeSuggestIndex = -1;
  }

  // Actualizar la sugerencia activa visualmente
  function updateActiveSuggestion(items) {
    if (!items || items.length === 0) return;
    
    items.forEach((el, i) => {
      if (i === activeSuggestIndex) {
        el.classList.add('is-active');
        el.setAttribute('aria-selected', 'true');
        // Scroll automático para mantener visible el item activo
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        el.classList.remove('is-active');
        el.removeAttribute('aria-selected');
      }
    });
  }

  // Cerrar sugerencias y resetear estado
  function closeSuggestions() {
    if (!suggestionsBox) return;
    suggestionsBox.hidden = true;
    activeSuggestIndex = -1;
    
    // Limpiar clase activa de todos los items
    const items = suggestionsBox.querySelectorAll('.ref2d__suggestion-item');
    items.forEach(el => {
      el.classList.remove('is-active');
      el.removeAttribute('aria-selected');
    });
  }

  function updateSearchClearVisibility() {
    if (!searchClearBtn || !search) return;
    searchClearBtn.hidden = !search.value.trim();
  }

  function queueFilter(term, immediate = false) {
    if (filterDebounceTimer !== null) {
      clearTimeout(filterDebounceTimer);
      filterDebounceTimer = null;
    }
    if (immediate || activeView !== 'bento') {
      applyFilter(term);
      return;
    }
    filterDebounceTimer = setTimeout(() => {
      filterDebounceTimer = null;
      applyFilter(term);
    }, FILTER_DEBOUNCE_MS);
  }

  function tokenizeSearchTerm(term) {
    return norm(term)
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function getFilteredProjects(tokens) {
    if (!tokens.length) return DB_ORDERED.slice();

    const strict = DB.filter((x) => {
      const hay = x._search || '';
      return tokens.every((tok) => hay.includes(tok));
    });
    if (strict.length) return strict;

    // Fallback tolerante: si no hay match estricto, mostrar coincidencias parciales
    return DB.filter((x) => {
      const hay = x._search || '';
      return tokens.some((tok) => hay.includes(tok));
    });
  }

  /* ===== Filtro que reordena (robusto) ===== */
  function applyFilter(term){
    if (filterDebounceTimer !== null) {
      clearTimeout(filterDebounceTimer);
      filterDebounceTimer = null;
    }
    updateSearchClearVisibility();
    const q = norm(term);
    const tokens = tokenizeSearchTerm(term);
    if(q){
      const list = getFilteredProjects(tokens);
      if(list.length === 0){
        activeList = [];
        if (activeView === 'bento') {
          camX = 0;
          camY = 0;
          applyTransform();
        }
        closeSpotlight();
        renderActiveView();
        if (count) {
          count.textContent = `0 ítems — sin resultados para “${term}”`;
        }
        // Limpiar highlight de categorías si no hay resultados
        highlightActiveCategory('');
        return;
      }
      activeList = list;
      // Sincronizar highlight de categorías si el término coincide con una categoría
      const normalizedTerm = q.replace(/\s+/g, ' ').trim();
      const matchingCat = normalizedTerm ? canonicalTagKey(normalizedTerm) : '';
      highlightActiveCategory(matchingCat || '');
    }else{
      // Sin filtro: usar el orden reordenado inicial
      activeList = DB_ORDERED.slice();
      highlightActiveCategory('all');
    }
    if (activeView === 'bento') {
      // Evita bloqueos cuando se filtra después de desplazarse mucho en infinito.
      camX = 0;
      camY = 0;
      applyTransform();
    }
    closeSpotlight();
    renderActiveView();
  }
  if (search) {
    updateSearchClearVisibility();
    // Mostrar sugerencias al escribir o al hacer focus
    search.addEventListener('focus', () => {
      showSuggestions(search.value);
    });

    search.addEventListener('input', (e) => {
      const value = e.target.value;
      showSuggestions(value);
      updateSearchClearVisibility();
      queueFilter(value);
    });

    // Navegación con teclado en sugerencias
    search.addEventListener('keydown', (e) => {
      const items = suggestionsBox
        ? Array.from(suggestionsBox.querySelectorAll('.ref2d__suggestion-item'))
        : [];

      const isOpen = suggestionsBox && !suggestionsBox.hidden && items.length > 0;

      if (e.key === 'ArrowDown') {
        if (isOpen) {
          e.preventDefault();
          activeSuggestIndex = (activeSuggestIndex + 1) % items.length;
          updateActiveSuggestion(items);
        } else {
          // Si está cerrado, abrir y seleccionar primera
          if (search.value.trim()) {
            showSuggestions(search.value);
            const newItems = Array.from(suggestionsBox.querySelectorAll('.ref2d__suggestion-item'));
            if (newItems.length > 0) {
              activeSuggestIndex = 0;
              updateActiveSuggestion(newItems);
            }
          }
        }
      } else if (e.key === 'ArrowUp') {
        if (isOpen) {
          e.preventDefault();
          activeSuggestIndex = (activeSuggestIndex - 1 + items.length) % items.length;
          updateActiveSuggestion(items);
        }
      } else if (e.key === 'Enter') {
        if (isOpen && activeSuggestIndex >= 0 && activeSuggestIndex < items.length) {
          e.preventDefault();
          const item = items[activeSuggestIndex];
          const value = item.dataset.suggestion || item.textContent.trim();
          applySuggestion(value);
        } else {
          queueFilter(search.value, true);
        }
        // Si no hay sugerencia activa, Enter funciona normal (búsqueda con texto actual)
      } else if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          closeSuggestions();
        } else {
          // Si está cerrado, limpiar búsqueda
          search.value = '';
          updateSearchClearVisibility();
          queueFilter('', true);
        }
      }
    });
  }

  if (searchClearBtn && search) {
    searchClearBtn.addEventListener('click', () => {
      search.value = '';
      updateSearchClearVisibility();
      closeSuggestions();
      queueFilter('', true);
      search.focus();
    });
  }

  // Manejar clics en las sugerencias
  if (suggestionsBox) {
    suggestionsBox.addEventListener('click', (ev) => {
      const item = ev.target.closest('.ref2d__suggestion-item');
      if (!item) return;

      const term = item.dataset.suggestion || item.textContent.trim();
      applySuggestion(term);
    });
  }

  // Ocultar sugerencias al hacer clic fuera
  document.addEventListener('click', (ev) => {
    if (suggestionsBox && 
        !ev.target.closest('#ref2dSearch') &&
        !ev.target.closest('#ref2dSuggestions')) {
      closeSuggestions();
    }
  });


  /* API pública para tus proyectos reales */
  window.Refx2D = {
    add(item){
      const id = DB.length;
      const newItem = Object.assign(
        {id, src:"", orientation:"h", span:1, tags:[], title:"—", author:"—", collab:"", area:"—", year:"—", url:""},
        item
      );
      normalizeProjectTags(newItem);
      DB.push(newItem);
      // Reordenar DB_ORDERED cuando se agrega un nuevo proyecto
      if (USE_RANDOM_SHUFFLE) {
        DB_ORDERED = shuffleArray(DB);
      } else {
        DB_ORDERED = rotateArray(DB, 0); // Rotar sin cambiar offset (solo reordenar con el nuevo item)
      }
      if(search && search.value.trim()===""){
        activeList = DB_ORDERED.slice();
        renderActiveView();
      } else {
        applyFilter(search ? search.value : "");
      }
    }
  };

  /* Reflow al redimensionar */
  window.addEventListener('resize', ()=>{
    COL_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--colw'));
    GAP   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
    resetPlaneLimits();
    renderActiveView();
  });

  /* ===== Panel de categorías ===== */
  // Construir estadísticas de categorías
  function buildCategoryStats(projects) {
    const stats = {};

    projects.forEach(p => {
      const keys = (p._tagKeys && p._tagKeys.length)
        ? p._tagKeys
        : (p.tags || []).map(canonicalTagKey);
    
      keys.forEach(key => {
        if (!key) return;
        if (!stats[key]) stats[key] = 0;
        stats[key] += 1;
      });
    });

    const total = projects.length;

    const list = [
      { key: 'all', label: CAT_LABELS.all || 'ALL', count: total }
    ];

    Object.entries(stats)
      .sort((a, b) => {
        // Ordenar por label normalizado, no por key
        const labelA = CAT_LABELS[a[0]] || a[0].toUpperCase();
        const labelB = CAT_LABELS[b[0]] || b[0].toUpperCase();
        return labelA.localeCompare(labelB);
      })
      .forEach(([key, count]) => {
        const label = CAT_LABELS[key] || prettyTag(key);
        list.push({ key, label, count });
      });

    return list;
  }

  // Abrir panel de categorías
  function openCatPanel() {
    if (!catPanel) return;
    catPanel.hidden = false;
    if (catToggle) catToggle.setAttribute('aria-expanded', 'true');
    if (mobileCatToggle) mobileCatToggle.setAttribute('aria-expanded', 'true');
    // Bloquear scroll del body en mobile
    if (window.innerWidth <= 768) {
      document.body.classList.add('ref2d__catPanel-open');
    }
  }

  // Cerrar panel de categorías
  function closeCatPanel() {
    if (!catPanel) return;
    catPanel.hidden = true;
    if (catToggle) catToggle.setAttribute('aria-expanded', 'false');
    if (mobileCatToggle) mobileCatToggle.setAttribute('aria-expanded', 'false');
    // Desbloquear scroll del body
    document.body.classList.remove('ref2d__catPanel-open');
  }

  // Aplicar filtro de categoría
  function applyCategoryFilter(key) {
    if (key === 'all') {
      // Limpiar búsqueda y mostrar todos
      if (search) search.value = '';
      applyFilter('');
    } else {
      // Aplicar filtro por tag
      if (search) search.value = key;
      applyFilter(key);
    }
    highlightActiveCategory(key);
  }

  // Resaltar categoría activa
  function highlightActiveCategory(activeKey) {
    if (!catGrid) return;
    const items = catGrid.querySelectorAll('.ref2d__catItem');
    items.forEach(el => {
      el.classList.toggle(
        'ref2d__catItem--active',
        el.dataset.catKey === activeKey
      );
    });
  }

  // Inicializar panel de categorías
  function initCategoryPanel() {
    if (!catGrid) return;

    const categories = buildCategoryStats(DB);
    catGrid.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ref2d__catItem';
      btn.dataset.catKey = cat.key;
      btn.innerHTML = `
        <span class="ref2d__catItem-label">${cat.label}</span>
        <span class="ref2d__catItem-count">${cat.count}</span>
      `;
      catGrid.appendChild(btn);
    });

    // Toggle del botón desktop
    if (catToggle) {
      catToggle.addEventListener('click', () => {
        if (catPanel && catPanel.hidden) {
          openCatPanel();
        } else {
          closeCatPanel();
        }
      });
    }

    // Toggle del botón flotante mobile
    if (mobileCatToggle) {
      mobileCatToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (catPanel && catPanel.hidden) {
          openCatPanel();
        } else {
          closeCatPanel();
        }
      });
    }

    // Click en categorías
    if (catGrid) {
      catGrid.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.ref2d__catItem');
        if (!btn) return;
        const key = btn.dataset.catKey;
        if (!key) return;

        applyCategoryFilter(key);
        closeCatPanel();
      });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && catPanel && !catPanel.hidden) {
        closeCatPanel();
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (ev) => {
      if (catPanel && !catPanel.hidden &&
          !ev.target.closest('#ref2dCatPanel') &&
          !ev.target.closest('#ref2dCatToggle') &&
          !ev.target.closest('#ref2dMobileCatToggle')) {
        closeCatPanel();
      }
    });
  }

  function openViewMenu() {
    if (!viewMenu || !viewToggle) return;
    viewMenu.hidden = false;
    viewToggle.setAttribute('aria-expanded', 'true');
  }

  function closeViewMenu() {
    if (!viewMenu || !viewToggle) return;
    viewMenu.hidden = true;
    viewToggle.setAttribute('aria-expanded', 'false');
  }

  function initViewSwitcher() {
    if (!viewToggle || !viewMenu) return;

    viewToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (viewMenu.hidden) openViewMenu();
      else closeViewMenu();
    });

    viewMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-view]');
      if (!btn) return;
      setView(btn.dataset.view);
      closeViewMenu();
    });

    document.addEventListener('click', (e) => {
      if (viewMenu.hidden) return;
      if (!e.target.closest('#ref2dViewMenu') && !e.target.closest('#ref2dViewToggle')) {
        closeViewMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && viewMenu && !viewMenu.hidden) {
        closeViewMenu();
      }
    });
  }

  function openHeaderMore() {
    if (!headerMoreBtn || !headerMoreDropdown) return;
    headerMoreDropdown.hidden = false;
    headerMoreBtn.setAttribute('aria-expanded', 'true');
  }

  function closeHeaderMore() {
    if (!headerMoreBtn || !headerMoreDropdown) return;
    headerMoreDropdown.hidden = true;
    headerMoreBtn.setAttribute('aria-expanded', 'false');
  }

  function initHeaderMore() {
    if (headerMoreBtn && headerMoreDropdown) {
      headerMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (headerMoreDropdown.hidden) openHeaderMore();
        else closeHeaderMore();
      });

      document.addEventListener('click', (e) => {
        if (headerMoreDropdown.hidden) return;
        if (!e.target.closest('#ref2dHeaderMore') && !e.target.closest('#ref2dHeaderMoreDropdown')) {
          closeHeaderMore();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeHeaderMore();
    });
  }

  function initRandomButton() {
    const onRandomClick = () => {
      if (activeView === 'grid') {
        activeList = shuffleArray(activeList);
        renderMultiGridView();
        updateCount();
        return;
      }
      if (activeView === 'simple') {
        renderSimpleView();
      }
    };
    if (btnRandom) btnRandom.addEventListener('click', onRandomClick);
    if (btnSearchRandom) btnSearchRandom.addEventListener('click', onRandomClick);
    if (btnSimpleRefresh) btnSimpleRefresh.addEventListener('click', onRandomClick);
  }

  function initIndexSorting() {
    if (!indexList) return;
    const headers = indexList.querySelectorAll('.ref2d__indexTable th[data-sort]');
    headers.forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (!key) return;
        if (listSortKey === key) {
          listSortDir *= -1;
        } else {
          listSortKey = key;
          listSortDir = key === 'year' ? -1 : 1;
        }
        renderIndexListView();
        updateCount();
      });
    });
  }

  /* ===== Modal institucional (work in progress) ===== */
  const wipOverlay = $("#ref2dWipOverlay");
  const wipClose = $("#ref2dWipClose");
  
  function showWipModal(){
    if (!wipOverlay) return;
    // Verificar si ya se cerró en esta sesión
    const hasDismissed = sessionStorage.getItem("ref_wip_dismissed");
    if (hasDismissed === "1") {
      wipOverlay.setAttribute('hidden', '');
      return;
    }
    // Mostrar modal
    wipOverlay.removeAttribute('hidden');
    document.body.style.overflow = "hidden";
  }
  
  function closeWipModal(){
    if (!wipOverlay) return;
    wipOverlay.setAttribute('hidden', '');
    document.body.style.overflow = "";
    // Guardar en sessionStorage que se cerró en esta sesión
    sessionStorage.setItem("ref_wip_dismissed", "1");
  }
  
  // Cerrar con botón X
  if (wipClose) {
    wipClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeWipModal();
    });
  }
  
  // Cerrar al hacer click fuera del modal
  if (wipOverlay) {
    wipOverlay.addEventListener('click', (e) => {
      if (e.target === wipOverlay) {
        closeWipModal();
      }
    });
  }
  
  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wipOverlay && !wipOverlay.hidden) {
      closeWipModal();
    }
  });

  /* Boot */
  renderActiveView();
  if (overlay) {
    overlay.setAttribute('hidden',''); // garantía extra
  }
  
  // Inicializar panel de categorías
  initCategoryPanel();
  initViewSwitcher();
  initHeaderMore();
  initRandomButton();
  initIndexSorting();
  
  // Mostrar modal institucional al cargar (si no se ha visto antes)
  showWipModal();
})();
