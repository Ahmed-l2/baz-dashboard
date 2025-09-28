import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSupabase } from '../lib/supabase';

export type Banner = {
  url: string | undefined;
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  created_at: string;
  updated_at: string;
};

export const useBanners = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Banner[];
    },
  });
};

export const useCreateBanner = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title?: string; subtitle?: string; image_url?: string; link_url?: string }) => {
      const { error } = await supabase
        .from('banners')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateBanner = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; subtitle?: string; image_url?: string; link_url?: string }) => {
      const { error } = await supabase
        .from('banners')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteBanner = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
