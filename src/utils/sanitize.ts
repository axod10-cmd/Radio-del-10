/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Sanitizes an alias (username)
 */
export function sanitizeAlias(alias: string): string {
  return alias
    .replace(/[<>&"'`\\\/]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20)
}

/**
 * Validates alias format
 */
export function isValidAlias(alias: string): { valid: boolean; error?: string } {
  const clean = alias.trim()
  if (clean.length < 2) {
    return { valid: false, error: 'El alias debe tener al menos 2 caracteres' }
  }
  if (clean.length > 20) {
    return { valid: false, error: 'El alias no puede tener más de 20 caracteres' }
  }
  if (/^\d+$/.test(clean)) {
    return { valid: false, error: 'El alias no puede ser solo números' }
  }
  // Block aliases that impersonate staff roles
  const reserved = ['admin', 'moderador', 'docente', 'profesor', 'radio', 'sistema', 'bot']
  if (reserved.some(r => clean.toLowerCase().includes(r))) {
    return { valid: false, error: 'Ese alias está reservado' }
  }
  return { valid: true }
}

/**
 * Checks if a string contains URLs
 */
export function containsUrl(text: string): boolean {
  const urlPattern = /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi
  return urlPattern.test(text)
}

/**
 * Generates a unique session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}
