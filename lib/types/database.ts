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
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: "user" | "business_owner" | "community_admin" | "super_admin"
          community_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: "user" | "business_owner" | "community_admin" | "super_admin"
          community_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: "user" | "business_owner" | "community_admin" | "super_admin"
          community_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          city: string | null
          state: string | null
          country: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          city?: string | null
          state?: string | null
          country?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          city?: string | null
          state?: string | null
          country?: string
          is_active?: boolean
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          sort_order?: number
        }
        Update: {
          name?: string
          slug?: string
          icon?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          community_id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          logo_url: string | null
          cover_url: string | null
          phone: string | null
          whatsapp: string | null
          email: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          status: "pending" | "active" | "suspended"
          is_featured: boolean
          suspension_reason: string | null
          suspended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          community_id: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          logo_url?: string | null
          cover_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: "pending" | "active" | "suspended"
          is_featured?: boolean
          suspension_reason?: string | null
          suspended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          owner_id?: string
          community_id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          logo_url?: string | null
          cover_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: "pending" | "active" | "suspended"
          is_featured?: boolean
          suspension_reason?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          id: string
          business_id: string
          day_of_week: number
          open_time: string | null
          close_time: string | null
          is_closed: boolean
        }
        Insert: {
          id?: string
          business_id: string
          day_of_week: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
        }
        Update: {
          business_id?: string
          day_of_week?: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      products_services: {
        Row: {
          id: string
          business_id: string
          type: "product" | "service"
          name: string
          description: string | null
          price: number | null
          price_type: "fixed" | "starting_at" | "per_hour" | "quote"
          image_url: string | null
          is_available: boolean
          is_bookable: boolean
          stock: number | null
          duration_minutes: number | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          type: "product" | "service"
          name: string
          description?: string | null
          price?: number | null
          price_type?: "fixed" | "starting_at" | "per_hour" | "quote"
          image_url?: string | null
          is_available?: boolean
          is_bookable?: boolean
          stock?: number | null
          duration_minutes?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          type?: "product" | "service"
          name?: string
          description?: string | null
          price?: number | null
          price_type?: "fixed" | "starting_at" | "per_hour" | "quote"
          image_url?: string | null
          is_available?: boolean
          is_bookable?: boolean
          stock?: number | null
          duration_minutes?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          business_id: string
          product_service_id: string
          status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
          booking_date: string
          booking_time: string | null
          quantity: number
          notes: string | null
          cancellation_reason: string | null
          confirmed_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          product_service_id: string
          status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
          booking_date: string
          booking_time?: string | null
          quantity?: number
          notes?: string | null
          cancellation_reason?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
        Update: {
          status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
          booking_date?: string
          booking_time?: string | null
          quantity?: number
          notes?: string | null
          cancellation_reason?: string | null
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_product_service_id_fkey"
            columns: ["product_service_id"]
            isOneToOne: false
            referencedRelation: "products_services"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string | null
          image_url: string | null
          discount_type: "percentage" | "fixed" | "bogo" | "freeform" | null
          discount_value: number | null
          starts_at: string | null
          ends_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          description?: string | null
          image_url?: string | null
          discount_type?: "percentage" | "fixed" | "bogo" | "freeform" | null
          discount_value?: number | null
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          image_url?: string | null
          discount_type?: "percentage" | "fixed" | "bogo" | "freeform" | null
          discount_value?: number | null
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          business_id: string
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string
          sender_id: string
          business_id: string
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          content?: string
          is_read?: boolean
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          business_id: string
          booking_id: string | null
          rating: number
          comment: string
          owner_reply: string | null
          owner_replied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          booking_id?: string | null
          rating: number
          comment: string
          owner_reply?: string | null
          owner_replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          booking_id?: string | null
          rating?: number
          comment?: string
          owner_reply?: string | null
          owner_replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          business_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          business_id: string
          visitor_id: string | null
          viewed_at: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          visitor_id?: string | null
          viewed_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          business_id?: string
          visitor_id?: string | null
          viewed_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_business_owner: {
        Args: { b_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Community = Database["public"]["Tables"]["communities"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Business = Database["public"]["Tables"]["businesses"]["Row"]
export type BusinessHours = Database["public"]["Tables"]["business_hours"]["Row"]
export type ProductService = Database["public"]["Tables"]["products_services"]["Row"]
export type Booking = Database["public"]["Tables"]["bookings"]["Row"]
export type Promotion = Database["public"]["Tables"]["promotions"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"]
export type ProfileView = Database["public"]["Tables"]["profile_views"]["Row"]
