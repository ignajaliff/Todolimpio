export interface Usuario {
  id: string;
  nombreusuario: string;
  email: string;
  contraseña: string;
  identificadorubicacion: string;
  rol: 'admin' | 'usuario';
}

export interface Producto {
  id: string;
  nombreproducto: string;
  descripcion?: string;
  identificadorubicacion: string;
}

export interface ProductoPedido {
  nombreproducto: string;
  cantidad: number;
}

export interface Pedido {
  id: string;
  nombreusuario: string;
  hojadepedido: {
    productos: ProductoPedido[];
  };
  identificadorubicacion: string;
  estadopedido: 'Esperando confirmación' | 'Pedido confirmado' | 'Pedido enviado';
  fechacreacion: string;
} 