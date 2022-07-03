const shop = document.getElementById('shop');
let activeRestaurant = JSON.parse(localStorage.getItem("data"))?.[0]?.restaurant || null;

const basket = JSON.parse(localStorage.getItem("data")) || [];

async function getShopItemsData() {
    let response = await fetch('./shopItemsData.json');
    const shopItemsData = await response.json();
    return shopItemsData;
}

async function generateShop() {
    const data = await getShopItemsData();
    const menuFor = document.querySelector('.restaurants-item.active').dataset.restaurant;

    return shop.innerHTML = data.map(item => {
        const { id, name, desc, img, price, restaurant } = item;

        const chosen = basket.find(item => item.id == id);
        const shortedDesc = desc.length > 50 ? desc.slice(0, 50) + '...' : desc;

        if (restaurant === menuFor) {
            return `
            <div id="product-id-${id}" class="product-item" data-restaurant=${restaurant}>
                <img  src=${img} alt="">
                <div class="details">
                    <h3>${name}</h3>
                    <p>${shortedDesc}</p>
                    <div class="price-quantity">
                    <h2>$ ${price} </h2>
                    <div class="buttons">
                        <span onclick="decrement(${id})" class="buttons-minus">-</span>
                        <div id=${id} class="quantity">${chosen ? chosen.quantity : 0}</div>
                        <span onclick="increment(${id})" class="buttons-plus">+</span>
                    </div>
                    </div>
                </div>
            </div>
        `
        }
    }).join('')
};

function increment(id) {
    const res = document.querySelector(`#product-id-${id}`).dataset.restaurant;
    const item = basket.find(item => item.id == id);

    if (item) {
        item.quantity += 1;
    } else {
        basket.push({
            id: id,
            quantity: 1,
            restaurant: res,
        });
        activeRestaurant = res;
    };
    updateQuantity(id);

    console.log(activeRestaurant, basket);

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
        };
        updateQuantity(id);
    };
    if (!basket.length) {
        activeRestaurant = null;
    }
    localStorage.setItem("data", JSON.stringify(basket));
};

function updateQuantity(id) {
    let item = basket.find(item => item.id === id);
    document.getElementById(id).innerHTML = item?.quantity ? item.quantity : 0;
    calculateCartAmount();
};

function calculateCartAmount() {
    const cartLabel = document.getElementById('cartAmount');
    const totalAmount = basket.reduce((acum, item) => acum + item.quantity, 0);
    cartLabel.innerHTML = totalAmount;
};

function setActiveRestaurant(elem) {
    if (!activeRestaurant) {
        document.querySelectorAll('.restaurants-item').forEach(item => item.classList.remove('active'));
        elem.classList.add('active');
        generateShop();
    } else {
        return;
    }
}

function makeActiveRestaurant() {
    const res = basket[0]?.restaurant;
    if (res) {
        document.querySelectorAll('.restaurants-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`.restaurants-item[data-restaurant=${res}]`).classList.add('active');
    }
}

window.addEventListener('load', () => {
    generateShop();
    calculateCartAmount();
    makeActiveRestaurant();
});

document.addEventListener('click', e => {
    const target = e.target;

    if (target.classList.contains('restaurants-item') && !target.classList.contains('active')) {
        setActiveRestaurant(target);
    }
});