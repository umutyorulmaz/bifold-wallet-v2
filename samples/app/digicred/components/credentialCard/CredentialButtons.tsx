import React from 'react'
import { View, StyleSheet } from 'react-native'
import { DigiCredButton, GradientBackground } from '../index'
import { DigiCredColors } from '../../theme'
import { useTranslation } from 'react-i18next'

interface CredentialButtonsProps {
  isProcessing: boolean
  onAccept: () => void
  onDecline: () => void
  onChange?: () => void
  isChangedBtn?: boolean
  isTranscript?: boolean
  isShareDisabled?: boolean
  isShare?: boolean
  isDisabled?: boolean
}

const CredentialButtons: React.FC<CredentialButtonsProps> = ({
  isProcessing,
  onAccept,
  onDecline,
  onChange,
  isChangedBtn = false,
  isTranscript = false,
  isShareDisabled = false,
  isShare = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation()

  if (isTranscript) {
    return (
      <View style={styles.groupButtonTran}>
        <DigiCredButton
          title={t('Global.Decline')}
          onPress={onDecline}
          variant="secondary"
          disabled={isProcessing || isDisabled}
          customStyle={styles.transcriptDeclineButton}
          customTextStyle={styles.transcriptDeclineButtonText}
        />

        {isChangedBtn && onChange && (
          <DigiCredButton
            title={`${t('Global.Change')} ${t('Global.Credential')}`}
            onPress={onChange}
            variant="secondary"
            disabled={isProcessing || isDisabled}
            customStyle={styles.transcriptChangeButton}
            customTextStyle={styles.transcriptChangeButtonText}
          />
        )}

        <GradientBackground buttonPurple style={styles.transcriptAcceptGradientWrapper}>
          <DigiCredButton
            title={isShare ? t('Global.Share') : t('Global.Accept')}
            onPress={onAccept}
            variant="primary"
            disabled={isProcessing || isDisabled || (isShare && isShareDisabled)}
            customStyle={styles.transcriptAcceptButton}
            customTextStyle={styles.transcriptAcceptButtonText}
          />
        </GradientBackground>
      </View>
    )
  }

  if (!isChangedBtn) {
    return (
      <View style={styles.groupButton}>
        <DigiCredButton
          title={t('Global.DECLINE')}
          onPress={onDecline}
          variant="secondary"
          disabled={isProcessing || isDisabled}
          customStyle={styles.declineButton}
          customTextStyle={styles.declineButtonText}
        />

        <View style={styles.acceptGradientWrapper}>
          <GradientBackground
            buttonPurple
            style={styles.acceptGradient}
          >
            <DigiCredButton
              title={(isShare ? t('Global.SHARE') : t('Global.ACCEPT')) + '  \u002B'}
              onPress={onAccept}
              variant="primary"
              disabled={isProcessing || isDisabled || (isShare && isShareDisabled)}
              customStyle={styles.acceptButton}
              customTextStyle={styles.acceptButtonText}
            />
          </GradientBackground>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.groupButtonThree}>
      <DigiCredButton
        title={t('Global.DECLINE')}
        onPress={onDecline}
        variant="secondary"
        disabled={isProcessing}
        customStyle={styles.threeButtonDecline}
        customTextStyle={styles.threeButtonText}
      />

      {onChange && (
        <DigiCredButton
          title={`${t('Global.Change')} ${t('Global.Credential')}`}
          onPress={onChange}
          variant="secondary"
          customStyle={styles.threeButtonChange}
          customTextStyle={styles.threeButtonText}
        />
      )}

      <View style={styles.threeButtonAcceptWrapper}>
        <GradientBackground buttonPurple style={styles.threeButtonAcceptGradient}>
          <DigiCredButton
            title={(isShare ? t('Global.SHARE') : t('Global.ACCEPT')) + '  \u002B'}
            onPress={onAccept}
            variant="primary"
            disabled={isProcessing || (isShare && isShareDisabled)}
            customStyle={styles.threeButtonAccept}
            customTextStyle={styles.threeButtonAcceptText}
          />
        </GradientBackground>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  groupButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    // marginVertical: 10,
    alignSelf: 'center',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DigiCredColors.text.homePrimary,
    borderRadius: 25,
    width: '45%',
    height: 45,
    padding: 0,
    justifyContent: 'center',
    marginLeft: 5,
  },
  declineButtonText: {
    color: DigiCredColors.text.homePrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  acceptGradientWrapper: {
    width: '48%',
    height: 45,
    marginRight: 5,
  },
  acceptGradient: {
    borderRadius: 25,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    width: '100%',
    height: '100%',
    padding: 0,
  },
  acceptButtonText: {
    color: DigiCredColors.text.homePrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  groupButtonThree: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  threeButtonDecline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DigiCredColors.text.homePrimary,
    borderRadius: 25,
    width: '30%',
    height: 45,
    padding: 0,
    justifyContent: 'center',
  },
  threeButtonChange: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DigiCredColors.text.homePrimary,
    borderRadius: 25,
    width: '38%',
    height: 45,
    padding: 0,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  threeButtonText: {
    color: DigiCredColors.text.homePrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  threeButtonAcceptWrapper: {
    width: '30%',
    height: 45,
  },
  threeButtonAcceptGradient: {
    borderRadius: 25,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  threeButtonAccept: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    width: '100%',
    height: '100%',
    padding: 0,
  },
  threeButtonAcceptText: {
    color: DigiCredColors.text.homePrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 24,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  groupButtonTran: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    minHeight: 44,
    flexWrap: 'wrap',
    width: '90%',
    alignSelf: 'center',
  },
  transcriptDeclineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DigiCredColors.text.homePrimary,
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    minWidth: 160,
  },
  transcriptDeclineButtonText: {
    color: DigiCredColors.text.homePrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  transcriptChangeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DigiCredColors.text.homePrimary,
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    minWidth: 180,
  },
  transcriptChangeButtonText: {
    color: DigiCredColors.text.homePrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  transcriptAcceptGradientWrapper: {
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 25,
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    minWidth: 100,
  },
  transcriptAcceptButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    height: '100%',
    padding: 0,
  },
  transcriptAcceptButtonText: {
    color: DigiCredColors.text.homePrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 24,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
})

export default CredentialButtons