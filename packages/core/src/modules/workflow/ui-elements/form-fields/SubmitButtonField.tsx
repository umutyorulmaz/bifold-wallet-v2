/* eslint-disable no-console */

import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const SubmitButtonField: React.FC<FormFieldProps> = ({ field, onChange, styles, colors }) => {
  const handlePress = () => {
    // Trigger onChange which will be caught by ActionMenuBubble
    if (onChange) {
      onChange('submit')
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary, marginTop: 8 }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{field.label || 'Submit'}</Text>
    </TouchableOpacity>
  )
}

FormFieldRegistry.register('submit-button', SubmitButtonField)

export default SubmitButtonField
