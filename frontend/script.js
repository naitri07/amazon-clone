/* =========================================================
   script.js  –  Complete Amazon Clone Frontend Logic
   ========================================================= */
const API = "http://localhost:5000/api";

/* ══════════════════════════════════════════════════════════
   CART  (localStorage)
══════════════════════════════════════════════════════════ */
function getCart()  { return JSON.parse(localStorage.getItem("cart")  || "[]"); }
function saveCart(c){ localStorage.setItem("cart", JSON.stringify(c)); updateCartCount(); }

function updateCartCount(){
  const n = getCart().reduce((s,i) => s + i.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = n);
}

function addToCart(name, price, image, btn){
  let cart = getCart();
  const idx = cart.findIndex(x => x.name === name);
  if(idx > -1) cart[idx].quantity++;
  else cart.push({ name, price: Number(price), image, quantity: 1 });
  saveCart(cart);
  showToast("🛒 Added: " + name, "success");
  if(btn){
    const orig = btn.textContent;
    btn.textContent = "✓ Added!";
    btn.style.background = "#07c160";
    btn.style.color = "#fff";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; btn.style.color = ""; }, 1200);
  }
}

function buyNow(name, price, image){
  addToCart(name, price, image, null);
  window.location.href = "cart.html";
}

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function showToast(msg, type="info"){
  let t = document.getElementById("toast");
  if(!t){ t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = "toast " + type + " show";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = "toast"; }, 2800);
}

/* ══════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════ */
function initNavbar(){
  updateCartCount();
  const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
  document.querySelectorAll("#wishlist-count").forEach(el => el.textContent = wl.length);

  const name = localStorage.getItem("userName");
  const helloEl = document.getElementById("helloText");
  if(helloEl) helloEl.textContent = name ? "Hello, " + name.split(" ")[0] : "Hello, sign in";

  const menu = document.getElementById("accountMenuContent");
  if(!menu) return;
  if(name){
    menu.innerHTML = `
      <div class="menu-section">Hello, ${name.split(" ")[0]}</div>
      <a href="orders.html">📦 Your Orders</a>
      <a href="wishlist.html">❤️ Your Wishlist</a>
      <hr>
      <div class="menu-item" onclick="logout()">🚪 Sign Out</div>`;
  } else {
    menu.innerHTML = `
      <div style="padding:14px 18px;">
        <a href="login.html" style="display:block;text-align:center;background:#ffd814;padding:8px;border-radius:4px;font-weight:700;color:#111;margin-bottom:8px;">Sign In</a>
        <div style="font-size:0.8rem;text-align:center;">New customer? <a href="signup.html" style="color:#0066c0;">Start here</a></div>
      </div>
      <hr>
      <a href="wishlist.html">❤️ Your Wishlist</a>`;
  }
}

function toggleAccountMenu(){
  document.getElementById("accountMenu")?.classList.toggle("open");
}
document.addEventListener("click", function(e){
  const box = document.getElementById("accountBox");
  const m   = document.getElementById("accountMenu");
  if(m && box && !box.contains(e.target)) m.classList.remove("open");
});

/* ══════════════════════════════════════════════════════════
   SIDE MENU
══════════════════════════════════════════════════════════ */
function toggleSideMenu(){
  const menu    = document.getElementById("sideMenu");
  const overlay = document.getElementById("sideOverlay");
  if(!menu) return;
  const open = menu.classList.toggle("open");
  if(overlay) overlay.style.display = open ? "block" : "none";

  const n = localStorage.getItem("userName");
  const nameEl = document.getElementById("sideUserName");
  if(nameEl) nameEl.textContent = n ? "Hello, " + n.split(" ")[0] : "Hello, Sign In";

  const logoutLink = document.getElementById("sideLogoutLink");
  const loginLink  = document.getElementById("sideLoginLink");
  if(n){ if(logoutLink) logoutLink.style.display="block"; if(loginLink) loginLink.style.display="none"; }
  else { if(logoutLink) logoutLink.style.display="none";  if(loginLink) loginLink.style.display="block"; }
}

