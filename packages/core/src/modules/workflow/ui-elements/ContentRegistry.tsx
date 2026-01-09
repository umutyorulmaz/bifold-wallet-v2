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
    [key: string]: any // Allow custom properties
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
