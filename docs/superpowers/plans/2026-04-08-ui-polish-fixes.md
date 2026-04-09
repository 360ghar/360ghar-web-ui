# UI Polish & Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 9 confirmed UI issues across the homepage, property search, and property details pages — including a heading space bug, empty footer links, excessive hero padding, loading skeleton, native datetime input, filter layout, nav overflow, and floating button overlap.

**Architecture:** Targeted edits to ~10 existing files — no new components or libraries introduced. Each task is independent and safe to deploy individually. Screenshots via `npm run dev` on port 5173 are the verification method for visual fixes.

**Tech Stack:** React 18, SCSS (7-1 pattern in `public/assets/sass/`), react-i18next, Bootstrap 5 utilities

---

## File Map

| File | Change |
|------|--------|
| `src/data/HomeThreeData.jsx` | Add trailing space to hero title |
| `public/assets/sass/base/_padding.scss` | Reduce `padding-y-120` desktop value |
| `src/common/layout/footer/FooterUsefulItem.jsx` | Use `useTranslation` to render link text |
| `src/common/layout/footer/FooterServiceItem.jsx` | Use `useTranslation` to render link text |
| `src/common/layout/footer/BottomFooterLinks.jsx` | Use `useTranslation` to render link text |
| `src/pages/properties/PropertyDetails.jsx` | Replace spinner with shimmer skeleton |
| `public/assets/sass/partials/othersPage/_property.scss` | Add shimmer skeleton CSS |
| `src/components/property/PropertyDetailsSection.jsx` | Replace `datetime-local` with split date + time inputs |
| `src/pages/properties/Property.jsx` | Reduce intro section height |
| `src/components/property-filters/PropertyFilters.jsx` | Fix radio/checkbox sizing via inline style |
| `public/assets/sass/layout/_scroll-top.scss` | Offset scroll-to-top to avoid chatbot overlap |
| `src/common/layout/NavMenu.jsx` | Prevent nav from wrapping to two rows |
| `src/common/layout/Header.jsx` | Add default `btnText` to fix icon-only Post Property button |

---

## Task 1: Fix hero heading "toFind" space bug

**Problem:** `bannerThreeContent.title` ends with `"to"` and the adjacent `shapedTitle` `"Find a Home"` renders without a separating space, displaying as "toFind".

**Files:**
- Modify: `src/data/HomeThreeData.jsx:6`

- [ ] **Step 1: Open `src/data/HomeThreeData.jsx` and fix the title**

Change line 6 from:
```js
title: 'India\'s VR-First Way to',
```
To:
```js
title: 'India\'s VR-First Way to ',
```
(add a single trailing space after "to")

- [ ] **Step 2: Verify in browser**

Open `http://localhost:5173`. Hero heading should read "India's VR-First Way to **Find a Home**" with a visible space between "to" and "Find".

- [ ] **Step 3: Commit**
```bash
git add src/data/HomeThreeData.jsx
git commit -m "fix: add missing space between hero title and shapedTitle"
```

---

## Task 2: Reduce hero section vertical padding

**Problem:** `padding-y-120` gives 120px top + 120px bottom at desktop (992px+), making the hero 240px taller than needed and pushing the search bar below the fold.

**Files:**
- Modify: `public/assets/sass/base/_padding.scss:9-12`

- [ ] **Step 1: Open `public/assets/sass/base/_padding.scss` and change the desktop breakpoint value**

Change lines 9–12 from:
```scss
@media (min-width: 992px) {
  padding-top: 120px;
  padding-bottom: 120px;
}
```
To:
```scss
@media (min-width: 992px) {
  padding-top: 80px;
  padding-bottom: 80px;
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:5173`. The hero section should be visibly shorter. The search bar (TabFilter) should be closer to the viewport bottom edge, partially visible without scrolling.