/* ══════════════════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════════════════ */
function handleSearchKey(e){ if(e.key === "Enter") doSearch(); }
function doSearch(){
  const q   = (document.getElementById("searchInput")    || {}).value?.trim().toLowerCase() || "";
  const cat = (document.getElementById("categoryFilter") || {}).value || "All";
  filterProducts(q, cat);
}
function clearSearch(){
  const inp = document.getElementById("searchInput");
  const cat = document.getElementById("categoryFilter");
  if(inp) inp.value = "";
  if(cat) cat.value = "All";
  filterProducts("", "All");
  const b = document.getElementById("searchBanner");
  if(b) b.style.display = "none";
}
function filterProducts(q, cat){
  const boxes = document.querySelectorAll(".shop-section .box");
  let shown = 0;
  boxes.forEach(box => {
    const name     = (box.dataset.name     || "").toLowerCase();
    const category = (box.dataset.category || "").toLowerCase();
    const mQ = !q || name.includes(q) || category.includes(q);
    const mC = (cat === "All") || category.includes(cat.toLowerCase());
    const show = mQ && mC;
    box.style.display = show ? "" : "none";
    if(show) shown++;
  });
  let nr = document.getElementById("noResults");
  if(!nr){
    nr = document.createElement("div");
    nr.id = "noResults"; nr.className = "no-results";
    nr.innerHTML = "<h3>No results found</h3><p>Try a different search or category.</p>";
    document.querySelector(".shop-section")?.appendChild(nr);
  }
  nr.style.display = shown === 0 ? "block" : "none";
  const banner    = document.getElementById("searchBanner");
  const bannerTxt = document.getElementById("searchBannerText");
  if(banner && bannerTxt){
    if(q || cat !== "All"){
      banner.style.display = "flex";
      bannerTxt.textContent = `Showing ${shown} result(s) for "${q}"${cat !== "All" ? ' in "' + cat + '"' : ""}`;
    } else { banner.style.display = "none"; }
  }
}
function filterCategory(cat){
  const c = document.getElementById("categoryFilter");
  if(c) c.value = cat;
  const q = (document.getElementById("searchInput") || {}).value?.trim().toLowerCase() || "";
  filterProducts(q, cat);
}
function filterByTag(tag){
  if(tag === "deals"){
    const boxes = document.querySelectorAll(".shop-section .box");
    let shown = 0;
    boxes.forEach(b => { const show = !!b.querySelector(".badge"); b.style.display = show ? "" : "none"; if(show) shown++; });
    const banner = document.getElementById("searchBanner");
    const txt    = document.getElementById("searchBannerText");
    if(banner && txt){ banner.style.display = "flex"; txt.textContent = `Today's Deals – ${shown} items`; }
  } else { filterProducts(tag, "All"); }
}
function goToOrders(){ window.location.href = "orders.html"; }

/* ══════════════════════════════════════════════════════════
   INFO PANELS (Today's Deals, Customer Service, etc.)
══════════════════════════════════════════════════════════ */
const INFO = {
  "customer-service": `<h2 style="margin-bottom:16px">Customer Service</h2>
    <p style="margin-bottom:14px;color:#555">How can we help you today?</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="border:1px solid #ddd;padding:16px;border-radius:8px;text-align:center;cursor:pointer">📦 Track your order</div>
      <div style="border:1px solid #ddd;padding:16px;border-radius:8px;text-align:center;cursor:pointer">🔄 Returns &amp; Refunds</div>
      <div style="border:1px solid #ddd;padding:16px;border-radius:8px;text-align:center;cursor:pointer">💳 Payment Issues</div>
      <div style="border:1px solid #ddd;padding:16px;border-radius:8px;text-align:center;cursor:pointer">📞 Contact Us</div>
    </div>
    <p style="margin-top:18px;font-size:0.85rem;color:#555">📞 Toll-free: 1800-XXX-XXXX &nbsp;|&nbsp; 24×7 Support</p>`,
  "registry": `<h2 style="margin-bottom:14px">Amazon Registry</h2>
    <p style="color:#555;margin-bottom:16px">Create a list for weddings, baby showers, birthdays and more.</p>
    <button onclick="closeInfoPanel()" style="padding:10px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:4px;font-weight:700;cursor:pointer">Create a Registry</button>`,
  "gift-cards": `<h2 style="margin-bottom:14px">🎁 Gift Cards</h2>
    <p style="color:#555;margin-bottom:16px">Give the gift of choice. Buy for any occasion.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${["₹500","₹1,000","₹2,000","₹5,000"].map(a=>`<div style="border:2px solid #ffd814;padding:16px 22px;border-radius:8px;font-weight:700;font-size:1.1rem;cursor:pointer">${a}</div>`).join("")}
    </div>`,
  "sell": `<h2 style="margin-bottom:14px">Sell on Amazon</h2>
    <p style="color:#555;margin-bottom:14px">Reach millions of customers across India.</p>
    <ul style="list-style:none;padding:0;margin-bottom:18px">
      ${["✅ Easy product listing","✅ Secure & fast payments","✅ Shipping support","✅ Dedicated seller help"].map(i=>`<li style="padding:8px 0;border-bottom:1px solid #eee">${i}</li>`).join("")}
    </ul>
    <button onclick="closeInfoPanel()" style="padding:10px 24px;background:#ff9900;color:white;border:none;border-radius:4px;font-weight:700;cursor:pointer">Start Selling →</button>`
};
function showPage(key){
  const overlay = document.getElementById("infoOverlay");
  const content = document.getElementById("infoPanelContent");
  if(!overlay || !content) return;
  content.innerHTML = INFO[key] || "<p>Coming soon.</p>";
  overlay.style.display = "flex";
}
function closeInfoPanel(){
  const overlay = document.getElementById("infoOverlay");
  if(overlay) overlay.style.display = "none";
}

