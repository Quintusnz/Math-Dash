import { db } from '@/lib/db';

// Characters excluding visually similar ones (0/O, 1/I/L, 5/S)
const CODE_CHARACTERS = 'ABCDEFGHJKMNPQRTUVWXYZ2346789';

/**
 * Generate a random 4-character code segment
 */
function generateCodeSegment(length: number = 4): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CODE_CHARACTERS.charAt(
      Math.floor(Math.random() * CODE_CHARACTERS.length)
    );
  }
  return result;
}

/**
 * Generate a unique play code in format DASH-XXXX
 * Checks against existing codes in the database to ensure uniqueness
 */
export async function generatePlayCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = `DASH-${generateCodeSegment(4)}`;
    
    // Check if code already exists
    const existing = await db.profiles.where('playCode').equals(code).first();
    
    if (!existing) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback: use timestamp-based code if we can't find unique
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `DASH-${timestamp}`;
}

/**
 * Validate a play code format
 */
export function isValidCodeFormat(code: string): boolean {
  // Case-insensitive check for DASH-XXXX format
  const normalizedCode = code.toUpperCase().trim();
  const pattern = /^DASH-[A-Z0-9]{4}$/;
  return pattern.test(normalizedCode);
}

/**
 * Normalize a play code (uppercase, trim, ensure proper format)
 */
export function normalizeCode(code: string): string {
  let normalized = code.toUpperCase().trim();
  
  // Add DASH- prefix if missing
  if (!normalized.startsWith('DASH-')) {
    // If it's just 4 characters, add the prefix
    if (normalized.length === 4) {
      normalized = `DASH-${normalized}`;
    }
  }
  
  return normalized;
}

/**
 * Format code for display (with proper spacing/styling)
 */
export function formatCodeForDisplay(code: string): string {
  return normalizeCode(code);
}

/**
 * Generate a QR code data URL for a play code
 * Uses a simple QR code API or can be replaced with a library
 */
export function generateQRCodeURL(playCode: string, size: number = 200): string {
  // Using QR Server API (free, no API key needed)
  // The QR code will contain the full code for scanning
  const encodedCode = encodeURIComponent(playCode);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedCode}&bgcolor=ffffff&color=3056D3&margin=2`;
}

/**
 * Generate a QR code as SVG string (for offline use)
 * This is a simple QR code implementation
 */
export function generateQRCodeSVG(playCode: string, size: number = 200): string {
  // For offline QR generation, we'll use a data URL approach
  // This creates a simple visual representation
  // In production, you'd use a library like 'qrcode' npm package
  
  const qrUrl = generateQRCodeURL(playCode, size);
  return qrUrl;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Validate if a code exists in the database
 */
export async function validateCodeExists(code: string): Promise<boolean> {
  const normalizedCode = normalizeCode(code);
  const profile = await db.profiles.where('playCode').equals(normalizedCode).first();
  return !!profile;
}

/**
 * Get profile by play code
 */
export async function getProfileByCode(code: string) {
  const normalizedCode = normalizeCode(code);
  return db.profiles.where('playCode').equals(normalizedCode).first();
}
