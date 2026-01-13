/**
 * ThemeRegistry Tests
 *
 * Tests for the central theme registry that manages theme manifests
 * and coordinates sub-registries.
 */

import { ThemeRegistry, createThemeRegistry, IThemeRegistry } from '../../../../src/modules/theme/registries/ThemeRegistry'
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
  matcher: id === 'default' ? { fallback: true } : { patterns: [{ type: 'credDefId', regex: id }] },
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
    attributeLabel: { fontSize: 12, fontWeight: '500', color: '#666666' },
    attributeValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  },
  assets: {},
  layoutConfig: {
    container: { borderRadius: 12, padding: 16, aspectRatio: 1.6 },
    shadow: { color: '#000000', offset: { width: 0, height: 4 }, radius: 12, opacity: 0.15 },
    logo: { show: true, position: 'top-left', size: 40, borderRadius: 8, margin: 16 },
    bottomStripe: { show: true, height: 8, borderRadius: [0, 0, 12, 12] },
    showIssuerName: true,
    showCredentialName: true,
    showTimestamp: true,
    showAttributes: true,
    maxAttributes: 3,
  },
})

const createMockBackgroundConfig = (id: string): IBackgroundConfig => ({
  id,
  type: 'solid',
  color: '#000000',
})

const createMockTabBarConfig = (): ITabBarConfig => ({
  variant: 'floating',
  style: {
    height: 64,
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
  tabs: [],
})

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('ThemeRegistry', () => {
  let registry: IThemeRegistry

  beforeEach(() => {
    registry = new ThemeRegistry()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // FACTORY FUNCTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createThemeRegistry()', () => {
    it('should create a new ThemeRegistry instance', () => {
      const created = createThemeRegistry()

      expect(created).toBeInstanceOf(ThemeRegistry)
    })

    it('should create independent instances', () => {
      const registry1 = createThemeRegistry()
      const registry2 = createThemeRegistry()

      registry1.register(createMockManifest('theme-1', 'Theme 1'))

      expect(registry1.has('theme-1')).toBe(true)
      expect(registry2.has('theme-1')).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Registration', () => {
    describe('register()', () => {
      it('should register a theme manifest', () => {
        const manifest = createMockManifest('teal-dark', 'Teal Dark')

        registry.register(manifest)

        expect(registry.has('teal-dark')).toBe(true)
      })

      it('should set first registered theme as active', () => {
        const manifest = createMockManifest('first-theme', 'First Theme')

        registry.register(manifest)

        expect(registry.getActiveId()).toBe('first-theme')
      })

      it('should not change active theme when registering subsequent themes', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))
        registry.register(createMockManifest('theme-2', 'Theme 2'))

        expect(registry.getActiveId()).toBe('theme-1')
      })

      it('should invalidate cache when re-registering same theme', () => {
        const manifest1 = createMockManifest('theme-1', 'Theme 1')
        registry.register(manifest1)

        // Get the theme to cache it
        registry.get('theme-1')

        // Re-register with updated name
        const manifest2 = createMockManifest('theme-1', 'Theme 1 Updated')
        registry.register(manifest2)

        const resolved2 = registry.get('theme-1')

        // Should have the updated name
        expect(resolved2?.name).toBe('Theme 1 Updated')
      })
    })

    describe('registerMultiple()', () => {
      it('should register multiple manifests at once', () => {
        const manifests = [
          createMockManifest('theme-1', 'Theme 1'),
          createMockManifest('theme-2', 'Theme 2'),
          createMockManifest('theme-3', 'Theme 3'),
        ]

        registry.registerMultiple(manifests)

        expect(registry.has('theme-1')).toBe(true)
        expect(registry.has('theme-2')).toBe(true)
        expect(registry.has('theme-3')).toBe(true)
      })

      it('should set first theme as active when registering multiple', () => {
        const manifests = [
          createMockManifest('first', 'First'),
          createMockManifest('second', 'Second'),
        ]

        registry.registerMultiple(manifests)

        expect(registry.getActiveId()).toBe('first')
      })
    })

    describe('unregister()', () => {
      it('should remove a registered theme', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        registry.unregister('theme-1')

        expect(registry.has('theme-1')).toBe(false)
      })

      it('should clear active if unregistered theme was active', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        expect(registry.getActiveId()).toBe('theme-1')

        registry.unregister('theme-1')

        expect(registry.getActiveId()).toBeUndefined()
      })

      it('should handle unregistering non-existent theme gracefully', () => {
        expect(() => registry.unregister('non-existent')).not.toThrow()
      })

      it('should invalidate cached theme on unregister', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        // Get to cache
        registry.get('theme-1')

        registry.unregister('theme-1')

        expect(registry.get('theme-1')).toBeUndefined()
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // RETRIEVAL TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Retrieval', () => {
    describe('get()', () => {
      it('should return resolved theme for registered ID', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        const resolved = registry.get('theme-1')

        expect(resolved).toBeDefined()
        expect(resolved?.id).toBe('theme-1')
        expect(resolved?.name).toBe('Theme 1')
      })

      it('should return undefined for unregistered ID', () => {
        const resolved = registry.get('non-existent')

        expect(resolved).toBeUndefined()
      })

      it('should include manifest in resolved theme', () => {
        const manifest = createMockManifest('theme-1', 'Theme 1')
        registry.register(manifest)

        const resolved = registry.get('theme-1')

        expect(resolved?.manifest).toBe(manifest)
      })

      it('should cache built themes', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        const resolved1 = registry.get('theme-1')
        const resolved2 = registry.get('theme-1')

        // Same object reference (cached)
        expect(resolved1).toBe(resolved2)
      })

      it('should include default tab bar config', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        const resolved = registry.get('theme-1')

        expect(resolved?.tabBarConfig).toBeDefined()
        expect(resolved?.tabBarConfig.variant).toBe('default')
      })
    })

    describe('getManifest()', () => {
      it('should return manifest for registered ID', () => {
        const manifest = createMockManifest('theme-1', 'Theme 1')
        registry.register(manifest)

        const retrieved = registry.getManifest('theme-1')

        expect(retrieved).toBe(manifest)
      })

      it('should return undefined for unregistered ID', () => {
        const retrieved = registry.getManifest('non-existent')

        expect(retrieved).toBeUndefined()
      })
    })

    describe('list()', () => {
      it('should return empty array when no themes registered', () => {
        const list = registry.list()

        expect(list).toEqual([])
      })

      it('should return info for all registered themes', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))
        registry.register(createMockManifest('theme-2', 'Theme 2'))

        const list = registry.list()

        expect(list).toHaveLength(2)
        expect(list.map((t) => t.id)).toContain('theme-1')
        expect(list.map((t) => t.id)).toContain('theme-2')
      })

      it('should include id, name, version, and description', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        const list = registry.list()

        expect(list[0]).toEqual({
          id: 'theme-1',
          name: 'Theme 1',
          version: '1.0.0',
          description: 'Theme 1 theme',
        })
      })
    })

    describe('has()', () => {
      it('should return true for registered theme', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        expect(registry.has('theme-1')).toBe(true)
      })

      it('should return false for unregistered theme', () => {
        expect(registry.has('non-existent')).toBe(false)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE THEME TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Active Theme', () => {
    describe('setActive()', () => {
      it('should set active theme by ID', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))
        registry.register(createMockManifest('theme-2', 'Theme 2'))

        registry.setActive('theme-2')

        expect(registry.getActiveId()).toBe('theme-2')
      })

      it('should do nothing if theme ID not registered', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        registry.setActive('non-existent')

        expect(registry.getActiveId()).toBe('theme-1')
      })

      it('should build and cache theme when set active', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        registry.setActive('theme-1')

        const active = registry.getActive()
        expect(active).toBeDefined()
        expect(active?.id).toBe('theme-1')
      })
    })

    describe('getActive()', () => {
      it('should return undefined when no active theme', () => {
        const active = registry.getActive()

        expect(active).toBeUndefined()
      })

      it('should return resolved theme for active ID', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        const active = registry.getActive()

        expect(active?.id).toBe('theme-1')
      })
    })

    describe('getActiveId()', () => {
      it('should return undefined when no theme registered', () => {
        expect(registry.getActiveId()).toBeUndefined()
      })

      it('should return ID of active theme', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))

        expect(registry.getActiveId()).toBe('theme-1')
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // SUB-REGISTRIES TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Sub-Registries', () => {
    describe('getCardThemeRegistry()', () => {
      it('should return card theme registry', () => {
        const cardRegistry = registry.getCardThemeRegistry()

        expect(cardRegistry).toBeDefined()
        expect(typeof cardRegistry.register).toBe('function')
        expect(typeof cardRegistry.getTheme).toBe('function')
      })

      it('should return same registry instance on multiple calls', () => {
        const registry1 = registry.getCardThemeRegistry()
        const registry2 = registry.getCardThemeRegistry()

        expect(registry1).toBe(registry2)
      })
    })

    describe('getBackgroundRegistry()', () => {
      it('should return background registry', () => {
        const bgRegistry = registry.getBackgroundRegistry()

        expect(bgRegistry).toBeDefined()
        expect(typeof bgRegistry.register).toBe('function')
        expect(typeof bgRegistry.getForScreen).toBe('function')
      })
    })

    describe('getTabBarRegistry()', () => {
      it('should return tab bar registry', () => {
        const tabRegistry = registry.getTabBarRegistry()

        expect(tabRegistry).toBeDefined()
        expect(typeof tabRegistry.setConfig).toBe('function')
        expect(typeof tabRegistry.getVariant).toBe('function')
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION INJECTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Configuration Injection', () => {
    describe('setCardThemes()', () => {
      it('should register card themes in sub-registry', () => {
        const themes = [createMockCardTheme('default'), createMockCardTheme('university')]

        registry.setCardThemes(themes)

        const cardRegistry = registry.getCardThemeRegistry()
        expect(cardRegistry.list()).toHaveLength(2)
      })

      it('should clear existing themes before setting new ones', () => {
        registry.setCardThemes([createMockCardTheme('theme-1')])
        registry.setCardThemes([createMockCardTheme('theme-2')])

        const cardRegistry = registry.getCardThemeRegistry()
        expect(cardRegistry.list()).toHaveLength(1)
        expect(cardRegistry.getById('theme-1')).toBeUndefined()
        expect(cardRegistry.getById('theme-2')).toBeDefined()
      })

      it('should update active resolved theme cardThemes', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))
        registry.setActive('theme-1')

        const themes = [createMockCardTheme('card-1')]
        registry.setCardThemes(themes)

        const active = registry.getActive()
        expect(active?.cardThemes).toEqual(themes)
      })
    })

    describe('setBackgrounds()', () => {
      it('should register backgrounds in sub-registry', () => {
        const backgrounds = [
          createMockBackgroundConfig('bg-1'),
          createMockBackgroundConfig('bg-2'),
        ]

        registry.setBackgrounds(backgrounds)

        const bgRegistry = registry.getBackgroundRegistry()
        expect(bgRegistry.get('bg-1')).toBeDefined()
        expect(bgRegistry.get('bg-2')).toBeDefined()
      })

      it('should build screen mapping from background screenIds', () => {
        const backgrounds: IBackgroundConfig[] = [
          { id: 'home-bg', type: 'solid', color: '#000', screenIds: ['Home', 'Dashboard'] },
          { id: 'settings-bg', type: 'solid', color: '#111', screenIds: ['Settings'] },
        ]

        registry.setBackgrounds(backgrounds)

        const bgRegistry = registry.getBackgroundRegistry()
        const mapping = bgRegistry.getScreenMapping()

        expect(mapping['Home']).toBe('home-bg')
        expect(mapping['Dashboard']).toBe('home-bg')
        expect(mapping['Settings']).toBe('settings-bg')
      })

      it('should ignore wildcard screenIds in mapping', () => {
        const backgrounds: IBackgroundConfig[] = [
          { id: 'default-bg', type: 'solid', color: '#000', screenIds: ['*'] },
        ]

        registry.setBackgrounds(backgrounds)

        const bgRegistry = registry.getBackgroundRegistry()
        const mapping = bgRegistry.getScreenMapping()

        expect(mapping['*']).toBeUndefined()
      })

      it('should update active resolved theme backgrounds', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))
        registry.setActive('theme-1')

        const backgrounds = [createMockBackgroundConfig('bg-1')]
        registry.setBackgrounds(backgrounds)

        const active = registry.getActive()
        expect(active?.backgrounds).toEqual(backgrounds)
      })
    })

    describe('setScreenBackgrounds()', () => {
      it('should set screen mapping in background registry', () => {
        const mapping = {
          Home: 'home-bg',
          Settings: 'settings-bg',
        }

        registry.setScreenBackgrounds(mapping)

        const bgRegistry = registry.getBackgroundRegistry()
        expect(bgRegistry.getScreenMapping()).toEqual(mapping)
      })

      it('should update active resolved theme screenBackgrounds', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))
        registry.setActive('theme-1')

        const mapping = { Home: 'home-bg' }
        registry.setScreenBackgrounds(mapping)

        const active = registry.getActive()
        expect(active?.screenBackgrounds).toEqual(mapping)
      })
    })

    describe('setTabBarConfig()', () => {
      it('should set config in tab bar registry', () => {
        const config = createMockTabBarConfig()

        registry.setTabBarConfig(config)

        const tabRegistry = registry.getTabBarRegistry()
        expect(tabRegistry.getConfig()).toEqual(config)
      })

      it('should update active resolved theme tabBarConfig', () => {
        registry.register(createMockManifest('theme-1', 'Theme 1'))
        registry.setActive('theme-1')

        const config = createMockTabBarConfig()
        registry.setTabBarConfig(config)

        const active = registry.getActive()
        expect(active?.tabBarConfig).toEqual(config)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should coordinate all sub-registries when setActive is called with resolved theme data', () => {
      // Register theme and set card themes/backgrounds to the resolved theme
      registry.register(createMockManifest('full-theme', 'Full Theme'))

      // Get the resolved theme and manually set data (simulating a fully loaded theme)
      const resolved = registry.get('full-theme')!
      resolved.cardThemes = [createMockCardTheme('card-1')]
      resolved.backgrounds = [createMockBackgroundConfig('bg-1')]
      resolved.screenBackgrounds = { Home: 'bg-1' }
      resolved.tabBarConfig = createMockTabBarConfig()

      // Trigger setActive to update sub-registries
      registry.setActive('full-theme')

      // Verify sub-registries are updated
      expect(registry.getCardThemeRegistry().list()).toHaveLength(1)
      expect(registry.getBackgroundRegistry().get('bg-1')).toBeDefined()
      expect(registry.getBackgroundRegistry().getScreenMapping()).toEqual({ Home: 'bg-1' })
      expect(registry.getTabBarRegistry().getConfig().variant).toBe('floating')
    })

    it('should allow full theme workflow: register, configure, activate', () => {
      // 1. Register manifest
      registry.register(createMockManifest('my-theme', 'My Theme'))

      // 2. Explicitly set active to build and cache the theme
      registry.setActive('my-theme')

      // 3. Configure sub-registries (updates cached theme)
      registry.setCardThemes([createMockCardTheme('default')])
      registry.setBackgrounds([{ id: 'main-bg', type: 'gradient', gradient: { type: 'linear', colors: ['#000', '#111'], start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } }])
      registry.setScreenBackgrounds({ Home: 'main-bg' })
      registry.setTabBarConfig(createMockTabBarConfig())

      // 4. Get active theme
      const active = registry.getActive()

      // 5. Verify complete setup
      expect(active?.id).toBe('my-theme')
      expect(active?.cardThemes).toHaveLength(1)
      expect(active?.backgrounds).toHaveLength(1)
      expect(active?.screenBackgrounds).toEqual({ Home: 'main-bg' })
      expect(active?.tabBarConfig.variant).toBe('floating')
    })
  })
})
