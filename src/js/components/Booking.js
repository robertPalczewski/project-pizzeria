import {select, templates, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(bookingContainer) {
    const thisBooking = this;

    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.makeReserved();
  }

  getData() {
    // eslint-disable-next-line no-unused-vars
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };
    // console.log('getData params', params);

    // eslint-disable-next-line no-unused-vars
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&')
    };
    // console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function (allResponse) {
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log('bookings', bookings);
        console.log('eventsCurrent', eventsCurrent);
        console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};
    console.log('parseData-eventsCurrent', eventsCurrent);
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.hourPicker.value = settings.hours.open; // todo there must be a better way to solve this...
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    console.log(hour);
    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += .5) {
      // console.log('loop', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) // > -1 added by mistake...
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  makeReserved() {
    const thisBooking = this;

    const tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    console.log('tables', tables);

    for (let table of tables) {

      console.log('table', table);
      table.addEventListener('click', function (e) {
        e.preventDefault();

        console.log('table ' + table.getAttribute(settings.booking.tableIdAttribute) + ' clicked');

        if (!table.classList.contains(classNames.booking.tableBooked) && !table.classList.contains(classNames.booking.choosenTables)) {

          const chosenTables = thisBooking.dom.wrapper.querySelectorAll(select.booking.choosenTables);

          for (let table of chosenTables) {
            table.classList.remove(classNames.booking.choosenTables);
          }
          table.classList.add(classNames.booking.choosenTables);
          thisBooking.chosenTable = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
        } else if (!table.classList.contains(classNames.booking.tableBooked) && table.classList.contains(classNames.booking.choosenTables)) {
          table.classList.remove(classNames.booking.choosenTables);
        } else {
          alert('You must choose another table!');
        }

        thisBooking.dom.hourPicker.addEventListener('updated', function () {
          /* remove class reservation for table */
          table.classList.remove(classNames.booking.choosenTables);
        });

        /* change event listener to datepicker */
        thisBooking.dom.datePicker.addEventListener('change', function () {
          /* remove class reservation for table */
          table.classList.remove(classNames.booking.choosenTables);
        });
      });
    }

    thisBooking.starters = [];

    thisBooking.dom.breadStarter.addEventListener('change', function () {
      if (thisBooking.dom.breadStarter.checked) {
        thisBooking.starters.push(thisBooking.dom.breadStarter.value.toString());
      } else {
        thisBooking.starters = thisBooking.starters.filter(item => item !== thisBooking.dom.breadStarter.value);
      }
    });
    thisBooking.dom.waterStarter.addEventListener('change', function () {
      if (thisBooking.dom.waterStarter.checked) {
        thisBooking.starters.push(thisBooking.dom.waterStarter.value.toString());
      } else {
        thisBooking.starters = thisBooking.starters.filter(item => item !== thisBooking.dom.waterStarter.value);
      }
    });


    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendReservation();
    });
  }

  // todo validation

  sendReservation() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePicker.dom.input.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.chosenTable,
      peopleAmount: thisBooking.peopleAmount.value,
      duration: thisBooking.hoursAmount.value,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      starters: thisBooking.starters.join(', ')
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }

  render(bookingContainer) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingContainer;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.choosedTables = thisBooking.dom.wrapper.querySelectorAll(classNames.booking.choosedTables);
    thisBooking.dom.breadStarter = thisBooking.dom.wrapper.querySelector(select.booking.breadStarter);
    thisBooking.dom.waterStarter = thisBooking.dom.wrapper.querySelector(select.booking.waterStarter);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

    console.log('thisBooking.dom', thisBooking.dom);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }
}

export default Booking;
