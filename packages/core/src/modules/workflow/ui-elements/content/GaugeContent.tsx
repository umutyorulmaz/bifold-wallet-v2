import React from 'react'
import { View, Text } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const GaugeContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const value = parseFloat(item.value || '0')
  const min = parseFloat(item.min || '0')
  const max = parseFloat(item.max || '100')

  // Calculate percentage
  const percentage = ((value - min) / (max - min)) * 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  const size = 200
  const radius = (size - 20) / 2
  const strokeWidth = 20
  const circumference = Math.PI * radius // Half circle

  // Calculate dash offset
  const dashOffset = circumference - (clampedPercentage / 100) * circumference

  return (
    <View style={styles.fieldContainer}>
      {item.title && (
        <Text style={[styles.formLabel, { color: colors.text, marginBottom: 12, textAlign: 'center' }]}>
          {item.title}
        </Text>
      )}

      <View style={{ alignItems: 'center' }}>
        <Svg width={size} height={size / 2 + 20}>
          {/* Background arc */}
          <Path
            d={`M 10,${size / 2} A ${radius},${radius} 0 0,1 ${size - 10},${size / 2}`}
            fill="none"
            stroke={`${colors.primary}30`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <Path
            d={`M 10,${size / 2} A ${radius},${radius} 0 0,1 ${size - 10},${size / 2}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
          />
        </Svg>

        <Text style={[styles.title, { color: colors.text, marginTop: 8 }]}>{value}</Text>
        <Text style={[styles.description, { color: colors.text, fontSize: 12 }]}>
          {min} - {max}
        </Text>
      </View>
    </View>
  )
}

ContentRegistry.register('gauge', GaugeContent)

export default GaugeContent
