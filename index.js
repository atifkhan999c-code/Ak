const cartIcon = document.querySelector(".cart-icon");
const cartTab = document.querySelector(".cart-tab");
const closeBtn = document.querySelector(".close-btn");
const cardList = document.querySelector(".card-list");
const cartList = document.querySelector(".cart-list");
const cartTotal = document.querySelector(".cart-total");
const cartValue = document.querySelector(".cart-value");
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

// Search & Filter elements
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const categoryBtns = document.querySelectorAll(".category-btn");

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
let selectedCategory = "all";
let searchQuery = "";

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
  const numericPrice =
    typeof product.price === "number"
      ? product.price
      : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0;

  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity++;
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

  // Open cart drawer
  if (cartTab) {
    cartTab.classList.add("cart-tab-active");
  }
};

// Filter & display products based on search and selected category
const filterAndShowCards = () => {
  if (!cardList) return;
  cardList.innerHTML = "";

  const filtered = productList.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (product.category &&
        product.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Empty state when no food matches
  if (filtered.length === 0) {
    cardList.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-utensils"></i>
        <h3>No food items found</h3>
        <p>We couldn't find anything matching "${searchQuery || selectedCategory}".</p>
        <button class="reset-btn" id="resetFilterBtn">View All Menu</button>
      </div>
    `;

    const resetBtn = document.getElementById("resetFilterBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resetFilters();
      });
    }
    return;
  }

  // Render matching food cards
  filtered.forEach((product) => {
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

// Reset all search and category filters
const resetFilters = () => {
  selectedCategory = "all";
  searchQuery = "";
  if (searchInput) searchInput.value = "";
  if (clearSearchBtn) clearSearchBtn.style.display = "none";

  categoryBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category.toLowerCase() === "all");
  });

  filterAndShowCards();
};

// Setup Search & Category Filter Listeners
const setupFilterListeners = () => {
  // Live search input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery.length > 0 ? "block" : "none";
      }
      filterAndShowCards();
    });
  }

  // Clear search button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.style.display = "none";
      filterAndShowCards();
      if (searchInput) searchInput.focus();
    });
  }

  // Category buttons
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
      filterAndShowCards();
    });
  });
};

// Initialize App
const initApp = () => {
  renderCartList();
  setupFilterListeners();

  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      productList = data;
      filterAndShowCards();
    })
    .catch((err) => console.error("Error loading products:", err));
};

initApp();
