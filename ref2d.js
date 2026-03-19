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
        sRole   = $("#sheetRole"),
        sCredits = $("#sheetCredits"),
        sArea   = $("#sheetArea"),
        sYear   = $("#sheetYear"),
        sTags   = $("#sheetTags"),
        sLink   = $("#sheetLink");
  const sheetReportActions = $("#sheetReportActions");
  const sheetRequestPanel = $("#sheetRequestPanel");
  const sheetRequestTitle = $("#sheetRequestTitle");
  const sheetRequestMessage = $("#sheetRequestMessage");
  const sheetRequestEmail = $("#sheetRequestEmail");
  const sheetRequestStatus = $("#sheetRequestStatus");
  const sheetRequestClose = $("#sheetRequestClose");
  const sheetRequestSend = $("#sheetRequestSend");
  const sheetRequestCancel = $("#sheetRequestCancel");
  const bentoControls = $("#ref2dBentoControls");
  const btnCenter = $("#ref2dCenter");
  const btnZoomOut = $("#ref2dZoomOut");
  const btnZoomIn = $("#ref2dZoomIn");
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
  const MOBILE_MAX_WIDTH = 768;
  const MOBILE_ALLOWED_VIEWS = new Set(['grid', 'index']);
  const DESKTOP_ALLOWED_VIEWS = new Set(['bento', 'grid', 'index']);
  const REQUESTS_STORAGE_KEY = "ref2d_admin_requests_v1";
  const REQUESTS_API_URL = "https://script.google.com/macros/s/AKfycbwxazNeMlGlw2aFNLCF1L3B-ceWtH54qWYa_7FHRs8GjN0V3zmzXYgosdCP4cjGEWdjWQ/exec";
  const REQUESTS_API_KEY = "ref123.teca";
  const REQUEST_EMAIL_ENDPOINT = "https://formsubmit.co/referencioteca.cl@gmail.com";
  const REQUEST_TYPES = {
    modify: {
      title: "Modificar Información",
      subject: "Solicitud de modificación de proyecto",
      prompt: "Indica qué información debemos corregir o actualizar."
    },
    remove: {
      title: "Solicitud de Baja",
      subject: "Solicitud de baja de proyecto",
      prompt: "Indica por qué se solicita eliminar este proyecto."
    },
    link: {
      title: "Notificar Enlace con Error",
      subject: "Reporte de enlace con error",
      prompt: "Indica qué enlace falla y, si existe, comparte enlace correcto."
    }
  };
  let activeRequestType = "";
  let activeSpotlightMeta = null;
  let isRequestSending = false;

  /* Si falta el contenedor principal, salimos en silencio (para no romper otras páginas) */
  if (!viewport || !plane) {
    return;
  }

  /* Estado inicial: overlay cerrado */
  if (overlay) {
    overlay.setAttribute('hidden','');
  }
  document.body.style.overflow = '';

  /* ---- TAGS (filtros canónicos visibles en la interfaz) ---- */
  const TAGS = [
    'Editorial','Ilustración','Dirección de arte','Tipografía','Experimental',
    'Publicación digital','Impresión','Curaduría','Señalética','Iluminación',
    'Música','Visuales','Merchandising','Afiche','Moda','Motion Graphics',
    'Sitio Web','Educación','Exhibición','Museografía','Branding','Fotografía',
    'Gráfico','Animación','Audiovisual','Arte','Espacio','UX UI','Packaging',
    'Producto','Industrial','Mobiliario','Textil','Artesanía','Biomateriales',
    'Investigación','Pub. Académica','Videojuego','Teatro','Social','Salud',
    'Muralismo','Infografía','RRSS','Web','Cover Art','Portafolio'
  ];

  /* ---- SUGERENCIAS DE BÚSQUEDA ---- */
  const SUGGESTIONS = [
    // Editorial
    'editorial','diagramación','layout','maquetación','fanzine','zine',
    'objeto editorial','libro de artista','publicación digital','publicacion digital',
    'infantil','risografía','risografia','riso','impresión','impresion',

    // Identidad / Branding
    'branding','identidad visual','identidad gráfica','identidad grafica',
    'imagen corporativa','marca',

    // Gráfico / Comunicación visual
    'gráfico','grafico','diseño gráfico','comunicación visual','comunicacion visual',
    'graphic design',

    // Ilustración
    'ilustración','ilustracion','dibujo','ilustración editorial','ilustración infantil',

    // Tipografía
    'tipografía','tipografia','lettering','caligrafía','caligrafia','type design','fuente',

    // Fotografía
    'fotografía','fotografia','fotografía de moda','fotografia de moda',
    'fotografía editorial','fotografía de producto',

    // Animación / Motion / Audiovisual
    'animación','animacion','motion graphics','motion','diseño en movimiento',
    'audiovisual','stop-motion','stop motion','animación 2d','animacion 2d',
    'animación 3d','animacion 3d',

    // Web / Digital
    'sitio web','web','diseño web','web design','responsivo','responsive',
    'landing page','front-end','one pager','ux','ui','ux ui',

    // Espacio / Interior
    'espacio','arquitectura interior','interiorismo','diseño interior',

    // Exhibición / Museografía
    'exhibición','exhibicion','exposición','exposicion','exposición de arte',
    'exposicion de arte','museografía','museografia','museo','curaduría','curaduria',
    'montaje','instalación','instalacion','señalética','señaletica','wayfinding',

    // Moda / Textil
    'moda','vestuario','indumentaria','textil','diseño textil','patronaje',
    'fotografía de moda','fotografia de moda','costume design',

    // Publicación académica
    'publicación académica','publicacion academica','pub. académica','pub academica',
    'artículo académico','articulo academico','paper','tesis','revista académica',

    // Música / Visuales
    'música','musica','cover art','portada de disco','visuales','vjing',

    // Afiche / Poster
    'afiche','afiche digital','afiche impreso','poster','póster','cartel',

    // Diseño de servicio
    'diseño servicio','diseno servicio','service design','diseño de servicios',

    // Espacio público / Social
    'muralismo','mural','arte urbano','street art','diseño social','social',
    'accesibilidad',

    // Investigación / Experimental
    'experimental','investigación','investigacion','research','diseño especulativo',
    'speculative design','design research','archivo',

    // Producto / Industrial
    'producto','diseño de producto','product design','industrial','diseño industrial',
    'packaging','embalaje','envase','empaque','mobiliario','furniture',

    // Salud / Educación
    'salud','health design','educación','educacion',

    // Teatro / Videojuego / Arte
    'teatro','escenografía','escenografia','artes escénicas',
    'videojuego','game design','video game','gaming',
    'arte','artes visuales','arte digital','arte generativo',

    // Infografía / Datos
    'infografía','infografia','infographic','data viz','visualización de datos',

    // RRSS
    'rrss','redes sociales','social media','contenido digital',

    // Artesanía / Biomateriales
    'artesanía','artesania','craft','oficios','biomateriales','materiales sustentables',

    // Lettering / Portafolio
    'lettering','portafolio',
  ];

  /* Helpers */
  const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const PALETTE = ["#ff6b6b","#ffd93d","#6bcBef","#b084f6","#26de81","#ff9f1a","#f368e0","#00d2d3","#10ac84","#a29bfe","#fd79a8","#81ecec"];
    /* =================== TAG NORMALIZATION (dedupe + Titlecase + aliases) =================== */

  // Alias: la clave debe ir normalizada (sin tildes, en minúsculas) porque canonicalTagKey usa norm().
  const TAG_ALIASES = {
    // Editorial
    "diagramacion": "editorial",
    "layout": "editorial",
    "maquetacion": "editorial",
    "fanzine": "editorial",
    "zine": "editorial",
    "objeto editorial": "editorial",
    "libro de artista": "editorial",
    "publicacion digital": "editorial",
    "infantil": "editorial",
    "book design": "editorial",

    // Branding / Identidad
    "identidad visual": "branding",
    "identidad grafica": "branding",
    "imagen corporativa": "branding",
    "marca": "branding",
    "brand": "branding",
    "brand strategy": "branding",

    // Web / Digital
    "sitio web": "web",
    "digital": "web",
    "responsivo": "web",
    "responsive": "web",
    "desarrollo web": "web",
    "portafolio web": "web",
    "ecommerce": "web",
    "landing page": "web",
    "one pager": "web",
    "front-end": "web",
    "web design": "web",
    "diseno web": "web",

    // UX / UI
    "ux": "ux ui",
    "ui": "ux ui",
    "ux/ui": "ux ui",
    "ui/ux": "ux ui",
    "interfaz": "ux ui",
    "interaction design": "ux ui",
    "diseno de interfaz": "ux ui",
    "experiencia de usuario": "ux ui",

    // Diseño servicio
    "servicio": "diseno servicio",
    "servicios": "diseno servicio",
    "diseno servicio": "diseno servicio",
    "diseno de servicio": "diseno servicio",
    "diseno de servicios": "diseno servicio",
    "service design": "diseno servicio",
    "deporte": "diseno servicio",
    "deportes": "diseno servicio",

    // Animación / Motion / Audiovisual
    "motion graphics": "animación",
    "motion": "animación",
    "animacion": "animación",
    "animacion 2d": "animación",
    "animacion 3d": "animación",
    "diseno en movimiento": "animación",
    "audiovisual": "animación",
    "stop-motion": "animación",
    "stop motion": "animación",

    // Visuales / VJ
    "vjing": "visuales",
    "vj": "visuales",
    "vjing (visuales)": "visuales",
    "artes visuales": "visuales",
    "arte digital": "visuales",
    "arte generativo": "visuales",

    // Espacio
    "espacios": "espacio",
    "espacio": "espacio",
    "arquitectura interior": "espacio",
    "interiorismo": "espacio",
    "diseno interior": "espacio",

    // Exhibición
    "exhibicion": "exhibicion",
    "exphibicion": "exhibicion",
    "exposicion": "exhibicion",
    "expo arte": "exhibicion",
    "exposicion de arte": "exhibicion",
    "identidad exposicion": "exhibicion",

    // Fotografía
    "fotografia": "fotografia",
    "fotografia de moda": "fotografia",
    "fotografia editorial": "fotografia",
    "fotografia de producto": "fotografia",
    "photo": "fotografia",

    // Impreso
    "risografia": "impreso",
    "riso": "impreso",
    "serigrafia": "impreso",
    "impresion": "impreso",
    "print": "impreso",
    "grafica impresa": "impreso",

    // Moda / Textil
    "vestuario": "textil",
    "indumentaria": "textil",
    "patronaje": "textil",
    "diseno textil": "textil",
    "textile design": "textil",
    "bordado": "textil",
    "costume design": "textil",
    "fashion": "moda",
    "diseno de moda": "moda",

    // Museografía
    "museografia": "museografía",
    "instalacion": "museografía",
    "iluminacion museografica": "museografía",
    "diseno de exposiciones": "museografía",
    "montaje": "museografía",
    "heritage design": "museografía",
    "heritage": "museografía",

    // Señalética
    "senaletica": "señalética",
    "wayfinding": "señalética",
    "senalizacion": "señalética",
    "diseno de senales": "señalética",

    // Publicación académica
    "articulo academico": "pub academica",
    "articulo academica": "pub academica",
    "paper": "pub academica",
    "tesis": "pub academica",
    "publicacion academica": "pub academica",
    "revista academica": "pub academica",

    // Biomateriales / Artesanía
    "biomaterial": "biomateriales",
    "biomateriales": "biomateriales",
    "materiales sustentables": "biomateriales",
    "biofabricacion": "biomateriales",
    "artesania": "artesania",
    "craft": "artesania",
    "oficios": "artesania",
    "artes y oficios": "artesania",
    "soundscape": "investigacion",

    // Afiche / Poster
    "afiche": "afiche",
    "afiche impreso": "afiche",
    "afiche digital": "afiche",
    "poster": "afiche",
    "cartel": "afiche",

    // Cover art / Portada
    "disco": "cover art",
    "ep": "cover art",
    "portada de disco": "cover art",
    "portada de discos": "cover art",
    "arte de tapa": "cover art",
    "arte de portada": "cover art",
    "portada musical": "cover art",

    // Gráfico / Comunicación visual
    "grafico": "gráfico",
    "diseno grafico": "gráfico",
    "comunicacion visual": "gráfico",
    "graphic design": "gráfico",

    // Ilustración
    "ilustracion": "ilustración",
    "dibujo": "ilustración",
    "drawing": "ilustración",
    "ilustracion editorial": "ilustración",
    "ilustracion infantil": "ilustración",

    // Tipografía
    "tipografia": "tipografía",
    "lettering": "tipografía",
    "caligrafia": "tipografía",
    "type design": "tipografía",
    "fuente": "tipografía",

    // Infografía / Datos
    "infografia": "infografía",
    "infographic": "infografía",
    "data viz": "infografía",
    "visualizacion de datos": "infografía",

    // Muralismo / Arte urbano
    "mural": "muralismo",
    "arte urbano": "muralismo",
    "street art": "muralismo",
    "grafiti": "muralismo",

    // Teatro
    "escenografia": "teatro",
    "artes escenicas": "teatro",

    // Videojuego
    "game design": "videojuego",
    "video game": "videojuego",
    "gaming": "videojuego",
    "juego digital": "videojuego",

    // Producto / Industrial / Packaging
    "diseno de producto": "producto",
    "product design": "producto",
    "product": "producto",
    "prototipo": "producto",
    "embalaje": "packaging",
    "envase": "packaging",
    "empaque": "packaging",
    "diseno de envase": "packaging",
    "furniture": "mobiliario",
    "diseno de mobiliario": "mobiliario",
    "diseno de muebles": "mobiliario",

    // Salud / Social
    "health design": "salud",
    "salud publica": "salud",
    "diseno sanitario": "salud",
    "diseno medico": "salud",
    "diseno social": "social",
    "accesibilidad": "social",

    // Investigación / Experimental
    "investigacion": "investigacion",
    "research": "investigacion",
    "diseno especulativo": "investigacion",
    "speculative design": "investigacion",
    "design research": "investigacion",
    "critical design": "investigacion",
    "diseno critico": "investigacion",
    "archivo": "investigacion",

    // RRSS
    "redes sociales": "rrss",
    "social media": "rrss",
    "contenido digital": "rrss",
    "instagram": "rrss",
    "tiktok": "rrss",

    // Música
    "musica": "música",
  };

  /* ---- TAG DISPLAY (cómo se muestran los canónicos) ---- */
  const TAG_DISPLAY = {
    "editorial":          "Editorial",
    "ilustracion":        "Ilustración",
    "ilustración":        "Ilustración",
    "tipografia":         "Tipografía",
    "tipografía":         "Tipografía",
    "lettering":          "Tipografía",
    "experimental":       "Experimental",
    "impresion":          "Impresión",
    "impresión":          "Impresión",
    "impreso":            "Impreso",
    "curaduria":          "Curaduría",
    "curaduría":          "Curaduría",
    "branding":           "Branding",
    "senaletica":         "Señalética",
    "señaletica":         "Señalética",
    "señalética":         "Señalética",
    "fotografia":         "Fotografía",
    "fotografía":         "Fotografía",
    "exhibicion":         "Exhibición",
    "espacio":            "Espacio",
    "ux ui":              "UX UI",
    "ux":                 "UX UI",
    "ui":                 "UX UI",
    "diseno servicio":    "Diseño Servicio",
    "portada disco":      "Portada Disco",
    "cover art":          "Cover Art",
    "textil":             "Textil",
    "pub academica":      "Pub. Académica",
    "biomateriales":      "Biomateriales",
    "artesania":          "Artesanía",
    "artesanía":          "Artesanía",
    "moda":               "Moda",
    "vestuario":          "Moda",
    "musica":             "Música",
    "música":             "Música",
    "museografia":        "Museografía",
    "museografía":        "Museografía",
    "web":                "Web",
    "animación":          "Animación",
    "animacion":          "Animación",
    "gráfico":            "Gráfico",
    "grafico":            "Gráfico",
    "producto":           "Producto",
    "servicio":           "Servicio",
    "salud":              "Salud",
    "investigacion":      "Investigación",
    "investigación":      "Investigación",
    "packaging":          "Packaging",
    "serigrafia":         "Serigrafía",
    "serigrafía":         "Serigrafía",
    "industrial":         "Industrial",
    "mobiliario":         "Mobiliario",
    "espacios":           "Espacio",
    "social":             "Social",
    "afiche":             "Afiche",
    "iluminacion":        "Iluminación",
    "iluminación":        "Iluminación",
    "rrss":               "RRSS",
    "infografia":         "Infografía",
    "infografía":         "Infografía",
    "muralismo":          "Muralismo",
    "teatro":             "Teatro",
    "videojuego":         "Videojuego",
    "visuales":           "Visuales",
    "arte":               "Arte",
    "3d":                 "3D",
    "app":                "App",
    "cultura":            "Cultura",
    "direccion creativa": "Dirección Creativa",
    "direccion de arte":  "Dirección de Arte",
    "diseno conceptual":  "Diseño Conceptual",
    "diseno de informacion":"Diseño de Información",
    "ecologia":           "Ecología",
    "estilismo":          "Estilismo",
    "experiencia":        "Experiencia",
    "galeria":            "Galería",
    "innovacion":         "Innovación",
    "juego de mesa":      "Juego de Mesa",
    "objeto":             "Objeto",
    "portada":            "Portada",
    "dirección de arte":  "Dirección de Arte",
    "portafolio":         "Portafolio",
    "vitrinaje":          "Vitrinaje",
    "educacion":          "Educación",
    "educación":          "Educación",
    "diseño servicio":    "Diseño Servicio",
  };

  const canonicalTagKey = (tag) => {
    const k = norm(tag);
    return TAG_ALIASES[k] || k;
  };

  const prettyTag = (canonicalKey) => {
    return TAG_DISPLAY[canonicalKey] ||
      (canonicalKey ? canonicalKey.charAt(0).toUpperCase() + canonicalKey.slice(1) : "—");
  };

  const ROLE_FORMS = {
    "designer": {
      singular: { female: "Diseñadora", male: "Diseñador", mixed: "Diseñador/a" },
      plural: { female: "Diseñadoras", male: "Diseñadores", mixed: "Diseñadores/as" }
    },
    "photographer": {
      singular: { female: "Fotógrafa", male: "Fotógrafo", mixed: "Fotógrafo/a" },
      plural: { female: "Fotógrafas", male: "Fotógrafos", mixed: "Fotógrafos/as" }
    },
    "illustrator": {
      singular: { female: "Ilustradora", male: "Ilustrador", mixed: "Ilustrador/a" },
      plural: { female: "Ilustradoras", male: "Ilustradores", mixed: "Ilustradores/as" }
    },
    "art director": {
      singular: { female: "Directora de arte", male: "Director de arte", mixed: "Director/a de arte" },
      plural: { female: "Directoras de arte", male: "Directores de arte", mixed: "Directores/as de arte" }
    },
    "creative director": {
      singular: { female: "Directora creativa", male: "Director creativo", mixed: "Director/a creativo/a" },
      plural: { female: "Directoras creativas", male: "Directores creativos", mixed: "Directores/as creativos/as" }
    },
    "editor": {
      singular: { female: "Editora", male: "Editor", mixed: "Editor/a" },
      plural: { female: "Editoras", male: "Editores", mixed: "Editores/as" }
    },
    "curator": {
      singular: { female: "Curadora", male: "Curador", mixed: "Curador/a" },
      plural: { female: "Curadoras", male: "Curadores", mixed: "Curadores/as" }
    },
    "researcher": {
      singular: { female: "Investigadora", male: "Investigador", mixed: "Investigador/a" },
      plural: { female: "Investigadoras", male: "Investigadores", mixed: "Investigadores/as" }
    },
    "web developer": {
      singular: { female: "Desarrolladora web", male: "Desarrollador web", mixed: "Desarrollador/a web" },
      plural: { female: "Desarrolladoras web", male: "Desarrolladores web", mixed: "Desarrolladores/as web" }
    },
    "director": {
      singular: { female: "Directora", male: "Director", mixed: "Director/a" },
      plural: { female: "Directoras", male: "Directores", mixed: "Directores/as" }
    },
    "producer": {
      singular: { female: "Productora", male: "Productor", mixed: "Productor/a" },
      plural: { female: "Productoras", male: "Productores", mixed: "Productores/as" }
    },
    "author": {
      singular: { female: "Autora", male: "Autor", mixed: "Autor/a" },
      plural: { female: "Autoras", male: "Autores", mixed: "Autores/as" }
    },
    "co-author": {
      singular: { female: "Coautora", male: "Coautor", mixed: "Coautor/a" },
      plural: { female: "Coautoras", male: "Coautores", mixed: "Coautores/as" }
    },
    "typographer": {
      singular: { female: "Tipógrafa", male: "Tipógrafo", mixed: "Tipógrafo/a" },
      plural: { female: "Tipógrafas", male: "Tipógrafos", mixed: "Tipógrafos/as" }
    },
    "guide": {
      singular: { female: "Guía", male: "Guía", mixed: "Guía" },
      plural: { female: "Guías", male: "Guías", mixed: "Guías" }
    },
    "lighting designer": {
      singular: { female: "Iluminadora", male: "Iluminador", mixed: "Iluminador/a" },
      plural: { female: "Iluminadoras", male: "Iluminadores", mixed: "Iluminadores/as" }
    },
  };

  const FEMALE_NAME_HINTS = new Set([
    "alejandra", "antonia", "antonella", "aranda", "bernardita", "camila", "carola",
    "carolina", "catalina", "chiara", "colomba", "constanza", "daniela", "elisa",
    "emilia", "fernanda", "felicidad", "florencia", "gabriela", "gracia", "ignacia",
    "isabel", "javiera", "josefa", "josefina", "julie", "karina", "kimberly", "magdalena",
    "macarena", "manuela", "marisol", "martina", "maria", "naomi", "nicole", "paula",
    "paulina", "pilar", "rafaella", "sara", "sofia", "sophia", "tamara", "teresita",
    "trinidad", "valentina", "vanessa", "victoria", "yasmin", "yazmin"
  ]);

  const MALE_NAME_HINTS = new Set([
    "alejandro", "andres", "antonino", "benjamin", "camilo", "carlos", "clemente",
    "cristobal", "damian", "daniel", "domingo", "esteban", "felipe", "francisco",
    "franco", "gianfranco", "gonzalo", "hugo", "joaquin", "jose", "juan",
    "leon", "lukas", "marcos", "martin", "matias", "maximiliano", "nicolas", "pablo",
    "patricio", "pedro", "rodrigo", "sergio", "tomas", "vicente"
  ]);

  const MALE_A_EXCEPTIONS = new Set(["luca", "nikita"]);
  const FEMALE_O_EXCEPTIONS = new Set(["consuelo"]);

  const ROLE_ALIASES = {
    "disenador": "designer",
    "disenadora": "designer",
    "diseñador": "designer",
    "diseñadora": "designer",
    "diseno": "designer",
    "diseño": "designer",
    "design": "designer",
    "graphic design": "designer",
    "identidad grafica": "designer",
    "identidad gráfica": "designer",
    "diagramacion": "designer",
    "diagramación": "designer",
    "fotografia": "photographer",
    "fotografía": "photographer",
    "ilustracion": "illustrator",
    "ilustración": "illustrator",
    "direccion de arte": "art director",
    "dirección de arte": "art director",
    "art direction": "art director",
    "creative direction": "creative director",
    "direccion creativa": "creative director",
    "dirección creativa": "creative director",
    "curaduria": "curator",
    "curaduría": "curator",
    "investigacion": "researcher",
    "investigación": "researcher",
    "research": "researcher",
    "desarrollo web": "web developer",
    "web development": "web developer",
    "director": "director",
    "direccion": "director",
    "dirección": "director",
    "produccion": "producer",
    "producción": "producer",
    "editor": "editor",
    "editores": "editor",
    "editorial": "editor",
    "autor": "author",
    "autora": "author",
    "autores": "author",
    "autoras": "author",
    "coautor": "co-author",
    "co autora": "co-author",
    "co-autora": "co-author",
    "co-autor": "co-author",
    "coautora": "co-author",
    "typography": "typographer",
    "tipografia": "typographer",
    "tipografía": "typographer",
    "guiatura": "guide",
    "guia": "guide",
    "guía": "guide",
    "iluminacion": "lighting designer",
    "iluminación": "lighting designer",
  };

  const CREDIT_STOP_WORDS = new Set([
    "y", "and", "con", "por", "de", "del", "la", "el", "los", "las", "the",
    "autor", "autora", "autores", "autoras", "coautor", "coautora", "coautores",
    "fotografia", "ilustracion", "ilustraciones", "diagramacion", "diseno", "design",
    "graphic", "creative", "direction", "editor", "editorial", "investigacion",
    "curaduria", "guiatura", "produccion", "desarrollo", "web", "proyecto", "trabajo",
    "realizado", "studio", "estudio"
  ]);

  function splitCreditSegments(raw) {
    const normalized = String(raw || "").replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    const withBreaks = normalized
      .replace(/\s*\|\s*/g, "\n")
      .replace(/;\s+(?=[A-Za-zÁÉÍÓÚÜÑ@][^:]{1,70}:)/g, "\n")
      .replace(/\.\s+(?=[A-Za-zÁÉÍÓÚÜÑ@][^:]{1,70}:)/g, "\n");
    return withBreaks
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function cleanAuthorName(raw) {
    return String(raw || "")
      .replace(/\(([^)]*)\)/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+,/g, ",")
      .replace(/,\s*$/, "")
      .trim();
  }

  function splitAuthorNames(raw) {
    return cleanAuthorName(raw)
      .split(/\s*(?:,|\/| y | and | & )\s*/i)
      .map((name) => name.trim())
      .filter(Boolean);
  }

  function inferNameGender(rawName) {
    const firstName = norm(String(rawName || "").trim())
      .replace(/^@/, "")
      .split(/\s+/)
      .filter(Boolean)[0] || "";
    if (!firstName) return "unknown";
    if (FEMALE_NAME_HINTS.has(firstName)) return "female";
    if (MALE_NAME_HINTS.has(firstName)) return "male";
    if (firstName.endsWith("a") && !MALE_A_EXCEPTIONS.has(firstName)) return "female";
    if (firstName.endsWith("o") && !FEMALE_O_EXCEPTIONS.has(firstName)) return "male";
    return "unknown";
  }

  function getAuthorGenderProfile(authorRaw) {
    const names = splitAuthorNames(authorRaw);
    if (!names.length) {
      return { group: "mixed", isPlural: false };
    }
    const counts = { female: 0, male: 0, unknown: 0 };
    names.forEach((name) => {
      const gender = inferNameGender(name);
      counts[gender] += 1;
    });
    if (counts.female > 0 && counts.male === 0 && counts.unknown === 0) {
      return { group: "female", isPlural: names.length > 1 };
    }
    if (counts.male > 0 && counts.female === 0 && counts.unknown === 0) {
      return { group: "male", isPlural: names.length > 1 };
    }
    return { group: "mixed", isPlural: names.length > 1 };
  }

  function roleLabelFromCanonical(canonical, authorRaw) {
    const key = canonical || "designer";
    const forms = ROLE_FORMS[key] || ROLE_FORMS.designer;
    const profile = getAuthorGenderProfile(authorRaw);
    const bucket = profile.isPlural ? forms.plural : forms.singular;
    return bucket[profile.group] || bucket.mixed || "Diseñador/a";
  }

  function toNameKey(value) {
    return norm(value)
      .replace(/[^a-z0-9@]+/g, " ")
      .trim();
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeRoleLabel(raw) {
    const key = norm(raw)
      .replace(/[^a-z0-9/&+\s-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!key) return "";
    if (ROLE_ALIASES[key]) return ROLE_ALIASES[key];
    if (key.includes("coautor") || key.includes("co autor")) return "co-author";
    if (key.includes("autor") || key.includes("author")) return "author";
    if (key.includes("fotografia") || key.includes("photo")) return "photographer";
    if (key.includes("ilustr")) return "illustrator";
    if (key.includes("curadur")) return "curator";
    if (key.includes("investig") || key.includes("research")) return "researcher";
    if (key.includes("tipograf") || key.includes("typograph")) return "typographer";
    if (key.includes("iluminacion") || key.includes("lighting")) return "lighting designer";
    if (key.includes("desarrollo web") || key.includes("web development")) return "web developer";
    if (key.includes("guiatura") || key.includes("guia") || key.includes("guide")) return "guide";
    if (key.includes("direction") || key.includes("direccion")) {
      if (key.includes("creative") || key.includes("creativa")) return "creative director";
      if (key.includes("arte") || key.includes("art")) return "art director";
      return "director";
    }
    if (key.includes("editor")) return "editor";
    if (key.includes("produccion") || key.includes("production")) return "producer";
    if (
      key.includes("diseno") ||
      key.includes("design") ||
      key.includes("diagramacion") ||
      key.includes("branding") ||
      key.includes("identidad")
    ) return "designer";
    return "";
  }

  function inferRoleFromTags(rawTags) {
    const tags = Array.isArray(rawTags) ? rawTags : [];
    const keys = tags.map((tag) => norm(tag));
    if (keys.some((k) => k.includes("iluminacion"))) return "lighting designer";
    if (keys.some((k) => k.includes("ilustracion"))) return "illustrator";
    if (keys.some((k) => k.includes("fotografia"))) return "photographer";
    if (keys.some((k) => k.includes("tipografia"))) return "typographer";
    if (keys.some((k) => k.includes("direccion de arte"))) return "art director";
    if (keys.some((k) => k.includes("direccion creativa"))) return "creative director";
    if (keys.some((k) => k.includes("curaduria"))) return "curator";
    if (keys.some((k) => k.includes("investigacion"))) return "researcher";
    if (keys.some((k) => k.includes("desarrollo web") || k === "web")) return "web developer";
    return "";
  }

  function extractCreditLabel(segment) {
    const colonMatch = String(segment || "").match(/^([^:]{2,80}):\s*(.+)$/);
    if (colonMatch) {
      return { label: colonMatch[1].trim(), details: colonMatch[2].trim() };
    }
    const roleMatch = String(segment || "").match(/^(.{2,60}?)\s+(?:por|de)\s+(.+)$/i);
    if (!roleMatch) return null;
    if (!normalizeRoleLabel(roleMatch[1])) return null;
    return { label: roleMatch[1].trim(), details: roleMatch[2].trim() };
  }

  function isLikelyBareNameCredit(segment) {
    const value = String(segment || "").trim();
    if (!value) return false;
    if (value.includes(":")) return false;
    if (/[.;|]/.test(value)) return false;
    if (/\d/.test(value)) return false;
    if (
      /\b(cliente|proyecto|trabajo|desarrollado|realizado|curso|banda|editorial|institucion|institución|fundacion|fundación|universidad|ministerio|isbn|presentado|financiado|encargo|estudio|studio)\b/i.test(value)
    ) return false;
    const tokens = value.split(/\s+/).filter(Boolean);
    if (!tokens.length || tokens.length > 6) return false;
    return tokens.every((token) => /^@?[A-ZÁÉÍÓÚÜÑ][\p{L}'’.\-]*$/u.test(token));
  }

  function normalizeBareCreditSegment(segment) {
    const value = String(segment || "").trim();
    if (!isLikelyBareNameCredit(value)) return value;
    if (/[,&]/.test(value) || /\s+y\s+/i.test(value) || /\s+and\s+/i.test(value)) {
      return `Colaboradores/as: ${value}`;
    }
    return `Colaborador/a: ${value}`;
  }

  function stripAuthorFromCredit(text, authorKeys) {
    let cleaned = norm(text)
      .replace(/[^a-z0-9@]+/g, " ")
      .trim();
    authorKeys.forEach((key) => {
      if (!key || key.length < 4) return;
      cleaned = cleaned.replace(new RegExp(`\\b${escapeRegExp(key)}\\b`, "g"), " ");
    });
    cleaned = cleaned
      .split(/\s+/)
      .filter((token) => token && !CREDIT_STOP_WORDS.has(token))
      .join(" ")
      .trim();
    return cleaned;
  }

  function deriveDisplayPeople(meta) {
    const authorName = cleanAuthorName(meta.author) || "—";
    const manualRoleRaw = String(meta.role || "").replace(/\s+/g, " ").trim();
    const hasManualRole = Boolean(manualRoleRaw);
    const authorKeys = splitAuthorNames(meta.author)
      .map(toNameKey)
      .filter((key) => key.length >= 4);
    const authorRoleMatch = String(meta.author || "").match(/\(([^)]*)\)/);
    let roleCanonical = hasManualRole ? "" : normalizeRoleLabel(meta.role || "");
    if (!hasManualRole && !roleCanonical && authorRoleMatch) {
      roleCanonical = normalizeRoleLabel(authorRoleMatch[1]);
    }

    const credits = [];
    const seenCreditLines = new Set();
    splitCreditSegments(meta.collab).forEach((segment) => {
      const normalizedSegment = toNameKey(segment);
      const segmentHasAuthor = authorKeys.some((name) => normalizedSegment.includes(name));
      const labeled = extractCreditLabel(segment);
      const segmentRole = labeled ? normalizeRoleLabel(labeled.label) : "";

      if (!hasManualRole && !roleCanonical && segmentHasAuthor && segmentRole && segmentRole !== "author") {
        roleCanonical = segmentRole;
      }

      let keepSegment = true;
      if (segmentHasAuthor && segmentRole) {
        const segmentDetails = labeled ? labeled.details : segment;
        const residue = stripAuthorFromCredit(segmentDetails, authorKeys);
        if (!residue) keepSegment = false;
      }
      if (segmentHasAuthor && !labeled) {
        const residue = stripAuthorFromCredit(segment, authorKeys);
        if (!residue) keepSegment = false;
      }

      if (!keepSegment) return;
      const outputSegment = labeled ? segment : normalizeBareCreditSegment(segment);
      const dedupeKey = toNameKey(outputSegment);
      if (!dedupeKey || seenCreditLines.has(dedupeKey)) return;
      seenCreditLines.add(dedupeKey);
      credits.push(outputSegment);
    });

    if (!hasManualRole && (!roleCanonical || roleCanonical === "designer" || roleCanonical === "author")) {
      const tagRole = inferRoleFromTags(meta.tags);
      roleCanonical = tagRole || "designer";
    }
    const roleLabel = hasManualRole
      ? manualRoleRaw
      : roleLabelFromCanonical(roleCanonical, meta.author);

    return {
      author: authorName,
      role: roleLabel,
      credits: credits.join("\n")
    };
  }

  function normalizeProjectTags(p) {
    const people = deriveDisplayPeople(p);
    p._displayAuthor = people.author || "—";
    p._displayRole = people.role || "Diseñador/a";
    p._displayCredits = people.credits || "";

    const rawPrimary = Array.isArray(p.primaryCategories)
      ? p.primaryCategories.slice()
      : (Array.isArray(p.tags) ? p.tags.slice() : []);
    const rawSecondary = Array.isArray(p.secondaryTags) ? p.secondaryTags.slice() : [];
    const rawKeywords = Array.isArray(p.keywords) ? p.keywords.slice() : [];

    const primaryKeys = [];
    const primarySeen = new Set();
    rawPrimary.forEach((t) => {
      const k = canonicalTagKey(t);
      if (!k || primarySeen.has(k)) return;
      primarySeen.add(k);
      primaryKeys.push(k);
    });

    const secondaryKeys = [];
    const secondarySeen = new Set(primaryKeys);
    rawSecondary.forEach((t) => {
      const k = canonicalTagKey(t);
      if (!k || secondarySeen.has(k)) return;
      secondarySeen.add(k);
      secondaryKeys.push(k);
    });

    const keywordValues = rawKeywords
      .map((v) => String(v || "").trim())
      .filter(Boolean);

    // Capa visible (principal)
    p._tagKeys = primaryKeys;
    p.primaryCategories = primaryKeys.map(prettyTag);
    p.tags = p.primaryCategories.slice();

    // Capa no visible (secundaria) para futura expansión y búsqueda.
    p._secondaryTagKeys = secondaryKeys;
    p.secondaryTags = secondaryKeys.map(prettyTag);
    p.keywords = keywordValues;

    // índice de búsqueda (incluye metadatos visibles + secundarios)
    const metadataText = (p.metadata && typeof p.metadata === "object")
      ? Object.values(p.metadata).map((v) => String(v || "")).join(" ")
      : "";
    const hay = [
      p.title || "",
      p.author || "",
      p._displayAuthor || "",
      p._displayRole || "",
      p.area || "",
      p.collab || "",
      p._displayCredits || "",
      rawPrimary.join(" "),
      rawSecondary.join(" "),
      rawKeywords.join(" "),
      p.tags.join(" "),
      p.secondaryTags.join(" "),
      primaryKeys.join(" "),
      secondaryKeys.join(" "),
      metadataText
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
  let camScale = 1;
  const CAM_SCALE_MAX = 1;
  const CAM_SCALE_MIN = 0.38;
  const CAM_SCALE_STEP = 0.08;
  const CAM_LOD_FAR = 0.56;
  const CAM_LOD_MID = 0.74;
  let viewportWidth = viewport.clientWidth || 0;
  let viewportHeight = viewport.clientHeight || 0;
  const refreshViewportSize = () => {
    viewportWidth = viewport.clientWidth || 0;
    viewportHeight = viewport.clientHeight || 0;
  };
  const clampCamScale = (value) => Math.min(CAM_SCALE_MAX, Math.max(CAM_SCALE_MIN, value));
  let currentLodMode = '';
  const updateBentoLOD = () => {
    if (!plane) return;
    const nextMode = camScale <= CAM_LOD_FAR ? 'far' : (camScale <= CAM_LOD_MID ? 'mid' : 'near');
    if (nextMode === currentLodMode) return;
    currentLodMode = nextMode;
    plane.classList.toggle('is-lod-far', nextMode === 'far');
    plane.classList.toggle('is-lod-mid', nextMode === 'mid');
    plane.classList.toggle('is-lod-near', nextMode === 'near');
  };
  const setInteractionActive = (active) => {
    if (isInteractionActive === active) return;
    isInteractionActive = active;
    if (plane) plane.classList.toggle('is-interacting', active);
  };
  const scheduleInteractionSettle = () => {
    lastInteractionTs = performance.now();
    setInteractionActive(true);
    if (interactionSettleTimer !== null) return;
    const tick = () => {
      const elapsed = performance.now() - lastInteractionTs;
      const remaining = BENTO_INTERACTION_SETTLE_MS - elapsed;
      if (remaining <= 0) {
        interactionSettleTimer = null;
        setInteractionActive(false);
        requestFillAround(false);
        return;
      }
      interactionSettleTimer = setTimeout(tick, Math.min(remaining, BENTO_INTERACTION_SETTLE_MS));
    };
    interactionSettleTimer = setTimeout(tick, BENTO_INTERACTION_SETTLE_MS);
  };
  const applyTransform = ()=> {
    plane.style.transform = `translate3d(${camX}px, ${camY}px, 0) scale(${camScale})`;
    if (activeView === 'bento') updateBentoLOD();
  };

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
      src: "IMG/remote-originals/001_Santillan_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Experimental","Fanzine","Objeto editorial","Gráfico"],
      title: "Encontrarse en la forma",
      author: "Ignacia Santillán",
      role: "Diseñadora",
      collab: "",
      area: "Editorial / Experimental / Fanzine / Objeto editorial / Gráfico",
      year: "2022",
      url: "https://www.behance.net/gallery/160223073/encontrarse-en-la-forma"
    },

    /* ------------------ L'uccello — Weichi He (2016) ------------------ */
    {
      src: "IMG/remote-originals/002_2016_Luccello.jpg",
      orientation: "h",
      span: 2,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "L'uccello",
      author: "Weichi He",
      role: "Diseñador",
      collab: "Pablo González",
      area: "Identidad visual / Identidad gráfica / Branding",
      year: "2016",
      url: "https://weichi.works/L-ucello"
    },

    /* ------------------ Max Fett Specimen — Weichi He (2020) ------------------ */
    {
      src: "IMG/remote-originals/003_MaxFett_4.jpg",
      orientation: "v",
      span: 1,
      tags: ["editorial","tipografía","gráfico","impreso"],
      title: "Max Fett Specimen",
      author: "Weichi He",
      role: "Diseñador",
      collab: "Max Fett",
      area: "Editorial / Tipografía / Gráfico / Impreso",
      year: "2020",
      url: "https://weichi.works/Max-Fett-Specimen"
    },

    {
      src: "IMG/remote-originals/004_Santillan_2.jpg",
      orientation: "v",
      span: 1,
      tags: ["Afiche","Afiche digital","risografía","Gráfico"],
      title: "Me gusta mucho aquí",
      author: "Ignacia Santillán",
      role: "Diseñadora",
      collab: "Malhumor Studio",
      area: "Afiche / Gráfico",
      year: "2025",
      url: "https://www.instagram.com/p/DPEx3F9j9wF/"
    },
    {
      src: "IMG/remote-originals/005_Santillan_3.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Experimental","Fanzine","Objeto editorial","Gráfico"],
      title: "Otras formas de medir el tiempo",
      author: "Ignacia Santillán",
      role: "Diseñadora",
      collab: "Malhumor Studio",
      area: "Editorial / Experimental / Fanzine / Objeto editorial / Gráfico",
      year: "2025",
      url: "https://www.instagram.com/reel/DQ4wuXaD_i9/?igsh=dTFpaWQ2OHgzMTRq"
    },

    /* ------------- Gracia González / FIT ------------- */
    {
      src: "IMG/remote-originals/006_Gonzalez-g_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Editorial","Objeto editorial","Gráfico","Infantil"],
      title: "Rayo de luz",
      author: "Gracia González",
      role: "Diseñadora",
      collab: "",
      area: "Editorial / Infantil",
      year: "2022",
      url: "https://graciastudio.cl/15/"
    },
    {
      src: "IMG/remote-originals/007_gonzalez-g_2.png",
      orientation: "h",
      span: 1,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "Fundación FIT",
      author: "Gracia González",
      role: "Diseñadora",
      collab: "",
      area: "Identidad visual / Branding",
      year: "2025",
      url: "https://graciastudio.cl/68/"
    },

    /* ------------- RETORNO — Andrés Miquel  (2 vistas) ------------- */
    {
      src: "IMG/remote-originals/008_miquel_1.png",
      orientation: "v",
      span: 2,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Catalina Uribe, Andres Miquel, Fernanda Gutiérrez",
      role: "Directora de arte",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=0", "https://schonmagazine.com/retorno/"]
    },
    {
      src: "IMG/remote-originals/009_Captura-de-pantalla-2025-10-01-a-las-18.22.21.png",
      orientation: "v",
      span: 1,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Andres Miquel, Catalina Uribe, Fernanda Gutiérrez",
      role: "Director de arte",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=1", "https://schonmagazine.com/retorno/"]
    },

    {
      src: "IMG/remote-originals/010_gutierrez-fernanda-1.jpg",
      orientation: "v",
      span: 1,
      tags: ["Moda","Editorial","fotografía de moda","dirección de arte","vestuario"],
      title: "Retorno",
      author: "Fernanda Gutiérrez, Andres Miquel, Catalina Uribe",
      role: "Directora de arte",
      collab: "Schön! Magazine",
      area: "Editorial / Moda / Vestuario",
      year: "2025",
      url: ["https://www.instagram.com/p/DPO39QgDY3z/?img_index=1", "https://schonmagazine.com/retorno/"]
    },
    /* ------------- Paula Santa María ------------- */
    {
      src: "IMG/remote-originals/011_santa-maria_1.jpg",
      orientation: "h",
      span: 2,
      tags: ["Videojuego","animación","arte"],
      title: "A Life in a Year",
      author: "Paula Santa María",
      role: "Diseñadora",
      collab: "",
      area: "Videojuego / Animación / Arte",
      year: "2024",
      url: "https://paulasantamaria.netlify.app/"
    },

    /* ------------- Bombus Chilensis ------------- */
    {
      src: "IMG/remote-originals/012_Pinto_1.jpg",
      orientation: "h",
      span: 2,
      tags: ["Audiovisual","animación","stop-motion","Teatro"],
      title: "Bombus Chilensis",
      author: "María Jesús Pinto, Victoria De la Maza",
      role: "Diseñadora",
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
      src: "IMG/remote-originals/013_ilmato_1.jpg",
      orientation: "v",
      span: 1,
      tags: ["dirección creativa","fotografía","gráfico"],
      title: "Misc",
      author: "Matías Vial",
      role: "Diseñador",
      collab: "Il Mato",
      area: "Dirección creativa / Fotografía",
      year: "2022",
      url: "https://ilmato.com/paloma-mami-1"
    },
    /* ------------------ Acuerdo de Escazú — Carolina Pinochet ------------------ */
{
  src: "IMG/remote-originals/014_Pinochet-Carolina-Captura-de-pantalla-2026-03-10-a-las-19.38.36.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Acuerdo de Escazú",
  author: "Carolina Pinochet",
  role: "Diseñadora/directora",
  collab: "Trabajo para Ministerio de Medio Ambiente. Proyecto desarrollado en Estudio Postal",
  area: "Branding / Identidad visual / Gráfico",
  year: "2023",
  url: "https://www.estudiopostal.cl/portfolio-collections/ilustracion/acuerdo-de-escazu"
},

/* ------------------ Agenda Palpa — Macarena Valdés Domínguez ------------------ */
{
  src: "IMG/remote-originals/015_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.00.33.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","editorial","gráfico"],
  title: "Agenda Palpa",
  author: "Macarena Valdés Domínguez",
  role: "Diseñadora",
  collab: "Proyecto desarrollado en Qüina Studio",
  area: "Ilustración / Editorial / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/216455243/Agenda-Palpa-2025"
},

