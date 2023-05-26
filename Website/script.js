const cartItems = {};

function addToCart(productName, price) {
  if (cartItems[productName]) {
    cartItems[productName].quantity++;
  } else {
    cartItems[productName] = {
      quantity: 1,
      price: price,
      giftWrap: false,
    };
  }
  alert('Added to the cart');
}

function showCart() {
  document.getElementById("product-page").style.display = "none";
  document.getElementById("cart-page").style.display = "block";
  document.getElementById("cart-icon").style.display = "none";


  displayCartItems();
}

function displayCartItems() {
  const cartItemsDiv = document.getElementById("cart-items");
  cartItemsDiv.innerHTML = "";

  let subtotal = 0;
  let totalQuantity = 0;

  for (const productName in cartItems) {
    const item = cartItems[productName];
    const totalItemPrice = item.price * item.quantity;
    subtotal += totalItemPrice;
    totalQuantity += item.quantity;

    const cartItemDiv = document.createElement("div");
    cartItemDiv.classList.add("cart-item");
    cartItemDiv.innerHTML = `
      <span>${productName}</span>
      <br><br>
      <label>Quantity</label>
      <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity('${productName}', this.value)">
      <br><br>
      <span>Price: $${totalItemPrice}</span>
      <br><br>
      <div class="gift-wrap-checkedbox">
      <label for="gift-wrap-${productName}">Gift Wrap:</label>
      <input type="checkbox" id="gift-wrap-${productName}" ${item.giftWrap ? "checked" : ""} onchange="updateGiftWrap('${productName}',this.checked)">
      </div>
      <br><br>
      <button class="btn btn-remove" onclick="removeFromCart('${productName}')">Remove</button>
    `;

    cartItemsDiv.appendChild(cartItemDiv);
  }

  const discount = calculateDiscount(subtotal, totalQuantity);
  const giftWrapFee = calculateGiftWrapFee(totalQuantity);
  const shippingFee = calculateShippingFee(totalQuantity);
  const total = subtotal - discount.amount + giftWrapFee + shippingFee;

  const cartSummaryDiv = document.createElement("div");
  cartSummaryDiv.classList.add("cart-summary");
  cartSummaryDiv.innerHTML = `
    <div>Subtotal: $${subtotal}</div>
    <div>Discount Applied: ${discount.name} (-$${discount.amount})</div>
    <div>Gift Wrap Fee: $${giftWrapFee}</div>
    <div>Shipping Fee: $${shippingFee}</div>
    <div class="total">Total: $${total.toFixed(2)}</div>
  `;

  cartItemsDiv.appendChild(cartSummaryDiv);
}
 
function updateGiftWrap(productName, isChecked){
  cartItems[productName].giftWrap=isChecked;
  displayCartItems();
}

function updateQuantity(productName, quantity) {
  cartItems[productName].quantity = Number(quantity);
  displayCartItems();
}

function removeFromCart(productName) {
  delete cartItems[productName];
  displayCartItems();
}

function calculateDiscount(subtotal, totalQuantity) {
  let discountAmount = 0;
  let discountName = "No Discount";

  if (subtotal > 200) {
    discountAmount = 10;
    discountName = "Flat $10 Discount";
  } else if (totalQuantity > 20) {
    discountAmount = subtotal * 0.1;
    discountName = "Bulk 10% Discount";
  } else if (totalQuantity > 30 && anyProductQuantityExceedsLimit(15)) {
    discountAmount = calculateTieredDiscount(totalQuantity);
    discountName = "Tiered 50% Discount";
  } else {
    for (const productName in cartItems) {
      if (cartItems[productName].quantity > 10) {
        discountAmount = cartItems[productName].price * cartItems[productName].quantity * 0.05;
        discountName = "Bulk 5% Discount";
        break;
      }
    }
  }

  return {
    name: discountName,
    amount: discountAmount.toFixed(2)
  };
}

function anyProductQuantityExceedsLimit(limit) {
  for (const productName in cartItems) {
    if (cartItems[productName].quantity > limit) {
      return true;
    }
  }
  return false;
}

function calculateTieredDiscount(totalQuantity) {
  const quantityAboveLimit = totalQuantity - 15;
  let discountAmount = 0;

  for (const productName in cartItems) {
    const item = cartItems[productName];
    if (item.quantity > 15) {
      const quantityToApplyDiscount = Math.min(item.quantity - 15, quantityAboveLimit);
      discountAmount += item.price * quantityToApplyDiscount * 0.5;
      quantityAboveLimit -= quantityToApplyDiscount;
    }
  }

  return discountAmount;
}

function goToProductPage(){
  document.getElementById("product-page").style.display = "block";
  document.getElementById("cart-page").style.display = "none";
  document.getElementById("cart-icon").style.display = "block";
}
document.getElementById("home-icon").addEventListener("click",goToProductPage);

function calculateGiftWrapFee() {
  const giftWrapFeePerUnit = 1;
  let giftWrapFee = 0;
  for (const productName in cartItems){
    const item = cartItems[productName];
    if(item.giftWrap){
      giftWrapFee += item.quantity * giftWrapFeePerUnit;
    }
  }
  return giftWrapFee;
}

function calculateShippingFee(totalQuantity) {
  const itemsPerPackage = 10;
  const shippingFeePerPackage = 5;
  const packageCount = Math.ceil(totalQuantity / itemsPerPackage);
  return packageCount * shippingFeePerPackage;
}

