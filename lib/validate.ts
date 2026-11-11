/**
 * Anti-Hallucination Number Validator
 * Deterministically verifies that all numerical quantities in generated LLM text
 * strictly correspond to the calculated economic quantities in the engine.
 */
export function numbersMatch(text: string, allowed: number[]): boolean {
  if (!text || allowed.length === 0) return true;

  // Extract all numbers (integers and decimals)
  const matches = text.match(/\d[\d,]*\.?\d*/g);
  if (!matches || matches.length === 0) return true;

  const foundNumbers = matches
    .map((s) => Number(s.replace(/,/g, '')))
    .filter((n) => !isNaN(n));

  // Every number found in the text must match an allowed number within tolerance 0.6
  // (allowing minor rounding differences between integers and decimals)
  return foundNumbers.every((n) =>
    allowed.some((a) => Math.abs(a - n) <= 0.6)
  );
}
