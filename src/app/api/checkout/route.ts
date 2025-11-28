import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  CurrencyCode, 
  DEFAULT_CURRENCY, 
  CORE_PRICING,
  TIER_1_CURRENCIES 
} from '@/lib/constants/pricing';

interface CheckoutRequestBody {
  email: string;
  marketingOptIn: boolean;
  currency?: CurrencyCode;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const { email, marketingOptIn, currency: requestedCurrency } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: { message: 'Email is required' } },
        { status: 400 }
      );
    }

    // Validate and get currency pricing
    const currency: CurrencyCode = 
      requestedCurrency && TIER_1_CURRENCIES.includes(requestedCurrency) 
        ? requestedCurrency 
        : DEFAULT_CURRENCY;
    
    const pricing = CORE_PRICING[currency];

    // Create or retrieve Stripe customer with email
    const customer = await stripe.customers.create({
      email,
      metadata: {
        marketingOptIn: marketingOptIn ? 'true' : 'false',
        source: 'math_dash_premium',
        currency,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Math Dash Premium',
              description: 'Unlock all topics, adaptive mode, and unlimited profiles.',
              images: ['https://mathdash.app/images/premium-cover.png'], // Placeholder
            },
            unit_amount: pricing.amountCents,
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
        currency,
        amountCents: pricing.amountCents.toString(),
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
