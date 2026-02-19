export type DCASType = "D" | "C" | "A" | "S";
export type ScoreRange = "Low" | "Moderate" | "High";

export interface DCASScores {
  D: number;
  C: number;
  A: number;
  S: number;
}

export interface DCASScoreRanges {
  D: ScoreRange;
  C: ScoreRange;
  A: ScoreRange;
  S: ScoreRange;
}

export interface DCASResult {
  scores: DCASScores;
  scoreRanges: DCASScoreRanges;
  primaryType: DCASType;
  secondaryType: DCASType;
}

export function getScoreRange(score: number): ScoreRange {
  if (score <= 7) return "Low";
  if (score <= 14) return "Moderate";
  return "High";
}

export function getRankedTypes(scores: DCASScores): DCASType[] {
  return (Object.entries(scores) as [DCASType, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);
}

export function calculateScores(
  answers: Record<string | number, DCASType> | (DCASType | undefined | null)[],
): DCASScores {
  const scores: DCASScores = { D: 0, C: 0, A: 0, S: 0 };
  const values = Array.isArray(answers) ? answers : Object.values(answers);

  values.forEach((type) => {
    if (type && scores[type] !== undefined) {
      scores[type]++;
    }
  });
  return scores;
}

export function calculatePercentages(
  scores: DCASScores,
  total: number,
): Record<DCASType, number> {
  return {
    D: total ? Math.round((scores.D / total) * 100) : 0,
    C: total ? Math.round((scores.C / total) * 100) : 0,
    A: total ? Math.round((scores.A / total) * 100) : 0,
    S: total ? Math.round((scores.S / total) * 100) : 0,
  };
}

export function calculateDCASResult(scores: DCASScores): DCASResult {
  const ranked = getRankedTypes(scores);

  const scoreRanges: DCASScoreRanges = {
    D: getScoreRange(scores.D),
    C: getScoreRange(scores.C),
    A: getScoreRange(scores.A),
    S: getScoreRange(scores.S),
  };

  return {
    scores,
    scoreRanges,
    primaryType: ranked[0],
    secondaryType: ranked[1],
  };
}

export const defaultDCASNames: Record<DCASType, string> = {
  D: "Driver",
  C: "Connector",
  A: "Anchor",
  S: "Strategist",
};

export const defaultDCASSymbols: Record<DCASType, string> = {
  D: "D",
  C: "C",
  A: "A",
  S: "S",
};

export function getDCASTypeName(
  type: DCASType,
  customNames?: Record<DCASType, string>,
): string {
  const names = customNames || defaultDCASNames;
  return names[type] || defaultDCASNames[type];
}

export function getDCASTypeSymbol(
  type: DCASType,
  customSymbols?: Record<DCASType, string>,
): string {
  const symbols = customSymbols || defaultDCASSymbols;
  return symbols[type] || defaultDCASSymbols[type];
}

export function getDCASColor(type: DCASType): string {
  const colors: Record<DCASType, string> = {
    D: "#DC2626",
    C: "#F59E0B",
    A: "#10B981",
    S: "#3B82F6",
  };
  return colors[type];
}

export const dcasColors: Record<
  DCASType,
  { primary: string; light: string; bg: string }
> = {
  D: { primary: "#DC2626", light: "#FEE2E2", bg: "bg-red-500" },
  C: { primary: "#F59E0B", light: "#FEF3C7", bg: "bg-yellow-500" },
  A: { primary: "#10B981", light: "#D1FAE5", bg: "bg-green-500" },
  S: { primary: "#3B82F6", light: "#DBEAFE", bg: "bg-blue-500" },
};

export function getScoreLevel(score: number, total: number): string {
  const percentage = (score / total) * 100;
  if (percentage >= 70) return "High";
  if (percentage >= 40) return "Moderate";
  return "Low";
}
