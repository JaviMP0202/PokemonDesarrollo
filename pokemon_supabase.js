// =========== CONFIG SUPABASE =============
const SUPABASE_URL = "https://qxbtzyiuafomldfhwjfw.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YnR6eWl1YWZvbWxkZmh3amZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzg3NzgsImV4cCI6MjA4MDE1NDc3OH0.GDdz_uizuQlq8S7Fz9dx7zhg4zx8DEQfvV7NxydpUI8"; // anon public key

const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========== ESTADO ============
let todosLosPokemons = [];

let equipoIzquierdoBase = [];
let equipoDerechoBase = [];
let equipoIzquierdo = [];

let equipoDerecho = [];
let turno = 0; // 0 izquierda, 1 derecha

// ========= UTILIDADES ==============
function mezclarArray(arr) {
  return arr.sort(function () {
    return Math.random() - 0.5;
  });
}

function buscarPokemonPorNombre(equipo, nombre) {
  if (!nombre) return null;
  const n = ("" + nombre).toLowerCase();
  for (let i = 0; i < equipo.length; i++) {
    if (equipo[i].nombre.toLowerCase() === n) {
      return equipo[i];
    }
  }
  return null;
}

function mostrarToastRetro(htmlMensaje) {
  const cont = document.getElementById("deathToastContainer");
  if (!cont) return;
  cont.innerHTML = "";
  const div = document.createElement("div");
  div.className = "death-toast";
  div.innerHTML = htmlMensaje;
  cont.appendChild(div);
}

// ========== SUPABASE =========
async function cargarPokemonsDesdeSupabase() {
  const { data, error } = await supa.from("pokemons").select("*");
  // error de traer datos, comprobar
  console.log("Supabase error:", error);
  console.log("Supabase data:", data);
  //comprueba en consola si falla

  if (error) {
    mostrarToastRetro(
      "<div><strong>Error</strong></div><div>No se pueden cargar pokemons.</div>"
    );
    return;
  }
  // si errror existe, imprimo un error

  todosLosPokemons = data;

  if (!todosLosPokemons || todosLosPokemons.length < 8) {
    mostrarToastRetro(
      "<div><strong>Error</strong></div><div>Necesitas al menos 8 pokemons.</div>"
    );
    return;
  }

  const mezclados = mezclarArray(todosLosPokemons.slice());
  equipoIzquierdoBase = mezclados.slice(0, 4); // 3 minimo + 1 fuera de la pokebal
  equipoDerechoBase = mezclados.slice(4, 8); // cojo el resto de los pomeons, del arr mezclads

  console.log("equipoIzquierdoBase:", equipoIzquierdoBase);
  console.log("equipoDerechoBase:", equipoDerechoBase);

  clonarEquipos();
  prepararUIInicial();
}

// ====== EQUIPOS =====
function clonarEquipos() {
  equipoIzquierdo = [];
  for (let i = 0; i < equipoIzquierdoBase.length; i++) {
    const p = equipoIzquierdoBase[i];
    equipoIzquierdo.push({
      nombre: p.nombre,
      vida: p.vida,
      fuerza: p.fuerza,
      img: p.img,
      vidaRestante: p.vida,
    });
  }

  equipoDerecho = [];
  for (let i = 0; i < equipoDerechoBase.length; i++) {
    const p = equipoDerechoBase[i];
    equipoDerecho.push({
      nombre: p.nombre,
      vida: p.vida,
      fuerza: p.fuerza,
      img: p.img,
      vidaRestante: p.vida,
    });
  }
}

