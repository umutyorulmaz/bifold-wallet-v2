import React from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

const TextContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const text = item.text || ''
  const type = item.type || 'text'

  // Get icon and color based on type
  const getIconConfig = () => {
    switch (type) {
      case 'information':
        return { name: 'info', color: '#2196F3' } // Blue
      case 'warning':
        return { name: 'warning', color: '#FF9800' } // Orange
      case 'error':
        return { name: 'error', color: '#F44336' } // Red
      case 'pass':
        return { name: 'check-circle', color: '#4CAF50' } // Green
      case 'fail':
        return { name: 'cancel', color: '#F44336' } // Red
      default:
        return null
    }
  }

  const iconConfig = getIconConfig()

  // Regular text type
  if (type === 'text') {
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.description, { color: colors.text }]}>{text}</Text>
      </View>
    )
  }

  // Icon box types (information, warning, error, pass, fail)
  return (
    <View
      style={[
        styles.fieldContainer,
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderRadius: 8,
          backgroundColor: `${iconConfig?.color}15`, // 15 is hex for ~8% opacity
          borderWidth: 1,
          borderColor: iconConfig?.color || colors.border,
        },
      ]}
    >
      {iconConfig && <Icon name={iconConfig.name} size={24} color={iconConfig.color} style={{ marginRight: 12 }} />}
      <Text style={[styles.description, { color: colors.text, flex: 1 }]}>{text}</Text>
    </View>
  )
}

// Register for all text-based types
ContentRegistry.register('text', TextContent)
ContentRegistry.register('information', TextContent)
ContentRegistry.register('warning', TextContent)
ContentRegistry.register('error', TextContent)
ContentRegistry.register('pass', TextContent)
ContentRegistry.register('fail', TextContent)

export default TextContent
