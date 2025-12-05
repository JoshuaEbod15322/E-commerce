// src/lib/stripe.js
// This file will contain Stripe checkout operations

/*
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your-publishable-key-here');

// Create checkout session
export const createCheckoutSession = async (cartItems, shippingInfo) => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cartItems,
      shippingInfo,
      customerEmail: shippingInfo.email,
    }),
  });
  
  const session = await response.json();
  
  const stripe = await stripePromise;
  const { error } = await stripe.redirectToCheckout({
    sessionId: session.id,
  });
  
  if (error) {
    console.error('Stripe checkout error:', error);
  }
};

// Example API route for checkout session creation
// Create this in your backend (e.g., Vercel serverless function or Express route)
/*
app.post('/api/create-checkout-session', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.body.cartItems.map(item => ({
        price_data: {
          currency: 'php',
          product_data: {
            name: item.name,
            description: `${item.brand} - Size: ${item.size}`,
            images: [item.image],
          },
          unit_amount: item.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['PH', 'US'],
      },
      metadata: {
        userId: req.body.userId,
        shippingInfo: JSON.stringify(req.body.shippingInfo),
      },
    });
    
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
