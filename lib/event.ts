/** Host-editable event configuration. End time is provisional until confirmed. */
export const event = {
  title: "Agar & Renas Engagement Celebration",
  start: "2026-12-02T19:00:00+03:00",
  end: "2026-12-02T22:00:00+03:00",
  endTimeConfirmed: false,
  timezone: "Asia/Baghdad",
  venue: "Shindoxa Hall, Duhok",
  mapsQuery: "RXX6+8X6, Duhok, Duhok Governorate, Iraq",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://agar-renas-engagement-2026.blnd-bjar121.chatgpt.site",
};

export function countdownAt(now: number) {
  const total = Math.max(0, Math.floor((Date.parse(event.start) - now) / 1000));
  return { total, days: Math.floor(total / 86400), hours: Math.floor(total / 3600) % 24, minutes: Math.floor(total / 60) % 60, seconds: total % 60 };
}
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapsQuery)}`;
const stamp = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
export function googleCalendarUrl() {
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${stamp(event.start)}/${stamp(event.end)}`, ctz: event.timezone, location: event.venue, details: "Together with their families, Agar & Renas joyfully invite you to celebrate their engagement. End time is approximate." })}`;
}
const escapeIcs = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
export function calendarIcs() {
  // UTC timestamps prevent the receiving device from interpreting 7 PM as local time.
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Agar and Renas//Engagement Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT", "UID:agar-renas-engagement-20261202@invitation", "DTSTAMP:20261120T000000Z", `DTSTART:${stamp(event.start)}`, `DTEND:${stamp(event.end)}`, `SUMMARY:${escapeIcs(event.title)}`, `LOCATION:${escapeIcs(event.venue)}`, "DESCRIPTION:Join us to celebrate our engagement. End time is approximate.", "STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
}
