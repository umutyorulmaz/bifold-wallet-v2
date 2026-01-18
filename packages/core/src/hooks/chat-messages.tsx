
import {
  BasicMessageRecord,
  ConnectionRecord,
  CredentialExchangeRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@credo-ts/core'
import { useAgent, useBasicMessagesByConnectionId } from '@credo-ts/react-hooks'
import { isPresentationReceived } from '@bifold/verifier'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, View } from 'react-native'

import { ChatEvent } from '../components/chat/ChatEvent'
import { CallbackType } from '../components/chat/ChatMessage'
import { ThemedText } from '../components/texts/ThemedText'
import { COMPONENT_TOKENS, TOKENS, useContainer } from '../container-api'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useOptionalWorkflowRegistry } from '../modules/workflow'
import { MessageContext } from '../modules/workflow'
import { Role } from '../types/chat'
import { RootStackParams, ContactStackParams, Screens, Stacks } from '../types/navigators'
import {
  getConnectionName,
  getCredentialEventLabel,
  getCredentialEventRole,
  getMessageEventRole,
  getProofEventLabel,
  getProofEventRole,
} from '../utils/helpers'

import { useCredentialsByConnectionId } from './credentials'
import { useProofsByConnectionId } from './proofs'
import { useWorkflows } from './useWorkflows'
import { useServices } from '../container-api'
import { IMessage } from 'react-native-gifted-chat'


export interface ExtendedChatMessage extends IMessage {
  status?: string
  renderEvent: () => JSX.Element
  createdAt: Date
  messageOpensCallbackType?: CallbackType
  onDetails?: () => void
}

const callbackTypeForMessage = (record: CredentialExchangeRecord | ProofExchangeRecord) => {
  if (
    record instanceof CredentialExchangeRecord &&
    (record.state === CredentialState.Done || record.state === CredentialState.OfferReceived)
  ) {
    return CallbackType.CredentialOffer
  }

  if (
    (record instanceof ProofExchangeRecord && isPresentationReceived(record) && record.isVerified !== undefined) ||
    record.state === ProofState.RequestReceived ||
    (record.state === ProofState.Done && record.isVerified === undefined)
  ) {
    return CallbackType.ProofRequest
  }

  if (
    record instanceof ProofExchangeRecord &&
    (record.state === ProofState.PresentationSent || record.state === ProofState.Done)
  ) {
    return CallbackType.PresentationSent
  }
}

export interface UseChatMessagesResult {
  messages: ExtendedChatMessage[]
  canLoadEarlier: boolean
  isLoadingEarlier: boolean
  loadEarlier: () => void
}

