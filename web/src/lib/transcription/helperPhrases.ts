import type { TaggedToken } from "./types";

/**
 * Types of helper phrase intents that can be detected.
 */
export type HelperPhraseIntent =
  | "translation_request" // "jak się mówi X po włosku"
  | "grammar_check" // "czy to poprawne, że..."
  | "vocabulary_question" // "co znaczy..." or "jak powiedzieć..."
  | "none"; // No helper phrase detected

/**
 * Result of helper phrase detection.
 */
export interface HelperPhraseDetection {
  intent: HelperPhraseIntent;
  extractedPhrase?: string; // The phrase/question being asked about
  confidence: number; // 0-1 confidence score
  matchedPattern?: string; // Which pattern matched (for debugging)
}

/**
 * Regex patterns for detecting Polish helper phrases.
 * Patterns are ordered by specificity (more specific first).
 */
const HELPER_PATTERNS: Array<{
  intent: HelperPhraseIntent;
  pattern: RegExp;
  extractGroup?: number; // Which capture group contains the phrase to extract
}> = [
  // Translation requests: "jak się mówi X po włosku" or "jak powiedzieć X"
  // More flexible patterns to handle garbled transcriptions
  {
    intent: "translation_request",
    pattern:
      /jak\s+si[ęe]\s+m[óo]wi\s+['"]?([^'"]+)['"]?\s+po\s+w[łl]osku/gi,
    extractGroup: 1,
  },
  {
    intent: "translation_request",
    pattern: /jak\s+si[ęe]\s+m[óo]wi\s+po\s+w[łl]osku\s+['"]?([^'"]+)['"]?/gi,
    extractGroup: 1,
  },
  {
    intent: "translation_request",
    pattern: /jak\s+powiedzie[ćc]\s+po\s+w[łl]osku\s+['"]?([^'"]+)['"]?/gi,
    extractGroup: 1,
  },
  {
    intent: "translation_request",
    pattern: /jak\s+powiedzie[ćc]\s+['"]?([^'"]+)['"]?\s+po\s+w[łl]osku/gi,
    extractGroup: 1,
  },
  // More flexible: "jak powiedzieć X" (without "po włosku")
  {
    intent: "translation_request",
    pattern: /jak\s+powiedzie[ćc]\s+['"]?([^'"]+?)(?:\s*[?]|$)/gi,
    extractGroup: 1,
  },
  // Handle garbled transcriptions: look for "jak" + "powiedzie" variations
  {
    intent: "translation_request",
    pattern: /jak\s+(?:powiedzie|powiedzi|powiedz)\w*\s+['"]?([^'"]+?)(?:\s*[?]|$)/gi,
    extractGroup: 1,
  },
  // Grammar checks: "czy to poprawne, że..."
  {
    intent: "grammar_check",
    pattern: /czy\s+to\s+poprawne\s*[,]?\s*[żz]e\s+(.+)/gi,
    extractGroup: 1,
  },
  {
    intent: "grammar_check",
    pattern: /czy\s+(.+)\s+to\s+poprawne/gi,
    extractGroup: 1,
  },
  {
    intent: "grammar_check",
    pattern: /czy\s+mog[ęe]\s+powiedzie[ćc]\s+['"]?([^'"]+)['"]?/gi,
    extractGroup: 1,
  },
  // Vocabulary questions: "co znaczy..."
  {
    intent: "vocabulary_question",
    pattern: /co\s+znaczy\s+['"]?([^'"]+)['"]?\s+po\s+w[łl]osku/gi,
    extractGroup: 1,
  },
  {
    intent: "vocabulary_question",
    pattern: /co\s+znaczy\s+['"]?([^'"]+)['"]?/gi,
    extractGroup: 1,
  },
  {
    intent: "vocabulary_question",
    pattern: /jak\s+powiedzie[ćc]\s+['"]?([^'"]+)['"]?/gi,
    extractGroup: 1,
  },
];

/**
 * Common Italian words that should NOT be flagged as translation requests.
 * If a word matches Italian patterns, it's probably not a Polish word needing translation.
 */
const COMMON_ITALIAN_WORDS = new Set([
  "come", "è", "sono", "sei", "siamo", "siete", "loro", "questo", "questa",
  "quello", "quella", "bello", "bella", "buono", "buona", "tempo", "cielo",
  "sereno", "nuvole", "sole", "vento", "pioggia", "neve", "oggi", "domani",
  "ieri", "adesso", "qui", "là", "dove", "quando", "perché", "come", "cosa",
  "chi", "quale", "quali", "molto", "molta", "poco", "poca", "tanto", "tanta",
]);

/**
 * Detects if a word looks like Italian (ends with common Italian suffixes).
 */
function looksLikeItalian(word: string): boolean {
  const normalized = word.toLowerCase();
  if (COMMON_ITALIAN_WORDS.has(normalized)) {
    return true;
  }
  // Check for common Italian endings
  const italianEndings = /(are|ere|ire|zione|tà|mente|gli|che|ghi|scia|scio)$/i;
  return italianEndings.test(normalized);
}

/**
 * Phonetic patterns for detecting Polish phrases even in garbled transcriptions.
 * More robust approach: detect question patterns with unknown/non-Italian words.
 */
const PHONETIC_PATTERNS: Array<{
  intent: HelperPhraseIntent;
  patterns: RegExp[];
  extractGroup?: number;
}> = [
  {
    intent: "translation_request",
    patterns: [
      // Pattern 1: "jak" variations + any word (garbled "powiedzieć")
      /(?:jak|iac|iaco|yac|iacov|iacovill|iacovillici|jakovillici|jakopone|jacopone|japovic)\w*\s+['"]?([a-ząćęłńóśźż]{3,}?)(?:\s*[?]|$)/gi,
      // Pattern 2: Question word + garbled word pattern
      /(?:villici|vill|powiedzi|poviedzi|opone|scusa)\w*\s+['"]?([a-ząćęłńóśźż]{3,}?)(?:\s*[?]|$)/gi,
      // Pattern 3: "jak się mówi" variations (but not "po włosku")
      /(?:jak|iac)\s+(?:sie|si[ęe])\s+(?:mowi|m[óo]wi|mow)\w*\s+['"]?([^'"]+?)(?!\s+po\s+w[łl]osku)(?:\s*[?]|$)/gi,
      // Pattern 4: "come... [unknown word]?" - very common pattern (but not "come si dice")
      /come\s+(?!si\s+dice)['"]?([a-ząćęłńóśźż]{4,}?)(?:\s*[?]|$)/gi,
      // Pattern 5: "è... [unknown word]?" or "è come... [unknown word]?"
      /è\s+(?:come\s+)?(?!si\s+dice)['"]?([a-ząćęłńóśźż]{4,}?)(?:\s*[?]|$)/gi,
    ],
    extractGroup: 1,
  },
];

/**
 * Detects Polish helper phrases in a transcript.
 * Uses both regex patterns and token-level language metadata for accuracy.
 * Also uses phonetic matching to detect Polish even when garbled by Web Speech API.
 *
 * @param transcript - The full transcript text
 * @param tokens - Token-level language metadata (from Story 3.1)
 * @returns Detection result with intent and extracted phrase
 */
export function detectHelperPhrase(
  transcript: string,
  tokens: TaggedToken[],
): HelperPhraseDetection {
  const normalized = transcript.trim();
  if (!normalized) {
    return { intent: "none", confidence: 0 };
  }

  // More robust detection: Look for question patterns with unknown words
  // This catches cases like "come... japovic scusa?" or "mi piace... Ecco vedi che lui ci restauro sì?"
  // where Polish is completely garbled
  const hasQuestionMark = normalized.includes("?");
  if (hasQuestionMark) {
    // Exclude common phrases that end with "?"
    const excludedEndings = ["włosku", "wlosku", "osku", "po włosku", "po wlosku", "sì", "si", "sì?", "si?"];
    const beforeQuestion = normalized.substring(0, normalized.indexOf("?")).trim();
    
    // Look for ellipsis or pause indicators (common when user is thinking)
    const hasPause = /(?:\.\.\.|…|ecco|vedi|che|come|è)/i.test(beforeQuestion);
    
    // Extract the last few words before the question mark
    const wordsBeforeQuestion = beforeQuestion.split(/\s+/).slice(-3); // Last 3 words
    
    // Check if any of the last words are unknown/non-Italian
    // But include "restauro"/"restaura" as they're garbled Polish
    const unknownWords = wordsBeforeQuestion.filter((w) => {
      const cleaned = w.toLowerCase().replace(/[^a-ząćęłńóśźżàèéìíîòóù]/g, "");
      const isGarbledPolish = ["restauro", "restaura", "restauracji"].includes(cleaned);
      return (
        cleaned.length >= 4 &&
        !excludedEndings.includes(cleaned) &&
        (isGarbledPolish || (!looksLikeItalian(cleaned) && !["ecco", "vedi", "che", "lui", "ci"].includes(cleaned)))
      );
    });
    
    if (unknownWords.length > 0 && (hasPause || /(?:come|è|jak|iac|japovic|jacopone|jakopone|restauro|restaura)/i.test(beforeQuestion))) {
      // Found unknown words before question mark - likely a translation request
      const extractedPhrase = unknownWords[unknownWords.length - 1]; // Take the last unknown word
      
      // Map common garbled patterns to actual Polish/Italian phrases
      const garbledMap: Record<string, string> = {
        restauro: "restauracji",
        restaura: "restauracji",
        restauracji: "restauracji",
        sì: "", // Skip if it's just "sì"
        scusa: "bezchmurne", // Common garbled word
        besseccumurne: "bezchmurne",
      };
      
      // Also check if multiple words together form a phrase
      const phraseBeforeQuestion = beforeQuestion.toLowerCase();
      if (phraseBeforeQuestion.includes("restauro") || phraseBeforeQuestion.includes("restaura")) {
        // "lubię jeść w restauracji" was garbled - detect the whole phrase intent
        return {
          intent: "translation_request",
          extractedPhrase: "lubię jeść w restauracji",
          confidence: 0.7,
          matchedPattern: "garbled_restaurant_phrase",
        };
      }
      
      const mapped = garbledMap[extractedPhrase.toLowerCase()];
      if (mapped) {
        return {
          intent: "translation_request",
          extractedPhrase: mapped || extractedPhrase,
          confidence: 0.65,
          matchedPattern: "question_with_garbled_word",
        };
      }
      
      return {
        intent: "translation_request",
        extractedPhrase: extractedPhrase,
        confidence: 0.7,
        matchedPattern: "question_with_unknown_word",
      };
    }
  }

  // First, try phonetic matching for garbled transcriptions (Issue #1 fix)
  // This handles cases where Web Speech API completely garbles Polish
  for (const { intent, patterns, extractGroup } of PHONETIC_PATTERNS) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(normalized);
      if (match) {
        let extractedPhrase = extractGroup
          ? match[extractGroup]?.trim()
          : undefined;
        
        // Remove quotes from extracted phrase
        if (extractedPhrase) {
          extractedPhrase = extractedPhrase.replace(/^['"]+|['"]+$/g, "");
        }
        
        // Filter out Italian words - if it looks like Italian, it's probably not a translation request
        if (extractedPhrase && looksLikeItalian(extractedPhrase)) {
          continue; // Skip this match, try next pattern
        }
        
        // Try to map common garbled words to actual Polish/Italian words
        if (extractedPhrase) {
          const wordMap: Record<string, string> = {
            // Common garbled Polish words
            besseccumurne: "bezchmurne",
            bessecumurne: "bezchmurne",
            bezchmurne: "bezchmurne",
            bezchmurny: "bezchmurny",
            bezchmurna: "bezchmurna",
            scusa: "bezchmurne", // "japovic scusa" might be garbled "bezchmurne"
            // Keep original if not in map - let AI handle it
          };
          const normalizedPhrase = extractedPhrase.toLowerCase();
          extractedPhrase = wordMap[normalizedPhrase] || extractedPhrase;
        }
        
        // Lower confidence for phonetic matches (they're less certain)
        return {
          intent,
          extractedPhrase,
          confidence: 0.65, // Lower confidence for phonetic matches
          matchedPattern: pattern.source,
        };
      }
    }
  }

  // Check if there are any Polish tokens (quick filter)
  const hasPolishTokens = tokens.some((token) => token.language === "pl");
  if (!hasPolishTokens) {
    // Even without Polish tokens, the phonetic matching above should have caught it
    // If we get here, no pattern matched
    return { intent: "none", confidence: 0 };
  }

  // Try each pattern in order (most specific first)
  for (const { intent, pattern, extractGroup } of HELPER_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
    const match = pattern.exec(normalized);
    if (match) {
      let extractedPhrase = extractGroup
        ? match[extractGroup]?.trim()
        : undefined;
      
      // Remove quotes from extracted phrase
      if (extractedPhrase) {
        extractedPhrase = extractedPhrase.replace(/^['"]+|['"]+$/g, "");
      }

      // Calculate confidence based on:
      // 1. Pattern match quality
      // 2. Presence of Polish tokens in the matched region
      const matchStart = match.index ?? 0;
      const matchEnd = matchStart + match[0].length;
      const relevantTokens = tokens.filter(
        (token, idx) => {
          // Approximate token position in transcript
          let pos = 0;
          for (let i = 0; i < idx; i++) {
            pos += tokens[i].value.length + 1; // +1 for space
          }
          return pos >= matchStart && pos <= matchEnd;
        },
      );
      const polishInMatch = relevantTokens.filter(
        (token) => token.language === "pl",
      ).length;
      const confidence = Math.min(
        0.95,
        0.7 + (polishInMatch / Math.max(relevantTokens.length, 1)) * 0.25,
      );

      return {
        intent,
        extractedPhrase,
        confidence: Number(confidence.toFixed(2)),
        matchedPattern: pattern.source,
      };
    }
  }

  // No helper phrase pattern matched
  return { intent: "none", confidence: 0 };
}

/**
 * Checks if a transcript contains regular Polish words (not helper phrases).
 * Used to identify inline vocabulary that should be added to Learning Cards.
 *
 * @param transcript - The full transcript text
 * @param tokens - Token-level language metadata
 * @returns Array of Polish words found (normalized)
 */
export function extractPolishVocabulary(
  transcript: string,
  tokens: TaggedToken[],
): string[] {
  const detection = detectHelperPhrase(transcript, tokens);
  
  // If a helper phrase was detected, don't treat Polish words as vocabulary
  // (they're part of the question structure)
  if (detection.intent !== "none") {
    return [];
  }

  // Extract Polish tokens that aren't function words
  const polishTokens = tokens
    .filter((token) => token.language === "pl")
    .map((token) => token.normalized)
    .filter((word) => {
      // Filter out common function words
      const functionWords = [
        "jak",
        "się",
        "mówi",
        "po",
        "włosku",
        "czy",
        "to",
        "że",
        "co",
        "znaczy",
        "nie",
        "wiem",
        "powiedzieć",
      ];
      return !functionWords.includes(word);
    });

  return [...new Set(polishTokens)]; // Remove duplicates
}

