
// Connexion à Supabase

import { createClient } from "@supabase/supabase-js";

// Récupération des informations depuis le fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Vérification de la configuration
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Configuration Supabase manquante. Vérifie le fichier .env.");
}

// Création du client Supabase
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
