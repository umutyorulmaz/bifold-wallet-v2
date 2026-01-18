import React, { useMemo } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { CredentialPreviewAttribute, RenderMode, CredentialType } from './types'
import { getSchemaConfig, detectCredentialType, getBrandingForCredential } from './registry'
import { parseStudentId, parseTranscript } from './parsers'
import { StudentIDSVG, TranscriptSVG } from './templates'
import {
  SVGTemplateRenderer,
  getTemplateForSchema,
  VariableMapping,
  generateTranscriptFromTemplate,
  getTranscriptTemplateConfig,
  getTemplateForCredential,
  detectSchoolFromName,
} from './template-engine'

export interface CredentialSVGRendererProps {
  /**
   * Schema ID to determine credential type
   */
  schemaId?: string
  /**
   * Credential Definition ID for branding detection
   */
  credDefId?: string
  /**
   * Raw credential attributes
   */
  attributes: CredentialPreviewAttribute[]
  /**
   * Width of the rendered SVG
   */
  width?: number
  /**
   * Render mode: 'compact' for chat/list, 'full' for detail view
   */
  mode?: RenderMode
  /**
   * Whether the credential is being displayed in chat context
   */
  isInChat?: boolean
  /**
   * Callback when the credential card is pressed
   */
  onPress?: () => void
  /**
   * Optional school name for branding (if not detected from credDefId)
   */
  schoolName?: string
  /**
   * Force a specific credential type (override auto-detection)
   */
  forceType?: CredentialType
  /**
   * Custom SVG template string with {{placeholders}}
   * If provided, uses template-based rendering instead of programmatic
   */
  customTemplate?: string
  /**
   * Custom variable mapping for template placeholders
   */
  variableMapping?: VariableMapping
  /**
   * Use template from registry if available (default: true)
   * Set to false to always use programmatic rendering
   */
  useTemplateRegistry?: boolean
}

// Default widths based on context
const DEFAULT_WIDTH_CHAT = 280
const DEFAULT_WIDTH_FULL = 320

/**
 * Main Credential SVG Renderer Component
 *
 * Automatically detects credential type and renders appropriate SVG template
 * with school-specific branding.
 */
