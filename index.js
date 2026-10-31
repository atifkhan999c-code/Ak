const cartIcon = document.querySelector(".cart-icon");
const cartTab = document.querySelector(".cart-tab");
const closeBtn = document.querySelector(".close-btn");
const cardList = document.querySelector(".card-list");
const cartList = document.querySelector(".cart-list");
const cartTotal = document.querySelector(".cart-total");
const cartValue = document.querySelector(".cart-value");
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

// Open & close cart drawer
if (cartIcon && cartTab) {
  cartIcon.addEventListener("click", (e) => {
    e.preventDefault();
    cartTab.classList.add("cart-tab-active");
  });
}

if (closeBtn && cartTab) {
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    cartTab.classList.remove("cart-tab-active");
  });
}

// Mobile menu toggle
if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("mobile-menu-active");
  });
}

let productList = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Calculate and update cart total & badge
const updateTotals = () => {
  let totalPrice = 0;
  let totalQuantity = 0;

  cart.forEach((item) => {
    totalPrice += Number(item.price) * Number(item.quantity);
    totalQuantity += Number(item.quantity);
  });

  if (cartTotal) {
    cartTotal.textContent = `₹${totalPrice.toFixed(2)}`;
  }
  if (cartValue) {
    cartValue.textContent = totalQuantity;
  }
};

// Render an individual item in the cart drawer
const renderCartItem = (product) => {
  const cartItem = document.createElement("div");
  cartItem.classList.add("item");
  cartItem.dataset.id = product.id;

  const numericPrice = Number(product.price);
  const currentQuantity = Number(product.quantity);

  cartItem.innerHTML = `
    <div class="item-image">
      <div class="image-container">
        <img src="${product.image}" alt="${product.name}" />
      </div>
    </div>
    <div>
      <h4>${product.name}</h4>
      <h4 class="item-total">₹${(numericPrice * currentQuantity).toFixed(2)}</h4>
    </div>
    <div class="flex">
      <a href="#" class="quantity-btn minus">
        <i class="fa-solid fa-minus"></i>
      </a>
      <h4 class="quantity-value">${currentQuantity}</h4>
      <a href="#" class="quantity-btn plus">
        <i class="fa-solid fa-plus"></i>
      </a>
    </div>
  `;

  cartList.appendChild(cartItem);

  const plusBtn = cartItem.querySelector(".plus");
  const minusBtn = cartItem.querySelector(".minus");
  const quantityValue = cartItem.querySelector(".quantity-value");
  const itemTotal = cartItem.querySelector(".item-total");

  plusBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const item = cart.find((i) => i.id === product.id);
    if (item) {
      item.quantity++;
      quantityValue.textContent = item.quantity;
      itemTotal.textContent = `₹${(numericPrice * item.quantity).toFixed(2)}`;
      saveCart();
      updateTotals();
    }
  });

  minusBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const item = cart.find((i) => i.id === product.id);
    if (!item) return;

    if (item.quantity > 1) {
      item.quantity--;
      quantityValue.textContent = item.quantity;
      itemTotal.textContent = `₹${(numericPrice * item.quantity).toFixed(2)}`;
      saveCart();
      updateTotals();
    } else {
      cartItem.classList.add("slide-out");
      setTimeout(() => {
        cartItem.remove();
        cart = cart.filter((i) => i.id !== product.id);
        saveCart();
        updateTotals();
      }, 300);
    }
  });
};

// Render full cart list from saved state
const renderCartList = () => {
  if (!cartList) return;
  cartList.innerHTML = "";
  cart.forEach((item) => {
    renderCartItem(item);
  });
  updateTotals();
};

// Add product to cart
const addToCart = (product) => {
  // Extract clean numeric price from string (e.g., "₹5.6" -> 5.6)
  const numericPrice =
    typeof product.price === "number"
      ? product.price
      : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0;

  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity++;
    // Update existing item in cart drawer DOM
    const itemEl = cartList.querySelector(`.item[data-id="${product.id}"]`);
    if (itemEl) {
      itemEl.querySelector(".quantity-value").textContent = existingProduct.quantity;
      itemEl.querySelector(".item-total").textContent = `₹${(
        numericPrice * existingProduct.quantity
      ).toFixed(2)}`;
    }
  } else {
    const newCartItem = {
      id: product.id,
      name: product.name,
      price: numericPrice,
      image: product.image,
      quantity: 1,
    };
    cart.push(newCartItem);
    renderCartItem(newCartItem);
  }

  saveCart();
  updateTotals();

  // Slide open the cart tab so the user sees the added item immediately
  if (cartTab) {
    cartTab.classList.add("cart-tab-active");
  }
};

// Render menu product cards
const showCards = () => {
  if (!cardList) return;
  cardList.innerHTML = "";

  productList.forEach((product) => {
    const orderCard = document.createElement("div");
    orderCard.classList.add("order-card");

    orderCard.innerHTML = `
      <div class="card-image">
         <img src="${product.image}" alt="${product.name}">
      </div>
      <h4>${product.name}</h4>
      <h4 class="price">${product.price}</h4>
      <a href="#" class="btn card-btn">Add to Cart</a>
    `;

    cardList.appendChild(orderCard);

    const cardBtn = orderCard.querySelector(".card-btn");
    cardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      addToCart(product);
    });
  });
};

// Initialize App
const initApp = () => {
  // Load saved cart items first
  renderCartList();

  // Fetch product catalog
  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      productList = data;
      showCards();
    })
    .catch((err) => console.error("Error loading products:", err));
};

initApp();
