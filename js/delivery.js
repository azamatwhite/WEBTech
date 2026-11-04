'use strict';

/**
 * js/delivery.js — Delivery page logic (jQuery version)
 * jQuery 3.7.1 must be loaded BEFORE this file (see delivery.html).
 * Everything is inside $(function () { ... }) = $(document).ready(): runs when the DOM is ready.
 */
$(function () {
  // Selector by id: stop if this is not the delivery page
  if (!$('#userName').length || !$('#districtSelect').length) return;

  const DISTRICTS = Object.freeze({
    yesil: 'Yesil District',
    almaty: 'Almaty District',
    saryarka: 'Saryarka District',
    nura: 'Nura District',
    baikonyr: 'Baikonyr District'
  });

  const PAYMENTS = Object.freeze({
    online: 'Online via Card',
    kaspi: 'Kaspi.kz app',
    halyk: 'Halyk bank app'
  });

  const FALLBACK_DISH_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'%3E%3Crect width='100' height='100' rx='12' fill='%23f5ede0'/%3E%3Ccircle cx='50' cy='50' r='32' fill='%23e8ded0' stroke='%23d4a017' stroke-width='2' stroke-dasharray='3 2'/%3E%3Cpath d='M38 48 Q50 32 62 48 Z' fill='%23c8102e'/%3E%3Cpath d='M34 52 H66 Q64 66 50 66 Q36 66 34 52 Z' fill='%23d4a017'/%3E%3Ccircle cx='50' cy='36' r='3' fill='%23c8102e'/%3E%3C/svg%3E";

  const FIELD_IDS = ['userName', 'userPhone', 'portionCount', 'deliveryDate', 'deliveryTime', 'districtSelect', 'deliveryAddress'];
  // Selector list built from the ids: '#userName, #userPhone, ...'
  const FIELD_SELECTOR = $.map(FIELD_IDS, function (id) { return '#' + id; }).join(', ');

  /* Helper: create an element.
     Old JS: createElement + classList.add + textContent + setAttribute (7 lines).
     jQuery: $('<tag>') + .addClass() + .text() + .attr() — same job in one chain,
     shorter and easier to read. .text() is used (not .html()) so user data can't inject markup. */
  function $el(tag, classes, text, attrs) {
    const $n = $('<' + tag + '>');
    if (classes) $n.addClass(classes);
    if (text !== undefined && text !== '') $n.text(text);
    if (attrs) $n.attr(attrs);
    return $n;
  }

  /* ---------- pure validation logic (no DOM, nothing to rewrite) ---------- */
  function isValidKazakhPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (digits[0] !== '7' && digits[0] !== '8') return false;
    return digits[1] === '6' || digits[1] === '7';
  }

  function validateTime(dateStr, timeStr) {
    if (!timeStr) return { isValid: false, message: 'Please specify delivery time.' };
    const parts = timeStr.split(':');
    if (parts.length !== 2) return { isValid: false, message: 'Invalid time format.' };

    const hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return { isValid: false, message: 'Invalid time value.' };

    const open = (SITE.workHours && SITE.workHours.open) || '11:00';
    const close = (SITE.workHours && SITE.workHours.close) || '23:00';
    const [openH, openM] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    const openTotalMins = openH * 60 + openM;
    const closeTotalMins = closeH * 60 + closeM;

    const totalMins = hours * 60 + mins;
    if (totalMins < openTotalMins || totalMins > closeTotalMins) {
      return { isValid: false, message: 'Delivery time must be between ' + open + ' and ' + close + '.' };
    }

    if (dateStr) {
      const now = new Date();
      const [y, m, d] = dateStr.split('-').map(Number);
      const isToday = now.getFullYear() === y && (now.getMonth() + 1) === m && now.getDate() === d;
      if (isToday) {
        const curMins = now.getHours() * 60 + now.getMinutes();
        const buffer = SITE.prepMinutes || 60;
        const minAllowed = curMins + buffer;
        if (totalMins < minAllowed) {
          const h = Math.floor(minAllowed / 60);
          const mn = minAllowed % 60;
          const timeFormatted = String(h).padStart(2, '0') + ':' + String(mn).padStart(2, '0');
          return {
            isValid: false,
            message: 'For orders today, delivery must be at least ' + buffer + ' min from now (earliest: ' + timeFormatted + ').'
          };
        }
      }
    }
    return { isValid: true, message: '' };
  }

  function validateField(fieldId, value, dateVal) {
    const v = $.trim(value); // trim BEFORE checking (jQuery utility instead of String.trim)
    switch (fieldId) {
      case 'userName':
        if (v.length < 2) return { isValid: false, message: 'Please enter your full name (at least 2 characters).' };
        return { isValid: true, message: '' };
      case 'userPhone':
        if (!isValidKazakhPhone(v)) return { isValid: false, message: 'Enter a valid Kazakhstan phone (+7 7XX or +7 6XX, 11 digits total).' };
        return { isValid: true, message: '' };
      case 'portionCount': {
        const n = parseInt(v, 10);
        if (Number.isNaN(n) || n < 1 || n > 20) return { isValid: false, message: 'Specify number of people between 1 and 20.' };
        return { isValid: true, message: '' };
      }
      case 'deliveryDate': {
        if (!v) return { isValid: false, message: 'Please select delivery date.' };
        const d = new Date(v + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (Number.isNaN(d.getTime()) || d < today) return { isValid: false, message: 'Delivery date cannot be in the past.' };
        return { isValid: true, message: '' };
      }
      case 'deliveryTime':
        return validateTime(dateVal, v);
      case 'districtSelect':
        if (!v) return { isValid: false, message: 'Please select a delivery district in Astana.' };
        return { isValid: true, message: '' };
      case 'deliveryAddress':
        if (v.length < 5) return { isValid: false, message: 'Enter street and house number (at least 5 characters).' };
        return { isValid: true, message: '' };
      default:
        return { isValid: true, message: '' };
    }
  }

  /* ================================================================== *
   * FEATURE 1 — showing / clearing the error next to ONE field
   * Old JS: parentElement.querySelector('.invalid-feedback'), createEl, append,
   *         classList.remove/add x4, textContent (≈ 15 lines).
   * jQuery: .siblings(), .toggleClass() and .text() — about 6 lines.
   *         Clearly shorter, and the if/else on classes disappears.
   * ================================================================== */
  function setFieldState($field, isValid, msg) {
    let $fb = $field.siblings('.invalid-feedback'); // traversal: the message lives next to the field
    if (!$fb.length) {
      $fb = $el('div', 'invalid-feedback').insertAfter($field);
    }
    // Chain of 3 links: 1) .toggleClass('is-valid') green border if valid,
    // 2) .toggleClass('is-invalid') red border if not valid, 3) .attr() tells screen readers.
    $field.toggleClass('is-valid', isValid).toggleClass('is-invalid', !isValid).attr('aria-invalid', String(!isValid));
    $fb.text(isValid ? '' : msg);
  }

  function clearStates() {
    $(FIELD_SELECTOR).removeClass('is-valid is-invalid').removeAttr('aria-invalid');
  }

  /* ================================================================== *
   * FEATURE 2 — order summary built from the cart array
   * Old JS: separate addEventListener for every −, + and ✕ button in the
   *         desktop table AND in the mobile list (6 listeners per dish).
   * jQuery: ONE delegated handler on the summary block (see below), so the
   *         build code only creates elements. Noticeably shorter.
   * ================================================================== */
  function dishThumb(item) {
    return $el('img', 'rounded object-fit-cover border flex-shrink-0 bg-light', '', {
      src: item.image || FALLBACK_DISH_SVG, alt: item.name, width: 48, height: 48, loading: 'lazy'
    }).on('error', function () {
      $(this).off('error').attr('src', FALLBACK_DISH_SVG); // .off() = old "this.onerror = null"
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
      'aria-label': 'Remove ' + item.name + ' from order', title: 'Remove'
    });
  }

  function getOrderBlock() {
    let $block = $('#deliveryOrderSummaryBlock');
    if ($block.length) return $block;

    const $formCard = $('form').first().closest('.card'); // traversal: from the form up to its card
    if (!$formCard.length) return $();

    $block = $el('section', 'card p-3 p-sm-4 shadow-sm border-0 mb-4 overflow-x-hidden', '', { id: 'deliveryOrderSummaryBlock' });
    $formCard.before($block);

    // DELEGATED handler. The block's content is destroyed and rebuilt on every
    // cart change, so buttons bound directly ($('button[data-action]').on(...))
    // would vanish with the old DOM and never exist on the new buttons.
    // The block itself always exists, so it catches clicks from future buttons.
    $block.on('click', 'button[data-action]', function () {
      const $btn = $(this);
      const id = $btn.attr('data-id');
      const action = $btn.attr('data-action');

      if (action === 'remove') {
        // EFFECT 1: the row/card fades out (200 ms); the CALLBACK removes the
        // dish from the cart only when the animation has finished.
        $btn.closest('tr, .card').fadeOut(200, function () { removeFromCart(id); });
      } else {
        changeQty(id, action === 'inc' ? 1 : -1);
      }
    });

    return $block;
  }

  function renderOrderBlock() {
    const $block = getOrderBlock();
    if (!$block.length) return;

    $block.empty().append(
        $el('h3', 'fs-4 fw-bold text-primary border-bottom pb-2 mb-3', 'Your Order for Delivery')
    );

    const totals = getCartTotals();

    if (!totals.items.length) {
      $block.append($el('div', 'alert alert-warning text-center py-4 mb-0').append(
          $el('h4', 'h5 fw-semibold mb-2', 'Your cart is currently empty'),
          $el('p', 'text-muted mb-3', 'Please choose dishes from our menu before placing a delivery order.'),
          $el('a', 'btn btn-primary rounded-pill px-4', 'Browse Dastarkhan Menu →', { href: 'menu.html' })
      ));
      return;
    }

    // Desktop table (>= 576px)
    const $tbody = $('<tbody>');
    $.each(totals.items, function (_, item) {
      $tbody.append($el('tr').append(
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
        $el('table', 'table align-middle table-hover mb-0').append($thead, $tbody)
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
          $el('span', '', label), $el('strong', '', val)
      ));
    }
    addRow('Dishes Subtotal:', formatPrice(totals.subtotal));
    addRow('Delivery (Astana):', totals.deliveryFee === 0
        ? 'Free (order over ' + formatPrice(SITE.freeDeliveryThreshold) + ')'
        : formatPrice(totals.deliveryFee));

    if (totals.subtotal < SITE.minOrder) {
      $summary.append($el('div', 'alert alert-warning py-2 px-3 my-2 small',
          'Notice: Minimum order for delivery is ' + formatPrice(SITE.minOrder) +
          '. Add ' + formatPrice(SITE.minOrder - totals.subtotal) + ' more to submit.'));
    }
    if (totals.subtotal < SITE.freeDeliveryThreshold) {
      $summary.append($el('div', 'small text-muted mb-2',
          'Add ' + formatPrice(SITE.freeDeliveryThreshold - totals.subtotal) + ' more for free delivery'));
    }

    $summary.append(
        $el('hr', 'my-2'),
        $el('div', 'd-flex justify-content-between fs-5').append(
            $el('strong', '', 'Order Total:'),
            $el('strong', 'text-primary', formatPrice(totals.total))
        )
    );

    $block.append($tableWrap, $mobileList, $summary);
  }

  /* ================================================================== *
   * FEATURE 3 — form validation on submit
   * Old JS: for-loop + getElementById + manual first-invalid tracking.
   * jQuery: $.each over the ids + $(FIELD_SELECTOR) helpers. A bit shorter;
   *         the real gain is the one-line .toggleClass() in setFieldState.
   * ================================================================== */
  function validateForm() {
    const totals = getCartTotals();
    const $block = $('#deliveryOrderSummaryBlock');

    if (!totals.items.length) {
      showToast('Your cart is empty. Please add dishes from the menu before ordering.', 'danger');
      $('html, body').animate({ scrollTop: $block.offset().top - 80 }, 400);
      return { isValid: false, $firstInvalid: $() };
    }

    if (totals.subtotal < SITE.minOrder) {
      showToast('Minimum order amount is ' + formatPrice(SITE.minOrder) + '. Please add more dishes.', 'warning');
      $('html, body').animate({ scrollTop: $block.offset().top - 80 }, 400);
      return { isValid: false, $firstInvalid: $() };
    }

    const curDate = $('#deliveryDate').val() || '';
    let formIsValid = true;
    let $firstInvalid = $();

    $.each(FIELD_IDS, function (_, fId) {
      const $f = $('#' + fId);
      const res = validateField(fId, $f.val(), curDate);
      setFieldState($f, res.isValid, res.message);
      if (!res.isValid) {
        formIsValid = false;
        if (!$firstInvalid.length) $firstInvalid = $f;
      }
    });

    const $portion = $('#portionCount');
    if (!$portion.hasClass('is-invalid')) {
      const guests = parseInt($portion.val(), 10) || 1;
      if (guests > totals.totalQty * 3) {
        formIsValid = false;
        setFieldState($portion, false, 'You specified ' + guests + ' guests, but only ' + totals.totalQty +
            ' dish(es) are in your cart. Please add more dishes or adjust guest count.');
        if (!$firstInvalid.length) $firstInvalid = $portion;
      }
    }

    return { isValid: formIsValid, $firstInvalid: $firstInvalid };
  }

  function showSummaryModal(data) {
    $('#orderSummaryModal').remove();

    const $modal = $el('div', 'modal fade', '', {
      id: 'orderSummaryModal', tabindex: -1, role: 'dialog',
      'aria-labelledby': 'orderSummaryTitle', 'aria-hidden': 'true'
    });

    const $header = $el('div', 'modal-header bg-dark text-white').append(
        $el('h4', 'modal-title text-warning', 'Demo request received', { id: 'orderSummaryTitle' }),
        $el('button', 'btn-close btn-close-white', '', { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
    );

    const detailRows = [
      { l: 'Order number:', v: data.orderNumber },
      { l: 'Recipient:', v: data.userName },
      { l: 'Phone:', v: data.userPhone },
      { l: 'District:', v: data.districtName },
      { l: 'Address:', v: data.fullAddress },
      { l: 'Time:', v: data.deliveryDate + ' at ' + data.deliveryTime },
      { l: 'Guests:', v: data.portionCount + ' person(s)' },
      { l: 'Payment:', v: data.paymentMethod },
      { l: 'Utensils:', v: data.needUtensils ? 'Yes, disposable utensils requested' : 'Not required' }
    ];
    if (data.comments) detailRows.push({ l: 'Notes:', v: data.comments });

    const $dl = $el('dl', 'row mb-0');
    $.each(detailRows, function (_, r) {
      $dl.append($el('dt', 'col-sm-4 text-muted', r.l), $el('dd', 'col-sm-8 fw-medium', r.v));
    });

    const $ul = $el('ul', 'list-group list-group-flush mb-2');
    $.each(data.totals.items, function (_, d) {
      $ul.append($el('li', 'list-group-item d-flex justify-content-between align-items-center px-0').append(
          $el('span', 'text-break me-2', d.name + ' × ' + d.qty),
          $el('strong', 'text-primary text-nowrap', formatPrice(d.lineTotal))
      ));
    });

    const $body = $el('div', 'modal-body p-4').append(
        $el('div', 'card bg-light border-0 p-3 mb-3').append(
            $el('h5', 'fw-bold text-primary mb-3', 'Delivery Details:'), $dl
        ),
        $el('div', 'card border-0 shadow-sm p-3 mb-3').append(
            $el('h6', 'fw-bold mb-2', 'Order Contents:'),
            $ul,
            $el('div', 'd-flex justify-content-between fs-5 fw-bold pt-2 border-top').append(
                $el('span', '', 'Total Amount:'),
                $el('span', 'text-primary', formatPrice(data.totals.total))
            )
        )
    );

    const $viewOrdersBtn = $el('button', 'btn btn-outline-primary', 'View My Orders', { type: 'button', id: 'modalViewOrdersBtn' });
    const $footer = $el('div', 'modal-footer d-flex justify-content-between flex-wrap gap-2').append(
        $el('button', 'btn btn-outline-secondary', 'Close', { type: 'button', 'data-bs-dismiss': 'modal' }),
        $el('div', 'd-flex gap-2 flex-wrap').append(
            $viewOrdersBtn,
            $el('a', 'btn btn-primary', 'Return to Menu', { href: 'menu.html' })
        )
    );

    $modal.append($el('div', 'modal-dialog modal-dialog-centered modal-lg').append(
        $el('div', 'modal-content').append($header, $body, $footer)
    ));
    $('body').append($modal);

    $viewOrdersBtn.on('click', function () {
      bootstrap.Modal.getInstance($modal[0]).hide();
      $('#deliveryOrdersBox').slideDown(300);
      const $ordersCard = $('#deliveryOrdersCard');
      if ($ordersCard.length) {
        $('html, body').animate({ scrollTop: $ordersCard.offset().top - 80 }, 400);
      }
    });

    bootstrap.Modal.getOrCreateInstance($modal[0]).show();
  }

  /* ================================================================== *
   * FEATURE 4 — My Orders (Order history stored in Array / localStorage)
   * Without a database, orders are stored in a JavaScript array in localStorage.
   * Built with jQuery: $el(), delegated handlers (.on), effects (.slideToggle, .slideUp).
   * ================================================================== */
  const ORDERS_STORAGE_KEY = 'dastarkhan_orders';

  function getOrders() {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveOrder(order) {
    const list = getOrders();
    list.unshift(order); // new orders at the top
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save order to localStorage:', e);
    }
  }

  function deleteOrder(index) {
    const list = getOrders();
    list.splice(index, 1);
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update orders in localStorage:', e);
    }
  }

  function clearAllOrders() {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
  }

  function getOrdersCard() {
    let $card = $('#deliveryOrdersCard');
    if ($card.length) return $card;

    const $formCard = $('form').first().closest('.card');
    if (!$formCard.length) return $();

    $card = $el('section', 'card p-3 p-sm-4 shadow-sm border-0 rounded-4 bg-white mt-4 overflow-x-hidden', '', {
      id: 'deliveryOrdersCard'
    });

    const $header = $el('div', 'd-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom mb-3').append(
      $el('div', 'd-flex align-items-center gap-2').append(
        $el('h3', 'fs-4 fw-bold text-primary mb-0', '📦 My Orders'),
        $el('span', 'badge bg-secondary rounded-pill fs-6', '0', { id: 'ordersCountBadge' })
      ),
      $el('div', 'd-flex gap-2 flex-wrap').append(
        $el('button', 'btn btn-outline-dark btn-sm rounded-pill px-3', 'Show / Hide Orders', {
          type: 'button', id: 'toggleOrdersBtn'
        }),
        $el('button', 'btn btn-outline-danger btn-sm rounded-pill px-3', 'Clear History', {
          type: 'button', id: 'clearOrdersBtn'
        })
      )
    );

    const $ordersBox = $el('div', 'mt-2', '', { id: 'deliveryOrdersBox' });
    const $ordersList = $el('div', 'd-flex flex-column gap-3', '', { id: 'deliveryOrdersList' });

    $ordersBox.append($ordersList);
    $card.append($header, $ordersBox);
    $formCard.after($card);

    // Delegated event: delete single order
    $ordersList.on('click', '.delete-order-btn', function () {
      const $btn = $(this);
      const index = Number($btn.attr('data-index'));
      const $itemCard = $btn.closest('.order-item-card');

      $itemCard.slideUp(200, function () {
        deleteOrder(index);
        renderOrders();
        showToast('Order removed from history', 'warning');
      });
    });

    // jQuery effect .slideToggle() with duration
    $('#toggleOrdersBtn').on('click', function () {
      renderOrders();
      $ordersBox.slideToggle(300);
    });

    $('#clearOrdersBtn').on('click', function () {
      const orders = getOrders();
      if (!orders.length) {
        showToast('Order history is already empty', 'info');
        return;
      }
      if (window.confirm('Are you sure you want to clear your order history?')) {
        clearAllOrders();
        renderOrders();
        showToast('Order history cleared', 'info');
      }
    });

    return $card;
  }

  function renderOrders() {
    getOrdersCard();
    const $list = $('#deliveryOrdersList');
    const $badge = $('#ordersCountBadge');
    if (!$list.length) return;

    const orders = getOrders();
    $badge.text(String(orders.length));
    $list.empty();

    if (!orders.length) {
      $list.append($el('div', 'text-center py-4 text-muted').append(
        $el('div', 'display-6 mb-2', '📋'),
        $el('p', 'fs-5 fw-semibold mb-1', 'No orders saved yet'),
        $el('p', 'small text-muted mb-0', 'Confirmed orders will appear here automatically.')
      ));
      $('#clearOrdersBtn').prop('disabled', true);
      return;
    }

    $('#clearOrdersBtn').prop('disabled', false);

    $.each(orders, function (index, order) {
      const $orderCard = $el('div', 'card border rounded-3 p-3 bg-light shadow-sm order-item-card');

      const $topRow = $el('div', 'd-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom pb-2 mb-2').append(
        $el('div', 'd-flex align-items-center gap-2').append(
          $el('strong', 'text-primary fs-5', order.orderNumber),
          $el('span', 'badge bg-success-subtle text-success border border-success-subtle', 'Accepted')
        ),
        $el('div', 'd-flex align-items-center gap-2').append(
          $el('small', 'text-muted', order.createdAt || (order.deliveryDate + ' ' + order.deliveryTime)),
          $el('button', 'btn btn-outline-danger btn-sm rounded-circle px-2 py-0 lh-1 delete-order-btn', '✕', {
            type: 'button',
            'data-index': index,
            'aria-label': 'Delete order ' + order.orderNumber,
            title: 'Delete this order'
          })
        )
      );

      const $infoRow = $el('div', 'row g-2 small text-muted mb-2').append(
        $el('div', 'col-12 col-md-6').append(
          $el('span', 'fw-medium text-dark', '👤 Recipient: '),
          $el('span', '', order.userName + ' (' + order.userPhone + ')')
        ),
        $el('div', 'col-12 col-md-6').append(
          $el('span', 'fw-medium text-dark', '📍 Delivery: '),
          $el('span', '', order.districtName + ', ' + order.fullAddress)
        ),
        $el('div', 'col-12 col-md-6').append(
          $el('span', 'fw-medium text-dark', '⏰ Schedule: '),
          $el('span', '', order.deliveryDate + ' at ' + order.deliveryTime)
        ),
        $el('div', 'col-12 col-md-6').append(
          $el('span', 'fw-medium text-dark', '💳 Payment: '),
          $el('span', '', order.paymentMethod + (order.needUtensils ? ' · Utensils included' : ''))
        )
      );

      const $itemsList = $el('ul', 'list-group list-group-flush mb-2 rounded border bg-white');
      if (order.totals && Array.isArray(order.totals.items)) {
        $.each(order.totals.items, function (_, item) {
          $itemsList.append($el('li', 'list-group-item d-flex justify-content-between align-items-center py-2 px-3').append(
            $el('span', 'text-break', item.name + ' × ' + item.qty),
            $el('strong', 'text-primary text-nowrap', formatPrice(item.lineTotal))
          ));
        });
      }

      const orderTotal = (order.totals && order.totals.total) ? formatPrice(order.totals.total) : '0 ₸';
      const $totalRow = $el('div', 'd-flex justify-content-between align-items-center pt-2 border-top').append(
        $el('span', 'fw-bold', 'Order Total:'),
        $el('span', 'fs-5 fw-bold text-primary', orderTotal)
      );

      $orderCard.append($topRow, $infoRow, $itemsList, $totalRow);
      $list.append($orderCard);
    });
  }

  /* ---------- date / time defaults ---------- */
  const $form = $('form').first();
  if (!$form.length) return;

  // The browser attribute "required" stays in the HTML as the FIRST line of defence
  // (fast feedback), but novalidate lets our own jQuery messages show instead of
  // the browser bubbles. A check in the browser NEVER replaces a check on the server:
  // the visitor can remove "required" in DevTools or send the request without the page at all.
  $form.attr('novalidate', 'novalidate');

  function initDateTimeAndDefaults() {
    const $portion = $('#portionCount');
    if (!$portion.val()) $portion.val(1);

    const $date = $('#deliveryDate');
    const $time = $('#deliveryTime');
    const $help = $('#deliveryTimeHelp');
    if (!$date.length || !$time.length) return;

    const now = new Date();
    const todayStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');

    $date.attr('min', todayStr);
    if (!$date.val()) $date.val(todayStr);

    function pad(h, m) { return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }

    function syncTimeConstraints() {
      const isToday = $date.val() === todayStr;
      const current = new Date();
      const open = (SITE.workHours && SITE.workHours.open) || '11:00';
      const close = (SITE.workHours && SITE.workHours.close) || '23:00';
      const [openH, openM] = open.split(':').map(Number);
      const [closeH, closeM] = close.split(':').map(Number);
      const openTotal = openH * 60 + openM;
      const closeTotal = closeH * 60 + closeM;

      $time.attr('max', pad(closeH, closeM));

      if (isToday) {
        const buffer = SITE.prepMinutes || 60;
        const earliest = Math.max(openTotal, current.getHours() * 60 + current.getMinutes() + buffer);

        if (earliest >= closeTotal) {
          $time.attr('min', pad(openH, openM));
          $help.text('Kitchen orders for today are closed (kitchen closes at ' + close + '). Please select tomorrow.')
              .removeClass('text-muted').addClass('text-danger fw-semibold');
        } else {
          const minTimeStr = pad(Math.floor(earliest / 60), earliest % 60);
          $time.attr('min', minTimeStr);
          if (!$time.val() || $time.val() < minTimeStr) $time.val(minTimeStr);
          $help.text('Earliest delivery today is ' + minTimeStr + ' (includes ' + buffer + ' min prep time). Working hours: ' + open + ' – ' + close + '.')
              .removeClass('text-danger fw-semibold').addClass('text-muted');
        }
      } else {
        $time.attr('min', pad(openH, openM));
        if (!$time.val()) $time.val('12:00');
        $help.text('Delivery working hours: ' + open + ' – ' + close + '.')
            .removeClass('text-danger fw-semibold').addClass('text-muted');
      }
    }

    // .off first so calling initDateTimeAndDefaults() again (after reset) doesn't stack handlers
    $date.off('change.defaults').on('change.defaults', function () {
      syncTimeConstraints();
      const res = validateField('deliveryTime', $time.val(), $date.val());
      setFieldState($time, res.isValid, res.message);
    });

    syncTimeConstraints();
  }

  /* ================================================================== *
   * Events (3 types: focusout, input/change, submit, reset)
   * Delegated to the form: one handler per event type instead of
   * 7 fields x 2 listeners in the old version.
   * ================================================================== */
  // blur does not bubble, so for delegation jQuery's 'focusout' is used
  $form.on('focusout', FIELD_SELECTOR, function () {
    const $f = $(this); // $(this) = the field that lost focus
    const res = validateField($f.attr('id'), $f.val(), $('#deliveryDate').val() || '');
    setFieldState($f, res.isValid, res.message);
  });

  // Clear the error as soon as the visitor starts fixing the field
  $form.on('input change', FIELD_SELECTOR, function () {
    const $f = $(this);
    if ($f.hasClass('is-invalid')) {
      const res = validateField($f.attr('id'), $f.val(), $('#deliveryDate').val() || '');
      setFieldState($f, res.isValid, res.message);
    }
  });

  $form.on('submit', function (event) {
    // Without preventDefault() the browser would send the form (GET with "?...")
    // and reload the page: our validation, the modal and the cart reset would be lost.
    event.preventDefault();

    const result = validateForm();
    if (!result.isValid) {
      result.$firstInvalid.trigger('focus');
      return;
    }

    const entrance = $.trim($('#entranceNumber').val());
    const apt = $.trim($('#apartmentNumber').val());
    const distKey = $('#districtSelect').val();
    const payKey = $('input[name="paymentMethod"]:checked').val() || 'online'; // filter :checked

    let fullAddr = $.trim($('#deliveryAddress').val());
    if (entrance) fullAddr += ', entrance ' + entrance;
    if (apt) fullAddr += ', apt ' + apt;

    const orderData = {
      orderNumber: 'AST-' + Math.floor(100000 + Math.random() * 900000),
      userName: $.trim($('#userName').val()),
      userPhone: $.trim($('#userPhone').val()),
      portionCount: parseInt($('#portionCount').val(), 10),
      deliveryDate: $('#deliveryDate').val(),
      deliveryTime: $('#deliveryTime').val(),
      districtName: DISTRICTS[distKey] || distKey,
      fullAddress: fullAddr,
      paymentMethod: PAYMENTS[payKey] || payKey,
      // .prop('checked') = the CURRENT state of the checkbox (true/false).
      // .attr('checked') would only read the initial HTML attribute and ignore the user's click.
      needUtensils: $('#needUtensils').prop('checked'),
      comments: $.trim($('#orderComments').val()),
      totals: getCartTotals(),
      createdAt: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    saveOrder(orderData); // Store order in the orders array (localStorage)
    renderOrders();       // Re-render orders list immediately
    $('#deliveryOrdersBox').slideDown(300);

    showSummaryModal(orderData);
    clearCart(true);   // cart.js fires the update event -> the summary block re-renders
    this.reset();      // success: reset the form (also fires the 'reset' handler below)
  });

  $form.on('reset', function () {
    // The reset event fires BEFORE the fields are cleared, so we wait a tick
    setTimeout(function () {
      initDateTimeAndDefaults();
      clearStates();
    }, 10);
  });

  $(window).on('dastarkhan:cart-updated', renderOrderBlock);

  // Initial render (DOM is ready: we are inside $(function () { ... }))
  renderOrderBlock();
  renderOrders();
  initDateTimeAndDefaults();

  // Handle #my-orders deep link
  if (window.location.hash === '#my-orders') {
    $('#deliveryOrdersBox').show();
    setTimeout(function () {
      const $card = $('#deliveryOrdersCard');
      if ($card.length) {
        $('html, body').animate({ scrollTop: $card.offset().top - 80 }, 400);
      }
    }, 150);
  }
});