# Design system: soft paper (was: paper cut diorama)

Round 4 (2026-09-29) rounded the UI and lightened the palette; see "Round 4" at the end. The tables below show the current tokens; older rounds describe the hand-cut parts that remain.

Status: draft for review (work plan step 2). Live page: `/styleguide` (dev server only; the production build returns 404). Screenshots: `docs/screenshots/step2/`.

## Idea

The site is a street in Gurugram made of cut card stock. Layers sit at different depths. One light comes from the top left, so every shadow is short and falls to the bottom right. Shadows take the tint of the surface below them: a sheet on orange casts an orange shadow.

Marketing screens (home hero, states, footer) use cut paper with hand-cut edges and grain. Dense screens (results, forms, tables, account) use straight white sheets and no grain, so they are easy to scan.

## Tokens (`src/styles/global.css`)

| Group | Tokens | Rule |
|---|---|---|
| Kesar | `kesar-50` to `kesar-950`; `kesar-500` = `#ff6b00` | Paper layers. Far layers lighter, near layers darker. Do not use `kesar-500` for text. |
| Diorama | `dio-sky`, `dio-cloud`, `dio-tower`, `dio-block`, `dio-metro`, `dio-street`, `dio-kerb` | Home scene only. Far layers are cool sage and teal, near layers are warm clay and brown. The train and the kite keep `kesar-500` and `kesar-600` as the one bright accent. |
| Ink | `ink-950` #0f1d19, `ink-800`, `ink-600` #3c5148, `ink-400` #7d9389, `ink-200`, `ink-100` | Text. Green-neutral. `ink-600` is the lowest text contrast (8.5:1 on white, 7.4:1 on mist-100). `ink-400` is for field borders (3.3:1). |
| Mist | `mist-50` #f5f9f7, `mist-100`, `mist-200`, `mist-300` | Sage surfaces (from the hero sky): section bands, hover fills, answer slips, the footer. Replaces `kesar-50/100` as a neutral surface. |
| Pine | `pine-700`, `pine-800` #1f4a41, `pine-900` | The only dark: active states, toast, chat, compare tray, the Owners band, chart series. |
| Status | `leaf`, `chili`, `haldi` (700 on 100) | All pairs pass AA (5.6:1 or more). |
| Paper | `paper` = white | Page and sheet colour. Not cream. |
| Type | `font-display` = Sentient (ITF, Fontshare free licence, variable 200 to 700, self-hosted, 51 KB, has ₹ and lining figures), then Supreme as fallback; `font-sans` = system UI | Display for headings, prices and big numbers. Headings use weight 600, the home title 500. Hindi falls back to the system Devanagari face. |
| Radius | `xs` 6 px, `sm` 12 px, `md` 16 px, `lg` 22 px, `xl` 32 px | Controls 12, menus 16, cards and photos 22, search sheet and bottom sheet 32. Icon buttons and bars use `9999px`. Buttons are rounded rectangles, not pills. |
| Shadow | `.shadow-paper-sm`, `.shadow-paper`, `.shadow-paper-lg`, `.soft-lift` | Contact line plus one soft drop with negative spread, tinted by `--tint` (pine ink). No bloom around the element. |

## Parts