/* ------------------ La Roi (Packaging) — Macarena Valdés Domínguez ------------------ */
{
  src: "IMG/remote-originals/016_Valdes-Macarena-Captura-de-pantalla-2026-03-11-a-las-10.02.56.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico","packaging"],
  title: "La Roi",
  author: "Macarena Valdés Domínguez",
  role: "Diseñadora",
  collab: "Proyecto desarrollado en Qüina Studio",
  area: "Ilustración / Gráfico / Packaging",
  year: "2024",
  url: "https://www.behance.net/gallery/199970619/Diseno-de-packaging-Chocolate-Le-Roi-Chocolat"
},

/* ------------------ EMG-One — Franco Gnecco ------------------ */
{
  src: "IMG/remote-originals/017_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.17.16.png",
  orientation: "sq",
  span: 1,
  tags: ["producto","industrial","salud"],
  title: "EMG-One",
  author: "Franco Gnecco",
  role: "Diseñador",
  collab: "Equipo: Lorena O’Ryan, Alejandro Durán, Franco Gnecco",
  area: "Producto / Industrial / Salud",
  year: "2025",
  url: "https://www.instagram.com/p/DKD2iZENyWz/?img_index=1"
},

/* ------------------ Materia Lignum — Catalina Fuenzalida ------------------ */
{
  src: "IMG/remote-originals/018_Gnecco-Franco-Captura-de-pantalla-2026-03-11-a-las-10.23.25.png",
  orientation: "h",
  span: 2,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Catalina Fuenzalida",
  role: "Diseñadora/investigadora",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Materia Lignum — Franco Gnecco ------------------ */
{
  src: "IMG/remote-originals/019_Fuenzalida-Catalina-Captura-de-pantalla-2026-03-11-a-las-10.23.05.png",
  orientation: "h",
  span: 1,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Franco Gnecco",
  role: "Diseñador/investigador",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Materia Lignum — Damian Araos ------------------ */
{
  src: "IMG/remote-originals/020_Araos-Damina-Captura-de-pantalla-2026-03-11-a-las-10.20.21.png",
  orientation: "h",
  span: 1,
  tags: ["museografía","exhibición","investigación","biomaterial"],
  title: "Materia Lignum",
  author: "Damian Araos",
  role: "Diseñador/investigador",
  collab: "Desarrollado por Spectro Studio, conformado por Franco Gnecco, Damian Araos y Catalina Fuenzalida",
  area: "Museografía / Exhibición / Investigación / Biomaterial",
  year: "2024",
  url: "https://www.instagram.com/p/C3770iKu8ye/?img_index=1"
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Yazmin Jiménez ------------------ */
{
  src: "IMG/remote-originals/021_Banner-web-_-Lanzamiento-de-libro-CDUR-scaled.jpg",
  orientation: "h",
  span: 2,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Yazmin Jiménez",
  role: "Diseñadora",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: ["https://www.behance.net/gallery/233641951/Libro-Como-disenar-una-revolucion","https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"]
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Pedro Álvarez ------------------ */
{
  src: "IMG/remote-originals/022_153819.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Pedro Álvarez",
  role: "Investigador/editor",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: "https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"
},
/* ------------------ Escuela Global — Dominga Olavarría Schuh ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/M2846130404079476651128609256131/Captura-de-pantalla-2026-03-17-a-las-12.34.04.png",
  orientation: "h",
  span: 1,
  tags: ["branding", "gráfico", "educación"],
  title: "Escuela Global",
  author: "Dominga Olavarría Schuh",
  role: "",
  collab: "",
  area: "Branding / Gráfico / Educación",
  year: "2023",
  url: "https://www.behance.net/gallery/182285675/Brand-Identity"
},

/* ------------------ Puente Textil — Josefina Boggio ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/H2846130182626314046245442106051/7798fa4f-b5cf-4c01-8e91-fc3043244124_rw_3840.jpg",
  orientation: "v",
  span: 1,
  tags: ["exhibición", "cultura", "experiencia"],
  title: "Puente Textil",
  author: "Josefina Boggio",
  role: "",
  collab: "Proyecto de título",
  area: "Exhibición / Cultura / Experiencia",
  year: "2025",
  url: "https://josefinaboggio.myportfolio.com/copy-of-habitar-cuerpos-reales"
},

/* ------------------ ARQUEOLOGÍA PERSONAL — Josefina Boggio ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/N2846130182700101022540280312515/e83bcadd-da64-44da-a493-c8dacd67f9a0.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "cultura"],
  title: "ARQUEOLOGÍA PERSONAL",
  author: "Josefina Boggio",
  role: "",
  collab: "",
  area: "Editorial / Cultura",
  year: "2023",
  url: "https://josefinaboggio.myportfolio.com/arqueologia-personal"
},

/* ------------------ Memoria Luz que Enseña — Alejandra Garcia Huidobro ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/C2846130182681654278466570760899/IMGP0054_2x.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "cultura"],
  title: "Memoria Luz que Enseña",
  author: "Alejandra Garcia Huidobro",
  role: "",
  collab: "",
  area: "Editorial / Cultura",
  year: "2014",
  url: "https://cargocollective.com/alegarciahuidobro/MEMORIA-LUZ-QUE-ENSENA"
},

/* ------------------ Luz que enseña — Alejandra Garcia Huidobro ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2846130182663207534392861209283/1_2x.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "cultura"],
  title: "Luz que enseña",
  author: "Alejandra Garcia Huidobro",
  role: "",
  collab: "",
  area: "Editorial / Cultura",
  year: "2014",
  url: "https://cargocollective.com/alegarciahuidobro/LUZ-QUE-ENSENA"
},

/* ------------------ Protagonistas en Palabras — Lucas Góngora Rocha ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2846130182644760790319151657667/95962b21-1d6f-4e7b-b9a1-0492feaca812_rw_1920.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio", "editorial", "educación"],
  title: "Protagonistas en Palabras",
  author: "Lucas Góngora Rocha",
  role: "",
  collab: "Desarrollado en conjunto: Andrés Navarro, Denisse Hernández, Javiera Sánchez, Magdalena Manríquez, Martín Cáceres, Michelle Serni y Ximena Silva.",
  area: "Servicio / Editorial / Educación",
  year: "2025",
  url: "https://lucasgongorarocha.myportfolio.com/protagonistas-en-palabras-1"
},

/* ------------------ LA MADRE DEL CORDERO — María Cristina Adasme ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2846188941944102492891972580035/SET.png",
  orientation: "h",
  span: 1,
  tags: ["afiche", "ilustración", "gráfico"],
  title: "LA MADRE DEL CORDERO",
  author: "María Cristina Adasme",
  role: "Diseñadora / Ilustradora",
  collab: "Película dirigida por Diego Ayala y Aníbal Jofré. Ilustraciones y gráficas para afiches por: María Cristina Adasme.",
  area: "Afiche / Ilustración / Gráfico",
  year: "2014",
  url: "https://cargocollective.com/mariacristo/LA-MADRE-DEL-CORDERO"
},

/* ------------------ Volantín Cortao — María Cristina Adasme ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Y2846188941925655748818263028419/poster_volantin_horizontal_670.png",
  orientation: "h",
  span: 1,
  tags: ["afiche", "ilustración", "gráfico"],
  title: "Volantín Cortao",
  author: "María Cristina Adasme",
  role: "Diseñadora / Ilustradora",
  collab: "Película co-dirigida por Enrique Farías y Rosario Espinosa. Ilustraciones y gráficas para afiches por: María Cristina Adasme.",
  area: "Afiche / Ilustración / Gráfico",
  year: "2013",
  url: "https://cargocollective.com/mariacristo/VOLANTIN-CORTAO"
},

/* ------------------ 50 años después: Golpe en la memoria — María Cristina Adasme ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/N2846189121486262562307038458563/Captura-de-pantalla-2026-03-18-a-las-15.19.19.png",
  orientation: "h",
  span: 1,
  tags: ["museografía", "exhibición"],
  title: "50 años después: Golpe en la memoria",
  author: "María Cristina Adasme",
  role: "",
  collab: "Desarrollado en Segundo Nombre. Museografía: Paulina Montero y Nicolás Maturana. Diseño gráfico: Mayela Cerda @mayyyela y Leonor Tapia @leonor_th. Construcción y producción: Cromolux @cromolux_fg y Amaya Rojas @amayarojasarnal.",
  area: "Museografía / Exhibición",
  year: "2023",
  url: "https://www.instagram.com/p/DAjJHymu9Ds/?img_index=1"
},

/* ------------------ Variations 1 and 2 for Chanting vessels project — leonor tapia ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/H2846191855072373357178073330371/Captura-de-pantalla-2026-03-18-a-las-15.59.04.png",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual", "artesanía", "3D"],
  title: "Variations 1 and 2 for Chanting vessels project",
  author: "leonor tapia",
  role: "",
  collab: "",
  area: "Diseño conceptual / Artesanía / 3D",
  year: "2022",
  url: "https://www.instagram.com/p/CaC9y0wvtCh/"
},

/* ------------------ Sin Nombre — leonor tapia ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Y2846189121633836514896714871491/Captura-de-pantalla-2026-03-18-a-las-15.22.17.png",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual", "artesanía", "3D"],
  title: "Sin Nombre",
  author: "leonor tapia",
  role: "",
  collab: "",
  area: "Diseño conceptual / Artesanía / 3D",
  year: "2022",
  url: "https://www.instagram.com/p/CaU1C_8li6x/"
},

/* ------------------ Tótem, Fuente para Abejas — Lucas Margotta ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2846189121615389770823005319875/Captura-de-pantalla-2026-03-18-a-las-15.28.05.png",
  orientation: "h",
  span: 1,
  tags: ["objeto", "artesanía", "exhibición"],
  title: "Tótem, Fuente para Abejas",
  author: "Lucas Margotta",
  role: "Diseñador",
  collab: "Desarrollado en Sistema Simple Studio",
  area: "Objeto / Artesanía / Exhibición",
  year: "2022",
  url: "https://www.instagram.com/p/CmFX14AJcVT/?img_index=2"
},

/* ------------------ Pabellón de Chile / London Design Biennale 2021 — Lucas Margotta ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/P2846189121596943026749295768259/Captura-de-pantalla-2026-03-18-a-las-15.30.17.png",
  orientation: "h",
  span: 1,
  tags: ["exhibición", "cultura", "experiencia"],
  title: "Pabellón de Chile / London Design Biennale 2021. ‘Resonancias Tectónicas desde el Sur: Del diseño centrado en el usuario al diseño orientado en el planeta’.",
  author: "Lucas Margotta",
  role: "Diseñador / Sistema SimpleStudio",
  collab: "Proyecto desarrollado por Marcos Chilet, Pablo Hermansen, Carola Ureta, Martin Tironi. En colaboración con Macarena Irarrázaval, Sistema Simple Studio, Design Systems International, Valentina Aliaga.",
  area: "Exhibición / Cultura / Experiencia",
  year: "2021",
  url: "https://www.instagram.com/p/CRHZFD1jD5z/?img_index=2"
},

/* ------------------ (Mobiliario) Librero Rubén — Diego Gajardo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2846189121560049538601876665027/Captura-de-pantalla-2026-03-18-a-las-15.33.20.png",
  orientation: "h",
  span: 1,
  tags: ["mobiliario", "objeto", "industrial"],
  title: "(Mobiliario) Librero Rubén",
  author: "Diego Gajardo",
  role: "Diseñador / Fundador",
  collab: "Desarrollado en ardo™︎ studio.",
  area: "Mobiliario / Objeto / Industrial",
  year: "2025",
  url: "https://www.instagram.com/p/DReznSODaPH/?img_index=1"
},

/* ------------------ [Banca Cafecito] — Diego Gajardo ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2846189121541602794528167113411/Captura-de-pantalla-2026-03-18-a-las-15.36.53.png",
  orientation: "h",
  span: 1,
  tags: ["mobiliario", "objeto", "industrial"],
  title: "[Banca Cafecito]",
  author: "Diego Gajardo",
  role: "Diseñador / Fundador",
  collab: "Diseñada en 2025 para la -tienda, cafetería y espacio de arte- @piso2stgo x C.Miller. Desarrollado en ardo™︎ studio.",
  area: "Mobiliario / Objeto / Industrial",
  year: "2025",
  url: "https://www.instagram.com/p/DU1ufwgDo0z/?img_index=2"
},

/* ------------------ José Vidal & Co - Tacto y Contacto — Lucía Rosselot Valdés ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2846189121523156050454457561795/Captura-de-pantalla-2026-03-18-a-las-15.44.07.png",
  orientation: "h",
  span: 1,
  tags: ["objeto", "editorial"],
  title: "José Vidal & Co - Tacto y Contacto",
  author: "Lucía Rosselot Valdés",
  role: "Diseñadora",
  collab: "Libro objeto para José Vidal & Co.",
  area: "Objeto / Editorial",
  year: "2018",
  url: "https://luciarosselotv.myportfolio.com/tacto-y-contacto"
},

/* ------------------ Modelo A04 — Lucía Rosselot Valdés ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/T2846191855090820101251782881987/Captura-de-pantalla-2026-03-18-a-las-15.59.22.png",
  orientation: "h",
  span: 1,
  tags: ["objeto", "indumentaria", "moda"],
  title: "Modelo A04",
  author: "Lucía Rosselot Valdés",
  role: "",
  collab: "",
  area: "Objeto / Indumentaria / Moda",
  year: "2023",
  url: "https://www.instagram.com/p/Cq_n5vYuUe_/?img_index=1"
},

/* ------------------ Intergenerationality and Flexibility — Daniela Moyano ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Z2846189121504709306380748010179/Captura-de-pantalla-2026-03-18-a-las-15.55.37.png",
  orientation: "h",
  span: 1,
  tags: ["diseño de información"],
  title: "Intergenerationality and Flexibility: A Guide for the Inclusion of 50+ Workers in Formal Workplaces",
  author: "Daniela Moyano",
  role: "Diseñadora",
  collab: "Illustrations by Camila Valencia (@mellamocamilinda)",
  area: "Diseño de información",
  year: "2024",
  url: "https://www.behance.net/gallery/213942821/Guide-for-the-Inclusion-of-50-Workers-in-Workplaces"
},

/* ------------------ Cómo diseñar una revolución. La vía chilena al diseño — Hugo Palmarola ------------------ */
{
  src: "IMG/remote-originals/023_Gonzalez-Yazmin.jpeg",
  orientation: "sq",
  span: 1,
  tags: ["editorial","investigación","exposición"],
  title: "Cómo diseñar una revolución. La vía chilena al diseño",
  author: "Hugo Palmarola",
  role: "Investigador/autor",
  collab: "Autores: Eden Medina, Pedro Ignacio Alonso, Hugo Palmarola. Diseño: Yazmín González. Editores: Lars Müller Publishers",
  area: "Editorial / Investigación / Exposición",
  year: "2023",
  url: "https://www.cclm.cl/exposicion/como-disenar-una-revolucion/"
},

/* ------------------ DASON — Patricio Fuentes ------------------ */
{
  src: "IMG/remote-originals/024_fuentes-PAtricio-IMG_5086-scaled.jpeg",
  orientation: "v",
  span: 2,
  tags: ["producto","salud","investigación"],
  title: "DASON",
  author: "Patricio Fuentes",
  role: "Diseñador/investigador",
  collab: "Desarrollado en colaboración con Stanford University",
  area: "Producto / Salud / Investigación",
  year: "2025",
  url: "https://diseno.uc.cl/2025/05/proyecto-dason-innovacion-frugal-desde-diseno-uc-para-la-salud-pediatrica-global/"
},

/* ------------------ Galería de Arte Gráfico A3 — Alejandra Amenábar ------------------ */
{
  src: "IMG/remote-originals/025_A3-Amenabar-Alejandra-Captura-de-pantalla-2026-03-11-a-las-11.34.26.png",
  orientation: "v",
  span: 1,
  tags: ["arte","galería"],
  title: "Galería de Arte Gráfico A3",
  author: "Alejandra Amenábar",
  role: "Diseñadora/Fundadora",
  collab: "Socia fundadora",
  area: "Arte / Galería",
  year: "N/A",
  url: "https://a3press.com"
},

/* ------------------ Olivia y el Terremoto Invisible — Antonia Piña ------------------ */
{
  src: "IMG/remote-originals/026_pina-antonia-MV5BNTZjYTczNmQtZjJlZS00NmJiLWFiMTctYzMxMThhZDRhNzdjXkEyXkFqcGc._V1_FMjpg_UX1000_.jpeg",
  orientation: "v",
  span: 2,
  tags: ["dirección creativa","dirección de arte","animación"],
  title: "Olivia y el Terremoto Invisible",
  author: "Antonia Piña",
  role: "Directora de arte",
  collab: "Dirección: Irene Iborra. Supervisión de arte en Pájaro Pip",
  area: "Dirección creativa / Dirección de arte / Animación",
  year: "2025",
  url: ["https://www.instagram.com/p/DTk-PIijiUK/?hl=es&img_index=1","https://pajaro.cl"]
},

/* ------------------ EXVIVO — Julie Carles ------------------ */
{
  src: "IMG/remote-originals/027_Julie-Carles-Captura-de-pantalla-2026-03-11-a-las-11.14.07.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "EXVIVO",
  author: "Julie Carles",
  role: "Diseñadora",
  collab: "Proyecto desarrollado en Draft Estudio",
  area: "Branding / Identidad visual / Gráfico",
  year: "2025",
  url: "https://draft.cl/work/project-ex-vivo/"
},

/* ------------------ DENSE — Vicente Carmona ------------------ */
{
  src: "IMG/remote-originals/028_Carmona-Vicente-Captura-de-pantalla-2026-03-11-a-las-11.19.36.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","investigación"],
  title: "DENSE",
  author: "Vicente Carmona",
  role: "Diseñador",
  collab: "",
  area: "Producto / Industrial / Investigación",
  year: "2023",
  url: "https://viscente.design/dense"
},

/* ------------------ Fintual — Valentina Andrea Pavez Benítez ------------------ */
{
  src: "IMG/remote-originals/029_Captura-de-pantalla-2026-03-11-a-las-13.16.23.png",
  orientation: "h",
  span: 1,
  tags: ["ux","ui","web"],
  title: "Fintual",
  author: "Valentina Andrea Pavez Benítez",
  role: "Diseñadora",
  collab: "",
  area: "UX / UI / Web",
  year: "2025",
  url: "https://www.behance.net/gallery/223316221/Caso-Estudio-Fintual"
},

/* ------------------ Hackathon Junior — Sophia López Pinoleo ------------------ */
{
  src: "IMG/remote-originals/030_hackathon.png",
  orientation: "h",
  span: 1,
  tags: ["gráfico","ilustración"],
  title: "Hackathon Junior",
  author: "Sophia López Pinoleo",
  role: "Diseñadora",
  collab: "",
  area: "Gráfico / Ilustración",
  year: "2025",
  url: "https://www.behance.net/gallery/228796131/DIPLOMAS-HACKATHON-JUNIOR-CHICAS-SUPERPODEROSAS"
},

/* ------------------ Descartadas — Vanessa Vásquez ------------------ */
{
  src: "IMG/remote-originals/031_vasquez-Vanessa-7a2b2e29-3d63-4564-9627-504ab6a59e1b.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Descartadas",
  author: "Vanessa Vásquez",
  role: "Diseñadora",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "N/A",
  url: "https://vvasquezzumaran15fd.myportfolio.com/descartadas-identidad-grafica"
},
/* ------------------ Indigno de ser humano — Javiera Vaccaro ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2844239123198440217689050264259/97396d_d193cc8440d94b3ba44e3030ab00242bmv2.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial", "ilustración"],
  title: "Indigno de ser humano",
  author: "Javiera Vaccaro",
  role: "Diseñadora / Ilustradora",
  collab: "Desarrollado en Abducción Editorial.",
  area: "Editorial / Ilustración",
  year: "2026",
  url: "https://www.abduccioneditorial.cl/product-page/indigno-de-ser-humano-osamu-dazai-1"
},

/* ------------------ Visualización de productos para página web — Álvaro Magalhães ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/N2844237192285504302141734859459/Captura-de-pantalla-2026-03-17-a-las-10.02.51.png",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual", "3D"],
  title: "Visualización de productos para página web",
  author: "Álvaro Magalhães",
  role: "Diseñador",
  collab: "Desarrollado en Mundigo - Diseño",
  area: "Diseño Conceptual / 3D",
  year: "2026",
  url: "https://www.instagram.com/p/DTQh37hlVke/?img_index=1"
},

/* ------------------ Diseño de soportes y montaje para @genoveva_scl y @bronca.stgo en la tienda de @cdl___stgo — Clemente Mackay ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/H2844237192414631510657701720771/Captura-de-pantalla-2026-03-17-a-las-10.07.54.png",
  orientation: "h",
  span: 1,
  tags: ["industrial", "objeto"],
  title: "Diseño de soportes y montaje para @genoveva_scl y @bronca.stgo en la tienda de @cdl___stgo",
  author: "Clemente Mackay",
  role: "Diseñador",
  collab: "Diseño y montaje: Clemente Mackay y Sebastián Cobo. Fotos de Ignacio Squella.",
  area: "Industrial / Objeto",
  year: "2025",
  url: "https://www.instagram.com/p/DTyuD4gFefE/?img_index=1"
},

/* ------------------ DTAD — Clemente Mackay ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2844237192396184766583992169155/Captura-de-pantalla-2026-03-17-a-las-10.09.28.png",
  orientation: "h",
  span: 1,
  tags: ["industrial", "objeto"],
  title: "DTAD",
  author: "Clemente Mackay",
  role: "Diseñador",
  collab: "",
  area: "Industrial / Objeto",
  year: "2024",
  url: "https://www.instagram.com/p/DDsppBEyNgw/?img_index=1"
},

/* ------------------ Ignacio Squella — Ignacio Squella ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2844237192359291278436573065923/Captura-de-pantalla-2026-03-17-a-las-10.15.56.png",
  orientation: "h",
  span: 1,
  tags: ["fotografía", "dirección de arte"],
  title: "Ignacio Squella",
  author: "Ignacio Squella",
  role: "Diseñador / fotógrafo",
  collab: "",
  area: "Fotografía / Dirección de arte",
  year: "n/a",
  url: "https://ignaciosquella.cl"
},

/* ------------------ Fotografía producto - Caluet.cl — Ignacio Squella ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Z2844237192377738022510282617539/Captura-de-pantalla-2026-03-17-a-las-10.15.47.png",
  orientation: "h",
  span: 1,
  tags: ["fotografía", "dirección de arte"],
  title: "Fotografía producto - Caluet.cl",
  author: "Ignacio Squella",
  role: "Diseñador / fotógrafo",
  collab: "",
  area: "Fotografía / Dirección de arte",
  year: "2025",
  url: "https://www.behance.net/gallery/226249599/Fotografia-producto-Caluetcl"
},

/* ------------------ Proyecto sin título — Sofía Jiménez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/A2844237192340844534362863514307/Captura-de-pantalla-2026-03-17-a-las-10.27.24.png",
  orientation: "v",
  span: 1,
  tags: ["estilismo", "moda", "dirección de arte"],
  title: "",
  author: "Sofía Jiménez",
  role: "",
  collab: "",
  area: "Estilismo / Moda / Dirección de arte",
  year: "2024",
  url: "https://www.instagram.com/p/C7AMr_8pWUE/?img_index=1"
},

/* ------------------ Proyecto sin título — Sofía Jiménez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2844237192322397790289153962691/Captura-de-pantalla-2026-03-17-a-las-10.28.05.png",
  orientation: "v",
  span: 1,
  tags: ["estilismo", "moda", "dirección de arte"],
  title: "",
  author: "Sofía Jiménez",
  role: "",
  collab: "",
  area: "Estilismo / Moda / Dirección de arte",
  year: "2024",
  url: "https://www.instagram.com/p/DC9MfyCpSoO/?img_index=1"
},

/* ------------------ Topsy Studio — Malú Fernández Aspillaga ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/F2844237192303951046215444411075/Captura-de-pantalla-2026-03-17-a-las-10.32.38.png",
  orientation: "h",
  span: 1,
  tags: ["dirección creativa", "rrss"],
  title: "Topsy Studio",
  author: "Malú Fernández Aspillaga",
  role: "Diseñadora / Fundadora",
  collab: "Directora Creativa en Topsy Studio",
  area: "Dirección creativa / RRSS",
  year: "n/a",
  url: "https://www.topsystudio.com"
},

/* ------------------ Orniflor viaja a Chiloé — Valentina Rey Carmona ------------------ */
{
  src: "IMG/remote-originals/032_Rey-Valentin-aportada-chiloe2.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","gráfico","diagramación"],
  title: "Orniflor viaja a Chiloé",
  author: "Valentina Rey Carmona",
  role: "",
  collab: "Proyecto para Fundación Juntos Incluimos",
  area: "Editorial / Gráfico / Diagramación",
  year: "2024",
  url: "https://www.behance.net/gallery/173198799/Orniflor-viaja-a-chilo"
},

/* ------------------ Libro infantil — Valentina Rey Carmona ------------------ */
{
  src: "IMG/remote-originals/033_Rey-Valentina.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","infantil"],
  title: "Libro infantil",
  author: "Valentina Rey Carmona",
  role: "",
  collab: "",
  area: "Ilustración / Infantil",
  year: "2024",
  url: "https://www.behance.net/gallery/182931307/Ilustraciones-editoriales"
},

/* ------------------ Cartas de Póker (Coca-Cola) — Tamara Santibáñez ------------------ */
{
  src: "IMG/remote-originals/034_Santibanez-Tamara.png",
  orientation: "h",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Cartas de Póker (Coca-Cola)",
  author: "Tamara Santibáñez",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/233763201/Cartas-de-poker-para-Coca-Cola"
},

/* ------------------ Descargables Imanix — Sofía Daza Urzúa ------------------ */
{
  src: "IMG/remote-originals/035_Daza-Sofia.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","editorial","gráfico"],
  title: "Descargables Imanix",
  author: "Sofía Daza Urzúa",
  role: "Diseñadora/ilustradora",
  collab: "",
  area: "Ilustración / Editorial / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/225293267/Descargables-Imanix"
},

