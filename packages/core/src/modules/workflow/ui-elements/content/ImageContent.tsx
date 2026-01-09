import React from 'react'
import { View, Image, ImageStyle } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const ImageContent: React.FC<ContentProps> = ({ item, styles }) => {
  if (!item.url) {
    return null
  }

  return (
    <View style={styles.fieldContainer}>
      <Image source={{ uri: item.url }} style={styles.image as ImageStyle} resizeMode="contain" />
    </View>
  )
}

ContentRegistry.register('image', ImageContent)

export default ImageContent
