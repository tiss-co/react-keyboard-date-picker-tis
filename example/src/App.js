import React from 'react';

import { KeyboardDatePicker } from 'react-keyboard-date-picker-tis';
import 'react-keyboard-date-picker-tis/dist/index.css';

const App = () => {
  return (
    <div className='App'>
      <div className='Title'>
        KeyboardDatePicker Tis
      </div>
      <KeyboardDatePicker
        className='KeyboardDatePicker'
        onChange={dateTime => console.log(dateTime)}
        darkMode={false}
      />
    </div>
  );
};

export default App;