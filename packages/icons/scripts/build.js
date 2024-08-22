import {
  importDirectory,
  cleanupSVG,
  runSVGO,
  exportJSONPackage,
} from "@iconify/tools";

(async () => {
  const iconSet = await importDirectory("src", {
    prefix: "wr",
  });

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

    // Clean up and optimise icons
    try {
      // Clean up icon code
      cleanupSVG(svg);

      // Assume icon is monotone: replace color with currentColor, add if missing
      // If icon is not monotone, remove this code
      // parseColors(svg, {
      //   defaultColor: "currentColor",
      //   callback: (attr, colorStr, color) => {
      //     return !color || isEmptyColor(color) ? colorStr : "currentColor";
      //   },
      // });

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

  // Export package
  await exportJSONPackage(iconSet, {
    target,
    package: {
      name: `@webrecorder/icons`,
      version: "1.0.0",
    },
    cleanup: true,
    /*
       customFiles: {
           'README.md': 'README!',
       },
       */
  });

  // Publish NPM package
  /*
   await execAsync('npm publish --access=public --silent', {
       cwd: target,
   });
   */
})();
