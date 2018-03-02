# Rashasi

> A symbol of unity between unrelenting aggression and unwavering defense.

Rashasi is a wrapper for Lesion for managing local fragments.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Author](#author)
- [License](#license)

## Installation

```bash
npm install rashasi --save
```

## Usage

```javascript
const lesion = require('lesion');
const rashasi = require('rashasi');

const rootPath = '/path/to/store';
const resolvers = [
  {
    extensions: ['json', 'json5'],
    deserialize: contents => JSON.parse(contents.toString('utf8')),
  },
  {
    extensions: ['log', 'txt'],
    deserialize: contents => contents.toString('utf8'),
  },
  {
    extensions: ['gif', 'jpeg', 'jpg', 'png'],
    deserialize: contents => contents,
  },
];

const fragments = [
  {
    key: ['date'],
    value: new Date(),
  },
];

lesion(rootPath, { resolvers })
  .then(store => rashasi(store, { fragments }))
  .then((store) => {
    // Fetch the store value
    console.log(store.value);

    // Attach a callback called after each store change
    const disposer = store.onChange(({ newFragment, oldFragment }) => {
      console.log({ newFragment, oldFragment });
    });
  });
```

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)

## License

MIT © [Alexandre Breteau](https://seldszar.fr)
