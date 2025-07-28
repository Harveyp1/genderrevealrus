const functions = require("firebase-functions");
const admin = require("firebase-admin");

// IMPORTANT: Set your Stripe secret key in your Firebase environment
// Run this command in your terminal:
// firebase functions:config:set stripe.secret="sk_test_YOUR_SECRET_KEY"
const stripe = require("stripe")(functions.config().stripe.secret);

admin.initializeApp();

/**
 * Creates a Stripe Customer object when a new user signs up.
 */
exports.createStripeCustomer = functions.auth.user().onCreate(async (user) => {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.displayName,
    metadata: { firebaseUID: user.uid },
  });

  // Save the Stripe Customer ID to the user's document in Firestore.
  return admin.firestore().collection("users").doc(user.uid).set({
    stripeId: customer.id,
  }, { merge: true });
});


/**
 * A callable function to create a Stripe SetupIntent.
 * This allows the frontend to securely save a payment method.
 */
exports.createSetupIntent = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  
  const userDoc = await admin.firestore().collection("users").doc(context.auth.uid).get();
  const stripeId = userDoc.data().stripeId;

  if (!stripeId) {
      throw new functions.https.HttpsError("failed-precondition", "User does not have a Stripe ID.");
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: stripeId,
  });

  return { clientSecret: setupIntent.client_secret };
});
