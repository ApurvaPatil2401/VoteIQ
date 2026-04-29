/** @jest-environment jsdom */
// Mock minimal DOM for testing
document.body.innerHTML = `
  <input id="api-key" value="test_api_key_1234567890">
`;

// Simple utility functions to test (these will be in index.html, but we mock them here for testing the logic)
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

describe('VoteIQ Utilities', () => {
  test('sanitizeInput should encode HTML entities', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  test('sanitizeInput should handle empty or null values gracefully', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('debounce should only call function once within the wait period', () => {
    jest.useFakeTimers();
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toBeCalled();

    jest.runAllTimers();

    expect(mockFn).toBeCalledTimes(1);
    jest.useRealTimers();
  });
});
