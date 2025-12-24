import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Text, Vibration, Animated, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackScreenProps } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/Feather'
import { useConnectionById, useAgent } from '@credo-ts/react-hooks'

import { RootStackParams, Screens } from '../types/navigators'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { getConnectionName } from '../utils/helpers'

type Props = StackScreenProps<RootStackParams, Screens.IncomingCall>

const IncomingCall: React.FC<Props> = ({ route, navigation }) => {
  const { connectionId, threadId, sdp, callerLabel, iceServers } = route.params
  const connection = useConnectionById(connectionId)
  const [store] = useStore()
  const { agent } = useAgent()
  const { ColorPalette } = useTheme()
  const insets = useSafeAreaInsets()
  const contactName = callerLabel || (connection ? getConnectionName(connection, store.preferences.alternateContactNames) : 'Unknown Caller')

  // Animation for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Vibrate pattern: vibrate, pause, vibrate...
    const vibrationPattern = [0, 1000, 500, 1000, 500, 1000]
    Vibration.vibrate(vibrationPattern, true)

    // Pulsing animation for avatar
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()

    return () => {
      Vibration.cancel()
      pulse.stop()
    }
  }, [pulseAnim])

  const handleAccept = () => {
    console.log('[IncomingCall] Accepting call with ICE servers:', iceServers?.length || 0)
    Vibration.cancel()
    navigation.replace(Screens.VideoCall as any, {
      connectionId,
      threadId,
      isIncoming: true,
      remoteSdp: sdp,
      iceServers,
      video: true,
    })
  }

  const handleReject = async () => {
    console.log('[IncomingCall] Rejecting call')
    Vibration.cancel()
    try {
      const agentModules = (agent as any)?.modules
      if (agentModules?.webrtc) {
        await agentModules.webrtc.endCall({
          connectionId,
          threadId,
          reason: 'rejected',
        })
      }
    } catch (err) {
      console.error('[IncomingCall] Error rejecting call:', err)
    }
    navigation.goBack()
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a2e',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    avatarContainer: {
      marginBottom: 32,
    },
    avatarRing: {
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 3,
      borderColor: ColorPalette.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    avatar: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: '#2a2a4e',
      justifyContent: 'center',
      alignItems: 'center',
    },
    callerName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 8,
      textAlign: 'center',
    },
    callType: {
      fontSize: 16,
      color: '#999',
      marginBottom: 24,
    },
    callingIndicator: {
      flexDirection: 'row',
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: ColorPalette.brand.primary,
      opacity: 0.3,
    },
    dotDelay1: {
      opacity: 0.6,
    },
    dotDelay2: {
      opacity: 1,
    },
    actionsContainer: {
      paddingBottom: 60,
      paddingHorizontal: 20,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 80,
    },
    actionButtonContainer: {
      alignItems: 'center',
    },
    actionButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    rejectButton: {
      backgroundColor: '#ff3b30',
    },
    acceptButton: {
      backgroundColor: '#34c759',
    },
    actionLabel: {
      fontSize: 14,
      color: '#999',
      marginTop: 12,
      textAlign: 'center',
    },
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent />

      <View style={styles.content}>
        {/* Animated Avatar */}
        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Icon name="user" size={64} color="#fff" />
            </View>
          </View>
        </Animated.View>

        {/* Caller Info */}
        <Text style={styles.callerName}>{contactName}</Text>
        <Text style={styles.callType}>Incoming Video Call</Text>

        {/* Call indicator */}
        <View style={styles.callingIndicator}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotDelay1]} />
          <View style={[styles.dot, styles.dotDelay2]} />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.actions}>
          {/* Reject Button */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              activeOpacity={0.7}
            >
              <Icon name="phone-off" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Decline</Text>
          </View>

          {/* Accept Button */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
              activeOpacity={0.7}
            >
              <Icon name="phone" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Accept</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default IncomingCall
