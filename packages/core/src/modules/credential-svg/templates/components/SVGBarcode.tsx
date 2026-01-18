import React, { useMemo } from 'react'
import { G, Rect, Text } from 'react-native-svg'

export interface SVGBarcodeProps {
  x: number
  y: number
  width: number
  height: number
  value: string
  barColor?: string
  backgroundColor?: string
  showValue?: boolean
  valueFontSize?: number
  valueColor?: string
}

/**
 * SVG Barcode component that renders a Code128-style barcode visualization
 * Creates a visual representation based on the input value
 */
export const SVGBarcode: React.FC<SVGBarcodeProps> = ({
  x,
  y,
  width,
  height,
  value,
  barColor = '#000000',
  backgroundColor = '#FFFFFF',
  showValue = true,
  valueFontSize = 8,
  valueColor = '#333333',
}) => {
  // Generate barcode pattern
  const bars = useMemo(() => generateBarcodePattern(value, width), [value, width])

  // Calculate heights
  const barcodeHeight = showValue ? height - valueFontSize - 4 : height
  const textY = y + barcodeHeight + valueFontSize + 2

  return (
    <G>
      {/* Background */}
      <Rect x={x} y={y} width={width} height={height} fill={backgroundColor} rx={2} ry={2} />

      {/* Barcode bars */}
      {bars.map((bar, index) => (
        <Rect
          key={index}
          x={x + bar.x}
          y={y + 2}
          width={bar.width}
          height={barcodeHeight - 4}
          fill={bar.isBar ? barColor : 'transparent'}
        />
      ))}

      {/* Value text */}
      {showValue && value && (
        <Text
          x={x + width / 2}
          y={textY}
          fontSize={valueFontSize}
          fill={valueColor}
          textAnchor="middle"
          fontFamily="monospace"
        >
          {value}
        </Text>
      )}
    </G>
  )
}

interface BarSegment {
  x: number
  width: number
  isBar: boolean
}

/**
 * Generate a pseudo-barcode pattern based on the input value
 * This creates a visually convincing barcode representation
 */
function generateBarcodePattern(value: string, totalWidth: number): BarSegment[] {
  if (!value || value.trim() === '') {
    return []
  }

  const bars: BarSegment[] = []
  const quietZone = totalWidth * 0.03 // Quiet zones on each side
  const availableWidth = totalWidth - quietZone * 2

  // Generate a denser pattern for more realistic appearance
  const pattern = generateDensePattern(value)

  // Calculate bar unit width - aim for thin bars
  const totalUnits = pattern.reduce((sum, p) => sum + p, 0)
  const unitWidth = Math.max(0.5, availableWidth / totalUnits)

  let currentX = quietZone
  let isBar = true

  for (const units of pattern) {
    if (currentX < totalWidth - quietZone) {
      bars.push({
        x: currentX,
        width: Math.min(units * unitWidth, totalWidth - quietZone - currentX),
        isBar,
      })
      currentX += units * unitWidth
    }
    isBar = !isBar
  }

  return bars
}

/**
 * Generate a dense pattern array for realistic barcode appearance
 * Creates many thin bars and spaces
 */
function generateDensePattern(value: string): number[] {
  const pattern: number[] = []

  // Start guard (like EAN-13)
  pattern.push(1, 1, 1)

  // Simple hash to seed consistent randomness
  let seed = 0
  for (let i = 0; i < value.length; i++) {
    seed = ((seed << 5) - seed + value.charCodeAt(i)) | 0
  }

  // Generate bars for each character
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    const mixed = (code * 31 + seed + i * 17) & 0xffff

    // Generate 7 bar/space pairs per character for density
    for (let j = 0; j < 7; j++) {
      const shift = j * 2
      const barWidth = 1 + ((mixed >> shift) & 1) // 1-2 units
      const spaceWidth = 1 + ((mixed >> (shift + 1)) & 1) // 1-2 units
      pattern.push(barWidth, spaceWidth)
    }
  }

  // End guard
  pattern.push(1, 1, 1)

  return pattern
}

export default SVGBarcode
