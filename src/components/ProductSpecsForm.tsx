import { useState, useEffect } from 'react';
import { useProductSpecs, validateProductSpecs, useProducts } from '../hooks/useProducts';

interface ProductSpecsFormProps {
  productId: string;
  onSpecsChange: (specs: Record<string, any>) => void;
  initialSpecs?: Record<string, any>;
  disabled?: boolean;
}

export default function ProductSpecsForm({
  productId,
  onSpecsChange,
  initialSpecs = {},
  disabled = false
}: ProductSpecsFormProps) {
  const { data: specs, isLoading } = useProductSpecs(productId);
  const { data: products } = useProducts();
  const [specValues, setSpecValues] = useState<Record<string, any>>(initialSpecs);
  const [errors, setErrors] = useState<string[]>([]);

  // Find the current product to get its types
  const currentProduct = products?.find(p => p.id === productId);

  useEffect(() => {
    setSpecValues(initialSpecs);
  }, [initialSpecs]);

  const handleSpecChange = (specName: string, value: any) => {
    const newSpecs = { ...specValues, [specName]: value };
    setSpecValues(newSpecs);

    // Validate specifications
    if (specs) {
      const validation = validateProductSpecs(specs, newSpecs);
      setErrors(validation.errors);

      // Only call onSpecsChange if validation passes
      if (validation.isValid) {
        onSpecsChange(newSpecs);
      }
    } else {
      onSpecsChange(newSpecs);
    }
  };

  const renderSpecInput = (spec: any) => {
    const value = specValues[spec.spec_name] || '';

    switch (spec.spec_name) {
      case 'type':
        // For type, show as dropdown using the product's available types
        const availableTypes = currentProduct?.type || [];
        return (
          <div key={spec.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {spec.spec_name.charAt(0).toUpperCase() + spec.spec_name.slice(1)}
              {spec.unit && ` (${spec.unit})`}
            </label>
            <select
              value={value}
              onChange={(e) => handleSpecChange(spec.spec_name, e.target.value)}
              disabled={disabled}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">Select type</option>
              {availableTypes.map((type: string) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {spec.notes && (
              <p className="text-xs text-gray-500">{spec.notes}</p>
            )}
          </div>
        );

      case 'dimensions':
        // For dimensions, show as text input for custom dimensions
        return (
          <div key={spec.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Dimensions {spec.unit && `(${spec.unit})`}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleSpecChange(spec.spec_name, e.target.value)}
              disabled={disabled}
              placeholder="e.g., 63×32 or 25×10"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
            />
            {spec.notes && (
              <p className="text-xs text-gray-500">{spec.notes}</p>
            )}
            {spec.min_value && spec.max_value && (
              <p className="text-xs text-gray-500">
                Range: {spec.min_value} - {spec.max_value} {spec.unit}
              </p>
            )}
          </div>
        );

      default:
        // For numeric values (thickness, length, diameter, width)
        return (
          <div key={spec.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {spec.spec_name.charAt(0).toUpperCase() + spec.spec_name.slice(1)}
              {spec.unit && ` (${spec.unit})`}
            </label>
            <input
              type="number"
              step={spec.spec_name === 'thickness' ? '0.01' : '1'}
              value={value}
              onChange={(e) => handleSpecChange(spec.spec_name, parseFloat(e.target.value) || '')}
              disabled={disabled}
              min={spec.min_value || undefined}
              max={spec.max_value || undefined}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
            />
            {spec.notes && (
              <p className="text-xs text-gray-500">{spec.notes}</p>
            )}
            {spec.min_value !== null && spec.max_value !== null && (
              <p className="text-xs text-gray-500">
                Range: {spec.min_value} - {spec.max_value} {spec.unit}
              </p>
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!specs || specs.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No specifications available for this product.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Product Specifications</h4>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-600">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {specs.map(renderSpecInput)}
      </div>
    </div>
  );
}
