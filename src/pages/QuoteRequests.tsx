
import { useState } from 'react';
import { FileText, Eye, Send, Download, Plus, Trash2 } from 'lucide-react';
import { useQuoteRequests, useCreateQuoteResponse, useUpdateQuoteItemPrice, useCreateQuoteRequest } from '../hooks/useQuoteRequests';
import { useProducts } from '../hooks/useProducts';
import { useForm, useFieldArray } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { format } from 'date-fns';
import { generateQuotePDFEdge } from '../utils/pdfGeneratorEdge';
import ProductSpecsForm from '../components/ProductSpecsForm';
import { Loader } from '../components/loader';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

interface QuoteResponseForm {
  validity_period: number;
  notes: string;
  items: Array<{
    quote_item_id: string;
    unit_price: number;
    total_price: number;
    response_notes: string;
  }>;
}

interface CreateQuoteRequestForm {
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string;
  project_name: string;
  notes: string;
  quote_items: Array<{
    product_id: string;
    quantity: number;
    requested_specs: Record<string, any>;
    notes: string;
  }>;
}

export default function QuoteRequests() {
  const {t} = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [itemSpecs, setItemSpecs] = useState<Record<number, Record<string, any>>>({});

  const { data: quoteRequests, isLoading } = useQuoteRequests();
  const { data: products } = useProducts();
  const createResponseMutation = useCreateQuoteResponse();
  const createRequestMutation = useCreateQuoteRequest();
  const updateItemMutation = useUpdateQuoteItemPrice();

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<QuoteResponseForm>();
  const { fields, update } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");

  // Form for creating new quote requests
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    control: controlCreate,
    watch: watchCreate,
    formState: { errors: errorsCreate }
  } = useForm<CreateQuoteRequestForm>();

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: controlCreate,
    name: "quote_items"
  });

  const watchedQuoteItems = watchCreate("quote_items");

  const handleSpecsChange = (index: number, specs: Record<string, any>) => {
    setItemSpecs(prev => ({
      ...prev,
      [index]: specs
    }));
  };

  const onSubmitCreate = async (data: CreateQuoteRequestForm) => {
    try {
      // Combine form data with specifications
      const enrichedQuoteItems = data.quote_items.map((item, index) => ({
        ...item,
        requested_specs: itemSpecs[index] || {}
      }));

      await createRequestMutation.mutateAsync({
        user_id: 'admin', // Set admin as the creator for dashboard-created requests
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_company: data.customer_company || undefined,
        project_name: data.project_name || undefined,
        notes: data.notes || undefined,
        quote_items: enrichedQuoteItems.filter(item => item.product_id && item.quantity > 0)
      });
      closeCreateModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openCreateModal = () => {
    resetCreate({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_company: '',
      project_name: '',
      notes: '',
      quote_items: [{ product_id: '', quantity: 1, requested_specs: {}, notes: '' }]
    });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setItemSpecs({});
    resetCreate();
  };

  const addQuoteItem = () => {
    appendItem({ product_id: '', quantity: 1, requested_specs: {}, notes: '' });
  };

  const removeQuoteItem = (index: number) => {
    if (itemFields.length > 1) {
      removeItem(index);
    }
  };

  const onSubmit = async (data: QuoteResponseForm) => {
    if (!selectedRequest) return;

    try {
      const totalAmount = data.items.reduce((sum, item) => sum + (item.total_price || 0), 0);

      await createResponseMutation.mutateAsync({
        quote_request_id: selectedRequest.id,
        total_amount: totalAmount,
        validity_period: Number(data.validity_period),
        response_notes: data.notes,
        item_prices: data.items.map(item => ({
          quote_item_id: item.quote_item_id,
          unit_price: item.unit_price,
          total_price: item.total_price,
          response_notes: item.response_notes
        }))
      });
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openModal = (request: any) => {
    setSelectedRequest(request);

    // Prepare items array with default values
    const items = request.quote_items?.map((item: any) => ({
      quote_item_id: item.id,
      unit_price: item.unit_price || 0,
      total_price: item.total_price || 0,
      response_notes: ''
    })) || [];

    reset({
      validity_period: 30,
      notes: '',
      items: items
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    reset();
  };

  const openDetailModal = (request: any) => {
    setSelectedRequest(request);
    console.log(request);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
  };

  const formatProductSpecs = (requestedSpecs: Record<string, any> | string | null) => {
    let specs: Record<string, any> | null = null;

    // Handle different data types for requested_specs
    if (typeof requestedSpecs === 'string') {
      try {
        specs = JSON.parse(requestedSpecs);
      } catch (e) {
        // If parsing fails, treat as plain text
        return <span className="text-gray-400">{requestedSpecs}</span>;
      }
    } else if (requestedSpecs && typeof requestedSpecs === 'object') {
      specs = requestedSpecs;
    }

    if (!specs || Object.keys(specs).length === 0) {
      return <span className="text-gray-400">{t('quoteRequests.noSpecifications')}</span>;
    }

    return (
      <div className="space-y-1">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="text-xs">
            <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {String(value)}
          </div>
        ))}
      </div>
    );
  };

  const updateItemPrice = async (itemId: string, unitPrice: number, quantity: number) => {
    const totalPrice = unitPrice * quantity;
    await updateItemMutation.mutateAsync({
      id: itemId,
      unit_price: unitPrice,
      total_price: totalPrice,
    });
  };

  const handleGeneratePDF = async (request: any, preview = false) => {
    setIsGeneratingPDF(true);
    try {
      await generateQuotePDFEdge(request, preview);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      quoted: 'bg-green-100 text-green-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      // Legacy status mappings
      pending: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-green-100 text-green-800',
    };

    const statusTranslations: Record<string, string> = {
      draft: t('quoteRequests.status.draft'),
      submitted: t('quoteRequests.status.submitted'),
      quoted: t('quoteRequests.status.quoted'),
      accepted: t('quoteRequests.status.accepted'),
      rejected: t('quoteRequests.status.rejected'),
      pending: t('quoteRequests.status.pending'),
      responded: t('quoteRequests.status.responded'),
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
      }`}>
        {statusTranslations[status] || status || t('quoteRequests.status.draft')}
      </span>
    );
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
                {t('quoteRequests.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                {t('quoteRequests.description')}
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                className='bg-[#23b478] hover:bg-[#1e8f66]'
                onClick={openCreateModal}
                icon={<Plus className="h-4 w-4" />}
              >
                {t('quoteRequests.createRequest')}
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead>{t('quoteRequests.table.customer')}</TableHead>
              <TableHead>{t('quoteRequests.table.items')}</TableHead>
              <TableHead>{t('quoteRequests.table.status')}</TableHead>
              <TableHead>{t('quoteRequests.table.created')}</TableHead>
              <TableHead className="relative"><span className="sr-only">{t('quoteRequests.table.actions')}</span></TableHead>
            </TableHeader>
            <TableBody>
              {quoteRequests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {request.customer_name || t('quoteRequests.anonymous')}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {request.customer_email}
                      </div>
                      {request.customer_phone && (
                        <div className="text-gray-500 text-sm">
                          {request.customer_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {t('quoteRequests.itemsCount', { count: request.quote_items?.length || 0 })}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status || 'pending')}</TableCell>
                  <TableCell>
                    {format(new Date(request.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => openDetailModal(request)}
                    >
                      {t('quoteRequests.actions.view')}
                    </Button>
                    {(request.status === 'submitted' || request.status === 'pending') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Send className="h-4 w-4" />}
                        onClick={() => openModal(request)}
                      >
                        {t('quoteRequests.actions.respond')}
                      </Button>
                    )}
                    {request.quote_response && (
                      <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Download className="h-4 w-4" />}
                        onClick={() => handleGeneratePDF(request, false)}
                        loading={isGeneratingPDF}
                      >
                        {t('quoteRequests.actions.downloadPDF')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => handleGeneratePDF(request, true)}
                        loading={isGeneratingPDF}
                      >
                        {t('quoteRequests.actions.previewPDF')}
                      </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {quoteRequests?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('quoteRequests.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('quoteRequests.empty.description')}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title={t('quoteRequests.detailModal.title')}
        maxWidth="2xl"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">{t('quoteRequests.detailModal.customerInformation')}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>{t('quoteRequests.detailModal.name')}: {selectedRequest.customer_name || t('common.notProvided')}</p>
                  <p>{t('quoteRequests.detailModal.email')}: {selectedRequest.customer_email || t('common.notProvided')}</p>
                  <p>{t('quoteRequests.detailModal.phone')}: {selectedRequest.customer_phone || t('common.notProvided')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{t('quoteRequests.detailModal.requestInformation')}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>{t('quoteRequests.detailModal.status')}: {getStatusBadge(selectedRequest.status || 'pending')}</p>
                  <p>{t('quoteRequests.detailModal.created')}: {format(new Date(selectedRequest.created_at), 'MMM d, yyyy HH:mm')}</p>
                  <p>{t('quoteRequests.detailModal.items')}: {selectedRequest.quote_items?.length || 0}</p>
                </div>
              </div>
            </div>

            {selectedRequest.notes && (
              <div>
                <h4 className="font-medium text-gray-900">{t('quoteRequests.detailModal.notes')}</h4>
                <p className="mt-2 text-sm text-gray-600">{selectedRequest.notes}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t('quoteRequests.detailModal.quoteItems')}</h4>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('quoteRequests.detailModal.product')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('quoteRequests.detailModal.dimensions')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('quoteRequests.detailModal.quantity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('quoteRequests.detailModal.unitPrice')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('quoteRequests.detailModal.total')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedRequest.quote_items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || t('quoteRequests.unknownProduct')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.product?.type && `${t('quoteRequests.type')}: ${Array.isArray(item.product.type) ? item.product.type.join(', ') : item.product.type}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatProductSpecs(item.requested_specs)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(selectedRequest.status === 'submitted' || selectedRequest.status === 'pending') ? (
                            <input
                              type="number"
                              step="0.01"
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="0.00"
                              defaultValue={item.unit_price || ''}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  updateItemPrice(item.id, value, item.quantity);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm text-gray-500">
                              {item.unit_price ? `SAR ${item.unit_price.toFixed(2)}` : t('quoteRequests.notSet')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.total_price ? `SAR ${item.total_price.toFixed(2)}` : t('quoteRequests.notCalculated')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Display item notes if any exist */}
              {selectedRequest.quote_items?.some((item: any) => item.notes) && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">{t('quoteRequests.detailModal.itemNotes')}</h5>
                  <div className="space-y-2">
                    {selectedRequest.quote_items
                      ?.filter((item: any) => item.notes)
                      .map((item: any) => (
                        <div key={`notes-${item.id}`} className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || t('quoteRequests.unknownProduct')}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.notes.replace(/"/g, '')}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {selectedRequest.quote_response && (
              <div>
                <h4 className="font-medium text-gray-900">{t('quoteRequests.detailModal.quoteResponse')}</h4>
                <div className="mt-2 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('quoteRequests.detailModal.totalAmount')}:</span> SAR {selectedRequest.quote_response[0]?.total_amount?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('quoteRequests.detailModal.validFor')}:</span> {t('quoteRequests.detailModal.validityDays', { days: selectedRequest.quote_response[0]?.validity_period })}
                  </p>
                  {selectedRequest.quote_response[0]?.response_notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">{t('quoteRequests.detailModal.notes')}:</span> {selectedRequest.quote_response[0]?.response_notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={t('quoteRequests.responseModal.title')}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Quote Items Section */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">{t('quoteRequests.responseModal.itemsPricing')}</h4>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('quoteRequests.responseModal.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('quoteRequests.responseModal.dimensions')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('quoteRequests.responseModal.qty')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('quoteRequests.responseModal.unitPrice')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('quoteRequests.responseModal.total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedRequest?.quote_items?.map((item: any, index: number) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name || t('quoteRequests.unknownProduct')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.product?.type && `${t('quoteRequests.type')}: ${Array.isArray(item.product.type) ? item.product.type.join(', ') : item.product.type}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatProductSpecs(item.requested_specs)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="0.00"
                          {...register(`items.${index}.unit_price` as const, {
                            required: t('quoteRequests.validation.unitPriceRequired'),
                            min: { value: 0, message: t('quoteRequests.validation.pricePositive') },
                            onChange: (e) => {
                              const unitPrice = parseFloat(e.target.value) || 0;
                              const totalPrice = unitPrice * item.quantity;
                              update(index, {
                                ...watchedItems[index],
                                unit_price: unitPrice,
                                total_price: totalPrice
                              });
                            }
                          })}
                        />
                        <input type="hidden" {...register(`items.${index}.quote_item_id` as const)} value={item.id} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        SAR {(watchedItems?.[index]?.total_price || 0).toFixed(2)}
                        <input type="hidden" {...register(`items.${index}.total_price` as const)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Amount Display */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">{t('quoteRequests.responseModal.totalQuoteAmount')}:</span>
                <span className="text-xl font-bold text-green-600">
                  SAR {(watchedItems?.reduce((sum, item) => sum + (item?.total_price || 0), 0) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

         {/* Response Details */}
          <div>
            <Input
              label={t('quoteRequests.responseModal.validityPeriod')}
              type="number"
              {...register('validity_period', {
                required: t('quoteRequests.validation.validityRequired'),
                min: { value: 1, message: t('quoteRequests.validation.validityMinimum') }
              })}
              error={errors.validity_period?.message}
              placeholder="30"
              helperText={t('quoteRequests.responseModal.validityHelperText')}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('quoteRequests.responseModal.responseNotes')}
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('quoteRequests.responseModal.notesPlaceholder')}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} space-x-3 pt-4 border-t ${isRTL ? 'space-x-reverse' : ''}`}>
            <Button variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={createResponseMutation.isPending}
            >
              {t('quoteRequests.responseModal.sendResponse')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Quote Request Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={t('quoteRequests.createModal.title')}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-6">
          {/* Customer Information */}
          <div>
            <h4 className={`font-medium text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('quoteRequests.createModal.customerInformation')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('quoteRequests.createModal.customerName')}
                {...registerCreate('customer_name', {
                  required: t('quoteRequests.validation.customerNameRequired')
                })}
                error={errorsCreate.customer_name?.message}
                placeholder={t('quoteRequests.createModal.customerNamePlaceholder')}
              />

              <Input
                label={t('quoteRequests.createModal.customerEmail')}
                type="email"
                {...registerCreate('customer_email', {
                  required: t('quoteRequests.validation.customerEmailRequired'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('quoteRequests.validation.invalidEmail')
                  }
                })}
                error={errorsCreate.customer_email?.message}
                placeholder={t('quoteRequests.createModal.customerEmailPlaceholder')}
              />

              <Input
                label={t('quoteRequests.createModal.customerPhone')}
                {...registerCreate('customer_phone', {
                  required: t('quoteRequests.validation.customerPhoneRequired')
                })}
                error={errorsCreate.customer_phone?.message}
                placeholder={t('quoteRequests.createModal.customerPhonePlaceholder')}
              />

              <Input
                label={t('quoteRequests.createModal.companyName')}
                {...registerCreate('customer_company')}
                placeholder={t('quoteRequests.createModal.companyNamePlaceholder')}
              />

              <Input
                label={t('quoteRequests.createModal.projectName')}
                {...registerCreate('project_name')}
                placeholder={t('quoteRequests.createModal.projectNamePlaceholder')}
                className="col-span-2"
              />
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('quoteRequests.createModal.additionalNotes')}
              </label>
              <textarea
                {...registerCreate('notes')}
                rows={3}
                className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('quoteRequests.createModal.additionalNotesPlaceholder')}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Quote Items */}
          <div>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-4`}>
              <h4 className={`font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('quoteRequests.createModal.quoteItems')}
              </h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={addQuoteItem}
              >
                {t('quoteRequests.createModal.addItem')}
              </Button>
            </div>

            <div className="space-y-4">
              {itemFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-start mb-4`}>
                    <h5 className={`font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('quoteRequests.createModal.item')} {index + 1}
                    </h5>
                    {itemFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => removeQuoteItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('common.remove')}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label={t('quoteRequests.createModal.product')}
                      {...registerCreate(`quote_items.${index}.product_id` as const, {
                        required: t('quoteRequests.validation.productRequired')
                      })}
                      error={errorsCreate.quote_items?.[index]?.product_id?.message}
                      options={products?.map(product => ({
                        value: product.id,
                        label: product.name
                      })) || []}
                      placeholder={t('quoteRequests.createModal.selectProduct')}
                    />

                    <Input
                      label={t('quoteRequests.createModal.quantity')}
                      type="number"
                      min="1"
                      {...registerCreate(`quote_items.${index}.quantity` as const, {
                        required: t('quoteRequests.validation.quantityRequired'),
                        min: { value: 1, message: t('quoteRequests.validation.quantityMinimum') }
                      })}
                      error={errorsCreate.quote_items?.[index]?.quantity?.message}
                      placeholder="1"
                    />
                  </div>

                  {/* Product Specifications */}
                  {watchedQuoteItems?.[index]?.product_id && (
                    <div className="mt-4">
                      <ProductSpecsForm
                        productId={watchedQuoteItems[index].product_id}
                        onSpecsChange={(specs) => handleSpecsChange(index, specs)}
                        initialSpecs={itemSpecs[index] || {}}
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('quoteRequests.createModal.itemNotes')}
                    </label>
                    <textarea
                      {...registerCreate(`quote_items.${index}.notes` as const)}
                      rows={2}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={t('quoteRequests.createModal.itemNotesPlaceholder')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} space-x-3 pt-4 border-t ${isRTL ? 'space-x-reverse' : ''}`}>
            <Button variant="secondary" onClick={closeCreateModal}>
              {t('common.cancel')}
            </Button>
            <Button
              className='bg-[#23b478] hover:bg-[#1e8f66]'
              type="submit"
              loading={createRequestMutation.isPending}
            >
              {t('quoteRequests.createModal.createRequest')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}