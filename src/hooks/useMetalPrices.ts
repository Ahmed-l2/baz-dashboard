import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSupabaseWithClerk } from '../lib/supabase';

export type MetalPrice = {
  id: string;
  metal_name: string;
  price: number;
  unit: string;
  last_updated: string;
  created_at: string;
};

export const useMetalPrices = () => {
  const supabase = useSupabaseWithClerk();

  return useQuery({
    queryKey: ['metal-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metal_prices')
        .select('*')
        .order('metal_name');

      if (error) throw error;
      return data as MetalPrice[];
    },
  });
};

export const useCreateMetalPrice = () => {
  const supabase = useSupabaseWithClerk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { metal_name: string; price: number; unit: string }) => {
      const { error } = await supabase
        .from('metal_prices')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metal-prices'] });
      toast.success('Metal price created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateMetalPrice = () => {
  const supabase = useSupabaseWithClerk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; metal_name?: string; price?: number; unit?: string }) => {
      const { error } = await supabase
        .from('metal_prices')
        .update({ ...data, last_updated: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metal-prices'] });
      toast.success('Metal price updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteMetalPrice = () => {
  const supabase = useSupabaseWithClerk();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('metal_prices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metal-prices'] });
      toast.success('Metal price deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
