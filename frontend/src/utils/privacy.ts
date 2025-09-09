// Privacy masking utilities for facsimile documents

export function maskSSN(value: string | null | undefined, show: string = 'last4'): string {
  if (!value) return '';
  
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 9) return value;
  
  if (show === 'last4') {
    return `•••-••-${cleaned.slice(-4)}`;
  }
  
  return '•••-••-••••';
}

export function maskEIN(value: string | null | undefined, show: string = 'last4'): string {
  if (!value) return '';
  
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 9) return value;
  
  if (show === 'last4') {
    return `••-•••${cleaned.slice(-4)}`;
  }
  
  return '••-•••••••';
}

export function maskAccount(value: string | null | undefined, show: string = 'last4'): string {
  if (!value) return '';
  
  if (show === 'last4' && value.length >= 4) {
    return `••••${value.slice(-4)}`;
  }
  
  return '••••••••';
}

export function formatCurrency(value: number | null | undefined, locale: string = 'en-US'): string {
  if (value === null || value === undefined) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function formatDate(value: string | null | undefined, locale: string = 'en-US'): string {
  if (!value) return '';
  
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return value;
  }
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '';
  
  try {
    // Handle time format like "09:00:00"
    const [hours, minutes] = value.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  } catch {
    return value;
  }
}

export function shouldRedactField(fieldName: string, redactFields: string[]): boolean {
  return redactFields.includes(fieldName);
}

export function redactValue(value: any): string {
  return '[REDACTED]';
}