/* ══════════════════════════════════════════════════════════
   WISHLIST
══════════════════════════════════════════════════════════ */
function getWishlist(){ return JSON.parse(localStorage.getItem("wishlist") || "[]"); }
function saveWishlist(wl){
  localStorage.setItem("wishlist", JSON.stringify(wl));
  document.querySelectorAll("#wishlist-count").forEach(el => el.textContent = wl.length);
}
function toggleWishlist(name, price, image, btn){
  let wl = getWishlist();
  const i = wl.findIndex(x => x.name === name);
  if(i > -1){
    wl.splice(i, 1);
    if(btn){ btn.textContent = "♡"; btn.classList.remove("wishlisted"); }
    showToast("Removed from wishlist", "info");
  } else {
    wl.push({ name, price, image });
    if(btn){ btn.textContent = "♥"; btn.classList.add("wishlisted"); }
    showToast("❤️ Added to wishlist!", "success");
  }
  saveWishlist(wl);
}
function syncWishlistButtons(){
  const wl = getWishlist();
  document.querySelectorAll(".wishlist-btn").forEach(btn => {
    const box = btn.closest(".box");
    if(!box) return;
    if(wl.find(x => x.name === box.dataset.name)){ btn.textContent = "♥"; btn.classList.add("wishlisted"); }
  });
}

/* ══════════════════════════════════════════════════════════
   ADDRESS MODAL  ← NEW
══════════════════════════════════════════════════════════ */
let _pendingCart   = [];
let _pendingMethod = "Online Payment";

