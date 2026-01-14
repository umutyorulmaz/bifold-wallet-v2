/* eslint-disable no-console */
import React from 'react'
import { View } from 'react-native'
import { ContentProps, ContentRegistry } from '../ContentRegistry'
import { FormFieldRegistry } from '../FormFieldRegistry'

interface MultipleChoiceContentProps extends ContentProps {
  formData?: Record<string, any>
  onFieldChange?: (name: string, value: any) => void
  FormFieldRegistry?: any
}

const MultipleChoiceContent: React.FC<MultipleChoiceContentProps> = ({
  item,
  styles,
  colors,
  formData = {},
  onFieldChange,
  FormFieldRegistry: FormFieldReg,
}) => {
  const fieldName = item['form-id'] || 'mcq'
  const currentValue = formData[fieldName] || []

  const handleChange = (value: any) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value)
    }
  }

  // Convert content item to form field format
  const field = {
    type: 'mcq',
    name: fieldName,
    label: item.question || 'Select options',
    options: (item.answers || []).map((a: any) => a.option),
  }

  const registry = FormFieldReg || FormFieldRegistry

  return (
    <View>
      {registry.render('mcq', {
        field,
        value: currentValue,
        onChange: handleChange,
        styles,
        colors,
      })}
    </View>
  )
}

ContentRegistry.register('multiple-choice', MultipleChoiceContent)

export default MultipleChoiceContent
