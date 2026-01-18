/**
 * Sample SVG Templates
 *
 * Pre-designed SVG templates for Student ID and Transcript credentials.
 * These can be registered with the template registry and used for rendering.
 */

// Generic templates
export { STUDENT_ID_TEMPLATE } from './studentIdTemplate'
export { TRANSCRIPT_TEMPLATE, TRANSCRIPT_TEMPLATE_CONFIG } from './transcriptTemplate'

// School-specific Student ID templates with embedded logos
export { NHCS_STUDENT_ID_TEMPLATE } from './nhcsStudentIdTemplate'
export { PENDER_STUDENT_ID_TEMPLATE } from './penderStudentIdTemplate'
export { CAPEFEAR_STUDENT_ID_TEMPLATE } from './capeFearStudentIdTemplate'
export { MIAMIDADE_STUDENT_ID_TEMPLATE } from './miamiDadeStudentIdTemplate'

// School-specific Transcript templates with embedded logos
export { NHCS_TRANSCRIPT_TEMPLATE, NHCS_TRANSCRIPT_TEMPLATE_CONFIG } from './nhcsTranscriptTemplate'
export { PENDER_TRANSCRIPT_TEMPLATE, PENDER_TRANSCRIPT_TEMPLATE_CONFIG } from './penderTranscriptTemplate'
export { CAPEFEAR_TRANSCRIPT_TEMPLATE, CAPEFEAR_TRANSCRIPT_TEMPLATE_CONFIG } from './capeFearTranscriptTemplate'
export { MIAMIDADE_TRANSCRIPT_TEMPLATE, MIAMIDADE_TRANSCRIPT_TEMPLATE_CONFIG } from './miamiDadeTranscriptTemplate'

// Re-export for convenience
import { STUDENT_ID_TEMPLATE } from './studentIdTemplate'
import { TRANSCRIPT_TEMPLATE, TRANSCRIPT_TEMPLATE_CONFIG } from './transcriptTemplate'
import { NHCS_STUDENT_ID_TEMPLATE } from './nhcsStudentIdTemplate'
import { PENDER_STUDENT_ID_TEMPLATE } from './penderStudentIdTemplate'
import { CAPEFEAR_STUDENT_ID_TEMPLATE } from './capeFearStudentIdTemplate'
import { MIAMIDADE_STUDENT_ID_TEMPLATE } from './miamiDadeStudentIdTemplate'
import { NHCS_TRANSCRIPT_TEMPLATE, NHCS_TRANSCRIPT_TEMPLATE_CONFIG } from './nhcsTranscriptTemplate'
import { PENDER_TRANSCRIPT_TEMPLATE, PENDER_TRANSCRIPT_TEMPLATE_CONFIG } from './penderTranscriptTemplate'
import { CAPEFEAR_TRANSCRIPT_TEMPLATE, CAPEFEAR_TRANSCRIPT_TEMPLATE_CONFIG } from './capeFearTranscriptTemplate'
import { MIAMIDADE_TRANSCRIPT_TEMPLATE, MIAMIDADE_TRANSCRIPT_TEMPLATE_CONFIG } from './miamiDadeTranscriptTemplate'

export const SampleTemplates = {
  studentId: STUDENT_ID_TEMPLATE,
  transcript: TRANSCRIPT_TEMPLATE,
  transcriptConfig: TRANSCRIPT_TEMPLATE_CONFIG,
  // School-specific Student ID templates
  nhcsStudentId: NHCS_STUDENT_ID_TEMPLATE,
  penderStudentId: PENDER_STUDENT_ID_TEMPLATE,
  capeFearStudentId: CAPEFEAR_STUDENT_ID_TEMPLATE,
  miamiDadeStudentId: MIAMIDADE_STUDENT_ID_TEMPLATE,
  // School-specific Transcript templates
  nhcsTranscript: NHCS_TRANSCRIPT_TEMPLATE,
  nhcsTranscriptConfig: NHCS_TRANSCRIPT_TEMPLATE_CONFIG,
  penderTranscript: PENDER_TRANSCRIPT_TEMPLATE,
  penderTranscriptConfig: PENDER_TRANSCRIPT_TEMPLATE_CONFIG,
  capeFearTranscript: CAPEFEAR_TRANSCRIPT_TEMPLATE,
  capeFearTranscriptConfig: CAPEFEAR_TRANSCRIPT_TEMPLATE_CONFIG,
  miamiDadeTranscript: MIAMIDADE_TRANSCRIPT_TEMPLATE,
  miamiDadeTranscriptConfig: MIAMIDADE_TRANSCRIPT_TEMPLATE_CONFIG,
}

export default SampleTemplates
