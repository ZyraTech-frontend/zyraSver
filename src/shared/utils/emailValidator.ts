/**
 * Deep Email Validator
 * 
 * Validates emails beyond basic format checking:
 * 1. DNS MX Record Lookup — verifies the domain can receive emails
 * 2. Disposable Email Blocking — rejects known burner email providers
 */

import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// ─── Known Disposable / Burner Email Domains ────────────────────
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'tempmail.com',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'yopmail.fr',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'dispostable.com',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'maildrop.cc',
  'mailnesia.com',
  'tempail.com',
  'tempr.email',
  'discard.email',
  'fakeinbox.com',
  'mailcatch.com',
  'mintemail.com',
  'mohmal.com',
  'burpcollaborator.net',
  'mailforspam.com',
  'safetymail.info',
  'tmail.ws',
  'mt2015.com',
  'thankyou2010.com',
  'trash-mail.at',
  'trashymail.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wh4f.org',
  'filzmail.com',
  'emailondeck.com',
  'incognitomail.org',
  'mailexpire.com',
  'tempinbox.com',
  'tmpmail.net',
  'tmpmail.org',
  'boun.cr',
  'mytemp.email',
  'tempmailaddress.com',
  '10minutemail.com',
  '10minutemail.net',
  'minutemail.com',
  'emailfake.com',
  'crazymailing.com',
  'armyspy.com',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
]);

/**
 * Check if the email domain has valid MX records (can receive email)
 */
async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (_error) {
    // DNS resolution failed — domain doesn't exist or has no MX records
    return false;
  }
}

/**
 * Check if the email domain is a known disposable/burner provider
 */
function isDisposableEmail(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

/**
 * Deep validate an email address
 * Returns null if valid, or an error message string if invalid
 */
export async function deepValidateEmail(email: string): Promise<string | null> {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  const domain = email.split('@')[1].toLowerCase();

  // Check disposable email providers
  if (isDisposableEmail(domain)) {
    return 'Disposable or temporary email addresses are not allowed. Please use a real email address.';
  }

  // Check DNS MX records
  const hasValidMx = await hasMxRecords(domain);
  if (!hasValidMx) {
    return 'This email domain does not exist or cannot receive emails. Please provide a valid email address.';
  }

  return null; // Email passed all checks
}
