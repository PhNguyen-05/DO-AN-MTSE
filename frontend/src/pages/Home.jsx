import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api, getApiMessage, getAuthorizationHeader } from "../services/api.js";
import AcademicLayout from "../components/AcademicLayout.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { getLocalStorage, setLocalStorage } from '../utils/storage.js';
import { articles as fallbackArticles } from '../data/articles.js';

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const compactNumberFormatter = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });
const HERO_IMAGE = "https://lh3.googleusercontent.com/aida/AP1WRLt_yxa7EhZw8Q8_LzPf2Kd3TfwRGdcEM1ofXKn5TzH6lkYPN67loyQDBE5-ccyTrxRTIpLhE0cGpSbXcY4bN91-pUqD6QEnB148gcwQT1btlP0x3LELmXLI8zOZS2jnlYW_mG4ubRAzUgH1DXAUQSQ5uuo9QqGvPYSAAhxfkHOmUU9IqJVBIPX7v-4CKDCRf9ZInKkiaFl4m05qmTkycwWzJbz4evU736fZvdBZI7ivWY2AqtONmvA0";
const PRODUCT_IMAGES = { full: HERO_IMAGE, listening: HERO_IMAGE, reading: HERO_IMAGE, vocabulary: HERO_IMAGE };

const formatCurrency = (value) => currencyFormatter.format(value || 0);
const formatCompactNumber = (value) => compactNumberFormatter.format(value || 0);

const getProductImage = (product) => {
  if (!product) return null;
  return product.image || product.imageUrl || product.image_url || product.thumbnail || product.thumb || product.cover || product.coverImage || PRODUCT_IMAGES[product.skill] || PRODUCT_IMAGES.full;
};

const buildProductParams = (filters, page, limit = 8) => {
  const params = { page, limit };
  if (filters.sort) params.sort = filters.sort;
  if (filters.keyword && filters.keyword.trim()) params.keyword = filters.keyword.trim();
  if (filters.category !== "all") params.category = filters.category;
  if (filters.skill !== "all") params.skill = filters.skill;
  if (filters.type !== "all") params.type = filters.type;
  if (filters.year !== "all") params.year = Number(filters.year);
  if (filters.rating !== "all" && filters.rating !== "") params.rating = Number(filters.rating);
  if (filters.minPrice !== "" && filters.minPrice !== null && filters.minPrice !== undefined) {
    const v = Number(filters.minPrice);
    if (!Number.isNaN(v)) params.minPrice = v;
  }
  if (filters.maxPrice !== "" && filters.maxPrice !== null && filters.maxPrice !== undefined) {
    const v = Number(filters.maxPrice);
    if (!Number.isNaN(v)) params.maxPrice = v;
  }
  return params;
};

const DEFAULT_FILTERS = {
  keyword: "",
  category: "all",
  skill: "all",
  type: "all",
  year: "all",
  rating: "all",
  minPrice: "",
  maxPrice: "",
  sort: "",
  priceRange: "any"
};

const getProductIcon = (product) => {
  if (product.skill === "listening") return "bi-headphones";
  if (product.skill === "reading") return "bi-pencil-square";
  if (product.skill === "vocabulary") return "bi-layers";
  return "bi-journal-bookmark";
};





