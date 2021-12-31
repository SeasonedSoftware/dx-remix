import Index from '~/routes'
import { render, screen } from '@testing-library/react'

jest.mock('remix', () => ({
  __esModule: true,
  ...jest.requireActual('remix'),
  useLoaderData: () => [],
  useActionData: () => { }
}))

jest.mock('~/components/stories-list', () => () => <div>Stories List</div>)
jest.mock('~/components/story-form', () => () => <div>Story Form</div>)

describe('Index', () => {
  it('renders story form', () => {
    render(<Index />)

    expect(screen.getByText(/Story Form/)).toBeInTheDocument()
  })

  it('renders story list', () => {
    render(<Index />)

    expect(screen.getAllByText(/Stories List/).length).toBe(4)
  })
})
