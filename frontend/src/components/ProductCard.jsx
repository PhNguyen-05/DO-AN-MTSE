import React from 'react';
import { Link } from 'react-router-dom';

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const compactNumberFormatter = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });
const formatCurrency = (v) => currencyFormatter.format(v || 0);
const formatCompact = (v) => compactNumberFormatter.format(v || 0);

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida/AP1WRLt_yxa7EhZw8Q8_LzPf2Kd3TfwRGdcEM1ofXKn5TzH6lkYPN67loyQDBE5-ccyTrxRTIpLhE0cGpSbXcY4bN91-pUqD6QEnB148gcwQT1btlP0x3LELmXLI8zOZS2jnlYW_mG4ubRAzUgH1DXAUQSQ5uuo9QqGvPYSAAhxfkHOmUU9IqJVBIPX7v-4CKDCRf9ZInKkiaFl4m05qmTkycwWzJbz4evU736fZvdBZI7ivWY2AqtONmvA0";
const PRODUCT_IMAGES = { full: HERO_IMAGE, listening: HERO_IMAGE, reading: HERO_IMAGE, vocabulary: HERO_IMAGE };

const getProductIcon = (product) => {
	if (!product) return 'bi-journal-bookmark';
	if (product.skill === 'listening') return 'bi-headphones';
	if (product.skill === 'reading') return 'bi-pencil-square';
	if (product.skill === 'vocabulary') return 'bi-layers';
	return 'bi-journal-bookmark';
};

const getProductImage = (product) => {
	if (!product) return null;
	// common possible fields that may hold an image URL
	return product.image || product.imageUrl || product.image_url || product.thumbnail || product.thumb || product.cover || product.coverImage || null;
};

export default function ProductCard({ product, onAction, isFavorited = false, onToggleFavorite }) {
	const detailPath = product.type === 'vocabulary' ? `/vocabulary/${product.id}` : `/exams/${product.id}`;

	const isSpecialToeic = product && product.title && /Đề\s*TOEIC\s*1|Đề\s*TOEIC\s*2/i.test(product.title);

	return (
		<article className={`academic-product-card product-tone-${product.tone || 'blue'} ${isSpecialToeic ? 'free-item' : ''}`}>
			<div className="academic-product-media">
				<div className="academic-product-image">
					<div className="academic-product-art">
						<i className={`bi ${getProductIcon(product)}`} aria-hidden="true" />
					</div>
					<Link to={detailPath} aria-label={`Xem chi tiết ${product.title}`}>
						<div className={`academic-product-art product-tone-${product.tone || 'blue'}`} aria-hidden>
							<i className={`bi ${getProductIcon(product)}`} />
						</div>
						{getProductImage(product) ? (
							<img src={getProductImage(product)} alt={product.title} loading="lazy" onError={(e) => { e.currentTarget.hidden = true; }} />
						) : null}
					</Link>
				</div>
				<div className="academic-rating"><i className="bi bi-star-fill" aria-hidden="true" /><span>{product.rating}</span></div>
			</div>

			<h4><Link to={detailPath}>{product.title}</Link></h4>
			<p>{product.categoryName} - {product.year}</p>

			<div className="academic-card-meta">
				<span><i className="bi bi-people" aria-hidden="true" /> {formatCompact(product.sold || 0)} bán</span>
				<span><i className="bi bi-eye" aria-hidden="true" /> {formatCompact(product.views || 0)}</span>
			</div>

			<div className="academic-card-footer">
				<span>{isSpecialToeic ? 'Miễn phí' : formatCurrency(product.price)}</span>
				<div className="academic-card-actions">
					<button
						type="button"
						className={`favorite-toggle ${isFavorited ? 'is-fav' : 'outline'}`}
						onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite && onToggleFavorite(product); }}
						aria-label={isFavorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
					>
						<i className={`bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true" />
					</button>
					{isSpecialToeic ? (
						// Luyện tập button for free TOEIC items
						<Link to={`/exams`} className="btn-practice" onClick={(e) => { e.stopPropagation(); }}>
							Luyện tập
						</Link>
					) : (
						<button type="button" onClick={() => onAction && onAction(product)} aria-label={`Thêm ${product.title} vào giỏ`}><i className="bi bi-cart-plus" aria-hidden="true" /></button>
					)}
				</div>
			</div>
		</article>
	);
}

