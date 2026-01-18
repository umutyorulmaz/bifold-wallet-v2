// Main exports
export { CredentialSVGRenderer, type CredentialSVGRendererProps } from './CredentialSVGRenderer'

// Types
export * from './types'

// Registry
export {
  schemaRegistry,
  getSchemaConfig,
  isSchemaSupported,
  detectCredentialType,
  getSupportedSchemaIds,
  brandingRegistry,
  getBrandingForCredential,
  getBrandingByKey,
  getAvailableSchoolKeys,
} from './registry'

// Parsers
export { parseStudentId, parseTranscript, getAttrValue, parseJsonAttribute } from './parsers'

// Templates (for advanced use cases)
export { StudentIDSVG, TranscriptSVG } from './templates'
export type { StudentIDSVGProps, TranscriptSVGProps } from './templates'

// SVG Components (for custom templates)
export {
  SVGText,
  SVGHeader,
  SVGPhoto,
  SVGTable,
  SVGGradeRow,
  SVGBarcode,
} from './templates/components'

// Template Engine (for paste-in SVG templates with {{placeholders}})
export {
  // Renderer
  SVGTemplateRenderer,
  renderTemplateToString,
  previewTemplateValues,
  // Parser
  parseTemplate,
  extractVariables,
  getVariableNames,
  hasVariables,
  // Registry
  registerTemplate,
  registerTemplateFromSvg,
  getTemplate,
  getTemplateForSchema,
  hasTemplateForSchema,
  getAllTemplates,
  // Variable mapping
  resolveAllVariables,
  createAutoMapping,
  // Transcript table generator (for hybrid templates)
  generateTermsTableSVG,
  generateTranscriptFromTemplate,
  // Sample templates
  STUDENT_ID_TEMPLATE,
  TRANSCRIPT_TEMPLATE,
  TRANSCRIPT_TEMPLATE_CONFIG,
  SampleTemplates,
  // Registration helper
  registerSampleTemplates,
  getTranscriptTemplateConfig,
} from './template-engine'

export type {
  SVGTemplate,
  TemplateVariable,
  VariableMapping,
  ParsedTemplate,
  SVGTemplateRendererProps,
  TableGeneratorOptions,
} from './template-engine'
