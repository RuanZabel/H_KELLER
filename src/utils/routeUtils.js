export function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`;
}
