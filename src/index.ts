const FINNISH_HETU_CHECK_CHARS = '0123456789ABCDEFHJKLMNPRSTUVWXY' as const;

// Regex breakdown:
// - Day/Month/Year: \d{2}
// - Separator: [+\-A-FU-Y] (Includes 2024 standards: U-Y for 1900s, B-F for 2000s)
// - Individual: \d{3}
// - CheckChar: [0-9ABCDEFHJKLMNPRSTUVWXY] (only valid checksum characters)
const HETU_REGEX =
  /^(?<day>\d{2})(?<month>\d{2})(?<year>\d{2})(?<separator>[+\-A-FU-Y])(?<individual>\d{3})(?<checkChar>[0-9ABCDEFHJKLMNPRSTUVWXY])$/;

export interface ValidateFinnishHetuOptions {
  /**
   * Whether to accept artificial IDs (individual numbers 900-999, 000 and 001).
   * @default false
   */
  allowTestIds?: boolean;
  /**
   * Whether to trim whitespace from the input string before validation.
   * @default true
   */
  trimInput?: boolean;
}

interface HetuGroups {
  day: string;
  month: string;
  year: string;
  separator: string;
  individual: string;
  checkChar: string;
}

/**
 * Validates a Finnish Personal Identity Code (Henkilötunnus/HETU).
 *
 * Supports the modern format including new separators introduced in 2023/2024.
 *
 * @param hetu - The ID string to validate.
 * @param options - Configuration object.
 * @param options.allowTestIds - If `true`, accepts artificial IDs (900-999, 000 and 001). Defaults to `false`.
 * @param options.trimInput - If `true`, removes leading/trailing whitespace. Defaults to `true`.
 * @returns `true` if the HETU is valid according to format, date, and checksum rules; `false` otherwise.
 *
 * @example
 * // Valid real ID
 * validateFinnishHetu({ hetu: "131052-308T" }); // true
 *
 * // Test ID (900 series) - Rejected by default
 * validateFinnishHetu({ hetu: "010101-900R" }); // false
 *
 * // Test ID - Explicitly allowed
 * validateFinnishHetu({ hetu: "010101-900R", allowTestIds: true }); // true
 *
 * // Whitespace handling
 * validateFinnishHetu({ hetu: "  131052-308T  " }); // true (trim defaults to true)
 * validateFinnishHetu({ hetu: "  131052-308T  ", trimInput: false }); // false
 */
export function validateFinnishHetu(
  hetu: string,
  options: ValidateFinnishHetuOptions = {}
): boolean {
  const { allowTestIds = false, trimInput = true } = options;

  if (!hetu) return false;

  const normalized = (trimInput ? hetu.trim() : hetu).toUpperCase();

  const match = HETU_REGEX.exec(normalized) as
    | (RegExpExecArray & { groups: HetuGroups })
    | null;

  if (!match || !match.groups) {
    return false;
  }

  const { day, month, year, separator, individual, checkChar } = match.groups;

  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearShort = parseInt(year, 10);
  const individualNum = parseInt(individual, 10);

  // 1. Check individual number range
  // Real IDs: 002–899
  // Test IDs: 900–999, 000 and 001 (only if allowTestIds is true)
  const isRealIdRange = individualNum >= 2 && individualNum <= 899;

  // Reject invalid individual number ranges
  if (individualNum < 0 || individualNum > 999) {
    return false;
  }

  // Reject test IDs if not allowed
  if (!allowTestIds && !isRealIdRange) {
    return false;
  }

  // 2. Determine Century
  let century: number;
  if (separator === '+') {
    century = 1800;
  } else if ('-YXWVU'.includes(separator)) {
    century = 1900;
  } else if ('ABCDEF'.includes(separator)) {
    century = 2000;
  } else {
    return false;
  }

  const fullYear = century + yearShort;

  // 3. Validate Date using UTC to avoid timezone issues
  // Note: JS months are 0-11
  const birthDateUtc = new Date(Date.UTC(fullYear, monthNum - 1, dayNum));

  // Check if Date object corrected the date (e.g., Feb 30 -> Mar 2)
  if (
    birthDateUtc.getUTCFullYear() !== fullYear ||
    birthDateUtc.getUTCMonth() !== monthNum - 1 ||
    birthDateUtc.getUTCDate() !== dayNum
  ) {
    return false;
  }

  // Check against future dates (today at 00:00 UTC)
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  if (birthDateUtc > todayUtc) {
    return false;
  }

  // 4. Validate Checksum
  // Combine DDMMYY + Individual (ignoring separator)
  const numericString = day + month + year + individual;
  const remainder = parseInt(numericString, 10) % 31;
  const expectedCheckChar = FINNISH_HETU_CHECK_CHARS[remainder];

  return checkChar === expectedCheckChar;
}
