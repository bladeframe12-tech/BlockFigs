// BlockFigs — Main JS
let stripe, cardEl;
let orderData = {};

const PRODUCTS = {
  '2inch': { name: '2 Inch Custom Figure', price: 45, display: '$45.00' },
  '3inch': { name: '3 Inch Custom Figure', price: 60, display: '$60.00' }
};

document.addEventListener('DOMContentLoaded', () => {
  initStripe();
  initPayPal();
  loadEmailJS();
});

function initStripe() {
  if (!CONFIG.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    document.getElementById('stripe-status').textContent = '⚠️ Add your Stripe key in js/config.js';
    return;
  }
  try {
    stripe = Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY);
    const els = stripe.elements();
    cardEl = els.create('card', {
      style: { base: { fontSize: '15px', color: '#F5F5F5', '::placeholder': { color: '#444' }, backgroundColor: '#1A1A1A' } }
    });
    cardEl.mount('#stripe-card-element');
    document.getElementById('stripe-status').style.display = 'none';
  } catch(e) {
    document.getElementById('stripe-status').textContent = 'Payment error — check Stripe key.';
  }
}

function initPayPal() {
  if (typeof paypal === 'undefined') {
    document.getElementById('paypal-button-container').innerHTML = '<p style="color:#888;font-size:0.85rem">⚠️ Add your PayPal Client ID in config.js and the script tag in index.html.</p>';
    return;
  }
  paypal.Buttons({
    createOrder: (data, actions) => {
      const p = getProd(); if (!p) { alert('Select a product first.'); return; }
      return actions.order.create({ purchase_units: [{ description: p.name, amount: { value: p.price.toString() } }] });
    },
    onApprove: async (data, actions) => {
      const order = await actions.order.capture();
      collectData(); orderData.paymentMethod = 'PayPal'; orderData.transactionId = order.id;
      sendEmail(); goStep(4); showConfirm();
    },
    onError: err => alert('PayPal error: ' + err)
  }).render('#paypal-button-container');
}

function loadEmailJS() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = () => {
    if (CONFIG.EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
  };
  document.head.appendChild(s);
}

function sendEmail() {
  if (CONFIG.EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') { console.log('EmailJS not set. Order:', orderData); return; }
  const params = {
    owner_email: CONFIG.OWNER_EMAIL,
    customer_email: orderData.email,
    customer_name: orderData.firstName + ' ' + orderData.lastName,
    roblox_username: orderData.robloxUsername,
    product_name: orderData.productName,
    product_price: orderData.productPrice,
    address: `${orderData.address}, ${orderData.city}, ${orderData.state} ${orderData.zip}, ${orderData.country}`,
    phone: orderData.phone || 'Not provided',
    notes: orderData.notes || 'None',
    payment_method: orderData.paymentMethod,
    transaction_id: orderData.transactionId || 'N/A',
    order_date: new Date().toLocaleString()
  };
  emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, params)
    .then(() => console.log('Email sent!'))
    .catch(e => console.error('Email failed:', e));
}

function getProd() {
  const r = document.querySelector('input[name="prod"]:checked');
  return r ? PRODUCTS[r.value] : null;
}

function updateSummary() {
  const p = getProd();
  const u = document.getElementById('roblox_username')?.value.trim();
  document.getElementById('s-prod').textContent = p ? p.name : '—';
  document.getElementById('s-user').textContent = u || '—';
  document.getElementById('s-total').textContent = p ? p.display : '$0';
  const pa = document.getElementById('pay-amt');
  if (pa) pa.textContent = p ? p.display : '$0.00';
}

function selectProd(id) {
  const r = document.querySelector(`input[name="prod"][value="${id}"]`);
  if (r) { r.checked = true; updateSummary(); }
}

function goStep(n) {
  if (n === 2 && !validateStep1()) return;
  if (n === 3 && !validateStep2()) return;
  document.querySelectorAll('.fstep').forEach(s => s.classList.remove('active'));
  document.getElementById('fs' + n).classList.add('active');
  document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep1() {
  if (!getProd()) { alert('Please select a product size.'); return false; }
  if (!document.getElementById('roblox_username').value.trim()) { alert('Please enter your Roblox username.'); return false; }
  return true;
}

function validateStep2() {
  const ids = ['first_name','last_name','email','address','city','zip','country'];
  for (const id of ids) {
    if (!document.getElementById(id).value.trim()) {
      alert('Please fill in all required shipping fields.'); document.getElementById(id).focus(); return false;
    }
  }
  if (!/\S+@\S+\.\S+/.test(document.getElementById('email').value)) { alert('Please enter a valid email address.'); return false; }
  return true;
}

function collectData() {
  const p = getProd();
  orderData = {
    productName: p?.name, productPrice: p?.display,
    robloxUsername: document.getElementById('roblox_username').value.trim(),
    notes: document.getElementById('notes').value.trim(),
    firstName: document.getElementById('first_name').value.trim(),
    lastName: document.getElementById('last_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    zip: document.getElementById('zip').value.trim(),
    country: document.getElementById('country').value.trim()
  };
}

async function submitPay(method) {
  if (!stripe || !cardEl) { alert('Stripe not configured. Add your Stripe key to js/config.js'); return; }
  const btn = document.getElementById('pay-btn');
  btn.textContent = 'Processing...'; btn.disabled = true;
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card', card: cardEl,
    billing_details: { name: document.getElementById('card_name').value, email: document.getElementById('email').value }
  });
  if (error) {
    alert('Card error: ' + error.message);
    const p = getProd();
    btn.textContent = 'Pay ' + (p ? p.display : ''); btn.disabled = false; return;
  }
  collectData(); orderData.paymentMethod = 'Credit/Debit Card'; orderData.transactionId = paymentMethod.id;
  sendEmail(); goStep(4); showConfirm();
}

function showConfirm() {
  const b = document.getElementById('confirmBox');
  if (!b) return;
  b.innerHTML = `<strong>Product:</strong> ${orderData.productName}<br><strong>Roblox Username:</strong> ${orderData.robloxUsername}<br><strong>Shipping to:</strong> ${orderData.firstName} ${orderData.lastName}, ${orderData.address}, ${orderData.city}<br><strong>Confirmation to:</strong> ${orderData.email}`;
}

function switchPay(tab, btn) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.ppanel').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('pp-' + tab).classList.add('on');
}

function toggleFaq(btn) {
  const item = btn.closest('.faq-q-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-q-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

function resetForm() {
  document.querySelectorAll('input[type=text], input[type=email], input[type=tel], textarea').forEach(i => i.value = '');
  document.querySelectorAll('input[type=radio]').forEach(i => i.checked = false);
  updateSummary();
  goStep(1);
}
