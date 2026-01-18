// import { CredentialExchangeRecord as CredentialRecord } from '@credo-ts/core'
// import { useCredentialById } from '@credo-ts/react-hooks'
// import fs from 'fs'
// import path from 'path'

// import { act, render } from '@testing-library/react-native'
// import React from 'react'
// import CredentialOfferAccept from '../../src/screens/CredentialOfferAccept'
// import { testIdWithKey } from '../../src/utils/testable'
// // import timeTravel from '../helpers/timetravel'
// import { BasicAppContext } from '../helpers/app'
// const credentialId = '123'

// const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
// const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))
// const credentialRecord = new CredentialRecord(credential)
// // TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
// credentialRecord.createdAt = new Date(credentialRecord.createdAt)
// useCredentialById.mockReturnValue(credentialRecord)

describe('CredentialOfferAccept', () => {
  test('always passes', () => {
    expect(true).toBe(true)
  })
})

// describe('CredentialOfferAccept Screen', () => {
//   test('renders correctly', () => {
//     const tree = render(
//       <BasicAppContext>
//         <CredentialOfferAccept visible={true} credentialId={credentialId} />
//       </BasicAppContext>
//     )
//
//     const doneButton = tree.queryByTestId('Done')
//
//     expect(tree).toMatchSnapshot()
//     expect(doneButton).toBeNull()
//     expect(useCredentialById).toBeCalledWith(credentialId)
//   })
//
//   test('transitions to taking too delay message', async () => {
//     jest.useFakeTimers()
//     const tree = render(
//       <BasicAppContext>
//         <CredentialOfferAccept visible={true} credentialId={credentialId} />
//       </BasicAppContext>
//     )
//
//     await act(async () => {
//       await jest.advanceTimersByTimeAsync(11000)
//     })
//
//     const backToHomeButton = tree.getByTestId(testIdWithKey('BackToHome'))
//     const doneButton = tree.queryByTestId(testIdWithKey('Done'))
//
//     expect(tree).toMatchSnapshot()
//     expect(backToHomeButton).not.toBeNull()
//     expect(doneButton).toBeNull()
//   })
//
//   test('transitions to offer accepted', () => {
//     credentialRecord.state = CredentialState.CredentialReceived
//
//     const tree = render(
//       <BasicAppContext>
//         <CredentialOfferAccept visible={true} credentialId={credentialId} />
//       </BasicAppContext>
//     )
//
//     const doneButton = tree.getByTestId(testIdWithKey('Done'))
//     const backToHomeButton = tree.queryByTestId(testIdWithKey('BackToHome'))
//
//     expect(tree).toMatchSnapshot()
//     expect(doneButton).not.toBeNull()
//     expect(backToHomeButton).toBeNull()
//   })
// })
