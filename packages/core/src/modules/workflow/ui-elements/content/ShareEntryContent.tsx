import React, { useRef } from 'react'
import { View, TouchableOpacity, Text, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const ShareEntryContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const viewShotRef = useRef<ViewShot>(null)

  const handleShare = async () => {
    try {
      if (viewShotRef.current?.capture) {
        // Capture the view as image
        const uri = await viewShotRef.current.capture()

        // Share the image
        await Share.open({
          url: `file://${uri}`,
          type: 'image/png',
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
      Alert.alert('Error', 'Failed to share content')
    }
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
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <Icon name="share" size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: colors.primary }]}>{item.label || 'Share'}</Text>
      </TouchableOpacity>
    </View>
  )
}

ContentRegistry.register('share-entry', ShareEntryContent)

export default ShareEntryContent
