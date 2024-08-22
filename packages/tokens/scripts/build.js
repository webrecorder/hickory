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

const output = await prettier.format(
  // @ts-ignore
  `module.exports = ${JSON.stringify(formatGroup(colors))}`,
  { parser: "babel" }
);

const path = join("dist", "theme.js");

await mkdir(dirname(path), { recursive: true });

await writeFile(path, output);
