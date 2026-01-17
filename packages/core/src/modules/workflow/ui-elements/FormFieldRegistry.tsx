/* eslint-disable no-console */
import React from 'react'

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
    [key: string]: any // Allow custom properties
  }
  value: any
  onChange: (value: any) => void
  styles: Record<string, any>
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
