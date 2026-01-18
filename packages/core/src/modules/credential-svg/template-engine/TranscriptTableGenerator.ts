/**
 * Transcript Table Generator
 *
 * Generates SVG markup for transcript terms and courses tables.
 * Used with hybrid templates where the header is designed externally
 * but the dynamic table content is generated programmatically.
 */

import { ParsedTranscript, ParsedTerm } from '../types'

export interface TableGeneratorOptions {
  /** Starting X position */
  x: number
  /** Starting Y position */
  y: number
  /** Table width */
  width: number
  /** Row height */
  rowHeight?: number
  /** Header row height */
  headerHeight?: number
  /** Font size for content */
  fontSize?: number
  /** Font size for headers */
  headerFontSize?: number
  /** Colors */
  colors?: {
    termHeaderBg?: string
    termHeaderText?: string
    tableHeaderBg?: string
    tableHeaderText?: string
    rowBg?: string
    alternateRowBg?: string
    rowText?: string
    borderColor?: string
  }
}

const DEFAULT_OPTIONS: Required<Omit<TableGeneratorOptions, 'x' | 'y' | 'width'>> = {
  rowHeight: 18,
  headerHeight: 24,
  fontSize: 9,
  headerFontSize: 10,
  colors: {
    termHeaderBg: '#1E3A5F',
    termHeaderText: '#FFFFFF',
    tableHeaderBg: '#E8EEF5',
    tableHeaderText: '#333333',
    rowBg: '#FFFFFF',
    alternateRowBg: '#F8FAFC',
    rowText: '#333333',
    borderColor: '#E0E0E0',
  },
}

/**
 * Generate SVG markup for all terms and their course tables
 */
export function generateTermsTableSVG(
  terms: ParsedTerm[],
  options: TableGeneratorOptions
): { svg: string; totalHeight: number } {
  const opts = { ...DEFAULT_OPTIONS, ...options, colors: { ...DEFAULT_OPTIONS.colors, ...options.colors } }
  const { x, width, rowHeight, headerHeight, fontSize, headerFontSize, colors } = opts
  let currentY = options.y
  const svgParts: string[] = []

  for (const term of terms) {
    // Term header (e.g., "2020-2021 | GPA: 4.0")
    svgParts.push(`
      <rect x="${x}" y="${currentY}" width="${width}" height="${headerHeight}" rx="4" fill="${colors.termHeaderBg}"/>
      <text x="${x + 10}" y="${currentY + headerHeight * 0.65}" font-size="${headerFontSize}" font-weight="bold" fill="${colors.termHeaderText}">${escapeXml(term.year)}</text>
      <text x="${x + width - 10}" y="${currentY + headerHeight * 0.65}" font-size="${headerFontSize}" font-weight="bold" fill="${colors.termHeaderText}" text-anchor="end">GPA: ${escapeXml(term.gpa)}</text>
    `)
    currentY += headerHeight

    // Table header row
    const colWidths = [width * 0.18, width * 0.52, width * 0.15, width * 0.15]
    const colX = [x, x + colWidths[0], x + colWidths[0] + colWidths[1], x + colWidths[0] + colWidths[1] + colWidths[2]]

    svgParts.push(`
      <rect x="${x}" y="${currentY}" width="${width}" height="${rowHeight}" fill="${colors.tableHeaderBg}"/>
      <text x="${colX[0] + 4}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" font-weight="bold" fill="${colors.tableHeaderText}">Code</text>
      <text x="${colX[1] + 4}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" font-weight="bold" fill="${colors.tableHeaderText}">Course</text>
      <text x="${colX[2] + colWidths[2] / 2}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" font-weight="bold" fill="${colors.tableHeaderText}" text-anchor="middle">Gr</text>
      <text x="${colX[3] + colWidths[3] / 2}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" font-weight="bold" fill="${colors.tableHeaderText}" text-anchor="middle">Cr</text>
      <line x1="${x}" y1="${currentY + rowHeight}" x2="${x + width}" y2="${currentY + rowHeight}" stroke="${colors.borderColor}" stroke-width="1"/>
    `)
    currentY += rowHeight

    // Course rows
    term.courses.forEach((course, idx) => {
      const bgColor = idx % 2 === 0 ? colors.rowBg : colors.alternateRowBg
      svgParts.push(`
        <rect x="${x}" y="${currentY}" width="${width}" height="${rowHeight}" fill="${bgColor}"/>
        <text x="${colX[0] + 4}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" fill="${colors.rowText}">${escapeXml(truncate(course.code, 8))}</text>
        <text x="${colX[1] + 4}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" fill="${colors.rowText}">${escapeXml(truncate(course.title, 28))}</text>
        <text x="${colX[2] + colWidths[2] / 2}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" fill="${colors.rowText}" text-anchor="middle">${escapeXml(course.grade)}</text>
        <text x="${colX[3] + colWidths[3] / 2}" y="${currentY + rowHeight * 0.65}" font-size="${fontSize}" fill="${colors.rowText}" text-anchor="middle">${escapeXml(course.credits)}</text>
      `)
      currentY += rowHeight
    })

    // Add spacing between terms
    currentY += 8
  }

  return {
    svg: svgParts.join('\n'),
    totalHeight: currentY - options.y,
  }
}

/**
 * Generate a complete transcript SVG from template + data
 */
export function generateTranscriptFromTemplate(
  template: string,
  transcript: ParsedTranscript,
  options: {
    width?: number
    tableX?: number
    tableStartY?: number
    tableWidth?: number
  } = {}
): string {
  const width = options.width || 320
  const tableX = options.tableX || width * 0.04
  const tableWidth = options.tableWidth || width * 0.92

  // Find where to insert the table (look for {{TERMS_TABLE}} or estimate position)
  const tableStartY = options.tableStartY || 150

  // Generate the terms table
  const { svg: tableSvg, totalHeight: tableHeight } = generateTermsTableSVG(transcript.terms, {
    x: tableX,
    y: tableStartY,
    width: tableWidth,
  })

  // Calculate total height
  const footerHeight = 40
  const totalHeight = tableStartY + tableHeight + footerHeight

  // Replace placeholders
  let result = template
    .replace(/\{\{TERMS_TABLE\}\}/g, tableSvg)
    .replace(/\{\{HEIGHT\}\}/g, String(totalHeight))
    .replace(/\{\{FOOTER_Y\}\}/g, String(tableStartY + tableHeight + 20))
    .replace(/\{\{TABLE_START_Y\}\}/g, String(tableStartY))
    .replace(/\{\{TABLE_HEIGHT\}\}/g, String(tableHeight))

  // Replace student info placeholders
  result = result
    .replace(/\{\{FullName\}\}/g, escapeXml(transcript.student.fullName))
    .replace(/\{\{StudentNumber\}\}/g, escapeXml(transcript.student.number))
    .replace(/\{\{BirthDate\}\}/g, escapeXml(transcript.student.birthDate || ''))
    .replace(/\{\{GPA\}\}/g, escapeXml(transcript.academics.gpa))
    .replace(/\{\{Credits\}\}/g, escapeXml(transcript.academics.earnedCredits))
    .replace(/\{\{ClassRank\}\}/g, escapeXml(transcript.academics.classRank || ''))
    .replace(/\{\{GraduationDate\}\}/g, escapeXml(transcript.academics.graduationDate || ''))
    .replace(/\{\{SchoolName\}\}/g, escapeXml(transcript.school.name))

  return result
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
 * Truncate string to max length
 */
function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

export default {
  generateTermsTableSVG,
  generateTranscriptFromTemplate,
}
