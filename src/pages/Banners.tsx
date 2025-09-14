import { useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '../hooks/useBanners';
import { useForm } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader } from '../components/loader';
import i18n from '../i18n';

interface BannerForm {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
}

export default function Banners() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const { data: banners, isLoading } = useBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BannerForm>();

  const onSubmit = async (data: BannerForm) => {
    try {
      const payload = {
        title: data.title || undefined,
        subtitle: data.subtitle || undefined,
        image_url: data.image_url || undefined,
        link_url: data.link_url || undefined,
      };

      if (editingBanner) {
        await updateMutation.mutateAsync({
          id: editingBanner.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openModal = (banner?: any) => {
    setEditingBanner(banner || null);
    if (banner) {
      reset({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image_url: banner.image_url || '',
        link_url: banner.link_url || '',
      });
    } else {
      reset({
        title: '',
        subtitle: '',
        image_url: '',
        link_url: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }
const isRTL = i18n.language === 'ar';
  return (
    <div className="lg:pl-64 "  dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
                Homepage Banners
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage promotional banners that appear on the mobile app homepage
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openModal()}
              >
                Add Banner
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead>Banner</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="relative"><span className="sr-only">Actions</span></TableHead>
            </TableHeader>
            <TableBody>
              {banners?.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    {banner.image_url ? (
                      <img 
                        src={banner.image_url} 
                        alt={banner.title || 'Banner'}
                        className="h-16 w-24 rounded object-cover"
                      />
                    ) : (
                      <div className="h-16 w-24 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{banner.title || 'No title'}</div>
                      <div className="text-gray-500 text-sm">{banner.subtitle}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {banner.link_url ? (
                      <a 
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 truncate block max-w-xs"
                      >
                        {banner.link_url}
                      </a>
                    ) : (
                      'No link'
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="h-4 w-4" />}
                      onClick={() => openModal(banner)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDelete(banner.id)}
                      loading={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {banners?.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No banners</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first homepage banner.
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>Add Banner</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBanner ? 'Edit Banner' : 'Add Banner'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="Banner title"
          />
          
          <Input
            label="Subtitle"
            {...register('subtitle')}
            error={errors.subtitle?.message}
            placeholder="Banner subtitle"
          />
          
          <Input
            label="Image URL"
            {...register('image_url')}
            error={errors.image_url?.message}
            placeholder="https://example.com/banner.jpg"
            helperText="Enter a valid image URL or upload to Supabase storage"
          />
          
          <Input
            label="Link URL"
            {...register('link_url')}
            error={errors.link_url?.message}
            placeholder="https://example.com/page"
            helperText="Where users will navigate when tapping the banner"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingBanner ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}