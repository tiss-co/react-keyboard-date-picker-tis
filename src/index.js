import React, { useState, useEffect, useRef } from 'react';
import { Popover } from '@material-ui/core';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { PrevIcon, NextIcon, CalendarIcon, DownTriangleIcon } from './assets/icons';
import css from './styles.module.scss';

const addZeroPad = number => {
  return number < 10 ? '0' + number : number;
};

const scrollToItem = (itemId, behavior = 'auto') => {
  var parent = document.getElementById(itemId)?.parentElement;
  var item = document.getElementById(itemId);
  parent && parent.scrollTo({
    top: item?.offsetTop - 10,
    behavior,
  });
};

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
/**
 * @param {number} month
 * @param {boolean} withSmallName
 * @returns {string} month name
 */
const getMonthName = (month, withSmallName = false) => {
  if (withSmallName) {
    return smallMonthNames[month] ? smallMonthNames[month] : 'Dec';
  } else {
    return monthNames[month] ? monthNames[month] : 'December';
  }
};

/**
 * add zero before the number
 * @param {number} st
 * @returns {string} string: 1 => 01
 */
const twoZeroPadStart = st => String(st).padStart(2, '0');

const createDate = ({ year, month, day, }) =>
  new Date(year, month, day, 0, 0, 0, 0);

