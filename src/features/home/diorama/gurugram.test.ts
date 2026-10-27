import { describe, expect, it } from 'vitest';
import { gurugramLayers } from './gurugram';

const GOLDEN_IDS = [
  'sunHalo',
  'sun',
  'haze',
  'ridge',
  'clouds',
  'towersFar',
  'towersMid',
  'towersNear',
  'birds',
  'kite',
  'litWindow',
  'blocks',
  'litWindowFrame',
  'metro',
  'trainBody',
  'trainAccent',
  'kiteString',
  'street',
  'blossoms',
  'kerb',
];

describe('gurugramLayers', () => {
  it('builds the Golden Hour scene in layer order', () => {
    expect(gurugramLayers().map((layer) => layer.id)).toEqual(GOLDEN_IDS);
  });

  it('gives every layer a unique id', () => {
    const ids = gurugramLayers().map((layer) => layer.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the apartment cutouts and the lit-window frame', () => {
    const byId = new Map(gurugramLayers().map((layer) => [layer.id, layer]));
    expect(byId.get('blocks')?.cut).toHaveLength(9);
    expect(byId.get('litWindowFrame')?.cut).toHaveLength(1);
  });

  it('puts a paper rim on the nearest sheets', () => {
    const byId = new Map(gurugramLayers().map((layer) => [layer.id, layer]));
    expect(byId.get('street')?.rim).toBe(true);
    expect(byId.get('trainBody')?.rim).toBe(true);
  });

  it('caches the scene', () => {
    expect(gurugramLayers()).toBe(gurugramLayers());
  });
});
