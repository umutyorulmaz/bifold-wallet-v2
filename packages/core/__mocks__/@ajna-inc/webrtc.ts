/* eslint-disable @typescript-eslint/no-explicit-any */

// WebRTC event types
export const WebRTCEvents = {
  IncomingPropose: 'IncomingPropose',
  IncomingOffer: 'IncomingOffer',
  IncomingAnswer: 'IncomingAnswer',
  IncomingIce: 'IncomingIce',
  RenegotiateRequested: 'RenegotiateRequested',
  CallEnded: 'CallEnded',
} as const

// Call states
export const CallState = {
  Idle: 'idle',
  Calling: 'calling',
  Ringing: 'ringing',
  Connected: 'connected',
  Ended: 'ended',
} as const

// Mock CallService
export const createMockCallService = () => ({
  startCall: jest.fn().mockResolvedValue('mock-thread-id'),
  acceptCall: jest.fn().mockResolvedValue(undefined),
  endCall: jest.fn().mockResolvedValue(undefined),
  toggleMute: jest.fn().mockReturnValue(false),
  toggleCamera: jest.fn().mockReturnValue(false),
  switchCamera: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn(),
  getLocalStream: jest.fn().mockReturnValue(null),
  getRemoteStream: jest.fn().mockReturnValue(null),
  getCallState: jest.fn().mockReturnValue('idle'),
  on: jest.fn(),
  off: jest.fn(),
})

export const CallService = jest.fn().mockImplementation(() => createMockCallService())

// Helper to create mock WebRTC events
export const createMockIncomingOffer = (options: any = {}) => ({
  type: WebRTCEvents.IncomingOffer,
  payload: {
    connectionId: options.connectionId ?? 'test-connection-id',
    threadId: options.threadId ?? 'test-thread-id',
    thid: options.threadId ?? 'test-thread-id',
    sdp: options.sdp ?? 'mock-sdp-offer',
    callerLabel: options.callerLabel ?? 'Test Caller',
    iceServers: options.iceServers ?? [{ urls: 'stun:stun.l.google.com:19302' }],
  },
})

export const createMockIncomingAnswer = (options: any = {}) => ({
  type: WebRTCEvents.IncomingAnswer,
  payload: {
    connectionId: options.connectionId ?? 'test-connection-id',
    threadId: options.threadId ?? 'test-thread-id',
    thid: options.threadId ?? 'test-thread-id',
    sdp: options.sdp ?? 'mock-sdp-answer',
  },
})

export const createMockIncomingIce = (options: any = {}) => ({
  type: WebRTCEvents.IncomingIce,
  payload: {
    connectionId: options.connectionId ?? 'test-connection-id',
    threadId: options.threadId ?? 'test-thread-id',
    thid: options.threadId ?? 'test-thread-id',
    candidates: options.candidates ?? [
      { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 },
    ],
  },
})

export const createMockCallEnded = (options: any = {}) => ({
  type: WebRTCEvents.CallEnded,
  payload: {
    connectionId: options.connectionId ?? 'test-connection-id',
    threadId: options.threadId ?? 'test-thread-id',
    thid: options.threadId ?? 'test-thread-id',
    reason: options.reason ?? 'ended',
  },
})

export default {
  WebRTCEvents,
  CallState,
  CallService,
  createMockCallService,
  createMockIncomingOffer,
  createMockIncomingAnswer,
  createMockIncomingIce,
  createMockCallEnded,
}
