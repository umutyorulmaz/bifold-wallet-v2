// packages/core/src/screens/Chat.tsx

import { BasicMessageRepository, ConnectionRecord } from '@credo-ts/core'
import { useAgent, useBasicMessagesByConnectionId, useConnectionById } from '@credo-ts/react-hooks'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { useHeaderHeight } from '@react-navigation/elements'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View, GestureResponderEvent } from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import { renderComposer, renderInputToolbar, renderSend } from '../components/chat'
import ActionSlider from '../components/chat/ActionSlider'
import { renderActions } from '../components/chat/ChatActions'
import { ChatMessage } from '../components/chat/ChatMessage'
import { useNetwork } from '../contexts/network'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useChatMessagesByConnection } from '../hooks/chat-messages'
import { useConnectionCapabilities } from '../hooks/useConnectionCapabilities'
import { useOptionalWorkflowRegistry } from '../modules/workflow'
import { ActionContext, WorkflowAction } from '../modules/workflow'
import { createDCWalletChatConfig } from '../modules/workflow/renderers/createChatScreenConfig'
import { Role } from '../types/chat'
import { BasicMessageMetadata, basicMessageCustomMetadata } from '../types/metadata'
import { RootStackParams, ContactStackParams, Screens, Stacks } from '../types/navigators'
import { getConnectionName } from '../utils/helpers'

type ChatProps = StackScreenProps<ContactStackParams, Screens.Chat> | StackScreenProps<RootStackParams, Screens.Chat>

type AnchorRect = { x: number; y: number; w: number; h: number }

// lint-safe swallow (and avoids unused var)
const swallow = (..._args: unknown[]) => {
  // intentionally swallowed
  void _args
}

