# Blog Pages

The blog is a content marketing surface with a listing page and a detail page. It is backed by `blogService` (a public, no-auth API), coordinated across components by `BlogDataContext`, and rendered through section components in `src/components/blog/`. The listing supports category, tag, and pagination query params and cross-links to the Gurugram guides and tools.

## Key Files

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/blog` | `src/pages/blogs/BlogClassic.jsx` | Blog listing with category/tag/page filters |
| `/blog/:title` | `src/pages/blogs/BlogDetails.jsx` | Blog post detail (dynamic) |

Supporting files:

| File | Purpose |
|------|---------|
| `src/services/blogService.js` | Public blog API: posts, categories, tags |
| `src/contextApi/BlogDataContext.jsx` | Shares posts, categories, current post between blog components |
| `src/components/blog/BlogClassicSection.jsx` | Listing body: posts grid, sidebar, pagination |
| `src/components/blog/BlogDetailsSection.jsx` | Detail body: article, comments, related posts |
| `src/components/blog/BlogClassicItem.jsx` | Blog card on the listing |
| `src/components/blog/BlogItem.jsx` / `BlogItemTwo.jsx` / `BlogItemThree.jsx` | Blog card variants used on home and section pages |
| `src/common/BlogKeyword.jsx` | Tag/chip component |
| `src/common/BlogNextPrev.jsx` | Next/previous post navigation |
| `src/common/Comment.jsx` / `CommentForm.jsx` | Comment display and submission |

## Page Details

### BlogClassic (`/blog`)

The blog listing page. Reads `category`, `tag`, and `page` from `useSearchParams` and fetches posts through `blogService.getPosts({ page, limit: 10, category, tag })`. Tracks `totalPages` for pagination. In parallel, fetches four recent posts for a "popular posts" sidebar and exposes a keyword search box that redirects to `/properties` when no blog match is found (a deliberate funnel into property search).

Renders `BlogClassicSection` inside the standard `Header` / `Footer` / `MobileMenu` / `OffCanvas` shell. Cross-links to three featured guide buckets defined in the `blog` namespace:

- Market Reports (`/gurugram-real-estate-guide`, `/property-investment-gurugram`)
- Locality Research (`/localities`, `/properties`)
- Planning Tools (calculator/tool links)

SEO emits a `BreadcrumbList` and uses locale-aware canonical/prev/next URLs built with `localizePath` and `stripLocalePrefix` from `src/i18n/I18nLink`. A colocated `BlogClassic.ssr.test.jsx` guards prerender.

### BlogDetails (`/blog/:title`)

A thin route component that mounts `BlogDetailsSection`. The section reads the post identifier from `useParams`, fetches the post via `blogService.getPostByIdentifier`, and coordinates with `BlogDataContext` to share the current post, categories, and related posts with sidebar widgets. Renders the article body (markdown via `react-markdown` + `remark-gfm`), `BlogNextPrev` for adjacent posts, `BlogKeyword` chips, and `Comment` / `CommentForm` for discussion. Includes a `BlogTesti` testimonial block and `Cta`.

## BlogDataContext

`src/contextApi/BlogDataContext.jsx` is the legacy React Context that carries blog posts, categories, and the current post between the section, sidebar, and detail components. Zustand is the primary state library elsewhere, but blog UI state flows through this context because it is scoped to the blog subtree. Do not migrate it to a global store; it is intentionally local.

## Blog Service

`blogService.js` is a public, no-auth service built on the plain Axios instance (not `api.js`). Methods:

```js
getPosts(params)                    // GET /blog/posts
getPostByIdentifier(identifier)     // GET /blog/posts/{id|slug}
getCategories(params)               // GET /blog/categories
getCategoryByIdentifier(identifier) // GET /blog/categories/{id|slug}
getTags(params)                     // GET /blog/tags
getTagByIdentifier(identifier)      // GET /blog/tags/{id|slug}
```

All methods use the shared `extractError` helper. Because the service is public, blog pages render for anonymous users.

## Categories and Tags

The listing accepts `?category=` and `?tag=` query params. The sidebar lists categories and tags fetched through `blogService`, and each chip links back to `/blog?category=<slug>` or `/blog?tag=<slug>`. The listing re-fetches posts whenever the category or tag changes.

## Comments

Comments are rendered by `src/common/Comment.jsx` and submitted through `src/common/CommentForm.jsx`. Submission goes through the blog service (or a dedicated comment endpoint) and updates the post's comment list. The comment UI is gated for authenticated users; anonymous users see a prompt to log in.

## SEO and Indexation

- Listing: `BreadcrumbList`, locale-aware canonical, `prev`/`next` pagination.
- Detail: `Article` schema with author/publisher, `BreadcrumbList`, and `Speakable` for voice assistants.
- Both pages use the `blog` i18next namespace for all copy.

See [Property Search](../features/Property-Search) for the listing-to-search funnel, and [SEO & Programmatic](../features/SEO-Programmatic) for how blog URLs appear in sitemaps.
