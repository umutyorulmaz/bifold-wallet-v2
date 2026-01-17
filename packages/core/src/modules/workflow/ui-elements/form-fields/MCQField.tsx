import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const MCQField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const selected: string[] = Array.isArray(value) ? value : (value || '').split(',').filter(Boolean)

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]
    onChange(newSelected)
  }
  const options = field.options || []

  return (
    <View style={styles.fieldContainer}>
      {field.label && <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>{field.label}</Text>}
      {options.map((option: string, index: number) => {
        const isSelected = selected.includes(option)
        return (
          <TouchableOpacity key={index} style={styles.mcqRow} onPress={() => toggleOption(option)}>
            <View
              style={[
                styles.mcqBox,
                { borderColor: colors.primary },
                isSelected && { backgroundColor: colors.primary },
              ]}
            >
              {isSelected && <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>✓</Text>}
            </View>
            <Text style={[styles.mcqLabel, { color: colors.text }]}>{option}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

FormFieldRegistry.register('mcq', MCQField)
FormFieldRegistry.register('multiple-choice', MCQField)

export default MCQField
