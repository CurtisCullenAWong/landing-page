/**
 * Input length limits
 */
export const INPUT_LIMITS = {
  NAME: 50,
  EMAIL: 100,
  PHONE: 20,
  URL: 255,
  TITLE: 100,
  DEPARTMENT: 100,
  LOCATION: 100,
  SALARY: 50,
  DESCRIPTION: 5000,
  LIST_ITEM: 500,
  COVER_LETTER: 5000,
};

/**
 * Robust sanitization to prevent XSS and injection
 * Removes HTML tags, script protocols, and event handlers
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove onEvent handlers (e.g., onclick, onerror)
    .replace(/style\s*=\s*".*?"/gi, '') // Remove inline styles
    .replace(/expression\s*\(.*?\)/gi, '') // Remove CSS expressions
    .replace(/url\s*\(.*?\)/gi, '') // Remove CSS URLs
    .replace(/&\w+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Formats a name (First or Last)
 * Capitalizes the first letter of each word and trims whitespace
 */
export function formatName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map(word => {
      // Keep acronyms like "IT", "HR", "USA", "JR", "SR" uppercase if they are already uppercase
      if (word.length <= 3 && word === word.toUpperCase() && word.match(/^[A-Z.]+$/)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Normalizes an email address
 * Lowercases and trims whitespace
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Formats a phone number for storage
 * Removes non-numeric characters except + and -
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  return phone.trim().replace(/[^\d+-]/g, '');
}

/**
 * Formats a phone number in real-time (Philippine format)
 * Expected: +63 XXX XXX XXXX or 0XXX XXX XXXX
 */
export function formatPhoneNumberLive(value: string): string {
  if (!value) return '';
  
  // Strip all non-numeric characters
  let cleaned = value.replace(/\D/g, '');
  
  // Handle Philippine prefix +63 or 09
  if (cleaned.startsWith('63')) {
    // Already has 63
  } else if (cleaned.startsWith('0')) {
    // Starts with 0, convert to 63
    cleaned = '63' + cleaned.substring(1);
  } else if (cleaned.length > 0) {
    // Assume PH and prepend 63 if it doesn't start with it
    if (!value.startsWith('+')) {
      cleaned = '63' + cleaned;
    }
  }

  // Limit to 12 digits (63 + 10 digits)
  cleaned = cleaned.substring(0, 12);

  // Format as +63 XXX XXX XXXX
  let formatted = '';
  if (cleaned.length > 0) formatted += '+';
  if (cleaned.length > 0) formatted += cleaned.substring(0, 2);
  if (cleaned.length > 2) formatted += ' ' + cleaned.substring(2, 5);
  if (cleaned.length > 5) formatted += ' ' + cleaned.substring(5, 8);
  if (cleaned.length > 8) formatted += ' ' + cleaned.substring(8, 12);
  
  return formatted.trim();
}

/**
 * Cleans an entire object of strings
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeString(result[key]) as any;
    }
  }
  return result;
}

/**
 * Cleans up a list of items (e.g., responsibilities)
 * Removes empty lines and trims each item
 */
export function cleanList(items: string | string[]): string[] {
  const itemList = typeof items === 'string' ? items.split('\n') : items;
  return itemList
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  if (!url) return true; // Optional field
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates an email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
