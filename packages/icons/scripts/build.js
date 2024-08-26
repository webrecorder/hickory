import {
  importDirectory,
  cleanupSVG,
  runSVGO,
  parseColors,
  isEmptyColor,
  exportJSONPackage,
} from "@iconify/tools";
import { version } from "prettier";

import packageInfo from "../package.json" with { type: "json" };

const iconSet = await importDirectory("src");

iconSet.forEach((name, type) => {
  if (type !== "icon") {
    return;
  }

  const svg = iconSet.toSVG(name);
  if (!svg) {
    // Invalid icon
    iconSet.remove(name);
    return;
  }

  // Clean up and optimize icons
  try {
    // Clean up icon code
    cleanupSVG(svg);

    // Assume icon is monotone: replace color with currentColor, add if missing
    // If icon is not monotone, remove this code
    parseColors(svg, {
      defaultColor: "currentColor",
      callback: (attr, colorStr, color) => {
        return !color || isEmptyColor(color) ? colorStr : "currentColor";
      },
    });

    // Optimize
    runSVGO(svg);
  } catch (err) {
    // Invalid icon
    console.error(`Error parsing ${name}:`, err);
    iconSet.remove(name);
    return;
  }

  // Update icon
  iconSet.fromSVG(name, svg);
});

// Target directory
const target = `dist/${iconSet.prefix}`;

const { private: _, ...outputPackage } = packageInfo;

// Export package
await exportJSONPackage(iconSet, {
  target,
  package: outputPackage,
  cleanup: true,
});

// Publish NPM package
/*
await execAsync('npm publish --access=public --silent', {
    cwd: target,
});
*/
