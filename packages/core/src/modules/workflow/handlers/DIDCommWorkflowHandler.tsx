/**
 * DIDCommWorkflowHandler
 *
 * Handles DIDComm workflow instances in the chat interface.
 * Converts WorkflowInstanceRecord to chat messages with UI hints.
 */

import { ConnectionRecord } from '@credo-ts/core'
import type { WorkflowInstanceRecord } from '@ajna-inc/workflow'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TFunction } from 'react-i18next'

import { CallbackType, ExtendedChatMessage } from '../../../components/chat/ChatMessage'
import { Role } from '../../../types/chat'
import { RootStackParams, ContactStackParams } from '../../../types/navigators'
import {
  MessageContext,
  NavigationResult,
  WorkflowType,
} from '../types'

import { BaseWorkflowHandler } from './BaseWorkflowHandler'

/**
 * Check if a record is a WorkflowInstanceRecord
 */
function isWorkflowInstanceRecord(record: unknown): record is WorkflowInstanceRecord {
  if (!record || typeof record !== 'object') return false
  const r = record as any
  // WorkflowInstanceRecord has these key properties
  return (
    typeof r.id === 'string' &&
    typeof r.templateId === 'string' &&
    typeof r.instanceId === 'string' &&
    typeof r.state === 'string'
  )
}

export class DIDCommWorkflowHandler extends BaseWorkflowHandler<WorkflowInstanceRecord> {
  readonly type = WorkflowType.DIDComm
  readonly displayName = 'DIDComm Workflow'

  canHandle(record: unknown): record is WorkflowInstanceRecord {
    const result = isWorkflowInstanceRecord(record)
    if (result) {
      const r = record as WorkflowInstanceRecord
      console.log(`[DIDCommWorkflowHandler] canHandle: true, templateId: ${r.templateId}, state: ${r.state}`)
    }
    return result
  }

  getRole(_record: WorkflowInstanceRecord): Role {
    // Workflows are typically initiated by them (the issuer/verifier)
    return Role.them
  }

  getLabel(record: WorkflowInstanceRecord, t: TFunction): string {
    // Try to get a friendly name based on template ID
    const templateId = record.templateId || ''

    // Common template patterns
    if (templateId.includes('credential') || templateId.includes('issuance')) {
      return t('Workflow.CredentialWorkflow' as any) || 'Credential Workflow'
    }
    if (templateId.includes('proof') || templateId.includes('verification')) {
      return t('Workflow.ProofWorkflow' as any) || 'Proof Workflow'
    }

    return t('Workflow.Workflow' as any) || 'Workflow'
  }

  getCallbackType(record: WorkflowInstanceRecord): CallbackType | undefined {
    // If workflow has pending actions, show a callback
    const state = (record as any).state?.toLowerCase() || ''
    if (!['done', 'completed', 'cancelled', 'failed', 'error'].includes(state)) {
      return CallbackType.CredentialOffer // Reuse for now, shows "View" button
    }
    return undefined
  }

  toMessage(
    record: WorkflowInstanceRecord,
    _connection: ConnectionRecord,
    context: MessageContext
  ): ExtendedChatMessage {
    const role = this.getRole(record)
    const label = this.getLabel(record, context.t)
    const state = (record as any).state || 'unknown'
    const section = (record as any).section || ''

    // Create the workflow bubble
    const renderEvent = () => (
      <WorkflowBubble
        templateId={record.templateId}
        state={state}
        section={section}
        label={label}
        t={context.t}
      />
    )

    return {
      _id: record.id,
      text: label,
      renderEvent,
      createdAt: record.createdAt,
      user: { _id: role },
      messageOpensCallbackType: this.getCallbackType(record),
      onDetails: this.createOnDetails(record, context.navigation as StackNavigationProp<RootStackParams | ContactStackParams>),
    }
  }

  getDetailNavigation(
    _record: WorkflowInstanceRecord,
    _navigation: StackNavigationProp<any>
  ): NavigationResult | undefined {
    // TODO: Navigate to workflow details screen when it exists
    // For now, workflow instances are displayed in chat but don't navigate
    return undefined
  }

  shouldDisplay(record: WorkflowInstanceRecord): boolean {
    // Show all workflows except completed ones (unless they just completed)
    const state = (record as any).state?.toLowerCase() || ''
    const completedStates = ['done', 'completed', 'cancelled', 'failed', 'error']

    // Show if not completed, or if completed recently (within last hour)
    if (!completedStates.includes(state)) {
      return true
    }

    // Check if completed recently
    const updatedAt = record.updatedAt ? new Date(record.updatedAt) : record.createdAt
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return updatedAt > oneHourAgo
  }

  /**
   * Create the onDetails callback for navigation
   * TODO: Implement when WorkflowDetails screen exists
   */
  private createOnDetails(
    _record: WorkflowInstanceRecord,
    _navigation?: StackNavigationProp<RootStackParams | ContactStackParams>
  ): (() => void) | undefined {
    // For now, workflows display their status in the bubble
    // Navigation to details can be added when WorkflowDetails screen is implemented
    return undefined
  }
}

/**
 * Workflow bubble component for displaying workflow status in chat
 */
interface WorkflowBubbleProps {
  templateId: string
  state: string
  section: string
  label: string
  t: TFunction
}

const WorkflowBubble: React.FC<WorkflowBubbleProps> = ({
  templateId,
  state,
  section,
  label,
  t,
}) => {
  // Get status color based on state
  const getStatusColor = () => {
    const s = state.toLowerCase()
    if (['done', 'completed'].includes(s)) return '#4CAF50' // Green
    if (['failed', 'error', 'cancelled'].includes(s)) return '#F44336' // Red
    if (['paused'].includes(s)) return '#FF9800' // Orange
    return '#2196F3' // Blue for active
  }

  // Get status label
  const getStatusLabel = () => {
    const s = state.toLowerCase()
    if (s === 'done' || s === 'completed') return t('Workflow.Completed' as any) || 'Completed'
    if (s === 'failed' || s === 'error') return t('Workflow.Failed' as any) || 'Failed'
    if (s === 'cancelled') return t('Workflow.Cancelled' as any) || 'Cancelled'
    if (s === 'paused') return t('Workflow.Paused' as any) || 'Paused'
    return t('Workflow.InProgress' as any) || 'In Progress'
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.headerText}>{label}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Template info */}
        <Text style={styles.templateText} numberOfLines={1}>
          {templateId.split('/').pop() || templateId}
        </Text>

        {/* Current section */}
        {section && (
          <Text style={styles.sectionText}>
            {t('Workflow.CurrentStep' as any) || 'Step'}: {section}
          </Text>
        )}

        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>
      </View>

      {/* Tap to view hint */}
      <Text style={styles.tapHint}>
        {t('Chat.TapToView' as any) || 'Tap to view details'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#1a2634',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    padding: 12,
  },
  templateText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#cccccc',
    fontSize: 12,
  },
  tapHint: {
    color: '#888888',
    fontSize: 10,
    fontStyle: 'italic',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
})

/**
 * Factory function to create a DIDCommWorkflowHandler
 */
export function createDIDCommWorkflowHandler(): DIDCommWorkflowHandler {
  return new DIDCommWorkflowHandler()
}
