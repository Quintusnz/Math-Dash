import { resend } from './resend';
import { PurchaseConfirmationEmail } from './templates/PurchaseConfirmationEmail';

interface SendPurchaseConfirmationParams {
  to: string;
  customerName?: string;
  /** Amount in cents */
  amountCents?: number;
  /** Currency code (USD, GBP, EUR, AUD, NZD) */
  currency?: string;
}

// Use Resend's test domain for development, switch to mathdash.app in production
const FROM_EMAIL = process.env.NODE_ENV === 'production' 
  ? 'Math Dash <noreply@mathdash.app>'
  : 'Math Dash <onboarding@resend.dev>';

export async function sendPurchaseConfirmationEmail({
  to,
  customerName,
  amountCents,
  currency,
}: SendPurchaseConfirmationParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '🎉 Welcome to Math Dash Premium!',
      react: PurchaseConfirmationEmail({ customerName, amountCents, currency }),
    });

    if (error) {
      console.error('Failed to send purchase confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('Purchase confirmation email sent:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (err: any) {
    console.error('Error sending purchase confirmation email:', err);
    return { success: false, error: err.message };
  }
}

export { resend };
