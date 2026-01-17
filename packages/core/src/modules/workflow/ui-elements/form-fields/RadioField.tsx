import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

interface RadioOption {
  label: string
  value: string
  default?: boolean
}

const RadioField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const options = field.options || []

  const renderRadioOption = (option: any, index: number) => {
    const isObjectOption = typeof option === 'object' && option !== null
    const optionLabel = isObjectOption ? (option as RadioOption).label : (option as string)
    const optionValue = isObjectOption ? (option as RadioOption).value : (option as string)
    const isSelected = value === optionValue

    return (
      <TouchableOpacity key={index} style={styles.radioRow} onPress={() => onChange(optionValue)}>
        <View
          style={[
            styles.radioOuter,
            { borderColor: colors.primary },
            isSelected && { backgroundColor: colors.primary },
          ]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.radioLabel, { color: colors.text }]}>{optionLabel}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.fieldContainer}>
      {field.label && <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>}
      {options.map(renderRadioOption)}
    </View>
  )
}

FormFieldRegistry.register('radio', RadioField)

export default RadioField
