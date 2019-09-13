import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function() {
    const thisApp = this;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    const idFromHash = window.location.hash.replace('#/', '');

    // eslint-disable-next-line no-unused-vars
    let pageMatchingHash = thisApp.pages[0].id;
    for(let page of thisApp.pages) {
      if(page.id === idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(idFromHash);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const clickedElement = this;

        /* get page id form href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }

  },

  activatePage: function(pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages) {

      page.classList.toggle(classNames.pages.active, page.id === pageId);

      /*if(page.id === pageId) {
        page.classList.add(classNames.pages.active);
      } else {
        page.classList.remove(classNames.pages.active);
      }*/
    }

    /* add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks) {

      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === '#' + pageId
      );
    }
  },

  initMenu: function () {
    const thisApp = this;
    console.log('thisApp.data: ', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();

      });

    console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },

  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },

  initCart: function () {
    const thisApp = this;

    thisApp.initPages();

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function() {
    const thisApp = this;

    const bookingContainer = document.querySelector(select.containerOf.booking);
    new Booking(bookingContainer);


  }
};

app.init();
