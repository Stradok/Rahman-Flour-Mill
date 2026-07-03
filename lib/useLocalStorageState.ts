"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { readStorage, writeStorage } from "./storage";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const hydrated = useRef(false);

  useEffect(() => {
    setState(readStorage(key, initialValue));
    hydrated.current = true;
    // only run once, on mount, to hydrate from localStorage after SSR paint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState];
}
