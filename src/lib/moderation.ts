/**
 * Content moderation system for Argentine Spanish chat messages.
 * Handles profanity detection, l33tspeak normalization, spam detection,
 * and word-boundary-aware filtering to minimize false positives.
 */

interface ModerationResult {
  allowed: boolean
  reason?: string
  matchedFilter?: string
}

// ── Profanity / insult word list ──────────────────────────────────────────────
// Each entry is stored in its *normalized* form (lowercase, no accents, no
// repeated chars). The matcher will normalize input the same way before
// comparing, so we don't need accent variants here.

const PROFANITY_LIST: string[] = [
  // Argentine insults
  'pelotudo', 'pelotuda', 'pelotudes',
  'forro', 'forra',
  'sorete', 'soretes',
  'conchudo', 'conchuda', 'conchudes',
  'conchuda', 'reconchuda',
  'garcha', 'garchame', 'la concha',
  'hijo de puta', 'hija de puta', 'hijodeputa', 'hijadeputa',
  'la puta madre', 'la puta que te pario',
  'andate a la mierda',
  'chupame', 'chupamela', 'chupala',
  'chupaverga', 'chupavergas',
  'pete', 'petero', 'petera',
  'trolo', 'trola', 'trolaso',
  'puto', 'puta', 'putas', 'putazo', 'putita',
  'pija', 'pijazo',
  'poronga', 'porongas',
  'verga', 'vergas', 'vergudo',
  'cogeme', 'cogete', 'cogetelo', 'cogetela',
  'cogido', 'cogida', 'coger', 'cojan',
  'culiao', 'culiado', 'culiada', 'culiau',
  'culo', 'culito',
  'orto', 'ortear', 'ortiva',
  'mierda', 'mierdas', 'mierdera',
  'cagar', 'cagada', 'cagado', 'cagate',
  'carajo', 'carajos',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',

  // General Spanish profanity
  'cabron', 'cabrona', 'cabrones',
  'joder', 'jodete', 'jodido', 'jodida',
  'coño', 'cono',
  'marica', 'maricon', 'maricona', 'maricas',
  'mamahuevo', 'mamaguevo',
  'malparido', 'malparida',
  'gonorrea',
  'hijueputa', 'jueputa',
  'mamada', 'mamadas',
  'prostituta', 'prostituto',
  'zorra', 'zorras', 'zorrita',
  'pajero', 'pajera', 'pajeros',
  'masturbarse', 'masturbar',

  // Discriminatory terms
  'negro de mierda', 'negra de mierda',
  'mogolico', 'mogolica', 'mongolico', 'mongolica',
  'retrasado', 'retrasada', 'retrasados',
  'down', // only matched as standalone / in insult context
  'subnormal', 'subnormales',
  'sidoso', 'sidosa',
  'travesti', // used as slur
  'villero de mierda', 'villera de mierda',
  'negro villero', 'negra villera',

  // Threats & violence
  'te voy a matar', 'te mato', 'matar',
  'te voy a cagar a piñas', 'te cago a piñas',
  'te voy a reventar', 'te reviento',
  'suicidate', 'suicidarse', 'matate',
  'violarte', 'violar', 'violacion',
  'te pego', 'te fajo',

  // Sexual explicit
  'sexo oral', 'anal', 'orgasmo',
  'eyacular', 'semen', 'esperma',
  'tetas', 'tetona', 'tetonas',
  'culo', 'nalgas',
  'nudes', 'nude', 'desnuda', 'desnudo',
  'pornografia', 'porno', 'xxx',

  // Drugs
  'falopa', 'falopero', 'falopera',
  'drogadicto', 'drogadicta',
  'merluza', // slang for cocaine
  'cocaina', 'marihuana', 'crack',
]

// Multi-word phrases that should be matched as a whole
const PHRASE_FILTERS: string[] = [
  'hijo de puta', 'hija de puta',
  'la concha de tu madre', 'la concha de tu vieja',
  'la puta madre', 'la puta que te pario',
  'andate a la mierda', 'andate a cagar',
  'te voy a matar', 'te cago a piñas', 'te voy a cagar a piñas',
  'te voy a reventar', 'negro de mierda', 'negra de mierda',
  'villero de mierda', 'villera de mierda',
  'negro villero', 'negra villera',
  'sexo oral',
]

