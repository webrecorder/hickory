/**
 * Makeshift Tailwind theme generator for colors
 *
 * Should be replaced with something like Style Dictionary at some point soon!
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import * as prettier from "prettier";

import colors from "../globals/color.json" with { type: "json" };

/**
 * @typedef {{$value: string, $type?: string}} Value
 * @typedef {Value | {[k: string]: GroupOrValue}} GroupOrValue
 */

/**
 * @param {GroupOrValue} obj
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
 * @param {GroupOrValue} obj
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

const output = await prettier.format(
  // @ts-ignore
  `module.exports = ${JSON.stringify(formatGroup(colors))}`,
  { parser: "babel" }
);

const typeOutput = await prettier.format(
  `declare const tokens: {
  ${declareGroup(
    // @ts-ignore
    colors
  )}
};
  export default tokens;`,
  { parser: "typescript" }
);

const path = join("dist", "tw-theme.js");
const declarationPath = join("dist", "tw-theme.d.ts");

await mkdir(dirname(path), { recursive: true });

await writeFile(path, output);
await writeFile(declarationPath, typeOutput);
