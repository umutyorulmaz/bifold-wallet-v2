import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParams, Screens } from '../types/navigators'

interface UseBackgroundCallDetectionOptions {
  /** Whether to check for calls when app returns to foreground */
  enabled?: boolean
}

/**
 * Hook that detects incoming WebRTC calls when app returns from background.
 *
 * When a push notification wakes the app, this hook:
 * 1. Detects the app coming to foreground
 * 2. Waits briefly for the agent to process incoming messages
 * 3. Checks for any pending WebRTC call invitations
 *
 * This works with mediator push notifications that wake the app but don't
 * contain call details directly.
 */
export function useBackgroundCallDetection(options: UseBackgroundCallDetectionOptions = {}) {
  const { enabled = true } = options
  const { agent } = useAgent()
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const appState = useRef(AppState.currentState)
  const pendingCallCheck = useRef(false)

  useEffect(() => {
    if (!agent || !enabled) return

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App came to foreground from background
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Mark that we should check for calls
        pendingCallCheck.current = true

        // Wait a moment for agent to process any queued messages from mediator
        setTimeout(() => {
          if (pendingCallCheck.current) {
            checkForPendingCalls()
            pendingCallCheck.current = false
          }
        }, 1500) // Give agent time to process incoming messages
      }

      appState.current = nextAppState
    }

    const checkForPendingCalls = () => {
      // Check if WebRTC module is available
      const agentModules = (agent as any)?.modules
      if (!agentModules?.webrtc) {
        return
      }

      // The WebRTC module should emit IncomingOffer events for any pending calls
      // that were received while the app was in background.
      // The useIncomingCallHandler will pick these up.
      //
      // However, if messages were already processed before hook mounted,
      // we can check for active call state in the WebRTC module.
      try {
        const webrtcModule = agentModules.webrtc
        // Some WebRTC implementations have a method to get pending offers
        if (typeof webrtcModule.getPendingOffers === 'function') {
          const pendingOffers = webrtcModule.getPendingOffers()
          if (pendingOffers && pendingOffers.length > 0) {
            const offer = pendingOffers[0]
            navigation.navigate(Screens.IncomingCall, {
              connectionId: offer.connectionId,
              threadId: offer.thid,
              sdp: offer.sdp,
              callerLabel: offer.callerLabel,
              iceServers: offer.iceServers,
            })
          }
        }
      } catch (error) {
        // Silently fail - useIncomingCallHandler should handle live events
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription?.remove()
    }
  }, [agent, enabled, navigation])
}
