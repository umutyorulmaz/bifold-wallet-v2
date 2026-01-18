import { CredentialPreviewAttribute, CredentialVariant, ParsedStudentID } from '../types'
import { getAttrValue, parseJsonAttribute, formatDate, getImageUri, cleanString } from './attributeParser'
import { RawStudentInfo } from './types'

/**
 * Parse Student ID credential attributes into structured data
 * Handles both High School and College student ID cards
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseStudentId(attributes: CredentialPreviewAttribute[], _variant: CredentialVariant): ParsedStudentID {
  // Try to parse studentInfo JSON if available (contains nested student data)
  const studentInfo = parseJsonAttribute<RawStudentInfo>(attributes, 'studentinfo', 'studentInfo')

  // Extract student number
  const studentNumber =
    getAttrValue(attributes, 'StudentNumber', 'studentnumber', 'studentId', 'student_id') ||
    studentInfo?.studentNumber ||
    ''

  // Extract full name - try multiple variations
  const fullName =
    getAttrValue(attributes, 'FullName', 'fullname', 'studentFullName', 'student_full_name') ||
    studentInfo?.studentFullName ||
    ''

  // Extract first and last names separately if available
  const firstName = getAttrValue(attributes, 'FirstName', 'firstname', 'first_name', 'first')
  const lastName = getAttrValue(attributes, 'LastName', 'lastname', 'last_name', 'last')

  // Extract school name
  const schoolName =
    getAttrValue(attributes, 'SchoolName', 'schoolname', 'school', 'institution') ||
    studentInfo?.schoolName ||
    ''

  // Extract expiration date
  const rawExpiration = getAttrValue(
    attributes,
    'Expiration',
    'expiration',
    'expirationDate',
    'expiration_date',
    'ExpirationDate'
  )
  const expiration = formatDate(rawExpiration)

  // Extract birth date
  const rawBirthDate =
    getAttrValue(attributes, 'BirthDate', 'birthdate', 'studentBirthDate', 'birth_date') ||
    studentInfo?.studentBirthDate
  const birthDate = formatDate(rawBirthDate)

  // Extract student photo (base64 or data URI)
  const rawPhoto = getAttrValue(
    attributes,
    'StudentPhoto',
    'studentphoto',
    'photo',
    'student_photo',
    'Photo'
  )
  const photo = getImageUri(rawPhoto)

  // Extract grade level (mainly for high school)
  const gradeLevel =
    getAttrValue(attributes, 'GradeLevel', 'gradelevel', 'grade_level', 'grade') ||
    studentInfo?.gradeLevel

  return {
    studentNumber: cleanString(studentNumber),
    fullName: cleanString(fullName),
    firstName: firstName ? cleanString(firstName) : undefined,
    lastName: lastName ? cleanString(lastName) : undefined,
    schoolName: cleanString(schoolName),
    expiration: expiration,
    birthDate: birthDate || undefined,
    photo: photo,
    gradeLevel: gradeLevel ? cleanString(gradeLevel) : undefined,
  }
}
