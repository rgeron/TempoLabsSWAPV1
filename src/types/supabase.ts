export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      decks: {
        Row: {
          cardcount: number
          categories: string[] | null
          cover_image_url: string | null
          created_at: string
          creator_avatar: string | null
          creatorid: string
          description: string
          difficulty: string
          flashcards_file_url: string | null
          id: string
          imageurl: string
          price: number
          purchase_history: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          cardcount: number
          categories?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          creator_avatar?: string | null
          creatorid: string
          description: string
          difficulty: string
          flashcards_file_url?: string | null
          id?: string
          imageurl: string
          price: number
          purchase_history?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          cardcount?: number
          categories?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          creator_avatar?: string | null
          creatorid?: string
          description?: string
          difficulty?: string
          flashcards_file_url?: string | null
          id?: string
          imageurl?: string
          price?: number
          purchase_history?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_creator"
            columns: ["creatorid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education_level_categories: {
        Row: {
          category_key: string
          display_order: number
        }
        Insert: {
          category_key: string
          display_order: number
        }
        Update: {
          category_key?: string
          display_order?: number
        }
        Relationships: []
      }
      education_level_mappings: {
        Row: {
          category_key: string | null
          country_code: string | null
          education_level_id: number | null
          id: number
        }
        Insert: {
          category_key?: string | null
          country_code?: string | null
          education_level_id?: number | null
          id?: number
        }
        Update: {
          category_key?: string | null
          country_code?: string | null
          education_level_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "education_level_mappings_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "education_level_categories"
            referencedColumns: ["category_key"]
          },
          {
            foreignKeyName: "education_level_mappings_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "education_systems"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "education_level_mappings_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      education_levels: {
        Row: {
          country_code: string | null
          display_order: number
          id: number
          level_name: string
          level_name_localized: string
        }
        Insert: {
          country_code?: string | null
          display_order: number
          id?: number
          level_name: string
          level_name_localized: string
        }
        Update: {
          country_code?: string | null
          display_order?: number
          id?: number
          level_name?: string
          level_name_localized?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_levels_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "education_systems"
            referencedColumns: ["country_code"]
          },
        ]
      }
      education_systems: {
        Row: {
          country_code: string
          country_name: string
          system_name: string
        }
        Insert: {
          country_code: string
          country_name: string
          system_name: string
        }
        Update: {
          country_code?: string
          country_name?: string
          system_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          class: string | null
          country: string | null
          created_at: string
          education_level_id: number | null
          followedcreators: string[] | null
          followers: string[] | null
          id: string
          likeddeckids: string[] | null
          phone_number: string | null
          preferred_categories: string[] | null
          purchaseddeckids: string[] | null
          purchaseinfo: Json[] | null
          stripe_connect_id: string | null
          stripe_connect_status: string | null
          total_earnings: number | null
          total_sales: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          class?: string | null
          country?: string | null
          created_at?: string
          education_level_id?: number | null
          followedcreators?: string[] | null
          followers?: string[] | null
          id: string
          likeddeckids?: string[] | null
          phone_number?: string | null
          preferred_categories?: string[] | null
          purchaseddeckids?: string[] | null
          purchaseinfo?: Json[] | null
          stripe_connect_id?: string | null
          stripe_connect_status?: string | null
          total_earnings?: number | null
          total_sales?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          class?: string | null
          country?: string | null
          created_at?: string
          education_level_id?: number | null
          followedcreators?: string[] | null
          followers?: string[] | null
          id?: string
          likeddeckids?: string[] | null
          phone_number?: string | null
          preferred_categories?: string[] | null
          purchaseddeckids?: string[] | null
          purchaseinfo?: Json[] | null
          stripe_connect_id?: string | null
          stripe_connect_status?: string | null
          total_earnings?: number | null
          total_sales?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_purchase_record: {
        Args: {
          p_deck_id: string
          p_buyer_id: string
          p_amount: number
        }
        Returns: undefined
      }
      create_new_profile: {
        Args: {
          user_id: string
          user_username: string
        }
        Returns: undefined
      }
      create_profile: {
        Args: {
          user_id: string
          user_username: string
        }
        Returns: undefined
      }
      increment_balance: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: undefined
      }
      process_deck_purchase: {
        Args: {
          p_buyer_id: string
          p_deck_id: string
          p_amount: number
          p_purchase_date: string
        }
        Returns: undefined
      }
      update_profile: {
        Args: {
          user_id: string
          new_username: string
          new_avatar_url: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
