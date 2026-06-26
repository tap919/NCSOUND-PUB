import type { Database } from './supabase';

export type Track = Database['public']['Tables']['tracks']['Row'];
export type Artist = Database['public']['Tables']['artists']['Row'];
export type ArtistLink = Database['public']['Tables']['artist_links']['Row'];
export type Brief = Database['public']['Tables']['briefs']['Row'];
export type Deal = Database['public']['Tables']['deals']['Row'];
export type RoyaltyStatement = Database['public']['Tables']['royalty_statements']['Row'];
export type BeatStoreProduct = Database['public']['Tables']['beat_store_products']['Row'];
export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
export type SupervisorAccessRequest = Database['public']['Tables']['supervisor_access_requests']['Row'];
export type LicenseRequest = Database['public']['Tables']['license_requests']['Row'];
export type Registration = Database['public']['Tables']['registrations']['Row'];
export type IntegrationConfig = Database['public']['Tables']['integration_configs']['Row'];
export type IncomeSummary = Database['public']['Views']['income_summary']['Row'];
export type TrackWriter = Database['public']['Tables']['track_writers']['Row'];
export type TrackFile = Database['public']['Tables']['track_files']['Row'];
