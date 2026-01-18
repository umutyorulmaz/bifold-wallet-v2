import { CredentialType, SchemaConfig } from '../types'

/**
 * Registry mapping schema IDs to their configuration
 * This determines how each credential type should be parsed and rendered
 */
export const schemaRegistry: Record<string, SchemaConfig> = {
  // High School Transcript
  '64zTt4edLTprWQTUkrYhZJ:2:NC High School Transcript:1.4': {
    type: 'transcript',
    variant: 'high-school',
    parser: 'transcriptParser',
  },
  // High School Student Card
  '64zTt4edLTprWQTUkrYhZJ:2:NC High School Student Card:1.0': {
    type: 'student-id',
    variant: 'high-school',
    parser: 'studentIdParser',
  },
  // College Transcript
  '64zTt4edLTprWQTUkrYhZJ:2:NC College Transcript:1.0': {
    type: 'transcript',
    variant: 'college',
    parser: 'transcriptParser',
  },
  // College Student ID
  '64zTt4edLTprWQTUkrYhZJ:2:College Student ID:1.1': {
    type: 'student-id',
    variant: 'college',
    parser: 'studentIdParser',
  },
}

/**
 * Get schema configuration by schema ID
 */
export function getSchemaConfig(schemaId: string): SchemaConfig | undefined {
  return schemaRegistry[schemaId]
}

/**
 * Check if a schema ID is supported
 */
export function isSchemaSupported(schemaId: string): boolean {
  return schemaId in schemaRegistry
}

/**
 * Detect credential type from schema ID or credDef ID
 * Falls back to pattern matching on credDefId if schema not found
 */
export function detectCredentialType(
  schemaId?: string,
  credDefId?: string
): CredentialType | undefined {
  // First try to get from schema registry
  if (schemaId) {
    const config = getSchemaConfig(schemaId)
    if (config) {
      return config.type
    }
  }

  // Fall back to pattern matching on credDefId
  if (credDefId) {
    const credDefLower = credDefId.toLowerCase()

    // Check for transcript patterns
    if (credDefLower.includes('transcript')) {
      return 'transcript'
    }

    // Check for student ID patterns
    if (
      credDefLower.includes('student') &&
      (credDefLower.includes('card') || credDefLower.includes('id'))
    ) {
      return 'student-id'
    }
  }

  return undefined
}

/**
 * Get all supported schema IDs
 */
export function getSupportedSchemaIds(): string[] {
  return Object.keys(schemaRegistry)
}
