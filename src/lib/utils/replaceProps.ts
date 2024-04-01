export default function replaceProps<T, U>(existing: T, replace: U): T {
  return { ...existing, ...replace };
}
