/**
 * Shared utility for parsing and validating numeric IDs from route parameters
 * Extracted from duplicated code in multiple route files
 */

/**
 * Parses a string value to a valid integer ID
 * @param value - The string value to parse (typically from req.params.id)
 * @returns The parsed integer ID, or null if invalid
 */
export const parseId = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const id = Number.parseInt(value, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
};
