/* ================================================================
   BlockFigs — main.js
   
   WHAT THIS FILE DOES:
   1. Navbar scroll effect
   2. Mobile hamburger menu toggle
   3. Order form validation
   4. Captures Roblox username & customer info
   5. Submits order to PayPal
   6. Shows confirmation screen with order details
   
   SETUP CHECKLIST:
   [ ] Replace PAYPAL_EMAIL with your actual PayPal email
   [ ] Update STORE_URL with your GitHub Pages URL
   [ ] Optionally enable EmailJS to receive order notifications
   ================================================================ */

// ================================================================
// CONFIGURATION — EDIT THESE VALUES
// ================================================================

const CONFIG = {
  // REPLACE: Your PayPal email address (must be a PayPal Business or Personal account)
  PAYPAL_EMAIL: "YOUR_PAYPAL_EMAIL@example.com",

  // REPLACE: Your GitHub Pages URL (e.g. "https://yourname.github.io/roblox-store")
  STORE_URL: "YOUR_STORE_URL",

  // Product details
  PRODUCT_NAME: "Custom 3-Inch Roblox Avatar Figure",
  PRODUCT_PRICE: "15.00",
  CURRENCY: "USD",

  // OPTIONAL: Set to true and configure EmailJS if you want email notifications
  // See: https://www.emailjs.com/ (free tier available)
  USE_EMAILJS: false,
  EMAILJS_SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
  EMAILJS_TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
  EMAILJS_USER_ID: "YOUR_EMAILJS_USER_ID",
};

// ================================================================
// NAVBAR — Scroll effect & mobile menu
// ================================================================

const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

// Add "scrolled" class to navbar when user scrolls down
window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Toggle mobile menu
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  // Animate hamburger lines
  const spans = hamburger.querySelectorAll("span");
  if (navLinks.classList.contains("open")) {
    spans[0].style.transform = "translateY(7px) rotate(45deg)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
  } else {
    spans.forEach((s) => {
      s.style.transform = "";
      s.style.opacity = "";
    });
  }
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains("open")) {
    closeMenu();
  }
});

function closeMenu() {
  navLinks.classList.remove("open");
  const spans = hamburger.querySelectorAll("span");
  spans.forEach((s) => {
    s.style.transform = "";
    s.style.opacity = "";
  });
}

// ================================================================
// FORM VALIDATION & SUBMISSION
// ================================================================

const orderForm = document.getElementById("orderForm");

// Fields to validate: [fieldId, errorId, label]
const fields = [
  ["fullName", "fullNameError", "Full name"],
  ["email", "emailError", "Email address"],
  ["robloxUsername", "robloxUsernameError", "Roblox username"],
  ["address", "addressError", "Street address"],
  ["city", "cityError", "City"],
  ["state", "stateError", "State / Province"],
  ["zip", "zipError", "ZIP / Postal code"],
  ["country", "countryError", "Country"],
];

// Validate a single field, return true if valid
function validateField(fieldId, errorId, label) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  const value = field.value.trim();

  // Clear previous error
  field.classList.remove("error");
  error.textContent = "";

  if (!value) {
    field.classList.add("error");
    error.textContent = `${label} is required.`;
    return false;
  }

  // Email format check
  if (fieldId === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      field.classList.add("error");
      error.textContent = "Please enter a valid email address.";
      return false;
    }
  }

  // Roblox username length check (3–20 chars, alphanumeric + underscore)
  if (fieldId === "robloxUsername") {
    const robloxRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!robloxRegex.test(value)) {
      field.classList.add("error");
      error.textContent =
        "Roblox usernames are 3–20 characters (letters, numbers, underscores only).";
      return false;
    }
  }

  return true;
}

// Live validation on blur (when user leaves a field)
fields.forEach(([fieldId, errorId, label]) => {
  const field = document.getElementById(fieldId);
  if (field) {
    field.addEventListener("blur", () => validateField(fieldId, errorId, label));
    field.addEventListener("input", () => {
      // Clear error as user types
      document.getElementById(errorId).textContent = "";
      field.classList.remove("error");
    });
  }
});

