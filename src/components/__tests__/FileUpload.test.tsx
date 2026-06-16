import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileUpload } from '../../components/FileUpload';

describe('FileUpload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders upload label', () => {
    render(<FileUpload bucket="test" label="Upload Audio" onUploaded={vi.fn()} />);
    expect(screen.getByText('Upload Audio')).toBeVisible();
  });

  it('renders max size info', () => {
    render(<FileUpload bucket="test" label="Upload" maxSizeMB={50} onUploaded={vi.fn()} />);
    expect(screen.getByText(/50MB/)).toBeVisible();
  });

  it('renders accepted file types', () => {
    render(
      <FileUpload
        bucket="test"
        label="Upload"
        accept="audio/wav,audio/mpeg"
        onUploaded={vi.fn()}
      />
    );
    expect(screen.getByText(/WAV/)).toBeVisible();
  });

  it('accepts default maxSizeMB of 100', () => {
    render(<FileUpload bucket="test" label="Upload" onUploaded={vi.fn()} />);
    expect(screen.getByText(/100MB/)).toBeVisible();
  });
});
