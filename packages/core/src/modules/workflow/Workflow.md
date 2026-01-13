# Extending Workflow UI Elements

This guide explains how to add new UI element types to the BasicMessage workflow system using a **registry pattern** for clean, extensible code.

## Architecture Overview

Instead of using long `switch` statements and union types (`'a' | 'b' | 'c'`), we use a **component registry** pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Element Registry                   │
├─────────────────────────────────────────────────────────┤
│  'text'     → TextFieldRenderer                         │
│  'radio'    → RadioFieldRenderer                        │
│  'checkbox' → CheckboxFieldRenderer                     │
│  'map'      → MapContentRenderer                        │
│  ...        → ...                                       │
└─────────────────────────────────────────────────────────┘
                            ↓
              Registry.render(type, props)
                            ↓
                   Renders Component
```

## File Structure

```
packages/core/src/modules/workflow/
├── types.ts
├── ui-elements/
│   ├── index.ts                    # Registry exports
│   ├── FormFieldRegistry.ts        # Form field registry
│   ├── ContentRegistry.ts          # Content type registry
│   ├── form-fields/                # Form field components
│   │   ├── TextField.tsx
│   │   ├── RadioField.tsx
│   │   ├── CheckboxField.tsx
│   │   ├── DateField.tsx
│   │   ├── DropdownField.tsx
│   │   ├── SliderField.tsx
│   │   └── MCQField.tsx
│   └── content/                    # Content components
│       ├── ImageContent.tsx
│       ├── TitleContent.tsx
│       ├── TextContent.tsx
│       ├── ButtonContent.tsx
│       ├── FormContent.tsx
│       ├── MapContent.tsx
│       ├── CalendarContent.tsx
│       └── VideoContent.tsx
└── handlers/
    └── components/
        └── ActionMenuBubble.tsx    # Uses registry
```

---

## Step 1: Create the Registry

### `packages/core/src/modules/workflow/ui-elements/FormFieldRegistry.ts`

```typescript
import React from 'react'
import { ViewStyle } from 'react-native'

// Base props all form fields receive
export interface FormFieldProps {
  field: {
    type: string
    name: string
    label: string
    options?: string[]
    min?: number
    max?: number
    placeholder?: string
    required?: boolean
    [key: string]: any  // Allow custom properties
  }
  value: any
  onChange: (value: any) => void
  styles: Record<string, ViewStyle>
  colors: {
    primary: string
    text: string
    background: string
    border: string
  }
}

// Renderer function type
export type FormFieldRenderer = React.FC<FormFieldProps>

// The registry
class FormFieldRegistryClass {
  private renderers = new Map<string, FormFieldRenderer>()

  register(type: string, renderer: FormFieldRenderer) {
    this.renderers.set(type, renderer)
  }

  get(type: string): FormFieldRenderer | undefined {
    return this.renderers.get(type)
  }

  has(type: string): boolean {
    return this.renderers.has(type)
  }

  render(type: string, props: FormFieldProps): React.ReactNode {
    const Renderer = this.renderers.get(type)
    if (!Renderer) {
      console.warn(`Unknown form field type: ${type}`)
      return null
    }
    return <Renderer {...props} />
  }

  // Get all registered types (useful for validation)
  getTypes(): string[] {
    return Array.from(this.renderers.keys())
  }
}

export const FormFieldRegistry = new FormFieldRegistryClass()
```

### `packages/core/src/modules/workflow/ui-elements/ContentRegistry.ts`

```typescript
import React from 'react'
import { ViewStyle } from 'react-native'

// Base props all content types receive
export interface ContentProps {
  item: {
    type: string
    text?: string
    url?: string
    label?: string
    actionID?: string
    fields?: any[]
    [key: string]: any  // Allow custom properties
  }
  onAction: (actionId: string, data?: any) => void
  styles: Record<string, ViewStyle>
  colors: {
    primary: string
    text: string
    background: string
    border: string
  }
}

export type ContentRenderer = React.FC<ContentProps>

class ContentRegistryClass {
  private renderers = new Map<string, ContentRenderer>()

  register(type: string, renderer: ContentRenderer) {
    this.renderers.set(type, renderer)
  }

  get(type: string): ContentRenderer | undefined {
    return this.renderers.get(type)
  }

  has(type: string): boolean {
    return this.renderers.has(type)
  }

  render(type: string, props: ContentProps): React.ReactNode {
    const Renderer = this.renderers.get(type)
    if (!Renderer) {
      console.warn(`Unknown content type: ${type}`)
      return null
    }
    return <Renderer {...props} />
  }

  getTypes(): string[] {
    return Array.from(this.renderers.keys())
  }
}

