/**
 * Text and pure helpers for the data charts on the data hub pages. Every
 * number comes from the API or src/data; unit tests: charts.test.ts.
 */
import type { Locale } from '@/lib/i18n/locale';

/** "85 lakhs - 3.5 crore", "12,000 - 1 lakh/month", "1.5 - 6 crore" -> [low, high] in rupees. */
export function parseRange(raw: string): [number, number] | null {
  const clean = raw.replace(/\/month/i, '').replace(/,/g, '').trim();
  const m = clean.match(/^([\d.]+)\s*(lakhs?|crores?)?\s*-\s*([\d.]+)\s*(lakhs?|crores?)?$/i);
  if (!m) return null;
  const unit = (u?: string) => (!u ? 1 : /^crore/i.test(u) ? 1e7 : 1e5);
  const hiUnit = unit(m[4]);
  // "1.5 - 6 crore": the low end shares the unit of the high end. "12,000 - 1 lakh": it is in rupees.
  const loUnit = m[2] ? unit(m[2]) : m[4] && Number(m[1]) < Number(m[3]) ? hiUnit : 1;
  const lo = Number(m[1]) * loUnit;
  const hi = Number(m[3]) * hiUnit;
  return Number.isFinite(lo) && Number.isFinite(hi) && lo > 0 && hi >= lo ? [lo, hi] : null;
}

/** Median of numbers (sorted copy). */
export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** A round number at or above `n`, on steps of 1, 2 or 5 x 10^k. */
export function niceCeil(n: number): number {
  if (!(n > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(n));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * p >= n) return k * p;
  return 10 * p;
}

/** Log-scale position 0..1 of `v` between `lo` and `hi`. */
export const logPos = (v: number, lo: number, hi: number) => (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo));

const en = {
  skyTitle: 'How the sectors compare',
  skyLead: (n: number, type: string) => `The ${type.toLowerCase()} circle rate of all ${n} sectors, highest first.`,
  skyLeadCompare: (n: number, type: string, other: string) =>
    `The ${type.toLowerCase()} circle rate of all ${n} sectors, highest first. A dark tick marks the ${other.toLowerCase()} rate of the same sector.`,
  skyRate: (type: string) => `${type} rate`,
  skyTick: (type: string) => `${type} rate`,
  skyHighest: 'Highest',
  skyMedian: 'Middle',
  skyLowest: 'Lowest',
  skyRank: (sector: string, below: number, others: number) =>
    below === others ? `${sector} has the highest rate of all ${others + 1} sectors.` : below === 0 ? `${sector} has the lowest rate of all ${others + 1} sectors.` : `${sector} is higher than ${below} of the other ${others} sectors.`,
  perSqyd: 'per sq yd',
  source: (year: number | null, date: string | null) =>
    `Source: IGRS Haryana${year ? `, ${year} revision` : ''}${date ? `, in force from ${date}` : ''}, from the 360Ghar data hub.`,
  reraTitle: 'Where the projects stand',
  reraLead: (n: number) => `Status of all ${n} projects in the register.`,
  reraSource: (date: string | null) => `Source: HRERA Gurugram register, from the 360Ghar data hub${date ? `, updated ${date}` : ''}.`,
  piChart: 'Price ranges, low to high',
  piBuy: 'To buy',
  piRent: 'To rent, per month',
  piScale: 'The scale grows by ten times at each mark, so small and large ranges both fit.',
  piSource: (city: string) => `Source: 360Ghar price data for ${city}, May 2026. Ranges, not averages.`,
};

type Text = typeof en;

const hi: Text = {
  skyTitle: 'सेक्टरों की तुलना',
  skyLead: (n, type) => `सभी ${n} सेक्टरों का ${type} सर्कल रेट, सबसे ऊँचे से शुरू।`,
  skyLeadCompare: (n, type, other) => `सभी ${n} सेक्टरों का ${type} सर्कल रेट, सबसे ऊँचे से शुरू। गहरा निशान उसी सेक्टर का ${other} रेट दिखाता है।`,
  skyRate: (type) => `${type} रेट`,
  skyTick: (type) => `${type} रेट`,
  skyHighest: 'सबसे ऊँचा',
  skyMedian: 'बीच का',
  skyLowest: 'सबसे कम',
  skyRank: (sector, below, others) =>
    below === others ? `${sector} का रेट सभी ${others + 1} सेक्टरों में सबसे ऊँचा है।` : below === 0 ? `${sector} का रेट सभी ${others + 1} सेक्टरों में सबसे कम है।` : `${sector} का रेट बाकी ${others} में से ${below} सेक्टरों से ऊँचा है।`,
  perSqyd: 'प्रति वर्ग गज',
  source: (year, date) => `स्रोत: IGRS हरियाणा${year ? `, ${year} संशोधन` : ''}${date ? `, ${date} से लागू` : ''}, 360Ghar डेटा हब से।`,
  reraTitle: 'प्रोजेक्ट किस स्थिति में हैं',
  reraLead: (n) => `रजिस्टर के सभी ${n} प्रोजेक्ट की स्थिति।`,
  reraSource: (date) => `स्रोत: HRERA गुरुग्राम रजिस्टर, 360Ghar डेटा हब से${date ? `, ${date} को अपडेट` : ''}।`,
  piChart: 'कीमत की रेंज, कम से ज़्यादा',
  piBuy: 'खरीदने के लिए',
  piRent: 'किराये पर, प्रति माह',
  piScale: 'हर निशान पर पैमाना दस गुना बढ़ता है, ताकि छोटी और बड़ी रेंज दोनों दिखें।',
  piSource: (city) => `स्रोत: ${city} के लिए 360Ghar कीमत डेटा, मई 2026। ये रेंज हैं, औसत नहीं।`,
};

export const chartText = (locale: Locale): Text => (locale === 'hi' ? hi : en);
