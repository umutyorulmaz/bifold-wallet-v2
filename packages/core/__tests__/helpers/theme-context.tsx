/**
 * Theme Test Context Helper
 *
 * Provides test wrappers for theme-related components.
 */

import React, { PropsWithChildren, useMemo } from 'react'
import { container } from 'tsyringe'

import { Container, ContainerProvider, TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { NetworkContext } from '../../src/contexts/network'
import { MockLogger } from '../../src/testing/MockLogger'
import { ThemeRegistry, IThemeRegistry } from '../../src/modules/theme/registries/ThemeRegistry'
import { ThemeRegistryProvider } from '../../src/modules/theme/providers/ThemeRegistryProvider'
import { IThemeManifest, ICardTheme, IBackgroundConfig, IScreenBackgrounds, ITabBarConfig } from '../../src/modules/theme/types'
import { OpenIDCredentialRecordProvider } from '../../src/modules/openid/context/OpenIDCredentialRecordProvider'

import networkContext from '../contexts/network'
import { mockThemeManifests, mockCardThemes, mockBackgroundConfigs, mockTabBarConfigs, mockScreenBackgrounds } from '../fixtures/theme-fixtures'

/**
 * Props for ThemeTestContext
 */
export interface ThemeTestContextProps extends PropsWithChildren {
  /** Optional custom theme registry */
  registry?: IThemeRegistry
  /** Initial theme ID to activate */
  initialThemeId?: string
  /** Theme manifests to register */
  manifests?: IThemeManifest[]
  /** Card themes to register */
  cardThemes?: ICardTheme[]
  /** Backgrounds to register */
  backgrounds?: IBackgroundConfig[]
  /** Screen backgrounds mapping */
  screenBackgrounds?: IScreenBackgrounds
  /** Tab bar config */
  tabBarConfig?: ITabBarConfig
  /** Optional custom DI container */
  customContainer?: Container
}

/**
 * Test context wrapper that provides both BasicAppContext and ThemeRegistry
 *
 * @example
 * ```tsx
 * import { renderHook } from '@testing-library/react-native'
 * import { ThemeTestContext } from '../helpers/theme-context'
 *
 * const { result } = renderHook(() => useThemeRegistry(), {
 *   wrapper: ThemeTestContext,
 * })
 * ```
 */
export const ThemeTestContext: React.FC<ThemeTestContextProps> = ({
  children,
  registry,
  initialThemeId,
  manifests,
  cardThemes,
  backgrounds,
  screenBackgrounds,
  tabBarConfig,
  customContainer,
}) => {
  const containerContext = useMemo(() => {
    if (customContainer) {
      return customContainer
    }
    const c = new MainContainer(container.createChildContainer()).init()
    c.resolve(TOKENS.UTIL_LOGGER)
    c.container.registerInstance(TOKENS.UTIL_LOGGER, new MockLogger())
    return c
  }, [customContainer])

  const themeRegistry = useMemo(() => {
    return registry ?? new ThemeRegistry()
  }, [registry])

  return (
    <ContainerProvider value={containerContext}>
      <OpenIDCredentialRecordProvider>
        <NetworkContext.Provider value={networkContext}>
          <ThemeRegistryProvider
            registry={themeRegistry}
            initialThemeId={initialThemeId}
            manifests={manifests}
            cardThemes={cardThemes}
            backgrounds={backgrounds}
            screenBackgrounds={screenBackgrounds}
            tabBarConfig={tabBarConfig}
          >
            {children}
          </ThemeRegistryProvider>
        </NetworkContext.Provider>
      </OpenIDCredentialRecordProvider>
    </ContainerProvider>
  )
}

/**
 * Create a custom ThemeTestContext wrapper with pre-configured options
 *
 * @example
 * ```tsx
 * const { result } = renderHook(() => useCardTheme(credential), {
 *   wrapper: createThemeTestWrapper({
 *     cardThemes: [myCardTheme],
 *   }),
 * })
 * ```
 */
export const createThemeTestWrapper = (options: Omit<ThemeTestContextProps, 'children'> = {}) => {
  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <ThemeTestContext {...options}>
      {children}
    </ThemeTestContext>
  )
  return Wrapper
}

/**
 * Create a ThemeTestContext with default mock data pre-loaded
 */
export const ThemeTestContextWithMocks: React.FC<PropsWithChildren> = ({ children }) => (
  <ThemeTestContext
    manifests={[mockThemeManifests.tealDark as any, mockThemeManifests.lightBlue as any]}
    cardThemes={[mockCardThemes.default as any, mockCardThemes.university as any]}
    backgrounds={[mockBackgroundConfigs.default as any, mockBackgroundConfigs.gradientDark as any]}
    screenBackgrounds={mockScreenBackgrounds as any}
    tabBarConfig={mockTabBarConfigs.default as any}
    initialThemeId="teal-dark"
  >
    {children}
  </ThemeTestContext>
)

/**
 * Create a minimal context for testing theme registry in isolation
 * (without full app context)
 */
export const MinimalThemeContext: React.FC<PropsWithChildren & { registry?: IThemeRegistry }> = ({
  children,
  registry,
}) => {
  const themeRegistry = useMemo(() => {
    return registry ?? new ThemeRegistry()
  }, [registry])

  return (
    <ThemeRegistryProvider registry={themeRegistry}>
      {children}
    </ThemeRegistryProvider>
  )
}

/**
 * Create a mock theme registry with jest spies on all methods
 */
export const createMockThemeRegistry = (): jest.Mocked<IThemeRegistry> => ({
  register: jest.fn(),
  registerMultiple: jest.fn(),
  unregister: jest.fn(),
  get: jest.fn().mockReturnValue(undefined),
  getManifest: jest.fn().mockReturnValue(undefined),
  list: jest.fn().mockReturnValue([]),
  has: jest.fn().mockReturnValue(false),
  setActive: jest.fn(),
  getActive: jest.fn().mockReturnValue(undefined),
  getActiveId: jest.fn().mockReturnValue(undefined),
  getCardThemeRegistry: jest.fn().mockReturnValue({
    register: jest.fn(),
    unregister: jest.fn(),
    clear: jest.fn(),
    getTheme: jest.fn(),
    getById: jest.fn(),
    getDefault: jest.fn(),
    list: jest.fn().mockReturnValue([]),
    setDefault: jest.fn(),
  }),
  getBackgroundRegistry: jest.fn().mockReturnValue({
    register: jest.fn(),
    unregister: jest.fn(),
    clear: jest.fn(),
    get: jest.fn(),
    getForScreen: jest.fn(),
    getDefault: jest.fn(),
    list: jest.fn().mockReturnValue([]),
    setScreenMapping: jest.fn(),
    getScreenMapping: jest.fn().mockReturnValue({}),
    setDefault: jest.fn(),
  }),
  getTabBarRegistry: jest.fn().mockReturnValue({
    setConfig: jest.fn(),
    getConfig: jest.fn(),
    setVariant: jest.fn(),
    getVariant: jest.fn().mockReturnValue('default'),
    getVariantStyle: jest.fn(),
    listVariants: jest.fn().mockReturnValue([]),
    getActiveStyle: jest.fn(),
  }),
  setCardThemes: jest.fn(),
  setBackgrounds: jest.fn(),
  setScreenBackgrounds: jest.fn(),
  setTabBarConfig: jest.fn(),
})

export default ThemeTestContext
