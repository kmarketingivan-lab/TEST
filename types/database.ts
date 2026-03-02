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
          brand_id: string | null;
          specifications: Record<string, unknown>;
          regulatory_info: string | null;
          weight_class: string | null;
          product_type: string;
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
          brand_id?: string | null;
          specifications?: Record<string, unknown>;
          regulatory_info?: string | null;
          weight_class?: string | null;
          product_type?: string;
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
          brand_id?: string | null;
          specifications?: Record<string, unknown>;
          regulatory_info?: string | null;
          weight_class?: string | null;
          product_type?: string;
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
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            referencedRelation: "brands";
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
          coupon_id: string | null;
          coupon_code: string | null;
          coupon_discount: number;
          invoice_number: string | null;
          requires_pickup: boolean;
          pickup_document_type: string | null;
          pickup_document_number: string | null;
          pickup_document_verified: boolean;
          pickup_notes: string | null;
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
          coupon_id?: string | null;
          coupon_code?: string | null;
          coupon_discount?: number;
          invoice_number?: string | null;
          requires_pickup?: boolean;
          pickup_document_type?: string | null;
          pickup_document_number?: string | null;
          pickup_document_verified?: boolean;
          pickup_notes?: string | null;
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
          coupon_id?: string | null;
          coupon_code?: string | null;
          coupon_discount?: number;
          invoice_number?: string | null;
          requires_pickup?: boolean;
          pickup_document_type?: string | null;
          pickup_document_number?: string | null;
          pickup_document_verified?: boolean;
          pickup_notes?: string | null;
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
          views_count: number;
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
          views_count?: number;
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
          views_count?: number;
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
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          author_name: string;
          rating: number;
          title: string | null;
          body: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          author_name: string;
          rating: number;
          title?: string | null;
          body?: string | null;
          is_approved?: boolean;
        };
        Update: {
          product_id?: string;
          user_id?: string | null;
          author_name?: string;
          rating?: number;
          title?: string | null;
          body?: string | null;
          is_approved?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
        };
        Update: {
          user_id?: string;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          min_order_amount: number;
          max_uses: number | null;
          current_uses: number;
          starts_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          min_order_amount?: number;
          max_uses?: number | null;
          current_uses?: number;
          starts_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          code?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          min_order_amount?: number;
          max_uses?: number | null;
          current_uses?: number;
          starts_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string | null;
          street: string;
          city: string;
          province: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          full_name: string;
          phone?: string | null;
          street: string;
          city: string;
          province: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
        };
        Update: {
          user_id?: string;
          label?: string;
          full_name?: string;
          phone?: string | null;
          street?: string;
          city?: string;
          province?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_active: boolean;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          is_active?: boolean;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          is_active?: boolean;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          slug?: string;
          logo_url?: string | null;
          website_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      shipping_zones: {
        Row: {
          id: string;
          name: string;
          countries: string[];
          min_order_free_shipping: number | null;
          flat_rate: number;
          per_kg_rate: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          countries?: string[];
          min_order_free_shipping?: number | null;
          flat_rate: number;
          per_kg_rate?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          countries?: string[];
          min_order_free_shipping?: number | null;
          flat_rate?: number;
          per_kg_rate?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      shipping_rules: {
        Row: {
          id: string;
          zone_id: string;
          min_weight_grams: number;
          max_weight_grams: number | null;
          price: number;
        };
        Insert: {
          id?: string;
          zone_id: string;
          min_weight_grams?: number;
          max_weight_grams?: number | null;
          price: number;
        };
        Update: {
          zone_id?: string;
          min_weight_grams?: number;
          max_weight_grams?: number | null;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "shipping_rules_zone_id_fkey";
            columns: ["zone_id"];
            referencedRelation: "shipping_zones";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_stock: {
        Args: { p_product_id: string; p_quantity: number };
        Returns: boolean;
      };
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      increment_blog_views: {
        Args: { p_post_id: string };
        Returns: undefined;
      };
      validate_and_apply_coupon: {
        Args: { p_code: string; p_order_amount: number };
        Returns: Record<string, unknown>;
      };
      generate_invoice_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      create_order_atomic: {
        Args: { p_params: Record<string, unknown> };
        Returns: Record<string, unknown>;
      };
    };
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
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Wishlist = Database["public"]["Tables"]["wishlists"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type NewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type ShippingZone = Database["public"]["Tables"]["shipping_zones"]["Row"];
export type ShippingRule = Database["public"]["Tables"]["shipping_rules"]["Row"];
