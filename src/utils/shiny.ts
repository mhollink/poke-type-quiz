const SHINY_CHANCE_BY_WEEKDAY = [
  0.01, // Sunday
  0.02, // Monday
  0.03, // Tuesday
  0.05, // Wednesday
  0.03, // Thursday
  0.02, // Friday
  0.01, // Saturday
] as const;

export function getShinyChance(dateKey: string): number {
  const dayOfWeek = new Date(dateKey).getUTCDay();

  return SHINY_CHANCE_BY_WEEKDAY[dayOfWeek];
}