function showAddressModal(cart, method){
  _pendingCart   = cart;
  _pendingMethod = method;

  // Remove old modal if exists
  const old = document.getElementById("addressModal");
  if(old) old.remove();

  const modal = document.createElement("div");
  modal.id = "addressModal";
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.55);
    z-index:11000;display:flex;align-items:center;justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:white;border-radius:8px;width:460px;max-width:95vw;overflow:hidden;animation:slideUp 0.3s ease">
      <div style="background:#131921;color:white;padding:16px 20px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:1rem;font-weight:700">📍 Delivery Address</div>
          <div style="font-size:0.72rem;opacity:0.8">Where should we deliver your order?</div>
        </div>
        <button onclick="document.getElementById('addressModal').remove()"
          style="background:none;border:none;color:white;font-size:1.3rem;cursor:pointer">✕</button>
      </div>
      <div style="padding:22px">
        <div id="addrMsg" style="display:none;background:#fdf4f4;border:1px solid #f5c6cb;color:#c0392b;padding:8px 12px;border-radius:4px;font-size:0.83rem;margin-bottom:12px"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:3px">Full Name *</label>
            <input id="addr_name" type="text" placeholder="Your full name"
              value="${localStorage.getItem('userName') || ''}"
              style="width:100%;padding:8px 10px;border:1px solid #aaa;border-radius:4px;font-size:0.88rem">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:3px">Phone Number *</label>
            <input id="addr_phone" type="tel" placeholder="10-digit mobile number"
              style="width:100%;padding:8px 10px;border:1px solid #aaa;border-radius:4px;font-size:0.88rem">
          </div>
        </div>

        <div style="margin-bottom:10px">
          <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:3px">Address (House No, Street, Area) *</label>
          <textarea id="addr_street" placeholder="e.g. 42, MG Road, Koramangala" rows="2"
            style="width:100%;padding:8px 10px;border:1px solid #aaa;border-radius:4px;font-size:0.88rem;resize:none"></textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:3px">City *</label>
            <input id="addr_city" type="text" placeholder="City"
              style="width:100%;padding:8px 10px;border:1px solid #aaa;border-radius:4px;font-size:0.88rem">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:3px">State *</label>
            <input id="addr_state" type="text" placeholder="State"
              style="width:100%;padding:8px 10px;border:1px solid #aaa;border-radius:4px;font-size:0.88rem">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:3px">Pincode *</label>
            <input id="addr_pincode" type="text" placeholder="6-digit" maxlength="6"
              style="width:100%;padding:8px 10px;border:1px solid #aaa;border-radius:4px;font-size:0.88rem">
          </div>
        </div>

        <div style="margin-bottom:16px">
          <label style="font-size:0.8rem;font-weight:700;display:block;margin-bottom:3px">Landmark (Optional)</label>
          <input id="addr_landmark" type="text" placeholder="e.g. Near City Mall"
            style="width:100%;padding:8px 10px;border:1px solid #aaa;border-radius:4px;font-size:0.88rem">
        </div>

        <button onclick="confirmAddress()"
          style="width:100%;padding:11px;background:#ffd814;border:1px solid #fcd200;border-radius:4px;font-size:0.95rem;font-weight:700;cursor:pointer">
          Continue to Payment →
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function confirmAddress(){
  const name    = document.getElementById("addr_name")?.value.trim();
  const phone   = document.getElementById("addr_phone")?.value.trim();
  const street  = document.getElementById("addr_street")?.value.trim();
  const city    = document.getElementById("addr_city")?.value.trim();
  const state   = document.getElementById("addr_state")?.value.trim();
  const pincode = document.getElementById("addr_pincode")?.value.trim();
  const landmark= document.getElementById("addr_landmark")?.value.trim();

  const errEl = document.getElementById("addrMsg");
  function showAddrErr(msg){ errEl.textContent = msg; errEl.style.display = "block"; }

  if(!name)    return showAddrErr("Please enter your full name");
  if(!phone || !/^\d{10}$/.test(phone)) return showAddrErr("Please enter a valid 10-digit phone number");
  if(!street)  return showAddrErr("Please enter your street address");
  if(!city)    return showAddrErr("Please enter your city");
  if(!state)   return showAddrErr("Please enter your state");
  if(!pincode || !/^\d{6}$/.test(pincode)) return showAddrErr("Please enter a valid 6-digit pincode");

  // Save address to localStorage for next time
  const address = { name, phone, street, city, state, pincode, landmark };
  localStorage.setItem("savedAddress", JSON.stringify(address));

  // Close address modal
  document.getElementById("addressModal")?.remove();

  // Now proceed to payment or COD
  if(_pendingMethod === "Online Payment"){
    openPayModal(_pendingCart, _pendingMethod, address);
  } else {
    showCODConfirm(_pendingCart, address);
  }
}

/* ══════════════════════════════════════════════════════════
   PAYMENT MODAL  (Online – Razorpay style)
══════════════════════════════════════════════════════════ */
let _address = null;

