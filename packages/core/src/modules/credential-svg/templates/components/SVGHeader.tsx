import React from 'react'
import { G, Rect } from 'react-native-svg'

import { SchoolBranding } from '../../types'
import SVGText from './SVGText'

export interface SVGHeaderProps {
  x: number
  y: number
  width: number
  height: number
  branding: SchoolBranding
  title?: string
  showLogo?: boolean
  logoSize?: number
  backgroundColor?: string
}

/**
 * SVG Header component with school logo and optional title
 * Used in both Student ID and Transcript templates
 */
export const SVGHeader: React.FC<SVGHeaderProps> = ({
  x,
  y,
  width,
  height,
  branding,
  title,
  showLogo = true,
  logoSize,
  backgroundColor,
}) => {
  const LogoComponent = branding.logo
  const actualLogoSize = logoSize || Math.min(height * 0.8, width * 0.15)
  const logoPadding = (height - actualLogoSize) / 2
  const bgColor = backgroundColor || branding.colors.primary

  // Calculate text area
  const logoAreaWidth = showLogo ? actualLogoSize + logoPadding * 2 : 0
  const textAreaX = x + logoAreaWidth + 8
  const textAreaWidth = width - logoAreaWidth - 16

  return (
    <G>
      {/* Background */}
      <Rect x={x} y={y} width={width} height={height} fill={bgColor} />

      {/* Logo */}
      {showLogo && LogoComponent && (
        <G transform={`translate(${x + logoPadding}, ${y + logoPadding})`}>
          <LogoComponent width={actualLogoSize} height={actualLogoSize} />
        </G>
      )}

      {/* School Name */}
      <SVGText
        x={textAreaX}
        y={y + height * 0.4}
        text={branding.name}
        fontSize={Math.min(14, width * 0.04)}
        fontWeight="bold"
        fill={branding.colors.textInverse}
        maxWidth={textAreaWidth}
      />

      {/* Optional Title/Subtitle */}
      {title && (
        <SVGText
          x={textAreaX}
          y={y + height * 0.7}
          text={title}
          fontSize={Math.min(11, width * 0.035)}
          fontWeight="normal"
          fill={branding.colors.textInverse}
          maxWidth={textAreaWidth}
        />
      )}
    </G>
  )
}

export default SVGHeader
