import React, { useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  UIManager,
  findNodeHandle,
} from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

type Anchor = { x: number; y: number; width: number; height: number } | null

const DropdownField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [anchor, setAnchor] = useState<Anchor>(null)
  const triggerRef = useRef<View>(null)

  const options = useMemo(() => field.options || [], [field.options])

  const open = () => {
    const node = findNodeHandle(triggerRef.current)
    if (!node) {
      setIsOpen(true)
      return
    }

    UIManager.measureInWindow(node, (x, y, width, height) => {
      setAnchor({ x, y, width, height })
      setIsOpen(true)
    })
  }

  const close = () => setIsOpen(false)

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>

      {/* Trigger */}
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.background }]}
          onPress={open}
        >
          <Text style={{ color: value ? colors.text : colors.border }}>{value || 'Select...'}</Text>
          <Text style={{ position: 'absolute', right: 12, color: colors.text }}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Modal dropdown */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={modalStyles.backdrop} onPress={close}>
          <Pressable
            // prevent closing when tapping inside menu
            onPress={() => {}}
            style={[
              modalStyles.menu,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                left: anchor?.x ?? 16,
                top: (anchor?.y ?? 0) + (anchor?.height ?? 0) + 8,
                width: anchor?.width ?? undefined,
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    modalStyles.item,
                    { borderBottomColor: colors.border },
                    index === options.length - 1 && modalStyles.lastItem,
                  ]}
                  onPress={() => {
                    onChange(item)
                    close()
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16 }}>{item}</Text>
                  {value === item && <Text style={{ color: colors.primary }}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 240,
    // Android
    elevation: 10,
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
})

FormFieldRegistry.register('dropdown', DropdownField)
FormFieldRegistry.register('drop-down', DropdownField)

export default DropdownField
