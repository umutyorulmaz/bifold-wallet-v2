import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Svg, G, Rect, Line, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg'

import { ParsedTranscript, SchoolBranding, RenderMode } from '../types'
import { SVGText, SVGTable, TableColumn } from './components'

export interface TranscriptSVGProps {
  data: ParsedTranscript
  branding: SchoolBranding
  width: number
  mode?: RenderMode
  maxTermsInCompact?: number
}

/**
 * SVG Transcript Template
 * Renders a portrait-style academic transcript with all terms and courses
 * Logo is rendered as a separate React Native component to avoid SVG pattern tiling
 */
export const TranscriptSVG: React.FC<TranscriptSVGProps> = ({
  data,
  branding,
  width,
  mode = 'full',
  maxTermsInCompact = 1,
}) => {
  const colors = branding.colors
  const padding = width * 0.04

  // Font sizes scaled to width
  const titleFontSize = Math.max(13, width * 0.044)
  const sectionFontSize = Math.max(10, width * 0.034)
  const labelFontSize = Math.max(8, width * 0.027)
  const valueFontSize = Math.max(9, width * 0.03)
  const smallFontSize = Math.max(7, width * 0.024)

  // Section heights
  const headerHeight = width * 0.16  // Increased for logo + title
  const studentInfoHeight = width * 0.16  // Adjusted
  const summaryHeight = width * 0.12  // Just GPA and Credits
  const termHeaderHeight = width * 0.065
  const courseRowHeight = width * 0.05
  const tableHeaderHeight = width * 0.045
  const sectionSpacing = width * 0.025
  const footerHeight = width * 0.06

  // Determine which terms to show
  const termsToShow = mode === 'compact' ? data.terms.slice(-maxTermsInCompact) : data.terms

  // Generate unique gradient ID
  const gradientId = useMemo(() => `transcriptGrad_${Math.random().toString(36).substr(2, 9)}`, [])
  const clipId = useMemo(() => `transcriptClip_${Math.random().toString(36).substr(2, 9)}`, [])

  // Calculate all Y positions upfront
  const layout = useMemo(() => {
    let y = 0

    const header = { y, height: headerHeight }
    y += headerHeight + padding

    const studentInfo = { y, height: studentInfoHeight }
    y += studentInfoHeight + sectionSpacing

    const summary = { y, height: summaryHeight }
    y += summaryHeight + sectionSpacing

    const terms: { y: number; height: number }[] = []
    for (const term of termsToShow) {
      const termHeight = termHeaderHeight + tableHeaderHeight + term.courses.length * courseRowHeight + sectionSpacing
      terms.push({ y, height: termHeight })
      y += termHeight + sectionSpacing * 0.5
    }

    const footer = { y: y + sectionSpacing * 0.5, height: footerHeight }
    const totalHeight = y + footerHeight + padding

    return { header, studentInfo, summary, terms, footer, totalHeight }
  }, [termsToShow, headerHeight, padding, studentInfoHeight, summaryHeight, termHeaderHeight, tableHeaderHeight, courseRowHeight, sectionSpacing, footerHeight])

  const height = layout.totalHeight

  // Course table columns
  const courseColumns: TableColumn[] = [
    { key: 'code', label: 'Code', width: 0.18, align: 'start' },
    { key: 'title', label: 'Course', width: 0.52, align: 'start' },
    { key: 'grade', label: 'Gr', width: 0.15, align: 'middle' },
    { key: 'credits', label: 'Cr', width: 0.15, align: 'middle' },
  ]

  const LogoComponent = branding.logo
  const logoSize = headerHeight * 0.38

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Logo rendered as React Native component (avoids SVG pattern tiling) */}
      {LogoComponent && (
        <View
          style={[
            styles.logoContainer,
            {
              top: headerHeight * 0.08,  // Position at top of header
              left: (width - logoSize) / 2,
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
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.accent} />
          </LinearGradient>
          <ClipPath id={clipId}>
            <Rect x={0} y={0} width={width} height={height} rx={10} ry={10} />
          </ClipPath>
        </Defs>

        <G clipPath={`url(#${clipId})`}>
          {/* Background */}
          <Rect x={0} y={0} width={width} height={height} fill="#FAFAFA" />

          {/* Header */}
          <Rect
            x={0}
            y={layout.header.y}
            width={width}
            height={headerHeight}
            fill={`url(#${gradientId})`}
          />

          {/* Title - positioned at bottom of header, below logo */}
          <SVGText
            x={width / 2}
            y={layout.header.y + headerHeight * 0.88}
            text="OFFICIAL TRANSCRIPT"
            fontSize={titleFontSize}
            fontWeight="bold"
            fill={colors.textInverse}
            textAnchor="middle"
          />

          {/* Student Information Section */}
          <G>
            <SVGText
              x={padding}
              y={layout.studentInfo.y + sectionFontSize}
              text="Student Information"
              fontSize={sectionFontSize}
              fontWeight="bold"
              fill={colors.primary}
            />
            <Line
              x1={padding}
              y1={layout.studentInfo.y + sectionFontSize + 4}
              x2={width - padding}
              y2={layout.studentInfo.y + sectionFontSize + 4}
              stroke={colors.accent}
              strokeWidth={1}
            />

            {/* Name */}
            <SVGText
              x={padding}
              y={layout.studentInfo.y + sectionFontSize + 20}
              text={`Name: ${data.student.fullName}`}
              fontSize={valueFontSize}
              fontWeight="normal"
              fill={colors.text}
            />

            {/* ID and DOB row */}
            <SVGText
              x={padding}
              y={layout.studentInfo.y + sectionFontSize + 40}
              text={`ID: ${data.student.number}`}
              fontSize={valueFontSize}
              fontWeight="normal"
              fill={colors.text}
            />
            {data.student.birthDate && (
              <SVGText
                x={width * 0.5}
                y={layout.studentInfo.y + sectionFontSize + 40}
                text={`DOB: ${data.student.birthDate}`}
                fontSize={valueFontSize}
                fontWeight="normal"
                fill={colors.text}
              />
            )}
          </G>

          {/* Academic Summary Section */}
          <G>
            <Rect
              x={padding}
              y={layout.summary.y}
              width={width - padding * 2}
              height={summaryHeight}
              rx={6}
              ry={6}
              fill="#F0F7FF"
              stroke={colors.accent}
              strokeWidth={1}
            />

            <SVGText
              x={padding + 10}
              y={layout.summary.y + sectionFontSize + 4}
              text="Academic Summary"
              fontSize={sectionFontSize}
              fontWeight="bold"
              fill={colors.primary}
            />

            {/* GPA and Credits Row */}
            <SVGText
              x={padding + 10}
              y={layout.summary.y + summaryHeight * 0.7}
              text="Cumulative GPA:"
              fontSize={labelFontSize}
              fontWeight="normal"
              fill="#666666"
            />
            <SVGText
              x={padding + 10 + width * 0.24}
              y={layout.summary.y + summaryHeight * 0.7}
              text={data.academics.gpa || 'N/A'}
              fontSize={valueFontSize}
              fontWeight="bold"
              fill={colors.primary}
            />

            <SVGText
              x={width * 0.55}
              y={layout.summary.y + summaryHeight * 0.7}
              text="Credits:"
              fontSize={labelFontSize}
              fontWeight="normal"
              fill="#666666"
            />
            <SVGText
              x={width * 0.55 + width * 0.13}
              y={layout.summary.y + summaryHeight * 0.7}
              text={data.academics.earnedCredits || 'N/A'}
              fontSize={valueFontSize}
              fontWeight="bold"
              fill={colors.primary}
            />
          </G>

          {/* Terms/Semesters */}
          {termsToShow.map((term, termIndex) => {
            const termLayout = layout.terms[termIndex]
            if (!termLayout) return null

            return (
              <G key={`term-${termIndex}`}>
                {/* Term Header */}
                <Rect
                  x={padding}
                  y={termLayout.y}
                  width={width - padding * 2}
                  height={termHeaderHeight}
                  rx={4}
                  ry={4}
                  fill={colors.primary}
                />
                <SVGText
                  x={padding + 10}
                  y={termLayout.y + termHeaderHeight * 0.68}
                  text={`${term.year}`}
                  fontSize={sectionFontSize}
                  fontWeight="bold"
                  fill={colors.textInverse}
                />
                <SVGText
                  x={width - padding - 10}
                  y={termLayout.y + termHeaderHeight * 0.68}
                  text={`GPA: ${term.gpa}`}
                  fontSize={sectionFontSize}
                  fontWeight="bold"
                  fill={colors.textInverse}
                  textAnchor="end"
                />

                {/* Course Table */}
                <SVGTable
                  x={padding}
                  y={termLayout.y + termHeaderHeight}
                  width={width - padding * 2}
                  columns={courseColumns}
                  rows={term.courses.map((c) => ({
                    code: c.code,
                    title: c.title,
                    grade: c.grade,
                    credits: c.credits,
                  }))}
                  headerBg="#E8EEF5"
                  headerTextColor={colors.text}
                  rowBg="#FFFFFF"
                  alternateRowBg="#F8FAFC"
                  textColor={colors.text}
                  fontSize={smallFontSize}
                  rowHeight={courseRowHeight}
                  headerHeight={tableHeaderHeight}
                  borderColor="#E0E0E0"
                  showBorder={true}
                />
              </G>
            )
          })}

          {/* Compact mode indicator */}
          {mode === 'compact' && data.terms.length > maxTermsInCompact && (
            <SVGText
              x={width / 2}
              y={layout.footer.y - sectionSpacing}
              text={`+ ${data.terms.length - maxTermsInCompact} more term${data.terms.length - maxTermsInCompact > 1 ? 's' : ''}`}
              fontSize={smallFontSize}
              fontWeight="normal"
              fill="#888888"
              textAnchor="middle"
            />
          )}

          {/* Footer */}
          <G>
            <Line
              x1={padding * 2}
              y1={layout.footer.y}
              x2={width - padding * 2}
              y2={layout.footer.y}
              stroke="#DDDDDD"
              strokeWidth={1}
            />
            <SVGText
              x={width / 2}
              y={layout.footer.y + footerHeight * 0.6}
              text={data.school.name}
              fontSize={smallFontSize}
              fontWeight="normal"
              fill="#888888"
              textAnchor="middle"
            />
          </G>
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  logoContainer: {
    position: 'absolute',
    zIndex: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
})

export default TranscriptSVG
