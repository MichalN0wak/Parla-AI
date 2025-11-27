import { ProficiencyLevel } from "@/store/useSessionStore";

/**
 * Persona definition for the AI conversation partner.
 * Based on product brief: warm, supportive, non-judgmental.
 */
const PERSONA_BASE = `Sei un partner di conversazione italiano caldo, supportivo e non giudicante. Il tuo obiettivo è aiutare gli studenti polacchi che imparano l'italiano a superare il "blocco linguistico" e la paura di parlare. Mantieni sempre un tono incoraggiante e paziente.`;

/**
 * Proficiency-specific tone and complexity adjustments.
 */
const PROFICIENCY_GUIDANCE: Record<
  ProficiencyLevel,
  {
    complexity: string;
    tenseGuidance: string;
    vocabularyGuidance: string;
    correctionStyle: string;
  }
> = {
  A2: {
    complexity:
      "Usa frasi semplici e dirette. Evita strutture grammaticali complesse. Mantieni il vocabolario quotidiano e accessibile.",
    tenseGuidance:
      "Concentrati principalmente sul presente indicativo. Introduci il passato prossimo solo quando necessario, con spiegazioni chiare.",
    vocabularyGuidance:
      "Usa parole comuni e quotidiane. Evita espressioni idiomatiche complesse o termini tecnici.",
    correctionStyle:
      "Offri correzioni gentili e semplici. Spiega brevemente perché la correzione è necessaria, usando esempi concreti.",
  },
  B1: {
    complexity:
      "Usa frasi di media complessità. Puoi introdurre strutture subordinate e congiunzioni più elaborate.",
    tenseGuidance:
      "Usa presente, passato prossimo e futuro semplice con naturalezza. Introduci l'imperfetto quando appropriato, con supporto contestuale.",
    vocabularyGuidance:
      "Espandi il vocabolario con termini più specifici e alcune espressioni idiomatiche comuni. Spiega termini meno comuni quando li usi.",
    correctionStyle:
      "Offri correzioni con spiegazioni più dettagliate. Puoi introdurre sfumature grammaticali e suggerimenti stilistici.",
  },
  B2: {
    complexity:
      "Puoi usare strutture grammaticali più sofisticate, incluso il congiuntivo quando appropriato. Mantieni comunque chiarezza e naturalezza.",
    tenseGuidance:
      "Usa tutti i tempi verbali con sicurezza, incluso congiuntivo, condizionale e trapassato. Spiega sfumature quando rilevanti.",
    vocabularyGuidance:
      "Usa un vocabolario ricco e vario, includendo espressioni idiomatiche e termini più raffinati. Offri alternative stilistiche quando utile.",
    correctionStyle:
      "Offri correzioni con spiegazioni approfondite, includendo note stilistiche, registri linguistici e alternative espressive.",
  },
};

/**
 * Builds a system prompt for the AI conversation partner based on topic and proficiency.
 *
 * @param topic - The conversation topic (may be in Polish)
 * @param proficiency - The learner's CEFR level (A2, B1, or B2)
 * @returns A complete system prompt string
 */
export function buildSystemPrompt(
  topic: string,
  proficiency: ProficiencyLevel,
): string {
  const guidance = PROFICIENCY_GUIDANCE[proficiency];

  return `${PERSONA_BASE}

${guidance.complexity}

${guidance.tenseGuidance}

${guidance.vocabularyGuidance}

${guidance.correctionStyle}

IMPORTANTE: L'utente ha scelto di parlare di: "${topic}"

Nota: L'argomento potrebbe essere espresso in polacco. Quando inizi la conversazione, fai riferimento esplicito a questo argomento in italiano, traducendo o parafrasando se necessario. Ad esempio:
- Se l'argomento riguarda un viaggio: "Parliamo del tuo prossimo viaggio..."
- Se l'argomento riguarda il lavoro: "Cominciamo a parlare del tuo lavoro..."
- Se l'argomento riguarda la meteorologia: "Parliamo del tempo e del clima..."
- Se l'argomento è generico: interpreta l'intento e inizia con "Parliamo di [tema in italiano]..."

Sii naturale e proattivo nel fare riferimento all'argomento scelto dall'utente.

Mantieni sempre le risposte in italiano, anche se l'utente usa occasionalmente parole polacche. Se l'utente chiede qualcosa in polacco (es. "jak się mówi..."), rispondi in italiano fornendo la traduzione o spiegazione richiesta.

Sii proattivo: fai domande di follow-up pertinenti all'argomento scelto per mantenere la conversazione fluida e coinvolgente.`;
}

/**
 * Extracts the core topic from a Polish phrase.
 * Handles common patterns like "Chcę rozmawiać o...", "Chcę porozmawiać o...", etc.
 */
function extractTopicFromPolish(phrase: string): string {
  const trimmed = phrase.trim();
  if (!trimmed) return trimmed;

  // Common Polish patterns for topic selection
  const patterns = [
    /chcę\s+(?:po)?rozmawiać\s+o\s+(.+)/i,
    /chcę\s+potrenować\s+(.+)/i,
    /chcę\s+mówić\s+o\s+(.+)/i,
    /temat:\s*(.+)/i,
    /argomento:\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // If no pattern matches, return the original (might already be a topic)
  return trimmed;
}

/**
 * Generates an initial greeting message that references the topic.
 * This is used when the session starts to welcome the learner.
 *
 * @param topic - The conversation topic (may be in Polish)
 * @param proficiency - The learner's proficiency level
 * @returns A greeting message in Italian
 */
export function generateInitialGreeting(
  topic: string,
  proficiency: ProficiencyLevel,
): string {
  const proficiencyGreeting: Record<ProficiencyLevel, string> = {
    A2: "Sono qui per aiutarti a praticare l'italiano in modo semplice e chiaro.",
    B1: "Sono qui per aiutarti a migliorare il tuo italiano con conversazioni più articolate.",
    B2: "Sono qui per aiutarti a perfezionare il tuo italiano con conversazioni più sofisticate.",
  };

  if (!topic.trim()) {
    return `Ciao! Scegli un argomento per iniziare. ${proficiencyGreeting[proficiency]} Quando sei pronto, inizia a parlare!`;
  }

  // Extract the actual topic from Polish phrases
  const extractedTopic = extractTopicFromPolish(topic);
  
  // For now, we reference the topic generically since it may be in Polish
  // In Story 2.2, the AI will generate a more natural greeting that properly references the topic
  const topicReference = "Ho capito l'argomento che vuoi trattare.";

  return `Ciao! ${topicReference} ${proficiencyGreeting[proficiency]} Quando sei pronto, inizia a parlare!`;
}

/**
 * Prompt configuration for logging and traceability.
 */
export interface PromptConfig {
  topic: string;
  proficiency: ProficiencyLevel;
  systemPrompt: string;
  generatedAt: number;
  sessionId?: string;
}

/**
 * Creates a prompt configuration object for logging purposes.
 *
 * @param topic - The conversation topic
 * @param proficiency - The learner's proficiency level
 * @param sessionId - Optional session identifier
 * @returns A prompt configuration object
 */
export function createPromptConfig(
  topic: string,
  proficiency: ProficiencyLevel,
  sessionId?: string,
): PromptConfig {
  return {
    topic,
    proficiency,
    systemPrompt: buildSystemPrompt(topic, proficiency),
    generatedAt: Date.now(),
    sessionId,
  };
}

