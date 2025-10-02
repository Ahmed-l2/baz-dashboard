import { useTranslation } from 'react-i18next';
import { ProductSpec } from '../hooks/useProducts';

interface SpecificationsDisplayProps {
  specs: ProductSpec[];
  className?: string;
}

export default function SpecificationsDisplay({ specs, className = '' }: SpecificationsDisplayProps) {
  const { t } = useTranslation();
  if (!specs || specs.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No specifications defined
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {specs.map((spec, index) => (
        <div key={index} className="text-sm">
          <span className="font-medium text-gray-900">{t(`specs.${spec.spec_name}`)}</span>
          {spec.unit && <span className="text-gray-500"> ({spec.unit})</span>}
          {(spec.min_value !== null || spec.max_value !== null) && (
            <span className="text-gray-600">
              {' '}
              {spec.min_value !== null && spec.max_value !== null
                ? `${spec.min_value} - ${spec.max_value}`
                : spec.min_value !== null
                ? `min: ${spec.min_value}`
                : `max: ${spec.max_value}`}
            </span>
          )}
          {spec.notes && (
            <div className="text-xs text-gray-500 mt-1">{spec.notes}</div>
          )}
        </div>
      ))}
    </div>
  );
}