function openPayModal(cart, method, address){
  _pendingCart   = cart;
  _pendingMethod = method;
  _address       = address;

  const total = cart.reduce((s,i) => s + i.price * i.quantity, 0);
  const el    = document.getElementById("payAmountDisplay");
  if(el) el.textContent = "₹" + total.toLocaleString("en-IN");

  // Reset modal body to online payment form
  const modal = document.getElementById("paymentModal");
  if(!modal) return;
  const body = modal.querySelector(".modal-body");
  body.innerHTML = `
    <div class="pay-amount">Pay <span id="payAmountDisplay">₹${total.toLocaleString("en-IN")}</span></div>
    <div class="pay-methods">
      <div class="pay-method active" onclick="selectPayMethod('card',this)"><span class="pm-icon">💳</span><span>Card</span></div>
      <div class="pay-method" onclick="selectPayMethod('upi',this)"><span class="pm-icon">📱</span><span>UPI</span></div>
      <div class="pay-method" onclick="selectPayMethod('netbank',this)"><span class="pm-icon">🏦</span><span>Netbanking</span></div>
      <div class="pay-method" onclick="selectPayMethod('wallet',this)"><span class="pm-icon">👛</span><span>Wallet</span></div>
    </div>
    <div id="form-card" class="pay-form">
      <input type="text" placeholder="Card number  e.g. 4111 1111 1111 1111" maxlength="19">
      <input type="text" placeholder="Cardholder Name">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <input type="text" placeholder="MM / YY" maxlength="5">
        <input type="text" placeholder="CVV" maxlength="3">
      </div>
    </div>
    <div id="form-upi" class="pay-form" style="display:none"><input type="text" placeholder="UPI ID  e.g. yourname@upi"></div>
    <div id="form-netbank" class="pay-form" style="display:none">
      <select style="width:100%;padding:9px;border:1px solid #ccc;border-radius:4px;font-size:0.88rem">
        <option>Select Bank</option><option>SBI</option><option>HDFC</option><option>ICICI</option><option>Axis</option><option>Kotak</option>
      </select>
    </div>
    <div id="form-wallet" class="pay-form" style="display:none">
      <select style="width:100%;padding:9px;border:1px solid #ccc;border-radius:4px;font-size:0.88rem">
        <option>Select Wallet</option><option>Paytm</option><option>PhonePe</option><option>Amazon Pay</option>
      </select>
    </div>
    <div style="margin-bottom:12px;padding:10px;background:#f8f8f8;border-radius:6px;font-size:0.8rem;color:#555">
      📍 Delivering to: <b>${address.street}, ${address.city}, ${address.state} – ${address.pincode}</b>
    </div>
    <button class="pay-btn" onclick="processPayment()">🔒 Pay Securely</button>
    <p class="secure-note">🛡 256-bit SSL Encrypted &amp; Secure</p>`;

  modal.classList.add("open");
}

function closePayModal(){
  document.getElementById("paymentModal")?.classList.remove("open");
}

function selectPayMethod(type, el){
  document.querySelectorAll(".pay-method").forEach(m => m.classList.remove("active"));
  el.classList.add("active");
  ["card","upi","netbank","wallet"].forEach(t => {
    const f = document.getElementById("form-" + t);
    if(f) f.style.display = t === type ? "block" : "none";
  });
}

function processPayment(){
  const btn = document.querySelector(".pay-btn");
  if(btn){ btn.textContent = "⏳ Processing…"; btn.disabled = true; }
  setTimeout(() => {
    closePayModal();
    submitOrder(_pendingCart, _pendingMethod, _address);
  }, 2000);
}

/* ══════════════════════════════════════════════════════════
   COD CONFIRM  (separate — no Razorpay modal)   ← FIXED
══════════════════════════════════════════════════════════ */
function showCODConfirm(cart, address){
  _address = address;          // ← FIX: save address so confirmCOD() can use it
  const total = cart.reduce((s,i) => s + i.price * i.quantity, 0);

  const old = document.getElementById("codModal");
  if(old) old.remove();

  const modal = document.createElement("div");
  modal.id = "codModal";
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.55);
    z-index:11000;display:flex;align-items:center;justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:white;border-radius:8px;width:420px;max-width:95vw;overflow:hidden;animation:slideUp 0.3s ease">
      <div style="background:#232f3e;color:white;padding:16px 20px;display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:1rem;font-weight:700">🚚 Cash on Delivery</div>
        <button onclick="document.getElementById('codModal').remove()"
          style="background:none;border:none;color:white;font-size:1.3rem;cursor:pointer">✕</button>
      </div>
      <div style="padding:24px;text-align:center">
        <span style="font-size:3rem;display:block;margin-bottom:10px">🚚</span>
        <h3 style="margin-bottom:8px;color:#131921">Confirm Your Order</h3>
        <p style="color:#555;font-size:0.88rem;margin-bottom:4px">Amount payable at delivery:</p>
        <p style="font-size:1.8rem;font-weight:700;color:#B12704;margin-bottom:14px">₹${total.toLocaleString("en-IN")}</p>
        <div style="background:#f8f8f8;border-radius:6px;padding:12px;margin-bottom:18px;text-align:left;font-size:0.82rem;color:#555">
          <b>📍 Delivery Address:</b><br>
          ${address.name} • ${address.phone}<br>
          ${address.street}<br>
          ${address.city}, ${address.state} – ${address.pincode}
          ${address.landmark ? "<br>Near: " + address.landmark : ""}
        </div>
        <div style="display:flex;gap:10px;justify-content:center">
          <button onclick="confirmCOD()"
            style="padding:12px 30px;background:#ffa41c;border:1px solid #fa8900;border-radius:20px;font-size:1rem;font-weight:700;cursor:pointer">
            ✅ Confirm Order
          </button>
          <button onclick="document.getElementById('codModal').remove()"
            style="padding:12px 24px;border:1px solid #ccc;border-radius:20px;font-size:1rem;cursor:pointer;background:white">
            Cancel
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function confirmCOD(){
  document.getElementById("codModal")?.remove();
  submitOrder(_pendingCart, _pendingMethod, _address);
}

