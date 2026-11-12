
// ============================================
// 1. IMPORTATION DES MODULES
// ============================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Chargement des variables d'environnement
dotenv.config();

// ============================================
// 2. CONFIGURATION DU SERVEUR
// ============================================

const app = express();
const PORT = process.env.PORT || 5000;

// Autorisation du frontend React
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));

// Autoriser Express à recevoir du JSON
app.use(express.json());

// ============================================
// 3. CONNEXION À SUPABASE
// ============================================

// Récupération des informations depuis Render
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

// Création du client Supabase uniquement
// si les deux variables sont disponibles
const supabase = SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
    : null;

// ============================================
// 4. ROUTE D'ACCUEIL
// ============================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend de mon portfolio opérationnel !"
    });
});

// ============================================
// 5. TEST DE CONNEXION À SUPABASE
// ============================================

app.get("/api/creative-break/health", async (req, res) => {
    try {

        // Vérifier que Supabase est configuré
        if (!supabase) {
            return res.status(503).json({
                success: false,
                message: "La connexion Supabase n'est pas configurée."
            });
        }

        // Tester la lecture de la table des paramètres
        const { data, error } = await supabase
            .from("professional_settings")
            .select("professional_status, timezone")
            .limit(1)
            .maybeSingle();

        // Vérifier les erreurs Supabase
        if (error) {
            console.error("Erreur Supabase :", error);

            return res.status(500).json({
                success: false,
                message: "Impossible de communiquer avec Supabase."
            });
        }

        // Connexion réussie
        return res.json({
            success: true,
            message: "Connexion à Supabase réussie !",
            settings: data
        });

    } catch (error) {

        console.error("Erreur de connexion :", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors du test de connexion."
        });
    }
});

// ============================================
// 6. FORMULAIRE DE CONTACT AVEC BREVO
// ============================================

app.post("/api/contact", async (req, res) => {
    try {

        // Récupération des informations du formulaire
        const { name, email, message } = req.body;

        // Vérification des champs obligatoires
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Veuillez remplir tous les champs."
            });
        }

        // Vérification de la configuration Brevo
        if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
            return res.status(500).json({
                success: false,
                message: "Le service email n'est pas configuré."
            });
        }

        // Préparation du message
        const emailData = {
            sender: {
                name: "Portfolio",
                email: process.env.EMAIL_USER
            },

            to: [
                {
                    email: process.env.EMAIL_USER
                }
            ],

            replyTo: {
                email: email
            },

            subject: `Nouveau message de ${name}`,

            textContent: `
Nom : ${name}
Email : ${email}

Message :
${message}
            `
        };

        // Envoi du message à Brevo
        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },

                body: JSON.stringify(emailData)
            }
        );

        // Récupération de la réponse de Brevo
        const result = await response.json();

        // Vérification du résultat
        if (!response.ok) {
            console.error("Erreur Brevo :", result);

            return res.status(500).json({
                success: false,
                message: "Brevo n'a pas pu envoyer le message."
            });
        }

        // Confirmation de l'envoi
        return res.json({
            success: true,
            message: "Votre message a été envoyé avec succès !"
        });

    } catch (error) {

        console.error("Erreur d'envoi :", error);

        return res.status(500).json({
            success: false,
            message: "Impossible d'envoyer le message."
        });
    }
});

// ============================================
// 7. DÉMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend démarré sur le port ${PORT}`);
});
