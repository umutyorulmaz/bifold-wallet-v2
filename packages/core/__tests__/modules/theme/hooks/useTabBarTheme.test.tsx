/**
 * useTabBarTheme Hook Tests
 *
 * Tests for the tab bar theme hooks.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-native'

import {
  useTabBarTheme,
  useTabBarStyle,
  useTabBarVariant,
  useTabBarVariants,
} from '../../../../src/modules/theme/hooks/useTabBarTheme'
import { ThemeRegistry } from '../../../../src/modules/theme/registries/ThemeRegistry'
import { ThemeRegistryProvider } from '../../../../src/modules/theme/providers/ThemeRegistryProvider'
import { ITabBarConfig } from '../../../../src/modules/theme/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════════

const floatingTabBarConfig: ITabBarConfig = {
  variant: 'floating',
  variants: {
    default: {
      height: 80,
      backgroundColor: '#313132',
    },
    floating: {
      position: 'absolute',
      bottom: 20,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#0D2828',
    },
    minimal: {
      height: 56,
      backgroundColor: 'transparent',
    },
    attached: {
      position: 'absolute',
      bottom: 0,
      height: 80,
      backgroundColor: '#313132',
    },
  },
  style: {
    position: 'absolute',
    bottom: 20,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0D2828',
  },
  tabItem: {
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 10, fontWeight: 'bold' },
    icon: { size: 24 },
  },
  colors: {
    activeTintColor: '#FFFFFF',
    inactiveTintColor: '#666666',
    activeBackgroundColor: 'transparent',
    inactiveBackgroundColor: 'transparent',
  },
  badge: {
    backgroundColor: '#EF4444',
    textColor: '#FFFFFF',
    size: 18,
    fontSize: 11,
    fontWeight: 'bold',
    borderRadius: 9,
    minWidth: 18,
    position: { top: -2, right: -6 },
  },
  tabs: [
    { id: 'home', label: 'Home', labelKey: 'Tab.Home', icon: 'home' },
    { id: 'wallet', label: 'Wallet', labelKey: 'Tab.Wallet', icon: 'wallet' },
    { id: 'settings', label: 'Settings', labelKey: 'Tab.Settings', icon: 'cog' },
  ],
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

const createRegistryWithTabBar = (): ThemeRegistry => {
  const registry = new ThemeRegistry()
  registry.setTabBarConfig(floatingTabBarConfig)
  return registry
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('useTabBarTheme Hooks', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // useTabBarTheme TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useTabBarTheme()', () => {
    describe('without registry', () => {
      it('should return default tab bar config when no registry', () => {
        const { result } = renderHook(() => useTabBarTheme())

        expect(result.current.variant).toBe('default')
        expect(result.current.style).toBeDefined()
        expect(result.current.tabItem).toBeDefined()
        expect(result.current.colors).toBeDefined()
        expect(result.current.badge).toBeDefined()
      })

      it('should have default style values', () => {
        const { result } = renderHook(() => useTabBarTheme())

        expect(result.current.style.height).toBe(80)
        expect(result.current.style.backgroundColor).toBe('#313132')
      })

      it('should have default colors', () => {
        const { result } = renderHook(() => useTabBarTheme())

        expect(result.current.colors.activeTintColor).toBe('#FFFFFF')
        expect(result.current.colors.inactiveTintColor).toBe('#FFFFFF66')
      })
    })

    describe('with registry', () => {
      it('should return custom tab bar config', () => {
        const registry = createRegistryWithTabBar()

        const { result } = renderHook(() => useTabBarTheme(), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.variant).toBe('floating')
      })

      it('should include all tabs', () => {
        const registry = createRegistryWithTabBar()

        const { result } = renderHook(() => useTabBarTheme(), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.tabs).toHaveLength(3)
        expect(result.current.tabs.map((t) => t.id)).toEqual(['home', 'wallet', 'settings'])
      })

      it('should include badge configuration', () => {
        const registry = createRegistryWithTabBar()

        const { result } = renderHook(() => useTabBarTheme(), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.badge.backgroundColor).toBe('#EF4444')
        expect(result.current.badge.size).toBe(18)
      })

      it('should include colors configuration', () => {
        const registry = createRegistryWithTabBar()

        const { result } = renderHook(() => useTabBarTheme(), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.colors.activeTintColor).toBe('#FFFFFF')
        expect(result.current.colors.inactiveTintColor).toBe('#666666')
      })
    })

    describe('memoization', () => {
      it('should return same object on re-render', () => {
        const registry = createRegistryWithTabBar()

        const { result, rerender } = renderHook(() => useTabBarTheme(), {
          wrapper: createWrapper(registry),
        })

        const firstResult = result.current

        rerender({})

        expect(result.current).toBe(firstResult)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useTabBarStyle TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useTabBarStyle()', () => {
    it('should return default style when no registry', () => {
      const { result } = renderHook(() => useTabBarStyle())

      expect(result.current.height).toBe(80)
      expect(result.current.backgroundColor).toBe('#313132')
    })

    it('should return active style from registry', () => {
      const registry = createRegistryWithTabBar()

      const { result } = renderHook(() => useTabBarStyle(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.position).toBe('absolute')
      expect(result.current.bottom).toBe(20)
      expect(result.current.borderRadius).toBe(32)
    })

    it('should return floating style when variant is floating', () => {
      const registry = createRegistryWithTabBar()

      const { result } = renderHook(() => useTabBarStyle(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.backgroundColor).toBe('#0D2828')
      expect(result.current.height).toBe(64)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useTabBarVariant TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useTabBarVariant()', () => {
    it('should return default variant when no registry', () => {
      const { result } = renderHook(() => useTabBarVariant())

      expect(result.current).toBe('default')
    })

    it('should return current variant from registry', () => {
      const registry = createRegistryWithTabBar()

      const { result } = renderHook(() => useTabBarVariant(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toBe('floating')
    })

    it('should reflect variant from registry configuration', () => {
      const registry = new ThemeRegistry()
      registry.getTabBarRegistry().setVariant('minimal')

      const { result } = renderHook(() => useTabBarVariant(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toBe('minimal')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useTabBarVariants TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useTabBarVariants()', () => {
    it('should return ["default"] when no registry', () => {
      const { result } = renderHook(() => useTabBarVariants())

      expect(result.current).toEqual(['default'])
    })

    it('should return all available variants from registry', () => {
      const registry = createRegistryWithTabBar()

      const { result } = renderHook(() => useTabBarVariants(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toContain('default')
      expect(result.current).toContain('floating')
      expect(result.current).toContain('minimal')
      expect(result.current).toContain('attached')
    })

    it('should return 4 built-in variants', () => {
      const registry = createRegistryWithTabBar()

      const { result } = renderHook(() => useTabBarVariants(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toHaveLength(4)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should support complete tab bar workflow', () => {
      const registry = createRegistryWithTabBar()
      const wrapper = createWrapper(registry)

      // Get all tab bar info at once
      const { result: configResult } = renderHook(() => useTabBarTheme(), { wrapper })
      const { result: styleResult } = renderHook(() => useTabBarStyle(), { wrapper })
      const { result: variantResult } = renderHook(() => useTabBarVariant(), { wrapper })
      const { result: variantsResult } = renderHook(() => useTabBarVariants(), { wrapper })

      // Verify all hooks work together
      expect(configResult.current.variant).toBe(variantResult.current)
      expect(configResult.current.style).toEqual(styleResult.current)
      expect(variantsResult.current).toContain(variantResult.current)
    })

    it('should have consistent data across hooks', () => {
      const registry = createRegistryWithTabBar()
      const wrapper = createWrapper(registry)

      const { result: config } = renderHook(() => useTabBarTheme(), { wrapper })
      const { result: style } = renderHook(() => useTabBarStyle(), { wrapper })

      // Style from useTabBarStyle should match style in config
      expect(style.current).toEqual(config.current.style)
    })
  })
})
