import React from 'react'
import { View, Text, Linking, TouchableOpacity } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const MapContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const latitude = parseFloat(item.latitude || '0')
  const longitude = parseFloat(item.longitude || '0')
  const title = item.title || 'Location'

  if (!latitude || !longitude) {
    return null
  }

  const handleOpenMaps = () => {
    // Open in device's default maps app
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    Linking.openURL(url)
  }

  return (
    <View style={styles.fieldContainer}>
      {item.text && <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>{item.text}</Text>}

      <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.9}>
        <View style={{ width: '100%', height: 200, borderRadius: 8, overflow: 'hidden' }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={{ latitude, longitude }} title={title} />
          </MapView>

          {/* Overlay to make entire map tappable */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
            }}
          />
        </View>

        <Text style={[styles.description, { color: colors.primary, textAlign: 'center', marginTop: 8 }]}>
          Tap to open in Maps
        </Text>
      </TouchableOpacity>
    </View>
  )
}

ContentRegistry.register('map', MapContent)

export default MapContent
