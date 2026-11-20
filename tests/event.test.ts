import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's native TypeScript runner requires the .ts extension.
import { event, countdownAt, calendarIcs, googleCalendarUrl, mapsUrl } from "../lib/event.ts";

test("Baghdad 7 PM is exactly 16:00 UTC", () => {
  assert.equal(new Date(event.start).toISOString(), "2026-12-02T16:00:00.000Z");
  assert.deepEqual(countdownAt(Date.parse("2026-12-01T14:58:57Z")), { total: 90063, days: 1, hours: 1, minutes: 1, seconds: 3 });
});
test("countdown clamps at zero at and after the event", () => {
  assert.equal(countdownAt(Date.parse(event.start)).total, 0);
  assert.deepEqual(countdownAt(Date.parse("2027-01-01T00:00:00Z")), { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
});
test("Google Calendar and ICS agree across device time zones", () => {
  const google = new URL(googleCalendarUrl());
  assert.equal(google.searchParams.get("dates"), "20261202T160000Z/20261202T190000Z");
  assert.equal(google.searchParams.get("ctz"), "Asia/Baghdad");
  const ics = calendarIcs();
  assert.match(ics, /DTSTART:20261202T160000Z\r\n/);
  assert.match(ics, /DTEND:20261202T190000Z\r\n/);
  assert.ok(ics.includes("LOCATION:Shindoxa Hall\\, Duhok"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(ics.split("\r\n").every((line: string) => Buffer.byteLength(line) <= 75));
  assert.ok(Date.parse(event.end) > Date.parse(event.start));
});
test("Maps preserves the exact host-supplied plus code", () => {
  assert.equal(new URL(mapsUrl).searchParams.get("query"), "RXX6+8X6, Duhok, Duhok Governorate, Iraq");
});