- [ ] **Step 3: Commit**
```bash
git add public/assets/sass/base/_padding.scss
git commit -m "fix: reduce hero padding-y-120 to 80px at desktop to keep search bar near fold"
```

---

## Task 3: Fix empty footer link text (three components)

**Problem:** `footerUsefulLinks`, `footerServiceLinks`, and `BottomFooterLink` data arrays each use a `textKey` property (e.g. `'common:footer.propertySearch'`) but all three footer components read `{item.text}` — which is `undefined` — rendering empty link labels.

**Translation keys exist** in `src/i18n/locales/en/common.json` under the `footer` namespace. The fix is to call `t(link.textKey)` in each component.

**Files:**
- Modify: `src/common/layout/footer/FooterUsefulItem.jsx`
- Modify: `src/common/layout/footer/FooterServiceItem.jsx`
- Modify: `src/common/layout/footer/BottomFooterLinks.jsx`

- [ ] **Step 1: Fix `FooterUsefulItem.jsx`**

Replace the full file content with:
```jsx
import { useTranslation } from 'react-i18next';
import { footerUsefulLinks } from '../../../data/CommonData';
import { I18nLink } from '../../../i18n/I18nLink';

const FooterUsefulItem = () => {
    const { t } = useTranslation();
    return (
        <div className="footer-item ms-xl-5">
            <h6 className="footer-item__title">Useful Links</h6>
            <ul className="footer-menu">
                {footerUsefulLinks.map((link, index) => (
                    <li className="footer-menu__item" key={index}>
                        <I18nLink to={link.link} className="footer-menu__link">
                            {t(link.textKey)}
                        </I18nLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FooterUsefulItem;
```

- [ ] **Step 2: Fix `FooterServiceItem.jsx`**

Replace the full file content with:
```jsx
import { useTranslation } from 'react-i18next';
import { footerServiceLinks } from '../../../data/CommonData';
import { I18nLink } from '../../../i18n/I18nLink';

const FooterServiceItem = () => {
    const { t } = useTranslation();
    return (
        <div className="footer-item">
            <h6 className="footer-item__title">Services</h6>
            <ul className="footer-menu">
                {footerServiceLinks.map((link, index) => (
                    <li className="footer-menu__item" key={index}>
                        <I18nLink to={link.link} className="footer-menu__link">
                            {t(link.textKey)}
                        </I18nLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FooterServiceItem;
```

- [ ] **Step 3: Fix `BottomFooterLinks.jsx`**

Replace the full file content with:
```jsx
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../../i18n/I18nLink';
import { BottomFooterLink } from '../../../data/CommonData';

const BottomFooterLinks = () => {
    const { t } = useTranslation();
    return (
        <div className="footer-links">
            {BottomFooterLink.map((link, index) => (
                <I18nLink to={link.link} className="footer-link" key={index}>
                    {t(link.textKey)}
                </I18nLink>
            ))}
        </div>
    );
};

export default BottomFooterLinks;
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:5173` and scroll to the footer. The "Useful Links", "Services", and bottom copyright bar links should now display readable text (e.g. "Property Listings", "Property Search", "Terms of Service", "Privacy Policy").

- [ ] **Step 5: Commit**
```bash
git add src/common/layout/footer/FooterUsefulItem.jsx \
        src/common/layout/footer/FooterServiceItem.jsx \
        src/common/layout/footer/BottomFooterLinks.jsx
git commit -m "fix: use useTranslation to render footer link text from textKey"
```

---

## Task 4: Replace property details loading spinner with shimmer skeleton

**Problem:** While a property loads, a bare `<i class="fas fa-spinner fa-spin">` is displayed centered on a blank page. A shimmer skeleton mimicking the page layout is far less jarring.

**Files:**
- Modify: `src/pages/properties/PropertyDetails.jsx:187-195`
- Modify: `public/assets/sass/partials/othersPage/_property.scss` (add shimmer CSS at the end)

- [ ] **Step 1: Add shimmer CSS to the property stylesheet**

