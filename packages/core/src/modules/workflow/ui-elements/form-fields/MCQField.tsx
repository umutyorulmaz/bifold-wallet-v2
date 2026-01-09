import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const MCQField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const selected: string[] = Array.isArray(value) ? value : (value || '').split(',').filter(Boolean)

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]
    onChange(newSelected)
  }

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      {field.options?.map((option, index) => {
        const isSelected = selected.includes(option)
        return (
          <TouchableOpacity key={index} style={styles.mcqRow} onPress={() => toggleOption(option)}>
            <View
              style={[
                styles.mcqBox,
                { borderColor: colors.primary },
                isSelected && { backgroundColor: colors.primary },
              ]}
            />
            <Text style={[styles.mcqLabel, { color: colors.text }]}>{option}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

FormFieldRegistry.register('mcq', MCQField)

export default MCQField
