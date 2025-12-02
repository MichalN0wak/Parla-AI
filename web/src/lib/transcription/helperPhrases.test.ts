import { describe, expect, it } from "vitest";
import {
  detectHelperPhrase,
  extractPolishVocabulary,
} from "./helperPhrases";
import type { TaggedToken } from "./types";

// Helper to create mock tokens for testing
function createMockTokens(
  text: string,
  polishIndices: number[] = [],
): TaggedToken[] {
  const words = text.split(/\s+/);
  return words.map((word, idx) => ({
    value: word,
    normalized: word.toLowerCase().replace(/[^a-ząćęłńóśźżàèéìíîòóù]/g, ""),
    language: polishIndices.includes(idx) ? "pl" : "it",
    confidence: 0.9,
  }));
}

describe("detectHelperPhrase", () => {
  it("detects translation requests: 'jak się mówi X po włosku'", () => {
    const transcript = "Jak się mówi 'finestra' po włosku?";
    const tokens = createMockTokens(transcript, [0, 1, 2, 4, 5]); // Polish words

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("translation_request");
    expect(detection.extractedPhrase).toBe("finestra");
    expect(detection.confidence).toBeGreaterThan(0.7);
  });

  it("detects translation requests with phrase at end", () => {
    const transcript = "Jak się mówi po włosku 'finestra'?";
    const tokens = createMockTokens(transcript, [0, 1, 2, 3, 5]);

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("translation_request");
    expect(detection.extractedPhrase).toBe("finestra");
  });

  it("detects grammar check requests: 'czy to poprawne, że...'", () => {
    const transcript = "Czy to poprawne, że dico 'sono andata al lavoro'?";
    const tokens = createMockTokens(transcript, [0, 1, 2, 3]); // Polish words

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("grammar_check");
    expect(detection.extractedPhrase).toContain("sono andata");
    expect(detection.confidence).toBeGreaterThan(0.7);
  });

  it("detects vocabulary questions: 'co znaczy...'", () => {
    const transcript = "Co znaczy 'confidenza' po włosku?";
    const tokens = createMockTokens(transcript, [0, 1, 3, 4]); // Polish words

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("vocabulary_question");
    expect(detection.extractedPhrase).toBe("confidenza");
  });

  it("returns 'none' for purely Italian speech", () => {
    const transcript = "Ciao, mi chiamo Luca e vivo a Milano.";
    const tokens = createMockTokens(transcript); // All Italian

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("none");
    expect(detection.confidence).toBe(0);
  });

  it("returns 'none' for mixed speech without helper phrases", () => {
    const transcript = "Vivo a Warszawa ma lavoro a Roma.";
    const tokens = createMockTokens(transcript, [2]); // "Warszawa" is Polish

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("none");
  });

  it("handles case-insensitive matching", () => {
    const transcript = "JAK SIĘ MÓWI 'finestra' PO WŁOSKU?";
    const tokens = createMockTokens(transcript, [0, 1, 2, 4, 5]);

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("translation_request");
    expect(detection.extractedPhrase).toBe("finestra");
  });

  it("detects Polish phrases even in garbled transcriptions (Issue #1)", () => {
    // Test case: "jak powiedzieć bezchmurne?" -> "jacovillici besseccumurne"
    const transcript = "jacovillici besseccumurne";
    const tokens = createMockTokens(transcript); // All tokens marked as Italian (garbled)

    const detection = detectHelperPhrase(transcript, tokens);

    expect(detection.intent).toBe("translation_request");
    expect(detection.extractedPhrase).toBe("bezchmurne"); // Should map garbled to correct word
    expect(detection.confidence).toBeGreaterThan(0.6);
  });
});

describe("extractPolishVocabulary", () => {
  it("extracts Polish words when no helper phrase detected", () => {
    const transcript = "Vivo a Warszawa e lavoro a Kraków.";
    const tokens = createMockTokens(transcript, [2, 6]); // "Warszawa" and "Kraków"

    const vocabulary = extractPolishVocabulary(transcript, tokens);

    expect(vocabulary.length).toBeGreaterThan(0);
    expect(vocabulary).toContain("warszawa");
    expect(vocabulary).toContain("kraków");
  });

  it("returns empty array when helper phrase is detected", () => {
    const transcript = "Jak się mówi 'finestra' po włosku?";
    const tokens = createMockTokens(transcript, [0, 1, 2, 4, 5]);

    const vocabulary = extractPolishVocabulary(transcript, tokens);

    expect(vocabulary).toEqual([]);
  });

  it("filters out function words", () => {
    const transcript = "Vivo a Warszawa e lavoro a Kraków";
    const tokens = createMockTokens(transcript, [2, 6]); // "Warszawa" and "Kraków"

    const vocabulary = extractPolishVocabulary(transcript, tokens);

    // Should extract Polish place names, not function words
    expect(vocabulary).toContain("warszawa");
    expect(vocabulary).toContain("kraków");
  });

  it("returns empty array for purely Italian speech", () => {
    const transcript = "Ciao, mi chiamo Luca e vivo a Milano.";
    const tokens = createMockTokens(transcript);

    const vocabulary = extractPolishVocabulary(transcript, tokens);

    expect(vocabulary).toEqual([]);
  });
});

