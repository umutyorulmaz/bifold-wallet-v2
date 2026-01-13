/**
 * useCardTheme Hook Tests
 *
 * Tests for the card theme hook that matches credentials to themes.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-native'

import { useCardTheme, useCardThemeById, useCardThemes } from '../../../../src/modules/theme/hooks/useCardTheme'
import { ThemeRegistry } from '../../../../src/modules/theme/registries/ThemeRegistry'
import { ThemeRegistryProvider } from '../../../../src/modules/theme/providers/ThemeRegistryProvider'
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

const universityTheme = createMockCardTheme('university', {
  matcher: { patterns: [{ type: 'issuerName', regex: 'University.*' }] },
  displayName: 'University Card',
  colors: {
    primary: '#1E40AF',
    secondary: '#FFFFFF',
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    bottomLine: '#1E40AF',
    accent: '#60A5FA',
  },
})

const governmentTheme = createMockCardTheme('government', {
  matcher: { patterns: [{ type: 'issuerName', regex: 'Government.*' }] },
  displayName: 'Government Card',
  colors: {
    primary: '#DC2626',
    secondary: '#FFFFFF',
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    bottomLine: '#DC2626',
    accent: '#F87171',
  },
})

const fallbackTheme = createMockCardTheme('custom-fallback', {
  matcher: { fallback: true },
  displayName: 'Custom Fallback',
})

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

const createRegistryWithThemes = (): ThemeRegistry => {
  const registry = new ThemeRegistry()
  registry.setCardThemes([universityTheme, governmentTheme, fallbackTheme])
  return registry
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCardTheme Hooks', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // useCardTheme TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useCardTheme()', () => {
    describe('without registry', () => {
      it('should return default card theme when no registry available', () => {
        const credential: ICredentialMatchInfo = {
          credDefId: 'some-cred-def',
          issuerName: 'Some Issuer',
        }

        const { result } = renderHook(() => useCardTheme(credential))

        expect(result.current.id).toBe('default')
        expect(result.current.matcher.fallback).toBe(true)
      })

      it('should have expected default colors', () => {
        const { result } = renderHook(() => useCardTheme({}))

        expect(result.current.colors.primary).toBe('#42803E')
        expect(result.current.colors.background).toBe('#FFFFFF')
      })
    })

    describe('with registry', () => {
      it('should match credential to theme by issuerName', () => {
        const registry = createRegistryWithThemes()
        const credential: ICredentialMatchInfo = {
          issuerName: 'University of Test',
        }

        const { result } = renderHook(() => useCardTheme(credential), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('university')
        expect(result.current.displayName).toBe('University Card')
      })

      it('should match government credential', () => {
        const registry = createRegistryWithThemes()
        const credential: ICredentialMatchInfo = {
          issuerName: 'Government of Canada',
        }

        const { result } = renderHook(() => useCardTheme(credential), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('government')
      })

      it('should return fallback theme for unmatched credentials', () => {
        const registry = createRegistryWithThemes()
        const credential: ICredentialMatchInfo = {
          issuerName: 'Unknown Issuer Corp',
        }

        const { result } = renderHook(() => useCardTheme(credential), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('custom-fallback')
      })

      it('should match by credDefId pattern', () => {
        const registry = new ThemeRegistry()
        const credDefTheme = createMockCardTheme('specific-cred', {
          matcher: { patterns: [{ type: 'credDefId', regex: 'ABC:123:schema' }] },
        })
        registry.setCardThemes([credDefTheme])

        const credential: ICredentialMatchInfo = {
          credDefId: 'ABC:123:schema:CL:456',
        }

        const { result } = renderHook(() => useCardTheme(credential), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('specific-cred')
      })

      it('should match by schemaName pattern', () => {
        const registry = new ThemeRegistry()
        const schemaTheme = createMockCardTheme('student-schema', {
          matcher: { patterns: [{ type: 'schemaName', regex: 'student_id' }] },
        })
        registry.setCardThemes([schemaTheme])

        const credential: ICredentialMatchInfo = {
          schemaName: 'student_id_v2',
        }

        const { result } = renderHook(() => useCardTheme(credential), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('student-schema')
      })

      it('should match by connectionLabel pattern', () => {
        const registry = new ThemeRegistry()
        const connTheme = createMockCardTheme('acme-conn', {
          matcher: { patterns: [{ type: 'connectionLabel', regex: 'ACME' }] },
        })
        registry.setCardThemes([connTheme])

        const credential: ICredentialMatchInfo = {
          connectionLabel: 'ACME Corporation',
        }

        const { result } = renderHook(() => useCardTheme(credential), {
          wrapper: createWrapper(registry),
        })

        expect(result.current.id).toBe('acme-conn')
      })
    })

    describe('memoization', () => {
      it('should return same theme object for same credential', () => {
        const registry = createRegistryWithThemes()
        const credential: ICredentialMatchInfo = {
          issuerName: 'University of Test',
        }

        const { result, rerender } = renderHook(() => useCardTheme(credential), {
          wrapper: createWrapper(registry),
        })

        const firstResult = result.current

        rerender({})

        expect(result.current).toBe(firstResult)
      })

      it('should return new theme when credential changes', () => {
        const registry = createRegistryWithThemes()

        const { result, rerender } = renderHook(
          ({ credential }) => useCardTheme(credential),
          {
            wrapper: createWrapper(registry),
            initialProps: {
              credential: { issuerName: 'University of Test' } as ICredentialMatchInfo,
            },
          }
        )

        expect(result.current.id).toBe('university')

        rerender({ credential: { issuerName: 'Government of Canada' } })

        expect(result.current.id).toBe('government')
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useCardThemeById TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useCardThemeById()', () => {
    it('should return default theme when no registry', () => {
      const { result } = renderHook(() => useCardThemeById('university'))

      expect(result.current.id).toBe('default')
    })

    it('should return theme by ID', () => {
      const registry = createRegistryWithThemes()

      const { result } = renderHook(() => useCardThemeById('university'), {
        wrapper: createWrapper(registry),
      })

      expect(result.current.id).toBe('university')
      expect(result.current.displayName).toBe('University Card')
    })

    it('should return default theme for non-existent ID', () => {
      const registry = createRegistryWithThemes()

      const { result } = renderHook(() => useCardThemeById('non-existent'), {
        wrapper: createWrapper(registry),
      })

      // Returns the registry's default (fallback) theme
      expect(result.current.id).toBe('custom-fallback')
    })

    it('should update when ID changes', () => {
      const registry = createRegistryWithThemes()

      const { result, rerender } = renderHook(({ id }) => useCardThemeById(id), {
        wrapper: createWrapper(registry),
        initialProps: { id: 'university' },
      })

      expect(result.current.id).toBe('university')

      rerender({ id: 'government' })

      expect(result.current.id).toBe('government')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // useCardThemes TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('useCardThemes()', () => {
    it('should return array with default theme when no registry', () => {
      const { result } = renderHook(() => useCardThemes())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].id).toBe('default')
    })

    it('should return all registered card themes', () => {
      const registry = createRegistryWithThemes()

      const { result } = renderHook(() => useCardThemes(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toHaveLength(3)
      expect(result.current.map((t) => t.id)).toContain('university')
      expect(result.current.map((t) => t.id)).toContain('government')
      expect(result.current.map((t) => t.id)).toContain('custom-fallback')
    })

    it('should return empty array if no themes registered', () => {
      const registry = new ThemeRegistry()
      // Don't set any card themes

      const { result } = renderHook(() => useCardThemes(), {
        wrapper: createWrapper(registry),
      })

      expect(result.current).toHaveLength(0)
    })
  })
})
