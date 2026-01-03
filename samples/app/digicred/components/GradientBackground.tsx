import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { DigiCredColors } from '../theme'

interface GradientBackgroundProps {
  children: React.ReactNode
  style?: ViewStyle
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
  return (
    <LinearGradient
      colors={DigiCredColors.gradient.colors}
      locations={DigiCredColors.gradient.locations}
      style={[styles.gradient, style]}
      start={{ x: -0.28, y: 0.3 }}
      end={{ x: 1.28, y: 0.7 }}
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