/* ------------------ Talana (UX/UI) — Rafaella Espildora ------------------ */
{
  src: "IMG/remote-originals/036_Espildora-Rafella.png",
  orientation: "h",
  span: 1,
  tags: ["ux","ui","servicio"],
  title: "Talana",
  author: "Rafaella Espildora",
  role: "",
  collab: "",
  area: "UX / UI / Servicio",
  year: "2024",
  url: "https://www.behance.net/gallery/196546331/UXUI-SaaS-HR"
},

/* ------------------ Revista N°2 Museo Histórico de Carabineros — Paulina Padilla ------------------ */
{
  src: "IMG/remote-originals/037_PADILLA-PAULINA-1f75b2_fd084dd76c2b4662b346409b24ab3b7b.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial"],
  title: "Revista N°2 Museo Histórico de Carabineros de Chile",
  author: "Paulina Padilla",
  role: "",
  collab: "",
  area: "Editorial",
  year: "2013",
  url: "https://www.paulinapadilla.cl/editorial"
},

/* ------------------ Aralí — Aranda Feres Ojeda ------------------ */
{
  src: "IMG/remote-originals/038_feres-aranda-5_77c650d6-239f-407d-a6a8-8d316462fe81.jpeg",
  orientation: "v",
  span: 1,
  tags: ["producto","artesanía"],
  title: "Aralí",
  author: "Aranda Feres Ojeda",
  role: "Diseñadora/orfebre",
  collab: "",
  area: "Producto / Artesanía",
  year: "2024",
  url: "https://arali.store/collections/aranda-1"
},

/* ------------------ Afiche n°1 — Gianfranco Music Wachtendorff ------------------ */
{
  src: "IMG/remote-originals/039_Gianfranco-Music-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920.png",
  orientation: "sq",
  span: 2,
  tags: ["afiche","afiche digital","gráfico"],
  title: "Afiche n°1",
  author: "Gianfranco Music Wachtendorff",
  role: "",
  collab: "",
  area: "Afiche / Afiche digital / Gráfico",
  year: "2025",
  url: "https://gianfrancomw.myportfolio.com/posters-semana-novata-2023"
},

/* ------------------ Vestuario obra "Hotel O'clock" — María Soledad Albornoz ------------------ */
{
  src: "IMG/remote-originals/040_albornoz-soledad-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920.jpeg",
  orientation: "h",
  span: 2,
  tags: ["vestuario","teatro","indumentaria"],
  title: "Vestuario obra 'Hotel O'clock'",
  author: "María Soledad Albornoz",
  role: "",
  collab: "Diseño técnico, patronaje y confección de vestuario de once personajes. Estreno: Academia Club de Teatro Fernando González, julio 2025",
  area: "Vestuario / Teatro / Indumentaria",
  year: "2025",
  url: "https://solealbornoz.myportfolio.com/copia-de-escarlata"
},

/* ------------------ Vestuario obra "Bailame" — María Soledad Albornoz ------------------ */
{
  src: "IMG/remote-originals/041_albornoz-soledad-2-d0121ec3-e775-49e9-978e-8d1430062baa_rw_1920.jpeg",
  orientation: "h",
  span: 1,
  tags: ["vestuario","teatro","indumentaria"],
  title: "Vestuario obra 'Bailame'",
  author: "María Soledad Albornoz",
  role: "",
  collab: "Diseño técnico, patronaje y confección de vestuario de siete personajes",
  area: "Vestuario / Teatro / Indumentaria",
  year: "2025",
  url: "https://solealbornoz.myportfolio.com/copia-de-vestuario-obra-hotel-oclock"
},

/* ------------------ Colaboración cervecería LOA — María Jesús Lafuente ------------------ */
{
  src: "IMG/remote-originals/042_Lafuente-Captura-de-pantalla-2026-03-12-a-las-10.27.11.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","packaging","gráfico"],
  title: "Colaboración cervecería LOA",
  author: "María Jesús Lafuente",
  role: "",
  collab: "Ilustración para etiqueta de cerveza experimental. Cervecería LOA",
  area: "Ilustración / Packaging / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/206548179/Cerveza-LOA"
},

/* ------------------ Arrebol Spa — María Jesús Lafuente ------------------ */
{
  src: "IMG/remote-originals/043_arrebolCaptura-de-pantalla-2026-03-12-a-las-10.30.04.png",
  orientation: "h",
  span: 1,
  tags: ["afiche","ilustración","gráfico"],
  title: "Arrebol Spa",
  author: "María Jesús Lafuente",
  role: "",
  collab: "",
  area: "Afiche / Ilustración / Gráfico",
  year: "2024",
  url: "https://www.behance.net/gallery/215849417/Arrebol-Spa"
},

/* ------------------ alegría alegría (fotografía) — María Inés Alarcón ------------------ */
{
  src: "IMG/remote-originals/044_Alarcon-MariaInes-1Captura-de-pantalla-2026-03-12-a-las-10.53.27.png",
  orientation: "h",
  span: 1,
  tags: ["fotografía"],
  title: "alegría alegría",
  author: "María Inés Alarcón",
  role: "",
  collab: "Creadora y fundadora: María Inés Alarcón",
  area: "Fotografía",
  year: "N/A",
  url: ["https://www.alegria-alegria.com/portfolio","https://www.instagram.com/alegria___alegria/"]
},

/* ------------------ Rediseño portada Juan Salvador Gaviota — María Inés Alarcón ------------------ */
{
  src: "IMG/remote-originals/045_Alarcon-MariaInes-2Captura-de-pantalla-2026-03-12-a-las-10.56.05.png",
  orientation: "sq",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Rediseño portada Juan Salvador Gaviota",
  author: "María Inés Alarcón",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2018",
  url: "https://www.behance.net/gallery/67251153/Rediseno-portada-Juan-Salvador-Gaviota-Richard-Bach"
},

/* ------------------ Circular Pet — León Quesney Cox ------------------ */
{
  src: "IMG/remote-originals/046_Quesneyb9f9ce_c2d979ca09e44dfd8158696da129e7e2_mv2.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["packaging","servicio"],
  title: "Circular Pet",
  author: "León Quesney Cox",
  role: "",
  collab: "Desarrollado en Periferi.co",
  area: "Packaging / Servicio",
  year: "2021",
  url: ["https://www.behance.net/gallery/129565533/Pentawards-London-2021","https://www.periferi.co/services-1"]
},

