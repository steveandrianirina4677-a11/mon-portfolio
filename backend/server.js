
/* ============================================
   1. IMPORTATION DES MODULES
============================================ */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

dotenv.config();

/* ============================================
   2. CONFIGURATION DU SERVEUR
============================================ */

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

/* ============================================
   3. CONNEXION À SUPABASE
============================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

// Clé secrète utilisée uniquement côté backend
const supabase = SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
    : null;

const DEFAULT_TIMEZONE = "Indian/Antananarivo";
const BOOKING_DURATION = 30;

/* ============================================
   4. FONCTIONS UTILITAIRES
============================================ */

// Vérifier la connexion Supabase
function checkSupabase(res) {
    if (!supabase) {
        res.status(503).json({
            success: false,
            message: "La connexion Supabase n'est pas configurée."
        });

        return false;
    }

    return true;
}

// Récupérer les paramètres professionnels
async function getProfessionalSettings() {
    const { data, error } = await supabase
        .from("professional_settings")
        .select("professional_status, timezone")
        .limit(1)
        .maybeSingle();

    if (error) throw error;

    return data;
}

// Convertir une heure SQL en heure et minutes
function parseTime(time) {
    const [hour, minute] = time.split(":").map(Number);

    return { hour, minute };
}

// Vérifier le format d'une date
function isValidDate(date) {
    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return false;
    }

    const parsed = DateTime.fromISO(date, {
        zone: DEFAULT_TIMEZONE
    });

    return parsed.isValid && parsed.toISODate() === date;
}

/* ============================================
   5. SÉCURITÉ ADMINISTRATEUR
============================================ */

async function requireAdmin(req, res, next) {
    try {
        if (!supabase || !ADMIN_USER_ID) {
            return res.status(503).json({
                success: false,
                message: "La sécurité administrateur n'est pas configurée."
            });
        }

        const authorization = req.headers.authorization || "";

        const token = authorization.startsWith("Bearer ")
            ? authorization.slice(7).trim()
            : "";

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentification requise."
            });
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({
                success: false,
                message: "Session invalide ou expirée."
            });
        }

        if (data.user.id !== ADMIN_USER_ID) {
            return res.status(403).json({
                success: false,
                message: "Accès réservé à l'administrateur."
            });
        }

        req.adminUser = data.user;

        return next();

    } catch (error) {
        console.error("Erreur vérification administrateur :", error);

        return res.status(500).json({
            success: false,
            message: "Impossible de vérifier les droits administrateur."
        });
    }
}

/* ============================================
   6. ROUTE D'ACCUEIL
============================================ */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend de mon portfolio opérationnel !"
    });
});

/* ============================================
   7. TEST DE CONNEXION À SUPABASE
============================================ */

app.get("/api/creative-break/health", async (req, res) => {
    try {
        if (!checkSupabase(res)) return;

        const settings = await getProfessionalSettings();

        return res.json({
            success: true,
            message: "Connexion à Supabase réussie !",
            settings
        });

    } catch (error) {
        console.error("Erreur Supabase :", error);

        return res.status(500).json({
            success: false,
            message: "Impossible de communiquer avec Supabase."
        });
    }
});

/* ============================================
   8. TEST DE CONNEXION ADMINISTRATEUR
============================================ */

app.get(
    "/api/creative-break/admin/check",
    requireAdmin,
    (req, res) => {
        return res.json({
            success: true,
            message: "Authentification administrateur réussie."
        });
    }
);

/* ============================================
   9. CONSULTER LES CRÉNEAUX DISPONIBLES
============================================ */

