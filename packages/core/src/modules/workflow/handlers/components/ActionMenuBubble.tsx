/* eslint-disable no-console */
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../../../../contexts/theme'
import { ActionMenuContentItem } from '../../types'
import { ContentRegistry, FormFieldRegistry } from '../../ui-elements'
// import { TOKENS, useServices } from '../../../../container-api'

interface ActionMenuBubbleProps {
  content: ActionMenuContentItem[]
  workflowID: string
  onActionPress: (actionId: string, workflowID: string, invitationLinkOrData?: string | any) => void
  contextData?: Record<string, any>
}

interface FormData {
  [key: string]: any
}

//  helper function to map JSON types to registry types
const mapTypeToRegistryType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'text-field': 'text',
    'check-box': 'checkbox',
    'drop-down': 'dropdown',
    'submit-button': 'submit-button',
    'text-area': 'textarea',
    'radio-button': 'radio',
    mcq: 'mcq',
    'multiple-choice': 'mcq',
    'date-field': 'date',
    'slider-field': 'slider',
  }
  return typeMap[type] || type
}

// Helper function to group radio buttons by form-id
// Groups radio buttons with the same form-id into a single renderable object
const groupRadioButtons = (content: ActionMenuContentItem[]) => {
  const radioGroups: { [key: string]: any[] } = {}
  const processedIndices = new Set<number>()
  const processedContent: any[] = []

  // First pass: collect all radio buttons by form-id
  content.forEach((item, index) => {
    if (item.type === 'radio-button' && item['form-id']) {
      const formId = item['form-id']
      if (!radioGroups[formId]) {
        radioGroups[formId] = []
      }
      radioGroups[formId].push({
        label: item.label,
        value: item.value,
        default: item.default,
        form: item.form,
      })
      processedIndices.add(index)
    }
  })

  // Second pass: build final content array with grouped radio buttons
  content.forEach((item, index) => {
    if (processedIndices.has(index)) {
      // This is a radio button - check if it's the first in its group
      const formId = item['form-id']
      if (formId && radioGroups[formId]) {
        const firstIndex = content.findIndex((i) => i.type === 'radio-button' && i['form-id'] === formId)
        // Only add the group once (at the position of the first radio button)
        if (index === firstIndex) {
          processedContent.push({
            isRadioGroup: true,
            type: 'radio-button',
            formId,
            form: item.form,
            options: radioGroups[formId],
          })
        }
      }
    } else {
      // Not a radio button - add as-is
      processedContent.push(item)
    }
  })

  return processedContent
}

//  helper function to resolve placeholder values
const resolveValue = (value: any, formData: FormData, additionalData?: any): any => {
  if (typeof value !== 'string') return value

  // Match patterns like {field1}, {alias}, {status}
  const placeholderPattern = /\{([^}]+)\}/g

  return value.replace(placeholderPattern, (match, key) => {
    // First check formData, then additionalData
    if (formData[key] !== undefined) {
      return String(formData[key])
    }
    if (additionalData && additionalData[key] !== undefined) {
      return String(additionalData[key])
    }
    // Return empty string if no match found
    return ''
  })
}

