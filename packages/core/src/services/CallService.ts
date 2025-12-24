import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc'
import { WebRTCEvents } from '@ajna-inc/webrtc'
import type { BifoldAgent } from '../utils/agent'

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

export interface CallServiceOptions {
  agent: BifoldAgent
  onStateChange?: (state: CallState) => void
  onLocalStream?: (stream: MediaStream) => void
  onRemoteStream?: (stream: MediaStream) => void
  onError?: (error: Error) => void
}

export class CallService {
  private agent: BifoldAgent
  // Using 'any' because react-native-webrtc types don't include all WebRTC event handlers
  private pc: any = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private connectionId: string | null = null
  private threadId: string | null = null
  private state: CallState = 'idle'
  private eventSubscriptions: (() => void)[] = []
  private pendingIceCandidates: any[] = []
  private hasRemoteDescription = false

  private onStateChange?: (state: CallState) => void
  private onLocalStream?: (stream: MediaStream) => void
  private onRemoteStream?: (stream: MediaStream) => void
  private onError?: (error: Error) => void

  constructor(options: CallServiceOptions) {
    this.agent = options.agent
    this.onStateChange = options.onStateChange
    this.onLocalStream = options.onLocalStream
    this.onRemoteStream = options.onRemoteStream
    this.onError = options.onError

    // Validate agent has webrtc module
    if (!this.agent?.modules?.webrtc) {
      console.error('[CallService] WebRTC module not available on agent')
      throw new Error('WebRTC module not configured in agent')
    }

    this.subscribeToEvents()
  }

