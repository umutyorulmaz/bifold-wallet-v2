import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Svg, G, Rect, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg'

import { ParsedStudentID, SchoolBranding, RenderMode } from '../types'
import { SVGText, SVGPhoto, SVGBarcode } from './components'

export interface StudentIDSVGProps {
  data: ParsedStudentID
  branding: SchoolBranding
  width: number
  mode?: RenderMode
}

// ID Card aspect ratio (credit card style)
const ASPECT_RATIO = 1.586 // width / height

/**
 * SVG Student ID Card Template
 * Renders a credit card style student ID with photo, info, and barcode
 * Logo is rendered as a separate React Native component to avoid SVG pattern tiling issues
 */
export const StudentIDSVG: React.FC<StudentIDSVGProps> = ({
  data,
  branding,
  width,
  mode = 'full',
}) => {
  const height = width / ASPECT_RATIO
  const padding = width * 0.05
  const colors = branding.colors

  // Layout calculations
  const headerHeight = height * 0.24
  const photoSize = height * 0.38
  const photoX = padding * 1.2
  const photoY = headerHeight + padding

  const infoX = photoX + photoSize + padding * 1.2
  const infoY = photoY
  const infoWidth = width - infoX - padding

  const barcodeHeight = height * 0.12
  const barcodeY = height - barcodeHeight - height * 0.14
  const barcodeWidth = width * 0.65
  const barcodeX = (width - barcodeWidth) / 2

  const accentBarHeight = height * 0.06
  const accentBarY = height - accentBarHeight

  // Font sizes scaled to card width
  const nameFontSize = Math.max(13, width * 0.048)
  const labelFontSize = Math.max(9, width * 0.03)
  const valueFontSize = Math.max(11, width * 0.038)

  // Determine display name
  const displayName =
    data.fullName || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : '')

  const LogoComponent = branding.logo
  const logoSize = headerHeight * 0.55

  // Generate unique gradient ID to avoid conflicts
  const gradientId = `headerGrad_${Math.random().toString(36).substr(2, 9)}`

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Logo rendered as React Native component (avoids SVG pattern tiling) */}
      {LogoComponent && (
        <View
          style={[
            styles.logoContainer,
            {
              top: (headerHeight - logoSize) / 2,
              left: padding,
              width: logoSize,
              height: logoSize,
            },
          ]}
        >
          <LogoComponent width={logoSize} height={logoSize} />
        </View>
      )}

      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Gradient for header */}
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.accent} />
          </LinearGradient>
          {/* Clip path for rounded corners */}
          <ClipPath id="cardClip">
            <Rect x={0} y={0} width={width} height={height} rx={12} ry={12} />
          </ClipPath>
        </Defs>

        <G clipPath="url(#cardClip)">
          {/* Card Background */}
          <Rect x={0} y={0} width={width} height={height} fill={colors.secondary} />

          {/* Header with gradient */}
          <Rect x={0} y={0} width={width} height={headerHeight} fill={`url(#${gradientId})`} />

          {/* School name in header (positioned after logo space) */}
          <SVGText
            x={padding + logoSize + padding * 0.8}
            y={headerHeight * 0.42}
            text={branding.shortName || branding.name}
            fontSize={Math.max(12, width * 0.045)}
            fontWeight="bold"
            fill={colors.textInverse}
          />
          <SVGText
            x={padding + logoSize + padding * 0.8}
            y={headerHeight * 0.72}
            text="STUDENT ID"
            fontSize={Math.max(9, width * 0.028)}
            fontWeight="normal"
            fill={colors.textInverse}
          />

          {/* Student Photo */}
          <SVGPhoto
            x={photoX}
            y={photoY}
            width={photoSize}
            height={photoSize}
            photoUri={data.photo}
            borderRadius={6}
            borderColor={colors.primary}
            borderWidth={2}
          />

          {/* Student Information */}
          <G>
            {/* Name */}
            <SVGText
              x={infoX}
              y={infoY + nameFontSize * 0.9}
              text={displayName}
              fontSize={nameFontSize}
              fontWeight="bold"
              fill={colors.text}
              maxWidth={infoWidth}
            />

            {/* Student ID */}
            <SVGText
              x={infoX}
              y={infoY + nameFontSize + labelFontSize + 10}
              text="ID:"
              fontSize={labelFontSize}
              fontWeight="normal"
              fill="#888888"
            />
            <SVGText
              x={infoX + labelFontSize * 2.2}
              y={infoY + nameFontSize + labelFontSize + 10}
              text={data.studentNumber}
              fontSize={valueFontSize}
              fontWeight="bold"
              fill={colors.text}
            />

            {/* Expiration */}
            {data.expiration && (
              <>
                <SVGText
                  x={infoX}
                  y={infoY + nameFontSize + labelFontSize * 2 + valueFontSize + 16}
                  text="Expires:"
                  fontSize={labelFontSize}
                  fontWeight="normal"
                  fill="#888888"
                />
                <SVGText
                  x={infoX + labelFontSize * 4.5}
                  y={infoY + nameFontSize + labelFontSize * 2 + valueFontSize + 16}
                  text={data.expiration}
                  fontSize={valueFontSize}
                  fontWeight="bold"
                  fill={colors.text}
                />
              </>
            )}
          </G>

          {/* Barcode */}
          <SVGBarcode
            x={barcodeX}
            y={barcodeY}
            width={barcodeWidth}
            height={barcodeHeight}
            value={data.studentNumber}
            barColor={colors.primary}
            backgroundColor={colors.secondary}
            showValue={mode === 'full'}
            valueFontSize={Math.max(8, width * 0.025)}
            valueColor={colors.text}
          />

          {/* Accent bar at bottom */}
          <Rect x={0} y={accentBarY} width={width} height={accentBarHeight} fill={colors.accent} />
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoContainer: {
    position: 'absolute',
    zIndex: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
})

export default StudentIDSVG
