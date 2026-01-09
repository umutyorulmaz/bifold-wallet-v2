import React, { useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const VideoContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (!item['video-url']) {
    return null
  }

  const autoPlay = item['auto-play'] === true || item['auto-play'] === 'true'
  const orientation = item.orientation || 'landscape'
  const videoHeight = orientation === 'portrait' ? 400 : 200

  return (
    <View style={styles.fieldContainer}>
      {item.label && <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>{item.label}</Text>}

      <View
        style={{ width: '100%', height: videoHeight, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden' }}
      >
        {isLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {error && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <Text style={{ color: colors.text, textAlign: 'center' }}>Failed to load video</Text>
          </View>
        )}

        <Video
          source={{ uri: item['video-url'] }}
          style={{ width: '100%', height: '100%' }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoPlay}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError('Failed to load video')
          }}
        />
      </View>
    </View>
  )
}

ContentRegistry.register('video', VideoContent)

export default VideoContent