function prepararUIInicial() {
  const pokeIzq = document.getElementById("pokeizquierda");
  const pokeDer = document.getElementById("pokederecha");

  // el 4 pokémon de cada lado entra al campo
  if (pokeIzq && equipoIzquierdoBase[3]) {
    console.log("pokeIzq usa:", equipoIzquierdoBase[3]);
    pokeIzq.src = equipoIzquierdoBase[3].img;
    pokeIzq.dataset.name = equipoIzquierdoBase[3].nombre;
    pokeIzq.classList.remove("poke-muerto");
    pokeIzq.style.visibility = "visible";
  }
  if (pokeDer && equipoDerechoBase[3]) {
    console.log("pokeDer usa:", equipoDerechoBase[3]);
    pokeDer.src = equipoDerechoBase[3].img;
    pokeDer.dataset.name = equipoDerechoBase[3].nombre;
    pokeDer.classList.remove("poke-muerto");
    pokeDer.style.visibility = "visible";
  }

  // miniaturas izquierda
  const minisIzq = document.querySelectorAll(".elegir .eleccion");
  for (let i = 0; i < minisIzq.length; i++) {
    const p = equipoIzquierdoBase[i];
    if (!p) continue;
    minisIzq[i].src = p.img;
    minisIzq[i].dataset.name = p.nombre;
  }

  // miniaturas derecha
  const minisDer = document.querySelectorAll(".elegir2 .eleccion");
  for (let i = 0; i < minisDer.length; i++) {
    const p = equipoDerechoBase[i];
    if (!p) continue;
    console.log("mini der", i, p);
    minisDer[i].src = p.img;
    minisDer[i].dataset.name = p.nombre;
  }

  actualizarBarraPorLado("izquierda");
  actualizarBarraPorLado("derecha");
  postCambioEstado();
}

// ========LOGICA DE BATALLA=====
function getPokemonFuera(lado) {
  let img;
  if (lado === "izquierda") {
    img = document.getElementById("pokeizquierda");
  } else {
    img = document.getElementById("pokederecha");
  }
  if (!img) return null;
  const nombre = img.dataset ? img.dataset.name : null;
  if (!nombre) return null;

  if (lado === "izquierda") {
    return buscarPokemonPorNombre(equipoIzquierdo, nombre);
  } else {
    return buscarPokemonPorNombre(equipoDerecho, nombre);
  }
}

function cambiarTurno() {
  turno = turno === 0 ? 1 : 0;
  const label = document.getElementById("turnoLabel");
  if (label) label.textContent = turno === 0 ? "Izquierda" : "Derecha";
}

function actualizarBarra(pokemon, selector) {
  const barra = document.querySelector(selector);
  if (!barra || !pokemon) return;
  const vidaPorc = (pokemon.vidaRestante / pokemon.vida) * 100;
  let w = vidaPorc;
  if (w < 0) w = 0;
  if (w > 100) w = 100;
  barra.style.width = w + "%";
}

function actualizarBarraPorLado(lado) {
  let img;
  if (lado === "izquierda") {
    img = document.getElementById("pokeizquierda");
  } else {
    img = document.getElementById("pokederecha");
  }
  if (!img) return;

  let equipo;
  if (lado === "izquierda") {
    equipo = equipoIzquierdo;
  } else {
    equipo = equipoDerecho;
  }

  const p = buscarPokemonPorNombre(equipo, img.dataset ? img.dataset.name : "");
  if (!p) return;

  if (lado === "izquierda") {
    actualizarBarra(p, ".hud.izquierda .life-fill");
  } else {
    actualizarBarra(p, ".hud.derecha .life-fill");
  }
}

function actualizarMiniaturasKO() {
  const minisIzq = document.querySelectorAll(".elegir .eleccion");
  for (let i = 0; i < minisIzq.length; i++) {
    const el = minisIzq[i];
    const p = buscarPokemonPorNombre(
      equipoIzquierdo,
      el.dataset ? el.dataset.name : ""
    );
    let ko = !p || p.vidaRestante <= 0;
    if (ko) {
      el.tabIndex = -1;
      el.style.pointerEvents = "none";
      el.style.filter = "grayscale(1) brightness(0.6)";
      el.setAttribute("aria-disabled", "true");
    } else {
      el.tabIndex = 0;
      el.style.pointerEvents = "auto";
      el.style.filter = "none";
      el.setAttribute("aria-disabled", "false");
    }
  }

  const minisDer = document.querySelectorAll(".elegir2 .eleccion");
  for (let i = 0; i < minisDer.length; i++) {
    const el = minisDer[i];
    const p = buscarPokemonPorNombre(
      equipoDerecho,
      el.dataset ? el.dataset.name : ""
    );
    let ko = !p || p.vidaRestante <= 0;
    if (ko) {
      el.tabIndex = -1;
      el.style.pointerEvents = "none";
      el.style.filter = "grayscale(1) brightness(0.6)";
      el.setAttribute("aria-disabled", "true");
    } else {
      el.tabIndex = 0;
      el.style.pointerEvents = "auto";
      el.style.filter = "none";
      el.setAttribute("aria-disabled", "false");
    }
  }
}

