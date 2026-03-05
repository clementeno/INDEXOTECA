(function(){
  const $ = s => document.querySelector(s);
  const viewport = $("#ref2dViewport"),
        plane    = $("#ref2dPlane");
  const search  = $("#ref2dSearch"),
        count   = $("#ref2dCount");
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
    'fotografía',
    'dirección creativa',
    'ux',
    'ui',
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
    'instalación'
  ];

  /* Helpers */
  const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const PALETTE = ["#ff6b6b","#ffd93d","#6bcBef","#b084f6","#26de81","#ff9f1a","#f368e0","#00d2d3","#10ac84","#a29bfe","#fd79a8","#81ecec"];

  /* Mapeo de labels para categorías (normalizado) */
  const CAT_LABELS = {
    'all': 'ALL',
    'editorial': 'EDITORIAL',
    'ilustración': 'ILUSTRACIÓN',
    'dirección de arte': 'ART DIRECTION',
    'tipografía': 'TYPE DESIGN',
    'experimental': 'EXPERIMENTAL',
    'publicación digital': 'DIGITAL DESIGN',
    'impresión': 'PRINTS',
    'curaduría': 'CURATORSHIP',
    'identidad exposición': 'IDENTITY',
    'branding': 'BRANDING',
    'señaletica': 'SIGNALETICS',
    'iluminación museografica': 'LIGHTING',
    'música': 'MUSIC',
    'visuales': 'VISUALS',
    'merchandising': 'MERCHANDISING',
    'afiche': 'POSTER',
    'vestuario': 'VESTUARIO',
    'motion graphics': 'MOTION GRAPHICS',
    'sitio web': 'WEB',
    'educación': 'EDUCATION',
    'exposición de arte': 'EXHIBITION',
    'museografia': 'MUSEOGRAFÍA',
    'moda': 'MODA',
    'diagramación': 'EDITORIAL',
    'gráfico': 'GRAPHIC DESIGN',
    'fotografía': 'PHOTOGRAPHY',
    'fotografía de moda': 'PHOTOGRAPHY',
    'dirección creativa': 'CREATIVE DIRECTION',
    'ux': 'INTERACTION DESIGN',
    'ui': 'INTERACTION DESIGN',
    'fanzine': 'EDITORIAL',
    'objeto editorial': 'EDITORIAL',
    'risografía': 'PRINT',
    'infantil': 'EDITORIAL',
    'videojuego': 'DIGITAL DESIGN',
    'animación': 'MOTION',
    'arte': 'ART',
    'audiovisual': 'MOTION',
    'stop-motion': 'MOTION',
    'teatro': 'PERFORMANCE',
    'instalación': 'SPATIAL DESIGN'
  };

  /* Config desde CSS */
  let COL_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--colw'));
  let GAP   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
  let yTopLimit = -parseInt(getComputedStyle(document.documentElement).getPropertyValue('--plane-padding'));
  let yBotLimit =  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--plane-padding'));

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
      author: "Catalina Uribe, Andres Miquel",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: "https://www.instagram.com/p/DPO39QgDY3z/?img_index=0"
    },
    {
      src: "https://freight.cargo.site/t/original/i/L2578592035202173407474317996739/Captura-de-pantalla-2025-10-01-a-las-18.22.21.png",
      orientation: "v",
      span: 1,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Andres Miquel, Catalina Uribe",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: "https://www.instagram.com/p/DPO39QgDY3z/?img_index=1"
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
      author: "Varios",
      collab: "Francisco Finat (fotografía)",
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
    /* ------------------ DRP_01 — Benjamín Becerra ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2729729462721201243755679003331/Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30.png",
  orientation: "v",
  span: 2,
  tags: ["vestuario","moda"],
  title: "DRP_01",
  author: "Benjamín Becerra",
  collab: "Marca: Hostil",
  area: "Vestuario / Moda",
  year: "2025",
  url: "https://hostil-streetwear.com/products/hoodie_core"
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
  orientation: "v",
  span: 1,
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
      img.src = meta.src; img.loading='lazy';
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

  /* Relleno alrededor de la vista */
  function fillAround(){
    if(activeList.length===0) return;
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const left  = -camX - vw*0.5, right = -camX + vw*1.5;
    const topV  = -camY - vh*0.5, bottom = -camY + vh*1.5;
    const startIdx = Math.floor((left)  / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((right) / (COL_W+GAP)) + 2;

    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < bottom){
        makeCard(i,'down', nextMeta());
        if(col.yDown > yBotLimit-(COL_W*2)) yBotLimit += 1500;
      }
      while(col.yUp > topV){
        makeCard(i,'up',   nextMeta());
        if(col.yUp   < yTopLimit+(COL_W*2)) yTopLimit -= 1500;
      }
    }
    updateCount();
  }

  /* Reset/reordenar mundo */
  function resetWorld(){
    plane.innerHTML = "";
    columns.clear();
    globalId = 0;
    genPtr = 0;
    applyTransform();
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const startIdx = Math.floor((-vw*0.5) / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((vw*1.5) / (COL_W+GAP)) + 2;
    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < vh*0.8) makeCard(i,'down', nextMeta());
      while(col.yUp   > -vh*0.8) makeCard(i,'up',   nextMeta());
    }
    updateCount();
    fillAround();
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
      fillAround();
      
      lastX = currentX;
      lastY = currentY;
      
      if (e.cancelable) e.preventDefault();
    }
  }
  
  // Handler de pointerup
  function onPointerUp(e){
    if(activePid === null || e.pointerId !== activePid) return;
    
    // Si hubo drag, suprimir clicks por un tiempo
    if(isDragging){
      suppressClickUntil = performance.now() + 200;
    }
    
    resetPointerState();
  }
  
  // Handler de pointercancel
  function onPointerCancel(e){
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
    e.preventDefault();
    camX -= e.deltaX; camY -= e.deltaY;
    applyTransform(); fillAround();
  },{passive:false});
  if (btnCenter) {
    btnCenter.addEventListener('click', ()=>{
      camX=camY=0; applyTransform(); fillAround();
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

  function openSpotlight(el){
    resetPointerState(); // por si quedó un drag “medio”
    const meta = el._meta || {};

    sTitle.textContent  = el.dataset.title  || meta.title  || "—";
    sAuthor.textContent = el.dataset.author || meta.author || "—";

    const collabText = meta.collab || el.dataset.collab || "";
    sCollab.textContent = collabText || "—";

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

    // Imagen - el CSS responsivo controla el tamaño
    const src = el.querySelector("img")?.src || "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    sheetImg.src = src;
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
    applyFilter(value);
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

  /* ===== Filtro que reordena (robusto) ===== */
  function applyFilter(term){
    const q = norm(term);
    if(q){
      const list = DB.filter(x => {
        const hay = norm([
          x.title || '',
          x.author || '',
          (x.tags || []).join(' ')
        ].join(' '));
      
        return hay.includes(q);
      }); /* const list = DB.filter(x => norm((x.tags||[]).join(' ')).includes(q)); */
      if(list.length === 0){
        if (count) {
          count.textContent = `0 ítems — sin resultados para “${term}”`;
        }
        activeList = [];
        plane.innerHTML = "";
        // Limpiar highlight de categorías si no hay resultados
        highlightActiveCategory('');
        return;
      }
      activeList = list;
      // Sincronizar highlight de categorías si el término coincide con una categoría
      const matchingCat = Object.keys(CAT_LABELS).find(catKey => norm(catKey) === q);
      highlightActiveCategory(matchingCat || '');
    }else{
      // Sin filtro: usar el orden reordenado inicial
      activeList = DB_ORDERED.slice();
      highlightActiveCategory('all');
    }
    closeSpotlight();
    resetWorld();
  }
  if (search) {
    // Mostrar sugerencias al escribir o al hacer focus
    search.addEventListener('focus', () => {
      showSuggestions(search.value);
    });

    search.addEventListener('input', (e) => {
      const value = e.target.value;
      showSuggestions(value);
      applyFilter(value);
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
        }
        // Si no hay sugerencia activa, Enter funciona normal (búsqueda con texto actual)
      } else if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          closeSuggestions();
        } else {
          // Si está cerrado, limpiar búsqueda
          search.value = '';
          applyFilter('');
        }
      }
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
      DB.push(Object.assign(
        {id, src:"", orientation:"h", span:1, tags:[], title:"—", author:"—", collab:"", area:"—", year:"—", url:""},
        item
      ));
      // Reordenar DB_ORDERED cuando se agrega un nuevo proyecto
      if (USE_RANDOM_SHUFFLE) {
        DB_ORDERED = shuffleArray(DB);
      } else {
        DB_ORDERED = rotateArray(DB, 0); // Rotar sin cambiar offset (solo reordenar con el nuevo item)
      }
      if(search && search.value.trim()===""){
        activeList = DB_ORDERED.slice();
        resetWorld();
      } else {
        applyFilter(search ? search.value : "");
      }
    }
  };

  /* Reflow al redimensionar */
  window.addEventListener('resize', ()=>{
    COL_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--colw'));
    GAP   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
    resetWorld();
  });

  /* ===== Panel de categorías ===== */
  // Construir estadísticas de categorías
  function buildCategoryStats(projects) {
    const stats = {};

    projects.forEach(p => {
      (p.tags || []).forEach(tag => {
        const key = norm(tag);
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
        const label = CAT_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1).toUpperCase();
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
  resetWorld();
  if (overlay) {
    overlay.setAttribute('hidden',''); // garantía extra
  }
  
  // Inicializar panel de categorías
  initCategoryPanel();
  
  // Mostrar modal institucional al cargar (si no se ha visto antes)
  showWipModal();
})();
