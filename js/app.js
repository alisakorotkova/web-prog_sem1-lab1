'use strict';

// Элементы каталога
const productGrid = document.querySelector('#product-grid');
const productCount = document.querySelector('#product-count');

// Элементы корзины
const cartDialog = document.querySelector('#cart-dialog');
const openCartButton = document.querySelector('#open-cart');
const closeCartButton = document.querySelector('#close-cart');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const cartSummary = document.querySelector('#cart-summary');
const emptyCart = document.querySelector('#empty-cart');
const storageMessage = document.querySelector('#storage-message');
const notification = document.querySelector('#notification');

// Элементы оформления заказа.
const checkoutButton = document.querySelector('#checkout-button');
const checkoutSection = document.querySelector('#checkout-section');
const checkoutForm = document.querySelector('#checkout-form');
const firstNameInput = document.querySelector('#first-name');
const phoneInput = document.querySelector('#phone');
const orderSuccess = document.querySelector('#order-success');

const storageKey = 'rassvet-cart';

let cart = [];
let notificationTimer;

// Оформление цены: 4200 - 4 200 ₽.
function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₽';
}

// Каталог

function renderProducts() {
  productGrid.replaceChildren();

  for (const product of products) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'product-image-box';

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = 'images/products/' + product.image;
    image.alt = product.name;
    image.loading = 'lazy';

    imageBox.append(image);

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = formatPrice(product.price);

    const button = document.createElement('button');
    button.className = 'add-button';
    button.type = 'button';
    button.textContent = 'Добавить в корзину';

    button.setAttribute(
      'aria-label',
      'Добавить в корзину: ' + product.name
    );

    button.addEventListener('click', function () {
      addToCart(product.id);
    });

    card.append(imageBox, name, description, price, button);
    productGrid.append(card);
  }

  productCount.textContent = 'Товаров: ' + products.length;
}

// Сохранение корзины

function loadCart() {
  try {
    const savedCart = localStorage.getItem(storageKey);

    if (savedCart === null) {
      return;
    }

    const savedItems = JSON.parse(savedCart);

    if (!Array.isArray(savedItems)) {
      return;
    }

    // Принимаем только существующие товары с допустимым количеством.
    cart = [];

    for (const item of savedItems) {
      if (item === null || typeof item !== 'object') {
        continue;
      }

      const product = products.find(function (product) {
        return product.id === item.id;
      });

      const alreadyAdded = cart.some(function (cartItem) {
        return cartItem.id === item.id;
      });

      if (
        product &&
        !alreadyAdded &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 99
      ) {
        cart.push({
          id: item.id,
          quantity: item.quantity
        });
      }
    }
  } catch {
    // Поврежденные данные не должны мешать открытию магазина
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
    storageMessage.hidden = true;
  } catch {
    storageMessage.textContent =
      'Браузер не разрешает сохранить корзину. После обновления она может сброситься.';

    storageMessage.hidden = false;
  }
}

// После любого изменения сохраняем корзину и обновляем ее вид
function updateCart() {
  saveCart();
  renderCart();
}

// Действия с товарами

