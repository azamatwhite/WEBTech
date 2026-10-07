# Bootstrap 5 CSS Migration

This table records the custom selectors removed or simplified across the original `base.css`, `azamat.css`, `miko.css`, and `ruslan.css` stylesheets. It maps each change to the Bootstrap 5 classes now present in the HTML. Brand colors, typography, interaction accents, and fixed responsive image dimensions that Bootstrap cannot reproduce remain in `base.css`.

| Removed rule / selector | Source File | Replaced by / Reason |
| :--- | :--- | :--- |
| `:root` (`--color-*`, `--radius`, `--shadow*`, `--transition`) | `base.css` | Brand colors and body values now use Bootstrap `--bs-*` theme variables; layout, shadows, and spacing use Bootstrap utilities. |
| `body`, `main` (font, background, line height, flex layout) | `base.css` | Bootstrap body variables and default line height plus `.d-flex.flex-column.min-vh-100` on `<body>` and `.flex-grow-1` on `<main>`. |
| `.section-heading` (font size, border, spacing) | `base.css` | `.fs-3.fw-bold.text-primary.border-bottom.pb-2.mb-4`. |
| `a`, `a:hover` (global link color and transition) | `base.css` | Bootstrap `--bs-link-color` and `--bs-link-hover-color` theme variables. |
| `.site-header` (sticky positioning, stacking, background, shadow) | `base.css` | `.sticky-top.shadow.bg-dark`; navbar structure uses `.navbar`, `.navbar-expand-lg`, and `.container-fluid`. |
| `.navbar-brand.logo` (line height, flex alignment) | `base.css` | `.navbar-brand.d-inline-flex.align-items-center`. |
| `.navbar-brand.logo img` (logo sizing selector) | `base.css` | Simplified to `.navbar-brand img`; the `max-height` correction remains because Bootstrap has no equivalent fixed maximum. |
| `.navbar-nav .nav-link` (custom padding and transition) | `base.css` | Bootstrap `.navbar-nav` and `.nav-link` provide link layout and interaction defaults; brand colors and active/focus accents remain in `base.css`. |
| `.hero` (padding, alignment, text color, radius) | `base.css` | `.text-center.py-5.px-4.text-white`; the brand gradient remains in `base.css`. |
| `.hero h1` (font, color, margin) | `base.css` | `.display-3` or `.display-4` and `.text-white`; shared heading typography remains in `base.css`. |
| `.hero-subtitle` (font size, color, spacing) | `base.css` | `.lead.text-warning.mb-3`. |
| `.btn-primary`, `.btn-primary:focus`, `.btn-outline-primary`, `.btn-outline-primary:hover`, `.btn-secondary`, `.btn-secondary:hover`, `.btn-outline-secondary` (duplicated button styling) | `base.css` | Bootstrap `.btn` variants handle component states; brand button colors are supplied through the variants' `--bs-btn-*` variables. |
| `.back-to-top` (z-index, weight, letter spacing, transition) | `base.css` | `.btn`, `.btn-primary`, `.position-fixed`, `.bottom-0`, `.end-0`, `.m-4`, `.rounded-pill`, and `.shadow`; the hover lift remains separately defined for the preserved `#quickOrder` and `#backToTop` IDs. |
| `.testimonial`, `.testimonial cite` (quote and attribution styling) | `base.css` | `.fst-italic` on blockquotes and `.text-primary.fw-semibold.fst-normal` on citations. |
| `.chef-note`, `.chef-note mark` (callout background, border, spacing) | `base.css` | `.alert.alert-warning`, border, spacing, and radius utilities; `<mark>` uses Bootstrap's default mark styling. |
| `.top-list`, `.top-list li`, `.top-list li:hover`, `.top-list li::before` (custom counter badges and item cards) | `base.css` | Ordered lists use `.list-group.list-group-numbered.gap-3.shadow-sm`; custom counter and hover rules were removed. |
| `.terms-list dt`, `.terms-list dd` (definition-list typography, spacing, border) | `base.css` | `dt` uses `.text-primary.mt-3`; `dd` uses `.ms-4.text-muted.pb-2.border-bottom` or `.border-0`. |
| `.gallery-carousel-img` `object-fit` declaration | `base.css` | Bootstrap `.object-fit-cover`; the custom class remains only for the 460px/280px responsive heights. |
| `.site-footer` background, padding, and top margin | `base.css` | `.bg-dark.py-5.mt-5`; footer text and link colors remain in `base.css`. |
| `.menu-categories`, `.menu-categories li a`, `.menu-categories li a:hover` (pill navigation layout and hover) | `azamat.css` | `.list-unstyled.d-flex.flex-wrap.gap-2.justify-content-center`, with `.btn.btn-outline-primary.rounded-pill` links. |
| `.menu-dish-img` `object-fit` and radius declarations | `azamat.css` | `.object-fit-cover.rounded.shadow-sm`; fixed dimensions remain as a responsive rule in `base.css`. |
| `.table th`, `.table td` mobile overrides | `azamat.css` | `.table-responsive`, `.table-sm`, and `.text-nowrap` handle compact responsive tables. |
| `.btn.btn-sm` mobile override | `azamat.css` | `.btn-sm.px-2.py-1` on menu action buttons. |
| `.category-header` (font size and accent color) | `azamat.css` | `.p-3.fs-5.text-warning.bg-dark`; shared display typography for table headings remains in `base.css`. |
| `.btn-cart`, `.btn-cart:hover` (custom cart-action button) | `azamat.css` | `.btn.btn-primary.btn-sm.rounded-pill.px-2.py-1`. |
| `.cart-toggle`, `.cart-toggle:hover` (cart button layout and hover) | `azamat.css` | `.btn.btn-outline-light.position-relative`. |
| `.cart-badge` (manual badge positioning and shape) | `azamat.css` | `.position-absolute.top-0.start-100.translate-middle.badge.rounded-pill.bg-warning.text-dark`. |
| `.info-block`, `.info-block h3`, `.info-block ul`, `.info-block ul ul` (callout card and list spacing) | `miko.css` | `.card.border-start.border-4.border-warning.p-4.shadow-sm`, heading utilities, and list spacing utilities. |
| `.review-header` (avatar row alignment and spacing) | `miko.css` | `.d-flex.align-items-center.gap-3.mb-3`. |
| `.review-avatar` (size, crop, circle, border) | `miko.css` | `width="50" height="50"` with `.object-fit-cover.rounded-circle.border.border-2.border-warning`. |
| `.review-attached-photo img` (size, crop, radius, border) | `miko.css` | `width="120" height="120"` with `.object-fit-cover.rounded.shadow-sm.border`. |
| `.review-date` (font size, color, margins) | `miko.css` | `.small.text-muted.mt-auto.mb-0`. |
| `.stat-card` (bottom accent border) | `ruslan.css` | `.card.border-0.border-bottom.border-4.border-primary`. |
| `.stat-number` (size, weight, color, line height) | `ruslan.css` | `.fs-2.lh-sm.fw-bold.text-primary`. |
| `.stat-label` (size, color, top spacing) | `ruslan.css` | `.small.text-muted.mt-1`. |
| `.hall-thumb span` (caption display, typography, spacing, color) | `ruslan.css` | `.d-block.small.fw-bold.text-primary.mt-1`; the thumbnail grid uses `.row.row-cols-3.g-2`. |
| `.rules-list`, `.rules-list li::marker` (list spacing, line height, marker color) | `ruslan.css` | `.text-muted.mb-4.ps-4.lh-lg`; the browser's native list marker replaces the custom marker color. |
| `.card-badge` (absolute promotional badge styling) | `ruslan.css` | Removed as unused; no `.card-badge` element exists in the migrated pages. |

The deleted page-specific stylesheets had no remaining rules after these changes. The shared stylesheet retains only Bootstrap theme-variable overrides, brand typography and interaction colors, the hero gradient, footer colors, and responsive image dimensions.