| Part | Files | Notes |
|---|---|---|
| Hand-cut edge | `src/lib/paper/cut.ts` | Seeded `clip-path` polygon. The same seed gives the same edge on server and client. |
| Paper shapes | `src/lib/paper/shapes.ts` | Jittered SVG paths for scenes. |
| Paper sheet | `src/ui/Paper.astro` | Cut sheet with shadow. Keep padding above the cut size (2 px). |
| Buttons | `.btn`, `.btn-primary`, `.btn-ink`, `.btn-quiet`; `src/ui/Button.astro` | Hover changes colour only. Press flattens the tab. No outlined variant. 44 px minimum. |
| Fields | `.input`, `.select`, `.textarea`, `.check`, `.toggle`; `src/ui/react/Field.tsx` | Errors show under the field with an icon and `aria-invalid`. |
| Icons | `src/ui/icons/paths.ts`, `Icon.astro`, `Icon.tsx` | 78 custom knife-cut icons (round 3 added 30 for facts, amenities, the data hub and tools). 7 real brand marks from Simple Icons. |
| Listing card | `src/features/property/PropertyCardView.tsx` | Pure markup, server-rendered. The whole card is one link. Skeleton has the same boxes. |
| States | `src/ui/states/*` | Empty ("khali plot"), error ("tuta board"), 404 ("Sector 404"), offline ("kati patang"). Five layers each since round 3. `level={1}` gives the page size. `NotFound.astro` is the whole 404 block. |
| Sheet and dialog | `src/ui/react/Sheet.tsx` | Native `<dialog>`. Bottom sheet on phones, side panel from 768 px. |
| Toasts | `src/ui/react/Toaster.tsx` | Module singleton; `toast(text, tone, action)` from any island. |
| Tabs | `src/ui/react/Tabs.tsx` | ARIA tabs with arrow keys. The marker works before hydration. |
| Error boundary | `src/ui/react/IslandBoundary.tsx` | One per island, with "Try again". |
| Skeleton delay | `.skeleton-gate`, `src/ui/react/Delayed.tsx` | Skeletons appear only after 150 ms. |
| Diorama | `src/features/home/diorama/*` | Nine layers: sky, clouds, Cyber City towers, kite, sector blocks, Rapid Metro, train, street (chai stall, gulmohar trees, auto-rickshaw, cow, vegetable cart), road and kerb (scooter). CSS moves the clouds, kite and train (translate only, off for reduced motion); the script adds parallax. |

## Checks done

- Contrast of every text and UI pair computed (script in the step 2 notes); all pass WCAG 2.2 AA.
- All controls on `/styleguide` clicked at 360, 768 and 1440 px with Playwright: sheet, dialog, toasts and undo, tab keys, client and server field errors, error boundary and retry, skeleton delay. No page errors. No horizontal scroll.

## Round 3 additions (chrome and kit)

### Header and menus (`src/features/layout/Header.astro`, `nav.ts`)

- The strip has a hand-cut bottom edge (`cutBandPath`). Once the page scrolls, the edge casts a short shadow.
- Data hub and Tools open as a paper sheet with a hand-cut edge: two columns of links, each with a knife-cut icon and one line of help, and a paper vignette with one sentence beside them. Hover and the current page show a hand-cut kesar-50 slip under the item. The current page and its group are marked by weight (800), never by a dot or an underline.
- Motion: the sheet unfolds from under the strip (clip reveal, 200 ms) and folds away (140 ms). With one menu open, pointing at the other trigger opens it. Escape, an outside click, or tabbing out closes it. With reduced motion nothing moves. Every menu works without the script.
- Phones and tablets: a search link and the menu button in the bar. The menu is a `<dialog>` that slides in from the right (a side panel from 640 px). Primary links in two columns with icons; Data hub and Tools fold into disclosures (the group of the current page starts open); a strip of paper skyline closes the menu.
- Between 1024 and 1280 px the account link shows its icon only (the name stays for screen readers), so the bar never wraps.
- Menu data: each `NavLink` may have `icon` and `desc` ({ en, hi }); each `NavGroup` may have `theme` (vignette), `note` ({ en, hi }) and `more` (a see-all link).

### Footer (`src/features/layout/Footer.astro`, `skyline.ts`)

- Two layers of paper skyline: far glass towers in kesar-800 with window holes (the white page shows through, like lit windows) and near sector blocks with roof tanks in kesar-950, which run into the floor.
- Grid: brand block (logo, tagline, contact with bare icons, app button, social marks) on 4 of 12 columns, five link columns on 8. Tablet: three columns, with the brand block spread over two. Phones: each group folds into a disclosure; without JavaScript every group stays open.
- The last row keeps 8 rem free at the right on tablet and desktop, and the floor keeps 5.5 rem at the bottom, so the chat launcher never covers a link.

### Paper kit for pages