/* ══════════════════════════════════════════════════════════
   PLACE ORDER  (entry point from cart buttons)
══════════════════════════════════════════════════════════ */
function placeOrder(method){
  if(!isLoggedIn()){
    showToast("Please sign in to place an order", "error");
    setTimeout(() => window.location.href = "login.html", 1200);
    return;
  }
  const cart = getCart();
  if(!cart.length){ showToast("Your cart is empty", "error"); return; }

  _pendingMethod = method;

  // Pre-fill saved address if available
  const saved = JSON.parse(localStorage.getItem("savedAddress") || "null");
  showAddressModal(cart, method);

  // Pre-fill inputs after modal renders
  setTimeout(() => {
    if(saved){
      if(document.getElementById("addr_phone"))   document.getElementById("addr_phone").value   = saved.phone   || "";
      if(document.getElementById("addr_street"))  document.getElementById("addr_street").value  = saved.street  || "";
      if(document.getElementById("addr_city"))    document.getElementById("addr_city").value    = saved.city    || "";
      if(document.getElementById("addr_state"))   document.getElementById("addr_state").value   = saved.state   || "";
      if(document.getElementById("addr_pincode")) document.getElementById("addr_pincode").value = saved.pincode || "";
      if(document.getElementById("addr_landmark"))document.getElementById("addr_landmark").value= saved.landmark|| "";
    }
  }, 50);
}

/* ══════════════════════════════════════════════════════════
   SUBMIT ORDER  (sends to backend)
══════════════════════════════════════════════════════════ */
function submitOrder(cart, paymentMethod, address){
  fetch(API + "/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ items: cart, paymentMethod, shippingAddress: address })
  })
  .then(r => r.json())
  .then(d => {
    if(d.order){
      localStorage.setItem("lastOrder", JSON.stringify(d.order));
      saveCart([]);
      showToast("✅ Order placed successfully!", "success");
      setTimeout(() => window.location.href = "orders.html", 1200);
    } else {
      showToast(d.message || "Order failed. Try again.", "error");
    }
  })
  .catch(() => showToast("❌ Server error. Is backend running on port 5000?", "error"));
}

/* ══════════════════════════════════════════════════════════
   CART PAGE RENDER
══════════════════════════════════════════════════════════ */
function renderCart(){
  const container = document.getElementById("cart-container");
  const totalArea = document.getElementById("total-price");
  if(!container) return;

  const cart = getCart();
  if(!cart.length){
    container.innerHTML = `
      <div class="empty-cart">
        <span class="big-icon">🛒</span>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <a href="index.html" class="back-home-btn">Continue Shopping</a>
      </div>`;
    if(totalArea) totalArea.innerHTML = "";
    return;
  }

  let html = "", total = 0;
  cart.forEach((item, idx) => {
    const sub = item.price * item.quantity;
    total += sub;
    html += `
      <div class="cart-item">
        <div class="cart-item-img" style="background-image:url('${item.image}')"></div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString("en-IN")} each</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
            <button class="remove-link" onclick="removeFromCart(${idx})">Remove</button>
          </div>
          <div style="font-size:0.82rem;color:#555;margin-top:6px">Subtotal: <b>₹${sub.toLocaleString("en-IN")}</b></div>
        </div>
      </div>`;
  });
  container.innerHTML = html;

  const count = cart.reduce((s,i) => s + i.quantity, 0);
  if(totalArea) totalArea.innerHTML = `
    <div class="cart-subtotal">
      Subtotal (${count} item${count > 1 ? "s" : ""}):<br>
      <span class="amt">₹${total.toLocaleString("en-IN")}</span>
    </div>`;
}

