import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const SubmitButtonField: React.FC<FormFieldProps> = ({ field, styles, colors }) => {
  // This is handled differently - it triggers form submission
  // The ActionMenuBubble should handle the actual submission
  // This component just renders the button UI

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary, marginTop: 8 }]}
      // Note: onPress is handled by the parent ActionMenuBubble
      // which looks for submit-button type and triggers form submission
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{field.label || 'Submit'}</Text>
    </TouchableOpacity>
  )
}

FormFieldRegistry.register('submit-button', SubmitButtonField)

export default SubmitButtonField
