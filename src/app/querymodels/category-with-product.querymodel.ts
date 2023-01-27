import { ProductModel } from "../models/freshcart-products.model";

export interface CategoryWithProductQuerymodel {
  readonly name: string;
  readonly products: ProductModel[];
}
