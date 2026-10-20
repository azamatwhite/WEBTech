'use strict';

/**
 * js/menu.js — Menu page logic for Dastarkhan Restaurant
 * Handles table rendering, filtering, sorting, zoom modal, and cart modal.
 */

if (!document.querySelector('table.table tbody')) {
  // Exit early on non-menu pages
} else {
  initMenuPage();
}

function initMenuPage() {
  const CATEGORIES = Object.freeze([
    { id: 'lagmans', title: 'Lagmans & Ganfan' },
    { id: 'salads', title: 'Salads' },
    { id: 'turkish', title: 'Turkish Cuisine & Kebabs' },
    { id: 'oriental', title: 'Oriental & Main Dishes' }
  ]);

  const MEAT_LABELS = Object.freeze({
    beef: 'Beef',
    mutton: 'Mutton / Lamb',
    chicken: 'Chicken / Poultry',
    horse: 'Horse Meat',
    fish: 'Fish',
    other: 'Mixed / not specified',
    none: 'Vegetarian'
  });

  const FALLBACK_DISH_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'%3E%3Crect width='100' height='100' rx='12' fill='%23f5ede0'/%3E%3Ccircle cx='50' cy='50' r='32' fill='%23e8ded0' stroke='%23d4a017' stroke-width='2' stroke-dasharray='3 2'/%3E%3Cpath d='M38 48 Q50 32 62 48 Z' fill='%23c8102e'/%3E%3Cpath d='M34 52 H66 Q64 66 50 66 Q36 66 34 52 Z' fill='%23d4a017'/%3E%3Ccircle cx='50' cy='36' r='3' fill='%23c8102e'/%3E%3C/svg%3E";

  let activeZoomDish = null;
  let lastActiveTrigger = null;
  let isRandomPick = false;

  function createEl(tag, classes = [], text = '', attrs = {}) {
    const el = document.createElement(tag);
    if (classes.length > 0) el.classList.add(...classes);
    if (text !== '') el.textContent = text;
    for (const [key, val] of Object.entries(attrs)) el.setAttribute(key, val);
    return el;
  }

  function getDishMeats(dish) {
    if (!dish) return [];
    if (Array.isArray(dish.meats)) {
      return dish.meats;
    }
    if (dish.meat) {
      return [dish.meat];
    }
    return [];
  }

  function filterCatalog(list, options) {
    if (!Array.isArray(list)) return [];
    const query = options.query ? options.query.trim().toLowerCase() : '';
    const cat = options.category || 'all';
    const meat = options.meat || 'all';

    return list.filter(dish => {
      const matchCat = cat === 'all' || dish.category === cat;
      const dishMeats = getDishMeats(dish);
      const matchMeat = meat === 'all' || dishMeats.includes(meat);
      const matchQuery = query === '' ||
        dish.name.toLowerCase().includes(query) ||
        dish.ingredients.toLowerCase().includes(query);
      return matchCat && matchMeat && matchQuery;
    });
  }

  function sortCatalog(list, mode) {
    if (!Array.isArray(list)) return [];
    const copy = [...list];
    switch (mode) {
      case 'price-asc': return copy.sort((a, b) => a.price - b.price);
      case 'price-desc': return copy.sort((a, b) => b.price - a.price);
      case 'name-asc': return copy.sort((a, b) => a.name.localeCompare(b.name, 'en'));
      default: return copy;
    }
  }

  function getRandomSelection(list, count = 4) {
    if (!Array.isArray(list) || list.length === 0) return [];
    const pool = [...list];
    const picks = [];
    const target = Math.min(count, pool.length);
    for (let i = 0; i < target; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picks;
  }

  function buildCategoryHeader(cat) {
    const tr = createEl('tr', ['table-dark']);
    const th = createEl('th', ['p-3', 'fs-5', 'text-warning', 'bg-dark'], '', {
      colspan: '5',
      id: cat.id,
      scope: 'colgroup'
    });
    const italic = createEl('i', [], cat.title);
    th.append(italic);
    tr.append(th);
    return tr;
  }

  function buildDishRow(dish) {
    const tr = createEl('tr', [], '', {
      'data-id': dish.id,
      tabindex: '0',
      role: 'button',
      'aria-label': `View details for ${dish.name}`
    });

    // 1. Photo
    const tdPhoto = createEl('td', ['d-none', 'd-sm-table-cell']);
    const img = createEl('img', ['rounded', 'shadow-sm', 'object-fit-cover'], '', {
      alt: dish.name,
      src: dish.image,
      width: '64',
      height: '64',
      loading: 'lazy'
    });
    img.onerror = function() {
      this.onerror = null;
      this.src = FALLBACK_DISH_SVG;
    };
    tdPhoto.append(img);

    // 2. Name & ingredients (clean text without link styling)
    const thName = createEl('th', [], '', { scope: 'row' });
    thName.append(
      document.createTextNode(dish.name),
      document.createElement('br'),
      createEl('small', ['text-muted', 'fw-normal'], dish.ingredients)
    );

    // 3. Weight
    const tdWeight = createEl('td', ['d-none', 'd-sm-table-cell']);
    tdWeight.append(document.createTextNode(String(dish.weight)), createEl('abbr', [], 'g', { title: 'grams' }));

    // 4. Price
    const tdPrice = createEl('td', ['text-nowrap']);
    tdPrice.append(
      createEl('strong', ['text-primary', 'fw-bold'], dish.price.toLocaleString('ru-RU')),
      document.createTextNode(' '),
      createEl('span', ['currency'], '₸')
    );

    // 5. Add button
    const tdOrder = createEl('td', ['text-center', 'text-nowrap']);
    const addBtn = createEl('button', ['btn', 'btn-primary', 'btn-sm', 'rounded-pill', 'px-2', 'py-1'], '', {
      type: 'button',
      'data-id': dish.id,
      'aria-label': `Add ${dish.name} to cart`
    });
    addBtn.append(document.createTextNode('+ '), createEl('span', ['d-none', 'd-sm-inline'], 'Add'));
    tdOrder.append(addBtn);

    tr.append(tdPhoto, thName, tdWeight, tdPrice, tdOrder);

    addBtn.addEventListener('click', event => {
      event.stopPropagation();
      addToCart(dish.id, 1);
    });

    tr.addEventListener('click', event => {
      if (event.target.closest('button[data-id]')) return;
      openZoomModal(dish, tr);
    });

    tr.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button[data-id]')) {
        event.preventDefault();
        openZoomModal(dish, tr);
      }
    });

    return tr;
  }

  function renderEmptyState(tbody) {
    const tr = createEl('tr');
    const td = createEl('td', ['text-center', 'py-5'], '', { colspan: '5' });

    const box = createEl('div', ['py-4']);
    const resetBtn = createEl('button', ['btn', 'btn-outline-primary', 'rounded-pill', 'px-4'], 'Reset All Filters', { type: 'button' });
    resetBtn.addEventListener('click', resetFilters);

    box.append(
      createEl('div', ['display-5', 'text-muted', 'mb-3'], '🔍'),
      createEl('h4', ['fw-bold', 'text-muted', 'mb-2'], 'No matching dishes found'),
      createEl('p', ['text-muted', 'mb-4'], 'Try relaxing your search query or selecting a different meat/category filter.'),
      resetBtn
    );
    td.append(box);
    tr.append(td);
    tbody.append(tr);
  }

  function updateDishesCounter(dishes) {
    const badge = document.getElementById('menuDishesCountBadge');
    if (badge) {
      badge.textContent = isRandomPick
        ? `Random Pick: ${dishes.length} dishes`
        : `Showing: ${dishes.length} of ${menuItems.length} dishes`;
    }
  }

  function renderMenu(dishes) {
    const tbody = document.querySelector('table.table tbody');
    if (!tbody) return;

    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    updateDishesCounter(dishes);

    if (!Array.isArray(dishes) || dishes.length === 0) {
      renderEmptyState(tbody);
      return;
    }

    const sortMode = document.getElementById('menuSortSelect')?.value || 'default';

    if (sortMode !== 'default' || isRandomPick) {
      for (const dish of dishes) {
        tbody.append(buildDishRow(dish));
      }
    } else {
      for (const cat of CATEGORIES) {
        const inCat = dishes.filter(d => d.category === cat.id);
        if (inCat.length === 0) continue;

        tbody.append(buildCategoryHeader(cat));
        for (const dish of inCat) {
          tbody.append(buildDishRow(dish));
        }
      }
    }
  }

  function buildFilterToolbar() {
    const tableContainer = document.querySelector('.table-responsive');
    if (!tableContainer || document.getElementById('menuFilterCard')) return;

    const card = createEl('div', ['card', 'p-3', 'p-md-4', 'shadow-sm', 'border-0', 'mb-4'], '', { id: 'menuFilterCard' });

    // Row 1: Search, Category, Meat
    const rowTop = createEl('div', ['row', 'g-3', 'align-items-end', 'mb-3']);

    const colSearch = createEl('div', ['col-12', 'col-md-6']);
    const searchInp = createEl('input', ['form-control'], '', {
      type: 'search',
      id: 'menuSearchInput',
      placeholder: 'e.g. lagman, beef, jusai, cheese...',
      'aria-label': 'Search menu'
    });
    colSearch.append(
      createEl('label', ['form-label', 'fw-medium', 'mb-1'], 'Search dishes & ingredients:', { for: 'menuSearchInput' }),
      searchInp
    );

    const colCat = createEl('div', ['col-12', 'col-sm-6', 'col-md-3']);
    const catSelect = createEl('select', ['form-select'], '', { id: 'menuCategorySelect', 'aria-label': 'Category filter' });
    [
      { v: 'all', l: 'All Categories' },
      { v: 'lagmans', l: 'Lagmans & Ganfan' },
      { v: 'salads', l: 'Salads' },
      { v: 'turkish', l: 'Turkish Cuisine' },
      { v: 'oriental', l: 'Oriental Dishes' }
    ].forEach(opt => catSelect.append(createEl('option', [], opt.l, { value: opt.v })));
    colCat.append(createEl('label', ['form-label', 'fw-medium', 'mb-1'], 'Category:', { for: 'menuCategorySelect' }), catSelect);

    const colMeat = createEl('div', ['col-12', 'col-sm-6', 'col-md-3']);
    const meatSelect = createEl('select', ['form-select'], '', { id: 'menuMeatSelect', 'aria-label': 'Meat filter' });
    [
      { v: 'all', l: 'All Meats / Any' },
      { v: 'beef', l: 'Beef' },
      { v: 'mutton', l: 'Mutton / Lamb' },
      { v: 'chicken', l: 'Chicken / Poultry' },
      { v: 'horse', l: 'Horse Meat' },
      { v: 'fish', l: 'Fish' },
      { v: 'other', l: 'Mixed / not specified' },
      { v: 'none', l: 'Vegetarian' }
    ].forEach(opt => meatSelect.append(createEl('option', [], opt.l, { value: opt.v })));
    colMeat.append(createEl('label', ['form-label', 'fw-medium', 'mb-1'], 'Meat Type:', { for: 'menuMeatSelect' }), meatSelect);

    rowTop.append(colSearch, colCat, colMeat);

    // Row 2: Sort, Actions, Counter
    const rowBottom = createEl('div', ['row', 'g-3', 'align-items-center']);

    const colSort = createEl('div', ['col-12', 'col-sm-6', 'col-md-4']);
    const sortSelect = createEl('select', ['form-select'], '', { id: 'menuSortSelect', 'aria-label': 'Sort order' });
    [
      { v: 'default', l: 'Default (Menu Order)' },
      { v: 'price-asc', l: 'Price: Low to High (↑)' },
      { v: 'price-desc', l: 'Price: High to Low (↓)' },
      { v: 'name-asc', l: 'Name (A–Z)' }
    ].forEach(opt => sortSelect.append(createEl('option', [], opt.l, { value: opt.v })));
    colSort.append(createEl('label', ['form-label', 'fw-medium', 'mb-1'], 'Sort By:', { for: 'menuSortSelect' }), sortSelect);

    const colActions = createEl('div', ['col-12', 'col-sm-6', 'col-md-5', 'd-flex', 'gap-2', 'pt-md-4']);
    const btnRandom = createEl('button', ['btn', 'btn-outline-warning', 'text-dark', 'fw-semibold'], '🎲 Random Pick', { type: 'button' });
    const btnReset = createEl('button', ['btn', 'btn-outline-secondary'], 'Reset', { type: 'button' });
    colActions.append(btnRandom, btnReset);

    const colCounter = createEl('div', ['col-12', 'col-md-3', 'text-md-end', 'pt-md-4']);
    const counterBadge = createEl('span', ['badge', 'bg-light', 'text-dark', 'fs-6', 'border', 'p-2'], 'Found: 61 dishes', { id: 'menuDishesCountBadge' });
    colCounter.append(counterBadge);

    rowBottom.append(colSort, colActions, colCounter);
    card.append(rowTop, rowBottom);
    tableContainer.before(card);

    searchInp.addEventListener('input', applyFilters);
    catSelect.addEventListener('change', applyFilters);
    meatSelect.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
    btnReset.addEventListener('click', resetFilters);
    btnRandom.addEventListener('click', () => {
      const picks = getRandomSelection(menuItems, 4);
      isRandomPick = true;
      searchInp.value = '';
      renderMenu(picks);
      showToast('Random selection, not a recommendation or offer', 'info');
    });
  }

  function applyFilters() {
    isRandomPick = false;
    const q = document.getElementById('menuSearchInput')?.value || '';
    const cat = document.getElementById('menuCategorySelect')?.value || 'all';
    const meat = document.getElementById('menuMeatSelect')?.value || 'all';
    const sort = document.getElementById('menuSortSelect')?.value || 'default';

    const filtered = filterCatalog(menuItems, { query: q, category: cat, meat: meat });
    renderMenu(sortCatalog(filtered, sort));
  }

  function resetFilters() {
    isRandomPick = false;
    const s = document.getElementById('menuSearchInput');
    const c = document.getElementById('menuCategorySelect');
    const m = document.getElementById('menuMeatSelect');
    const o = document.getElementById('menuSortSelect');
    if (s) s.value = '';
    if (c) c.value = 'all';
    if (m) m.value = 'all';
    if (o) o.value = 'default';
    renderMenu(menuItems);
    showToast('Filters reset', 'info');
  }

  function buildZoomModal() {
    let modalEl = document.getElementById('dishZoomModal');
    if (modalEl) return modalEl;

    modalEl = createEl('div', ['modal', 'fade'], '', {
      id: 'dishZoomModal',
      tabindex: '-1',
      role: 'dialog',
      'aria-labelledby': 'zoomTitle',
      'aria-hidden': 'true'
    });

    const dialog = createEl('div', ['modal-dialog', 'modal-dialog-centered', 'modal-lg']);
    const content = createEl('div', ['modal-content', 'rounded-4', 'border-0', 'shadow']);

    const header = createEl('div', ['modal-header', 'border-bottom-0', 'pb-0']);
    const title = createEl('h4', ['modal-title', 'fs-5', 'fw-bold', 'text-primary'], '', { id: 'zoomTitle' });
    const closeBtn = createEl('button', ['btn-close'], '', { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' });
    header.append(title, closeBtn);

    const body = createEl('div', ['modal-body', 'p-3', 'p-sm-4']);
    const row = createEl('div', ['row', 'g-4', 'align-items-center']);

    const colImg = createEl('div', ['col-12', 'col-md-5', 'text-center']);
    const imgWrap = createEl('div', ['ratio', 'ratio-1x1', 'rounded-3', 'overflow-hidden', 'bg-light', 'shadow-sm', 'mx-auto', 'border'], '', {
      id: 'zoomImgWrap',
      style: 'max-width: 260px;'
    });
    const spinner = createEl('div', ['spinner-border', 'text-primary', 'position-absolute', 'top-50', 'start-50', 'translate-middle'], '', {
      id: 'zoomImgSpinner',
      role: 'status',
      'aria-hidden': 'true'
    });
    const img = createEl('img', ['w-100', 'h-100', 'object-fit-cover'], '', {
      id: 'zoomImg',
      alt: '',
      style: 'transition: opacity 0.25s ease;'
    });
    imgWrap.append(spinner, img);
    colImg.append(imgWrap);

    const colInfo = createEl('div', ['col-12', 'col-md-7']);
    const badges = createEl('div', ['mb-3', 'd-flex', 'flex-wrap', 'gap-2']);
    badges.append(
      createEl('span', ['badge', 'bg-secondary'], '', { id: 'zoomCatBadge' }),
      createEl('div', ['d-inline-flex', 'flex-wrap', 'gap-2'], '', { id: 'zoomMeatBadges' })
    );

    const weightP = createEl('p', ['mb-2']);
    weightP.append(createEl('strong', [], 'Portion weight: '), createEl('span', [], '', { id: 'zoomWeight' }), document.createTextNode(' g'));

    const qtyGroup = createEl('div', ['btn-group', 'btn-group-sm'], '', { role: 'group' });
    const minusBtn = createEl('button', ['btn', 'btn-outline-secondary', 'px-3'], '−', { type: 'button' });
    const qtyInput = createEl('input', ['form-control', 'text-center', 'fw-bold'], '', {
      type: 'number',
      id: 'zoomQtyInput',
      value: '1',
      min: '1',
      max: '20',
      readonly: 'true'
    });
    const plusBtn = createEl('button', ['btn', 'btn-outline-secondary', 'px-3'], '+', { type: 'button' });
    qtyGroup.append(minusBtn, qtyInput, plusBtn);

    const qtyWrap = createEl('div', ['d-flex', 'align-items-center', 'gap-3']);
    qtyWrap.append(createEl('label', ['fw-medium', 'mb-0'], 'Quantity:'), qtyGroup);

    colInfo.append(
      badges,
      createEl('p', ['fw-semibold', 'mb-1'], 'Ingredients:'),
      createEl('p', ['text-muted', 'mb-3'], '', { id: 'zoomIngredients' }),
      weightP,
      createEl('p', ['fs-4', 'text-primary', 'fw-bold', 'mb-4'], '', { id: 'zoomPrice' }),
      qtyWrap
    );
    row.append(colImg, colInfo);
    body.append(row);

    const footer = createEl('div', ['modal-footer', 'border-top-0', 'pt-0']);
    const addBtn = createEl('button', ['btn', 'btn-primary', 'px-4'], '+ Add to Cart', { type: 'button' });
    footer.append(
      createEl('button', ['btn', 'btn-outline-secondary'], 'Close', { type: 'button', 'data-bs-dismiss': 'modal' }),
      addBtn
    );

    content.append(header, body, footer);
    dialog.append(content);
    modalEl.append(dialog);
    document.body.append(modalEl);

    minusBtn.addEventListener('click', () => {
      const v = parseInt(qtyInput.value, 10) || 1;
      if (v > 1) qtyInput.value = String(v - 1);
    });
    plusBtn.addEventListener('click', () => {
      const v = parseInt(qtyInput.value, 10) || 1;
      if (v < 20) qtyInput.value = String(v + 1);
    });

    addBtn.addEventListener('click', () => {
      if (activeZoomDish) {
        addToCart(activeZoomDish.id, parseInt(qtyInput.value, 10) || 1);
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      if (lastActiveTrigger && typeof lastActiveTrigger.focus === 'function') lastActiveTrigger.focus();
    });

    return modalEl;
  }

  function openZoomModal(dish, triggerEl) {
    if (!dish) return;
    activeZoomDish = dish;
    lastActiveTrigger = triggerEl;
    const modalEl = buildZoomModal();

    document.getElementById('zoomTitle').textContent = dish.name;
    const img = document.getElementById('zoomImg');
    const spinner = document.getElementById('zoomImgSpinner');

    if (spinner) spinner.classList.remove('d-none');
    img.style.opacity = '0';
    img.setAttribute('alt', dish.name);

    const loader = new Image();
    loader.onload = () => {
      img.src = dish.image;
      img.style.opacity = '1';
      if (spinner) spinner.classList.add('d-none');
    };
    loader.onerror = () => {
      img.src = FALLBACK_DISH_SVG;
      img.style.opacity = '1';
      if (spinner) spinner.classList.add('d-none');
    };
    loader.src = dish.image;

    const catObj = CATEGORIES.find(c => c.id === dish.category);
    document.getElementById('zoomCatBadge').textContent = catObj ? catObj.title : dish.category;

    const meatWrap = document.getElementById('zoomMeatBadges');
    if (meatWrap) {
      meatWrap.replaceChildren();
      const meats = getDishMeats(dish);
      for (const m of meats) {
        meatWrap.append(createEl('span', ['badge', 'bg-light', 'text-dark', 'border'], MEAT_LABELS[m] || m));
      }
    }

    document.getElementById('zoomIngredients').textContent = dish.ingredients;
    document.getElementById('zoomWeight').textContent = String(dish.weight);
    document.getElementById('zoomPrice').textContent = formatPrice(dish.price);
    document.getElementById('zoomQtyInput').value = '1';

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  function buildCartModal() {
    let modalEl = document.getElementById('menuCartModal');
    if (modalEl) return modalEl;

    modalEl = createEl('div', ['modal', 'fade'], '', {
      id: 'menuCartModal',
      tabindex: '-1',
      role: 'dialog',
      'aria-labelledby': 'cartModalTitle',
      'aria-hidden': 'true'
    });

    const dialog = createEl('div', ['modal-dialog', 'modal-dialog-centered', 'modal-lg', 'modal-dialog-scrollable']);
    const content = createEl('div', ['modal-content', 'border-0', 'shadow']);

    const header = createEl('div', ['modal-header', 'bg-dark', 'text-white']);
    header.append(
      createEl('h5', ['modal-title', 'text-warning'], 'Your Order Cart — Dastarkhan', { id: 'cartModalTitle' }),
      createEl('button', ['btn-close', 'btn-close-white'], '', { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
    );

    const body = createEl('div', ['modal-body', 'p-3', 'p-sm-4'], '', { id: 'menuCartModalBody', style: 'overflow-x: hidden;' });

    const footer = createEl('div', ['modal-footer', 'd-flex', 'justify-content-between', 'flex-wrap', 'gap-2']);
    const clearBtn = createEl('button', ['btn', 'btn-outline-danger', 'btn-sm'], 'Clear Cart', { type: 'button', id: 'menuCartClearBtn' });
    const rightWrap = createEl('div', ['d-flex', 'gap-2', 'flex-wrap']);
    const continueBtn = createEl('button', ['btn', 'btn-outline-secondary', 'btn-sm'], 'Continue Browsing', { type: 'button', 'data-bs-dismiss': 'modal' });
    const checkoutBtn = createEl('button', ['btn', 'btn-primary', 'btn-sm'], 'Proceed to Delivery →', { type: 'button', id: 'menuCartCheckoutBtn' });
    rightWrap.append(continueBtn, checkoutBtn);
    footer.append(clearBtn, rightWrap);

    content.append(header, body, footer);
    dialog.append(content);
    modalEl.append(dialog);
    document.body.append(modalEl);

    clearBtn.addEventListener('click', () => { clearCart(); renderCartContent(); });
    checkoutBtn.addEventListener('click', () => {
      bootstrap.Modal.getInstance(modalEl)?.hide();
      window.location.href = 'delivery.html';
    });

    return modalEl;
  }

  function renderCartContent() {
    const body = document.getElementById('menuCartModalBody');
    const clearBtn = document.getElementById('menuCartClearBtn');
    const checkoutBtn = document.getElementById('menuCartCheckoutBtn');
    if (!body) return;

    while (body.firstChild) body.removeChild(body.firstChild);
    const totals = getCartTotals();

    if (totals.totalQty === 0) {
      const box = createEl('div', ['text-center', 'py-5']);
      const exploreBtn = createEl('button', ['btn', 'btn-primary', 'rounded-pill', 'px-4'], 'Explore Menu', { type: 'button', 'data-bs-dismiss': 'modal' });
      box.append(
        createEl('div', ['display-6', 'text-muted', 'mb-3'], '🧺'),
        createEl('p', ['fs-5', 'fw-semibold', 'text-muted', 'mb-2'], 'Your cart is currently empty'),
        createEl('p', ['text-muted', 'mb-4'], 'Add delicious dishes from our menu to start your order.'),
        exploreBtn
      );
      body.append(box);
      if (clearBtn) clearBtn.disabled = true;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (clearBtn) clearBtn.disabled = false;
    if (checkoutBtn) checkoutBtn.disabled = false;

    // 1. Desktop Table View (>= 576px)
    const tableWrap = createEl('div', ['d-none', 'd-sm-block', 'table-responsive', 'mb-3']);
    const table = createEl('table', ['table', 'align-middle', 'mb-0']);
    const thead = createEl('thead', ['table-light']);
    const trH = createEl('tr');
    trH.append(
      createEl('th', [], 'Dish', { scope: 'col' }),
      createEl('th', ['text-nowrap'], 'Price', { scope: 'col' }),
      createEl('th', ['text-center'], 'Qty', { scope: 'col' }),
      createEl('th', ['text-end', 'text-nowrap'], 'Subtotal', { scope: 'col' }),
      createEl('th', ['text-center'], '✕', { scope: 'col' })
    );
    thead.append(trH);

    const tbody = createEl('tbody');
    for (const item of totals.items) {
      const tr = createEl('tr');

      const tdDish = createEl('td');
      const flex = createEl('div', ['d-flex', 'align-items-center', 'gap-2']);
      const img = createEl('img', ['rounded', 'object-fit-cover', 'border', 'flex-shrink-0'], '', {
        src: item.image || FALLBACK_DISH_SVG,
        alt: item.name,
        width: '48',
        height: '48',
        loading: 'lazy',
        style: 'background-color: #f7f3ec;'
      });
      img.onerror = function() {
        this.onerror = null;
        this.src = FALLBACK_DISH_SVG;
      };
      const info = createEl('div', ['overflow-hidden']);
      info.append(
        createEl('div', ['fw-semibold', 'text-break'], item.name),
        createEl('small', ['text-muted'], `${item.weight} g`)
      );
      flex.append(img, info);
      tdDish.append(flex);

      const tdPrice = createEl('td', ['text-nowrap'], formatPrice(item.price));

      const tdQty = createEl('td', ['text-center']);
      const grp = createEl('div', ['btn-group', 'btn-group-sm'], '', { role: 'group', 'aria-label': `Change quantity for ${item.name}` });
      const minus = createEl('button', ['btn', 'btn-outline-secondary', 'px-2'], '−', { type: 'button', 'aria-label': 'Decrease' });
      const plus = createEl('button', ['btn', 'btn-outline-secondary', 'px-2'], '+', { type: 'button', 'aria-label': 'Increase' });
      minus.addEventListener('click', () => { changeQty(item.id, -1); renderCartContent(); });
      plus.addEventListener('click', () => { changeQty(item.id, 1); renderCartContent(); });
      grp.append(minus, createEl('span', ['btn', 'btn-light', 'disabled', 'px-3', 'text-dark', 'fw-bold'], String(item.qty)), plus);
      tdQty.append(grp);

      const tdSub = createEl('td', ['text-end', 'fw-bold', 'text-primary', 'text-nowrap'], formatPrice(item.lineTotal));

      const tdDel = createEl('td', ['text-center']);
      const delBtn = createEl('button', ['btn', 'btn-outline-danger', 'btn-sm', 'rounded-circle', 'p-0', 'd-inline-flex', 'align-items-center', 'justify-content-center'], '✕', {
        type: 'button',
        'aria-label': `Remove ${item.name} from cart`,
        title: 'Remove',
        style: 'width: 26px; height: 26px; min-width: 26px; line-height: 1;'
      });
      delBtn.addEventListener('click', () => { removeFromCart(item.id); renderCartContent(); });
      tdDel.append(delBtn);

      tr.append(tdDish, tdPrice, tdQty, tdSub, tdDel);
      tbody.append(tr);
    }
    table.append(thead, tbody);
    tableWrap.append(table);

    // 2. Mobile Card List View (< 576px down to 320px) — Zero horizontal scroll!
    const mobileList = createEl('div', ['d-block', 'd-sm-none', 'mb-3', 'w-100'], '', { style: 'overflow-x: hidden;' });
    for (const item of totals.items) {
      const card = createEl('div', ['card', 'mb-2', 'p-2', 'rounded-3', 'border', 'bg-white', 'shadow-sm', 'w-100', 'overflow-hidden']);
      const cardRow = createEl('div', ['d-flex', 'align-items-start', 'gap-2']);

      const mImg = createEl('img', ['rounded', 'object-fit-cover', 'border', 'flex-shrink-0'], '', {
        src: item.image || FALLBACK_DISH_SVG,
        alt: item.name,
        width: '48',
        height: '48',
        loading: 'lazy',
        style: 'background-color: #f7f3ec;'
      });
      mImg.onerror = function() {
        this.onerror = null;
        this.src = FALLBACK_DISH_SVG;
      };

      const mInfo = createEl('div', ['flex-grow-1', 'overflow-hidden'], '', { style: 'min-width: 0;' });

      // Dish name + Delete button in top row
      const topRow = createEl('div', ['d-flex', 'justify-content-between', 'align-items-start', 'gap-1', 'mb-1']);
      topRow.append(
        createEl('div', ['fw-semibold', 'text-break', 'lh-sm'], item.name),
        (() => {
          const btn = createEl('button', ['btn', 'btn-outline-danger', 'btn-sm', 'rounded-circle', 'p-0', 'd-inline-flex', 'align-items-center', 'justify-content-center', 'flex-shrink-0'], '✕', {
            type: 'button',
            'aria-label': `Remove ${item.name}`,
            title: 'Remove',
            style: 'width: 26px; height: 26px; min-width: 26px; line-height: 1;'
          });
          btn.addEventListener('click', () => { removeFromCart(item.id); renderCartContent(); });
          return btn;
        })()
      );

      // Weight & unit price
      const weightPrice = createEl('div', ['small', 'text-muted', 'mb-2']);
      weightPrice.append(
        document.createTextNode(`${item.weight} g · `),
        createEl('span', ['fw-medium', 'text-dark'], formatPrice(item.price))
      );

      // Quantity Stepper + Line Subtotal
      const bottomRow = createEl('div', ['d-flex', 'justify-content-between', 'align-items-center', 'flex-wrap', 'gap-2', 'pt-1', 'border-top', 'border-light-subtle']);
      const mGrp = createEl('div', ['btn-group', 'btn-group-sm'], '', { role: 'group', 'aria-label': `Quantity for ${item.name}` });
      const mMinus = createEl('button', ['btn', 'btn-outline-secondary', 'px-2', 'py-0'], '−', { type: 'button', 'aria-label': 'Decrease' });
      const mPlus = createEl('button', ['btn', 'btn-outline-secondary', 'px-2', 'py-0'], '+', { type: 'button', 'aria-label': 'Increase' });
      mMinus.addEventListener('click', () => { changeQty(item.id, -1); renderCartContent(); });
      mPlus.addEventListener('click', () => { changeQty(item.id, 1); renderCartContent(); });
      mGrp.append(mMinus, createEl('span', ['btn', 'btn-light', 'disabled', 'px-2', 'py-0', 'text-dark', 'fw-bold'], String(item.qty)), mPlus);

      const mSubtotal = createEl('div', ['fw-bold', 'text-primary', 'text-nowrap'], formatPrice(item.lineTotal));
      bottomRow.append(mGrp, mSubtotal);

      mInfo.append(topRow, weightPrice, bottomRow);
      cardRow.append(mImg, mInfo);
      card.append(cardRow);
      mobileList.append(card);
    }

    // 3. Totals Summary Block
    const summary = createEl('div', ['card', 'bg-light', 'border-0', 'p-3', 'rounded-3']);
    const delText = totals.deliveryFee === 0 ? 'Free' : formatPrice(totals.deliveryFee);

    const makeRow = (label, val, isBold = false) => {
      const r = createEl('div', ['d-flex', 'justify-content-between', 'mb-2']);
      r.append(createEl('span', [], label), createEl(isBold ? 'strong' : 'span', isBold ? ['text-primary'] : [], val));
      return r;
    };

    summary.append(
      makeRow('Total Items / Portions:', String(totals.totalQty)),
      makeRow('Dishes Subtotal:', formatPrice(totals.subtotal)),
      makeRow('Delivery (Astana):', delText)
    );

    if (totals.subtotal < SITE.freeDeliveryThreshold) {
      summary.append(createEl('div', ['small', 'text-muted', 'mb-2'], `Add ${formatPrice(SITE.freeDeliveryThreshold - totals.subtotal)} more for free delivery`));
    }
    summary.append(createEl('hr', ['my-2']));

    const totRow = createEl('div', ['d-flex', 'justify-content-between', 'fs-5']);
    totRow.append(createEl('strong', [], 'Total:'), createEl('strong', ['text-primary'], formatPrice(totals.total)));
    summary.append(totRow);

    body.append(tableWrap, mobileList, summary);
  }

  function openCartModal(triggerBtn) {
    const modalEl = buildCartModal();
    renderCartContent();
    const inst = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalEl.addEventListener('hidden.bs.modal', function onHide() {
      modalEl.removeEventListener('hidden.bs.modal', onHide);
      if (triggerBtn && typeof triggerBtn.focus === 'function') triggerBtn.focus();
    });
    inst.show();
  }

  window.openCartModal = openCartModal;
  window.addEventListener('dastarkhan:cart-updated', () => {
    const m = document.getElementById('menuCartModal');
    if (m && m.classList.contains('show')) renderCartContent();
  });

  document.addEventListener('DOMContentLoaded', () => {
    buildFilterToolbar();
    buildZoomModal();
    buildCartModal();
    renderMenu(menuItems);
  });
}
