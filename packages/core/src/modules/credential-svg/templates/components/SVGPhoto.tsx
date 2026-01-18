import React from 'react'
import { G, Rect, Image, Defs, ClipPath, Circle } from 'react-native-svg'

export interface SVGPhotoProps {
  x: number
  y: number
  width: number
  height: number
  photoUri?: string
  borderRadius?: number
  borderColor?: string
  borderWidth?: number
  backgroundColor?: string
  clipShape?: 'rect' | 'circle'
}

/**
 * SVG Photo component for displaying student photos
 * Supports rectangular or circular clipping, with fallback placeholder
 */
export const SVGPhoto: React.FC<SVGPhotoProps> = ({
  x,
  y,
  width,
  height,
  photoUri,
  borderRadius = 4,
  borderColor = '#E0E0E0',
  borderWidth = 1,
  backgroundColor = '#F5F5F5',
  clipShape = 'rect',
}) => {
  const clipId = `photo-clip-${x}-${y}`

  // For circle, use the smaller dimension as diameter
  const circleRadius = Math.min(width, height) / 2
  const circleCenterX = x + width / 2
  const circleCenterY = y + height / 2

  return (
    <G>
      {/* Define clip path */}
      <Defs>
        <ClipPath id={clipId}>
          {clipShape === 'circle' ? (
            <Circle cx={circleCenterX} cy={circleCenterY} r={circleRadius - borderWidth} />
          ) : (
            <Rect
              x={x + borderWidth}
              y={y + borderWidth}
              width={width - borderWidth * 2}
              height={height - borderWidth * 2}
              rx={borderRadius}
              ry={borderRadius}
            />
          )}
        </ClipPath>
      </Defs>

      {/* Border/Background */}
      {clipShape === 'circle' ? (
        <Circle
          cx={circleCenterX}
          cy={circleCenterY}
          r={circleRadius}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
      ) : (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={borderRadius}
          ry={borderRadius}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
      )}

      {/* Photo or Placeholder */}
      {photoUri ? (
        <Image
          x={x + borderWidth}
          y={y + borderWidth}
          width={width - borderWidth * 2}
          height={height - borderWidth * 2}
          href={photoUri}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <G clipPath={`url(#${clipId})`}>
          {/* Placeholder silhouette */}
          <PlaceholderSilhouette
            x={x + borderWidth}
            y={y + borderWidth}
            width={width - borderWidth * 2}
            height={height - borderWidth * 2}
          />
        </G>
      )}
    </G>
  )
}

/**
 * Simple placeholder silhouette for when no photo is available
 */
const PlaceholderSilhouette: React.FC<{
  x: number
  y: number
  width: number
  height: number
}> = ({ x, y, width, height }) => {
  const centerX = x + width / 2
  const headRadius = width * 0.2
  const headY = y + height * 0.3

  const bodyTopY = headY + headRadius + height * 0.05
  const bodyWidth = width * 0.6
  const bodyHeight = height * 0.5

  return (
    <G>
      {/* Head */}
      <Circle cx={centerX} cy={headY} r={headRadius} fill="#CCCCCC" />

      {/* Body (shoulders) */}
      <Rect
        x={centerX - bodyWidth / 2}
        y={bodyTopY}
        width={bodyWidth}
        height={bodyHeight}
        rx={bodyWidth / 2}
        ry={bodyWidth / 4}
        fill="#CCCCCC"
      />
    </G>
  )
}

export default SVGPhoto
