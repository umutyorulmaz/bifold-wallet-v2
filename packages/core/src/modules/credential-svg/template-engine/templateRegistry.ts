/**
 * SVG Template Registry
 *
 * Stores and retrieves SVG templates for credential rendering.
 * Templates can be registered by schema ID or credential type.
 */

import { SVGTemplate, VariableMapping } from './types'

/**
 * Registry of SVG templates
 */
const templates: Map<string, SVGTemplate> = new Map()

/**
 * Mapping from schema IDs to template IDs
 */
const schemaToTemplate: Map<string, string> = new Map()

/**
 * Register an SVG template
 */
export function registerTemplate(template: SVGTemplate): void {
  templates.set(template.id, template)

  // Map schema IDs to this template
  if (template.schemaIds) {
    for (const schemaId of template.schemaIds) {
      schemaToTemplate.set(schemaId, template.id)
    }
  }
}

/**
 * Register an SVG template from a raw SVG string
 */
export function registerTemplateFromSvg(
  id: string,
  name: string,
  svg: string,
  options?: {
    schemaIds?: string[]
    credentialType?: 'student-id' | 'transcript' | 'generic'
    variableMapping?: VariableMapping
  }
): SVGTemplate {
  // Extract dimensions from SVG
  const widthMatch = svg.match(/width=["'](\d+(?:\.\d+)?)(?:px)?["']/i)
  const heightMatch = svg.match(/height=["'](\d+(?:\.\d+)?)(?:px)?["']/i)
  const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/i)

  let width = 320
  let height = 200

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/[\s,]+/)
    if (parts.length >= 4) {
      width = parseFloat(parts[2]) || width
      height = parseFloat(parts[3]) || height
    }
  }

  if (widthMatch) width = parseFloat(widthMatch[1]) || width
  if (heightMatch) height = parseFloat(heightMatch[1]) || height

  const template: SVGTemplate = {
    id,
    name,
    svg,
    width,
    height,
    schemaIds: options?.schemaIds,
    credentialType: options?.credentialType,
    variableMapping: options?.variableMapping,
  }

  registerTemplate(template)
  return template
}

/**
 * Get a template by ID
 */
export function getTemplate(id: string): SVGTemplate | undefined {
  return templates.get(id)
}

/**
 * Get a template for a schema ID
 */
export function getTemplateForSchema(schemaId: string): SVGTemplate | undefined {
  const templateId = schemaToTemplate.get(schemaId)
  if (templateId) {
    return templates.get(templateId)
  }
  return undefined
}

/**
 * Get a template for a credential type
 */
export function getTemplateForType(
  credentialType: 'student-id' | 'transcript' | 'generic'
): SVGTemplate | undefined {
  for (const template of templates.values()) {
    if (template.credentialType === credentialType) {
      return template
    }
  }
  return undefined
}

/**
 * Check if a template exists for a schema
 */
export function hasTemplateForSchema(schemaId: string): boolean {
  return schemaToTemplate.has(schemaId)
}

/**
 * Get all registered templates
 */
export function getAllTemplates(): SVGTemplate[] {
  return Array.from(templates.values())
}

/**
 * Remove a template
 */
export function removeTemplate(id: string): boolean {
  const template = templates.get(id)
  if (template) {
    // Remove schema mappings
    if (template.schemaIds) {
      for (const schemaId of template.schemaIds) {
        schemaToTemplate.delete(schemaId)
      }
    }
    return templates.delete(id)
  }
  return false
}

/**
 * Clear all templates
 */
export function clearTemplates(): void {
  templates.clear()
  schemaToTemplate.clear()
}

/**
 * Map a schema ID to an existing template
 */
export function mapSchemaToTemplate(schemaId: string, templateId: string): boolean {
  const template = templates.get(templateId)
  if (template) {
    schemaToTemplate.set(schemaId, templateId)
    return true
  }
  return false
}

export default {
  registerTemplate,
  registerTemplateFromSvg,
  getTemplate,
  getTemplateForSchema,
  getTemplateForType,
  hasTemplateForSchema,
  getAllTemplates,
  removeTemplate,
  clearTemplates,
  mapSchemaToTemplate,
}
