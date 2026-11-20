import sharp from "sharp";
import { resolve } from "node:path";

await sharp("public/floral-corner.png").resize(950, 950, { fit: "inside" }).webp({ quality: 84, alphaQuality: 90 }).toFile("public/floral-corner.webp");
await sharp("public/eucalyptus-corner-source.png").resize(950, 950, { fit: "inside" }).webp({ quality: 85, alphaQuality: 95 }).toFile("public/eucalyptus-corner.webp");
await sharp("public/eucalyptus-wreath-source.png").resize(700, 700, { fit: "inside" }).webp({ quality: 90, alphaQuality: 100 }).toFile("public/eucalyptus-wreath.webp");
await sharp("public/wax-seal-source.png").trim().resize(360, 360, { fit: "inside" }).webp({ quality: 90, alphaQuality: 100 }).toFile("public/wax-seal.webp");
await sharp("public/embossed-botanical-source.png").resize({ height: 1300 }).webp({ quality: 88, alphaQuality: 100 }).toFile("public/embossed-botanical.webp");
const leafSheet = await sharp("public/botanical-leaves-source.png").metadata();
const cellWidth = Math.floor(leafSheet.width / 2), cellHeight = Math.floor(leafSheet.height / 2);
for (let i = 0; i < 4; i++) {
  const cutout = await sharp("public/botanical-leaves-source.png").extract({ left: (i % 2) * cellWidth, top: Math.floor(i / 2) * cellHeight, width: cellWidth, height: cellHeight }).png().toBuffer();
  await sharp(cutout).trim().resize({ width: 140, height: 180, fit: "inside" }).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/botanical-leaf-${i}.webp`);
}
await sharp("public/couple-logo-two-tone-source.png").trim().resize({ height: 600 }).png().toFile("public/couple-logo.png");
const logo = await sharp("public/couple-logo.png").resize({ height: 110 }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();
const corner = await sharp("public/eucalyptus-corner-source.png").resize(500, 500).png().toBuffer();
const opposite = await sharp(corner).rotate(180).toBuffer();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect x="22" y="22" width="1156" height="586" rx="22" fill="none" stroke="#9170BC" stroke-opacity=".65"/><rect x="29" y="29" width="1142" height="572" rx="17" fill="none" stroke="#9170BC" stroke-opacity=".2"/><g fill="#44236B" font-family="Georgia,serif" text-anchor="middle"><text x="600" y="250" font-size="15" letter-spacing="4">TOGETHER WITH THEIR FAMILIES</text><text x="600" y="427" font-size="16" letter-spacing="4">AN ENGAGEMENT CELEBRATION</text><text x="600" y="475" font-size="27">December 2, 2026</text></g><path d="M500 510h85m30 0h85" stroke="#9170BC" stroke-opacity=".6"/><path d="M600 505c-10-10-18 5 0 14 18-9 10-24 0-14" fill="none" stroke="#9170BC"/></svg>`;
const nameArt = await sharp({ text: { text: '<span foreground="#44236b">Agar <span foreground="#9170bc">&amp;</span> Renas</span>', font: 'Agetya Butterfly Demo', fontfile: resolve('assets/fonts/AgetyaButterfly-Regular.ttf'), width: 690, height: 110, wrap: 'none', align: 'centre', rgba: true } }).png().toBuffer();
const nameArtMeta = await sharp(nameArt).metadata();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#F7F0FB" } }).composite([{ input: corner, left: -70, top: -110 }, { input: opposite, left: 770, top: 240 }, { input: Buffer.from(svg) }, { input: nameArt, left: Math.round((1200 - nameArtMeta.width) / 2), top: 280 }, { input: logo, left: Math.round((1200 - logoMeta.width) / 2), top: 97 }]).jpeg({ quality: 90 }).toFile("public/og-image.jpg");
const icon = await sharp("public/couple-logo.png").resize({ height: 100 }).png().toBuffer();
const iconMeta = await sharp(icon).metadata();
await sharp({ create: { width: 128, height: 128, channels: 4, background: "#ede3f5" } }).composite([{ input: icon, left: Math.round((128 - iconMeta.width) / 2), top: 14 }]).png().toFile("public/icon.png");
console.log("Optimized watercolor asset and social preview created.");
