"use strict";

// ========================================
// 1. CONFIGURACIÓN DE WHATSAPP
// ========================================

// Coloca tu número con código de país.
// Para Perú: 51 seguido de tus 9 dígitos.
// Escríbelo entre comillas, sin "+" ni espacios.
// Lo dejamos vacío hasta que pongas tu número real.

const NUMERO_WHATSAPP = "51994801836";




// ========================================
// 3. ELEMENTOS DEL HTML
// ========================================

// Buscamos los elementos por su atributo "id".

const botonMenu = document.getElementById("boton-menu");
const menu = document.getElementById("menu-principal");

const buscador = document.getElementById("buscador");
const filtroMarca = document.getElementById("filtro-marca");
const filtroSerie = document.getElementById("filtro-serie");
const filtroCalidad = document.getElementById("filtro-calidad");
const listaProductos = document.getElementById("lista-productos");
const resultadoCatalogo = document.getElementById("resultado-catalogo");

const botonWhatsapp = document.getElementById("whatsapp-contacto");
const avisoWhatsapp = document.getElementById("aviso-whatsapp");

// Debe coincidir con el tamaño usado en el CSS.
const pantallaMovil = window.matchMedia("(max-width: 600px)");


// ========================================
// 4. MENÚ MÓVIL
// ========================================

function establecerMenu(abierto) {
  // En computadora el menú siempre es visible.
  // En celular depende del valor "abierto".
  menu.hidden = pantallaMovil.matches && !abierto;

  botonMenu.setAttribute("aria-expanded", String(abierto));
  botonMenu.textContent = abierto ? "Cerrar menú" : "Menú";
}

function adaptarMenu() {
  // El botón solo aparece en pantallas pequeñas.
  botonMenu.hidden = !pantallaMovil.matches;

  // Al cambiar de tamaño, cerramos el menú móvil.
  establecerMenu(false);
}

botonMenu.addEventListener("click", function () {
  const estaAbierto =
    botonMenu.getAttribute("aria-expanded") === "true";

  establecerMenu(!estaAbierto);
});

pantallaMovil.addEventListener("change", adaptarMenu);

// Permite cerrar el menú usando la tecla Escape.
document.addEventListener("keydown", function (evento) {
  const estaAbierto =
    botonMenu.getAttribute("aria-expanded") === "true";

  if (
    evento.key === "Escape" &&
    pantallaMovil.matches &&
    estaAbierto
  ) {
    establecerMenu(false);
    botonMenu.focus();
  }
});


// ========================================
// 5. SCROLL AL SELECCIONAR EL MENÚ
// ========================================

menu.addEventListener("click", function (evento) {
  const enlace = evento.target.closest('a[href^="#"]');

  if (!enlace) {
    return;
  }

  // Conserva el comportamiento normal de clics especiales.
  if (
    evento.ctrlKey ||
    evento.metaKey ||
    evento.shiftKey ||
    evento.altKey
  ) {
    return;
  }

  const destino = document.getElementById(enlace.hash.slice(1));

  if (!destino) {
    return;
  }

  evento.preventDefault();

  establecerMenu(false);

  const reducirMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Permite llevar el foco a la sección usando el teclado.
  if (!destino.hasAttribute("tabindex")) {
    destino.setAttribute("tabindex", "-1");
  }

  destino.focus({ preventScroll: true });

  destino.scrollIntoView({
    behavior: reducirMovimiento ? "instant" : "smooth",
    block: "start"
  });
});


// ========================================
// 6. PREPARAR TEXTO PARA LA BÚSQUEDA
// ========================================

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}


// ========================================
// 7. CREAR LAS OPCIONES DEL FILTRO
// ========================================

function cargarMarcas() {
  // Set elimina las marcas repetidas.
  const marcas = [...new Set(
    productos.map(function (producto) {
      return producto.marca;
    })
  )];

  marcas.sort(function (a, b) {
    return a.localeCompare(b, "es");
  });

  // Mantiene la opción inicial: Todas las marcas.
  filtroMarca.length = 1;

  marcas.forEach(function (marca) {
    const opcion = document.createElement("option");

    opcion.value = marca;
    opcion.textContent = marca;

    filtroMarca.appendChild(opcion);
  });
}
function cargarSeries() {
  const marcaElegida = filtroMarca.value;

  const productosDeMarca = productos.filter(function (producto) {
    return marcaElegida === "" || producto.marca === marcaElegida;
  });

  const series = [...new Set(
    productosDeMarca.map(function (producto) {
      return producto.serie;
    })
  )].filter(Boolean);

  series.sort();

  filtroSerie.length = 1;

  series.forEach(function (serie) {
    const opcion = document.createElement("option");

    opcion.value = serie;
    opcion.textContent = serie;

    filtroSerie.appendChild(opcion);
  });
}


