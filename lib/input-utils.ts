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
 * Basic HTML sanitization to prevent XSS

 * Removes common HTML tags and script-related content
 */
export function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove onEvent handlers
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
      // Keep acronyms like "IT", "HR", "USA" uppercase if they are already uppercase
      if (word.length <= 3 && word === word.toUpperCase() && word.match(/^[A-Z]+$/)) {
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
 * Formats a phone number
 * Currently just cleans it up, but could be extended for specific formats
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  // Basic cleanup: allow numbers, +, -, and spaces
  return phone.trim().replace(/[^\d+-\s]/g, '');
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
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates an email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
