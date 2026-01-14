/* eslint-disable no-console */
import React from 'react'
import { View, TouchableOpacity, Text, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Share from 'react-native-share'
import { ContentProps, ContentRegistry } from '../ContentRegistry'
import RNHTMLtoPDF from 'react-native-html-to-pdf'

interface ShareEntryContentProps extends ContentProps {
  formData?: Record<string, any>
  content?: any[]
}

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const ShareEntryContent: React.FC<ShareEntryContentProps> = ({ item, styles, colors, formData = {}, content = [] }) => {
  const handleShare = async () => {
    try {
      let reportText = 'DigiCred Wallet Report\n'
      reportText += '='.repeat(40) + '\n\n'
      reportText += new Date().toLocaleString() + '\n\n'

      if (Object.keys(formData).length > 0) {
        reportText += 'Responses:\n'
        reportText += '-'.repeat(40) + '\n\n'

        for (const [fieldId, value] of Object.entries(formData)) {
          const fieldItem = content.find((c: any) => c['form-id'] === fieldId)
          const label = fieldItem?.label || fieldItem?.question || fieldId

          reportText += `${label}\n`
          reportText += `  ${Array.isArray(value) ? value.join(', ') : String(value)}\n\n`
        }
      } else {
        reportText += 'No data entered yet.\n'
      }

      const safeReportText = escapeHtml(reportText)

      // Convert text to HTML
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              pre { white-space: pre-wrap; font-family: 'Courier New', monospace; }
            </style>
          </head>
          <body>
            <pre>${safeReportText}</pre>
          </body>
        </html>
      `

      // Generate PDF (react-native-html-to-pdf@0.12.0 uses default export + convert)
      const pdf = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'DigiCred_Report',
        base64: false,
      })

      if (!pdf?.filePath) {
        throw new Error('PDF generation failed: missing filePath')
      }

      // Share the PDF
      await Share.open({
        url: `file://${pdf.filePath}`,
        type: 'application/pdf',
        title: 'DigiCred Report',
      })

      console.log('✅ PDF shared successfully')
    } catch (error: any) {
      console.error('❌ Share error:', error)
      if (error?.message?.includes('User did not share')) {
        console.log('ℹ️ User cancelled share')
        return
      }
      Alert.alert('Error', 'Failed to share content')
    }
  }

  return (
    <View style={styles.fieldContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.background,
            borderWidth: 2,
            borderColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <Icon name="share" size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: colors.primary }]}>{item.label || 'Share'}</Text>
      </TouchableOpacity>
    </View>
  )
}

ContentRegistry.register('share-entry', ShareEntryContent)

export default ShareEntryContent
