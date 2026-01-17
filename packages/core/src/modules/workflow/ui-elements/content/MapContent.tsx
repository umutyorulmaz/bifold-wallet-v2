/* eslint-disable no-console */
import React, { useState } from 'react'
import { View, Text, Linking, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const MapContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const [mapError, setMapError] = useState(false)

  const latitude = parseFloat(item.latitude || '0')
  const longitude = parseFloat(item.longitude || '0')

  const isValidLat = !isNaN(latitude) && latitude >= -90 && latitude <= 90
  const isValidLon = !isNaN(longitude) && longitude >= -180 && longitude <= 180

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    Linking.openURL(url)
  }

  if (!isValidLat || !isValidLon) {
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.description, { color: colors.text }]}>Invalid map coordinates</Text>
      </View>
    )
  }

  // Fallback UI if map fails to load (API key missing/expired/error)
  if (mapError) {
    return (
      <View style={styles.fieldContainer}>
        {item.text && <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>{item.text}</Text>}

        <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.85}>
          <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={[styles.description, { color: colors.text }]}>
              Map preview unavailable. Tap to open in Google Maps.
            </Text>
            <Text style={[styles.description, { color: colors.text, marginTop: 6 }]}>
              {latitude}, {longitude}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  // Try to render embedded map with error boundary
  try {
    return (
      <View style={styles.fieldContainer}>
        {item.text && <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>{item.text}</Text>}

        <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.9}>
          <View style={{ width: '100%', height: 200, borderRadius: 8, overflow: 'hidden' }}>
            <MapView
              style={{ width: '100%', height: '100%' }}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Marker coordinate={{ latitude, longitude }} title={item.title} />
            </MapView>
          </View>

          <Text style={[styles.description, { color: colors.primary, textAlign: 'center', marginTop: 8 }]}>
            Tap to open in Maps
          </Text>
        </TouchableOpacity>
      </View>
    )
  } catch (error) {
    console.warn('❌ MapView rendering error:', error)
    setMapError(true)
    // Return fallback UI
    return (
      <View style={styles.fieldContainer}>
        {item.text && <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>{item.text}</Text>}

        <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.85}>
          <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={[styles.description, { color: colors.text }]}>
              Map preview unavailable. Tap to open in Google Maps.
            </Text>
            <Text style={[styles.description, { color: colors.text, marginTop: 6 }]}>
              {latitude}, {longitude}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

ContentRegistry.register('map', MapContent)
export default MapContent