/* ------------------ La Batea Deco — Josefina Stückrath ------------------ */
{
  src: "IMG/remote-originals/047_Josefina-Stuckrath-1Captura-de-pantalla-2026-03-12-a-las-11.05.59.png",
  orientation: "v",
  span: 1,
  tags: ["branding","gráfico","web"],
  title: "La Batea Deco",
  author: "Josefina Stückrath",
  role: "",
  collab: "",
  area: "Branding / Gráfico / Web",
  year: "2026",
  url: "https://www.behance.net/gallery/241350377/Diseno-grafico-web-y-fotografia-La-Batea-Deco"
},

/* ------------------ Tere Gott — Josefina Stückrath ------------------ */
{
  src: "IMG/remote-originals/048_Josefina-Stuckrath-2Captura-de-pantalla-2026-03-12-a-las-11.07.34.png",
  orientation: "h",
  span: 1,
  tags: ["branding","gráfico","web"],
  title: "Tere Gott",
  author: "Josefina Stückrath",
  role: "",
  collab: "Diseño gráfico, web y fotografía: Josefina Stückrath",
  area: "Branding / Gráfico / Web",
  year: "2025",
  url: "https://www.behance.net/gallery/241036857/Diseno-grafico-web-y-fotografia-Tere-Gott"
},

/* ------------------ ALBADELUX — Josefa González Gil ------------------ */
{
  src: "IMG/remote-originals/049_Gonzalez-Josefa-Captura-de-pantalla-2026-03-12-a-las-11.13.55.png",
  orientation: "v",
  span: 1,
  tags: ["branding","packaging","gráfico"],
  title: "ALBADELUX",
  author: "Josefa González Gil",
  role: "",
  collab: "Rediseño de identidad corporativa ALBADELUX. Implementación en desarrollo de packaging",
  area: "Branding / Packaging / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/175998049/Packaging-Iluminacion-Industrial"
},

/* ------------------ Cajas de Puzzles (varias) — Florencia Rodríguez Errázuriz ------------------ */
{
  src: "IMG/remote-originals/050_Florencia-Rodriguez-ErrazurizCaptura-de-pantalla-2026-03-12-a-las-11.15.31.png",
  orientation: "h",
  span: 1,
  tags: ["branding","packaging","gráfico"],
  title: "Cajas de Puzzles (varias)",
  author: "Florencia Rodríguez Errázuriz",
  role: "",
  collab: "",
  area: "Branding / Packaging / Gráfico",
  year: "2020",
  url: "https://www.behance.net/gallery/100930229/Diseno-de-cajas-para-puzzles"
},

/* ------------------ Real Travel App — Colomba Plass ------------------ */
{
  src: "IMG/remote-originals/051_Plass-colombaCaptura-de-pantalla-2026-03-12-a-las-11.21.45.png",
  orientation: "h",
  span: 1,
  tags: ["audiovisual","fotografía","dirección creativa"],
  title: "Real Travel App",
  author: "Colomba Plass",
  role: "diseñadora",
  collab: "Desarrollado en Cinco Estudio. Pieza audiovisual publicitaria para Real Travel",
  area: "Audiovisual / Fotografía / Dirección creativa",
  year: "N/A",
  url: "https://cinco-estudio.com/real-travel"
},

/* ------------------ Silla Mudra — Chiara Antillo Heilenkötter ------------------ */
{
  src: "IMG/remote-originals/052_Chiara-Antillosilla-mudra-madera-escultural2.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","objeto"],
  title: "Silla Mudra",
  author: "Chiara Antillo Heilenkötter",
  role: "",
  collab: "Desarrollado en Anka Taller",
  area: "Producto / Industrial / Objeto",
  year: "N/A",
  url: ["https://www.instagram.com/p/DRj3ScXkWvl/?img_index=1","https://www.ankataller.com/collections/sillas/products/silla-mudra"]
},

/* ------------------ Silla alta Pliego — Chiara Antillo Heilenkötter ------------------ */
{
  src: "IMG/remote-originals/053_Chiara-Antillosilla-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","objeto"],
  title: "Silla alta Pliego",
  author: "Chiara Antillo Heilenkötter",
  role: "",
  collab: "Desarrollado en Anka Taller",
  area: "Producto / Industrial / Objeto",
  year: "N/A",
  url: ["https://www.instagram.com/p/DRj3ScXkWvl/?img_index=1","https://www.ankataller.com/collections/sillas/products/silla-alta-pliego-taburete"]
},

/* ------------------ Historia de la infografía en Chile (2018) — Gonzalo Morales ------------------ */
{
  src: "IMG/remote-originals/054_Captura-de-pantalla-2026-03-12-a-las-11.32.10.png",
  orientation: "sq",
  span: 2,
  tags: ["investigación","publicación académica"],
  title: "Historia de la infografía en Chile (2018)",
  author: "Gonzalo Morales",
  role: "",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://www.academia.edu/36534358/Gonzalo_Morales_Historia_de_la_Infografía_en_Chile_2018_pdf"
},

/* ------------------ Afiche n°2 — Gianfranco Music Wachtendorff ------------------ */
{
  src: "IMG/remote-originals/055_Gianfranco-Music-Wachtendorff-7485022f-8fb6-4b6e-888d-2462ee018664_rw_1200.jpeg",
  orientation: "sq",
  span: 2,
  tags: ["afiche","afiche digital","gráfico"],
  title: "Afiche n°2",
  author: "Gianfranco Music Wachtendorff",
  role: "",
  collab: "",
  area: "Afiche / Afiche digital / Gráfico",
  year: "2025",
  url: "https://gianfrancomw.myportfolio.com/posters-semana-novata-2023"
},

/* ------------------ Sin nombre — Gianfranco Music Wachtendorff ------------------ */
{
  src: "IMG/remote-originals/056_Gianfranco-Music-3-Wachtendorff-2-ca55e895-7d6a-44c6-a77d-78b5454f0fa0_rw_1920.jpeg",
  orientation: "v",
  span: 1,
  tags: ["fotografía","moda","editorial"],
  title: "Sin nombre",
  author: "Gianfranco Music Wachtendorff",
  role: "",
  collab: "",
  area: "Fotografía / Moda / Editorial",
  year: "N/A",
  url: "https://gianfrancomw.myportfolio.com/varios"
},

/* ------------------ Colección 3 Chol1: Bichos — Antonino Reinoso ------------------ */
{
  src: "IMG/remote-originals/057_Captura-de-pantalla-2026-03-11-a-las-15.39.07.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial"],
  title: "Colección 3 Chol1: Bichos",
  author: "Antonino Reinoso",
  role: "",
  collab: "Producido en Chol1",
  area: "Producto / Industrial",
  year: "2019",
  url: "https://www.behance.net/gallery/84664443/Coleccion-3-Chol1-Bichos"
},

/* ------------------ Taboo* — Emilia Ferrari ------------------ */
{
  src: "IMG/remote-originals/058_Captura-de-pantalla-2026-03-11-a-las-16.08.04.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Taboo*",
  author: "Emilia Ferrari",
  role: "",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "2024",
  url: "https://jueves13.work/taboo"
},

/* ------------------ dos2 — Emilia Ferrari ------------------ */
{
  src: "IMG/remote-originals/059_Captura-de-pantalla-2026-03-11-a-las-15.42.59.png",
  orientation: "v",
  span: 1,
  tags: ["ux","ui","servicio"],
  title: "dos2",
  author: "Emilia Ferrari",
  role: "",
  collab: "Proyecto de título",
  area: "UX / UI / Servicio",
  year: "2025",
  url: "https://www.behance.net/gallery/225638573/dos2"
},

/* ------------------ Mueble Don Melchor — Carolina Planas ------------------ */
{
  src: "IMG/remote-originals/060_43fef9_efcf8eedf8d33bba27b941bb467583a7.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["industrial","espacios","vitrinaje"],
  title: "Mueble Don Melchor",
  author: "Carolina Planas",
  role: "",
  collab: "",
  area: "Industrial / Espacios / Vitrinaje",
  year: "N/A",
  url: "https://caroplanas.wixsite.com/caroplanasi"
},

/* ------------------ RRSS - Viela — Antonella Vila Garcia ------------------ */
{
  src: "IMG/remote-originals/061_Captura-de-pantalla-2026-03-11-a-las-15.47.30.png",
  orientation: "v",
  span: 1,
  tags: ["rrss","gráfico"],
  title: "RRSS - Viela",
  author: "Antonella Vila Garcia",
  role: "",
  collab: "",
  area: "RRSS / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/172562123/Post-historias-de-instagram"
},

/* ------------------ Viella — Antonella Vila Garcia ------------------ */
{
  src: "IMG/remote-originals/062_Captura-de-pantalla-2026-03-11-a-las-15.48.30.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Viella",
  author: "Antonella Vila Garcia",
  role: "",
  collab: "",
  area: "Branding / Identidad visual / Gráfico",
  year: "2023",
  url: "https://www.behance.net/gallery/161160095/Identidad-Viella"
},

/* ------------------ Proust Cerámica — Magdalena Proust Iligaray ------------------ */
{
  src: "IMG/remote-originals/063_Captura-de-pantalla-2026-03-11-a-las-15.53.10.png",
  orientation: "v",
  span: 1,
  tags: ["producto","artesanía"],
  title: "Proust Cerámica",
  author: "Magdalena Proust Iligaray",
  role: "diseñadora/ceramista",
  collab: "",
  area: "Producto / Artesanía",
  year: "N/A",
  url: "https://www.instagram.com/proust.ceramica/"
},

/* ------------------ COSTA — Andrés Valdivieso Vera ------------------ */
{
  src: "IMG/remote-originals/064_Captura-de-pantalla-2026-03-11-a-las-16.03.13.png",
  orientation: "v",
  span: 1,
  tags: ["producto"],
  title: "COSTA",
  author: "Andrés Valdivieso Vera",
  role: "",
  collab: "Claudia Marcano",
  area: "Producto",
  year: "2025",
  url: "https://www.behance.net/gallery/218091267/COSTA-Designed-with-HyphaLite"
},
/* ------------------ Campaña Funa y Acoso — Pilar Saavedra ------------------ */
{
  src: "IMG/remote-originals/065_Saavedra-Pilar-Captura-de-pantalla-2026-03-11-a-las-13.10.59.png",
  orientation: "v",
  span: 2,
  tags: ["afiche"],
  title: "Campaña Funa y Acoso",
  author: "Pilar Saavedra",
  role: "",
  collab: "",
  area: "Afiche",
  year: "2023",
  url: "https://pilar-fundamental.com/campana-ugn"
},

/* ------------------ Pequén — Elisa Aguirre ------------------ */
{
  src: "IMG/remote-originals/066_Aguirre-Elisa-3c82918c-ebd6-4a47-892e-220fb1ee7cba_rw_3840.png",
  orientation: "h",
  span: 1,
  tags: ["branding","gráfico","educación"],
  title: "Pequén",
  author: "Elisa Aguirre",
  role: "",
  collab: "Proyecto estudiantil",
  area: "Branding / Gráfico / Educación",
  year: "2025",
  url: "https://elisaaguirred.myportfolio.com/pequen"
},

/* ------------------ Paneles Voladores — Hugo Palmarola ------------------ */
{
  src: "IMG/remote-originals/067_a-740x1024-1.png",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Paneles Voladores",
  author: "Hugo Palmarola",
  role: "",
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
  src: "IMG/remote-originals/068_rjce_a_1433705_f0002_c.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Cosmopolitical encounters: Prototyping at the National Zoo",
  author: "Pablo Hermansen",
  role: "",
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
  src: "IMG/remote-originals/069_hacer_y_componer-1-768x1121.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Hacer y componer: una introducción a la tipografía",
  author: "Francisco Gálvez",
  role: "Diseñador/autor",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://catalogoadquisiciondelibros.cultura.gob.cl/libro/hacer-y-componer/"
},

/* ------------------ Hacer y componer 2.0 — Francisco Gálvez ------------------ */
{
  src: "IMG/remote-originals/070_51iAgF1DOuL._AC_UF1000-1000_QL80_.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Hacer y componer: una introducción a la tipografía 2.0",
  author: "Francisco Gálvez",
  role: "Diseñador/autor",
  collab: "",
  area: "Investigación / Publicación académica",
  year: "2024",
  url: "https://diseno.uc.cl/2025/05/lanzamiento-hacer-componer-2-0-una-introduccion-a-la-tipografia/"
},

/* ------------------ Pedagogías para habitar el jardín infantil — Patricia Manns ------------------ */
{
  src: "IMG/remote-originals/071_813k52dMx9L._AC_UF1000-1000_QL80_.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Pedagogías para habitar el jardín infantil",
  author: "Patricia Manns",
  role: "",
  collab: "Autores: Patricia Manns, Cynthia Adlerstein, Alberto González. Editorial: Ediciones UC",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://lea.uc.cl/pedagogias-para-habitar-el-jardin-infantil-reimpresion-primera-edicion-2018/p"
},

/* ------------------ Pedagogías para habitar el jardín infantil — Alberto González ------------------ */
{
  src: "IMG/remote-originals/072_158400-1200-auto.jpg",
  orientation: "sq",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Pedagogías para habitar el jardín infantil",
  author: "Alberto González",
  role: "",
  collab: "Autores: Patricia Manns, Cynthia Adlerstein, Alberto González. Editorial: Ediciones UC",
  area: "Investigación / Publicación académica",
  year: "2018",
  url: "https://lea.uc.cl/pedagogias-para-habitar-el-jardin-infantil-reimpresion-primera-edicion-2018/p"
},

/* ------------------ RutaCL Typeface — Rodrigo Ramírez ------------------ */
{
  src: "IMG/remote-originals/073_mini_magick20180818-12931-p4pb7n.png",
  orientation: "h",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "The design of RutaCL: Developing and measuring performance for highway typeface",
  author: "Rodrigo Ramírez",
  role: "",
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
  src: "IMG/remote-originals/074_Cristi-Nicole-Captura-de-pantalla-2026-03-11-a-las-11.25.22.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación"],
  title: "Resistencia gráfica. Dictadura en Chile (APJ – Tallersol)",
  author: "Nicole Cristi",
  role: "",
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
      src: "IMG/remote-originals/075_Sofia-Garrido.jpg",
      orientation: "h",
      span: 2,
      tags: ["editorial"],
      title: "INSTRUCCIONES PARA DIBUJAR SU CAMINAR",
      author: "Sofía Garrido",
      role: "",
      collab: "",
      area: "Editorial",
      year: "2020",
      url: "https://sofiagarrido.work/Instrucciones"
    },
    {
      src: "IMG/remote-originals/076_sofia-garrido-2.jpg",
      orientation: "v",
      span: 2,
      tags: ["editorial","Publicación digital"],
      title: "Magma Magazine",
      author: "Sofía Garrido",
      role: "",
      collab: "Magdalena Derosas, Esteban Sandoval",
      area: "Editorial",
      year: "2021",
      url: "https://sofiagarrido.work/Magma-Magazine"
    },

    /* ------------- Música — Vicente Acuña ------------- */
    {
      src: "IMG/remote-originals/077_600x600bf-60.jpg",
      orientation: "sq",
      span: 2,
      tags: ["Música","dirección de arte","Portada de disco"],
      title: "Consideraciones Generales",
      author: "Vicente Acuña",
      role: "",
      collab: "Fosfenos",
      area: "Música",
      year: "2024",
      url: "https://open.spotify.com/intl-es/album/6b3ijspHJK294Ao2HM5eWJ?si=e_KzcDHuTmabWIE5BYPMFA"
    },

    /* ------------- felicidad — Vicente Acuña ------------- */
    {
      src: "IMG/remote-originals/078_Acuna-Vicente-SSF_CASE_Felicidadpublica_19.png",
      orientation: "v",
      span: 2,
      tags: ["Gráfico","Branding","Museografía"],
      title: "Museum Site Santa Fe",
      author: "Vicente Acuña",
      role: "Diseñador",
      collab: "Desarrollado en: Felicidad Pública. Design Direction: Simón Sepúlveda, Piedad Rivadeneira. Creative Direction: Simón Sepúlveda. Graphic Design: Pau Geis, Antonia Guzmán, Vicente Acuña",
      area: "Gráfico / Museografía / Branding",
      year: "2022",
      url: "https://felicidadpublica.cl/project/site-santa-fe/"
    },

    {
      src: "https://freight.cargo.site/t/original/i/U2843133799052803512373283861187/Captura-de-pantalla-2026-03-16-a-las-17.56.23.png",
      orientation: "v",
      span: 2,
      tags: ["animación","Motion Graphics"],
      title: "The Name Club",
      author: "Vicente Acuña",
      role: "Diseñador",
      collab: "Desarrollado en: Otros Pérez.",
      area: "Gráfico / animación / Motion Graphics",
      year: "2025",
      url: "https://www.instagram.com/reel/DKxHrSQRn7Z/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    

    /* ------------- Gracia González — SIENTO EL VIENTO ------------- */
    {
      src: "IMG/remote-originals/079_Captura-de-pantalla-2025-10-01-a-las-14.33.36.png",
      orientation: "h",
      span: 2,
      tags: ["editorial","Experimental","educación"],
      title: "SIENTO EL VIENTO",
      author: "Gracia González",
      role: "",
      collab: "Editorial Amanuta (colaboración editorial)",
      area: "Editorial / Experimental / Educación",
      year: "2022",
      url: "https://graciastudio.cl/"
    },

    /* ------------- DIÁLOGOS IMPRESOS ------------- */
    {
      src: "IMG/remote-originals/080_IL-POSO.jpg",
      orientation: "h",
      span: 2,
      tags: ["Museografia","Exposición de arte","editorial"],
      title: "DIÁLOGOS IMPRESOS",
      author: "Gracia González, Alejandra Amenábar",
      role: "",
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
      src: "IMG/remote-originals/081_finat_1.jpg",
      orientation: "sq",
      span: 1,
      tags: ["Fotografía"],
      title: "60 años Kérastase",
      author: "Francisco Finat (fotografía)",
      role: "",
      collab: "Fotografía: Francisco Finat",
      area: "Fotografía",
      year: "2025",
      url: "https://www.instagram.com/p/DG1Km0yyJsd/?hl=es&img_index=1"
    },

    /* ------------- Avita — imagen Bustos ------------- */
    {
      src: "IMG/remote-originals/082_bustos_1.png",
      orientation: "v",
      span: 1,
      tags: ["Dirección de arte","Dirección creativa","Moda"],
      title: "Avita",
      author: "María Fernanda Gonzalez",
      role: "",
      collab: "Josefa Bustos, Ferni González",
      area: "Arte / Dirección creativa / Moda",
      year: "—",
      url: "https://individual-frame-992587.framer.app/art-direction"
    },
    /* ------------------ Biosfera Somos Agua — Josefina Carvalho ------------------ */
{
  src: "IMG/remote-originals/083_Captura-de-pantalla-2026-03-12-a-las-19.28.41.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Biosfera Somos Agua",
  author: "Josefina Carvalho",
  role: "",
  collab: "Autor del libro: Juan Pablo Orrego. Diagramación e ilustración: Josefina Carvalho, Magdalena Larraín",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://www.instagram.com/p/CQG4mvRDHNH/?img_index=1"
},

/* ------------------ Biosfera Somos Agua — Magdalena Larraín ------------------ */
{
  src: "IMG/remote-originals/084_Captura-de-pantalla-2026-03-12-a-las-19.28.49.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Biosfera Somos Agua",
  author: "Magdalena Larraín",
  role: "",
  collab: "Autor del libro: Juan Pablo Orrego. Diagramación e ilustración: Josefina Carvalho, Magdalena Larraín",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://www.instagram.com/p/CQG4mvRDHNH/?img_index=1"
},

    /* ------------- Avita — imagen González ------------- */
    {
      src: "IMG/remote-originals/085_gonzalez-m_1.png",
      orientation: "v",
      span: 1,
      tags: ["Dirección de arte","Dirección creativa","Moda"],
      title: "Avita",
      author: "María Fernanda Gonzalez",
      role: "",
      collab: "Josefa Bustos, Ferni González",
      area: "Arte / Dirección creativa / Moda",
      year: "—",
      url: "https://individual-frame-992587.framer.app/art-direction"
    },

    /* ------------- Guided by the Moon ------------- */
    {
      src: "IMG/remote-originals/086_vidosola_1.png",
      orientation: "v",
      span: 1,
      tags: ["Editorial","gráfico","diagramación"],
      title: "Guided by the Moon",
      author: "Florencia Vildósola",
      role: "",
      collab: "Fembith",
      area: "Editorial / Gráfico / Diagramación",
      year: "2022",
      url: "https://florenciavildosola.myportfolio.com/guiado-por-la-luna"
    },

    /* ------------- PC Factory — UX/UI ------------- */
    {
      src: "IMG/remote-originals/087_morales-const_1.png",
      orientation: "sq",
      span: 1,
      tags: ["UX","UI","Web","Responsivo"],
      title: "PC Factory",
      author: "Constanza Morales",
      role: "",
      collab: "PC Factory",
      area: "UX / UI / Web",
      year: "2021",
      url: "https://www.constanzamorales.com/projects/pcfactory"
    },

    /* ------------------ Manual Verde — Sergio Ramírez ------------------ */
    {
      src: "IMG/remote-originals/088_ramirez-s_1.png",
      orientation: "v",
      span: 2,
      tags: ["editorial","diagramación","gráfico","ilustración"],
      title: "Manual Verde",
      author: "Sergio Ramírez",
      role: "Diseñador",
      collab: "Ilustraciones de Javiera Infante y diagramación de Florencia Vildósola",
      area: "Editorial / Diagramación / Ilustración / Gráfico",
      year: "2024",
      url: "https://www.ramirezflores.cl/el-manual-verde/"
    },

    /* ------------------ Museo Histórico Nacional — Sergio Ramírez ------------------ */
    {
      src: "IMG/remote-originals/089_ramirez-s_2.jpeg",
      orientation: "h",
      span: 2,
      tags: ["Identidad visual","Identidad gráfica","branding"],
      title: "Museo Histórico Nacional",
      author: "Sergio Ramírez",
      role: "Diseñador",
      collab: "Gaggeroworks",
      area: "Identidad visual / Branding",
      year: "2021",
      url: "https://www.ramirezflores.cl/museo-historico-nacional/"
    },

    /* ------------------ TYPE SPECIMEN FANZINE — Jose Chaud ------------------ */
    {
      src: "IMG/remote-originals/090_chaud_1.png",
      orientation: "v",
      span: 1,
      tags: ["Afiche","Afiche digital","Gráfico","Fanzine"],
      title: "TYPE SPECIMEN FANZINE",
      author: "Jose Chaud",
      role: "",
      collab: "",
      area: "Afiche / Fanzine / Gráfico",
      year: "2024",
      url: "https://okeykul.com/3/"
    },

    /* ------------------ TYPE SPECIMEN FANZINE — Jose Chaud ------------------ */
    {
      src: "IMG/remote-originals/091_Trinidad-Bustos-2-portfolio-baby-kine-simulation-doll-muneco-simulacion-IA-AI-2.png",
      orientation: "v",
      span: 2,
      tags: ["Servicio","Salud","Producto"],
      title: "Baby.kine",
      author: "Trinidad Burgos",
      role: "",
      collab: "Co-autor:Iván Caro",
      area: "Servicio / Salud / Producto",
      year: "N/A",
      url: "https://trinidadburgos.com/baby-kine-en/"
    },

    /* ------------------ Emprendekit — Kimberly McCartney ------------------ */
    {
      src: "IMG/remote-originals/092_Kim_1.png",
      orientation: "v",
      span: 1,
      tags: ["diseño de servicio","ux/ui"],
      title: "Emprendekit",
      author: "Kimberly McCartney",
      role: "",
      collab: "",
      area: "Diseño de servicio / UX/UI",
      year: "2025",
      url: "https://www.kimberlymccartney.com/5/"
    },

    /* ------------------ FPO Módulo Bienal Arquitectura — Catalina Pérez ------------------ */
    {
      src: "IMG/remote-originals/093_perez-c_1.png",
      orientation: "h",
      span: 1,
      tags: ["identidad visual","Identidad gráfica","branding","museografía","instalación","exposición"],
      title: "FPO Módulo — Bienal de Arquitectura",
      author: "Catalina Pérez",
      role: "diseñadora / Socia fundadora",
      collab: "Otros Pérez, Fernando Pérez",
      area: "Identidad visual / Museografía / Exposición",
      year: "2023",
      url: "https://otrosperez.com/portfolio/home/fpo/"
    },

    {
      id: "pastelito",
      title: "Pastelito",
      author: "Naomi Altmann",
      role: "",
      collab: "",
      area: "Branding / Identidad visual",
      year: 2024,
      tags: ["branding", "identidad visual", "gráfico"],
      src: "IMG/remote-originals/094_Stickers_Pastelito.jpg",
      url: "https://naomialtmann.cargo.site/pastelito"
    },
    {
      id: "add",
      orientation: "h",
      span: 2,
      title: "ADD",
      author: "Fernanda González",
      role: "Diseñadora/investigación",
      collab: "",
      area: "Servicio / Salud",
      year: 2024,
      tags: ["salud", "servicio"],
      src: "IMG/remote-originals/095_Captura-de-pantalla-2026-01-02-a-las-13.33.28.png",
      url: "https://fernandagn.myportfolio.com/add-proyecto-de-titulo"
    },
    /* ------------------ LOYALTTY — Juan Pablo Valenzuela ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/A2843377305187268050867133559491/59cb6462-ee27-43ff-9915-b824fcb67c4e_rw_3840.jpg",
  orientation: "v",
  span: 1,
  tags: ["objeto", "artesanía", "moda", "indumentaria"],
  title: "LOYALTTY",
  author: "Juan Pablo Valenzuela",
  role: "Diseñador",
  collab: "Desarrollado en The Glass Lab @theglasslab.cl",
  area: "Objeto / Artesanía / Moda / Indumentaria",
  year: "2024",
  url: "https://yeipivalenzuela.myportfolio.com/loyaltty"
},

/* ------------------ Black — Juan Pablo Valenzuela ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2843377305205714794940843111107/5bfec8f9-e5ea-409e-9aed-efe06707094a_rw_3840.png",
  orientation: "v",
  span: 1,
  tags: ["objeto", "artesanía", "moda", "indumentaria"],
  title: "Black",
  author: "Juan Pablo Valenzuela",
  role: "Diseñador",
  collab: "Desarrollado en The Glass Lab @theglasslab.cl",
  area: "Objeto / Artesanía / Moda / Indumentaria",
  year: "2024",
  url: "https://yeipivalenzuela.myportfolio.com/black"
},
    {
      id: "una-clase-de-bichos",
      orientation: "v",
      span: 1,
      title: "Una Clase de Bichos",
      author: "Cristóbal Sprätz",
      role: "",
      collab: "Ilustraciones por Magdalena Pérez",
      area: "Ilustración / Editorial / Infantil",
      year: 2024,
      tags: ["ilustración", "editorial", "infantil"],
      src: "IMG/remote-originals/096_Captura-de-pantalla-2026-01-02-a-las-13.42.40.png",
      url: [
        "https://www.magdalenaperezv.com/Una-Clase-de-Bichos",
        "https://www.instagram.com/magdalenaperezv"
      ]
    },
    /* ------------------ Papel Lustre — Matías Prado ------------------ */
{
  src: "IMG/remote-originals/097_SARA-GUBBINS-Captura-de-pantalla-2026-01-04-a-las-13.07.13.png",
  orientation: "v",
  span: 1,
  tags: ["gráfico", "ilustración"],
  title: "Papel Lustre",
  author: "Sara Gubbins",
  role: "Diseñadora",
  collab: "Autor: Matías Prado en Feoperohermoso.cl",
  area: "Gráfico / Ilustración",
  year: "2025",
  url: "https://www.feoperohermoso.cl/products/papel-lustre-12-x-12-cm"
},

/* ------------------ Joyas Maite Araia — Javiera Naranjo ------------------ */
{
  src: "IMG/remote-originals/098_Javiera-Naranjo-image-66e65f5b-1715-43e0-ae6a-1c34883b472c.jpg",
  orientation: "v",
  span: 0,
  tags: ["fotografía", "moda", "editorial"],
  title: "Joyas Maite Araia",
  author: "Javiera Naranjo",
  role: "",
  collab: "Fotografía por: Javiera Naranjo",
  area: "Fotografía / Moda / Editorial",
  year: "2025",
  url: "https://readymag.website/u2667837699/JavieraNaranjoPortafolio/"
},

/* ------------------ INEDEBLE — Javiera Naranjo, Paulina Carrasco ------------------ */
{
  src: "IMG/remote-originals/099_Javiera-Naranjo-image-723d4605-f436-4ccd-bc6f-8cdfee64515f.jpg",
  orientation: "v",
  span: 0,
  tags: ["fotografía", "moda", "dirección creativa", "editorial"],
  title: "INEDEBLE",
  author: "Javiera Naranjo, Paulina Carrasco",
  role: "",
  collab: "",
  area: "Fotografía / Moda / Dirección Creativa / Editorial",
  year: "2025",
  url: "https://readymag.website/u2667837699/JavieraNaranjoPortafolio/"
},

/* ------------------ Raíces vivas: nuestra fusión — Magdalena Leigh ------------------ */
{
  src: "IMG/remote-originals/100_Magdalena-Leigh-Captura-de-pantalla-2026-01-04-a-las-13.22.37.png",
  orientation: "v",
  span: 1,
  tags: ["fotografía", "moda", "editorial"],
  title: "Raíces vivas: nuestra fusión",
  author: "Magdalena Leigh",
  role: "",
  collab: "Fotografía por: Magdalena Leigh",
  area: "Fotografía / Moda / Editorial",
  year: "2023",
  url: "https://www.instagram.com/p/CzmeLffJDVQ/"
},

    {
      id: "la-mesa-latina",
      title: "La Mesa Latina",
      author: "Ciudad Emergente",
      role: "",
      collab: "Ilustraciones por Magdalena Pérez",
      area: "Ilustración / Editorial",
      year: 2019,
      tags: ["ilustración", "editorial", "gráfico"],
      src: "IMG/remote-originals/101_Captura-de-pantalla-2026-01-02-a-las-14.00.36.png",
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
      role: "",
      collab: "",
      area: "Servicio / Salud / Social",
      year: "N/A",
      tags: ["servicio", "salud", "social"],
      src: "IMG/remote-originals/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31.png",
      url: "https://feromagnoli.framer.website/cases/red-apa"
    },
    {
      id: "catastro-prevencion",
      title: "Catastro Modelo de Prevención",
      author: "Pilar Saavedra",
      role: "",
      collab: "Cliente: Corporación de Universidades Privadas",
      area: "Editorial / Dirección de arte",
      year: 2025,
      tags: ["editorial", "dirección de arte", "ilustración"],
      src: "IMG/remote-originals/102_Captura-de-pantalla-2026-01-02-a-las-13.56.31.png",
      url: "https://pilar-fundamental.com/ugm-catastro"
    },
    {
      id: "espacio-ede",
      title: "Espacio EDE",
      author: "Pilar Saavedra",
      role: "",
      collab: "Cliente: Estudio EDE",
      area: "Identidad visual",
      year: 2023,
      tags: ["identidad visual", "branding", "gráfico"],
      src: "IMG/remote-originals/103_Captura-de-pantalla-2026-01-02-a-las-13.57.55.png",
      url: "https://pilar-fundamental.com/espacioede"
    },
    {
      id: "loie-fuller",
      title: "Löie Füller",
      author: "Pilar Saavedra",
      role: "",
      collab: "Proyecto personal",
      area: "Ilustración / Editorial",
      year: 2021,
      tags: ["ilustración", "editorial", "gráfico"],
      src: "IMG/remote-originals/104_Captura-de-pantalla-2026-01-02-a-las-13.58.22.png",
      url: "https://pilar-fundamental.com/loie-fuller"
    },
    {
      id: "expo-fireflies-patagonia",
      title: "Expo Fireflies Patagonia",
      author: "Constanza Gahona",
      role: "",
      collab: "Fireflies Patagonia",
      area: "Afiche / Gráfico",
      year: 2022,
      tags: ["afiche", "diagramación", "gráfico"],
      src: "IMG/remote-originals/105_Captura-de-pantalla-2026-01-02-a-las-14.03.58.png",
      url: "https://www.behance.net/gallery/156824561/Expo-Fireflies-Patagonia"
    },
    {
      id: "encuentro-entre-cerros",
      title: "Encuentro entre cerros",
      author: "Camila Correa",
      role: "",
      collab: "",
      area: "Identidad visual",
      year: "N/A",
      tags: ["identidad visual", "branding", "gráfico"],
      src: "IMG/remote-originals/106_Copia-de-avatar_ig_400.jpg",
      url: "https://cargocollective.com/ccharnecker/Imagen-de-marca"
    },
    {
      id: "revolucion-solar",
      title: "Revolución Solar",
      author: "Camila Correa",
      role: "",
      collab: "Kittsy Flor",
      area: "Música / Dirección de arte",
      year: "N/A",
      tags: ["música", "gráfico", "dirección de arte", "portada"],
      src: "IMG/remote-originals/107_kittsy_DANZA_OTONO_v6_800.png",
      url: "https://cargocollective.com/ccharnecker/Arte-discos-1"
    },
    {
      id: "ilustraciones-quanticas",
      title: "Ilustraciones Quánticas",
      author: "Camila Correa",
      orientation: "v",
      span: 1,
      role: "",
      collab: "Cliente: Quántica",
      area: "Ilustración",
      year: "N/A",
      tags: ["ilustración", "gráfico"],
      src: "IMG/remote-originals/108_fisica1_2-botella-globo_1000.jpg",
      url: "https://cargocollective.com/ccharnecker/Ilustraciones-Quantica"
    },
    {
      id: "de-mukachevo",
      title: "De Mukachevo al fin del mundo",
      author: "Marisol Zemon Vergara",
      role: "",
      collab: "Colomba Medina",
      area: "Editorial / Gráfico",
      year: "N/A",
      tags: ["editorial", "diagramación", "gráfico"],
      src: "IMG/remote-originals/109_d4acb2d4-a35f-4c33-b786-81974f5c3e20_rw_1920.jpg",
      url: "https://colombamedina.myportfolio.com/copia-de-de-mukachevo-al-fin-del-mundo"
    },
    {
      id: "milatelier",
      title: "Milatelier",
      author: "Colomba Medina",
      role: "",
      collab: "Cliente: Milatelier",
      area: "Identidad visual",
      year: "N/A",
      tags: ["identidad visual", "branding", "gráfico"],
      src: "IMG/remote-originals/110_4521c585-4a16-4ab5-9b1f-d76b06ca8705_rw_3840.png",
      url: "https://colombamedina.myportfolio.com/identida-de-marca"
    },
    {
      id: "serie-matera",
      orientation: "v",
      span: 1,
      title: "1/2 Serie Matera",
      author: "Martina Abello",
      role: "",
      collab: "",
      area: "Fotografía / Risografía",
      year: "N/A",
      tags: ["fotografía", "risografía"],
      src: "IMG/remote-originals/111_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.19.58.png",
      url: "https://mabellov.myportfolio.com/riso-1"
    },
    {
      id: "mitologia-chiloe",
      orientation: "v",
      span: 2,
      title: "Serie mitología Chiloé",
      author: "Martina Abello",
      role: "",
      collab: "Myriam Aguirre",
      area: "Risografía",
      year: 2022,
      tags: ["risografía"],
      src: "IMG/remote-originals/112_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.59.png",
      url: "https://mabellov.myportfolio.com/riso-2"
    },
    /* ------------------ No tengo amigos tengo amores — Andrés Miquel ------------------ */
{
  src: "IMG/remote-originals/113_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.36.36.png",
  orientation: "v",
  span: 2,
  tags: ["ilustración", "gráfico"],
  title: "No tengo amigos tengo amores",
  author: "Andrés Miquel",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/224616103/Poster-No-tengo-amigos-tengo-amores"
},

/* ------------------ Los Mil Nombres de María Camaleón — Andrés Miquel ------------------ */
{
  src: "IMG/remote-originals/114_Andres-Miquel-Captura-de-pantalla-2026-01-04-a-las-13.38.08.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración", "gráfico"],
  title: "Los Mil Nombres de María Camaleón",
  author: "Andrés Miquel",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/203999631/Afiche-Los-Mil-Nombres-de-Maria-Camaleon"
},

