/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Theme Test Fixtures
 *
 * Mock data for testing theme-related functionality.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK THEME MANIFESTS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockThemeManifests = {
  tealDark: {
    meta: {
      id: 'teal-dark',
      name: 'Teal Dark',
      version: '1.0.0',
      description: 'A dark theme with teal accents',
    },
    features: {
      supportsCardThemes: true,
      supportsBackgrounds: true,
      supportsTabBar: true,
    },
    colors: {
      brand: {
        primary: '#00BFA5',
        secondary: '#00897B',
        primaryBackground: '#121212',
        secondaryBackground: '#1E1E1E',
        text: '#FFFFFF',
      },
      semantic: {
        error: '#CF6679',
        success: '#00E676',
        focus: '#00BFA5',
      },
    },
  },
  lightBlue: {
    meta: {
      id: 'light-blue',
      name: 'Light Blue',
      version: '1.0.0',
      description: 'A light theme with blue accents',
    },
    features: {
      supportsCardThemes: true,
      supportsBackgrounds: true,
      supportsTabBar: true,
    },
    colors: {
      brand: {
        primary: '#2196F3',
        secondary: '#1976D2',
        primaryBackground: '#FFFFFF',
        secondaryBackground: '#F5F5F5',
        text: '#212121',
      },
      semantic: {
        error: '#F44336',
        success: '#4CAF50',
        focus: '#2196F3',
      },
    },
  },
  minimal: {
    meta: {
      id: 'minimal',
      name: 'Minimal',
      version: '1.0.0',
      description: 'A minimal theme',
    },
    features: {
      supportsCardThemes: false,
      supportsBackgrounds: false,
      supportsTabBar: false,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK CARD THEMES
// ═══════════════════════════════════════════════════════════════════════════════

export const mockCardThemes = {
  default: {
    id: 'default',
    layout: 'default',
    colors: {
      primary: '#00BFA5',
      secondary: '#FFFFFF',
      background: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      border: '#333333',
    },
    matcher: {
      fallback: true,
    },
  },
  university: {
    id: 'university',
    layout: 'card-with-logo',
    colors: {
      primary: '#1E3A5F',
      secondary: '#FFFFFF',
      background: '#1E3A5F',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      border: '#2C4A6E',
    },
    matcher: {
      schemaName: 'University Degree',
      issuerName: /university/i,
    },
    logo: {
      uri: 'https://example.com/logo.png',
    },
  },
  government: {
    id: 'government',
    layout: 'official',
    colors: {
      primary: '#003366',
      secondary: '#FFFFFF',
      background: '#003366',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#004488',
    },
    matcher: {
      credDefId: /gov/i,
      connectionLabel: /government/i,
    },
  },
  healthcare: {
    id: 'healthcare',
    layout: 'card-with-logo',
    colors: {
      primary: '#00695C',
      secondary: '#FFFFFF',
      background: '#00695C',
      text: '#FFFFFF',
      textSecondary: '#B2DFDB',
      border: '#00796B',
    },
    matcher: {
      schemaName: /health|medical/i,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK BACKGROUND CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockBackgroundConfigs = {
  default: {
    id: 'default',
    type: 'solid' as const,
    color: '#000000',
  },
  gradientDark: {
    id: 'gradient-dark',
    type: 'gradient' as const,
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  gradientLight: {
    id: 'gradient-light',
    type: 'gradient' as const,
    colors: ['#FFFFFF', '#F5F5F5', '#E0E0E0'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  solidTeal: {
    id: 'solid-teal',
    type: 'solid' as const,
    color: '#004D40',
  },
  image: {
    id: 'image-bg',
    type: 'image' as const,
    source: { uri: 'https://example.com/background.jpg' },
    resizeMode: 'cover' as const,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK SCREEN BACKGROUNDS MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

export const mockScreenBackgrounds = {
  Home: 'gradient-dark',
  Credentials: 'gradient-dark',
  Settings: 'solid-teal',
  Chat: 'default',
  Onboarding: 'gradient-light',
  PINEnter: 'gradient-dark',
  PINCreate: 'gradient-dark',
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK TAB BAR CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockTabBarConfigs = {
  default: {
    variant: 'default' as const,
    style: {
      backgroundColor: '#1E1E1E',
      height: 80,
      borderTopWidth: 1,
      borderTopColor: '#333333',
    },
    colors: {
      active: '#00BFA5',
      inactive: '#757575',
      background: '#1E1E1E',
    },
    badge: {
      backgroundColor: '#FF5252',
      textColor: '#FFFFFF',
    },
    tabs: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'credentials', label: 'Credentials', icon: 'wallet' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
    variants: {
      default: {
        position: 'bottom' as const,
        floating: false,
      },
      floating: {
        position: 'bottom' as const,
        floating: true,
        margin: 16,
        borderRadius: 24,
      },
      minimal: {
        position: 'bottom' as const,
        floating: false,
        height: 60,
        showLabels: false,
      },
    },
  },
  floating: {
    variant: 'floating' as const,
    style: {
      backgroundColor: '#1E1E1E',
      height: 70,
      borderRadius: 35,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    colors: {
      active: '#00BFA5',
      inactive: '#757575',
      background: '#1E1E1E',
    },
    badge: {
      backgroundColor: '#FF5252',
      textColor: '#FFFFFF',
    },
    tabs: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'credentials', label: 'Credentials', icon: 'wallet' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK CREDENTIAL MATCH INFO
// ═══════════════════════════════════════════════════════════════════════════════

export const mockCredentialMatchInfo = {
  university: {
    credDefId: 'ABC123:3:CL:12345:university_degree',
    schemaName: 'University Degree',
    issuerName: 'State University',
    connectionLabel: 'State University Issuer',
  },
  government: {
    credDefId: 'GOV456:3:CL:67890:drivers_license',
    schemaName: 'Drivers License',
    issuerName: 'DMV',
    connectionLabel: 'Government DMV',
  },
  healthcare: {
    credDefId: 'HEALTH789:3:CL:11111:health_card',
    schemaName: 'Health Insurance Card',
    issuerName: 'Health Insurance Co',
    connectionLabel: 'Healthcare Provider',
  },
  generic: {
    credDefId: 'XYZ000:3:CL:00000:generic_credential',
    schemaName: 'Generic Credential',
    issuerName: 'Generic Issuer',
    connectionLabel: 'Generic Connection',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK VARIABLE CONTEXTS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockVariableContext = {
  colors: {
    primary: '#00BFA5',
    secondary: '#00897B',
    background: '#121212',
    text: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK MODULAR THEME CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export const mockModularThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  colorPalette: {
    brand: {
      primary: '#00BFA5',
      secondary: '#00897B',
      accent: '#FFD740',
    },
    background: {
      dark: '#121212',
      darker: '#0A0A0A',
      medium: '#1E1E1E',
      light: '#2C2C2C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      muted: '#757575',
      inverse: '#000000',
    },
    ui: {
      success: '#00E676',
      warning: '#FFAB00',
      error: '#FF5252',
      info: '#448AFF',
    },
    card: {
      background: '#1E1E1E',
      border: '#333333',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const createMockThemeManifest = (overrides: any = {}) => ({
  meta: {
    id: `theme-${Date.now()}`,
    name: 'Test Theme',
    version: '1.0.0',
    ...overrides.meta,
  },
  features: {
    supportsCardThemes: true,
    supportsBackgrounds: true,
    supportsTabBar: true,
    ...overrides.features,
  },
  ...overrides,
})

export const createMockCardTheme = (overrides: any = {}) => ({
  id: `card-theme-${Date.now()}`,
  layout: 'default',
  colors: {
    primary: '#00BFA5',
    secondary: '#FFFFFF',
    background: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    ...overrides.colors,
  },
  matcher: {
    fallback: false,
    ...overrides.matcher,
  },
  ...overrides,
})

export const createMockBackgroundConfig = (
  type: 'solid' | 'gradient' | 'image' = 'solid',
  overrides: any = {}
) => {
  const base = {
    id: `bg-${Date.now()}`,
    type,
  }

  if (type === 'solid') {
    return { ...base, color: '#000000', ...overrides }
  }

  if (type === 'gradient') {
    return {
      ...base,
      colors: ['#1a1a2e', '#16213e'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      ...overrides,
    }
  }

  return {
    ...base,
    source: { uri: 'https://example.com/bg.jpg' },
    resizeMode: 'cover',
    ...overrides,
  }
}

export const createMockTabBarConfig = (overrides: any = {}) => ({
  variant: 'default' as const,
  style: {
    backgroundColor: '#1E1E1E',
    height: 80,
    ...overrides.style,
  },
  colors: {
    active: '#00BFA5',
    inactive: '#757575',
    background: '#1E1E1E',
    ...overrides.colors,
  },
  badge: {
    backgroundColor: '#FF5252',
    textColor: '#FFFFFF',
    ...overrides.badge,
  },
  tabs: overrides.tabs ?? [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'credentials', label: 'Credentials', icon: 'wallet' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
  ...overrides,
})
