import * as Crypto from 'expo-crypto';

import { toAppError } from '@/lib/errors';
import { getSupabase } from '@/lib/supabase';

import type { ProductImage } from '../types';

const BUCKET = 'product-images';

export const MAX_PRODUCT_IMAGES = 8;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Imagen elegida de la galería o tomada con la cámara (forma que entrega expo-image-picker). */
export interface PickedImage {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}

function displayName(image: PickedImage): string {
  return image.fileName ? `"${image.fileName}"` : 'La fotografía';
}

/** Devuelve el motivo por el que la imagen no se puede subir, o null si es válida. */
export function validateImage(image: PickedImage): string | null {
  if (!image.mimeType || !(image.mimeType in IMAGE_TYPES)) {
    return `${displayName(image)} no es una imagen JPG, PNG o WebP`;
  }
  if (image.fileSize && image.fileSize > IMAGE_MAX_BYTES) {
    return `${displayName(image)} supera el tamaño máximo de 5 MB`;
  }
  return null;
}

export function getImageUrl(storagePath: string): string {
  return getSupabase().storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function uploadProductImage(
  productId: string,
  image: PickedImage,
  position: number
): Promise<void> {
  const invalid = validateImage(image);
  if (invalid) throw new Error(invalid);

  // En el móvil la imagen es un archivo local: se lee como bytes para enviarla a Storage.
  const bytes = await fetch(image.uri)
    .then((response) => response.arrayBuffer())
    .catch(() => {
      throw new Error(`No se pudo leer ${displayName(image)} del dispositivo`);
    });
  if (bytes.byteLength > IMAGE_MAX_BYTES) {
    throw new Error(`${displayName(image)} supera el tamaño máximo de 5 MB`);
  }

  const supabase = getSupabase();
  const contentType = image.mimeType as string;
  const path = `${productId}/${Crypto.randomUUID()}.${IMAGE_TYPES[contentType]}`;

  const upload = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, cacheControl: '31536000' });
  if (upload.error) throw new Error(`No se pudo subir ${displayName(image)}`);

  const { error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, storage_path: path, position });
  if (error) {
    // Sin registro en la base de datos el archivo quedaría huérfano: se retira.
    await supabase.storage.from(BUCKET).remove([path]);
    throw toAppError(error, `No se pudo registrar ${displayName(image)}`);
  }
}

export async function deleteProductImage(image: ProductImage): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('product_images').delete().eq('id', image.id);
  if (error) throw toAppError(error, 'No se pudo eliminar la fotografía');
  // Si falla el borrado del archivo, la foto ya no aparece en el producto; solo queda espacio sin liberar.
  await supabase.storage.from(BUCKET).remove([image.storage_path]);
}

/** Guarda el orden de las fotos; la primera es la principal. */
export async function reorderProductImages(orderedIds: string[]): Promise<void> {
  const supabase = getSupabase();
  const results = await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from('product_images').update({ position }).eq('id', id)
    )
  );
  const failed = results.find((result) => result.error);
  if (failed?.error)
    throw toAppError(failed.error, 'No se pudo cambiar el orden de las fotografías');
}
