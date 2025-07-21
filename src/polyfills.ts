declare global {
  interface Set<T> {
    difference(other: Set<T>): Set<T>;
  }
}

// Polyfill for Set.prototype.difference
// provides the difference method for Set objects in unsupported environments.
if (!Set.prototype.difference) {
  Object.defineProperty(Set.prototype, "difference", {
    value: function (other: Set<any>) {
      const result = new Set();
      for (const value of this) {
        if (!other.has(value)) result.add(value);
      }
      return result;
    },
    writable: true,
    configurable: true,
  });
}

export {};
