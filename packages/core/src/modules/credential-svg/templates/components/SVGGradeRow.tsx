import React from 'react'
import { G, Rect } from 'react-native-svg'

import { ParsedCourse, SchoolBranding } from '../../types'
import SVGText from './SVGText'

export interface SVGGradeRowProps {
  x: number
  y: number
  width: number
  height: number
  course: ParsedCourse
  colors: SchoolBranding['colors']
  fontSize?: number
  showBackground?: boolean
  isAlternate?: boolean
}

/**
 * SVG Grade Row component for displaying a single course with grade
 * Used in transcript term sections
 */
export const SVGGradeRow: React.FC<SVGGradeRowProps> = ({
  x,
  y,
  width,
  height,
  course,
  colors,
  fontSize = 9,
  showBackground = true,
  isAlternate = false,
}) => {
  const padding = 6

  // Column widths (percentages of total width)
  const codeWidth = 0.2
  const titleWidth = 0.5
  const gradeWidth = 0.15
  const creditsWidth = 0.15

  // Calculate x positions
  const codeX = x + padding
  const titleX = x + width * codeWidth
  const gradeX = x + width * (codeWidth + titleWidth)
  const creditsX = x + width * (codeWidth + titleWidth + gradeWidth)

  // Calculate available widths for text truncation
  const titleMaxWidth = width * titleWidth - padding * 2

  // Determine grade color based on grade value
  const gradeColor = getGradeColor(course.grade, colors)

  return (
    <G>
      {/* Row background */}
      {showBackground && (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isAlternate ? '#F8F8F8' : '#FFFFFF'}
        />
      )}

      {/* Course Code */}
      <SVGText
        x={codeX}
        y={y + height / 2 + fontSize / 3}
        text={course.code}
        fontSize={fontSize}
        fontWeight="normal"
        fill={colors.text}
        textAnchor="start"
      />

      {/* Course Title */}
      <SVGText
        x={titleX}
        y={y + height / 2 + fontSize / 3}
        text={course.title}
        fontSize={fontSize}
        fontWeight="normal"
        fill={colors.text}
        textAnchor="start"
        maxWidth={titleMaxWidth}
      />

      {/* Grade */}
      <SVGText
        x={gradeX + (width * gradeWidth) / 2}
        y={y + height / 2 + fontSize / 3}
        text={course.grade}
        fontSize={fontSize}
        fontWeight="bold"
        fill={gradeColor}
        textAnchor="middle"
      />

      {/* Credits */}
      <SVGText
        x={creditsX + (width * creditsWidth) / 2}
        y={y + height / 2 + fontSize / 3}
        text={course.credits}
        fontSize={fontSize}
        fontWeight="normal"
        fill={colors.text}
        textAnchor="middle"
      />
    </G>
  )
}

/**
 * Get color for grade display based on grade value
 */
function getGradeColor(grade: string, colors: SchoolBranding['colors']): string {
  const gradeUpper = grade.toUpperCase().replace(/[+-]/g, '')

  switch (gradeUpper) {
    case 'A':
      return '#2E7D32' // Green for A
    case 'B':
      return '#1565C0' // Blue for B
    case 'C':
      return '#F57C00' // Orange for C
    case 'D':
      return '#E65100' // Dark orange for D
    case 'F':
      return '#C62828' // Red for F
    default:
      return colors.text // Default text color for pass/fail/other
  }
}

export default SVGGradeRow
