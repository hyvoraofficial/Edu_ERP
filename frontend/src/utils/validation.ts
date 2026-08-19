export function parseFieldErrors(err: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (!err) return fieldErrors;

  const details = err.details || (Array.isArray(err.message) ? err.message : (typeof err.message === 'string' ? [err.message] : null));

  if (Array.isArray(details)) {
    details.forEach((item: any) => {
      if (typeof item === 'string') {
        const lower = item.toLowerCase();
        if (lower.includes('email')) {
          fieldErrors['email'] = item;
        } else if (lower.includes('phone') || lower.includes('contact')) {
          fieldErrors['phone'] = fieldErrors['contactNumber'] = item;
        } else if (lower.includes('code')) {
          fieldErrors['code'] = item;
        } else if (lower.includes('name')) {
          fieldErrors['name'] = item;
        } else if (lower.includes('branch')) {
          fieldErrors['branchId'] = item;
        } else if (lower.includes('subject')) {
          fieldErrors['subjects'] = item;
        } else if (lower.includes('address')) {
          fieldErrors['address'] = item;
        } else if (lower.includes('city')) {
          fieldErrors['city'] = item;
        } else if (lower.includes('state')) {
          fieldErrors['state'] = item;
        } else if (lower.includes('pincode')) {
          fieldErrors['pincode'] = item;
        } else if (lower.includes('password')) {
          fieldErrors['password'] = item;
        }
      } else if (typeof item === 'object' && item !== null) {
        if (item.field && item.message) {
          fieldErrors[item.field] = item.message;
        }
      }
    });
  }
  return fieldErrors;
}

export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '' || email.trim() === '-') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === '' || phone.trim() === '-') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7;
}
