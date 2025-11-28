import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// This webhook handles Stripe events server-side
// Note: For a local-first PWA, the client-side success handler in GrownUpsDashboard
// handles the immediate premium unlock. This webhook serves as a backup
// and can be used for server-side tracking/email sending.

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract email and marketing preference from metadata
      const parentEmail = session.metadata?.parentEmail;
      const marketingOptIn = session.metadata?.marketingOptIn === 'true';
      const customerId = session.customer as string;

      console.log('Purchase completed:', {
        email: parentEmail,
        marketingOptIn,
        customerId,
        amount: session.amount_total,
      });

      // In a server-side database scenario, you would:
      // 1. Store the parentEmail, marketingOptIn, and customerId
      // 2. Send a welcome/receipt email
      // 3. Update user's premium status in a server database
      
      // For the local-first architecture, the client handles this via
      // sessionStorage and the success redirect. This webhook is for
      // server-side tracking and future email integrations.

      // TODO: Integrate with email service (SendGrid, Resend, etc.)
      // if (parentEmail) {
      //   await sendPurchaseConfirmationEmail(parentEmail);
      //   if (marketingOptIn) {
      //     await addToMarketingList(parentEmail);
      //   }
      // }

      break;
    }

    case 'customer.created': {
      const customer = event.data.object as Stripe.Customer;
      console.log('Customer created:', {
        id: customer.id,
        email: customer.email,
        marketingOptIn: customer.metadata?.marketingOptIn,
      });
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
