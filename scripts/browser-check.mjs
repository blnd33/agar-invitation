import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";

await mkdir("qa", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const errors = [];
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }, { width: 320, height: 568 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: viewport.width === 320 ? "reduce" : "no-preference", acceptDownloads: true });
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(viewport.width === 320 ? 150 : 2600);
    await page.screenshot({ path: `qa/cover-${viewport.width}.png`, fullPage: true });
    assert.equal(await page.locator('.gatefold-door').count(), 2);
    const gatefoldBounds = await page.locator('.gatefold-scene').boundingBox();
    assert.equal(Math.round(gatefoldBounds.width), viewport.width);
    assert.equal(Math.round(gatefoldBounds.height), viewport.height);
    assert.equal(await page.locator('.petal img').count(), 9);
    assert.equal(await page.locator('.petal svg').count(), 0);
    assert.equal(await page.getByRole("button", { name: "Tap to Open" }).count(), 1);
    await page.getByRole("button", { name: "Tap to Open" }).focus();
    await page.keyboard.press("Enter");
    if (viewport.width !== 320) {
      await page.waitForTimeout(1500);
      assert.equal(await page.getByRole("button", { name: "Tap to Open" }).isDisabled(), true);
      assert.equal(await page.getByRole("button", { name: "Tap anywhere to continue" }).count(), 0);
      await page.screenshot({ path: `qa/envelope-opening-${viewport.width}.png`, fullPage: true });
    }
    const continueButton = page.getByRole("button", { name: "Tap anywhere to continue" });
    await continueButton.waitFor();
    await page.waitForTimeout(viewport.width === 320 ? 100 : 2100);
    assert.equal(await page.locator('.logo-scene .botanical-wreath').count(), 1);
    assert.equal(await page.locator('.logo-scene .wreath ellipse').count(), 0);
    await page.screenshot({ path: `qa/logo-${viewport.width}.png`, fullPage: true });
    await continueButton.click();
    await page.getByRole("heading", { name: "Agar and Renas" }).waitFor();
    await page.waitForTimeout(viewport.width === 320 ? 100 : 1900);
    const nameBounds = await page.getByRole("heading", { name: "Agar and Renas" }).boundingBox();
    assert.ok(nameBounds.x >= 15 && nameBounds.x + nameBounds.width <= viewport.width - 15, `Names fit at ${viewport.width}`);
    assert.ok(await page.getByRole("heading", { name: "Agar and Renas" }).evaluate(el => document.fonts.check(`40px ${getComputedStyle(el).fontFamily.split(',')[0]}`)), "Requested name font loaded");
    await page.screenshot({ path: `qa/names-${viewport.width}.png`, fullPage: true });
    assert.equal(await page.getByText("Shindoxa Hall, Duhok", { exact: true }).count(), 0);
    await page.getByRole("button", { name: "Tap to View Invitation" }).click();
    await page.getByRole("link", { name: "Open in Google Maps" }).waitFor();
    await page.waitForTimeout(viewport.width === 320 ? 150 : 2000);
    await page.screenshot({ path: `qa/invitation-${viewport.width}.png`, fullPage: true });
    const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width, `No horizontal overflow at ${viewport.width}`);
    const map = await page.getByRole("link", { name: "Open in Google Maps" }).getAttribute("href");
    assert.equal(new URL(map).searchParams.get("query"), "RXX6+8X6, Duhok, Duhok Governorate, Iraq");
    const timerBefore = await page.getByRole("timer").getAttribute("aria-label");
    await page.waitForTimeout(1100);
    assert.notEqual(await page.getByRole("timer").getAttribute("aria-label"), timerBefore);
    await page.getByRole("button", { name: "Add to Calendar", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    const calendar = await page.getByRole("link", { name: "Add to Google Calendar" }).getAttribute("href");
    assert.equal(new URL(calendar).searchParams.get("dates"), "20261202T160000Z/20261202T190000Z");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Apple Calendar / Download ICS" }).click();
    const download = await downloadPromise;
    const contents = await readFile(await download.path(), "utf8");
    assert.ok(contents.includes("DTSTART:20261202T160000Z"));
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.equal(await page.getByRole("button", { name: "Add to Calendar", exact: true }).evaluate(el => el === document.activeElement), true);
    await page.getByRole("button", { name: "Play background music" }).click();
    await page.getByRole("button", { name: "Mute background music" }).waitFor();
    await page.getByRole("button", { name: "Mute background music" }).click();
    await page.getByRole("button", { name: "Replay invitation" }).click();
    await page.getByRole("button", { name: "Tap to Open" }).waitFor();
    assert.equal(await page.locator('.gatefold-is-opening').count(), 0);
    console.log(`PASS ${viewport.width}x${viewport.height}: sequence, layout, live countdown, map, calendar/ICS, focus, music, replay`);
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log("PASS: no browser runtime errors");
} finally { await browser.close(); }