  private subscribeToEvents() {
    try {
      // Subscribe to WebRTC events from agent
      // NOTE: Events are emitted with { type, payload: { thid, sdp, ... } } structure
      const answerSub = this.agent.events.on(WebRTCEvents.IncomingAnswer, async (event: any) => {
        const payload = event.payload || event // Support both payload-wrapped and direct access
        console.log('[CallService] IncomingAnswer event received, threadId:', payload?.thid, 'myThreadId:', this.threadId)
        if (payload?.thid === this.threadId && this.pc) {
          try {
            console.log('[CallService] Received answer for thread:', payload.thid, 'SDP length:', payload.sdp?.length)
            await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: payload.sdp }))
            this.hasRemoteDescription = true
            await this.processPendingIceCandidates()
            this.setState('connected')
          } catch (err) {
            console.error('[CallService] Error setting remote description:', err)
            this.onError?.(err as Error)
          }
        }
      })

      const iceSub = this.agent.events.on(WebRTCEvents.IncomingIce, async (event: any) => {
        const payload = event.payload || event // Support both payload-wrapped and direct access
        if (payload?.thid === this.threadId && this.pc) {
          try {
            if (payload.candidate && !payload.endOfCandidates) {
              const candidate = new RTCIceCandidate(payload.candidate as any)
              if (this.hasRemoteDescription) {
                console.log('[CallService] Adding ICE candidate')
                await this.pc.addIceCandidate(candidate)
              } else {
                console.log('[CallService] Buffering ICE candidate (no remote description yet)')
                this.pendingIceCandidates.push(candidate)
              }
            }
          } catch (err) {
            console.error('[CallService] Error adding ICE candidate:', err)
          }
        }
      })

      const endSub = this.agent.events.on(WebRTCEvents.CallEnded, (event: any) => {
        const payload = event.payload || event // Support both payload-wrapped and direct access
        if (payload?.thid === this.threadId) {
          console.log('[CallService] Call ended by remote')
          this.cleanup()
        }
      })

      this.eventSubscriptions = [
        () => { try { (answerSub as any)?.off?.() } catch {} },
        () => { try { (iceSub as any)?.off?.() } catch {} },
        () => { try { (endSub as any)?.off?.() } catch {} },
      ]
    } catch (err) {
      console.error('[CallService] Error subscribing to events:', err)
      this.onError?.(err as Error)
    }
  }

  private async processPendingIceCandidates() {
    if (this.pendingIceCandidates.length > 0 && this.pc) {
      console.log('[CallService] Processing', this.pendingIceCandidates.length, 'buffered ICE candidates')
      for (const candidate of this.pendingIceCandidates) {
        try {
          await this.pc.addIceCandidate(candidate)
        } catch (err) {
          console.error('[CallService] Error adding buffered ICE candidate:', err)
        }
      }
      this.pendingIceCandidates = []
    }
  }

  private setState(newState: CallState) {
    console.log('[CallService] State change:', this.state, '->', newState)
    this.state = newState
    this.onStateChange?.(newState)
  }

  getState(): CallState {
    return this.state
  }

  async startCall(connectionId: string, video: boolean = true): Promise<string> {
    console.log('[CallService] Starting call to:', connectionId, 'video:', video)
    this.connectionId = connectionId
    this.threadId = this.generateUUID()
    this.setState('calling')
    this.hasRemoteDescription = false
    this.pendingIceCandidates = []

    try {
      // Get local media
      this.localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user' } : false,
      }) as MediaStream
      console.log('[CallService] Got local stream with tracks:', this.localStream.getTracks().map((t: any) => t.kind))
      this.onLocalStream?.(this.localStream)

      // Create peer connection with ICE servers from module
      const iceServers = this.agent.modules.webrtc.getDefaultIceServers()
      console.log('[CallService] Using ICE servers:', iceServers)
      this.pc = new RTCPeerConnection({ iceServers })

      // Add local tracks
      this.localStream.getTracks().forEach((track: any) => {
        console.log('[CallService] Adding local track:', track.kind, 'enabled:', track.enabled)
        this.pc!.addTrack(track, this.localStream!)
      })
      console.log('[CallService] Added', this.localStream.getTracks().length, 'local tracks to peer connection')

      // Handle remote tracks (for startCall - we're the caller)
      this.pc.ontrack = (event: any) => {
        console.log('[CallService] ===== ONTRACK EVENT (startCall - caller) =====')
        console.log('[CallService] Track kind:', event.track?.kind, 'id:', event.track?.id)

        if (event.streams && event.streams[0]) {
          const stream = event.streams[0]
          this.remoteStream = stream
          this.onRemoteStream?.(this.remoteStream!)
        } else if (event.track) {
          // Fallback: create stream from track if no stream provided
          if (!this.remoteStream) {
            this.remoteStream = new MediaStream() as any
          }
          (this.remoteStream as any).addTrack(event.track)
          this.onRemoteStream?.(this.remoteStream!)
        }
      }

      // Handle ICE candidates
      this.pc.onicecandidate = async (event: any) => {
        if (event.candidate) {
          console.log('[CallService] Local ICE candidate:', event.candidate.type, event.candidate.protocol)
          try {
            await this.agent.modules.webrtc.sendIce({
              connectionId: this.connectionId!,
              threadId: this.threadId!,
              candidate: event.candidate.toJSON(),
            })
          } catch (err) {
            console.error('[CallService] Error sending ICE candidate:', err)
          }
        } else {
          console.log('[CallService] ICE gathering complete')
          await this.agent.modules.webrtc.sendIce({
            connectionId: this.connectionId!,
            threadId: this.threadId!,
            endOfCandidates: true,
          })
        }
      }

      // Monitor ICE connection state
      this.pc.oniceconnectionstatechange = () => {
        console.log('[CallService] ICE connection state:', this.pc?.iceConnectionState)
        if (this.pc?.iceConnectionState === 'connected' || this.pc?.iceConnectionState === 'completed') {
          this.setState('connected')
        } else if (this.pc?.iceConnectionState === 'failed') {
          console.error('[CallService] ICE connection failed')
          this.onError?.(new Error('ICE connection failed'))
        }
      }

      // Monitor overall connection state
      this.pc.onconnectionstatechange = () => {
        console.log('[CallService] Connection state:', this.pc?.connectionState)
        if (this.pc?.connectionState === 'connected') {
          this.setState('connected')
        } else if (this.pc?.connectionState === 'failed') {
          this.cleanup()
        }
      }

      // Create and send offer
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: video,
      })
      console.log('[CallService] Created offer')
      await this.pc.setLocalDescription(offer)

      await this.agent.modules.webrtc.startCall({
        connectionId,
        threadId: this.threadId,
        sdp: offer.sdp!,
        iceServers: iceServers as any, // Send ICE servers so callee can use TURN
      })
      console.log('[CallService] Sent offer via DIDComm')

      return this.threadId
    } catch (err) {
      console.error('[CallService] Error starting call:', err)
      this.cleanup()
      throw err
    }
  }

  async acceptCall(connectionId: string, threadId: string, remoteSdp: string, video: boolean = true, callerIceServers?: Array<{ urls: string | string[]; username?: string; credential?: string }>): Promise<void> {
    console.log('[CallService] Accepting call from:', connectionId, 'thread:', threadId)
    this.connectionId = connectionId
    this.threadId = threadId
    this.setState('ringing')
    this.hasRemoteDescription = false
    this.pendingIceCandidates = []

    try {
      // Get local media
      this.localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user' } : false,
      }) as MediaStream
      this.onLocalStream?.(this.localStream)

      // Create peer connection - use caller's ICE servers if provided (includes TURN)
      const defaultIceServers = this.agent.modules.webrtc.getDefaultIceServers()
      const iceServers = callerIceServers && callerIceServers.length > 0 ? callerIceServers : defaultIceServers
      this.pc = new RTCPeerConnection({ iceServers })

      // Add local tracks
      this.localStream.getTracks().forEach((track: any) => {
        this.pc!.addTrack(track, this.localStream!)
      })

      // Handle remote tracks (for acceptCall - we're the callee)
      this.pc.ontrack = (event: any) => {
        console.log('[CallService] ===== ONTRACK EVENT (acceptCall - callee) =====')

        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0]
          this.onRemoteStream?.(this.remoteStream!)
        } else if (event.track) {
          if (!this.remoteStream) {
            this.remoteStream = new MediaStream() as any
          }
          (this.remoteStream as any).addTrack(event.track)
          this.onRemoteStream?.(this.remoteStream!)
        }
      }

      // Handle ICE candidates
      this.pc.onicecandidate = async (event: any) => {
        if (event.candidate) {
          try {
            await this.agent.modules.webrtc.sendIce({
              connectionId: this.connectionId!,
              threadId: this.threadId!,
              candidate: event.candidate.toJSON(),
            })
          } catch (err) {
            console.error('[CallService] Error sending ICE candidate:', err)
          }
        } else {
          await this.agent.modules.webrtc.sendIce({
            connectionId: this.connectionId!,
            threadId: this.threadId!,
            endOfCandidates: true,
          })
        }
      }

      // Monitor connection state
      this.pc.oniceconnectionstatechange = () => {
        console.log('[CallService] ICE connection state:', this.pc?.iceConnectionState)
        if (this.pc?.iceConnectionState === 'connected' || this.pc?.iceConnectionState === 'completed') {
          this.setState('connected')
        } else if (this.pc?.iceConnectionState === 'failed') {
          this.onError?.(new Error('ICE connection failed'))
        }
      }

      this.pc.onconnectionstatechange = () => {
        console.log('[CallService] Connection state:', this.pc?.connectionState)
        if (this.pc?.connectionState === 'failed') {
          this.cleanup()
        }
      }

      // Set remote description (offer)
      await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: remoteSdp }))
      this.hasRemoteDescription = true
      await this.processPendingIceCandidates()

      // Create and send answer
      const answer = await this.pc.createAnswer()
      await this.pc.setLocalDescription(answer)

      await this.agent.modules.webrtc.acceptCall({
        connectionId,
        threadId,
        sdp: answer.sdp!,
      })
      console.log('[CallService] Sent answer via DIDComm, threadId:', threadId)
    } catch (err) {
      console.error('[CallService] Error accepting call:', err)
      this.cleanup()
      throw err
    }
  }

  async endCall(): Promise<void> {
    console.log('[CallService] Ending call')
    if (this.connectionId && this.threadId) {
      try {
        await this.agent.modules.webrtc.endCall({
          connectionId: this.connectionId,
          threadId: this.threadId,
          reason: 'hangup',
        })
      } catch (err) {
        console.error('[CallService] Error sending end call:', err)
      }
    }
    this.cleanup()
  }

  toggleMute(): boolean {
    const audioTrack = this.localStream?.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      console.log('[CallService] Audio muted:', !audioTrack.enabled)
      return !audioTrack.enabled
    }
    return false
  }

  toggleCamera(): boolean {
    const videoTrack = this.localStream?.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      console.log('[CallService] Camera off:', !videoTrack.enabled)
      return !videoTrack.enabled
    }
    return false
  }

  async switchCamera(): Promise<void> {
    const videoTrack = this.localStream?.getVideoTracks()[0] as any
    if (videoTrack && typeof videoTrack._switchCamera === 'function') {
      console.log('[CallService] Switching camera')
      await videoTrack._switchCamera()
    }
  }

  private cleanup() {
    console.log('[CallService] Cleanup')
    this.setState('ended')

    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((t: any) => {
        try { t.stop() } catch {}
      })
      this.localStream = null
    }

    // Close peer connection
    if (this.pc) {
      try { this.pc.close() } catch {}
      this.pc = null
    }

    this.remoteStream = null
    this.connectionId = null
    this.threadId = null
    this.hasRemoteDescription = false
    this.pendingIceCandidates = []

    // Reset to idle after cleanup
    setTimeout(() => this.setState('idle'), 100)
  }

  destroy() {
    console.log('[CallService] Destroy')
    this.eventSubscriptions.forEach((unsub) => unsub())
    this.eventSubscriptions = []
    this.cleanup()
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
}
