/**
 * SVG Template Engine Types
 *
 * Types for the template-based SVG credential rendering system.
 * Allows designers to create SVG templates with {{placeholders}} that
 * get filled in with credential attribute values.
 */

/**
 * Represents a variable placeholder found in an SVG template
 */
export interface TemplateVariable {
  /** The full placeholder string including braces, e.g., "{{FullName}}" */
  placeholder: string
  /** The variable name, e.g., "FullName" */
  name: string
  /** Optional default value if specified with | syntax, e.g., "{{GPA|N/A}}" */
  defaultValue?: string
  /** Optional path for nested JSON attributes, e.g., "student.fullName" */
  path?: string[]
}

/**
 * Mapping from placeholder variable names to credential attribute names
 */
export interface VariableMapping {
  [variableName: string]: string | {
    /** Attribute name or path in credential */
    attribute: string
    /** Optional transform function name */
    transform?: 'date' | 'uppercase' | 'lowercase' | 'capitalize'
    /** Optional default value */
    defaultValue?: string
  }
}

/**
 * An SVG template configuration
 */
export interface SVGTemplate {
  /** Unique identifier for the template */
  id: string
  /** Human-readable name */
  name: string
  /** The raw SVG template string with {{placeholders}} */
  svg: string
  /** Template width (for scaling) */
  width: number
  /** Template height (for scaling) */
  height: number
  /** Optional variable mapping (auto-detected if not provided) */
  variableMapping?: VariableMapping
  /** Schema IDs this template applies to */
  schemaIds?: string[]
  /** Credential type this template is for */
  credentialType?: 'student-id' | 'transcript' | 'generic'
}

/**
 * Result of parsing an SVG template
 */
export interface ParsedTemplate {
  /** Original SVG string */
  originalSvg: string
  /** List of variables found in the template */
  variables: TemplateVariable[]
  /** Width from viewBox or width attribute */
  width: number
  /** Height from viewBox or height attribute */
  height: number
}

/**
 * Options for rendering a template
 */
export interface RenderOptions {
  /** Target width for the rendered SVG */
  width?: number
  /** Whether to scale proportionally */
  maintainAspectRatio?: boolean
  /** Custom variable mapping to override defaults */
  variableMapping?: VariableMapping
}

/**
 * Credential attribute for template rendering
 */
export interface CredentialAttribute {
  name: string
  value: string
  mimeType?: string
}
