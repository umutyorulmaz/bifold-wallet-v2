/**
 * useThemeRegistry Hook Tests
 *
 * Tests for the theme registry hook that provides access to the theme registry.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-native'

import { useThemeRegistry, useOptionalThemeRegistry } from '../../../../src/modules/theme/hooks/useThemeRegistry'
import { ThemeRegistry } from '../../../../src/modules/theme/registries/ThemeRegistry'
import { ThemeRegistryProvider } from '../../../../src/modules/theme/providers/ThemeRegistryProvider'

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const createWrapper = (registry: ThemeRegistry) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeRegistryProvider registry={registry}>{children}</ThemeRegistryProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('useThemeRegistry Hook', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // useThemeRegistry TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useThemeRegistry()', () => {
    it('should return registry from context', () => {
      const registry = new ThemeRegistry()

      const { result } = renderHook(() => useThemeRegistry(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toBe(registry)
    })

    it('should throw when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useThemeRegistry())
      }).toThrow('useThemeRegistry must be used within a ThemeRegistryProvider')

      consoleSpy.mockRestore()
    })

    it('should allow calling registry methods', () => {
      const registry = new ThemeRegistry()

      const { result } = renderHook(() => useThemeRegistry(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.list()).toEqual([])
      expect(result.current.has('non-existent')).toBe(false)
      expect(result.current.getActiveId()).toBeUndefined()
    })

    it('should provide access to sub-registries', () => {
      const registry = new ThemeRegistry()

      const { result } = renderHook(() => useThemeRegistry(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.getCardThemeRegistry()).toBeDefined()
      expect(result.current.getBackgroundRegistry()).toBeDefined()
      expect(result.current.getTabBarRegistry()).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useOptionalThemeRegistry TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useOptionalThemeRegistry()', () => {
    it('should return registry when inside provider', () => {
      const registry = new ThemeRegistry()

      const { result } = renderHook(() => useOptionalThemeRegistry(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toBe(registry)
    })

    it('should return undefined when outside provider', () => {
      const { result } = renderHook(() => useOptionalThemeRegistry())

      expect(result.current).toBeUndefined()
    })

    it('should not throw when outside provider', () => {
      expect(() => {
        renderHook(() => useOptionalThemeRegistry())
      }).not.toThrow()
    })

    it('should work with optional chaining for safe access', () => {
      const { result } = renderHook(() => {
        const registry = useOptionalThemeRegistry()
        return registry?.getActiveId() ?? 'no-registry'
      })

      expect(result.current).toBe('no-registry')
    })
  })
})
