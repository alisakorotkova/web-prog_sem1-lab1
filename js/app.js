'use strict';

const productGrid = document.querySelector('#product-grid');
const productCount = document.querySelector('#product-count');

function renderProducts() {
  productGrid.replaceChildren();

  for (const product of products) {
    // Карточка одного товара.
    const card = document.createElement('article');
    card.className = 'product-card';

    // Обертка ограничивает фотографию квадратом.
    const imageBox = document.createElement('div');
    imageBox.className = 'product-image-box';

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = 'images/products/' + product.image;
    image.alt = product.name;
    image.loading = 'lazy';

    imageBox.append(image);

    // Название и описание.
    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description;

    // число 4200 отображается как 4 200 ₽.
    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = product.price.toLocaleString('ru-RU') + ' ₽';

    
    const button = document.createElement('button');
    button.className = 'add-button';
    button.type = 'button';
    button.textContent = 'Добавить в корзину';
    button.dataset.productId = product.id;

    button.setAttribute(
      'aria-label',
      'Добавить в корзину: ' + product.name
    );

    card.append(imageBox, name, description, price, button);
    productGrid.append(card);
  }

  productCount.textContent = 'Товаров: ' + products.length;
}

renderProducts();