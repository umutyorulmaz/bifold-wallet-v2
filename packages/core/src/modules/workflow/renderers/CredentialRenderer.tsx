
/**
 * CredentialRenderer
 *
 * Custom renderer for displaying credentials in chat.
 * Can render as visual cards (VDCard, TranscriptCard) or default text.
 */

import { CredentialExchangeRecord, CredentialPreviewAttribute, CredentialState } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, DeviceEventEmitter, Text } from 'react-native'

import { useTheme } from '../../../contexts/theme'
import { ICredentialRenderer, RenderContext } from '../types'
import { VDCard } from './components/VDCard'
import { TranscriptCard } from './components/TranscriptCard'
import { TOKENS, useServices } from '../../../container-api'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { t } from 'i18next'
import { Dimensions } from 'react-native'
import { formatTime } from '../../../utils/helpers'
import { ColorPalette } from '../../../theme'

export enum CredentialDisplayType {
  STUDENT_ID = 'student_id',
  TRANSCRIPT = 'transcript',
  DEFAULT = 'default',
}

const { width } = Dimensions.get('window')

export function detectCredentialType(credential: CredentialExchangeRecord): CredentialDisplayType {
  const credDefId = (credential as any).metadata?.data?.['_anoncreds/credential']?.credentialDefinitionId || ''
  const credentialAttributes = credential.credentialAttributes || []

  const hasGPA = credentialAttributes.some(
    (attr) =>
      attr.name.toLowerCase().includes('gpa') ||
      attr.name.toLowerCase().includes('termgpa') ||
      attr.name.toLowerCase().includes('cumulativegpa')
  )
  const hasYearStart = credentialAttributes.some(
    (attr) => attr.name.toLowerCase() === 'yearstart' || attr.name.toLowerCase() === 'year_start'
  )

  if (hasGPA || hasYearStart || credDefId.toLowerCase().includes('transcript')) {
    return CredentialDisplayType.TRANSCRIPT
  }

  const hasStudentId = credentialAttributes.some(
    (attr) =>
      attr.name.toLowerCase() === 'studentid' ||
      attr.name.toLowerCase() === 'studentnumber' ||
      attr.name.toLowerCase() === 'student_id'
  )
  const hasStudentName = credentialAttributes.some(
    (attr) =>
      attr.name.toLowerCase() === 'fullname' ||
      attr.name.toLowerCase() === 'studentfullname' ||
      attr.name.toLowerCase() === 'first' ||
      attr.name.toLowerCase() === 'last'
  )

  if (hasStudentId && hasStudentName) {
    return CredentialDisplayType.STUDENT_ID
  }

  if (
    credDefId.includes('NHCS') ||
    credDefId.includes('PCS') ||
    credDefId.includes('M-DCPS') ||
    credDefId.includes('CFCC') ||
    credDefId.includes('Pender') ||
    credDefId.includes('Miami') ||
    credDefId.includes('Hanover')
  ) {
    return CredentialDisplayType.STUDENT_ID
  }

  return CredentialDisplayType.DEFAULT
}

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  context: RenderContext
  onPress?: () => void
}

