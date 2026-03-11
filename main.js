/* ================================================================
   BlockFigs — Premium Store JavaScript
   Enhanced with modern features and smooth interactions
   ================================================================ */

// ================================================================
// CONFIGURATION
// ================================================================

const CONFIG = {
    PAYPAL_EMAIL: "YOUR_PAYPAL_EMAIL@example.com",
    STORE_URL: "YOUR_STORE_URL",
    PRODUCT_NAME: "Custom 3-Inch Roblox Avatar Figure",
    PRODUCT_PRICE: "15.00",
    CURRENCY: "USD",
    USE_EMAILJS: false,
    EMAILJS_SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
    EMAILJS_TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
    EMAILJS_USER_ID: "YOUR_EMAILJS_USER_ID",
};

// ================================================================
// DOM Elements
// ================================================================

const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const orderForm = document.getElementById("orderForm");
const yearSpan = document.getElementById("currentYear");

// ================================================================
// NAVBAR FUNCTIONS
// ================================================================

// Update navbar on scroll
window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// Toggle mobile menu
function toggleMenu() {
    navLinks.classList.toggle("open");
    hamburger.classList.toggle("open");
    document.body.style.overflow = navLinks.classList.contains("open") ? "hidden" : "";
}

hamburger.addEventListener("click", toggleMenu);

// Close menu when clicking a link
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        hamburger.classList.remove("open");
        document.body.style.overflow = "";
    });
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        hamburger.classList.remove("open");
        document.body.style.overflow = "";
    }
});

// ================================================================
// FORM VALIDATION
// ================================================================

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

function validateField(fieldId, errorId, label) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (!field) return true;
    
    const value = field.value.trim();
    
    field.classList.remove("error");
    if (error) error.textContent = "";
    
    if (!value) {
        field.classList.add("error");
        if (error) error.textContent = `${label} is required.`;
        showNotification(`${label} is required.`, "error");
        return false;
    }
    
    if (fieldId === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add("error");
            if (error) error.textContent = "Please enter a valid email address.";
            showNotification("Please enter a valid email address.", "error");
            return false;
        }
    }
    
    if (fieldId === "robloxUsername") {
        const robloxRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!robloxRegex.test(value)) {
            field.classList.add("error");
            if (error) error.textContent = "Roblox usernames are 3–20 characters (letters, numbers, underscores only).";
            showNotification("Please enter a valid Roblox username.", "error");
            return false;
        }
    }
    
    return true;
}

// Live validation
fields.forEach(([fieldId, errorId, label]) => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener("blur", () => validateField(fieldId, errorId, label));
        field.addEventListener("input", () => {
            const error = document.getElementById(errorId);
            field.classList.remove("error");
            if (error) error.textContent = "";
        });
    }
});

// ================================================================
// NOTIFICATION SYSTEM
// ================================================================

function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles
const notificationStyles = document.createElement("style");
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 100px;
        padding: 12px 24px;
        color: #fff;
        font-weight: 600;
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--shadow-lg);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-success i {
        color: var(--success);
    }
    
    .notification-error i {
        color: var(--error);
    }
    
    .notification-warning i {
        color: var(--warning);
    }
