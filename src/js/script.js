/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();

      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.initAccordion();
    }

    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      // console.log(thisProduct.element);

      /*find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    /* 8.5 and 8.7*/
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log('accordionTrigger: ', thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log('form: ', thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log('formInputs: ', thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //console.log('cartButton: ', thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log('priceElem: ', thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      // console.log('thisProduct.imageWrapper: ', thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      /*const buttonTest = document.getElementById('button-test');

      buttonTest.addEventListener('click', function(){
        console.log('clicked');
      });*/

      /* find the clickable trigger (the element that should react to clicking) */
      // const accordionTriggerElements = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log('0) accordionTriggerElement', accordionTriggerElements);
      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        // for (let accordionTriggerElement of accordionTriggerElements) {
        console.log('1) START: click event listener to trigger, event listener');

        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        console.log('2) thisProduct.element before toggle(active): ', thisProduct.element);
        thisProduct.element.classList.toggle('active');
        console.log('2.1) thisProduct.element after toggle(active): ', thisProduct.element);

        /* find all active products */
        const activeProducts = document.querySelectorAll('.product.active');
        console.log('3) activeProducts = thisProduct.element.querySelectorAll(\'.active\'): ', activeProducts);

        console.log('4) START LOOP: for each active product');
        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {
          console.log('4.1) activeProduct: ', activeProduct);


          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element) {

            /* remove class active for the active product */
            activeProduct.classList.remove('active');
            console.log('4.2) thisProduct.element.classList.remove(\'active\'): ', thisProduct.element);

            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        console.log('5) END LOOP: for each active product');
        /* END: click event listener to trigger */
      });
    }

    initOrderForm() {
      const thisProduct = this;
      console.log('6) start initOrderForm(): ');
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      console.log('7) start processOrder(): ', thisProduct);

      /* 8.6 removing active class from product images*/
      const images = thisProduct.imageWrapper.querySelectorAll('img');
      for(let image of images){
        if (image.classList.length >= 2) {
          image.classList.remove(classNames.menuProduct.imageVisible);
        }
      }

      /*const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);*/

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('8) formData: ', formData);

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;
      console.log('9) price = thisProduct.data.price: ', price);
      let params = thisProduct.data.params;
      console.log('9.1) params = thisProduct.data.params: ', params);

      /* START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in params) {
        console.log('10.1) paramId: ', paramId);

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        console.log('10.2) param: ', param);

        let options = param.options;
        console.log('10.3) options: ', options);

        /* START LOOP: for each optionId in param.options */
        for(let optionId in options) {
          console.log('11) optionId: ', optionId);

          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          console.log('11.1) option: ', option);
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          console.log('11.2) optionSelected: ', optionSelected);

          /* START IF: if option is selected and option is not default */
          if(optionSelected && !option.default) {

            /* add price of option to variable price */
            price += option.price;
            console.log('11.3) price: ', price);

            /* END IF: if option is selected and option is not default */
          }

          /* START ELSE IF: if option is not selected and option is default */
          else if(!optionSelected && option.default) {

            /* deduct price of option from price */
            price -= option.price;
            console.log('11.3-1) price: ', price);

            /* END ELSE IF: if option is not selected and option is default */
          }
          /* 8.6 - Add images todo */

          const imageClass = paramId + '-' + optionId;

          if(optionSelected){
            for(let image of images) {
              if(image.classList.contains(imageClass)) {
                image.classList.add(classNames.menuProduct.imageVisible);
              }
            }
          } else {
            for(let image of images) {
              if(image.classList.contains(imageClass)) {
                image.classList.remove(classNames.menuProduct.imageVisible);
              }
            }
          }



          /* END LOOP: for each optionId in param.options */
        }
        /* END LOOP: for each paramId in thisProduct.data.params */
      }
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;

    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      console.log('12) AmountWidget: ', thisWidget);
      console.log('13) constructor arguments: ', element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initAction();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      console.log('14) newValue: ', newValue);

      /* TODO: Add validation */

      thisWidget.value = newValue;

      console.log('14.1) thisWidget.value: ', thisWidget.value);
      thisWidget.announce();
      console.log('14.1-2) thisWidget.value: ', thisWidget.value);

      thisWidget.input.value = thisWidget.value;
      console.log('14.2) thisWidget.input.value: ', thisWidget.input.value);
    }

    initAction() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      /*const testProduct = new Product();
      console.log('testProduct: ', testProduct);*/
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;

      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
