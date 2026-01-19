import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

// Schema IDs for NC credentials
const NC_HIGH_SCHOOL_STUDENT_CARD_SCHEMA = '64zTt4edLTprWQTUkrYhZJ:2:NC High School Student Card:1.0'
const NC_HIGH_SCHOOL_TRANSCRIPT_SCHEMA = '64zTt4edLTprWQTUkrYhZJ:2:NC High School Transcript:1.4'
const NC_COLLEGE_TRANSCRIPT_SCHEMA = '64zTt4edLTprWQTUkrYhZJ:2:NC College Transcript:1.0'
const COLLEGE_STUDENT_ID_SCHEMA = '64zTt4edLTprWQTUkrYhZJ:2:College Student ID:1.1'

export const getProofRequestTemplates = (useDevRestrictions: boolean) => {
  // Use schema_id for flexible matching across any issuer with these schemas
  // Or use schema_name for even more flexible matching (any schema with matching name)
  const highSchoolStudentCardRestrictions = useDevRestrictions
    ? [{ schema_name: 'NC High School Student Card' }]
    : [{ schema_id: NC_HIGH_SCHOOL_STUDENT_CARD_SCHEMA }]

  const highSchoolTranscriptRestrictions = useDevRestrictions
    ? [{ schema_name: 'NC High School Transcript' }]
    : [{ schema_id: NC_HIGH_SCHOOL_TRANSCRIPT_SCHEMA }]

  const collegeTranscriptRestrictions = useDevRestrictions
    ? [{ schema_name: 'NC College Transcript' }]
    : [{ schema_id: NC_COLLEGE_TRANSCRIPT_SCHEMA }]

  const collegeStudentIdRestrictions = useDevRestrictions
    ? [{ schema_name: 'College Student ID' }]
    : [{ schema_id: COLLEGE_STUDENT_ID_SCHEMA }]

  const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
    // High School Student Card templates
    {
      id: 'Aries:5:HSStudentFullName:0.0.1:indy',
      name: 'High School Student Name',
      description: 'Verify the full name of a high school student',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: NC_HIGH_SCHOOL_STUDENT_CARD_SCHEMA,
            requestedAttributes: [
              {
                name: 'first',
                restrictions: highSchoolStudentCardRestrictions,
              },
              {
                name: 'last',
                restrictions: highSchoolStudentCardRestrictions,
              },
            ],
          },
        ],
      },
    },
    {
      id: 'Aries:5:HSStudentId:0.0.1:indy',
      name: 'High School Student ID',
      description: 'Verify high school student ID and name',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: NC_HIGH_SCHOOL_STUDENT_CARD_SCHEMA,
            requestedAttributes: [
              {
                names: ['first', 'last', 'studentId'],
                restrictions: highSchoolStudentCardRestrictions,
              },
            ],
          },
        ],
      },
    },
    // High School Transcript templates
    {
      id: 'Aries:5:HSTranscript:0.0.1:indy',
      name: 'High School Transcript',
      description: 'Verify high school transcript with GPA',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: NC_HIGH_SCHOOL_TRANSCRIPT_SCHEMA,
            requestedAttributes: [
              {
                names: ['studentFullName', 'schoolName', 'cumulativeGPA'],
                restrictions: highSchoolTranscriptRestrictions,
              },
            ],
          },
        ],
      },
    },
    // College Student ID templates
    {
      id: 'Aries:5:CollegeStudentId:0.0.1:indy',
      name: 'College Student ID',
      description: 'Verify college student ID and name',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: COLLEGE_STUDENT_ID_SCHEMA,
            requestedAttributes: [
              {
                names: ['first', 'last', 'studentId'],
                restrictions: collegeStudentIdRestrictions,
              },
            ],
          },
        ],
      },
    },
    // College Transcript templates
    {
      id: 'Aries:5:CollegeTranscript:0.0.1:indy',
      name: 'College Transcript',
      description: 'Verify college transcript with GPA',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: NC_COLLEGE_TRANSCRIPT_SCHEMA,
            requestedAttributes: [
              {
                names: ['studentFullName', 'schoolName', 'cumulativeGPA'],
                restrictions: collegeTranscriptRestrictions,
              },
            ],
          },
        ],
      },
    },
  ]
  return defaultProofRequestTemplates
}