/* ------------------ Chini and the Technicians — Karina Hyland ------------------ */
{
  src: "IMG/remote-originals/115_Karina-Hyland-02625b89-857f-4d69-9f47-edb7a081e016_rw_1920.jpg",
  orientation: "h",
  span: 0,
  tags: ["iluminación"],
  title: "Chini and the Technicians",
  author: "Karina Hyland",
  role: "",
  collab: "Iluminación por: Karina Hyland",
  area: "Iluminación",
  year: "2018",
  url: "https://karinahy.cl/stage"
},

/* ------------------ DEFAULT — Manuela Garretón, Tomás Ossandón ------------------ */
{
  src: "IMG/remote-originals/116_Karina-Hyland-a7f3c303-c16e-4b68-bc30-df77e99a0763.jpg",
  orientation: "h",
  span: 1,
  tags: ["instalación", "web", "iluminación", "investigación"],
  title: "DEFAULT",
  author: "Karina Hyland",
  role: "Iluminación, diseño",
  collab: "Autores: Manuela Garretón, Tomás Ossandón. Iluminación, diseño y asistencia de investigación por: Karina Hyland",
  area: "Instalación / Web / Iluminación / Investigación",
  year: "2017",
  url: [
    "https://xdefault.cl/#proyecto",
    "https://karinahy.cl/default"
  ]
},

/* ------------------ P/H<25> — Vicente Puig ------------------ */
{
  src: "IMG/remote-originals/117_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.56.10.png",
  orientation: "h",
  span: 0,
  tags: ["branding", "identidad visual", "gráfico"],
  title: "P/H<25>",
  author: "Vicente Puig",
  role: "",
  collab: "Puchworks",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.instagram.com/p/DRVgPzziXWx/"
},

/* ------------------ REITE: rebranding — Vicente Puig ------------------ */
{
  src: "IMG/remote-originals/118_Vicente-Puig-Captura-de-pantalla-2026-01-04-a-las-13.59.20.png",
  orientation: "v",
  span: 1,
  tags: ["branding", "identidad visual", "gráfico"],
  title: "REITE: rebranding",
  author: "Vicente Puig",
  role: "",
  collab: "Puchworks",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.instagram.com/p/DQsJH1jCevq/"
},

/* ------------------ DRP_01 — Benjamín Becerra ------------------ */
{
  src: "IMG/remote-originals/119_Benjamin-Becerra-Captura-de-pantalla-2026-01-04-a-las-14.02.30.png",
  orientation: "v",
  span: 1,
  tags: ["vestuario", "moda"],
  title: "DRP_01",
  author: "Benjamín Becerra",
  role: "",
  collab: "Hostil",
  area: "Vestuario / Moda",
  year: "2025",
  url: "https://hostil-streetwear.com/products/hoodie_core"
},

    {
      id: "anthology",
      title: "Anthology",
      author: "Martina Abello",
      orientation: "v",
  span: 2,
      role: "",
      collab: "Curso VNC-2371-A Arts Books and Abstract Comics – SVA",
      area: "Risografía",
      year: "N/A",
      tags: ["risografía"],
      src: "IMG/remote-originals/120_Martina-AbelloCaptura-de-pantalla-2026-01-02-a-las-14.21.33.png",
      url: "https://mabellov.myportfolio.com/riso-3"
    },
    {
      id: "ilustraciones-mojonas",
      title: "Ilustraciones Mojonas",
      author: "Sofía Álvarez",
      role: "",
      collab: "Vans",
      area: "Ilustración / Muralismo",
      year: 2024,
      tags: ["ilustración", "muralismo"],
      src: "IMG/remote-originals/121_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.08.png",
      url: "https://readymag.website/u3068913620/portafoliomojona/proyectomojona/"
    },
    {
      id: "toyng",
      title: "Toyng",
      author: "Sofía Álvarez",
      role: "",
      collab: "Toyng Travel Games",
      area: "Producto",
      year: "2024/2025",
      tags: ["producto"],
      src: "IMG/remote-originals/122_Sofia-AlvarezCaptura-de-pantalla-2026-01-02-a-las-14.32.18.png",
      url: "https://readymag.website/u3068913620/portafoliomojona/proyectotoyngtravelgames/"
    },
/* ------------------ De Cancelling — Domingo Smart ------------------ */
{
  src: "IMG/remote-originals/123_Smart-Domingo.png",
  orientation: "v",
  span: 2,
  tags: ["soundscape","experimental","investigación","museografía"],
  title: "De Cancelling",
  author: "Domingo Smart",
  role: "",
  collab: "Guiatura: Nicolás Morales. Colaboradores: Manuel Larraín, Lukas Yunge",
  area: "Soundscape / Investigación / Museografía",
  year: "2025",
  url: "https://www.estudioample.com/003"
},

/* ------------------ PACKAGING FL-01 — Domingo Smart ------------------ */
{
  src: "IMG/remote-originals/124_Smart-Domingo-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["packaging","serigrafía","industrial"],
  title: "PACKAGING FL-01",
  author: "Domingo Smart",
  role: "",
  collab: "Artista: Martín Jiménez",
  area: "Packaging / Serigrafía / Industrial",
  year: "2024",
  url: "https://www.estudioample.com/002"
},

/* ------------------ Mesa Lateral — Domingo Smart ------------------ */
{
  src: "IMG/remote-originals/125_Smart-Domingo-3.jpg",
  orientation: "v",
  span: 2,
  tags: ["mobiliario","industrial","producto"],
  title: "Mesa Lateral",
  author: "Domingo Smart",
  role: "",
  collab: "Estudio: Ample",
  area: "Mobiliario / Producto / Industrial",
  year: "2024",
  url: "https://www.estudioample.com/001"
},

/* ------------------ Axigo — Tomás Sánchez ------------------ */
{
  src: "IMG/remote-originals/126_Sanchez-Tomas.png",
  orientation: "h",
  span: 2,
  tags: ["servicio","deportes","salud"],
  title: "Axigo",
  author: "Tomás Sánchez",
  role: "",
  collab: "Guiatura: Tomás Vivanco",
  area: "Servicio / Deportes / Salud",
  year: "2023",
  url: "https://tomassanchezsilva.myportfolio.com/axigo"
},

/* ------------------ Centralcorp — Francisco Poulsen ------------------ */
{
  src: "IMG/remote-originals/127_Poulsen-Francisco-1.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Centralcorp",
  author: "Francisco Poulsen",
  role: "",
  collab: "Trabajo realizado en IV estudio",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2025",
  url: "https://www.behance.net/gallery/229770149/Centralcorp"
},

/* ------------------ Olivo — Francisco Poulsen ------------------ */
{
  src: "IMG/remote-originals/128_Poulsen-Francisco-2.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Olivo",
  author: "Francisco Poulsen",
  role: "",
  collab: "Trabajo realizado en IV estudio",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2026",
  url: "https://www.behance.net/gallery/241545075/Olivo"
},

/* ------------------ Délano — Francisco Poulsen ------------------ */
{
  src: "IMG/remote-originals/129_Poulsen-Francisco-3.jpg",
  orientation: "h",
  span: 1,
  tags: ["branding","web","gráfico"],
  title: "Délano",
  author: "Francisco Poulsen",
  role: "",
  collab: "Co-autor: Francisco Poulsen",
  area: "Branding / Web / Gráfico",
  year: "-",
  url: "https://www.behance.net/gallery/238927891/Dlano"
},

/* ------------------ Sala simulación AVD — Valentina Navarrete ------------------ */
{
  src: "IMG/remote-originals/130_Navarrete-Valentina.jpg",
  orientation: "h",
  span: 1,
  tags: ["industrial","espacios","salud"],
  title: "Sala simulación AVD",
  author: "María Fernanda Gonzalez, Clemente López, Valentina Navarrete",
  role: "",
  collab: "",
  area: "Industrial / Espacios / Salud",
  year: "2025",
  url: "https://sites.google.com/view/valenavarrete-portafolio/sala-simulaci%C3%B3n-avd?"
},

/* ------------------ Salud oportuna en el sistema público de Chile — Felipe Vilches Ivelić ------------------ */
{
  src: "IMG/remote-originals/131_Vilches-Felipe-04.jpg",
  orientation: "h",
  span: 2,
  tags: ["animación","audiovisual","motion graphics","salud"],
  title: "Salud oportuna en el sistema público de Chile",
  author: "Felipe Vilches Ivelić",
  role: "",
  collab: "Encargo: LIP UC, Ministerio de Salud, Banco Interamericano de Desarrollo",
  area: "Animación / Audiovisual / Motion Graphics",
  year: "2020",
  url: "https://felipevilchesinc.com/trabajo/salud-oportuna"
},

/* ------------------ El delantal vestido — Felipe Vilches Ivelić ------------------ */
{
  src: "IMG/remote-originals/132_Vilches-Felipe.png",
  orientation: "h",
  span: 2,
  tags: ["animación","audiovisual","motion graphics","museografía"],
  title: "El delantal vestido",
  author: "Felipe Vilches Ivelić",
  role: "",
  collab: "Curaduría: Camila Ríos Erazo. Identidad gráfica: Sergio Ramírez Flores",
  area: "Animación / Audiovisual / Motion Graphics",
  year: "2024",
  url: "https://felipevilchesinc.com/trabajo/delantal-vestido"
},

/* ------------------ De Este a Oeste, de Norte a Sur — Felipe Vilches Ivelić ------------------ */
{
  src: "IMG/remote-originals/133_Vilches-Felipe-05.jpg",
  orientation: "v",
  span: 1,
  tags: ["animación","audiovisual","motion graphics"],
  title: "De Este a Oeste, de Norte a Sur",
  author: "Felipe Vilches Ivelić",
  role: "",
  collab: "Dirección: Domingo Abelli. Producción: Goroka TV",
  area: "Animación / Motion Graphics / Audiovisual",
  year: "2022",
  url: "https://felipevilchesinc.com/trabajo/titulos-deaodnas-documental"
},

/* ------------------ Péndulo — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/remote-originals/134_Reyes-Daniela.png",
  orientation: "h",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Péndulo",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "",
  area: "Branding / Identidad Visual / Gráfico",
  year: "2024",
  url: "https://www.behance.net/gallery/211077763/PENDULO"
},

/* ------------------ Cositas Fanzine — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/remote-originals/135_Reyes-Daniela-cositas1_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Cositas Fanzine",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2024",
  url: "https://danielawilliam.com/Fanzine-Cositas"
},

/* ------------------ Mujeres Inspiradoras — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/remote-originals/136_Reyes-Daniela-STEM2_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Mujeres Inspiradoras",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "Proyecto con Mujeres Bacanas",
  area: "Ilustración / Gráfico",
  year: "2023",
  url: "https://danielawilliam.com/Illustration-work/STEM"
},

/* ------------------ Los Heroes Magazine Covers — Daniela Reyes Muñoz ------------------ */
{
  src: "IMG/remote-originals/137_Reyes-Daniela-abril2023_670.jpg",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "Los Heroes Magazine Covers",
  author: "Daniela Reyes Muñoz",
  role: "",
  collab: "Revista Los Héroes",
  area: "Ilustración / Editorial",
  year: "2023",
  url: "https://danielawilliam.com/Illustration-work/Los-Heroes-2023"
},

/* ------------------ Disonia — Joaquín Gajardo ------------------ */
{
  src: "IMG/remote-originals/138_Gajardo-Joaquin-6624043949c81673fb06bf59_Mesa-de-trabajo-18-copia-9.jpg",
  orientation: "h",
  span: 1,
  tags: ["desarrollo web","servicios","portafolio"],
  title: "Disonia",
  author: "Joaquín Gajardo",
  role: "",
  collab: "Cliente: DISONIA. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Servicios",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/topo-colectivo"
},

/* ------------------ TOPO COLECTIVO — Joaquín Gajardo ------------------ */
{
  src: "IMG/remote-originals/139_Gajardo-Joaquin-66831724e1980d57e502d3b2_Mesa-de-trabajo-18-copia-4.jpg",
  orientation: "h",
  span: 1,
  tags: ["desarrollo web","servicios","ecommerce"],
  title: "TOPO COLECTIVO",
  author: "Joaquín Gajardo",
  role: "",
  collab: "Cliente: TOPO COLECTIVO. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Ecommerce",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/jose-maiza"
},
/* ------------------ La Raíz del Aire — Florencia Caro / Colomba Acosta ------------------ */
{
  src: "IMG/remote-originals/140_Caro-Florencia-Captura-de-pantalla-2026-03-09-a-las-16.27.21.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","diagramación","gráfico"],
  title: "La Raíz del Aire",
  author: "Florencia Caro, Colomba Acosta",
  role: "",
  collab: "Fotografía: G. Vivanco. Realizado en Mucha Trama Estudio",
  area: "Editorial / Diagramación / Gráfico",
  year: "2025",
  url: "https://muchatrama.wixsite.com/muchatrama/portfolio-collections/my-portfolio/project-title-5"
},

/* ------------------ Raíz Rituales — Colomba Acosta / Florencia Caro ------------------ */
{
  src: "IMG/remote-originals/141_Acosta--Colomba-Captura-de-pantalla-2026-03-09-a-las-16.30.34.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","fanzine","impresión"],
  title: "Raíz Rituales",
  author: "Colomba Acosta, Florencia Caro",
  role: "",
  collab: "Proyecto de diseño para Raíz Rituales. Realizado en Mucha Trama Estudio",
  area: "Editorial / Fanzine / Impreso",
  year: "2025",
  url: "https://muchatrama.wixsite.com/muchatrama/portfolio-collections/my-portfolio/project-title-6-1"
},

/* ------------------ Decide Chile — Constanza Morales ------------------ */
{
  src: "IMG/remote-originals/142_morales-constanza-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["ux","ui","web","responsivo"],
  title: "Decide Chile",
  author: "Constanza Morales",
  role: "",
  collab: "Colaboradoras: Natalia Rojo, Camila Navarrete",
  area: "UX / UI / Web",
  year: "2020",
  url: "https://www.constanzamorales.com/projects/decidechile"
},

/* ------------------ Antagonista — Bernardita Hoffmann ------------------ */
{
  src: "IMG/remote-originals/143_Hoffmann-Bernardita-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial","packaging"],
  title: "Antagonista",
  author: "Bernardita Hoffmann",
  role: "",
  collab: "",
  area: "Producto / Industrial / Packaging",
  year: "2023",
  url: "https://bhbouchon.myportfolio.com/antagonista"
},

/* ------------------ Batallas en el barrio — Magdalena Leigh ------------------ */
{
  src: "IMG/remote-originals/144_leigh-magdalena.jpeg",
  orientation: "v",
  span: 1,
  tags: ["cultura","museografía","investigación"],
  title: "Batallas en el barrio",
  author: "Magdalena Leigh",
  role: "",
  collab: "Investigación: Magdalena Leigh. Guiatura: Pedro Álvarez",
  area: "Cultura / Museografía / Investigación",
  year: "2025",
  url: "https://www.linkedin.com/posts/magdalena-leigh-maturana-b586aa27b_despu%C3%A9s-de-varios-meses-de-investigaci%C3%B3n-activity-7415374998154207232-lamk"
},

/* ------------------ POLKA DOT — Fernanda Gutiérrez ------------------ */
{
  src: "IMG/remote-originals/145_gutierrez-fernanda-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["dirección de arte","moda","fotografía"],
  title: "POLKA DOT",
  author: "Fernanda Gutiérrez",
  role: "",
  collab: "Dirección creativa: @fgtzzz_, @javinaranjot. Fotografía: @diegoaguilera.p. Modelo: @agustinazegers. Estilismo: @manuela.eyz",
  area: "Dirección de arte / Moda / Fotografía",
  year: "2025",
  url: "https://readymag.website/u1773068245/6079251/2/"
},

/* ------------------ Fresca Rebeca (producto) — Fernanda Gutiérrez ------------------ */
{
  src: "IMG/remote-originals/146_gutierrez-fernanda-3.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["dirección de arte","moda","fotografía"],
  title: "Fresca Rebeca",
  author: "Fernanda Gutiérrez",
  role: "",
  collab: "Dirección de arte: @fgtzzz_. Fotografía: @crisa.a. Asistente producción: @javinaranjot",
  area: "Dirección de arte / Moda / Fotografía",
  year: "2025",
  url: "https://readymag.website/u1773068245/6079251/2/"
},

