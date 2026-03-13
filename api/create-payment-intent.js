const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, orderId, errandType, customerEmail } = req.body;
    const amountPence = Math.round(amount * 100);
    if (!amountPence || amountPence < 100 || amountPence > 50000) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: orderId || 'unknown', errandType: errandType || 'unknown' },
      receipt_email: customerEmail || undefined,
      description: `OnlyBuddy — ${errandType || 'Errand'}`,
      statement_descriptor: 'ONLYBUDDY HULL',
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
