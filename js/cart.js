'use strict';

/**
 * js/cart.js — Shared cart utilities for Dastarkhan Restaurant
 * - Cart storage in localStorage ('dastarkhan_cart')
 * - Cart management functions: getCart, saveCart, addToCart, changeQty, removeFromCart, clearCart, getCartTotals
 * - Price formatting in KZT ("2 890 ₸")
 * - Navbar cart badge with live quantity counter
 * - Smooth scroll back-to-top button handler
 * - User feedback toasts (English only)
 */

const CART_STORAGE_KEY = 'dastarkhan_cart';
const MAX_ITEM_QUANTITY = 20;

/**
 * Formats a numeric price into Kazakhstan Tenge format ("2 890 ₸").
 * @param {number} amount - Amount in KZT
 * @returns {string} Formatted price string
 */
function formatPrice(amount) {
  const safeNumber = typeof amount === 'number' && !Number.isNaN(amount) ? Math.round(amount) : 0;
  return safeNumber.toLocaleString('ru-RU') + ' ₸';
}

/**
 * Reads and validates cart items from localStorage.
 * Guaranteed to return an array of { id, qty }.
 * Corrupted data returns an empty array safely.
 * @returns {Array<{id: string, qty: number}>}
 */
function getCart() {
  try {
    const rawData = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validatedItems = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      if (typeof item.id !== 'string' || item.id.trim() === '') {
        continue;
      }
      const quantity = typeof item.qty === 'number' ? item.qty : parseInt(item.qty, 10);
      if (Number.isNaN(quantity) || quantity < 1) {
        continue;
      }

      if (typeof menuItems !== 'undefined' && Array.isArray(menuItems) && menuItems.length > 0) {
        const dishExists = menuItems.some(dish => dish.id === item.id);
        if (!dishExists) {
          continue;
        }
      }

      validatedItems.push({
        id: item.id.trim(),
        qty: Math.min(Math.floor(quantity), MAX_ITEM_QUANTITY)
      });
    }

    return validatedItems;
  } catch (error) {
    console.warn('Failed to parse cart from localStorage, reset to empty:', error);
    return [];
  }
}

/**
 * Saves sanitized cart array ({id, qty}) to localStorage and updates UI.
 * @param {Array<{id: string, qty: number}>} cartList
 */
function saveCart(cartList) {
  const sanitized = Array.isArray(cartList)
    ? cartList
        .filter(entry => entry && typeof entry.id === 'string' && typeof entry.qty === 'number' && entry.qty >= 1)
        .map(entry => ({
          id: entry.id.trim(),
          qty: Math.min(Math.floor(entry.qty), MAX_ITEM_QUANTITY)
        }))
    : [];

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }

  updateNavbarCartBadge();

  if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('dastarkhan:cart-updated', {
      detail: { cart: sanitized }
    }));
  }
}

/**
 * Calculates cart totals and enriches items with current catalog prices.
 * Recalculates all prices strictly from menuItems.
 * @returns {Object} { items, totalQty, subtotal, deliveryFee, total }
 */
function getCartTotals() {
  const cart = getCart();
  const items = [];
  let totalQty = 0;
  let subtotal = 0;

  const catalog = typeof menuItems !== 'undefined' && Array.isArray(menuItems) ? menuItems : [];

  for (const entry of cart) {
    const dish = catalog.find(d => d.id === entry.id);
    if (dish) {
      const lineTotal = dish.price * entry.qty;
      subtotal += lineTotal;
      totalQty += entry.qty;
      items.push({
        id: dish.id,
        name: dish.name,
        category: dish.category,
        meat: dish.meat,
        meats: dish.meats,
        weight: dish.weight,
        price: dish.price,
        ingredients: dish.ingredients,
        image: dish.image,
        qty: entry.qty,
        lineTotal: lineTotal
      });
    } else {
      totalQty += entry.qty;
    }
  }

  const freeThreshold = (typeof SITE !== 'undefined' && SITE.freeDeliveryThreshold) ? SITE.freeDeliveryThreshold : 10000;
  const standardFee = (typeof SITE !== 'undefined' && SITE.deliveryFee !== undefined) ? SITE.deliveryFee : 1000;

  const deliveryFee = (subtotal === 0 || subtotal >= freeThreshold) ? 0 : standardFee;
  const total = subtotal + deliveryFee;

  return {
    items: items,
    totalQty: totalQty,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total
  };
}

/**
 * Displays a non-intrusive feedback toast message using Bootstrap classes.
 * Strictly uses textContent for message display.
 * @param {string} message - Message text
 * @param {string} variant - Bootstrap variant: 'success' | 'warning' | 'info' | 'danger'
 */
function showToast(message, variant = 'success') {
  let container = document.getElementById('toastNotificationContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastNotificationContainer';
    container.classList.add('toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3', 'z-3');
    document.body.append(container);
  }

  const alertBox = document.createElement('div');
  alertBox.classList.add('alert', `alert-${variant}`, 'alert-dismissible', 'fade', 'show', 'shadow', 'mb-2');
  alertBox.setAttribute('role', 'status');
  alertBox.setAttribute('aria-live', 'polite');

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('type', 'button');
  closeBtn.classList.add('btn-close');
  closeBtn.setAttribute('data-bs-dismiss', 'alert');
  closeBtn.setAttribute('aria-label', 'Close notification');

  alertBox.append(textSpan, closeBtn);
  container.append(alertBox);

  setTimeout(() => {
    if (alertBox.isConnected) {
      alertBox.classList.remove('show');
      setTimeout(() => alertBox.remove(), 150);
    }
  }, 3000);
}

