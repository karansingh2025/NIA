import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface MonochromeContextValue {
  isMonochrome: boolean;
  toggleMonochrome: () => void;
  setMonochrome: (value: boolean) => void;
}

const MonochromeContext = createContext<MonochromeContextValue | undefined>(
  undefined
);

export const useMonochrome = (): MonochromeContextValue => {
  const ctx = useContext(MonochromeContext);
  if (!ctx)
    throw new Error("useMonochrome must be used within MonochromeProvider");
  return ctx;
};

const STORAGE_KEY = "monochrome-theme";

export const MonochromeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMonochrome, setIsMonochrome] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isMonochrome));
    } catch {}

    const html = document.documentElement;
    if (isMonochrome) html.classList.add("monochrome");
    else html.classList.remove("monochrome");
  }, [isMonochrome]);

  const value = useMemo(
    () => ({
      isMonochrome,
      toggleMonochrome: () => setIsMonochrome((v) => !v),
      setMonochrome: setIsMonochrome,
    }),
    [isMonochrome]
  );

  return (
    <MonochromeContext.Provider value={value}>
      {children}
    </MonochromeContext.Provider>
  );
};
