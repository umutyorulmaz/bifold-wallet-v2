/**
 * SVG Template Engine
 *
 * A system for rendering SVG templates with credential data.
 * Allows designers to create SVG templates with {{placeholders}}
 * that get filled in with credential attribute values.
 *
 * Usage:
 *
 * 1. Create an SVG with placeholders:
 *    <svg>
 *      <text>{{FullName}}</text>
 *      <text>ID: {{StudentNumber}}</text>
 *    </svg>
 *
 * 2. Register the template:
 *    registerTemplateFromSvg('student-id', 'Student ID', svgString, {
 *      schemaIds: ['64zTt4edLTprWQTUkrYhZJ:2:NC High School Student Card:1.0']
 *    })
 *
 * 3. Render with data:
 *    <SVGTemplateRenderer
 *      template={template.svg}
 *      attributes={credentialAttributes}
 *      width={320}
 *    />
 */

// Types
export * from './types'

// Parser
export {
  parseTemplate,
  extractVariables,
  extractDimensions,
  getVariableNames,
  hasVariables,
  validateVariables,
} from './SVGTemplateParser'

// Variable Mapper
export {
  findAttributeMatch,
  getNestedValue,
  tryParseJson,
  applyTransform,
  resolveVariable,
  resolveAllVariables,
  createAutoMapping,
} from './VariableMapper'

// Renderer
export {
  SVGTemplateRenderer,
  renderTemplateToString,
  previewTemplateValues,
} from './SVGTemplateRenderer'
export type { SVGTemplateRendererProps } from './SVGTemplateRenderer'

// Registry
export {
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
} from './templateRegistry'

// Transcript Table Generator (for hybrid templates)
export {
  generateTermsTableSVG,
  generateTranscriptFromTemplate,
} from './TranscriptTableGenerator'
export type { TableGeneratorOptions } from './TranscriptTableGenerator'

// Sample Templates
export {
  STUDENT_ID_TEMPLATE,
  TRANSCRIPT_TEMPLATE,
  TRANSCRIPT_TEMPLATE_CONFIG,
  SampleTemplates,
} from './sample-templates'

// Template Registration
export {
  registerSampleTemplates,
  getTranscriptTemplateConfig,
  detectSchoolFromSchemaId,
  detectSchoolFromName,
  detectSchoolFromCredDefId,
  detectSchool,
  getSchoolTemplateId,
  getTemplateForCredential,
  getCredentialTypeFromSchema,
  isSchemaIdSupported,
  getSupportedSchemaIds,
  STUDENT_ID_SCHEMAS,
  TRANSCRIPT_SCHEMAS,
  SCHOOL_PATTERNS,
  SCHOOL_SCHEMA_MAP,
} from './registerSampleTemplates'
export type { SchoolKey } from './registerSampleTemplates'
