// ── EmailJS Confirmation Emails ──────────────────────────────
// Free plan: 200 emails/month · No backend needed
// Setup: emailjs.com → create account → add service → add template

const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID  || "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY  || "YOUR_PUBLIC_KEY";

// Load EmailJS SDK dynamically (no npm needed)
function loadEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs) return resolve(window.emailjs);
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      resolve(window.emailjs);
    };
    document.head.appendChild(s);
  });
}

export async function sendBookingConfirmation({ customerEmail, customerName, task, address, pay, errandType, jobId }) {
  try {
    const ejs = await loadEmailJS();

    const templateParams = {
      to_email:     customerEmail,
      to_name:      customerName || customerEmail.split('@')[0],
      job_id:       jobId?.slice(0,8).toUpperCase() || 'OB' + Date.now().toString().slice(-6),
      errand_type:  errandType || 'Errand',
      task_desc:    task,
      address:      address,
      pay:          `£${parseFloat(pay).toFixed(2)}`,
      estimated_time: '30 minutes',
      app_url:      'https://onlybuddy.vercel.app',
    };

    await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.log('✅ Confirmation email sent to', customerEmail);
    return { success: true };
  } catch (err) {
    // Don't crash the app if email fails — just log it
    console.warn('Email send failed (non-critical):', err);
    return { success: false, error: err };
  }
}
