import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, StatusBar, Switch, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useStore, testIdWithKey } from '@bifold/core'
import { Screens} from '../../../../packages/core/src/types/navigators'
import { SettingStackParams } from '@bifold/core/src/types/navigators'
import { DispatchAction } from '@bifold/core/src/contexts/reducers/store'
import { getBuildNumber, getVersion } from 'react-native-device-info'

import { GradientBackground } from '../components'
import { DigiCredColors } from '../theme'

type SettingsProps = StackScreenProps<SettingStackParams>

interface ExpandableCardProps {
  title: string
  description: string
  isEnabled: boolean
  onToggle: (value: boolean) => void
  expanded: boolean
  onPress: () => void
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  description,
  isEnabled,
  onToggle,
  expanded,
  onPress,
}) => {
  const rotation = useRef(new Animated.Value(expanded ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [expanded, rotation])

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  return (
    <TouchableOpacity style={styles.expandableCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.expandableHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Icon name="chevron-down" size={24} color="#FFF" />
        </Animated.View>
      </View>

      {expanded && (
        <View style={styles.expandableContent}>
          <Text style={styles.cardDescription}>{description}</Text>
          <View style={styles.toggleRow}>
            <Switch
              value={isEnabled}
              onValueChange={onToggle}
              trackColor={{ false: '#3e3e3e', true: DigiCredColors.button.primary }}
              thumbColor={isEnabled ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
            <Text style={styles.toggleLabel}>Enable</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

interface MenuCardProps {
  title: string
  onPress: () => void
  testID?: string
}

const MenuCard: React.FC<MenuCardProps> = ({ title, onPress, testID }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.7} testID={testID}>
    <Text style={styles.menuCardTitle}>{title}</Text>
  </TouchableOpacity>
)

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  useTranslation()
  const [store, dispatch] = useStore()
  const [biometricsExpanded, setBiometricsExpanded] = useState(false)

  const handleBiometryToggle = async (value: boolean) => {
    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [value],
    })
  }

  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/*<MenuCard*/}
          {/*  title="Contacts"*/}
          {/*  onPress={() => navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.Contacts })}*/}
          {/*  testID={testIdWithKey('Contacts')}*/}
          {/*/>*/}

          <ExpandableCard
            title="Biometrics"
            description="The DigiCred wallet defaults to using your biometrics (face recognition or fingerprint) to unlock the application. We use a PIN as a backup if your biometrics are not working. You can use this control to turn off the biometric unlock."
            isEnabled={store.preferences.useBiometry}
            onToggle={handleBiometryToggle}
            expanded={biometricsExpanded}
            onPress={() => setBiometricsExpanded(!biometricsExpanded)}
          />

          {/*<MenuCard title="Backup Restore" onPress={() => {}} testID={testIdWithKey('BackupRestore')} />*/}

          <MenuCard
            title="Change PIN"
            onPress={() => navigation.navigate(Screens.ChangePIN)}
            testID={testIdWithKey('ChangePIN')}
          />

          {/*<MenuCard title="Demographics" onPress={() => {}} testID={testIdWithKey('Demographics')} />*/}

          <MenuCard
            title="Language"
            onPress={() => navigation.navigate(Screens.Language)}
            testID={testIdWithKey('Language')}
          />

          {/*<MenuCard title="Network" onPress={() => {}} testID={testIdWithKey('Network')} />*/}

          {/*<MenuCard title="Guides / Help" onPress={() => {}} testID={testIdWithKey('GuidesHelp')} />*/}

          {/*<MenuCard*/}
          {/*  title="Transfer Wallet"*/}
          {/*  onPress={() => navigation.navigate(Screens.ExportWalletIntro)}*/}
          {/*  testID={testIdWithKey('TransferWallet')}*/}
          {/*/>*/}

          {/*<MenuCard*/}
          {/*  title="Restore Wallet"*/}
          {/*  onPress={() => navigation.navigate(Screens.ImportWallet)}*/}
          {/*  testID={testIdWithKey('RestoreWallet')}*/}
          {/*/>*/}

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              Version {getVersion()} - Build {getBuildNumber()}
            </Text>
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  expandableCard: {
    padding: 24,
    marginBottom: 12,
    backgroundColor: '#25272A',
    borderColor: '#2F2F2F',
    borderWidth: 1,
    borderRadius: 16,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandableContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
    color: '#FFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    marginLeft: 12,
    color: '#FFF',
  },
  menuCard: {
    padding: 24,
    marginBottom: 12,
    backgroundColor: '#25272A',
    borderColor: '#2F2F2F',
    borderWidth: 1,
    borderRadius: 16,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 13,
    color: '#FFF',
  },
})

export default Settings