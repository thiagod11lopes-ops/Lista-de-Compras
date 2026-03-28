import { Component, type ErrorInfo, type ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state = { message: null as string | null };

  static getDerivedStateFromError(err: Error) {
    return { message: err.message || String(err) };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error(err, info.componentStack);
  }

  render() {
    if (this.state.message) {
      return (
        <div
          style={{
            padding: "1.5rem",
            fontFamily: "system-ui, sans-serif",
            maxWidth: "32rem",
            margin: "2rem auto",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            Algo deu errado ao carregar o app
          </h1>
          <p style={{ color: "#475569", marginBottom: "1rem" }}>
            Copie a mensagem abaixo se precisar de ajuda. Tente atualizar a
            página ou limpar os dados do site nas configurações do navegador.
          </p>
          <pre
            style={{
              background: "#f1f5f9",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflow: "auto",
              fontSize: "0.875rem",
            }}
          >
            {this.state.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("app");
if (!root) throw new Error("Elemento #app não encontrado");

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