// Form submit handler
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validate all fields
  let allValid = true;
  fields.forEach(([fieldId, errorId, label]) => {
    if (!validateField(fieldId, errorId, label)) {
      allValid = false;
    }
  });

  if (!allValid) {
    // Scroll to first error
    const firstError = orderForm.querySelector(".error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  // Gather form data
  const orderData = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    robloxUsername: document.getElementById("robloxUsername").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    zip: document.getElementById("zip").value.trim(),
    country: document.getElementById("country").value,
    notes: document.getElementById("notes").value.trim(),
  };

  // Store order data in sessionStorage so confirmation page can read it
  // (clears when browser tab is closed)
  sessionStorage.setItem("blockfigs_order", JSON.stringify(orderData));

  // Optional: Send email notification via EmailJS
  if (CONFIG.USE_EMAILJS && typeof emailjs !== "undefined") {
    sendEmailNotification(orderData);
  }

  // Submit PayPal form
  submitToPayPal(orderData);
});

// ================================================================
// PAYPAL SUBMISSION
// ================================================================

function submitToPayPal(orderData) {
  const paypalForm = document.getElementById("paypalForm");

  // Update PayPal form fields
  document.getElementById("paypalBusiness").value = CONFIG.PAYPAL_EMAIL;
  document.getElementById("paypalItemName").value = CONFIG.PRODUCT_NAME;

  // Pass Roblox username + customer name in the "custom" field
  // This appears in your PayPal transaction details
  document.getElementById("paypalCustom").value =
    `Roblox: ${orderData.robloxUsername} | Name: ${orderData.fullName} | Email: ${orderData.email} | Ship to: ${orderData.address}, ${orderData.city}, ${orderData.state} ${orderData.zip}, ${orderData.country}`;

  // Update return URLs
  paypalForm.querySelector('[name="return"]').value =
    `${CONFIG.STORE_URL}/index.html#confirmation`;
  paypalForm.querySelector('[name="cancel_return"]').value =
    `${CONFIG.STORE_URL}/index.html#order`;

  // Show confirmation section immediately (for users who complete PayPal)
  // NOTE: For a production store, use PayPal IPN/webhooks to verify payment
  // before showing confirmation. This shows a preview confirmation.
  showConfirmation(orderData);

  // Submit the PayPal form in a new tab
  // Comment out the line below if you want to redirect in same tab:
  paypalForm.target = "_blank";
  paypalForm.submit();
}

// ================================================================
// ORDER CONFIRMATION DISPLAY
// ================================================================

