export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: 'artist' | 'supervisor' | 'admin'
          email: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'artist' | 'supervisor' | 'admin'
          email: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'artist' | 'supervisor' | 'admin'
          email?: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          user_id: string | null
          legal_name: string
          stage_name: string | null
          bio: string | null
          photo_url: string | null
          bandcamp_username: string | null
          youtube_channel_id: string | null
          pro_affiliation: string | null
          ipi_number: string | null
          payment_method: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          legal_name: string
          stage_name?: string | null
          bio?: string | null
          photo_url?: string | null
          bandcamp_username?: string | null
          youtube_channel_id?: string | null
          pro_affiliation?: string | null
          ipi_number?: string | null
          payment_method?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          legal_name?: string
          stage_name?: string | null
          bio?: string | null
          photo_url?: string | null
          bandcamp_username?: string | null
          youtube_channel_id?: string | null
          pro_affiliation?: string | null
          ipi_number?: string | null
          payment_method?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artist_links: {
        Row: {
          id: string
          artist_id: string | null
          platform: string
          url: string
          label: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          platform: string
          url: string
          label?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          platform?: string
          url?: string
          label?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      supervisors: {
        Row: {
          id: string
          user_id: string | null
          company: string | null
          specialties: string[] | null
          verified: boolean
          tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          company?: string | null
          specialties?: string[] | null
          verified?: boolean
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company?: string | null
          specialties?: string[] | null
          verified?: boolean
          tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      agreements: {
        Row: {
          id: string
          artist_id: string | null
          admin_commission: number | null
          term_months: number | null
          start_date: string | null
          end_date: string | null
          docusign_envelope_id: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          admin_commission?: number | null
          term_months?: number | null
          start_date?: string | null
          end_date?: string | null
          docusign_envelope_id?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          admin_commission?: number | null
          term_months?: number | null
          start_date?: string | null
          end_date?: string | null
          docusign_envelope_id?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          artist_id: string | null
          title: string
          isrc: string | null
          iswc: string | null
          genre: string | null
          bpm: number | null
          key_signature: string | null
          energy_level: string | null
          mood_tags: string[] | null
          instrumentation: string[] | null
          ai_contribution: boolean
          owns_master: boolean
          owns_publishing: boolean
          status: string
          visibility: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          title: string
          isrc?: string | null
          iswc?: string | null
          genre?: string | null
          bpm?: number | null
          key_signature?: string | null
          energy_level?: string | null
          mood_tags?: string[] | null
          instrumentation?: string[] | null
          ai_contribution?: boolean
          owns_master?: boolean
          owns_publishing?: boolean
          status?: string
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          title?: string
          isrc?: string | null
          iswc?: string | null
          genre?: string | null
          bpm?: number | null
          key_signature?: string | null
          energy_level?: string | null
          mood_tags?: string[] | null
          instrumentation?: string[] | null
          ai_contribution?: boolean
          owns_master?: boolean
          owns_publishing?: boolean
          status?: string
          visibility?: string
          created_at?: string
          updated_at?: string
        }
      }
      track_writers: {
        Row: {
          id: string
          track_id: string | null
          writer_name: string
          pro_affiliation: string | null
          ipi_number: string | null
          writer_share: number | null
          publisher_share: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          writer_name: string
          pro_affiliation?: string | null
          ipi_number?: string | null
          writer_share?: number | null
          publisher_share?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          writer_name?: string
          pro_affiliation?: string | null
          ipi_number?: string | null
          writer_share?: number | null
          publisher_share?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      track_files: {
        Row: {
          id: string
          track_id: string | null
          file_type: string
          storage_url: string
          sample_rate: number | null
          bit_depth: number | null
          is_watermarked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          file_type: string
          storage_url: string
          sample_rate?: number | null
          bit_depth?: number | null
          is_watermarked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          file_type?: string
          storage_url?: string
          sample_rate?: number | null
          bit_depth?: number | null
          is_watermarked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          track_id: string | null
          registry: string
          status: string
          iswc_returned: string | null
          cwr_file_id: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          registry: string
          status?: string
          iswc_returned?: string | null
          cwr_file_id?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          registry?: string
          status?: string
          iswc_returned?: string | null
          cwr_file_id?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      briefs: {
        Row: {
          id: string
          supervisor_id: string | null
          project_name: string
          use_type: string | null
          mood_tags: string[] | null
          bpm_min: number | null
          bpm_max: number | null
          budget_min: number | null
          budget_max: number | null
          requester_email: string | null
          requester_company: string | null
          details: string | null
          budget_range: string | null
          deadline: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supervisor_id?: string | null
          project_name: string
          use_type?: string | null
          mood_tags?: string[] | null
          bpm_min?: number | null
          bpm_max?: number | null
          budget_min?: number | null
          budget_max?: number | null
          requester_email?: string | null
          requester_company?: string | null
          details?: string | null
          budget_range?: string | null
          deadline?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supervisor_id?: string | null
          project_name?: string
          use_type?: string | null
          mood_tags?: string[] | null
          bpm_min?: number | null
          bpm_max?: number | null
          budget_min?: number | null
          budget_max?: number | null
          requester_email?: string | null
          requester_company?: string | null
          details?: string | null
          budget_range?: string | null
          deadline?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          brief_id: string | null
          licensee_name: string
          sync_fee: number
          ncsound_cut: number
          artist_payout: number
          deal_date: string
          cue_sheet_filed: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brief_id?: string | null
          licensee_name: string
          sync_fee?: number
          ncsound_cut?: number
          artist_payout?: number
          deal_date?: string
          cue_sheet_filed?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brief_id?: string | null
          licensee_name?: string
          sync_fee?: number
          ncsound_cut?: number
          artist_payout?: number
          deal_date?: string
          cue_sheet_filed?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      deal_tracks: {
        Row: {
          id: string
          deal_id: string | null
          track_id: string | null
          music_use_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id?: string | null
          track_id?: string | null
          music_use_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string | null
          track_id?: string | null
          music_use_type?: string | null
          created_at?: string
        }
      }
      royalty_statements: {
        Row: {
          id: string
          artist_id: string | null
          deal_id: string | null
          gross_amount: number
          net_payout: number
          stripe_transfer_id: string | null
          pdf_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          deal_id?: string | null
          gross_amount: number
          net_payout: number
          stripe_transfer_id?: string | null
          pdf_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          deal_id?: string | null
          gross_amount?: number
          net_payout?: number
          stripe_transfer_id?: string | null
          pdf_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      beat_store_products: {
        Row: {
          id: string
          artist_id: string | null
          title: string
          lease_price: number | null
          exclusive_price: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          title: string
          lease_price?: number | null
          exclusive_price?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          title?: string
          lease_price?: number | null
          exclusive_price?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      beat_store_orders: {
        Row: {
          id: string
          product_id: string | null
          buyer_email: string
          license_type: string
          amount_paid: number
          stripe_payment_id: string | null
          license_pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          buyer_email: string
          license_type: string
          amount_paid: number
          stripe_payment_id?: string | null
          license_pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          buyer_email?: string
          license_type?: string
          amount_paid?: number
          stripe_payment_id?: string | null
          license_pdf_url?: string | null
          created_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          type: string
          first_name: string
          last_name: string | null
          email: string
          company: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          first_name: string
          last_name?: string | null
          email: string
          company?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          first_name?: string
          last_name?: string | null
          email?: string
          company?: string | null
          message?: string
          created_at?: string
        }
      }
      supervisor_access_requests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          company: string
          email: string
          links: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          company: string
          email: string
          links?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          company?: string
          email?: string
          links?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      saved_tracks: {
        Row: {
          id: string
          user_id: string | null
          track_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          track_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          track_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      license_requests: {
        Row: {
          id: string
          track_id: string | null
          requester_email: string
          requester_name: string | null
          company: string | null
          project_name: string | null
          use_type: string | null
          budget_range: string | null
          deadline: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          requester_email: string
          requester_name?: string | null
          company?: string | null
          project_name?: string | null
          use_type?: string | null
          budget_range?: string | null
          deadline?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          requester_email?: string
          requester_name?: string | null
          company?: string | null
          project_name?: string | null
          use_type?: string | null
          budget_range?: string | null
          deadline?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      track_plays: {
        Row: {
          id: string
          track_id: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
      integration_configs: {
        Row: {
          id: string
          platform: string
          config_key: string
          config_value: string
          artist_id: string | null
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          config_key: string
          config_value: string
          artist_id?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          config_key?: string
          config_value?: string
          artist_id?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      platform_income: {
        Row: {
          id: string
          track_id: string | null
          artist_id: string | null
          platform: string
          period_start: string
          period_end: string
          stream_count: number | null
          download_count: number | null
          gross_revenue: number | null
          net_revenue: number | null
          currency: string | null
          metadata: Json | null
          synced_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          artist_id?: string | null
          platform: string
          period_start: string
          period_end: string
          stream_count?: number | null
          download_count?: number | null
          gross_revenue?: number | null
          net_revenue?: number | null
          currency?: string | null
          metadata?: Json | null
          synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          artist_id?: string | null
          platform?: string
          period_start?: string
          period_end?: string
          stream_count?: number | null
          download_count?: number | null
          gross_revenue?: number | null
          net_revenue?: number | null
          currency?: string | null
          metadata?: Json | null
          synced_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      royalty_collections: {
        Row: {
          id: string
          artist_id: string | null
          collection_entity: string
          period_start: string
          period_end: string
          source_type: string | null
          gross_amount: number | null
          net_amount: number | null
          fee_amount: number | null
          currency: string | null
          statement_url: string | null
          statement_file_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          collection_entity: string
          period_start: string
          period_end: string
          source_type?: string | null
          gross_amount?: number | null
          net_amount?: number | null
          fee_amount?: number | null
          currency?: string | null
          statement_url?: string | null
          statement_file_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          collection_entity?: string
          period_start?: string
          period_end?: string
          source_type?: string | null
          gross_amount?: number | null
          net_amount?: number | null
          fee_amount?: number | null
          currency?: string | null
          statement_url?: string | null
          statement_file_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cwr_exports: {
        Row: {
          id: string
          export_type: string
          file_name: string | null
          file_url: string | null
          record_count: number | null
          status: string
          submitted_at: string | null
          response_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          export_type?: string
          file_name?: string | null
          file_url?: string | null
          record_count?: number | null
          status?: string
          submitted_at?: string | null
          response_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          export_type?: string
          file_name?: string | null
          file_url?: string | null
          record_count?: number | null
          status?: string
          submitted_at?: string | null
          response_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cwr_export_tracks: {
        Row: {
          id: string
          cwr_export_id: string | null
          track_id: string | null
          transaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          cwr_export_id?: string | null
          track_id?: string | null
          transaction_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          cwr_export_id?: string | null
          track_id?: string | null
          transaction_type?: string
          created_at?: string
        }
      }
      split_rules: {
        Row: {
          id: string
          track_id: string | null
          platform: string | null
          writer_name: string
          writer_share: number | null
          publisher_share: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          platform?: string | null
          writer_name: string
          writer_share?: number | null
          publisher_share?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          platform?: string | null
          writer_name?: string
          writer_share?: number | null
          publisher_share?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      track_analysis: {
        Row: {
          id: string
          track_id: string | null
          bpm: number | null
          key: string | null
          key_confidence: number | null
          energy: string | null
          energy_score: number | null
          mood_tags: string[] | null
          genre: string | null
          genre_confidence: number | null
          instrumentation: string[] | null
          analysis_model: string | null
          analyzed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          bpm?: number | null
          key?: string | null
          key_confidence?: number | null
          energy?: string | null
          energy_score?: number | null
          mood_tags?: string[] | null
          genre?: string | null
          genre_confidence?: number | null
          instrumentation?: string[] | null
          analysis_model?: string | null
          analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string | null
          bpm?: number | null
          key?: string | null
          key_confidence?: number | null
          energy?: string | null
          energy_score?: number | null
          mood_tags?: string[] | null
          genre?: string | null
          genre_confidence?: number | null
          instrumentation?: string[] | null
          analysis_model?: string | null
          analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      metadata_quality: {
        Row: {
          artist_id: string
          total_tracks: number | null
          fields_filled: Json | null
          overall_score: number | null
          calculated_at: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          total_tracks?: number | null
          fields_filled?: Json | null
          overall_score?: number | null
          calculated_at?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          total_tracks?: number | null
          fields_filled?: Json | null
          overall_score?: number | null
          calculated_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      income_summary: {
        Row: {
          artist_id: string | null
          source: string | null
          source_type: string | null
          period_start: string | null
          period_end: string | null
          gross_amount: number | null
          net_amount: number | null
          stream_count: number | null
          download_count: number | null
          track_id: string | null
          created_at: string | null
        }
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
