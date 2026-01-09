import React from 'react'
import { View, Text } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const CardContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  return (
    <View
      style={[
        styles.fieldContainer,
        {
          padding: 16,
          borderRadius: 8,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
    >
      {item.title && <Text style={[styles.formLabel, { color: colors.text, marginBottom: 8 }]}>{item.title}</Text>}
      {item.text && <Text style={[styles.description, { color: colors.text }]}>{item.text}</Text>}
    </View>
  )
}

ContentRegistry.register('card', CardContent)

export default CardContent
