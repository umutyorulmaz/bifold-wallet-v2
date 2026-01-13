/**
 * CardThemeRegistry Tests
 *
 * Tests for credential card theme management and pattern matching.
 */

import { CardThemeRegistry, createCardThemeRegistry, ICardThemeRegistry } from '../../../../src/modules/theme/registries/CardThemeRegistry'
import { ICardTheme, ICredentialMatchInfo } from '../../../../src/modules/theme/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════════

const createMockCardTheme = (id: string, options: Partial<ICardTheme> = {}): ICardTheme => ({
  id,
  matcher: options.matcher ?? { patterns: [{ type: 'credDefId', regex: id }] },
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
  ...options,
})

const createFallbackTheme = (): ICardTheme =>
  createMockCardTheme('fallback', {
    matcher: { fallback: true },
    displayName: 'Fallback Card',
  })

const createCredentialMatchInfo = (options: Partial<ICredentialMatchInfo> = {}): ICredentialMatchInfo => ({
  credDefId: options.credDefId,
  issuerName: options.issuerName,
  schemaName: options.schemaName,
  connectionLabel: options.connectionLabel,
})

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('CardThemeRegistry', () => {
  let registry: ICardThemeRegistry

  beforeEach(() => {
    registry = new CardThemeRegistry()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // FACTORY FUNCTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createCardThemeRegistry()', () => {
    it('should create a new CardThemeRegistry instance', () => {
      const created = createCardThemeRegistry()

      expect(created).toBeInstanceOf(CardThemeRegistry)
    })

    it('should have default theme on creation', () => {
      const created = createCardThemeRegistry()

      const defaultTheme = created.getDefault()
      expect(defaultTheme).toBeDefined()
      expect(defaultTheme.id).toBe('default')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Registration', () => {
    describe('register()', () => {
      it('should register a card theme', () => {
        const theme = createMockCardTheme('university')

        registry.register(theme)

        expect(registry.getById('university')).toBe(theme)
      })

      it('should update default theme when registering fallback matcher', () => {
        const fallback = createFallbackTheme()

        registry.register(fallback)

        expect(registry.getDefault()).toBe(fallback)
      })

      it('should not update default when registering non-fallback theme', () => {
        const theme = createMockCardTheme('university')
        const defaultBefore = registry.getDefault()

        registry.register(theme)

        expect(registry.getDefault()).toBe(defaultBefore)
      })

      it('should allow registering multiple themes', () => {
        registry.register(createMockCardTheme('theme-1'))
        registry.register(createMockCardTheme('theme-2'))
        registry.register(createMockCardTheme('theme-3'))

        expect(registry.list()).toHaveLength(3)
      })

      it('should overwrite theme with same ID', () => {
        registry.register(createMockCardTheme('theme-1', { displayName: 'Original' }))
        registry.register(createMockCardTheme('theme-1', { displayName: 'Updated' }))

        expect(registry.getById('theme-1')?.displayName).toBe('Updated')
        expect(registry.list()).toHaveLength(1)
      })
    })

    describe('unregister()', () => {
      it('should remove a registered theme', () => {
        registry.register(createMockCardTheme('theme-1'))

        registry.unregister('theme-1')

        expect(registry.getById('theme-1')).toBeUndefined()
      })

      it('should reset default when unregistering fallback theme', () => {
        const fallback = createFallbackTheme()
        registry.register(fallback)

        registry.unregister('fallback')

        const defaultTheme = registry.getDefault()
        expect(defaultTheme.id).toBe('default')
        expect(defaultTheme).not.toBe(fallback)
      })

      it('should handle unregistering non-existent theme gracefully', () => {
        expect(() => registry.unregister('non-existent')).not.toThrow()
      })
    })

    describe('clear()', () => {
      it('should remove all registered themes', () => {
        registry.register(createMockCardTheme('theme-1'))
        registry.register(createMockCardTheme('theme-2'))
        registry.register(createMockCardTheme('theme-3'))

        registry.clear()

        expect(registry.list()).toHaveLength(0)
      })

      it('should reset default theme', () => {
        const fallback = createFallbackTheme()
        registry.register(fallback)

        registry.clear()

        const defaultTheme = registry.getDefault()
        expect(defaultTheme.id).toBe('default')
        expect(defaultTheme).not.toBe(fallback)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // RETRIEVAL TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Retrieval', () => {
    describe('getById()', () => {
      it('should return theme by ID', () => {
        const theme = createMockCardTheme('university')
        registry.register(theme)

        expect(registry.getById('university')).toBe(theme)
      })

      it('should return undefined for non-existent ID', () => {
        expect(registry.getById('non-existent')).toBeUndefined()
      })
    })

    describe('getDefault()', () => {
      it('should return built-in default theme initially', () => {
        const defaultTheme = registry.getDefault()

        expect(defaultTheme).toBeDefined()
        expect(defaultTheme.id).toBe('default')
        expect(defaultTheme.matcher.fallback).toBe(true)
      })
    })

    describe('list()', () => {
      it('should return empty array when no themes registered', () => {
        expect(registry.list()).toEqual([])
      })

      it('should return all registered themes', () => {
        registry.register(createMockCardTheme('theme-1'))
        registry.register(createMockCardTheme('theme-2'))

        const list = registry.list()

        expect(list).toHaveLength(2)
        expect(list.map((t) => t.id)).toContain('theme-1')
        expect(list.map((t) => t.id)).toContain('theme-2')
      })
    })

    describe('setDefault()', () => {
      it('should update default theme', () => {
        const customDefault = createMockCardTheme('custom-default')

        registry.setDefault(customDefault)

        expect(registry.getDefault()).toBe(customDefault)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // PATTERN MATCHING TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Pattern Matching', () => {
    describe('getTheme()', () => {
      describe('credDefId matching', () => {
        it('should match by credDefId pattern', () => {
          const theme = createMockCardTheme('university', {
            matcher: { patterns: [{ type: 'credDefId', regex: 'university.*degree' }] },
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({
            credDefId: 'university:abc123:degree',
          })

          expect(registry.getTheme(credential)).toBe(theme)
        })

        it('should be case-insensitive', () => {
          const theme = createMockCardTheme('university', {
            matcher: { patterns: [{ type: 'credDefId', regex: 'UNIVERSITY' }] },
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({
            credDefId: 'university:abc123:degree',
          })

          expect(registry.getTheme(credential)).toBe(theme)
        })
      })

      describe('issuerName matching', () => {
        it('should match by issuerName pattern', () => {
          const theme = createMockCardTheme('government', {
            matcher: { patterns: [{ type: 'issuerName', regex: 'Government.*' }] },
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({
            issuerName: 'Government of Canada',
          })

          expect(registry.getTheme(credential)).toBe(theme)
        })
      })

      describe('schemaName matching', () => {
        it('should match by schemaName pattern', () => {
          const theme = createMockCardTheme('student-id', {
            matcher: { patterns: [{ type: 'schemaName', regex: 'student.*id' }] },
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({
            schemaName: 'student-photo-id',
          })

          expect(registry.getTheme(credential)).toBe(theme)
        })
      })

      describe('connectionLabel matching', () => {
        it('should match by connectionLabel pattern', () => {
          const theme = createMockCardTheme('acme', {
            matcher: { patterns: [{ type: 'connectionLabel', regex: 'ACME.*' }] },
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({
            connectionLabel: 'ACME Corporation',
          })

          expect(registry.getTheme(credential)).toBe(theme)
        })
      })

      describe('multiple patterns', () => {
        it('should match if any pattern matches (OR logic)', () => {
          const theme = createMockCardTheme('multi', {
            matcher: {
              patterns: [
                { type: 'issuerName', regex: 'First Issuer' },
                { type: 'issuerName', regex: 'Second Issuer' },
              ],
            },
          })
          registry.register(theme)

          const credential1 = createCredentialMatchInfo({ issuerName: 'First Issuer' })
          const credential2 = createCredentialMatchInfo({ issuerName: 'Second Issuer' })

          expect(registry.getTheme(credential1)).toBe(theme)
          expect(registry.getTheme(credential2)).toBe(theme)
        })

        it('should match different pattern types', () => {
          const theme = createMockCardTheme('mixed', {
            matcher: {
              patterns: [
                { type: 'credDefId', regex: 'specific-cred-def' },
                { type: 'issuerName', regex: 'Specific Issuer' },
              ],
            },
          })
          registry.register(theme)

          const credential1 = createCredentialMatchInfo({ credDefId: 'specific-cred-def' })
          const credential2 = createCredentialMatchInfo({ issuerName: 'Specific Issuer' })

          expect(registry.getTheme(credential1)).toBe(theme)
          expect(registry.getTheme(credential2)).toBe(theme)
        })
      })

      describe('fallback behavior', () => {
        it('should return default theme when no pattern matches', () => {
          registry.register(
            createMockCardTheme('specific', {
              matcher: { patterns: [{ type: 'credDefId', regex: 'very-specific-pattern' }] },
            })
          )

          const credential = createCredentialMatchInfo({
            credDefId: 'something-else',
            issuerName: 'Unknown Issuer',
          })

          const theme = registry.getTheme(credential)
          expect(theme.id).toBe('default')
        })

        it('should skip fallback themes in pattern matching', () => {
          const fallback = createFallbackTheme()
          registry.register(fallback)

          const credential = createCredentialMatchInfo({
            credDefId: 'fallback', // Matches the theme ID but should not pattern match
          })

          // Should still get fallback, but via fallback behavior not pattern match
          const theme = registry.getTheme(credential)
          expect(theme).toBe(fallback)
        })

        it('should use registered fallback theme', () => {
          const customFallback = createMockCardTheme('custom-fallback', {
            matcher: { fallback: true },
            displayName: 'Custom Fallback',
          })
          registry.register(customFallback)

          const credential = createCredentialMatchInfo({
            credDefId: 'unmatched',
          })

          const theme = registry.getTheme(credential)
          expect(theme).toBe(customFallback)
        })
      })

      describe('empty patterns', () => {
        it('should not match theme with empty patterns array', () => {
          const theme = createMockCardTheme('no-patterns', {
            matcher: { patterns: [] },
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({ credDefId: 'anything' })

          const result = registry.getTheme(credential)
          expect(result.id).toBe('default')
        })

        it('should not match theme with undefined patterns', () => {
          const theme = createMockCardTheme('no-patterns', {
            matcher: {},
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({ credDefId: 'anything' })

          const result = registry.getTheme(credential)
          expect(result.id).toBe('default')
        })
      })

      describe('undefined credential values', () => {
        it('should not match when credential value is undefined', () => {
          const theme = createMockCardTheme('specific', {
            matcher: { patterns: [{ type: 'credDefId', regex: '.*' }] },
          })
          registry.register(theme)

          const credential = createCredentialMatchInfo({
            // credDefId is undefined
            issuerName: 'Some Issuer',
          })

          // The .* pattern won't match undefined
          const result = registry.getTheme(credential)
          expect(result.id).toBe('default')
        })
      })

      describe('priority order', () => {
        it('should match first registered theme that matches', () => {
          registry.register(
            createMockCardTheme('first', {
              matcher: { patterns: [{ type: 'issuerName', regex: 'Issuer' }] },
            })
          )
          registry.register(
            createMockCardTheme('second', {
              matcher: { patterns: [{ type: 'issuerName', regex: 'Issuer' }] },
            })
          )

          const credential = createCredentialMatchInfo({ issuerName: 'Issuer' })

          const result = registry.getTheme(credential)
          expect(result.id).toBe('first')
        })
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // REGEX PATTERN TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Regex Patterns', () => {
    it('should support exact match patterns', () => {
      const theme = createMockCardTheme('exact', {
        matcher: { patterns: [{ type: 'credDefId', regex: '^exact-match$' }] },
      })
      registry.register(theme)

      expect(registry.getTheme(createCredentialMatchInfo({ credDefId: 'exact-match' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ credDefId: 'exact-match-extra' })).id).toBe('default')
    })

    it('should support wildcard patterns', () => {
      const theme = createMockCardTheme('wildcard', {
        matcher: { patterns: [{ type: 'issuerName', regex: '.*University.*' }] },
      })
      registry.register(theme)

      expect(registry.getTheme(createCredentialMatchInfo({ issuerName: 'State University' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ issuerName: 'University of Tech' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ issuerName: 'MIT' })).id).toBe('default')
    })

    it('should support character class patterns', () => {
      const theme = createMockCardTheme('version', {
        matcher: { patterns: [{ type: 'schemaName', regex: 'schema-v[0-9]+' }] },
      })
      registry.register(theme)

      expect(registry.getTheme(createCredentialMatchInfo({ schemaName: 'schema-v1' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ schemaName: 'schema-v123' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ schemaName: 'schema-vX' })).id).toBe('default')
    })

    it('should support alternation patterns', () => {
      const theme = createMockCardTheme('alt', {
        matcher: { patterns: [{ type: 'connectionLabel', regex: 'org-a|org-b|org-c' }] },
      })
      registry.register(theme)

      expect(registry.getTheme(createCredentialMatchInfo({ connectionLabel: 'org-a' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ connectionLabel: 'org-b' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ connectionLabel: 'org-c' }))).toBe(theme)
      expect(registry.getTheme(createCredentialMatchInfo({ connectionLabel: 'org-d' })).id).toBe('default')
    })
  })
})
