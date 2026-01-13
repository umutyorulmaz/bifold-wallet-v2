/**
 * useScreenBackground Hook Tests
 *
 * Tests for the screen background hooks.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-native'

import {
  useScreenBackground,
  useBackgroundById,
  useBackgrounds,
} from '../../../../src/modules/theme/hooks/useScreenBackground'
import { ThemeRegistry } from '../../../../src/modules/theme/registries/ThemeRegistry'
import { ThemeRegistryProvider } from '../../../../src/modules/theme/providers/ThemeRegistryProvider'
import { IBackgroundConfig, IScreenBackgrounds } from '../../../../src/modules/theme/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════════

const homeBg: IBackgroundConfig = {
  id: 'home-bg',
  type: 'gradient',
  gradient: {
    type: 'linear',
    colors: ['#0D2828', '#1A4A4A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
}

const credentialsBg: IBackgroundConfig = {
  id: 'credentials-bg',
  type: 'solid',
  color: '#1A1A1A',
}

const settingsBg: IBackgroundConfig = {
  id: 'settings-bg',
  type: 'solid',
  color: '#2A2A2A',
}

const screenMapping: IScreenBackgrounds = {
  Home: 'home-bg',
  Credentials: 'credentials-bg',
  Settings: 'settings-bg',
}

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

const createRegistryWithBackgrounds = (): ThemeRegistry => {
  const registry = new ThemeRegistry()
  registry.setBackgrounds([homeBg, credentialsBg, settingsBg])
  registry.setScreenBackgrounds(screenMapping)
  return registry
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('useScreenBackground Hooks', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // useScreenBackground TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useScreenBackground()', () => {
    describe('without registry', () => {
      it('should return default background when no registry available', () => {
        const { result } = renderHook(() => useScreenBackground('Home'))

        expect(result.current.id).toBe('default')
        expect(result.current.type).toBe('solid')
        expect(result.current.color).toBe('#000000')
      })

      it('should return same default for any screen ID', () => {
        const { result: result1 } = renderHook(() => useScreenBackground('Home'))
        const { result: result2 } = renderHook(() => useScreenBackground('Settings'))
        const { result: result3 } = renderHook(() => useScreenBackground('Unknown'))

        expect(result1.current.id).toBe('default')
        expect(result2.current.id).toBe('default')
        expect(result3.current.id).toBe('default')
      })
    })

    describe('with registry', () => {
      it('should return mapped background for screen', () => {
        const registry = createRegistryWithBackgrounds()

        const { result } = renderHook(() => useScreenBackground('Home'), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('home-bg')
        expect(result.current.type).toBe('gradient')
      })

      it('should return credentials background', () => {
        const registry = createRegistryWithBackgrounds()

        const { result } = renderHook(() => useScreenBackground('Credentials'), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('credentials-bg')
        expect(result.current.color).toBe('#1A1A1A')
      })

      it('should return settings background', () => {
        const registry = createRegistryWithBackgrounds()

        const { result } = renderHook(() => useScreenBackground('Settings'), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('settings-bg')
      })

      it('should return default for unmapped screen', () => {
        const registry = createRegistryWithBackgrounds()

        const { result } = renderHook(() => useScreenBackground('UnmappedScreen'), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('default')
      })

      it('should handle empty screen ID', () => {
        const registry = createRegistryWithBackgrounds()

        const { result } = renderHook(() => useScreenBackground(''), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('default')
      })
    })

    describe('memoization', () => {
      it('should return same object for same screen ID', () => {
        const registry = createRegistryWithBackgrounds()

        const { result, rerender } = renderHook(() => useScreenBackground('Home'), {
          wrapper: createWrapper(registry),
        })

        const firstResult = result.current

        rerender({})

        expect(result.current).toBe(firstResult)
      })

      it('should return new background when screen ID changes', () => {
        const registry = createRegistryWithBackgrounds()

        const { result, rerender } = renderHook(
          ({ screenId }) => useScreenBackground(screenId),
          {
            wrapper: createWrapper(registry),
            initialProps: { screenId: 'Home' },
          }
        )

        expect(result.current.id).toBe('home-bg')

        rerender({ screenId: 'Credentials' })

        expect(result.current.id).toBe('credentials-bg')
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useBackgroundById TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useBackgroundById()', () => {
    it('should return default background when no registry', () => {
      const { result } = renderHook(() => useBackgroundById('home-bg'))

      expect(result.current.id).toBe('default')
    })

    it('should return background by ID', () => {
      const registry = createRegistryWithBackgrounds()

      const { result } = renderHook(() => useBackgroundById('home-bg'), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.id).toBe('home-bg')
      expect(result.current.type).toBe('gradient')
    })

    it('should return default for non-existent ID', () => {
      const registry = createRegistryWithBackgrounds()

      const { result } = renderHook(() => useBackgroundById('non-existent'), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.id).toBe('default')
    })

    it('should update when ID changes', () => {
      const registry = createRegistryWithBackgrounds()

      const { result, rerender } = renderHook(({ id }) => useBackgroundById(id), {
        wrapper: createWrapper(registry),
        initialProps: { id: 'home-bg' },
      })

      expect(result.current.id).toBe('home-bg')

      rerender({ id: 'credentials-bg' })

      expect(result.current.id).toBe('credentials-bg')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useBackgrounds TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useBackgrounds()', () => {
    it('should return array with default background when no registry', () => {
      const { result } = renderHook(() => useBackgrounds())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].id).toBe('default')
    })

    it('should return all registered backgrounds', () => {
      const registry = createRegistryWithBackgrounds()

      const { result } = renderHook(() => useBackgrounds(), {
        wrapper: createWrapper(registry),
      })

      // 3 custom + 1 default
      expect(result.current).toHaveLength(4)
      expect(result.current.map((b) => b.id)).toContain('home-bg')
      expect(result.current.map((b) => b.id)).toContain('credentials-bg')
      expect(result.current.map((b) => b.id)).toContain('settings-bg')
      expect(result.current.map((b) => b.id)).toContain('default')
    })

    it('should include different background types', () => {
      const registry = createRegistryWithBackgrounds()

      const { result } = renderHook(() => useBackgrounds(), {
        wrapper: createWrapper(registry),
      })

      const gradientBg = result.current.find((b) => b.type === 'gradient')
      const solidBg = result.current.find((b) => b.type === 'solid')

      expect(gradientBg).toBeDefined()
      expect(solidBg).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should work with image backgrounds', () => {
      const registry = new ThemeRegistry()
      const imageBg: IBackgroundConfig = {
        id: 'hero-image',
        type: 'image',
        source: 'https://example.com/hero.jpg',
        resizeMode: 'cover',
      }
      registry.setBackgrounds([imageBg])
      registry.setScreenBackgrounds({ Hero: 'hero-image' })

      const { result } = renderHook(() => useScreenBackground('Hero'), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.type).toBe('image')
      expect(result.current.source).toBe('https://example.com/hero.jpg')
    })

    it('should work with gradient backgrounds', () => {
      const registry = new ThemeRegistry()
      const gradientBg: IBackgroundConfig = {
        id: 'sunset',
        type: 'gradient',
        gradient: {
          type: 'linear',
          colors: ['#FF6B6B', '#FFA500', '#FFD93D'],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        },
      }
      registry.setBackgrounds([gradientBg])
      registry.setScreenBackgrounds({ Sunset: 'sunset' })

      const { result } = renderHook(() => useScreenBackground('Sunset'), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.type).toBe('gradient')
      expect(result.current.gradient?.colors).toEqual(['#FF6B6B', '#FFA500', '#FFD93D'])
    })
  })
})
