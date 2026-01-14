/* eslint-disable no-console */
/**
 * ActionMenuBubble Component
 *
 * Renders action menu messages using ContentRegistry and FormFieldRegistry.
 * Enhanced with registry pattern for extensibility.
 */

import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../../../contexts/theme'
import { ActionMenuContentItem } from '../../types'
import { ContentRegistry, FormFieldRegistry } from '../../ui-elements'

interface ActionMenuBubbleProps {
  content: ActionMenuContentItem[]
  workflowID: string
  onActionPress: (actionId: string, workflowID: string, invitationLinkOrData?: string | any) => void
}

interface FormData {
  [key: string]: any
}

export const ActionMenuBubble: React.FC<ActionMenuBubbleProps> = ({ content, workflowID, onActionPress }) => {
  const { ColorPalette } = useTheme()
  const [formData, setFormData] = useState<FormData>({})

  const colors = {
    primary: ColorPalette.brand.primary,
    text: ColorPalette.brand.text,
    background: ColorPalette.brand.secondaryBackground,
    border: ColorPalette.brand.primary,
  }

  const styles = StyleSheet.create({
    bubble: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: ColorPalette.brand.primary,
      width: 320,
      maxWidth: '100%',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      color: ColorPalette.brand.text,
    },
    image: {
      width: '100%',
      height: 150,
      marginBottom: 12,
      borderRadius: 8,
    },
    description: {
      fontSize: 15,
      marginBottom: 12,
      color: ColorPalette.brand.text,
      lineHeight: 22,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginVertical: 6,
      width: '100%',
      backgroundColor: ColorPalette.brand.primary,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      color: ColorPalette.grayscale.white,
    },
    input: {
      height: 48,
      borderColor: ColorPalette.brand.primary,
      borderWidth: 1.5,
      marginBottom: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: ColorPalette.brand.tertiaryBackground,
      color: ColorPalette.brand.text,
      fontSize: 15,
    },
    fieldContainer: {
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: ColorPalette.brand.text,
      marginBottom: 8,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: ColorPalette.brand.text,
      marginBottom: 8,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 4,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    radioLabel: {
      fontSize: 15,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderRadius: 4,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxLabel: {
      fontSize: 15,
    },
    mcqRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
    },
    mcqBox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: 4,
      marginRight: 10,
    },
    mcqLabel: {
      fontSize: 15,
    },
    dropdown: {
      height: 48,
      borderWidth: 1,
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    dropdownList: {
      borderRadius: 8,
      maxHeight: 200,
    },
    dropdownItem: {
      padding: 12,
      borderBottomWidth: 1,
    },
    dateButton: {
      height: 48,
      borderWidth: 1,
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAction = (actionId: string, data?: any) => {
    if (typeof data === 'string' && data.length > 0) {
      // It's an invitationLink - pass it
      onActionPress(actionId, workflowID, data)
    } else {
      // No invitationLink - call with only 2 params
      onActionPress(actionId, workflowID)
    }
  }

  return (
    <View style={styles.bubble}>
      {content.map((item, index) => {
        return (
          <View key={index}>
            {ContentRegistry.render(item.type, {
              item,
              onAction: handleAction,
              styles,
              colors,
              // Pass form-related props to all content types
              formData,
              onFieldChange: handleFieldChange,
              FormFieldRegistry,
              content,
            })}
          </View>
        )
      })}
    </View>
  )
}