// Words that should NOT be flagged even though they contain a filtered substring.
// E.g. "computadora" contains "puta" but is a legitimate word.
const SAFE_WORDS: string[] = [
  'computadora', 'computadoras', 'computacion',
  'disputa', 'disputar', 'disputas', 'disputado',
  'imputar', 'imputado', 'imputada', 'imputacion',
  'reputacion', 'reputar',
  'diputado', 'diputada', 'diputados',
  'amputar', 'amputacion', 'amputado',
  'putativo', 'putativa',
  'catapulta', 'catapultas',
  'escultura', 'esculturas',
  'cultura', 'culturas', 'cultural',
  'agricultura', 'acuicultura',
  'sepultura', 'sepultar',
  'analisis', 'analizar', 'analitica', 'analogia',
  'canal', 'canales',
  'nacional', 'internacional',
  'arsenal', 'artesanal',
  'canal', 'banal',
  'formalidad', 'normalidad',
  'original', 'criminal',
  'terminal', 'nominal',
  'personal', 'profesional',
  'occidental', 'oriental',
  'cargarla', 'descargar', 'encargar', 'recarga',
  'pegar', 'despegar', 'apegar',
  'concha', // the seashell – but "la concha de" is still blocked as phrase
  'pichon', 'pichones',
  'culo', // We'll handle this through word-boundary logic
  'articulado', 'articular', 'curricula', 'vehiculo',
  'calculo', 'calcula', 'calculadora', 'circulo',
  'matricula', 'especulacion', 'particular',
  'peninsular', 'espectacular', 'muscular',
  'ridiculo', 'ridicula',
  'curriculo', 'curriculum',
  'ortografia', 'ortodoxo', 'ortodoncia', 'ortopedia',
  'proyecto', 'proyectar',
  'peter', 'petersen', 'petersburgo', 'petrarca', 'petroleo', 'peticionar',
  'peticion', 'competencia', 'competir', 'competitivo',
  'carpeta', 'carpetas',
  'trolar', // legit gaming term
  'control', 'controlar', 'controlador',
  'patrolar', 'patrulla',
  'pijar', // not a real word but avoid false-flag on "trabajar"
  'marijuana', // alternate spelling – already in list, but safe_words prevents double-flag issues
]

// ── Normalization helpers ─────────────────────────────────────────────────────

/** Remove combining accents and diacritics */
function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** Map l33tspeak characters to their letter equivalents */
const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  '|': 'l',
  '¡': 'i',
  '€': 'e',
}

function decodeLeetspeak(text: string): string {
  return text
    .split('')
    .map((ch) => LEET_MAP[ch] ?? ch)
    .join('')
}

/** Collapse repeated characters: "puuuutaaa" → "puta" (max 1 repeat) */
function collapseRepeats(text: string): string {
  return text.replace(/(.)\1{2,}/g, '$1')
}

/** Remove common separator chars used to evade filters: p.u.t.a, p-u-t-a */
function removeSeparators(text: string): string {
  // Only remove separators between single letters (e.g. p.u.t.a but not "Sr. García")
  return text.replace(/\b([\w])[.\-_*]([\w])[.\-_*]([\w])/g, '$1$2$3')
    .replace(/(?<=\b\w)[.\-_*](?=\w\b)/g, '')
}

/** Full normalization pipeline */
function normalize(text: string): string {
  let result = text.toLowerCase()
  result = removeAccents(result)
  result = decodeLeetspeak(result)
  result = removeSeparators(result)
  result = collapseRepeats(result)
  return result
}

// ── Matching logic ────────────────────────────────────────────────────────────

/** Build a set of normalized safe words for quick lookup */
const SAFE_SET = new Set(SAFE_WORDS.map(normalize))

