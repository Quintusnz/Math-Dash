import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    // In a real app, you'd validate the user session here
    
    const session = await stripe.checkout.sessions.create({
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
            unit_amount: 799, // $7.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/grown-ups?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/grown-ups?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json(
      { error: { message: err.message } },
      { status: 500 }
    );
  }
}