// ========================================
// 8. WHATSAPP
// ========================================

function whatsappConfigurado() {
  // Comprueba el formato de un celular peruano.
  // No comprueba si el número tiene una cuenta de WhatsApp.
  return /^519\d{8}$/.test(NUMERO_WHATSAPP);
}

function abrirWhatsapp(producto = null) {
  if (!whatsappConfigurado()) {
    return;
  }

  let mensaje =
    "Hola, VitaCell. Quisiera información sobre sus productos y servicios.";

  if (producto) {
    mensaje =
      `Hola, VitaCell. Quisiera consultar por: ${producto.nombre}. ` +
      `Marca: ${producto.marca}. Calidad: ${producto.calidad}. ` +
      "¿Cuál es su precio y disponibilidad?";
  }

  // Convierte espacios y caracteres especiales para usarlos en una URL.
  const mensajeCodificado = encodeURIComponent(mensaje);

  const enlace =
    `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;

  window.open(enlace, "_blank", "noopener,noreferrer");
}

function configurarWhatsapp() {
  const configurado = whatsappConfigurado();

  botonWhatsapp.disabled = !configurado;

  avisoWhatsapp.textContent = configurado
    ? ""
    : "Las consultas por WhatsApp estarán disponibles próximamente.";
}

botonWhatsapp.addEventListener("click", function () {
  abrirWhatsapp();
});


// ========================================
// 9. DIBUJAR LAS TARJETAS
// ========================================

function mostrarProductos(productosVisibles) {
  // Quita las tarjetas anteriores antes de dibujar el resultado.
  listaProductos.replaceChildren();

  if (productosVisibles.length === 0) {
    resultadoCatalogo.textContent =
      "No encontramos productos. Prueba otra búsqueda o marca.";

    return;
  }

  const cantidad = productosVisibles.length;

  resultadoCatalogo.textContent =
    `${cantidad} ${cantidad === 1 ? "producto encontrado" : "productos encontrados"}.`;

  productosVisibles.forEach(function (producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto-card";

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta";
    etiqueta.textContent = producto.marca;

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const calidad = document.createElement("p");
    calidad.textContent = `Calidad: ${producto.calidad}`;

    const nota = document.createElement("p");
    nota.textContent = "Producto de ejemplo. Precio y stock por confirmar.";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-accion";
    boton.textContent = "Consultar por WhatsApp";
    boton.disabled = !whatsappConfigurado();

    boton.setAttribute(
      "aria-label",
      `Consultar ${producto.nombre}, ${producto.calidad}, por WhatsApp`
    );

    boton.addEventListener("click", function () {
      abrirWhatsapp(producto);
    });

    tarjeta.append(etiqueta, titulo, calidad, nota, boton);

    listaProductos.appendChild(tarjeta);
  });
}


// ========================================
// 10. FILTROS DE MARCA, SERIE Y CALIDAD
// ========================================

// Referencias a los nuevos filtros del HTML.
// Convierte los datos en texto y elimina espacios sobrantes.
function textoFiltro(valor) {
  return String(valor ?? "").trim();
}

// Llena un selector sin repetir opciones.
// Cada vez que se actualiza, vuelve a "Todas...".
function llenarOpcionesFiltro(selector, valores, titulo) {
  selector.replaceChildren();

  const opcionTodas = document.createElement("option");
  opcionTodas.value = "";
  opcionTodas.textContent = titulo;

  selector.appendChild(opcionTodas);

  const valoresUnicos = [
    ...new Set(
      valores
        .map(textoFiltro)
        .filter(function (valor) {
          return valor !== "";
        })
    )
  ];

  valoresUnicos.sort(function (a, b) {
    return a.localeCompare(b, "es", { numeric: true });
  });

  valoresUnicos.forEach(function (valor) {
    const opcion = document.createElement("option");
    opcion.value = valor;
    opcion.textContent = valor;

    selector.appendChild(opcion);
  });
}

// Devuelve los productos de la marca seleccionada.
// Si está en "Todas las marcas", devuelve todos.
function productosDeMarcaSeleccionada() {
  const marcaElegida = textoFiltro(filtroMarca.value);

  return productos.filter(function (producto) {
    return (
      marcaElegida === "" ||
      textoFiltro(producto.marca) === marcaElegida
    );
  });
}

// Obtiene las series directamente de los productos
// correspondientes a la marca seleccionada.
function actualizarSeries() {
  const productosMarca = productosDeMarcaSeleccionada();

  const series = productosMarca.map(function (producto) {
    return producto.serie;
  });

  llenarOpcionesFiltro(
    filtroSerie,
    series,
    "Todas las series"
  );
}

// Obtiene las calidades de la marca y serie seleccionadas.
function actualizarCalidades() {
  const serieElegida = filtroSerie.value;

  const productosMarcaSerie =
    productosDeMarcaSeleccionada().filter(function (producto) {
      return (
        serieElegida === "" ||
        textoFiltro(producto.serie) === serieElegida
      );
    });

  const calidades = productosMarcaSerie.map(function (producto) {
    return producto.calidad;
  });

  llenarOpcionesFiltro(
    filtroCalidad,
    calidades,
    "Todas las calidades"
  );
}

// Aplica simultáneamente el buscador y los tres filtros.
function filtrarProductos() {
  const textoBuscado = normalizarTexto(buscador.value);
  const marcaElegida = textoFiltro(filtroMarca.value);
  const serieElegida = filtroSerie.value;
  const calidadElegida = filtroCalidad.value;

  const palabras = textoBuscado.split(/\s+/).filter(Boolean);

  const resultados = productos.filter(function (producto) {
    // Conserva la búsqueda por nombre, marca y calidad.
    // También permite buscar el texto de la serie.
    const textoProducto = normalizarTexto(
      [
        producto.nombre,
        producto.marca,
        producto.serie,
        producto.calidad
      ].join(" ")
    );

    const coincideBusqueda = palabras.every(function (palabra) {
      return textoProducto.includes(palabra);
    });

    const coincideMarca =
      marcaElegida === "" ||
      textoFiltro(producto.marca) === marcaElegida;

    const coincideSerie =
      serieElegida === "" ||
      textoFiltro(producto.serie) === serieElegida;

    const coincideCalidad =
      calidadElegida === "" ||
      textoFiltro(producto.calidad) === calidadElegida;

    return (
      coincideBusqueda &&
      coincideMarca &&
      coincideSerie &&
      coincideCalidad
    );
  });

  // Reutiliza tu función actual para dibujar las tarjetas.
  mostrarProductos(resultados);
}

// Mientras escribes, se actualizan los resultados.
buscador.addEventListener("input", filtrarProductos);

// Cambiar marca reinicia serie y calidad.
// Así no queda seleccionada una serie de otra marca.
filtroMarca.addEventListener("change", function () {
  actualizarSeries();
  actualizarCalidades();
  filtrarProductos();
});

// Cambiar serie reinicia calidad y carga sus opciones.
filtroSerie.addEventListener("change", function () {
  actualizarCalidades();
  filtrarProductos();
});

// Cambiar calidad aplica la combinación seleccionada.
filtroCalidad.addEventListener("change", filtrarProductos);


// 11. INICIAR LA PÁGINA

adaptarMenu();
cargarMarcas();
actualizarSeries();
actualizarCalidades();
configurarWhatsapp();
filtrarProductos();

// ========================================
// SLIDER DE INICIO
// ========================================

const slidesInicio = document.querySelectorAll(".inicio-slide");
const indicadoresInicio = document.querySelectorAll(".indicador");

let slideActual = 0;
let intervaloInicio;

function mostrarSlide(indice) {
  slidesInicio.forEach(function (slide) {
    slide.classList.remove("activo");
  });

  indicadoresInicio.forEach(function (indicador) {
    indicador.classList.remove("activo");
  });

  slidesInicio[indice].classList.add("activo");
  indicadoresInicio[indice].classList.add("activo");

  slideActual = indice;
}

function siguienteSlide() {
  let siguiente = slideActual + 1;

  if (siguiente >= slidesInicio.length) {
    siguiente = 0;
  }

  mostrarSlide(siguiente);
}

function iniciarSlider() {
  intervaloInicio = setInterval(siguienteSlide, 4000);
}

indicadoresInicio.forEach(function (indicador, indice) {
  indicador.addEventListener("click", function () {
    clearInterval(intervaloInicio);

    mostrarSlide(indice);

    iniciarSlider();
  });
});

mostrarSlide(0);
iniciarSlider();
// ========================================
// MARCAS DINÁMICAS DEL SLIDE 2
// ========================================

const marcaDinamica = document.getElementById("marca-dinamica");

const marcasInicio = [
  "Samsung",
  "iPhone",
  "Redmi",
  "Huawei",
  "OPPO",
  "realme",
  "ZTE"
];

let marcaActualInicio = 0;

setInterval(function () {

  marcaDinamica.classList.add("cambiando");

  setTimeout(function () {

    marcaActualInicio++;

    if (marcaActualInicio >= marcasInicio.length) {
      marcaActualInicio = 0;
    }

    marcaDinamica.textContent =
      marcasInicio[marcaActualInicio];

    marcaDinamica.classList.remove("cambiando");

  }, 250);

}, 1100);