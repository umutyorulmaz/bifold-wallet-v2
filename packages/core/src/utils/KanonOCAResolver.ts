import { Agent } from '@credo-ts/core'
import {
  DefaultOCABundleResolver,
  OCABundle,
  OCABundleResolveAllParams,
  OCABundleResolverOptions,
  Identifiers,
  CredentialOverlay,
} from '@bifold/oca/build/legacy'
import { BrandingOverlay } from '@bifold/oca'

/**
 * Custom OCA Bundle Resolver that extends DefaultOCABundleResolver
 * to support fetching OCA overlays from Kanon credential definitions.
 *
 * When a credential definition ID is not found in the local bundle,
 * it attempts to fetch the overlay from the credential definition metadata.
 */
export class KanonOCABundleResolver extends DefaultOCABundleResolver {
  private agent: Agent | null = null
  private cachedOverlays: Map<string, OCABundle> = new Map()

  constructor(bundle?: Record<string, unknown>, options?: OCABundleResolverOptions) {
    super(bundle as any, options)
  }

  /**
   * Set the agent instance for fetching credential definitions
   */
  public setAgent(agent: Agent) {
    console.log('[KanonOCA] setAgent() called, agent set successfully')
    this.agent = agent
  }

  /**
   * Resolve OCA bundle - first tries local bundle, then fetches from Kanon if not found
   */
  public async resolve(params: { identifiers: Identifiers; language?: string }): Promise<OCABundle | undefined> {
    const credDefId = params.identifiers.credentialDefinitionId
    console.log('[KanonOCA] resolve() called with credDefId:', credDefId)

    // First try the default resolver (local bundles)
    const localBundle = await super.resolve(params)
    if (localBundle) {
      console.log('[KanonOCA] Found local bundle')
      return localBundle
    }

    // Check cache
    if (credDefId && this.cachedOverlays.has(credDefId)) {
      console.log('[KanonOCA] Found cached overlay')
      return this.cachedOverlays.get(credDefId)
    }

    // Try to fetch from Kanon credential definition
    if (credDefId && this.agent) {
      try {
        console.log('[KanonOCA] Fetching from Kanon ledger...')
        const kanonBundle = await this.fetchKanonOCA(credDefId, params.language)
        if (kanonBundle) {
          this.cachedOverlays.set(credDefId, kanonBundle)
          console.log('[KanonOCA] Successfully fetched and cached Kanon bundle')
          return kanonBundle
        }
      } catch (error) {
        console.log('[KanonOCA] Error fetching Kanon bundle:', error)
      }
    } else {
      console.log('[KanonOCA] No credDefId or agent, skipping Kanon fetch. credDefId:', credDefId, 'agent:', !!this.agent)
    }

    return undefined
  }

  /**
   * Fetch OCA overlay from Kanon credential definition metadata
   */
  private async fetchKanonOCA(credDefId: string, language?: string): Promise<OCABundle | undefined> {
    if (!this.agent) {
      console.log('[KanonOCA] No agent set, skipping overlay fetch')
      return undefined
    }

    try {
      console.log('[KanonOCA] Fetching overlay for credDefId:', credDefId)
      const result = await this.agent.modules.anoncreds.getCredentialDefinition(credDefId)
      console.log('[KanonOCA] Got credential definition result:', JSON.stringify(result, null, 2))

      // Check for overlay in metadata
      const overlay = (result.credentialDefinitionMetadata as any)?.overlay
      if (!overlay) {
        console.log('[KanonOCA] No overlay found in metadata')
        return undefined
      }

      console.log('[KanonOCA] Found overlay:', JSON.stringify(overlay, null, 2))
      // Convert Kanon overlay format to OCA bundle format
      const bundle = this.convertKanonOverlayToOCABundle(overlay, credDefId, language)
      console.log('[KanonOCA] Converted to OCA bundle:', JSON.stringify(bundle, null, 2))
      return bundle
    } catch (error) {
      console.log('[KanonOCA] Error fetching overlay:', error)
      // Silently fail - credential will use default overlay
      return undefined
    }
  }

