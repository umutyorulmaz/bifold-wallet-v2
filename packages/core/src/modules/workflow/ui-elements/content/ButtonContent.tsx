import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const ButtonContent: React.FC<ContentProps> = ({ item, onAction, styles, colors }) => {
  const handlePress = () => {
    if (item.actionID) {
      // If there's an invitationLink, pass it along
      onAction(item.actionID, item.invitationLink ? { invitationLink: item.invitationLink } : undefined)
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{item.label || 'Button'}</Text>
    </TouchableOpacity>
  )
}

ContentRegistry.register('button', ButtonContent)

export default ButtonContent
