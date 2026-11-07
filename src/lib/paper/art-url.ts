/**
 * URLs of the cached paper-art files served by src/pages/art/[kind]/[name].svg.ts
 * (and src/pages/art/map/[id].svg.ts). Build every art <img> src here, so the
 * URL shape lives in one place. The route's getStaticPaths lists these files.
 */
export const artUrl = {
  scene: (name: string) => `/art/scene/${name}.svg`,
  home: (name: string, bare = false) => `/art/home/${name}${bare ? '-bare' : ''}.svg`,
  vignette: (theme: string, seed: string) => `/art/vignette/${theme}-${seed}.svg`,
  skyline: (where: 'footer' | 'menu') => `/art/skyline/${where}.svg`,
  map: (id: number | string) => `/art/map/${id}.svg`,
};