export const useChatMessagesByConnection = (connection: ConnectionRecord): UseChatMessagesResult => {
  const [messages, setMessages] = useState<Array<ExtendedChatMessage>>([])
  const [store] = useStore()
  const { t } = useTranslation()
  const { ChatTheme: theme, ColorPalette } = useTheme()
  const navigation = useNavigation<StackNavigationProp<RootStackParams | ContactStackParams>>()
  const { agent } = useAgent()
  const basicMessages = useBasicMessagesByConnectionId(connection?.id)
  const credentials = useCredentialsByConnectionId(connection?.id)
  const proofs = useProofsByConnectionId(connection?.id)
  const [theirLabel, setTheirLabel] = useState(getConnectionName(connection, store.preferences.alternateContactNames))
  const [AboutInstitution] = useServices([COMPONENT_TOKENS.COMPONENT_ABOUT_INSTITUTION])
  const { instances: workflowInstances, isAvailable: workflowsAvailable } = useWorkflows(connection?.id)

  const container = useContainer()
  const logger = container?.resolve(TOKENS.UTIL_LOGGER) ?? undefined

  const registry = useOptionalWorkflowRegistry()

  // Pagination state
  const [workflowLimit, setWorkflowLimit] = useState(3)   // Initially show 3 workflows
  const [messageLimit, setMessageLimit] = useState(20)    // Initially show 20 messages
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false)

  // Calculate if there are more items to load
  const hasMoreWorkflows = useMemo(() => {
    const totalWorkflows = credentials.length + proofs.length
    return totalWorkflows > workflowLimit
  }, [credentials.length, proofs.length, workflowLimit])

  const hasMoreMessages = useMemo(() => {
    return basicMessages.length > messageLimit
  }, [basicMessages.length, messageLimit])

  const canLoadEarlier = hasMoreWorkflows || hasMoreMessages

  // Load earlier function
  const loadEarlier = useCallback(() => {
    setIsLoadingEarlier(true)

    // Increase limits
    if (hasMoreWorkflows) {
      setWorkflowLimit(prev => prev + 3)
    }
    if (hasMoreMessages) {
      setMessageLimit(prev => prev + 20)
    }

    // Small delay for UX
    setTimeout(() => setIsLoadingEarlier(false), 300)
  }, [hasMoreWorkflows, hasMoreMessages])

  useEffect(() => {
    setTheirLabel(getConnectionName(connection, store.preferences.alternateContactNames))
  }, [connection, store.preferences.alternateContactNames])

  const messageContext: MessageContext = useMemo(
    () => ({
      t,
      theme,
      theirLabel,
      colorPalette: ColorPalette,
      agent: agent ?? undefined,
      navigation,
      logger,
    }),
    [t, theme, theirLabel, ColorPalette, agent, navigation, logger]
  )

  useEffect(() => {
    let transformedMessages: Array<ExtendedChatMessage> = []

    // Sort and limit workflows (credentials + proofs)
    const allWorkflows = [...credentials, ...proofs]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const limitedWorkflows = allWorkflows.slice(0, workflowLimit)

    // Sort and limit basic messages
    const sortedBasicMessages = [...basicMessages]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const limitedBasicMessages = sortedBasicMessages.slice(0, messageLimit)

    if (registry) {
      const allRecords = [...limitedBasicMessages, ...limitedWorkflows, ...(workflowsAvailable ? workflowInstances : [])]
      transformedMessages = registry.toMessages(allRecords, connection, messageContext)
    } else {
      transformedMessages = transformMessagesLegacy(
        limitedBasicMessages,
        limitedWorkflows.filter((r): r is CredentialExchangeRecord => r instanceof CredentialExchangeRecord),
        limitedWorkflows.filter((r): r is ProofExchangeRecord => r instanceof ProofExchangeRecord),
        theirLabel,
        t,
        theme,
        ColorPalette,
        navigation
      )
    }

    const connectedBubbleStyle = {
      width: '100%' as const,
    }

    const connectedMessage = connection
      ? {
          _id: 'connected',
          text: `${t('Chat.YouConnected')} ${theirLabel}`,
          renderEvent: () => (
            <View style={connectedBubbleStyle}>
              <ThemedText style={theme.leftText}>
                {t('Chat.YouConnected')}
                <ThemedText style={[theme.leftText, theme.leftTextHighlighted]}> {theirLabel}</ThemedText>
              </ThemedText>
            </View>
          ),
          createdAt: connection.createdAt,
          user: { _id: Role.them },
        }
      : undefined

    const rootMenuMessage = basicMessages.find((msg) => {
      try {
        const content = JSON.parse(msg.content)
        return content.workflowID === 'root-menu'
      } catch {
        return false
      }
    })

    if (rootMenuMessage && !transformedMessages.some((msg) => msg._id === rootMenuMessage.id)) {
      try {
        const content = JSON.parse(rootMenuMessage.content)
        const displayData = content.displayData || []
        const titleItem = displayData.find((item: any) => item.type === 'title')
        const textItem = displayData.find((item: any) => item.type === 'text')

        if (titleItem && textItem) {
          const aboutMessage = {
            _id: rootMenuMessage.id,
            text: titleItem.text,
            renderEvent: () => <AboutInstitution title={titleItem.text} content={textItem.text} />,
            createdAt: rootMenuMessage.createdAt,
            user: { _id: Role.them },
          }
          transformedMessages.push(aboutMessage)
        }
      } catch (error) {
        // console.log('Error parsing workflow message:', error)
      }
    }

    const finalMessages = connectedMessage
      ? [...transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt), connectedMessage]
      : transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt)

    setMessages(finalMessages)
  }, [ColorPalette, basicMessages, theme, credentials, t, navigation, proofs, theirLabel, connection, registry, messageContext, workflowInstances, workflowsAvailable, AboutInstitution, workflowLimit, messageLimit])

  return {
    messages,
    canLoadEarlier,
    isLoadingEarlier,
    loadEarlier,
  }
}

