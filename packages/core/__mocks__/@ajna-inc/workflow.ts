/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock WorkflowInstanceRecord class
export class WorkflowInstanceRecord {
  public id: string
  public instanceId: string
  public templateId: string
  public templateVersion: string
  public connectionId: string
  public state: string
  public status: string
  public context: Record<string, unknown>
  public createdAt: Date
  public updatedAt: Date

  constructor(props: Partial<WorkflowInstanceRecord> = {}) {
    this.id = props.id ?? `instance-${Date.now()}`
    this.instanceId = props.instanceId ?? this.id
    this.templateId = props.templateId ?? 'template-1'
    this.templateVersion = props.templateVersion ?? '1.0.0'
    this.connectionId = props.connectionId ?? 'connection-1'
    this.state = props.state ?? 'started'
    this.status = props.status ?? 'active'
    this.context = props.context ?? {}
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }
}

// Mock WorkflowTemplateRecord class
export class WorkflowTemplateRecord {
  public id: string
  public templateId: string
  public version: string
  public name: string
  public description: string
  public schema: Record<string, unknown>
  public createdAt: Date

  constructor(props: Partial<WorkflowTemplateRecord> = {}) {
    this.id = props.id ?? `template-${Date.now()}`
    this.templateId = props.templateId ?? this.id
    this.version = props.version ?? '1.0.0'
    this.name = props.name ?? 'Test Template'
    this.description = props.description ?? 'A test workflow template'
    this.schema = props.schema ?? {}
    this.createdAt = props.createdAt ?? new Date()
  }
}

// Mock workflow events enum
export const WorkflowEvents = {
  WorkflowInstanceStateChanged: 'WorkflowInstanceStateChanged',
  WorkflowInstanceStatusChanged: 'WorkflowInstanceStatusChanged',
  WorkflowInstanceCompleted: 'WorkflowInstanceCompleted',
} as const

// Mock workflow states
export const WorkflowState = {
  Started: 'started',
  InProgress: 'in_progress',
  WaitingForInput: 'waiting_for_input',
  Done: 'done',
  Completed: 'completed',
  Cancelled: 'cancelled',
  Failed: 'failed',
  Error: 'error',
} as const

// Mock MobileWorkflowService
export const createMockWorkflowService = () => ({
  isAvailable: true,
  listInstances: jest.fn().mockResolvedValue([]),
  listTemplates: jest.fn().mockResolvedValue([]),
  getInstance: jest.fn().mockResolvedValue(null),
  start: jest.fn().mockResolvedValue(new WorkflowInstanceRecord()),
  advance: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  resume: jest.fn().mockResolvedValue(undefined),
  cancel: jest.fn().mockResolvedValue(undefined),
  getStatus: jest.fn().mockResolvedValue({
    instance_id: 'test-instance',
    template_id: 'test-template',
    state: 'started',
    status: 'active',
    context: {},
  }),
  deriveUiProfile: jest.fn().mockResolvedValue('sender'),
  generateIdempotencyKey: jest.fn().mockReturnValue('test-idempotency-key'),
  discoverTemplates: jest.fn().mockResolvedValue([]),
  getTemplate: jest.fn().mockResolvedValue(null),
  ensureTemplate: jest.fn().mockResolvedValue(null),
  getPendingWorkflows: jest.fn().mockResolvedValue([]),
})

// Default mock instance for MobileWorkflowService
export const MobileWorkflowService = jest.fn().mockImplementation(() => createMockWorkflowService())

// Helper to create mock event payloads
export const createMockWorkflowEvent = (type: string, instanceId: string, options: any = {}) => ({
  type,
  payload: {
    instanceRecord: new WorkflowInstanceRecord({
      instanceId,
      state: options.newState ?? 'started',
      ...options,
    }),
    previousState: options.previousState ?? null,
    newState: options.newState ?? 'started',
    event: options.event ?? 'state_changed',
    actionKey: options.actionKey,
    msgId: options.msgId,
  },
})

export default {
  WorkflowInstanceRecord,
  WorkflowTemplateRecord,
  WorkflowEvents,
  WorkflowState,
  MobileWorkflowService,
  createMockWorkflowService,
  createMockWorkflowEvent,
}
