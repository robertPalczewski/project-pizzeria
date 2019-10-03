import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget {

  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;
    thisWidget.minDate = new Date (thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    console.log(thisWidget.value);
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: utils.dateToStr(thisWidget.maxDate),
      'locale': {
        firstDayOfWeek: 1
      },
      'disable': [
        function(date) {
          // return true to disable
          return date.getDay() === 1;
        }],
      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
        console.log(thisWidget.value);
      },
    });

  }



  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

  renderValue() {
  }
}

export default DatePicker;
