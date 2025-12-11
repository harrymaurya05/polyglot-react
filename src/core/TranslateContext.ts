import { createContext } from "react";
import type { TranslateContextValue } from "../types";

export const TranslateContext = createContext<TranslateContextValue | null>(
  null
);
