/**
 * Landmark marks in the house "knife-cut" style (src/ui/icons/paths.ts):
 * straight cuts only, holes where the paper falls out, a 24 x 24 grid.
 */
const ring = (p: number[]) => `M${p.map((v, i) => (i % 2 ? `${v}` : `${i ? 'L' : ''}${v} `)).join('')}Z`;
const rect = (x1: number, y1: number, x2: number, y2: number) => ring([x1, y1, x2, y1, x2, y2, x1, y2]);

export const LANDMARK_GLYPH: Record<string, string> = {
  // Train front with two windows, two lamps and the rails below.
  metro:
    ring([6.5, 2.5, 17.5, 2.5, 20, 5.5, 20, 17, 17.5, 19, 6.5, 19, 4, 17, 4, 5.5]) +
    rect(6.5, 5.8, 11.2, 10.8) +
    rect(12.8, 5.8, 17.5, 10.8) +
    rect(7, 13.6, 9.2, 15.8) +
    rect(14.8, 13.6, 17, 15.8) +
    ring([7.4, 19.8, 9.6, 19.8, 7.8, 22.5, 5.4, 22.5]) +
    ring([14.4, 19.8, 16.6, 19.8, 18.6, 22.5, 16.2, 22.5]),
  // A plus cut from one sheet.
  hospital: ring([9, 2.8, 15, 2.8, 15, 9, 21.2, 9, 21.2, 15, 15, 15, 15, 21.2, 9, 21.2, 9, 15, 2.8, 15, 2.8, 9, 9, 9]),
  // Shop front with a scalloped awning.
  market:
    ring([2.5, 3.5, 21.5, 3.5, 21.5, 8.6, 19.6, 10.6, 17.7, 8.6, 15.8, 10.6, 13.9, 8.6, 12, 10.6, 10.1, 8.6, 8.2, 10.6, 6.3, 8.6, 4.4, 10.6, 2.5, 8.6]) +
    ring([4, 11.8, 20, 11.8, 20, 21, 4, 21]) +
    rect(10, 14.6, 14, 21),
  // A road going away, with lane dashes.
  road: ring([9.2, 2.8, 14.8, 2.8, 21.2, 21.2, 2.8, 21.2]) + rect(11.3, 5.4, 12.7, 8.4) + rect(11.1, 10.6, 12.9, 14) + rect(10.8, 16.2, 13.2, 20),
  // Office tower with window rows.
  commercial: ring([6, 2.5, 18, 2.5, 18, 21.5, 6, 21.5]) + rect(8.4, 5, 10.8, 7.2) + rect(13.2, 5, 15.6, 7.2) + rect(8.4, 9.6, 10.8, 11.8) + rect(13.2, 9.6, 15.6, 11.8) + rect(8.4, 14.2, 10.8, 16.4) + rect(13.2, 14.2, 15.6, 16.4) + rect(10.6, 18.4, 13.4, 21.5),
};
LANDMARK_GLYPH.mall = LANDMARK_GLYPH.market!;

export const LANDMARK_TYPE: Record<string, [string, string]> = {
  metro: ['Metro', 'मेट्रो'],
  hospital: ['Hospital', 'अस्पताल'],
  market: ['Market', 'बाज़ार'],
  mall: ['Mall', 'मॉल'],
  road: ['Road', 'सड़क'],
  commercial: ['Offices', 'ऑफ़िस'],
};
