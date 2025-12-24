import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Vibration,
  View,
  Text,
  StatusBar,
} from 'react-native'
import { getBuildNumber, getVersion } from 'react-native-device-info'
import Icon from 'react-native-vector-icons/MaterialIcons'

import {
  TOKENS,
  useServices,
  useStore,
  useTheme,
  Screens,
  Stacks,
  testIdWithKey,
  useAuth,
  LockoutReason,
} from '@bifold/core'
import { AutoLockTime } from '@bifold/core/src/contexts/activity'
import { useDeveloperMode } from '@bifold/core/src/hooks/developer-mode'
import { Locales } from '@bifold/core/src/localization'
import { SettingIcon, SettingSection } from '@bifold/core/src/types/settings'
import { SettingStackParams } from '@bifold/core/src/types/navigators'
import { GenericFn } from '@bifold/core/src/types/fn'
import IconButton, { ButtonLocation } from '@bifold/core/src/components/buttons/IconButton'

import { GradientBackground } from '../components'
import { DigiCredColors } from '../theme'

type SettingsProps = StackScreenProps<SettingStackParams>

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const [store] = useStore()
  const { lockOutUser } = useAuth()
  const onDevModeTriggered = () => {
    Vibration.vibrate()
    navigation.navigate(Screens.Developer)
  }
  const { incrementDeveloperMenuCounter } = useDeveloperMode(onDevModeTriggered)
  const { SettingsTheme, TextTheme, ColorPalette, Assets, maxFontSizeMultiplier } = useTheme()
  const [{ settings, enableTours, enablePushNotifications, disableContactsInSettings }, historyEnabled] = useServices([
    TOKENS.CONFIG,
    TOKENS.HISTORY_ENABLED,
  ])
  const { fontScale } = useWindowDimensions()
  const fontIsGreaterThanCap = fontScale >= maxFontSizeMultiplier
  const defaultIconSize = 24

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: DigiCredColors.text.primary,
    },
    section: {
      backgroundColor: 'rgba(30, 50, 50, 0.6)',
      paddingVertical: 16,
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      marginBottom: 8,
    },
    sectionRow: {
      flexDirection: fontIsGreaterThanCap ? 'column' : 'row',
      alignItems: fontIsGreaterThanCap ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    itemSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      marginHorizontal: 16,
    },
    footer: {
      marginVertical: 25,
      alignItems: 'center',
      paddingBottom: 100,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: DigiCredColors.text.primary,
      marginLeft: 10,
    },
    rowTitle: {
      fontSize: 15,
      color: DigiCredColors.text.primary,
      flex: 1,
    },
    rowValue: {
      fontSize: 15,
      color: DigiCredColors.button.primary,
    },
    versionText: {
      fontSize: 14,
      color: DigiCredColors.text.secondary,
      marginBottom: 16,
    },
  })

  const currentLanguage = i18n.t('Language.code', { context: i18n.language as Locales })

  const settingsSections: SettingSection[] = [
    {
      header: {
        icon: { name: store.preferences.useConnectionInviterCapability ? 'person' : 'apartment', size: 30 },
        title: store.preferences.useConnectionInviterCapability ? store.preferences.walletName : t('Screens.Contacts'),
        iconRight: {
          name: 'edit',
          action: () => {
            navigation.navigate(Screens.RenameWallet)
          },
          accessibilityLabel: t('NameWallet.EditWalletName'),
          testID: testIdWithKey('EditWalletName'),
          style: { color: ColorPalette.brand.primary },
        },
        titleTestID: store.preferences.useConnectionInviterCapability ? testIdWithKey('WalletName') : undefined,
      },
      data: [
        {
          title: t('Screens.Contacts'),
          accessibilityLabel: t('Screens.Contacts'),
          testID: testIdWithKey('Contacts'),
          onPress: () => navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.Contacts }),
        },
        {
          title: t('Settings.WhatAreContacts'),
          accessibilityLabel: t('Settings.WhatAreContacts'),
          testID: testIdWithKey('WhatAreContacts'),
          onPress: () => navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.WhatAreContacts }),
          value: undefined,
        },
      ],
    },
    {
      header: {
        icon: { name: 'settings' },
        title: t('Settings.AppSettings'),
      },
      data: [
        {
          title: t('Global.Biometrics'),
          value: store.preferences.useBiometry ? t('Global.On') : t('Global.Off'),
          accessibilityLabel: t('Global.Biometrics'),
          testID: testIdWithKey('Biometrics'),
          onPress: () => navigation.navigate(Screens.ToggleBiometry),
        },
        {
          title: t('Settings.ChangePin'),
          accessibilityLabel: t('Settings.ChangePin'),
          testID: testIdWithKey('Change Pin'),
          onPress: () => navigation.navigate(Screens.ChangePIN),
        },
        {
          title: t('Settings.Language'),
          value: currentLanguage,
          accessibilityLabel: t('Settings.Language'),
          testID: testIdWithKey('Language'),
          onPress: () => navigation.navigate(Screens.Language),
        },
        {
          title: t('Settings.AutoLockTime'),
          value:
            store.preferences.autoLockTime !== AutoLockTime.Never ? `${store.preferences.autoLockTime} min` : 'Never',
          accessibilityLabel: t('Settings.AutoLockTime'),
          testID: testIdWithKey('Lockout'),
          onPress: () => navigation.navigate(Screens.AutoLock),
        },
      ],
    },
    ...(settings || []),
  ]

  // Remove the Contact section from Setting per TOKENS.CONFIG
  if (disableContactsInSettings) {
    settingsSections.shift()
  }

  // add optional push notifications menu to settings
  if (enablePushNotifications) {
    settingsSections
      .find((item) => item.header.title === t('Settings.AppSettings'))
      ?.data.push({
        title: t('Settings.Notifications'),
        value: undefined,
        accessibilityLabel: t('Settings.Notifications'),
        testID: testIdWithKey('Notifications'),
        onPress: () => navigation.navigate(Screens.TogglePushNotifications),
      })
  }

  // add optional history menu to settings
  if (historyEnabled) {
    settingsSections
      .find((item) => item.header.title === t('Settings.AppSettings'))
      ?.data.push({
        title: t('Global.History'),
        value: undefined,
        accessibilityLabel: t('Global.History'),
        testID: testIdWithKey('History'),
        onPress: () => navigation.navigate(Screens.HistorySettings),
      })
  }

  if (enableTours) {
    const section = settingsSections.find((item) => item.header.title === t('Settings.AppSettings'))
    if (section) {
      section.data = [
        ...section.data,
        {
          title: t('Settings.AppGuides'),
          value: store.tours.enableTours ? t('Global.On') : t('Global.Off'),
          accessibilityLabel: t('Settings.AppGuides'),
          testID: testIdWithKey('AppGuides'),
          onPress: () => navigation.navigate(Screens.Tours),
        },
      ]
    }
  }

  if (store.preferences.developerModeEnabled) {
    const section = settingsSections.find((item) => item.header.title === t('Settings.AppSettings'))
    if (section) {
      section.data = [
        ...section.data,
        {
          title: t('Settings.Developer'),
          accessibilityLabel: t('Settings.Developer'),
          testID: testIdWithKey('DeveloperOptions'),
          onPress: () => navigation.navigate(Screens.Developer),
        },
        {
          title: t('Settings.ConfigureMediator'),
          value: store.preferences.selectedMediator,
          accessibilityLabel: t('Settings.ConfigureMediator'),
          testID: testIdWithKey('ConfigureMediator'),
          onPress: () => navigation.navigate(Screens.ConfigureMediator),
        },
        {
          title: t('Settings.Logout'),
          accessibilityLabel: t('Settings.Logout'),
          testID: testIdWithKey('Logout'),
          onPress: () => lockOutUser(LockoutReason.Logout),
        },
      ]
    }
  }

  if (store.preferences.useVerifierCapability) {
    settingsSections.splice(1, 0, {
      header: {
        icon: { name: 'send' },
        title: t('Screens.ProofRequests'),
      },
      data: [
        {
          title: t('Screens.SendProofRequest'),
          accessibilityLabel: t('Screens.ProofRequests'),
          testID: testIdWithKey('ProofRequests'),
          onPress: () =>
            navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
              screen: Screens.ProofRequests,
            }),
        },
      ],
    })
    if (!store.preferences.disableDataRetentionOption) {
      const section = settingsSections.find((item) => item.header.title === t('Settings.AppSettings'))
      if (section) {
        section.data.splice(3, 0, {
          title: t('Settings.DataRetention'),
          value: store.preferences.useDataRetention ? t('Global.On') : t('Global.Off'),
          accessibilityLabel: t('Settings.DataRetention'),
          testID: testIdWithKey('DataRetention'),
          onPress: () => navigation.navigate(Screens.DataRetention),
        })
      }
    }
  }

  if (store.preferences.useConnectionInviterCapability) {
    const section = settingsSections.find((item) => item.header.title === store.preferences.walletName)
    if (section) {
      section.data.splice(1, 0, {
        title: t('Settings.ScanMyQR'),
        accessibilityLabel: t('Settings.ScanMyQR'),
        testID: testIdWithKey('ScanMyQR'),
        onPress: () =>
          navigation.getParent()?.navigate(Stacks.ConnectStack, {
            screen: Screens.Scan,
            params: { defaultToConnect: true },
          }),
      })
    }
  }

  const SectionHeader: React.FC<{
    icon: SettingIcon
    title: string
  }> = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
      <Icon
        name={icon.name}
        size={icon.size ?? defaultIconSize}
        color={DigiCredColors.button.primary}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  )

  const SectionRow: React.FC<{
    title: string
    value?: string
    accessibilityLabel?: string
    testID?: string
    onPress?: GenericFn
  }> = ({ title, value, accessibilityLabel, testID, onPress }) => (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
      style={styles.sectionRow}
      onPress={onPress}
    >
      <Text style={styles.rowTitle}>{title}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Icon name="chevron-right" size={20} color={DigiCredColors.text.secondary} />
    </TouchableOpacity>
  )

  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('Screens.Settings') || 'Settings'}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <SectionHeader icon={section.header.icon} title={section.header.title} />
              {section.data.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <SectionRow
                    title={item.title}
                    value={item.value}
                    accessibilityLabel={item.accessibilityLabel}
                    testID={item.testID}
                    onPress={item.onPress}
                  />
                  {itemIndex < section.data.length - 1 && <View style={styles.itemSeparator} />}
                </React.Fragment>
              ))}
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableWithoutFeedback
              onPress={incrementDeveloperMenuCounter}
              disabled={store.preferences.developerModeEnabled}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.versionText} testID={testIdWithKey('Version')}>
                  {`${t('Settings.Version')} ${getVersion()} ${t('Settings.Build')} (${getBuildNumber()})`}
                </Text>
                <Assets.svg.logo width={150} height={75} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  )
}

export default Settings
