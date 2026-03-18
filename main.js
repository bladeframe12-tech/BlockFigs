/* ═══════════════════════════════════════════════════════
   BlockFigs — main.js
   EmailJS Public Key : tq8vaamQ8OqaghTBi  (loaded in index.html head)
   EmailJS Service ID : service_4573wtn
   EmailJS Template ID: template_r0xrxii
   PayPal Client ID   : AV1vhhsniMX3TE8aGQ4UNLGeNlfpsWdAZoVTBJ9VvQr9qq2b57icmxGXjUYjev42Qogyl1qu9rH85_mN
═══════════════════════════════════════════════════════ */

const EMAILJS_SERVICE  = "service_4573wtn";
const EMAILJS_TEMPLATE = "template_r0xrxii";

// Tracks whether PayPal button was already clicked (prevent double payment)
let paypalClicked = false;

// Currently selected product
let selectedProduct = {
  id:    "2inch",
  name:  "2 Inch Roblox Figure",
  price: "45.00",
  label: "$45.00"
};

// ── SELECT PRODUCT ─────────────────────────────────────
function selectProduct(id) {
  selectedProduct = id === "3inch"
    ? { id:"3inch", name:"3 Inch Roblox Figure", price:"60.00", label:"$60.00" }
    : { id:"2inch", name:"2 Inch Roblox Figure", price:"45.00", label:"$45.00" };

  const tab2 = document.getElementById("tab-2inch");
  const tab3 = document.getElementById("tab-3inch");
  tab2.className = id === "2inch" ? "ptab active-or" : "ptab";
  tab3.className = id === "3inch" ? "ptab active-pu" : "ptab";
  tab2.querySelector(".ptab-price").style.color = id === "2inch" ? "var(--or)"  : "var(--mu)";
  tab3.querySelector(".ptab-price").style.color = id === "3inch" ? "#a855f7" : "var(--mu)";

  document.getElementById("asideProductName").textContent  = selectedProduct.name;
  document.getElementById("asideProductPrice").textContent = selectedProduct.label;
  document.getElementById("asideTotalPrice").textContent   = selectedProduct.label;

  document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── NAVBAR ─────────────────────────────────────────────
const navbar   = document.getElementById("navbar");
const burger   = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 30);
});

burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  const s = burger.querySelectorAll("span");
  if (open) {
    s[0].style.transform = "translateY(7px) rotate(45deg)";
    s[1].style.opacity   = "0";
    s[2].style.transform = "translateY(-7px) rotate(-45deg)";
  } else {
    s.forEach(x => { x.style.transform = ""; x.style.opacity = ""; });
  }
});

document.addEventListener("click", e => {
  if (!navbar.contains(e.target) && navLinks.classList.contains("open")) closeMenu();
});

function closeMenu() {
  navLinks.classList.remove("open");
  burger.querySelectorAll("span").forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
}

// ── SCROLL REVEAL ──────────────────────────────────────
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = "revUp 0.55s ease both";
      e.target.style.opacity   = "1";
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".prod-card, .faq-item, .aside, .oform, .policy-card").forEach(el => {
  el.style.opacity = "0";
  revObs.observe(el);
});

// ── FAQ ────────────────────────────────────────────────
function toggleFaq(btn) {
  const item    = btn.parentElement;
  const wasOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
  if (!wasOpen) item.classList.add("open");
}

// ── ESCAPE HTML (XSS protection) ──────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── FORM VALIDATION ────────────────────────────────────
const FIELDS = [
  { id:"fullName",   label:"Full name"       },
  { id:"email",      label:"Email address"   },
  { id:"robloxUser", label:"Roblox username" },
  { id:"address",    label:"Street address"  },
  { id:"city",       label:"City"            },
  { id:"state",      label:"State/Province"  },
  { id:"zip",        label:"ZIP code"        },
  { id:"country",    label:"Country"         },
];

function showErr(id, msg) {
  const el  = document.getElementById(id);
  const err = document.getElementById("err-" + id);
  if (el)  el.classList.add("err");
  if (err) err.textContent = msg;
}

function clearErr(id) {
  const el  = document.getElementById(id);
  const err = document.getElementById("err-" + id);
  if (el)  el.classList.remove("err");
  if (err) err.textContent = "";
}

function validateForm() {
  let valid = true;
  FIELDS.forEach(({ id, label }) => {
    clearErr(id);
    const val = (document.getElementById(id)?.value || "").trim();
    if (!val) {
      showErr(id, `${label} is required.`);
      valid = false;
      return;
    }
    if (id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showErr(id, "Enter a valid email address.");
      valid = false;
      return;
    }
    if (id === "robloxUser" && !/^[a-zA-Z0-9_]{3,20}$/.test(val)) {
      showErr(id, "3-20 characters: letters, numbers, underscores only.");
      valid = false;
    }
  });
  return valid;
}

FIELDS.forEach(({ id }) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => clearErr(id));
});

// ── COLLECT ORDER DATA ─────────────────────────────────
function getOrderData() {
  return {
    product_name:     selectedProduct.name,
    price:            "$" + selectedProduct.price,
    customer_name:    document.getElementById("fullName").value.trim(),
    customer_email:   document.getElementById("email").value.trim(),
    roblox_username:  document.getElementById("robloxUser").value.trim(),
    shipping_address: [
      document.getElementById("address").value.trim(),
      document.getElementById("city").value.trim(),
      document.getElementById("state").value.trim(),
      document.getElementById("zip").value.trim(),
      document.getElementById("country").value.trim()
    ].join(", "),
    notes: document.getElementById("notes").value.trim() || "None",
    order_date: new Date().toLocaleString("en-US", {
      weekday:"long", year:"numeric", month:"long",
      day:"numeric", hour:"2-digit", minute:"2-digit"
    }),
  };
}

