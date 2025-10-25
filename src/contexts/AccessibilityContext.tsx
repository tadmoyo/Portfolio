import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AccessibilityState {
  theme: string;
  keyboardNav: boolean;
  monotone: boolean;
}

interface AccessibilityContextType {
  accessibility: AccessibilityState;
  setTheme: (theme: string) => void;
  setKeyboardNav: (enabled: boolean) => void;
  setMonotone: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    theme: "default",
    keyboardNav: false,
    monotone: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      setAccessibility(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify(accessibility)
    );
    applyAccessibilitySettings(accessibility);
  }, [accessibility]);

  const setTheme = (theme: string) => {
    setAccessibility((prev) => ({ ...prev, theme }));
  };

  const setKeyboardNav = (enabled: boolean) => {
    setAccessibility((prev) => ({ ...prev, keyboardNav: enabled }));
  };

  const setMonotone = (enabled: boolean) => {
    setAccessibility((prev) => ({ ...prev, monotone: enabled }));
  };

  const applyAccessibilitySettings = (settings: AccessibilityState) => {
    document.documentElement.setAttribute("data-theme", settings.theme);

    if (settings.monotone) {
      document.documentElement.classList.add("monotone-mode");
    } else {
      document.documentElement.classList.remove("monotone-mode");
    }

    if (settings.keyboardNav) {
      document.documentElement.classList.add("keyboard-nav-mode");
    } else {
      document.documentElement.classList.remove("keyboard-nav-mode");
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{ accessibility, setTheme, setKeyboardNav, setMonotone }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
};
