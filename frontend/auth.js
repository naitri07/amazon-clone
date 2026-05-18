/* =========================================================
   auth.js  –  shared by login.html, signup.html and every
               page that needs isLoggedIn / logout helpers
   ========================================================= */

const BASE = "http://localhost:5000/api";

/* ── helpers ─────────────────────────────────────────── */
function getToken()      { return localStorage.getItem("token"); }
function getUserName()   { return localStorage.getItem("userName") || ""; }
function isLoggedIn()    { return !!getToken(); }
function authHeader()    { return { "Content-Type":"application/json", "Authorization":"Bearer "+getToken() }; }

function showMsg(id, text, type="error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className   = "msg-box " + type;
  el.style.display = "block";
}
function hideMsg(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

/* ── SIGNUP ──────────────────────────────────────────── */
function signup() {
  hideMsg("msg");
  const name     = (document.getElementById("name")    ||{}).value?.trim();
  const email    = (document.getElementById("email")   ||{}).value?.trim();
  const password = (document.getElementById("password")||{}).value;
  const confirm  = (document.getElementById("confirm") ||{}).value;

  if (!name || !email || !password || !confirm)
    return showMsg("msg","All fields are required");
  if (password.length < 6)
    return showMsg("msg","Password must be at least 6 characters");
  if (password !== confirm)
    return showMsg("msg","Passwords do not match");

  const btn = document.getElementById("signupBtn");
  if (btn) { btn.disabled=true; btn.textContent="Creating account…"; }

  fetch(BASE+"/auth/signup",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name,email,password})
  })
  .then(r=>r.json())
  .then(d=>{
    if (btn){ btn.disabled=false; btn.textContent="Create your Amazon account"; }
    if (d.message && d.message.toLowerCase().includes("success")){
      showMsg("msg","✅ Account created! Redirecting to sign in…","success");
      setTimeout(()=>window.location.href="login.html",1500);
    } else {
      showMsg("msg", d.message||"Signup failed");
    }
  })
  .catch(()=>{
    if (btn){ btn.disabled=false; btn.textContent="Create your Amazon account"; }
    showMsg("msg","❌ Cannot connect to server. Make sure backend is running.");
  });
}

/* ── LOGIN ───────────────────────────────────────────── */
function login() {
  hideMsg("msg");
  const email    = (document.getElementById("email")   ||{}).value?.trim();
  const password = (document.getElementById("password")||{}).value;

  if (!email || !password)
    return showMsg("msg","Please enter email and password");

  const btn = document.getElementById("loginBtn");
  if (btn){ btn.disabled=true; btn.textContent="Signing in…"; }

  fetch(BASE+"/auth/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  })
  .then(r=>r.json())
  .then(d=>{
    if (btn){ btn.disabled=false; btn.textContent="Sign in"; }
    if (d.token){
      localStorage.setItem("token",    d.token);
      localStorage.setItem("userId",   d.user._id);
      localStorage.setItem("userName", d.user.name);
      localStorage.setItem("userEmail",d.user.email);
      window.location.href="index.html";
    } else {
      showMsg("msg", d.message||"Login failed");
    }
  })
  .catch(()=>{
    if (btn){ btn.disabled=false; btn.textContent="Sign in"; }
    showMsg("msg","❌ Cannot connect to server. Make sure backend is running.");
  });
}

/* ── LOGOUT ──────────────────────────────────────────── */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("cart");
  window.location.href="index.html";
}

/* ── Allow Enter key on auth forms ───────────────────── */
document.addEventListener("keypress", function(e){
  if (e.key !== "Enter") return;
  if (document.getElementById("signupBtn")) signup();
  else if (document.getElementById("loginBtn")) login();
});
