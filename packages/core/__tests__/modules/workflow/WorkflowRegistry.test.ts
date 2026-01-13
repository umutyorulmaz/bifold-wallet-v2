/**
 * WorkflowRegistry Tests
 *
 * Tests for the central workflow registry that manages handlers
 * and routes records to appropriate handlers.
 */

import { WorkflowRegistry } from '../../../src/modules/workflow/WorkflowRegistry'
import {
  IWorkflowHandler,
  WorkflowType,
  WorkflowAction,
  NotificationItem,
} from '../../../src/modules/workflow/types'
import { ExtendedChatMessage, CallbackType } from '../../../src/components/chat/ChatMessage'
import { Role } from '../../../src/types/chat'
import { mockMessageContext, mockActionContext, mockConnectionRecord } from '../../fixtures/workflow-fixtures'

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK HANDLER FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

const createMockHandler = (
  type: WorkflowType,
  options: {
    canHandleResult?: boolean
    shouldDisplayResult?: boolean
    isNotificationResult?: boolean
    toMessageResult?: ExtendedChatMessage
    toNotificationResult?: NotificationItem
  } = {}
): jest.Mocked<IWorkflowHandler> => ({
  type,
  displayName: `${type} Handler`,
  canHandle: jest.fn().mockReturnValue(options.canHandleResult ?? true) as any,
  shouldDisplay: jest.fn().mockReturnValue(options.shouldDisplayResult ?? true) as any,
  isNotification: jest.fn().mockReturnValue(options.isNotificationResult ?? false) as any,
  toMessage: jest.fn().mockReturnValue(
    options.toMessageResult ?? {
      _id: 'test-message-id',
      text: 'Test message',
      createdAt: new Date(),
      type: type,
      user: { _id: 'test-user' },
      record: {},
      callbackType: CallbackType.CredentialOffer,
    }
  ),
  toNotification: jest.fn().mockReturnValue(
    options.toNotificationResult ?? {
      id: 'notification-1',
      type,
      record: {},
      title: 'Test Notification',
      createdAt: new Date(),
    }
  ) as any,
  getCallbackType: jest.fn().mockReturnValue(CallbackType.CredentialOffer),
  getRole: jest.fn().mockReturnValue(Role.them),
  getLabel: jest.fn().mockReturnValue('Test Label'),
  getDetailNavigation: jest.fn().mockReturnValue(undefined),
  getActions: jest.fn().mockReturnValue([]),
  handleAction: jest.fn().mockResolvedValue(undefined),
  setRenderer: jest.fn(),
  getRenderer: jest.fn().mockReturnValue(undefined),
  hasCustomRenderer: jest.fn().mockReturnValue(false),
})

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe('WorkflowRegistry', () => {
  let registry: WorkflowRegistry

  beforeEach(() => {
    registry = new WorkflowRegistry()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Registration', () => {
    describe('register()', () => {
      it('should add a handler to the registry', () => {
        const handler = createMockHandler(WorkflowType.Credential)

        registry.register(handler)

        expect(registry.getHandlers()).toHaveLength(1)
        expect(registry.getHandlerByType(WorkflowType.Credential)).toBe(handler)
      })

      it('should overwrite existing handler of the same type', () => {
        const handler1 = createMockHandler(WorkflowType.Credential)
        const handler2 = createMockHandler(WorkflowType.Credential)

        registry.register(handler1)
        registry.register(handler2)

        expect(registry.getHandlers()).toHaveLength(1)
        expect(registry.getHandlerByType(WorkflowType.Credential)).toBe(handler2)
      })

      it('should allow registering multiple handlers of different types', () => {
        const credHandler = createMockHandler(WorkflowType.Credential)
        const proofHandler = createMockHandler(WorkflowType.Proof)
        const messageHandler = createMockHandler(WorkflowType.BasicMessage)

        registry.register(credHandler)
        registry.register(proofHandler)
        registry.register(messageHandler)

        expect(registry.getHandlers()).toHaveLength(3)
        expect(registry.getHandlerByType(WorkflowType.Credential)).toBe(credHandler)
        expect(registry.getHandlerByType(WorkflowType.Proof)).toBe(proofHandler)
        expect(registry.getHandlerByType(WorkflowType.BasicMessage)).toBe(messageHandler)
      })
    })

    describe('unregister()', () => {
      it('should remove a handler from the registry', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)

        registry.unregister(WorkflowType.Credential)

        expect(registry.getHandlers()).toHaveLength(0)
        expect(registry.getHandlerByType(WorkflowType.Credential)).toBeUndefined()
      })

      it('should not throw when unregistering non-existent handler', () => {
        expect(() => {
          registry.unregister(WorkflowType.Credential)
        }).not.toThrow()
      })

      it('should only remove the specified handler', () => {
        const credHandler = createMockHandler(WorkflowType.Credential)
        const proofHandler = createMockHandler(WorkflowType.Proof)
        registry.register(credHandler)
        registry.register(proofHandler)

        registry.unregister(WorkflowType.Credential)

        expect(registry.getHandlers()).toHaveLength(1)
        expect(registry.getHandlerByType(WorkflowType.Proof)).toBe(proofHandler)
      })
    })

    describe('getHandlers()', () => {
      it('should return empty array when no handlers registered', () => {
        expect(registry.getHandlers()).toEqual([])
      })

      it('should return all registered handlers', () => {
        const handler1 = createMockHandler(WorkflowType.Credential)
        const handler2 = createMockHandler(WorkflowType.Proof)
        registry.register(handler1)
        registry.register(handler2)

        const handlers = registry.getHandlers()

        expect(handlers).toHaveLength(2)
        expect(handlers).toContain(handler1)
        expect(handlers).toContain(handler2)
      })
    })

    describe('getHandlerByType()', () => {
      it('should return undefined for unregistered type', () => {
        expect(registry.getHandlerByType(WorkflowType.Credential)).toBeUndefined()
      })

      it('should return the correct handler for registered type', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)

        expect(registry.getHandlerByType(WorkflowType.Credential)).toBe(handler)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // RESOLUTION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Resolution', () => {
    describe('getHandler()', () => {
      it('should return undefined when no handlers registered', () => {
        const record = { id: 'test', type: 'credential' }

        expect(registry.getHandler(record)).toBeUndefined()
      })

      it('should return the handler that can handle the record', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)
        const record = { id: 'test', type: 'credential' }

        const result = registry.getHandler(record)

        expect(result).toBe(handler)
        expect(handler.canHandle).toHaveBeenCalledWith(record)
      })

      it('should return undefined when no handler can handle the record', () => {
        const handler = createMockHandler(WorkflowType.Credential, { canHandleResult: false })
        registry.register(handler)
        const record = { id: 'test', type: 'unknown' }

        expect(registry.getHandler(record)).toBeUndefined()
      })

      it('should return first matching handler when multiple handlers registered', () => {
        const handler1 = createMockHandler(WorkflowType.Credential, { canHandleResult: true })
        const handler2 = createMockHandler(WorkflowType.Proof, { canHandleResult: true })
        registry.register(handler1)
        registry.register(handler2)
        const record = { id: 'test' }

        const result = registry.getHandler(record)

        expect(result).toBe(handler1)
      })

      it('should skip handlers that cannot handle the record', () => {
        const handler1 = createMockHandler(WorkflowType.Credential, { canHandleResult: false })
        const handler2 = createMockHandler(WorkflowType.Proof, { canHandleResult: true })
        registry.register(handler1)
        registry.register(handler2)
        const record = { id: 'test' }

        const result = registry.getHandler(record)

        expect(result).toBe(handler2)
        expect(handler1.canHandle).toHaveBeenCalled()
        expect(handler2.canHandle).toHaveBeenCalled()
      })
    })

    describe('canHandle()', () => {
      it('should return false when no handlers registered', () => {
        expect(registry.canHandle({ id: 'test' })).toBe(false)
      })

      it('should return true when a handler can handle the record', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)

        expect(registry.canHandle({ id: 'test' })).toBe(true)
      })

      it('should return false when no handler can handle the record', () => {
        const handler = createMockHandler(WorkflowType.Credential, { canHandleResult: false })
        registry.register(handler)

        expect(registry.canHandle({ id: 'test' })).toBe(false)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK OPERATIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Bulk Operations', () => {
    describe('toMessages()', () => {
      const connection = mockConnectionRecord

      it('should return empty array when no records provided', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)

        const messages = registry.toMessages([], connection, mockMessageContext as any)

        expect(messages).toEqual([])
      })

      it('should convert records to messages using handlers', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)
        const records = [{ id: 'record-1' }, { id: 'record-2' }]

        const messages = registry.toMessages(records, connection, mockMessageContext as any)

        expect(messages).toHaveLength(2)
        expect(handler.toMessage).toHaveBeenCalledTimes(2)
      })

      it('should skip records without matching handler', () => {
        const handler = createMockHandler(WorkflowType.Credential, { canHandleResult: false })
        registry.register(handler)
        const records = [{ id: 'record-1' }]

        const messages = registry.toMessages(records, connection, mockMessageContext as any)

        expect(messages).toEqual([])
      })

      it('should skip records where shouldDisplay returns false', () => {
        const handler = createMockHandler(WorkflowType.Credential, { shouldDisplayResult: false })
        registry.register(handler)
        const records = [{ id: 'record-1' }]

        const messages = registry.toMessages(records, connection, mockMessageContext as any)

        expect(messages).toEqual([])
        expect(handler.shouldDisplay).toHaveBeenCalled()
        expect(handler.toMessage).not.toHaveBeenCalled()
      })

      it('should handle errors from toMessage gracefully', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        handler.toMessage.mockImplementationOnce(() => {
          throw new Error('Conversion error')
        })
        registry.register(handler)
        const records = [{ id: 'record-1' }, { id: 'record-2' }]

        // Should not throw and should skip the failed record
        const messages = registry.toMessages(records, connection, mockMessageContext as any)

        // First record fails, second succeeds
        expect(messages).toHaveLength(1)
      })

      it('should pass connection and context to handler', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)
        const record = { id: 'record-1' }

        registry.toMessages([record], connection, mockMessageContext as any)

        expect(handler.toMessage).toHaveBeenCalledWith(record, connection, mockMessageContext)
      })
    })

    describe('getNotifications()', () => {
      it('should return empty array when no records provided', () => {
        const handler = createMockHandler(WorkflowType.Credential, { isNotificationResult: true })
        registry.register(handler)

        const notifications = registry.getNotifications([])

        expect(notifications).toEqual([])
      })

      it('should return notifications for records that are notifications', () => {
        const handler = createMockHandler(WorkflowType.Credential, { isNotificationResult: true })
        registry.register(handler)
        const records = [{ id: 'record-1' }]

        const notifications = registry.getNotifications(records)

        expect(notifications).toHaveLength(1)
        expect(handler.isNotification).toHaveBeenCalled()
        expect(handler.toNotification).toHaveBeenCalled()
      })

      it('should skip records where isNotification returns false', () => {
        const handler = createMockHandler(WorkflowType.Credential, { isNotificationResult: false })
        registry.register(handler)
        const records = [{ id: 'record-1' }]

        const notifications = registry.getNotifications(records)

        expect(notifications).toEqual([])
        expect(handler.toNotification).not.toHaveBeenCalled()
      })

      it('should handle errors from toNotification gracefully', () => {
        const handler = createMockHandler(WorkflowType.Credential, { isNotificationResult: true })
        ;(handler.toNotification as jest.Mock).mockImplementationOnce(() => {
          throw new Error('Notification error')
        })
        registry.register(handler)
        const records = [{ id: 'record-1' }, { id: 'record-2' }]

        const notifications = registry.getNotifications(records)

        // First fails, second succeeds
        expect(notifications).toHaveLength(1)
      })

      it('should skip records without matching handler', () => {
        const handler = createMockHandler(WorkflowType.Credential, {
          canHandleResult: false,
          isNotificationResult: true,
        })
        registry.register(handler)
        const records = [{ id: 'record-1' }]

        const notifications = registry.getNotifications(records)

        expect(notifications).toEqual([])
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT ACTIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Chat Actions', () => {
    const createMockAction = (id: string): WorkflowAction => ({
      id,
      text: `Action ${id}`,
      icon: () => null,
      onPress: jest.fn(),
    })

    describe('registerChatAction()', () => {
      it('should register a static action', () => {
        const action = createMockAction('action-1')

        registry.registerChatAction(action)

        const actions = registry.getChatActions(mockActionContext as any)
        expect(actions).toHaveLength(1)
        expect(actions[0]).toBe(action)
      })

      it('should register a factory function', () => {
        const action = createMockAction('action-1')
        const factory = jest.fn().mockReturnValue(action)

        registry.registerChatAction(factory)

        const actions = registry.getChatActions(mockActionContext as any)
        expect(actions).toHaveLength(1)
        expect(factory).toHaveBeenCalledWith(mockActionContext)
      })

      it('should allow multiple actions to be registered', () => {
        const action1 = createMockAction('action-1')
        const action2 = createMockAction('action-2')

        registry.registerChatAction(action1)
        registry.registerChatAction(action2)

        const actions = registry.getChatActions(mockActionContext as any)
        expect(actions).toHaveLength(2)
      })
    })

    describe('getChatActions()', () => {
      it('should return empty array when no actions registered', () => {
        const actions = registry.getChatActions(mockActionContext as any)

        expect(actions).toEqual([])
      })

      it('should return static actions as-is', () => {
        const action = createMockAction('action-1')
        registry.registerChatAction(action)

        const actions = registry.getChatActions(mockActionContext as any)

        expect(actions).toEqual([action])
      })

      it('should execute factory functions with context', () => {
        const action = createMockAction('action-1')
        const factory = jest.fn().mockReturnValue(action)
        registry.registerChatAction(factory)

        const actions = registry.getChatActions(mockActionContext as any)

        expect(factory).toHaveBeenCalledWith(mockActionContext)
        expect(actions).toEqual([action])
      })

      it('should filter out undefined returns from factory functions', () => {
        const factory = jest.fn().mockReturnValue(undefined)
        registry.registerChatAction(factory)

        const actions = registry.getChatActions(mockActionContext as any)

        expect(actions).toEqual([])
      })

      it('should handle mix of static actions and factories', () => {
        const staticAction = createMockAction('static-1')
        const factoryAction = createMockAction('factory-1')
        const factory = jest.fn().mockReturnValue(factoryAction)

        registry.registerChatAction(staticAction)
        registry.registerChatAction(factory)

        const actions = registry.getChatActions(mockActionContext as any)

        expect(actions).toHaveLength(2)
        expect(actions).toContain(staticAction)
        expect(actions).toContain(factoryAction)
      })
    })

    describe('unregisterChatAction()', () => {
      it('should remove a registered action by ID', () => {
        const action = createMockAction('action-1')
        registry.registerChatAction(action)

        registry.unregisterChatAction('action-1')

        const actions = registry.getChatActions(mockActionContext as any)
        expect(actions).toEqual([])
      })

      it('should not throw when unregistering non-existent action', () => {
        expect(() => {
          registry.unregisterChatAction('non-existent')
        }).not.toThrow()
      })

      it('should only remove the specified action', () => {
        const action1 = createMockAction('action-1')
        const action2 = createMockAction('action-2')
        registry.registerChatAction(action1)
        registry.registerChatAction(action2)

        registry.unregisterChatAction('action-1')

        const actions = registry.getChatActions(mockActionContext as any)
        expect(actions).toHaveLength(1)
        expect(actions[0]).toBe(action2)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT SCREEN CONFIG TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Chat Screen Configuration', () => {
    // Helper to create a mock renderer with required render method
    const createMockRenderer = () => ({ render: jest.fn() })

    describe('setChatScreenConfig()', () => {
      it('should store the configuration', () => {
        const config = { showMenuButton: true }

        registry.setChatScreenConfig(config)

        expect(registry.getChatScreenConfig()).toBe(config)
      })

      it('should apply credential renderer to credential handler', () => {
        const credHandler = createMockHandler(WorkflowType.Credential)
        registry.register(credHandler)
        const renderer = createMockRenderer()
        const config = { credentialRenderer: renderer }

        registry.setChatScreenConfig(config)

        expect(credHandler.setRenderer).toHaveBeenCalledWith(renderer)
      })

      it('should apply proof renderer to proof handler', () => {
        const proofHandler = createMockHandler(WorkflowType.Proof)
        registry.register(proofHandler)
        const renderer = createMockRenderer()
        const config = { proofRenderer: renderer }

        registry.setChatScreenConfig(config)

        expect(proofHandler.setRenderer).toHaveBeenCalledWith(renderer)
      })
    })

    describe('getChatScreenConfig()', () => {
      it('should return undefined when not set', () => {
        expect(registry.getChatScreenConfig()).toBeUndefined()
      })

      it('should return the previously set config', () => {
        const config = { showMenuButton: true }
        registry.setChatScreenConfig(config)

        expect(registry.getChatScreenConfig()).toBe(config)
      })
    })

    describe('setCredentialRenderer()', () => {
      it('should set renderer on credential handler', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)
        const renderer = createMockRenderer()

        registry.setCredentialRenderer(renderer)

        expect(handler.setRenderer).toHaveBeenCalledWith(renderer)
      })

      it('should create chatScreenConfig if not exists', () => {
        const handler = createMockHandler(WorkflowType.Credential)
        registry.register(handler)
        const renderer = createMockRenderer()

        registry.setCredentialRenderer(renderer)

        const config = registry.getChatScreenConfig()
        expect(config).toBeDefined()
        expect(config?.credentialRenderer).toBe(renderer)
      })

      it('should not throw when no credential handler registered', () => {
        const renderer = createMockRenderer()

        expect(() => {
          registry.setCredentialRenderer(renderer)
        }).not.toThrow()
      })
    })

    describe('setProofRenderer()', () => {
      it('should set renderer on proof handler', () => {
        const handler = createMockHandler(WorkflowType.Proof)
        registry.register(handler)
        const renderer = createMockRenderer()

        registry.setProofRenderer(renderer)

        expect(handler.setRenderer).toHaveBeenCalledWith(renderer)
      })

      it('should create chatScreenConfig if not exists', () => {
        const handler = createMockHandler(WorkflowType.Proof)
        registry.register(handler)
        const renderer = createMockRenderer()

        registry.setProofRenderer(renderer)

        const config = registry.getChatScreenConfig()
        expect(config).toBeDefined()
        expect(config?.proofRenderer).toBe(renderer)
      })

      it('should not throw when no proof handler registered', () => {
        const renderer = createMockRenderer()

        expect(() => {
          registry.setProofRenderer(renderer)
        }).not.toThrow()
      })
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('createWorkflowRegistry()', () => {
  it('should create a new WorkflowRegistry instance', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createWorkflowRegistry } = require('../../../src/modules/workflow/WorkflowRegistry')

    const registry = createWorkflowRegistry()

    expect(registry).toBeInstanceOf(WorkflowRegistry)
    expect(registry.getHandlers()).toEqual([])
  })
})