/* ------------------ Presente — Daniela Gajardo ------------------ */
{
  src: "IMG/remote-originals/147_Gajardo-Daniela-Captura-de-pantalla-2026-03-09-a-las-17.02.33.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","textil","gráfico","afiche"],
  title: "Presente",
  author: "Daniela Gajardo",
  role: "",
  collab: "Idea original: Diamela Burboa, Elisa Modak, Isidora Modak, Isidora Montalván, Josefina Stuardo. Post-producción: Carlos Nauto",
  area: "Editorial / Textil / Gráfico / Afiche",
  year: "2025",
  url: "https://www.behance.net/gallery/224614769/2025-PORTAFOLIO-DISENO-DG"
},

/* ------------------ Restaurant KrossBar — Catalina Harasic ------------------ */
{
  src: "IMG/remote-originals/148_Harasic-Catalina.jpeg",
  orientation: "v",
  span: 1,
  tags: ["iluminación","industrial","espacio"],
  title: "Restaurant KrossBar",
  author: "Catalina Harasic",
  role: "",
  collab: "Iluminación: Harasic Diseño e Iluminación. Proyecto liderado por Diagrama Arquitectos",
  area: "Iluminación / Industrial / Espacios",
  year: "2025",
  url: "https://www.linkedin.com/in/catalina-harasic-gil-9239a844/details/projects/?profileUrn=urn%3Ali%3Afsd_profile%3AACoAAAlm0SsBad8u2IpnSwXl7YUI3xvZq3sFM20"
},
/* ------------------ Dynamics of coastal picoeukaryote communities — Alejandro Durán ------------------ */
{
  src: "IMG/remote-originals/149_X01411136.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Dynamics of coastal picoeukaryote communities in response to oil spill disturbances",
  author: "Alejandro Durán",
  role: "",
  collab: "Desarrollado con: Benjamín Glasner, Isidora Morel-Letelier, Esteban Osses, Camilo Gálvez-Aracena, Rodrigo De la Iglesia",
  area: "Investigación / Publicación académica",
  year: "2026",
  url: "https://www.sciencedirect.com/science/article/abs/pii/S0141113625008050"
},

/* ------------------ Flora Nativa — María José Carmona ------------------ */
{
  src: "IMG/remote-originals/150_nativa.jpg",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Flora Nativa",
  author: "María José Carmona",
  role: "",
  collab: "Autores: Juan Vidal y colaboradores. Ilustraciones: María José Carmona. Editorial Amanuta. Institución: IEB Senda Darwin CNCA",
  area: "Editorial / Ilustración / Ecología",
  year: "2016",
  url: "https://mjcarmona.com/libros-publicados"
},

/* ------------------ Al agua — María José Carmona ------------------ */
{
  src: "IMG/remote-originals/151_824f334f-4c26-48e3-93ee-95d5a45b865b_rw_3840.JPG",
  orientation: "v",
  span: 1,
  tags: ["editorial","ilustración","ecología"],
  title: "Al agua",
  author: "María José Carmona",
  role: "",
  collab: "Ilustrado junto a Loreto Salinas. Texto: Sam García. Editorial Manivela",
  area: "Editorial / Ilustración / Ecología",
  year: "2021",
  url: "https://mjcarmona.com/libros-publicados"
},

/* ------------------ Panchita recorre Chiloé — Gabriela Sandoval ------------------ */
{
  src: "IMG/remote-originals/152_plantilla-13.jpeg",
  orientation: "h",
  span: 2,
  tags: ["exhibición","cultura","experiencia","artesanía"],
  title: "Panchita recorre Chiloé",
  author: "Gabriela Sandoval",
  role: "",
  collab: "Creado por: Malvina García, Gabriela Sandoval",
  area: "Exhibición / Cultura / Experiencia",
  year: "2021–2023",
  url: "https://panchitarecorrechiloe.cl"
},

/* ------------------ Mou Studio — Martina Palominos ------------------ */
{
  src: "IMG/remote-originals/153_Diseno-sin-titulo-4-1.jpg",
  orientation: "v",
  span: 1,
  tags: ["textil","indumentaria","moda"],
  title: "Mou Studio",
  author: "Martina Palominos",
  role: "",
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
  src: "IMG/remote-originals/154_mision-korex.jpg",
  orientation: "v",
  span: 1,
  tags: ["servicio","innovación","educación"],
  title: "Misión Korex: Estrategia gamificada para potenciar la actividad física en escolares",
  author: "Teresita de Jesús Reymond",
  role: "",
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
  src: "IMG/remote-originals/155_En-que-consiste_Set-Pescador-compress.jpg",
  orientation: "h",
  span: 1,
  tags: ["exhibición","cultura","experiencia","artesanía"],
  title: "El Pescador de Chiloé",
  author: "Gabriela Sandoval",
  role: "",
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
  src: "IMG/remote-originals/156_WhatsApp-Image-2023-09-01-at-12.49.38.jpeg",
  orientation: "h",
  span: 1,
  tags: ["investigación","salud","servicio"],
  title: "Ari-test",
  author: "Macarena Silva",
  role: "",
  collab: "Liderado por Macarena Silva. Desarrollado en Ari Health Design",
  area: "Investigación / Salud / Servicio",
  year: "2022",
  url: "https://alumni.uc.cl/actualidad/iniciativa-para-la-deteccion-del-vph-creada-por-disenadora-uc-macarena-silva-obtiene-premio-latinoamericano/"
},
/* ------------------ Deseo, Carne y Voluntad — Javiera Donoso ------------------ */
{
  src: "IMG/remote-originals/157_a3407688467_16.jpg",
  orientation: "sq",
  span: 2,
  tags: ["cover art","dirección de arte"],
  title: "Deseo, Carne y Voluntad",
  author: "Javiera Donoso",
  role: "",
  collab: "Banda: Candelabro",
  area: "Cover Art / Dirección de arte",
  year: "2025",
  url: "https://soloartistaschilenos.cl/deseo-carne-y-voluntad-de-candelabro-un-abrazo-a-la-espiritualidad-y-una-feroz-demostracion-de-madurez-musical/"
},

/* ------------------ Ahora o nunca — Javiera Donoso ------------------ */
{
  src: "IMG/remote-originals/158_Captura-de-pantalla-2026-03-13-a-las-16.43.15.png",
  orientation: "sq",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Ahora o nunca",
  author: "Javiera Donoso",
  role: "",
  collab: "Banda: Candelabro",
  area: "Cover Art / Dirección de arte",
  year: "2024",
  url: "https://www.instagram.com/p/C2vNeBzvoNz/"
},
/* ------------------ The Art of Talking About Art — María Jesús Vidal Lynch ------------------ */
{
  src: "IMG/remote-originals/159_Captura-de-pantalla-2026-03-14-a-las-11.12.16.png",
  orientation: "v",
  span: 1,
  tags: ["servicio","cultura","exhibición"],
  title: "The Art of Talking About Art",
  author: "María Jesús Vidal Lynch",
  role: "",
  collab: "Research & design of the overall project",
  area: "Servicio / Cultura / Exhibición",
  year: "2023",
  url: "https://mjvidallynch.myportfolio.com/the-art-of-talking-about-art"
},

/* ------------------ Refugia — Constanza Weinreich Siraqyan ------------------ */
{
  src: "IMG/remote-originals/160_1770321553813.jpeg",
  orientation: "v",
  span: 1,
  tags: ["dirección creativa","identidad visual"],
  title: "Refugia",
  author: "Constanza Weinreich Siraqyan",
  role: "",
  collab: "Vomva: branding y dirección. Constanza Weinreich: diseño visual y dirección",
  area: "Dirección creativa / Identidad visual",
  year: "2025",
  url: "https://www.linkedin.com/posts/c-weinreich_dise%C3%B1o-de-identidad-visual-y-marca-de-refugia-activity-7425266784230084608-_xkG"
},

/* ------------------ MUDA — Ignacia Bianchi ------------------ */
{
  src: "IMG/remote-originals/161_Captura-de-pantalla-2026-03-14-a-las-10.44.05.png",
  orientation: "v",
  span: 1,
  tags: ["indumentaria","objeto","textil"],
  title: "MUDA",
  author: "Ignacia Bianchi",
  role: "",
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
  src: "IMG/remote-originals/162_d422a906-7be4-4738-bae6-211bf10a9bfb_rw_1920.jpg",
  orientation: "v",
  span: 1,
  tags: ["indumentaria","objeto","textil"],
  title: "Regularidad Irregular",
  author: "Ignacia Bianchi",
  role: "",
  collab: "",
  area: "Indumentaria / Objeto / Textil",
  year: "2024",
  url: "https://ignaciabianchi.myportfolio.com/pleats-pleats-pleats"
},

/* ------------------ Hati: El Equilibrio de los Espíritus — Clara Valenzuela Lowey ------------------ */
{
  src: "IMG/remote-originals/163_625530226_17872909344521833_8996592620757902267_n.jpg",
  orientation: "v",
  span: 1,
  tags: ["juego de mesa","producto"],
  title: "Hati: El Equilibrio de los Espíritus",
  author: "Clara Valenzuela Lowey",
  role: "",
  collab: "Financiado por FONDART",
  area: "Juego de mesa / Producto",
  year: "2024",
  url: "https://www.instagram.com/p/DV11EWUFhSp/"
},

/* ------------------ La ciudad como texto — Carola Ureta ------------------ */
{
  src: "IMG/remote-originals/164_Captura-de-pantalla-2026-03-14-a-las-11.12.54.png",
  orientation: "v",
  span: 1,
  tags: ["web","experiencia","cultura"],
  title: "La ciudad como texto",
  author: "Carola Ureta",
  role: "",
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
  src: "IMG/remote-originals/165_DSC_2551-e1531948324611.jpg",
  orientation: "v",
  span: 1,
  tags: ["moda","indumentaria","cultura"],
  title: "Metanoien",
  author: "Tomás Corvalán Azócar",
  role: "",
  collab: "",
  area: "Moda / Indumentaria / Cultura",
  year: "2018",
  url: "https://pousta.com/tomas-corvalan-azocar-metanoien/"
},

/* ------------------ Diseño basado en Simbiogénesis — Daniela Rojas-Levy ------------------ */
{
  src: "IMG/remote-originals/166_cover_issue_305_es_ES.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Desde la bio-imitación a la bioextrapolación: Diseño basado en Simbiogénesis",
  author: "Daniela Rojas-Levy",
  role: "",
  collab: "Durán-Vargas, A., & Rojas-Levy, D. (2021)",
  area: "Investigación / Publicación académica",
  year: "2021",
  url: "https://dspace.palermo.edu/ojs/index.php/cdc/article/view/5004"
},

/* ------------------ Humanidad Teenager — Benjamín Saíz ------------------ */
{
  src: "IMG/remote-originals/167_Captura-de-pantalla-2026-03-14-a-las-11.17.17.png",
  orientation: "h",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Humanidad Teenager",
  author: "Benjamín Saíz",
  role: "",
  collab: "",
  area: "Cover Art / Dirección de arte",
  year: "2021",
  url: "https://www.behance.net/gallery/111240593/Humanidad-Teenager-Portada-y-Animaciones"
},

/* ------------------ CHT Lab — Benjamín Saíz ------------------ */
{
  src: "IMG/remote-originals/168_Captura-de-pantalla-2026-03-14-a-las-11.18.22.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual"],
  title: "CHT Lab",
  author: "Benjamín Saíz",
  role: "",
  collab: "",
  area: "Identidad visual",
  year: "2021",
  url: "https://www.behance.net/gallery/111241797/CHT-Lab-2021"
},

/* ------------------ Si el mundo se acabara hoy — Pablo González ------------------ */
{
  src: "IMG/remote-originals/169_66725.jpg",
  orientation: "sq",
  span: 1,
  tags: ["cover art","dirección de arte"],
  title: "Si el mundo se acabara hoy",
  author: "Pablo González",
  role: "",
  collab: "Banda: Ad Portas",
  area: "Cover Art / Dirección de arte",
  year: "2025",
  url: "https://portaldisc.com/contenido/single-adportas-si-el-mundo-acaba-hoy"
},

/* ------------------ Resonancias Tectónicas — Marcos Chillet ------------------ */
{
  src: "IMG/remote-originals/170_Captura-de-pantalla-2026-03-13-a-las-16.31.45.png",
  orientation: "v",
  span: 1,
  tags: ["editorial","investigación"],
  title: "Resonancias Tectónicas",
  author: "Marcos Chilet",
  role: "",
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
  src: "IMG/remote-originals/171_Group-147.png.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio","innovación","investigación"],
  title: "Salud Oportuna",
  author: "Sara Riveros",
  role: "",
  collab: "Desarrollado en Laboratorio de Innovación Pública UC (LIP)",
  area: "Servicio / Innovación / Investigación",
  year: "2019–en curso",
  url: "https://www.saludoportuna.cl/soluciones"
},

/* ------------------ GOLDFISH — María Jesús Contreras ------------------ */
{
  src: "IMG/remote-originals/172_Captura-de-pantalla-2026-03-13-a-las-16.00.11.png",
  orientation: "sq",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "GOLDFISH",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Stilllife 1 — María Jesús Contreras ------------------ */
{
  src: "IMG/remote-originals/173_Captura-de-pantalla-2026-03-13-a-las-16.00.27.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Stilllife 1",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ 30 Grad Mag — María Jesús Contreras ------------------ */
{
  src: "IMG/remote-originals/174_Captura-de-pantalla-2026-03-13-a-las-16.01.50.png",
  orientation: "h",
  span: 2,
  tags: ["ilustración","gráfico"],
  title: "30 Grad Mag",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Frog Party — María Jesús Contreras ------------------ */
{
  src: "IMG/remote-originals/175_Captura-de-pantalla-2026-03-13-a-las-16.02.20.png",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Frog Party",
  author: "María Jesús Contreras",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2022",
  url: "https://www.mariajesuscontreras.com"
},

/* ------------------ Metro 21 — Josefina Andreu ------------------ */
{
  src: "IMG/remote-originals/176_metro21-4.jpg",
  orientation: "v",
  span: 1,
  tags: ["galería","cultura"],
  title: "Metro 21",
  author: "Josefina Andreu",
  role: "",
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
  src: "IMG/remote-originals/177_IMG-PAG-04.jpg",
  orientation: "h",
  span: 2,
  tags: ["editorial","dirección creativa"],
  title: "Confluencia: Ruta de 52 murales en la Región Metropolitana",
  author: "Josefina Andreu",
  role: "",
  collab: "",
  area: "Editorial / Dirección creativa",
  year: "2024",
  url: "https://www.metro21.cl/proyectos/confluencia-ruta-de-murales-de-la-region-metropolitana/"
},

/* ------------------ Borrowed Matter / Materia Prestada — Sofía Guridi ------------------ */
{
  src: "IMG/remote-originals/178_Materia-Prestada-11.jpg",
  orientation: "v",
  span: 1,
  tags: ["exhibición","cultura","experiencia"],
  title: "Borrowed Matter / Materia Prestada",
  author: "Sofía Guridi",
  role: "",
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
  src: "IMG/remote-originals/179_756dfc7d-4a2c-4280-8ce0-a60bb348ce95_rw_3840.jpg",
  orientation: "h",
  span: 2,
  tags: ["exhibición","objeto","experiencia"],
  title: "Dissolvable Biotextile Keyboard",
  author: "Sofía Guridi",
  role: "",
  collab: "Fotografía: Vertti Virasjoki. Presentado en Dutch Design Week 2024",
  area: "Objeto / Exhibición",
  year: "2024",
  url: "https://sofiaguridi.xyz/dissolvable-biotextile-keyboard"
},

/* ------------------ Palpa — Josefa Cortés ------------------ */
{
  src: "IMG/remote-originals/180_Palpa.jpg",
  orientation: "v",
  span: 1,
  tags: ["salud","servicio","investigación","producto"],
  title: "Palpa",
  author: "Josefa Cortés",
  role: "",
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
  src: "IMG/remote-originals/181_Harasic-Catalina-2.jpeg",
  orientation: "v",
  span: 1,
  tags: ["iluminación","industrial","espacio"],
  title: "El Delantal Vestido",
  author: "Catalina Harasic",
  role: "",
  collab: "Curaduría e investigación: Camila Ríos Erazo. Fotografía: Valentina Osnovikoff",
  area: "Iluminación / Industrial / Espacios",
  year: "2024",
  url: "https://www.linkedin.com/in/catalina-harasic-gil-9239a844/details/projects/?profileUrn=urn%3Ali%3Afsd_profile%3AACoAAAlm0SsBad8u2IpnSwXl7YUI3xvZq3sFM21"
},

/* ------------------ Zipi — Maximiliano Contreras ------------------ */
{
  src: "IMG/remote-originals/182_Contreras-Maximiliano-Captura-de-pantalla-2026-03-09-a-las-17.24.59.png",
  orientation: "v",
  span: 1,
  tags: ["producto","industrial"],
  title: "Zipi",
  author: "Maximiliano Contreras",
  role: "",
  collab: "",
  area: "Producto / Industrial",
  year: "2026",
  url: "https://www.instagram.com/zipi.cl/"
},
/* ------------------ Dulces Paula — Paulina Astudillo ------------------ */
{
  src: "IMG/remote-originals/183_Astudillo-Paulina-Captura-de-pantalla-2026-03-09-a-las-17.37.51.png",
  orientation: "v",
  span: 1,
  tags: ["branding","identidad visual","gráfico"],
  title: "Postres Paula",
  author: "Paulina Astudillo",
  role: "",
  collab: "Diseño gráfico: Paulina Astudillo y equipo Otros Pérez. Identidad desarrollada en Otros Pérez",
  area: "Branding / Identidad visual / Gráfico",
  year: "2026",
  url: "https://www.instagram.com/p/DU3QMA-kVtX/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
},

/* ------------------ Vestigios — Carolina Pacheco ------------------ */
{
  src: "IMG/remote-originals/184_pacheco-Carolina-16.jpg",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "Vestigios",
  author: "Carolina Pacheco",
  role: "",
  collab: "Idea original, investigación, dirección creativa y ejecución: Colectivo Ronda (Yael Berkowitz, Aníbal Fuentes, Natalia Cerda, Carolina Pacheco, Francisca Feijoo, Loreto Leiva). Fotografías: Benjamín Salazar",
  area: "Museografía / Exhibición / Investigación",
  year: "2022",
  url: "https://www.caropacheco.work/vestigios"
},

/* ------------------ El Delantal Vestido — Camila Ríos ------------------ */
{
  src: "IMG/remote-originals/185_Rios-camila-Captura-de-Pantalla-2024-11-27-a-las-14.46.28.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "El Delantal Vestido",
  author: "Camila Ríos",
  role: "",
  collab: "Curaduría: Camila Ríos Erazo. Diseño, investigación y desarrollo etapa Textiles domésticos: Camila Ríos Erazo y Loreto Casanueva Reyes",
  area: "Museografía / Exhibición / Investigación",
  year: "2024",
  url: ["https://camilarios.com/el-delantal-vestido","https://www.instagram.com/p/DB2ONWqujBV/?img_index=1"]
},

/* ------------------ Sonic Ecologies 2.0 — Joaquín Rosas ------------------ */
{
  src: "IMG/remote-originals/186_rosas-joaquin-1.png",
  orientation: "v",
  span: 1,
  tags: ["museografía","exhibición","investigación"],
  title: "Sonic Ecologies 2.0",
  author: "Joaquín Rosas",
  role: "",
  collab: "Moving Works + Low Studio. Universidad Adolfo Ibáñez (2023). Fotografías: Hurto Visual",
  area: "Museografía / Exhibición / Investigación",
  year: "2023",
  url: "https://joaquinrosas.com/SONIC-ECOLOGIES-EXHIBITION"
},

/* ------------------ Gubii Bags — Joaquín Rosas ------------------ */
{
  src: "IMG/remote-originals/187_ROSAS-JOAQUIN2-Gubbi-Sesion-Jun-7_1340_c.jpeg",
  orientation: "v",
  span: 1,
  tags: ["producto","packaging","textil"],
  title: "Gubii Bags",
  author: "Joaquín Rosas",
  role: "",
  collab: "Diseño de mochila infantil para la marca Gubii. Incluye: diseño de logo, identidad gráfica y sistema visual. Ilustraciones de animales chilenos",
  area: "Producto / Packaging / Textil",
  year: "2025",
  url: "https://joaquinrosas.com/GUBII-BAGS"
},

/* ------------------ Across Andes 2025 Volcano Edition — Joaquín Rosas ------------------ */
{
  src: "IMG/remote-originals/188_rosas-joaquin-MAPAAA-2025-Final_1340_c.jpeg",
  orientation: "v",
  span: 1,
  tags: ["ilustración","gráfico"],
  title: "Across Andes 2025 Volcano Edition",
  author: "Joaquín Rosas",
  role: "",
  collab: "",
  area: "Ilustración / Gráfico",
  year: "2025",
  url: "https://joaquinrosas.com/ACROSS-ANDES-MAP"
},

/* ------------------ Natural Killer — Leopoldo Herrera ------------------ */
{
  src: "IMG/remote-originals/189_herrera-leopoldo.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","juego de mesa"],
  title: "Natural Killer",
  author: "Leopoldo Herrera",
  role: "",
  collab: "Co-creador: Leopoldo Herrera",
  area: "Producto / Juego de mesa",
  year: "2024",
  url: "https://www.behance.net/gallery/210222175/Natural-Killer-Boardgame"
},

/* ------------------ Con Devuelta — Isabel Díaz-del Río ------------------ */
{
  src: "IMG/remote-originals/190_rios-isabel.jpg",
  orientation: "sq",
  span: 1,
  tags: ["servicio","social","ecología"],
  title: "Con Devuelta",
  author: "Isabel Díaz-del Río",
  role: "Diseñadora",
  collab: "",
  area: "Servicio / Social / Ecología",
  year: "2022",
  url: ["https://condevuelta.cl","https://www.elmostrador.cl/agenda-pais/agenda-innovacion/2023/08/31/con-devuelta-la-startup-que-busca-eliminar-el-packaging-desechable-en-los-locales-de-comida/"]
},

/* ------------------ Calcáreo — Carolina Pacheco ------------------ */
{
  src: "IMG/remote-originals/191_pacheco-carolina-2-2-5-lateral.jpg",
  orientation: "v",
  span: 1,
  tags: ["producto","biomaterial","investigación"],
  title: "Calcáreo",
  author: "Carolina Pacheco",
  role: "Diseñadora",
  collab: "Proyecto de título en Diseño UC. Profesores guía: Alejandro Durán, María José Besoaín, Aníbal Fuentes, Alejandro Weiss. Fotografías: Omar Faundez, Antonia Valencia, Carolina Pacheco",
  area: "Producto / Biomaterial / Investigación",
  year: "2019",
  url: "https://www.caropacheco.work/calcareo"
},

/* ------------------ AjuarParn — Camila Ríos ------------------ */
{
  src: "IMG/remote-originals/192_Rios-Camila-21949970_10155734500863430_4521371404219177019_o.jpg.jpg",
  orientation: "h",
  span: 2,
  tags: ["producto","packaging","textil"],
  title: "AjuarParn",
  author: "Camila Ríos",
  role: "",
  collab: "",
  area: "Producto / Packaging / Textil",
  year: "2017",
  url: "https://camilarios.com/parn"
},
/* ------------------ Guaico — Joaquín Gajardo ------------------ */
{
  src: "IMG/remote-originals/193_Gajardo-Joaquin-65f0f31b0ed2f6147a720a72_GUAICO-STUDIO-1.jpg",
  orientation: "h",
  span: 2,
  tags: ["desarrollo web","servicios","ecommerce"],
  title: "Guaico",
  author: "Joaquín Gajardo",
  role: "",
  collab: "Cliente: GUAICO. Trabajo realizado en Gaja Studio",
  area: "Desarrollo Web / Ecommerce",
  year: "2023",
  url: "https://www.gaja.studio/proyectos/proyecto-guaico"
},

/* ------------------ A Punto — María José Díaz ------------------ */
{
  src: "IMG/remote-originals/194_Captura-de-pantalla-2026-03-14-a-las-20.16.15.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual","dirección creativa"],
  title: "A Punto",
  author: "María José Díaz",
  role: "",
  collab: "Desarrollado en Blanca Estudio. Branding Manager: María José Díaz",
  area: "Identidad visual / Dirección creativa",
  year: "2017",
  url: "https://www.blancaestudio.com/apunto"
},

/* ------------------ VSPT — María José Díaz ------------------ */
{
  src: "IMG/remote-originals/195_Captura-de-pantalla-2026-03-14-a-las-19.39.31.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual","dirección creativa"],
  title: "VSPT",
  author: "María José Díaz",
  role: "",
  collab: "Desarrollado en Blanca Estudio. Branding Manager: María José Díaz",
  area: "Identidad visual / Dirección creativa",
  year: "2020",
  url: "https://www.blancaestudio.com/vspt"
},

