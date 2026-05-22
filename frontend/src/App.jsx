import { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

function App() {
  // Auth
  const [utente, setUtente] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginNome, setLoginNome] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Valuation
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("buono");
  const [imageBase64, setImageBase64] = useState("");
  const [imageMimeType, setImageMimeType] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageSource, setImageSource] = useState("file"); // "file" | "camera"
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // History
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lookbook_utente");
    if (saved) setUtente(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (utente && showHistory) fetchHistory();
  }, [utente, showHistory]);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, nome: loginNome }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Errore durante il login.");
        return;
      }
      localStorage.setItem("lookbook_utente", JSON.stringify(data));
      setUtente(data);
    } catch {
      setLoginError("Impossibile connettersi al server. Riprova.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lookbook_utente");
    setUtente(null);
    setLoginEmail("");
    setLoginNome("");
    handleReset();
    setHistory([]);
    setShowHistory(false);
  };

  // History
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/history/${utente.email}`);
      const data = await res.json();
      if (res.ok) setHistory(data);
    } catch {
      // silenzioso
    }
  };

  // Valuation
  const handleReset = () => {
    setCategory("");
    setBrand("");
    setStatus("buono");
    setImageBase64("");
    setImageMimeType("");
    setPreviewUrl("");
    setResult(null);
    setError("");
    setImageSource("file");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageBase64("");
      setImageMimeType("");
      setPreviewUrl("");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato non supportato. Usa JPG, PNG, WEBP o GIF.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Immagine troppo grande. Massimo 5MB.");
      e.target.value = "";
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      const fullDataUrl = reader.result;
      const [meta, base64] = fullDataUrl.split(",");
      const mimeMatch = meta.match(/data:(.*);base64/);
      setImageBase64(base64);
      setImageMimeType(mimeMatch ? mimeMatch[1] : "image/jpeg");
      setPreviewUrl(fullDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !brand || !status || !imageBase64) {
      setError("Compila tutti i campi e seleziona un'immagine.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          brand,
          status,
          imageBase64,
          imageMimeType,
          email: utente.email,
        }),
      });
      const rawText = await response.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error(`Risposta non valida: ${rawText || "vuota"}`);
      }
      if (!response.ok)
        throw new Error(data?.error || `Errore HTTP ${response.status}`);
      if (data?.error_non_clothing) {
        setError(data.motivation);
        return;
      }
      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Non è stato possibile completare la valutazione. Riprova.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Login screen
  if (!utente) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>
            ♻️ LookBook <span>AI</span>
          </h1>
          <p>Scopri il valore dei tuoi capi usati in pochi secondi.</p>
        </header>

        <div className="login-wrapper">
          <form onSubmit={handleLogin} className="card login-card">
            <h2>Accedi o registrati</h2>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="mario@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Nome</label>
              <input
                type="text"
                placeholder="Mario"
                value={loginNome}
                onChange={(e) => setLoginNome(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loginLoading}
            >
              {loginLoading ? "Accesso in corso..." : "Entra →"}
            </button>

            {loginError && <p className="error-text">{loginError}</p>}
            <p className="login-hint">
              Prima volta? Il tuo account viene creato automaticamente.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Main
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          ♻️ LookBook <span>AI</span>
        </h1>
        <p
          style={{
            margin: "8px 0 4px",
            fontSize: "1rem",
            color: "var(--text-2)",
            textAlign: "center",
          }}
        >
          Ciao, <strong style={{ color: "var(--text)" }}>{utente.nome}</strong>{" "}
          👋
        </p>
        <div className="user-bar">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="submit-btn btn-sm btn-ghost"
          >
            {showHistory ? "← Valutazione" : "📋 Cronologia"}
          </button>
          <button
            onClick={handleLogout}
            className="submit-btn btn-sm btn-ghost"
          >
            Esci
          </button>
        </div>
      </header>

      {/* History */}
      {showHistory && (
        <div className="card" style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2>Le tue valutazioni</h2>
          {history.length === 0 ? (
            <p className="empty-text">Nessuna valutazione ancora.</p>
          ) : (
            <ul className="history-list">
              {[...history].reverse().map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-item-header">
                    <span className="history-item-brand">
                      {item.inputs.brand} — {item.inputs.category}
                    </span>
                    <span className="history-item-price">
                      {item.evaluation.suggested_price}€
                    </span>
                  </div>
                  <div className="history-item-meta">
                    {item.inputs.status} &nbsp;·&nbsp;{" "}
                    {item.evaluation.range?.min}€ – {item.evaluation.range?.max}
                    € &nbsp;·&nbsp;{" "}
                    {new Date(item.timestamp).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Valuation */}
      {!showHistory && (
        <div className="grid-layout">
          <form onSubmit={handleSubmit} className="card">
            <h2>Nuova valutazione</h2>

            <div className="input-group">
              <label>Categoria</label>
              <input
                type="text"
                value={category}
                placeholder="Es. Jeans, Giubbotto, Scarpe"
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Brand</label>
              <input
                type="text"
                placeholder="Es. Nike, Zara, Pull&Bear"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Stato</label>
              <div className="pill-toggle">
                {[
                  { value: "nuovo", label: "Nuovo" },
                  { value: "buono", label: "Buono" },
                  { value: "usato", label: "Usato" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={
                      status === opt.value
                        ? "toggle-option active"
                        : "toggle-option"
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Foto del capo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>

            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Anteprima" />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Analisi in corso..." : "Valuta capo →"}
            </button>

            {error && <p className="error-text">{error}</p>}
          </form>

          <section className="result-panel">
            <h2>Valutazione</h2>

            {loading && (
              <div className="status-message">
                <p>🔄 L&apos;AI sta analizzando il tuo capo...</p>
              </div>
            )}

            {!loading && !result && (
              <p className="empty-text">
                Compila il form e carica una foto per ottenere la valutazione.
              </p>
            )}

            {!loading && result && (
              <div className="result-content">
                <div className="price-box">
                  <span className="price-label">Prezzo consigliato</span>
                  <span className="price-value">{result.suggested_price}€</span>
                  <p className="price-range">
                    Range:{" "}
                    <strong>
                      {result.range?.min}€ – {result.range?.max}€
                    </strong>
                  </p>
                </div>

                <div className="info-section">
                  <h3>Analisi</h3>
                  <p>{result.motivation}</p>
                </div>

                <div className="info-section">
                  <h3>Consigli per vendere</h3>
                  <ul>
                    {result.selling_tips?.map((tip, i) => (
                      <li key={i}>💡 {tip}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleReset}
                  className="submit-btn btn-ghost"
                  style={{ marginTop: "4px" }}
                >
                  ♻️ Nuova valutazione
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
