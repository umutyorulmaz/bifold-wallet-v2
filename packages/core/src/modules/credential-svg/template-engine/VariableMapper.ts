/**
 * Variable Mapper
 *
 * Maps template placeholder variables to credential attribute values.
 * Handles direct mapping, nested JSON paths, and transformations.
 */

import { TemplateVariable, VariableMapping, CredentialAttribute } from './types'

/**
 * Common attribute name aliases for auto-mapping
 * Includes variations from DigiCred test data (studentFullName, studentNumber, etc.)
 */
const ATTRIBUTE_ALIASES: Record<string, string[]> = {
  fullname: [
    'FullName',
    'full_name',
    'name',
    'Name',
    'studentName',
    'StudentName',
    'studentFullName',
    'StudentFullName',
  ],
  firstname: ['FirstName', 'first_name', 'firstName', 'givenName'],
  lastname: ['LastName', 'last_name', 'lastName', 'familyName', 'surname'],
  studentnumber: [
    'StudentNumber',
    'student_number',
    'studentId',
    'StudentId',
    'studentNumber',
    'ID',
    'id',
  ],
  photo: ['StudentPhoto', 'Photo', 'photo', 'picture', 'Picture', 'image', 'studentPhoto'],
  schoolname: ['SchoolName', 'school_name', 'school', 'School', 'institution', 'schoolName'],
  expiration: [
    'Expiration',
    'expiration',
    'expirationDate',
    'ExpirationDate',
    'expires',
    'Expires',
  ],
  birthdate: [
    'BirthDate',
    'birthDate',
    'birth_date',
    'dateOfBirth',
    'DateOfBirth',
    'DOB',
    'dob',
    'studentBirthDate',
    'StudentBirthDate',
  ],
  gpa: ['GPA', 'gpa', 'cumulativeGPA', 'CumulativeGPA', 'cumulativeGpa'],
  credits: ['Credits', 'credits', 'earnedCredits', 'EarnedCredits', 'totalCredits'],
  gradelevel: ['GradeLevel', 'grade_level', 'grade', 'Grade', 'gradeLevel'],
}

/**
 * Find the best matching attribute for a variable name
 */
export function findAttributeMatch(
  variableName: string,
  attributes: CredentialAttribute[]
): CredentialAttribute | undefined {
  const lowerName = variableName.toLowerCase().replace(/[_\s]/g, '')

  // Direct match first
  const direct = attributes.find(
    (attr) => attr.name.toLowerCase().replace(/[_\s]/g, '') === lowerName
  )
  if (direct) return direct

  // Check aliases
  const aliases = ATTRIBUTE_ALIASES[lowerName]
  if (aliases) {
    for (const alias of aliases) {
      const match = attributes.find(
        (attr) => attr.name.toLowerCase() === alias.toLowerCase()
      )
      if (match) return match
    }
  }

  // Partial match
  const partial = attributes.find(
    (attr) => attr.name.toLowerCase().includes(lowerName) || lowerName.includes(attr.name.toLowerCase())
  )
  if (partial) return partial

  return undefined
}

/**
 * Get value from a nested JSON path
 */
export function getNestedValue(obj: unknown, path: string[]): string | undefined {
  let current: unknown = obj

  for (const key of path) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }

  if (current === null || current === undefined) return undefined
  return String(current)
}

/**
 * Try to parse a JSON attribute value
 */
export function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/**
 * Apply transformation to a value
 */
export function applyTransform(
  value: string,
  transform?: 'date' | 'uppercase' | 'lowercase' | 'capitalize'
): string {
  if (!transform) return value

  switch (transform) {
    case 'uppercase':
      return value.toUpperCase()
    case 'lowercase':
      return value.toLowerCase()
    case 'capitalize':
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    case 'date':
      // Try to format as date
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString()
        }
      } catch {
        // Return as-is if parsing fails
      }
      return value
    default:
      return value
  }
}

/**
 * Resolve a single variable to its value
 */
export function resolveVariable(
  variable: TemplateVariable,
  attributes: CredentialAttribute[],
  customMapping?: VariableMapping
): string {
  // Check custom mapping first
  if (customMapping && customMapping[variable.name]) {
    const mapping = customMapping[variable.name]

    if (typeof mapping === 'string') {
      // Simple mapping to attribute name
      const attr = attributes.find((a) => a.name === mapping)
      if (attr) return attr.value
    } else {
      // Complex mapping with transform
      const attr = attributes.find((a) => a.name === mapping.attribute)
      if (attr) {
        return applyTransform(attr.value, mapping.transform)
      }
      if (mapping.defaultValue) return mapping.defaultValue
    }
  }

  // Handle nested path (e.g., "student.fullName")
  if (variable.path && variable.path.length > 0) {
    const rootAttrName = variable.path[0]
    const attr = attributes.find(
      (a) => a.name.toLowerCase() === rootAttrName.toLowerCase()
    )

    if (attr) {
      const parsed = tryParseJson(attr.value)
      if (parsed && variable.path.length > 1) {
        const nestedPath = variable.path.slice(1)
        const nestedValue = getNestedValue(parsed, nestedPath)
        if (nestedValue) return nestedValue
      } else if (parsed === null) {
        // Not JSON, use raw value
        return attr.value
      }
    }
  }

  // Auto-match by name
  const matchedAttr = findAttributeMatch(variable.name, attributes)
  if (matchedAttr) {
    // Check if it's JSON and we need a nested value
    const parsed = tryParseJson(matchedAttr.value)
    if (parsed && typeof parsed === 'object' && variable.path) {
      const nestedValue = getNestedValue(parsed, variable.path.slice(1))
      if (nestedValue) return nestedValue
    }
    return matchedAttr.value
  }

  // Return default value or empty string
  return variable.defaultValue || ''
}

/**
 * Resolve all variables in a template
 */
export function resolveAllVariables(
  variables: TemplateVariable[],
  attributes: CredentialAttribute[],
  customMapping?: VariableMapping
): Map<string, string> {
  const resolved = new Map<string, string>()

  for (const variable of variables) {
    const value = resolveVariable(variable, attributes, customMapping)
    resolved.set(variable.placeholder, value)
  }

  return resolved
}

/**
 * Create an auto-mapping from variables to attributes
 */
export function createAutoMapping(
  variables: TemplateVariable[],
  attributes: CredentialAttribute[]
): VariableMapping {
  const mapping: VariableMapping = {}

  for (const variable of variables) {
    const match = findAttributeMatch(variable.name, attributes)
    if (match) {
      mapping[variable.name] = match.name
    }
  }

  return mapping
}

export default {
  findAttributeMatch,
  getNestedValue,
  tryParseJson,
  applyTransform,
  resolveVariable,
  resolveAllVariables,
  createAutoMapping,
}
