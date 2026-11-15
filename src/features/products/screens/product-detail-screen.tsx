import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeftRight, PackageX, Pencil, Power, PowerOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DetailItem, DetailList } from '@/components/shared/detail-list';
import { HeaderButton } from '@/components/shared/header-button';
import { LoadingButton } from '@/components/shared/loading-button';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { ScrollScreen } from '@/components/shared/screen';
import { StatusBadge } from '@/components/shared/status-badge';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { formatCOP, formatDateTime } from '@/lib/format';

import { ProductImages } from '../components/product-images';
import { StockBadge } from '../components/stock-badge';
import { useProduct, useSetProductActive, useSetProductCatalog } from '../hooks/use-products';
import type { ProductDetail } from '../types';

function CatalogSwitch({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1">
        <Text className="text-sm font-medium">{label}</Text>
        <Text className="text-xs text-muted-foreground">{description}</Text>
      </View>
      <Switch aria-label={label} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </View>
  );
}

function ProductDetailContent({ product }: { product: ProductDetail }) {
  const { isAdmin } = useCurrentUser();
  const setActive = useSetProductActive();
  const setCatalog = useSetProductCatalog();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  return (
    <ScrollScreen>
      <Stack.Screen
        options={{
          title: 'Producto',
          headerRight: isAdmin
            ? () => (
                <HeaderButton
                  icon={Pencil}
                  label="Editar producto"
                  onPress={() => router.push(`/producto/editar/${product.id}`)}
                />
              )
            : undefined,
        }}
      />

      <View className="gap-2">
        <Text role="heading" className="text-2xl font-semibold tracking-tight">
          {product.name}
        </Text>
        <Text className="text-sm text-muted-foreground">{product.category_name}</Text>
        <View className="flex-row flex-wrap gap-2">
          <StatusBadge
            label={product.is_active ? 'Activo' : 'Inactivo'}
            active={product.is_active}
          />
          <StockBadge status={product.stock_status} />
          {product.is_published && <StatusBadge label="En la tienda virtual" />}
        </View>
      </View>

      <DetailList>
        <DetailItem label="Precio de venta">{formatCOP(product.price)}</DetailItem>
        {isAdmin && (
          <DetailItem label="Costo">
            {product.cost === null ? '—' : formatCOP(product.cost)}
          </DetailItem>
        )}
        <DetailItem label="Existencias">{product.stock}</DetailItem>
        <DetailItem label="Stock mínimo">
          {product.min_stock === null
            ? `${product.effective_min_stock} (general)`
            : product.min_stock}
        </DetailItem>
        <DetailItem label="Código (SKU)">{product.sku ?? '—'}</DetailItem>
        <DetailItem label="Actualizado">{formatDateTime(product.updated_at)}</DetailItem>
      </DetailList>

      <LoadingButton
        label="Registrar movimiento de inventario"
        variant="outline"
        icon={ArrowLeftRight}
        onPress={() => router.push({ pathname: '/movimiento', params: { productId: product.id } })}
      />

      <View className="gap-2">
        <Text role="heading" className="font-medium">
          Descripción
        </Text>
        <Text className="text-sm text-muted-foreground">
          {product.description ?? 'Sin descripción.'}
        </Text>
      </View>

      <ProductImages
        productId={product.id}
        productName={product.name}
        images={product.images}
        canEdit={isAdmin}
      />

      {isAdmin && (
        <View className="gap-4 rounded-lg border border-border p-4">
          <Text role="heading" className="font-medium">
            Tienda virtual
          </Text>
          <CatalogSwitch
            label="Publicar en la tienda virtual"
            description={
              product.is_active
                ? 'Visible para los clientes.'
                : 'Solo se muestra si el producto está activo.'
            }
            checked={product.is_published}
            disabled={setCatalog.isPending}
            onChange={(checked) => setCatalog.mutate({ id: product.id, is_published: checked })}
          />
          <CatalogSwitch
            label="Destacado"
            description="Aparece primero en la tienda virtual."
            checked={product.is_featured}
            disabled={setCatalog.isPending}
            onChange={(checked) => setCatalog.mutate({ id: product.id, is_featured: checked })}
          />
        </View>
      )}

      {isAdmin && (
        <LoadingButton
          label={product.is_active ? 'Desactivar producto' : 'Activar producto'}
          variant="outline"
          icon={product.is_active ? PowerOff : Power}
          loading={setActive.isPending && !confirmDeactivate}
          onPress={() =>
            product.is_active
              ? setConfirmDeactivate(true)
              : setActive.mutate({ id: product.id, isActive: true })
          }
        />
      )}

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="¿Desactivar producto?"
        description={`"${product.name}" dejará de estar disponible para la venta. Su historial se conserva y puedes reactivarlo cuando quieras.`}
        confirmLabel="Desactivar"
        destructive
        loading={setActive.isPending}
        onConfirm={() =>
          setActive.mutate(
            { id: product.id, isActive: false },
            { onSettled: () => setConfirmDeactivate(false) }
          )
        }
      />
    </ScrollScreen>
  );
}

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Producto' }} />
      <QueryBoundary query={product} notFoundIcon={PackageX} notFoundTitle="Producto no encontrado">
        {(data) => <ProductDetailContent product={data} />}
      </QueryBoundary>
    </View>
  );
}