  /**
   * Convert Kanon overlay format to OCA bundle format
   * Handles both snake_case (from server) and camelCase formats
   */
  private convertKanonOverlayToOCABundle(
    overlay: KanonOverlay,
    credDefId: string,
    language?: string
  ): OCABundle {
    const lang = language || 'en'
    const branding = overlay.branding as any

    // Build capture base
    const captureBase = {
      type: 'spec/capture_base/1.0',
      digest: credDefId,
      classification: overlay.classification || '',
      attributes: overlay.attributes || {},
      flagged_attributes: overlay.flaggedAttributes || [],
    }

    // Build overlays array
    const overlays: any[] = []

    // Meta overlay - handle both snake_case and camelCase
    if (overlay.meta) {
      const meta = overlay.meta as any
      overlays.push({
        type: 'spec/overlays/meta/1.0',
        capture_base: credDefId,
        language: lang,
        name: meta.name || '',
        description: meta.description || '',
        issuer: meta.issuer || '',
        issuer_description: meta.issuer_description || meta.issuerDescription || '',
        issuer_url: meta.issuer_url || meta.issuerUrl || '',
        credential_help_text: meta.credential_help_text || meta.credentialHelpText || '',
        credential_support_url: meta.credential_support_url || meta.credentialSupportUrl || '',
      })
    }

    // Label overlay
    if (overlay.labels) {
      overlays.push({
        type: 'spec/overlays/label/1.0',
        capture_base: credDefId,
        language: lang,
        attribute_labels: overlay.labels,
      })
    }

    // Branding overlay - handle both snake_case and camelCase from server
    if (branding) {
      overlays.push({
        type: 'aries/overlays/branding/0.1',
        capture_base: credDefId,
        language: lang,
        logo: branding.logo || '',
        background_color: branding.background_color || branding.backgroundColor || '#FFFFFF',
        background_image: branding.background_image || branding.backgroundImage || '',
        background_image_slice: branding.background_image_slice || branding.backgroundImageSlice || '',
        primary_background_color: branding.primary_background_color || branding.primaryBackgroundColor || '',
        secondary_background_color: branding.secondary_background_color || branding.secondaryBackgroundColor || '',
        primary_attribute: branding.primary_attribute || branding.primaryAttribute || '',
        secondary_attribute: branding.secondary_attribute || branding.secondaryAttribute || '',
        header: branding.header || { color: '#000000' },
        footer: branding.footer || { color: '#000000' },
      })
    }

    return {
      captureBase,
      overlays,
    } as unknown as OCABundle
  }

  /**
   * Override resolveAllBundles to use our custom resolve for Kanon bundles
   */
  public async resolveAllBundles(params: OCABundleResolveAllParams): Promise<CredentialOverlay<BrandingOverlay>> {
    const credDefId = params.identifiers.credentialDefinitionId
    console.log('[KanonOCA] resolveAllBundles() called with credDefId:', credDefId)

    // First try the default resolver (local bundles) - use parent's resolveAllBundles
    // which knows how to process local bundles correctly
    const localBundle = await super.resolve({
      identifiers: params.identifiers,
      language: params.language,
    })
    if (localBundle) {
      console.log('[KanonOCA] resolveAllBundles - using local bundle')
      // Use parent's resolveAllBundles for local bundles
      return super.resolveAllBundles(params) as Promise<CredentialOverlay<BrandingOverlay>>
    }

    // Check cache for Kanon bundles
    if (credDefId && this.cachedOverlays.has(credDefId)) {
      console.log('[KanonOCA] resolveAllBundles - using cached bundle')
      const cachedBundle = this.cachedOverlays.get(credDefId)!
      return this.processBundle(cachedBundle, params)
    }

    // Try to fetch from Kanon credential definition
    if (credDefId && this.agent) {
      try {
        console.log('[KanonOCA] resolveAllBundles - fetching from Kanon...')
        const kanonBundle = await this.fetchKanonOCA(credDefId, params.language)
        if (kanonBundle) {
          this.cachedOverlays.set(credDefId, kanonBundle)
          console.log('[KanonOCA] resolveAllBundles - successfully fetched Kanon bundle')
          return this.processBundle(kanonBundle, params)
        }
      } catch (error) {
        console.log('[KanonOCA] resolveAllBundles - error fetching:', error)
      }
    } else {
      console.log('[KanonOCA] resolveAllBundles - no credDefId or agent. credDefId:', credDefId, 'agent:', !!this.agent)
    }

    // Fall back to default behavior
    console.log('[KanonOCA] resolveAllBundles - falling back to default')
    return super.resolveAllBundles(params) as Promise<CredentialOverlay<BrandingOverlay>>
  }

