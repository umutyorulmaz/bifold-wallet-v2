import { useEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAgent } from '@credo-ts/react-hooks'
import { WebRTCEvents } from '@ajna-inc/webrtc'
import type { IncomingOfferEvent } from '@ajna-inc/webrtc'
import { RootStackParams, Screens } from '../types/navigators'

interface UseIncomingCallHandlerOptions {
  /** Whether to handle incoming calls (set to false to disable) */
  enabled?: boolean
  /** Callback when an incoming call is received (before navigation) */
  onIncomingCall?: (event: IncomingOfferEvent) => void
}

/**
 * Global hook to handle incoming WebRTC calls.
 * Should be used in a top-level component (e.g., App or TabStack) to ensure
 * incoming calls are handled regardless of which screen the user is on.
 *
 * @example
 * ```tsx
 * // In your main App or TabStack component:
 * function MainApp() {
 *   useIncomingCallHandler({
 *     enabled: true,
 *     onIncomingCall: (event) => {
 *       console.log('Incoming call from:', event.context.connection?.theirLabel)
 *     },
 *   })
 *
 *   return <Navigator />
 * }
 * ```
 */
export function useIncomingCallHandler(options: UseIncomingCallHandlerOptions = {}) {
  const { enabled = true, onIncomingCall } = options
  const { agent } = useAgent()
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const handledThreadIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!agent || !enabled) return

    // Check if WebRTC module is available
    const agentModules = (agent as any)?.modules
    if (!agentModules?.webrtc) {
      console.warn('[useIncomingCallHandler] WebRTC module not available - incoming calls disabled')
      return
    }

    console.log('[useIncomingCallHandler] Setting up incoming call listener')

    let subscription: any
    try {
      // NOTE: Events are emitted with { type, payload: { thid, sdp, context, ... } } structure
      subscription = agent.events.on(WebRTCEvents.IncomingOffer, ((event: any) => {
        const payload = event.payload || event // Support both payload-wrapped and direct access
        console.log('[useIncomingCallHandler] IncomingOffer event received, payload keys:', Object.keys(payload || {}))

        const connectionId = payload?.context?.connection?.id
        if (!connectionId) {
          console.warn('[useIncomingCallHandler] Received offer without connection ID, payload:', JSON.stringify(payload, null, 2).slice(0, 500))
          return
        }

        // Prevent handling the same offer multiple times
        if (handledThreadIds.current.has(payload.thid)) {
          console.log('[useIncomingCallHandler] Already handled thread:', payload.thid)
          return
        }
        handledThreadIds.current.add(payload.thid)

        // Clean up old thread IDs after 30 seconds
        setTimeout(() => {
          handledThreadIds.current.delete(payload.thid)
        }, 30000)

        console.log('[useIncomingCallHandler] Incoming call from:', payload.context?.connection?.theirLabel)
        console.log('[useIncomingCallHandler] Thread ID:', payload.thid)

        // Call the optional callback with the unwrapped payload
        onIncomingCall?.(payload as IncomingOfferEvent)

        // Navigate to incoming call screen
        navigation.navigate(Screens.IncomingCall, {
          connectionId,
          threadId: payload.thid,
          sdp: payload.sdp,
          callerLabel: payload.context?.connection?.theirLabel,
          iceServers: payload.iceServers,
        })
      }) as any)
    } catch (err) {
      console.error('[useIncomingCallHandler] Error setting up listener:', err)
      return
    }

    return () => {
      console.log('[useIncomingCallHandler] Cleaning up incoming call listener')
      try {
        subscription?.off?.()
      } catch {}
    }
  }, [agent, enabled, navigation, onIncomingCall])
}
