// Full static generation: every page prerendered, trailing slashes so hosts
// serve `<route>/index.html` (e.g. /frontend/react/x/ → /frontend/react/x/index.html).
export const prerender = true;
export const trailingSlash = 'always';