import { CredentialExchangeRecord } from '@credo-ts/core'
import { useCredentials } from '@credo-ts/react-hooks'
import { useMemo } from 'react'

export const useCredentialsByConnectionId = (connectionId: string): CredentialExchangeRecord[] => {
  const { records: credentials } = useCredentials()

  console.log(`[useCredentialsByConnectionId] Total credentials: ${credentials.length}, connectionId: ${connectionId}`)
  credentials.forEach(c => {
    console.log(`[useCredentialsByConnectionId] Credential: ${c.id}, connectionId: ${c.connectionId}, state: ${c.state}`)
  })

  return useMemo(
    () => credentials.filter((credential: CredentialExchangeRecord) => credential.connectionId === connectionId),
    [credentials, connectionId]
  )
}