app.get("/api/creative-break/availability", async (req, res) => {
    try {
        if (!checkSupabase(res)) return;

        const { date } = req.query;

        if (!isValidDate(date)) {
            return res.status(400).json({
                success: false,
                message: "Veuillez fournir une date valide au format YYYY-MM-DD."
            });
        }

        const settings = await getProfessionalSettings();

        if (!settings) {
            return res.status(503).json({
                success: false,
                message: "Les paramètres professionnels ne sont pas configurés."
            });
        }

        const timezone = settings.timezone || DEFAULT_TIMEZONE;

        if (settings.professional_status !== "Disponible") {
            return res.json({
                success: true,
                status: settings.professional_status,
                slots: [],
                message: "Les réservations sont momentanément suspendues."
            });
        }

        const dayStart = DateTime.fromISO(date, {
            zone: timezone
        }).startOf("day");

        const dayEnd = dayStart.plus({ days: 1 });
        const weekday = dayStart.weekday;

        const { data: schedules, error: scheduleError } = await supabase
            .from("availability")
            .select("start_time, end_time")
            .eq("weekday", weekday)
            .order("start_time");

        if (scheduleError) throw scheduleError;

        const { data: bookings, error: bookingError } = await supabase
            .from("bookings")
            .select("starts_at, ends_at")
            .in("status", ["pending", "accepted"])
            .lt("starts_at", dayEnd.toUTC().toISO())
            .gt("ends_at", dayStart.toUTC().toISO());

        if (bookingError) throw bookingError;

        const now = DateTime.now().setZone(timezone);
        const slots = [];

        for (const schedule of schedules || []) {
            const startParts = parseTime(schedule.start_time);
            const endParts = parseTime(schedule.end_time);

            let slotStart = dayStart.set(startParts);
            const scheduleEnd = dayStart.set(endParts);

            while (
                slotStart.plus({ minutes: BOOKING_DURATION }) <= scheduleEnd
            ) {
                const slotEnd = slotStart.plus({
                    minutes: BOOKING_DURATION
                });

                const isFuture = slotStart > now;

                const isBooked = (bookings || []).some(booking => {
                    const existingStart = DateTime
                        .fromISO(booking.starts_at)
                        .toMillis();

                    const existingEnd = DateTime
                        .fromISO(booking.ends_at)
                        .toMillis();

                    return (
                        slotStart.toMillis() < existingEnd &&
                        slotEnd.toMillis() > existingStart
                    );
                });

                if (isFuture && !isBooked) {
                    slots.push({
                        time: slotStart.toFormat("HH:mm"),
                        startsAt: slotStart.toUTC().toISO(),
                        endsAt: slotEnd.toUTC().toISO()
                    });
                }

                slotStart = slotEnd;
            }
        }

        return res.json({
            success: true,
            date,
            timezone,
            status: settings.professional_status,
            duration: BOOKING_DURATION,
            slots
        });

    } catch (error) {
        console.error("Erreur disponibilité :", error);

        return res.status(500).json({
            success: false,
            message: "Impossible de récupérer les créneaux disponibles."
        });
    }
});

/* ============================================
   10. ENREGISTRER UNE RÉSERVATION
============================================ */

