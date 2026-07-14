// Single source of truth for BSM's public contact details.
// TODO(BSM): replace the two placeholders below with the REAL WhatsApp number
// and contact email before the site goes live. Every CTA on the site (header,
// footer, hero, product rows, CTA band) reads from here, so this is the only
// edit needed to wire up real conversions.
export const WHATSAPP_NUMBER = '628000000000'; // e.g. 62812xxxxxxx (country code + number, no + or 0)
export const EMAIL = 'info@bsm.example.com';

/** Build a wa.me deep link with a pre-filled Bahasa message. */
export const waLink = (msg: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
