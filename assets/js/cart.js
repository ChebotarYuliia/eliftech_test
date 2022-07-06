const cart = document.getElementById("shopping-cart");
const cartInfo = document.getElementById("shopping-cart-info");

let basket = JSON.parse(localStorage.getItem("data")) || [];

async function getShopItemsData() {
    const items = await db.collection('res').get();
    const itemsData = [];
    items.forEach(doc => {
        itemsData.push(doc.data());
    });
    return itemsData;
}

async function generateCartItems() {
    if (basket.length) {
        const data = await getShopItemsData();
        document.querySelector('#cart-form-wrapper').style.display = 'block';

        return cart.innerHTML = basket
            .map(item => {
                const { id, quantity } = item;
                const chosen = data.find(item => item.id == id) || [];
                const { name, price, img } = chosen;

                return `
                    <div class="cart-item">
                        <img src=../${img} alt="" />
                        <div class="cart-item-details">
                        
                            <div class="cart-item-title">
                                <h4>
                                    <p>${name}</p>
                                    <p class="cart-item-price">$ ${price}</p>
                                </h4>
                                <span onclick="removeItem(${id})" class="cart-item-remove">x</span>
                            </div>
                            <div class="cart-buttons">
                                <div class="buttons">
                                    <span onclick="decrement(${id})" class="buttons-minus">-</span>
                                    <div id=${id} class="quantity">${quantity}</div>
                                    <span onclick="increment(${id})" class="buttons-plus">+</span>
                                </div>
                            </div>
                            <h3 id="cart-item-total-${id}" data-price=${price}>$ ${quantity * price}</h3>
                        
                        </div>
                    </div>
                `
            }).join('');
    } else {
        cart.innerHTML = "";
        cartInfo.innerHTML = `
            <h2>Cart is Empty</h2>
            <a href="../index.html">
                <button class="homeBtn">Back to Shop</button>
            </a>
        `;
    }
};

function increment(id) {
    const item = basket.find(item => item.id == id);

    if (item) {
        item.quantity += 1;
    }
    updateQuantity(id);

    localStorage.setItem("data", JSON.stringify(basket));
};

function decrement(id) {
    const item = basket.find(item => item.id == id);
    if (item == undefined || item.quantity == 0) return;

    if (item) {
        item.quantity -= 1;
        if (item.quantity == 0) {
            const index = basket.indexOf(item);
            basket.splice(index, 1);
            removeItem(id)
        } else {
            updateQuantity(id);
        }
    };

    localStorage.setItem("data", JSON.stringify(basket));
};

function updateQuantity(id) {
    const item = basket.find(item => item.id === id);
    const quantity = item?.quantity ? item.quantity : 0;
    const total = document.getElementById(`cart-item-total-${id}`);

    document.getElementById(id).innerHTML = quantity;
    total.innerHTML = `$ ${total.dataset.price * quantity}`;

    calculateCartAmount();
    calculateTotalAmount();
};

async function calculateTotalAmount() {
    if (basket.length) {
        const data = await getShopItemsData();
        const amount = await basket
            .map(item => {
                const { id, quantity } = item;
                const chosen = data.find(item => item.id == id);
                return chosen.price * quantity;
            })
            .reduce((accum, item) => accum + item, 0);

        return (cartInfo.innerHTML = `
                <h2>Total Bill : $ ${amount}</h2>
                <button onclick="clearCart()" class="removeAll">Clear Cart</button>
                `);
    } else return;
}

function removeItem(id) {
    basket = basket.filter(item => item.id !== id);

    calculateCartAmount();
    generateCartItems();
    calculateTotalAmount();

    if (basket.length === 0) {
        document.querySelector('#cart-form-wrapper').style.display = 'none';
    };

    localStorage.setItem("data", JSON.stringify(basket));
};

function calculateCartAmount() {
    const cartLabel = document.getElementById('cartAmount');
    const totalAmount = basket.reduce((acum, item) => acum + item.quantity, 0);
    cartLabel.innerHTML = totalAmount;
};

function clearCart() {
    basket = [];
    generateCartItems();
    calculateCartAmount();
    calculateTotalAmount();
    document.querySelector('#cart-form-wrapper').style.display = 'none';
    localStorage.setItem("data", JSON.stringify(basket));
};

window.addEventListener('load', () => {
    generateCartItems();
    calculateCartAmount();
    calculateTotalAmount();
});