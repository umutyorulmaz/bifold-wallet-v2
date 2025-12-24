import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RTCView } from 'react-native-webrtc'
import { StackScreenProps } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/Feather'
import { useConnectionById } from '@credo-ts/react-hooks'

import { useCallService } from '../hooks/useCallService'
import { RootStackParams, Screens } from '../types/navigators'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { getConnectionName } from '../utils/helpers'

type Props = StackScreenProps<RootStackParams, Screens.VideoCall>

const VideoCall: React.FC<Props> = ({ route, navigation }) => {
  const { connectionId, threadId, video = true } = route.params || {}
  // Check for incoming call params (passed from IncomingCall screen)
  const isIncoming = (route.params as any)?.isIncoming
  const remoteSdp = (route.params as any)?.remoteSdp
  const iceServers = (route.params as any)?.iceServers

  const connection = useConnectionById(connectionId)
  const [store] = useStore()
  const { ColorPalette } = useTheme()
  const insets = useSafeAreaInsets()
  const contactName = connection ? getConnectionName(connection, store.preferences.alternateContactNames) : 'Unknown'
  const [callInitialized, setCallInitialized] = useState(false)
  const isNavigatingRef = useRef(false)

  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleCamera,
    switchCamera,
  } = useCallService()

  // Initialize call on mount
  useEffect(() => {
    if (callInitialized) return

    const initCall = async () => {
      try {
        if (isIncoming && threadId && remoteSdp) {
          console.log('[VideoCall] Accepting incoming call with ICE servers:', iceServers?.length || 0)
          await acceptCall(connectionId, threadId, remoteSdp, video, iceServers)
        } else {
          console.log('[VideoCall] Starting outgoing call')
          await startCall(connectionId, video)
        }
        setCallInitialized(true)
      } catch (err) {
        console.error('[VideoCall] Error initializing call:', err)
        navigation.goBack()
      }
    }

    initCall()
  }, [connectionId, threadId, isIncoming, remoteSdp, iceServers, acceptCall, startCall, callInitialized, navigation, video])

  // Handle call ended by remote party
  useEffect(() => {
    if (callState === 'ended' && callInitialized && !isNavigatingRef.current) {
      console.log('[VideoCall] Call ended by remote, navigating back')
      isNavigatingRef.current = true
      navigation.goBack()
    }
  }, [callState, callInitialized, navigation])

  const handleEndCall = async () => {
    if (isNavigatingRef.current) return
    console.log('[VideoCall] End call pressed')
    isNavigatingRef.current = true
    await endCall()
    navigation.goBack()
  }

  const getStatusText = () => {
    switch (callState) {
      case 'calling':
        return 'Calling...'
      case 'ringing':
        return 'Ringing...'
      case 'connected':
        return 'Connected'
      default:
        return 'Connecting...'
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    remoteVideo: {
      flex: 1,
      backgroundColor: '#1a1a1a',
    },
    remoteVideoPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
    },
    avatarLarge: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#2a2a2a',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    statusText: {
      color: '#999',
      fontSize: 18,
    },
    localVideoContainer: {
      position: 'absolute',
      top: insets.top + 80,
      right: 20,
      width: 110,
      height: 150,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
      backgroundColor: '#000',
    },
    localVideo: {
      flex: 1,
    },
    topBar: {
      position: 'absolute',
      top: insets.top + 16,
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    contactName: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    callStatus: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      marginTop: 4,
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    controlsContainer: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    controlButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#2a2a2a',
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlButtonActive: {
      backgroundColor: ColorPalette.brand.primary,
    },
    controlLabel: {
      color: '#fff',
      fontSize: 10,
      marginTop: 2,
    },
    controlLabelActive: {
      color: '#fff',
    },
    endCallButton: {
      backgroundColor: '#ff3b30',
      width: 72,
      height: 72,
      borderRadius: 36,
    },
    endCallLabel: {
      color: '#fff',
    },
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      {/* Remote Video (Full Screen) */}
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
          zOrder={0}
        />
      ) : (
        <View style={styles.remoteVideoPlaceholder}>
          <View style={styles.avatarLarge}>
            <Icon name="user" size={64} color="#999" />
          </View>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      )}

      {/* Local Video (Picture-in-Picture) */}
      {localStream && !isCameraOff && (
        <TouchableOpacity style={styles.localVideoContainer} activeOpacity={0.9}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
            zOrder={1}
          />
        </TouchableOpacity>
      )}

      {/* Top Bar - Contact Info */}
      <View style={styles.topBar}>
        <Text style={styles.contactName}>{contactName}</Text>
        <Text style={styles.callStatus}>{getStatusText()}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          {/* Mute Button */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
            activeOpacity={0.7}
          >
            <Icon
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color="#fff"
            />
            <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
            activeOpacity={0.7}
          >
            <Icon name="phone-off" size={28} color="#fff" />
            <Text style={[styles.controlLabel, styles.endCallLabel]}>End</Text>
          </TouchableOpacity>

          {/* Camera Toggle */}
          <TouchableOpacity
            style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
            onPress={toggleCamera}
            activeOpacity={0.7}
          >
            <Icon
              name={isCameraOff ? 'video-off' : 'video'}
              size={24}
              color="#fff"
            />
            <Text style={[styles.controlLabel, isCameraOff && styles.controlLabelActive]}>
              {isCameraOff ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>

          {/* Switch Camera */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={switchCamera}
            activeOpacity={0.7}
          >
            <Icon name="refresh-cw" size={24} color="#fff" />
            <Text style={styles.controlLabel}>Flip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default VideoCall
