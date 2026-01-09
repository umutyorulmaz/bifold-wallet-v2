import React from 'react'
import { View, Text } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const TitleContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  // Support field substitutions like {field_name}
  const text = item.text || ''

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.title, { color: colors.text }]}>{text}</Text>
    </View>
  )
}

// Register the component
ContentRegistry.register('title', TitleContent)

export default TitleContent
