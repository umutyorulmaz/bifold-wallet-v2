
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { CredentialExchangeRecord, CredentialPreviewAttribute } from '@credo-ts/core'
import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { useAgent } from '@credo-ts/react-hooks'
import { NativeStackNavigationProp } from 'react-native-screens/lib/typescript/native-stack'
import { VDCard } from '../modules/workflow/renderers/components/VDCard'
import { TranscriptCard } from '../modules/workflow/renderers/components/TranscriptCard'
import { TOKENS, useServices } from '../container-api'
import { ColorPalette } from '../theme'

type RootStackParamList = {
  CredentialDetails: {
    credential?: CredentialExchangeRecord
    credentialId?: string
    logoUrl?: string
    cardColor: string
    credentialType?: 'STUDENT_ID' | 'TRANSCRIPT' | 'DEFAULT'
  }
}

type CredentialDetailsRouteProp = RouteProp<RootStackParamList, 'CredentialDetails'>
type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type CredentialDetailsProps = {
  navigation?: NavigationProp
  route?: CredentialDetailsRouteProp
}

const useCredentialData = (routeCredential?: CredentialExchangeRecord, credentialId?: string) => {
  const { agent } = useAgent()
  const [credential, setCredential] = useState<CredentialExchangeRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [attributes, setAttributes] = useState<CredentialPreviewAttribute[]>([])
  const [credDefId, setCredDefId] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      if (!agent) {
        setLoading(false)
        return
      }

      try {
        let credRecord = routeCredential

        if (!credRecord && credentialId) {
          const allCredentials = await agent.credentials.getAll()
          credRecord = allCredentials.find((cred) => cred.id === credentialId)
        }

        if (!credRecord) {
          setLoading(false)
          return
        }

        setCredential(credRecord)

        const metadata = credRecord.metadata.get(AnonCredsCredentialMetadataKey)
        const defId = metadata?.credentialDefinitionId || ''
        setCredDefId(defId)

        if (credRecord.credentialAttributes && credRecord.credentialAttributes.length > 0) {
          setAttributes(credRecord.credentialAttributes)
        } else {
          try {
            const formatData = await agent.credentials.getFormatData(credRecord.id)
            const { offerAttributes } = formatData
            if (offerAttributes && offerAttributes.length > 0) {
              const attrs = offerAttributes.map((item) => new CredentialPreviewAttribute(item))
              setAttributes(attrs)
            }
          } catch (error) {
            // debug('Error getting format data:', error)
          }
        }
      } catch (error) {
        // debug('Error fetching credential:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [agent, routeCredential, credentialId])

  return { credential, loading, attributes, credDefId }
}

const parseTranscriptData = (attributes: CredentialPreviewAttribute[]) => {
  const transcriptAttr = attributes.find((attr) => attr.name.toLowerCase() === 'transcript')
  const studentInfoAttr = attributes.find((attr) => attr.name.toLowerCase() === 'studentinfo')
  const termsAttr = attributes.find((attr) => attr.name.toLowerCase() === 'terms')

  let transcriptData = {}
  let studentInfoData = {}
  let termsData = []

  try {
    if (transcriptAttr?.value) transcriptData = JSON.parse(transcriptAttr.value)
    if (studentInfoAttr?.value) studentInfoData = JSON.parse(studentInfoAttr.value)
    if (termsAttr?.value) termsData = JSON.parse(termsAttr.value)
  } catch (e) {
    // debug('Error parsing JSON:', e)
  }

  let yearStart = ''
  let yearEnd = ''
  let termGPA = ''

  if (termsData.length > 0) {
    const firstTerm = termsData[0]
    const lastTerm = termsData[termsData.length - 1]

    if (firstTerm.termYear) {
      const years = firstTerm.termYear.split('-')
      if (years.length >= 2) {
        yearStart = years[0]
      }
    }

    if (lastTerm.termYear) {
      const years = lastTerm.termYear.split('-')
      if (years.length >= 2) {
        yearEnd = years[1]
      }
    }

    if (termsData.length > 0) {
      const latestTerm = termsData[termsData.length - 1]
      termGPA = latestTerm.termGpa || ''
    }
  }

  return {
    transcript: transcriptData,
    studentInfo: studentInfoData,
    terms: termsData,
    yearStart,
    yearEnd,
    termGPA,
  }
}

const getAttrValue = (attributes: CredentialPreviewAttribute[], ...names: string[]): string | undefined => {
  if (!attributes || attributes.length === 0) return undefined

  for (const name of names) {
    const attr = attributes.find((a) => a.name && a.name.toLowerCase() === name.toLowerCase())
    if (attr?.value) return attr.value
  }
  return undefined
}

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const nav = navigation ?? useNavigation<NavigationProp>()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const rt = route ?? useRoute<CredentialDetailsRouteProp>()
  const { credential: routeCredential, credentialId, credentialType } = rt.params || {}
  const [GradientBackground] = useServices([TOKENS.COMPONENT_GRADIENT_BACKGROUND])
  const { credential, loading, attributes, credDefId } = useCredentialData(routeCredential, credentialId)

  useEffect(() => {
    if (typeof nav.setOptions === 'function') {
      nav.setOptions({
        headerShown: false,
      } as any)
    }
  }, [nav])

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#016C72" />
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  if (!credential) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Credential not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const firstName = getAttrValue(attributes, 'first', 'firstname', 'first_name') || ''
  const lastName = getAttrValue(attributes, 'last', 'lastname', 'last_name') || ''
  const fullName =
    getAttrValue(attributes, 'fullname', 'studentfullname', 'full_name') ||
    `${firstName} ${lastName}`.trim() ||
    'Jane Doe'
  const studentId = getAttrValue(attributes, 'studentid', 'studentnumber', 'student_id') || ''
  const school = getAttrValue(attributes, 'schoolname', 'school', 'institution') || ''
  const rawIssueDate = getAttrValue(attributes, 'issuedate', 'issue_date')

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) {
      const date = credential?.createdAt ? new Date(credential.createdAt) : new Date()
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    }

    if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)
      return `${month}/${day}/${year}`
    }

    try {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
      }
    } catch (e) {
      // debug('Error parsing date:', e)
    }

    return dateStr
  }

  const formatExpirationDate = (): string => {
    const issuedDate = rawIssueDate ? new Date(formatDate(rawIssueDate)) : new Date(credential?.createdAt || Date.now())

    const expirationAttr = getAttrValue(attributes, 'expirationdate', 'expiration_date', 'expiration')
    if (expirationAttr) {
      return formatDate(expirationAttr)
    }

    const expirationDate = new Date(issuedDate)
    expirationDate.setFullYear(expirationDate.getFullYear() + 5)
    return expirationDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }

  const issuedDate = formatDate(rawIssueDate)
  const expirationDate = formatExpirationDate()

  const isTranscript = credentialType === 'TRANSCRIPT' || (credDefId && credDefId.includes('Transcript'))
  const displayName =
    isTranscript && credDefId
      ? credDefId.split(':').pop()?.replace(' Transcript', '') || school || 'Transcript'
      : school || 'Student Card'

  const transcriptData = parseTranscriptData(attributes)
  const yearStart = getAttrValue(attributes, 'yearstart', 'year_start') || transcriptData.yearStart
  const yearEnd = getAttrValue(attributes, 'yearend', 'year_end') || transcriptData.yearEnd
  const termGPA = getAttrValue(attributes, 'termgpa', 'term_gpa') || transcriptData.termGPA
  const cumulativeGPA = getAttrValue(attributes, 'cumulativegpa', 'cumulative_gpa')
  const gpa = getAttrValue(attributes, 'gpa') || (transcriptData.transcript as any)?.gpa

  const renderCredentialCard = () => {
    const issuerName = credential.connectionId || 'Issuer'

    if (isTranscript) {
      const displayFullName =
        fullName || (transcriptData.studentInfo as any)?.studentFullName || `${firstName} ${lastName}`
      const displaySchool = school || (transcriptData.studentInfo as any)?.schoolName
      const displayGPA = cumulativeGPA || termGPA || gpa
      const displayYearStart = yearStart || transcriptData.yearStart
      const displayYearEnd = yearEnd || transcriptData.yearEnd
      const displayTermGPA = termGPA || transcriptData.termGPA

      return (
        <TranscriptCard
          school={displaySchool}
          yearStart={displayYearStart}
          yearEnd={displayYearEnd}
          termGPA={displayTermGPA}
          cumulativeGPA={displayGPA}
          fullname={displayFullName}
          isInChat={false}
        />
      )
    } else {
      const studentPhoto = getAttrValue(attributes, 'studentphoto', 'photo', 'student_photo')

      return (
        <View style={{ width: '100%', height: '100%' }}>
          <VDCard
            firstName={firstName}
            lastName={lastName}
            fullName={fullName}
            studentId={studentId}
            school={school || displayName}
            issueDate={issuedDate}
            credDefId={credDefId}
            issuerName={issuerName}
            isInChat={false}
            studentPhoto={studentPhoto}
          />
        </View>
      )
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()}>
              <Icon name="chevron-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.menuButton}>
              <Icon name="dots-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardSection}>
            <View style={styles.cardContainer}>{renderCredentialCard()}</View>
            <View style={styles.smallDivider} />
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.schoolName}>{displayName}</Text>
            <Text style={styles.studentCardLabel}>{isTranscript ? 'Transcript' : 'Student Card'}</Text>

            <Text style={styles.studentName}>{fullName}</Text>

            <View style={styles.dateContainer}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Issued On</Text>
                <Text style={styles.dateValue}>{issuedDate}</Text>
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Expiration Date</Text>
                <Text style={styles.dateValue}>{expirationDate}</Text>
              </View>
            </View>

            <View style={styles.metadataContainer}>
              <Text style={styles.metadataTitle}>Metadata</Text>
              <Text style={styles.metadataText}>

              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  cardSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  cardContainer: {
    flex: 1,
    width: '95%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  smallDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    marginTop: 15,
    alignSelf: 'center',
  },
  detailsSection: {
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'OpenSans-SemiBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  studentCardLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'OpenSans-Regular',
    textAlign: 'center',
    marginBottom: 15,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'OpenSans-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: ColorPalette.grayscale.digicredBackgroundModal,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'OpenSans-Medium',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'OpenSans-SemiBold',
  },
  dividerLine: {
    width: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
  },
  metadataContainer: {
    backgroundColor: ColorPalette.grayscale.digicredBackgroundModal,
    borderRadius: 12,
    padding: 16,
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'OpenSans-SemiBold',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'OpenSans-Regular',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
})

export default CredentialDetails
