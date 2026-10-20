'use strict';

/**
 * js/delivery.js — Delivery page logic for Dastarkhan Restaurant
 * Handles order summary block, live form validation, and confirmation modal.
 */

if (!document.getElementById('userName') || !document.getElementById('districtSelect')) {
  // Exit early on non-delivery pages
} else {
  initDeliveryPage();
}

function initDeliveryPage() {
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

  function createEl(tag, classes = [], text = '', attrs = {}) {
    const el = document.createElement(tag);
    if (classes.length > 0) el.classList.add(...classes);
    if (text !== '') el.textContent = text;
    for (const [key, val] of Object.entries(attrs)) el.setAttribute(key, val);
    return el;
  }

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

    const [openH, openM] = (SITE.workHours && SITE.workHours.open ? SITE.workHours.open : '11:00').split(':').map(Number);
    const [closeH, closeM] = (SITE.workHours && SITE.workHours.close ? SITE.workHours.close : '23:00').split(':').map(Number);
    const openTotalMins = openH * 60 + openM;
    const closeTotalMins = closeH * 60 + closeM;

    const totalMins = hours * 60 + mins;
    if (totalMins < openTotalMins || totalMins > closeTotalMins) {
      return { isValid: false, message: `Delivery time must be between ${SITE.workHours.open} and ${SITE.workHours.close}.` };
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
          const timeFormatted = `${String(h).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
          return {
            isValid: false,
            message: `For orders today, delivery must be at least ${buffer} min from now (earliest: ${timeFormatted}).`
          };
        }
      }
    }
    return { isValid: true, message: '' };
  }

  function validateField(fieldId, value, dateVal = '') {
    const v = typeof value === 'string' ? value.trim() : '';
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

  function setFieldState(el, isValid, msg = '') {
    if (!el || !el.parentElement) return;
    let fb = el.parentElement.querySelector('.invalid-feedback');
    if (!fb) {
      fb = createEl('div', ['invalid-feedback']);
      el.parentElement.append(fb);
    }
    if (isValid) {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
      fb.textContent = '';
    } else {
      el.classList.remove('is-valid');
      el.classList.add('is-invalid');
      fb.textContent = msg;
    }
  }

  function renderOrderBlock() {
    let block = document.getElementById('deliveryOrderSummaryBlock');
    const formCard = document.querySelector('form')?.closest('.card');
    if (!formCard) return;

    if (!block) {
      block = createEl('section', ['card', 'p-4', 'shadow-sm', 'border-0', 'mb-4'], '', { id: 'deliveryOrderSummaryBlock' });
      formCard.before(block);
    }

    while (block.firstChild) block.removeChild(block.firstChild);
    block.append(createEl('h3', ['fs-4', 'fw-bold', 'text-primary', 'border-bottom', 'pb-2', 'mb-3'], 'Your Order for Delivery'));

    const totals = getCartTotals();

    if (totals.items.length === 0) {
      const box = createEl('div', ['alert', 'alert-warning', 'text-center', 'py-4', 'mb-0']);
      const link = createEl('a', ['btn', 'btn-primary', 'rounded-pill', 'px-4'], 'Browse Dastarkhan Menu →', { href: 'menu.html' });
      box.append(
        createEl('h4', ['h5', 'fw-semibold', 'mb-2'], 'Your cart is currently empty'),
        createEl('p', ['text-muted', 'mb-3'], 'Please choose dishes from our menu before placing a delivery order.'),
        link
      );
      block.append(box);
      return;
    }

    const tableWrap = createEl('div', ['table-responsive', 'mb-3']);
    const table = createEl('table', ['table', 'align-middle', 'table-hover', 'mb-0']);
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
      if (item.image) {
        flex.append(createEl('img', ['rounded', 'object-fit-cover', 'd-none', 'd-sm-block'], '', {
          src: item.image, alt: item.name, width: '48', height: '48'
        }));
      }
      const info = createEl('div');
      info.append(createEl('div', ['fw-semibold'], item.name), createEl('small', ['text-muted'], `${item.weight} g`));
      flex.append(info);
      tdDish.append(flex);

      const tdPrice = createEl('td', ['text-nowrap'], formatPrice(item.price));

      const tdQty = createEl('td', ['text-center']);
      const grp = createEl('div', ['btn-group', 'btn-group-sm'], '', { role: 'group' });
      const minus = createEl('button', ['btn', 'btn-outline-secondary', 'px-2'], '−', { type: 'button' });
      const plus = createEl('button', ['btn', 'btn-outline-secondary', 'px-2'], '+', { type: 'button' });
      minus.addEventListener('click', () => changeQty(item.id, -1));
      plus.addEventListener('click', () => changeQty(item.id, 1));
      grp.append(minus, createEl('span', ['btn', 'btn-light', 'disabled', 'px-3', 'text-dark', 'fw-bold'], String(item.qty)), plus);
      tdQty.append(grp);

      const tdSub = createEl('td', ['text-end', 'fw-bold', 'text-primary', 'text-nowrap'], formatPrice(item.lineTotal));

      const tdDel = createEl('td', ['text-center']);
      const delBtn = createEl('button', ['btn', 'btn-outline-danger', 'btn-sm'], '✕', { type: 'button' });
      delBtn.addEventListener('click', () => removeFromCart(item.id));
      tdDel.append(delBtn);

      tr.append(tdDish, tdPrice, tdQty, tdSub, tdDel);
      tbody.append(tr);
    }
    table.append(thead, tbody);
    tableWrap.append(table);

    const summary = createEl('div', ['card', 'bg-light', 'border-0', 'p-3', 'rounded-3']);
    const delText = totals.deliveryFee === 0 ? `Free (order over ${formatPrice(SITE.freeDeliveryThreshold)})` : formatPrice(totals.deliveryFee);

    const addRow = (label, val) => {
      const r = createEl('div', ['d-flex', 'justify-content-between', 'mb-2']);
      r.append(createEl('span', [], label), createEl('strong', [], val));
      return r;
    };

    summary.append(
      addRow('Dishes Subtotal:', formatPrice(totals.subtotal)),
      addRow('Delivery (Astana):', delText)
    );

    if (totals.subtotal < SITE.minOrder) {
      summary.append(createEl('div', ['alert', 'alert-warning', 'py-2', 'px-3', 'my-2', 'small'],
        `Notice: Minimum order for delivery is ${formatPrice(SITE.minOrder)}. Add ${formatPrice(SITE.minOrder - totals.subtotal)} more to submit.`));
    }

    if (totals.subtotal < SITE.freeDeliveryThreshold) {
      summary.append(createEl('div', ['small', 'text-muted', 'mb-2'],
        `Add ${formatPrice(SITE.freeDeliveryThreshold - totals.subtotal)} more for free delivery`));
    }

    summary.append(createEl('hr', ['my-2']));
    const totRow = createEl('div', ['d-flex', 'justify-content-between', 'fs-5']);
    totRow.append(createEl('strong', [], 'Order Total:'), createEl('strong', ['text-primary'], formatPrice(totals.total)));
    summary.append(totRow);

    block.append(tableWrap, summary);
  }

  function validateForm() {
    const totals = getCartTotals();

    if (totals.items.length === 0) {
      showToast('Your cart is empty. Please add dishes from the menu before ordering.', 'danger');
      document.getElementById('deliveryOrderSummaryBlock')?.scrollIntoView({ behavior: 'smooth' });
      return { isValid: false, firstInvalid: null };
    }

    if (totals.subtotal < SITE.minOrder) {
      showToast(`Minimum order amount is ${formatPrice(SITE.minOrder)}. Please add more dishes.`, 'warning');
      document.getElementById('deliveryOrderSummaryBlock')?.scrollIntoView({ behavior: 'smooth' });
      return { isValid: false, firstInvalid: null };
    }

    const fields = ['userName', 'userPhone', 'portionCount', 'deliveryDate', 'deliveryTime', 'districtSelect', 'deliveryAddress'];
    const curDate = document.getElementById('deliveryDate')?.value || '';
    let formIsValid = true;
    let firstInvalid = null;

    for (const fId of fields) {
      const el = document.getElementById(fId);
      if (!el) continue;
      const res = validateField(fId, el.value, curDate);
      setFieldState(el, res.isValid, res.message);
      if (!res.isValid) {
        formIsValid = false;
        if (!firstInvalid) firstInvalid = el;
      }
    }

    const portionEl = document.getElementById('portionCount');
    if (portionEl && !portionEl.classList.contains('is-invalid')) {
      const guests = parseInt(portionEl.value, 10) || 1;
      if (guests > totals.totalQty * 3) {
        formIsValid = false;
        const msg = `You specified ${guests} guests, but only ${totals.totalQty} dish(es) are in your cart. Please add more dishes or adjust guest count.`;
        setFieldState(portionEl, false, msg);
        if (!firstInvalid) firstInvalid = portionEl;
      }
    }

    return { isValid: formIsValid, firstInvalid };
  }

  function showSummaryModal(data) {
    let modalEl = document.getElementById('orderSummaryModal');
    if (modalEl) modalEl.remove();

    modalEl = createEl('div', ['modal', 'fade'], '', {
      id: 'orderSummaryModal',
      tabindex: '-1',
      role: 'dialog',
      'aria-labelledby': 'orderSummaryTitle',
      'aria-hidden': 'true'
    });

    const dialog = createEl('div', ['modal-dialog', 'modal-dialog-centered', 'modal-lg']);
    const content = createEl('div', ['modal-content']);

    const header = createEl('div', ['modal-header', 'bg-dark', 'text-white']);
    header.append(
      createEl('h4', ['modal-title', 'text-warning'], 'Demo request received', { id: 'orderSummaryTitle' }),
      createEl('button', ['btn-close', 'btn-close-white'], '', { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
    );

    const body = createEl('div', ['modal-body', 'p-4']);
    body.append(createEl('div', ['alert', 'alert-warning', 'fw-semibold', 'border-2', 'border-warning', 'mb-4'],
      'This is a demonstration only: no data is sent to a server and no real order or payment is created.'));

    const refCard = createEl('div', ['card', 'bg-light', 'border-0', 'p-3', 'mb-3', 'text-center']);
    refCard.append(createEl('div', ['fs-5', 'fw-bold', 'text-primary'], `Demo reference: ${data.orderNumber}`));
    body.append(refCard);

    const infoCard = createEl('div', ['card', 'bg-light', 'border-0', 'p-3', 'mb-3']);
    infoCard.append(createEl('h5', ['fw-bold', 'text-primary', 'mb-3'], 'Delivery Details:'));

    const dl = createEl('dl', ['row', 'mb-0']);
    const detailRows = [
      { l: 'Demo reference:', v: data.orderNumber },
      { l: 'Recipient:', v: data.userName },
      { l: 'Phone:', v: data.userPhone },
      { l: 'District:', v: data.districtName },
      { l: 'Address:', v: data.fullAddress },
      { l: 'Time:', v: `${data.deliveryDate} at ${data.deliveryTime}` },
      { l: 'Guests:', v: `${data.portionCount} person(s)` },
      { l: 'Payment:', v: data.paymentMethod },
      { l: 'Utensils:', v: data.needUtensils ? 'Yes, disposable utensils requested' : 'Not required' }
    ];
    if (data.comments) detailRows.push({ l: 'Notes:', v: data.comments });

    for (const r of detailRows) {
      dl.append(
        createEl('dt', ['col-sm-4', 'text-muted'], r.l),
        createEl('dd', ['col-sm-8', 'fw-medium'], r.v)
      );
    }
    infoCard.append(dl);

    const itemsCard = createEl('div', ['card', 'border-0', 'shadow-sm', 'p-3', 'mb-3']);
    itemsCard.append(createEl('h6', ['fw-bold', 'mb-2'], 'Order Contents:'));
    const ul = createEl('ul', ['list-group', 'list-group-flush', 'mb-2']);

    for (const d of data.totals.items) {
      const li = createEl('li', ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'px-0']);
      li.append(createEl('span', [], `${d.name} × ${d.qty}`), createEl('strong', ['text-primary'], formatPrice(d.lineTotal)));
      ul.append(li);
    }

    const grandRow = createEl('div', ['d-flex', 'justify-content-between', 'fs-5', 'fw-bold', 'pt-2', 'border-top']);
    grandRow.append(createEl('span', [], 'Total Amount:'), createEl('span', ['text-primary'], formatPrice(data.totals.total)));
    itemsCard.append(ul, grandRow);

    body.append(infoCard, itemsCard);

    const footer = createEl('div', ['modal-footer', 'd-flex', 'justify-content-between']);
    footer.append(
      createEl('button', ['btn', 'btn-outline-secondary'], 'Close', { type: 'button', 'data-bs-dismiss': 'modal' }),
      createEl('a', ['btn', 'btn-primary'], 'Return to Menu', { href: 'menu.html' })
    );

    content.append(header, body, footer);
    dialog.append(content);
    modalEl.append(dialog);
    document.body.append(modalEl);

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  const form = document.querySelector('form');
  if (!form) return;

  form.setAttribute('novalidate', 'true');

  function initDateTimeAndDefaults() {
    const portionInp = document.getElementById('portionCount');
    if (portionInp && (!portionInp.value || portionInp.value === '')) {
      portionInp.value = '1';
    }

    const dateInp = document.getElementById('deliveryDate');
    const timeInp = document.getElementById('deliveryTime');
    const timeHelp = document.getElementById('deliveryTimeHelp');
    if (!dateInp || !timeInp) return;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    dateInp.min = todayStr;
    if (!dateInp.value) {
      dateInp.value = todayStr;
    }

    function syncTimeConstraints() {
      const isToday = dateInp.value === todayStr;
      const current = new Date();
      const [openH, openM] = (SITE.workHours && SITE.workHours.open ? SITE.workHours.open : '11:00').split(':').map(Number);
      const [closeH, closeM] = (SITE.workHours && SITE.workHours.close ? SITE.workHours.close : '23:00').split(':').map(Number);
      const openTotal = openH * 60 + openM;
      const closeTotal = closeH * 60 + closeM;

      if (isToday) {
        const curMins = current.getHours() * 60 + current.getMinutes();
        const buffer = SITE.prepMinutes || 60;
        const earliestAllowed = Math.max(openTotal, curMins + buffer);

        if (earliestAllowed >= closeTotal) {
          timeInp.min = `${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}`;
          timeInp.max = `${String(closeH).padStart(2, '0')}:${String(closeM).padStart(2, '0')}`;
          if (timeHelp) {
            timeHelp.textContent = 'Kitchen orders for today are closed (kitchen closes at 23:00). Please select tomorrow.';
            timeHelp.className = 'form-text text-danger fw-semibold';
          }
        } else {
          const eH = Math.floor(earliestAllowed / 60);
          const eM = earliestAllowed % 60;
          const minTimeStr = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
          timeInp.min = minTimeStr;
          timeInp.max = `${String(closeH).padStart(2, '0')}:${String(closeM).padStart(2, '0')}`;

          if (!timeInp.value || timeInp.value < minTimeStr) {
            timeInp.value = minTimeStr;
          }
          if (timeHelp) {
            timeHelp.textContent = `Earliest delivery today is ${minTimeStr} (includes 60 min prep time). Working hours: 11:00 – 23:00.`;
            timeHelp.className = 'form-text text-muted';
          }
        }
      } else {
        const minTimeStr = `${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}`;
        timeInp.min = minTimeStr;
        timeInp.max = `${String(closeH).padStart(2, '0')}:${String(closeM).padStart(2, '0')}`;
        if (!timeInp.value) {
          timeInp.value = '12:00';
        }
        if (timeHelp) {
          timeHelp.textContent = 'Delivery working hours: 11:00 – 23:00.';
          timeHelp.className = 'form-text text-muted';
        }
      }
    }

    dateInp.addEventListener('change', () => {
      syncTimeConstraints();
      const res = validateField('deliveryTime', timeInp.value, dateInp.value);
      setFieldState(timeInp, res.isValid, res.message);
    });

    syncTimeConstraints();
  }

  const fields = ['userName', 'userPhone', 'portionCount', 'deliveryDate', 'deliveryTime', 'districtSelect', 'deliveryAddress'];

  for (const fId of fields) {
    const el = document.getElementById(fId);
    if (!el) continue;

    el.addEventListener('blur', () => {
      const curDate = document.getElementById('deliveryDate')?.value || '';
      const res = validateField(fId, el.value, curDate);
      setFieldState(el, res.isValid, res.message);
    });

    const eventName = el.tagName.toLowerCase() === 'select' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      if (el.classList.contains('is-invalid')) {
        const curDate = document.getElementById('deliveryDate')?.value || '';
        const res = validateField(fId, el.value, curDate);
        setFieldState(el, res.isValid, res.message);
      }
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const { isValid, firstInvalid } = validateForm();
    if (!isValid) {
      if (firstInvalid && typeof firstInvalid.focus === 'function') {
        firstInvalid.focus();
      }
      return;
    }

    const uName = document.getElementById('userName').value.trim();
    const uPhone = document.getElementById('userPhone').value.trim();
    const pCount = parseInt(document.getElementById('portionCount').value, 10);
    const dDate = document.getElementById('deliveryDate').value;
    const dTime = document.getElementById('deliveryTime').value;
    const distKey = document.getElementById('districtSelect').value;
    const address = document.getElementById('deliveryAddress').value.trim();
    const entrance = document.getElementById('entranceNumber')?.value.trim() || document.getElementById('deliveryEntrance')?.value.trim() || '';
    const apt = document.getElementById('apartmentNumber')?.value.trim() || document.getElementById('deliveryApt')?.value.trim() || '';
    const payKey = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'online';
    const utensils = Boolean(document.getElementById('needUtensils')?.checked || document.getElementById('utensilsCheck')?.checked);
    const notes = document.getElementById('orderComments')?.value.trim() || document.getElementById('deliveryNotes')?.value.trim() || '';

    let fullAddr = address;
    if (entrance) fullAddr += `, entrance ${entrance}`;
    if (apt) fullAddr += `, apt ${apt}`;

    const orderData = {
      orderNumber: `AST-${Math.floor(100000 + Math.random() * 900000)}`,
      userName: uName,
      userPhone: uPhone,
      portionCount: pCount,
      deliveryDate: dDate,
      deliveryTime: dTime,
      districtName: DISTRICTS[distKey] || distKey,
      fullAddress: fullAddr,
      paymentMethod: PAYMENTS[payKey] || payKey,
      needUtensils: utensils,
      comments: notes,
      totals: getCartTotals()
    };

    showSummaryModal(orderData);
    clearCart(true);

    form.reset();
    initDateTimeAndDefaults();
    for (const fId of fields) {
      const el = document.getElementById(fId);
      if (el) el.classList.remove('is-valid', 'is-invalid');
    }
  });

  form.addEventListener('reset', () => {
    setTimeout(() => {
      initDateTimeAndDefaults();
      for (const fId of fields) {
        const el = document.getElementById(fId);
        if (el) el.classList.remove('is-valid', 'is-invalid');
      }
    }, 10);
  });

  window.addEventListener('dastarkhan:cart-updated', renderOrderBlock);

  document.addEventListener('DOMContentLoaded', () => {
    renderOrderBlock();
    initDateTimeAndDefaults();
  });
}
