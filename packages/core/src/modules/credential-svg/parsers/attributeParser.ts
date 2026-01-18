import { CredentialPreviewAttribute } from '../types'

/**
 * Get attribute value by trying multiple possible attribute names (case-insensitive)
 * Returns the first matching attribute value found
 */
export function getAttrValue(
  attributes: CredentialPreviewAttribute[],
  ...names: string[]
): string | undefined {
  for (const name of names) {
    const attr = attributes.find((a) => a.name.toLowerCase() === name.toLowerCase())
    if (attr?.value && attr.value.trim() !== '') {
      return attr.value
    }
  }
  return undefined
}

/**
 * Parse a JSON attribute value safely
 * Returns undefined if parsing fails or attribute not found
 */
export function parseJsonAttribute<T>(
  attributes: CredentialPreviewAttribute[],
  ...names: string[]
): T | undefined {
  const value = getAttrValue(attributes, ...names)
  if (!value) {
    return undefined
  }

  try {
    return JSON.parse(value) as T
  } catch {
    // Silent failure - return undefined if JSON parsing fails
    return undefined
  }
}

/**
 * Normalize all attributes into a simple key-value map
 * Useful for debugging or quick access
 */
export function normalizeAttributes(
  attributes: CredentialPreviewAttribute[]
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const attr of attributes) {
    if (attr.name && attr.value) {
      result[attr.name.toLowerCase()] = attr.value
    }
  }

  return result
}

/**
 * Extract year range from term data
 * Term years are typically in format "YYYY-YYYY" or just "YYYY"
 */
export function extractYearRange(
  termYear: string | undefined
): { start?: string; end?: string } {
  if (!termYear) {
    return {}
  }

  const parts = termYear.split('-')
  if (parts.length >= 2) {
    return {
      start: parts[0].trim(),
      end: parts[1].trim(),
    }
  }

  return {
    start: termYear.trim(),
    end: termYear.trim(),
  }
}

/**
 * Format a date string for display
 * Handles various input formats
 */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) {
    return ''
  }

  // Already formatted (e.g., "06/21/2025")
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    return dateStr
  }

  // ISO format (e.g., "2025-06-21")
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    }
  }

  // YYYYMMDD format (e.g., "20250621")
  if (/^\d{8}$/.test(dateStr)) {
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${parseInt(month)}/${parseInt(day)}/${year}`
  }

  return dateStr
}

/**
 * Get image URI from photo data
 * Handles both base64 strings and data URIs
 */
export function getImageUri(photo: string | undefined): string | undefined {
  if (!photo || photo.trim() === '') {
    return undefined
  }

  // Already a data URI
  if (photo.startsWith('data:')) {
    return photo
  }

  // Raw base64 - convert to data URI
  return `data:image/png;base64,${photo}`
}

/**
 * Clean and normalize a string value
 * Removes extra whitespace and handles undefined
 */
export function cleanString(value: string | undefined): string {
  if (!value) {
    return ''
  }
  return value.trim().replace(/\s+/g, ' ')
}