function useCredentialAttributes(credential: CredentialExchangeRecord) {
  const { agent } = useAgent()
  const [attributes, setAttributes] = useState<CredentialPreviewAttribute[]>(credential.credentialAttributes || [])
  const [loading, setLoading] = useState(false)
  const [credDefId, setCredDefId] = useState<string>(
    (credential as any).metadata?.data?.['_anoncreds/credential']?.credentialDefinitionId || ''
  )

  useEffect(() => {
    if (credential.credentialAttributes && credential.credentialAttributes.length > 0) {
      setAttributes(credential.credentialAttributes)
      return
    }

    if (agent && credential.state === CredentialState.OfferReceived) {
      setLoading(true)
      agent.credentials
        .getFormatData(credential.id)
        .then((formatData) => {
          const { offer, offerAttributes } = formatData
          const anoncredsOffer = offer?.anoncreds as { cred_def_id?: string } | undefined
          const indyOffer = offer?.indy as { cred_def_id?: string } | undefined
          const offerData = anoncredsOffer || indyOffer

          if (offerData?.cred_def_id) {
            setCredDefId(offerData.cred_def_id)
          }

          if (offerAttributes && offerAttributes.length > 0) {
            const attrs = offerAttributes.map((item) => new CredentialPreviewAttribute(item))
            setAttributes(attrs)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [agent, credential.id, credential.state, credential.credentialAttributes])

  return { attributes, loading, credDefId }
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.85,
    height: 'auto',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    padding: 12,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  credentialName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  school: {
    fontSize: 10,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detail: {
    fontSize: 12,
    marginBottom: 2,
  },
  tapToView: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.7,
  },
  bottomLine: {
    height: 4,
  },
  vdCard: {
    width: '100%',
    marginTop: 10,
  },
  statusContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    color: '#212529',
  },
  statusTime: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
    color: ColorPalette.grayscale.white,
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 18,
    marginLeft: '-5%',
    zIndex: 10,
  },
})

export interface CredentialRendererOptions {
  CardComponent?: React.FC<CredentialCardProps>
  showActions?: boolean
  onPress?: (credential: CredentialExchangeRecord, context: RenderContext) => void
}

// export class DefaultCredentialRenderer implements ICredentialRenderer {
//   private options: CredentialRendererOptions
//
//   constructor(options: CredentialRendererOptions = {}) {
//     this.options = options
//   }
//
//   render(credential: CredentialExchangeRecord, context: RenderContext): React.ReactElement {
//     const handlePress = this.options.onPress ? () => this.options.onPress!(credential, context) : undefined
//
//     return (
//       <View>
//         <VDCredentialCard credential={credential} context={context} onPress={handlePress} />
//       </View>
//     )
//   }
// }

// export function createDefaultCredentialRenderer(options: CredentialRendererOptions = {}): DefaultCredentialRenderer {
//   return new DefaultCredentialRenderer(options)
// }

interface TranscriptData {
  transcript?: {
    gpa?: string
    [key: string]: any
  }
  studentInfo?: {
    studentFullName?: string
    schoolName?: string
    [key: string]: any
  }
  terms?: Array<{
    termYear?: string
    termGpa?: string
    [key: string]: any
  }>
  yearStart?: string
  yearEnd?: string
  termGPA?: string
}

export const VDCredentialCard: React.FC<CredentialCardProps> = ({ credential, context, onPress }) => {
  const { SettingsTheme } = useTheme()
  const { attributes, loading, credDefId } = useCredentialAttributes(credential)
  const [CredentialButtons] = useServices([TOKENS.COMPONENT_CREDENTIAL_BUTTONS])
  const [SnackBarMessage] = useServices([TOKENS.COMPONENT_SNACK_BAR_MESSAGE])
  const { agent } = useAgent()
  const [isProcessing, setIsProcessing] = useState(false)
  const [userAction, setUserAction] = useState<'accepted' | 'declined' | null>(null)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isDeclined, setIsDeclined] = useState(false)
  const [declinedData, setDeclinedData] = useState<any>(null)

  useEffect(() => {
    const checkCredentialStatus = async () => {
      if (!agent) return

      try {
        const allCredentials = await agent.credentials.getAll()
        const acceptedCredential = allCredentials.find(
          (cred) => cred.threadId === credential.threadId && cred.state === CredentialState.Done
        )

        const declinedCredential = allCredentials.find(
          (cred) => cred.threadId === credential.threadId && cred.state === CredentialState.Declined
        )

        if (acceptedCredential) {
          setIsAccepted(true)
          setIsDeclined(false)
        } else if (declinedCredential) {
          setIsDeclined(true)
          setIsAccepted(false)

          const savedAttributes = declinedCredential.metadata.get('offerPreview')
          const savedCredDefId = declinedCredential.metadata.get('credDefId')
          const savedSchemaId = declinedCredential.metadata.get('schemaId')

          if (savedAttributes && Array.isArray(savedAttributes)) {
            setDeclinedData({
              attributes: savedAttributes,
              credDefId:
                savedCredDefId ||
                declinedCredential.metadata.data?.['_anoncreds/credential']?.credentialDefinitionId ||
                credDefId,
              schemaId: savedSchemaId || declinedCredential.metadata.data?.['_anoncreds/credential']?.schemaId || '',
            })
          }
        }
      } catch (error) {
        // debug('Error checking credential status:', error)
      }
    }

    checkCredentialStatus()
  }, [agent, credential.threadId, credDefId])

  const getAttrValue = (...names: string[]): string | undefined => {
    if (isDeclined && declinedData && declinedData.attributes) {
      const attrs = declinedData.attributes
      for (const name of names) {
        const attr = attrs.find((a: any) => a.name.toLowerCase() === name.toLowerCase())
        if (attr?.value) return attr.value
      }
      return undefined
    }

    for (const name of names) {
      const attr = attributes.find((a) => a.name.toLowerCase() === name.toLowerCase())
      if (attr?.value) return attr.value
    }
    return undefined
  }

  const parseTranscriptData = (): TranscriptData => {
    const transcriptAttr = getAttrValue('transcript')
    const studentInfoAttr = getAttrValue('studentinfo')
    const termsAttr = getAttrValue('terms')

    let transcriptData: TranscriptData['transcript'] = {}
    let studentInfoData: TranscriptData['studentInfo'] = {}
    let termsData: TranscriptData['terms'] = []

    try {
      if (transcriptAttr) transcriptData = JSON.parse(transcriptAttr) as TranscriptData['transcript']
      if (studentInfoAttr) studentInfoData = JSON.parse(studentInfoAttr) as TranscriptData['studentInfo']
      if (termsAttr) termsData = JSON.parse(termsAttr) as TranscriptData['terms']
    } catch (e) {
      // debug('Error parsing JSON:', e)
    }

    let yearStart = ''
    let yearEnd = ''
    let termGPA = ''

    if (termsData && termsData.length > 0) {
      const firstTerm = termsData[0]
      const lastTerm = termsData[termsData.length - 1]

      if (firstTerm?.termYear) {
        const years = firstTerm.termYear.split('-')
        if (years.length >= 2) {
          yearStart = years[0]
        }
      }

      if (lastTerm?.termYear) {
        const years = lastTerm.termYear.split('-')
        if (years.length >= 2) {
          yearEnd = years[1]
        }
      }

      if (termsData.length > 0) {
        const latestTerm = termsData[termsData.length - 1]
        termGPA = latestTerm?.termGpa || ''
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

  const transcriptData = parseTranscriptData()
  const firstName = getAttrValue('first', 'firstname', 'first_name') || ''
  const lastName = getAttrValue('last', 'lastname', 'last_name') || ''
  const fullName = getAttrValue('fullname', 'studentfullname', 'full_name')
  const studentId = getAttrValue('studentid', 'studentnumber', 'student_id') || ''
  const school = getAttrValue('schoolname', 'school', 'institution') || transcriptData.studentInfo?.schoolName || ''
  const rawIssueDate = getAttrValue('issuedate', 'issue_date', 'expirationdate', 'expiration_date', 'expiration')
  const studentPhoto = getAttrValue('studentphoto', 'photo', 'student_photo')
  const yearStart = getAttrValue('yearstart', 'year_start') || transcriptData.yearStart
  const yearEnd = getAttrValue('yearend', 'year_end') || transcriptData.yearEnd
  const termGPA = getAttrValue('termgpa', 'term_gpa') || transcriptData.termGPA
  const cumulativeGPA = getAttrValue('cumulativegpa', 'cumulative_gpa')
  const gpa = getAttrValue('gpa') || transcriptData.transcript?.gpa

  const formatExpirationDate = (dateStr: string | undefined): string => {
    if (!dateStr) return ''

    if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)
      return `${year}/${month}/${day}`
    }

    return dateStr
  }

  const issueDate = formatExpirationDate(rawIssueDate)

  const getCredentialType = () => {
    let sourceAttributes = attributes
    let sourceCredDefId = credDefId
    let sourceSchemaId = ''

    if (isDeclined && declinedData) {
      sourceAttributes = declinedData.attributes || []
      sourceCredDefId = declinedData.credDefId || credDefId
      sourceSchemaId = declinedData.schemaId || ''
    } else {
      sourceSchemaId = (credential as any).metadata?.data?.['_anoncreds/credential']?.schemaId || ''
    }

    const checkSchemaId =
      sourceSchemaId || (credential as any).metadata?.data?.['_anoncreds/credential']?.schemaId || ''
    const checkCredDefId = sourceCredDefId || ''

    if (checkSchemaId.toLowerCase().includes('transcript') || checkCredDefId.toLowerCase().includes('transcript')) {
      return CredentialDisplayType.TRANSCRIPT
    }

    const hasStudentId = sourceAttributes.some(
      (attr: any) =>
        attr.name.toLowerCase() === 'studentid' ||
        attr.name.toLowerCase() === 'studentnumber' ||
        attr.name.toLowerCase() === 'student_id'
    )
    const hasStudentName = sourceAttributes.some(
      (attr: any) =>
        attr.name.toLowerCase() === 'fullname' ||
        attr.name.toLowerCase() === 'studentfullname' ||
        attr.name.toLowerCase() === 'first' ||
        attr.name.toLowerCase() === 'last'
    )

    if (hasStudentId && hasStudentName) {
      return CredentialDisplayType.STUDENT_ID
    }

    if (
      sourceCredDefId.includes('NHCS') ||
      sourceCredDefId.includes('PCS') ||
      sourceCredDefId.includes('M-DCPS') ||
      sourceCredDefId.includes('CFCC') ||
      sourceCredDefId.includes('Pender') ||
      sourceCredDefId.includes('Miami') ||
      sourceCredDefId.includes('Hanover')
    ) {
      return CredentialDisplayType.STUDENT_ID
    }

    return CredentialDisplayType.STUDENT_ID
  }

  const credentialType = getCredentialType()

  const handleAccept = useCallback(async () => {
    try {
      if (!agent || isProcessing || userAction) return
      setIsProcessing(true)
      await agent.credentials.acceptOffer({ credentialRecordId: credential.id })
      setUserAction('accepted')
      setIsAccepted(true)
      setIsDeclined(false)
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error)?.message ?? err, 1024)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [agent, isProcessing, userAction, credential.id])


  const handleDecline = useCallback(async () => {
    if (!agent || !credential) return

    try {
      const formatData = await agent.credentials.getFormatData(credential.id)
      const offerAttributes = formatData.offerAttributes || []

      const anoncredsOffer = formatData.offer?.anoncreds as { cred_def_id?: string; schema_id?: string } | undefined
      const indyOffer = formatData.offer?.indy as { cred_def_id?: string; schema_id?: string } | undefined

      const credDefId =
        anoncredsOffer?.cred_def_id ||
        indyOffer?.cred_def_id ||
        credential.metadata.data?.['_anoncreds/credential']?.credentialDefinitionId ||
        ''

      const schemaId =
        anoncredsOffer?.schema_id ||
        indyOffer?.schema_id ||
        credential.metadata.data?.['_anoncreds/credential']?.schemaId ||
        ''

      await agent.credentials.declineOffer(credential.id)
      if (credential.connectionId != null) {
        await agent?.basicMessages.sendMessage(credential.connectionId, ':menu')
      }
      const declinedCred = await agent.credentials.findById(credential.id)
      if (declinedCred && offerAttributes.length > 0) {
        await declinedCred.metadata.set('offerPreview', offerAttributes)
        await declinedCred.metadata.set('credDefId', credDefId)
        await declinedCred.metadata.set('schemaId', schemaId)
        await agent.credentials.update(declinedCred)
      }

      if (credential.connectionId) {
        const connection = await agent.connections.findById(credential.connectionId)
        if (connection) {
          await agent.credentials.sendProblemReport({
            credentialRecordId: credential.id,
            description: t('CredentialOffer.Declined'),
          })
        }
      }

      setUserAction('declined')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      const error = new BifoldError(t('Error.Title1025'), t('Error.Message1025'), errorMessage, 1025)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [agent, credential, setUserAction])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={SettingsTheme.newSettingColors.buttonColor} />
      </View>
    )
  }

  const renderCard = () => {
    const currentCredDefId = isDeclined && declinedData ? declinedData.credDefId : credDefId

    if (credentialType === CredentialDisplayType.TRANSCRIPT) {
      const displayFullName = fullName || transcriptData.studentInfo?.studentFullName || `${firstName} ${lastName}`
      const displaySchool = school || transcriptData.studentInfo?.schoolName || ''
      const displayGPA = cumulativeGPA || termGPA || gpa || ''
      const displayYearStart = yearStart || transcriptData.yearStart || ''
      const displayYearEnd = yearEnd || transcriptData.yearEnd || ''
      const displayTermGPA = termGPA || transcriptData.termGPA || ''

      return (
        <TranscriptCard
          school={displaySchool}
          yearStart={displayYearStart}
          yearEnd={displayYearEnd}
          termGPA={displayTermGPA}
          cumulativeGPA={displayGPA}
          fullname={displayFullName}
          isInChat={context.isInChat}
        />
      )
    }

    return (
      <VDCard
        firstName={firstName}
        lastName={lastName}
        fullName={fullName}
        studentId={studentId}
        school={school}
        issueDate={issueDate}
        credDefId={currentCredDefId}
        issuerName={context.theirLabel}
        isInChat={context.isInChat}
        studentPhoto={studentPhoto}
      />
    )
  }

  const cardContent = renderCard()
  const showButtons = credential.state === CredentialState.OfferReceived && !userAction && !isDeclined && !isAccepted

  if (isAccepted) {
    return (
      <View>
        <>
          <View style={{ opacity: 0.5 }}>{cardContent}</View>
          <Text style={styles.messageTime}>
            {`${t('Chat.ReceivedAt')} ${formatTime(new Date(credential.createdAt), {
              includeHour: true,
              chatFormat: true,
              trim: true,
            })}`}
          </Text>
        </>

        <View>
          {onPress ? (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
              {cardContent}
            </TouchableOpacity>
          ) : (
            <View>{cardContent}</View>
          )}
        </View>
        <SnackBarMessage
          message={
            credentialType === CredentialDisplayType.TRANSCRIPT
              ? t('ListCredentials.AcceptedTrans')
              : t('ListCredentials.AcceptedCred')
          }
          type={'success'}
        />
      </View>
    )
  }

  if (isDeclined) {
    return (
      <View>
        <View style={{ opacity: 0.5 }}>{cardContent}</View>
        <Text style={styles.messageTime}>
          {`${t('Chat.ReceivedAt')} ${formatTime(new Date(credential.createdAt), {
            includeHour: true,
            chatFormat: true,
            trim: true,
          })}`}
        </Text>
        <View style={{ opacity: 0.5 }}>
          <CredentialButtons isProcessing={false} onAccept={() => {}} onDecline={() => {}} isDisabled={true} />
        </View>
        <SnackBarMessage message={t('ListCredentials.Declined')} type={'warning'} />
      </View>
    )
  }

  return (
    <View>
      <View>
        {onPress ? (
          <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            {cardContent}
          </TouchableOpacity>
        ) : (
          <View>{cardContent}</View>
        )}
      </View>
      {showButtons && CredentialButtons && (
        <View style={{ marginTop: 10 }}>
          <CredentialButtons
            isProcessing={isProcessing}
            onAccept={handleAccept}
            onDecline={handleDecline}
            isDisabled={false}
          />
        </View>
      )}
    </View>
  )
}

export interface VDCredentialRendererOptions {
  onPress?: (credential: CredentialExchangeRecord, context: RenderContext) => void
  forceDisplayType?: CredentialDisplayType
}

export class VDCredentialRenderer implements ICredentialRenderer {
  private options: VDCredentialRendererOptions

  constructor(options: VDCredentialRendererOptions = {}) {
    this.options = options
  }

  render(credential: CredentialExchangeRecord, context: RenderContext): React.ReactElement {
    const handlePress = this.options.onPress ? () => this.options.onPress!(credential, context) : () => {}

    return (
      <View style={styles.vdCard}>
        <VDCredentialCard credential={credential} context={context} onPress={handlePress} />
      </View>
    )
  }
}

export function createVDCredentialRenderer(options: VDCredentialRendererOptions = {}): VDCredentialRenderer {
  return new VDCredentialRenderer(options)
}