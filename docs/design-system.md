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

## Home hero search (2026-10-23)

- The hero search (`src/features/search/HeroSearch.tsx`, `.hero-search*` in `global.css`) has three states, keyed to the width it is given, not the screen (`container-type: inline-size` on `.hero-search`):

  | Search width | Rows | Layout |
  | --- | --- | --- |
  | under 36rem | 3 | tabs / field + Search / foot |
  | 36rem to 53rem | 2 | tabs + field + Search / foot |
  | 53rem and up | 1 | tabs + field + Search + foot |

- The home card (`.home-search-lift`, `hero/HomeHero.astro`) is 56rem, so it reaches the one-line state from a 960 px viewport.
- At 360 px the tabs (196 px) plus the Search button (68 px) would leave about 50 px for the field, so phones keep the stack.
- Rows are placed with `grid-template-areas`, so DOM order equals visual order and the tab order stays tabs, field, Search, Near me, Forget. The purpose options are 44 px tall (was 40) with 1rem side padding (was 1.25rem), which is what lets all three share the row at 640 px.
- On one line the foot group caps at 12rem and wraps inside it, and the Forget button shows its icon only. Its accessible name is an explicit `aria-label`, because the visible label is hidden. The cap keeps the "Saved location removed." status from pushing the field narrower.
- Near me is a `.btn` (white paper with the standard control shadow), not a `.btn-quiet` link, so it reads as the second action of the search rather than as a text link.
- The owner link (`PostLink.tsx`) is not used on the home page. Its owner CTA is the button in the owners band further down.
- Checked with a real pointer at 360, 640, 768, 960 and 1440 px: purpose, keyword search, PG's `property_type`, Near me, Forget, tab order, 44 px targets and axe. The suggestion list is unverified here because the local `PUBLIC_GOOGLE_MAPS_API_KEY` is expired; a stand-in list confirms it clears the foot group, paints on top and aligns to the field.

## Home hero art (2026-10-23)

The hero (`src/features/home/hero/HomeHero.astro`) is the scene, the title and the search sheet, and it owns the whole first screen. The scene keeps its original palette and its drawn detail; the studies below vary the **artwork**, not the colour.