export const KeyboardDatePicker = ({
  containerClassName,
  className,
  onChange,
  initialDate = null,
  min = null,
  max = null,
  removeButton = true,
  darkMode = false,
  startIcon,
  downIcon,
  updateDatePicker = { current: () => { } },
  autoFocus = false,
  id,
  ...attrs
}) => {
  const today = new Date();
  const todayDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate()
  };

  const hasInitialDate = useRef(false);

  if (initialDate) {
    hasInitialDate.current = true;
  } else {
    initialDate = { ...todayDate };
  }

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

  const [dateAnchor, setDateAnchor] = useState(null);
  const [yearAnchor, setYearAnchor] = useState(null);
  const [date, setDate] = useState(initialDate);
  const [monthLength, setMonthLength] = useState(initialMonthLength);
  const [inputYear, setInputYear] = useState('');
  const [inputMonth, setInputMonth] = useState('');
  const [inputDay, setInputDay] = useState('');

  const yearInputRef = useRef();
  const monthInputRef = useRef();
  const dayInputRef = useRef();

  updateDatePicker.current = (date) => {

    setDateAnchor(null);
    setDate(date || todayDate);

    if (!date)
      date = {
        year: null,
        month: null,
        day: null
      };


    setInputYear(date?.year);
    setInputMonth(date?.month ? addZeroPad(date.month) : null);
    setInputDay(date?.day ? addZeroPad(date.day) : null);
  };

  const callOnChange = (date, { inputYear, inputMonth, inputDay }) => {
    date.year && date.month && date.day &&
      inputYear && inputMonth && inputDay && onChange && onChange(date);
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

    setInputDay(addZeroPad(mDate.day));
    setInputMonth(addZeroPad(mDate.month));
    setInputYear(mDate.year);

    setDate(mDate);

    setDateAnchor(null);
    callOnChange(mDate, {
      inputYear: mDate.year,
      inputMonth: addZeroPad(mDate.month),
      inputDay: addZeroPad(mDate.day),
    });
  };

  const onInputYearChange = (value) => {
    if (value?.length !== 4) onChange();
    setInputYear(value);
    if (value?.length === 4) {
      const mDate = {
        ...date,
        year: parseInt(value),
      };
      setDate(mDate);
      callOnChange(mDate, {
        inputYear: mDate.year,
        inputMonth,
        inputDay,
      });
    } else if (value?.length === 0) {
      setDate(prev => ({
        ...prev,
        year: null
      }))
    }
  };

  const onInputMonthChange = (value) => {
    if (!parseInt(value)) onChange();
    if (value.length === 2) {
      if (parseInt(value) < 0 || parseInt(value) > 12)
        return;
    }
    setInputMonth(value);
    if (value?.length >= 1) {
      const mDate = {
        ...date,
        month: parseInt(value),
      };
      setDate(mDate);
      callOnChange(mDate, {
        inputYear,
        inputMonth: mDate.month,
        inputDay,
      });
      value?.length === 2 && dayInputRef.current?.focus();
    }
  };

  const onInputDayChange = (value) => {
    setInputDay(value);
    if (!parseInt(value)) onChange();
    if (value?.length === 2) {
      if (parseInt(value) < 0 || parseInt(value) > 31)
        return;
    }
    if (value?.length >= 1) {
      const mDate = {
        ...date,
        day: parseInt(value),
      };
      setDate(mDate);
      callOnChange(mDate, {
        inputYear,
        inputMonth,
        inputDay: mDate.day,
      });
      if (value?.length === 2)
        yearInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (hasInitialDate.current) setIsSelected(true);
  }, []);

  useEffect(onMonthChange, [date.month]);

  useEffect(() => {
    if (!dateAnchor) return;

    setTimeout(() => {
      scrollToItem('selected-minute');
    }, 0);

    if (!inputYear || !inputMonth || !inputDay ||
      inputYear?.length === 0 || inputMonth?.length === 0 || inputDay?.length === 0) {
      setInputYear(today.getFullYear());
      setInputMonth(addZeroPad(today.getMonth() + 1));
      setInputDay(addZeroPad(today.getDate()));
      callOnChange(date, {
        inputYear: today.getFullYear(),
        inputMonth: addZeroPad(today.getMonth() + 1),
        inputDay: addZeroPad(today.getDate()),
      });
    } else {
      callOnChange(date, {
        inputYear,
        inputMonth,
        inputDay,
      });
    }
  }, [dateAnchor]);

  useEffect(() => {
    if (yearAnchor) {
      setTimeout(() => {
        scrollToItem('selected-year');
      }, 0);
    }
  }, [yearAnchor]);

  useEffect(() => {
    const monthLength = new Date(
      date.year,
      date.month,
      0
    ).getDate();
    setMonthLength(monthLength);

    if (date.day > monthLength) {
      setDate(prev => ({
        ...prev,
        day: monthLength
      }));
      setInputDay(monthLength);
    }
  }, [dateAnchor, yearAnchor]);

  return (
    <div className={classNames(css.keyboardDatePicker_KeyboardDatePickerTis, containerClassName)} {...attrs} id={id}>
      <div
        className={classNames(css.buttonContainer_KeyboardDatePickerTis, {
          [css.Dark_KeyboardDatePickerTis]: darkMode
        }, className)}
      >
        <input
          className={classNames(css.input_KeyboardDatePickerTis, css.input_small_KeyboardDatePickerTis)}
          type='text'
          placeholder='mm'
          value={inputMonth || ''}
          onChange={({ target: { value } }) => onInputMonthChange(value)}
          autoFocus={autoFocus}
          ref={monthInputRef}
        />
        /
        <input
          className={classNames(css.input_KeyboardDatePickerTis, css.input_small_KeyboardDatePickerTis)}
          type='text'
          placeholder='dd'
          value={inputDay || ''}
          onChange={({ target: { value } }) => onInputDayChange(value)}
          ref={dayInputRef}
          onKeyDown={e => {
            if (e.key === 'Backspace' && inputDay.length === 0)
              monthInputRef.current?.focus();
          }}
        />
        /
        <input
          className={css.input_KeyboardDatePickerTis}
          type='text'
          placeholder='yyyy'
          value={inputYear || ''}
          onChange={({ target: { value } }) => onInputYearChange(value)}
          ref={yearInputRef}
          onKeyDown={e => {
            if (e.key === 'Backspace' && inputYear.length === 0)
              dayInputRef.current?.focus();
          }}
        />
        <CalendarIcon onClick={e => {
          if (!date.year || !date.month || !date.day || !inputYear || !inputMonth || !inputDay) {
            setDate({
              year: today.getFullYear(),
              month: today.getMonth() + 1,
              day: today.getDate()
            });
          }
          setDateAnchor(e.currentTarget);
        }} />
      </div>

      <Popover
        className={css.popover_KeyboardDatePickerTis}
        PaperProps={{
          className: darkMode ? css.popoverPaperDark_KeyboardDatePickerTis : css.popoverPaper_KeyboardDatePickerTis
        }}
        open={Boolean(dateAnchor)}
        anchorEl={dateAnchor}
        onClose={() => setDateAnchor(null)}
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
              <span className={css.year_KeyboardDatePickerTis}
                onClick={e => setYearAnchor(e.currentTarget)}>
                {`${getMonthName(date.month - 1, true)} ${date.year
                  }`} <DownTriangleIcon />
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
      <Popover
        className={css.popover_KeyboardDatePickerTis}
        PaperProps={{
          className: darkMode ? css.popoverPaperDark_KeyboardDatePickerTis : css.popoverPaper_KeyboardDatePickerTis
        }}
        open={Boolean(yearAnchor)}
        anchorEl={yearAnchor}
        onClose={() => setYearAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div className={classNames(css.container_YearPickerTis, {
          [css.Dark_YearPickerTis]: darkMode
        })}>
          {
            Array(200).fill(undefined).map((item, yearIndex) =>
              <div
                className={css.yearContainer_YearPickerTis}
                key={yearIndex}
                id={(today.getFullYear() - 100) + yearIndex === date.year ? 'selected-year' : undefined}
              >
                <div
                  className={classNames(css.year_YearPickerTis, {
                    [css.selectedYear_YearPickerTis]: (today.getFullYear() - 100) + yearIndex === date.year
                  })}
                  onClick={() => {
                    const year = (today.getFullYear() - 100) + yearIndex;
                    setDate(prev => ({
                      ...prev,
                      year
                    }));
                    setInputYear(year);
                    setTimeout(() => {
                      scrollToItem('selected-year', 'smooth');
                    }, 0);
                  }}
                >
                  {(today.getFullYear() - 100) + yearIndex}
                </div>
                {
                  ((today.getFullYear() - 100) + yearIndex === date.year) &&
                  <div className={css.monthsContainer_YearPickerTis}>
                    {
                      smallMonthNames.map((month, index) =>
                        <div
                          key={month}
                          className={classNames(css.month_YearPickerTis, {
                            [css.selectedMonth_YearPickerTis]: index === date.month - 1
                          })}
                          onClick={() => {
                            const month = index + 1;
                            setDate(prev => ({
                              ...prev,
                              month
                            }));
                            setInputMonth(addZeroPad(month));
                            setYearAnchor(null);
                          }}>
                          {month}
                        </div>
                      )
                    }
                  </div>
                }
              </div>
            )
          }
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
  autoFocus: PropTypes.bool,
  id: PropTypes.string,
};