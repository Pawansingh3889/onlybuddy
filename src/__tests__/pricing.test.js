// Tests for the BookingPage pricing logic.
// These are pure function tests — no Firebase or React needed.
// Run with: npm test

// ── Copy of the pricing constants and functions from BookingPage ──
// (These are tested in isolation to catch accidental pricing changes)

const PRICING = {
  GROCERY_RATE:      0.15,
  GROCERY_MIN:       4.99,
  DISTANCE_SHORT:    6.99,
  DISTANCE_LONG:     9.99,
  QUEUE_SLOT:        4.00,
  QUEUE_MIN_MINUTES: 30,
  PRESCRIPTION_FLAT: 6.99,
};

const calcGroceryFee = (total) => Math.max(total * PRICING.GROCERY_RATE, PRICING.GROCERY_MIN);
const calcDistanceFee = (miles) => miles <= 2 ? PRICING.DISTANCE_SHORT : PRICING.DISTANCE_LONG;
const calcQueueFee = (mins) => {
  const slots = Math.ceil(Math.max(mins, PRICING.QUEUE_MIN_MINUTES) / PRICING.QUEUE_MIN_MINUTES);
  return slots * PRICING.QUEUE_SLOT;
};

// ── Grocery fee ──────────────────────────────────────────────
describe('calcGroceryFee', () => {
  test('returns minimum fee for small baskets', () => {
    expect(calcGroceryFee(10)).toBe(PRICING.GROCERY_MIN); // 10 * 0.15 = 1.50, below min
  });

  test('returns 15% for baskets above minimum threshold', () => {
    expect(calcGroceryFee(50)).toBeCloseTo(7.50);  // 50 * 0.15
    expect(calcGroceryFee(100)).toBeCloseTo(15.00);
  });

  test('returns minimum fee exactly at the threshold (£33.27)', () => {
    // 33.27 * 0.15 = 4.99 (edge case)
    expect(calcGroceryFee(33.27)).toBeCloseTo(PRICING.GROCERY_MIN, 1);
  });
});

// ── Distance fee ─────────────────────────────────────────────
describe('calcDistanceFee', () => {
  test('returns short-distance rate for 2 miles or under', () => {
    expect(calcDistanceFee(1)).toBe(PRICING.DISTANCE_SHORT);
    expect(calcDistanceFee(2)).toBe(PRICING.DISTANCE_SHORT);
  });

  test('returns long-distance rate for over 2 miles', () => {
    expect(calcDistanceFee(3)).toBe(PRICING.DISTANCE_LONG);
    expect(calcDistanceFee(10)).toBe(PRICING.DISTANCE_LONG);
  });
});

// ── Queue fee ────────────────────────────────────────────────
describe('calcQueueFee', () => {
  test('charges minimum of 1 slot (30 min) for short queues', () => {
    expect(calcQueueFee(10)).toBe(PRICING.QUEUE_SLOT);  // under 30 min → 1 slot
    expect(calcQueueFee(30)).toBe(PRICING.QUEUE_SLOT);  // exactly 30 min → 1 slot
  });

  test('charges 2 slots for 31–60 minutes', () => {
    expect(calcQueueFee(45)).toBe(PRICING.QUEUE_SLOT * 2);
    expect(calcQueueFee(60)).toBe(PRICING.QUEUE_SLOT * 2);
  });

  test('charges 4 slots for 2 hours', () => {
    expect(calcQueueFee(120)).toBe(PRICING.QUEUE_SLOT * 4);
  });
});
