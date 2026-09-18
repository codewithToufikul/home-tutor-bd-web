import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips phone numbers, WhatsApp, and contact numbers from public descriptions or requirements.
 */
export function sanitizePublicText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Remove labels with numbers: "Phone: +880...", "Contact Phone: 017...", "WhatsApp: 019..."
    .replace(/(?:Contact\s*)?(?:Phone|Mobile|Tel|Cell|WhatsApp|IMO|Hotline|টেলিফোন|মোবাইল|ফোন|নাম্বার)\s*[:：-]?\s*(?:\+?880\s*[\d\s-]{6,16}|\b01[3-9][\d\s-]{8,14}\b|\b\d{10,14}\b)/gi, '')
    // Remove standalone Bangladeshi mobile numbers (+8801..., 017..., 018..., etc.)
    .replace(/(?:\+?880\s*1[3-9]\d{2}[-\s]?\d{6}|\+?880\s*1[3-9]\d{8}|\b01[3-9]\d{2}[-\s]?\d{6}\b|\b01[3-9]\d{8}\b)/g, '')
    // Remove dangling punctuation or leftover prefixes
    .replace(/(?:,\s*|\.\s*)?(?:WhatsApp|Phone|Mobile|Contact Phone)\s*:\s*$/i, '')
    .replace(/(?:,\s*|\.\s*)?(?:WhatsApp|Phone|Mobile|Contact Phone)\s*:/gi, '')
    // Clean multiple dots / spaces / commas
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*,\s*,+/g, ',')
    .replace(/\s*\.\s*\.+/g, '.')
    .replace(/,\s*\./g, '.')
    .replace(/\s*,\s*$/g, '')
    .trim();
}

/**
 * Flexible ID matcher that matches Job Codes / Custom IDs regardless of hyphens, spaces, leading zeroes, or casing.
 * Examples:
 * - Target "DHA-031" matches "dha-031", "dha031", "dha 031", "dha-31", "dha31", "031", "31", "dha"
 */
export function matchFlexibleId(targetId: string | undefined | null, searchInput: string | undefined | null): boolean {
  if (!targetId || !searchInput) return false;
  const target = String(targetId).trim().toLowerCase();
  const search = String(searchInput).trim().toLowerCase();
  if (!target || !search) return false;

  // Direct includes
  if (target.includes(search)) return true;

  // Strip all non-alphanumeric characters (hyphens, spaces, underscores, etc.)
  const cleanTarget = target.replace(/[^a-z0-9]/g, '');
  const cleanSearch = search.replace(/[^a-z0-9]/g, '');

  if (!cleanTarget || !cleanSearch) return false;
  if (cleanTarget.includes(cleanSearch)) return true;

  // Strip leading zeroes after letter prefixes: e.g. "dha031" -> "dha31"
  const targetNoZeroes = cleanTarget.replace(/([a-z]+)0+(\d+)/g, '$1$2');
  const searchNoZeroes = cleanSearch.replace(/([a-z]+)0+(\d+)/g, '$1$2');

  if (targetNoZeroes.includes(cleanSearch) || targetNoZeroes.includes(searchNoZeroes) || cleanTarget.includes(searchNoZeroes)) {
    return true;
  }

  // If search is a number (e.g. "31" or "031"), check if it matches target's number part
  const targetNumbers = cleanTarget.replace(/^[a-z]+/, '');
  const searchNumbers = cleanSearch.replace(/^[a-z]+/, '');
  if (searchNumbers && targetNumbers) {
    if (parseInt(searchNumbers, 10) === parseInt(targetNumbers, 10)) {
      return true;
    }
  }

  return false;
}
