import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View, Modal, Pressable, Text, StyleSheet } from 'react-native'
import Collapsible from 'react-native-collapsible'
import Icon from 'react-native-vector-icons/MaterialIcons'
import CloseIcon from '../../assets/icons/CloseIcon.svg'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { ModalUsage } from '../../types/remove'
import { testIdForAccessabilityLabel, testIdWithKey } from '../../utils/testable'
import UnorderedList from '../misc/UnorderedList'
import { ThemedText } from '../texts/ThemedText'

interface CommonRemoveModalProps {
  usage: ModalUsage
  onSubmit?: GenericFn
  onCancel?: GenericFn
  visible?: boolean
  extraDetails?: string
}

interface RemoveProps {
  title: string
  content: string[]
}

const Dropdown: React.FC<RemoveProps> = ({ title, content }) => {
  const { TextTheme, ColorPalette } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        accessibilityLabel={title}
        testID={testIdWithKey(testIdForAccessabilityLabel(title))}
        style={[
          {
            padding: 15,
            backgroundColor: ColorPalette.brand.modalSecondaryBackground,
            borderRadius: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
        ]}
      >
        <ThemedText variant="modalNormal" style={{ fontWeight: TextTheme.bold.fontWeight }}>
          {title}
        </ThemedText>
        <Icon name={isCollapsed ? 'expand-more' : 'expand-less'} size={24} color={TextTheme.modalNormal.color} />
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed} enablePointerEvents={true}>
        <View
          style={{ marginTop: 10, borderLeftWidth: 2, borderLeftColor: ColorPalette.brand.modalSecondaryBackground }}
        >
          <UnorderedList unorderedListItems={content} />
        </View>
      </Collapsible>
    </>
  )
}

