export const homeRouteRegex = /^\/(?:\?.*)?$/gm;
export const albumRouteRegex = /^\/albums\/\d+(?:\?.*)?$/gm;
export const imageRouteRegex = /^\/images\/\d+(?:\?.*)?$/gm;
export const knownRoutesRegex = /^\/(?:|albums\/\d+|images\/\d+)(?:\?.*)?$/gm; // Routes: /, /albums/:id, /images/:id
