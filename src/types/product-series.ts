
export interface ProductSeries {
  id: string;
  name: string;
  series_code: string;
  description?: string;
  variants?: Array<{
    id: string;
    name: string;
    variant_code: string;
    description?: string;
    product_series_id: string;
  }>;
}
