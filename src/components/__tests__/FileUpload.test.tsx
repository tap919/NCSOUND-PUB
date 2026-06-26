import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../FileUpload';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FileUpload Component', () => {
  const mockOnUploaded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders the upload trigger with the correct label', () => {
    render(<FileUpload bucket="test" label="Upload Beat" onUploaded={mockOnUploaded} />);
    expect(screen.getByText('Upload Beat')).toBeDefined();
  });

  it('shows error if file is too large', async () => {
    render(<FileUpload bucket="test" label="Upload Beat" maxSizeMB={1} onUploaded={mockOnUploaded} />);
    
    const file = new File(['a'.repeat(2 * 1024 * 1024)], 'large-file.wav', { type: 'audio/wav' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('File too large. Max 1MB.');
    });
  });

  it('calls onUploaded successfully when file upload succeeds', async () => {
    const mockSignedUrl = 'https://example.com/signed-url?token=123';
    const mockFile = new File(['content'], 'test.wav', { type: 'audio/wav' });

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: mockSignedUrl, path: 'test.wav' }),
    } as any).mockResolvedValueOnce({
      ok: true,
    } as any);

    render(<FileUpload bucket="test" label="Upload Beat" onUploaded={mockOnUploaded} />);
    
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnUploaded).toHaveBeenCalledWith('https://example.com/signed-url', 'test.wav');
      expect(toast.success).toHaveBeenCalledWith('File uploaded');
    });
  });
});
