// Vercel Serverless Function — /api/create-payment-intent
// Handles Stripe payment intent creation securely (secret key never in frontend)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, jobId, customerEmail } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert £ to pence
      currency: 'gbp',
      metadata: { jobId, customerEmail },
      receipt_email: customerEmail,
      description: `OnlyBuddy job #${jobId}`,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};
