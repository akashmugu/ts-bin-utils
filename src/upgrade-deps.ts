import { readFile } from "fs/promises";
import { resolve } from "path";

// [packageKey, installPrefix, uninstallPrefix]
const key2prefix = [
  ["dependencies", "npm install", "npm uninstall"],
  ["devDependencies", "npm install --save-dev", "npm uninstall"],
];

// validate cli args
const args = process.argv;
if (![2, 3].includes(args.length)) {
  console.error(`usage: upgrade-deps [dir_with_package.json]`);
  process.exit(1);
}

// main
(async () => {
  const dir = args[2] || process.cwd();
  const pack = resolve(dir, "package.json");

  try {
    const content = await readFile(pack, { encoding: "utf8" });
    const data: any = JSON.parse(content);
    const commandGroups: string[][] = [];

    key2prefix.forEach(([packageKey, installPrefix, uninstallPrefix]) => {
      try {
        const packageNames = Object.keys(data[packageKey]);
        const commands = [
          `# ${packageKey}`,
          `${uninstallPrefix} ${packageNames.join(" ")}`,
          `${installPrefix} ${packageNames.join(" ")}`,
        ];
        commandGroups.push(commands);
      } catch (err) {} // if packageKey doesn't exist, skip
    });

    console.log(
      commandGroups.map((commands) => commands.join("\n")).join("\n\n")
    );
  } catch (err) {
    console.error(`error: valid JSON not found in ${pack}`);
  }
})();