app.post("/api/creative-break/bookings", async (req, res) => {
    try {
        console.log("====================================");
        console.log("DONNEES RECUES :", req.body);
        console.log("====================================");

        if (!checkSupabase(res)) return;

        const {
            clientName,
            clientPhone,
            clientEmail,
            projectDetails,
            date,
            time
        } = req.body || {};

        if (
            typeof clientName !== "string" ||
            typeof clientPhone !== "string" ||
            typeof clientEmail !== "string" ||
            typeof projectDetails !== "string" ||
            !clientName.trim() ||
            !clientPhone.trim() ||
            !clientEmail.trim() ||
            !projectDetails.trim() ||
            !isValidDate(date) ||
            typeof time !== "string" ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
        ) {
            console.log("ERREUR : DONNEES INVALIDES");

            console.log({
                clientName,
                clientPhone,
                clientEmail,
                projectDetails,
                date,
                time
            });

            return res.status(400).json({
                success: false,
                message: "Veuillez vérifier toutes les informations du formulaire."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
            return res.status(400).json({
                success: false,
                message: "Veuillez fournir une adresse email valide."
            });
        }

        if (
            clientName.trim().length > 120 ||
            clientPhone.trim().length > 40 ||
            clientEmail.trim().length > 254 ||
            projectDetails.trim().length > 5000
        ) {
            return res.status(400).json({
                success: false,
                message: "Certains champs dépassent la longueur autorisée."
            });
        }

        const settings = await getProfessionalSettings();

        if (!settings) {
            return res.status(503).json({
                success: false,
                message: "Les paramètres professionnels ne sont pas configurés."
            });
        }

        if (settings.professional_status !== "Disponible") {
            return res.status(409).json({
                success: false,
                message: "Le professionnel n'est pas disponible actuellement."
            });
        }

        const timezone = settings.timezone || DEFAULT_TIMEZONE;

        const startsAt = DateTime.fromISO(`${date}T${time}`, {
            zone: timezone
        });

        if (!startsAt.isValid) {
            return res.status(400).json({
                success: false,
                message: "Date ou heure invalide."
            });
        }

        const endsAt = startsAt.plus({
            minutes: BOOKING_DURATION
        });

        if (startsAt <= DateTime.now().setZone(timezone)) {
            return res.status(400).json({
                success: false,
                message: "Ce créneau est déjà passé."
            });
        }

        const { data: schedules, error: scheduleError } = await supabase
            .from("availability")
            .select("start_time, end_time")
            .eq("weekday", startsAt.weekday);

        if (scheduleError) throw scheduleError;

        const withinSchedule = (schedules || []).some(schedule => {
            const startParts = parseTime(schedule.start_time);
            const endParts = parseTime(schedule.end_time);

            const workStart = startsAt.startOf("day").set(startParts);
            const workEnd = startsAt.startOf("day").set(endParts);

            return startsAt >= workStart && endsAt <= workEnd;
        });

        if (!withinSchedule) {
            return res.status(400).json({
                success: false,
                message: "Ce créneau ne correspond pas aux horaires de travail."
            });
        }

        const { data: conflicts, error: conflictError } = await supabase
            .from("bookings")
            .select("id")
            .in("status", ["pending", "accepted"])
            .lt("starts_at", endsAt.toUTC().toISO())
            .gt("ends_at", startsAt.toUTC().toISO())
            .limit(1);

        if (conflictError) throw conflictError;

        if (conflicts && conflicts.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Ce créneau vient d'être réservé. Veuillez en choisir un autre."
            });
        }

        const { data: booking, error: insertError } = await supabase
            .from("bookings")
            .insert({
                client_name: clientName.trim(),
                client_phone: clientPhone.trim(),
                client_email: clientEmail.trim(),
                project_details: projectDetails.trim(),
                starts_at: startsAt.toUTC().toISO(),
                ends_at: endsAt.toUTC().toISO(),
                status: "pending"
            })
            .select("id, starts_at, ends_at, status")
            .single();

        if (insertError) {
            console.error("Erreur insertion réservation :", insertError);

            if (
                insertError.code === "23P01" ||
                insertError.code === "23505"
            ) {
                return res.status(409).json({
                    success: false,
                    message: "Ce créneau vient d'être réservé. Choisissez-en un autre."
                });
            }

            throw insertError;
        }

        console.log("RESERVATION ENREGISTREE :", booking.id);

        return res.status(201).json({
            success: true,
            message: "Votre demande de rendez-vous a été enregistrée !",
            booking: {
                id: booking.id,
                startsAt: booking.starts_at,
                endsAt: booking.ends_at,
                status: booking.status,
                timezone
            }
        });

    } catch (error) {
        console.error("Erreur réservation :", error);

        return res.status(500).json({
            success: false,
            message: "Impossible d'enregistrer votre réservation."
        });
    }
});

/* ============================================
   11. ADMIN : CONSULTER LES RÉSERVATIONS
============================================ */

app.get(
    "/api/creative-break/admin/bookings",
    requireAdmin,
    async (req, res) => {
        try {
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .order("starts_at", { ascending: false });

            if (error) throw error;

            return res.json({
                success: true,
                bookings: data
            });

        } catch (error) {
            console.error("Erreur chargement réservations :", error);

            return res.status(500).json({
                success: false,
                message: "Impossible de récupérer les réservations."
            });
        }
    }
);