Open `public/assets/sass/partials/othersPage/_property.scss` and append at the **end of the file**:
```scss
// ===================== Property Details Skeleton =====================
@keyframes shimmer {
  0%   { background-position: -800px 0; }
  100% { background-position: 800px 0; }
}

.property-skeleton {
  &__shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 6px;
  }

  &__gallery {
    height: 380px;
    @extend .property-skeleton__shimmer;
    margin-bottom: 24px;
  }

  &__title {
    height: 32px;
    width: 60%;
    @extend .property-skeleton__shimmer;
    margin-bottom: 12px;
  }

  &__subtitle {
    height: 20px;
    width: 40%;
    @extend .property-skeleton__shimmer;
    margin-bottom: 24px;
  }

  &__line {
    height: 16px;
    @extend .property-skeleton__shimmer;
    margin-bottom: 10px;

    &--short { width: 70%; }
    &--full  { width: 100%; }
  }

  &__sidebar {
    height: 300px;
    @extend .property-skeleton__shimmer;
  }
}
```

- [ ] **Step 2: Replace the spinner in `PropertyDetails.jsx`**

Open `src/pages/properties/PropertyDetails.jsx`. Find the `isLoading` block (around line 187–195):
```jsx
{isLoading ? (
    <section className="property-details compact padding-y-60">
        <div className="container container-two">
            <div className="text-center py-5">
                <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                <p className="mt-3">{t('details.loading')}</p>
            </div>
        </div>
    </section>
```

Replace with:
```jsx
{isLoading ? (
    <section className="property-details compact padding-y-60">
        <div className="container container-two">
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="property-skeleton__gallery" />
                    <div className="property-skeleton__title" />
                    <div className="property-skeleton__subtitle" />
                    <div className="property-skeleton__line property-skeleton__line--full" />
                    <div className="property-skeleton__line property-skeleton__line--full" />
                    <div className="property-skeleton__line property-skeleton__line--short" />
                </div>
                <div className="col-lg-4">
                    <div className="property-skeleton__sidebar" />
                </div>
            </div>
        </div>
    </section>
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:5173/property/1346`. Before the property loads (~1-2 seconds) you should see a two-column shimmer layout instead of the centered spinner.

- [ ] **Step 4: Commit**
```bash
git add public/assets/sass/partials/othersPage/_property.scss \
        src/pages/properties/PropertyDetails.jsx
git commit -m "feat: replace property details loading spinner with shimmer skeleton"
```

---

## Task 5: Replace native datetime-local input with split date + time fields

**Problem:** `<input type="datetime-local">` renders as the browser's native date-time picker which looks different across platforms and is visually unpolished (shows "dd/mm/yyyy, --:-- --" placeholder by default on Chrome).

**Approach:** Split into separate `<input type="date">` and `<input type="time">` fields — no new library needed, more cross-platform consistent, and easier to style with existing Bootstrap form-control classes.

**Files:**
- Modify: `src/components/property/PropertyDetailsSection.jsx:1004-1070`

The form currently stores the full datetime in `visitDate` state as a `datetime-local` string (format `YYYY-MM-DDTHH:MM`). After splitting, combine them back before passing to the visit API.

- [ ] **Step 1: Find the existing visit state declarations**

In `PropertyDetailsSection.jsx`, search for `visitDate` state — it will look like:
```jsx
const [visitDate, setVisitDate] = useState('');
```

Add two new state variables immediately after it:
```jsx
const [visitDatePart, setVisitDatePart] = useState('');
const [visitTimePart, setVisitTimePart] = useState('');
```

- [ ] **Step 2: Find where `visitDate` is used in the submit/validation handler**

Search for `visitDate` in the `onSchedule` function. It will be used as the datetime string sent to the API. Replace references like:
```jsx
// Before
scheduled_date: visitDate,
```
With:
```jsx
// After
scheduled_date: visitDatePart && visitTimePart
    ? `${visitDatePart}T${visitTimePart}`
    : visitDatePart || '',
```

