import type { TaggedToken, TokenLanguage } from "@/lib/transcription/types";

type ScoredToken = {
  value: string;
  normalized: string;
  italianScore: number;
  polishScore: number;
  italianSignals: number;
  polishSignals: number;
};

type FinalToken = ScoredToken & {
  language: TokenLanguage;
  confidence: number;
  italianConfidence: number;
  polishConfidence: number;
};

const POLISH_DIACRITICS = /[ąćęłńóśźż]/i;
const ITALIAN_DIACRITICS = /[àèéìíîòóù]/i;
const POLISH_CLUSTERS = /(sz|cz|rz|dź|dż|ł|ń|ść)/i;
const ITALIAN_ENDINGS = /(are|ere|ire|zione|mente|tà|gli|che|ghi)$/i;

const POLISH_FUNCTION_WORDS = new Set([
  "jak",
  "sie",
  "się",
  "mowi",
  "mówi",
  "powiedziec",
  "powiedzieć",
  "po",
  "wlosku",
  "włosku",
  "czy",
  "nie",
  "wiem",
  "dlaczego",
  "prosze",
  "proszę",
  "dzieki",
  "dzięki",
  "jestem",
  "chce",
  "chcę",
  "moze",
  "może",
  "bezchmurne",
  "bezchmurny",
  "bezchmurna",
  "co",
  "znaczy",
]);

const ITALIAN_FUNCTION_WORDS = new Set([
  "ciao",
  "grazie",
  "perche",
  "perché",
  "sono",
  "sei",
  "è",
  "siamo",
  "siete",
  "loro",
  "come",
  "quando",
  "per",
  "con",
  "dove",
  "anche",
  "molto",
  "bene",
  "andare",
  "vorrei",
]);

const WORD_BOUNDARY_REGEX =
  /([^\p{L}\p{M}]+)|(?<!\p{L})(?=\p{L})|(?<=\p{L})(?!\p{L})/gu;

export function tagTokens(transcript: string): TaggedToken[] {
  const rawTokens = transcript
    .split(WORD_BOUNDARY_REGEX)
    .map((token) => token?.trim())
    .filter((token) => Boolean(token));

  const scoredTokens = rawTokens
    .map((token) => {
      const normalized = normalizeToken(token);
      if (!normalized) {
        return null;
      }
      return scoreToken(token, normalized);
    })
    .filter((token): token is ScoredToken => Boolean(token));

  if (!scoredTokens.length) {
    return [];
  }

  const calibrated = applyContextAwareSmoothing(scoredTokens);

  return calibrated.map((token) => ({
    value: token.value,
    normalized: token.normalized,
    language: token.language,
    confidence: Number(token.confidence.toFixed(2)),
  }));
}

function scoreToken(value: string, normalized: string): ScoredToken {
  let italianScore = 0.45; // Default bias (conversation target)
  let polishScore = 0.45;
  let italianSignals = 0;
  let polishSignals = 0;

  if (POLISH_DIACRITICS.test(normalized)) {
    polishScore += 0.35;
    polishSignals += 2;
  }
  if (POLISH_CLUSTERS.test(normalized)) {
    polishScore += 0.25;
    polishSignals += 1;
  }
  if (POLISH_FUNCTION_WORDS.has(normalized)) {
    polishScore += 0.3;
    polishSignals += 2;
  }

  if (ITALIAN_DIACRITICS.test(normalized)) {
    italianScore += 0.35;
    italianSignals += 2;
  }
  if (ITALIAN_ENDINGS.test(normalized)) {
    italianScore += 0.25;
    italianSignals += 1;
  }
  if (ITALIAN_FUNCTION_WORDS.has(normalized)) {
    italianScore += 0.3;
    italianSignals += 2;
  }

  return {
    value,
    normalized,
    italianScore,
    polishScore,
    italianSignals,
    polishSignals,
  };
}

function applyContextAwareSmoothing(tokens: ScoredToken[]): FinalToken[] {
  const assigned = tokens.map(assignLanguage);
  if (!assigned.length) {
    return [];
  }

  const totalTokens = assigned.length;
  const polishTokens = assigned.filter((token) => token.language === "pl");
  const hasStrongPolishEvidence = tokens.some(
    (token) => token.polishSignals >= 2,
  );

  if (polishTokens.length > 0 && !hasStrongPolishEvidence) {
    const thresholdCount = Math.max(1, Math.round(totalTokens * 0.02));
    if (polishTokens.length <= thresholdCount) {
      return assigned.map((token) =>
        token.language === "pl"
          ? {
              ...token,
              language: "it",
              confidence: Math.max(token.italianConfidence, 0.65),
            }
          : token,
      );
    }
  }

  return assigned;
}

function assignLanguage(token: ScoredToken): FinalToken {
  const totalScore = Math.max(token.italianScore + token.polishScore, 0.0001);
  const italianConfidence = token.italianScore / totalScore;
  const polishConfidence = token.polishScore / totalScore;
  const language: TokenLanguage =
    polishConfidence - italianConfidence > 0.15 ? "pl" : "it";
  const confidence =
    language === "pl" ? polishConfidence : italianConfidence;

  return {
    ...token,
    language,
    confidence,
    italianConfidence,
    polishConfidence,
  };
}

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^[^a-ząćęłńóśźżàèéìíîòóù]+/, "")
    .replace(/[^a-ząćęłńóśźżàèéìíîòóù]+$/, "");
}


