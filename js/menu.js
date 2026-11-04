'use strict';

/**
 * js/menu.js — Menu page logic (jQuery version)
 * jQuery 3.7.1 is used: it must be loaded BEFORE this file (see menu.html),
 * otherwise "$ is not defined". The whole code sits in $(function () { ... }),
 * which is the short form of $(document).ready(): it runs when the DOM is built.
 *
 * NOTE: the page is built entirely in code (rows, toolbar, modals), so there is
 * no hand-written HTML/CSS added — only existing Bootstrap classes are switched.
 */
$(function () {
  // Selector by element + class: if there is no menu table, this is not the menu page
  const $tbody = $('table.table tbody');
  if (!$tbody.length) return;

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
  let cartTrigger = null;
  let isRandomPick = false;

  /* ------------------------------------------------------------------ *
   * Helper: create an element.
   * Old JS: document.createElement + classList.add + textContent + setAttribute
   *         in a loop (7 lines). jQuery: $('<tag>') + .addClass() + .text() + .attr()
   *         — the same in one chain. Shorter AND clearer. .text() (not .html())
   *         is used so dish names can never inject markup.
   * ------------------------------------------------------------------ */
  function $el(tag, classes, text, attrs) {
    const $n = $('<' + tag + '>');
    if (classes) $n.addClass(classes);
    if (text !== undefined && text !== '') $n.text(text);
    if (attrs) $n.attr(attrs);
    return $n;
  }

  function findDish(id) {
    return $.grep(menuItems, function (d) { return d.id === id; })[0];
  }

  function getDishMeats(dish) {
    if (!dish) return [];
    if (Array.isArray(dish.meats)) return dish.meats;
    return dish.meat ? [dish.meat] : [];
  }

  /* $.grep replaces Array.prototype.filter here; honestly it is not shorter,
     it is just the jQuery way of doing the same thing. */
  function filterCatalog(list, options) {
    const query = options.query ? $.trim(options.query).toLowerCase() : '';
    const cat = options.category || 'all';
    const meat = options.meat || 'all';

    return $.grep(list, function (dish) {
      const matchCat = cat === 'all' || dish.category === cat;
      const matchMeat = meat === 'all' || getDishMeats(dish).includes(meat);
      const matchQuery = query === '' ||
          dish.name.toLowerCase().includes(query) ||
          dish.ingredients.toLowerCase().includes(query);
      return matchCat && matchMeat && matchQuery;
    });
  }

  function sortCatalog(list, mode) {
    const copy = list.slice();
    switch (mode) {
      case 'price-asc': return copy.sort((a, b) => a.price - b.price);
      case 'price-desc': return copy.sort((a, b) => b.price - a.price);
      case 'name-asc': return copy.sort((a, b) => a.name.localeCompare(b.name, 'en'));
      default: return copy;
    }
  }

  function getRandomSelection(list, count) {
    const pool = list.slice();
    const picks = [];
    const target = Math.min(count, pool.length);
    for (let i = 0; i < target; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    return picks;
  }

  /* ================================================================== *
   * FEATURE 1 — the dish list built from an array (menuItems)
   * Old JS: createEl() x ~15, append(), and addEventListener on EVERY row
   *         and EVERY button (61 rows x 3 listeners).
   * jQuery: $el() + .append(); the 3 listeners are now ONE delegated handler
   *         each on <tbody> (see the "Delegated events" block below).
   *         Result: clearly shorter and much less memory.
   * ================================================================== */
  function buildCategoryHeader(cat) {
    const $th = $el('th', 'p-3 fs-5 text-warning bg-dark', '', {
      colspan: 5, id: cat.id, scope: 'colgroup'
    }).append($el('i', '', cat.title));
    return $el('tr', 'table-dark').append($th);
  }

  function buildDishRow(dish) {
    const $tr = $el('tr', '', '', {
      'data-id': dish.id,
      tabindex: 0,
      role: 'button',
      'aria-label': 'View details for ' + dish.name
    });

    // $(this) inside the handler = the <img> that failed to load.
    // .off('error') replaces the old "this.onerror = null" (avoids an infinite loop).
    const $img = $el('img', 'rounded shadow-sm object-fit-cover', '', {
      alt: dish.name, src: dish.image, width: 64, height: 64, loading: 'lazy'
    }).on('error', function () {
      $(this).off('error').attr('src', FALLBACK_DISH_SVG);
    });

    const $tdPhoto = $el('td', 'd-none d-sm-table-cell').append($img);

    const $thName = $el('th', '', '', { scope: 'row' }).append(
        $el('span', '', dish.name),
        $('<br>'),
        $el('small', 'text-muted fw-normal', dish.ingredients)
    );

    const $tdWeight = $el('td', 'd-none d-sm-table-cell', String(dish.weight))
        .append($el('abbr', '', 'g', { title: 'grams' }));

    const $tdPrice = $el('td', 'text-nowrap').append(
        $el('strong', 'text-primary fw-bold', dish.price.toLocaleString('ru-RU')),
        $el('span', 'currency', ' ₸')
    );

    const $addBtn = $el('button', 'btn btn-primary btn-sm rounded-pill px-2 py-1', '', {
      type: 'button',
      'data-id': dish.id,
      'aria-label': 'Add ' + dish.name + ' to cart'
    }).append('+ ', $el('span', 'd-none d-sm-inline', 'Add'));
    const $tdOrder = $el('td', 'text-center text-nowrap').append($addBtn);

    return $tr.append($tdPhoto, $thName, $tdWeight, $tdPrice, $tdOrder);
  }

  function renderEmptyState() {
    const $reset = $el('button', 'btn btn-outline-primary rounded-pill px-4', 'Reset All Filters', { type: 'button' })
        .on('click', resetFilters);

    const $box = $el('div', 'py-4').append(
        $el('div', 'display-5 text-muted mb-3', '🔍'),
        $el('h4', 'fw-bold text-muted mb-2', 'No matching dishes found'),
        $el('p', 'text-muted mb-4', 'Try relaxing your search query or selecting a different meat/category filter.'),
        $reset
    ).hide();

    $tbody.append($el('tr').append($el('td', 'text-center py-5', '', { colspan: 5 }).append($box)));

    // EFFECT 1: the "nothing found" message fades in (300 ms) so the visitor
    // notices that the list changed after typing a query.
    $box.fadeIn(300);
  }

  function updateDishesCounter(dishes) {
    $('#menuDishesCountBadge').text(isRandomPick
        ? 'Random Pick: ' + dishes.length + ' dishes'
        : 'Showing: ' + dishes.length + ' of ' + menuItems.length + ' dishes');
  }

  function renderMenu(dishes) {
    $tbody.empty(); // replaces the old "while (firstChild) removeChild" loop
    updateDishesCounter(dishes);

    if (!dishes.length) {
      renderEmptyState();
      return;
    }

    const sortMode = $('#menuSortSelect').val() || 'default';

    if (sortMode !== 'default' || isRandomPick) {
      $.each(dishes, function (_, dish) { $tbody.append(buildDishRow(dish)); });
    } else {
      $.each(CATEGORIES, function (_, cat) {
        const inCat = $.grep(dishes, function (d) { return d.category === cat.id; });
        if (!inCat.length) return; // inside $.each, "return" works as "continue"
        $tbody.append(buildCategoryHeader(cat));
        $.each(inCat, function (__, dish) { $tbody.append(buildDishRow(dish)); });
      });
    }
  }

  /* ================================================================== *
   * Delegated events for the dish list
   * The rows are created by renderMenu() every time a filter changes, so
   * a handler bound directly to a row/button (e.g. $('tr').on('click', ...))
   * would only exist on the rows present at bind time and would be lost for
   * every row created later. Binding to <tbody> (which always exists) and
   * passing a selector as 2nd argument works for rows created in the future:
   * the click bubbles up to <tbody>, and jQuery checks if the real target
   * matches the selector.
   * ================================================================== */
  // Selector by attribute: button[data-id]
  $tbody.on('click', 'button[data-id]', function () {
    addToCart($(this).attr('data-id'), 1); // $(this) = the clicked "+ Add" button
  });

  $tbody.on('click', 'tr[data-id]', function (event) {
    if ($(event.target).closest('button[data-id]').length) return; // click on the button, not the row
    openZoomModal(findDish($(this).attr('data-id')), this);
  });

  $tbody.on('keydown', 'tr[data-id]', function (event) {
    if ((event.key === 'Enter' || event.key === ' ') && !$(event.target).closest('button[data-id]').length) {
      event.preventDefault(); // without it the SPACE key would also scroll the page down
      openZoomModal(findDish($(this).attr('data-id')), this);
    }
  });

  /* ================================================================== *
   * FEATURE 2 — filter toolbar (search / category / meat / sort)
   * Old JS: 4 addEventListener + manual getElementById(...)?.value in
   *         applyFilters/resetFilters (≈ 20 lines).
   * jQuery: ONE delegated 'input' handler and ONE delegated 'change' handler
   *         on the card, and .val() getter/setter. About 30% shorter.
   * ================================================================== */
  function buildFilterToolbar() {
    const $tableContainer = $('.table-responsive').first();
    if (!$tableContainer.length || $('#menuFilterCard').length) return;

    const $card = $el('div', 'card p-3 p-md-4 shadow-sm border-0 mb-4', '', { id: 'menuFilterCard' });

    function addOptions($select, options) {
      $.each(options, function (_, opt) {
        $select.append($el('option', '', opt.l, { value: opt.v }));
      });
      return $select;
    }

    // Row 1
    const $rowTop = $el('div', 'row g-3 align-items-end mb-3');

    const $colSearch = $el('div', 'col-12 col-md-6').append(
        $el('label', 'form-label fw-medium mb-1', 'Search dishes & ingredients:', { for: 'menuSearchInput' }),
        $el('input', 'form-control', '', {
          type: 'search', id: 'menuSearchInput',
          placeholder: 'e.g. lagman, beef, jusai, cheese...', 'aria-label': 'Search menu'
        })
    );

    const $colCat = $el('div', 'col-12 col-sm-6 col-md-3').append(
        $el('label', 'form-label fw-medium mb-1', 'Category:', { for: 'menuCategorySelect' }),
        addOptions($el('select', 'form-select', '', { id: 'menuCategorySelect', 'aria-label': 'Category filter' }), [
          { v: 'all', l: 'All Categories' },
          { v: 'lagmans', l: 'Lagmans & Ganfan' },
          { v: 'salads', l: 'Salads' },
          { v: 'turkish', l: 'Turkish Cuisine' },
          { v: 'oriental', l: 'Oriental Dishes' }
        ])
    );

    const meatOptions = [{ v: 'all', l: 'All Meats / Any' }];
    $.each(MEAT_LABELS, function (key, label) { meatOptions.push({ v: key, l: label }); });
    const $colMeat = $el('div', 'col-12 col-sm-6 col-md-3').append(
        $el('label', 'form-label fw-medium mb-1', 'Meat Type:', { for: 'menuMeatSelect' }),
        addOptions($el('select', 'form-select', '', { id: 'menuMeatSelect', 'aria-label': 'Meat filter' }), meatOptions)
    );
    $rowTop.append($colSearch, $colCat, $colMeat);

    // Row 2
    const $rowBottom = $el('div', 'row g-3 align-items-center');

    const $colSort = $el('div', 'col-12 col-sm-6 col-md-4').append(
        $el('label', 'form-label fw-medium mb-1', 'Sort By:', { for: 'menuSortSelect' }),
        addOptions($el('select', 'form-select', '', { id: 'menuSortSelect', 'aria-label': 'Sort order' }), [
          { v: 'default', l: 'Default (Menu Order)' },
          { v: 'price-asc', l: 'Price: Low to High (↑)' },
          { v: 'price-desc', l: 'Price: High to Low (↓)' },
          { v: 'name-asc', l: 'Name (A–Z)' }
        ])
    );

    const $colActions = $el('div', 'col-12 col-sm-6 col-md-5 d-flex gap-2 pt-md-4').append(
        $el('button', 'btn btn-outline-warning text-dark fw-semibold', '🎲 Random Pick', { type: 'button', id: 'menuRandomBtn' }),
        $el('button', 'btn btn-outline-secondary', 'Reset', { type: 'button', id: 'menuResetBtn' })
    );

    const $colCounter = $el('div', 'col-12 col-md-3 text-md-end pt-md-4').append(
        $el('span', 'badge bg-light text-dark fs-6 border p-2', 'Found: 61 dishes', { id: 'menuDishesCountBadge' })
    );

    $rowBottom.append($colSort, $colActions, $colCounter);
    $card.append($rowTop, $rowBottom);
    $tableContainer.before($card);

    // Two different event types, both delegated to the card
    $card.on('input', '#menuSearchInput', applyFilters);
    $card.on('change', 'select', applyFilters);
    $card.on('click', '#menuResetBtn', resetFilters);
    $card.on('click', '#menuRandomBtn', function () {
      isRandomPick = true;
      $('#menuSearchInput').val('');
      renderMenu(getRandomSelection(menuItems, 4));
      showToast('Random selection, not a recommendation or offer', 'info');
    });
  }

  function applyFilters() {
    isRandomPick = false;
    const filtered = filterCatalog(menuItems, {
      query: $('#menuSearchInput').val(),
      category: $('#menuCategorySelect').val(),
      meat: $('#menuMeatSelect').val()
    });
    renderMenu(sortCatalog(filtered, $('#menuSortSelect').val() || 'default'));
  }

  function resetFilters() {
    isRandomPick = false;
    $('#menuSearchInput').val('');
    $('#menuCategorySelect, #menuMeatSelect').val('all'); // one selector, two elements
    $('#menuSortSelect').val('default');
    renderMenu(menuItems);
    showToast('Filters reset', 'info');
  }

  /* ================================================================== *
   * FEATURE 3 — zoom modal (dish details)
   * Old JS: opacity set through img.style.opacity + new Image() loader with
   *         onload/onerror + classList on the spinner (≈ 25 lines).
   * jQuery: .fadeIn() with a callback replaces the manual opacity/transition,
   *         and $('<img>').on('load error') replaces new Image().
   *         Shorter, and the effect is built in.
   * ================================================================== */
  function buildZoomModal() {
    let $modal = $('#dishZoomModal');
    if ($modal.length) return $modal;

    $modal = $el('div', 'modal fade', '', {
      id: 'dishZoomModal', tabindex: -1, role: 'dialog',
      'aria-labelledby': 'zoomTitle', 'aria-hidden': 'true'
    });

    const $header = $el('div', 'modal-header border-bottom-0 pb-0').append(
        $el('h4', 'modal-title fs-5 fw-bold text-primary', '', { id: 'zoomTitle' }),
        $el('button', 'btn-close', '', { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
    );

    // image column
    const $spinner = $el('div', 'spinner-border text-primary position-absolute top-50 start-50 translate-middle', '', {
      id: 'zoomImgSpinner', role: 'status', 'aria-hidden': 'true'
    });
    const $img = $el('img', 'w-100 h-100 object-fit-cover', '', { id: 'zoomImg', alt: '' }).hide();
    const $imgWrap = $el('div', 'ratio ratio-1x1 rounded-3 overflow-hidden bg-light shadow-sm mx-auto border w-75', '', { id: 'zoomImgWrap' })
        .append($spinner, $img);
    const $colImg = $el('div', 'col-12 col-md-5 text-center').append($imgWrap);

    // info column
    const $badges = $el('div', 'mb-3 d-flex flex-wrap gap-2').append(
        $el('span', 'badge bg-secondary', '', { id: 'zoomCatBadge' }),
        $el('div', 'd-inline-flex flex-wrap gap-2', '', { id: 'zoomMeatBadges' })
    );
    const $weightP = $el('p', 'mb-2').append(
        $el('strong', '', 'Portion weight: '),
        $el('span', '', '', { id: 'zoomWeight' }),
        $el('span', '', ' g')
    );

    const $qty = $el('input', 'form-control text-center fw-bold', '', {
      type: 'number', id: 'zoomQtyInput', min: 1, max: 20
    }).val(1).prop('readonly', true); // .prop() — readonly is a boolean property
    const $minus = $el('button', 'btn btn-outline-secondary px-3', '−', { type: 'button' });
    const $plus = $el('button', 'btn btn-outline-secondary px-3', '+', { type: 'button' });
    const $qtyWrap = $el('div', 'd-flex align-items-center gap-3').append(
        $el('label', 'fw-medium mb-0', 'Quantity:'),
        $el('div', 'btn-group btn-group-sm', '', { role: 'group' }).append($minus, $qty, $plus)
    );

    const $colInfo = $el('div', 'col-12 col-md-7').append(
        $badges,
        $el('p', 'fw-semibold mb-1', 'Ingredients:'),
        $el('p', 'text-muted mb-3', '', { id: 'zoomIngredients' }),
        $weightP,
        $el('p', 'fs-4 text-primary fw-bold mb-4', '', { id: 'zoomPrice' }),
        $qtyWrap
    );

    const $body = $el('div', 'modal-body p-3 p-sm-4').append(
        $el('div', 'row g-4 align-items-center').append($colImg, $colInfo)
    );

    const $addBtn = $el('button', 'btn btn-primary px-4', '+ Add to Cart', { type: 'button' });
    const $footer = $el('div', 'modal-footer border-top-0 pt-0').append(
        $el('button', 'btn btn-outline-secondary', 'Close', { type: 'button', 'data-bs-dismiss': 'modal' }),
        $addBtn
    );

    $modal.append($el('div', 'modal-dialog modal-dialog-centered modal-lg').append(
        $el('div', 'modal-content rounded-4 border-0 shadow').append($header, $body, $footer)
    ));
    $('body').append($modal);

    $minus.on('click', function () {
      const v = parseInt($qty.val(), 10) || 1;
      if (v > 1) $qty.val(v - 1);
    });
    $plus.on('click', function () {
      const v = parseInt($qty.val(), 10) || 1;
      if (v < 20) $qty.val(v + 1);
    });

    $addBtn.on('click', function () {
      if (!activeZoomDish) return;
      addToCart(activeZoomDish.id, parseInt($qty.val(), 10) || 1);
      bootstrap.Modal.getInstance($modal[0]).hide();
    });

    // Bootstrap 5 also triggers jQuery events when jQuery is on the page
    $modal.on('hidden.bs.modal', function () {
      if (lastActiveTrigger) $(lastActiveTrigger).trigger('focus');
    });

    return $modal;
  }

  function openZoomModal(dish, triggerEl) {
    if (!dish) return;
    activeZoomDish = dish;
    lastActiveTrigger = triggerEl;
    const $modal = buildZoomModal();

    const $img = $('#zoomImg');
    const $spinner = $('#zoomImgSpinner');

    $('#zoomTitle').text(dish.name);
    $spinner.removeClass('d-none');
    $img.stop(true, true).hide().attr('alt', dish.name);

    // EFFECT 2: the photo fades in (250 ms) when it is loaded; the CALLBACK
    // (runs only after the animation ends) hides the loading spinner.
    function showImage(src) {
      $img.attr('src', src).fadeIn(250, function () {
        $spinner.addClass('d-none');
      });
    }
    $('<img>')
        .on('load', function () { showImage(dish.image); })
        .on('error', function () { showImage(FALLBACK_DISH_SVG); })
        .attr('src', dish.image);

    const catObj = $.grep(CATEGORIES, function (c) { return c.id === dish.category; })[0];
    $('#zoomCatBadge').text(catObj ? catObj.title : dish.category);

    const $meatWrap = $('#zoomMeatBadges').empty();
    $.each(getDishMeats(dish), function (_, m) {
      $meatWrap.append($el('span', 'badge bg-light text-dark border', MEAT_LABELS[m] || m));
    });

    $('#zoomIngredients').text(dish.ingredients);
    $('#zoomWeight').text(dish.weight);
    $('#zoomPrice').text(formatPrice(dish.price));
    $('#zoomQtyInput').val(1);

    bootstrap.Modal.getOrCreateInstance($modal[0]).show();
  }

  /* ================================================================== *
   * Cart modal
   * Old JS: separate addEventListener on every − / + / ✕ button, and the
   *         whole modal was re-rendered by hand after each click.
   * jQuery: ONE delegated handler on the modal body (buttons are re-created on
   *         every render, so direct binding would be lost). The re-render is
   *         triggered by the 'dastarkhan:cart-updated' event from cart.js.
   * ================================================================== */
  function dishThumb(item) {
    return $el('img', 'rounded object-fit-cover border flex-shrink-0 bg-light', '', {
      src: item.image || FALLBACK_DISH_SVG, alt: item.name, width: 48, height: 48, loading: 'lazy'
    }).on('error', function () {
      $(this).off('error').attr('src', FALLBACK_DISH_SVG);
    });
  }

  function qtyGroup(item, compact) {
    const pad = compact ? 'px-2 py-0' : 'px-2';
    return $el('div', 'btn-group btn-group-sm', '', { role: 'group', 'aria-label': 'Quantity for ' + item.name }).append(
        $el('button', 'btn btn-outline-secondary ' + pad, '−', { type: 'button', 'data-action': 'dec', 'data-id': item.id, 'aria-label': 'Decrease' }),
        $el('span', 'btn btn-light disabled text-dark fw-bold ' + (compact ? 'px-2 py-0' : 'px-3'), String(item.qty)),
        $el('button', 'btn btn-outline-secondary ' + pad, '+', { type: 'button', 'data-action': 'inc', 'data-id': item.id, 'aria-label': 'Increase' })
    );
  }

  function removeBtn(item) {
    return $el('button', 'btn btn-outline-danger btn-sm rounded-circle px-2 py-0 lh-1 flex-shrink-0', '✕', {
      type: 'button', 'data-action': 'remove', 'data-id': item.id,
      'aria-label': 'Remove ' + item.name + ' from cart', title: 'Remove'
    });
  }

  function buildCartModal() {
    let $modal = $('#menuCartModal');
    if ($modal.length) return $modal;

    $modal = $el('div', 'modal fade', '', {
      id: 'menuCartModal', tabindex: -1, role: 'dialog',
      'aria-labelledby': 'cartModalTitle', 'aria-hidden': 'true'
    });

    const $header = $el('div', 'modal-header bg-dark text-white').append(
        $el('h5', 'modal-title text-warning', 'Your Order Cart — Dastarkhan', { id: 'cartModalTitle' }),
        $el('button', 'btn-close btn-close-white', '', { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
    );
    const $body = $el('div', 'modal-body p-3 p-sm-4 overflow-x-hidden', '', { id: 'menuCartModalBody' });

    const $clearBtn = $el('button', 'btn btn-outline-danger btn-sm', 'Clear Cart', { type: 'button', id: 'menuCartClearBtn' });
    const $checkoutBtn = $el('button', 'btn btn-primary btn-sm', 'Proceed to Delivery →', { type: 'button', id: 'menuCartCheckoutBtn' });
    const $ordersBtn = $el('a', 'btn btn-outline-dark btn-sm', '📦 My Orders', { href: 'delivery.html#my-orders' });
    const $footer = $el('div', 'modal-footer d-flex justify-content-between flex-wrap gap-2').append(
        $clearBtn,
        $el('div', 'd-flex gap-2 flex-wrap').append(
            $ordersBtn,
            $el('button', 'btn btn-outline-secondary btn-sm', 'Continue Browsing', { type: 'button', 'data-bs-dismiss': 'modal' }),
            $checkoutBtn
        )
    );

    $modal.append($el('div', 'modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable').append(
        $el('div', 'modal-content border-0 shadow').append($header, $body, $footer)
    ));
    $('body').append($modal);

    $clearBtn.on('click', function () { clearCart(); }); // cart.js fires the update event -> re-render

    $checkoutBtn.on('click', function () {
      bootstrap.Modal.getInstance($modal[0]).hide();
      window.location.href = 'delivery.html';
    });

    // DELEGATED handler: −, + and ✕ buttons are created again on each render
    $body.on('click', 'button[data-action]', function () {
      const $btn = $(this);
      const id = $btn.attr('data-id');
      const action = $btn.attr('data-action');

      if (action === 'remove') {
        // EFFECT 3: the row/card fades out (200 ms); the CALLBACK removes the item
        // from the cart only after the animation is finished.
        $btn.closest('tr, .card').fadeOut(200, function () { removeFromCart(id); });
      } else {
        changeQty(id, action === 'inc' ? 1 : -1);
      }
    });

    $modal.on('hidden.bs.modal', function () {
      if (cartTrigger) $(cartTrigger).trigger('focus');
    });

    return $modal;
  }

  function renderCartContent() {
    const $body = $('#menuCartModalBody');
    if (!$body.length) return;

    $body.empty();
    const totals = getCartTotals();
    const isEmpty = totals.totalQty === 0;

    // .prop('disabled') — a boolean property, not an attribute
    $('#menuCartClearBtn, #menuCartCheckoutBtn').prop('disabled', isEmpty);

    if (isEmpty) {
      $body.append($el('div', 'text-center py-5').append(
          $el('div', 'display-6 text-muted mb-3', '🧺'),
          $el('p', 'fs-5 fw-semibold text-muted mb-2', 'Your cart is currently empty'),
          $el('p', 'text-muted mb-4', 'Add delicious dishes from our menu to start your order.'),
          $el('button', 'btn btn-primary rounded-pill px-4', 'Explore Menu', { type: 'button', 'data-bs-dismiss': 'modal' })
      ));
      return;
    }

    // Desktop table (>= 576px)
    const $tbodyCart = $('<tbody>');
    $.each(totals.items, function (_, item) {
      $tbodyCart.append($el('tr').append(
          $el('td').append($el('div', 'd-flex align-items-center gap-2').append(
              dishThumb(item),
              $el('div', 'overflow-hidden').append(
                  $el('div', 'fw-semibold text-break', item.name),
                  $el('small', 'text-muted', item.weight + ' g')
              )
          )),
          $el('td', 'text-nowrap', formatPrice(item.price)),
          $el('td', 'text-center').append(qtyGroup(item, false)),
          $el('td', 'text-end fw-bold text-primary text-nowrap', formatPrice(item.lineTotal)),
          $el('td', 'text-center').append(removeBtn(item))
      ));
    });
    const $thead = $el('thead', 'table-light').append($el('tr').append(
        $el('th', '', 'Dish', { scope: 'col' }),
        $el('th', 'text-nowrap', 'Price', { scope: 'col' }),
        $el('th', 'text-center', 'Qty', { scope: 'col' }),
        $el('th', 'text-end text-nowrap', 'Subtotal', { scope: 'col' }),
        $el('th', 'text-center', '✕', { scope: 'col' })
    ));
    const $tableWrap = $el('div', 'd-none d-sm-block table-responsive mb-3').append(
        $el('table', 'table align-middle mb-0').append($thead, $tbodyCart)
    );

    // Mobile card list (< 576px)
    const $mobileList = $el('div', 'd-block d-sm-none mb-3 w-100 overflow-x-hidden');
    $.each(totals.items, function (_, item) {
      $mobileList.append($el('div', 'card mb-2 p-2 rounded-3 border bg-white shadow-sm w-100 overflow-hidden').append(
          $el('div', 'd-flex align-items-start gap-2').append(
              dishThumb(item),
              $el('div', 'flex-grow-1 overflow-hidden').append(
                  $el('div', 'd-flex justify-content-between align-items-start gap-1 mb-1').append(
                      $el('div', 'fw-semibold text-break lh-sm', item.name),
                      removeBtn(item)
                  ),
                  $el('div', 'small text-muted mb-2').append(
                      $el('span', '', item.weight + ' g · '),
                      $el('span', 'fw-medium text-dark', formatPrice(item.price))
                  ),
                  $el('div', 'd-flex justify-content-between align-items-center flex-wrap gap-2 pt-1 border-top border-light-subtle').append(
                      qtyGroup(item, true),
                      $el('div', 'fw-bold text-primary text-nowrap', formatPrice(item.lineTotal))
                  )
              )
          )
      ));
    });

    // Totals
    const $summary = $el('div', 'card bg-light border-0 p-3 rounded-3');
    function addRow(label, val) {
      $summary.append($el('div', 'd-flex justify-content-between mb-2').append(
          $el('span', '', label), $el('span', '', val)
      ));
    }
    addRow('Total Items / Portions:', String(totals.totalQty));
    addRow('Dishes Subtotal:', formatPrice(totals.subtotal));
    addRow('Delivery (Astana):', totals.deliveryFee === 0 ? 'Free' : formatPrice(totals.deliveryFee));

    if (totals.subtotal < SITE.freeDeliveryThreshold) {
      $summary.append($el('div', 'small text-muted mb-2',
          'Add ' + formatPrice(SITE.freeDeliveryThreshold - totals.subtotal) + ' more for free delivery'));
    }
    $summary.append(
        $el('hr', 'my-2'),
        $el('div', 'd-flex justify-content-between fs-5').append(
            $el('strong', '', 'Total:'),
            $el('strong', 'text-primary', formatPrice(totals.total))
        )
    );

    $body.append($tableWrap, $mobileList, $summary);
  }

  function openCartModal(triggerBtn) {
    cartTrigger = triggerBtn;
    const $modal = buildCartModal();
    renderCartContent();
    bootstrap.Modal.getOrCreateInstance($modal[0]).show();
  }

  window.openCartModal = openCartModal; // cart.js calls it from the floating cart button

  // Re-render the open cart whenever cart.js reports a change
  $(window).on('dastarkhan:cart-updated', function () {
    if ($('#menuCartModal').hasClass('show')) renderCartContent();
  });

  // Initial build (the DOM is ready here, because we are inside $(function(){...}))
  buildFilterToolbar();
  buildZoomModal();
  buildCartModal();
  renderMenu(menuItems);
});