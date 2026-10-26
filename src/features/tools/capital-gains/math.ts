/** 2024 -> "2024-25". */
export const fyLabel = (fy: number) => `${fy}-${String((fy + 1) % 100).padStart(2, '0')}`;

/** Sale price minus purchase price and transfer expenses; this is not a tax calculation. */
export const preTaxGain = (sale: number, purchase: number, expenses: number) => sale - purchase - expenses;
