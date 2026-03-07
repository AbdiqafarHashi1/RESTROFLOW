export function generateOrderNumber(seq: number) {
  return `BEX-${String(seq).padStart(6, '0')}`;
}
