import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const DateField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const [showPicker, setShowPicker] = useState(false)
  const dateValue = value ? new Date(value) : new Date()

  const formatDate = (date: Date) => date.toLocaleDateString()

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      <TouchableOpacity style={[styles.dateButton, { borderColor: colors.border }]} onPress={() => setShowPicker(true)}>
        <Text style={{ color: colors.text }}>{value ? formatDate(dateValue) : 'Select date...'}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setShowPicker(Platform.OS === 'ios')
            if (date) onChange(date.toISOString())
          }}
        />
      )}
    </View>
  )
}

FormFieldRegistry.register('date', DateField)

export default DateField
