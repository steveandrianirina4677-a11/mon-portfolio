import { useState } from "react";
import { supabase } from "../lib/supabase";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
    const [session, setSession] = useState(null);

    // Si l'administrateur n'est pas connecté,
    // afficher la page de connexion.
    if (!session) {
        return <AdminLogin onLogin={setSession} />;
    }

    // Déconnexion de l'administrateur.
    async function handleLogout() {
        await supabase.auth.signOut();
        setSession(null);
    }

    return (
        <div>
            {/* Tableau de bord administrateur */}
            <AdminDashboard session={session} />

            {/* Bouton de déconnexion */}
            <div style={{
                textAlign: "center",
                padding: "25px"
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "12px 25px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Déconnexion
                </button>
            </div>
        </div>
    );
}