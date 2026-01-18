import React from 'react'
import { G, Rect, Line } from 'react-native-svg'

import SVGText from './SVGText'

export interface TableColumn {
  key: string
  label: string
  width: number // Percentage of total width (0-1)
  align?: 'start' | 'middle' | 'end'
}

export interface SVGTableProps {
  x: number
  y: number
  width: number
  columns: TableColumn[]
  rows: Record<string, string>[]
  headerBg?: string
  headerTextColor?: string
  rowBg?: string
  alternateRowBg?: string
  textColor?: string
  fontSize?: number
  rowHeight?: number
  headerHeight?: number
  borderColor?: string
  showBorder?: boolean
  borderRadius?: number
}

/**
 * SVG Table component for displaying tabular data (courses, grades, etc.)
 */
export const SVGTable: React.FC<SVGTableProps> = ({
  x,
  y,
  width,
  columns,
  rows,
  headerBg = '#E8E8E8',
  headerTextColor = '#333333',
  rowBg = '#FFFFFF',
  alternateRowBg = '#F8F8F8',
  textColor = '#333333',
  fontSize = 10,
  rowHeight = 20,
  headerHeight: customHeaderHeight,
  borderColor = '#DDDDDD',
  showBorder = true,
  borderRadius = 4,
}) => {
  const headerHeight = customHeaderHeight || rowHeight + 4
  const totalHeight = headerHeight + rows.length * rowHeight
  const padding = 4

  // Calculate column positions
  const columnPositions = columns.reduce(
    (acc, col, index) => {
      const prevEnd = index === 0 ? x : acc[index - 1].end
      const colWidth = width * col.width
      acc.push({
        start: prevEnd,
        end: prevEnd + colWidth,
        width: colWidth,
      })
      return acc
    },
    [] as { start: number; end: number; width: number }[]
  )

  return (
    <G>
      {/* Table border/background */}
      {showBorder && (
        <Rect
          x={x}
          y={y}
          width={width}
          height={totalHeight}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={borderColor}
          strokeWidth={1}
        />
      )}

      {/* Header row */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={headerHeight}
        rx={borderRadius}
        ry={borderRadius}
        fill={headerBg}
      />
      {/* Square off bottom corners of header */}
      <Rect x={x} y={y + headerHeight - borderRadius} width={width} height={borderRadius} fill={headerBg} />

      {/* Header text */}
      {columns.map((col, colIndex) => {
        const pos = columnPositions[colIndex]
        const textX =
          col.align === 'end'
            ? pos.end - padding
            : col.align === 'middle'
              ? pos.start + pos.width / 2
              : pos.start + padding

        return (
          <SVGText
            key={`header-${colIndex}`}
            x={textX}
            y={y + headerHeight / 2 + fontSize / 3}
            text={col.label}
            fontSize={fontSize}
            fontWeight="bold"
            fill={headerTextColor}
            textAnchor={col.align || 'start'}
          />
        )
      })}

      {/* Header separator line */}
      <Line x1={x} y1={y + headerHeight} x2={x + width} y2={y + headerHeight} stroke={borderColor} strokeWidth={1} />

      {/* Data rows */}
      {rows.map((row, rowIndex) => {
        const rowY = y + headerHeight + rowIndex * rowHeight
        const isAlternate = rowIndex % 2 === 1

        return (
          <G key={`row-${rowIndex}`}>
            {/* Row background */}
            <Rect
              x={x + 1}
              y={rowY}
              width={width - 2}
              height={rowHeight}
              fill={isAlternate ? alternateRowBg : rowBg}
            />

            {/* Row data */}
            {columns.map((col, colIndex) => {
              const pos = columnPositions[colIndex]
              const textX =
                col.align === 'end'
                  ? pos.end - padding
                  : col.align === 'middle'
                    ? pos.start + pos.width / 2
                    : pos.start + padding

              return (
                <SVGText
                  key={`cell-${rowIndex}-${colIndex}`}
                  x={textX}
                  y={rowY + rowHeight / 2 + fontSize / 3}
                  text={row[col.key] || ''}
                  fontSize={fontSize}
                  fontWeight="normal"
                  fill={textColor}
                  textAnchor={col.align || 'start'}
                  maxWidth={pos.width - padding * 2}
                />
              )
            })}

            {/* Row separator */}
            {rowIndex < rows.length - 1 && (
              <Line
                x1={x + padding}
                y1={rowY + rowHeight}
                x2={x + width - padding}
                y2={rowY + rowHeight}
                stroke={borderColor}
                strokeWidth={0.5}
                opacity={0.5}
              />
            )}
          </G>
        )
      })}
    </G>
  )
}

export default SVGTable
