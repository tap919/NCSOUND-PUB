import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentChat from '../AgentChat';

describe('AgentChat', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('renders closed state with open button', () => {
    render(<AgentChat />);
    expect(screen.getByTitle('Open AI Agent')).toBeVisible();
  });

  it('opens chat panel when button is clicked', () => {
    render(<AgentChat />);
    fireEvent.click(screen.getByTitle('Open AI Agent'));
    expect(screen.getByText(/Hey, I'm your NcSound agent/)).toBeVisible();
  });

  it('shows input field when open', () => {
    render(<AgentChat />);
    fireEvent.click(screen.getByTitle('Open AI Agent'));
    expect(screen.getByPlaceholderText('Ask anything...')).toBeVisible();
  });

  it('disables send button when input is empty', () => {
    render(<AgentChat />);
    fireEvent.click(screen.getByTitle('Open AI Agent'));
    const buttons = screen.getAllByRole('button');
    const sendBtn = buttons.find(b => b.querySelector('svg.lucide-send'));
    expect(sendBtn).toBeDisabled();
  });

  it('disables send while loading', async () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}) as unknown as Promise<Response>);
    render(<AgentChat />);
    fireEvent.click(screen.getByTitle('Open AI Agent'));
    const input = screen.getByPlaceholderText('Ask anything...');
    fireEvent.change(input, { target: { value: 'test' } });
    const buttons = screen.getAllByRole('button');
    const sendBtn = buttons.find(b => b.querySelector('svg.lucide-send'));
    fireEvent.click(sendBtn!);
    await waitFor(() => {
      expect(sendBtn).toBeDisabled();
    });
  });

  it('shows error message on failed request', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    render(<AgentChat />);
    fireEvent.click(screen.getByTitle('Open AI Agent'));
    const input = screen.getByPlaceholderText('Ask anything...');
    fireEvent.change(input, { target: { value: 'test' } });
    const buttons = screen.getAllByRole('button');
    const sendBtn = buttons.find(b => b.querySelector('svg.lucide-send'));
    fireEvent.click(sendBtn!);
    await waitFor(() => {
      expect(screen.getByText(/Sorry, I hit an error/)).toBeVisible();
    }, { timeout: 3000 });
  });

  it('minimizes and expands chat when chevron is clicked', () => {
    render(<AgentChat />);
    fireEvent.click(screen.getByTitle('Open AI Agent'));
    expect(screen.getByPlaceholderText('Ask anything...')).toBeVisible();
    const buttons = screen.getAllByRole('button');
    const minimizeBtn = buttons.find(b => b.querySelector('svg.lucide-chevron-down'));
    fireEvent.click(minimizeBtn!);
    expect(screen.queryByPlaceholderText('Ask anything...')).not.toBeInTheDocument();
  });
});
