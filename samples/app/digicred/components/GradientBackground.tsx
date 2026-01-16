
import React from 'react'
import { StyleSheet, ViewStyle, StyleProp } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { DigiCredColors } from '../theme'

interface GradientBackgroundProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  colors?: string[]
  locations?: number[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  buttonPurple?: boolean
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  colors,
  locations,
  start,
  end,
  buttonPurple,
}) => {
  const usePreset = buttonPurple && colors == null && locations == null && start == null && end == null

  const finalColors =
    colors ?? (usePreset ? DigiCredColors.homeNoChannels.buttonGradient : ['#004D4D', '#005F5F', '#1A0F3D'])

  const finalLocations = locations ?? (usePreset ? DigiCredColors.homeNoChannels.buttonGradientLocations : [0, 0.5, 1])

  const finalStart = start ?? (usePreset ? { x: 0, y: 1 } : { x: -0.28, y: 0.3 })

  const finalEnd = end ?? (usePreset ? { x: 1, y: 0 } : { x: 1.28, y: 0.7 })

  return (
    <LinearGradient
      colors={finalColors}
      locations={finalLocations}
      start={finalStart}
      end={finalEnd}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
})

export default GradientBackground