/* ============================================
   12. ADMIN : MODIFIER UNE RÉSERVATION
============================================ */

app.patch(
    "/api/creative-break/admin/bookings/:id",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);
            const { status, meeting_link } = req.body || {};

            if (!Number.isInteger(bookingId) || bookingId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant de réservation invalide."
                });
            }

            const allowedStatuses = [
                "pending",
                "accepted",
                "rejected",
                "cancelled"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Statut de réservation invalide."
                });
            }

            if (
                meeting_link !== undefined &&
                meeting_link !== null &&
                meeting_link !== ""
            ) {
                try {
                    const url = new URL(meeting_link);

                    if (!["http:", "https:"].includes(url.protocol)) {
                        throw new Error("Protocole invalide");
                    }
                } catch {
                    return res.status(400).json({
                        success: false,
                        message: "Le lien de visioconférence est invalide."
                    });
                }
            }

            const updateData = { status };

            if (meeting_link !== undefined) {
                updateData.meeting_link = meeting_link || null;
            }

            const { data, error } = await supabase
                .from("bookings")
                .update(updateData)
                .eq("id", bookingId)
                .select("*")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Réservation introuvable."
                });
            }

            return res.json({
                success: true,
                message: "Réservation mise à jour avec succès.",
                booking: data
            });

        } catch (error) {
            console.error("Erreur modification réservation :", error);

            return res.status(500).json({
                success: false,
                message: "Impossible de modifier cette réservation."
            });
        }
    }
);

/* ============================================
   13. ADMIN : CONSULTER LES MESSAGES
============================================ */

app.get(
    "/api/creative-break/admin/messages",
    requireAdmin,
    async (req, res) => {
        try {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            return res.json({
                success: true,
                messages: data
            });

        } catch (error) {
            console.error("Erreur chargement messages :", error);

            return res.status(500).json({
                success: false,
                message: "Impossible de récupérer les messages."
            });
        }
    }
);

/* ============================================
   14. ADMIN : MARQUER UN MESSAGE COMME LU
============================================ */

app.patch(
    "/api/creative-break/admin/messages/:id/read",
    requireAdmin,
    async (req, res) => {
        try {
            const messageId = Number(req.params.id);

            if (!Number.isInteger(messageId) || messageId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant de message invalide."
                });
            }

            const { data, error } = await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", messageId)
                .select("*")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Message introuvable."
                });
            }

            return res.json({
                success: true,
                message: "Message marqué comme lu.",
                data
            });

        } catch (error) {
            console.error("Erreur lecture message :", error);

            return res.status(500).json({
                success: false,
                message: "Impossible de modifier le message."
            });
        }
    }
);

/* ============================================
   15. ADMIN : CONSULTER LES PARAMÈTRES
============================================ */

app.get(
    "/api/creative-break/admin/settings",
    requireAdmin,
    async (req, res) => {
        try {
            const settings = await getProfessionalSettings();

            return res.json({
                success: true,
                settings
            });

        } catch (error) {
            console.error("Erreur paramètres :", error);

            return res.status(500).json({
                success: false,
                message: "Impossible de récupérer les paramètres."
            });
        }
    }
);

/* ============================================
   16. ADMIN : MODIFIER LE STATUT PROFESSIONNEL
============================================ */

app.patch(
    "/api/creative-break/admin/settings/status",
    requireAdmin,
    async (req, res) => {
        try {
            const { status } = req.body || {};

            if (!["Disponible", "Indisponible"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Statut professionnel invalide."
                });
            }

            const { data, error } = await supabase
                .from("professional_settings")
                .update({
                    professional_status: status,
                    updated_at: new Date().toISOString()
                })
                .not("professional_status", "is", null)
                .select("professional_status, timezone");

            if (error) throw error;

            if (!data || data.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Paramètres professionnels introuvables."
                });
            }

            return res.json({
                success: true,
                message: "Statut professionnel modifié.",
                settings: data[0]
            });

        } catch (error) {
            console.error("Erreur modification statut :", error);

            return res.status(500).json({
                success: false,
                message: "Impossible de modifier le statut professionnel."
            });
        }
    }
);

