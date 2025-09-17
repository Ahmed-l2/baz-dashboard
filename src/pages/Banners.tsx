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
import { useTranslation } from 'react-i18next';

interface BannerForm {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
}

export default function Banners() {
  const { t } = useTranslation();
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
    if (window.confirm(t('banners.deleteConfirm'))) {
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
    <div className={` ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
                {t('banners.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                {t('banners.description')}
              </p>
            </div>
            <div className={`mt-4 sm:mt-0 sm:flex-none ${isRTL ? 'sm:mr-16' : 'sm:ml-16'}`}>
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openModal()}
              >
                {t('banners.addButton')}
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead className='text-left rtl:text-right'>{t('banners.table.banner')}</TableHead>
              <TableHead className='text-left rtl:text-right'>{t('banners.table.title')}</TableHead>
              <TableHead className='text-left rtl:text-right'>{t('banners.table.link')}</TableHead>
              <TableHead className='text-left rtl:text-right' className="relative"><span className="sr-only">{t('common.actions')}</span></TableHead>
            </TableHeader>
            <TableBody>
              {banners?.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    {banner.image_url ? (
                      <img 
                        src={banner.image_url} 
                        alt={banner.title || t('banners.table.bannerAlt')}
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
                      <div className="font-medium text-gray-900">{banner.title || t('banners.table.noTitle')}</div>
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
                      t('banners.table.noLink')
                    )}
                  </TableCell>
                  <TableCell className={`space-x-2 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="h-4 w-4" />}
                      onClick={() => openModal(banner)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDelete(banner.id)}
                      loading={deleteMutation.isPending}
                    >
                      {t('common.delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {banners?.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('banners.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('banners.empty.description')}
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>{t('banners.addButton')}</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBanner ? t('banners.modal.editTitle') : t('banners.modal.addTitle')}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('banners.form.title.label')}
            {...register('title')}
            error={errors.title?.message}
            placeholder={t('banners.form.title.placeholder')}
          />
          
          <Input
            label={t('banners.form.subtitle.label')}
            {...register('subtitle')}
            error={errors.subtitle?.message}
            placeholder={t('banners.form.subtitle.placeholder')}
          />
          
          <Input
            label={t('banners.form.imageUrl.label')}
            {...register('image_url')}
            error={errors.image_url?.message}
            placeholder={t('banners.form.imageUrl.placeholder')}
            helperText={t('banners.form.imageUrl.helperText')}
          />
          
          <Input
            label={t('banners.form.linkUrl.label')}
            {...register('link_url')}
            error={errors.link_url?.message}
            placeholder={t('banners.form.linkUrl.placeholder')}
            helperText={t('banners.form.linkUrl.helperText')}
          />
          
          <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Button variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingBanner ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}