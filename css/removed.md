# CSS Refactor & Migration Log — Bootstrap 5.3 Migration

This document details all hand-crafted CSS rules, layout declarations, and redundant overrides removed from the custom stylesheet layer (`base.css`, `ruslan.css`, `azamat.css`, `miko.css`), along with the corresponding Bootstrap 5.3 utility classes and components that replaced them.

## Summary of Removed CSS Rules

| Removed rule / selector | Source File | Replaced by / Reason |
|---|---|---|
| `.site-header`, `header` (flexbox/padding/gap layout) | `base.css` | Bootstrap `.navbar`, `.navbar-expand-lg`, `.container-fluid` |
| `.nav-list`, `header nav ul` (custom flex list & gap) | `base.css` | Bootstrap `.navbar-nav`, `.ms-auto` |
| `.nav-list li a`, `header nav a` (manual link box/padding) | `base.css` | Bootstrap `.nav-item`, `.nav-link`, `.active`, `aria-current="page"` |
| `.hero` (`width: 100vw`, `left: 50%`, `margin-left: -50vw` hack) | `base.css` | Bootstrap `.container-fluid` wrapper |
| `.hero h1` (manual `font-size: 2.8rem`) | `base.css` | Bootstrap typography utility `.display-3` / `.display-4` |
| `.hero-subtitle` (manual `font-size`) | `base.css` | Bootstrap `.lead` utility class |
| `.advantages` (manual flexbox layout, centering, wrap & gap) | `base.css` | Bootstrap `.container`, `.row`, `.row-cols-1`, `.row-cols-md-2`, `.row-cols-lg-3`, `.g-4` |
| `.advantage-card` (border, radius, box-shadow, padding) | `base.css` | Bootstrap `.card`, `.card-body`, `.shadow-sm`, `.h-100`, `.border-0` |
| `.gallery-grid`, `figure`, `img`, `figcaption` | `base.css` | Bootstrap `.row`, `.row-cols-*`, `.col`, `.card`, `.img-fluid`, `.shadow-sm` |
| `.float-left` (custom CSS float rule) | `base.css` | Bootstrap utility `.float-start`, `.me-4`, `.mb-3`, `.img-fluid` |
| `.clearfix::after` | `base.css` | Bootstrap `.clearfix` utility |
| `.form-row`, input/select/textarea manual width/padding/radius | `base.css` | Bootstrap `.row`, `.g-3`, `.col-md-*`, `.form-control`, `.form-select`, `.mb-3` |
| `.radio-group`, manual flex layout and label borders | `base.css` | Bootstrap `.form-check`, `.form-check-input`, `.form-check-label`, `.d-flex`, `.gap-3` |
| `.btn`, `.btn--primary`, `.btn--secondary` box/padding rules | `base.css` | Bootstrap `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline-*`, `.btn-lg`, `.btn-sm` |
| `.btn-group` flex layout | `base.css` | Bootstrap `.d-flex`, `.gap-2` / `.gap-3` |
| `#quickOrder` fixed positioning, gradients, shadow, padding | `base.css` | Bootstrap `.btn`, `.btn-primary`, `.position-fixed`, `.bottom-0`, `.end-0`, `.m-4`, `.rounded-pill`, `.shadow` |
| `.back-to-top` fixed positioning, borders, padding | `base.css` | Bootstrap `.btn`, `.btn-primary`, `.position-fixed`, `.bottom-0`, `.end-0`, `.m-4`, `.rounded-pill`, `.shadow` |
| `.site-footer` manual text-align and paragraph margins | `base.css` | Bootstrap `.container`, `.text-center`, `.text-md-start`, `.mb-2`, `.mb-0` |
| `.about-card`, `main .about-card` (specificity demo) | `ruslan.css` | Bootstrap `.card`, `.p-4`, `.shadow-sm`, `.border-0` |
| `#pageTitle`, `.page-title-wrap` (dead specificity override) | `ruslan.css` | Bootstrap `.display-3` / `.display-4` |
| `#booking-form` (double-box container styling) | `ruslan.css` | Bootstrap `.card` on form container (no extra form wrapper styling needed) |
| `.booking-grid-container` (2-column CSS grid) | `ruslan.css` | Bootstrap `.container`, `.row`, `.g-4`, `.col-12`, `.col-lg-6` |
| `.booking-info-card`, `.booking-form-card` box styles | `ruslan.css` | Bootstrap `.card`, `.p-4`, `.shadow-sm`, `.border-0` |
| `.halls-mini-gallery` (CSS grid layout) | `ruslan.css` | Nested Bootstrap `.row`, `.row-cols-3`, `.g-2` inside column |
| `.hall-thumb img` (manual height & object-fit) | `ruslan.css` | Bootstrap `.img-fluid`, `.rounded`, `.shadow-sm` |
| `.table-wrap`, `.data-table` (manual table styling) | `ruslan.css` | Bootstrap `.table-responsive`, `.table`, `.table-striped`, `.table-hover`, `.align-middle` |
| `.positions-grid`, `.position-card` (CSS grid layout) | `azamat.css` | Bootstrap `.row`, `.row-cols-1`, `.row-cols-md-2`, `.g-4`, `.card`, `.p-4`, `.shadow-sm` |
| `.table-wrap`, `.menu-table` (manual table styling) | `azamat.css` | Bootstrap `.table-responsive`, `.table`, `.table-striped`, `.table-hover`, `.table-dark`, `.align-middle` |
| `.reviews-container`, `.review-card` (flex column layout) | `miko.css` | Bootstrap `.row`, `.row-cols-1`, `.row-cols-md-2`, `.g-4`, `.card`, `.p-4`, `.shadow-sm` |
| `.feedback-form input...`, `.form-buttons`, `.btn-submit`, `.btn-reset` | `miko.css` | Bootstrap `.form-control`, `.mb-3`, `.btn`, `.btn-primary`, `.btn-outline-secondary` |
| `.status-badge` (manual pill badge styling) | `miko.css` | Bootstrap `.badge`, `.bg-warning`, `.text-dark` |

## Preserved Styles in Brand Correction Layer
The following styles have been retained and adapted into custom property bindings and brand-specific accent touches:
- `:root` brand variables mapped directly to Bootstrap 5.3 CSS variables (`--bs-primary`, `--bs-primary-rgb`, `--bs-body-bg`, `--bs-body-color`, `--bs-body-font-family`).
- Brand decorative elements: `.top-list` numbering counter discs, `.chef-note` callouts, `.terms-list` definition markers.
- Interactive media controls: `.cart-toggle`, `.cart-badge`, `.menu-dish-img`, `.gallery-carousel-img`, and review media avatars (`.review-avatar`, `.review-attached-photo img`).
