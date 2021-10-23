# react-keyboard-date-picker-tis

> Date picker component for React

[![NPM](https://img.shields.io/npm/v/react-date-picker-tis.svg)](https://www.npmjs.com/package/react-date-picker-tis) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![react-keyboard-date-picker-tis Banner](https://user-images.githubusercontent.com/76048512/138558963-f6408de2-3095-4fee-805f-e1aeed22106a.gif)


## Install

```bash
npm i react-keyboard-date-picker-tis
```

or

```bash
yarn add react-keyboard-date-picker-tis
```

## Usage

```jsx
import React from 'react'

import { KeyboardDatePicker } from 'react-keyboard-date-picker-tis'
import 'react-keyboard-date-picker-tis/dist/index.css'

const App = () => {
  return (
    <KeyboardDatePicker
      className='KeyboardDatePicker'
      onChange={(dateTime) => console.log(dateTime)}
      initialDateTime={today} //dateTime object
      min={today} //dateTime object
      max={nexMonth} //dateTime object
      darkMode={false}
    />
  )
}

export default App
```

### DateTime shape

```jsx
{
  year: PropTypes.number,
  month: PropTypes.number,
  day: PropTypes.number,
}
```

## License

MIT © [boof-tech](https://github.com/boof-tech)
