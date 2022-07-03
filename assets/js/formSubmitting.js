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



const form = document.querySelector('#cart-form');
const fields = form.querySelectorAll('.cart-form-input');

function validateFields() {

    let result = 0;

    for (let i = 0; i < fields.length; i++) {

        const field = fields[i];
        const value = field.value;
        const type = field.dataset.type;

        const addError = error => form[i].parentElement.insertBefore(error, field);

        if (!value) {
            const error = generateError('Cant be blank');
            addError(error);
        } else {
            switch (type) {
                case ('name'):
                    if (value.length < 2) {
                        const error = generateError('Too short name');
                        addError(error);
                    } else {
                        result++;
                    }
                    break;
                case ('email'):
                    if (!validateEmail(value)) {
                        const error = generateError('Incorrect email');
                        addError(error);
                    } else {
                        result++
                    }
                    break;
                case ('phone'):
                    if (value.length < 14) {
                        const error = generateError('Not full number');
                        addError(error);
                    } else {
                        result++
                    }
                    break;
                case ('address'):
                    if (value.length < 5) {
                        const error = generateError('Incorrect address');
                        addError(error);
                    } else {
                        result++
                    }
                    break;
            }
        }
    }

    return result == fields.length ? true : false;
};

function removeValidation() {
    const errors = form.querySelectorAll('.validation-error');
    for (let i = 0; i < errors.length; i++) {
        errors[i].remove();
    }
};

function generateError(text) {
    const error = document.createElement('div');
    error.className = 'validation-error';
    error.innerHTML = text;
    return error;
}

function validateEmail(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function addPhoneMask() {
    const phone = document.querySelector('input[type="tel"]');
    phone.addEventListener('input', handlePhoneInput, false);
};

function showThankYouAlert() {
    const div = document.createElement('div');
    div.classList.add('thankyou-message');
    div.innerHTML = 'thank you for your order! <br/> we will contact you soon';
    document.body.appendChild(div);
    setTimeout(() => {
        div.remove()
    }, 2500);
}

function handlePhoneInput(e) {
    e.target.value = phoneMask(e.target.value);
};

function phoneMask(phone) {
    return phone.replace(/\D/g, '')
        .replace(/^(\d)/, '($1')
        .replace(/^(\(\d{3})(\d)/, '$1) $2')
        .replace(/(\d{3})(\d{1,5})/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};

window.addEventListener('load', () => {
    addPhoneMask();
});

form.addEventListener('submit', e => {
    e.preventDefault();
    removeValidation();
    const passed = validateFields();
    if (passed) {
        const order = JSON.parse(localStorage.getItem("data")) || [];

        db.collection('orders').add({
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            address: form.address.value,
            order: order,
            date: new Date(),
        });

        showThankYouAlert();
        clearCart();
    }
})