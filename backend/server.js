
// ==========================================
// IMPORTATION DES MODULES
// ==========================================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Chargement des variables d'environnement
dotenv.config();

// ==========================================
// CRÉATION DU SERVEUR
// ==========================================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CONFIGURATION CORS
// ==========================================

// Autoriser le frontend local et le site hébergé
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins
}));

// Autoriser les données JSON
app.use(express.json());

// ==========================================
// CONFIGURATION DE GMAIL
// ==========================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// ROUTE DE TEST DU BACKEND
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend de mon portfolio opérationnel !"
    });
});

// ==========================================
// ROUTE DU FORMULAIRE DE CONTACT
// ==========================================

app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Vérification des champs obligatoires
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Veuillez remplir tous les champs."
            });
        }

        // Vérification de la configuration Gmail
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({
                success: false,
                message: "Le service email n'est pas configuré."
            });
        }

        // Préparation de l'email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            replyTo: email,
            to: process.env.EMAIL_USER,
            subject: `Nouveau message de ${name}`,
            text: `
Nom : ${name}
Email : ${email}

Message :
${message}
            `
        });

        // Réponse en cas de succès
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

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend démarré sur le port ${PORT}`);
});