function actualizarEstadoBotonAtacar() {
  const boton = document.getElementById("boton");
  if (!boton) return;

  const atacanteFuera =
    turno === 0 ? getPokemonFuera("izquierda") : getPokemonFuera("derecha");
  const izqFuera = getPokemonFuera("izquierda");
  const derFuera = getPokemonFuera("derecha");

  const atacanteKO = !atacanteFuera || atacanteFuera.vidaRestante <= 0;
  const algunoKOFuera =
    (izqFuera && izqFuera.vidaRestante <= 0) ||
    (derFuera && derFuera.vidaRestante <= 0);

  if (atacanteKO || algunoKOFuera) {
    boton.disabled = true;
    boton.setAttribute("aria-disabled", "true");
  } else {
    boton.disabled = false;
    boton.setAttribute("aria-disabled", "false");
  }
}

function postCambioEstado() {
  actualizarMiniaturasKO();
  actualizarEstadoBotonAtacar();
}

function equipoKO(equipo) {
  for (let i = 0; i < equipo.length; i++) {
    if (equipo[i].vidaRestante > 0) return false;
  }
  return true;
}

// ======== TOASTS ============
function mostrarToastMuerte(nombre, lado) {
  const quien = lado === "izquierda" ? "Tu Pokémon" : "El Pokémon rival";
  const html =
    "<div>" +
    quien +
    " <strong>" +
    nombre +
    "</strong> se ha debilitado.</div>" +
    "<div>Cámbialo por otro Pokémon.</div>";
  mostrarToastRetro(html);
}

function mostrarToastEleccion(nombre, lado) {
  const quien =
    lado === "izquierda" ? "Has elegido a" : "El rival ha elegido a";
  const html = "<div>" + quien + " <strong>" + nombre + "</strong>.</div>";
  mostrarToastRetro(html);
}

function mostrarToastVictoria(ganadorTexto) {
  const cont = document.getElementById("deathToastContainer");
  if (!cont) return;

  cont.innerHTML = "";

  const div = document.createElement("div");
  div.className = "death-toast";
  div.innerHTML =
    "<div><strong>" +
    ganadorTexto +
    "</strong></div>" +
    "<div>Todos los Pokémon del rival se han debilitado.</div>" +
    '<div style="margin-top:10px; text-align:center;">' +
    '<button id="btnRestart" class="retro-btn">RESTART</button>' +
    "</div>";

  cont.appendChild(div);

  const btn = document.getElementById("btnRestart");
  if (btn) btn.addEventListener("click", reiniciarPartida);
}

// ========= REINICIO ========
function reiniciarPartida() {
  clonarEquipos();
  turno = 0;
  prepararUIInicial();

  const cont = document.getElementById("deathToastContainer");
  if (cont) cont.innerHTML = "";

  const boton = document.getElementById("boton");
  if (boton) {
    boton.disabled = false;
    boton.setAttribute("aria-disabled", "false");
  }

  const pokeIzq = document.getElementById("pokeizquierda");
  const pokeDer = document.getElementById("pokederecha");
  if (pokeIzq) {
    pokeIzq.classList.remove("poke-muerto");
    pokeIzq.style.visibility = "visible";
  }
  if (pokeDer) {
    pokeDer.classList.remove("poke-muerto");
    pokeDer.style.visibility = "visible";
  }
}

// ====== INTERACCIONES ===========
function cambiarPokemon(event) {
  const eleccionImg = event.target;
  const nombreSeleccionado =
    eleccionImg && eleccionImg.dataset ? eleccionImg.dataset.name : null;
  if (!nombreSeleccionado) return;

  const lado = turno === 0 ? "izquierda" : "derecha";

  const imgFuera =
    lado === "izquierda"
      ? document.getElementById("pokeizquierda")
      : document.getElementById("pokederecha");

  const equipoActual = lado === "izquierda" ? equipoIzquierdo : equipoDerecho;

  const pokemonSeleccionado = buscarPokemonPorNombre(
    equipoActual,
    nombreSeleccionado
  );
  if (!pokemonSeleccionado || !imgFuera) return;
  if (pokemonSeleccionado.vidaRestante <= 0) return;

  const srcViejo = imgFuera.src;
  const nombreViejo = imgFuera.dataset.name;

  imgFuera.src = eleccionImg.src;
  imgFuera.dataset.name = nombreSeleccionado;

  eleccionImg.src = srcViejo;
  eleccionImg.dataset.name = nombreViejo;

  // Reset visual por si el que entra estaba marcado como muerto
  // me fallaba que todos se veía muerto, solucionar problema
  imgFuera.classList.remove("poke-muerto");
  imgFuera.style.visibility = "visible";

  actualizarBarraPorLado(lado);
  postCambioEstado();

  mostrarToastEleccion(pokemonSeleccionado.nombre, lado);

  cambiarTurno();
  postCambioEstado();
}

