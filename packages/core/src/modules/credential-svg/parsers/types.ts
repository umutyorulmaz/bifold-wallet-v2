import { CredentialPreviewAttribute, CredentialVariant, ParsedStudentID, ParsedTranscript } from '../types'

/**
 * Parser function signature for Student ID credentials
 */
export type StudentIdParserFn = (
  attributes: CredentialPreviewAttribute[],
  variant: CredentialVariant
) => ParsedStudentID

/**
 * Parser function signature for Transcript credentials
 */
export type TranscriptParserFn = (
  attributes: CredentialPreviewAttribute[],
  variant: CredentialVariant
) => ParsedTranscript

/**
 * Raw term data as it comes from the credential JSON
 */
export interface RawTermData {
  termYear?: string
  termSeason?: string
  termGpa?: string
  termGPA?: string
  termCredit?: string
  courses?: RawCourseData[]
}

/**
 * Raw course data as it comes from the credential JSON
 */
export interface RawCourseData {
  courseCode?: string
  courseTitle?: string
  grade?: string
  creditEarned?: string
  credits?: string
}

/**
 * Raw student info JSON structure
 */
export interface RawStudentInfo {
  studentNumber?: string
  studentFullName?: string
  studentBirthDate?: string
  studentAddress?: string
  studentPhone?: string
  studentEmail?: string
  schoolName?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolPrincipal?: string
  schoolAccreditation?: string
  gradeLevel?: string
  graduationDate?: string
}

/**
 * Raw transcript JSON structure
 */
export interface RawTranscriptData {
  gpa?: string
  gpaUnweighted?: string
  earnedCredits?: string
  classRank?: string
  endorsements?: string
  achievements?: string | string[]
}

/**
 * Raw test data structure
 */
export interface RawTestData {
  testName?: string
  testScore?: string
  testDate?: string
}