| Export | File | Props | Use |
|---|---|---|---|
| `PaperVignette` | `src/ui/paper/PaperVignette.astro` and `.tsx` | `theme`, `seed?`, `frame?: 'cut' \| 'square' \| 'none'`, `label?`, `class?` (`className` in React) | A small scene, 160 x 100. Themes: `home`, `tower`, `society`, `office`, `metro`, `document`, `calculator`, `map`, `key`, `camera`, `plot`, `villa`, `pg`, `shop`, `warehouse`, `hospital`, `mall`, `school`, `park` |
| `vignetteLayers`, `VIGNETTE_THEMES`, `VignetteTheme`, `VIGNETTE_W`, `VIGNETTE_H` | `src/lib/paper/vignettes.ts` | `vignetteLayers(theme, seed = '1')` | The layers, if you render them yourself |
| `PaperArt` | `src/ui/paper/PaperArt.astro` and `.tsx` | `layers`, `width`, `height`, `bg?`, `cutEdge?` (seed), `shadow?: [dx, dy, blur]`, `label?`, `class?` | Renders any `Layer[]` with one short shadow per layer and unique filter ids. Use it for your own scenes instead of copying the SVG code |
| `paperUid` | `src/lib/paper/uid.ts` | `paperUid(prefix?)` | Unique ids for SVG filters in server-rendered art |
| `SectionOpener` | `src/ui/SectionOpener.astro` | `title`, `lead?`, `theme?`, `seed?`, `id?`, `level?: 2 \| 3`, `action?: { href, label }`, `class?`; default slot under the lead | The start of a marketing section: heading, one line, one link, a vignette at the right. No kicker |
| `IconSprite`, `Icon sprite` | `src/ui/icons/IconSprite.astro`, `Icon.astro` | `<IconSprite names={[...]} />` once, then `<Icon name="..." sprite />` | For an icon that repeats many times on one page. The header uses it for the menu icons |
| `amenityIcon`, `FACT_ICONS` | `src/ui/icons/amenities.ts` | `amenityIcon(apiIconKey)` returns an icon name (fallback `check`) | Icons for the API amenity keys and for home facts |
| `NotFound` | `src/ui/states/NotFound.astro` | none (locale from the URL) | The whole 404 block with places to go |
| `StateBlock` `size` | `src/ui/states/StateBlock.astro` | `size?: 'md' \| 'lg'`, default `lg` when `level={1}` | Page-size states (404, 503) |
| `skylineLayers` | `src/features/layout/skyline.ts` | `skylineLayers(seed, width, height)` returns `{ far, near }` paths | The two-layer skyline of the footer and the phone menu |

New icons: facts and amenities `floor`, `lift`, `power`, `gym`, `pool`, `shield`, `tree`, `sofa`, `compass`, `floor-plan`, `video`, `water`, `wifi`, `metro`, `briefcase`, `society`; data hub and tools `document`, `calculator`, `gavel`, `stamp`, `verified`, `layers`, `news`, `crane`, `receipt`, `roller`, `mail`. Furnishing is `sofa`, facing is `compass`, a 360° tour is `tour`.

Rules for the kit:

- One or two vignettes or openers per page, where they say what a section is about. Never on dense screens (results, forms, tables), never behind data, never as an icon tile.
- Seed per place (`seed="emi"`), so a page does not repeat the same twin scene.
- Vignettes are decorative (`aria-hidden`) unless you pass `label`.
- Inline SVG, about 2 to 4 KB each. Below the fold is fine; they need no JavaScript and no image request.

### Tokens and quality

- Focus ring on dark paper (`.on-ink`, toasts, compare tray, photo viewer) is kesar-300: 9.2:1 on kesar-950. On white it stays kesar-700 (5.5:1).
- Contrast of every text token pair was computed again: all text pairs pass AA (lowest: ink-600 on kesar-100, 6.3:1; kesar-700 on kesar-50, 5.1:1). The styleguide swatch label on kesar-600 now uses ink (it was 3.4:1).
- e2e: `tests/e2e/chrome.spec.ts` (header menus, phone menu, footer groups, launcher room, reduced motion, backend down, Hindi, 404, styleguide) at 360, 768 and 1440 px.

### Round 3, second pass

- Labels: every link in the header, the phone menu and the footer is in sentence case, from `site:links.*` in `src/i18n/locales/{en,hi}/site.json` (for example "Stamp duty calculator", "Refer and earn", "About us"). `common:nav.*` is left as it was for the pages that use it.
- 404: `src/pages/[...path].astro` renders `NotFound`; the legacy redirects in that file are unchanged.
- Header weight: the menu icons are one sprite; the hover slips, the sheet edge, the strip edge and the phone-menu skyline use fewer cut points. On `/`, the header went from 48.2 KB to 46.0 KB (8.5 KB to 8.1 KB gzip). The sprite alone saves 0.6 KB raw but adds 0.2 KB gzip (gzip already folds repeated paths); fewer cut points give the rest.
- The strip's cut edge keeps the same spacing (about 32 px) at every width (`preserveAspectRatio="xMidYMin slice"` on a 2560-unit box), so on a phone it reads as a paper edge, not as a zigzag.
- Filter ids: `PaperArt` makes its own ids per instance (`paperUid` on the server, `useId` in islands; Astro gives each island its own id prefix). Any number of scenes, hidden or visible, can share a page. `vignettes.test.ts` and the chrome e2e spec check it.

