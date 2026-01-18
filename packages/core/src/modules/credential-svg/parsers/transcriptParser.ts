import {
  CredentialPreviewAttribute,
  CredentialVariant,
  ParsedTranscript,
  ParsedTerm,
  ParsedCourse,
  ParsedTest,
} from '../types'
import {
  getAttrValue,
  parseJsonAttribute,
  formatDate,
  cleanString,
  extractYearRange,
} from './attributeParser'
import { RawStudentInfo, RawTranscriptData, RawTermData, RawCourseData, RawTestData } from './types'

/**
 * Parse Transcript credential attributes into structured data
 * Handles both High School and College transcripts
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseTranscript(attributes: CredentialPreviewAttribute[], _variant: CredentialVariant): ParsedTranscript {
  // Parse JSON attributes
  const studentInfo = parseJsonAttribute<RawStudentInfo>(attributes, 'studentinfo', 'studentInfo')
  const transcriptData = parseJsonAttribute<RawTranscriptData>(attributes, 'transcript')
  const termsData = parseJsonAttribute<RawTermData[]>(attributes, 'terms')
  const testsData = parseJsonAttribute<RawTestData[]>(attributes, 'tests')

  // Build student info
  const student = parseStudentSection(attributes, studentInfo)

  // Build school info
  const school = parseSchoolSection(attributes, studentInfo)

  // Build academics section
  const academics = parseAcademicsSection(attributes, transcriptData, studentInfo)

  // Parse terms
  const terms = parseTermsSection(termsData)

  // Parse tests
  const tests = parseTestsSection(testsData)

  // Parse achievements
  const achievements = parseAchievements(transcriptData)

  return {
    student,
    school,
    academics,
    terms,
    tests: tests.length > 0 ? tests : undefined,
    achievements: achievements.length > 0 ? achievements : undefined,
  }
}

/**
 * Parse student personal information section
 */
function parseStudentSection(
  attributes: CredentialPreviewAttribute[],
  studentInfo?: RawStudentInfo
): ParsedTranscript['student'] {
  const studentNumber =
    getAttrValue(attributes, 'studentNumber', 'studentnumber', 'student_number') ||
    studentInfo?.studentNumber ||
    ''

  const fullName =
    getAttrValue(attributes, 'studentFullName', 'fullname', 'student_full_name') ||
    studentInfo?.studentFullName ||
    ''

  const rawBirthDate =
    getAttrValue(attributes, 'studentBirthDate', 'birthdate', 'birth_date') ||
    studentInfo?.studentBirthDate

  return {
    number: cleanString(studentNumber),
    fullName: cleanString(fullName),
    birthDate: rawBirthDate ? formatDate(rawBirthDate) : undefined,
    address: studentInfo?.studentAddress ? cleanString(studentInfo.studentAddress) : undefined,
    phone: studentInfo?.studentPhone ? cleanString(studentInfo.studentPhone) : undefined,
    email: studentInfo?.studentEmail ? cleanString(studentInfo.studentEmail) : undefined,
  }
}

/**
 * Parse school information section
 */
function parseSchoolSection(
  attributes: CredentialPreviewAttribute[],
  studentInfo?: RawStudentInfo
): ParsedTranscript['school'] {
  const schoolName =
    getAttrValue(attributes, 'schoolName', 'school', 'institution') ||
    studentInfo?.schoolName ||
    ''

  return {
    name: cleanString(schoolName),
    address: studentInfo?.schoolAddress ? cleanString(studentInfo.schoolAddress) : undefined,
    phone: studentInfo?.schoolPhone ? cleanString(studentInfo.schoolPhone) : undefined,
    principal: studentInfo?.schoolPrincipal ? cleanString(studentInfo.schoolPrincipal) : undefined,
    accreditation: studentInfo?.schoolAccreditation
      ? cleanString(studentInfo.schoolAccreditation)
      : undefined,
  }
}

/**
 * Parse academic summary section
 */
function parseAcademicsSection(
  attributes: CredentialPreviewAttribute[],
  transcriptData?: RawTranscriptData,
  studentInfo?: RawStudentInfo
): ParsedTranscript['academics'] {
  const gpa =
    getAttrValue(attributes, 'gpa', 'cumulativeGpa', 'cumulative_gpa') ||
    transcriptData?.gpa ||
    ''

  const gpaUnweighted =
    getAttrValue(attributes, 'gpaUnweighted', 'gpa_unweighted') || transcriptData?.gpaUnweighted

  const earnedCredits =
    getAttrValue(attributes, 'earnedCredits', 'earned_credits', 'credits') ||
    transcriptData?.earnedCredits ||
    ''

  const classRank =
    getAttrValue(attributes, 'classRank', 'class_rank', 'rank') || transcriptData?.classRank

  const graduationDate =
    getAttrValue(attributes, 'graduationDate', 'graduation_date') || studentInfo?.graduationDate

  return {
    gpa: cleanString(gpa),
    gpaUnweighted: gpaUnweighted ? cleanString(gpaUnweighted) : undefined,
    earnedCredits: cleanString(earnedCredits),
    classRank: classRank ? cleanString(classRank) : undefined,
    graduationDate: graduationDate ? formatDate(graduationDate) : undefined,
  }
}

/**
 * Parse terms/semesters section with courses
 */
function parseTermsSection(termsData?: RawTermData[]): ParsedTerm[] {
  if (!termsData || !Array.isArray(termsData)) {
    return []
  }

  return termsData.map((term) => {
    // Extract year range
    const yearRange = extractYearRange(term.termYear)

    // Get term GPA (handle both casing variants)
    const termGpa = term.termGpa || term.termGPA || ''

    // Parse courses
    const courses = parseCourses(term.courses)

    return {
      year: term.termYear || `${yearRange.start || ''}`,
      season: term.termSeason || '',
      gpa: cleanString(termGpa),
      credits: term.termCredit ? cleanString(term.termCredit) : undefined,
      courses,
    }
  })
}

/**
 * Parse courses within a term
 */
function parseCourses(coursesData?: RawCourseData[]): ParsedCourse[] {
  if (!coursesData || !Array.isArray(coursesData)) {
    return []
  }

  return coursesData.map((course) => ({
    code: cleanString(course.courseCode || ''),
    title: cleanString(course.courseTitle || ''),
    grade: cleanString(course.grade || ''),
    credits: cleanString(course.creditEarned || course.credits || ''),
  }))
}

/**
 * Parse test scores section
 */
function parseTestsSection(testsData?: RawTestData[]): ParsedTest[] {
  if (!testsData || !Array.isArray(testsData)) {
    return []
  }

  return testsData.map((test) => ({
    name: cleanString(test.testName || ''),
    score: cleanString(test.testScore || ''),
    date: test.testDate ? formatDate(test.testDate) : undefined,
  }))
}

/**
 * Parse achievements/awards
 */
function parseAchievements(transcriptData?: RawTranscriptData): string[] {
  if (!transcriptData?.achievements) {
    return []
  }

  // Handle both string and array formats
  if (typeof transcriptData.achievements === 'string') {
    // Try to parse as JSON array
    try {
      const parsed = JSON.parse(transcriptData.achievements)
      if (Array.isArray(parsed)) {
        return parsed.map((a) => cleanString(String(a)))
      }
    } catch {
      // If not JSON, split by common delimiters
      return transcriptData.achievements
        .split(/[,;]/)
        .map((a) => cleanString(a))
        .filter((a) => a !== '')
    }
  }

  if (Array.isArray(transcriptData.achievements)) {
    return transcriptData.achievements.map((a) => cleanString(String(a)))
  }

  return []
}