/** Split unique single words from the profanity list (not phrases) */
const SINGLE_WORDS = PROFANITY_LIST.filter((w) => !w.includes(' ')).map(normalize)
const PHRASES = PHRASE_FILTERS.map(normalize)

/**
 * Check if any safe word fully contains the candidate match, meaning the
 * matched region is actually part of a legitimate word.
 */
function isSafeContext(normalizedInput: string, matchStart: number, matchEnd: number): boolean {
  // Extract the full word surrounding the match
  let wordStart = matchStart
  let wordEnd = matchEnd
  while (wordStart > 0 && /\w/.test(normalizedInput[wordStart - 1])) wordStart--
  while (wordEnd < normalizedInput.length && /\w/.test(normalizedInput[wordEnd])) wordEnd++
  const surroundingWord = normalizedInput.slice(wordStart, wordEnd)
  return SAFE_SET.has(surroundingWord)
}

/**
 * Check if a word appears at a word boundary in the text.
 * This prevents "puta" from matching inside "computadora".
 */
function findWordBoundaryMatch(text: string, word: string): boolean {
  // Escape regex special chars in the word
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(?:^|[\\s.,;:!?¿¡"'()\\[\\]{}<>/\\\\|@#%&*+=~\`-])${escaped}(?:$|[\\s.,;:!?¿¡"'()\\[\\]{}<>/\\\\|@#%&*+=~\`-])`, 'i')
  const match = regex.exec(text)
  if (!match) return false

  // Find exact position of the word within the match
  const matchIndex = text.indexOf(word, match.index)
  if (matchIndex === -1) return false

  return !isSafeContext(text, matchIndex, matchIndex + word.length)
}

// ── Spam detection ────────────────────────────────────────────────────────────

function isSpam(text: string): { spam: boolean; reason?: string } {
  // All caps (more than 10 chars)
  if (text.length > 10 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return { spam: true, reason: 'Mensaje en mayúsculas. Por favor, escribí normalmente.' }
  }

  // Excessive repeated characters in a single word (more than 4)
  if (/(.)\1{4,}/.test(text)) {
    return { spam: true, reason: 'Mensaje con caracteres repetidos excesivamente.' }
  }

  // Excessive emojis or special characters (more than 60% of message)
  const letterCount = (text.match(/[a-záéíóúñü]/gi) || []).length
  const totalNonSpace = text.replace(/\s/g, '').length
  if (totalNonSpace > 5 && letterCount / totalNonSpace < 0.3) {
    return { spam: true, reason: 'Mensaje con demasiados caracteres especiales.' }
  }

  return { spam: false }
}

// ── Main moderation function ──────────────────────────────────────────────────

/**
 * Moderate a chat message. Returns whether the message is allowed to be posted.
 *
 * @param rawText - The original message text before sanitization
 * @returns ModerationResult with allowed status and optional reason/matchedFilter
 */
export function moderateMessage(rawText: string): ModerationResult {
  // Spam check first (on raw text)
  const spamCheck = isSpam(rawText)
  if (spamCheck.spam) {
    return {
      allowed: false,
      reason: spamCheck.reason,
      matchedFilter: 'spam',
    }
  }

  const normalizedText = normalize(rawText)

  // Check phrases first (they're more specific, less likely to false-positive)
  for (const phrase of PHRASES) {
    if (normalizedText.includes(phrase)) {
      return {
        allowed: false,
        reason: 'Contenido inapropiado detectado',
        matchedFilter: phrase,
      }
    }
  }

  // Check single words with word-boundary awareness
  for (const word of SINGLE_WORDS) {
    if (word.length < 3) continue // skip very short words to avoid false positives

    if (findWordBoundaryMatch(normalizedText, word)) {
      return {
        allowed: false,
        reason: 'Contenido inapropiado detectado',
        matchedFilter: word,
      }
    }
  }

  return { allowed: true }
}

/**
 * Quick check if text contains any profanity (for UI indicators).
 */
export function containsProfanity(text: string): boolean {
  return !moderateMessage(text).allowed
}