### Round 3 handoff: chat launcher and shared shadows

- Chat launcher (`src/features/chat/ChatLauncher.astro`, `.chat-launcher` in `global.css`). Below 1024 px it is a quiet 44 px icon button in the header bar, over the `.chat-slot` that `Header.astro` keeps left of search. It never floats over the page, a bottom dock or wizard buttons. From 1024 px it is the dark paper tab at the bottom right (cut edge, 1.5 px shadow tinted to the page). It rises above a bar fixed at the bottom, and it slides to a 14 px lip at the screen edge while text, a photo, a card or a control is under it. Hover or keyboard focus brings it back. The chat panel shadow is now short: 2 px by 4 px, 3 px blur.
- Pages set nothing for this. A page that adds its own bottom bar needs no change: the launcher measures it.
- Shared shadows: every page has one `PaperDefs` set (18 filters). Feature art should call `sharedShadowId(tint, SHADOW_SIZES.s | m | l)` and draw its own filter only when it returns null. An SVG used as an image (`data:` URL) must keep its own filters, because it cannot see the page's defs.


## Round 4 (2026-09-29): rounded UI, lighter palette

Why: the site read as square and dark. Radii were 2 to 6 px, cards were hand-cut polygons, and many surfaces were brown-black (`ink-950`, `kesar-800/950`).

Changes:

- Radius tokens are 6, 12, 16, 22 and 32 px (see the table). `Paper.astro` no longer clips: it draws a rounded sheet with `.shadow-paper*` (`seed` and `amp` props are kept and ignored). Photos, slips and sheets that used `cut-lift` plus `clip-path` now use `.soft-lift` (`.is-clip` also clips the child).
- Palette: new `mist-*` (sage surfaces) and `pine-*` (the only dark). Ink is green-neutral. The kesar scale is unchanged; `kesar-500` is the action colour, `kesar-700` the text accent.
- Dark to light: footer floor is `mist-200` with the dark logo (`logo-horizontal.webp`); the tool answer slip and the phone peek bar are `mist`; the toast, chat, compare tray, active toggles, the search button and the Owners band are `pine-800`.
- Shadows: soft, from the top, negative spread, tinted `20 45 38`.
- Kept hand-cut: `CutBand` edges, the header strip's bottom edge, the footer skyline art (recoloured to mist), the home diorama, vignettes and the map price-tag notch.
- Tests: `tests/e2e/chrome.spec.ts` now expects the chat tab to be a rounded card with a soft shadow. Axe found text colours made for dark panels (vastu, capital gains, checklist, AI design); they now use ink and `kesar-800`.
- `src/ui/paper/standalone.ts` holds a copy of the palette for the cached SVG files; a unit test compares it with `global.css`.

## Property page (2026-09-29)

- Home Card (`src/features/property/HomeCard.astro`): one sheet with price, title, place, save and share, and on phones the three ways to reach the agent. Its lower half is a tinted floor (`mist-50`) with the key facts and the building drawing. From 48rem the card and the contact rail rise 3rem into the photos and share one top edge; the photo tools (see all, floor plan) move onto the photos, top right.
- Section heads differ on purpose: "What it costs" and "Floor plan" and "Location" stack; "About this home", "Amenities" and "More details" hang in the left margin from 40rem of column width. Layouts inside the main column follow its own width (`container-type` on `.prop-main`), not the screen.
- Contact: WhatsApp and Call are plain links to the listing's agent, else the company number (`contact.ts`). The owner's number is never shown. A callback goes to `POST /leads` (no sign-in). Below 64rem the visit form opens in a bottom sheet; from 64rem it sits in the rail, which scrolls inside itself on short screens.
- Motion: the floor marker and the move-in strip are scroll-linked CSS (`animation-timeline: view()`), gated by `prefers-reduced-motion`; without support they sit in their final place.
