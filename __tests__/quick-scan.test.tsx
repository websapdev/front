import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { QuickScan } from '@/app/audit/components/quick-scan'
import { runQuickScan } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  runQuickScan: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe('QuickScan', () => {
  const user = userEvent.setup()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('submits the URL and renders results', async () => {
    vi.mocked(runQuickScan).mockResolvedValue({
      url: 'https://example.com',
      status: 'completed',
      score: 92,
      summary: 'All good',
      issues: [{ title: 'Robots.txt missing', severity: 'medium' }],
    })

    render(<QuickScan />)

    const input = screen.getByLabelText(/website url/i)
    await user.type(input, 'example.com')
    await user.click(screen.getByRole('button', { name: /run ai visibility check/i }))

    await waitFor(() => expect(runQuickScan).toHaveBeenCalledWith('https://example.com'))

    expect(screen.getByText(/All good/i)).toBeInTheDocument()
    expect(screen.getByText(/Robots.txt missing/i)).toBeInTheDocument()
  })

  it('shows a friendly error when the scan fails', async () => {
    vi.mocked(runQuickScan).mockRejectedValue(new Error('Network down'))

    render(<QuickScan />)

    await user.type(screen.getByLabelText(/website url/i), 'https://bad.com')
    await user.click(screen.getByRole('button', { name: /run ai visibility check/i }))

    await waitFor(() => expect(screen.getByText(/Network down/i)).toBeInTheDocument())
  })
})
