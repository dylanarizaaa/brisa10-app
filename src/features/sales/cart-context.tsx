import { createContext, useContext, type ReactNode } from 'react';

import { useCart, type Cart } from './hooks/use-cart';

const CartContext = createContext<Cart | null>(null);

/**
 * Carrito de la venta en curso, compartido entre la pantalla "Vender" y la de confirmación.
 * Vive en memoria: se conserva al cambiar de pestaña y se pierde al cerrar la app o la sesión.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  return <CartContext value={cart}>{children}</CartContext>;
}

export function useSaleCart(): Cart {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useSaleCart debe usarse dentro de <CartProvider>');
  return cart;
}
