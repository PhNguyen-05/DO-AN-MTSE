const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');
const { articles: fallbackArticles } = require('../data/catalogueFallbackData');

const normalizeType = (type) => {
  const raw = String(type || '').trim().toLowerCase();
  if (!raw) return 'Bài viết';
  if (/^(tin\s*tức|tin tuc|news|announcement|announcements|thông báo|thong bao)$/.test(raw)) return 'Tin tức';
  if (/^(bài viết|bai viet|blog|article|articles|post|posts)$/.test(raw)) return 'Bài viết';
  if (raw.includes('tin') || raw.includes('announce') || raw.includes('thong bao')) return 'Tin tức';
  if (raw.includes('bài') || raw.includes('viet') || raw.includes('blog') || raw.includes('article')) return 'Bài viết';
  return String(type).trim();
};

const estimateReadMinutes = (content) => {
  const text = Array.isArray(content)
    ? content.join(' ')
    : typeof content === 'string'
      ? content
      : '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
};

const getPostImage = (post) => (
  post.image ||
  post.imageUrl ||
  post.image_url ||
  post.coverImage ||
  post.cover_image ||
  post.thumbnailUrl ||
  post.thumbnail_url ||
  post.thumbnail ||
  post.thumb ||
  ''
);

const normalizeBlogPost = (post, includeContent = false) => {
  const contentValue = includeContent
    ? Array.isArray(post.content)
      ? post.content
      : String(post.content || '').split(/\n+/).filter(Boolean)
    : undefined;

  const publishedAt = post.publishedAt || post.createdAt || post.updatedAt || null;
  const title = post.title || post.slug || 'Bài viết';
  const excerpt = post.excerpt || (typeof post.content === 'string' ? post.content.slice(0, 220) : '');
  const type = normalizeType(post.type || post.category || 'Bài viết');

  return {
    id: String(post._id || post.slug || title),
    slug: post.slug || undefined,
    title,
    excerpt,
    category: post.category || type,
    type,
    date: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    readMinutes: post.readMinutes || estimateReadMinutes(post.content),
    views: Number(post.viewCount || post.views || 0),
    image: getPostImage(post),
    tags: Array.isArray(post.tags) ? post.tags : [],
    author: typeof post.author === 'string' ? post.author : post.author?.name || post.author || 'Academic Hub',
    status: post.status || '',
    publishedAt,
    content: includeContent ? contentValue : undefined,
  };
};

const buildPublishedQuery = () => ({
  $and: [
    {
      $or: [
        { status: { $regex: /^(approved|published|active)$/i } },
        { status: { $exists: false } },
        { status: null }
      ]
    },
    {
      $or: [
        { publishedAt: { $lte: new Date() } },
        { publishedAt: { $exists: false } },
        { publishedAt: null }
      ]
    }
  ]
});

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildTypeFilter = (type) => {
  const normalized = normalizeType(type);
  if (normalized === 'Tin tức') {
    return {
      $or: [
        { type: { $regex: /^(tin\s*tức|tin tuc|news|announcement|announcements|thông báo|thong bao)$/i } },
        { category: { $regex: /^(tin\s*tức|tin tuc|news|announcement|announcements|thông báo|thong bao)$/i } }
      ]
    };
  }
  if (normalized === 'Bài viết') {
    return {
      $or: [
        { type: { $regex: /^(bài viết|bai viet|blog|article|articles|post|posts)$/i } },
        { category: { $regex: /^(bài viết|bai viet|blog|article|articles|post|posts)$/i } },
        { type: { $in: [null, ''] } },
        { type: { $exists: false } }
      ]
    };
  }
  return {
    $or: [
      { type: { $regex: new RegExp(`^${escapeRegex(type)}$`, 'i') } },
      { type: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, 'i') } },
      { category: { $regex: new RegExp(`^${escapeRegex(type)}$`, 'i') } },
      { category: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, 'i') } }
    ]
  };
};

const listBlogPosts = async (req, res, next) => {
  try {
    const { type, limit = 20 } = req.query;
    const query = buildPublishedQuery();

    if (type) {
      query.$and.push(buildTypeFilter(type));
    }

    const keyword = String(req.query.keyword || '').trim();
    if (keyword) {
      const regex = new RegExp(escapeRegex(keyword), 'i');
      query.$and.push({
        $or: [
          { title: regex },
          { excerpt: regex },
          { category: regex },
          { type: regex },
          { tags: regex },
          { content: regex }
        ]
      });
    }

    const count = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 20;
    const docs = await BlogPost.find(query)
      .sort({ publishedAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(count)
      .lean();

    let articles = docs.map((doc) => normalizeBlogPost(doc, false));

    if (!articles.length) {
      let fallback = fallbackArticles.slice(0, count).map((item) => ({
        id: item.id || item.title,
        title: item.title,
        excerpt: item.summary || item.excerpt || '',
        category: item.category || item.type || 'Tin tức',
        type: normalizeType(item.type || item.category),
        date: item.date || new Date().toISOString(),
        readMinutes: item.readMinutes || 1,
        views: item.views || 0,
        image: item.image || '',
        tags: item.tags || [],
      }));

      if (type) {
        const normalizedFilter = normalizeType(type);
        fallback = fallback.filter((item) => normalizeType(item.type || item.category) === normalizedFilter);
      }

      if (keyword) {
        const normalizedKeyword = keyword.toLowerCase();
        fallback = fallback.filter((item) => {
          const searchableText = [
            item.title,
            item.excerpt,
            item.category,
            item.type,
            ...(item.tags || [])
          ].join(' ').toLowerCase();
          return searchableText.includes(normalizedKeyword);
        });
      }

      articles = fallback;
    }

    res.json({ articles });
  } catch (error) {
    next(error);
  }
};

const getBlogPostById = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const conditions = [ { slug: articleId } ];

    if (mongoose.isValidObjectId(articleId)) {
      conditions.unshift({ _id: articleId });
    }

    const query = {
      $and: [
        buildPublishedQuery(),
        { $or: conditions }
      ]
    };

    const post = await BlogPost.findOne(query).lean();

    if (!post) {
      const fallback = fallbackArticles.find((item) => item.id === articleId || item.slug === articleId);
      if (fallback) {
        return res.json({ article: normalizeBlogPost(fallback, true) });
      }
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    try {
      await BlogPost.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } });
    } catch (err) {
      // ignore view count update failure
    }

    res.json({ article: normalizeBlogPost(post, true) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBlogPosts,
  getBlogPostById
};
