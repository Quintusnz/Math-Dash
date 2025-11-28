import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

interface CheckoutRequestBody {
  email: string;
  marketingOptIn: boolean;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const { email, marketingOptIn } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: { message: 'Email is required' } },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer with email
    const customer = await stripe.customers.create({
      email,
      metadata: {
        marketingOptIn: marketingOptIn ? 'true' : 'false',
        source: 'math_dash_premium',
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Math Dash Premium',
              description: 'Unlock all topics, adaptive mode, and unlimited profiles.',
              images: ['https://mathdash.app/images/premium-cover.png'], // Placeholder
            },
            unit_amount: 699, // $6.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/grown-ups?success=true&customerId=${customer.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/grown-ups?canceled=true`,
      metadata: {
        parentEmail: email,
        marketingOptIn: marketingOptIn ? 'true' : 'false',
      },
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      customerId: customer.id,
    });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json(
      { error: { message: err.message } },
      { status: 500 }
    );
  }
}
