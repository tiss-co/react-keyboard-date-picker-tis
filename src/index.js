import React, { useState, useEffect, useRef } from 'react';
import { Popover } from '@material-ui/core';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { PrevIcon, NextIcon, CalendarIcon } from './assets/icons';
import css from './styles.module.scss';

const addZeroPad = number => {
  return number < 10 ? '0' + number : number;
};

const scrollToItem = (itemId) => {
  var parent = document.getElementById(itemId)?.parentElement;
  var item = document.getElementById(itemId);
  parent && parent.scrollTo({
    top: item.offsetTop - (item.offsetHeight * 2) + 5,
    behavior: 'auto',
  });
};

/**
 * @param {number} month
 * @param {boolean} withSmallName
 * @returns {string} month name
 */
const getMonthName = (month, withSmallName = false) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const smallMonthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return withSmallName ? smallMonthNames[month] : monthNames[month];
};

/**
 * add zero before the number
 * @param {number} st
 * @returns {string} string: 1 => 01
 */
const twoZeroPadStart = st => String(st).padStart(2, '0');

const today = new Date();
const todayDate = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate()
};
const createDate = ({ year, month, day, }) =>
  new Date(year, month, day, 0, 0, 0, 0);

export const KeyboardDatePicker = ({
  containerClassName,
  className,
  onChange,
  initialDate = null,
  min = { ...todayDate },
  max = null,
  removeButton = true,
  darkMode = false,
  startIcon,
  downIcon,
  updateDatePicker = { current: () => { } },
  ...attrs
}) => {
  const hasInitialDate = useRef(false);

  if (initialDate) {
    hasInitialDate.current = true;
  } else {
    initialDate = { ...todayDate };
  }
  const [isSelected, setIsSelected] = useState(false);

  const initialMonthLength = hasInitialDate ?
    new Date(
      initialDate.year,
      initialDate.month,
      0
    ).getDate()
    :
    new Date(
      today.year,
      today.month,
      0
    ).getDate()
    ;

  const [anchor, setAnchor] = useState(null);
  const [date, setDate] = useState(initialDate);
  const [monthLength, setMonthLength] = useState(initialMonthLength);
  const [inputYear, setInputYear] = useState('');
  const [inputMonth, setInputMonth] = useState('');
  const [inputDay, setInputDay] = useState('');

  const yearInputRef = useRef();
  const dayInputRef = useRef();

  updateDatePicker.current = (date) => {
    if (!isSelected) setIsSelected(true);

    setAnchor(null);
    onChange && onChange(date);

    setDate(date);

    setInputYear(date.year);
    setInputMonth(addZeroPad(date.month));
    setInputDay(addZeroPad(date.day));
  };

  const onMonthChange = () => {
    const monthLength = new Date(
      date.year,
      date.month,
      0
    ).getDate();
    setMonthLength(monthLength);

    if (date.day > monthLength)
      setDate(dt => ({ ...dt, day: monthLength }));

    if (min && date.month - 1 === min.month && date.day < min.day)
      setDate(dt => ({ ...dt, day: min.day }));

    if (max && date.month - 1 === max.month && date.day > max.day)
      setDate(dt => ({ ...dt, day: max.day }));
  };

  const onNavigationClick = isNext => {
    const timestamp = createDate(date).getTime();

    if (isNext) {
      if (!max || timestamp < createDate(max).getTime())
        setDate(dt => ({
          ...dt,
          year: dt.month === 12 ? dt.year + 1 : dt.year,
          month: dt.month < 12 ? dt.month + 1 : 1,
        }));
    } else if (!min || timestamp > createDate(min).getTime())
      setDate(dt => ({
        ...dt,
        year: dt.month === 1 ? dt.year - 1 : dt.year,
        month: dt.month > 1 ? dt.month - 1 : 12,
      }));
  };

  const disableNavigationIcon = isNext => {
    const mDate = isNext ?
      {
        ...date,
        year: date.month === 12 ? date.year + 1 : date.year,
        month: date.month < 12 ? date.month + 1 : 1,
        day: max ? max.day : date.day,
      } :
      {
        ...date,
        year: date.month === 1 ? date.year - 1 : date.year,
        month: date.month > 1 ? date.month - 1 : 12,
        day: min ? min.day : date.day,
      };
    const time = createDate(mDate).getTime();

    return isNext
      ? max && time > createDate(max).getTime()
      : min && time < createDate(min).getTime();
  };

  const disableDay = day => {
    const newDate = {
      ...date,
      day,
    };
    const maxDate = {
      ...newDate,
    };
    const minDate = {
      ...newDate,
    };

    return (
      day > monthLength ||
      (max &&
        createDate(maxDate).getTime() > createDate(max).getTime()) ||
      (min && createDate(minDate).getTime() < createDate(min).getTime())
    );
  };

  const onDayClick = index => {
    const mDate = {
      ...date,
      day: index,
    };
    if (!isSelected) setIsSelected(true);

    setAnchor(null);
    onChange && onChange(mDate);

    setDate(mDate);

    setInputYear(mDate.year);
    setInputMonth(addZeroPad(mDate.month));
    setInputDay(addZeroPad(mDate.day));
  };

  const onInputYearChange = (value) => {
    setInputYear(value);
    if (value?.length === 4) {
      const mDate = {
        ...date,
        year: parseInt(value),
      };
      onChange && onChange(mDate);
      setDate(mDate);
    }
  };

  const onInputMonthChange = (value) => {
    setInputMonth(value);
    if (value?.length >= 1) {
      const mDate = {
        ...date,
        month: parseInt(value),
      };
      onChange && onChange(mDate);
      setDate(mDate);
      value?.length === 2 && dayInputRef.current?.focus();
    }
  };

  const onInputDayChange = (value) => {
    setInputDay(value);
    if (value?.length >= 1) {
      const mDate = {
        ...date,
        day: parseInt(value),
      };
      onChange && onChange(mDate);
      setDate(mDate);
      if (value?.length === 2)
        yearInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (hasInitialDate.current) setIsSelected(true);
  }, []);

  useEffect(onMonthChange, [date.month]);

  useEffect(() => {
    if (anchor)
      setTimeout(() => {
        scrollToItem('selected-minute');
      }, 0);
  }, [anchor]);

  return (
    <div className={classNames(css.keyboardDatePicker_KeyboardDatePickerTis, containerClassName)} {...attrs}>
      <div
        className={classNames(css.buttonContainer_KeyboardDatePickerTis, {
          [css.Dark_KeyboardDatePickerTis]: darkMode
        }, className)}
      >
        <input
          className={classNames(css.input_KeyboardDatePickerTis, css.input_small_KeyboardDatePickerTis)}
          type='text'
          placeholder='mm'
          value={inputMonth}
          onChange={({ target: { value } }) => onInputMonthChange(value)}
        />
        /
        <input
          className={classNames(css.input_KeyboardDatePickerTis, css.input_small_KeyboardDatePickerTis)}
          type='text'
          placeholder='dd'
          value={inputDay}
          onChange={({ target: { value } }) => onInputDayChange(value)}
          ref={dayInputRef}
        />
        /
        <input
          className={css.input_KeyboardDatePickerTis}
          type='text'
          placeholder='yyyy'
          value={inputYear}
          onChange={({ target: { value } }) => onInputYearChange(value)}
          ref={yearInputRef}
        />
        <CalendarIcon onClick={e => setAnchor(e.currentTarget)} />
      </div>

      <Popover
        className={css.popover_KeyboardDatePickerTis}
        PaperProps={{
          className: darkMode ? css.popoverPaperDark_KeyboardDatePickerTis : css.popoverPaper_KeyboardDatePickerTis
        }}
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div
          className={classNames(css.container_KeyboardDatePickerTis, {
            [css.hideTime_KeyboardDatePickerTis]: true,
            [css.Dark_KeyboardDatePickerTis]: darkMode
          })}
        >
          <div className={css.dateContainer_KeyboardDatePickerTis}>
            <header className={css.header_KeyboardDatePickerTis}>
              <span className={css.year_KeyboardDatePickerTis}>
                {`${getMonthName(date.month - 1, true)} ${date.year
                  }`}
              </span>

              <div className={css.navigation_KeyboardDatePickerTis}>
                <button
                  className={classNames(css.navIcon_KeyboardDatePickerTis, {
                    [css.disable_KeyboardDatePickerTis]: disableNavigationIcon(false),
                  })}
                  disabled={disableNavigationIcon(false)}
                  onClick={() => onNavigationClick(false)}
                >
                  <PrevIcon />
                </button>{' '}
                <button
                  className={classNames(css.navIcon_KeyboardDatePickerTis, {
                    [css.disable_KeyboardDatePickerTis]: disableNavigationIcon(true),
                  })}
                  disabled={disableNavigationIcon(true)}
                  onClick={() => onNavigationClick(true)}
                >
                  <NextIcon />
                </button>
              </div>
            </header>

            <div className={css.days_KeyboardDatePickerTis}>
              {new Array(31).fill(null).map((_, index) => (
                <div
                  key={index}
                  className={classNames(css.day_KeyboardDatePickerTis, {
                    [css.selected_KeyboardDatePickerTis]: date.day === index + 1,
                    [css.disable_KeyboardDatePickerTis]: disableDay(index + 1),
                  })}
                  onClick={() => onDayClick(index + 1)}
                >
                  <span>{twoZeroPadStart(index + 1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};

KeyboardDatePicker.propTypes = {
  containerClassName: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  initialDate: PropTypes.object,
  min: PropTypes.object,
  max: PropTypes.object,
  darkMode: PropTypes.bool,
  startIcon: PropTypes.any,
  downIcon: PropTypes.any,
  updateDatePicker: PropTypes.object,
};