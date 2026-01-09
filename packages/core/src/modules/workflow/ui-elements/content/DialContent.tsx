import React from 'react'
import { View, Text, TouchableOpacity, Linking } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const DialContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const handleDial = () => {
    if (item.number) {
      Linking.openURL(`tel:${item.number}`)
    }
  }

  if (!item.number) {
    return null
  }

  return (
    <View style={styles.fieldContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.background,
            borderWidth: 2,
            borderColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        onPress={handleDial}
        activeOpacity={0.8}
      >
        <Icon name="phone" size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: colors.primary }]}>{item.text || `Call ${item.number}`}</Text>
      </TouchableOpacity>
    </View>
  )
}

ContentRegistry.register('dial', DialContent)

export default DialContent
