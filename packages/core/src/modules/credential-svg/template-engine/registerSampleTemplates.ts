/**
 * Register Sample Templates
 *
 * Registers school-specific SVG templates for Student ID and Transcript
 * credentials with their corresponding schema IDs.
 *
 * Templates are selected based on:
 * 1. Schema ID (determines credential type: student-id or transcript)
 * 2. SchoolName attribute (determines which school's branded template to use)
 *
 * Call this function once at app startup to enable template-based rendering.
 */

import { registerTemplateFromSvg, getTemplate } from './templateRegistry'

// School-specific Student ID templates
import { NHCS_STUDENT_ID_TEMPLATE } from './sample-templates/nhcsStudentIdTemplate'
import { PENDER_STUDENT_ID_TEMPLATE } from './sample-templates/penderStudentIdTemplate'
import { CAPEFEAR_STUDENT_ID_TEMPLATE } from './sample-templates/capeFearStudentIdTemplate'
import { MIAMIDADE_STUDENT_ID_TEMPLATE } from './sample-templates/miamiDadeStudentIdTemplate'

// School-specific Transcript templates
import {
  NHCS_TRANSCRIPT_TEMPLATE,
  NHCS_TRANSCRIPT_TEMPLATE_CONFIG,
} from './sample-templates/nhcsTranscriptTemplate'
import {
  PENDER_TRANSCRIPT_TEMPLATE,
  PENDER_TRANSCRIPT_TEMPLATE_CONFIG,
} from './sample-templates/penderTranscriptTemplate'
import {
  CAPEFEAR_TRANSCRIPT_TEMPLATE,
  CAPEFEAR_TRANSCRIPT_TEMPLATE_CONFIG,
} from './sample-templates/capeFearTranscriptTemplate'
import {
  MIAMIDADE_TRANSCRIPT_TEMPLATE,
  MIAMIDADE_TRANSCRIPT_TEMPLATE_CONFIG,
} from './sample-templates/miamiDadeTranscriptTemplate'

// Generic fallback templates
import { STUDENT_ID_TEMPLATE } from './sample-templates/studentIdTemplate'
import { TRANSCRIPT_TEMPLATE, TRANSCRIPT_TEMPLATE_CONFIG } from './sample-templates/transcriptTemplate'

/**
 * Schema IDs for Student ID credentials
 */
export const STUDENT_ID_SCHEMAS = [
  '64zTt4edLTprWQTUkrYhZJ:2:NC High School Student Card:1.0',
  '64zTt4edLTprWQTUkrYhZJ:2:College Student ID:1.1',
]

/**
 * Schema IDs for Transcript credentials
 */
export const TRANSCRIPT_SCHEMAS = [
  '64zTt4edLTprWQTUkrYhZJ:2:NC High School Transcript:1.4',
  '64zTt4edLTprWQTUkrYhZJ:2:NC College Transcript:1.0',
]

/**
 * Credential Definition ID patterns to school mapping
 * The credDefId tag (last part) identifies the school
 * Format: <issuer>:3:CL:<seq>:<tag>
 */
export const SCHOOL_CRED_DEF_PATTERNS: Record<string, string[]> = {
  nhcs: ['NHCS'],
  pender: ['PCS'],
  capeFear: ['CFCC'],
  miamiDade: ['M-DCPS', 'MDCPS', 'Miami-Dade', 'MiamiDade'],
}

/**
 * Schema ID to school mapping (fallback if credDefId doesn't match)
 * Note: Multiple schools may share the same schema, so credDefId is preferred
 */
export const SCHOOL_SCHEMA_MAP: Record<string, string> = {
  // These are fallbacks - credDefId patterns take priority
  // '64zTt4edLTprWQTUkrYhZJ:2:NC College Transcript:1.0': 'capeFear',
  // '64zTt4edLTprWQTUkrYhZJ:2:College Student ID:1.1': 'capeFear',
}

/**
 * School name patterns to template mapping (fallback)
 * Used only if credDefId doesn't match
 */
export const SCHOOL_PATTERNS = {
  nhcs: [
    'new hanover',
    'nhcs',
    'hanover county',
  ],
  pender: ['pender', 'pcs', 'pender county'],
  capeFear: ['cape fear', 'cfcc', 'cape fear community'],
  miamiDade: ['miami', 'dade', 'm-dcps', 'miami-dade'],
} as const