/* ============================================
   17. FORMULAIRE DE CONTACT
   ENREGISTREMENT SUPABASE + EMAIL BREVO
============================================ */

app.post("/api/contact", async (req, res) => {
    try {

        // ========================================
        // DIAGNOSTIC : AFFICHER LES DONNÉES REÇUES
        // ========================================

        console.log("====================================");
        console.log("FORMULAIRE CONTACT REÇU :", req.body);
        console.log("====================================");

        // Récupérer les informations du formulaire
        const { name, email, message } = req.body || {};

        // Vérifier les champs obligatoires
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof message !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !message.trim()
        ) {
            console.error("ERREUR : CHAMPS DU FORMULAIRE INVALIDES.");

            return res.status(400).json({
                success: false,
                message: "Veuillez remplir tous les champs."
            });
        }

        // Vérifier le format de l'email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            console.error("ERREUR : EMAIL INVALIDE.");

            return res.status(400).json({
                success: false,
                message: "Veuillez fournir une adresse email valide."
            });
        }

        // Vérifier la longueur des informations
        if (
            name.trim().length > 120 ||
            email.trim().length > 254 ||
            message.trim().length > 5000
        ) {
            console.error("ERREUR : CHAMPS TROP LONGS.");

            return res.status(400).json({
                success: false,
                message: "Certains champs sont trop longs."
            });
        }

        // Vérifier la connexion à Supabase
        if (!checkSupabase(res)) {
            console.error("ERREUR : SUPABASE NON CONFIGURÉ.");
            return;
        }

        // ----------------------------------------
        // 17.1 ENREGISTRER LE MESSAGE DANS SUPABASE
        // ----------------------------------------

        console.log("TENTATIVE D'ENREGISTREMENT DANS SUPABASE...");

        const { data: savedMessage, error: databaseError } =
            await supabase
                .from("messages")
                .insert({
                    client_name: name.trim(),
                    client_email: email.trim(),
                    subject: "Nouveau message depuis le portfolio",
                    message: message.trim(),
                    is_read: false
                })
                .select("id")
                .single();

        if (databaseError) {
            console.error(
                "ERREUR ENREGISTREMENT SUPABASE :",
                databaseError
            );

            return res.status(500).json({
                success: false,
                message: "Impossible d'enregistrer votre message."
            });
        }

        console.log(
            "MESSAGE ENREGISTRE DANS SUPABASE :",
            savedMessage.id
        );

        // ----------------------------------------
        // 17.2 VÉRIFIER LA CONFIGURATION BREVO
        // ----------------------------------------

        if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
            console.error("Configuration Brevo manquante.");

            return res.status(201).json({
                success: true,
                message: "Votre message a été enregistré avec succès !"
            });
        }

        // ----------------------------------------
        // 17.3 PRÉPARER L'EMAIL
        // ----------------------------------------

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
                email: email.trim()
            },
            subject: `Nouveau message de ${name.trim()}`,
            textContent: `
Nom : ${name.trim()}
Email : ${email.trim()}

Message :
${message.trim()}
            `
        };

        // ----------------------------------------
        // 17.4 ENVOYER L'EMAIL AVEC BREVO
        // ----------------------------------------

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

        const result = await response.json();

        if (!response.ok) {
            console.error("Erreur Brevo :", result);

            return res.status(201).json({
                success: true,
                message: "Votre message a été enregistré. La notification email est momentanément indisponible."
            });
        }

        console.log("NOTIFICATION BREVO ENVOYEE.");

        // ----------------------------------------
        // 17.5 CONFIRMER L'ENVOI
        // ----------------------------------------

        return res.status(201).json({
            success: true,
            message: "Votre message a été envoyé avec succès !"
        });

    } catch (error) {
        console.error("Erreur formulaire de contact :", error);

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors de l'envoi du message."
        });
    }
});

/* ============================================
   18. DÉMARRAGE DU SERVEUR
============================================ */

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend démarré sur le port ${PORT}`);
});
