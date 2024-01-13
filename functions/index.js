const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(
  'sk_test_51OVRPtSGGj4CCc5lG7UzAPApDB2iwyypXDfhqNoHTEmU7KEgulffWBKJzzJgPtCKeWeS8PyqQufro9iVBlmvfgYs004uU3vJRG'
);
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.createStripeCustomer = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { email, displayName } = req.body.data.body;
      const userSnapshot = await admin
        .database()
        .ref('/users')
        .orderByChild('email')
        .equalTo(email)
        .once('value');
      const userData = userSnapshot.val();
      const userId = Object.keys(userData)[0];

      const customer = await stripe.customers.create({
        email,
        name: displayName,
      });

      await admin
        .database()
        .ref(`/users/${userId}/stripeCustomerId`)
        .set(customer.id);
      res.status(200).json({ success: true, customer });
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { userId, customerId, priceId } = req.body.data.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://ga4notes.com/#payment-success',
        cancel_url: 'https://ga4notes.com/#payment-fail',
        metadata: {
          priceId,
          userId,
        },
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating Checkout Session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'],
        'whsec_7Ha0z3L7BfOifA368wqdQ8tH8S2EidGr'
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed.');
      return res.sendStatus(400);
    }

    const dataObject = event.data.object;

    await admin.firestore().collection('orders').doc().set({
      checkoutSessionId: dataObject.id,
      paymentStatus: dataObject.payment_status,
      metadata: dataObject.metadata,
    });

    return res.sendStatus(200);
  });
});
