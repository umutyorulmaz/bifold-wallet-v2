import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const RadioField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      {field.options?.map((option, index) => (
        <TouchableOpacity key={index} style={styles.radioRow} onPress={() => onChange(option)}>
          <View
            style={[
              styles.radioOuter,
              { borderColor: colors.primary },
              value === option && { backgroundColor: colors.primary },
            ]}
          >
            {value === option && <View style={styles.radioInner} />}
          </View>
          <Text style={[styles.radioLabel, { color: colors.text }]}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

FormFieldRegistry.register('radio', RadioField)

export default RadioField
