/**
 * BackgroundRegistry Tests
 *
 * Tests for screen background configuration management.
 */

import { BackgroundRegistry, createBackgroundRegistry, IBackgroundRegistry } from '../../../../src/modules/theme/registries/BackgroundRegistry'
import { IBackgroundConfig, IScreenBackgrounds } from '../../../../src/modules/theme/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════════

const createSolidBackground = (id: string, color: string): IBackgroundConfig => ({
  id,
  type: 'solid',
  color,
})

const createGradientBackground = (id: string, colors: string[], angle: number = 180): IBackgroundConfig => ({
  id,
  type: 'gradient',
  gradient: {
    type: 'linear',
    colors,
    start: { x: 0, y: 0 },
    end: { x: Math.cos((angle * Math.PI) / 180), y: Math.sin((angle * Math.PI) / 180) },
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('BackgroundRegistry', () => {
  let registry: IBackgroundRegistry

  beforeEach(() => {
    registry = new BackgroundRegistry()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // FACTORY FUNCTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createBackgroundRegistry()', () => {
    it('should create a new BackgroundRegistry instance', () => {
      const created = createBackgroundRegistry()

      expect(created).toBeInstanceOf(BackgroundRegistry)
    })

    it('should have default background on creation', () => {
      const created = createBackgroundRegistry()

      const defaultBg = created.getDefault()
      expect(defaultBg).toBeDefined()
      expect(defaultBg.id).toBe('default')
      expect(defaultBg.type).toBe('solid')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIAL STATE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Initial State', () => {
    it('should have default background registered', () => {
      expect(registry.get('default')).toBeDefined()
    })

    it('should have empty screen mapping', () => {
      expect(registry.getScreenMapping()).toEqual({})
    })

    it('should list only default background initially', () => {
      const list = registry.list()

      expect(list).toHaveLength(1)
      expect(list[0].id).toBe('default')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Registration', () => {
    describe('register()', () => {
      it('should register a solid background', () => {
        const bg = createSolidBackground('dark', '#1A1A1A')

        registry.register(bg)

        expect(registry.get('dark')).toBe(bg)
      })

      it('should register a gradient background', () => {
        const bg = createGradientBackground('sunset', ['#FF6B6B', '#FFA500', '#FFD93D'], 135)

        registry.register(bg)

        expect(registry.get('sunset')).toBe(bg)
      })

      it('should allow registering multiple backgrounds', () => {
        registry.register(createSolidBackground('bg-1', '#000'))
        registry.register(createSolidBackground('bg-2', '#111'))
        registry.register(createGradientBackground('bg-3', ['#222', '#333']))

        expect(registry.list()).toHaveLength(4) // 3 + default
      })

      it('should overwrite background with same ID', () => {
        registry.register(createSolidBackground('bg-1', '#000000'))
        registry.register(createSolidBackground('bg-1', '#FFFFFF'))

        const bg = registry.get('bg-1')
        expect(bg?.color).toBe('#FFFFFF')
      })
    })

    describe('unregister()', () => {
      it('should remove a registered background', () => {
        registry.register(createSolidBackground('removable', '#000'))

        registry.unregister('removable')

        expect(registry.get('removable')).toBeUndefined()
      })

      it('should NOT allow unregistering the default background', () => {
        registry.unregister('default')

        expect(registry.get('default')).toBeDefined()
      })

      it('should handle unregistering non-existent background gracefully', () => {
        expect(() => registry.unregister('non-existent')).not.toThrow()
      })
    })

    describe('clear()', () => {
      it('should remove all registered backgrounds', () => {
        registry.register(createSolidBackground('bg-1', '#000'))
        registry.register(createSolidBackground('bg-2', '#111'))
        registry.register(createSolidBackground('bg-3', '#222'))

        registry.clear()

        expect(registry.list()).toHaveLength(1) // Only default remains
      })

      it('should re-create default background after clear', () => {
        registry.clear()

        const defaultBg = registry.getDefault()
        expect(defaultBg.id).toBe('default')
        expect(defaultBg.type).toBe('solid')
      })

      it('should clear screen mapping', () => {
        registry.setScreenMapping({ Home: 'home-bg', Settings: 'settings-bg' })

        registry.clear()

        expect(registry.getScreenMapping()).toEqual({})
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // RETRIEVAL TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Retrieval', () => {
    describe('get()', () => {
      it('should return background by ID', () => {
        const bg = createSolidBackground('my-bg', '#123456')
        registry.register(bg)

        expect(registry.get('my-bg')).toBe(bg)
      })

      it('should return undefined for non-existent ID', () => {
        expect(registry.get('non-existent')).toBeUndefined()
      })

      it('should return default background', () => {
        const defaultBg = registry.get('default')

        expect(defaultBg).toBeDefined()
        expect(defaultBg?.id).toBe('default')
      })
    })

    describe('getDefault()', () => {
      it('should return the default background configuration', () => {
        const defaultBg = registry.getDefault()

        expect(defaultBg.id).toBe('default')
        expect(defaultBg.type).toBe('solid')
        expect(defaultBg.color).toBe('#000000')
      })
    })

    describe('list()', () => {
      it('should return all registered backgrounds', () => {
        registry.register(createSolidBackground('bg-1', '#000'))
        registry.register(createGradientBackground('bg-2', ['#111', '#222']))

        const list = registry.list()

        expect(list).toHaveLength(3) // 2 + default
        expect(list.map((b) => b.id)).toContain('default')
        expect(list.map((b) => b.id)).toContain('bg-1')
        expect(list.map((b) => b.id)).toContain('bg-2')
      })
    })

    describe('setDefault()', () => {
      it('should update the default background', () => {
        const customDefault = createGradientBackground('custom-default', ['#FF0000', '#0000FF'])

        registry.setDefault(customDefault)

        expect(registry.getDefault()).toBe(customDefault)
      })

      it('should also register the new default', () => {
        const customDefault = createSolidBackground('new-default', '#FFFFFF')

        registry.setDefault(customDefault)

        expect(registry.get('default')).toBe(customDefault)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN MAPPING TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Screen Mapping', () => {
    describe('setScreenMapping()', () => {
      it('should set screen to background mapping', () => {
        const mapping: IScreenBackgrounds = {
          Home: 'home-bg',
          Settings: 'settings-bg',
        }

        registry.setScreenMapping(mapping)

        expect(registry.getScreenMapping()).toEqual(mapping)
      })

      it('should overwrite existing mapping', () => {
        registry.setScreenMapping({ Home: 'old-bg' })
        registry.setScreenMapping({ Settings: 'new-bg' })

        expect(registry.getScreenMapping()).toEqual({ Settings: 'new-bg' })
      })

      it('should not share reference with input mapping', () => {
        const mapping: IScreenBackgrounds = { Home: 'home-bg' }

        registry.setScreenMapping(mapping)

        // Modify original
        mapping['Settings'] = 'settings-bg'

        // Should not affect registry
        expect(registry.getScreenMapping()).toEqual({ Home: 'home-bg' })
      })
    })

    describe('getScreenMapping()', () => {
      it('should return current screen mapping', () => {
        registry.setScreenMapping({ Home: 'home-bg', Settings: 'settings-bg' })

        const mapping = registry.getScreenMapping()

        expect(mapping).toEqual({ Home: 'home-bg', Settings: 'settings-bg' })
      })

      it('should return a copy not a reference', () => {
        registry.setScreenMapping({ Home: 'home-bg' })

        const mapping = registry.getScreenMapping()
        mapping['Settings'] = 'hacked'

        // Should not affect registry
        expect(registry.getScreenMapping()).toEqual({ Home: 'home-bg' })
      })
    })

    describe('getForScreen()', () => {
      it('should return background for mapped screen', () => {
        const homeBg = createSolidBackground('home-bg', '#001122')
        registry.register(homeBg)
        registry.setScreenMapping({ Home: 'home-bg' })

        const bg = registry.getForScreen('Home')

        expect(bg).toBe(homeBg)
      })

      it('should return default for unmapped screen', () => {
        registry.setScreenMapping({ Home: 'home-bg' })

        const bg = registry.getForScreen('UnmappedScreen')

        expect(bg.id).toBe('default')
      })

      it('should return default when mapped background does not exist', () => {
        registry.setScreenMapping({ Home: 'non-existent-bg' })

        const bg = registry.getForScreen('Home')

        expect(bg.id).toBe('default')
      })

      it('should return default for empty screen ID', () => {
        const bg = registry.getForScreen('')

        expect(bg.id).toBe('default')
      })

      it('should work with multiple screen mappings', () => {
        const homeBg = createSolidBackground('home-bg', '#111')
        const settingsBg = createSolidBackground('settings-bg', '#222')
        const profileBg = createGradientBackground('profile-bg', ['#333', '#444'])

        registry.register(homeBg)
        registry.register(settingsBg)
        registry.register(profileBg)

        registry.setScreenMapping({
          Home: 'home-bg',
          Settings: 'settings-bg',
          Profile: 'profile-bg',
        })

        expect(registry.getForScreen('Home')).toBe(homeBg)
        expect(registry.getForScreen('Settings')).toBe(settingsBg)
        expect(registry.getForScreen('Profile')).toBe(profileBg)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKGROUND TYPE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Background Types', () => {
    it('should handle solid background config', () => {
      const solid: IBackgroundConfig = {
        id: 'solid-dark',
        type: 'solid',
        color: '#1A1A1A',
      }

      registry.register(solid)

      const retrieved = registry.get('solid-dark')
      expect(retrieved?.type).toBe('solid')
      expect(retrieved?.color).toBe('#1A1A1A')
    })

    it('should handle gradient background config', () => {
      const gradient: IBackgroundConfig = {
        id: 'gradient-sunset',
        type: 'gradient',
        gradient: {
          type: 'linear',
          colors: ['#FF6B6B', '#FFA500', '#FFD93D'],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        },
      }

      registry.register(gradient)

      const retrieved = registry.get('gradient-sunset')
      expect(retrieved?.type).toBe('gradient')
      expect(retrieved?.gradient?.colors).toEqual(['#FF6B6B', '#FFA500', '#FFD93D'])
    })

    it('should handle background config with screenIds', () => {
      const withScreens: IBackgroundConfig = {
        id: 'multi-screen-bg',
        type: 'solid',
        color: '#000',
        screenIds: ['Home', 'Dashboard', 'Profile'],
      }

      registry.register(withScreens)

      const retrieved = registry.get('multi-screen-bg')
      expect(retrieved?.screenIds).toEqual(['Home', 'Dashboard', 'Profile'])
    })

    it('should handle image background config', () => {
      const image: IBackgroundConfig = {
        id: 'image-bg',
        type: 'image',
        source: 'https://example.com/background.jpg',
        resizeMode: 'cover',
      }

      registry.register(image)

      const retrieved = registry.get('image-bg')
      expect(retrieved?.type).toBe('image')
      expect(retrieved?.source).toBe('https://example.com/background.jpg')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should support full workflow: register, map, retrieve', () => {
      // 1. Register backgrounds
      registry.register(createSolidBackground('primary-bg', '#0D2828'))
      registry.register(createGradientBackground('hero-bg', ['#FF6B6B', '#4ECDC4'], 45))
      registry.register(createSolidBackground('dark-bg', '#000000'))

      // 2. Set screen mapping
      registry.setScreenMapping({
        Home: 'hero-bg',
        Credentials: 'primary-bg',
        Settings: 'dark-bg',
        Profile: 'primary-bg',
      })

      // 3. Retrieve for screens
      expect(registry.getForScreen('Home').id).toBe('hero-bg')
      expect(registry.getForScreen('Credentials').id).toBe('primary-bg')
      expect(registry.getForScreen('Settings').id).toBe('dark-bg')
      expect(registry.getForScreen('Profile').id).toBe('primary-bg')
      expect(registry.getForScreen('Unknown').id).toBe('default')
    })

    it('should handle clear and rebuild workflow', () => {
      // Initial setup
      registry.register(createSolidBackground('bg-1', '#111'))
      registry.setScreenMapping({ Home: 'bg-1' })

      // Clear
      registry.clear()

      // Rebuild with new config
      registry.register(createGradientBackground('new-bg', ['#222', '#333']))
      registry.setScreenMapping({ Home: 'new-bg' })

      // Verify new state
      expect(registry.get('bg-1')).toBeUndefined()
      expect(registry.getForScreen('Home').id).toBe('new-bg')
    })
  })
})