`;
document.head.appendChild(notificationStyles);

// ================================================================
// FORM SUBMISSION
// ================================================================

if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let allValid = true;
        fields.forEach(([fieldId, errorId, label]) => {
            if (!validateField(fieldId, errorId, label)) {
                allValid = false;
            }
        });
        
        if (!allValid) {
            const firstError = orderForm.querySelector(".error");
            if (firstError) {
                firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }
        
        const orderData = {
            fullName: document.getElementById("fullName")?.value.trim() || "",
            email: document.getElementById("email")?.value.trim() || "",
            robloxUsername: document.getElementById("robloxUsername")?.value.trim() || "",
            address: document.getElementById("address")?.value.trim() || "",
            city: document.getElementById("city")?.value.trim() || "",
            state: document.getElementById("state")?.value.trim() || "",
            zip: document.getElementById("zip")?.value.trim() || "",
            country: document.getElementById("country")?.value || "",
            notes: document.getElementById("notes")?.value.trim() || "",
        };
        
        sessionStorage.setItem("blockfigs_order", JSON.stringify(orderData));
        
        if (CONFIG.USE_EMAILJS && typeof emailjs !== "undefined") {
            sendEmailNotification(orderData);
        }
        
        submitToPayPal(orderData);
        showConfirmation(orderData);
    });
}

// ================================================================
// PAYPAL SUBMISSION
// ================================================================

function submitToPayPal(orderData) {
    const paypalForm = document.getElementById("paypalForm");
    
    if (!paypalForm) return;
    
    const business = document.getElementById("paypalBusiness");
    const itemName = document.getElementById("paypalItemName");
    const custom = document.getElementById("paypalCustom");
    const returnUrl = paypalForm.querySelector('[name="return"]');
    const cancelReturn = paypalForm.querySelector('[name="cancel_return"]');
    
    if (business) business.value = CONFIG.PAYPAL_EMAIL;
    if (itemName) itemName.value = CONFIG.PRODUCT_NAME;
    if (custom) {
        custom.value = `Roblox: ${orderData.robloxUsername} | Name: ${orderData.fullName} | Email: ${orderData.email} | Ship to: ${orderData.address}, ${orderData.city}, ${orderData.state} ${orderData.zip}, ${orderData.country}`;
    }
    
    const storeUrl = CONFIG.STORE_URL || window.location.origin + window.location.pathname;
    if (returnUrl) returnUrl.value = `${storeUrl}#confirmation`;
    if (cancelReturn) cancelReturn.value = `${storeUrl}#order`;
    
    paypalForm.target = "_blank";
    paypalForm.submit();
}

// ================================================================
// CONFIRMATION DISPLAY
// ================================================================

function showConfirmation(orderData) {
    const orderSection = document.getElementById("order");
    const confirmSection = document.getElementById("confirmation");
    
    if (orderSection) orderSection.style.display = "none";
    if (confirmSection) {
        confirmSection.style.display = "block";
        
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
                <span class="value">${escapeHTML(orderData.address)}, ${escapeHTML(orderData.city)}, ${escapeHTML(orderData.state)} ${escapeHTML(orderData.zip)}, ${escapeHTML(orderData.country)}</span>
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
        
        const confirmDetails = document.getElementById("confirmDetails");
        if (confirmDetails) confirmDetails.innerHTML = detailsHTML;
        
        confirmSection.scrollIntoView({ behavior: "smooth", block: "start" });
        showNotification("Order placed successfully! Redirecting to PayPal...", "success");
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ================================================================
// AFFILIATE SECTION
// ================================================================

const shareBtn = document.getElementById("shareBtn");
const shareOptions = document.getElementById("shareOptions");

if (shareBtn && shareOptions) {
    shareBtn.addEventListener("click", () => {
        const isOpen = shareOptions.style.display !== "none";
        shareOptions.style.display = isOpen ? "none" : "block";
        shareBtn.innerHTML = isOpen
            ? '<i class="fas fa-share-alt"></i> Share This Store'
            : '<i class="fas fa-times"></i> Close';
    });
}

async function copyLink() {
    const url = CONFIG.STORE_URL || window.location.href;
    
    try {
        await navigator.clipboard.writeText(url);
        
        const btn = document.querySelector(".share-link.copy");
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.style.background = "rgba(16, 185, 129, 0.2)";
            btn.style.borderColor = "var(--success)";
            btn.style.color = "var(--success)";
            
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = "";
                btn.style.borderColor = "";
                btn.style.color = "";
            }, 2500);
        }
        
        showNotification("Link copied to clipboard!", "success");
    } catch (err) {
        prompt("Copy this link:", url);
    }
}

// ================================================================
// SCROLL REVEAL ANIMATIONS
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

document.querySelectorAll(
    ".feature-card, .product-card, .step, .perk, .order-summary, .order-form, .affiliate-card"
).forEach((el) => {
    if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        observer.observe(el);
    }
});

// Add visible class styles
const visibleStyles = document.createElement("style");
visibleStyles.textContent = `
    .feature-card.visible,
    .product-card.visible,
    .step.visible,
    .perk.visible,
    .order-summary.visible,
    .order-form.visible,
    .affiliate-card.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(visibleStyles);

// ================================================================
// HASH NAVIGATION HANDLER
// ================================================================

function handleHashNavigation() {
    const hash = window.location.hash;
    
    if (hash === "#confirmation") {
        const savedOrder = sessionStorage.getItem("blockfigs_order");
        if (savedOrder) {
            try {
                const orderData = JSON.parse(savedOrder);
                showConfirmation(order
