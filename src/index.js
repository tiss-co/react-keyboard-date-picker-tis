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
  month: today.getMonth(),
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
  max,
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
      initialDate.month - 1,
      0
    ).getDate()
    :
    new Date(
      today.year,
      today.month - 1,
      0
    ).getDate()
    ;

  const [anchor, setAnchor] = useState(null);
  const [date, setDate] = useState(initialDate);
  const [inputValue, setInputValue] = useState('');
  const [monthLength, setMonthLength] = useState(initialMonthLength);

  updateDatePicker.current = (date) => {
    if (!isSelected) setIsSelected(true);

    setAnchor(null);
    onChange && onChange(date);

    setDate(date);
    setInputValue(`${date.year}/${addZeroPad(date.month + 1)}/${addZeroPad(date.day)}`);

  };

  const onMonthChange = () => {
    const monthLength = new Date(
      date.year,
      date.month + 1,
      0
    ).getDate();
    setMonthLength(monthLength);

    if (date.day > monthLength)
      setDate(dt => ({ ...dt, day: monthLength }));

    if (min && date.month === min.month && date.day < min.day)
      setDate(dt => ({ ...dt, day: min.day }));

    if (max && date.month === max.month && date.day > max.day)
      setDate(dt => ({ ...dt, day: max.day }));
  };

  const onNavigationClick = isNext => {
    const timestamp = createDate(date).getTime();

    if (isNext) {
      if (!max || timestamp < createDate(max).getTime())
        setDate(dt => ({
          ...dt,
          year: dt.month === 11 ? dt.year + 1 : dt.year,
          month: dt.month < 11 ? dt.month + 1 : 0,
        }));
    } else if (!min || timestamp > createDate(min).getTime())
      setDate(dt => ({
        ...dt,
        year: dt.month === 0 ? dt.year - 1 : dt.year,
        month: dt.month > 0 ? dt.month - 1 : 11,
      }));
  };

  const disableNavigationIcon = isNext => {
    const mDate = isNext ?
      {
        ...date,
        year: date.month === 11 ? date.year + 1 : date.year,
        month: date.month < 11 ? date.month + 1 : 0,
        day: max ? max.day : date.day,
      } :
      {
        ...date,
        year: date.month === 0 ? date.year - 1 : date.year,
        month: date.month > 0 ? date.month - 1 : 11,
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
      day: index + 1,
    };
    if (!isSelected) setIsSelected(true);

    setAnchor(null);
    onChange && onChange({
      year: mDate?.year,
      month: mDate?.month + 1,
      day: mDate?.day,
    });

    setDate(mDate);
    setInputValue(`${mDate.year}/${addZeroPad(mDate.month + 1)}/${addZeroPad(mDate.day)}`);
  };

  const onInputChange = (value) => {
    if (value?.length > inputValue?.length) {
      let mValue = value.split('/').join('');
      if (isNaN(+mValue))
        return;
      if (mValue.length > 3 && mValue?.length < 7) {
        const year = mValue.substring(0, 4);
        const month = mValue.substring(4, 6);
        mValue = `${year}/${month}`;
      } else if (mValue?.length >= 7) {
        const year = mValue.substring(0, 4);
        const month = mValue.substring(4, 6);
        const day = mValue.substring(6, 8);

        const monthLength = new Date(
          parseInt(year),
          parseInt(month),
          0
        ).getDate();
        if (parseInt(day) > monthLength) return

        mValue = `${year}/${month}/${day}`;

        const mDate = {
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day)
        };

        onChange && onChange(mDate);
        setDate({
          ...mDate,
          month: mDate.month - 1
        });

      }
      setInputValue(mValue);
    }
    else
      setInputValue(value);
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
          className={css.input_KeyboardDatePickerTis}
          type='text'
          placeholder='yyyy/mm/dd'
          value={inputValue}
          onChange={({ target: { value } }) => onInputChange(value)}
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
                {`${getMonthName(date.month, true)} ${date.year
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
                  onClick={() => onDayClick(index)}
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