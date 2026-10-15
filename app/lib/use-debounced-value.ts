import { useEffect, useState } from "react";

// Returns `value` once it has stopped changing for `delayMs`, so typing in a search box
// does not fire a server query on every keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
