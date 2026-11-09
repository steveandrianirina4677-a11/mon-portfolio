// Importation des modules nécessaires
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Chargement des variables d'environnement (.env ou Render)
dotenv.config();

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Autoriser les requêtes venant du frontend
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));

// Permettre à Express de lire les données JSON envoyées par React
app.use(express.json());

// Route d'accueil pour vérifier que le backend fonctionne
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend de mon portfolio opérationnel !"
    });
});

// Route pour recevoir et envoyer les messages du formulaire de contact
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

        // Préparation du message à envoyer avec l'API Brevo
        const emailData = {
            sender: {
                name: "Portfolio",
                email: process.env.EMAIL_USER
            },

            // Adresse qui recevra le message
            to: [
                {
                    email: process.env.EMAIL_USER
                }
            ],

            // Permet de répondre directement à la personne qui a écrit
            replyTo: {
                email: email
            },

            // Sujet du message
            subject: `Nouveau message de ${name}`,

            // Contenu du message
            textContent: `
Nom : ${name}
Email : ${email}

Message :
${message}
            `
        };

        // Envoi du message à Brevo par HTTPS
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

        // Vérification du résultat de l'envoi
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
        // Affichage de l'erreur en cas de problème
        console.error("Erreur d'envoi :", error);

        return res.status(500).json({
            success: false,
            message: "Impossible d'envoyer le message."
        });
    }
});

// Démarrage du serveur
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend démarré sur le port ${PORT}`);
});