export interface ProductCapabilities {
  canRead: boolean;
  canEdit: boolean;
  canUpdatePrice: boolean;
  canUpdateStock: boolean;
  canPublish: boolean;
  canArchive: boolean;
}

export const READ_ONLY_PRODUCT_CAPABILITIES: ProductCapabilities = {
  canRead: true,
  canEdit: false,
  canUpdatePrice: false,
  canUpdateStock: false,
  canPublish: false,
  canArchive: false,
};
