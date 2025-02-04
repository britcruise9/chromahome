// src/lib/products/types.ts
export interface Store {
  id: string;
  name: string;
}

export interface Product {
  id: number;
  store: Store;
  image: string;
  link: string;
}
