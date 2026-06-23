import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice.js";
import { api, getApiMessage } from "../services/api.js";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND"
});

const compactNumberFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1
});

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida/AP1WRLt_yxa7EhZw8Q8_LzPf2Kd3TfwRGdcEM1ofXKn5TzH6lkYPN67loyQDBE5-ccyTrxRTIpLhE0cGpSbXcY4bN91-pUqD6QEnB148gcwQT1btlP0x3LELmXLI8zOZS2jnlYW_mG4ubRAzUgH1DXAUQSQ5uuo9QqGvPYSAAhxfkHOmUU9IqJVBIPX7v-4CKDCRf9ZInKkiaFl4m05qmTkycwWzJbz4evU736fZvdBZI7ivWY2AqtONmvA0";

const PRODUCT_IMAGES = {
  full: "https://lh3.googleusercontent.com/aida/AP1WRLtGejb_G56pZy6K_iQCOxCW3NWPgBJ_PrKlkHOrgX7Bw__OA2oDASwVv43PVo_YQhmjuUmWodyUiy07JDjIQsWRuajd8yysY0Y6qIwLkxzan8ztEoS-gar7SOuTKkvqw5lamzR3bI0XlgoiUT1EmDtjsGyHp0hScR3YHxPoVXYKmzJNj8Zem5cduuKN8X2LvatFcQn8K0d1ZhlpDMZ5_ZqW3TaO7KoYe5Bbf4D8l-CrygIchSHtxRrw",
  listening: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkqJKh8bJIZ3RD-kV571_qmYoOUPWHOYPg5hcYendab9uWT5ENJugKOIm1mpwP7z5KIbOMP-Jbv-nA84ANelYQ9Raxu7jUL1KPBCVM5NDafpNIk0_jsqbkyFja3Ldwvwkq7y_a4A5hCqp79jTL1bMT05g6k5-oWK6lIPRKdePUNP-oHoeCtN5V7Vv7Kw0dsLL4hfgg-CWjmwm0wuUjYaygsyC_erCs9RQm0y1Tgt5MhKPAwjKCK8FJBmUYTFKNiZOOWLdpW5BA",
  reading: "https://lh3.googleusercontent.com/aida-public/AB6AXuDT01WxlnmNPy8_r9tHwIMRrmg8gCI4-U2H-0Qjf_QqFeTXcSSZcdLDRcK1TyomYnzihM9aCo0vgEFm6ucYzgMDoDs8Y4KRlr6M1dMu__5d-q73XqmE5x_mdTn_19Ejrbkv5BSEm_TBfZgkeW6lQGwUoa0K2lNf8G0idt1gxSMiGBJSKOx8Ril-jO5W6UMGnjINIdnXuHtnzAmJEsIFh_IAJEDUQ2mGFB58jYO2KKxdtY1tL0qarfrhEMKXVQPrcafy7uZBBNAl",
  vocabulary: "https://lh3.googleusercontent.com/aida-public/AB6AXuClXB2FRl-BDDlfc-0zmJetbcLuuHz68A1QuICDo6LJnHoue4SIuGOEMLbnmK6-aQoRgNp825_ipT5zcDRIrTY9qTqt6Qu4G-rkJt9Tu4ei2noOQqoN2dl_0Jnaxzefyj8xYo3GZykX801IWSJ7Tukdxf5-pBeqz8WGVc9z_SDXBypId7p2kqiTMFx2pvgSRlYmPYjeZGabCdQp4EzVMDSFuz5aRPvvKAGYePAbTIIzMROMVfpc9Sb-lDazoM9qqwMHn6a3Sflp"
};

const formatCurrency = (value) => currencyFormatter.format(value || 0);
const formatCompactNumber = (value) => compactNumberFormatter.format(value || 0);

const buildProductParams = (filters, page, limit = 8) => {
  const params = { page, limit, sort: filters.sort };

  if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
  if (filters.category !== "all") params.category = filters.category;
  if (filters.skill !== "all") params.skill = filters.skill;
  if (filters.type !== "all") params.type = filters.type;
  if (filters.year !== "all") params.year = filters.year;
  if (filters.minRating !== "all") params.minRating = filters.minRating;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;

  return params;
};

const getProductIcon = (product) => {
  if (product.skill === "listening") return "bi-headphones";
  if (product.skill === "reading") return "bi-pencil-square";
  if (product.skill === "vocabulary") return "bi-layers";
  return "bi-journal-bookmark";
};

const getProductImage = (product) => PRODUCT_IMAGES[product.skill] || PRODUCT_IMAGES.full;

