const DAYS_SHORT = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAYS_FULL = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTHS_FULL = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

type FillPattern =
  | { type: 'number'; start: number; step: number }
  | { type: 'sequence'; list: string[]; startIdx: number; step: number }
  | { type: 'textNumber'; prefix: string; suffix: string; start: number; step: number }
  | { type: 'repeat'; values: string[] };

export function detectPattern(values: string[]): FillPattern {
  if (values.length === 0) return { type: 'repeat', values: [''] };

  // Try number pattern
  const nums = values.map((v) => Number(v));
  if (nums.every((n) => !isNaN(n) && values.every((v) => v.trim() !== ''))) {
    const step = nums.length >= 2 ? nums[1] - nums[0] : 1;
    const isLinear = nums.length < 2 || nums.every((n, i) => i === 0 || Math.abs(n - (nums[0] + step * i)) < 1e-10);
    if (isLinear) return { type: 'number', start: nums[nums.length - 1], step };
  }

  // Try sequence pattern (days/months)
  const seqResult = trySequence(values, DAYS_SHORT) ?? trySequence(values, DAYS_FULL) ?? trySequence(values, MONTHS_SHORT) ?? trySequence(values, MONTHS_FULL);
  if (seqResult != null) return seqResult;

  // Try text + number pattern (e.g. "Item1", "Item2")
  const textNumMatch = values[0].match(/^(.*?)(\d+)(\D*)$/);
  if (textNumMatch != null) {
    const prefix = textNumMatch[1];
    const suffix = textNumMatch[3];
    const extractedNums = values.map((v) => {
      const m = v.match(/^(.*?)(\d+)(\D*)$/);
      if (m == null || m[1] !== prefix || m[3] !== suffix) return null;
      return Number(m[2]);
    });
    if (extractedNums.every((n) => n !== null)) {
      const ns = extractedNums as number[];
      const step = ns.length >= 2 ? ns[1] - ns[0] : 1;
      const isLinear = ns.length < 2 || ns.every((n, i) => i === 0 || n === ns[0] + step * i);
      if (isLinear) return { type: 'textNumber', prefix, suffix, start: ns[ns.length - 1], step };
    }
  }

  // Fallback: repeat
  return { type: 'repeat', values };
}

function trySequence(values: string[], list: string[]): FillPattern | null {
  const lower = values.map((v) => v.toLowerCase());
  const idx0 = list.indexOf(lower[0]);
  if (idx0 === -1) return null;

  const step = values.length >= 2 ? ((list.indexOf(lower[1]) - idx0 + list.length) % list.length) || 1 : 1;

  // Verify all values match the sequence
  for (let i = 1; i < lower.length; i++) {
    const expected = list[(idx0 + step * i) % list.length];
    if (lower[i] !== expected) return null;
  }

  const lastIdx = (idx0 + step * (values.length - 1)) % list.length;
  return { type: 'sequence', list, startIdx: lastIdx, step };
}

export function generateFillValues(pattern: FillPattern, count: number, direction: 1 | -1): string[] {
  const results: string[] = [];
  const effectiveStep = direction;

  for (let i = 1; i <= count; i++) {
    switch (pattern.type) {
      case 'number':
        results.push(String(pattern.start + pattern.step * effectiveStep * i));
        break;
      case 'sequence': {
        const idx = ((pattern.startIdx + pattern.step * effectiveStep * i) % pattern.list.length + pattern.list.length) % pattern.list.length;
        const val = pattern.list[idx];
        // Preserve original casing style
        results.push(capitalizeAs(val, pattern.list[pattern.startIdx]));
        break;
      }
      case 'textNumber':
        results.push(`${pattern.prefix}${pattern.start + pattern.step * effectiveStep * i}${pattern.suffix}`);
        break;
      case 'repeat':
        results.push(pattern.values[(i - 1) % pattern.values.length]);
        break;
    }
  }
  return results;
}

function capitalizeAs(value: string, reference: string): string {
  // Match the capitalization style of the reference
  if (reference === reference.toUpperCase()) return value.toUpperCase();
  if (reference[0] === reference[0].toUpperCase()) return value[0].toUpperCase() + value.slice(1);
  return value;
}