const Chat: React.FC<ChatProps> = ({ route }) => {
  if (!route?.params) throw new Error('Chat route params were not set properly')

  const { connectionId } = route.params
  const [store] = useStore()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const navigation = useNavigation<StackNavigationProp<RootStackParams | ContactStackParams>>()

  const connection = useConnectionById(connectionId) as ConnectionRecord
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
  const chatMessages = useChatMessagesByConnection(connection)
  const isFocused = useIsFocused()

  const { assertNetworkConnected, silentAssertConnectedNetwork } = useNetwork()
  const [showActionSlider, setShowActionSlider] = useState(false)
  const { ChatTheme: theme, Assets } = useTheme()

  const [theirLabel, setTheirLabel] = useState(getConnectionName(connection, store.preferences.alternateContactNames))

  const headerHeight = useHeaderHeight()
  const insets = useSafeAreaInsets()

  const { capabilities } = useConnectionCapabilities(connectionId)
  const registry = useOptionalWorkflowRegistry()

  // --- Overflow menu anchor state (measured from press coordinates) ---
  const [isOverflowOpen, setIsOverflowOpen] = useState(false)
  const [overflowAnchor, setOverflowAnchor] = useState<AnchorRect | null>(null)

  const closeOverflowMenu = useCallback(() => {
    setIsOverflowOpen(false)
  }, [])

  // anchor under the pressed 3-dots icon using absolute screen coords
  const openOverflowMenuAtEvent = useCallback(
    (e?: GestureResponderEvent) => {
      if (e?.nativeEvent) {
        const { pageX, pageY, locationX, locationY } = e.nativeEvent
        const w = 36
        const h = 36
        const x = pageX - locationX
        const y = pageY - locationY
        setOverflowAnchor({ x, y, w, h })
      } else {
        setOverflowAnchor({ x: 0, y: insets.top, w: 0, h: 0 })
      }
      setIsOverflowOpen(true)
    },
    [insets.top]
  )

  const chatScreenConfig = useMemo(
    () =>
      createDCWalletChatConfig({
        onCredentialAccept: async (credential, context) => {
          try {
            await context.agent.credentials.acceptOffer(credential.id)
          } catch (e) {
            swallow(e)
          }
        },
        onCredentialDecline: async (credential, context) => {
          try {
            await context.agent.credentials.declineOffer(credential.id)
          } catch (e) {
            swallow(e)
          }
        },
        onCredentialPress: (credential, context) => {
          context.navigation.navigate('CredentialDetails', { credentialId: credential.id })
        },
      }),
    []
  )

  useEffect(() => {
    setTheirLabel(getConnectionName(connection, store.preferences.alternateContactNames))
  }, [isFocused, connection, store.preferences.alternateContactNames])

  useEffect(() => {
    assertNetworkConnected()
  }, [assertNetworkConnected])

  const onShowMenu = useCallback(async () => {
    try {
      await agent?.basicMessages.sendMessage(connectionId, ':menu')
    } catch (e) {
      swallow(e)
    }
  }, [agent, connectionId])

  const onRestartSessionPress = useCallback(async () => {
    closeOverflowMenu()
    setShowActionSlider(false)
    try {
      await agent?.basicMessages.sendMessage(connectionId, ':menu')
    } catch (e) {
      swallow(e)
    }
  }, [agent, closeOverflowMenu, connectionId])

  const onInformationPress = useCallback(() => {
    closeOverflowMenu()

    navigation.navigate(Stacks.ContactStack as any, {
      screen: Screens.ContactDetails,
      params: { connectionId },
    })
  }, [closeOverflowMenu, navigation, connectionId])

  const headerRightIcons = useMemo(() => {
    return [
      {
        IconComponent: (props: any) => (
          <MaterialCommunityIcon name="dots-horizontal-circle-outline" size={28} color={props.color ?? '#FFFFFF'} />
        ),
        onPress: (e?: any) => openOverflowMenuAtEvent(e),
        accessibilityLabel: t('Global.MoreOptions') ?? 'More options',
      },
    ]
  }, [openOverflowMenuAtEvent, t])

  useEffect(() => {
    if (chatScreenConfig?.headerInsideBackground && chatScreenConfig?.headerRenderer) {
      navigation.setOptions({ headerShown: false })
      return
    }

    if (chatScreenConfig?.headerRenderer) {
      navigation.setOptions({
        header: () =>
          chatScreenConfig.headerRenderer!.render({
            title: theirLabel,
            connectionId: connection?.id,
            onBack: () => navigation.goBack(),
            onInfo: () => navigation.navigate(Screens.ContactDetails as any, { connectionId: connection?.id }),
            onVideoCall: () =>
              navigation.navigate(Screens.VideoCall as any, { connectionId: connection?.id, video: true }),
            showMenuButton: chatScreenConfig.showMenuButton,
            showInfoButton: chatScreenConfig.showInfoButton,
            showVideoButton: chatScreenConfig.showVideoButton && capabilities.supportsWebRTC,
            isLoadingCapabilities: capabilities.isLoading,
            onMenuPress: onShowMenu,
            rightIcons: headerRightIcons,
          }),
      })
    }
  }, [
    navigation,
    theirLabel,
    connection?.id,
    chatScreenConfig,
    onShowMenu,
    capabilities.supportsWebRTC,
    capabilities.isLoading,
    headerRightIcons,
  ])

  // mark messages as seen
  useEffect(() => {
    basicMessages.forEach((msg) => {
      const meta = msg.metadata.get(BasicMessageMetadata.customMetadata) as basicMessageCustomMetadata
      if (agent && !meta?.seen) {
        msg.metadata.set(BasicMessageMetadata.customMetadata, { ...meta, seen: true })
        const repo = agent.context.dependencyManager.resolve(BasicMessageRepository)
        repo.update(agent.context, msg)
      }
    })
  }, [basicMessages, agent])

  const onSend = useCallback(
    async (messages: IMessage[]) => {
      try {
        await agent?.basicMessages.sendMessage(connectionId, messages[0].text)
      } catch (e) {
        swallow(e)
      }
    },
    [agent, connectionId]
  )

  const onSendRequest = useCallback(async () => {
    navigation.navigate(Stacks.ProofRequestsStack as any, {
      screen: Screens.ProofRequests,
      params: { connectionId },
    })
  }, [navigation, connectionId])

  const actionContext: ActionContext | undefined = useMemo(() => {
    if (!agent) return undefined
    return { agent, connectionId, navigation, t }
  }, [agent, connectionId, navigation, t])

  const actions = useMemo(() => {
    const defaultActions: WorkflowAction[] = []

    if (store.preferences.useVerifierCapability) {
      defaultActions.push({
        id: 'send-proof-request',
        text: t('Verifier.SendProofRequest'),
        onPress: () => {
          setShowActionSlider(false)
          onSendRequest()
        },
        icon: () => <Assets.svg.iconInfoSentDark height={30} width={30} />,
      })
    }

    if (registry && actionContext) {
      const registryActions = registry.getChatActions(actionContext)
      const existingIds = new Set(defaultActions.map((a) => a.id))
      return [...defaultActions, ...registryActions.filter((a) => !existingIds.has(a.id))]
    }

    return defaultActions.length ? defaultActions : undefined
  }, [store.preferences.useVerifierCapability, t, onSendRequest, Assets, registry, actionContext])

  const menuStyle = useMemo(() => {
    const fallbackTop = insets.top + headerHeight + 8
    const fallbackRight = 8

    if (!overflowAnchor) {
      return {
        position: 'absolute' as const,
        top: fallbackTop,
        right: fallbackRight,
      }
    }

    const top = overflowAnchor.y + overflowAnchor.h + 8
    const right = 8

    return {
      position: 'absolute' as const,
      top,
      right,
    }
  }, [overflowAnchor, headerHeight, insets.top])

  const overflowMenu = (
    <Modal visible={isOverflowOpen} transparent animationType="fade" onRequestClose={closeOverflowMenu}>
      <Pressable style={{ flex: 1 }} onPress={closeOverflowMenu}>
        <View style={[menuStyle]}>
          <View
            style={{
              backgroundColor: '#1F1F1F',
              borderRadius: 12,
              paddingVertical: 8,
              minWidth: 200,
              shadowOpacity: 0.25,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Pressable
              onPress={onRestartSessionPress}
              accessibilityRole="button"
              accessibilityLabel={t('Chat.RestartSession') ?? 'Restart session'}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 10,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{t('Chat.RestartSession') ?? 'Restart session'}</Text>
            </Pressable>

            <Pressable
              onPress={onInformationPress}
              accessibilityRole="button"
              accessibilityLabel={t('Global.Information') ?? 'Information'}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 10,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{t('Global.Information') ?? 'Information'}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  )

  const chatContent = (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? undefined : 'padding'}
      keyboardVerticalOffset={headerHeight}
    >
      <GiftedChat
        keyboardShouldPersistTaps="handled"
        messages={chatMessages}
        renderAvatar={() => null}
        messageIdGenerator={(msg) => msg?._id.toString() || '0'}
        renderMessage={(props) => <ChatMessage messageProps={props} />}
        renderInputToolbar={(props) => renderInputToolbar(props, theme)}
        renderSend={(props) => renderSend(props, theme)}
        renderComposer={(props) => renderComposer(props, theme, t('Contacts.TypeHere'))}
        disableComposer={!silentAssertConnectedNetwork()}
        onSend={onSend}
        user={{ _id: Role.me }}
        renderActions={(props) => renderActions(props, theme, actions as any)}
        onPressActionButton={actions && actions.length > 0 ? () => setShowActionSlider(true) : undefined}
        messagesContainerStyle={{ paddingHorizontal: 12 }}
      />
      {showActionSlider && <ActionSlider onDismiss={() => setShowActionSlider(false)} actions={actions as any} />}
    </KeyboardAvoidingView>
  )

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1 }}>
      {overflowMenu}
      {chatContent}
    </SafeAreaView>
  )
}

export default Chat
