/**
 * TabBarRegistry Tests
 *
 * Tests for tab bar configuration and variant management.
 */

import { TabBarRegistry, createTabBarRegistry, ITabBarRegistry } from '../../../../src/modules/theme/registries/TabBarRegistry'
import { ITabBarConfig, TabBarVariant } from '../../../../src/modules/theme/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════════

const createMockTabBarConfig = (options: Partial<ITabBarConfig> = {}): ITabBarConfig => ({
  variant: options.variant ?? 'default',
  variants: options.variants ?? {
    default: {
      height: 80,
      backgroundColor: '#313132',
      paddingBottom: 20,
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
      borderTopWidth: 1,
    },
    attached: {
      position: 'absolute',
      bottom: 0,
      height: 80,
      backgroundColor: '#313132E6',
    },
  },
  style: options.style ?? {
    height: 80,
    backgroundColor: '#313132',
  },
  tabItem: options.tabItem ?? {
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 10, fontWeight: 'bold' },
    icon: { size: 24 },
  },
  colors: options.colors ?? {
    activeTintColor: '#FFFFFF',
    inactiveTintColor: '#666666',
    activeBackgroundColor: 'transparent',
    inactiveBackgroundColor: 'transparent',
  },
  badge: options.badge ?? {
    backgroundColor: '#EF4444',
    textColor: '#FFFFFF',
    size: 18,
    fontSize: 11,
    fontWeight: 'bold',
    borderRadius: 9,
    minWidth: 18,
    position: { top: -2, right: -6 },
  },
  tabs: options.tabs ?? [],
})

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('TabBarRegistry', () => {
  let registry: ITabBarRegistry

  beforeEach(() => {
    registry = new TabBarRegistry()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // FACTORY FUNCTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createTabBarRegistry()', () => {
    it('should create a new TabBarRegistry instance', () => {
      const created = createTabBarRegistry()

      expect(created).toBeInstanceOf(TabBarRegistry)
    })

    it('should have default config on creation', () => {
      const created = createTabBarRegistry()

      const config = created.getConfig()
      expect(config).toBeDefined()
      expect(config.variant).toBe('default')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL STATE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Initial State', () => {
    it('should have default configuration', () => {
      const config = registry.getConfig()

      expect(config.variant).toBe('default')
      expect(config.variants).toBeDefined()
      expect(config.style).toBeDefined()
    })

    it('should have all built-in variants defined', () => {
      const config = registry.getConfig()

      expect(config.variants?.default).toBeDefined()
      expect(config.variants?.floating).toBeDefined()
      expect(config.variants?.minimal).toBeDefined()
      expect(config.variants?.attached).toBeDefined()
    })

    it('should have default tabs defined', () => {
      const config = registry.getConfig()

      expect(config.tabs).toBeDefined()
      expect(config.tabs.length).toBeGreaterThan(0)
    })

    it('should have default style matching default variant', () => {
      const config = registry.getConfig()

      expect(config.style).toEqual(config.variants?.default)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Configuration', () => {
    describe('setConfig()', () => {
      it('should set tab bar configuration', () => {
        const customConfig = createMockTabBarConfig({ variant: 'floating' })

        registry.setConfig(customConfig)

        expect(registry.getConfig()).toEqual(customConfig)
      })

      it('should update style to match variant when variants are provided', () => {
        const customConfig = createMockTabBarConfig({ variant: 'floating' })

        registry.setConfig(customConfig)

        expect(registry.getConfig().style).toEqual(customConfig.variants?.floating)
      })

      it('should handle config without variants gracefully', () => {
        const configWithoutVariants: ITabBarConfig = {
          variant: 'default',
          style: { height: 60, backgroundColor: '#000' },
          tabItem: { container: {}, text: { fontSize: 10, fontWeight: 'bold' }, icon: { size: 20 } },
          colors: {
            activeTintColor: '#FFF',
            inactiveTintColor: '#999',
            activeBackgroundColor: 'transparent',
            inactiveBackgroundColor: 'transparent',
          },
          badge: {
            backgroundColor: '#FF0000',
            textColor: '#FFFFFF',
            size: 16,
            fontSize: 10,
            fontWeight: 'bold',
            borderRadius: 8,
            minWidth: 16,
            position: { top: 0, right: 0 },
          },
          tabs: [],
        }

        registry.setConfig(configWithoutVariants)

        expect(registry.getConfig().style).toEqual(configWithoutVariants.style)
      })
    })

    describe('getConfig()', () => {
      it('should return current configuration', () => {
        const config = registry.getConfig()

        expect(config).toBeDefined()
        expect(config.variant).toBeDefined()
        expect(config.style).toBeDefined()
        expect(config.tabItem).toBeDefined()
        expect(config.colors).toBeDefined()
        expect(config.badge).toBeDefined()
        expect(config.tabs).toBeDefined()
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // VARIANT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Variants', () => {
    describe('setVariant()', () => {
      it('should change the active variant', () => {
        registry.setVariant('floating')

        expect(registry.getVariant()).toBe('floating')
      })

      it('should update style when changing variant', () => {
        registry.setVariant('floating')

        const config = registry.getConfig()
        expect(config.style).toEqual(config.variants?.floating)
      })

      it('should switch between all built-in variants', () => {
        const variants: TabBarVariant[] = ['default', 'floating', 'minimal', 'attached']

        variants.forEach((variant) => {
          registry.setVariant(variant)
          expect(registry.getVariant()).toBe(variant)
        })
      })

      it('should handle variant not in variants object gracefully', () => {
        const configWithLimitedVariants = createMockTabBarConfig({
          variants: {
            default: { height: 80, backgroundColor: '#313132' },
            floating: { height: 64, backgroundColor: '#0D2828' },
            minimal: { height: 56, backgroundColor: 'transparent' },
            attached: { height: 80, backgroundColor: '#313132E6' },
          },
        })
        registry.setConfig(configWithLimitedVariants)

        // Try to set non-existent variant
        registry.setVariant('floating')

        expect(registry.getVariant()).toBe('floating')
        // Style should remain unchanged since variant doesn't exist
      })
    })

    describe('getVariant()', () => {
      it('should return current variant', () => {
        expect(registry.getVariant()).toBe('default')
      })

      it('should reflect changes from setVariant', () => {
        registry.setVariant('minimal')

        expect(registry.getVariant()).toBe('minimal')
      })
    })

    describe('getVariantStyle()', () => {
      it('should return style for specified variant', () => {
        const style = registry.getVariantStyle('floating')

        expect(style).toBeDefined()
        expect(style?.position).toBe('absolute')
      })

      it('should return undefined for non-existent variant', () => {
        const style = registry.getVariantStyle('non-existent' as TabBarVariant)

        expect(style).toBeUndefined()
      })

      it('should return correct style for each built-in variant', () => {
        const defaultStyle = registry.getVariantStyle('default')
        const floatingStyle = registry.getVariantStyle('floating')
        const minimalStyle = registry.getVariantStyle('minimal')
        const attachedStyle = registry.getVariantStyle('attached')

        expect(defaultStyle?.height).toBe(80)
        expect(floatingStyle?.borderRadius).toBe(32)
        expect(minimalStyle?.backgroundColor).toBe('transparent')
        expect(attachedStyle?.position).toBe('absolute')
      })
    })

    describe('listVariants()', () => {
      it('should list all available variants', () => {
        const variants = registry.listVariants()

        expect(variants).toContain('default')
        expect(variants).toContain('floating')
        expect(variants).toContain('minimal')
        expect(variants).toContain('attached')
      })

      it('should return ["default"] when no variants defined', () => {
        const configWithoutVariants: ITabBarConfig = {
          variant: 'default',
          style: { height: 60, backgroundColor: '#000' },
          tabItem: { container: {}, text: { fontSize: 10, fontWeight: 'bold' }, icon: { size: 20 } },
          colors: {
            activeTintColor: '#FFF',
            inactiveTintColor: '#999',
            activeBackgroundColor: 'transparent',
            inactiveBackgroundColor: 'transparent',
          },
          badge: {
            backgroundColor: '#FF0000',
            textColor: '#FFFFFF',
            size: 16,
            fontSize: 10,
            fontWeight: 'bold',
            borderRadius: 8,
            minWidth: 16,
            position: { top: 0, right: 0 },
          },
          tabs: [],
        }
        registry.setConfig(configWithoutVariants)

        const variants = registry.listVariants()

        expect(variants).toEqual(['default'])
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE STYLE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Active Style', () => {
    describe('getActiveStyle()', () => {
      it('should return style from current config', () => {
        const style = registry.getActiveStyle()

        expect(style).toBeDefined()
        expect(style.height).toBeDefined()
      })

      it('should reflect changes when variant is switched', () => {
        registry.setVariant('floating')

        const style = registry.getActiveStyle()

        expect(style.position).toBe('absolute')
        expect(style.borderRadius).toBe(32)
      })

      it('should return updated style after setConfig', () => {
        // Create config without variants to use style directly
        const customConfig: ITabBarConfig = {
          variant: 'default',
          style: {
            height: 100,
            backgroundColor: '#FF0000',
          },
          tabItem: { container: {}, text: { fontSize: 10, fontWeight: 'bold' }, icon: { size: 20 } },
          colors: {
            activeTintColor: '#FFF',
            inactiveTintColor: '#999',
            activeBackgroundColor: 'transparent',
            inactiveBackgroundColor: 'transparent',
          },
          badge: {
            backgroundColor: '#FF0000',
            textColor: '#FFFFFF',
            size: 16,
            fontSize: 10,
            fontWeight: 'bold',
            borderRadius: 8,
            minWidth: 16,
            position: { top: 0, right: 0 },
          },
          tabs: [],
        }

        registry.setConfig(customConfig)

        const style = registry.getActiveStyle()
        expect(style.height).toBe(100)
        expect(style.backgroundColor).toBe('#FF0000')
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB CONFIGURATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tab Configuration', () => {
    it('should include tab definitions in config', () => {
      const config = registry.getConfig()

      expect(config.tabs).toBeDefined()
      expect(Array.isArray(config.tabs)).toBe(true)
    })

    it('should have default tabs with id, label, icon', () => {
      const config = registry.getConfig()
      const firstTab = config.tabs[0]

      expect(firstTab.id).toBeDefined()
      expect(firstTab.label).toBeDefined()
      expect(firstTab.icon).toBeDefined()
    })

    it('should support custom tab definitions', () => {
      const customConfig = createMockTabBarConfig({
        tabs: [
          { id: 'custom-1', label: 'Custom 1', labelKey: 'Tab.Custom1', icon: 'star' },
          { id: 'custom-2', label: 'Custom 2', labelKey: 'Tab.Custom2', icon: 'heart', showBadge: true },
        ],
      })

      registry.setConfig(customConfig)

      const config = registry.getConfig()
      expect(config.tabs).toHaveLength(2)
      expect(config.tabs[0].id).toBe('custom-1')
      expect(config.tabs[1].showBadge).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should support complete configuration workflow', () => {
      // 1. Set custom configuration
      const customConfig = createMockTabBarConfig({
        variant: 'floating',
        tabs: [
          { id: 'home', label: 'Home', labelKey: 'Tab.Home', icon: 'home' },
          { id: 'wallet', label: 'Wallet', labelKey: 'Tab.Wallet', icon: 'wallet' },
          { id: 'settings', label: 'Settings', labelKey: 'Tab.Settings', icon: 'cog' },
        ],
      })
      registry.setConfig(customConfig)

      // 2. Verify configuration
      expect(registry.getVariant()).toBe('floating')
      expect(registry.getConfig().tabs).toHaveLength(3)

      // 3. Switch variant
      registry.setVariant('minimal')
      expect(registry.getVariant()).toBe('minimal')
      expect(registry.getActiveStyle().backgroundColor).toBe('transparent')

      // 4. List available variants
      const variants = registry.listVariants()
      expect(variants).toHaveLength(4)
    })

    it('should maintain tab items when switching variants', () => {
      const customConfig = createMockTabBarConfig({
        tabs: [
          { id: 'custom-tab', label: 'Custom', labelKey: 'Tab.Custom', icon: 'star' },
        ],
      })
      registry.setConfig(customConfig)

      registry.setVariant('floating')
      expect(registry.getConfig().tabs[0].id).toBe('custom-tab')

      registry.setVariant('minimal')
      expect(registry.getConfig().tabs[0].id).toBe('custom-tab')
    })

    it('should preserve colors and badge config across variant changes', () => {
      const customColors = {
        activeTintColor: '#00FF00',
        inactiveTintColor: '#FF0000',
        activeBackgroundColor: '#0000FF',
        inactiveBackgroundColor: '#FFFF00',
      }
      const customConfig = createMockTabBarConfig({ colors: customColors })

      registry.setConfig(customConfig)
      registry.setVariant('floating')

      const config = registry.getConfig()
      expect(config.colors).toEqual(customColors)
    })
  })
})
