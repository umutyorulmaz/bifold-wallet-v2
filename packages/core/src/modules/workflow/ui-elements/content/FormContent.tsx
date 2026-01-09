import React from 'react'
import { View } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'

interface FormContentProps extends ContentProps {
  // Additional props passed from ActionMenuBubble
  formData?: Record<string, any>
  onFieldChange?: (name: string, value: any) => void
  FormFieldRegistry?: any
}

const FormContent: React.FC<FormContentProps> = ({
  item,
  styles,
  colors,
  formData = {},
  onFieldChange,
  FormFieldRegistry,
}) => {
  if (!item.fields || !Array.isArray(item.fields)) {
    return null
  }

  // If FormFieldRegistry not passed, try to import it
  // (In ActionMenuBubble, it should be passed as a prop)
  if (!FormFieldRegistry) {
    console.warn('FormFieldRegistry not provided to FormContent')
    return null
  }

  return (
    <View>
      {item.fields.map((field: any, index: number) => {
        const fieldValue = formData[field.name]
        const handleChange = (value: any) => {
          if (onFieldChange) {
            onFieldChange(field.name, value)
          }
        }

        // Render using FormFieldRegistry
        return (
          <View key={`${field.name}-${index}`}>
            {FormFieldRegistry.render(field.type, {
              field,
              value: fieldValue,
              onChange: handleChange,
              styles,
              colors,
            })}
          </View>
        )
      })}
    </View>
  )
}

ContentRegistry.register('form', FormContent)

export default FormContent
