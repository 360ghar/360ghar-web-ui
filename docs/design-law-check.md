# Design law check (2026-09-27)

I checked every point of the design law in `~/.claude/CLAUDE.md` against 17 main pages at 360 px and 1440 px (screenshots of the first screen, plus full pages where needed): home, listing, detail, landing, localities, locality, projects, blog, blog post, post property, compare, sign in, 404, EMI calculator, circle rates, about, and a `/vs` page. The agents checked their own pages (tools, data hub, content) the same way; see `docs/research/06-08`.

Status: **Pass**, **Fixed** (a problem was found in this check and fixed), **N/A** (the element is not on the site), or **Open** (known, with a reason).

## Surface tells

| Point | Status | Note |
|---|---|---|
| Lucide or other icon packs | Pass | One in-house set of knife-cut polygon icons (`src/ui/icons/paths.ts`) |
| Em dashes | Fixed | Removed from the landing and locality FAQs. Blog text from the backend still has some (data, D1) |
| Pill / eyebrow badge | Pass | No kicker pills above headings |
| Fraunces, Work Sans, Space Grotesk, Sora, Syne, Archivo, Inter, Cormorant, Didones, JetBrains Mono, Google shelf | Pass | Display face: Sentient (Fontshare), self-hosted, with Supreme as fallback. Body: system-ui. Changed from Bespoke Stencil on 2026-09-27 at the owner's request: a real estate site needs a simple, sleek face that is easy to read |
| Glowy pill buttons, hover boop, hover lift | Pass | Buttons change fill only; no translate or scale on hover |
| Icon in a coloured tile, logo on a box | Pass | Icons are bare; brand marks in the footer and share rows are bare |
| Floating cards, background glow, radial halo, candy gradients, blob aurora | Pass | None |
| Fake macOS window, fake code window | N/A | |
| Purple, blue-purple gradients, cool blue-charcoal | Pass | Palette: kesar (brand orange) scale and warm ink |
| Gradient text, gradient pill with icon | Pass | None |
| Default CTA pair (filled + outline) | Pass | One primary action, the second is a text link |
| Three-tier pricing, testimonial card, initials avatar, pre-footer CTA slab, logo lockup | Pass | None. Fake reviews and testimonials were removed |
| Split hero, default hero stack, hero with right panel | Pass | Home hero: full-width paper diorama with the search sheet crossing its lower edge |
| Grid / graph-paper background | Pass | None |
| Crude CSS illustrations | Pass | The diorama and state scenes are layered SVG paper cuts, drawn with care |
| Accent-bar card, hairline border on every box, kitchen-sink card | Pass | Cards use tone and a short tinted shadow |
| Botched glass | N/A | No glass |
| Invisible content behind entrance animation | Pass | Content is visible with JS off; the diorama parallax only moves visible layers and stops for reduced motion |
| Content sliced by an edge | Fixed | Home search placeholder was cut mid-word at 360 px; now "Sector or society". Horizontal scroll rows (tabs, blog categories) cut the last item on purpose to show that the row scrolls |
| Misaligned parallel columns | Pass | Compare table: one row per fact, titles hold two lines, so every row lines up |
| Text jammed against the edge | Pass | 16 px gutter on phones; post-property sheet has padding clear of the cut edge |
| Default all-around shadow, fake shadow box, boxy shadow, bloom | Pass | Shadows are short, from the top-left, tinted to the paper |
| Content flung to the far edges | Pass | Footer on the page grid |
| Missing or fake logos | Pass | Real social marks only; no invented customer logos |
| Nothing centred | Pass | Checked the 404 sign, map price tags (notch under the centre) and icon buttons |
| Dot under the active nav item | Pass | Active item: weight change and `aria-current` |
| Content clipped where sections overlap | Pass | The search sheet sits above the diorama; nothing is cut at the seam |
| Cramped display type | Pass | |
| Grain over content | Pass | Grain only on scene backgrounds |
| Cream / beige background, slop grey | Pass | Page is white; tints come from the kesar scale |
| Hero that does not own the first screen | Pass | Home hero fills the first screen at 360 and 1440 px |
| Hard image seams | N/A | No full-bleed photo bands |
| Saturated accent everywhere | Pass | The bright orange is kept for the main action and the brand; other accents are tonal |
| Underline-fill hover, sun-moon toggle, redrawn stock icons | Pass | |
| Unrounded hairline rules as decoration | Pass | Rules only separate rows in tables and lists |
| Inner-glow badge, pulsing live dot | Pass | |
| Off-centre strike line | N/A | |
| Multi-line headline, dangling accent word | Fixed | Blog post titles wrapped to three lines at 360 px; long titles now use a smaller size (two lines). Headings use `text-wrap: balance` |

