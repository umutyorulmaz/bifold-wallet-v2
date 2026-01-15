import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StatusBar, AppState, AppStateStatus, StyleSheet, Modal } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

import { useNavigationContainerRef } from '@react-navigation/native'
import { isTablet } from 'react-native-device-info'
import Orientation from 'react-native-orientation-locker'
import { animatedComponents } from './animated-components'
import ErrorModal from './components/modals/ErrorModal'
import toastConfig from './components/toast/ToastConfig'
import { tours } from './constants'
import { Container, ContainerProvider } from './container-api'
import { AnimatedComponentsProvider } from './contexts/animated-components'
import { AuthProvider } from './contexts/auth'
import NavContainer from './contexts/navigation'
import { NetworkProvider } from './contexts/network'
import { StoreProvider } from './contexts/store'
import { ThemeProvider } from './contexts/theme'
import { TourProvider } from './contexts/tour/tour-provider'
import { initStoredLanguage } from './localization'
import RootStack from './navigators/RootStack'
import { themes } from './theme'
import { digicredTheme } from './modules/theme/themes/teal-dark/digicredTheme'
import ErrorBoundaryWrapper from './components/misc/ErrorBoundary'
import { bifoldLoggerInstance } from './services/bifoldLogger'
import { ThemeRegistry, ThemeRegistryProvider } from './modules/theme'
import {
  manifest as tealDarkManifest,
  tabBarConfig as tealDarkTabBar,
  backgrounds as tealDarkBackgrounds,
  cardThemes as tealDarkCardThemes,
} from './modules/theme/themes/teal-dark'

import { COMPONENT_TOKENS } from './container-api'

const createApp = (container: Container): React.FC => {
  const AppComponent: React.FC = () => {
    const navigationRef = useNavigationContainerRef()
    const appState = useRef(AppState.currentState)

    const [showSplashOnReturn, setShowSplashOnReturn] = useState(false)
    const splashTimerRef = useRef<NodeJS.Timeout | null>(null)

    const { LoadingIndicator } = animatedComponents

    const themeRegistry = useMemo(() => {
      const registry = new ThemeRegistry()
      registry.register(tealDarkManifest)
      registry.setTabBarConfig(tealDarkTabBar)
      registry.setBackgrounds(tealDarkBackgrounds)
      registry.setCardThemes(tealDarkCardThemes)
      registry.setActive('teal-dark')
      return registry
    }, [])

    const GradientBackground = container.resolve(COMPONENT_TOKENS.COMPONENT_GRADIENT_BACKGROUND)

    useEffect(() => {
      initStoredLanguage().then()
    }, [])

    useEffect(() => {
      SplashScreen.hide()
    }, [])

    useEffect(() => {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          setShowSplashOnReturn(true)

          if (splashTimerRef.current) {
            clearTimeout(splashTimerRef.current)
          }

          splashTimerRef.current = setTimeout(() => {
            setShowSplashOnReturn(false)
          }, 1000)
        }

        if (nextAppState.match(/inactive|background/)) {
          setShowSplashOnReturn(false)
          if (splashTimerRef.current) {
            clearTimeout(splashTimerRef.current)
          }
        }

        appState.current = nextAppState
      }

      const subscription = AppState.addEventListener('change', handleAppStateChange)

      return () => {
        if (splashTimerRef.current) {
          clearTimeout(splashTimerRef.current)
        }
        subscription.remove()
      }
    }, [])

    if (!isTablet()) {
      Orientation.lockToPortrait()
    }

    const SplashOverlay = () => {
      if (!showSplashOnReturn) return null

      return (
        <Modal
          transparent={false}
          animationType="fade"
          visible={showSplashOnReturn}
          statusBarTranslucent={true}
          hardwareAccelerated={true}
          onRequestClose={() => {}}
        >
          <GradientBackground style={styles.splashContainer}>
            <StatusBar hidden={false} barStyle="light-content" backgroundColor="transparent" translucent={true} />
            <LoadingIndicator />
          </GradientBackground>
        </Modal>
      )
    }

    return (
      <ErrorBoundaryWrapper logger={bifoldLoggerInstance}>
        <ContainerProvider value={container}>
          <StoreProvider>
            <ThemeRegistryProvider registry={themeRegistry} initialThemeId="teal-dark">
              <ThemeProvider themes={[digicredTheme, ...themes]} defaultThemeName={digicredTheme.themeName}>
                <NavContainer navigationRef={navigationRef}>
                  <AnimatedComponentsProvider value={animatedComponents}>
                    <AuthProvider>
                      <NetworkProvider>
                        <StatusBar
                          hidden={false}
                          barStyle="light-content"
                          backgroundColor="transparent"
                          translucent={true}
                        />

                        <SplashOverlay />

                        <ErrorModal />
                        <TourProvider tours={tours} overlayColor={'gray'} overlayOpacity={0.7}>
                          <RootStack />
                        </TourProvider>
                        <Toast topOffset={15} config={toastConfig} />
                      </NetworkProvider>
                    </AuthProvider>
                  </AnimatedComponentsProvider>
                </NavContainer>
              </ThemeProvider>
            </ThemeRegistryProvider>
          </StoreProvider>
        </ContainerProvider>
      </ErrorBoundaryWrapper>
    )
  }

  return AppComponent
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default createApp