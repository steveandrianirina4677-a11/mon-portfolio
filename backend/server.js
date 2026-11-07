
// Importation des modules nécessaires
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Chargement des variables du fichier .env
dotenv.config();

// Création de l'application Express
const app = express();

// Autoriser React à communiquer avec le backend
app.use(cors({
    origin: "http://localhost:5173"
}));

// Autoriser la réception des données JSON
app.use(express.json());

// Configuration du port
const PORT = process.env.PORT || 5000;

// Configuration de Gmail avec Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Vérifier la connexion Gmail
transporter.verify((error) => {
    if (error) {
        console.error("Erreur de connexion Gmail :", error.message);
    } else {
        console.log("Connexion Gmail réussie !");
    }
});

// Route de réception du formulaire de contact
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Vérifier les champs obligatoires
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Veuillez remplir tous les champs."
            });
        }

        // Préparer et envoyer l'e-mail
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

        res.json({
            success: true,
            message: "Votre message a été envoyé avec succès !"
        });

    } catch (error) {
        console.error("Erreur d'envoi :", error);

        res.status(500).json({
            success: false,
            message: "Impossible d'envoyer le message."
        });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Backend démarré sur http://localhost:${PORT}`);
});
