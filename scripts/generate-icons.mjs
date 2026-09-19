import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("docs/stitch/assets/logo.svg", "utf8");
const cart = svg.match(/<path d="M28[^>]*\/>[\s\S]*<path d="M50[^>]*\/>/)[0];
const GREEN = "#00A86B";
const wrap = (inner, vb = "0 0 100 100") =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none">${inner}</svg>`);
const white = cart.replaceAll("#A7F3D0", "#FFFFFF");
// Desenho ocupa ~66% (zona segura adaptativa): viewBox ampliado ao redor do centro (50,50)
const zoom = (inner, pct) => wrap(inner, `${50 - 50 / pct} ${50 - 50 / pct} ${100 / pct} ${100 / pct}`);
const png = (buf, size, file) =>
  sharp(buf, { density: 600 }).resize(size, size).png().toFile(`assets/${file}`);

await png(Buffer.from(svg), 1024, "icon.png");
await png(zoom(cart, 0.66), 1024, "android-icon-foreground.png");
await png(zoom(white, 0.66), 1024, "android-icon-monochrome.png");
await png(
  wrap(`<rect width="100" height="100" fill="${GREEN}"/>`),
  1024,
  "android-icon-background.png",
);
await png(Buffer.from(svg), 1024, "splash-icon.png");
await png(Buffer.from(svg), 48, "favicon.png");
console.log("ícones gerados");
