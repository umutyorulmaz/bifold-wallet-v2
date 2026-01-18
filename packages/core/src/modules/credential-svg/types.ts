import { SvgProps } from 'react-native-svg'

// Credential classification types
export type CredentialType = 'student-id' | 'transcript'
export type CredentialVariant = 'high-school' | 'college'

// Schema registry entry configuration
export interface SchemaConfig {
  type: CredentialType
  variant: CredentialVariant
  parser: 'studentIdParser' | 'transcriptParser'
}

// Parsed Student ID data
export interface ParsedStudentID {
  studentNumber: string
  fullName: string
  firstName?: string
  lastName?: string
  schoolName: string
  expiration: string
  birthDate?: string
  photo?: string // base64 or data URI
  gradeLevel?: string
}

// Parsed Transcript data
export interface ParsedTranscript {
  student: {
    number: string
    fullName: string
    birthDate?: string
    address?: string
    phone?: string
    email?: string
  }
  school: {
    name: string
    address?: string
    phone?: string
    principal?: string
    accreditation?: string
  }
  academics: {
    gpa: string
    gpaUnweighted?: string
    earnedCredits: string
    classRank?: string
    graduationDate?: string
  }
  terms: ParsedTerm[]
  tests?: ParsedTest[]
  achievements?: string[]
}

// Term/Semester data
export interface ParsedTerm {
  year: string
  season: string
  gpa: string
  credits?: string
  courses: ParsedCourse[]
}

// Individual course data
export interface ParsedCourse {
  code: string
  title: string
  grade: string
  credits: string
}

// Test score data
export interface ParsedTest {
  name: string
  score: string
  date?: string
}

// School branding configuration
export interface SchoolBranding {
  name: string
  shortName: string
  logo: React.FC<SvgProps>
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    textInverse: string
  }
  seal?: React.FC<SvgProps>
}

// Render mode for SVG credentials
export type RenderMode = 'compact' | 'full'

// Props for SVG credential rendering
export interface SVGCredentialProps {
  width: number
  height?: number // Auto-calculated based on type if not provided
  mode: RenderMode
  isInChat?: boolean
}

// Props for the main CredentialSVGRenderer component
export interface CredentialSVGRendererProps {
  schemaId?: string
  credDefId?: string
  attributes: CredentialPreviewAttribute[]
  width?: number
  mode?: RenderMode
  isInChat?: boolean
  onPress?: () => void
}

// Re-export CredentialPreviewAttribute type for convenience
export interface CredentialPreviewAttribute {
  name: string
  value: string
  'mime-type'?: string
}