function changeQty(idx, delta){
  let cart = getCart();
  cart[idx].quantity = Math.max(1, cart[idx].quantity + delta);
  saveCart(cart); renderCart();
}
function removeFromCart(idx){
  let cart = getCart(); cart.splice(idx, 1);
  saveCart(cart); renderCart();
  showToast("Item removed", "info");
}

/* ══════════════════════════════════════════════════════════
   ORDERS PAGE
══════════════════════════════════════════════════════════ */
function renderOrders(){
  const container = document.getElementById("ordersContainer");
  if(!container) return;

  if(!isLoggedIn()){
    container.innerHTML = `
      <div style="text-align:center;padding:40px">
        <p>Please <a href="login.html" style="color:#007185">sign in</a> to view your orders.</p>
      </div>`;
    return;
  }

  container.innerHTML = `<p style="color:#555;padding:20px">Loading orders…</p>`;

  fetch(API + "/orders/my-orders", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
  .then(r => r.json())
  .then(orders => {
    if(!orders.length){
      container.innerHTML = `
        <div style="text-align:center;padding:60px">
          <span style="font-size:4rem;display:block;margin-bottom:14px">📦</span>
          <h3 style="margin-bottom:8px">No orders yet</h3>
          <a href="index.html" style="color:#007185">Start shopping →</a>
        </div>`;
      return;
    }

    const steps = ["Placed","Processing","Shipped","Delivered"];
    container.innerHTML = orders.map(order => {
      const date = new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
      const si   = steps.indexOf(order.status);

      const trackHTML = order.status !== "Cancelled" ? `
        <div class="track-bar">
          ${steps.map((s,i) => `
            <div class="track-step">
              <div class="track-dot ${i < si ? "done" : i === si ? "active" : ""}"></div>
              <div class="track-label">${s}</div>
            </div>
            ${i < steps.length-1 ? `<div class="track-line ${i < si ? "done" : ""}"></div>` : ""}
          `).join("")}
        </div>` : "";

      const addr = order.shippingAddress;
      const addrHTML = addr && addr.city ? `
        <div style="background:#f8f8f8;border-radius:6px;padding:10px;margin:8px 0;font-size:0.8rem;color:#555">
          📍 <b>Delivery Address:</b> ${addr.street || ""}, ${addr.city}, ${addr.state} – ${addr.pincode}
        </div>` : "";

      const itemsHTML = order.items.map(item => `
        <div class="order-item-row">
          <div class="order-item-img" style="background-image:url('${item.image || ""}')"></div>
          <div class="order-item-info">
            <div class="name">${item.name}</div>
            <div class="detail">Qty: ${item.quantity} &nbsp;|&nbsp; ₹${Number(item.price).toLocaleString("en-IN")}</div>
          </div>
        </div>`).join("");

      return `
        <div class="order-card">
          <div class="order-header">
            <div class="order-header-cell"><div class="lbl">Order Placed</div><div class="val">${date}</div></div>
            <div class="order-header-cell"><div class="lbl">Total</div><div class="val">₹${Number(order.totalAmount).toLocaleString("en-IN")}</div></div>
            <div class="order-header-cell"><div class="lbl">Payment</div><div class="val">${order.paymentMethod}</div></div>
            <div class="order-id-text">#${order._id}</div>
          </div>
          <div class="order-body">
            <div style="margin-bottom:8px"><span class="status-badge s-${order.status}">${order.status}</span></div>
            ${trackHTML}
            ${addrHTML}
            ${itemsHTML}
            <div class="order-actions">
              ${order.status !== "Cancelled" && order.status !== "Delivered"
                ? `<button class="cancel-order-btn" onclick="cancelOrder('${order._id}')">Cancel Order</button>` : ""}
              <button class="invoice-link-btn" onclick="viewInvoice('${order._id}')">🧾 View Invoice</button>
            </div>
          </div>
        </div>`;
    }).join("");
  })
  .catch(() => {
    container.innerHTML = `<p style="color:red;padding:20px">Failed to load orders. Make sure backend is running on port 5000.</p>`;
  });
}

function cancelOrder(orderId){
  if(!confirm("Are you sure you want to cancel this order?")) return;
  fetch(API + "/orders/" + orderId + "/cancel", {
    method: "PUT",
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
  .then(r => r.json())
  .then(d => { showToast(d.message, "info"); setTimeout(renderOrders, 700); })
  .catch(() => showToast("Cancel failed", "error"));
}

function viewInvoice(orderId){
  localStorage.setItem("invoiceOrderId", orderId);
  window.location.href = "invoice.html";
}

/* ══════════════════════════════════════════════════════════
   INVOICE PAGE
══════════════════════════════════════════════════════════ */
function renderInvoice(){
  const box = document.getElementById("invoiceBox");
  if(!box) return;

  const orderId = localStorage.getItem("invoiceOrderId");
  const last    = JSON.parse(localStorage.getItem("lastOrder") || "null");

  if(last && (!orderId || last._id === orderId)){
    buildInvoice(box, last); return;
  }
  if(!orderId || !isLoggedIn()){
    box.innerHTML = `<p>No order found. <a href="orders.html">Go to Orders</a></p>`; return;
  }

  box.innerHTML = "<p>Loading invoice…</p>";
  fetch(API + "/orders/" + orderId, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
  .then(r => r.json())
  .then(order => buildInvoice(box, order))
  .catch(() => { box.innerHTML = "<p>Failed to load invoice.</p>"; });
}

function buildInvoice(box, order){
  const date = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  const addr = order.shippingAddress;
  const addrLine = addr && addr.city
    ? `${addr.street || ""}, ${addr.city}, ${addr.state} – ${addr.pincode}`
    : "N/A";

  const rows = order.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">₹${Number(i.price).toLocaleString("en-IN")}</td>
      <td style="text-align:right">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  box.innerHTML = `
    <div class="invoice-top">
      <div>
        <h2>📄 INVOICE</h2>
        <p>Date: ${date}</p>
        <p>Order ID: ${order._id}</p>
      </div>
      <div style="text-align:right">
        <div style="font-size:1.5rem;font-weight:700;color:#131921">amazon<span style="color:#ff9900">clone</span></div>
        <div style="font-size:0.8rem;color:#666">amazon-clone.in</div>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-meta-item"><div class="lbl">Payment Method</div><div class="val">${order.paymentMethod}</div></div>
      <div class="invoice-meta-item"><div class="lbl">Order Status</div><div class="val">${order.status || "Placed"}</div></div>
      <div class="invoice-meta-item"><div class="lbl">Customer</div><div class="val">${localStorage.getItem("userName") || "Customer"}</div></div>
      <div class="invoice-meta-item"><div class="lbl">Delivery Address</div><div class="val">${addrLine}</div></div>
    </div>
    <table class="invoice-table">
      <thead>
        <tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="3" style="text-align:right;font-weight:700">Grand Total</td>
          <td style="text-align:right;font-weight:700;color:#B12704">₹${Number(order.totalAmount).toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button class="print-btn" onclick="window.print()">🖨 Print Invoice</button>
      <button class="back-btn" onclick="window.location.href='orders.html'">← Back to Orders</button>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   WISHLIST PAGE
══════════════════════════════════════════════════════════ */
function renderWishlist(){
  const grid = document.getElementById("wishlistGrid");
  if(!grid) return;

  const wl = getWishlist();
  if(!wl.length){
    grid.innerHTML = `
      <div class="empty-wishlist">
        <span class="big-icon">❤️</span>
        <h3 style="margin-bottom:8px">Your wishlist is empty</h3>
        <a href="index.html" style="color:#007185">Start adding items →</a>
      </div>`;
    return;
  }

  grid.innerHTML = wl.map((item, idx) => `
    <div class="wishlist-card">
      <div class="wishlist-card-img" style="background-image:url('${item.image}')"></div>
      <h3>${item.name}</h3>
      <div class="price">₹${Number(item.price).toLocaleString("en-IN")}</div>
      <div class="wishlist-card-actions">
        <button class="wishlist-add-btn" onclick="addToCart('${item.name}',${item.price},'${item.image}',this)">Add to Cart</button>
        <button class="wishlist-remove-btn" onclick="removeWishlistItem(${idx})">✕ Remove</button>
      </div>
    </div>`).join("");
}

function removeWishlistItem(idx){
  let wl = getWishlist(); wl.splice(idx, 1);
  saveWishlist(wl); renderWishlist();
}

/* ══════════════════════════════════════════════════════════
   PAGE INIT
══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function(){
  initNavbar();
  syncWishlistButtons();
  renderCart();
  renderOrders();
  renderInvoice();
  renderWishlist();
});