/**
 * Adds specified quantity of a dish to the cart.
 * @param {string} id - Dish ID
 * @param {number} qty - Portions count
 */
function addToCart(id, qty = 1) {
  if (!id || typeof id !== 'string') return;
  const cart = getCart();
  const safeQty = Math.max(1, Math.floor(qty));
  const existingIndex = cart.findIndex(entry => entry.id === id);

  if (existingIndex >= 0) {
    const updatedQty = cart[existingIndex].qty + safeQty;
    cart[existingIndex].qty = Math.min(updatedQty, MAX_ITEM_QUANTITY);
  } else {
    cart.push({
      id: id,
      qty: Math.min(safeQty, MAX_ITEM_QUANTITY)
    });
  }

  saveCart(cart);

  const catalog = typeof menuItems !== 'undefined' && Array.isArray(menuItems) ? menuItems : [];
  const dish = catalog.find(d => d.id === id);
  const dishName = dish ? dish.name : 'Item';
  showToast(`"${dishName}" added to cart`, 'success');
}

/**
 * Updates item quantity by delta (+1 or -1).
 * @param {string} id - Dish ID
 * @param {number} delta - Change amount
 */
function changeQty(id, delta) {
  if (!id || typeof id !== 'string') return;
  const cart = getCart();
  const existingIndex = cart.findIndex(entry => entry.id === id);
  if (existingIndex === -1) return;

  const nextQty = cart[existingIndex].qty + delta;
  if (nextQty <= 0) {
    removeFromCart(id);
    return;
  }

  cart[existingIndex].qty = Math.min(nextQty, MAX_ITEM_QUANTITY);
  saveCart(cart);
}

/**
 * Removes an item from the cart.
 * @param {string} id - Dish ID
 */
function removeFromCart(id) {
  if (!id || typeof id !== 'string') return;
  const cart = getCart();
  const catalog = typeof menuItems !== 'undefined' && Array.isArray(menuItems) ? menuItems : [];
  const dish = catalog.find(d => d.id === id);
  const dishName = dish ? dish.name : 'Item';

  const updatedCart = cart.filter(entry => entry.id !== id);
  saveCart(updatedCart);
  showToast(`"${dishName}" removed from cart`, 'warning');
}

/**
 * Clears all items from the cart.
 * @param {boolean} [silent=false] - When true, suppresses feedback toast
 */
function clearCart(silent = false) {
  saveCart([]);
  if (!silent) {
    showToast('Cart cleared', 'info');
  }
}

/**
 * Updates the cart badge with current total item count and price.
 */
function updateNavbarCartBadge() {
  const badgeEl = document.getElementById('navbarCartBadge');
  const totalEl = document.getElementById('floatingCartTotal');
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (badgeEl) {
    badgeEl.textContent = String(totalCount);
  }

  if (totalEl) {
    const totals = getCartTotals();
    totalEl.textContent = formatPrice(totals.subtotal);
  }
}

/**
 * Creates a prominent floating cart widget fixed at the bottom-start.
 * Keeps the navbar header completely untouched and stable across all pages.
 */
function initFloatingCart() {
  if (document.getElementById('floatingCartWidget')) {
    return;
  }

  const container = document.createElement('aside');
  container.id = 'floatingCartWidget';
  container.classList.add('position-fixed', 'bottom-0', 'start-0', 'm-3', 'm-md-4', 'z-3');

  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.id = 'floatingCartBtn';
  btn.classList.add('btn', 'btn-warning', 'rounded-pill', 'shadow-lg', 'py-2', 'px-3', 'px-md-4', 'd-flex', 'align-items-center', 'gap-2', 'border-0', 'text-dark', 'fw-bold');
  btn.setAttribute('aria-label', 'View shopping cart');

  const icon = document.createElement('span');
  icon.classList.add('fs-5');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🛒';

  const label = document.createElement('span');
  label.classList.add('d-none', 'd-sm-inline');
  label.textContent = 'Cart';

  const badge = document.createElement('span');
  badge.id = 'navbarCartBadge';
  badge.classList.add('badge', 'bg-dark', 'text-white', 'rounded-pill', 'px-2');
  badge.textContent = '0';

  const totalSpan = document.createElement('span');
  totalSpan.id = 'floatingCartTotal';
  totalSpan.classList.add('small', 'fw-semibold', 'ps-1', 'border-start', 'border-dark-subtle');
  totalSpan.textContent = '0 ₸';

  btn.append(icon, label, badge, totalSpan);
  container.append(btn);
  document.body.append(container);

  btn.addEventListener('click', () => {
    if (typeof window.openCartModal === 'function') {
      window.openCartModal(btn);
    } else {
      const summaryBlock = document.getElementById('deliveryOrderSummaryBlock');
      if (summaryBlock) {
        summaryBlock.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const currentTotals = getCartTotals();
      if (currentTotals.totalQty > 0) {
        window.location.href = 'delivery.html';
      } else {
        window.location.href = 'menu.html';
      }
    }
  });

  updateNavbarCartBadge();
}

/**
 * Handles smooth scrolling for all Back-to-Top buttons.
 */
function initBackToTop() {
  const topButtons = document.querySelectorAll('a[href="#top"]');
  topButtons.forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      const topTarget = document.getElementById('top') || document.body;
      if (topTarget) {
        topTarget.setAttribute('tabindex', '-1');
        topTarget.focus();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFloatingCart();
  initBackToTop();
});
