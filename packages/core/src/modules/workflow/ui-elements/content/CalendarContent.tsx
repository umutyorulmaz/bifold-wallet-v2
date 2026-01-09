import React from 'react'
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ContentProps, ContentRegistry } from '../ContentRegistry'
import AddCalendarEvent from 'react-native-add-calendar-event'

const CalendarContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const handleAddToCalendar = async () => {
    try {
      // Parse date string (format: YYYYMMDDHHMM)
      const parseDate = (dateStr: string): Date => {
        const year = parseInt(dateStr.substring(0, 4))
        const month = parseInt(dateStr.substring(4, 6)) - 1 // Month is 0-indexed
        const day = parseInt(dateStr.substring(6, 8))
        const hour = parseInt(dateStr.substring(8, 10))
        const minute = parseInt(dateStr.substring(10, 12))
        return new Date(year, month, day, hour, minute)
      }

      const startDate = parseDate(item.start || '')
      const endDate = parseDate(item.end || '')

      const eventConfig = {
        title: item.title || 'Event',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: item.location || '',
        notes: item.notes || '',
        url: item.url || '',
      }

      AddCalendarEvent.presentEventCreatingDialog(eventConfig)
        .then((eventInfo) => {
          console.log('Event added:', eventInfo)
        })
        .catch((error) => {
          console.error('Error adding event:', error)
        })

      // Placeholder implementation:
      Alert.alert(
        'Add to Calendar',
        `${
          item.title || 'Event'
        }\n\nStart: ${startDate.toLocaleString()}\nEnd: ${endDate.toLocaleString()}\n\nLocation: ${
          item.location || 'N/A'
        }`,
        [{ text: 'OK' }]
      )
    } catch (error) {
      console.error('Error adding to calendar:', error)
      Alert.alert('Error', 'Failed to add event to calendar')
    }
  }

  return (
    <View style={styles.fieldContainer}>
      {item.text && <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>{item.text}</Text>}

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
        onPress={handleAddToCalendar}
        activeOpacity={0.8}
      >
        <Icon name="event" size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: colors.primary }]}>Add to Calendar</Text>
      </TouchableOpacity>
    </View>
  )
}

ContentRegistry.register('calendar', CalendarContent)

export default CalendarContent
