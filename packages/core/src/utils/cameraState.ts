/**
 * Simple utility to track when the camera/scanner is intentionally active.
 * This prevents the splash overlay from showing when the app state changes
 * due to camera permission dialogs or camera system activation.
 */

let cameraActive = false

export const setCameraActive = (active: boolean): void => {
  cameraActive = active
}

export const isCameraActive = (): boolean => {
  return cameraActive
}
