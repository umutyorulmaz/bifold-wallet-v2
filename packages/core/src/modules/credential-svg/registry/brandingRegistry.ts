import { SchoolBranding } from '../types'

// Import existing SVG logos from assets
import CapeFearLogo from '../../../assets/img/cape-fear-logo-new.svg'
import NHCSLogo from '../../../assets/img/NHCSlogo.svg'
import PenderLogo from '../../../assets/img/PenderLogo.svg'
import MiamiDadeLogo from '../../../assets/img/MiamiDadeLogo.svg'
import LogoGraduate from '../../../assets/img/LogoGraduate.svg'

/**
 * Registry of school branding configurations
 * Maps school identifiers to their visual branding (logos, colors)
 */
export const brandingRegistry: Record<string, SchoolBranding> = {
  'cape-fear': {
    name: 'Cape Fear Community College',
    shortName: 'CFCC',
    logo: CapeFearLogo,
    colors: {
      primary: '#043564',
      secondary: '#FFFFFF',
      accent: '#016C72',
      text: '#FFFFFF',
      textInverse: '#043564',
    },
  },
  nhcs: {
    name: 'New Hanover County Schools',
    shortName: 'NHCS',
    logo: NHCSLogo,
    colors: {
      primary: '#0065A4',
      secondary: '#FFFFFF',
      accent: '#172554',
      text: '#333333',
      textInverse: '#FFFFFF',
    },
  },
  pender: {
    name: 'Pender County Schools',
    shortName: 'PCS',
    logo: PenderLogo,
    colors: {
      primary: '#1E3A5F',
      secondary: '#FFFFFF',
      accent: '#0077B6',
      text: '#333333',
      textInverse: '#FFFFFF',
    },
  },
  miami: {
    name: 'Miami-Dade County Public Schools',
    shortName: 'M-DCPS',
    logo: MiamiDadeLogo,
    colors: {
      primary: '#23408F',
      secondary: '#FFFFFF',
      accent: '#092940',
      text: '#333333',
      textInverse: '#FFFFFF',
    },
  },
  default: {
    name: 'Student',
    shortName: '',
    logo: LogoGraduate,
    colors: {
      primary: '#25272A',
      secondary: '#FFFFFF',
      accent: '#0D7377',
      text: '#FFFFFF',
      textInverse: '#25272A',
    },
  },
}

/**
 * School identifier patterns for matching credDefId or school names
 */
const schoolPatterns: Record<string, string[]> = {
  'cape-fear': ['cfcc', 'cape fear', 'capefear'],
  nhcs: ['nhcs', 'new hanover', 'newhanover'],
  pender: ['pcs', 'pender'],
  miami: ['m-dcps', 'mdcps', 'miami', 'dade'],
}

/**
 * Get branding configuration for a credential based on credDefId or school name
 */
export function getBrandingForCredential(
  credDefId?: string,
  schoolName?: string
): SchoolBranding {
  const searchText = `${credDefId || ''} ${schoolName || ''}`.toLowerCase()

  // Check each school's patterns
  for (const [schoolKey, patterns] of Object.entries(schoolPatterns)) {
    for (const pattern of patterns) {
      if (searchText.includes(pattern)) {
        return brandingRegistry[schoolKey]
      }
    }
  }

  // Return default branding if no match found
  return brandingRegistry.default
}

/**
 * Get branding by school key directly
 */
export function getBrandingByKey(key: string): SchoolBranding {
  return brandingRegistry[key] || brandingRegistry.default
}

/**
 * Get all available school keys
 */
export function getAvailableSchoolKeys(): string[] {
  return Object.keys(brandingRegistry)
}
