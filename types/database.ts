/**
 * Complete Database types for Supabase typed client.
 * One Row/Insert/Update per table.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          role?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          rich_description: string | null;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          sku: string | null;
          barcode: string | null;
          stock_quantity: number;
          low_stock_threshold: number | null;
          weight_grams: number | null;
          category_id: string | null;
          is_active: boolean;
          is_featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          rich_description?: string | null;
          price: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          sku?: string | null;
          barcode?: string | null;
          stock_quantity?: number;
          low_stock_threshold?: number | null;
          weight_grams?: number | null;
          category_id?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          rich_description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          sku?: string | null;
          barcode?: string | null;
          stock_quantity?: number;
          low_stock_threshold?: number | null;
          weight_grams?: number | null;
          category_id?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: {
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sku: string | null;
          price_adjustment: number;
          stock_quantity: number;
          attributes: Record<string, string>;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sku?: string | null;
          price_adjustment?: number;
          stock_quantity?: number;
          attributes?: Record<string, string>;
          is_active?: boolean;
        };
        Update: {
          product_id?: string;
          name?: string;
          sku?: string | null;
          price_adjustment?: number;
          stock_quantity?: number;
          attributes?: Record<string, string>;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          email: string;
          status: string;
          subtotal: number;
          tax: number;
          shipping: number;
          discount: number;
          total: number;
          shipping_address: Record<string, unknown> | null;
          billing_address: Record<string, unknown> | null;
          notes: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          email: string;
          status?: string;
          subtotal: number;
          tax?: number;
          shipping?: number;
          discount?: number;
          total: number;
          shipping_address?: Record<string, unknown> | null;
          billing_address?: Record<string, unknown> | null;
          notes?: string | null;
          stripe_payment_intent_id?: string | null;
        };
        Update: {
          order_number?: string;
          user_id?: string | null;
          email?: string;
          status?: string;
          subtotal?: number;
          tax?: number;
          shipping?: number;
          discount?: number;
          total?: number;
          shipping_address?: Record<string, unknown> | null;
          billing_address?: Record<string, unknown> | null;
          notes?: string | null;
          stripe_payment_intent_id?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          variant_name: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          variant_name?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: {
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          variant_name?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string | null;
          rich_content: string | null;
          seo_title: string | null;
          seo_description: string | null;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string | null;
          rich_content?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          is_published?: boolean;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string | null;
          rich_content?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          is_published?: boolean;
          published_at?: string | null;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          rich_content: string | null;
          cover_image_url: string | null;
          author_id: string | null;
          is_published: boolean;
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          rich_content?: string | null;
          cover_image_url?: string | null;
          author_id?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          tags?: string[];
        };
        Update: {
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string | null;
          rich_content?: string | null;
          cover_image_url?: string | null;
          author_id?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          tags?: string[];
        };
        Relationships: [];
      };
      booking_services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      booking_availability: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
        };
        Update: {
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          service_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          service_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: string;
          notes?: string | null;
        };
        Update: {
          user_id?: string | null;
          service_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "booking_services";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: unknown;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: unknown;
          updated_at?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          filename: string;
          original_filename: string;
          mime_type: string;
          size_bytes: number;
          url: string;
          alt_text: string | null;
          folder: string;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          original_filename: string;
          mime_type: string;
          size_bytes: number;
          url: string;
          alt_text?: string | null;
          folder?: string;
          uploaded_by?: string | null;
        };
        Update: {
          filename?: string;
          original_filename?: string;
          mime_type?: string;
          size_bytes?: number;
          url?: string;
          alt_text?: string | null;
          folder?: string;
          uploaded_by?: string | null;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Exported convenience types
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingService = Database["public"]["Tables"]["booking_services"]["Row"];
export type BookingAvailability = Database["public"]["Tables"]["booking_availability"]["Row"];
export type Media = Database["public"]["Tables"]["media"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