Also update the validation that checks `visitDate`:
```jsx
// Before
if (!visitDate) {
    setVisitErrors(prev => ({ ...prev, visitDate: 'Please select a date and time' }));
}
```
To:
```jsx
// After
if (!visitDatePart) {
    setVisitErrors(prev => ({ ...prev, visitDate: 'Please select a date' }));
}
```

- [ ] **Step 3: Replace the `datetime-local` input (lines ~1018-1031) with split fields**

Find the `<input type="datetime-local" ...>` block and replace it with:
```jsx
<div className="d-flex gap-2">
    <div className="flex-fill">
        <label htmlFor="visit-date" className="visually-hidden">Date</label>
        <input
            id="visit-date"
            name="visitDate"
            type="date"
            className={`form-control ${visitErrors.visitDate ? 'is-invalid' : ''}`}
            value={visitDatePart}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
                setVisitDatePart(e.target.value);
                if (visitErrors.visitDate) {
                    setVisitErrors(prev => ({ ...prev, visitDate: '' }));
                }
            }}
            autoComplete="off"
        />
    </div>
    <div className="flex-fill">
        <label htmlFor="visit-time" className="visually-hidden">Time</label>
        <input
            id="visit-time"
            name="visitTime"
            type="time"
            className="form-control"
            value={visitTimePart}
            onChange={(e) => setVisitTimePart(e.target.value)}
            autoComplete="off"
        />
    </div>
</div>
{visitErrors.visitDate && (
    <div className="invalid-feedback d-block">
        <i className="fas fa-exclamation-circle me-1"></i>
        {visitErrors.visitDate}
    </div>
)}
```

- [ ] **Step 4: Verify in browser**

Navigate to `http://localhost:5173/property/1346`, wait for it to load. The "Schedule a Visit" section in the right sidebar should now show two side-by-side fields: a date picker and a time picker, both styled with Bootstrap `form-control`. Submitting without a date should show the validation error.

- [ ] **Step 5: Commit**
```bash
git add src/components/property/PropertyDetailsSection.jsx
git commit -m "fix: replace datetime-local input with split date+time fields on schedule visit form"
```

---

## Task 6: Reduce property search intro section height

**Problem:** The intro section on `/properties` (heading + description + CTA buttons) uses `padding-y-60` (60px top + bottom at desktop) combined with a large `h1` heading, causing the section to consume the entire viewport before the user can see a single property card.

**Approach:** Reduce padding on the intro section from `padding-y-60` to `py-4` (Bootstrap, ~24px) and tighten the heading margin.

**Files:**
- Modify: `src/pages/properties/Property.jsx`

- [ ] **Step 1: Open `Property.jsx` and find the intro section**

Look for the section that starts with:
```jsx
<section className="padding-y-60 bg-white">
```

Change the className from `"padding-y-60 bg-white"` to `"py-4 bg-white"`:
```jsx
<section className="py-4 bg-white">
```

- [ ] **Step 2: Tighten the heading margin**

Within that section, find the `<h1>` tag:
```jsx
<h1 className="mb-3">{t('listing.title')}</h1>
```

Change `mb-3` to `mb-2`:
```jsx
<h1 className="mb-2">{t('listing.title')}</h1>
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:5173/properties` and click "Browse Listings" to anchor-scroll to results. At 1280px+ desktop width, the intro should be compact enough that the first row of property cards is visible immediately after scrolling to `#property-search-results`.

- [ ] **Step 4: Commit**
```bash
git add src/pages/properties/Property.jsx
git commit -m "fix: reduce property search intro section padding so listings appear sooner"
```

---

## Task 7: Fix filter sidebar radio button and checkbox visual sizing

