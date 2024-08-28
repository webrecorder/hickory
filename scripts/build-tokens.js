import StyleDictionary from "style-dictionary";
import * as prettier from "prettier";

const sd = new StyleDictionary("sd.config.json");

/**
 * @param {import("style-dictionary").TransformedTokens} obj
 */
function formatGroup(obj) {
  /** @typedef {string | {[key: string]: OutputColor}} OutputColor */
  /** @type {OutputColor} */
  let res = {};
  const entries = Object.entries(obj);
  entries.forEach(([k, v]) => {
    if (typeof v !== "object") return;
    if (Object.hasOwn(v, "$value")) {
      res[k] = v.$value;
    } else {
      res[k] = formatGroup(v);
    }
  });
  return res;
}

/**
 * @param {import("style-dictionary").TransformedTokens} obj
 */
function declareGroup(obj) {
  let res = "";
  const entries = Object.entries(obj);
  entries.forEach(([k, v]) => {
    if (typeof v !== "object") return;
    if (Object.hasOwn(v, "$value")) {
      res += `readonly ${JSON.stringify(k)}: ${JSON.stringify(v.$value)};
      `;
    } else {
      res += `readonly ${JSON.stringify(k)}: {
  ${declareGroup(v)}};
  `;
    }
  });
  return res;
}

sd.registerFormat({
  name: "tailwind-js",
  format: async ({ dictionary }) => {
    return await prettier.format(
      `module.exports = ${JSON.stringify(formatGroup(dictionary.tokens))};`,
      { parser: "babel" }
    );
  },
});

sd.registerFormat({
  name: "tailwind-mjs",
  format: async ({ dictionary }) => {
    return await prettier.format(
      `const tokens = ${JSON.stringify(formatGroup(dictionary.tokens))};
      export default tokens;`,
      { parser: "babel" }
    );
  },
});

sd.registerFormat({
  name: "tailwind-typedef",
  format: async ({ dictionary }) => {
    return await prettier.format(
      `declare const tokens: {${declareGroup(dictionary.tokens)}};
  export default tokens;`,
      { parser: "typescript" }
    );
  },
});

await sd.buildAllPlatforms();