function addToCart(productId) {
    orderSuccess.hidden = true;

  const item = cart.find(function (item) {
    return item.id === productId;
  });

  if (item) {
    if (item.quantity >= 99) {
      showNotification('Можно добавить не больше 99 одинаковых товаров.');
      return;
    }

    item.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  updateCart();
  showNotification('Украшение добавлено в корзину');
}

function changeQuantity(productId, change) {
  const item = cart.find(function (item) {
    return item.id === productId;
  });

  if (!item) {
    return;
  }

  const newQuantity = item.quantity + change;

  if (newQuantity < 1 || newQuantity > 99) {
    return;
  }

  item.quantity = newQuantity;
  updateCart();

  // После обновления возвращаем фокус на кнопку этого товара.
  const action = change > 0 ? 'increase' : 'decrease';
  let button = document.getElementById(action + '-' + productId);

  if (button.disabled) {
    const otherAction = change > 0 ? 'decrease' : 'increase';
    button = document.getElementById(otherAction + '-' + productId);
  }

  button.focus();
}

function removeFromCart(productId) {
  cart = cart.filter(function (item) {
    return item.id !== productId;
  });

  updateCart();
  closeCartButton.focus();
}

// Отображение корзины

function renderCart() {
  cartItems.replaceChildren();

  let total = 0;
  let count = 0;

  for (const item of cart) {
    const product = products.find(function (product) {
      return product.id === item.id;
    });

    const itemTotal = product.price * item.quantity;

    total += itemTotal;
    count += item.quantity;

    const row = document.createElement('li');
    row.className = 'cart-item';

    const image = document.createElement('img');
    image.src = 'images/products/' + product.image;
    image.alt = product.name;

    const information = document.createElement('div');
    information.className = 'cart-item-info';

    const name = document.createElement('h3');
    name.textContent = product.name;

    const price = document.createElement('p');
    price.className = 'cart-item-price';
    price.textContent =
      formatPrice(product.price) +
      ' × ' +
      item.quantity +
      ' = ' +
      formatPrice(itemTotal);

    const controls = document.createElement('div');
    controls.className = 'cart-controls';

    const quantityControls = document.createElement('div');
    quantityControls.className = 'quantity-controls';

    const minusButton = document.createElement('button');
    minusButton.type = 'button';
    minusButton.id = 'decrease-' + product.id;
    minusButton.textContent = '−';
    minusButton.disabled = item.quantity === 1;

    minusButton.setAttribute(
      'aria-label',
      'Уменьшить количество: ' + product.name
    );

    minusButton.addEventListener('click', function () {
      changeQuantity(product.id, -1);
    });

    const quantity = document.createElement('span');
    quantity.textContent = item.quantity;
    quantity.setAttribute('aria-label', 'Количество: ' + item.quantity);

    const plusButton = document.createElement('button');
    plusButton.type = 'button';
    plusButton.id = 'increase-' + product.id;
    plusButton.textContent = '+';
    plusButton.disabled = item.quantity === 99;

    plusButton.setAttribute(
      'aria-label',
      'Увеличить количество: ' + product.name
    );

    plusButton.addEventListener('click', function () {
      changeQuantity(product.id, 1);
    });

    quantityControls.append(minusButton, quantity, plusButton);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.textContent = 'Удалить';

    removeButton.setAttribute(
      'aria-label',
      'Удалить из корзины: ' + product.name
    );

    removeButton.addEventListener('click', function () {
      removeFromCart(product.id);
    });

    controls.append(quantityControls, removeButton);
    information.append(name, price, controls);
    row.append(image, information);
    cartItems.append(row);
  }

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);

  emptyCart.hidden = cart.length > 0 || !orderSuccess.hidden;
  cartSummary.hidden = cart.length === 0;

  if (cart.length === 0) {
    checkoutSection.hidden = true;
  }
}

// Сообщения и открытие панели

function showNotification(message) {
  clearTimeout(notificationTimer);

  notification.textContent = message;
  notification.classList.add('visible');

  notificationTimer = setTimeout(function () {
    notification.classList.remove('visible');
  }, 2500);
}

openCartButton.addEventListener('click', function () {
  cartDialog.showModal();
  document.body.classList.add('cart-open');
});

closeCartButton.addEventListener('click', function () {
  cartDialog.close();
});

// Срабатывает и при нажатии крестика, и при закрытии по Escape
cartDialog.addEventListener('close', function () {
  document.body.classList.remove('cart-open');
});


// Оформление заказа

checkoutButton.addEventListener('click', function () {
  if (cart.length === 0) {
    return;
  }

  checkoutSection.hidden = false;
  firstNameInput.focus();
});

// Проверяем допустимые символы и количество цифр в телефоне
function validatePhone() {
  const phone = phoneInput.value.trim();
  const digits = phone.replace(/\D/g, '');

  const allowedCharacters = /^[+\d\s()-]+$/.test(phone);
  const validLength = digits.length >= 10 && digits.length <= 15;

  if (phone === '' || (allowedCharacters && validLength)) {
    phoneInput.setCustomValidity('');
  } else {
    phoneInput.setCustomValidity(
      'Введите телефон: от 10 до 15 цифр. Допустимы +, пробелы, скобки и дефисы.'
    );
  }
}

phoneInput.addEventListener('input', validatePhone);

checkoutForm.addEventListener('submit', function (event) {
  // Останавливаем обычную отправку формы и перезагрузку страницы.
  event.preventDefault();

  validatePhone();

  if (!checkoutForm.reportValidity() || cart.length === 0) {
    return;
  }

  // Очищаем корзину и введенные данные.
  cart = [];
  checkoutForm.reset();
  phoneInput.setCustomValidity('');

  checkoutSection.hidden = true;
  orderSuccess.hidden = false;

  // Сохраняем пустую корзину и обновляем интерфейс
  updateCart();

  // Перемещаем фокус к сообщению об успешном заказе
  orderSuccess.focus();
});

// Запуск страницы

loadCart();
renderProducts();
renderCart();