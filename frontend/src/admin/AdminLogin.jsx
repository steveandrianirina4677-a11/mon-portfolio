
import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./AdminLogin.css";

// Adresse du backend local.
// Nous configurerons l'adresse de production ensuite.
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminLogin({ onLogin }) {
  // Informations saisies dans le formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Gestion du chargement et des erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Connexion de l'administrateur
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Connexion avec Supabase Auth
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        throw new Error("Adresse e-mail ou mot de passe incorrect.");
      }

      // 2. Récupération du jeton de connexion
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("Impossible de récupérer le jeton de connexion.");
      }

      // 3. Vérification de l'identité par le backend
      const response = await fetch(
        `${API_URL}/api/creative-break/admin/check`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Déconnexion si le compte n'est pas autorisé
        await supabase.auth.signOut();

        throw new Error(
          result.message || "Accès administrateur refusé."
        );
      }

      // 4. Connexion validée
      if (onLogin) {
        onLogin({
          user: data.user,
          session: data.session,
        });
      }
    } catch (err) {
      setError(
        err.message || "Une erreur est survenue pendant la connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-icon">
          🔐
        </div>

        <h1>Espace administrateur</h1>

        <p className="admin-login-description">
          Connectez-vous pour gérer vos rendez-vous Creative Break.
        </p>

        <form onSubmit={handleLogin}>

          <div className="admin-form-group">
            <label htmlFor="admin-email">
              Adresse e-mail
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">
              Mot de passe
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>

        </form>

        <p className="admin-login-footer">
          Accès réservé à l'administrateur.
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;
