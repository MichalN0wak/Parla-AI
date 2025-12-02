import { describe, expect, it } from "vitest";
import { tagTokens } from "./tokenTagger";

describe("tagTokens dual-language heuristics", () => {
  it("keeps purely Italian utterances tagged as Italian", () => {
    const tokens = tagTokens(
      "Ciao, mi chiamo Luca e vivo a Milano con la mia famiglia.",
    );

    const polishTokens = tokens.filter((token) => token.language === "pl");
    expect(polishTokens.length).toBe(0);
  });

  it("detects Polish helper phrases inside Italian sentences", () => {
    const tokens = tagTokens(
      "Come si dice 'finestra' in italiano? Jak się mówi finestra po włosku?",
    );

    const polishTokens = tokens
      .filter((token) => token.language === "pl")
      .map((token) => token.normalized);

    expect(polishTokens).toEqual(
      expect.arrayContaining(["jak", "się", "po", "włosku"]),
    );
  });
});


