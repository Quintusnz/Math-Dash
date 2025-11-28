import { Resend } from 'resend';

// Initialize Resend client
// Uses RESEND_API_KEY environment variable if available
const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };
