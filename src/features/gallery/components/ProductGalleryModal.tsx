import { ImageZoomModal } from "@/modules/catalog/components/overlays/ImageZoomModal";

interface ProductGalleryModalProps {
  src?: string | null;
  title?: string;
  onClose: () => void;
}

export function ProductGalleryModal({
  src,
  title = "",
  onClose,
}: ProductGalleryModalProps) {
  return (
    <ImageZoomModal
      src={src ?? null}
      title={title}
      onClose={onClose}
    />
  );
}
