# cyclejs-storage

A [Cycle.js](http://cycle.js.org) [Driver](http://cycle.js.org/drivers.html) for using
[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and
[sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
 in the browser.

(Inspired by @cylce/storage)

## Installation

```
npm install --save cyclejs-storage
```

## Usage

Basics:

```js
import Cycle from '@cycle/core';
import { makeStorageDriver } from 'cyclejs-storage';

function main(sources) {
  // ...
}

const drivers = {
  storage: makeStorageDriver()
}

Cycle.run(main, drivers);
```

Simple and normal use case:

```js
function main({DOM, storage}) {
   const storageRequest$ = DOM.select('input')
    .events('keypress')
    .map(function(ev) {
      return {
        key: 'inputText',
        value: ev.target.value,
        target: 'local'
      };
    });

  return {
    DOM: storage.local
    .select('inputText')
    .startWith('')
    .map((text) =>
      h('input', {
        type: 'text',
        value: text
      })
    ),
    storage: storageRequest$
  };
}
```
