declare module '*.svg' {
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<SvgProps>
  export default content
}

declare module 'react-native-argon2'

declare module '@react-native-community/netinfo/jest/netinfo-mock'
// Type declarations for packages without TypeScript support
declare module 'react-native-view-shot' {
  import { Component } from 'react'

  interface ViewShotProperties {
    children?: React.ReactNode
    options?: {
      format?: 'jpg' | 'png'
      quality?: number
    }
  }

  export default class ViewShot extends Component<ViewShotProperties> {
    capture?: () => Promise<string>
  }
}

declare module 'react-native-share' {
  export interface ShareOptions {
    url?: string
    type?: string
    message?: string
    title?: string
  }

  export default class Share {
    static open(options: ShareOptions): Promise<any>
  }
}
