import React from 'react';
import { Leaf, Package, Moon } from 'lucide-react';
import { FieldStatus } from '../../lib/fieldLifecycleService';

interface FieldStatusBadgeProps {
  status: FieldStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const FieldStatusBadge: React.FC<FieldStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: Leaf,
          label: 'Active',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          emoji: '🟢'
        };
      case 'harvested':
        return {
          icon: Package,
          label: 'Harvested',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          emoji: '🟡'
        };
      case 'dormant':
        return {
          icon: Moon,
          label: 'Dormant',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          emoji: '⚪'
        };
      default:
        return {
          icon: Leaf,
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          emoji: '⚪'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} font-medium`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      <span>{config.label}</span>
    </div>
  );
};