function HorizontalShelf({ title, subtitle, endpoint, icon, onAction, extraParams = {}, perPage = 5, favoriteIds = new Set(), onToggleFavorite }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasMore: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async (page) => {
    try {
      setLoading(true);
      setError("");
      const params = { ...(extraParams || {}), page, limit: perPage };
      const response = await api.get(endpoint, { params });
      setItems(response.data.items || []);
      setPagination(response.data.pagination || { page, totalPages: 1, hasMore: false });
    } catch (err) {
      setError(getApiMessage(err, "Không thể tải sản phẩm."));
    } finally {
      setLoading(false);
    }
  }, [endpoint, extraParams, perPage]);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const carouselRef = useRef(null);

  const scrollContainer = (ref, dir = 1) => {
    if (!ref || !ref.current) return;
    const el = ref.current;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const targetLeft = Math.min(Math.max(el.scrollLeft + dir * Math.round(el.clientWidth * 0.9), 0), maxScrollLeft);
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  return (
    <section className="academic-section">
      <div className="academic-section-heading">
        <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
        <div className="academic-shelf-actions" aria-label={`Điều hướng ${title}`}>
          <button type="button" aria-label="Cuộn trái" disabled={loading} onClick={() => scrollContainer(carouselRef, -1)}><i className="bi bi-chevron-left" aria-hidden="true" /></button>
          <button type="button" aria-label="Cuộn phải" disabled={loading} onClick={() => scrollContainer(carouselRef, 1)}><i className="bi bi-chevron-right" aria-hidden="true" /></button>
        </div>
      </div>

      {error && <div className="academic-alert">{error}</div>}

      <div className="academic-carousel hide-scrollbar" ref={carouselRef} aria-busy={loading}>
        {loading && !items.length ? Array.from({ length: 4 }).map((_, i) => <div className="academic-product-card academic-skeleton" key={i} />) : items.map((p) => <ProductCard product={p} onAction={onAction} isFavorited={favoriteIds.has(p.id)} onToggleFavorite={onToggleFavorite} key={`${icon}-${p.id}`} />)}
      </div>
      <div className="academic-dots" aria-hidden="true">{Array.from({ length: Math.min(pagination.totalPages, 4) }).map((_, i) => <span className={i + 1 === pagination.page ? "active" : ""} key={`${icon}-dot-${i}`} />)}</div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState("");
  const [notice, setNotice] = useState("");
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsError, setNewsError] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productMeta, setProductMeta] = useState({ total: 0, totalPages: 1, hasMore: true });
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const isFiltersActive = useMemo(() => filterKey !== JSON.stringify(DEFAULT_FILTERS), [filterKey]);

  const productsHeading = isFiltersActive ? 'Kết quả lọc' : 'Sản phẩm';

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const response = await api.get("/api/home");
        setHomeData(response.data.data);
      } catch (err) {
        setHomeError(getApiMessage(err, "Không thể tải trang chủ."));
      }
    };
    fetchHome();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError("");
        const response = await api.get('/api/blog', { params: { limit: 6 } });
        setNewsArticles(response.data.articles || []);
      } catch (err) {
        setNewsError(getApiMessage(err, 'Không thể tải tin tức.'));
        setNewsArticles(fallbackArticles.slice(0, 6));
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const fetchFavs = async () => {
      if (!isAuthenticated) { setFavoriteIds(new Set()); return; }
      try {
        const resp = await api.get('/api/favorites', { headers: { Authorization: getAuthorizationHeader() } });
        const ids = new Set((resp.data.items || []).map((p) => p.id));
        setFavoriteIds(ids);
      } catch (err) {
        // ignore fetch favorites errors
      }
    };
    fetchFavs();
  }, [isAuthenticated]);

  const handleToggleFavorite = async (product) => {
    if (!isAuthenticated) { setNotice('Vui lòng đăng nhập để thêm yêu thích.'); return; }
    const id = product.id;
    try {
      if (favoriteIds.has(id)) {
        await api.delete(`/api/favorites/${encodeURIComponent(id)}`, { headers: { Authorization: getAuthorizationHeader() } });
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await api.post('/api/favorites', { productId: id }, { headers: { Authorization: getAuthorizationHeader() } });
        setFavoriteIds((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      // ignore toggle errors
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        setProductLoading(true);
        setProductError("");
        setProductPage(1);
        const params = buildProductParams(filters, 1);
        const response = await api.get("/api/products", { params, signal: controller.signal });
        setProducts(response.data.items || []);
        setProductMeta(response.data.pagination || { total: 0, totalPages: 1, hasMore: false });
      } catch (err) {
        if (err.code !== "ERR_CANCELED") setProductError(getApiMessage(err, "Không thể tải danh sách sản phẩm."));
      } finally {
        if (!controller.signal.aborted) setProductLoading(false);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, [filterKey]);

  const loadMoreProducts = useCallback(async () => {
    if (productLoading || loadingMoreRef.current || !productMeta.hasMore) return;
    const nextPage = productPage + 1;
    try {
      loadingMoreRef.current = true;
      setProductLoading(true);
      setProductError("");
      const moreParams = buildProductParams(filters, nextPage);
      const response = await api.get("/api/products", { params: moreParams });
      setProducts((cur) => [...cur, ...(response.data.items || [])]);
      setProductPage(nextPage);
      setProductMeta(response.data.pagination || productMeta);
    } catch (err) {
      setProductError(getApiMessage(err, "Không thể tải thêm sản phẩm."));
    } finally {
      loadingMoreRef.current = false;
      setProductLoading(false);
    }
  }, [filters, productLoading, productMeta, productPage]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMoreProducts();
    }, { rootMargin: "260px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreProducts]);

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));
  const handlePriceRangeChange = (value) => {
    const map = {
      any: { min: "", max: "" },
      "<100k": { min: "", max: "100000" },
      "100k-300k": { min: "100000", max: "300000" },
      "300k-500k": { min: "300000", max: "500000" },
      ">500k": { min: "500000", max: "" }
    };
    const range = map[value] || map.any;
    setFilters((c) => ({ ...c, priceRange: value, minPrice: range.min, maxPrice: range.max }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleProductAction = (product) => {
    if (!isAuthenticated) { setNotice('Vui lòng đăng nhập để thêm vào giỏ hàng.'); return; }

    try {
      const purchased = getLocalStorage('purchasedItems', []);
      const normalizedPurchased = Array.isArray(purchased) ? purchased.map((id) => String(id || '').trim()) : [];
      if (normalizedPurchased.includes(String(product.id || '').trim())) {
        setNotice('Bạn đã mua sản phẩm này.');
        return;
      }
      const saved = getLocalStorage('cart', []);
      const idx = saved.findIndex((c) => String(c.id) === String(product.id));
      if (idx >= 0) {
        setNotice('Sản phẩm đã có trong giỏ hàng.');
        navigate('/cart');
        return;
      }
      const thumb = product.image || product.imageUrl || product.thumbnail || product.thumb || product.cover || '';
      saved.push({ id: product.id, title: product.title, price: product.price || 0, type: product.type || 'exam', thumbnail: thumb, tone: product.tone || 'blue', quantity: 1 });
      setLocalStorage('cart', saved);
      navigate('/cart');
    } catch (e) {
      setNotice('Không thể thêm vào giỏ hàng.');
    }
  };

  const filtersData = homeData?.filters || { categories: [], years: [], types: [], ratingLevels: [], skills: [] };
  const sortLabels = {
    latest: 'Mới nhất',
    'best-seller': 'Bán chạy nhất',
    'most-viewed': 'Lượt xem nhiều nhất',
    rating: 'Đánh giá cao nhất',
    'price-asc': 'Giá tăng dần',
    'price-desc': 'Giá giảm dần'
  };
  

  return (
    <AcademicLayout onSearch={(q) => updateFilter('keyword', q)} searchValue={filters.keyword}>
      <div>
        {homeError && <div className="academic-alert">{homeError}</div>}
        {notice && <div className="academic-success">{notice}</div>}

        <section className="academic-hero">
          <img src={HERO_IMAGE} alt="Hero Banner" />
          <div className="academic-hero-overlay" />
          <div className="academic-hero-content">
            <span>{homeData?.banners?.[0]?.badge || 'Sự kiện mới'}</span>
            <h2>{homeData?.banners?.[0]?.title || 'Chinh phục TOEIC 900+'}</h2>
            <p>{homeData?.banners?.[0]?.subtitle || 'Tham gia khóa luyện thi chuyên sâu với bộ tài liệu mới nhất.'}</p>
            <div className="academic-hero-actions"><a href="#products">Khám phá ngay</a></div>
          </div>
        </section>

        <section className="academic-filter-bar compact" id="filters">
          <div className="academic-filter-label"><i className="bi bi-sliders" /> <strong>Bộ lọc:</strong></div>

          <div className="academic-filter-row compact-row">
            <select value={filters.priceRange} onChange={(e) => handlePriceRangeChange(e.target.value)} aria-label="Giá (VND)" className="filter-price-select">
              <option value="any">Giá (VND)</option>
              <option value="<100k">&lt; 100.000</option>
              <option value="100k-300k">100.000 - 300.000</option>
              <option value="300k-500k">300.000 - 500.000</option>
              <option value=">500k">&gt; 500.000</option>
            </select>

            <select value={filters.rating} onChange={(e) => updateFilter('rating', e.target.value)} aria-label="Số sao" className="compact-select">
              <option value="all">Số sao</option>
              {[1,2,3,4,5].map((r) => <option value={r} key={`rating-${r}`}>{r} sao</option>)}
            </select>

            <select value={filters.year} onChange={(e) => updateFilter('year', e.target.value)} aria-label="Năm" className="compact-select">
              <option value="all">Năm</option>
              {(filtersData.years || []).map((y) => <option value={y} key={`yr-${y}`}>{y}</option>)}
            </select>

            <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} aria-label="Sắp xếp" className="compact-select">
              <option value="">Sắp xếp</option>
              <option value="latest">Mới nhất</option>
              <option value="best-seller">Bán chạy nhất</option>
              <option value="most-viewed">Lượt xem nhiều nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>

            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
              <button className="academic-clear-filter" type="button" onClick={resetFilters}>Xóa bộ lọc</button>
            </div>
          </div>

          <div className="academic-segmented compact-seg">
            {[
              { id: 'exam', name: 'Đề thi' },
              { id: 'vocabulary', name: 'Từ vựng' }
            ].map((s) => (
              <button
                key={`type-${s.id}`}
                className={filters.type === s.id ? 'active' : ''}
                type="button"
                onClick={() => {
                  updateFilter('type', filters.type === s.id ? 'all' : s.id);
                  // clear conflicting filters
                  updateFilter('skill', 'all');
                  updateFilter('category', 'all');
                }}
              >{s.name}</button>
            ))}
          </div>
        </section>

        {!isFiltersActive && (
          <>
            <HorizontalShelf title="Top 10 đề thi xem nhiều nhất" endpoint="/api/products" extraParams={{ type: 'exam', sort: 'most-viewed' }} perPage={10} icon="viewed" onAction={handleProductAction} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
            <HorizontalShelf title="Top 10 đề thi bán chạy nhất" endpoint="/api/products" extraParams={{ type: 'exam', sort: 'best-seller' }} perPage={10} icon="best" onAction={handleProductAction} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
            <HorizontalShelf title="Top 10 đề thi mới nhất" endpoint="/api/products" extraParams={{ type: 'exam', sort: 'latest' }} perPage={10} icon="new" onAction={handleProductAction} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
            <HorizontalShelf title="Top 10 bộ từ vựng" endpoint="/api/products" extraParams={{ type: 'vocabulary', sort: 'most-viewed' }} perPage={10} icon="vocab" onAction={handleProductAction} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
          </>
        )}

        {isFiltersActive && (
          <section className="academic-section" id="products">
            <div className="academic-section-heading">
              <div><h3>{productsHeading}</h3></div>
              <span className="academic-result-count">{productMeta.total} kết quả</span>
            </div>

            {productError && <div className="academic-alert">{productError}</div>}

            {(!productLoading && productMeta.total === 0) ? (
              <div className="academic-alert">Không tìm thấy kết quả phù hợp.</div>
            ) : (
              <>
                <div className="academic-all-products">{products.map((p) => <ProductCard product={p} onAction={handleProductAction} isFavorited={favoriteIds.has(p.id)} onToggleFavorite={handleToggleFavorite} key={p.id} />)}</div>
                <div ref={sentinelRef} className="lazy-sentinel" aria-hidden="true" />
                {productLoading && <div className="academic-loading"><span className="spinner-border spinner-border-sm" aria-hidden="true" />Đang tải sản phẩm...</div>}
                {!productMeta.hasMore && products.length > 0 && <div className="academic-end-row">Đã hiển thị tất cả sản phẩm phù hợp.</div>}
              </>
            )}
          </section>
        )}

        {!isFiltersActive && (
          <section className="academic-engagement" id="news">
            <div className="academic-news-panel">
              <div className="academic-panel-title is-primary">
                <i className="bi bi-file-earmark-text" aria-hidden="true" />
                <h3>Bài viết mới</h3>
              </div>
              {newsError && <div className="academic-alert">{newsError}</div>}
              {newsLoading && <div className="academic-alert">Đang tải tin tức...</div>}
              {!newsLoading && !newsError && newsArticles.length === 0 ? (
                <div className="academic-alert">Chưa có bài viết hoặc tin tức nào.</div>
              ) : (
                <ul>
                  {(newsArticles || []).slice(0, 4).map((a) => (
                    <li className="is-news" key={a.id}>
                      <Link to={`/blog/${a.id}`}>
                        <div>
                          <h4>{a.title}</h4>
                          <p>{a.excerpt}</p>
                          <time dateTime={a.date}>{new Date(a.date).toLocaleDateString('vi-VN')}</time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="academic-news-panel">
              <div className="academic-panel-title is-tertiary">
                <i className="bi bi-megaphone" aria-hidden="true" />
                <h3>Tin tức nổi bật</h3>
              </div>
              {!newsLoading && !newsError && newsArticles.filter((x) => x.type === 'Tin tức').length === 0 ? (
                <div className="academic-alert">Chưa có tin tức nổi bật nào.</div>
              ) : (
                <ul>
                  {(newsArticles || []).filter((x) => x.type === 'Tin tức').slice(0, 3).map((a) => (
                    <li className="is-news" key={`news-${a.id}`}>
                      <Link to={`/blog/${a.id}`}>
                        <div>
                          <h4>{a.title}</h4>
                          <p>{a.excerpt}</p>
                          <time dateTime={a.date}>{new Date(a.date).toLocaleDateString('vi-VN')}</time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="news-panel-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <Link to="/blog" className="btn btn-outline">Xem tất cả bài viết, tin tức</Link>
            </div>
          </section>
        )}
      </div>
    </AcademicLayout>
  );
}