export const ContentRegistry = new ContentRegistryClass()
```

---

## Step 2: Create Form Field Components

### `packages/core/src/modules/workflow/ui-elements/form-fields/TextField.tsx`

```typescript
import React from 'react'
import { View, TextInput, Text } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const TextField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        value={value || ''}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor={colors.border}
      />
    </View>
  )
}

// Register the component
FormFieldRegistry.register('text', TextField)

export default TextField
```

### `packages/core/src/modules/workflow/ui-elements/form-fields/RadioField.tsx`

```typescript
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const RadioField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      {field.options?.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.radioRow}
          onPress={() => onChange(option)}
        >
          <View
            style={[
              styles.radioOuter,
              { borderColor: colors.primary },
              value === option && { backgroundColor: colors.primary },
            ]}
          >
            {value === option && <View style={styles.radioInner} />}
          </View>
          <Text style={[styles.radioLabel, { color: colors.text }]}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

FormFieldRegistry.register('radio', RadioField)

export default RadioField
```

### `packages/core/src/modules/workflow/ui-elements/form-fields/CheckboxField.tsx`

```typescript
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const CheckboxField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const isChecked = value === true || value === 'true'

  return (
    <View style={styles.fieldContainer}>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => onChange(!isChecked)}>
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.primary },
            isChecked && { backgroundColor: colors.primary },
          ]}
        >
          {isChecked && <Icon name="check" size={16} color="#fff" />}
        </View>
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>{field.label}</Text>
      </TouchableOpacity>
    </View>
  )
}

FormFieldRegistry.register('checkbox', CheckboxField)