/* ------------------ Resurgir: un poema a las raíces — Magdalena Sáez ------------------ */
{
  src: "IMG/remote-originals/196_Captura-de-pantalla-2026-03-14-a-las-20.15.40.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Magdalena Sáez",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — María Jesús Vallejos ------------------ */
{
  src: "IMG/remote-originals/197_Captura-de-pantalla-2026-03-14-a-las-20.15.27.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "María Jesús Vallejos",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — Sebastián Tala ------------------ */
{
  src: "IMG/remote-originals/198_Captura-de-pantalla-2026-03-14-a-las-20.15.33.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Sebastián Tala",
  role: "Director de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — Giuliana Mellafe ------------------ */
{
  src: "IMG/remote-originals/199_Captura-de-pantalla-2026-03-14-a-las-20.15.21.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Giuliana Mellafe",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Resurgir: un poema a las raíces — Josefina Véliz ------------------ */
{
  src: "IMG/remote-originals/200_Captura-de-pantalla-2026-03-14-a-las-20.15.47.png",
  orientation: "sq",
  span: 1,
  tags: ["dirección creativa","objeto","moda","fotografía"],
  title: "Resurgir: un poema a las raíces",
  author: "Josefina Véliz",
  role: "Directora de arte",
  collab: "Campaña colaborativa entre las marcas Exo y Adeu. Equipo creativo: Giuliana Mellafe, Magdalena Sáenz, Sebastián Tala, María Jesús Vallejos, Josefina Véliz",
  area: "Dirección creativa / Objeto / Moda / Fotografía",
  year: "2023",
  url: "https://www.behance.net/gallery/234618837/Resurgir"
},

/* ------------------ Bote de pesca — Alejandra Echeverría ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2842814634021795767848800826051/Alejandra-Echeverria.png",
  orientation: "sq",
  span: 1,
  tags: ["identidad visual"],
  title: "Bote de pesca",
  author: "Alejandra Echeverría",
  role: "Diseñadora",
  collab: "",
  area: "Identidad visual",
  year: "2021",
  url: "https://www.behance.net/gallery/201814673/BDPManual-de-Marca"
},

/* ------------------ Candelabro Lollapalooza 2026 — Carlos Nauto Paez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/K2842814634040242511922510377667/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.53.47.png",
  orientation: "h",
  span: 2,
  tags: ["vjing","visuales","música"],
  title: "Candelabro Lollapalooza 2026",
  author: "Carlos Nauto Paez",
  role: "Visualista / Diseñador",
  collab: "Diseño y operación de visuales para el show de @candelabro.candelabro en @lollapaloozacl.",
  area: "Vjing (visuales) / Música",
  year: "2026",
  url: "https://www.instagram.com/p/DV6uYi7Cek4/?img_index=8"
},

/* ------------------ Pedro Ruminot - Festival de Viña del Mar 2027 — Carlos Nauto Paez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/S2842814634077136000069929480899/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-12.58.03.png",
  orientation: "sq",
  span: 1,
  tags: ["vjing","visuales","música"],
  title: "Pedro Ruminot - Festival de Viña del Mar 2027",
  author: "Carlos Nauto Paez",
  role: "Visualista / Diseñador",
  collab: "Diseño de entorno 3D, visuales, operación de backup de visuales y asistencia en diseño para @pedroruminot en el @elfestivaldevina 2025.",
  area: "Vjing (visuales) / gráfico / Shows",
  year: "2025",
  url: "https://www.instagram.com/p/DGt_-6PuOwo/?img_index=1"
},

/* ------------------ Juan Pablo López - Festival de Viña del Mar 2026 — Carlos Nauto Paez ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2842814634058689255996219929283/Nauto-Carlos-Captura-de-pantalla-2026-03-16-a-las-13.00.33.png",
  orientation: "h",
  span: 1,
  tags: ["vjing","visuales","música"],
  title: "Juan Pablo López - Festival de Viña del Mar 2026",
  author: "Carlos Nauto Paez",
  role: "Visualista / Diseñador",
  collab: "Dirección creativa, visuales y operación de visuales junto a María José Tapia.",
  area: "Vjing (visuales) / gráfico / Shows",
  year: "2025",
  url: "https://www.instagram.com/p/DGouSMEu-Dc/?img_index=1"
},

/* ------------------ Palabras marchitas — Aribel González ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/F2842920037112566209814003659459/DSC_0095.jpg",
  orientation: "h",
  span: 1,
  tags: ["editorial"],
  title: "Palabras marchitas",
  author: "Aribel González",
  role: "Diseñadora",
  collab: "Poemas: Simón Pešutic. Proyecto desarrollado desde estudio Otros Pérez.",
  area: "Editorial",
  year: "2023",
  url: "https://ariariari.com/Palabras-Marchitas"
},

/* ------------------ Aguas Andinas — Aribel González ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2842920037075672721666584556227/portadillas-05.png",
  orientation: "h",
  span: 1,
  tags: ["infografía"],
  title: "Aguas Andinas",
  author: "Aribel González",
  role: "",
  collab: "Diseño de la memoria anual de Aguas Andinas 2017 y sus filiales. Diseño editorial, infografías e ilustraciones. Proyecto desarrollado desde estudio Otros Pérez.",
  area: "Infografía",
  year: "2018",
  url: "https://ariariari.com/Aguas-Andinas"
},

/* ------------------ INTRÉPIDA ATELIER — Hyemin An ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/M2842920037094119465740294107843/intrepida_1_c281191f-4945-4cb2-ba82-bd107a8b3f06.jpg",
  orientation: "h",
  span: 1,
  tags: ["producto","experiencia"],
  title: "INTRÉPIDA ATELIER",
  author: "Hyemin An",
  role: "Diseñadora / Fundadora",
  collab: "Intrépida Atelier",
  area: "Producto / Experiencia",
  year: "N/A",
  url: "https://intrepidaatelier.com"
},

/* ------------------ Movimiento, vida, huellas / Libro de Artista — Hyemin An ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/I2842920177953457212586430247619/Captura-de-pantalla-2026-03-16-a-las-13.41.00.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","objeto"],
  title: "Movimiento, vida, huellas / Libro de Artista",
  author: "Hyemin An",
  role: "Diseñadora",
  collab: "",
  area: "Editorial / Objeto",
  year: "2017",
  url: "https://www.behance.net/gallery/57938283/Movimiento-vida-huellas-Libro-de-Artista"
},

/* ------------------ Theragun PRO Plus - By Therabody — Nicolás Robertson ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2842920177971903956660139799235/Captura-de-pantalla-2026-03-16-a-las-13.51.39.png",
  orientation: "h",
  span: 1,
  tags: ["objeto","producto"],
  title: "Theragun PRO Plus - By Therabody",
  author: "Nicolás Robertson",
  role: "Diseñador",
  collab: "Agency: DNGR | @dngr.ltd. Addt'l CMF: Nicolás Robertson | @nicordf.",
  area: "Objeto / Producto",
  year: "2023",
  url: "https://www.behance.net/gallery/182010403/Theragun-PRO-Plus-By-Therabody"
},

/* ------------------ PHOTOVOLTAIC TRAINING BENCH — Nicolás Robertson ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Z2842921988630515255694888219331/banco-de-entrenamiento-1.jpg",
  orientation: "h",
  span: 1,
  tags: ["diseño conceptual"],
  title: "PHOTOVOLTAIC TRAINING BENCH",
  author: "Nicolás Robertson",
  role: "",
  collab: "Cliente: Phineal (in-house project). Servicio: Concept design, 3D modelling y DFM.",
  area: "Diseño conceptual",
  year: "2018",
  url: "https://nicolasrobertson.com/index.php/project/giz-pv-training-module/"
},

/* ------------------ Dominó — Shuting Zhong Xie ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2842920037057225977592875004611/Domino-2-1.jpg",
  orientation: "h",
  span: 1,
  tags: ["dirección de arte"],
  title: "Dominó",
  author: "Shuting Zhong Xie",
  role: "Diseñadora / Directora de arte",
  collab: "Desarrollado en Sabado Sabado Estudio.",
  area: "Dirección de arte",
  year: "2025",
  url: "https://sabadosabado.com/proyectos/domino/"
},

/* ------------------ Night - Cranberry Mag — Emiliana Montes ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/D2842924084069961564657694487235/IMG_1511_JPG.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["estilismo","moda"],
  title: "Night - Cranberry Mag",
  author: "Emiliana Montes",
  role: "Estilista de moda / Diseñadora",
  collab: "Cranberry Chic. Foto: @paolavelasquezdiaz. Asistencia foto: @pepo_fernandez. Styling: @saralavinh.",
  area: "Estilismo / Moda",
  year: "N/A",
  url: "https://www.emilianamontes.com/copia-de-rodrigo-2"
},

/* ------------------ Revista Ya - mariana di girolamo — Emiliana Montes ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2842924084088408308731404038851/RVYA001Y2002.jpg.jpg",
  orientation: "v",
  span: 1,
  tags: ["estilismo","moda"],
  title: "Revista Ya - mariana di girolamo",
  author: "Emiliana Montes",
  role: "Estilista de moda / Diseñadora",
  collab: "Revista YA. Foto: @sergio.a.lopez. Styling: @kemilyheart.hills. Asistencia styling: @venvusvenus.",
  area: "Estilismo / Moda",
  year: "2024",
  url: "https://www.emilianamontes.com/copia-de-rodrigo-1"
},

/* ------------------ CANTAR EL OLVIDO — Esteban Millar ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/N2842920177990350700733849350851/Captura-de-pantalla-2026-03-16-a-las-14.38.40.png",
  orientation: "h",
  span: 1,
  tags: ["cover art","dirección de arte","música"],
  title: "CANTAR EL OLVIDO",
  author: "Esteban Millar",
  role: "Diseñador",
  collab: "Diseño, diagramación y dirección de arte: Esteban Millar. Fotografía: Luis Vicente Fresno.",
  area: "Cover art / Dirección de arte / Música",
  year: "2021",
  url: "https://www.linkedin.com/posts/esteban-millar-k_portafolio-2026-brief-activity-7414781774389563392-b6-h?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
},

/* ------------------ EMPLEOS VERDES — Esteban Millar ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2842923341772980038585337459395/Captura-de-pantalla-2026-03-16-a-las-14.46.15.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","dirección creativa"],
  title: "EMPLEOS VERDES",
  author: "Esteban Millar",
  role: "Diseñador",
  collab: "Diseño, diagramación y dirección de arte: Esteban Millar, Joce Quezada. Diseño de información: Esteban Millar. Fotografía: Gregorio Valdés.",
  area: "Editorial / Dirección creativa",
  year: "2023",
  url: "https://www.linkedin.com/posts/esteban-millar-k_portafolio-2026-brief-activity-7414781774389563392-b6-h?utm_source=share&utm_medium=member_desktop&rcm=ACoAAENdsFEB8cHH4aAjoEic9bK9fxqH37Fjuro"
},

/* ------------------ Know Your Tools: Neuroscience and Service Design — Gaspar Jarry ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2843099405430519474241067758275/touchpoint.15-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Know Your Tools: Neuroscience and Service Design",
  author: "Gaspar Jarry",
  role: "",
  collab: "Autores: Paula Wuth, Gaspar Jarry, Catalina Meza, Andrés Couve.",
  area: "Investigación / Publicación académica",
  year: "2024",
  url: "https://www.logos-verlag.de/cgi-bin/engpapermid?doi=10.30819/touchpoint.15-2.10&lng=deu&id="
},

/* ------------------ Know Your Tools: Neuroscience and Service Design — Catalina Meza ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/U2843099405430519474241067758275/touchpoint.15-2.jpg",
  orientation: "v",
  span: 1,
  tags: ["investigación","publicación académica"],
  title: "Know Your Tools: Neuroscience and Service Design",
  author: "Catalina Meza",
  role: "",
  collab: "Autores: Paula Wuth, Gaspar Jarry, Catalina Meza, Andrés Couve.",
  area: "Investigación / Publicación académica",
  year: "2024",
  url: [
    "https://www.logos-verlag.de/cgi-bin/engpapermid?doi=10.30819/touchpoint.15-2.10&lng=deu&id=",
    "https://www.instagram.com/p/DASD2BmNpsw/?img_index=1"
  ]
},

/* ------------------ Ecualizando futuros — Gaspar Jarry ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/J2843099405412072730167358206659/1ecd9621-90b1-4c41-89cb-f876083d0e31_rw_1920.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio","cultura","investigación"],
  title: "Ecualizando futuros",
  author: "Gaspar Jarry",
  role: "",
  collab: "Guiatura: Manuela Garretón.",
  area: "Servicio / Cultura / Investigación",
  year: "2023",
  url: "https://gasparjarry.myportfolio.com/ecualizando-futuros"
},

/* ------------------ ¿Dónde viven tus monstruos? — Isidora Silva ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/W2843102067221902334234527740611/Captura-de-pantalla-2026-03-16-a-las-16.54.59.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","ilustración","infantil"],
  title: "¿Dónde viven tus monstruos?",
  author: "Isidora Silva",
  role: "",
  collab: "",
  area: "Editorial / Ilustración / Infantil",
  year: "2020",
  url: "https://www.behance.net/gallery/110237953/Donde-viven-tus-monstruos"
},

/* ------------------ La naturaleza de la tecnología — Isidora Silva ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/Q2843102067258795822381946843843/Captura-de-pantalla-2026-03-16-a-las-16.56.28.png",
  orientation: "h",
  span: 1,
  tags: ["editorial","experimental","digital"],
  title: "La naturaleza de la tecnología",
  author: "Isidora Silva",
  role: "",
  collab: "Por Isidora Silva y Antonia Van de Wyngard - 2021.",
  area: "Editorial / Experimental / Digital",
  year: "2021",
  url: "https://www.behance.net/gallery/168081973/La-naturaleza-de-la-tecnologia-Publicacion-Digital"
},

/* ------------------ Aurora Botánica — Javiera Palma ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/L2843099748337045060427922748099/IMG_5697.jpg.jpg",
  orientation: "h",
  span: 1,
  tags: ["ecología","producto","innovación"],
  title: "Aurora Botánica",
  author: "Javiera Palma",
  role: "Diseñadora / Fundadora",
  collab: "",
  area: "Ecología / Producto / Innovación",
  year: "2021",
  url: [
    "https://aurorabotanica.cl",
    "https://www.instagram.com/aurorabotanica.cl"
  ]
},

{
  src: "https://freight.cargo.site/t/original/i/F2843129278512147553184274395843/461857978_1514275622555722_4416919289787104457_n.jpg",
  orientation: "h",
  span: 1,
  tags: ["ecología","producto","innovación"],
  title: "Otros Pérez",
  author: "Catalina Pérez",
  role: "Diseñadora / Fundadora",
  collab: "",
  area: "Estudio / Branding",
  year: "N/A",
  url: [
    "http://otrosperez.com",
    "https://www.instagram.com/otrosperez/"
  ]
},

/* ------------------ Patitas Perdidas — Nicole Cavada ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/E2843102067240349078308237292227/Captura-de-pantalla-2026-03-16-a-las-17.05.28.png",
  orientation: "h",
  span: 1,
  tags: ["ux ui","app","servicio"],
  title: "Patitas Perdidas",
  author: "Nicole Cavada",
  role: "Diseñadora",
  collab: "",
  area: "UX UI / App / Servicio",
  year: "2024",
  url: "https://www.behance.net/gallery/189928253/Patitas-perdidas"
},

/* ------------------ Audio Rutas de Barrio — Paz Osorio Schmied ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/O2843099405393625986093648655043/Mesa-de-trabajo-6-3-1024x1024-1.png",
  orientation: "sq",
  span: 1,
  tags: ["innovación","cultura","servicio"],
  title: "Audio Rutas de Barrio",
  author: "Paz Osorio Schmied",
  role: "Diseñadora / Directora de diseño",
  collab: "Idea y gestión: Marchantes. Cofinanciamiento: Fondart Regional 2022 (MINCAP).",
  area: "Innovación / Cultura / Servicio",
  year: "2022",
  url: [
    "https://marchantes.cl/audiorutas/",
    "https://www.instagram.com/Marchantes.cl"
  ]
},

/* ------------------ Viajes Lectores — Francisca Torres ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/G2843101258535088886881494446787/close-up-colorful-books-pile-1200x900.jpg",
  orientation: "h",
  span: 1,
  tags: ["educación","servicio","cultura"],
  title: "Viajes Lectores",
  author: "Francisca Torres",
  role: "",
  collab: "",
  area: "Educación / Servicio / Cultura",
  year: "2023",
  url: "https://www.instagram.com/viajeslectores?igsh=MnNvNzR1aDNxdXNj"
},

/* ------------------ Redes sociales: NewFuture — Victoria Garcia ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/T2843099405356732497946229551811/e2ad85a3-cea4-4cbd-9ec2-40b793c45789_rw_3840.png",
  orientation: "h",
  span: 1,
  tags: ["rrss","identidad visual"],
  title: "Redes sociales: NewFuture",
  author: "Victoria Garcia",
  role: "",
  collab: "Entidad de desarrollo: NewFuture. Equipo: Paula Wuth, Victoria García. Año: 2022-2025.",
  area: "RRSS / Identidad visual",
  year: "2022",
  url: "https://victoriagarciast.myportfolio.com/redes-sociales-newfuture"
},

/* ------------------ Escuela sin Fronteras — Catalina Hepp ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/B2843099405375179242019939103427/DSCF1870-scaled.jpg",
  orientation: "h",
  span: 1,
  tags: ["servicio","innovación","educación"],
  title: "Escuela sin Fronteras",
  author: "Catalina Hepp",
  role: "",
  collab: "Service Design Award 2020/21 Winner. Best Student Project.",
  area: "Servicio / Innovación / Educación",
  year: "2020",
  url: "https://www.service-design-network.org/community-knowledge/escuela-sin-fronteras"
},

/* ------------------ Viajes Lectores — Victoria Garcia ------------------ */
{
  src: "https://freight.cargo.site/t/original/i/R2843099405338285753872520000195/376d35fd-1f19-4e45-8588-b6a9872068da_rw_3840.png",
  orientation: "h",
  span: 1,
  tags: ["identidad visual","ilustración","educación"],
  title: "Viajes Lectores",
  author: "Victoria Garcia",
  role: "",
  collab: "Entidad de desarrollo: NewFuture. Financiamiento: Proyecto financiado por Innova FOSIS. Equipo: Catalina Hepp, Camila Silva, Maili Ow, Joaquín Rosas, Natalia Hevia, Victoria García, Mariana Zeballos, Trinidad Borghero, Tomás Sanchez.",
  area: "Identidad visual / Ilustración / Educación",
  year: "2023",
  url: "https://victoriagarciast.myportfolio.com/viajes-lectores"
},

    /* ------------------ Campaña día del niño — Francisca Torres ------------------ */
    {
      id: "campana-dia-del-nino",
      title: "Campaña día del niño",
      author: "Francisca Torres",
      role: "",
      collab: "Entrekids.cl",
      area: "Branding / Identidad visual",
      year: 2022,
      tags: ["branding", "identidad visual", "gráfico"],
      src: "IMG/remote-originals/201_Francisca-Torres-Captura-de-pantalla-2026-01-02-a-las-14.35.51.png",
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
  let activeView = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches ? 'grid' : 'bento';
  let masonryRaf = null;
  let listSortKey = '';
  let listSortDir = 1;
  let gridRenderToken = 0;
  let filterDebounceTimer = null;
  const FILTER_DEBOUNCE_MS = 220;
  let fillAroundRaf = null;
  let fillAroundLiteTimer = null;
  let fillAroundSettleTimer = null;
  let interactionSettleTimer = null;
  let lastInteractionTs = 0;
  let fillAroundNeedsFullPass = false;
  let isInteractionActive = false;
  let lastLiteFillCamX = 0;
  let lastLiteFillCamY = 0;
  const BENTO_PREFETCH_X = 1.35;
  const BENTO_PREFETCH_Y = 1.35;
  const BENTO_PREFETCH_MIN_X = 1.06;
  const BENTO_PREFETCH_MIN_Y = 1.06;
  const BENTO_LITE_PREFETCH_MIN_X = 1.0;
  const BENTO_LITE_PREFETCH_MIN_Y = 1.0;
  const BENTO_CULL_MARGIN = 2600;
  const BENTO_MAX_ITEMS_IN_DOM = 700;
  const BENTO_MAX_NEW_PER_PASS = 160;
  const BENTO_MAX_NEW_PER_PASS_MIN = 72;
  const BENTO_MAX_NEW_PER_PASS_LITE = 44;
  const BENTO_MAX_NEW_PER_PASS_LITE_MIN = 14;
  const BENTO_LITE_FILL_INTERVAL_MS = 130;
  const BENTO_SETTLE_FULL_DELAY_MS = 160;
  const BENTO_INTERACTION_SETTLE_MS = 120;
  const BENTO_LITE_MIN_MOVE_SCREEN = 30;
  const BENTO_LITE_MIN_MOVE_SCREEN_SQ = BENTO_LITE_MIN_MOVE_SCREEN * BENTO_LITE_MIN_MOVE_SCREEN;
  const SIMPLE_CARD_COUNT = 3;
  const nextMeta = ()=> activeList.length ? activeList[(genPtr++) % activeList.length] : null;
  const ORIENTATION_RATIO = { h: 4 / 3, v: 3 / 4, sq: 1 };
  const ORIENTATION_ASPECT_CSS = { h: '4 / 3', v: '3 / 4', sq: '1 / 1' };
  const normalizeOrientation = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'v' || raw === 'sq' || raw === 'h') return raw;
    return 'h';
  };
  const getOrientationFromDimensions = (width, height) => {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return "";
    const ratio = width / height;
    if (Math.abs(ratio - 1) <= 0.08) return 'sq';
    return ratio > 1 ? 'h' : 'v';
  };
  const getOrientationFromElement = (el) => {
    if (!el || !el.classList) return "";
    if (el.classList.contains('ratio-sq') || el.classList.contains('is-sq')) return 'sq';
    if (el.classList.contains('ratio-v') || el.classList.contains('is-v')) return 'v';
    if (el.classList.contains('ratio-h') || el.classList.contains('is-h')) return 'h';
    return "";
  };
  let transformRaf = null;
  const requestTransform = () => {
    if (transformRaf !== null) return;
    transformRaf = requestAnimationFrame(() => {
      transformRaf = null;
      applyTransform();
    });
  };
  const updateZoomButtons = () => {
    if (btnZoomOut) btnZoomOut.disabled = camScale <= CAM_SCALE_MIN + 0.001;
    if (btnZoomIn) btnZoomIn.disabled = camScale >= CAM_SCALE_MAX - 0.001;
  };
  const getZoomProgress = () => {
    if (CAM_SCALE_MAX === CAM_SCALE_MIN) return 1;
    const t = (camScale - CAM_SCALE_MIN) / (CAM_SCALE_MAX - CAM_SCALE_MIN);
    return Math.max(0, Math.min(1, t));
  };
  const getDynamicPrefetch = (lite = false) => {
    const t = getZoomProgress();
    const baseX = lite ? BENTO_LITE_PREFETCH_MIN_X : BENTO_PREFETCH_MIN_X;
    const baseY = lite ? BENTO_LITE_PREFETCH_MIN_Y : BENTO_PREFETCH_MIN_Y;
    return {
      x: baseX + ((BENTO_PREFETCH_X - baseX) * t),
      y: baseY + ((BENTO_PREFETCH_Y - baseY) * t)
    };
  };
  const getDynamicMaxNewPerPass = (lite = false) => {
    const t = getZoomProgress();
    if (lite) {
      return Math.round(BENTO_MAX_NEW_PER_PASS_LITE_MIN + ((BENTO_MAX_NEW_PER_PASS_LITE - BENTO_MAX_NEW_PER_PASS_LITE_MIN) * t));
    }
    return Math.round(BENTO_MAX_NEW_PER_PASS_MIN + ((BENTO_MAX_NEW_PER_PASS - BENTO_MAX_NEW_PER_PASS_MIN) * t));
  };
  const zoomTo = (targetScale, clientX, clientY, useLiteFill = false) => {
    const nextScale = clampCamScale(targetScale);
    if (Math.abs(nextScale - camScale) < 0.0001) {
      updateZoomButtons();
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const focusX = Number.isFinite(clientX) ? (clientX - rect.left) : (viewport.clientWidth * 0.5);
    const focusY = Number.isFinite(clientY) ? (clientY - rect.top) : (viewport.clientHeight * 0.5);
    const worldX = (focusX - camX) / camScale;
    const worldY = (focusY - camY) / camScale;
    camScale = nextScale;
    camX = focusX - (worldX * camScale);
    camY = focusY - (worldY * camScale);
    requestTransform();
    if (useLiteFill) requestFillAroundLiteIfNeeded(true);
    else requestFillAround(false);
    updateZoomButtons();
  };
  const zoomBy = (deltaScale, useLiteFill = true) => {
    zoomTo(camScale + deltaScale, undefined, undefined, useLiteFill);
  };

  /* Crear tarjeta */
  let globalId = 0;
  function makeCard(i, dir, meta){
    if(!meta) return;
    const orient = normalizeOrientation(meta.orientation);
    const span2  = meta.span===2;
    const tags   = (meta.tags||[]);

    const w = span2 ? (COL_W*2+GAP) : COL_W;
    const ratio = ORIENTATION_RATIO[orient];
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
    el._y = y;
    el._h = h;
    el.dataset.id      = meta.id ?? globalId;
    el.dataset.tags    = tags.join(' | ');
    el.dataset.title   = meta.title || '—';
    el.dataset.author  = meta._displayAuthor || meta.author || '—';
    el.dataset.role    = meta._displayRole || 'Diseñador/a';
    el.dataset.area    = meta.area || '—';
    el.dataset.year    = meta.year || '—';
    el.dataset.url     = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
    el.dataset.collab  = meta._displayCredits || meta.collab || '';
    el.dataset.credits = meta._displayCredits || meta.collab || '';
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
    const orient = normalizeOrientation(meta.orientation);
    const isFeatured = meta.span === 2;
    el.className = `${className} is-${orient} ${isFeatured ? 'is-featured' : ''}`;
    el.dataset.tags   = (meta.tags || []).join(' | ');
    el.dataset.title  = meta.title || '—';
    el.dataset.author = meta._displayAuthor || meta.author || '—';
    el.dataset.role   = meta._displayRole || 'Diseñador/a';
    el.dataset.area   = meta.area || '—';
    el.dataset.year   = meta.year || '—';
    el.dataset.url    = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
    el.dataset.collab = meta._displayCredits || meta.collab || '';
    el.dataset.credits = meta._displayCredits || meta.collab || '';
    el._meta = meta;

    const body = document.createElement('div');
    body.className = 'ref2d__view-card-body';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'ref2d__view-card-figure';
    imgWrap.style.aspectRatio = ORIENTATION_ASPECT_CSS[orient];
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
    author.className = 'ref2d__view-card-author';
    author.textContent = meta._displayAuthor || meta.author || '—';
    const role = document.createElement('p');
    role.className = 'ref2d__view-card-role';
    role.textContent = `Rol: ${meta._displayRole || 'Diseñador/a'}`;
    head.appendChild(title);
    head.appendChild(author);
    head.appendChild(role);
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

    const BATCH_SIZE = 28;
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

    const valueA = listSortKey === 'author' ? (a._displayAuthor || a.author) : a.title;
    const valueB = listSortKey === 'author' ? (b._displayAuthor || b.author) : b.title;
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
      indexBody.innerHTML = '<tr><td colspan="6" class="ref2d__index-empty">Sin resultados para esta búsqueda.</td></tr>';
      return;
    }

    const list = getSortedIndexList();
    const frag = document.createDocumentFragment();
    list.forEach((meta) => {
      const tr = document.createElement('tr');
      const firstUrl = Array.isArray(meta.url) ? meta.url[0] : (meta.url || '');
      tr.innerHTML = `
        <td>${meta.title || '—'}</td>
        <td>${meta._displayAuthor || meta.author || '—'}</td>
        <td>${meta._displayRole || 'Diseñador/a'}</td>
        <td>${meta.area || '—'}</td>
        <td>${meta.year || '—'}</td>
        <td>${firstUrl ? `<a href="${firstUrl}" target="_blank" rel="noopener">↗</a>` : '—'}</td>
      `;
      tr.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const ghost = document.createElement('div');
        ghost.dataset.tags = (meta.tags || []).join(' | ');
        ghost.dataset.title = meta.title || '—';
        ghost.dataset.author = meta._displayAuthor || meta.author || '—';
        ghost.dataset.role = meta._displayRole || 'Diseñador/a';
        ghost.dataset.area = meta.area || '—';
        ghost.dataset.year = meta.year || '—';
        ghost.dataset.url = firstUrl;
        ghost.dataset.collab = meta._displayCredits || meta.collab || '';
        ghost.dataset.credits = meta._displayCredits || meta.collab || '';
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
    renderIndexListView();
    updateCount();
  }

  function setView(view) {
    if (filterDebounceTimer !== null) {
      clearTimeout(filterDebounceTimer);
      filterDebounceTimer = null;
    }
    view = sanitizeViewForViewport(view);
    const viewMap = {
      bento: 'Vista: Infinita',
      grid: 'Vista: Grilla',
      index: 'Vista: Lista'
    };
    activeView = viewMap[view] ? view : 'bento';

    const isBento = activeView === 'bento';
    const isGrid = activeView === 'grid';
    const isIndex = activeView === 'index';

    if (viewToggle) viewToggle.textContent = viewMap[activeView];
    if (viewport) viewport.hidden = !isBento;
    if (multiGrid) multiGrid.hidden = !isGrid;
    if (indexList) indexList.hidden = !isIndex;
    if (simpleView) simpleView.hidden = true;
    if (bentoControls) bentoControls.hidden = !isBento;
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
    if (btnSimpleRefresh) btnSimpleRefresh.hidden = true;
    updateZoomButtons();
    if (isBento) refreshViewportSize();
    if (!isBento && plane) {
      plane.classList.remove('is-lod-far', 'is-lod-mid', 'is-lod-near');
      currentLodMode = '';
      setInteractionActive(false);
      if (interactionSettleTimer !== null) {
        clearTimeout(interactionSettleTimer);
        interactionSettleTimer = null;
      }
    }

    renderActiveView();
  }

  function getViewportBounds() {
    const scale = camScale || 1;
    const screenW = viewportWidth;
    const screenH = viewportHeight;
    const vw = screenW / scale;
    const vh = screenH / scale;
    const top = (-camY) / scale;
    const bottom = top + vh;
    const left = (-camX) / scale;
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
    const dynamicMaxItemsInDom = Math.round(420 + (280 * getZoomProgress()));
    let removed = 0;
    const aggressive = total > dynamicMaxItemsInDom;
    const removeLimit = aggressive ? 120 : 50;

    for (let idx = children.length - 1; idx >= 0; idx--) {
      const el = children[idx];
      const y = Number.isFinite(el._y) ? el._y : parseFloat(el.dataset.y || '');
      const h = Number.isFinite(el._h) ? el._h : parseFloat(el.dataset.h || '');
      if (!Number.isFinite(y) || !Number.isFinite(h)) continue;
      if (!Number.isFinite(el._y)) el._y = y;
      if (!Number.isFinite(el._h)) el._h = h;
      const isOut = (y + h) < minVisible || y > maxVisible;
      if (!isOut) continue;
      el.remove();
      removed++;
      if (removed >= removeLimit) break;
    }
  }

  /* Relleno alrededor de la vista */
  function fillAround(lite = false){
    if(activeList.length===0) return;
    const { vw, vh, top, left, right } = getViewportBounds();
    const prefetch = getDynamicPrefetch(lite);
    const maxNewPerPass = getDynamicMaxNewPerPass(lite);
    const leftBound = left - vw * (prefetch.x - 1);
    const rightBound = right + vw * (prefetch.x - 1);
    const topV  = top - vh * (prefetch.y - 1);
    const bottom = top + vh * prefetch.y;
    const startIdx = Math.floor((leftBound)  / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((rightBound) / (COL_W+GAP)) + 2;
    let created = 0;

    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < bottom){
        makeCard(i,'down', nextMeta());
        created++;
        if(col.yDown > yBotLimit-(COL_W*2)) yBotLimit += 1500;
        if (created >= maxNewPerPass) {
          if (!lite) cullFarItems();
          if (lite) requestFillAroundLite();
          else requestFillAround();
          return;
        }
      }
      while(col.yUp > topV){
        makeCard(i,'up',   nextMeta());
        created++;
        if(col.yUp   < yTopLimit+(COL_W*2)) yTopLimit -= 1500;
        if (created >= maxNewPerPass) {
          if (!lite) cullFarItems();
          if (lite) requestFillAroundLite();
          else requestFillAround();
          return;
        }
      }
    }
    if (!lite) cullFarItems();
  }

  function requestFillAround(lite = false) {
    if (!lite && fillAroundLiteTimer !== null) {
      clearTimeout(fillAroundLiteTimer);
      fillAroundLiteTimer = null;
    }
    if (!lite && fillAroundSettleTimer !== null) {
      clearTimeout(fillAroundSettleTimer);
      fillAroundSettleTimer = null;
    }
    if (fillAroundRaf !== null) {
      if (!lite) fillAroundNeedsFullPass = true;
      return;
    }
    fillAroundRaf = requestAnimationFrame(() => {
      fillAroundRaf = null;
      fillAround(lite);
      if (!lite) {
        lastLiteFillCamX = camX;
        lastLiteFillCamY = camY;
      }
      if (fillAroundNeedsFullPass) {
        fillAroundNeedsFullPass = false;
        requestFillAround(false);
      }
    });
  }

  function queueFullFillAfterInteraction() {
    if (fillAroundSettleTimer !== null) {
      clearTimeout(fillAroundSettleTimer);
    }
    fillAroundSettleTimer = setTimeout(() => {
      fillAroundSettleTimer = null;
      requestFillAround(false);
    }, BENTO_SETTLE_FULL_DELAY_MS);
  }

  function requestFillAroundLiteIfNeeded(force = false, scheduleSettle = true) {
    if (force) {
      lastLiteFillCamX = camX;
      lastLiteFillCamY = camY;
      requestFillAroundLite();
      if (scheduleSettle && !isInteractionActive) queueFullFillAfterInteraction();
      return;
    }
    const dx = camX - lastLiteFillCamX;
    const dy = camY - lastLiteFillCamY;
    if ((dx * dx) + (dy * dy) >= BENTO_LITE_MIN_MOVE_SCREEN_SQ) {
      lastLiteFillCamX = camX;
      lastLiteFillCamY = camY;
      requestFillAroundLite();
    }
    if (scheduleSettle && !isInteractionActive) queueFullFillAfterInteraction();
  }

  function requestFillAroundLite() {
    if (fillAroundNeedsFullPass || fillAroundLiteTimer !== null || fillAroundRaf !== null) return;
    fillAroundLiteTimer = setTimeout(() => {
      fillAroundLiteTimer = null;
      requestFillAround(true);
    }, BENTO_LITE_FILL_INTERVAL_MS);
  }

  /* Reset/reordenar mundo */
  function resetWorld(){
    if (fillAroundRaf !== null) {
      cancelAnimationFrame(fillAroundRaf);
      fillAroundRaf = null;
    }
    if (fillAroundLiteTimer !== null) {
      clearTimeout(fillAroundLiteTimer);
      fillAroundLiteTimer = null;
    }
    if (fillAroundSettleTimer !== null) {
      clearTimeout(fillAroundSettleTimer);
      fillAroundSettleTimer = null;
    }
    if (interactionSettleTimer !== null) {
      clearTimeout(interactionSettleTimer);
      interactionSettleTimer = null;
    }
    fillAroundNeedsFullPass = false;
    setInteractionActive(false);
    resetPlaneLimits();
    plane.innerHTML = "";
    columns.clear();
    globalId = 0;
    genPtr = 0;
    applyTransform();
    lastLiteFillCamX = camX;
    lastLiteFillCamY = camY;
    if (activeList.length === 0) {
      updateCount();
      return;
    }
    const scale = camScale || 1;
    const vw = viewportWidth / scale;
    const vh = viewportHeight / scale;
    const startIdx = Math.floor((-vw*0.5) / (COL_W+GAP)) - 2;
    const endIdx   = Math.floor((vw*1.5) / (COL_W+GAP)) + 2;
    for(let i=startIdx; i<=endIdx; i++){
      const col = ensureColumn(i);
      while(col.yDown < vh*0.7) makeCard(i,'down', nextMeta());
      while(col.yUp   > -vh*0.7) makeCard(i,'up',   nextMeta());
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
  const CARD_CONTEXT_BLOCK_SELECTOR = '.ref2d__item, .ref2d__view-card, .ref2d__simple-card';
  
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
    scheduleInteractionSettle();
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
      requestTransform();
      requestFillAroundLiteIfNeeded(false, false);
      scheduleInteractionSettle();
      
      lastX = currentX;
      lastY = currentY;
      
      if (e.cancelable) e.preventDefault();
    }
  }
  
  // Handler de pointerup
  function onPointerUp(e){
    if (activeView !== 'bento') return;
    if(activePid === null || e.pointerId !== activePid) return;
    const hadDrag = isDragging;
    
    // Si hubo drag, suprimir clicks por un tiempo
    if(isDragging){
      suppressClickUntil = performance.now() + 200;
    }
    
    resetPointerState();
    if (hadDrag) {
      scheduleInteractionSettle();
    } else {
      setInteractionActive(false);
    }
  }
  
  // Handler de pointercancel
  function onPointerCancel(e){
    if (activeView !== 'bento') return;
    if(activePid === null || e.pointerId !== activePid) return;
    resetPointerState();
    scheduleInteractionSettle();
  }
  
  // Agregar listeners normales
  viewport.addEventListener('pointerdown', onPointerDown, { passive: false });
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', onPointerCancel, { passive: false });
  
  // Bloqueo de click derecho / arrastre en imágenes de tarjetas (infinita, grilla, simple)
  document.addEventListener('contextmenu', (e) => {
    if (e.target && e.target.closest(CARD_CONTEXT_BLOCK_SELECTOR)) {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.closest(CARD_CONTEXT_BLOCK_SELECTOR)) {
      e.preventDefault();
    }
  });
  
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
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      zoomTo(camScale * zoomFactor, e.clientX, e.clientY, true);
      scheduleInteractionSettle();
      return;
    }
    camX -= e.deltaX; camY -= e.deltaY;
    requestTransform();
    requestFillAroundLiteIfNeeded(false, true);
    scheduleInteractionSettle();
  },{passive:false});
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', ()=>{
      if (activeView !== 'bento') return;
      zoomBy(-CAM_SCALE_STEP, true);
    });
  }
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', ()=>{
      if (activeView !== 'bento') return;
      zoomBy(CAM_SCALE_STEP, true);
    });
  }
  if (btnCenter) {
    btnCenter.addEventListener('click', ()=>{
      if (activeView !== 'bento') return;
      camX=camY=0;
      camScale = CAM_SCALE_MAX;
      applyTransform();
      setInteractionActive(false);
      if (interactionSettleTimer !== null) {
        clearTimeout(interactionSettleTimer);
        interactionSettleTimer = null;
      }
      updateZoomButtons();
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

  function formatCreditsText(raw) {
    const lines = splitCreditSegments(raw);
    return lines.length ? lines.join("\n") : "—";
  }

  function closeRequestPanel() {
    isRequestSending = false;
    activeRequestType = "";
    if (sheetRequestPanel) sheetRequestPanel.hidden = true;
    if (sheetRequestEmail) sheetRequestEmail.value = "";
    if (sheetRequestMessage) sheetRequestMessage.value = "";
    if (sheetRequestStatus) {
      sheetRequestStatus.hidden = true;
      sheetRequestStatus.classList.remove('is-error');
      sheetRequestStatus.classList.remove('is-loading');
      sheetRequestStatus.textContent = "";
    }
    if (sheetRequestSend) {
      sheetRequestSend.disabled = false;
      sheetRequestSend.textContent = "Enviar solicitud";
    }
    if (sheetRequestCancel) sheetRequestCancel.disabled = false;
    if (sheetRequestClose) sheetRequestClose.disabled = false;
    if (sheetRequestEmail) sheetRequestEmail.disabled = false;
    if (sheetRequestMessage) sheetRequestMessage.disabled = false;
  }

  function buildRequestBaseText(typeKey) {
    const cfg = REQUEST_TYPES[typeKey] || REQUEST_TYPES.modify;
    const meta = activeSpotlightMeta || {};
    const urls = Array.isArray(meta.urls) ? meta.urls.filter(Boolean) : [];
    const firstUrl = urls[0] || meta.url || "";
    const base = [
      `[Tipo] ${cfg.title}`,
      `[Proyecto] ${meta.title || "—"}`,
      `[Autor] ${meta.author || "—"}`,
      `[Año] ${meta.year || "—"}`,
      `[Área] ${meta.area || "—"}`,
      `[Link actual] ${firstUrl || "Sin link"}`,
      "",
      `${cfg.prompt}`,
      ""
    ];
    return base.join("\n");
  }

  function openRequestPanel(typeKey) {
    const cfg = REQUEST_TYPES[typeKey];
    if (!cfg || !sheetRequestPanel || !sheetRequestMessage) return;
    activeRequestType = typeKey;
    if (sheetRequestTitle) sheetRequestTitle.textContent = cfg.title;
    sheetRequestMessage.value = buildRequestBaseText(typeKey);
    if (sheetRequestEmail) sheetRequestEmail.required = true;
    if (sheetRequestStatus) {
      sheetRequestStatus.hidden = true;
      sheetRequestStatus.classList.remove('is-error');
      sheetRequestStatus.classList.remove('is-loading');
      sheetRequestStatus.textContent = "";
    }
    sheetRequestPanel.hidden = false;
    requestAnimationFrame(() => sheetRequestMessage.focus());
  }

  function sendRequestEmail() {
    if (isRequestSending) return;
    if (!activeRequestType || !sheetRequestMessage) return;
    const cfg = REQUEST_TYPES[activeRequestType] || REQUEST_TYPES.modify;
    const meta = activeSpotlightMeta || {};
    const requesterEmail = (sheetRequestEmail && sheetRequestEmail.value.trim()) ? sheetRequestEmail.value.trim() : "";
    if (!requesterEmail) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "Ingresa tu correo para enviar la solicitud.";
      }
      if (sheetRequestEmail) sheetRequestEmail.focus();
      return;
    }
    if (sheetRequestEmail && !sheetRequestEmail.checkValidity()) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "Revisa el formato del correo.";
      }
      sheetRequestEmail.reportValidity();
      return;
    }
    const message = (sheetRequestMessage.value || "").trim();
    if (!message) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "Agrega un detalle antes de enviar.";
      }
      return;
    }

    const urls = Array.isArray(meta.urls) ? meta.urls.filter(Boolean) : [];
    const firstUrl = urls[0] || meta.url || "";
    const ticket = {
      id: `rq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      type: activeRequestType,
      typeLabel: cfg.title,
      projectTitle: meta.title || "Proyecto sin título",
      projectAuthor: meta.author || "—",
      projectYear: meta.year || "—",
      projectArea: meta.area || "—",
      projectUrl: firstUrl || "",
      requesterEmail,
      message,
      status: "open"
    };

    let savedOk = false;
    try {
      const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const nextList = Array.isArray(list) ? list : [];
      nextList.unshift(ticket);
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(nextList.slice(0, 2000)));
      savedOk = true;
    } catch (_) {
      savedOk = false;
    }

    if (!savedOk) {
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.textContent = "No se pudo guardar la solicitud. Intenta nuevamente.";
      }
      return;
    }

    const onSuccess = (msg) => {
      isRequestSending = false;
      if (sheetRequestSend) {
        sheetRequestSend.disabled = false;
        sheetRequestSend.textContent = "Enviar solicitud";
      }
      if (sheetRequestCancel) sheetRequestCancel.disabled = false;
      if (sheetRequestClose) sheetRequestClose.disabled = false;
      if (sheetRequestEmail) sheetRequestEmail.disabled = false;
      if (sheetRequestMessage) sheetRequestMessage.disabled = false;
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.remove('is-error');
        sheetRequestStatus.classList.remove('is-loading');
        sheetRequestStatus.textContent = msg;
      }
      if (sheetRequestMessage) {
        sheetRequestMessage.value = "";
      }
    };
    const onError = (msg) => {
      isRequestSending = false;
      if (sheetRequestSend) {
        sheetRequestSend.disabled = false;
        sheetRequestSend.textContent = "Enviar solicitud";
      }
      if (sheetRequestCancel) sheetRequestCancel.disabled = false;
      if (sheetRequestClose) sheetRequestClose.disabled = false;
      if (sheetRequestEmail) sheetRequestEmail.disabled = false;
      if (sheetRequestMessage) sheetRequestMessage.disabled = false;
      if (sheetRequestStatus) {
        sheetRequestStatus.hidden = false;
        sheetRequestStatus.classList.add('is-error');
        sheetRequestStatus.classList.remove('is-loading');
        sheetRequestStatus.textContent = msg;
      }
    };

    isRequestSending = true;
    if (sheetRequestSend) {
      sheetRequestSend.disabled = true;
      sheetRequestSend.textContent = "Enviando...";
    }
    if (sheetRequestCancel) sheetRequestCancel.disabled = true;
    if (sheetRequestClose) sheetRequestClose.disabled = true;
    if (sheetRequestEmail) sheetRequestEmail.disabled = true;
    if (sheetRequestMessage) sheetRequestMessage.disabled = true;
    if (sheetRequestStatus) {
      sheetRequestStatus.hidden = false;
      sheetRequestStatus.classList.remove('is-error');
      sheetRequestStatus.classList.add('is-loading');
      sheetRequestStatus.textContent = "Enviando solicitud";
    }

    const sendEmailFallback = () => {
      const formData = new URLSearchParams();
      formData.set("_subject", `[Referencioteca] ${cfg.title}: ${ticket.projectTitle}`);
      formData.set("_captcha", "false");
      formData.set("_template", "table");
      formData.set("Tipo", ticket.typeLabel || ticket.type || "Solicitud");
      formData.set("Proyecto", ticket.projectTitle || "—");
      formData.set("Autor", ticket.projectAuthor || "—");
      formData.set("Año", ticket.projectYear || "—");
      formData.set("Área", ticket.projectArea || "—");
      formData.set("Link", ticket.projectUrl || "—");
      formData.set("Email solicitante", ticket.requesterEmail || "—");
      formData.set("Detalle", ticket.message || "");
      formData.set("ID Solicitud", ticket.id || "");
      formData.set("Fecha", ticket.createdAt || "");

      return fetch(REQUEST_EMAIL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: formData.toString()
      });
    };

    const sendCentral = () => {
      if (!REQUESTS_API_URL) return Promise.resolve({ skipped: true });
      const payload = new URLSearchParams();
      payload.set("mode", "create");
      payload.set("apiKey", REQUESTS_API_KEY || "");
      payload.set("id", ticket.id || "");
      payload.set("createdAt", ticket.createdAt || "");
      payload.set("type", ticket.type || "");
      payload.set("typeLabel", ticket.typeLabel || "");
      payload.set("projectTitle", ticket.projectTitle || "");
      payload.set("projectAuthor", ticket.projectAuthor || "");
      payload.set("projectYear", String(ticket.projectYear || ""));
      payload.set("projectArea", ticket.projectArea || "");
      payload.set("projectUrl", ticket.projectUrl || "");
      payload.set("requesterEmail", ticket.requesterEmail || "");
      payload.set("message", ticket.message || "");
      payload.set("status", ticket.status || "open");

      return fetch(REQUESTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "Accept": "application/json"
        },
        body: payload.toString()
      }).then((res) => {
        if (!res.ok) throw new Error("central_send_failed");
        return res.json().catch(() => ({}));
      });
    };

    sendCentral()
      .then((data) => {
        if (data && data.skipped) {
          return sendEmailFallback().then((res) => {
            if (!res.ok) throw new Error("request_email_failed");
            onSuccess("Solicitud enviada correctamente al correo de Referencioteca.");
          });
        }
        onSuccess("Solicitud enviada correctamente al panel de solicitudes.");
      })
      .catch(() => sendEmailFallback().then((res) => {
        if (!res.ok) throw new Error("request_email_failed");
        onSuccess("Solicitud enviada al correo (falló panel central).");
      }).catch(() => {
        onError("Se guardó localmente, pero falló el envío.");
      }));
  }

  function openSpotlight(el){
    resetPointerState(); // por si quedó un drag “medio”
    const meta = el._meta || {};
    activeSpotlightMeta = {
      title: el.dataset.title || meta.title || "—",
      author: el.dataset.author || meta._displayAuthor || meta.author || "—",
      year: el.dataset.year || meta.year || "—",
      area: el.dataset.area || meta.area || "—",
      url: meta.url || el.dataset.url || "",
      urls: Array.isArray(meta.url) ? meta.url.slice() : [meta.url || el.dataset.url || ""].filter(Boolean)
    };
    closeRequestPanel();

    sTitle.textContent  = el.dataset.title  || meta.title  || "—";
    sAuthor.textContent = el.dataset.author || meta._displayAuthor || meta.author || "—";
    if (sRole) {
      sRole.textContent = el.dataset.role || meta._displayRole || "Diseñador/a";
    }

    const creditsText = meta._displayCredits || el.dataset.credits || meta.collab || el.dataset.collab || "";
    if (sCredits) {
      sCredits.textContent = formatCreditsText(creditsText);
    }

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
    const orientFromCard = getOrientationFromElement(el);
    const orientFromImage = imgNode ? getOrientationFromDimensions(imgNode.naturalWidth, imgNode.naturalHeight) : "";
    const orientFromMeta = normalizeOrientation(meta.orientation || "");
    const orientHint = orientFromCard || orientFromImage || orientFromMeta || 'h';

    if (sheetFig) {
      sheetFig.style.aspectRatio = ORIENTATION_ASPECT_CSS[orientHint] || ORIENTATION_ASPECT_CSS.h;
    }

    sheetImg.alt = el.dataset.title || meta.title || "";
    if (sheetImg.src !== src) {
      sheetImg.src = src;
    }
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
    closeRequestPanel();
    activeSpotlightMeta = null;
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
  if (sheetReportActions) {
    sheetReportActions.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-request-type]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      openRequestPanel(btn.dataset.requestType || "");
    });
  }
  if (sheetRequestSend) {
    sheetRequestSend.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sendRequestEmail();
    });
  }
  if (sheetRequestCancel) {
    sheetRequestCancel.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeRequestPanel();
    });
  }
  if (sheetRequestClose) {
    sheetRequestClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeRequestPanel();
    });
  }
  
  // Cerrar modal de proyecto con tecla Escape
  document.addEventListener('keydown', (e) => {
    // Solo cerrar si el modal de proyecto está abierto y no hay otros modales abiertos
    if (e.key === 'Escape' && overlay && !overlay.hidden) {
      if (sheetRequestPanel && !sheetRequestPanel.hidden) {
        e.preventDefault();
        closeRequestPanel();
        return;
      }
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
    const normalized = norm(term).replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    // Prioriza alias de frase completa para búsquedas semánticas:
    // ej. "poster" -> "afiche", "stop motion" -> "animación".
    const fullCanonical = canonicalTagKey(normalized);
    if (fullCanonical && fullCanonical !== normalized) {
      return [fullCanonical];
    }

    const tokens = normalized
      .split(/\s+/)
      .map((t) => canonicalTagKey(t.trim()))
      .filter(Boolean);

    return Array.from(new Set(tokens));
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
        {id, src:"", orientation:"h", span:1, tags:[], title:"—", author:"—", role:"", collab:"", area:"—", year:"—", url:""},
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
    refreshViewportSize();
    resetPlaneLimits();
    const forcedViewChange = syncViewOptionsWithViewport();
    if (!forcedViewChange) {
      renderActiveView();
    }
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

  function isMobileViewport() {
    return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
  }

  function sanitizeViewForViewport(view) {
    if (isMobileViewport()) {
      if (!MOBILE_ALLOWED_VIEWS.has(view)) return 'grid';
      return view;
    }
    if (!DESKTOP_ALLOWED_VIEWS.has(view)) return 'bento';
    return view;
  }

  function syncViewOptionsWithViewport() {
    const mobile = isMobileViewport();
    if (viewMenu) {
      viewMenu.querySelectorAll('button[data-view]').forEach((btn) => {
        const view = btn.dataset.view;
        btn.hidden = mobile && !MOBILE_ALLOWED_VIEWS.has(view);
      });
    }
    if (mobile && !MOBILE_ALLOWED_VIEWS.has(activeView)) {
      setView('grid');
      return true;
    }
    return false;
  }

  function initViewSwitcher() {
    if (!viewToggle || !viewMenu) return;
    syncViewOptionsWithViewport();

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
    };
    if (btnRandom) btnRandom.addEventListener('click', onRandomClick);
    if (btnSearchRandom) btnSearchRandom.addEventListener('click', onRandomClick);
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
  if (overlay) {
    overlay.setAttribute('hidden',''); // garantía extra
  }
  
  // Inicializar panel de categorías
  initCategoryPanel();
  initViewSwitcher();
  initHeaderMore();
  initRandomButton();
  initIndexSorting();
  setView(activeView);
  
  // Mostrar modal institucional al cargar (si no se ha visto antes)
  showWipModal();
})();