const CommonRemoveModal: React.FC<CommonRemoveModalProps> = ({ usage, visible, onSubmit, onCancel, extraDetails }) => {
  if (!usage) {
    throw new Error('usage cannot be undefined')
  }

  const { t } = useTranslation()

  const styles = StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    modalCard: {
      width: '95%',
      maxWidth: 400,
      padding: 24,
      paddingBottom: 32,
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: '#25272A',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 4 },
      shadowOpacity: 0.48,
      shadowRadius: 12,
      elevation: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
      fontFamily: 'OpenSans-SemiBold',
      marginBottom: 25,
      marginTop: 15,
    },
    modalMessage: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'left',
      lineHeight: 22,
      fontFamily: 'OpenSans-Regular',
      marginBottom: 24,
    },
    bulletPoint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
      marginTop: 8,
      marginRight: 12,
    },
    bulletText: {
      flex: 1,
      fontSize: 16,
      color: '#FFFFFF',
      lineHeight: 22,
      fontFamily: 'OpenSans-Regular',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 8,
      marginTop: 24,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
      borderRadius: 25,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: 'OpenSans-SemiBold',
    },
    confirmButton: {
      flex: 2,
      backgroundColor: '#FF4445',
      borderRadius: 25,
      paddingVertical: 12,
      alignItems: 'center',
    },
    confirmButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: 'OpenSans-SemiBold',
    },
  })

  const renderContent = () => {
    switch (usage) {
      case ModalUsage.ContactRemove:
        return (
          <>
            <Text style={styles.modalMessage}>{t('ContactDetails.RemoveContactMessageWarning')}</Text>
            <Text style={[styles.modalMessage, { marginBottom: 16 }]}>
              {t('ContactDetails.RemoveContactMessageTop')}
            </Text>
            <View style={styles.bulletPoint}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{t('ContactDetails.RemoveContactsBulletPoint1')}</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{t('ContactDetails.RemoveContactsBulletPoint2')}</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{t('ContactDetails.RemoveContactsBulletPoint3')}</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{t('ContactDetails.RemoveContactsBulletPoint4')}</Text>
            </View>
            <Text style={[styles.modalMessage, { marginTop: 16 }]}>
              {t('ContactDetails.RemoveContactMessageBottom')}
            </Text>
          </>
        )
      case ModalUsage.CredentialRemove:
        return (
          <>
            <Text style={styles.modalMessage}>{t('CredentialDetails.RemoveCaption')}</Text>
            <View style={{ marginTop: 25 }}>
              <Dropdown
                title={t('CredentialDetails.YouWillNotLose')}
                content={[
                  t('CredentialDetails.YouWillNotLoseListItem1'),
                  t('CredentialDetails.YouWillNotLoseListItem2'),
                ]}
              />
            </View>
            <View style={{ marginTop: 25 }}>
              <Dropdown
                title={t('CredentialDetails.HowToGetThisCredentialBack')}
                content={[t('CredentialDetails.HowToGetThisCredentialBackListItem1')]}
              />
            </View>
          </>
        )
      case ModalUsage.ContactRemoveWithCredentials:
        return <Text style={styles.modalMessage}>{t('ContactDetails.UnableToRemoveCaption')}</Text>
      case ModalUsage.CredentialOfferDecline:
        return (
          <>
            <Text style={[styles.modalMessage, { marginVertical: 30 }]}>
              {extraDetails
                ? t('CredentialOffer.DeclineParagraph1WithIssuerName', { issuer: extraDetails })
                : t('CredentialOffer.DeclineParagraph1')}
            </Text>
            <Text style={styles.modalMessage}>{t('CredentialOffer.DeclineParagraph2')}</Text>
          </>
        )
      case ModalUsage.ProofRequestDecline:
        return (
          <>
            <Text style={styles.modalMessage}>{t('ProofRequest.DeclineBulletPoint1')}</Text>
            <Text style={styles.modalMessage}>{t('ProofRequest.DeclineBulletPoint2')}</Text>
            <Text style={styles.modalMessage}>{t('ProofRequest.DeclineBulletPoint3')}</Text>
          </>
        )
      case ModalUsage.CustomNotificationDecline:
        return (
          <>
            <Text style={[styles.modalMessage, { marginTop: 30 }]}>{t('CredentialOffer.CustomOfferParagraph1')}</Text>
            <Text style={styles.modalMessage}>{t('CredentialOffer.CustomOfferParagraph2')}</Text>
          </>
        )
      default:
        return null
    }
  }

  const getTitle = () => {
    switch (usage) {
      case ModalUsage.ContactRemove:
        return t('ContactDetails.RemoveTitle')
      case ModalUsage.CredentialRemove:
        return t('CredentialDetails.RemoveTitle')
      case ModalUsage.ContactRemoveWithCredentials:
        return t('ContactDetails.UnableToRemoveTitle')
      case ModalUsage.CredentialOfferDecline:
        return t('CredentialOffer.DeclineTitle')
      case ModalUsage.ProofRequestDecline:
        return t('ProofRequest.DeclineTitle')
      case ModalUsage.CustomNotificationDecline:
        return t('CredentialOffer.CustomOfferTitle')
      default:
        return ''
    }
  }

  const getConfirmButtonText = () => {
    switch (usage) {
      case ModalUsage.ContactRemove:
        return t('ContactDetails.RemoveContactAction')
      case ModalUsage.ContactRemoveWithCredentials:
        return t('ContactDetails.GoToCredentials')
      case ModalUsage.CredentialRemove:
        return t('CredentialDetails.RemoveCredentialAction')
      case ModalUsage.CredentialOfferDecline:
      case ModalUsage.ProofRequestDecline:
      case ModalUsage.CustomNotificationDecline:
        return t('Global.Decline')
      default:
        return t('Global.Decline')
    }
  }

  const getConfirmButtonTestID = () => {
    switch (usage) {
      case ModalUsage.ContactRemove:
      case ModalUsage.CredentialRemove:
        return testIdWithKey('ConfirmRemoveButton')
      case ModalUsage.ContactRemoveWithCredentials:
        return testIdWithKey('GoToCredentialsButton')
      case ModalUsage.CredentialOfferDecline:
      case ModalUsage.ProofRequestDecline:
        return testIdWithKey('ConfirmDeclineButton')
      default:
        return testIdWithKey('ConfirmButton')
    }
  }

  const getCancelButtonTestID = () => {
    switch (usage) {
      case ModalUsage.ContactRemove:
      case ModalUsage.CredentialRemove:
        return testIdWithKey('CancelRemoveButton')
      case ModalUsage.ContactRemoveWithCredentials:
        return testIdWithKey('AbortGoToCredentialsButton')
      case ModalUsage.CredentialOfferDecline:
      case ModalUsage.ProofRequestDecline:
        return testIdWithKey('CancelDeclineButton')
      default:
        return testIdWithKey('CancelButton')
    }
  }

  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <CloseIcon color="#FF4445" />
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            {renderContent()}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel} testID={getCancelButtonTestID()}>
                <Text style={styles.cancelButtonText}>{t('CredentialDetails.Back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={onSubmit} testID={getConfirmButtonTestID()}>
                <Text style={styles.confirmButtonText}>{getConfirmButtonText()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  )
}

export default CommonRemoveModal