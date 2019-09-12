import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    console.log('new Cart', thisCart);
    thisCart.initActions();
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    console.log('getElements - thisCart: ', thisCart);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();

      thisCart.sendOrder();
    });

  }

  remove(cartProduct) {
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    console.log('index: ', index);
    thisCart.products.splice(index);
    cartProduct.dom.wrapper.remove();
    thisCart.update(); // remove delivery fee after deleting all products form the cart. done deliveryFeeOrFree()
  }

  add(menuProduct) {
    const thisCart = this;

    /* generate HTML based on template */
    //const generatedHTML = templates.menuProduct(thisProduct.data);
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log('generatedHTML: ', generatedHTML);

    /* create element using utils.createElementFromHTML */
    //thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    //const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    //menuContainer.appendChild(thisProduct.element);
    thisCart.dom.productList.appendChild(generatedDOM);
    //thisCart.products.push(menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    /*console.log('thisCart.products', thisCart.products);

    console.log('adding product', menuProduct);*/
    this.update();
  }

  update() {
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFeeOrFree();
    console.log('totalNumber: ', thisCart.totalNumber, ' subtotalPrice: ', thisCart.subtotalPrice);

    for (let key of thisCart.renderTotalsKeys) {
      //console.log('key: ', key, ' thisCartTotalsKeys: ', thisCart.renderTotalsKeys);
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
        //console.log('thisCart.dom[key]: ', thisCart.dom[key], 'key: ', key, ' thisCart[key]', thisCart[key]);
      }
    }
  }

  deliveryFeeOrFree() { //free delivery when all products are removed from cart or subtotal is over 100$
    const thisCart = this;

    if (thisCart.subtotalPrice === 0 || thisCart.subtotalPrice >= 100) {
      thisCart.dom.wrapper.querySelector('.cart__order-delivery span.cart__order-price-name').innerHTML = 'Free delivery! :)';
      return thisCart.deliveryFee = 0;
    } else {
      return thisCart.deliveryFee;
    }
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    //console.log('1) payload.products: ', payload.products);

    for (let cartProduct of thisCart.products) {
      /* console.log('products: ', thisCart.products);
      console.log('product: ', cartProduct);
      console.log('product.getData()', cartProduct.getData());*/
      payload.products.push(cartProduct.getData());
    }
    console.log('2) payload.products: ', payload.products);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
      });
  }
}

export default Cart;
