export interface ExplainRequestBody {
  kind?: unknown;
  id?: unknown;
  text?: unknown;
  language?: unknown;
  persona?: unknown;
  sport?: unknown;
  matchContext?: unknown;
  playerData?: unknown;
  eventData?: unknown;
}

export interface ValidationSuccess {
  isValid: true;
  data: {
    kind: "player" | "event" | "question" | "story";
    id?: string;
    text?: string;
    language: "en" | "hinglish";
    persona: "casual" | "analyst" | "desi";
    sport: string;
    matchContext?: string;
    playerData?: {
      name: string;
      role: string;
      team: string;
      onField: string;
      keyFacts: string[];
    };
    eventData?: {
      title: string;
      term: string;
      over: string;
    };
  };
}

export interface ValidationFailure {
  isValid: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateExplainInput(body: ExplainRequestBody | null | undefined): ValidationResult {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Invalid request: JSON body required." };
  }

  const { kind, language, text, persona, sport } = body;

  // Validate kind
  const validKinds = ["player", "event", "question", "story"];
  if (!kind || typeof kind !== "string" || !validKinds.includes(kind)) {
    return {
      isValid: false,
      error: "Invalid kind. Must be one of: 'player', 'event', 'question', 'story'.",
    };
  }

  // Validate language
  const validLanguages = ["en", "hinglish"];
  if (!language || typeof language !== "string" || !validLanguages.includes(language)) {
    return {
      isValid: false,
      error: "Invalid language. Must be 'en' or 'hinglish'.",
    };
  }

  // Validate free text
  if (text !== undefined && text !== null) {
    if (typeof text !== "string") {
      return { isValid: false, error: "Text field must be a string." };
    }
    if (text.length > 200) {
      return {
        isValid: false,
        error: "Text exceeds maximum allowed length of 200 characters.",
      };
    }
  }

  // Validate persona
  const validPersonas = ["casual", "analyst", "desi"];
  let validatedPersona: "casual" | "analyst" | "desi" = "casual";
  if (persona !== undefined && persona !== null) {
    if (typeof persona !== "string" || !validPersonas.includes(persona.toLowerCase())) {
      return {
        isValid: false,
        error: "Invalid persona. Must be one of: 'casual', 'analyst', 'desi'.",
      };
    }
    validatedPersona = persona.toLowerCase() as "casual" | "analyst" | "desi";
  }

  // Validate sport
  const validatedSport = (typeof sport === "string" && sport.trim()) ? sport.trim() : "Cricket";

  const pData = body.playerData && typeof body.playerData === "object" ? (body.playerData as Record<string, unknown>) : null;
  const eData = body.eventData && typeof body.eventData === "object" ? (body.eventData as Record<string, unknown>) : null;

  return {
    isValid: true,
    data: {
      kind: kind as "player" | "event" | "question" | "story",
      id: typeof body.id === "string" ? body.id : undefined,
      text: typeof text === "string" ? text.trim() : undefined,
      language: language as "en" | "hinglish",
      persona: validatedPersona,
      sport: validatedSport,
      matchContext: typeof body.matchContext === "string" ? body.matchContext : undefined,
      playerData: pData
        ? {
            name: String(pData.name || "Player"),
            role: String(pData.role || "Player"),
            team: String(pData.team || pData.country || "Team"),
            onField: String(pData.onField || "Active"),
            keyFacts: Array.isArray(pData.keyFacts) ? pData.keyFacts.map(String) : [],
          }
        : undefined,
      eventData: eData
        ? {
            title: String(eData.title || "Match Event"),
            term: String(eData.term || "Rule"),
            over: String(eData.over || "Live"),
          }
        : undefined,
    },
  };
}