function transformMessagesLegacy(
  basicMessages: BasicMessageRecord[],
  credentials: CredentialExchangeRecord[],
  proofs: ProofExchangeRecord[],
  theirLabel: string,
  t: any,
  theme: any,
  ColorPalette: any,
  navigation: StackNavigationProp<RootStackParams | ContactStackParams>
): ExtendedChatMessage[] {
  const transformedMessages: Array<ExtendedChatMessage> = []

  transformedMessages.push(
    ...basicMessages.map((record: BasicMessageRecord) => {
      const role = getMessageEventRole(record)
      const linkRegex = /(?:https?:\/\/\w+(?:\.\w+)+\S*)|(?:[\w\d._-]+@\w+(?:\.\w+)+)/gim
      const mailRegex = /^[\w\d._-]+@\w+(?:\.\w+)+$/gim
      const links = record.content.match(linkRegex) ?? []
      const handleLinkPress = (link: string) => {
        if (link.match(mailRegex)) {
          link = 'mailto:' + link
        }
        Linking.openURL(link)
      }
      const msgText = (
        <ThemedText style={role === Role.me ? theme.rightText : theme.leftText}>
          {record.content.split(linkRegex).map((split: string, i: number) => {
            if (i < links.length) {
              const link = links[i]
              return (
                <Fragment key={`${record.id}-${i}`}>
                  <ThemedText>{split}</ThemedText>
                  <ThemedText
                    onPress={() => handleLinkPress(link)}
                    style={{ color: ColorPalette.brand.link, textDecorationLine: 'underline' }}
                    accessibilityRole={'link'}
                  >
                    {link}
                  </ThemedText>
                </Fragment>
              )
            }
            return <ThemedText key={`${record.id}-${i}`}>{split}</ThemedText>
          })}
        </ThemedText>
      )

      return {
        _id: record.id,
        text: record.content,
        renderEvent: () => msgText,
        createdAt: record.createdAt,
        type: record.type,
        user: { _id: role },
      }
    })
  )

  transformedMessages.push(
    ...credentials.map((record: CredentialExchangeRecord) => {
      const role = getCredentialEventRole(record)
      const userLabel = role === Role.me ? t('Chat.UserYou') : theirLabel
      const actionLabel = t(getCredentialEventLabel(record) as any)

      return {
        _id: record.id,
        text: actionLabel,
        renderEvent: () => <ChatEvent role={role} userLabel={userLabel} actionLabel={actionLabel} />,
        createdAt: record.createdAt,
        type: record.type,
        user: { _id: role },
        messageOpensCallbackType: callbackTypeForMessage(record),
        onDetails: () => {
          const navMap: { [key in CredentialState]?: () => void } = {
            [CredentialState.Done]: () => {
              navigation.navigate(Stacks.ContactStack as any, {
                screen: Screens.CredentialDetails,
                params: { credentialId: record.id },
              })
            },
            [CredentialState.OfferReceived]: () => {
              if (navigation.getParent()) {
                navigation.getParent()?.navigate(Stacks.ConnectionStack, {
                  screen: Screens.Connection,
                  params: { credentialId: record.id },
                })
              } else {
                navigation.navigate(Stacks.ConnectionStack as any, {
                  screen: Screens.Connection,
                  params: { credentialId: record.id },
                })
              }
            },
          }
          const nav = navMap[record.state]
          if (nav) {
            nav()
          }
        },
      }
    })
  )

  transformedMessages.push(
    ...proofs.map((record: ProofExchangeRecord) => {
      const role = getProofEventRole(record)
      const userLabel = role === Role.me ? t('Chat.UserYou') : theirLabel
      const actionLabel = t(getProofEventLabel(record) as any)

      return {
        _id: record.id,
        text: actionLabel,
        renderEvent: () => <ChatEvent role={role} userLabel={userLabel} actionLabel={actionLabel} />,
        createdAt: record.createdAt,
        type: record.type,
        user: { _id: role },
        messageOpensCallbackType: callbackTypeForMessage(record),
        onDetails: () => {
          const toProofDetails = () => {
            navigation.navigate(Stacks.ContactStack as any, {
              screen: Screens.ProofDetails,
              params: {
                recordId: record.id,
                isHistory: true,
                senderReview:
                  record.state === ProofState.PresentationSent ||
                  (record.state === ProofState.Done && record.isVerified === undefined),
              },
            })
          }
          const navMap: { [key in ProofState]?: () => void } = {
            [ProofState.Done]: toProofDetails,
            [ProofState.PresentationSent]: toProofDetails,
            [ProofState.PresentationReceived]: toProofDetails,
            [ProofState.RequestReceived]: () => {
              if (navigation.getParent()) {
                navigation.getParent()?.navigate(Stacks.ConnectionStack, {
                  screen: Screens.Connection,
                  params: { proofId: record.id },
                })
              } else {
                navigation.navigate(Stacks.ConnectionStack as any, {
                  screen: Screens.Connection,
                  params: { proofId: record.id },
                })
              }
            },
          }
          const nav = navMap[record.state]
          if (nav) {
            nav()
          }
        },
      }
    })
  )

  return transformedMessages
}
