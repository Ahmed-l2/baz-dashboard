import { useState } from 'react';
import { Plus, Edit, Trash2, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useForm } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import ProductSpecsManager from '../components/ProductSpecsManager';
import CategorySelector from '../components/CategorySelector';
import SpecificationsDisplay from '../components/SpecificationsDisplay';

interface ProductSpec {
  spec_name: string;
  unit: string;
  min_value?: number;
  max_value?: number;
  notes?: string;
}

interface ProductForm {
  name: string;
  type: string;
  category_id: string;
  image_url: string;
  specs: ProductSpec[];
}

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [currentSpecs, setCurrentSpecs] = useState<ProductSpec[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>();

  const onSubmit = async (data: ProductForm) => {
    try {
      const payload = {
        name: data.name,
        type: data.type && data.type.trim() ? data.type.split(',').map(t => t.trim()).filter(t => t.length > 0) : undefined,
        category_id: currentCategoryId || undefined,
        image_url: data.image_url || undefined,
        specs: currentSpecs.filter(spec => spec.spec_name && spec.unit),
      };

      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
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

  const openModal = (product?: any) => {
    setEditingProduct(product || null);
    if (product) {
      reset({
        name: product.name,
        type: Array.isArray(product.type) ? product.type.join(', ') : (product.type || ''),
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        specs: []
      });
      setCurrentCategoryId(product.category_id || '');
      setCurrentSpecs(product.product_specs || []);
    } else {
      reset({
        name: '',
        type: '',
        category_id: '',
        image_url: '',
        specs: []
      });
      setCurrentCategoryId('');
      setCurrentSpecs([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setCurrentSpecs([]);
    setCurrentCategoryId('');
    reset();
  };

  const toggleRow = (productId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
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
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
                Products
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage your product catalog with categories and pricing
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openModal()}
              >
                Add Product
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Specifications</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="relative"><span className="sr-only">Actions</span></TableHead>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <>
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                      {product.type && Array.isArray(product.type) && product.type.length ? (
                        <div className="flex flex-wrap gap-1">
                          {product.type.map((type, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No types</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.product_specs?.length ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {product.product_specs.length} specification{product.product_specs.length !== 1 ? 's' : ''}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={expandedRows.has(product.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            onClick={() => toggleRow(product.id)}
                          >
                            {expandedRows.has(product.id) ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-500">No specs</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => openModal(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(product.id)}
                        loading={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(product.id) && product.product_specs?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50 border-t-0">
                        <div className="py-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Product Specifications</h4>
                          <SpecificationsDisplay specs={product.product_specs} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>

          {products?.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first product.
              </p>
              <div className="mt-6">
                <Button onClick={() => openModal()}>Add Product</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Product Name"
            {...register('name', { required: 'Product name is required' })}
            error={errors.name?.message}
            placeholder="Enter product name"
          />

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Product Types"
              {...register('type')}
              error={errors.type?.message}
              placeholder="e.g. Hot Rolled, Cold Rolled, Galvanized Steel (comma separated)"
              helperText="Enter multiple types separated by commas"
            />

            <CategorySelector
              categories={categories || []}
              selectedCategoryId={currentCategoryId}
              onCategoryChange={setCurrentCategoryId}
            />
          </div>

          <Input
            label="Image URL"
            {...register('image_url')}
            error={errors.image_url?.message}
            placeholder="https://example.com/image.jpg"
            helperText="Enter a valid image URL or upload to Supabase storage"
          />

          <ProductSpecsManager
            specs={currentSpecs}
            onChange={setCurrentSpecs}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