**Problem:** The "Purpose" radio buttons in the filter sidebar render as large un-styled circles (~20px) with no visible selected state. The "Property Type" checkboxes also appear large and the labels appear below the checkboxes rather than inline.

**Files:**
- Modify: `src/components/property-filters/PropertyFilters.jsx`

- [ ] **Step 1: Open `PropertyFilters.jsx` and find the Purpose filter radio buttons**

They will look like:
```jsx
<div className="common-radio">
    <input type="radio" ... className="form-check-input" />
    <label ... className="form-check-label">All</label>
</div>
```

Add an `style` override to each radio `<input>`:
```jsx
<input
    type="radio"
    ...
    className="form-check-input"
    style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
/>
```

Do this for **all four** Purpose radio inputs (All, For Sale, For Rent, Short Stay).

- [ ] **Step 2: Find the Property Type checkboxes**

They will look like:
```jsx
<div className="common-check">
    <input type="checkbox" ... className="form-check-input" />
    <label ... className="form-check-label">Apartment</label>
</div>
```

Add the same `style` override to each checkbox `<input>`:
```jsx
<input
    type="checkbox"
    ...
    className="form-check-input"
    style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
/>
```

Do this for **all nine** Property Type checkbox inputs.

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:5173/properties` and scroll to the filter sidebar. Radio buttons and checkboxes should appear as compact 16×16px controls with labels sitting inline beside them.

- [ ] **Step 4: Commit**
```bash
git add src/components/property-filters/PropertyFilters.jsx
git commit -m "fix: normalize filter sidebar radio and checkbox size to 16px"
```

---

## Task 8: Fix chatbot bubble and scroll-to-top button overlap

**Problem:** The chatbot FAB sits at `bottom: 90px; right: 24px` (56×56px) and the scroll-to-top button sits at `bottom: 36px; right: 36px` (46×46px). Their right-edge positions overlap horizontally (both between right 24–80px), making them appear clustered together. Moving the scroll-to-top to `right: 90px` places them side by side cleanly.

**Files:**
- Modify: `public/assets/sass/layout/_scroll-top.scss`

- [ ] **Step 1: Open `_scroll-top.scss` and change the `right` position**

Current content (lines 3–6):
```scss
.scrollToTop {
  position: fixed;
  right: 36px;
  bottom: 36px;
```

Change `right: 36px` to `right: 90px`:
```scss
.scrollToTop {
  position: fixed;
  right: 90px;
  bottom: 36px;
```

Also update the `@include md-screen` responsive block (around line 23–28):
```scss
@include md-screen {
  right: 24px;   // keep mobile as-is — chat bubble moves to right: 16px on mobile
  bottom: 24px;
  ...
}
```
Leave the `md-screen` block unchanged (mobile layout is fine).

- [ ] **Step 2: Verify in browser**

Open `http://localhost:5173` and scroll down to trigger the scroll-to-top button. The orange circle (scroll-to-top) should appear to the **left** of the chatbot bubble, not directly under it. Neither button should overlap the other.

- [ ] **Step 3: Commit**
```bash
git add public/assets/sass/layout/_scroll-top.scss
git commit -m "fix: offset scroll-to-top right position to avoid chatbot bubble overlap"
```

---

## Task 9: Prevent navigation from wrapping to two rows

**Problem:** `NavMenu.jsx` line 77 has an early return: `if (window.innerWidth > 1280) { setVisibleCount(navMenus.length); return; }`. This skips the overflow calculation at widths > 1280px, so all 9 nav items are shown without measurement — causing them to wrap to a second row at 1512px (and any width where the nav is wider than available space).

The fix: raise the threshold from `1280` to `1920` so the measurement-based overflow runs at common desktop widths (1280–1920px).

**Files:**
- Modify: `src/common/layout/NavMenu.jsx:77`

- [ ] **Step 1: Open `NavMenu.jsx` and change line 77**

Find:
```jsx
if (window.innerWidth > 1280) {
    setVisibleCount(navMenus.length);
    return;
}
```

Change to:
```jsx
if (window.innerWidth > 1920) {
    setVisibleCount(navMenus.length);
    return;
}
```

This allows the `calculateVisibleItems` measurement loop (lines 82–101) to run at 1280–1920px, placing overflow items into the existing "More" dropdown automatically.

- [ ] **Step 2: Verify nav stays on one row**

Open `http://localhost:5173` at 1280px viewport width (use browser DevTools to set width). The nav should show as many items as fit in one row, with remaining items in a "More" dropdown — all on a **single row**. Clicking "More" should reveal Resources, Contact, and any others that didn't fit.

- [ ] **Step 3: Commit**
```bash
git add src/common/layout/NavMenu.jsx
git commit -m "fix: raise nav overflow threshold to 1920px so items don't wrap at desktop widths"
```

---

## Task 10: Fix Post Property button showing as icon-only on homepage

**Problem:** `Header.jsx` defines `btnText` prop with no default value (line 19: `btnText,`). `Home.jsx` calls `<Header />` with zero props, so `btnText` is `undefined` and the `Button` component renders only the arrow icon — displaying as a small orange `→` square with no label.

**Files:**
- Modify: `src/common/layout/Header.jsx:19`

- [ ] **Step 1: Add a default value for `btnText` in `Header.jsx`**

Find the Header component's prop destructuring (lines 13–24):
```jsx
const Header = ({
    headerClass = "bg-transparent",
    logoBlack = true,
    logoWhite = false,
    headerMenusClass = "ms-auto menu-right",
    btnLink = "/post-property",
    btnText,
    spanClass = "icon-right",
    showHeaderBtn = true,
    showOffCanvasBtn = true,
    offCanvasBtnClass = ""
}) => {
```

Change `btnText,` to `btnText = "Post Property",`:
```jsx
const Header = ({
    headerClass = "bg-transparent",
    logoBlack = true,
    logoWhite = false,
    headerMenusClass = "ms-auto menu-right",
    btnLink = "/post-property",
    btnText = "Post Property",
    spanClass = "icon-right",
    showHeaderBtn = true,
    showOffCanvasBtn = true,
    offCanvasBtnClass = ""
}) => {
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:5173`. The header should now display a labelled "Post Property" orange button (matching what appears on `/properties` and other inner pages).

- [ ] **Step 3: Confirm inner pages are unaffected**

Open `http://localhost:5173/properties`. The header should still show "Post Property" — pages that already pass `btnText="Post Property"` as a prop continue to work identically.

- [ ] **Step 4: Commit**
```bash
git add src/common/layout/Header.jsx
git commit -m "fix: add default btnText='Post Property' to Header so homepage shows button label"
```

---

## Verification Checklist

After all tasks are complete, do a full-page review:

- [ ] Open `http://localhost:5173` — hero heading reads "…Way to **Find** a Home" (space visible)
- [ ] Hero section is visibly shorter, TabFilter search bar is nearer to the fold
- [ ] Navigation stays on one row at 1280px+ with "More" dropdown for overflow items
- [ ] Header "Post Property" button shows text label on homepage (not just an arrow icon)
- [ ] Footer "Useful Links" column shows link text (Property Listings, About 360Ghar, etc.)
- [ ] Footer "Services" column shows link text (Property Search, Post Property, etc.)
- [ ] Footer bottom bar shows "Terms of Service" and "Privacy Policy" links
- [ ] Open `http://localhost:5173/property/1346` — shimmer skeleton appears while loading
- [ ] After load, "Schedule a Visit" shows two adjacent fields: date and time
- [ ] Open `http://localhost:5173/properties` — intro section is compact, property cards visible sooner
- [ ] Filter sidebar radios and checkboxes are small (16px) with inline labels
- [ ] Scroll to bottom — scroll-to-top button appears to the left of the chatbot bubble, no overlap