- **Full first screen.** The section is `min-height: max(34rem, calc(100svh - 64px))`, so the art reaches the fold with no white gap below it. The 64px is the header strip, which paints the same sky over the hero. `Page.astro`'s `overHero` puts the header in that state.
- **The scene covers, it does not zoom.** The layers keep the diorama's own sizing (full height of the hero) and `preserveAspectRatio="xMidYMax slice"` crops the sides on a tall screen, showing the middle third, which is the part the scene is drawn for (the chai stall, the auto and the cow). An earlier attempt capped the layer height at the scene's aspect, which left two thirds of a phone screen as empty sky.
- **Palette.** The scene keeps its own colours: sage and teal far away, warm clay and brown near, the train and the kite in brand kesar. Every one is a token (`--color-dio-*` for fills, `--dio-sh-*` for the layer shadows), so a study can repaint the street without touching scene code. A pastel repaint was tried and rejected: the deep street and the dark kerb are what make the scene read as a street, and the bright train is the one warm note.
- **The framing per study.** `street` frames the scene 100 units below its origin (`0 -100 1600 960`), so the frame's bottom edge lands at `y 860`, just above the road edge. `skyline` drops the ground and starts at `y 160`, just above the tallest tower, so the towers fill the frame instead of leaving a third of the screen as empty sky. `homes` comes down to `y 400` and keeps 560 units, so the blocks and the street objects carry the frame. All three stay at `x 0`: the artwork must reach both edges of the frame, or the scene visibly stops and leaves a dead band of flat sky.
- **The kite sits in the band every width shows.** The kite was at scene `x 250`, where a tall frame crops it away: at 1024px it was shaved by 12px, and on a phone it was gone entirely. It is now at `x 640`, inside the window a 360px-wide frame sees (about `x 570` to `x 1030`), so it is whole at every width from 320 to 1920 and a phone finally sees it. The move is safe because the reason for the old position is gone: it was placed left of centre for the centred headline the previous hero drew over the sky.
- **What is allowed to be cropped.** A full-bleed scene is cropped by the viewport at its edges, and that is normal: the sun is whole above 1024px and cut by the right edge below it, and the clouds run off both sides. What is not allowed is a small object cut by an INTERNAL edge, or the art stopping short of the frame. Checked at 16 widths from 320 to 1920: no study leaves a dead band, and the kite is never shaved.
- **The title is a screen-reader caption, not a visible line.** The card opens straight into the search; the `h1` (`id="home-title"`, "Search property listings") is `.visually-hidden`, so the page keeps one `h1` without putting a headline in the sheet.
- **The sheet rests on the art.** White paper, 32px radius, a short tinted shadow (`0 18px 32px -14px`). The old `-4.5rem` negative margin, which made the sheet straddle the scene's bottom edge, is gone. The owner CTA is not in the hero: it lives in its own owners band further down the page ("Own a home? List it free"), where it has room for a real button.
- **The hero ends on the ground, on a cut edge.** The frame stops just above the road edge (`y 858`), so the last thing in the art is the brown street sheet. There is no `mask-image` on `.home-diorama`: an earlier version faded the bottom 16% of the art to the page, which washed out the road and left a pale band under the search sheet. The fold is a hand-cut paper edge instead, the same `cutBandPath` idiom as `CutBand`: a 1440 x 22 path, rendered 14px tall, flipped with `scaleY(-1)` so the cut faces the page, `margin-bottom: -12px` so the cut hangs past the fold, filled `--color-dio-street`, with `drop-shadow(0 3px 3px rgb(var(--tint) / 0.16))` falling on the page. The box starts 2px above the fold, so the cut's highest point is always below it: the street and its edge never leave a white sliver between them.
- **The stack must not swallow the pointer.** `.home-hero-stack` lies over the whole scene, so it is `pointer-events: none` with `pointer-events: auto` on the sheet. Without that the layers stop easing toward the cursor, because a pointer event on the stack never reaches the diorama: they are siblings, not ancestor and child.
- **Sizing trap.** `.home-search-lift` is a block child of a flex column, so it needs `width: 100%` alongside `max-width` and `margin-inline: auto`. With only `margin-inline: auto` the auto margins shrink-wrap the element and the sheet collapses to its content width.
- **The variant is a component prop only.** The three artwork studies were review routes under `/lab/home-a|b|c`; those routes are gone. `Diorama` still takes `omit={[...]}` for layers and `view={[x, y, w, h]}` to frame a part of the scene, and `HomeHero` still takes `variant`.
- **Every layer keeps its shadow.** Each layer names its own filter, so a layer can silently lose its shadow if an id stops resolving. Checked: all nine resolve and each filter carries an `feDropShadow`. The `kite` and `train` keep the shared paper-kit filters; the other seven use `--dio-sh-*`.
- **The art labels match the art.** Each study passes its own `aria-label`, so the description names only what that study draws: `skyline` has no metro, no street and no kite; `homes` has no towers, metro or kite.
- **`skyline` drops the kite, not just the ground.** The kite's string is a long diagonal from the kite to a roof, so at any width where the kite itself is off frame the string alone crosses the edge as a line to nowhere. Without the kite the study reads as a clean skyline, and the kite stays where it belongs, in the two street scenes. `skyline` is 3 layers: sky, clouds, towers.
- Checked at 1440, 768 and 360 px on `/` and `/hi` (`/hi/` is a 404 in dev): one `h1`, the hero exactly fills the first screen (64 + 836 = 900), every image sized, axe clean. Every piece of hero text clears WCAG 2.2 AA against its real surface (lowest 5.47:1). All three purpose tabs are 44px tall and the field has the accessible name "Where do you want to live?". With JavaScript off the `h1`, the field, Search, Near me and every layer of the scene are visible, and the plain GET form still submits to `/properties?purpose=rent&q=…`.
- The search is one line from a 960px viewport, which is where its 53rem container query starts to match (the 56rem card minus its 3rem of padding). Below that it falls to two rows, then three on a phone.
- Known, not ours: the home page scrolls 32px sideways at 1440 (150px at 900, where the Refer block is two columns) because the Refer figure "Up to ₹10,000" is 442px at 64px `nowrap` in a 299px column. Hiding the hero does not remove it; shortening the string does. It is a copy change in `src/features/home/more.ts`, not the hero. The other `home.spec.ts` failures are the same story: the `h1` copy is now "Search property listings" and the owner link is now "Post property", both renamed in that session.
