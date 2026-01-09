import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const CheckboxField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const isChecked = value === true || value === 'true'

  return (
    <View style={styles.fieldContainer}>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => onChange(!isChecked)}>
        <View
          style={[styles.checkbox, { borderColor: colors.primary }, isChecked && { backgroundColor: colors.primary }]}
        >
          {isChecked && <Icon name="check" size={16} color="#fff" />}
        </View>
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>{field.label}</Text>
      </TouchableOpacity>
    </View>
  )
}

FormFieldRegistry.register('checkbox', CheckboxField)

export default CheckboxField
