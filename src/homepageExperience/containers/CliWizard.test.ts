// Libraries
import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {renderWithRedux} from 'src/mockState'

// Components
import {CliWizard} from 'src/homepageExperience/containers/CliWizard'

jest.mock('canvas-confetti')

const setup = () => {
  return renderWithRedux(<CliWizard />)
}

describe('Navigation', () => {
  describe('Next and Previous Buttons', () => {
    it('cannot click next on final step', async () => {
      setup()
      fireEvent.click(screen.getByText('Finished!'))
      const nextButton = screen.getByTestId('cli-next-button')
      expect(nextButton).toHaveAttribute('disabled')
    })
    it('cannot click previous on first step', async () => {
      setup()
      fireEvent.click(screen.getByText('Overview'))
      const prevButton = screen.getByTestId('cli-prev-button')
      expect(prevButton).toHaveAttribute('disabled')
    })
  })
})