function showConfirmation(orderData) {
  // Hide order section, show confirmation
  document.getElementById("order").style.display = "none";
  const confirmSection = document.getElementById("confirmation");
  confirmSection.style.display = "block";

  // Build confirmation details HTML
  const detailsHTML = `
    <div class="confirm-detail-row">
      <span class="label">Name</span>
      <span class="value">${escapeHTML(orderData.fullName)}</span>
    </div>
    <div class="confirm-detail-row">
      <span class="label">Email</span>
      <span class="value">${escapeHTML(orderData.email)}</span>
    </div>
    <div class="confirm-detail-row">
      <span class="label">🎮 Roblox Username</span>
      <span class="value confirm-roblox">${escapeHTML(orderData.robloxUsername)}</span>
    </div>
    <div class="confirm-detail-row">
      <span class="label">Ship To</span>
      <span class="value">${escapeHTML(orderData.address)}, ${escapeHTML(orderData.city)}, ${escapeHTML(orderData.state)} ${escapeHTML(orderData.zip)}</span>
    </div>
    <div class="confirm-detail-row">
      <span class="label">Product</span>
      <span class="value">${CONFIG.PRODUCT_NAME}</span>
    </div>
    <div class="confirm-detail-row">
      <span class="label">Total</span>
      <span class="value" style="color: var(--primary); font-size: 1.1rem;">$${CONFIG.PRODUCT_PRICE}</span>
    </div>
    ${orderData.notes ? `
    <div class="confirm-detail-row">
      <span class="label">Notes</span>
      <span class="value">${escapeHTML(orderData.notes)}</span>
    </div>` : ""}
  `;

  document.getElementById("confirmDetails").innerHTML = detailsHTML;

  // Smooth scroll to confirmation
  confirmSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Prevent XSS by escaping HTML special chars
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ================================================================
// AFFILIATE SECTION — Share button toggle
// ================================================================

const shareBtn = document.getElementById("shareBtn");
const shareOptions = document.getElementById("shareOptions");

shareBtn.addEventListener("click", () => {
  const isOpen = shareOptions.style.display !== "none";
  shareOptions.style.display = isOpen ? "none" : "block";
  shareBtn.innerHTML = isOpen
    ? '<i class="fas fa-share-alt"></i> Share This Store'
    : '<i class="fas fa-times"></i> Close';
});

// Copy store link to clipboard
function copyLink() {
  const url = CONFIG.STORE_URL || window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      const btn = document.querySelector(".share-link.copy");
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      btn.style.background = "rgba(16,185,129,0.2)";
      btn.style.borderColor = "var(--success)";
      btn.style.color = "var(--success)";
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = "";
        btn.style.borderColor = "";
        btn.style.color = "";
      }, 2500);
    })
    .catch(() => {
      alert("Copy this link: " + (CONFIG.STORE_URL || window.location.href));
    });
}

// ================================================================
// INTERSECTION OBSERVER — Fade-in on scroll
// ================================================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add scroll-reveal to cards and feature elements
document.querySelectorAll(
  ".feature-card, .product-card, .step, .perk, .order-summary, .order-form"
).forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  observer.observe(el);
});

document.addEventListener("DOMContentLoaded", () => {
  // Re-check visibility for elements already in view on load
  document.querySelectorAll(
    ".feature-card, .product-card, .step, .perk, .order-summary, .order-form"
  ).forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add("visible");
    }
  });
});

// CSS class to trigger visibility
const style = document.createElement("style");
style.textContent = `
  .feature-card.visible,
  .product-card.visible,
  .step.visible,
  .perk.visible,
  .order-summary.visible,
  .order-form.visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// ================================================================
// OPTIONAL: EmailJS integration for order notifications
// Uncomment and configure if you want email alerts on new orders
// Setup: https://www.emailjs.com/
// ================================================================

/*
function sendEmailNotification(orderData) {
  emailjs.send(
    CONFIG.EMAILJS_SERVICE_ID,
    CONFIG.EMAILJS_TEMPLATE_ID,
    {
      to_email: CONFIG.PAYPAL_EMAIL, // your email
      customer_name: orderData.fullName,
      customer_email: orderData.email,
      roblox_username: orderData.robloxUsername,
      shipping_address: `${orderData.address}, ${orderData.city}, ${orderData.state} ${orderData.zip}, ${orderData.country}`,
      notes: orderData.notes || "None",
      product: CONFIG.PRODUCT_NAME,
      price: CONFIG.PRODUCT_PRICE,
    },
    CONFIG.EMAILJS_USER_ID
  ).then(() => {
    console.log("Order notification sent!");
  }).catch((err) => {
    console.error("EmailJS error:", err);
  });
}
*/

// ================================================================
// RESTORE ORDER SECTION if user navigates back
// ================================================================

// If user hits "Back to Store" from confirmation, show the order form again
document.querySelector('[href="#home"]')?.addEventListener("click", () => {
  document.getElementById("order").style.display = "";
  sessionStorage.removeItem("blockfigs_order");
});

console.log(
  "%cBlockFigs Store Loaded ✓",
  "color: #ff5c00; font-weight: bold; font-size: 14px;"
);
console.log(
  "%cRemember to update CONFIG with your PayPal email and store URL!",
  "color: #a0a8c0; font-size: 12px;"
);
