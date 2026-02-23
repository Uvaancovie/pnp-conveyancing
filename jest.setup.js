// Add custom matchers
expect.extend({
  toBeCloseTo(received, expected, precision = 2) {
    const pass = Math.abs(received - expected) < Math.pow(10, -precision) / 2;
    return {
      pass,
      message: () => `expected ${received} to be close to ${expected} (precision: ${precision})`,
    };
  },
});

// Mock console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};