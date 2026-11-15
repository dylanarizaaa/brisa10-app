import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { StatusBadge } from '@/components/shared/status-badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

import type { Product } from '../types';
import { ProductThumbnail } from './product-thumbnail';

interface ProductRowProps {
  product: Product;
  /** Línea secundaria bajo el nombre (categoría, existencias…). */
  subtitle?: string;
  /** Contenido a la derecha (precio, existencias, insignia, botón). */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Nombre accesible de la fila; por defecto, el del producto. */
  accessibleLabel?: string;
  disabled?: boolean;
}

/** Fila de producto con miniatura. Base de las listas de productos, inventario y venta. */
export function ProductRow({
  product,
  subtitle,
  trailing,
  onPress,
  accessibleLabel,
  disabled,
}: ProductRowProps) {
  return (
    <Pressable
      role={onPress ? 'button' : undefined}
      aria-label={accessibleLabel ?? product.name}
      disabled={disabled || !onPress}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 bg-background px-4 py-3 active:bg-accent',
        disabled && 'opacity-50'
      )}>
      <ProductThumbnail storagePath={product.main_image_path} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className={cn('shrink font-medium', !product.is_active && 'text-muted-foreground')}>
            {product.name}
          </Text>
          {!product.is_active && <StatusBadge label="Inactivo" active={false} />}
        </View>
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {subtitle ?? [product.category_name, product.sku].filter(Boolean).join(' · ')}
        </Text>
      </View>
      {trailing}
      {onPress && !trailing && (
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      )}
    </Pressable>
  );
}
