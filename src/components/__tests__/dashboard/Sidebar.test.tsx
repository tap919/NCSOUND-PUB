import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../admin/dashboard/Sidebar';

function renderSidebar(activeTab = 'Validation') {
  const setActiveTab = vi.fn();
  const handleSignOut = vi.fn();
  return {
    setActiveTab,
    handleSignOut,
    ...render(
      <MemoryRouter>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleSignOut={handleSignOut} />
      </MemoryRouter>
    ),
  };
}

describe('Sidebar', () => {
  it('renders System heading', () => {
    renderSidebar();
    expect(screen.getByText('System')).toBeVisible();
    expect(screen.getByText('Publishing Agent')).toBeVisible();
  });

  it('renders all main tab buttons', () => {
    renderSidebar();
    expect(screen.getByText('Metadata Layer')).toBeVisible();
    expect(screen.getByText('MLC Registry Sync')).toBeVisible();
    expect(screen.getByText('PRO / TuneRegistry')).toBeVisible();
    expect(screen.getByText('DDEX ERN Deliv.')).toBeVisible();
    expect(screen.getByText('Integrations')).toBeVisible();
    expect(screen.getByText('Deals & Cue Sheets')).toBeVisible();
  });

  it('renders Phase 4 module buttons', () => {
    renderSidebar();
    expect(screen.getByText('AI Pitch Engine')).toBeVisible();
    expect(screen.getByText('System Analytics')).toBeVisible();
    expect(screen.getByText('NcSound Records')).toBeVisible();
    expect(screen.getByText('Acquisition Metrics')).toBeVisible();
  });

  it('renders admin page links', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Inbox' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Supervisor Requests' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'License Requests' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Briefs & Matching' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Control Center' })).toBeVisible();
  });

  it('renders Exit Terminal button', () => {
    renderSidebar();
    expect(screen.getByText('Exit Terminal')).toBeVisible();
  });

  it('calls setActiveTab when a tab button is clicked', () => {
    const { setActiveTab } = renderSidebar();
    fireEvent.click(screen.getByText('MLC Registry Sync'));
    expect(setActiveTab).toHaveBeenCalledWith('MLC');
  });

  it('calls setActiveTab for DDEX tab', () => {
    const { setActiveTab } = renderSidebar();
    fireEvent.click(screen.getByText('DDEX ERN Deliv.'));
    expect(setActiveTab).toHaveBeenCalledWith('DDEX');
  });

  it('calls setActiveTab for PRO tab', () => {
    const { setActiveTab } = renderSidebar();
    fireEvent.click(screen.getByText('PRO / TuneRegistry'));
    expect(setActiveTab).toHaveBeenCalledWith('PRO');
  });

  it('highlights active tab with orange border', () => {
    renderSidebar('MLC');
    const mlcButton = screen.getByText('MLC Registry Sync').closest('button');
    expect(mlcButton?.className).toContain('border-orange-500');
  });
});
