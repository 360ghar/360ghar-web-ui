/** Historical Cost Inflation Index values retained for the informational table. */
export const CII: Record<number, number> = {
  2001: 100,
  2002: 105,
  2003: 109,
  2004: 113,
  2005: 117,
  2006: 122,
  2007: 129,
  2008: 137,
  2009: 148,
  2010: 167,
  2011: 184,
  2012: 200,
  2013: 220,
  2014: 240,
  2015: 254,
  2016: 264,
  2017: 272,
  2018: 280,
  2019: 289,
  2020: 301,
  2021: 317,
  2022: 331,
  2023: 348,
  2024: 363,
  2025: 376,
};

export const LATEST_CII_FY = 2025;

/** 2024 -> "2024-25". */
export const fyLabel = (fy: number) => `${fy}-${String((fy + 1) % 100).padStart(2, '0')}`;

/** Sale price minus purchase price and transfer expenses; this is not a tax calculation. */
export const preTaxGain = (sale: number, purchase: number, expenses: number) => sale - purchase - expenses;
