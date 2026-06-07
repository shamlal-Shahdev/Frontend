export function toLocalPakistanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('92')) {
    const withoutCountry = digits.slice(2);
    if (withoutCountry.length >= 10) {
      return `0${withoutCountry.slice(0, 10)}`;
    }
    if (withoutCountry.length > 0) {
      return `0${withoutCountry}`;
    }
  }

  if (digits.startsWith('0')) {
    return digits.slice(0, 11);
  }

  if (digits.startsWith('3') && digits.length === 10) {
    return `0${digits}`;
  }

  return digits.slice(0, 11);
}

export function sanitizeLocalPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('92')) {
    const withoutCountry = digits.slice(2);
    digits = withoutCountry.length > 0 ? `0${withoutCountry}` : '0';
  } else if (digits.length > 0 && !digits.startsWith('0') && digits.startsWith('3')) {
    digits = `0${digits}`;
  }

  return digits.slice(0, 11);
}

export function isValidLocalPakistanPhone(phone: string): boolean {
  return /^03\d{9}$/.test(phone);
}
