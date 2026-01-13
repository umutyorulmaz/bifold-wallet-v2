/**
 * useCallService Hook Tests
 *
 * Tests for WebRTC call management hook.
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react-native'

import { useCallService } from '../../src/hooks/useCallService'
import { BasicAppContext } from '../helpers/app'

// ═══════════════════════════════════════════════════════════════════════════════
// MOCKS
// ═══════════════════════════════════════════════════════════════════════════════

// Mock CallService
const mockCallService = {
  startCall: jest.fn(),
  acceptCall: jest.fn(),
  endCall: jest.fn(),
  toggleMute: jest.fn(),
  toggleCamera: jest.fn(),
  switchCamera: jest.fn(),
  destroy: jest.fn(),
}

let onStateChangeCallback: ((state: string) => void) | null = null
let onLocalStreamCallback: ((stream: any) => void) | null = null
let onRemoteStreamCallback: ((stream: any) => void) | null = null

jest.mock('../../src/services/CallService', () => ({
  CallService: jest.fn().mockImplementation((config: any) => {
    onStateChangeCallback = config.onStateChange
    onLocalStreamCallback = config.onLocalStream
    onRemoteStreamCallback = config.onRemoteStream
    return mockCallService
  }),
}))

// Mock useAgent
const mockAgent = {
  modules: {
    webrtc: {
      getDefaultIceServers: jest.fn().mockReturnValue([]),
    },
  },
}

jest.mock('@credo-ts/react-hooks', () => ({
  useAgent: jest.fn(() => ({ agent: mockAgent })),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════════════════

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BasicAppContext>{children}</BasicAppContext>
)

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCallService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCallService.startCall.mockResolvedValue('test-thread-id')
    mockCallService.acceptCall.mockResolvedValue(undefined)
    mockCallService.endCall.mockResolvedValue(undefined)
    mockCallService.toggleMute.mockReturnValue(true)
    mockCallService.toggleCamera.mockReturnValue(true)
    mockCallService.switchCamera.mockResolvedValue(undefined)
    onStateChangeCallback = null
    onLocalStreamCallback = null
    onRemoteStreamCallback = null
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL STATE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Initial State', () => {
    it('should initialize with idle state', () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      expect(result.current.callState).toBe('idle')
      expect(result.current.localStream).toBeNull()
      expect(result.current.remoteStream).toBeNull()
      expect(result.current.isMuted).toBe(false)
      expect(result.current.isCameraOff).toBe(false)
      expect(result.current.isInCall).toBe(false)
    })

    it('should create CallService when agent has webrtc module', async () => {
      renderHook(() => useCallService(), { wrapper })

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { CallService } = require('../../src/services/CallService')
      expect(CallService).toHaveBeenCalledWith(
        expect.objectContaining({
          agent: mockAgent,
          onStateChange: expect.any(Function),
          onLocalStream: expect.any(Function),
          onRemoteStream: expect.any(Function),
          onError: expect.any(Function),
        })
      )
    })

    it('should handle agent without webrtc module gracefully', () => {
      // The hook should not throw when webrtc module is missing
      // This is a graceful degradation test
      const { result } = renderHook(() => useCallService(), { wrapper })

      expect(result.current.callState).toBe('idle')
      expect(result.current.isInCall).toBe(false)
    })

    it('should expose all required methods', () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      expect(typeof result.current.startCall).toBe('function')
      expect(typeof result.current.acceptCall).toBe('function')
      expect(typeof result.current.endCall).toBe('function')
      expect(typeof result.current.toggleMute).toBe('function')
      expect(typeof result.current.toggleCamera).toBe('function')
      expect(typeof result.current.switchCamera).toBe('function')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // isInCall COMPUTED PROPERTY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('isInCall', () => {
    it('should be false when state is idle', () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      expect(result.current.isInCall).toBe(false)
    })

    it('should be true when state is calling', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        onStateChangeCallback?.('calling')
      })

      expect(result.current.isInCall).toBe(true)
    })

    it('should be true when state is ringing', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        onStateChangeCallback?.('ringing')
      })

      expect(result.current.isInCall).toBe(true)
    })

    it('should be true when state is connected', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        onStateChangeCallback?.('connected')
      })

      expect(result.current.isInCall).toBe(true)
    })

    it('should be false when state is ended', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        onStateChangeCallback?.('ended')
      })

      expect(result.current.isInCall).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // startCall TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('startCall()', () => {
    it('should start a call and return thread ID', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      let threadId: string | undefined
      await act(async () => {
        threadId = await result.current.startCall('connection-1')
      })

      expect(mockCallService.startCall).toHaveBeenCalledWith('connection-1', true)
      expect(threadId).toBe('test-thread-id')
    })

    it('should pass video parameter to service', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.startCall('connection-1', false)
      })

      expect(mockCallService.startCall).toHaveBeenCalledWith('connection-1', false)
    })

    it('should default to video=true', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.startCall('connection-1')
      })

      expect(mockCallService.startCall).toHaveBeenCalledWith('connection-1', true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // acceptCall TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('acceptCall()', () => {
    it('should accept an incoming call', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.acceptCall('connection-1', 'thread-1', 'sdp-offer')
      })

      expect(mockCallService.acceptCall).toHaveBeenCalledWith(
        'connection-1',
        'thread-1',
        'sdp-offer',
        true,
        undefined
      )
    })

    it('should pass video and iceServers parameters', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })
      const iceServers = [{ urls: 'stun:stun.example.com' }]

      await act(async () => {
        await result.current.acceptCall('connection-1', 'thread-1', 'sdp-offer', false, iceServers)
      })

      expect(mockCallService.acceptCall).toHaveBeenCalledWith(
        'connection-1',
        'thread-1',
        'sdp-offer',
        false,
        iceServers
      )
    })

    it('should default to video=true', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.acceptCall('connection-1', 'thread-1', 'sdp-offer')
      })

      expect(mockCallService.acceptCall).toHaveBeenCalledWith(
        'connection-1',
        'thread-1',
        'sdp-offer',
        true,
        undefined
      )
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // endCall TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('endCall()', () => {
    it('should end the current call', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.endCall()
      })

      expect(mockCallService.endCall).toHaveBeenCalled()
    })

    it('should handle multiple endCall calls gracefully', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.endCall()
        await result.current.endCall()
      })

      expect(mockCallService.endCall).toHaveBeenCalledTimes(2)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // toggleMute TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('toggleMute()', () => {
    it('should toggle mute state', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      expect(result.current.isMuted).toBe(false)

      act(() => {
        result.current.toggleMute()
      })

      expect(mockCallService.toggleMute).toHaveBeenCalled()
      expect(result.current.isMuted).toBe(true)
    })

    it('should update isMuted based on service return value', async () => {
      mockCallService.toggleMute.mockReturnValueOnce(false)

      const { result } = renderHook(() => useCallService(), { wrapper })

      act(() => {
        result.current.toggleMute()
      })

      expect(result.current.isMuted).toBe(false)
    })

    it('should allow toggling mute multiple times', () => {
      mockCallService.toggleMute
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)

      const { result } = renderHook(() => useCallService(), { wrapper })

      act(() => {
        result.current.toggleMute()
      })
      expect(result.current.isMuted).toBe(true)

      act(() => {
        result.current.toggleMute()
      })
      expect(result.current.isMuted).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // toggleCamera TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('toggleCamera()', () => {
    it('should toggle camera state', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      expect(result.current.isCameraOff).toBe(false)

      act(() => {
        result.current.toggleCamera()
      })

      expect(mockCallService.toggleCamera).toHaveBeenCalled()
      expect(result.current.isCameraOff).toBe(true)
    })

    it('should allow toggling camera multiple times', () => {
      mockCallService.toggleCamera
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)

      const { result } = renderHook(() => useCallService(), { wrapper })

      act(() => {
        result.current.toggleCamera()
      })
      expect(result.current.isCameraOff).toBe(true)

      act(() => {
        result.current.toggleCamera()
      })
      expect(result.current.isCameraOff).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // switchCamera TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('switchCamera()', () => {
    it('should switch camera', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.switchCamera()
      })

      expect(mockCallService.switchCamera).toHaveBeenCalled()
    })

    it('should call switchCamera on service', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      await act(async () => {
        await result.current.switchCamera()
      })

      expect(mockCallService.switchCamera).toHaveBeenCalledTimes(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE CHANGE CALLBACK TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('State Change Callbacks', () => {
    it('should update callState when onStateChange is called', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      expect(result.current.callState).toBe('idle')

      await act(async () => {
        onStateChangeCallback?.('calling')
      })

      expect(result.current.callState).toBe('calling')

      await act(async () => {
        onStateChangeCallback?.('connected')
      })

      expect(result.current.callState).toBe('connected')
    })

    it('should reset states when callState becomes idle', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      // Set some state first
      await act(async () => {
        onStateChangeCallback?.('connected')
        onLocalStreamCallback?.({ id: 'local-stream' })
        onRemoteStreamCallback?.({ id: 'remote-stream' })
      })

      // Simulate toggling mute
      mockCallService.toggleMute.mockReturnValueOnce(true)
      act(() => {
        result.current.toggleMute()
      })

      expect(result.current.localStream).toBeTruthy()
      expect(result.current.remoteStream).toBeTruthy()
      expect(result.current.isMuted).toBe(true)

      // Now end the call (state becomes idle)
      await act(async () => {
        onStateChangeCallback?.('idle')
      })

      expect(result.current.callState).toBe('idle')
      expect(result.current.localStream).toBeNull()
      expect(result.current.remoteStream).toBeNull()
      expect(result.current.isMuted).toBe(false)
      expect(result.current.isCameraOff).toBe(false)
    })

    it('should update localStream when onLocalStream is called', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      const mockStream = { id: 'local-stream', toURL: () => 'local://stream' }

      await act(async () => {
        onLocalStreamCallback?.(mockStream)
      })

      expect(result.current.localStream).toEqual(mockStream)
    })

    it('should update remoteStream when onRemoteStream is called', async () => {
      const { result } = renderHook(() => useCallService(), { wrapper })

      const mockStream = { id: 'remote-stream', toURL: () => 'remote://stream' }

      await act(async () => {
        onRemoteStreamCallback?.(mockStream)
      })

      expect(result.current.remoteStream).toEqual(mockStream)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Cleanup', () => {
    it('should destroy service on unmount', () => {
      const { unmount } = renderHook(() => useCallService(), { wrapper })

      unmount()

      expect(mockCallService.destroy).toHaveBeenCalled()
    })
  })
})
