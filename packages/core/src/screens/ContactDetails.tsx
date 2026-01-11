import { CredentialState } from '@credo-ts/core'
import { useAgent, useConnectionById, useCredentialByState } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { useHeaderHeight } from '@react-navigation/elements'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DeviceEventEmitter,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { ContactStackParams, RootStackParams, Screens, TabStacks } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { formatTime, getConnectionName, useConnectionImageUrl } from '../utils/helpers'
import { TOKENS, useServices } from '../container-api'
import { toImageSource } from '../utils/credential'
import { HistoryCardType } from '../modules/history/types'
import { ThemedText } from '../components/texts/ThemedText'
import { ThemedBackground } from '../modules/theme/components/ThemedBackground'
import { testIdWithKey } from '../utils/testable'

type ContactDetailsProps = StackScreenProps<ContactStackParams, Screens.ContactDetails>

const CONTACT_IMG_PERCENTAGE = 0.12

const ContactDetails: React.FC<ContactDetailsProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('ContactDetails route params were not set properly')
  }

  const { connectionId } = route.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<ContactStackParams & RootStackParams>>()
  const { ColorPalette, Assets, Spacing } = useTheme()
  const headerHeight = useHeaderHeight()
  const [store] = useStore()

  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState(false)
  const [isCredentialsRemoveModalDisplayed, setIsCredentialsRemoveModalDisplayed] = useState(false)

  const connection = useConnectionById(connectionId)
  const contactImageUrl = useConnectionImageUrl(connectionId)

  const connectionCredentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ].filter((credential) => credential.connectionId === connection?.id)

  const { width } = useWindowDimensions()
  const contactImageSize = width * CONTACT_IMG_PERCENTAGE

  const [
    { contactDetailsOptions },
    ContactCredentialListItem,
    logger,
    historyManagerCurried,
    historyEnabled,
    historyEventsLogger,
  ] = useServices([
    TOKENS.CONFIG,
    TOKENS.COMPONENT_CONTACT_DETAILS_CRED_LIST_ITEM,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
  ])

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    section: {
      padding: Spacing.md,
      backgroundColor: 'transparent',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    avatarImage: {
      width: contactImageSize,
      height: contactImageSize,
      borderRadius: 8,
    },
    contactLabel: {
      flexShrink: 1,
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: ColorPalette.grayscale.lightGrey,
      marginVertical: Spacing.md,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
  })

  const contactLabel = useMemo(
    () => getConnectionName(connection, store.preferences.alternateContactNames),
    [connection, store.preferences.alternateContactNames]
  )

  const callOnRemove = useCallback(() => {
    connectionCredentials.length ? setIsCredentialsRemoveModalDisplayed(true) : setIsRemoveModalDisplayed(true)
  }, [connectionCredentials])

  const logHistoryRecord = useCallback(() => {
    if (!(agent && historyEnabled && connection)) return

    try {
      historyManagerCurried(agent).saveHistory({
        type: HistoryCardType.ConnectionRemoved,
        message: HistoryCardType.ConnectionRemoved,
        createdAt: new Date(),
        correspondenceId: connection.id,
        correspondenceName: connection.theirLabel,
      })
    } catch (err) {
      logger.error(`[ContactDetails] Failed to save history: ${err}`)
    }
  }, [agent, historyEnabled, connection, historyManagerCurried, logger])

  const callSubmitRemove = useCallback(async () => {
    try {
      if (!(agent && connection)) return

      if (historyEventsLogger.logConnectionRemoved) {
        logHistoryRecord()
      }

      const [messages, proofs, offers] = await Promise.all([
        agent.basicMessages.findAllByQuery({ connectionId: connection.id }),
        agent.proofs.findAllByQuery({ connectionId: connection.id }),
        agent.credentials.findAllByQuery({
          connectionId: connection.id,
          state: CredentialState.OfferReceived,
        }),
      ])

      await Promise.allSettled([
        ...proofs.map((p) => agent.proofs.deleteById(p.id)),
        ...offers.map((o) => agent.credentials.deleteById(o.id)),
        ...messages.map((m) => agent.basicMessages.deleteById(m.id)),
        agent.connections.deleteById(connection.id),
      ])

      navigation.popToTop()

      await new Promise((r) => setTimeout(r, 1000))

      Toast.show({
        type: ToastType.Success,
        text1: t('ContactDetails.ContactRemoved'),
      })
    } catch (err) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1037'), t('Error.Message1037'), String(err), 1037)
      )
    }
  }, [agent, connection, navigation, t, historyEventsLogger, logHistoryRecord])

  return (
    <ThemedBackground screenId="home" style={{ flex: 1 }}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.screen, { paddingTop: headerHeight }]}>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            {contactImageUrl ? (
              <Image style={styles.avatarImage} source={toImageSource(contactImageUrl)} />
            ) : (
              <ThemedText
                variant="bold"
                style={{
                  fontSize: contactImageSize,
                  lineHeight: contactImageSize,
                  color: ColorPalette.brand.primary,
                }}
              >
                {contactLabel.charAt(0).toUpperCase()}
              </ThemedText>
            )}
            <ThemedText variant="headingThree" style={styles.contactLabel}>
              {contactLabel}
            </ThemedText>
          </View>

          {contactDetailsOptions?.showConnectedTime && (
            <ThemedText style={{ marginTop: Spacing.md }}>
              {t('ContactDetails.DateOfConnection', {
                date: connection?.createdAt ? formatTime(connection.createdAt, { includeHour: true }) : '',
              })}
            </ThemedText>
          )}

          {contactDetailsOptions?.enableCredentialList && (
            <>
              <View style={styles.divider} />
              <ThemedText variant="headingFour">{t('ContactDetails.Credentials')}</ThemedText>
              <FlatList
                data={connectionCredentials}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
                ListEmptyComponent={
                  <ThemedText style={{ color: ColorPalette.grayscale.lightGrey }}>
                    {t('ContactDetails.NoCredentials')}
                  </ThemedText>
                }
                renderItem={({ item }) => (
                  <ContactCredentialListItem
                    credential={item}
                    onPress={() =>
                      navigation.navigate(Screens.CredentialDetails, {
                        credentialId: item.id,
                      })
                    }
                  />
                )}
              />
            </>
          )}
        </View>

        <View>
          <TouchableOpacity
            testID={testIdWithKey('StartVideoCall')}
            style={[styles.section, styles.actionRow]}
            onPress={() =>
              navigation.navigate(Screens.VideoCall as any, {
                connectionId,
                video: true,
              })
            }
          >
            <Icon name="video" size={20} color={ColorPalette.brand.primary} />
            <ThemedText style={{ color: ColorPalette.brand.primary }}>{t('ContactDetails.StartVideoCall')}</ThemedText>
          </TouchableOpacity>

          {contactDetailsOptions?.enableEditContactName && (
            <TouchableOpacity
              testID={testIdWithKey('RenameContact')}
              style={[styles.section, styles.actionRow]}
              onPress={() => navigation.navigate(Screens.RenameContact, { connectionId })}
            >
              <Assets.svg.iconEdit width={20} height={20} />
              <ThemedText>{t('Screens.RenameContact')}</ThemedText>
            </TouchableOpacity>
          )}

          {store.preferences.developerModeEnabled && (
            <TouchableOpacity
              testID={testIdWithKey('JSONDetails')}
              style={[styles.section, styles.actionRow]}
              onPress={() =>
                navigation.navigate(Screens.JSONDetails, {
                  jsonBlob: connection,
                })
              }
            >
              <Assets.svg.iconCode width={20} height={20} />
              <ThemedText>{t('Global.ViewJSON')}</ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            testID={testIdWithKey('RemoveFromWallet')}
            style={[styles.section, styles.actionRow]}
            onPress={callOnRemove}
          >
            <Assets.svg.iconDelete width={20} height={20} color={ColorPalette.semantic.error} />
            <ThemedText style={{ color: ColorPalette.semantic.error }}>{t('ContactDetails.RemoveContact')}</ThemedText>
          </TouchableOpacity>
        </View>

        <CommonRemoveModal
          usage={ModalUsage.ContactRemove}
          visible={isRemoveModalDisplayed}
          onSubmit={callSubmitRemove}
          onCancel={() => setIsRemoveModalDisplayed(false)}
        />

        <CommonRemoveModal
          usage={ModalUsage.ContactRemoveWithCredentials}
          visible={isCredentialsRemoveModalDisplayed}
          onSubmit={() => navigation.getParent()?.navigate(TabStacks.CredentialStack, { screen: Screens.Credentials })}
          onCancel={() => setIsCredentialsRemoveModalDisplayed(false)}
        />
      </SafeAreaView>
    </ThemedBackground>
  )
}

export default ContactDetails