// ── LOADING ────────────────────────────────────────────
function setLoading(on) {
  document.getElementById("loading").classList.toggle("show", on);
}

// ── PAYPAL BUTTONS ─────────────────────────────────────
paypal.Buttons({
  style: { layout:"vertical", color:"blue", shape:"rect", label:"pay", height:50 },

  // Step 1 — validate form + spam check + send email BEFORE PayPal opens
  onClick: async function(data, actions) {

    // Honeypot spam check
    if (document.getElementById("honeypot").value !== "") {
      return actions.reject();
    }

    // Prevent double click
    if (paypalClicked) {
      return actions.reject();
    }

    // Validate form fields
    if (!validateForm()) {
      const firstErr = document.querySelector(".err");
      if (firstErr) firstErr.scrollIntoView({ behavior:"smooth", block:"center" });
      const form = document.querySelector(".oform");
      form.style.animation = "none";
      void form.offsetHeight;
      form.style.animation = "shake 0.4s ease";
      setTimeout(() => { form.style.animation = ""; }, 400);
      return actions.reject();
    }

    // Lock button
    paypalClicked = true;
    document.getElementById("paypal-button-container").classList.add("disabled");

    // Send order email via EmailJS
    setLoading(true);
    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, getOrderData());
      console.log("✅ Order email sent to mounirbenji12@gmail.com");
      setLoading(false);
      return actions.resolve(); // allow PayPal to open
    } catch (e) {
      // EMAIL FAILED — block payment so order is not lost
      console.error("❌ EmailJS error:", e);
      setLoading(false);
      paypalClicked = false;
      document.getElementById("paypal-button-container").classList.remove("disabled");
      document.getElementById("ppNote").textContent = "Error sending order details. Please try again.";
      document.getElementById("ppNote").style.color = "#f44336";
      alert("There was an error sending your order details. Please try again. If the problem continues, contact mounirbenji12@gmail.com");
      return actions.reject();
    }
  },

  // Step 2 — create PayPal order at correct price
  createOrder: function(data, actions) {
    const order = getOrderData();
    return actions.order.create({
      purchase_units: [{
        amount: { value: selectedProduct.price, currency_code: "USD" },
        description: `${selectedProduct.name} - @${order.roblox_username}`,
        custom_id: `roblox:${order.roblox_username}|name:${order.customer_name}|product:${selectedProduct.name}`,
      }]
    });
  },

  // Step 3 — payment approved, show confirmation
  onApprove: function(data, actions) {
    return actions.order.capture().then(function() {
      showConfirmation(getOrderData());
    });
  },

  onError: function(err) {
    console.error("PayPal error:", err);
    setLoading(false);
    paypalClicked = false;
    document.getElementById("paypal-button-container").classList.remove("disabled");
    alert("Payment error. Please try again or contact mounirbenji12@gmail.com");
  },

  onCancel: function() {
    paypalClicked = false;
    document.getElementById("paypal-button-container").classList.remove("disabled");
    document.getElementById("ppNote").textContent = "Payment cancelled. Click Pay again when ready.";
  }

}).render("#paypal-button-container");

// ── SHOW CONFIRMATION ──────────────────────────────────
function showConfirmation(order) {
  document.getElementById("order").style.display = "none";
  const sec = document.getElementById("confirmSec");
  sec.style.display = "block";

  document.getElementById("confirmMsg").innerHTML =
    `Thank you! Your <strong>${esc(order.product_name)}</strong> will be 3D printed using the Roblox username: <strong>${esc(order.roblox_username)}</strong>. We have received your full order details.`;

  document.getElementById("confirmDetails").innerHTML = `
    <div class="cdr"><span class="cl">Product</span><span class="cv cv-or">${esc(order.product_name)}</span></div>
    <div class="cdr"><span class="cl">Price</span><span class="cv cv-or">${esc(order.price)}</span></div>
    <div class="cdr"><span class="cl">Name</span><span class="cv">${esc(order.customer_name)}</span></div>
    <div class="cdr"><span class="cl">Email</span><span class="cv">${esc(order.customer_email)}</span></div>
    <div class="cdr"><span class="cl">Roblox Username</span><span class="cv cv-or">${esc(order.roblox_username)}</span></div>
    <div class="cdr"><span class="cl">Ship To</span><span class="cv">${esc(order.shipping_address)}</span></div>
    <div class="cdr"><span class="cl">Date</span><span class="cv">${esc(order.order_date)}</span></div>
    ${order.notes !== "None" ? `<div class="cdr"><span class="cl">Notes</span><span class="cv">${esc(order.notes)}</span></div>` : ""}
  `;

  sec.scrollIntoView({ behavior:"smooth", block:"start" });
}

// ── RESET ORDER (back to store) ────────────────────────
function resetOrder() {
  document.getElementById("orderForm").reset();
  document.getElementById("confirmSec").style.display = "none";
  document.getElementById("order").style.display = "block";
  paypalClicked = false;
  document.getElementById("paypal-button-container").classList.remove("disabled");
  document.getElementById("ppNote").textContent = "Clicking Pay will send your order details to us, then open PayPal.";
  document.getElementById("ppNote").style.color = "";
  window.scrollTo({ top:0, behavior:"smooth" });
}
