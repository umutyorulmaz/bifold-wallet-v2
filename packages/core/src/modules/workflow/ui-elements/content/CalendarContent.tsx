/* eslint-disable no-console */
import React from 'react'
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ContentProps, ContentRegistry } from '../ContentRegistry'
import * as Calendar from 'expo-calendar'

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.length < 12) return null

  const year = Number(dateStr.slice(0, 4))
  const month = Number(dateStr.slice(4, 6)) - 1
  const day = Number(dateStr.slice(6, 8))
  const hour = Number(dateStr.slice(8, 10))
  const minute = Number(dateStr.slice(10, 12))

  if ([year, month, day, hour, minute].some(Number.isNaN)) return null
  return new Date(year, month, day, hour, minute)
}

const CalendarContent: React.FC<ContentProps> = ({ item, styles, colors }) => {
  const handleAddToCalendar = async () => {
    try {
      const start = parseDate(item.start || '')
      const end = parseDate(item.end || '')

      if (!start || !end) {
        Alert.alert('Invalid date', 'This event is missing a valid start or end time.')
        return
      }

      const { status } = await Calendar.requestCalendarPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Calendar access is needed to add this event.')
        return
      }

      //  Get the appropriate calendar ID for v12 API
      let calendarId: string

      if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync()
        calendarId = defaultCalendar.id
      } else {
        // Android: Find the primary calendar or create one
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
        const primaryCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0]

        if (!primaryCalendar) {
          // Create a calendar if none exists
          calendarId = await Calendar.createCalendarAsync({
            title: 'My Calendar',
            color: colors.primary,
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: undefined,
            source: {
              name: 'My Calendar',
              type: Calendar.SourceType.LOCAL,
              isLocalAccount: true,
            },
            name: 'myCalendar',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
          })
        } else {
          calendarId = primaryCalendar.id
        }
      }

      //  Create event using v12 API
      const eventId = await Calendar.createEventAsync(calendarId, {
        title: item.title || 'Event',
        startDate: start,
        endDate: end,
        location: item.location || '',
        notes: item.notes || '',
        timeZone: 'GMT',
        ...(Platform.OS === 'ios' && item.url ? { url: item.url } : {}),
      })

      console.log('✅ Calendar event created:', eventId)
      Alert.alert('Success', 'Event added to your calendar!')
    } catch (error) {
      console.error('❌ Error creating calendar event:', error)
      Alert.alert('Error', 'Failed to add event to calendar.')
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
