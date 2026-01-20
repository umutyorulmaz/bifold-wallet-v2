import { getProofRequestTemplates } from '@bifold/verifier'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { useNavigation as testUseNavigation } from '../../__mocks__/@react-navigation/native'
import { NetworkProvider } from '../../src/contexts/network'
import ListProofRequests from '../../src/screens/ListProofRequests'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const navigation = testUseNavigation()

describe('ListProofRequests Component', () => {
  const renderView = (params?: any) => {
    return render(
      <BasicAppContext>
        <NetworkProvider>
          <ListProofRequests navigation={navigation as any} route={{ params: params || {} } as any} />
        </NetworkProvider>
      </BasicAppContext>
    )
  }

  test('Renders correctly', async () => {
    // const tree = renderView()
    const tree = render(
      <BasicAppContext>
        <ListProofRequests navigation={navigation as any} route={{ params: {} } as any} />
      </BasicAppContext>
    )
    await act(async () => {})
    expect(tree).toMatchSnapshot()
  })

  // test('Template names are human readable', async () => {
  //   const tree = renderView()
  //
  //   // First template should be visible
  //   const fullName = await tree.findByText('High School Student Name', { exact: true })
  //   expect(fullName).not.toBe(null)
  //
  //   // Check that at least one template with descriptive text is rendered
  //   const description = await tree.findByText('Verify the full name of a high school student', { exact: false })
  //   expect(description).not.toBe(null)
  // })

  test('Pressing on a request template takes the user to a proof request template detail screen', async () => {
    const tree = renderView()

    await act(async () => {
      const templateItemInstance = await tree.findByText('High School Student Name', { exact: true })

      fireEvent(templateItemInstance, 'press')

      expect(navigation.navigate).toBeCalledWith('Proof Request Details', {
        templateId: getProofRequestTemplates(false)[0].id,
      })
    })
  })
})