  /**
   * Process a bundle into CredentialOverlay format
   */
  private processBundle(bundle: OCABundle, params: OCABundleResolveAllParams): CredentialOverlay<BrandingOverlay> {
    const lang = params.language || 'en'

    // Extract meta overlay
    const bundleAny = bundle as any
    const metaOverlay = bundleAny.overlays?.find(
      (o: any) => o.type === 'spec/overlays/meta/1.0' && o.language === lang
    ) as any

    // Extract label overlay
    const labelOverlay = bundleAny.overlays?.find(
      (o: any) => o.type === 'spec/overlays/label/1.0' && o.language === lang
    ) as any

    // Extract branding overlay and convert to camelCase for UI components
    const rawBrandingOverlay = bundleAny.overlays?.find(
      (o: any) => o.type === 'aries/overlays/branding/0.1'
    ) as any

    // Convert snake_case to camelCase for branding overlay
    // UI components expect camelCase (e.g., primaryBackgroundColor, not primary_background_color)
    const brandingOverlay = rawBrandingOverlay ? {
      logo: rawBrandingOverlay.logo,
      backgroundColor: rawBrandingOverlay.background_color || rawBrandingOverlay.backgroundColor,
      backgroundImage: rawBrandingOverlay.background_image || rawBrandingOverlay.backgroundImage,
      backgroundImageSlice: rawBrandingOverlay.background_image_slice || rawBrandingOverlay.backgroundImageSlice,
      primaryBackgroundColor: rawBrandingOverlay.primary_background_color || rawBrandingOverlay.primaryBackgroundColor,
      secondaryBackgroundColor: rawBrandingOverlay.secondary_background_color || rawBrandingOverlay.secondaryBackgroundColor,
      primaryAttribute: rawBrandingOverlay.primary_attribute || rawBrandingOverlay.primaryAttribute,
      secondaryAttribute: rawBrandingOverlay.secondary_attribute || rawBrandingOverlay.secondaryAttribute,
      issuedDateAttribute: rawBrandingOverlay.issued_date_attribute || rawBrandingOverlay.issuedDateAttribute,
      expiryDateAttribute: rawBrandingOverlay.expiry_date_attribute || rawBrandingOverlay.expiryDateAttribute,
      header: rawBrandingOverlay.header,
      footer: rawBrandingOverlay.footer,
    } as unknown as BrandingOverlay : undefined

    console.log('[KanonOCA] processBundle - brandingOverlay:', JSON.stringify(brandingOverlay, null, 2))

    // Build presentation fields with labels
    const presentationFields = params.attributes?.map((attr) => {
      const label = labelOverlay?.attribute_labels?.[attr.name || ''] || attr.name
      return {
        ...attr,
        label,
      }
    })

    return {
      bundle,
      presentationFields,
      metaOverlay: metaOverlay ? {
        name: metaOverlay.name,
        description: metaOverlay.description,
        issuer: metaOverlay.issuer,
        issuerDescription: metaOverlay.issuer_description,
        credentialHelpText: metaOverlay.credential_help_text,
        credentialSupportUrl: metaOverlay.credential_support_url,
      } : undefined,
      brandingOverlay,
    } as CredentialOverlay<BrandingOverlay>
  }
}

/**
 * Kanon overlay format as stored in credential definition
 */
interface KanonOverlay {
  classification?: string
  attributes?: Record<string, string>
  flaggedAttributes?: string[]
  meta?: {
    name?: string
    description?: string
    issuer?: string
    issuerDescription?: string
    issuerUrl?: string
    credentialHelpText?: string
    credentialSupportUrl?: string
  }
  labels?: Record<string, string>
  branding?: {
    logo?: string
    backgroundColor?: string
    backgroundImage?: string
    backgroundImageSlice?: string
    primaryBackgroundColor?: string
    secondaryBackgroundColor?: string
    primaryAttribute?: string
    secondaryAttribute?: string
    header?: { color: string }
    footer?: { color: string }
  }
}
