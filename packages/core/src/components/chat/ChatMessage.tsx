import React, { useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Bubble, IMessage, MessageProps } from 'react-native-gifted-chat'
import { useTheme } from '../../contexts/theme'
import { Role } from '../../types/chat'
import { formatTime } from '../../utils/helpers'
import { ThemedText } from '../texts/ThemedText'
import { testIdWithKey } from '../../utils/testable'
import { ColorPalette } from '../../theme'
import { useTranslation } from 'react-i18next'
import { t } from 'i18next'

export interface ExtendedChatMessage extends IMessage {
  renderEvent: () => JSX.Element
  createdAt: Date
  messageOpensCallbackType?: CallbackType
  onDetails?: () => void
}

export enum CallbackType {
  CredentialOffer = 'CredentialOffer',
  ProofRequest = 'ProofRequest',
  PresentationSent = 'PresentationSent',
  Workflow = 'Workflow',
}

interface ExtendedMessage extends IMessage {
  messageOpensCallbackType?: CallbackType
  renderEvent?: () => JSX.Element
  createdAt: Date | number
  user: { _id: string | number }
  onDetails?: () => void
}

interface ChatMessageProps {
  messageProps: MessageProps<ExtendedMessage>
}

interface MessageTimeProps {
  message: ExtendedMessage
  alignRight?: boolean
  prefix?: string
}

const textForCallbackType = (callbackType: CallbackType): string => {
  switch (callbackType) {
    case CallbackType.CredentialOffer:
      return 'ViewOffer'
    case CallbackType.ProofRequest:
      return 'ViewRequest'
    case CallbackType.PresentationSent:
      return 'OpenPresentation'
    case CallbackType.Workflow:
      return 'ViewWorkflow'
    default:
      return 'OpenItem'
  }
}

const testIdForCallbackType = (callbackType: CallbackType): string => {
  const text = textForCallbackType(callbackType)
  const textWithoutSpaces = text.replace(/\s+/g, '')
  return testIdWithKey(`Chat.${textWithoutSpaces}`)

}

export const MessageTime: React.FC<MessageTimeProps> = ({ message, alignRight = false, prefix }) => {
  const { ChatTheme: theme } = useTheme()
  const { t } = useTranslation()
  const timeStyle = alignRight ? theme.timeStyleRight : theme.timeStyleLeft

  let addText = ''
  switch (message.text) {
    case 'This is the title as you can see':
      addText = t('Chat.ReceivedAt')
      break
    case 'You connected with':
      addText = t('Chat.ReceivedAt')
      break
    case 'Action Menu':
      addText = t('Chat.ReceivedAt')
      break
    case 'accepted':
      addText = t('Chat.AcceptedAt')
      break
    case 'declined a credential offer':
      addText = t('Chat.DeclinedAt')
      break
    default:
  }

  return (
    <ThemedText style={[timeStyle, styles.timeText]}>
      {prefix} {addText} {formatTime(new Date(message.createdAt), { includeHour: true, chatFormat: true, trim: true })}
    </ThemedText>
  )
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ messageProps }) => {

  if (!messageProps.currentMessage) {
    return null
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const message = useMemo(() => messageProps.currentMessage as ExtendedMessage, [messageProps.currentMessage])

  if (message.messageOpensCallbackType) {
    const isMe = message.user._id === Role.me

    let addedText = ''
    switch (message.text) {
      case 'sent a credential offer':
        addedText = t('Chat.ReceivedAt')
        break
      case 'received a credential':
        addedText = t('Chat.AcceptedAt')
        break
      default:
    }
    return (
      <TouchableOpacity
        testID={testIdForCallbackType(message.messageOpensCallbackType)}
        style={styles.messageContainer}
        onPress={message.onDetails}
      >
        <View style={[styles.callbackContainer, isMe ? styles.callbackLeft : styles.callbackLeft]}>
          {message.renderEvent?.() || null}
        </View>

        <View style={[styles.timeContainer, isMe ? styles.timeLeft : styles.timeLeft]}>
          <MessageTime message={message} alignRight={false} prefix={addedText} />
        </View>
      </TouchableOpacity>
    )
  }

  // Regular messages
  const isMe = message.user._id === Role.me

  return (
    <View style={styles.messageContainer}>
      <View style={[styles.bubbleContainer, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        <Bubble
          {...(messageProps as any)}
          key={messageProps.key}
          renderUsernameOnMessage={false}
          renderMessageText={() => <View style={styles.messageTextContainer}>{message.renderEvent?.() || null}</View>}
          containerStyle={{
            left: styles.containerLeft,
            right: styles.containerRight,
          }}
          wrapperStyle={{
            left: styles.wrapperLeft,
            right: styles.wrapperRight,
          }}
          textStyle={{
            left: styles.leftText,
            right: styles.rightText,
          }}
          renderTime={() => null}
          renderCustomView={() => null}
        />
      </View>
      <View style={styles.timeBelowBubble}>
        <MessageTime message={message} alignRight={false} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  messageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Callback type messages (credential offers, proof requests)
  callbackContainer: {
    width: '90%',
  },
  callbackLeft: {
    alignItems: 'flex-start',
  },
  callbackRight: {
    alignItems: 'flex-end',
  },

  // Time
  timeContainer: {
    width: '90%',
    marginLeft: '-6%',
  },
  timeLeft: {
    alignItems: 'flex-start',
  },
  timeRight: {
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    color: ColorPalette.grayscale.white,
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 18,
  },

  // Regular messages bubble
  bubbleContainer: {
    width: '90%',
  },
  bubbleLeft: {
    alignItems: 'flex-start',
  },
  bubbleRight: {
    alignItems: 'flex-start',
  },

  // Bubble styles
  containerLeft: {
    margin: 0,
    maxWidth: '100%',
  },
  containerRight: {
    margin: 0,
    maxWidth: '100%',
  },
  wrapperLeft: {
    backgroundColor: 'transparent',
    marginRight: 0,
    padding: 0,
    maxWidth: '100%',
  },
  wrapperRight: {
    backgroundColor: 'transparent',
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
    maxWidth: '100%',
  },
  leftText: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'left',
  },
  rightText: {
    color: '#000000',
    fontSize: 14,
  },

  messageTextContainer: {
    backgroundColor: 'transparent',
  },
  timeBelowBubble: {
    alignSelf: 'flex-start',
  },
})
