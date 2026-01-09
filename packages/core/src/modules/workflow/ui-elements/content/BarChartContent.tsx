import React from 'react'
import { View, Text } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

interface BarItem {
  label: string
  count: number
}

const BarChartContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const bars: BarItem[] = item.bars || []

  if (bars.length === 0) {
    return null
  }

  // Find max count for scaling
  const maxCount = Math.max(...bars.map((b) => b.count), 1)

  return (
    <View style={styles.fieldContainer}>
      {item.title && <Text style={[styles.formLabel, { color: colors.text, marginBottom: 12 }]}>{item.title}</Text>}

      {bars.map((bar, index) => {
        const percentage = (bar.count / maxCount) * 100

        return (
          <View key={index} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={[styles.description, { color: colors.text, fontSize: 13 }]}>{bar.label}</Text>
              <Text style={[styles.description, { color: colors.text, fontSize: 13, fontWeight: '600' }]}>
                {bar.count}
              </Text>
            </View>

            <View
              style={{
                height: 24,
                backgroundColor: `${colors.primary}20`,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}

ContentRegistry.register('bar-chart', BarChartContent)

export default BarChartContent
