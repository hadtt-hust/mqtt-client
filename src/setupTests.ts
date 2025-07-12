import "@testing-library/jest-dom";

// Suppress React warnings about act(...)
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    (typeof args[0] === "string" &&
      args[0].includes("Warning: An update to") &&
      args[0].includes("was not wrapped in act(...)")) ||
    args[0].includes("Warning: ReactDOM.render is no longer supported")
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("Warning: ReactDOM.render is no longer supported")) {
    return;
  }
  originalWarn.call(console, ...args);
};

