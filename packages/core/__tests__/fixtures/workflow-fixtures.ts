/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Workflow Test Fixtures
 *
 * Mock data for testing workflow-related functionality.
 */

import {
  BasicMessageRecord,
  BasicMessageRole,
  CredentialExchangeRecord,
  CredentialState,
  CredentialRole,
  ProofExchangeRecord,
  ProofState,
  ProofRole,
  ConnectionRecord,
  DidExchangeRole,
  DidExchangeState,
} from '@credo-ts/core'

// WorkflowType available from '../../src/modules/workflow/types' if needed

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK WORKFLOW INSTANCE RECORDS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockWorkflowInstances = {
  started: {
    id: 'workflow-instance-1',
    instanceId: 'workflow-instance-1',
    templateId: 'credential-issuance-template',
    templateVersion: '1.0.0',
    connectionId: 'test-connection-1',
    state: 'started',
    status: 'active',
    context: { step: 1 },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  inProgress: {
    id: 'workflow-instance-2',
    instanceId: 'workflow-instance-2',
    templateId: 'proof-request-template',
    templateVersion: '1.0.0',
    connectionId: 'test-connection-1',
    state: 'in_progress',
    status: 'active',
    context: { step: 2, selectedCredentials: [] },
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:30:00Z'),
  },
  waitingForInput: {
    id: 'workflow-instance-3',
    instanceId: 'workflow-instance-3',
    templateId: 'credential-issuance-template',
    templateVersion: '1.0.0',
    connectionId: 'test-connection-2',
    state: 'waiting_for_input',
    status: 'active',
    context: { step: 3, pendingAction: 'select_credential' },
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T12:15:00Z'),
  },
  completed: {
    id: 'workflow-instance-4',
    instanceId: 'workflow-instance-4',
    templateId: 'credential-issuance-template',
    templateVersion: '1.0.0',
    connectionId: 'test-connection-1',
    state: 'completed',
    status: 'done',
    context: { step: 5, result: 'success' },
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T09:30:00Z'),
  },
  failed: {
    id: 'workflow-instance-5',
    instanceId: 'workflow-instance-5',
    templateId: 'proof-request-template',
    templateVersion: '1.0.0',
    connectionId: 'test-connection-3',
    state: 'failed',
    status: 'error',
    context: { step: 2, error: 'Credential not found' },
    createdAt: new Date('2024-01-01T08:00:00Z'),
    updatedAt: new Date('2024-01-01T08:05:00Z'),
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK WORKFLOW TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

export const mockWorkflowTemplates = {
  credentialIssuance: {
    id: 'template-1',
    templateId: 'credential-issuance-template',
    version: '1.0.0',
    name: 'Credential Issuance',
    description: 'Issue a verifiable credential',
    schema: {
      states: ['started', 'collecting_data', 'issuing', 'completed'],
      transitions: {},
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  proofRequest: {
    id: 'template-2',
    templateId: 'proof-request-template',
    version: '1.0.0',
    name: 'Proof Request',
    description: 'Request proof of credentials',
    schema: {
      states: ['started', 'selecting_credentials', 'presenting', 'completed'],
      transitions: {},
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK WORKFLOW EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockWorkflowEvents = {
  created: {
    type: 'WorkflowInstanceStateChanged',
    payload: {
      instanceRecord: mockWorkflowInstances.started,
      previousState: null,
      newState: 'started',
      event: 'created',
    },
  },
  stateChanged: {
    type: 'WorkflowInstanceStateChanged',
    payload: {
      instanceRecord: mockWorkflowInstances.inProgress,
      previousState: 'started',
      newState: 'in_progress',
      event: 'state_changed',
    },
  },
  statusChanged: {
    type: 'WorkflowInstanceStatusChanged',
    payload: {
      instanceRecord: mockWorkflowInstances.inProgress,
      previousStatus: 'pending',
      newStatus: 'active',
    },
  },
  completed: {
    type: 'WorkflowInstanceCompleted',
    payload: {
      instanceRecord: mockWorkflowInstances.completed,
      result: 'success',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK CREDO RECORDS FOR HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockConnectionRecord = new ConnectionRecord({
  id: 'test-connection-1',
  did: 'did:peer:1zQmTestDid',
  theirLabel: 'Test Issuer',
  role: DidExchangeRole.Requester,
  theirDid: 'did:peer:1zQmTheirDid',
  threadId: 'test-thread-1',
  state: DidExchangeState.Completed,
  createdAt: new Date('2024-01-01T00:00:00Z'),
})

export const mockCredentialRecords = {
  offerReceived: new CredentialExchangeRecord({
    id: 'credential-1',
    state: CredentialState.OfferReceived,
    role: CredentialRole.Holder,
    threadId: 'cred-thread-1',
    protocolVersion: 'v1',
    connectionId: 'test-connection-1',
    credentials: [],
    createdAt: new Date('2024-01-01T10:00:00Z'),
  }),
  done: new CredentialExchangeRecord({
    id: 'credential-2',
    state: CredentialState.Done,
    role: CredentialRole.Holder,
    threadId: 'cred-thread-2',
    protocolVersion: 'v1',
    connectionId: 'test-connection-1',
    credentials: [],
    createdAt: new Date('2024-01-01T09:00:00Z'),
  }),
  requestSent: new CredentialExchangeRecord({
    id: 'credential-3',
    state: CredentialState.RequestSent,
    role: CredentialRole.Holder,
    threadId: 'cred-thread-3',
    protocolVersion: 'v1',
    connectionId: 'test-connection-1',
    credentials: [],
    createdAt: new Date('2024-01-01T08:00:00Z'),
  }),
}

export const mockProofRecords = {
  requestReceived: new ProofExchangeRecord({
    id: 'proof-1',
    state: ProofState.RequestReceived,
    role: ProofRole.Prover,
    connectionId: 'test-connection-1',
    threadId: 'proof-thread-1',
    protocolVersion: 'v1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
  }),
  presentationSent: new ProofExchangeRecord({
    id: 'proof-2',
    state: ProofState.PresentationSent,
    role: ProofRole.Prover,
    connectionId: 'test-connection-1',
    threadId: 'proof-thread-2',
    protocolVersion: 'v1',
    createdAt: new Date('2024-01-01T09:00:00Z'),
  }),
  done: new ProofExchangeRecord({
    id: 'proof-3',
    state: ProofState.Done,
    role: ProofRole.Prover,
    connectionId: 'test-connection-1',
    threadId: 'proof-thread-3',
    protocolVersion: 'v1',
    createdAt: new Date('2024-01-01T08:00:00Z'),
    isVerified: true,
  }),
}

export const mockBasicMessageRecords = {
  received: new BasicMessageRecord({
    id: 'message-1',
    threadId: 'message-thread-1',
    connectionId: 'test-connection-1',
    role: BasicMessageRole.Receiver,
    content: 'Hello, this is a test message',
    sentTime: '2024-01-01T10:00:00Z',
    createdAt: new Date('2024-01-01T10:00:00Z'),
  }),
  sent: new BasicMessageRecord({
    id: 'message-2',
    threadId: 'message-thread-2',
    connectionId: 'test-connection-1',
    role: BasicMessageRole.Sender,
    content: 'This is my reply',
    sentTime: '2024-01-01T10:05:00Z',
    createdAt: new Date('2024-01-01T10:05:00Z'),
  }),
  withLink: new BasicMessageRecord({
    id: 'message-3',
    threadId: 'message-thread-3',
    connectionId: 'test-connection-1',
    role: BasicMessageRole.Receiver,
    content: 'Check out https://example.com for more info',
    sentTime: '2024-01-01T10:10:00Z',
    createdAt: new Date('2024-01-01T10:10:00Z'),
  }),
  actionMenu: new BasicMessageRecord({
    id: 'message-4',
    threadId: 'message-thread-4',
    connectionId: 'test-connection-1',
    role: BasicMessageRole.Receiver,
    content: JSON.stringify({
      displayData: [
        { type: 'title', text: 'Select an option' },
        { type: 'button', label: 'Option 1', actionID: 'action-1' },
        { type: 'button', label: 'Option 2', actionID: 'action-2' },
      ],
      workflowID: 'workflow-1',
    }),
    sentTime: '2024-01-01T10:15:00Z',
    createdAt: new Date('2024-01-01T10:15:00Z'),
  }),
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK CONTEXT OBJECTS
// ═══════════════════════════════════════════════════════════════════════════════

export const mockMessageContext: any = {
  t: jest.fn((key: string) => key),
  theme: {
    sentMessage: { backgroundColor: '#007AFF', color: '#FFFFFF' },
    receivedMessage: { backgroundColor: '#E5E5EA', color: '#000000' },
    linkColor: '#007AFF',
  },
  theirLabel: 'Test Issuer',
  colorPalette: {
    brand: {
      primary: '#007AFF',
      secondary: '#5856D6',
    },
    grayscale: {
      black: '#000000',
      white: '#FFFFFF',
    },
  },
}

export const mockActionContext = {
  agent: {} as any,
  connectionId: 'test-connection-1',
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
  } as any,
  t: jest.fn((key: string) => key),
}

export const mockRenderContext = {
  t: jest.fn((key: string) => key),
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
  } as any,
  theirLabel: 'Test Issuer',
  settingsTheme: {} as any,
  chatTheme: {} as any,
  colorPalette: {} as any,
  isInChat: true,
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const createMockWorkflowInstance = (overrides: any = {}) => ({
  id: `workflow-${Date.now()}`,
  instanceId: `workflow-${Date.now()}`,
  templateId: 'test-template',
  templateVersion: '1.0.0',
  connectionId: 'test-connection',
  state: 'started',
  status: 'active',
  context: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockWorkflowTemplate = (overrides: any = {}) => ({
  id: `template-${Date.now()}`,
  templateId: `template-${Date.now()}`,
  version: '1.0.0',
  name: 'Test Template',
  description: 'A test template',
  schema: {},
  createdAt: new Date(),
  ...overrides,
})

export const createMockWorkflowEvent = (
  type: string,
  instanceId: string,
  options: any = {}
) => ({
  type,
  payload: {
    instanceRecord: createMockWorkflowInstance({ instanceId, ...options }),
    previousState: options.previousState ?? null,
    newState: options.newState ?? 'started',
    event: options.event ?? 'state_changed',
  },
})