function ProductCard({ product, onAction }) {
  return (
    <article className={`academic-product-card product-tone-${product.tone || "blue"}`}>
      <div className="academic-product-media">
        <div className="academic-product-image">
          <div className="academic-product-art">
            <i className={`bi ${getProductIcon(product)}`} aria-hidden="true" />
            <strong>{product.categoryLabel}</strong>
          </div>
          <img
            src={getProductImage(product)}
            alt={product.title}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        </div>
        <div className="academic-rating">
          <i className="bi bi-star-fill" aria-hidden="true" />
          <span>{product.rating}</span>
        </div>
      </div>

      <h4>{product.title}</h4>
      <p>{product.categoryName} - {product.year}</p>

      <div className="academic-card-meta">
        <span><i className="bi bi-people" aria-hidden="true" /> {formatCompactNumber(product.sold || 0)} bán</span>
        <span><i className="bi bi-eye" aria-hidden="true" /> {formatCompactNumber(product.views || 0)}</span>
      </div>

      <div className="academic-card-footer">
        <span>{formatCurrency(product.price)}</span>
        <button type="button" onClick={() => onAction(product)} aria-label={`Thêm ${product.title} vào giỏ`}>
          <i className="bi bi-cart-plus" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function HorizontalShelf({ title, subtitle, endpoint, icon, onAction }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async (page) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(endpoint, {
        params: { page, limit: 5 }
      });

      setItems(response.data.items || []);
      setPagination(response.data.pagination || {
        page,
        totalPages: 1,
        hasMore: false
      });
    } catch (err) {
      setError(getApiMessage(err, "Không thể tải sản phẩm."));
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return (
    <section className="academic-section">
      <div className="academic-section-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="academic-shelf-actions" aria-label={`Điều hướng ${title}`}>
          <button
            type="button"
            aria-label="Trang trước"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchPage(pagination.page - 1)}
          >
            <i className="bi bi-chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Trang sau"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchPage(pagination.page + 1)}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && <div className="academic-alert">{error}</div>}

      <div className="academic-carousel hide-scrollbar" aria-busy={loading}>
        {loading && !items.length
          ? Array.from({ length: 4 }).map((_, index) => (
            <div className="academic-product-card academic-skeleton" key={index} />
          ))
          : items.map((product) => (
            <ProductCard product={product} onAction={onAction} key={`${icon}-${product.id}`} />
          ))}
      </div>

      <div className="academic-dots" aria-hidden="true">
        {Array.from({ length: Math.min(pagination.totalPages, 4) }).map((_, index) => (
          <span className={index + 1 === pagination.page ? "active" : ""} key={`${icon}-dot-${index}`} />
        ))}
      </div>
    </section>
  );
}

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState("");
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    category: "all",
    skill: "all",
    type: "all",
    year: "all",
    minRating: "all",
    minPrice: "",
    maxPrice: "",
    sort: "latest"
  });
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productMeta, setProductMeta] = useState({
    total: 0,
    totalPages: 1,
    hasMore: true
  });
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const response = await api.get("/api/home");
        setHomeData(response.data.data);
      } catch (error) {
        setHomeError(getApiMessage(error, "Không thể tải trang chủ."));
      }
    };

    fetchHome();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setProductLoading(true);
        setProductError("");
        setProductPage(1);
        const response = await api.get("/api/products", {
          params: buildProductParams(filters, 1),
          signal: controller.signal
        });

        setProducts(response.data.items || []);
        setProductMeta(response.data.pagination || {
          total: 0,
          totalPages: 1,
          hasMore: false
        });
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setProductError(getApiMessage(error, "Không thể tải danh sách sản phẩm."));
        }
      } finally {
        if (!controller.signal.aborted) {
          setProductLoading(false);
        }
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
      const response = await api.get("/api/products", {
        params: buildProductParams(filters, nextPage)
      });

      setProducts((current) => [...current, ...(response.data.items || [])]);
      setProductPage(nextPage);
      setProductMeta(response.data.pagination || productMeta);
    } catch (error) {
      setProductError(getApiMessage(error, "Không thể tải thêm sản phẩm."));
    } finally {
      loadingMoreRef.current = false;
      setProductLoading(false);
    }
  }, [filters, productLoading, productMeta, productPage]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMoreProducts();
      }
    }, {
      rootMargin: "260px"
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreProducts]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: "",
      category: "all",
      skill: "all",
      type: "all",
      year: "all",
      minRating: "all",
      minPrice: "",
      maxPrice: "",
      sort: "latest"
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const handleProductAction = (product) => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }

    setNotice(`Đã chọn ${product.title}. Bạn có thể tiếp tục ở khu vực thành viên.`);
  };

  const filtersData = homeData?.filters || {
    categories: [],
    years: [],
    types: [],
    ratingLevels: []
  };
  const latestProducts = homeData?.latestProducts || [];
  const featuredProduct = latestProducts[0] || products[0];
  const secondaryLatestProducts = latestProducts.slice(1, 5);

  return (
    <div className="academic-shell">
      <aside className="academic-sidebar">
        <Link className="academic-brand" to="/">
          <div className="academic-brand-mark">
            <i className="bi bi-mortarboard" aria-hidden="true" />
          </div>
          <div>
            <h1>Academic Hub</h1>
            <p>StudyPro Platform</p>
          </div>
        </Link>

        <nav className="academic-side-nav" aria-label="Điều hướng bên">
          <a className="active" href="#home">
            <i className="bi bi-house-door-fill" aria-hidden="true" />
            <span>Home</span>
          </a>
          <a href="#products">
            <i className="bi bi-journal-bookmark" aria-hidden="true" />
            <span>Library</span>
          </a>
          <a href="#best-sellers">
            <i className="bi bi-clock-history" aria-hidden="true" />
            <span>History</span>
          </a>
          {isAuthenticated && (
            <Link to="/profile">
              <i className="bi bi-person" aria-hidden="true" />
              <span>Profile</span>
            </Link>
          )}
        </nav>

        {isAuthenticated && (
          <button className="academic-logout" type="button" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            <span>Logout</span>
          </button>
        )}
      </aside>

      <main className="academic-main" id="home">
        <header className="academic-topbar">
          <label className="academic-global-search" htmlFor="global-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              id="global-search"
              type="search"
              value={filters.keyword}
              placeholder="Tìm kiếm tài liệu, bộ đề..."
              onChange={(event) => updateFilter("keyword", event.target.value)}
            />
          </label>

          <div className="academic-top-actions">
            {isAuthenticated ? (
              <>
                <button type="button" aria-label="Thông báo">
                  <i className="bi bi-bell" aria-hidden="true" />
                  <span />
                </button>
                <button type="button" aria-label="Cài đặt">
                  <i className="bi bi-gear" aria-hidden="true" />
                </button>
                <div className="academic-member-chip">
                  <span>Xin chào</span>
                  <strong>{user?.name || "Học viên"}</strong>
                </div>
                <Link className="academic-avatar" to="/profile" aria-label="Hồ sơ">
                  <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </Link>
              </>
            ) : (
              <>
                <Link className="academic-top-login" to="/login">Đăng nhập</Link>
                <Link className="academic-top-register" to="/register">Đăng ký</Link>
              </>
            )}
          </div>
        </header>

        <div className="academic-content">
          {homeError && <div className="academic-alert">{homeError}</div>}
          {notice && <div className="academic-success">{notice}</div>}

          <section className="academic-hero">
            <img src={HERO_IMAGE} alt="Hero Banner" />
            <div className="academic-hero-overlay" />
            <div className="academic-hero-content">
              <span>{homeData?.banners?.[0]?.badge || "Sự kiện mới"}</span>
              <h2>{homeData?.banners?.[0]?.title || "Chinh phục TOEIC 900+"}</h2>
              <p>{homeData?.banners?.[0]?.subtitle || "Tham gia khóa luyện thi chuyên sâu với bộ tài liệu mới nhất."}</p>
              <div className="academic-hero-actions">
                <a href="#products">Khám phá ngay</a>
              </div>
            </div>
          </section>
 

          <section className="academic-filter-bar" id="filters">
            <div className="academic-filter-title">
              <i className="bi bi-sliders" aria-hidden="true" />
              <span>Bộ lọc:</span>
            </div>

            <select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)} aria-label="Danh mục">
              <option value="all">Tất cả danh mục</option>
              {filtersData.categories.map((category) => (
                <option value={category.id} key={category.id}>{category.name}</option>
              ))}
            </select>

            <select value={filters.type} onChange={(event) => updateFilter("type", event.target.value)} aria-label="Loại sản phẩm">
              <option value="all">Đề thi & từ vựng</option>
              {filtersData.types.map((type) => (
                <option value={type.id} key={type.id}>{type.name}</option>
              ))}
            </select>

            <select value={filters.minRating} onChange={(event) => updateFilter("minRating", event.target.value)} aria-label="Số sao">
              <option value="all">Số sao</option>
              {filtersData.ratingLevels.map((rating) => (
                <option value={rating} key={rating}>Từ {rating} sao</option>
              ))}
            </select>

            <select value={filters.year} onChange={(event) => updateFilter("year", event.target.value)} aria-label="Năm">
              <option value="all">Năm</option>
              {filtersData.years.map((year) => (
                <option value={year} key={year}>{year}</option>
              ))}
            </select>

            <div className="academic-price-range" aria-label="Khoảng giá">
              <input
                type="number"
                min="0"
                step="10000"
                value={filters.minPrice}
                placeholder="Giá từ"
                onChange={(event) => updateFilter("minPrice", event.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                step="10000"
                value={filters.maxPrice}
                placeholder="Đến"
                onChange={(event) => updateFilter("maxPrice", event.target.value)}
              />
            </div>

            <div className="academic-segmented">
              <button
                className={filters.skill === "listening" ? "active" : ""}
                type="button"
                onClick={() => updateFilter("skill", filters.skill === "listening" ? "all" : "listening")}
              >
                Nghe (Listening)
              </button>
              <button
                className={filters.skill === "reading" ? "active" : ""}
                type="button"
                onClick={() => updateFilter("skill", filters.skill === "reading" ? "all" : "reading")}
              >
                Đọc (Reading)
              </button>
            </div>

            <select className="academic-sort-select" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)} aria-label="Sắp xếp">
              <option value="latest">Mới nhất</option>
              <option value="best-seller">Bán chạy</option>
              <option value="most-viewed">Xem nhiều</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>

            <button className="academic-clear-filter" type="button" onClick={resetFilters}>Xóa bộ lọc</button>
          </section>

          <div id="best-sellers">
            <HorizontalShelf
              title="10 Sản phẩm bán chạy nhất"
              subtitle="Được học viên tin dùng nhiều nhất tháng này"
              endpoint="/api/products/best-sellers"
              icon="best"
              onAction={handleProductAction}
            />
          </div>

          <HorizontalShelf
            title="10 Sản phẩm xem nhiều nhất"
            endpoint="/api/products/most-viewed"
            icon="viewed"
            onAction={handleProductAction}
          />

          <section className="academic-section" id="products">
            <div className="academic-section-heading">
              <div>
                <h3>Sản phẩm mới nhất</h3>
                <p>Lazy loading tự tải thêm khi kéo xuống cuối trang.</p>
              </div>
              <span className="academic-result-count">{productMeta.total} kết quả</span>
            </div>

            {featuredProduct && (
              <div className="academic-latest-grid">
                <article className={`academic-featured-product product-tone-${featuredProduct.tone || "blue"}`}>
                  <div className="academic-featured-art">
                    <img
                      src={getProductImage(featuredProduct)}
                      alt={featuredProduct.title}
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                    <i className={`bi ${getProductIcon(featuredProduct)}`} aria-hidden="true" />
                  </div>
                  <div>
                    <span>Mới ra mắt</span>
                    <h4>{featuredProduct.title}</h4>
                    <p>{featuredProduct.subtitle}</p>
                    <div className="academic-featured-actions">
                      <strong>{formatCurrency(featuredProduct.price)}</strong>
                      <button type="button" onClick={() => handleProductAction(featuredProduct)}>
                        {isAuthenticated ? "Thêm vào giỏ" : "Đăng ký để mua"}
                      </button>
                    </div>
                  </div>
                </article>

                {secondaryLatestProducts.map((product) => (
                  <ProductCard product={product} onAction={handleProductAction} key={`latest-${product.id}`} />
                ))}
              </div>
            )}

            {productError && <div className="academic-alert">{productError}</div>}

            <div className="academic-all-products">
              {products.map((product) => (
                <ProductCard product={product} onAction={handleProductAction} key={product.id} />
              ))}
            </div>

            <div ref={sentinelRef} className="lazy-sentinel" aria-hidden="true" />

            {productLoading && (
              <div className="academic-loading">
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                Đang tải sản phẩm...
              </div>
            )}

            {!productMeta.hasMore && products.length > 0 && (
              <div className="academic-end-row">Đã hiển thị tất cả sản phẩm phù hợp.</div>
            )}
          </section>

          <section className="academic-engagement" id="news">
            <div className="academic-news-panel">
              <div className="academic-panel-title is-primary">
                <i className="bi bi-file-earmark-text" aria-hidden="true" />
                <h3>Bài viết mới</h3>
              </div>
              <ul>
                {(homeData?.articles || []).slice(0, 2).map((article) => (
                  <li key={article.id}>
                    <div className="academic-thumb"><i className="bi bi-journal-text" aria-hidden="true" /></div>
                    <div>
                      <h4>{article.title}</h4>
                      <p>{new Date(article.date).toLocaleDateString("vi-VN")} - {article.readMinutes} phút đọc</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button">Xem tất cả bài viết</button>
            </div>

            <div className="academic-news-panel">
              <div className="academic-panel-title is-tertiary">
                <i className="bi bi-megaphone" aria-hidden="true" />
                <h3>Tin tức nổi bật</h3>
              </div>
              <ul>
                {(homeData?.articles || []).slice(1, 3).map((article) => (
                  <li className="is-news" key={`news-${article.id}`}>
                    <div>
                      <h4>{article.title}</h4>
                      <p>{article.summary}</p>
                      <time dateTime={article.date}>{new Date(article.date).toLocaleDateString("vi-VN")}</time>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;
