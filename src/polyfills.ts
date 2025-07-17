declare global {
  interface Set<T> {
    difference(other: Set<T>): Set<T>;
  }
}

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
