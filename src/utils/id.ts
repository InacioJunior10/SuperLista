/** Id local único o bastante para offline-first (timestamp + aleatório). */
export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
