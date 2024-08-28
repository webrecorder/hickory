# Hickory

Webrecorder's Design System (WIP)

Hickory currently contains just primitive design tokens and custom icons, but will eventually also contain shared UI primitives and components.

## Tokens

Tokens live within the `tokens` folder. Currently we've just got primitive color tokens, but as we start to bring components and other primitives into this repo we'll want to expand that to semantic tokens. They're written using the [Design Tokens Community Group spec](https://tr.designtokens.org/format/), and are compiled using [Style Dictionary](https://styledictionary.com/) to a Tailwind theme. In the future we may also want to compile these to CSS variables, which Style Dictionary makes very easy.

### Usage - Tailwind

Inside your Tailwind config file, set the following:

```js
import theme from "@webrecorder/hickory/tokens/tailwind/theme.colors";

/** @type {import('tailwindcss').Config} */
export default {
  // ...
  theme,
};
```

## Icons

Icons live in the `icons` folder, and are optimized and bundled using [Iconify Utils](https://iconify.design/docs/libraries/utils/) into JSON and SVG.
