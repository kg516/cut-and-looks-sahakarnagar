/**
 * Validate Indian phone numbers (10 digits starting with 6-9, with optional +91 or 0)
 * Or standard international format (+ followed by 8-15 digits)
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  
  // Indian number regex
  const indianRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  if (indianRegex.test(cleaned)) return true;

  // General international regex (+ followed by 8 to 15 digits)
  const intlRegex = /^\+[1-9]\d{7,14}$/;
  return intlRegex.test(cleaned);
}

export function validateEmail(email) {
  if (!email) return true; // Optional email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Validate that an appointment date is not in the past
 */
export function validateAppointmentDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const targetDate = new Date(`${dateStr}T23:59:59`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate >= today;
}
