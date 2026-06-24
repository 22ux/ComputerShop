import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  StoreButton,
  StoreEmptyState,
  StoreInput,
  StorePageHeader,
  StoreSurface,
} from "../components/storefront/store-ui";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import http from "../lib/http";
import { formatCurrency, getErrorMessage } from "../lib/utils";
import type { Product, ProductAttribute, ProductImage, ProductVariant, Review } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// ImageGallery Component
// ─────────────────────────────────────────────────────────────────────────────

function ImageGallery({ mainImageUrl, images }: { mainImageUrl: string; images: ProductImage[] }) {
  const allImages = images.length > 0 ? images : [{ id: 0, imageUrl: mainImageUrl, displayOrder: 0 }];
  const [activeUrl, setActiveUrl] = useState(allImages[0].imageUrl);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="overflow-hidden rounded-[28px] bg-[#f2fbff]">
        <img
          src={activeUrl}
          alt="Product"
          className="h-full min-h-[420px] w-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails (only if there are extra images) */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {allImages.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveUrl(img.imageUrl)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                activeUrl === img.imageUrl
                  ? "border-[#008ecc] shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductVariantsSelector Component
// ─────────────────────────────────────────────────────────────────────────────

function ProductVariantsSelector({
  variants,
  currentProductId,
}: {
  variants: ProductVariant[];
  currentProductId: number;
}) {
  const navigate = useNavigate();

  if (!variants || variants.length <= 1) return null;

  return (
    <div className="mt-6">
      <div className="mb-3 text-sm font-semibold text-slate-800">
        Chọn phiên bản cấu hình
      </div>
      <div className="grid grid-cols-2 gap-3">
        {variants.map((variant) => {
          const isActive = variant.id === currentProductId;
          return (
            <button
              key={variant.id}
              onClick={() => {
                if (!isActive) navigate(`/products/${variant.id}`);
              }}
              className={`flex flex-col items-start gap-1 rounded-[16px] border p-3 text-left transition-all ${
                isActive
                  ? "border-[#c2410c] bg-[#fff1e8] shadow-[inset_0_0_0_1px_rgba(249,115,22,0.12)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isActive ? "text-[#c2410c]" : "text-slate-700"
                }`}
              >
                {variant.variantName || "Phiên bản mặc định"}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(variant.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductSpecifications Component
// ─────────────────────────────────────────────────────────────────────────────

function ProductSpecifications({
  specification,
  attributes,
}: {
  specification?: string;
  attributes: ProductAttribute[];
}) {
  if (attributes.length === 0 && !specification) {
    return (
      <p className="mt-4 text-sm text-slate-400 italic">
        Chưa có thông số kỹ thuật cho sản phẩm này.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {attributes.length > 0 && (
        <table className="w-full text-sm">
          <tbody>
            {attributes.map((attr) => (
              <tr
                key={attr.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="w-1/3 py-3 pr-4 font-semibold text-slate-600">
                  {attr.attributeName}
                </td>
                <td className="py-3 text-slate-700">{attr.attributeValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {specification && (
        <pre className="whitespace-pre-wrap text-sm leading-8 text-slate-500">
          {specification}
        </pre>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StarRating helper
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-[#f59e0b] text-[#f59e0b]"
              : "fill-slate-200 text-slate-200"
          }
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductReviews Component
// ─────────────────────────────────────────────────────────────────────────────

function ProductReviews({
  productId,
  reviews,
  averageRating,
  isAuthenticated,
  onNewReview,
}: {
  productId: number;
  reviews: Review[];
  averageRating: number;
  isAuthenticated: boolean;
  onNewReview: (review: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await http.post<Review>("/reviews", {
        productId,
        rating,
        comment,
      });
      onNewReview(data);
      setComment("");
      setRating(5);
      toast.success("Đánh giá của bạn đã được ghi nhận!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Average rating summary */}
      <div className="flex items-center gap-4">
        <div className="font-display text-5xl font-bold tracking-[-0.05em] text-slate-900">
          {reviews.length > 0 ? averageRating.toFixed(1) : "—"}
        </div>
        <div className="space-y-1">
          <StarRating rating={averageRating} size={20} />
          <p className="text-sm text-slate-400">
            {reviews.length === 0
              ? "Chưa có đánh giá"
              : `${reviews.length} đánh giá`}
          </p>
        </div>
      </div>

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-[20px] border border-slate-100 bg-[#f8fcff] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e0f4fd] text-xs font-bold text-[#008ecc]">
                    {r.userFullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {r.userFullName}
                  </span>
                </div>
                <StarRating rating={r.rating} />
              </div>
              {r.comment && (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {r.comment}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Review form */}
      <div className="rounded-[24px] border border-dashed border-slate-200 p-5">
        <div className="mb-3 font-display text-base font-semibold text-slate-800">
          {isAuthenticated ? "Viết đánh giá của bạn" : "Đăng nhập để đánh giá"}
        </div>

        {isAuthenticated ? (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {/* Star picker */}
            <div>
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Điểm đánh giá
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={
                        star <= rating
                          ? "fill-[#f59e0b] text-[#f59e0b]"
                          : "fill-slate-200 text-slate-200"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <div className="mb-1 text-xs font-semibold text-slate-500">
                Nhận xét (tùy chọn)
              </div>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-[#008ecc] focus:ring-2 focus:ring-[#008ecc]/10"
                rows={3}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
            </div>

            <StoreButton type="submit" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </StoreButton>
          </form>
        ) : (
          <StoreButton
            type="button"
            variant="secondary"
            onClick={() => navigate("/login")}
          >
            Đăng nhập để đánh giá
          </StoreButton>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const { data } = await http.get<Product>(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      await addToCart(product.id, quantity);
      toast.success("Added to cart.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleNewReview = (review: Review) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const updatedReviews = [review, ...(prev.reviews ?? [])];
      const avg =
        updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length;
      return { ...prev, reviews: updatedReviews, averageRating: avg };
    });
  };

  if (loading) {
    return (
      <StoreSurface className="p-6 sm:p-8">
        <StorePageHeader
          eyebrow="Product detail"
          title="Loading product details"
        />
      </StoreSurface>
    );
  }

  if (!product) {
    return (
      <StoreEmptyState
        title="Product not found"
        description={
          error || "The product may have been removed from the catalog."
        }
        actionLabel="Back to catalog"
        actionTo="/products"
      />
    );
  }

  const reviews = product.reviews ?? [];
  const attributes = product.attributes ?? [];
  const images = product.images ?? [];
  const averageRating = product.averageRating ?? 0;

  return (
    <div className="space-y-6">
      <StoreSurface className="p-6 sm:p-8">
        <StorePageHeader
          eyebrow={product.categoryName}
          title={product.name}
          description={product.description}
        />
      </StoreSurface>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left: Image Gallery */}
        <StoreSurface className="overflow-hidden p-4 sm:p-5">
          <ImageGallery mainImageUrl={product.imageUrl} images={images} />
        </StoreSurface>

        {/* Right: Purchase info */}
        <div className="space-y-6">
          <StoreSurface className="p-6 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#eff9fd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#008ecc]">
                {product.brand}
              </span>
              <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {product.categoryName}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  product.stockQuantity > 0
                    ? "bg-[#effcf4] text-[#15803d]"
                    : "bg-[#fef2f2] text-[#dc2626]"
                }`}
              >
                {product.stockQuantity > 0 ? "In stock" : "Out of stock"}
              </span>
            </div>

            {/* Rating stars inline */}
            {reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={averageRating} />
                <span className="text-xs text-slate-400">
                  ({reviews.length})
                </span>
              </div>
            )}

            <div className="mt-6 grid gap-4 rounded-[28px] bg-[#f8fcff] p-5 sm:grid-cols-3">
              <Metric label="Price" value={formatCurrency(product.price)} />
              <Metric label="Stock" value={String(product.stockQuantity)} />
              <Metric label="Category" value={product.categoryName} />
            </div>

            {product.variants && product.variants.length > 1 && (
              <ProductVariantsSelector
                variants={product.variants}
                currentProductId={product.id}
              />
            )}

            <div className="mt-6 max-w-[180px]">
              <div className="mb-2 text-sm font-semibold text-slate-800">
                Quantity
              </div>
              <StoreInput
                type="number"
                min={1}
                max={Math.max(product.stockQuantity, 1)}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <StoreButton
                type="button"
                className="flex-1"
                onClick={() => void handleAddToCart()}
                disabled={product.stockQuantity <= 0}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </StoreButton>
              <StoreButton
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate("/products")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to catalog
              </StoreButton>
            </div>
          </StoreSurface>
        </div>
      </div>

      {/* Technical Specifications */}
      <StoreSurface className="p-6 sm:p-7">
        <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
          Technical specifications
        </div>
        <ProductSpecifications
          specification={product.specification}
          attributes={attributes}
        />
      </StoreSurface>

      {/* Reviews */}
      <StoreSurface className="p-6 sm:p-7">
        <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
          Customer reviews
        </div>
        <div className="mt-6">
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            averageRating={averageRating}
            isAuthenticated={isAuthenticated}
            onNewReview={handleNewReview}
          />
        </div>
      </StoreSurface>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">
        {value}
      </div>
    </div>
  );
}
