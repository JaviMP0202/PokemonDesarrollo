// Configuración de Supabase (copiado a saco)
const SUPABASE_URL = "https://qxbtzyiuafomldfhwjfw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YnR6eWl1YWZvbWxkZmh3amZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzg3NzgsImV4cCI6MjA4MDE1NDc3OH0.GDdz_uizuQlq8S7Fz9dx7zhg4zx8DEQfvV7NxydpUI8";

const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para mostrar el mensaje retro
function mostrarToastLogin(htmlMensaje) {
  const cont = document.getElementById("loginToastContainer");
  if (!cont) {
    return;
  }
  cont.innerHTML = "";
  const div = document.createElement("div");
  div.className = "muerte-notif";
  div.innerHTML = htmlMensaje;
  cont.appendChild(div);
}

function limpiarToast() {
  const cont = document.getElementById("loginToastContainer");
  if (cont) {
    cont.innerHTML = "";
  }
}

function setLoading(estaCargando) {
  const btnLogin = document.getElementById("btnLogin");
  const btnSignup = document.getElementById("btnSignup");
  if (!btnLogin || !btnSignup) return;

  btnLogin.disabled = estaCargando;
  btnSignup.disabled = estaCargando;

  if (estaCargando) {
    btnLogin.textContent = "...";
    btnSignup.textContent = "...";
  } else {
    btnLogin.textContent = "LOGIN";
    btnSignup.textContent = "SIGN UP";
  }
}

// LOGIN
async function handleLogin(e) {
  e.preventDefault();
  limpiarToast();

  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passInput ? passInput.value : "";

  if (email === "" || password === "") {
    mostrarToastLogin(
      "<div><strong>Error</strong></div><div>Rellena email y password.</div>"
    );
    return;
  }

  setLoading(true);

  let respuesta;
  try {
    respuesta = await supa.auth.signInWithPassword({
      email: email,
      password: password,
    });
  } catch (err) {
    setLoading(false);
    mostrarToastLogin(
      "<div><strong>Login fallido</strong></div><div>Error inesperado.</div>"
    );
    return;
  }

  setLoading(false);

  if (respuesta.error) {
    mostrarToastLogin(
      "<div><strong>Login fallido</strong></div><div>" +
        respuesta.error.message +
        "</div>"
    );
    return;
  }

  mostrarToastLogin(
    "<div><strong>Login correcto</strong></div><div>Entrando al combate...</div>"
  );

  setTimeout(function () {
    window.location.href = "lucha.html";
  }, 800);
}

// SIGN UP
async function handleSignup() {
  limpiarToast();

  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passInput ? passInput.value : "";

  if (email === "" || password === "") {
    mostrarToastLogin(
      "<div><strong>Error</strong></div><div>Rellena email y password.</div>"
    );
    return;
  }

  if (password.length < 6) {
    mostrarToastLogin(
      "<div><strong>Password corta</strong></div><div>Mínimo 6 caracteres.</div>"
    );
    return;
  }

  setLoading(true);

  let resp;
  try {
    resp = await supa.auth.signUp({
      email: email,
      password: password,
    });
  } catch (err) {
    setLoading(false);
    mostrarToastLogin(
      "<div><strong>Registro fallido</strong></div><div>Error inesperado.</div>"
    );
    return;
  }

  setLoading(false);

  if (resp.error) {
    mostrarToastLogin(
      "<div><strong>Registro fallido</strong></div><div>" +
        resp.error.message +
        "</div>"
    );
    return;
  }

  mostrarToastLogin(
    "<div><strong>Cuenta creada</strong></div><div>Ahora puedes hacer LOGIN.</div>"
  );
}

// Eventos
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const btnSignup = document.getElementById("btnSignup");

  if (form) {
    form.addEventListener("submit", function (e) {
      handleLogin(e);
    });
  }

  if (btnSignup) {
    btnSignup.addEventListener("click", function () {
      handleSignup();
    });
  }
});
