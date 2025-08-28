import { useState } from 'react';
import { Plus, Edit, Trash2, Activity } from 'lucide-react';
import { useMetalPrices, useCreateMetalPrice, useUpdateMetalPrice, useDeleteMetalPrice } from '../hooks/useMetalPrices';
import { useForm } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { format } from 'date-fns';

interface MetalPriceForm {
  metal_name: string;
  price: number;
  unit: string;
}

export default function MetalPrices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);

  const { data: metalPrices, isLoading } = useMetalPrices();
  const createMutation = useCreateMetalPrice();
  const updateMutation = useUpdateMetalPrice();
  const deleteMutation = useDeleteMetalPrice();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MetalPriceForm>();

  const onSubmit = async (data: MetalPriceForm) => {
    try {
      if (editingPrice) {
        await updateMutation.mutateAsync({
          id: editingPrice.id,
          ...data,
          price: Number(data.price),
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          price: Number(data.price),
        });
      }
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openModal = (price?: any) => {
    setEditingPrice(price || null);
    if (price) {
      reset(price);
    } else {
      reset({
        metal_name: '',
        price: 0,
        unit: 'oz',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrice(null);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this metal price?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="lg:pl-64">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-64">
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Metal Prices
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage live metal pricing that appears in the mobile app ticker
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openModal()}
              >
                Add Metal Price
              </Button>
            </div>
          </div>

          {/* Ticker Preview */}
          {metalPrices && metalPrices.length > 0 && (
            <div className="mt-8 bg-gray-900 rounded-lg p-4 overflow-hidden">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Ticker Preview</h3>
              <div className="flex animate-marquee space-x-6">
                {metalPrices.map((price) => (
                  <div key={price.id} className="flex items-center space-x-2 text-white whitespace-nowrap">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="font-medium">{price.metal_name}</span>
                    <span className="text-green-400 font-semibold">
                      ${price.price.toFixed(2)}/{price.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableHead>Metal Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="relative"><span className="sr-only">Actions</span></TableHead>
            </TableHeader>
            <TableBody>
              {metalPrices?.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">{price.metal_name}</TableCell>
                  <TableCell>${price.price.toFixed(2)}</TableCell>
                  <TableCell>{price.unit}</TableCell>
                  <TableCell>{format(new Date(price.last_updated), 'MMM d, yyyy HH:mm')}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="h-4 w-4" />}
                      onClick={() => openModal(price)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDelete(price.id)}
                      loading={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {metalPrices?.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No metal prices</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first metal price.
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>Add Metal Price</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPrice ? 'Edit Metal Price' : 'Add Metal Price'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Metal Name"
            {...register('metal_name', { required: 'Metal name is required' })}
            error={errors.metal_name?.message}
            placeholder="e.g., Gold, Silver, Copper"
          />
          
          <Input
            label="Price"
            type="number"
            step="0.01"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            error={errors.price?.message}
            placeholder="0.00"
          />
          
          <Input
            label="Unit"
            {...register('unit', { required: 'Unit is required' })}
            error={errors.unit?.message}
            placeholder="e.g., oz, lb, kg"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPrice ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}