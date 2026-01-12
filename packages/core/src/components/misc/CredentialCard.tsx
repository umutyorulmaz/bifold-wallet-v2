import React from 'react'
import { TouchableOpacity, View, Text, Image, StyleSheet, Dimensions, ViewStyle } from 'react-native'
import { getCredentialIdentifiers } from '../../utils/credential'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { CredentialExchangeRecord, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { CredentialErrors } from '../../types/credentials'
import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { useTranslation } from 'react-i18next'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_HEIGHT = SCREEN_HEIGHT / 5.7
const LOGO_SIZE = Math.min(SCREEN_WIDTH * 0.16, SCREEN_HEIGHT * 0.08)

interface CredentialCardCustomProps {
  credential: CredentialExchangeRecord | W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined
  onPress: () => void
  logoUrl?: string
  credentialErrors?: CredentialErrors[]
  credDefId?: string
  schemaId?: string
  displayItems?: any
  credName?: string
  proof?: boolean
  hasAltCredentials?: any
  handleAltCredChange?: () => void
  style?: ViewStyle
}


const getSchoolIdentifier = (credential: CredentialExchangeRecord): string => {
  const ids = getCredentialIdentifiers(credential)
  return ids.credentialDefinitionId || ''
}

const getCardColor = (schoolId: string): string => {
  if (schoolId.includes('Cape') || schoolId.includes('CFCC')) return '#016C72'
  if (schoolId.includes('DigiCred')) return '#FFFFFF'
  if (schoolId.includes('PCS') || schoolId.includes('Pender')) return '#25272A'
  if (schoolId.includes('NHCS') || schoolId.includes('New Hanover')) return '#016C72'
  if (schoolId.includes('M-DCPS')) return '#092940'
  return '#25272A'
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

const CredentialCard: React.FC<CredentialCardCustomProps> = ({ credential, logoUrl, onPress, credentialErrors }) => {
  const isRevoked = credentialErrors?.includes(CredentialErrors.Revoked)
  const metadata = credential ? credential.metadata.get(AnonCredsCredentialMetadataKey) : null
  const credDefId = metadata?.credentialDefinitionId || ''
  const credDefTag = credDefId.split(':').pop() || 'Unknown Credential'
  const issuedDate = credential ? formatDate(new Date(credential.updatedAt || Date.now())) : ''
  const schoolId = credential instanceof CredentialExchangeRecord ? getSchoolIdentifier(credential) : ''
  const cardColor = getCardColor(schoolId)
  const isDarkCard = cardColor !== '#FFFFFF'
  const textColor = isDarkCard ? '#FFFFFF' : '#000000'
  const { t } = useTranslation()

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} testID={`CredentialCard-${credDefTag}`}>
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        {isRevoked && (
          <View style={styles.revokedIndicator}>
            <Icon name="alert-circle" size={14} color="#FF0000" />
            <Text style={styles.revokedText}>Revoked</Text>
          </View>
        )}

        <View style={styles.leftContent}>
          <View style={styles.logoContainer}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={[styles.placeholderLogo, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.placeholderText, { color: textColor }]}>
                  {credDefTag.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.credentialName, { color: textColor }]}>{credDefTag}</Text>
            <Text style={[styles.validityPeriod, { color: textColor }]}>
              {t('CredentialDetails.IssuedOn')} {issuedDate}
            </Text>
          </View>
        </View>

        <View style={styles.iconContainer}>
          <Icon name="chevron-right" size={24} color={textColor} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,
    alignItems: 'stretch',
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#004D4D',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 4,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: LOGO_SIZE + 5,
    height: LOGO_SIZE + 5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    padding: 5
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderLogo: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: LOGO_SIZE * 0.375,
    fontWeight: '600',
    fontFamily: 'OpenSans-SemiBold',
  },
  textContainer: {
    flex: 1,
  },
  credentialName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily: 'OpenSans-SemiBold',
    marginVertical: 10,
  },
  validityPeriod: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    fontFamily: 'OpenSans-Regular',
    opacity: 0.9,
    marginVertical: 5,
  },
  iconContainer: {
    alignSelf: 'center',
  },
  revokedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  revokedText: {
    fontSize: 11,
    color: '#FF0000',
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'OpenSans-Medium',
  },
})

export default CredentialCard