export default CheckboxField
```

### `packages/core/src/modules/workflow/ui-elements/form-fields/MCQField.tsx`

```typescript
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const MCQField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const selected: string[] = Array.isArray(value) ? value : (value || '').split(',').filter(Boolean)

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option]
    onChange(newSelected)
  }

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      {field.options?.map((option, index) => {
        const isSelected = selected.includes(option)
        return (
          <TouchableOpacity
            key={index}
            style={styles.mcqRow}
            onPress={() => toggleOption(option)}
          >
            <View
              style={[
                styles.mcqBox,
                { borderColor: colors.primary },
                isSelected && { backgroundColor: colors.primary },
              ]}
            />
            <Text style={[styles.mcqLabel, { color: colors.text }]}>{option}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

FormFieldRegistry.register('mcq', MCQField)

export default MCQField
```

### `packages/core/src/modules/workflow/ui-elements/form-fields/DateField.tsx`

```typescript
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const DateField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const [showPicker, setShowPicker] = useState(false)
  const dateValue = value ? new Date(value) : new Date()

  const formatDate = (date: Date) => date.toLocaleDateString()

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      <TouchableOpacity
        style={[styles.dateButton, { borderColor: colors.border }]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={{ color: colors.text }}>
          {value ? formatDate(dateValue) : 'Select date...'}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          onChange={(event, date) => {
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
```

### `packages/core/src/modules/workflow/ui-elements/form-fields/SliderField.tsx`

```typescript
import React from 'react'
import { View, Text } from 'react-native'
import Slider from '@react-native-community/slider'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const SliderField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const numValue = Number(value) || field.min || 0

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>
        {field.label}: {numValue}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={field.min || 0}
        maximumValue={field.max || 100}
        value={numValue}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.primary}
        thumbTintColor={colors.primary}
      />
    </View>
  )
}

FormFieldRegistry.register('slider', SliderField)

export default SliderField
```

### `packages/core/src/modules/workflow/ui-elements/form-fields/DropdownField.tsx`

```typescript
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const DropdownField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor: colors.border }]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={{ color: value ? colors.text : colors.border }}>
          {value || 'Select...'}
        </Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
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
```

---

## Step 3: Register All Components

### `packages/core/src/modules/workflow/ui-elements/index.ts`

```typescript
// Import registries
export { FormFieldRegistry, FormFieldProps } from './FormFieldRegistry'
export { ContentRegistry, ContentProps } from './ContentRegistry'

// Import and register all form fields (side effects register them)
import './form-fields/TextField'
import './form-fields/RadioField'
import './form-fields/CheckboxField'
import './form-fields/MCQField'
import './form-fields/DateField'
import './form-fields/SliderField'
import './form-fields/DropdownField'

// Import and register all content types
import './content/ImageContent'
import './content/TitleContent'
import './content/TextContent'
import './content/ButtonContent'
import './content/FormContent'
// import './content/MapContent'      // Uncomment when implemented
// import './content/CalendarContent' // Uncomment when implemented
```

---

## Step 4: Update ActionMenuBubble to Use Registry

### `packages/core/src/modules/workflow/handlers/components/ActionMenuBubble.tsx`

```typescript
import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme } from '../../../../contexts/theme'
import { FormFieldRegistry, ContentRegistry } from '../../ui-elements'

interface ActionMenuBubbleProps {
  content: any[]
  workflowID: string
  onActionPress: (actionId: string, workflowID: string, data?: any) => void
}

const ActionMenuBubble: React.FC<ActionMenuBubbleProps> = ({
  content,
  workflowID,
  onActionPress,
}) => {
  const { ColorPalette } = useTheme()
  const [formData, setFormData] = useState<Record<string, any>>({})

  const colors = {
    primary: ColorPalette.brand.primary,
    text: ColorPalette.brand.text,
    background: ColorPalette.brand.secondaryBackground,
    border: ColorPalette.brand.primary,
  }

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAction = (actionId: string, data?: any) => {
    onActionPress(actionId, workflowID, data || formData)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {content.map((item, index) => (
        <View key={index}>
          {ContentRegistry.render(item.type, {
            item,
            onAction: handleAction,
            styles: styles,
            colors,
            // Pass form-specific props for 'form' type
            ...(item.type === 'form' && {
              formData,
              onFieldChange: handleFieldChange,
              FormFieldRegistry,
            }),
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    maxWidth: 320,
  },
  // ... shared styles for all components
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginRight: 10 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderRadius: 4, marginRight: 12 },
  mcqRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  mcqBox: { width: 20, height: 20, borderWidth: 2, borderRadius: 4, marginRight: 10 },
  dropdown: { height: 48, borderWidth: 1, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12 },
  dateButton: { height: 48, borderWidth: 1, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12 },
  slider: { width: '100%', height: 40 },
  button: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
})

export default ActionMenuBubble
```

---

## Step 5: Adding a New Element Type

To add a new element (e.g., `rating` for star ratings):

### 1. Create the component file

```typescript
// packages/core/src/modules/workflow/ui-elements/form-fields/RatingField.tsx

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { FormFieldProps, FormFieldRegistry } from '../FormFieldRegistry'

const RatingField: React.FC<FormFieldProps> = ({ field, value, onChange, styles, colors }) => {
  const maxStars = field.max || 5
  const rating = Number(value) || 0

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: maxStars }).map((_, i) => (
          <TouchableOpacity key={i} onPress={() => onChange(i + 1)}>
            <Icon
              name={i < rating ? 'star' : 'star-border'}
              size={32}
              color={colors.primary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// Single line to register!
FormFieldRegistry.register('rating', RatingField)

export default RatingField
```

### 2. Import it in the index

```typescript
// packages/core/src/modules/workflow/ui-elements/index.ts

import './form-fields/RatingField'  // Add this line
```

**That's it!** No switch statements, no union types to modify. The component is now available.

---

## Types (Simplified)

### `packages/core/src/modules/workflow/types.ts`

```typescript
// No more long union types!
// Types are now just base interfaces

export interface ActionMenuFormField {
  type: string  // Any string - registry handles validation
  name: string
  label: string
  options?: string[]
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  [key: string]: any  // Extensible for custom properties
}

export interface ActionMenuContentItem {
  type: string  // Any string - registry handles validation
  text?: string
  url?: string
  label?: string
  actionID?: string
  invitationLink?: string
  fields?: ActionMenuFormField[]
  [key: string]: any  // Extensible for custom properties
}

export interface ActionMenuMessage {
  displayData: ActionMenuContentItem[]
  workflowID: string
}
```

---

## Benefits of Registry Pattern

| Aspect | Switch/Union Types | Registry Pattern |
|--------|-------------------|------------------|
| Adding new type | Edit multiple files | Create 1 file + 1 import |
| Type safety | Compile-time only | Runtime validation available |
| Code organization | Single large file | Modular components |
| Bundle size | All types included | Tree-shakeable |
| Testing | Mock entire switch | Mock individual renderers |
| External plugins | Not possible | Easy to add |

---

## Message JSON Examples

```json
{
  "displayData": [
    { "type": "title", "text": "Rate Your Experience" },
    {
      "type": "form",
      "fields": [
        { "type": "rating", "name": "satisfaction", "label": "Overall Satisfaction", "max": 5 },
        { "type": "mcq", "name": "features", "label": "What did you like?", "options": ["Speed", "Design", "Support"] },
        { "type": "text", "name": "feedback", "label": "Additional Comments", "placeholder": "Optional..." }
      ]
    },
    { "type": "button", "label": "Submit Feedback", "actionID": "submit_rating" }
  ],
  "workflowID": "feedback-flow"
}
```

---

## Best Practices

1. **One component per file** - Easy to find and modify
2. **Self-registering components** - Import = registered
3. **Shared styles via props** - Consistent theming
4. **Extensible interfaces** - Use `[key: string]: any` for future properties
5. **Graceful fallbacks** - Registry returns `null` for unknown types
6. **Lazy loading** - Dynamic imports for heavy components (maps, video)
