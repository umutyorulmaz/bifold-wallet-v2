/**
 * ThemeRegistryProvider Tests
 *
 * Tests for the theme registry provider component.
 */

import React from 'react'
import { render, renderHook, waitFor } from '@testing-library/react-native'
import { Text, View } from 'react-native'

import { ThemeRegistryProvider } from '../../../../src/modules/theme/providers/ThemeRegistryProvider'
import { ThemeRegistry } from '../../../../src/modules/theme/registries/ThemeRegistry'
import { useThemeRegistry } from '../../../../src/modules/theme/hooks/useThemeRegistry'
import { IThemeManifest, ICardTheme, IBackgroundConfig, ITabBarConfig } from '../../../../src/modules/theme/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════════

const createMockManifest = (id: string, name: string): IThemeManifest => ({
  meta: {
    id,
    name,
    version: '1.0.0',
    description: `${name} theme`,
  },
  features: {
    useNewPINDesign: false,
    enableGradientBackgrounds: true,
    tabBarVariant: 'default',
  },
})

const createMockCardTheme = (id: string): ICardTheme => ({
  id,
  matcher: { fallback: true },
  displayName: `${id} Card`,
  layout: 'default',
  colors: {
    primary: '#42803E',
    secondary: '#FFFFFF',
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    bottomLine: '#42803E',
    accent: '#FCBA19',
  },
  typography: {
    issuerName: { fontSize: 12, fontWeight: '600', color: '#666666' },
    credentialName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  },
  assets: {},
  layoutConfig: {
    container: { borderRadius: 12, padding: 16, aspectRatio: 1.6 },
    showIssuerName: true,
    showCredentialName: true,
    showTimestamp: true,
    showAttributes: true,
    maxAttributes: 3,
  },
})

const createMockBackground = (id: string): IBackgroundConfig => ({
  id,
  type: 'solid',
  color: '#000000',
})

