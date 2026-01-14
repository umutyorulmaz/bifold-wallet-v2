/* eslint-disable no-console */
import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

interface SubmitButtonContentProps extends ContentProps {
  formData?: Record<string, any>
}

const SubmitButtonContent: React.FC<SubmitButtonContentProps> = ({ item, styles, colors, onAction, formData = {} }) => {
  const handlePress = () => {
    // Trigger the action with form data
    if (item.actionID) {
      onAction(item.actionID, formData)
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary, marginTop: 8 }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{item.label || 'Submit'}</Text>
    </TouchableOpacity>
  )
}

ContentRegistry.register('submit-button', SubmitButtonContent)

export default SubmitButtonContent
