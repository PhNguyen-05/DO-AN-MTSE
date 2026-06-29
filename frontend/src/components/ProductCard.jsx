import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hasPremiumAccess } from '../utils/storage.js';
import { checkProductPurchased, resolvePackageType } from '../utils/purchase.js';
import { canPracticeProduct, getProductPriceLabel, isFreeToeicExam } from '../utils/product.js';

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const compactNumberFormatter = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });
const formatCurrency = (v) => currencyFormatter.format(v || 0);
const formatCompact = (v) => compactNumberFormatter.format(v || 0);

const getProductIcon = (product) => {
	if (!product) return 'bi-journal-bookmark';
	if (product.skill === 'listening') return 'bi-headphones';
	if (product.skill === 'reading') return 'bi-pencil-square';
	if (product.skill === 'vocabulary') return 'bi-layers';
	return 'bi-journal-bookmark';
};

const getProductImage = (product) => {
	if (!product) return null;
	return product.image || product.imageUrl || product.image_url || product.thumbnail || product.thumb || product.cover || product.coverImage || null;
};

export default function ProductCard({ product, onAction, isFavorited = false, onToggleFavorite }) {
	const detailPath = product.type === 'vocabulary' ? `/vocabulary/${product.id}` : `/exams/${product.id}`;
	const isExamOrVocab = product && (product.type === 'vocabulary' || product.type === 'exam');
	
	const [isPurchased, setIsPurchased] = useState(false);
	
	useEffect(() => {
		const checkPurchase = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					setIsPurchased(false);
					return;
				}

				const packageType = resolvePackageType(product);
				const purchased = await checkProductPurchased(product.id, packageType);
				setIsPurchased(purchased);
			} catch (error) {
				console.error('Error fetching purchased items:', error);
				setIsPurchased(false);
			}
		};
		
		checkPurchase();

		const onPurchaseUpdated = () => {
			const packageType = resolvePackageType(product);
			checkProductPurchased(product.id, packageType).then(setIsPurchased);
		};

		window.addEventListener('purchase:updated', onPurchaseUpdated);
		return () => window.removeEventListener('purchase:updated', onPurchaseUpdated);
	}, [product.id, product.packageType, product.type]);

	const isPremiumUser = typeof window !== 'undefined' ? hasPremiumAccess() : false;
	const isFreeExam = isFreeToeicExam(product);
	const showPractice = canPracticeProduct({ product, isPurchased, isPremiumUser });
	const priceLabel = getProductPriceLabel({ product, isPurchased, isPremiumUser, formatCurrency });

	return (
		<article className={`academic-product-card product-tone-${product.tone || 'blue'} ${isFreeExam ? 'free-item' : ''}`}>
			<div className="academic-product-media">
				<div className="academic-product-image">
					<div className="academic-product-art">
						<i className={`bi ${getProductIcon(product)}`} aria-hidden="true" />
					</div>
					<Link to={detailPath} aria-label={`Xem chi tiết ${product.title}`}>
						<div className={`academic-product-art product-tone-${product.tone || 'blue'}`} aria-hidden>
							<i className={`bi ${getProductIcon(product)}`} aria-hidden="true" />
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
				<span>{priceLabel}</span>
				<div className="academic-card-actions">
					<button
						type="button"
						className={`favorite-toggle ${isFavorited ? 'is-fav' : 'outline'}`}
						onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite && onToggleFavorite(product); }}
						aria-label={isFavorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
					>
						<i className={`bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true" />
					</button>
					{isExamOrVocab ? (
						showPractice ? (
						  <Link to={detailPath} className="btn-practice" onClick={(e) => { e.stopPropagation(); }}>
							Luyện tập
						  </Link>
						) : (
						  <button type="button" onClick={() => onAction && onAction(product)} aria-label={`Thêm ${product.title} vào giỏ`}><i className="bi bi-cart-plus" aria-hidden="true" /></button>
						)
					) : showPractice ? (
						<Link to={detailPath} className="btn-practice" onClick={(e) => { e.stopPropagation(); }}>
							Luyện tập
						</Link>
					) : isPremiumUser ? (
						null
					) : (
						<button type="button" onClick={() => onAction && onAction(product)} aria-label={`Thêm ${product.title} vào giỏ`}><i className="bi bi-cart-plus" aria-hidden="true" /></button>
					)}
				</div>
			</div>
		</article>
	);
}
