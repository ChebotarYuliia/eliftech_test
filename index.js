const firebaseConfig = {
    apiKey: "AIzaSyCgUc7h-rgsjdFAKFRBA7rogO1TUDfpMv0",
    authDomain: "eliftech-delivery-app.firebaseapp.com",
    databaseURL: "https://eliftech-delivery-app-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "eliftech-delivery-app",
    storageBucket: "eliftech-delivery-app.appspot.com",
    messagingSenderId: "603214252224",
    appId: "1:603214252224:web:efebe678862c264e5e8525"
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();


const shop = document.getElementById('shop');
let activeRestaurant = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data"))?.[0]?.restaurant : null;

const basket = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : [];

async function getShopItemsData() {
    const items = await db.collection('res').get();
    const itemsData = [];
    items.forEach(doc => {
        itemsData.push(doc.data());
    });
    return itemsData;
}

async function generateRestaurants() {
    const data = await getShopItemsData();
    const restaurants = document.querySelector('#restaurants');
    const restaurantsSet = new Set;
    data.map(item => {
        restaurantsSet.add(item.restaurant);
    });

    return restaurants.innerHTML = Array.from(restaurantsSet).map((item) => {
        const active = activeRestaurant ? activeRestaurant : 'mcdonalds';
        return `
            <li class="restaurants-item ${active == item ? 'active' : ''}" data-restaurant=${item}>${item}</li>
        `
    }).join('');
}

async function generateShop() {
    const data = await getShopItemsData();
    const menuFor = document.querySelector('.restaurants-item.active').dataset.restaurant;

    return shop.innerHTML = data.map(item => {
        const { id, name, desc, img, price, restaurant, coords } = item;
        const coordsStr = String(coords).split(', ').join(',');

        const chosen = basket.find(item => item.id == id);
        const shortedDesc = desc.length > 50 ? desc.slice(0, 50) + '...' : desc;

        if (restaurant === menuFor) {
            return `
            <div id="product-id-${id}" class="product-item" data-restaurant=${restaurant} data-coords=${coordsStr}>
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
    const { restaurant, coords } = document.querySelector(`#product-id-${id}`).dataset;
    const item = basket.find(item => item.id == id);

    if (item) {
        item.quantity += 1;
    } else {
        basket.push({
            id: id,
            quantity: 1,
            restaurant: restaurant,
            coords: coords.split(','),
        });
        activeRestaurant = restaurant;
    };
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

async function toStart() {
    await generateRestaurants()
    await generateShop();
    await calculateCartAmount();
    await makeActiveRestaurant();
}

window.addEventListener('load', () => {
    toStart();
});

document.addEventListener('click', e => {
    const target = e.target;

    if (target.classList.contains('restaurants-item') && !target.classList.contains('active')) {
        setActiveRestaurant(target);
    }
});