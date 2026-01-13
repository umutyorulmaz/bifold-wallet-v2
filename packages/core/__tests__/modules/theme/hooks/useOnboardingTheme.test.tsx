/**
 * useOnboardingTheme Hook Tests
 *
 * Tests for the onboarding theme hooks.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-native'

import {
  useOnboardingTheme,
  useIsModularOnboardingActive,
} from '../../../../src/modules/theme/hooks/useOnboardingTheme'
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

describe('useOnboardingTheme Hooks', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // useOnboardingTheme TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useOnboardingTheme()', () => {
    it('should return onboarding theme object', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current).toBeDefined()
      expect(typeof result.current).toBe('object')
    })

    it('should include card theme configuration', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.card).toBeDefined()
    })

    it('should include toggle theme configuration', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.toggle).toBeDefined()
    })

    it('should include checkbox theme configuration', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.checkbox).toBeDefined()
    })

    it('should include bullet list theme configuration', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.bulletList).toBeDefined()
    })

    it('should include unlock screen theme configuration', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.unlockScreen).toBeDefined()
    })

    it('should include terms content theme configuration', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.termsContent).toBeDefined()
    })

    it('should include PIN text field theme configuration', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.pinTextField).toBeDefined()
    })

    it('should include button themes', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.buttons).toBeDefined()
    })

    it('should include input themes', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.inputs).toBeDefined()
    })

    it('should include color palette', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      expect(result.current.colors).toBeDefined()
    })

    it('should return same object when re-rendered (memoization)', () => {
      const { result, rerender } = renderHook(() => useOnboardingTheme())

      const firstResult = result.current

      rerender({})

      expect(result.current).toBe(firstResult)
    })

    it('should work without registry', () => {
      const { result } = renderHook(() => useOnboardingTheme())

      // Should not throw and return valid theme
      expect(result.current.card).toBeDefined()
      expect(result.current.buttons).toBeDefined()
    })

    it('should work with registry', () => {
      const registry = new ThemeRegistry()

      const { result } = renderHook(() => useOnboardingTheme(), {
        wrapper: createWrapper(registry),
      })

      // Should return same default theme (for now)
      expect(result.current.card).toBeDefined()
      expect(result.current.buttons).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useIsModularOnboardingActive TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useIsModularOnboardingActive()', () => {
    it('should return false when no registry available', () => {
      const { result } = renderHook(() => useIsModularOnboardingActive())

      expect(result.current).toBe(false)
    })

    it('should return true when registry is available', () => {
      const registry = new ThemeRegistry()

      const { result } = renderHook(() => useIsModularOnboardingActive(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toBe(true)
    })

    it('should be useful for conditional rendering', () => {
      const registry = new ThemeRegistry()

      // Simulate component that conditionally uses modular theme
      const useConditionalTheme = () => {
        const isModular = useIsModularOnboardingActive()
        const theme = useOnboardingTheme()

        return {
          isModular,
          buttonStyle: isModular ? theme.buttons : null,
        }
      }

      const { result } = renderHook(() => useConditionalTheme(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.isModular).toBe(true)
      expect(result.current.buttonStyle).toBeDefined()
    })

    it('should handle legacy mode gracefully', () => {
      // Without registry - legacy mode
      const useConditionalTheme = () => {
        const isModular = useIsModularOnboardingActive()
        const theme = useOnboardingTheme()

        return {
          isModular,
          // Should still have access to default theme even in legacy mode
          hasTheme: !!theme,
        }
      }

      const { result } = renderHook(() => useConditionalTheme())

      expect(result.current.isModular).toBe(false)
      expect(result.current.hasTheme).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should provide complete onboarding theming solution', () => {
      const registry = new ThemeRegistry()

      const { result } = renderHook(
        () => ({
          isActive: useIsModularOnboardingActive(),
          theme: useOnboardingTheme(),
        }),
        { wrapper: createWrapper(registry) }
      )

      expect(result.current.isActive).toBe(true)
      expect(result.current.theme.card).toBeDefined()
      expect(result.current.theme.toggle).toBeDefined()
      expect(result.current.theme.checkbox).toBeDefined()
      expect(result.current.theme.buttons).toBeDefined()
      expect(result.current.theme.inputs).toBeDefined()
      expect(result.current.theme.colors).toBeDefined()
    })
  })
})
