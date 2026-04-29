// Static data loaded from data.json.
// All export names are kept identical so no downstream imports need to change.

import data from './data.json';

export const BRAND_PRODUCTS    = data.products;
export const BRAND_INFO        = data.defaultBrand;
export const BRAND_MANAGER     = data.brandManager;
export const PRODUCTS_PER_PAGE = data.productsPerPage;