export type SchoolKey = keyof typeof SCHOOL_PATTERNS

/**
 * Detect school from schema ID (most reliable)
 */
export function detectSchoolFromSchemaId(schemaId: string | undefined): SchoolKey | null {
  if (!schemaId) return null

  const school = SCHOOL_SCHEMA_MAP[schemaId]
  return school as SchoolKey | null
}

/**
 * Detect school from credential definition ID
 * Checks the credDefId tag (last part after the colon) for school patterns
 */
export function detectSchoolFromCredDefId(credDefId: string | undefined): SchoolKey | null {
  if (!credDefId) return null

  // credDefId format: <issuer>:3:CL:<seq>:<tag>
  // The tag often contains school identifier like "NHCS Student Card", "PCS Student Card"
  const upperCredDefId = credDefId.toUpperCase()

  for (const [school, patterns] of Object.entries(SCHOOL_CRED_DEF_PATTERNS)) {
    for (const pattern of patterns) {
      if (upperCredDefId.includes(pattern.toUpperCase())) {
        return school as SchoolKey
      }
    }
  }

  return null
}

/**
 * Detect school from SchoolName attribute (last resort fallback)
 */
export function detectSchoolFromName(schoolName: string | undefined): SchoolKey | null {
  if (!schoolName) return null

  const normalized = schoolName.toLowerCase().trim()

  for (const [school, patterns] of Object.entries(SCHOOL_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern)) {
        return school as SchoolKey
      }
    }
  }

  return null
}

/**
 * Detect school: credDefId first (most specific), then schemaId, then schoolName
 */
export function detectSchool(schemaId?: string, credDefId?: string, schoolName?: string): SchoolKey | null {
  // First try credDefId (most specific - contains school tag like "NHCS", "PCS", "CFCC")
  const fromCredDef = detectSchoolFromCredDefId(credDefId)
  if (fromCredDef) return fromCredDef

  // Then try schema ID
  const fromSchema = detectSchoolFromSchemaId(schemaId)
  if (fromSchema) return fromSchema

  // Fall back to school name attribute
  return detectSchoolFromName(schoolName)
}

/**
 * Get the template ID for a school and credential type
 */
export function getSchoolTemplateId(
  school: SchoolKey | null,
  credentialType: 'student-id' | 'transcript'
): string {
  if (!school) {
    return credentialType === 'student-id' ? 'generic-student-id' : 'generic-transcript'
  }
  return `${school}-${credentialType}`
}

/**
 * Common variable mapping for student ID credentials
 */
const STUDENT_ID_VARIABLE_MAPPING = {
  FullName: 'FullName',
  StudentNumber: 'StudentNumber',
  Expiration: 'Expiration',
  SchoolName: 'SchoolName',
  Photo: 'StudentPhoto',
}

/**
 * Common variable mapping for transcript credentials
 */
const TRANSCRIPT_VARIABLE_MAPPING = {
  FullName: 'FullName',
  StudentNumber: 'StudentNumber',
  BirthDate: 'BirthDate',
  GPA: 'GPA',
  Credits: 'Credits',
  SchoolName: 'SchoolName',
}

/**
 * Register all school-specific templates
 */
