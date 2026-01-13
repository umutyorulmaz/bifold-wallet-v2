import { Platform, PermissionsAndroid } from 'react-native'

type NotificationPermissionState = 'denied' | 'granted' | 'unknown'

/**
 * Get the current notification permission status
 */
export const getNotificationPermissionStatus = async (): Promise<NotificationPermissionState> => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      )
      return result ? 'granted' : 'denied'
    }
    // For older Android or iOS, return granted (handled by system)
    return 'granted'
  } catch (_error) {
    return 'unknown'
  }
}

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'This app needs notification permission to alert you about new messages and credentials.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      )

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted'
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        return 'denied'
      } else {
        // NEVER_ASK_AGAIN
        return 'denied'
      }
    }

    // For older Android versions or iOS, permission is granted by default
    return 'granted'
  } catch (_error) {
    return 'denied'
  }
}

/**
 * Toggle push notifications on/off
 * This should register/unregister the device token with the mediator
 */
export const togglePushNotifications = async (enabled: boolean): Promise<void> => {
  try {
    if (enabled) {
      // TODO: Push notifications enabled - register FCM token with mediator
      // The @credo-ts/push-notifications module should handle this
    } else {
      // TODO: Unregister token from mediator
    }
  } catch (_error) {
    // Silently handle toggle errors
  }
}

/**
 * Push notification configuration for the app
 */
export const pushNotificationConfig = {
  status: getNotificationPermissionStatus,
  setup: requestNotificationPermission,
  toggle: togglePushNotifications,
}
