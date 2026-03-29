import { useEffect, useState } from "react";
import { AppListaCompras } from "./AppListaCompras";
import { PaginaVerSomenteLeitura } from "./components/PaginaVerSomenteLeitura";
import { extrairTokenVerDaHash } from "./utils/rotaVer";

export default function App() {
  const [verToken, setVerToken] = useState<string | null>(() =>
    extrairTokenVerDaHash(),
  );

  useEffect(() => {
    const sync = () => setVerToken(extrairTokenVerDaHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  if (verToken) {
    return (
      <PaginaVerSomenteLeitura
        token={verToken}
        onSair={() => {
          window.location.hash = "";
          setVerToken(null);
        }}
      />
    );
  }

  return <AppListaCompras />;
}
