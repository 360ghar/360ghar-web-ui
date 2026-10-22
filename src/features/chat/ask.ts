/** Remembers, for this visit, that the backend rejected `context` (it is older than the site). */
let unsupported = false;
export const contextUnsupported = () => unsupported;
export const markContextUnsupported = () => {
  unsupported = true;
};
