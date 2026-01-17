import React from 'react'
import { View, TextInput, Text } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const TextField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={value || ''}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor={colors.border}
      />
    </View>
  )
}

// Register the component
FormFieldRegistry.register('text', TextField)
FormFieldRegistry.register('text-field', TextField)

export default TextField
