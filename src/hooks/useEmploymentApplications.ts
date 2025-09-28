import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSupabase } from '../lib/supabase';

export type EmploymentApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  field_of_work: string;
  created_at: string;
};

export const useEmploymentApplications = () => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['employment_applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employment_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmploymentApplication[];
    },
  });
};

export const useDeleteEmploymentApplication = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employment_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment_applications'] });
      toast.success('Application deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Optional: If you want to add functionality to create applications from the admin panel
export const useCreateEmploymentApplication = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      full_name: string; 
      email: string; 
      phone: string; 
      field_of_work: string 
    }) => {
      const { error } = await supabase
        .from('employment_applications')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment_applications'] });
      toast.success('Application created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Optional: If you want to update applications (though this might not be common)
export const useUpdateEmploymentApplication = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { 
      id: string; 
      full_name?: string; 
      email?: string; 
      phone?: string; 
      field_of_work?: string 
    }) => {
      const { error } = await supabase
        .from('employment_applications')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment_applications'] });
      toast.success('Application updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};