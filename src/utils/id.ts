export function generateGroupId(): string {
  return 'g' + Math.random().toString(16).slice(2) + Date.now().toString(16);
}
