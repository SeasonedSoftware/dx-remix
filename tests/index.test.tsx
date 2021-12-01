import Index from '~/routes'
import { render, screen } from '@testing-library/react'

jest.mock('remix', () => ({
  useLoaderData: () => [],
  useActionData: () => undefined
}))

describe('Index', () => {
  it('renders', () => {
    render(<Index />)

    expect(screen.getByText(/Ready for development/)).toBeInTheDocument()
  })

  xit('renders story titles', () => {
    render(<Index />)

    expect(
      screen.getAllByText(/write test files/).length
    ).toBeGreaterThanOrEqual(2)
  })

  xit('renders story titles for ready stories', () => {
    render(<Index />)

    expect(
      screen.getAllByText(/To write a new feature/).length
    ).toBeGreaterThanOrEqual(2)
  })

})
