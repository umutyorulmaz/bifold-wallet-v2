import { RemoteOCABundleResolver } from '@bifold/oca/build/legacy'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../constants'
import { COMPONENT_TOKENS, TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { BifoldError } from '../types/error'
import { WalletSecret } from '../types/security'
import { useAuth } from '../contexts/auth'
import { useStore } from '../contexts/store'

export type SplashProps = {
  initializeAgent: (walletSecret: WalletSecret) => Promise<void>
  isOverlayMode?: boolean
}

/**
 * This Splash screen is shown in two scenarios:
 * 1. initial load of the app,
 * 2. during agent initialization after login
 * 3. when returning to app (overlay mode)
 */
const Splash: React.FC<SplashProps> = ({ initializeAgent, isOverlayMode = false }) => {
  const { walletSecret } = useAuth()
  const { t } = useTranslation()
  const [store] = useStore()
  const { LoadingIndicator } = useAnimatedComponents()
  const initializing = useRef(false)
  const [logger, ocaBundleResolver, GradientBackground] = useServices([
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_OCA_RESOLVER,
    COMPONENT_TOKENS.COMPONENT_GRADIENT_BACKGROUND,
  ])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    fullscreenOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999,
      elevation: 999999,
      width: '100%',
      height: '100%',
    },
    gradientBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
  })

  useEffect(() => {
    if (isOverlayMode) {
      return
    }

    if (initializing.current || !store.authentication.didAuthenticate) {
      return
    }

    if (!walletSecret) {
      throw new Error('Wallet secret is missing')
    }
    initializing.current = true

    const initAgentAsyncEffect = async (): Promise<void> => {
      try {
        await (ocaBundleResolver as RemoteOCABundleResolver).checkForUpdates?.()

        await initializeAgent(walletSecret)
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1045'),
          t('Error.Message1045'),
          (err as Error)?.message ?? err,
          1045
        )

        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        logger.error((err as Error)?.message ?? err)
      }
    }

    initAgentAsyncEffect()
  }, [initializeAgent, ocaBundleResolver, logger, walletSecret, t, store.authentication.didAuthenticate, isOverlayMode])

  const containerStyle = isOverlayMode ? [styles.container, styles.fullscreenOverlay] : styles.container

  return (
    <GradientBackground style={styles.gradientBackground}>
      <SafeAreaView style={containerStyle}>
        <LoadingIndicator />
      </SafeAreaView>
    </GradientBackground>
  )
}

export default Splash