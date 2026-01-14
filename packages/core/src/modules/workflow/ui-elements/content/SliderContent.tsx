/* eslint-disable no-console */
import React from 'react'
import { View } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'
import { FormFieldRegistry } from '../FormFieldRegistry'

interface SliderContentProps extends ContentProps {
  formData?: Record<string, any>
  onFieldChange?: (name: string, value: any) => void
  FormFieldRegistry?: any
}

const SliderContent: React.FC<SliderContentProps> = ({
  item,
  styles,
  colors,
  formData = {},
  onFieldChange,
  FormFieldRegistry: FormFieldReg,
}) => {
  const fieldName = item['form-id'] || 'slider'
  const currentValue = formData[fieldName] || item.value || '0'

  const handleChange = (value: any) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value)
    }
  }

  // Convert content item to form field format
  const field = {
    type: 'slider',
    name: fieldName,
    label: item.label || 'Slider',
    min: parseFloat(item.min || '0'),
    max: parseFloat(item.max || '100'),
  }

  // Use the passed FormFieldRegistry or import the global one
  const registry = FormFieldReg || FormFieldRegistry

  return (
    <View>
      {registry.render('slider', {
        field,
        value: currentValue,
        onChange: handleChange,
        styles,
        colors,
      })}
    </View>
  )
}

ContentRegistry.register('slider', SliderContent)

export default SliderContent
