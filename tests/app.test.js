/** @jest-environment jsdom */

// Mock minimal DOM for testing
document.body.innerHTML = `
  <input id="api-key" value="test_api_key_1234567890">
`;

// Pure functions extracted/mocked from index.html for testing
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

function validateApiKey(key) {
    return !!(key && key.length >= 20);
}

function evaluateQuizAnswer(selectedIndex, correctIndex) {
    return selectedIndex === correctIndex ? 1 : 0;
}

function getPrompt(question, language) {
    return `User asks: "${question}". Respond in ${language}. Keep it concise, simple, and accurate regarding Indian elections.`;
}

function enforceLengthLimit(input, maxLength) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
}

describe('VoteIQ Utilities', () => {
  // sanitizeInput tests
  test('1. sanitizeInput should encode HTML entities', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  test('2. sanitizeInput should handle empty or null values gracefully', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('3. sanitizeInput should neutralize javascript URI schemes', () => {
    const payload = '<a href="javascript:alert(1)">Click</a>';
    const sanitized = sanitizeInput(payload);
    expect(sanitized).toBe('&lt;a href=&quot;javascript:alert(1)&quot;&gt;Click&lt;/a&gt;');
  });

  test('4. sanitizeInput should encode image error payloads', () => {
    const payload = '<img src=x onerror=alert(1)>';
    const sanitized = sanitizeInput(payload);
    expect(sanitized).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });

  // debounce tests
  test('5. debounce should only call function once within the wait period', () => {
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

  test('6. debounce should preserve context and arguments', () => {
    jest.useFakeTimers();
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn('test arg');
    jest.runAllTimers();
    expect(mockFn).toHaveBeenCalledWith('test arg');
    jest.useRealTimers();
  });

  // validateApiKey tests
  test('7. validateApiKey returns true for valid length key', () => {
    expect(validateApiKey('12345678901234567890')).toBe(true);
  });

  test('8. validateApiKey returns false for short keys', () => {
    expect(validateApiKey('123')).toBe(false);
  });

  test('9. validateApiKey returns false for empty keys', () => {
    expect(validateApiKey('')).toBe(false);
    expect(validateApiKey(null)).toBe(false);
  });

  // evaluateQuizAnswer tests
  test('10. evaluateQuizAnswer returns 1 for correct answer', () => {
    expect(evaluateQuizAnswer(2, 2)).toBe(1);
  });

  test('11. evaluateQuizAnswer returns 0 for incorrect answer', () => {
    expect(evaluateQuizAnswer(1, 2)).toBe(0);
  });

  test('12. evaluateQuizAnswer returns 0 for out of bounds answer', () => {
    expect(evaluateQuizAnswer(-1, 2)).toBe(0);
  });

  // getPrompt tests
  test('13. getPrompt should format English correctly', () => {
    const prompt = getPrompt('What is EVM?', 'English');
    expect(prompt).toContain('Respond in English');
    expect(prompt).toContain('What is EVM?');
  });

  test('14. getPrompt should format Hindi correctly', () => {
    const prompt = getPrompt('What is NOTA?', 'Hindi');
    expect(prompt).toContain('Respond in Hindi');
    expect(prompt).toContain('What is NOTA?');
  });

  // length limitation tests
  test('15. enforceLengthLimit should truncate strings exceeding maxLength', () => {
    expect(enforceLengthLimit('abcdefghij', 5)).toBe('abcde');
  });

  test('16. enforceLengthLimit should not truncate short strings', () => {
    expect(enforceLengthLimit('abc', 5)).toBe('abc');
  });

  test('17. enforceLengthLimit should trim whitespace before truncating', () => {
    expect(enforceLengthLimit('   abcde   ', 3)).toBe('abc');
  });
});
