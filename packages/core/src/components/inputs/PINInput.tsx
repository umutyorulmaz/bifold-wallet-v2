// import React, { forwardRef, Ref, useCallback, useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
// import Icon from 'react-native-vector-icons/MaterialIcons'
//
// import { hitSlop, minPINLength } from '../../constants'
// import { useServices, TOKENS } from '../../container-api'
// import { useTheme } from '../../contexts/theme'
// import { InlineErrorPosition } from '../../types/error'
// import { testIdWithKey } from '../../utils/testable'
// import { ThemedText } from '../texts/ThemedText'
// import InlineErrorText, { InlineMessageProps } from './InlineErrorText'
//
// interface PINInputProps {
//   label?: string
//   onPINChanged?: (PIN: string) => void
//   testID?: string
//   accessibilityLabel?: string
//   autoFocus?: boolean
//   inlineMessage?: InlineMessageProps
//   onSubmitEditing?: (...args: any[]) => void
//   placeholder?: string
//   secureTextEntry?: boolean
//   visible?: boolean
// }
//
// const PINInputComponent = (
//   {
//     label,
//     onPINChanged,
//     testID,
//     accessibilityLabel,
//     autoFocus = false,
//     inlineMessage,
//     onSubmitEditing = () => {},
//     placeholder = '',
//     secureTextEntry = true,
//     visible = true,
//   }: PINInputProps,
//   ref: Ref<TextInput>
// ) => {
//   const [{ PINScreensConfig }] = useServices([TOKENS.CONFIG])
//   const { ColorPalette } = useTheme()
//   const [showPIN, setShowPIN] = useState(false)
//   const { t } = useTranslation()
//
//   const [PIN, setPIN] = useState('')
//   const [realPIN, setRealPIN] = useState('')
//
//   const onChangeText = useCallback(
//     (value: string) => {
//       const newChars = value.replace(/●/g, '').replace(/\D/g, '')
//       if (newChars.length === 0) return
//
//       const updatedPIN = (realPIN + newChars).slice(0, minPINLength)
//       setRealPIN(updatedPIN)
//       setPIN(updatedPIN)
//       onPINChanged && onPINChanged(updatedPIN)
//     },
//     [onPINChanged, realPIN]
//   )
//
//
//   if (!visible) {
//     return <View testID={testID} />
//   }
//
//
//   const style = StyleSheet.create({
//     container: {
//       flexDirection: 'column',
//       marginBottom: 24,
//     },
//     inputWrapper: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: ColorPalette.grayscale.digicredBackgroundModal,
//       opacity: 0.8,
//       borderRadius: 25,
//       borderWidth: 1.5,
//       borderColor: '#FFFFFF',
//       paddingHorizontal: 16,
//       height: 56,
//     },
//     input: {
//       flex: 1,
//       color: '#FFFFFF',
//       fontSize: 16,
//       fontWeight: '500',
//       paddingVertical: 0,
//       textAlignVertical: 'center',
//       fontFamily: 'System',
//     },
//     hideIcon: {
//       paddingLeft: 12,
//     },
//   })
//
//   const content = () => (
//     <View style={style.inputWrapper}>
//       <TextInput
//         ref={ref}
//         testID={testID}
//         accessibilityLabel={accessibilityLabel}
//         accessible
//         // value={PIN}
//         value={secureTextEntry && !showPIN ? '● '.repeat(realPIN.length).trim() : realPIN}
//         onChangeText={onChangeText}
//         keyboardType="number-pad"
//         textContentType="password"
//         secureTextEntry={secureTextEntry && !showPIN}
//         placeholder={placeholder}
//         placeholderTextColor="#888888"
//         autoFocus={autoFocus}
//         style={style.input}
//         // onSubmitEditing={(e) => {
//         //   onSubmitEditing(e.nativeEvent.text)
//         // }}
//         onSubmitEditing={(e) => {
//           const text = e?.nativeEvent?.text ?? PIN
//           onSubmitEditing(text)
//         }}
//       />
//       <TouchableOpacity
//         style={style.hideIcon}
//         accessibilityLabel={showPIN ? t('PINCreate.Hide') : t('PINCreate.Show')}
//         accessibilityRole={'button'}
//         testID={showPIN ? testIdWithKey('Hide') : testIdWithKey('Show')}
//         onPress={() => setShowPIN(!showPIN)}
//         hitSlop={hitSlop}
//       >
//         <Icon color="#FFFFFF" name={showPIN ? 'visibility-off' : 'visibility'} size={24} />
//       </TouchableOpacity>
//     </View>
//   )
//
//   return (
//     <View style={style.container}>
//       {label && (
//         <ThemedText variant={PINScreensConfig.useNewPINDesign ? 'labelTitle' : 'label'} style={{ marginBottom: 8 }}>
//           {label}
//         </ThemedText>
//       )}
//       {inlineMessage?.config.position === InlineErrorPosition.Above ? (
//         <InlineErrorText
//           message={inlineMessage.message}
//           inlineType={inlineMessage.inlineType}
//           config={inlineMessage.config}
//         />
//       ) : null}
//       {content()}
//       {inlineMessage?.config.position === InlineErrorPosition.Below ? (
//         <InlineErrorText
//           message={inlineMessage.message}
//           inlineType={inlineMessage.inlineType}
//           config={inlineMessage.config}
//         />
//       ) : null}
//     </View>
//   )
// }
//
// const PINInput = forwardRef<TextInput, PINInputProps>(PINInputComponent)
//
// export default PINInput
//
//
//
//
//


