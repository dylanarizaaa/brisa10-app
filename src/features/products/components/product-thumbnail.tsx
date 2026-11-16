import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

import { getImageUrl } from '../services/product-image-service';

interface ProductThumbnailProps {
  storagePath: string | null;
  /** Lado en píxeles. */
  size?: number;
  className?: string;
}

/** Miniatura cuadrada de un producto, con un marcador cuando no tiene foto. */
export function ProductThumbnail({ storagePath, size = 44, className }: ProductThumbnailProps) {
  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden rounded-md border border-border bg-muted',
        className
      )}
      style={{ width: size, height: size }}>
      {storagePath ? (
        <Image
          source={{ uri: getImageUrl(storagePath) }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={150}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Icon
          as={ImageOff}
          size={16}
          className="text-muted-foreground"
          aria-label="Sin fotografía"
        />
      )}
    </View>
  );
}