export const ActionMenuBubble: React.FC<ActionMenuBubbleProps> = ({
  content,
  workflowID,
  onActionPress,
  contextData = {},
}) => {
  const { ColorPalette } = useTheme()
  const [formData, setFormData] = useState<FormData>({})

  //Use ref to track initialization and prevent infinite loops
  const hasInitialized = React.useRef(false)
  const workflowIDRef = React.useRef(workflowID)

  // Only initialize once per workflowID change
  React.useEffect(() => {
    // Reset initialization flag when workflowID changes
    if (workflowIDRef.current !== workflowID) {
      hasInitialized.current = false
      workflowIDRef.current = workflowID
    }

    if (!hasInitialized.current) {
      console.log('🔄 Initializing form data for workflowID:', workflowID)
      const initialData: FormData = {}
      content.forEach((item) => {
        const formId = 'form-id' in item ? item['form-id'] : undefined
        if (!formId) return

        // Radio buttons: only initialize from `default: true`
        if (item.type === 'radio-button') {
          if (item.default === true) {
            initialData[formId] = item.value
          }
          return
        }

        //  Checkboxes: initialize true when value is "true"
        if (item.type === 'check-box') {
          initialData[formId] = item.value === 'true'
          return
        }

        //  Everything else: initialize from value if present
        if (item.value !== undefined && item.value !== null && item.value !== '') {
          initialData[formId] = resolveValue(item.value, {}, contextData)
        }
      })
      setFormData(initialData)
      hasInitialized.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowID]) // Only depend on workflowID
  // const { width } = Dimensions.get('window')
  // const [GradientBackground] = useServices([TOKENS.COMPONENT_GRADIENT_BACKGROUND])

  const colors = {
    primary: ColorPalette.brand.primary,
    text: ColorPalette.brand.text,
    background: ColorPalette.brand.secondaryBackground,
    border: ColorPalette.brand.primary,
  }

  const styles = StyleSheet.create({
    bubble: {
      backgroundColor: ColorPalette.grayscale.digicredBackgroundModal,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: ColorPalette.brand.primary,
      alignSelf: 'stretch',
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
    buttonContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    button: {
      flexDirection: 'row',
      paddingTop: 12,
      paddingRight: 27,
      paddingBottom: 12,
      paddingLeft: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      height: 50,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 24,
      textAlign: 'center',
      color: ColorPalette.grayscale.white,
      textTransform: 'uppercase',
    },
    textInput: {
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
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 4,
    },
    radioButtonIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: ColorPalette.brand.primary,
    },
    radioButtonIconSelected: {
      backgroundColor: ColorPalette.brand.primary,
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
    radioButtonText: {
      fontSize: 15,
      color: ColorPalette.brand.text,
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
    console.log('📝 Field changed:', name, '=', value)

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAction = (actionId: string, data?: any) => {
    onActionPress(actionId, workflowID, data)
  }

  //  Update rendering logic to handle form fields
  return (
    <View style={styles.bubble}>
      {/* Group radio buttons before rendering */}
      {groupRadioButtons(content).map((item, index) => {
        // console.log('🎨 Rendering item type:', item.type)

        // Check if this is a grouped radio button set
        if (item.isRadioGroup) {
          // console.log(`✅ Rendering radio button group: ${item.formId}`)

          const field = {
            name: item.formId,
            label: '', // No group label as per requirements
            options: item.options, // Array of {label, value, default}
            type: 'radio',
          }

          const currentValue = formData[item.formId]

          return (
            <View key={`radio-group-${item.formId}-${index}`}>
              {FormFieldRegistry.render('radio', {
                field,
                value: currentValue,
                onChange: (value: any) => {
                  handleFieldChange(item.formId, value)
                },
                styles,
                colors,
              })}
            </View>
          )
        }
        //  Check if this is a form field
        const isFormField = item['form-id'] !== undefined

        if (isFormField) {
          // This is a form field - use FormFieldRegistry
          const registryType = mapTypeToRegistryType(item.type)

          // Type assertion to access form-specific properties
          const formItem = item as ActionMenuContentItem & { 'form-id'?: string }

          // Prepare field object for FormFieldRegistry
          const field = {
            name: formItem['form-id'] || '',
            label: formItem.label || formItem.question || '',
            placeholder: formItem.placeholder,
            options:
              formItem.values ||
              formItem.options ||
              (formItem.answers ? formItem.answers.map((a: any) => a.option) : []),
            required: formItem.required,
            type: registryType,
            actionID: formItem.actionID,
            min: formItem.min ? Number(formItem.min) : undefined,
            max: formItem.max ? Number(formItem.max) : undefined,
          }

          // Get current value from formData
          const currentValue = formData[formItem['form-id'] || '']

          return (
            <View key={`field-${index}`}>
              {FormFieldRegistry.render(registryType, {
                field,
                value: currentValue,
                onChange: (value: any) => {
                  // Check if this is a submit button
                  if (item.type === 'submit-button') {
                    // Get the actionID from the item
                    if (item.actionID) {
                      handleAction(item.actionID, formData)
                    } else {
                      console.error('❌ Submit button has no actionID!')
                    }
                  } else if (formItem['form-id']) {
                    // Regular form field - update form data
                    handleFieldChange(formItem['form-id'], value)
                  }
                },
                styles,
                colors,
              })}
            </View>
          )
        } else {
          // Regular content item - resolve any placeholder values in text
          const resolvedItem = {
            ...item,
            text: item.text ? resolveValue(item.text, formData, contextData) : item.text,
            label: item.label ? resolveValue(item.label, formData, contextData) : item.label,
          }

          return (
            <View key={`content-${index}`}>
              {ContentRegistry.render(item.type, {
                item: resolvedItem,
                onAction: handleAction,
                styles,
                colors,
                formData,
                onFieldChange: handleFieldChange,
                FormFieldRegistry,
              })}
            </View>
          )
        }
      })}
    </View>
  )
}
