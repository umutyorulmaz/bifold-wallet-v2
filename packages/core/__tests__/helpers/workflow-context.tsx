/**
 * Workflow Test Context Helper
 *
 * Provides test wrappers for workflow-related components.
 */

import React, { PropsWithChildren, useMemo } from 'react'
import { container } from 'tsyringe'

import { Container, ContainerProvider, TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { NetworkContext } from '../../src/contexts/network'
import { MockLogger } from '../../src/testing/MockLogger'
import { WorkflowRegistry } from '../../src/modules/workflow/WorkflowRegistry'
import { WorkflowRegistryProvider } from '../../src/modules/workflow/context'
import { IWorkflowRegistry } from '../../src/modules/workflow/types'
import { OpenIDCredentialRecordProvider } from '../../src/modules/openid/context/OpenIDCredentialRecordProvider'

import networkContext from '../contexts/network'

/**
 * Props for WorkflowTestContext
 */
export interface WorkflowTestContextProps extends PropsWithChildren {
  /** Optional custom workflow registry */
  registry?: IWorkflowRegistry
  /** Optional custom DI container */
  customContainer?: Container
}

/**
 * Test context wrapper that provides both BasicAppContext and WorkflowRegistry
 *
 * @example
 * ```tsx
 * import { renderHook } from '@testing-library/react-native'
 * import { WorkflowTestContext } from '../helpers/workflow-context'
 *
 * const { result } = renderHook(() => useWorkflowRegistry(), {
 *   wrapper: WorkflowTestContext,
 * })
 * ```
 */
export const WorkflowTestContext: React.FC<WorkflowTestContextProps> = ({
  children,
  registry,
  customContainer,
}) => {
  const containerContext = useMemo(() => {
    if (customContainer) {
      return customContainer
    }
    const c = new MainContainer(container.createChildContainer()).init()
    c.resolve(TOKENS.UTIL_LOGGER)
    c.container.registerInstance(TOKENS.UTIL_LOGGER, new MockLogger())
    return c
  }, [customContainer])

  const workflowRegistry = useMemo(() => {
    return registry ?? new WorkflowRegistry()
  }, [registry])

  return (
    <ContainerProvider value={containerContext}>
      <OpenIDCredentialRecordProvider>
        <NetworkContext.Provider value={networkContext}>
          <WorkflowRegistryProvider registry={workflowRegistry}>
            {children}
          </WorkflowRegistryProvider>
        </NetworkContext.Provider>
      </OpenIDCredentialRecordProvider>
    </ContainerProvider>
  )
}

/**
 * Create a custom WorkflowTestContext wrapper with pre-configured registry
 *
 * @example
 * ```tsx
 * const registry = new WorkflowRegistry()
 * registry.register(new CredentialWorkflowHandler())
 *
 * const { result } = renderHook(() => useWorkflowRegistry(), {
 *   wrapper: createWorkflowTestWrapper({ registry }),
 * })
 * ```
 */
export const createWorkflowTestWrapper = (options: {
  registry?: IWorkflowRegistry
  customContainer?: Container
} = {}) => {
  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <WorkflowTestContext
      registry={options.registry}
      customContainer={options.customContainer}
    >
      {children}
    </WorkflowTestContext>
  )
  return Wrapper
}

/**
 * Create a minimal context for testing workflow registry in isolation
 * (without full app context)
 */
export const MinimalWorkflowContext: React.FC<PropsWithChildren & { registry?: IWorkflowRegistry }> = ({
  children,
  registry,
}) => {
  const workflowRegistry = useMemo(() => {
    return registry ?? new WorkflowRegistry()
  }, [registry])

  return (
    <WorkflowRegistryProvider registry={workflowRegistry}>
      {children}
    </WorkflowRegistryProvider>
  )
}

/**
 * Create a mock workflow registry with jest spies on all methods
 */
export const createMockWorkflowRegistry = (): jest.Mocked<IWorkflowRegistry> => ({
  register: jest.fn(),
  unregister: jest.fn(),
  getHandlers: jest.fn().mockReturnValue([]),
  getHandlerByType: jest.fn().mockReturnValue(undefined),
  getHandler: jest.fn().mockReturnValue(undefined),
  canHandle: jest.fn().mockReturnValue(false),
  toMessages: jest.fn().mockReturnValue([]),
  getNotifications: jest.fn().mockReturnValue([]),
  getChatActions: jest.fn().mockReturnValue([]),
  registerChatAction: jest.fn(),
  unregisterChatAction: jest.fn(),
  setChatScreenConfig: jest.fn(),
  getChatScreenConfig: jest.fn().mockReturnValue(undefined),
  setCredentialRenderer: jest.fn(),
  setProofRenderer: jest.fn(),
})

export default WorkflowTestContext
