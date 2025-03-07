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

/**
 *
 * @param {import("@iconify/tools").IconSet} iconSet
 * @param {string} iconSetName
 * @param {{makeUniformColor?: boolean}} [options={}]
 */
const processIcons = async (iconSet, iconSetName, options = {}) => {
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
        callback: options?.makeUniformColor
          ? (attr, colorStr, color) => {
              return !color || isEmptyColor(color) ? colorStr : "currentColor";
            }
          : undefined,
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
  const target = path.join("dist", "icons", iconSetName, iconSet.prefix);

  // Export package
  await exportJSONPackage(iconSet, {
    target,
    cleanup: true,
  });

  // A little hacky, but exportJSONPackage does everything we want, it just also
  // writes a package.json that we don't need
  await fs.rm(path.join(target, "package.json"));

  await exportToDirectory(iconSet, {
    target: `dist/icons/svg/${iconSetName}/${iconSet.prefix}`,
    log: true,
  });
};

await Promise.all([
  processIcons(await importDirectory("iconsets/icons"), "icons", {
    makeUniformColor: true,
  }),
  processIcons(await importDirectory("iconsets/brand"), "brand"),
]);