export function registerSampleTemplates(): void {
  // =====================
  // STUDENT ID TEMPLATES
  // =====================

  // NHCS Student ID
  registerTemplateFromSvg('nhcs-student-id', 'NHCS Student ID', NHCS_STUDENT_ID_TEMPLATE, {
    credentialType: 'student-id',
    variableMapping: STUDENT_ID_VARIABLE_MAPPING,
  })

  // Pender Student ID
  registerTemplateFromSvg('pender-student-id', 'Pender Student ID', PENDER_STUDENT_ID_TEMPLATE, {
    credentialType: 'student-id',
    variableMapping: STUDENT_ID_VARIABLE_MAPPING,
  })

  // Cape Fear Student ID
  registerTemplateFromSvg('capeFear-student-id', 'Cape Fear Student ID', CAPEFEAR_STUDENT_ID_TEMPLATE, {
    credentialType: 'student-id',
    variableMapping: STUDENT_ID_VARIABLE_MAPPING,
  })

  // Miami-Dade Student ID
  registerTemplateFromSvg('miamiDade-student-id', 'Miami-Dade Student ID', MIAMIDADE_STUDENT_ID_TEMPLATE, {
    credentialType: 'student-id',
    variableMapping: STUDENT_ID_VARIABLE_MAPPING,
  })

  // Generic Student ID (fallback)
  registerTemplateFromSvg('generic-student-id', 'Student ID Card', STUDENT_ID_TEMPLATE, {
    schemaIds: STUDENT_ID_SCHEMAS,
    credentialType: 'student-id',
    variableMapping: STUDENT_ID_VARIABLE_MAPPING,
  })

  // =====================
  // TRANSCRIPT TEMPLATES
  // =====================

  // NHCS Transcript
  registerTemplateFromSvg('nhcs-transcript', 'NHCS Transcript', NHCS_TRANSCRIPT_TEMPLATE, {
    credentialType: 'transcript',
    variableMapping: TRANSCRIPT_VARIABLE_MAPPING,
  })

  // Pender Transcript
  registerTemplateFromSvg('pender-transcript', 'Pender Transcript', PENDER_TRANSCRIPT_TEMPLATE, {
    credentialType: 'transcript',
    variableMapping: TRANSCRIPT_VARIABLE_MAPPING,
  })

  // Cape Fear Transcript
  registerTemplateFromSvg('capeFear-transcript', 'Cape Fear Transcript', CAPEFEAR_TRANSCRIPT_TEMPLATE, {
    credentialType: 'transcript',
    variableMapping: TRANSCRIPT_VARIABLE_MAPPING,
  })

  // Miami-Dade Transcript
  registerTemplateFromSvg('miamiDade-transcript', 'Miami-Dade Transcript', MIAMIDADE_TRANSCRIPT_TEMPLATE, {
    credentialType: 'transcript',
    variableMapping: TRANSCRIPT_VARIABLE_MAPPING,
  })

  // Generic Transcript (fallback)
  registerTemplateFromSvg('generic-transcript', 'Official Transcript', TRANSCRIPT_TEMPLATE, {
    schemaIds: TRANSCRIPT_SCHEMAS,
    credentialType: 'transcript',
    variableMapping: TRANSCRIPT_VARIABLE_MAPPING,
  })
}

/**
 * Get the transcript template configuration for a school
 */
export function getTranscriptTemplateConfig(school?: SchoolKey | null) {
  switch (school) {
    case 'nhcs':
      return NHCS_TRANSCRIPT_TEMPLATE_CONFIG
    case 'pender':
      return PENDER_TRANSCRIPT_TEMPLATE_CONFIG
    case 'capeFear':
      return CAPEFEAR_TRANSCRIPT_TEMPLATE_CONFIG
    case 'miamiDade':
      return MIAMIDADE_TRANSCRIPT_TEMPLATE_CONFIG
    default:
      return TRANSCRIPT_TEMPLATE_CONFIG
  }
}

/**
 * Get all supported schema IDs
 */
export function getSupportedSchemaIds(): string[] {
  return [...STUDENT_ID_SCHEMAS, ...TRANSCRIPT_SCHEMAS]
}

/**
 * Check if a schema ID is supported
 */
export function isSchemaIdSupported(schemaId: string): boolean {
  return getSupportedSchemaIds().includes(schemaId)
}

/**
 * Get credential type from schema ID
 */
export function getCredentialTypeFromSchema(schemaId: string): 'student-id' | 'transcript' | null {
  if (STUDENT_ID_SCHEMAS.includes(schemaId)) {
    return 'student-id'
  }
  if (TRANSCRIPT_SCHEMAS.includes(schemaId)) {
    return 'transcript'
  }
  return null
}

/**
 * Get the appropriate template for a credential based on schema, credDefId, and school
 */
export function getTemplateForCredential(
  schemaId: string,
  credDefId?: string,
  schoolName?: string
) {
  const credentialType = getCredentialTypeFromSchema(schemaId)
  if (!credentialType) return null

  // Detect school from schemaId first, then credDefId, then schoolName
  const school = detectSchool(schemaId, credDefId, schoolName)
  const templateId = getSchoolTemplateId(school, credentialType)

  return getTemplate(templateId)
}

export default registerSampleTemplates
