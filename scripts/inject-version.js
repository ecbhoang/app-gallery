#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const version = process.env.NEXT_PUBLIC_APP_VERSION || require(path.join(rootDir, "package.json")).version || "0.0.0";
const swPath = path.join(rootDir, "public", "service-worker.js");
const versionJsonPath = path.join(rootDir, "public", "version.json");

const original = fs.readFileSync(swPath, "utf8");
const updated = original.replace(/const APP_VERSION = "[^"]*";/, `const APP_VERSION = "${version}";`);

fs.writeFileSync(swPath, updated);
fs.writeFileSync(versionJsonPath, JSON.stringify({ version }, null, 2));
console.log(`Injected service worker version ${version}`);
