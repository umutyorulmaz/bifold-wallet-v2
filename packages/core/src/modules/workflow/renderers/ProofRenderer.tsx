/**
 * ProofRenderer
 *
 * Custom renderer for displaying proof requests in chat.
 * Can render as visual cards or default text with inline action buttons.
 */

import { ProofExchangeRecord, ProofState } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, DeviceEventEmitter, Text, Dimensions } from 'react-native'

import { useTheme } from '../../../contexts/theme'
import { ThemedText } from '../../../components/texts/ThemedText'
import { IProofRenderer, RenderContext } from '../types'
import { TOKENS, useServices } from '../../../container-api'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { formatTime } from '../../../utils/helpers'
import { ColorPalette } from '../../../theme'
import { t } from 'i18next'
import { Screens, Stacks } from '../../../types/navigators'

const { width } = Dimensions.get('window')

/**
 * Props for the default proof card component
 */
interface ProofCardProps {
  proof: ProofExchangeRecord
  context: RenderContext
  onPress?: () => void
  isLoading?: boolean
}

/**
 * Default proof card component (simplified, no buttons)
 */
export const DefaultProofCard: React.FC<ProofCardProps> = ({ proof, context, onPress, isLoading }) => {
  const { ColorPalette, SettingsTheme } = useTheme()

  // Determine state label and color using theme colors
  const getStateInfo = () => {
    const successColor = SettingsTheme.newSettingColors.successColor || ColorPalette.semantic.success
    const errorColor = SettingsTheme.newSettingColors.deleteBtn

    switch (proof.state) {
      case ProofState.RequestReceived:
        return {
          label: context.t('ProofRequest.ProofRequest' as any) as string,
          color: SettingsTheme.newSettingColors.buttonColor,
        }
      case ProofState.PresentationSent:
        return {
          label: context.t('ProofRequest.PresentationSent' as any) as string,
          color: successColor,
        }
      case ProofState.Done:
        return {
          label: proof.isVerified
            ? (context.t('ProofRequest.Verified' as any) as string)
            : (context.t('ProofRequest.NotVerified' as any) as string),
          color: proof.isVerified ? successColor : errorColor,
        }
      case ProofState.Declined:
        return {
          label: context.t('ProofRequest.Declined' as any) as string,
          color: errorColor,
        }
      default:
        return {
          label: proof.state,
          color: SettingsTheme.newSettingColors.textColor,
        }
    }
  }

  const stateInfo = getStateInfo()

  const content = (
    <View style={[styles.card, { backgroundColor: SettingsTheme.newSettingColors.bgColorUp }]}>
      {/* Header with state */}
      <View style={[styles.header, { backgroundColor: stateInfo.color }]}>
        <ThemedText style={[styles.headerText, { color: ColorPalette.grayscale.white }]}>{stateInfo.label}</ThemedText>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {isLoading ? (
          <ActivityIndicator size="small" color={SettingsTheme.newSettingColors.buttonColor} />
        ) : (
          <>
            <ThemedText style={[styles.title, { color: SettingsTheme.newSettingColors.textBody }]}>
              {context.t('ProofRequest.InformationRequest' as any) as string}
            </ThemedText>
            <ThemedText style={[styles.description, { color: SettingsTheme.newSettingColors.textColor }]}>
              {context.theirLabel} {context.t('ProofRequest.RequestsInformation' as any) as string}
            </ThemedText>
            {proof.state === ProofState.RequestReceived && (
              <ThemedText style={[styles.action, { color: SettingsTheme.newSettingColors.buttonColor }]}>
                {context.t('ProofRequest.TapToView' as any) as string}
              </ThemedText>
            )}
          </>
        )}
      </View>

      {/* Bottom accent line */}
      <View style={[styles.bottomLine, { backgroundColor: stateInfo.color }]} />
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

/**
 * VD Proof Card with inline Accept/Decline buttons
 */
export const VDProofCard: React.FC<ProofCardProps> = ({ proof, context }) => {
  const { ColorPalette: ThemeColorPalette, SettingsTheme } = useTheme()
  const [CredentialButtons] = useServices([TOKENS.COMPONENT_CREDENTIAL_BUTTONS])
  const [SnackBarMessage] = useServices([TOKENS.COMPONENT_SNACK_BAR_MESSAGE])
  const { agent } = useAgent()
  const [isProcessing, setIsProcessing] = useState(false)
  const [userAction, setUserAction] = useState<'shared' | 'declined' | null>(null)
  const [isShared, setIsShared] = useState(false)
  const [isDeclined, setIsDeclined] = useState(false)
  const [currentProofState, setCurrentProofState] = useState(proof.state)

  // Check if proof has been acted upon
  useEffect(() => {
    const checkProofStatus = async () => {
      if (!agent) return

      try {
        const currentProof = await agent.proofs.getById(proof.id)
        setCurrentProofState(currentProof.state)

        if (currentProof.state === ProofState.PresentationSent || currentProof.state === ProofState.Done) {
          setIsShared(true)
          setIsDeclined(false)
        } else if (currentProof.state === ProofState.Declined || currentProof.state === ProofState.Abandoned) {
          setIsDeclined(true)
          setIsShared(false)
        }
      } catch (error) {
        // Proof might not exist anymore
      }
    }

    checkProofStatus()
  }, [agent, proof.id])

  const getStateInfo = () => {
    const successColor = SettingsTheme.newSettingColors.successColor || ThemeColorPalette.semantic.success
    const errorColor = SettingsTheme.newSettingColors.deleteBtn

    const stateToCheck = currentProofState

    switch (stateToCheck) {
      case ProofState.RequestReceived:
        return {
          label: context.t('ProofRequest.ProofRequest' as any) as string,
          color: SettingsTheme.newSettingColors.buttonColor,
        }
      case ProofState.PresentationSent:
        return {
          label: context.t('ProofRequest.PresentationSent' as any) as string,
          color: successColor,
        }
      case ProofState.Done:
        return {
          label: proof.isVerified
            ? (context.t('ProofRequest.Verified' as any) as string)
            : (context.t('ProofRequest.SharedSuccessfully' as any) || 'Shared') as string,
          color: successColor,
        }
      case ProofState.Declined:
      case ProofState.Abandoned:
        return {
          label: context.t('ProofRequest.Declined' as any) as string,
          color: errorColor,
        }
      default:
        return {
          label: stateToCheck,
          color: SettingsTheme.newSettingColors.textColor,
        }
    }
  }

  const stateInfo = getStateInfo()

  // Navigate to proof request screen to select credentials and share
  const handleShare = useCallback(() => {
    if (!context.navigation || isProcessing || userAction) return

    setIsProcessing(true)

    // Navigate to the Connection screen which handles the proof request flow
    const parent = context.navigation.getParent()
    if (parent) {
      parent.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { proofId: proof.id },
      })
    } else {
      context.navigation.navigate(Stacks.ConnectionStack as any, {
        screen: Screens.Connection,
        params: { proofId: proof.id },
      })
    }

    setIsProcessing(false)
  }, [context.navigation, isProcessing, userAction, proof.id])

  const handleDecline = useCallback(async () => {
    if (!agent || isProcessing || userAction) return

    try {
      setIsProcessing(true)

      await agent.proofs.declineRequest({ proofRecordId: proof.id })

      setUserAction('declined')
      setIsDeclined(true)
      setCurrentProofState(ProofState.Declined)

      // Send menu message to restart conversation
      if (proof.connectionId) {
        await agent.basicMessages.sendMessage(proof.connectionId, ':menu')
      }
    } catch (err: unknown) {
      const error = new BifoldError(
        t('Error.Title1027'),
        t('Error.Message1027'),
        (err as Error)?.message ?? err,
        1027
      )
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    } finally {
      setIsProcessing(false)
    }
  }, [agent, isProcessing, userAction, proof.id, proof.connectionId])

  const showButtons =
    currentProofState === ProofState.RequestReceived && !userAction && !isDeclined && !isShared

  const cardContent = (
    <View style={[styles.vdCard, { backgroundColor: SettingsTheme.newSettingColors.bgColorUp }]}>
      {/* Header with state */}
      <View style={[styles.header, { backgroundColor: stateInfo.color }]}>
        <ThemedText style={[styles.headerText, { color: ThemeColorPalette.grayscale.white }]}>
          {stateInfo.label}
        </ThemedText>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <ThemedText style={[styles.title, { color: SettingsTheme.newSettingColors.textBody }]}>
          {context.t('ProofRequest.InformationRequest' as any) as string}
        </ThemedText>
        <ThemedText style={[styles.description, { color: SettingsTheme.newSettingColors.textColor }]}>
          {context.theirLabel} {context.t('ProofRequest.RequestsInformation' as any) as string}
        </ThemedText>
      </View>

      {/* Bottom accent line */}
      <View style={[styles.bottomLine, { backgroundColor: stateInfo.color }]} />
    </View>
  )

  // Show shared state
  if (isShared || currentProofState === ProofState.PresentationSent || currentProofState === ProofState.Done) {
    return (
      <View key={`shared-${proof.id}`}>
        <View>{cardContent}</View>
        <Text style={[styles.messageTime]}>
          {`${t('Chat.SharedAt') || t('Chat.AcceptedAt')} ${formatTime(new Date(proof.updatedAt || proof.createdAt), {
            includeHour: true,
            chatFormat: true,
            trim: true,
          })}`}
        </Text>
        <SnackBarMessage message={t('ProofRequest.PresentationSent') || 'Proof shared successfully'} type={'success'} />
      </View>
    )
  }

  // Show declined state
  if (isDeclined || currentProofState === ProofState.Declined || currentProofState === ProofState.Abandoned) {
    return (
      <View key={`declined-${proof.id}`}>
        <View style={{ opacity: 0.5 }}>{cardContent}</View>
        <Text style={[styles.messageTime]}>
          {`${t('Chat.DeclinedAt')} ${formatTime(new Date(proof.updatedAt || proof.createdAt), {
            includeHour: true,
            chatFormat: true,
            trim: true,
          })}`}
        </Text>
        <View style={{ opacity: 0.5 }}>
          <CredentialButtons isProcessing={false} onAccept={() => {}} onDecline={() => {}} isDisabled={true} />
        </View>
        <SnackBarMessage message={t('ProofRequest.Declined') || 'Request declined'} type={'warning'} />
      </View>
    )
  }

  // Show active state with buttons
  return (
    <View>
      <View>{cardContent}</View>
      <Text style={[styles.messageTime]}>
        {`${t('Chat.ReceivedAt')} ${formatTime(new Date(proof.createdAt), {
          includeHour: true,
          chatFormat: true,
          trim: true,
        })}`}
      </Text>
      {showButtons && CredentialButtons && (
        <View style={{ marginTop: 10 }}>
          <CredentialButtons
            isProcessing={isProcessing}
            onAccept={handleShare}
            onDecline={handleDecline}
            isShare={true}
            isDisabled={false}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    minHeight: 100,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vdCard: {
    width: width * 0.85,
    minHeight: 100,
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
  },
  action: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomLine: {
    height: 4,
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
    zIndex: 10,
  },
})

/**
 * Options for configuring the proof renderer
 */
export interface ProofRendererOptions {
  /** Custom card component to use instead of default */
  CardComponent?: React.FC<ProofCardProps>
  /** Whether to show action buttons (share/decline) */
  showActions?: boolean
  /** Callback when card is pressed */
  onPress?: (proof: ProofExchangeRecord, context: RenderContext) => void
}

/**
 * Default proof renderer class (no buttons)
 */
export class DefaultProofRenderer implements IProofRenderer {
  private options: ProofRendererOptions

  constructor(options: ProofRendererOptions = {}) {
    this.options = options
  }

  render(proof: ProofExchangeRecord, context: RenderContext): React.ReactElement {
    const CardComponent = this.options.CardComponent || DefaultProofCard
    const handlePress = this.options.onPress ? () => this.options.onPress!(proof, context) : undefined

    return <CardComponent proof={proof} context={context} onPress={handlePress} />
  }
}

/**
 * VD Proof Renderer with inline buttons
 */
export class VDProofRenderer implements IProofRenderer {
  private options: ProofRendererOptions

  constructor(options: ProofRendererOptions = {}) {
    this.options = options
  }

  render(proof: ProofExchangeRecord, context: RenderContext): React.ReactElement {
    return (
      <View style={{ width: width * 0.85 }}>
        <VDProofCard proof={proof} context={context} />
      </View>
    )
  }
}

/**
 * Factory function to create a DefaultProofRenderer
 */
export function createDefaultProofRenderer(options: ProofRendererOptions = {}): DefaultProofRenderer {
  return new DefaultProofRenderer(options)
}

/**
 * Factory function to create a VDProofRenderer with inline buttons
 */
export function createVDProofRenderer(options: ProofRendererOptions = {}): VDProofRenderer {
  return new VDProofRenderer(options)
}
