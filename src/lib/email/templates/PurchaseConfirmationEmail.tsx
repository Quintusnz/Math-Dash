import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface PurchaseConfirmationEmailProps {
  customerName?: string;
  /** Amount in cents */
  amountCents?: number;
  /** Currency code (USD, GBP, EUR, AUD, NZD) */
  currency?: string;
}

/**
 * Format amount in cents to display string with currency symbol
 */
function formatAmount(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  const currencyUpper = currency.toUpperCase();
  
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    AUD: 'A$',
    NZD: 'NZ$',
  };
  
  const symbol = symbols[currencyUpper] || '$';
  return `${symbol}${amount.toFixed(2)} ${currencyUpper}`;
}

export function PurchaseConfirmationEmail({
  customerName,
  amountCents = 699,
  currency = 'USD',
}: PurchaseConfirmationEmailProps) {
  const previewText = 'Your Math Dash Premium purchase is confirmed!';
  const formattedAmount = formatAmount(amountCents, currency);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoEmoji}>🔢</Text>
            <Text style={logoText}>Math Dash</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={heroHeading}>🎉 Welcome to Premium!</Heading>
            <Text style={heroText}>
              {customerName ? `Hi ${customerName}!` : 'Hi there!'} Your purchase
              was successful.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* What's Unlocked */}
          <Section style={contentSection}>
            <Heading as="h2" style={sectionHeading}>
              What You've Unlocked
            </Heading>

            <div style={featureList}>
              <div style={featureItem}>
                <Text style={featureIcon}>✨</Text>
                <div>
                  <Text style={featureTitle}>All Times Tables (1-12)</Text>
                  <Text style={featureDescription}>
                    Complete mastery of multiplication facts
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>🔢</Text>
                <div>
                  <Text style={featureTitle}>Extended Number Bonds</Text>
                  <Text style={featureDescription}>
                    Number bonds to 10, 20, and 100
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>⚡</Text>
                <div>
                  <Text style={featureTitle}>All Practice Modes</Text>
                  <Text style={featureDescription}>
                    Timed challenges, sprint mode, and more
                  </Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>👨‍👩‍👧‍👦</Text>
                <div>
                  <Text style={featureTitle}>Unlimited Profiles</Text>
                  <Text style={featureDescription}>
                    Track progress for the whole family
                  </Text>
                </div>
              </div>
            </div>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>Ready to start practicing?</Text>
            <Button href="https://mathdash.app/play" style={ctaButton}>
              Start Playing Now
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Receipt Summary */}
          <Section style={receiptSection}>
            <Heading as="h2" style={sectionHeading}>
              Purchase Details
            </Heading>
            <div style={receiptRow}>
              <Text style={receiptLabel}>Item</Text>
              <Text style={receiptValue}>Math Dash Premium</Text>
            </div>
            <div style={receiptRow}>
              <Text style={receiptLabel}>Amount Paid</Text>
              <Text style={receiptValue}>{formattedAmount}</Text>
            </div>
            <div style={receiptRow}>
              <Text style={receiptLabel}>Access</Text>
              <Text style={receiptValue}>Lifetime (one-time purchase)</Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email or contact us at{' '}
              <Link href="mailto:support@mathdash.app" style={link}>
                support@mathdash.app
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href="https://mathdash.app/privacy" style={link}>
                Privacy Policy
              </Link>
              {' • '}
              <Link href="https://mathdash.app/terms" style={link}>
                Terms of Service
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Math Dash. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const header = {
  backgroundColor: '#3056D3',
  padding: '24px',
  textAlign: 'center' as const,
};

const logoEmoji = {
  fontSize: '48px',
  margin: '0 auto',
  lineHeight: '1',
};

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '8px 0 0 0',
};

const heroSection = {
  padding: '40px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f0f4ff',
};

const heroHeading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
};

const heroText = {
  color: '#4a5568',
  fontSize: '18px',
  margin: '0',
  lineHeight: '1.5',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '0',
};

const contentSection = {
  padding: '32px',
};

const sectionHeading = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 24px 0',
};

const featureList = {
  margin: '0',
  padding: '0',
};

const featureItem = {
  display: 'flex',
  marginBottom: '20px',
};

const featureIcon = {
  fontSize: '24px',
  marginRight: '16px',
  marginTop: '0',
  marginBottom: '0',
};

const featureTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const ctaSection = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
};

const ctaText = {
  color: '#4a5568',
  fontSize: '16px',
  margin: '0 0 16px 0',
};

const ctaButton = {
  backgroundColor: '#3056D3',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
};

const receiptSection = {
  padding: '32px',
};

const receiptRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const receiptLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const receiptValue = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'right' as const,
};

const footer = {
  padding: '24px 32px',
  backgroundColor: '#f9fafb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '16px 0 0 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#3056D3',
  textDecoration: 'underline',
};

export default PurchaseConfirmationEmail;
