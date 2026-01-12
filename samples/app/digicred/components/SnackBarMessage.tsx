import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import SuccessIcon from '../assets/circle-check.svg'
import ErrorIcon from '../assets/report-problem.svg'
import InfoIcon from '../assets/info-icon.svg'
import WarningIcon from '../assets/bell-alert.svg'

interface SnackMessageProps {
  message: string
  type: 'error' | 'success' | 'info' | 'warning'
  showIcon?: boolean
}

const SnackBarMessage: React.FC<SnackMessageProps> = ({ message, type, showIcon = true }) => {
  const backgroundColor = {
    error: '#C62828',
    success: '#6666CC',
    info: '#1565C0',
    warning: '#F57C00',
  }[type]

  const textColor = {
    error: '#FFFFFF',
    success: '#FFFFFF',
    info: '#FFFFFF',
    warning: '#FFFFFF',
  }[type]

  const renderIcon = () => {
    if (!showIcon) return null

    const iconProps = { width: 20, height: 20 }

    switch (type) {
      case 'success':
        return <SuccessIcon {...iconProps} fill="#2E7D32" />
      case 'error':
        return <ErrorIcon {...iconProps} fill="#C62828" />
      case 'info':
        return <InfoIcon {...iconProps} fill="#1565C0" />
      case 'warning':
        return <WarningIcon {...iconProps} fill="#F57C00" />
      default:
        return null
    }
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showIcon && <View style={styles.iconContainer}>{renderIcon()}</View>}
      <Text style={[styles.messageText, { color: textColor }]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    marginLeft: 10,
  },
})

export default SnackBarMessage
