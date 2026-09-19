// Copies the prerendered site into dist/client, where static hosts expect it.
// Idempotent: safe to run repeatedly, and a no-op when the output already
// lives in dist/client.
import { cp, mkdir, rm, stat, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, ".output/public");
const target = resolve(root, "dist/client");

const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

if (source === target) {
  console.log("[static] output already lives in dist/client — nothing to copy");
  process.exit(0);
}

if (!(await exists(source))) {
  const ready = await exists(resolve(target, "index.html"));
  console.log(
    ready
      ? "[static] dist/client already holds the built site — nothing to copy"
      : "[static] no build output found at .output/public or dist/client",
  );
  process.exit(0);
}

// The PWA plugin writes sw.js and the manifest into dist/client during the
// client build; Nitro carries them into .output/public. Only replace
// dist/client when both made it across.
const produced = new Set(await readdir(source));
const pwaFiles = ["sw.js", "manifest.webmanifest"];
const missing = pwaFiles.filter((file) => !produced.has(file));

if (missing.length > 0) {
  console.warn(
    `[static] ${missing.join(", ")} not found in .output/public — merging into dist/client instead of replacing it`,
  );
} else {
  await rm(target, { recursive: true, force: true });
}

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log("[static] copied .output/public -> dist/client");
