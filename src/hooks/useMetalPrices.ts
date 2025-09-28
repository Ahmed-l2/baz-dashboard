import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSupabase } from '../lib/supabase';

export type MetalPrice = {
  id: string;
  type: string;
  price: number;
  change: number;
  unit: string;
  created_at: string;
};

export const useMetalPrices = () => {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['metal-prices'],
    queryFn: async () => {
      console.log('Fetching metal prices...');
      
      const { data, error } = await supabase
        .from('metal_prices')
        .select('*')
        .order('type');

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Metal prices fetched successfully:', data);
      return data as MetalPrice[];
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateMetalPrice = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { type: string; price: number; change: number; unit: string }) => {
      console.log('Creating metal price:', data);
      
      const { error } = await supabase
        .from('metal_prices')
        .insert([data]);

      if (error) {
        console.error('Create error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metal-prices'] });
      toast.success('Metal price created successfully');
    },
    onError: (error) => {
      console.error('Create mutation error:', error);
      toast.error(error.message);
    },
  });
};

export const useUpdateMetalPrice = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; type?: string; price?: number; change?: number; unit?: string }) => {
      console.log('Updating metal price:', { id, data });
      
      const { error } = await supabase
        .from('metal_prices')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metal-prices'] });
      toast.success('Metal price updated successfully');
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast.error(error.message);
    },
  });
};

export const useDeleteMetalPrice = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting metal price:', id);
      
      const { error } = await supabase
        .from('metal_prices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metal-prices'] });
      toast.success('Metal price deleted successfully');
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast.error(error.message);
    },
  });
};