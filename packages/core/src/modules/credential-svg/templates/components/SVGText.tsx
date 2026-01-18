import React from 'react'
import { Text, TSpan } from 'react-native-svg'

export interface SVGTextProps {
  x: number
  y: number
  text: string
  fontSize: number
  fontWeight?: 'normal' | 'bold' | '600' | '700'
  fill: string
  maxWidth?: number
  lineHeight?: number
  textAnchor?: 'start' | 'middle' | 'end'
  fontFamily?: string
}

/**
 * SVG Text component with optional multi-line support
 * Wraps text to fit within maxWidth if specified
 */
export const SVGText: React.FC<SVGTextProps> = ({
  x,
  y,
  text,
  fontSize,
  fontWeight = 'normal',
  fill,
  maxWidth,
  lineHeight = 1.2,
  textAnchor = 'start',
  fontFamily = 'System',
}) => {
  if (!text) {
    return null
  }

  // If no maxWidth specified, render single line
  if (!maxWidth) {
    return (
      <Text
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={fill}
        textAnchor={textAnchor}
        fontFamily={fontFamily}
      >
        {text}
      </Text>
    )
  }

  // Calculate approximate characters per line
  // Average character width is roughly 0.6 * fontSize for most fonts
  const avgCharWidth = fontSize * 0.55
  const charsPerLine = Math.floor(maxWidth / avgCharWidth)

  // Split text into lines
  const lines = wrapText(text, charsPerLine)
  const actualLineHeight = fontSize * lineHeight

  return (
    <Text
      x={x}
      y={y}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fill={fill}
      textAnchor={textAnchor}
      fontFamily={fontFamily}
    >
      {lines.map((line, index) => (
        <TSpan key={index} x={x} dy={index === 0 ? 0 : actualLineHeight}>
          {line}
        </TSpan>
      ))}
    </Text>
  )
}

/**
 * Wrap text to fit within character limit per line
 */
function wrapText(text: string, charsPerLine: number): string[] {
  if (text.length <= charsPerLine) {
    return [text]
  }

  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word

    if (testLine.length <= charsPerLine) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }

      // Handle words longer than the line width
      if (word.length > charsPerLine) {
        // Split long word
        let remaining = word
        while (remaining.length > charsPerLine) {
          lines.push(remaining.substring(0, charsPerLine - 1) + '-')
          remaining = remaining.substring(charsPerLine - 1)
        }
        currentLine = remaining
      } else {
        currentLine = word
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export default SVGText
