const UNBOUND_CONTACT_VALUES = new Set(['', '-1', 'null', 'undefined']);

function normalizeContactValue(value?: string | null) {
  return `${value ?? ''}`.trim();
}

export function isContactBound(value?: string | null) {
  return !UNBOUND_CONTACT_VALUES.has(normalizeContactValue(value).toLowerCase());
}

export function sanitizeContactValue(value?: string | null) {
  return isContactBound(value) ? normalizeContactValue(value) : '';
}

export function formatContactDisplay(value?: string | null, fallback = '未绑定') {
  return sanitizeContactValue(value) || fallback;
}

export function maskPhone(value?: string | null, fallback = '未绑定') {
  const phone = sanitizeContactValue(value);
  if (!phone) {
    return fallback;
  }
  if (phone.length < 11) {
    return phone;
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export function maskEmail(value?: string | null, fallback = '未绑定') {
  const email = sanitizeContactValue(value);
  if (!email) {
    return fallback;
  }
  const [username, domain] = email.split('@');
  if (!username || !domain) {
    return email;
  }
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  return `${username.slice(0, 2)}***@${domain}`;
}