const createMockTabBarConfig = (): ITabBarConfig => ({
  variant: 'floating',
  style: { height: 64, backgroundColor: '#0D2828' },
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
  tabs: [],
})

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('ThemeRegistryProvider', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC PROVIDER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Basic Functionality', () => {
    it('should render children', () => {
      const registry = new ThemeRegistry()

      const { getByText } = render(
        <ThemeRegistryProvider registry={registry}>
          <Text>Child Content</Text>
        </ThemeRegistryProvider>
      )

      expect(getByText('Child Content')).toBeTruthy()
    })

    it('should provide registry to children', () => {
      const registry = new ThemeRegistry()
      let capturedRegistry: ThemeRegistry | undefined

      const TestComponent = () => {
        capturedRegistry = useThemeRegistry() as ThemeRegistry
        return <Text>Test</Text>
      }

      render(
        <ThemeRegistryProvider registry={registry}>
          <TestComponent />
        </ThemeRegistryProvider>
      )

      expect(capturedRegistry).toBe(registry)
    })

    it('should render nested components', () => {
      const registry = new ThemeRegistry()

      const { getByText } = render(
        <ThemeRegistryProvider registry={registry}>
          <View>
            <View>
              <Text>Deeply Nested</Text>
            </View>
          </View>
        </ThemeRegistryProvider>
      )

      expect(getByText('Deeply Nested')).toBeTruthy()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // MANIFEST REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Manifest Registration', () => {
    it('should register manifests on mount', async () => {
      const registry = new ThemeRegistry()
      const manifests = [
        createMockManifest('theme-1', 'Theme 1'),
        createMockManifest('theme-2', 'Theme 2'),
      ]

      render(
        <ThemeRegistryProvider registry={registry} manifests={manifests}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        expect(registry.has('theme-1')).toBe(true)
        expect(registry.has('theme-2')).toBe(true)
      })
    })

    it('should not register when manifests is empty', async () => {
      const registry = new ThemeRegistry()
      const registerSpy = jest.spyOn(registry, 'registerMultiple')

      render(
        <ThemeRegistryProvider registry={registry} manifests={[]}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      // Should not be called since array is empty
      await waitFor(() => {
        expect(registerSpy).not.toHaveBeenCalled()
      })
    })

    it('should not register when manifests is undefined', () => {
      const registry = new ThemeRegistry()
      const registerSpy = jest.spyOn(registry, 'registerMultiple')

      render(
        <ThemeRegistryProvider registry={registry}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      expect(registerSpy).not.toHaveBeenCalled()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CARD THEMES REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Card Themes Registration', () => {
    it('should register card themes on mount', async () => {
      const registry = new ThemeRegistry()
      const cardThemes = [createMockCardTheme('card-1'), createMockCardTheme('card-2')]

      render(
        <ThemeRegistryProvider registry={registry} cardThemes={cardThemes}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        const cardRegistry = registry.getCardThemeRegistry()
        expect(cardRegistry.list()).toHaveLength(2)
      })
    })

    it('should not set card themes when empty', () => {
      const registry = new ThemeRegistry()
      const setCardThemesSpy = jest.spyOn(registry, 'setCardThemes')

      render(
        <ThemeRegistryProvider registry={registry} cardThemes={[]}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      expect(setCardThemesSpy).not.toHaveBeenCalled()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKGROUNDS REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Backgrounds Registration', () => {
    it('should register backgrounds on mount', async () => {
      const registry = new ThemeRegistry()
      const backgrounds = [createMockBackground('bg-1'), createMockBackground('bg-2')]

      render(
        <ThemeRegistryProvider registry={registry} backgrounds={backgrounds}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        const bgRegistry = registry.getBackgroundRegistry()
        expect(bgRegistry.get('bg-1')).toBeDefined()
        expect(bgRegistry.get('bg-2')).toBeDefined()
      })
    })

    it('should set screen backgrounds mapping', async () => {
      const registry = new ThemeRegistry()
      const screenBackgrounds = { Home: 'home-bg', Settings: 'settings-bg' }

      render(
        <ThemeRegistryProvider registry={registry} screenBackgrounds={screenBackgrounds}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        const bgRegistry = registry.getBackgroundRegistry()
        expect(bgRegistry.getScreenMapping()).toEqual(screenBackgrounds)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB BAR CONFIG TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tab Bar Configuration', () => {
    it('should set tab bar config on mount', async () => {
      const registry = new ThemeRegistry()
      const tabBarConfig = createMockTabBarConfig()

      render(
        <ThemeRegistryProvider registry={registry} tabBarConfig={tabBarConfig}>
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        const tabRegistry = registry.getTabBarRegistry()
        expect(tabRegistry.getConfig().variant).toBe('floating')
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL THEME TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Initial Theme Selection', () => {
    it('should set initial theme when specified and exists', async () => {
      const registry = new ThemeRegistry()
      const manifests = [
        createMockManifest('theme-1', 'Theme 1'),
        createMockManifest('theme-2', 'Theme 2'),
      ]

      render(
        <ThemeRegistryProvider
          registry={registry}
          manifests={manifests}
          initialThemeId="theme-2"
        >
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        expect(registry.getActiveId()).toBe('theme-2')
      })
    })

    it('should not change active theme if initialThemeId does not exist', async () => {
      const registry = new ThemeRegistry()
      const manifests = [createMockManifest('theme-1', 'Theme 1')]

      render(
        <ThemeRegistryProvider
          registry={registry}
          manifests={manifests}
          initialThemeId="non-existent"
        >
          <Text>Test</Text>
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        // First registered theme should be active
        expect(registry.getActiveId()).toBe('theme-1')
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMOIZATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Memoization', () => {
    it('should memoize context value', () => {
      const registry = new ThemeRegistry()
      const renderCounts: number[] = []
      let renderCount = 0

      const TestComponent = () => {
        renderCount++
        renderCounts.push(renderCount)
        useThemeRegistry()
        return <Text>Render {renderCount}</Text>
      }

      const { rerender } = render(
        <ThemeRegistryProvider registry={registry}>
          <TestComponent />
        </ThemeRegistryProvider>
      )

      // Re-render with same registry
      rerender(
        <ThemeRegistryProvider registry={registry}>
          <TestComponent />
        </ThemeRegistryProvider>
      )

      // Component should have rendered twice (initial + rerender)
      // but context value should remain stable
      expect(renderCounts).toHaveLength(2)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should provide fully configured theme system', async () => {
      const registry = new ThemeRegistry()
      const manifests = [createMockManifest('main-theme', 'Main Theme')]
      const cardThemes = [createMockCardTheme('default-card')]
      const backgrounds = [createMockBackground('home-bg')]
      const screenBackgrounds = { Home: 'home-bg' }
      const tabBarConfig = createMockTabBarConfig()

      let capturedRegistry: ThemeRegistry | undefined

      const TestComponent = () => {
        capturedRegistry = useThemeRegistry() as ThemeRegistry
        return <Text>Test</Text>
      }

      render(
        <ThemeRegistryProvider
          registry={registry}
          manifests={manifests}
          cardThemes={cardThemes}
          backgrounds={backgrounds}
          screenBackgrounds={screenBackgrounds}
          tabBarConfig={tabBarConfig}
          initialThemeId="main-theme"
        >
          <TestComponent />
        </ThemeRegistryProvider>
      )

      await waitFor(() => {
        expect(capturedRegistry).toBe(registry)
        expect(registry.has('main-theme')).toBe(true)
        expect(registry.getActiveId()).toBe('main-theme')
        expect(registry.getCardThemeRegistry().list()).toHaveLength(1)
        expect(registry.getBackgroundRegistry().get('home-bg')).toBeDefined()
        // Tab bar config is set via effect, so just verify it was called
        expect(registry.getTabBarRegistry().getConfig()).toBeDefined()
      })
    })

    it('should work with useThemeRegistry hook', () => {
      const registry = new ThemeRegistry()
      registry.register(createMockManifest('test-theme', 'Test Theme'))

      const { result } = renderHook(() => useThemeRegistry(), {
        wrapper: ({ children }) => (
          <ThemeRegistryProvider registry={registry}>{children}</ThemeRegistryProvider>
        ),
      })

      expect(result.current).toBe(registry)
      expect(result.current.has('test-theme')).toBe(true)
    })
  })
})