function atacar() {
  const izquierdoEl = document.getElementById("pokeizquierda");
  const derechoEl = document.getElementById("pokederecha");
  if (!izquierdoEl || !derechoEl) return;

  let atacanteEl, defensorEl;
  if (turno === 0) {
    atacanteEl = izquierdoEl;
    defensorEl = derechoEl;
  } else {
    atacanteEl = derechoEl;
    defensorEl = izquierdoEl;
  }

  let atacanteEquipo, defensorEquipo;
  if (turno === 0) {
    atacanteEquipo = equipoIzquierdo;
    defensorEquipo = equipoDerecho;
  } else {
    atacanteEquipo = equipoDerecho;
    defensorEquipo = equipoIzquierdo;
  }

  const atacante = buscarPokemonPorNombre(
    atacanteEquipo,
    atacanteEl.dataset ? atacanteEl.dataset.name : ""
  );
  const defensor = buscarPokemonPorNombre(
    defensorEquipo,
    defensorEl.dataset ? defensorEl.dataset.name : ""
  );
  if (!atacante || !defensor) return;

  if (atacante.vidaRestante <= 0) {
    postCambioEstado();
    return;
  }
  // la forma de atacar es con un random de la fuerza traida de supabases
  const maxDaño = atacante.fuerza | 0;
  let daño = Math.floor(Math.random() * maxDaño) + 1;
  if (daño < 0) daño = 0;
  defensor.vidaRestante -= daño;
  if (defensor.vidaRestante < 0) defensor.vidaRestante = 0;

  const ladoDefensor =
    defensorEl.id === "pokederecha" ? "derecha" : "izquierda";

  if (ladoDefensor === "derecha") {
    actualizarBarra(defensor, ".hud.derecha .life-fill");
  } else {
    actualizarBarra(defensor, ".hud.izquierda .life-fill");
  }

  if (defensor.vidaRestante <= 0) {
    mostrarToastMuerte(defensor.nombre, ladoDefensor);

    // Animación de muerte: parpadeo + desaparición
    defensorEl.classList.add("poke-muerto");
    defensorEl.addEventListener(
      "animationend",
      () => {
        defensorEl.style.visibility = "hidden";
      },
      { once: true }
    );
  }

  postCambioEstado();

  const todosIzqKO = equipoKO(equipoIzquierdo);
  const todosDerKO = equipoKO(equipoDerecho);

  if (todosDerKO) {
    mostrarToastVictoria("Ha ganado el Jugador 1");
    const boton = document.getElementById("boton");
    if (boton) {
      boton.disabled = true;
      boton.setAttribute("aria-disabled", "true");
    }
    return;
  }

  if (todosIzqKO) {
    mostrarToastVictoria("Ha ganado el Jugador 2");
    const boton = document.getElementById("boton");
    if (boton) {
      boton.disabled = true;
      boton.setAttribute("aria-disabled", "true");
    }
    return;
  }

  cambiarTurno();
  postCambioEstado();
}

// ============ EVENTOs=========
function onClickEleccion(e) {
  const eleccionImg = e.target.closest(".eleccion");
  if (!eleccionImg) return;
  if (eleccionImg.getAttribute("aria-disabled") === "true") return;
  cambiarPokemon({ target: eleccionImg });
}

document.addEventListener("DOMContentLoaded", function () {
  const boton = document.getElementById("boton");
  if (boton) boton.addEventListener("click", atacar);

  const elegir1 = document.querySelector(".elegir");
  const elegir2 = document.querySelector(".elegir2");
  if (elegir1) elegir1.addEventListener("click", onClickEleccion);
  if (elegir2) elegir2.addEventListener("click", onClickEleccion);

  cargarPokemonsDesdeSupabase();
});
