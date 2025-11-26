# @kuura/hetu-validator

A lightweight, dependency-free TypeScript library for validating Finnish Personal Identity Codes (Henkilötunnus/HETU).

## Features

- Validates format, date, and checksum.
- Supports 19th, 20th, and 21st-century separators (including new 2023/2024 standards).
- Checks for leap years and future dates.
- Optional support for test/artificial IDs (900 series).
- Written in TypeScript with type definitions included.

## Installation

```bash
npm install @kuura/hetu-validator
# or
yarn add @kuura/hetu-validator
# or
pnpm add @kuura/hetu-validator
```

## Usage

```typescript
import { validateFinnishHetu } from '@kuura/hetu-validator';

// Basic validation
const isValid = validateFinnishHetu('131052-308T'); 
console.log(isValid); // true

// Handling whitespace (trims by default)
validateFinnishHetu('  131052-308T  '); // true

// Validating test IDs (Artificial IDs 900-999)
validateFinnishHetu('010101-900R'); // false (default)
validateFinnishHetu('010101-900R', { allowTestIds: true }); // true
```

## API

### `validateFinnishHetu(hetu, options?)`

Validates a Finnish Personal Identity Code.

#### Parameters

- `hetu` (string): The HETU string to validate.
- `options` (object, optional):
  - `allowTestIds` (boolean, optional): Whether to accept artificial IDs (individual numbers 900-999). Defaults to `false`.
  - `trimInput` (boolean, optional): Whether to trim whitespace from the input string before validation. Defaults to `true`.

#### Returns

- `boolean`: `true` if the HETU is valid, `false` otherwise.

## License

MIT
