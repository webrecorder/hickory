import {
  importDirectory,
  cleanupSVG,
  runSVGO,
  parseColors,
  isEmptyColor,
  exportJSONPackage,
  exportToDirectory,
} from "@iconify/tools";
import fs from "node:fs/promises";
import path from "node:path";

const iconSet = await importDirectory("icons");

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
const target = path.join("dist", "icons", iconSet.prefix);

// Export package
await exportJSONPackage(iconSet, {
  target,
  cleanup: true,
});

// A little hacky, but exportJSONPackage does everything we want, it just also
// writes a package.json that we don't need
await fs.rm(path.join(target, "package.json"));

await exportToDirectory(iconSet, {
  target: `dist/icons/svg/${iconSet.prefix}`,
  log: true,
});
