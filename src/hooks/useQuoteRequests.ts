import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSupabase } from '../lib/supabase';

export type QuoteRequest = {
  id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_company: string | null;
  project_name: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
  submitted_at: string | null;
  quoted_at: string | null;
  updated_at: string | null;
  quote_items?: QuoteItem[];
  quote_response?: QuoteResponse;
};


export type QuoteItem = {
  id: string;
  quote_request_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  requested_specs: Record<string, any> | null; // JSON object for dynamic specs
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    type: string[] | null;
    image_url: string;
    category_id: string | null;
    product_specs?: Array<{
      id: string;
      spec_name: string;
      unit: string;
      min_value: number | null;
      max_value: number | null;
      notes: string | null;
    }>;
  };
};

export type QuoteResponse = {
  id: string;
  quote_request_id: string;
  total_amount: number | null;
  validity_period: number | null;
  expires_at: string | null;
  response_notes: string | null;
  terms_and_conditions: string | null;
  responded_by: string | null;
  created_at: string;
};

export const useQuoteRequests = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['quote-requests-new'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          quote_items (
            *,
            product:products (
              id,
              name,
              type,
              image_url,
              category_id,
              product_specs (
                id,
                spec_name,
                unit,
                min_value,
                max_value,
                notes
              )
            )
          ),
          quote_response:quote_responses (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as QuoteRequest[];
    },
  });
};

export const useCreateQuoteResponse = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (data: {
      quote_request_id: string;
      total_amount: number;
      validity_period: number;
      response_notes?: string;
      terms_and_conditions?: string;
      responded_by?: string;
      item_prices?: Array<{
        quote_item_id: string;
        unit_price: number;
        total_price: number;
        response_notes?: string;
      }>;
    }) => {
      // Update quote items with pricing information directly
      if (data.item_prices && data.item_prices.length > 0) {
        for (const item of data.item_prices) {
          const { error } = await supabase
            .from('quote_items')
            .update({
              unit_price: item.unit_price,
              total_price: item.total_price,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.quote_item_id);

          if (error) throw error;
        }
      }

      // Create the quote response (expires_at will be calculated by trigger)
      const { data: responseData, error: responseError } = await supabase
        .from('quote_responses')
        .insert([{
          quote_request_id: data.quote_request_id,
          total_amount: data.total_amount,
          validity_period: data.validity_period,
          response_notes: data.response_notes,
          terms_and_conditions: data.terms_and_conditions,
          responded_by: data.responded_by || 'admin'
        }])
        .select()
        .single();

      if (responseError) throw responseError;

      // Update quote request status
      await supabase
        .from('quote_requests')
        .update({
          status: 'quoted',
          quoted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.quote_request_id);

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests-new'] });
      toast.success('Quote response created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateQuoteRequest = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id?: string;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      customer_company?: string;
      project_name?: string;
      notes?: string;
      quote_items: Array<{
        product_id: string;
        quantity: number;
        requested_specs?: Record<string, any>;
        notes?: string;
      }>;
    }) => {
      // Create the quote request
      const { data: requestData, error: requestError } = await supabase
        .from('quote_requests')
        .insert([{
          user_id: data.user_id,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_company: data.customer_company,
          project_name: data.project_name,
          notes: data.notes,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (requestError) throw requestError;

      // Create quote items
      if (data.quote_items && data.quote_items.length > 0) {
        const quoteItems = data.quote_items.map(item => ({
          quote_request_id: requestData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          requested_specs: item.requested_specs ? JSON.stringify(item.requested_specs) : null,
          notes: item.notes
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(quoteItems);

        if (itemsError) throw itemsError;
      }

      return requestData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests-new'] });
      toast.success('Quote request created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create quote request: ${error.message}`);
    },
  });
};

export const useUpdateQuoteItemPrice = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, unit_price, total_price }: { id: string; unit_price: number; total_price: number }) => {
      const { error } = await supabase
        .from('quote_items')
        .update({ unit_price, total_price, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests-new'] });
      toast.success('Quote item updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
