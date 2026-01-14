/* eslint-disable no-console */
import React from 'react'

// Base props all content types receive
export interface ContentProps {
  item: {
    type: string
    text?: string
    url?: string
    label?: string
    actionID?: string
    fields?: any[]
    [key: string]: any // Allow custom properties
  }
  onAction: (actionId: string, data?: any) => void
  styles: Record<string, any>
  colors: {
    primary: string
    text: string
    background: string
    border: string
  }
  formData?: Record<string, any>
  onFieldChange?: (name: string, value: any) => void
  FormFieldRegistry?: any
  content?: any[]
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
      return null
    }

    return <Renderer {...props} />
  }

  getTypes(): string[] {
    return Array.from(this.renderers.keys())
  }
}

export const ContentRegistry = new ContentRegistryClass()