import React, { forwardRef, Ref, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop, minPINLength } from '../../constants'
import { useServices, TOKENS } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { InlineErrorPosition } from '../../types/error'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'
import InlineErrorText, { InlineMessageProps } from './InlineErrorText'

interface PINInputProps {
  label?: string
  onPINChanged?: (PIN: string) => void
  testID?: string
  accessibilityLabel?: string
  autoFocus?: boolean
  inlineMessage?: InlineMessageProps
  onSubmitEditing?: (...args: any[]) => void
  placeholder?: string
  secureTextEntry?: boolean
  visible?: boolean
}

const PINInputComponent = (
  {
    label,
    onPINChanged,
    testID,
    accessibilityLabel,
    autoFocus = false,
    inlineMessage,
    onSubmitEditing = () => {},
    placeholder = '',
    secureTextEntry = true,
    visible = true,
  }: PINInputProps,
  ref: Ref<TextInput>
) => {
  const [{ PINScreensConfig }] = useServices([TOKENS.CONFIG])
  const { ColorPalette } = useTheme()
  const [showPIN, setShowPIN] = useState(false)
  const { t } = useTranslation()

  const [PIN, setPIN] = useState('')
  const [realPIN, setRealPIN] = useState('')

  const onChangeText = useCallback(
    (value: string) => {
      // Extract all digits from input
      const digits = value.replace(/\D/g, '')

      // If we get multiple digits at once (paste or rapid input)
      if (digits.length > 1) {
        const updatedPIN = digits.slice(0, minPINLength)
        setRealPIN(updatedPIN)
        setPIN(updatedPIN)
        onPINChanged && onPINChanged(updatedPIN)
        return
      }

      // Handle single character input
      if (value.length > PIN.length) {
        // Added a character - extract the new digit
        const newDigit = digits.slice(-1)
        if (newDigit) {
          const updatedPIN = (realPIN + newDigit).slice(0, minPINLength)
          setRealPIN(updatedPIN)
          setPIN(updatedPIN)
          onPINChanged && onPINChanged(updatedPIN)
        }
      } else if (value.length < PIN.length) {
        // Removed a character (backspace)
        const updatedPIN = realPIN.slice(0, -1)
        setRealPIN(updatedPIN)
        setPIN(updatedPIN)
        onPINChanged && onPINChanged(updatedPIN)
      }
    },
    [onPINChanged, PIN, realPIN]
  )

  if (!visible) {
    return <View testID={testID} />
  }

  const style = StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginBottom: 24,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ColorPalette.grayscale.digicredBackgroundModal,
      opacity: 0.8,
      borderRadius: 25,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
      paddingHorizontal: 16,
      height: 56,
    },
    input: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '500',
      paddingVertical: 0,
      textAlignVertical: 'center',
      fontFamily: 'System',
    },
    hideIcon: {
      paddingLeft: 12,
    },
  })

  const getDisplayValue = () => {
    if (!secureTextEntry || showPIN) {
      return PIN
    }
    return '● '.repeat(PIN.length).trim()
  }

  const content = () => (
    <View style={style.inputWrapper}>
      <TextInput
        ref={ref}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessible
        value={getDisplayValue()}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        textContentType="password"
        secureTextEntry={secureTextEntry && !showPIN}
        placeholder={placeholder}
        placeholderTextColor="#888888"
        autoFocus={autoFocus}
        style={style.input}
        onSubmitEditing={(e) => {
          const text = e?.nativeEvent?.text ?? PIN
          onSubmitEditing(text)
        }}
      />
      <TouchableOpacity
        style={style.hideIcon}
        accessibilityLabel={showPIN ? t('PINCreate.Hide') : t('PINCreate.Show')}
        accessibilityRole={'button'}
        testID={showPIN ? testIdWithKey('Hide') : testIdWithKey('Show')}
        onPress={() => setShowPIN(!showPIN)}
        hitSlop={hitSlop}
      >
        <Icon color="#FFFFFF" name={showPIN ? 'visibility-off' : 'visibility'} size={24} />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={style.container}>
      {label && (
        <ThemedText variant={PINScreensConfig.useNewPINDesign ? 'labelTitle' : 'label'} style={{ marginBottom: 8 }}>
          {label}
        </ThemedText>
      )}
      {inlineMessage?.config.position === InlineErrorPosition.Above ? (
        <InlineErrorText
          message={inlineMessage.message}
          inlineType={inlineMessage.inlineType}
          config={inlineMessage.config}
        />
      ) : null}
      {content()}
      {inlineMessage?.config.position === InlineErrorPosition.Below ? (
        <InlineErrorText
          message={inlineMessage.message}
          inlineType={inlineMessage.inlineType}
          config={inlineMessage.config}
        />
      ) : null}
    </View>
  )
}

const PINInput = forwardRef<TextInput, PINInputProps>(PINInputComponent)

export default PINInput