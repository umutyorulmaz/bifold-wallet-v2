import React from 'react'
import { Dimensions, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated'
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload as GesturePanEvent,
  PinchGestureHandlerEventPayload as GesturePinchEvent,
  TapGestureHandlerEventPayload as GestureTapEvent,
} from 'react-native-gesture-handler'

interface ZoomableViewProps {
  children: React.ReactNode
  isVisible: boolean
  onClose: () => void
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const ZoomableView: React.FC<ZoomableViewProps> = ({ children, isVisible, onClose }) => {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  React.useEffect(() => {
    if (!isVisible) {
      scale.value = 1
      savedScale.value = 1
      translateX.value = 0
      translateY.value = 0
      savedTranslateX.value = 0
      savedTranslateY.value = 0
    }
  }, [isVisible, savedScale, savedTranslateX, savedTranslateY, scale, translateX, translateY])

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event: GestureTapEvent) => {
      const isZoomedIn = scale.value > 1.1

      if (isZoomedIn) {
        scale.value = withTiming(1)
        savedScale.value = 1
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
        savedTranslateX.value = 0
        savedTranslateY.value = 0
      } else {
        const newScale = 2
        const centeredX = (event.x - SCREEN_WIDTH / 2) * (newScale - 1)
        const centeredY = (event.y - SCREEN_HEIGHT / 2) * (newScale - 1)

        scale.value = withTiming(newScale)
        savedScale.value = newScale
        translateX.value = withTiming(-centeredX)
        translateY.value = withTiming(-centeredY)
        savedTranslateX.value = -centeredX
        savedTranslateY.value = -centeredY
      }
    })

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value
    })
    .onUpdate((event: GesturePinchEvent) => {
      scale.value = savedScale.value * event.scale
    })
    .onEnd(() => {
      savedScale.value = scale.value

      if (scale.value < 1) {
        scale.value = withTiming(1)
        savedScale.value = 1
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
        savedTranslateX.value = 0
        savedTranslateY.value = 0
      }
    })

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event: GesturePanEvent) => {
      const scaledWidth = SCREEN_WIDTH * scale.value
      const scaledHeight = SCREEN_HEIGHT * scale.value

      const maxPanX = Math.max(0, (scaledWidth - SCREEN_WIDTH) / 2)
      const maxPanY = Math.max(0, (scaledHeight - SCREEN_HEIGHT) / 2)

      let nextX = savedTranslateX.value + event.translationX
      let nextY = savedTranslateY.value + event.translationY

      nextX = Math.max(-maxPanX, Math.min(nextX, maxPanX))
      nextY = Math.max(-maxPanY, Math.min(nextY, maxPanY))

      translateX.value = nextX
      translateY.value = nextY
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      if (scale.value <= 1.1) {
        runOnJS(onClose)()
      }
    })

  const tapGesture = Gesture.Race(singleTapGesture, doubleTapGesture)

  const composedGesture = Gesture.Simultaneous(pinchGesture, Gesture.Race(panGesture, tapGesture))

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }))

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={styles.background} />
        </TouchableWithoutFeedback>

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.contentContainer, animatedStyle]}>{children}</Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  )
}

export default ZoomableView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
})