## Layout tells

| Point | Status | Note |
|---|---|---|
| Kicker plus H2 section heads, small label over big heading | Pass | Sections open with the heading, a number or the content |
| Big serif statement block, inset island with form, email pill plus button | Pass | None |
| Image card with overlay caption | Pass | Captions sit under photos |
| Flat fill under everything after the hero | Pass | The paper language continues: cut bands, paper sheets, the footer skyline |
| Numbered steps beside a vertical line | Pass | "How it works" uses three paper sheets in a cut band |
| SaaS product-page template | Pass | |
| Labels as tinted pill chips everywhere | Pass | Metadata is plain text; chips only for removable filters |
| Dead controls | Pass | 306 e2e tests click every control at three widths, including the map view with a stubbed map |

## Signature and craft

| Point | Status | Note |
|---|---|---|
| One signature artifact | Pass | The layered Gurugram street diorama (metro, shops, chai stall, auto, cow), reused in sign-in and state scenes |
| Atmosphere, layered depth | Pass | Six stacked paper layers with scroll and pointer parallax |
| Character display face | Pass | Sentient: a readable serif with Supreme as fallback. The owner chose readability over a decorative face; the paper diorama carries the character |
| One bespoke silhouette | Pass | Hand-cut paper edges (seeded polygons); the map price tag with a notch |
| Treated nav | Pass | Header with Data hub and Tools menus, a scroll shadow and a dialog menu on phones |
| Real specifics | Pass | Live counts, real listings, real Google reviews link |
| Dead-looking page | Pass | Parallax, sliding tab bar, filter sheet, map tags |

## Other defects found and fixed in this check

- Listing toolbar at 360 px was 3 px wider than the screen (map toggle added). The sort select now takes the free width.
- Long current breadcrumbs wrapped under their "/" separator. Breadcrumbs now stay on one line and end in an ellipsis. The property page now uses the shared breadcrumb component.

## Review round 2 (after the font change)

