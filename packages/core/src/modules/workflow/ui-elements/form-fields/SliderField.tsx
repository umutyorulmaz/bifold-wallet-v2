import React from 'react'
import { View, Text } from 'react-native'
import Slider from '@react-native-community/slider'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const SliderField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const numValue = Number(value) || field.min || 0

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>
        {field.label}: {numValue}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={field.min || 0}
        maximumValue={field.max || 100}
        value={numValue}
        onValueChange={(v: number) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.primary}
        thumbTintColor={colors.primary}
      />
    </View>
  )
}

FormFieldRegistry.register('slider', SliderField)

export default SliderField
