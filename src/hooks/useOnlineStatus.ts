import { useEffect, useState } from "react";

/**
 * Estado de ligação à rede do browser (`navigator.onLine`).
 * A lista e o balanço continuam a funcionar offline; só funcionalidades que
 * chamam APIs externas é que precisam de internet.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