export const CredentialSVGRenderer: React.FC<CredentialSVGRendererProps> = ({
  schemaId,
  credDefId,
  attributes,
  width,
  mode = 'full',
  isInChat = false,
  onPress,
  schoolName,
  forceType,
  customTemplate,
  variableMapping,
  useTemplateRegistry = true,
}) => {
  // Determine default width based on context
  const defaultWidth = isInChat ? DEFAULT_WIDTH_CHAT : DEFAULT_WIDTH_FULL
  const actualWidth = width || defaultWidth

  // Get credential variant for parsing (must be at top level for hooks)
  const variant = useMemo(() => {
    if (schemaId) {
      const config = getSchemaConfig(schemaId)
      if (config) {
        return config.variant
      }
    }
    return 'high-school' as const
  }, [schemaId])

  // Extract school name from attributes for template selection
  const detectedSchoolName = useMemo(() => {
    // First check if schoolName prop is provided
    if (schoolName) return schoolName

    // Try to find school name in attributes
    const schoolAttr = attributes.find(
      (attr) =>
        attr.name.toLowerCase() === 'schoolname' ||
        attr.name.toLowerCase() === 'school' ||
        attr.name.toLowerCase() === 'institution'
    )
    if (schoolAttr?.value) return schoolAttr.value

    // Try to extract from nested JSON (studentInfo.schoolName)
    const studentInfoAttr = attributes.find(
      (attr) => attr.name.toLowerCase() === 'studentinfo'
    )
    if (studentInfoAttr?.value) {
      try {
        const parsed = JSON.parse(studentInfoAttr.value)
        if (parsed.schoolName) return parsed.schoolName
      } catch {
        // Not JSON, ignore
      }
    }

    return undefined
  }, [schoolName, attributes])

  // Check for custom template or registered template
  const template = useMemo(() => {
    // Custom template takes priority
    if (customTemplate) {
      return { svg: customTemplate, variableMapping, credentialType: forceType }
    }

    // Check registry if enabled - use school-specific template
    if (useTemplateRegistry && schemaId) {
      // First try to get school-specific template (uses credDefId for school detection)
      const schoolSpecificTemplate = getTemplateForCredential(schemaId, credDefId, detectedSchoolName)
      if (schoolSpecificTemplate) {
        return {
          svg: schoolSpecificTemplate.svg,
          variableMapping: variableMapping || schoolSpecificTemplate.variableMapping,
          credentialType: schoolSpecificTemplate.credentialType,
        }
      }

      // Fall back to generic schema template
      const registeredTemplate = getTemplateForSchema(schemaId)
      if (registeredTemplate) {
        return {
          svg: registeredTemplate.svg,
          variableMapping: variableMapping || registeredTemplate.variableMapping,
          credentialType: registeredTemplate.credentialType,
        }
      }
    }

    return null
  }, [customTemplate, variableMapping, useTemplateRegistry, schemaId, credDefId, forceType, detectedSchoolName])

  // Convert attributes to template format
  const templateAttributes = useMemo(() => {
    return attributes.map((attr) => ({
      name: attr.name,
      value: attr.value || '',
      mimeType: attr['mime-type'],
    }))
  }, [attributes])

  // Parse transcript data for template rendering (must be at top level)
  const parsedTranscriptForTemplate = useMemo(() => {
    if (template?.credentialType !== 'transcript') {
      return null
    }
    try {
      return parseTranscript(attributes, variant)
    } catch {
      return null
    }
  }, [template?.credentialType, attributes, variant])

  // Get detected school key for config selection
  const detectedSchool = useMemo(() => {
    return detectSchoolFromName(detectedSchoolName)
  }, [detectedSchoolName])

  // Generate transcript SVG with dynamic tables (must be at top level)
  const transcriptSvgData = useMemo(() => {
    if (!parsedTranscriptForTemplate || !template) {
      return null
    }

    // Use school-specific transcript config if available
    const config = getTranscriptTemplateConfig(detectedSchool)
    const transcriptSvg = generateTranscriptFromTemplate(template.svg, parsedTranscriptForTemplate, {
      width: actualWidth,
      tableX: config.tableX,
      tableStartY: config.tableStartY,
      tableWidth: config.tableWidth,
    })

    // Extract height from the generated SVG
    const heightMatch = transcriptSvg.match(/height=["'](\d+)["']/)
    const svgHeight = heightMatch ? parseInt(heightMatch[1], 10) : 600

    return { svg: transcriptSvg, height: svgHeight }
  }, [parsedTranscriptForTemplate, template, actualWidth, detectedSchool])

  // Detect credential type for programmatic rendering
  const credentialType = useMemo(() => {
    if (forceType) {
      return forceType
    }

    // Try schema registry first
    if (schemaId) {
      const config = getSchemaConfig(schemaId)
      if (config) {
        return config.type
      }
    }

    // Fall back to pattern detection
    return detectCredentialType(schemaId, credDefId)
  }, [schemaId, credDefId, forceType])

  // Get school branding
  const branding = useMemo(() => {
    return getBrandingForCredential(credDefId, schoolName)
  }, [credDefId, schoolName])

  // Parse credential data for programmatic rendering
  const parsedData = useMemo(() => {
    // Skip if using template
    if (template) {
      return null
    }

    if (!credentialType || attributes.length === 0) {
      return null
    }

    try {
      if (credentialType === 'student-id') {
        return {
          type: 'student-id' as const,
          data: parseStudentId(attributes, variant),
        }
      } else if (credentialType === 'transcript') {
        return {
          type: 'transcript' as const,
          data: parseTranscript(attributes, variant),
        }
      }
    } catch {
      // Parsing failed, fall through to return null
    }

    return null
  }, [template, credentialType, attributes, variant])

  // ============================================
  // TEMPLATE-BASED RENDERING
  // ============================================

  if (template) {
    // Transcript with dynamic table generation
    if (template.credentialType === 'transcript' && transcriptSvgData) {
      const transcriptContent = (
        <View style={{ width: actualWidth, height: transcriptSvgData.height }}>
          <SvgXml xml={transcriptSvgData.svg} width={actualWidth} height={transcriptSvgData.height} />
        </View>
      )

      // Wrap in ScrollView for full mode
      if (mode === 'full') {
        return (
          <View style={[styles.container, { width: actualWidth }]}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {onPress ? (
                <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                  {transcriptContent}
                </TouchableOpacity>
              ) : (
                transcriptContent
              )}
            </ScrollView>
          </View>
        )
      }

      // Compact mode - just show the top portion
      return (
        <View style={[styles.container, { width: actualWidth, maxHeight: 280, overflow: 'hidden' }]}>
          {onPress ? (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
              {transcriptContent}
            </TouchableOpacity>
          ) : (
            transcriptContent
          )}
        </View>
      )
    }

    // Non-transcript templates (like Student ID) - use standard renderer
    const content = (
      <SVGTemplateRenderer
        template={template.svg}
        attributes={templateAttributes}
        width={actualWidth}
        variableMapping={template.variableMapping}
        onPress={onPress}
      />
    )

    return <View style={[styles.container, { width: actualWidth }]}>{content}</View>
  }

  // ============================================
  // PROGRAMMATIC RENDERING (FALLBACK)
  // ============================================

  // Don't render if we couldn't parse the data
  if (!parsedData) {
    return null
  }

  // Render the appropriate template
  const renderContent = () => {
    if (parsedData.type === 'student-id') {
      return (
        <StudentIDSVG
          data={parsedData.data}
          branding={branding}
          width={actualWidth}
          mode={mode}
        />
      )
    }

    if (parsedData.type === 'transcript') {
      const transcriptContent = (
        <TranscriptSVG
          data={parsedData.data}
          branding={branding}
          width={actualWidth}
          mode={mode}
        />
      )

      // Wrap in ScrollView for full mode transcripts
      if (mode === 'full') {
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {transcriptContent}
          </ScrollView>
        )
      }

      return transcriptContent
    }

    return null
  }

  // Wrap in TouchableOpacity if onPress is provided
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.container, { width: actualWidth }]}
      >
        {renderContent()}
      </TouchableOpacity>
    )
  }

  return <View style={[styles.container, { width: actualWidth }]}>{renderContent()}</View>
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    // Add shadow for card effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    maxHeight: 500, // Limit height for scrollable transcripts
  },
  scrollContent: {
    flexGrow: 1,
  },
})

export default CredentialSVGRenderer
