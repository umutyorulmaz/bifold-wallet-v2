import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const DropdownField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      <TouchableOpacity style={[styles.dropdown, { borderColor: colors.border }]} onPress={() => setIsOpen(true)}>
        <Text style={{ color: value ? colors.text : colors.border }}>{value || 'Select...'}</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={[styles.dropdownList, { backgroundColor: colors.background }]}>
            <FlatList
              data={field.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onChange(item)
                    setIsOpen(false)
                  }}
                >
                  <Text style={{ color: colors.text }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

FormFieldRegistry.register('dropdown', DropdownField)

export default DropdownField
