/**
 * SVG Template Parser
 *
 * Parses SVG template strings to extract {{placeholder}} variables
 * and template dimensions.
 */

import { ParsedTemplate, TemplateVariable } from './types'

/** Regex to match {{variableName}} or {{variableName|defaultValue}} */
const PLACEHOLDER_REGEX = /\{\{([^}|]+)(?:\|([^}]*))?\}\}/g

/** Regex to extract width/height from SVG */
const WIDTH_REGEX = /width=["'](\d+(?:\.\d+)?)(?:px)?["']/i
const HEIGHT_REGEX = /height=["'](\d+(?:\.\d+)?)(?:px)?["']/i
const VIEWBOX_REGEX = /viewBox=["']([^"']+)["']/i

/**
 * Parse an SVG template string to extract variables and dimensions
 */
export function parseTemplate(svgString: string): ParsedTemplate {
  const variables = extractVariables(svgString)
  const { width, height } = extractDimensions(svgString)

  return {
    originalSvg: svgString,
    variables,
    width,
    height,
  }
}

/**
 * Extract all {{placeholder}} variables from an SVG string
 */
export function extractVariables(svgString: string): TemplateVariable[] {
  const variables: TemplateVariable[] = []
  const seen = new Set<string>()

  let match
  while ((match = PLACEHOLDER_REGEX.exec(svgString)) !== null) {
    const placeholder = match[0]
    const fullName = match[1].trim()
    const defaultValue = match[2]?.trim()

    // Skip duplicates
    if (seen.has(fullName)) continue
    seen.add(fullName)

    // Check if it's a nested path (e.g., "student.fullName")
    const path = fullName.includes('.') ? fullName.split('.') : undefined

    variables.push({
      placeholder,
      name: fullName,
      defaultValue,
      path,
    })
  }

  // Reset regex lastIndex
  PLACEHOLDER_REGEX.lastIndex = 0

  return variables
}

/**
 * Extract width and height from SVG string
 */
export function extractDimensions(svgString: string): { width: number; height: number } {
  let width = 320 // Default
  let height = 200 // Default

  // Try viewBox first
  const viewBoxMatch = VIEWBOX_REGEX.exec(svgString)
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/[\s,]+/)
    if (parts.length >= 4) {
      width = parseFloat(parts[2]) || width
      height = parseFloat(parts[3]) || height
    }
  }

  // Override with explicit width/height if present
  const widthMatch = WIDTH_REGEX.exec(svgString)
  if (widthMatch) {
    width = parseFloat(widthMatch[1]) || width
  }

  const heightMatch = HEIGHT_REGEX.exec(svgString)
  if (heightMatch) {
    height = parseFloat(heightMatch[1]) || height
  }

  return { width, height }
}

/**
 * Get a list of variable names from an SVG template
 */
export function getVariableNames(svgString: string): string[] {
  return extractVariables(svgString).map((v) => v.name)
}

/**
 * Check if an SVG string contains any template variables
 */
export function hasVariables(svgString: string): boolean {
  PLACEHOLDER_REGEX.lastIndex = 0
  return PLACEHOLDER_REGEX.test(svgString)
}

/**
 * Validate that all required variables have mappings
 */
export function validateVariables(
  variables: TemplateVariable[],
  availableAttributes: string[]
): { valid: boolean; missing: string[] } {
  const attrSet = new Set(availableAttributes.map((a) => a.toLowerCase()))
  const missing: string[] = []

  for (const variable of variables) {
    const baseName = variable.path ? variable.path[0] : variable.name
    if (!attrSet.has(baseName.toLowerCase()) && !variable.defaultValue) {
      missing.push(variable.name)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

export default {
  parseTemplate,
  extractVariables,
  extractDimensions,
  getVariableNames,
  hasVariables,
  validateVariables,
}
