import { NextResponse } from 'next/server';
import { sendPurchaseConfirmationEmail } from '@/lib/email';

// Test endpoint - remove in production or protect with auth
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required. Usage: /api/test-email?email=your@email.com' },
      { status: 400 }
    );
  }

  const result = await sendPurchaseConfirmationEmail({
    to: email,
    customerName: 'Test User',
  });

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
      emailId: result.emailId,
    });
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }
}