- Font: Supreme replaces Bespoke Stencil (owner's request). Rechecked 17 pages at 360 and 1440 px: no heading runs past two lines, nothing is cut, no sideways scroll.
- Breadcrumbs: middle crumbs could push the page sideways. Now Home and the section never shrink, later crumbs end in an ellipsis, and on phones the current crumb is hidden from view (the heading below repeats it).
- Tap targets: footer links and logo, directory links, table links, EMI boxes and policy links are now at least 44 px tall.
- Chat launcher: it no longer hides on short pages; the footer has room below its last row instead.

## Round 3 (2026-09-28): more visuals on every page

Eight agents rebuilt their areas in parallel. I reviewed every screenshot set at 360 and 1440 px (768 where the layout changes) and sent each fault back as a task. Faults found and fixed:

| Point | Where | Status |
|---|---|---|
| Icon in a coloured tile | Account: camera icon in an orange box (no-photo listing, wizard preview) | Fixed: paper vignette in the photo box |
| Misaligned parallel columns | Home "How it works" cards at three heights; property page costs, plan and map on different right edges; post page hero, rail and "Read next" on three right edges; visit card actions in three alignments | Fixed |
| Multi-line headline (3 lines) | Blog featured title at 1440, post title at 360 | Fixed: at most 2 lines at every width |
| Saturated accent | Home owners panel (flat bright orange slab); About founder name; RERA status mix in green and red | Fixed: tonal kesar steps |
| Filled + outlined button pair | Account Upcoming / Past, wizard Sell / Rent / Short stay | Fixed: one segmented control |
| Content cut by an edge | Property day buttons sliced by the panel at 1440 | Fixed: 4 + 3 grid, scroll only on phones |
| Content flung to the far edges | Listing header vignette alone at the far right; locality hero with an empty block beside the sheet | Fixed: composed with the text |
| Repeated vignette | Landing pages drew the same building three times | Fixed: one per page |
| Not centred | Vastu north glyph 12 px off the button axis | Fixed |
| Floating element over content | Chat "Ask" tab over cards and prices | Fixed: header icon below 1024 px; at 1024 px and up it tucks aside when content is under it |
| Em dashes | Vastu prose, chat subtitle, auction page title | Fixed |
| Honesty | "Each home has a 360° walkthrough" (0 of 109 listings have a tour), "8-12% appreciation", "assured returns", "500+ Fortune 500 companies" | Fixed (see Open for the brand claim) |
| Wrong data shown as fact | Photo captions that do not match the photo; ₹10 Cr stand-in prices | Fixed: unreliable captions dropped; stand-in prices show "Price on request" and stay out of ranges |
| Cow that reads as a horse | Home diorama | Fixed: hump, horns, low head |

New visuals, all in the paper-cut language: 19 vignette themes in the shared kit, a 4-photo strip on every result card, seeded city scenes (India Gate for Delhi, and others), 20 blog cover scenes, a price-per-sq-ft strip on the property page, an EMI year-by-year chart and other result charts from the user's own numbers, and data hub charts from real rows with source and date.

Weight: one shared set of paper shadow filters (`PaperDefs`) replaced the per-drawing copies. `<filter>` count: `/` 62 to 19, `/blog` 88 to 18, `/about-us` 46 to 18, `/property/182` 22 to 18. The card photo-strip script loads once per page instead of once per card.

### Round 4 (2026-09-29): rounded UI, lighter palette

Checked home, EMI, tools index, stamp duty, vastu, listing grid, projects, sign in, 404, post property, the desktop Tools menu, the phone menu, the filter sheet and the chat panel at 390 and 1440 px, with the full e2e suite at 360, 768 and 1440 px (axe included).

| Point | Status | Note |
|---|---|---|
| Blue-purple, cool blue-charcoal dark | Pass | Mist is green-tinted sage; pine is a green-black. No blue-purple anywhere |
| Cream / beige, slop grey | Pass | The old peach surfaces (`kesar-50/100`) moved to mist. Page stays white |
| Default all-around shadow, bloom, boxy shadow | Pass | `.shadow-paper*` use a contact line plus a drop with negative spread, tinted `20 45 38`. Checked the card, sheet, toast and chat edges: no halo, no box outline |
| Faking a shadow with a second box | Pass | None |
| Pill chips, glowy pill buttons | Pass | Buttons and toggles are 12 px rounded rectangles. Full radius only on icon buttons, bars and the sheet grip |
| Hover boop, underline-fill hover | Pass | Unchanged: fill or colour change only |
| Text you cannot read | Fixed | Axe found text made for the old dark panels (vastu band and explain, capital gains term, AI design prompt, checklist actions, styleguide swatch label). Recoloured; `ink-950` darkened to #0f1d19 so ink on `kesar-600` passes. All e2e axe checks pass |
| Colliding colours, hard seams | Pass | Sky, white, mist band, white, one pine band, white, mist footer. The only hard breaks are the intentional hand-cut edges |
| Content sliced by an edge | Pass | Photos and slips clip to their own radius. Mobile menu head follows the panel radius |
| Nothing centred | Pass | Checked the toggle knob, icon buttons, the count badge and the chat icon |
| Misaligned parallel columns | Pass | Listing cards, tool cards and step cards keep equal heights |
| Mixed hand-cut and rounded | Open | The header strip edge, the bands and the footer skyline stay hand-cut by choice. On the pages checked it reads as one system, but it is the first thing to soften if it looks uneven to you |

## Open (your decision)

- Brand claim "India's first AI + VR real estate platform" is still in about 20 places (SEO descriptions, JSON-LD, the home FAQ, careers). We cannot back "first". The About page now uses plain facts. Say if it should go everywhere.
- The hero headline "Walk in before you visit." and the SEO text promise 360° walkthroughs, but 0 of 109 listings have a tour in the API (D9 in `backend-gaps.md`).
- Most cover photos show a front door or lobby (D15). The card strip shows the rooms, but the first photo is still the owner's choice.

## Open

- Blog covers from the backend are 64 × 64 px placeholders (D1 in `backend-gaps.md`). Since round 3 the site draws a paper cover for each of them; a real cover will show when the backend has one.
- The map price tags are checked with a stubbed map only, because the Google Maps key is expired (D2).
