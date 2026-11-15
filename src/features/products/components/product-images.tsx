import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, ImagePlus, Star, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from '@/components/shared/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

import {
  useDeleteProductImage,
  useReorderProductImages,
  useUploadProductImages,
} from '../hooks/use-products';
import {
  getImageUrl,
  MAX_PRODUCT_IMAGES,
  validateImage,
  type PickedImage,
} from '../services/product-image-service';
import type { ProductImage } from '../types';

interface ProductImagesProps {
  productId: string;
  productName: string;
  images: ProductImage[];
  canEdit: boolean;
}

export function ProductImages({ productId, productName, images, canEdit }: ProductImagesProps) {
  const upload = useUploadProductImages(productId);
  const remove = useDeleteProductImage();
  const reorder = useReorderProductImages();
  const [toDelete, setToDelete] = useState<ProductImage | null>(null);

  const busy = upload.isPending || remove.isPending || reorder.isPending;
  const remaining = MAX_PRODUCT_IMAGES - images.length;

  function uploadPicked(picked: PickedImage[]) {
    const valid = picked.filter((image) => {
      const problem = validateImage(image);
      if (problem) toast.error(problem);
      return !problem;
    });
    if (valid.length > remaining) {
      toast.warning(
        `Cada producto admite hasta ${MAX_PRODUCT_IMAGES} fotografías. Se subirán las primeras ${remaining}.`
      );
    }
    const accepted = valid.slice(0, remaining);
    if (accepted.length === 0) return;
    const lastPosition = images.reduce((max, image) => Math.max(max, image.position), -1);
    upload.mutate({ images: accepted, startPosition: lastPosition + 1 });
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) uploadPicked(result.assets);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.error(
        'Permite el acceso a la cámara en la configuración del teléfono para tomar fotos.'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) uploadPicked(result.assets);
  }

  function makeMain(image: ProductImage) {
    reorder.mutate([
      image.id,
      ...images.filter((other) => other.id !== image.id).map((other) => other.id),
    ]);
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text role="heading" className="font-medium">
          Fotografías
        </Text>
        {upload.isPending && <ActivityIndicator size="small" color={THEME.mutedForeground} />}
      </View>

      {images.length === 0 ? (
        <View className="items-center rounded-lg border border-dashed border-border px-6 py-8">
          <Text className="text-center text-sm text-muted-foreground">
            Este producto todavía no tiene fotografías.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {images.map((image, index) => (
            <View key={image.id} className="w-[47%] gap-2">
              <View className="overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  source={{ uri: getImageUrl(image.storage_path) }}
                  style={{ width: '100%', aspectRatio: 1 }}
                  contentFit="cover"
                  transition={150}
                  accessibilityLabel={`${productName}, fotografía ${index + 1}`}
                />
                {index === 0 && (
                  <Badge variant="secondary" className="absolute left-2 top-2">
                    <Text>Principal</Text>
                  </Badge>
                )}
              </View>
              {canEdit && (
                <View className="flex-row gap-2">
                  {index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={busy}
                      aria-label={`Usar la fotografía ${index + 1} como principal`}
                      onPress={() => makeMain(image)}>
                      <Icon as={Star} size={14} />
                      <Text>Principal</Text>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className={index > 0 ? undefined : 'flex-1'}
                    disabled={busy}
                    aria-label={`Eliminar la fotografía ${index + 1}`}
                    onPress={() => setToDelete(image)}>
                    <Icon as={Trash2} size={14} />
                    {index === 0 && <Text>Eliminar</Text>}
                  </Button>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {canEdit && (
        <View className="gap-2">
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={busy || remaining <= 0}
              aria-label="Agregar fotos de la galería"
              onPress={() => void pickFromLibrary()}>
              <Icon as={ImagePlus} size={16} />
              <Text>Galería</Text>
            </Button>
            {Platform.OS !== 'web' && (
              <Button
                variant="outline"
                className="flex-1"
                disabled={busy || remaining <= 0}
                aria-label="Tomar una foto"
                onPress={() => void takePhoto()}>
                <Icon as={Camera} size={16} />
                <Text>Cámara</Text>
              </Button>
            )}
          </View>
          <Text className="text-xs text-muted-foreground">
            JPG, PNG o WebP de hasta 5 MB. Máximo {MAX_PRODUCT_IMAGES} por producto.
          </Text>
        </View>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="¿Eliminar fotografía?"
        description="La fotografía se borrará de forma permanente."
        confirmLabel="Eliminar"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          toDelete && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })
        }
      />
    </View>
  );
}
