import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/clerk-react'; // or '@clerk/nextjs' if in Next.js

export function useSupabaseWithClerk() {
  const { session } = useSession();

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // since Clerk manages auth
      },
      global: {
        fetch: async (url, options) => {
          const token = await session?.getToken({ template: 'supabase' });
          const headers = new Headers(options?.headers);
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return fetch(url, { ...options, headers });
        },
      },
    }
  );

  return supabase;
}


export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          price: number | null;
          image_url: string | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price?: number | null;
          image_url?: string | null;
          category_id?: string | null;
        };
        Update: {
          name?: string;
          price?: number | null;
          image_url?: string | null;
          category_id?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      banners: {
        Row: {
          id: string;
          title: string | null;
          subtitle: string | null;
          image_url: string | null;
          link_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          link_url?: string | null;
        };
        Update: {
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          link_url?: string | null;
        };
      };
      metal_prices: {
        Row: {
          id: string;
          metal_name: string;
          price: number;
          unit: string;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          metal_name: string;
          price: number;
          unit: string;
        };
        Update: {
          metal_name?: string;
          price?: number;
          unit?: string;
        };
      };
      quote_requests: {
        Row: {
          id: string;
          user_id: string | null;
          status: string | null;
          created_at: string;
          submitted_at: string | null;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: string | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
        };
        Update: {
          status?: string | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
        };
      };
      quote_items: {
        Row: {
          id: string;
          quote_request_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number | null;
          total_price: number | null;
          dimensions: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      quote_responses: {
        Row: {
          id: string;
          quote_request_id: string;
          total_amount: number | null;
          validity_period: number | null;
          notes: string | null;
          pdf_url: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          quote_request_id: string;
          total_amount?: number | null;
          validity_period?: number | null;
          notes?: string | null;
          pdf_url?: string | null;
        };
        Update: {
          total_amount?: number | null;
          validity_period?: number | null;
          notes?: string | null;
          pdf_url?: string | null;
        };
      };
    };
  };
};
