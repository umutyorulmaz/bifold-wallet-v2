/**
 * SVG Template Renderer
 *
 * React component that renders an SVG template with credential data.
 * Takes a raw SVG string with {{placeholders}} and replaces them with values.
 */

import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { SvgXml } from 'react-native-svg'

import { CredentialAttribute, VariableMapping } from './types'
import { parseTemplate, extractVariables } from './SVGTemplateParser'
import { resolveAllVariables } from './VariableMapper'

export interface SVGTemplateRendererProps {
  /**
   * Raw SVG template string with {{placeholders}}
   */
  template: string
  /**
   * Credential attributes to fill in
   */
  attributes: CredentialAttribute[]
  /**
   * Target width (scales proportionally)
   */
  width?: number
  /**
   * Optional custom variable mapping
   */
  variableMapping?: VariableMapping
  /**
   * Callback when pressed
   */
  onPress?: () => void
}

/**
 * Render an SVG template with credential data
 */
export const SVGTemplateRenderer: React.FC<SVGTemplateRendererProps> = ({
  template,
  attributes,
  width,
  variableMapping,
  onPress,
}) => {
  // Parse template and fill in values
  const { renderedSvg, dimensions } = useMemo(() => {
    // Parse template to get variables and dimensions
    const parsed = parseTemplate(template)

    // Resolve all variables to their values
    const resolved = resolveAllVariables(parsed.variables, attributes, variableMapping)

    // Replace all placeholders in the SVG
    let svg = template
    for (const [placeholder, value] of resolved) {
      // Escape special XML characters in the value
      const escapedValue = escapeXml(value)
      svg = svg.split(placeholder).join(escapedValue)
    }

    return {
      renderedSvg: svg,
      dimensions: {
        width: parsed.width,
        height: parsed.height,
      },
    }
  }, [template, attributes, variableMapping])

  // Calculate scaled dimensions
  const targetWidth = width || dimensions.width
  const scale = targetWidth / dimensions.width
  const targetHeight = dimensions.height * scale

  // Update SVG dimensions if scaling
  const scaledSvg = useMemo(() => {
    if (Math.abs(scale - 1) < 0.01) {
      return renderedSvg
    }

    // Update width and height attributes
    let svg = renderedSvg
    svg = svg.replace(/width=["'][\d.]+(?:px)?["']/i, `width="${targetWidth}"`)
    svg = svg.replace(/height=["'][\d.]+(?:px)?["']/i, `height="${targetHeight}"`)

    return svg
  }, [renderedSvg, scale, targetWidth, targetHeight])

  return (
    <View
      style={[styles.container, { width: targetWidth, height: targetHeight }]}
      onTouchEnd={onPress}
    >
      <SvgXml xml={scaledSvg} width={targetWidth} height={targetHeight} />
    </View>
  )
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Render an SVG template to a string (for non-React usage)
 */
export function renderTemplateToString(
  template: string,
  attributes: CredentialAttribute[],
  variableMapping?: VariableMapping
): string {
  const variables = extractVariables(template)
  const resolved = resolveAllVariables(variables, attributes, variableMapping)

  let svg = template
  for (const [placeholder, value] of resolved) {
    const escapedValue = escapeXml(value)
    svg = svg.split(placeholder).join(escapedValue)
  }

  return svg
}

/**
 * Preview what values will be filled for each placeholder
 */
export function previewTemplateValues(
  template: string,
  attributes: CredentialAttribute[],
  variableMapping?: VariableMapping
): Array<{ variable: string; value: string }> {
  const variables = extractVariables(template)
  const resolved = resolveAllVariables(variables, attributes, variableMapping)

  return variables.map((v) => ({
    variable: v.name,
    value: resolved.get(v.placeholder) || '',
  }))
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
})

export default SVGTemplateRenderer
