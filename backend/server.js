
/* =========================================================
   1. IMPORTATION DES MODULES
========================================================= */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

dotenv.config();

/* =========================================================
   2. CONFIGURATION DU SERVEUR
========================================================= */

const app = express();
const PORT = process.env.PORT || 5000;

// Autoriser le frontend local et les adresses configurées dans .env
const allowedOrigins = [
    "http://localhost:5173",
    ...(process.env.FRONTEND_URL || "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
];

app.use(cors({
    origin(origin, callback) {
        // Autoriser les requêtes sans origine (tests, outils serveur)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origine non autorisée par CORS."));
    }
}));

app.use(express.json({ limit: "1mb" }));

/* =========================================================
   3. CONNEXION À SUPABASE
========================================================= */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID?.trim();

const supabase = SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
    : null;

// Fuseau horaire de Madagascar
const DEFAULT_TIMEZONE = "Indian/Antananarivo";

// Durée fixe d'un rendez-vous
const BOOKING_DURATION = 30;

// Statuts professionnels autorisés
const PROFESSIONAL_STATUSES = [
    "Disponible",
    "En pause",
    "En traitement",
    "En conférence",
    "Hors ligne"
];

// Statuts des réservations
const BOOKING_STATUSES = [
    "pending",
    "accepted",
    "rejected",
    "cancelled"
];

console.log("Configuration du serveur :", {
    supabaseConfigured: Boolean(supabase),
    adminUserIdConfigured: Boolean(ADMIN_USER_ID),
    brevoConfigured: Boolean(
        process.env.BREVO_API_KEY && process.env.EMAIL_USER
    )
});

/* =========================================================
   4. FONCTIONS UTILITAIRES
========================================================= */

// Vérifier que Supabase est configuré
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

// Vérifier une date au format YYYY-MM-DD
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

// Vérifier une heure au format HH:mm
function isValidTime(time) {
    return (
        typeof time === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    );
}

// Convertir une heure en minutes depuis minuit
function timeToMinutes(time) {
    const [hour, minute] = String(time).split(":").map(Number);
    return hour * 60 + minute;
}

// Convertir une heure SQL en objet utilisable par Luxon
function parseTime(time) {
    const [hour, minute] = String(time).split(":").map(Number);

    return {
        hour,
        minute,
        second: 0,
        millisecond: 0
    };
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

// Vérifier une adresse email
function isValidEmail(email) {
    return (
        typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    );
}

// Vérifier un identifiant numérique
function isValidId(id) {
    const value = Number(id);

    return Number.isSafeInteger(value) && value > 0;
}

// Vérifier un lien HTTP ou HTTPS
function isValidHttpUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
        return false;
    }

    try {
        const url = new URL(value);

        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
}

// Convertir une date et une heure locales en DateTime
function createLocalDateTime(date, time, timezone) {
    if (!isValidDate(date) || !isValidTime(time)) {
        return null;
    }

    const result = DateTime.fromISO(`${date}T${time}`, {
        zone: timezone
    });

    return result.isValid ? result : null;
}

// Vérifier une date ISO contenant explicitement un fuseau horaire
function parseIsoWithTimezone(value) {
    if (
        typeof value !== "string" ||
        !/(Z|[+-]\d{2}:\d{2})$/i.test(value)
    ) {
        return null;
    }

    const parsed = DateTime.fromISO(value, {
        setZone: true
    });

    return parsed.isValid ? parsed : null;
}

// Convertir une date SQL en DateTime UTC
function toUtcDateTime(value) {
    return DateTime.fromISO(value, { zone: "utc" });
}

// Envoyer une réponse d'erreur serveur
function serverError(res, message, error, label) {
    console.error(label || "Erreur serveur :", error);

    return res.status(500).json({
        success: false,
        message
    });
}

/* =========================================================
   5. SÉCURITÉ ADMINISTRATEUR
========================================================= */

// Vérifier le jeton Supabase et l'identité de l'administrateur
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
        return serverError(
            res,
            "Impossible de vérifier les droits administrateur.",
            error,
            "Erreur authentification admin :"
        );
    }
}

/* =========================================================
   6. GESTION DES HORAIRES
========================================================= */

// Récupérer les horaires applicables à une date.
// Une personnalisation remplace les horaires hebdomadaires.
async function getSchedulesForDate(date, timezone) {
    const day = DateTime.fromISO(date, { zone: timezone });

    if (!day.isValid) {
        throw new Error("Date invalide.");
    }

    // Chercher une personnalisation de cette date
    const { data: override, error: overrideError } = await supabase
        .from("availability_overrides")
        .select("*")
        .eq("override_date", date)
        .maybeSingle();

    if (overrideError) throw overrideError;

    if (override) {
        const schedules = [];

        if (
            override.morning_enabled &&
            override.morning_start &&
            override.morning_end
        ) {
            schedules.push({
                start_time: override.morning_start,
                end_time: override.morning_end
            });
        }

        if (
            override.afternoon_enabled &&
            override.afternoon_start &&
            override.afternoon_end
        ) {
            schedules.push({
                start_time: override.afternoon_start,
                end_time: override.afternoon_end
            });
        }

        return {
            schedules,
            customized: true,
            override
        };
    }

    // Sinon, utiliser les horaires hebdomadaires
    const { data: schedules, error } = await supabase
        .from("availability")
        .select("start_time, end_time")
        .eq("weekday", day.weekday)
        .order("start_time");

    if (error) throw error;

    return {
        schedules: schedules || [],
        customized: false,
        override: null
    };
}

// Vérifier qu'un rendez-vous respecte les horaires
async function isWithinWorkingHours(startsAt, endsAt, timezone) {
    const date = startsAt.setZone(timezone).toISODate();
    const result = await getSchedulesForDate(date, timezone);

    return result.schedules.some(schedule => {
        const workStart = createLocalDateTime(
            date,
            String(schedule.start_time).slice(0, 5),
            timezone
        );

        const workEnd = createLocalDateTime(
            date,
            String(schedule.end_time).slice(0, 5),
            timezone
        );

        return (
            workStart &&
            workEnd &&
            startsAt >= workStart &&
            endsAt <= workEnd
        );
    });
}

// Vérifier que le rendez-vous commence sur un créneau de 30 minutes
async function isValidBookingSlot(startsAt, timezone) {
    const date = startsAt.setZone(timezone).toISODate();
    const time = startsAt.setZone(timezone).toFormat("HH:mm");

    const result = await getSchedulesForDate(date, timezone);

    return result.schedules.some(schedule => {
        const startMinutes = timeToMinutes(
            String(schedule.start_time).slice(0, 5)
        );

        const endMinutes = timeToMinutes(
            String(schedule.end_time).slice(0, 5)
        );

        const selectedMinutes = timeToMinutes(time);

        return (
            selectedMinutes >= startMinutes &&
            selectedMinutes + BOOKING_DURATION <= endMinutes &&
            (selectedMinutes - startMinutes) % BOOKING_DURATION === 0
        );
    });
}

// Vérifier un chevauchement avec un congé ou une indisponibilité
async function hasUnavailabilityConflict(startsAt, endsAt) {
    const { data, error } = await supabase
        .from("unavailability_periods")
        .select("id")
        .lt("starts_at", endsAt.toUTC().toISO())
        .gt("ends_at", startsAt.toUTC().toISO())
        .limit(1);

    if (error) throw error;

    return Boolean(data?.length);
}

// Vérifier un chevauchement avec une réservation active
async function hasBookingConflict(
    startsAt,
    endsAt,
    excludedBookingId = null
) {
    let query = supabase
        .from("bookings")
        .select("id")
        .in("status", ["pending", "accepted"])
        .lt("starts_at", endsAt.toUTC().toISO())
        .gt("ends_at", startsAt.toUTC().toISO());

    if (excludedBookingId !== null) {
        query = query.neq("id", excludedBookingId);
    }

    const { data, error } = await query.limit(1);

    if (error) throw error;

    return Boolean(data?.length);
}

// Vérifier si les horaires proposés couvrent les rendez-vous existants
function bookingFitsSchedules(booking, schedules, timezone) {
    const start = toUtcDateTime(booking.starts_at);
    const end = toUtcDateTime(booking.ends_at);

    if (!start.isValid || !end.isValid) return false;

    const date = start.setZone(timezone).toISODate();

    return schedules.some(schedule => {
        const workStart = createLocalDateTime(
            date,
            String(schedule.start_time).slice(0, 5),
            timezone
        );

        const workEnd = createLocalDateTime(
            date,
            String(schedule.end_time).slice(0, 5),
            timezone
        );

        return (
            workStart &&
            workEnd &&
            start >= workStart.toUTC() &&
            end <= workEnd.toUTC()
        );
    });
}

// Vérifier les réservations avant de modifier les horaires d'une date
async function checkExistingBookingsAgainstSchedules(date, schedules, timezone) {
    const dayStart = DateTime.fromISO(date, { zone: timezone }).startOf("day");
    const dayEnd = dayStart.plus({ days: 1 });

    const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, starts_at, ends_at")
        .in("status", ["pending", "accepted"])
        .lt("starts_at", dayEnd.toUTC().toISO())
        .gt("ends_at", dayStart.toUTC().toISO());

    if (error) throw error;

    const incompatible = (bookings || []).filter(
        booking => !bookingFitsSchedules(booking, schedules, timezone)
    );

    return incompatible;
}

/* =========================================================
   7. ENVOI DES EMAILS AVEC BREVO
========================================================= */

// Envoyer un email et enregistrer son historique
async function sendAdminEmail({
    recordType = "other",
    recordId = null,
    recipientEmail,
    subject,
    body,
    emailType = "custom"
}) {
    const email = String(recipientEmail || "").trim();
    const emailSubject = String(subject || "").trim();
    const emailBody = String(body || "").trim();

    if (
        !isValidEmail(email) ||
        !emailSubject ||
        !emailBody ||
        emailSubject.length > 250 ||
        emailBody.length > 15000
    ) {
        throw new Error("Les informations de l'email sont invalides.");
    }

    let emailStatus = "failed";
    let brevoMessageId = null;
    let errorMessage = null;

    try {
        if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
            throw new Error("La configuration Brevo est manquante.");
        }

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    sender: {
                        name: "Portfolio",
                        email: process.env.EMAIL_USER
                    },
                    to: [{ email }],
                    subject: emailSubject,
                    textContent: emailBody
                })
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.message || "Erreur lors de l'envoi Brevo."
            );
        }

        emailStatus = "sent";
        brevoMessageId = result.messageId || null;

    } catch (error) {
        errorMessage = error.message;
    }

    // Enregistrer l'envoi ou l'échec dans Supabase
    const { error: historyError } = await supabase
        .from("admin_email_history")
        .insert({
            record_type: recordType,
            record_id: recordId === null ? null : String(recordId),
            recipient_email: email,
            subject: emailSubject,
            body: emailBody,
            email_type: emailType,
            email_status: emailStatus,
            brevo_message_id: brevoMessageId
        });

    if (historyError) {
        console.error("Erreur historique email :", historyError);
    }

    if (emailStatus !== "sent") {
        throw new Error(
            errorMessage || "L'email n'a pas pu être envoyé."
        );
    }

    return {
        success: true,
        messageId: brevoMessageId
    };
}

/* =========================================================
   8. ROUTE D'ACCUEIL ET TEST SUPABASE
========================================================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend de mon portfolio opérationnel !"
    });
});

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
        return serverError(
            res,
            "Impossible de communiquer avec Supabase.",
            error,
            "Erreur health :"
        );
    }
});

/* =========================================================
   9. STATUT PROFESSIONNEL PUBLIC
========================================================= */

app.get("/api/creative-break/status", async (req, res) => {
    try {
        if (!checkSupabase(res)) return;

        const settings = await getProfessionalSettings();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Statut professionnel introuvable."
            });
        }

        return res.json({
            success: true,
            status: settings.professional_status,
            timezone: settings.timezone || DEFAULT_TIMEZONE
        });

    } catch (error) {
        return serverError(
            res,
            "Impossible de récupérer le statut professionnel.",
            error,
            "Erreur statut public :"
        );
    }
});

/* =========================================================
   10. VÉRIFICATION ADMINISTRATEUR
========================================================= */

app.get(
    "/api/creative-break/admin/check",
    requireAdmin,
    (req, res) => {
        res.json({
            success: true,
            message: "Authentification administrateur réussie."
        });
    }
);

/* =========================================================
   11. DISPONIBILITÉS D'UNE DATE
========================================================= */

app.get("/api/creative-break/availability", async (req, res) => {
    try {
        if (!checkSupabase(res)) return;

        const { date } = req.query;

        if (!isValidDate(date)) {
            return res.status(400).json({
                success: false,
                message: "Date invalide. Format attendu : YYYY-MM-DD."
            });
        }

        const settings = await getProfessionalSettings();

        if (!settings) {
            return res.status(503).json({
                success: false,
                message: "Paramètres professionnels introuvables."
            });
        }

        const timezone = settings.timezone || DEFAULT_TIMEZONE;
        const dayStart = DateTime.fromISO(date, { zone: timezone }).startOf("day");
        const dayEnd = dayStart.plus({ days: 1 });

        // Récupérer les horaires de cette date
        const scheduleResult = await getSchedulesForDate(date, timezone);

        // Récupérer les réservations actives
        const { data: bookings, error: bookingError } = await supabase
            .from("bookings")
            .select("starts_at, ends_at")
            .in("status", ["pending", "accepted"])
            .lt("starts_at", dayEnd.toUTC().toISO())
            .gt("ends_at", dayStart.toUTC().toISO());

        if (bookingError) throw bookingError;

        // Récupérer les indisponibilités
        const { data: unavailable, error: unavailableError } = await supabase
            .from("unavailability_periods")
            .select("starts_at, ends_at")
            .lt("starts_at", dayEnd.toUTC().toISO())
            .gt("ends_at", dayStart.toUTC().toISO());

        if (unavailableError) throw unavailableError;

        const now = DateTime.now().setZone(timezone);
        const slots = [];

        // Construire les créneaux de 30 minutes
        for (const schedule of scheduleResult.schedules) {
            let slotStart = dayStart.set(parseTime(schedule.start_time));
            const scheduleEnd = dayStart.set(parseTime(schedule.end_time));

            while (
                slotStart.plus({ minutes: BOOKING_DURATION }) <= scheduleEnd
            ) {
                const slotEnd = slotStart.plus({
                    minutes: BOOKING_DURATION
                });

                const isFuture = slotStart > now;

                const isBooked = (bookings || []).some(booking => {
                    const start = toUtcDateTime(booking.starts_at);
                    const end = toUtcDateTime(booking.ends_at);

                    return (
                        slotStart.toUTC() < end &&
                        slotEnd.toUTC() > start
                    );
                });

                const isUnavailable = (unavailable || []).some(period => {
                    const start = toUtcDateTime(period.starts_at);
                    const end = toUtcDateTime(period.ends_at);

                    return (
                        slotStart.toUTC() < end &&
                        slotEnd.toUTC() > start
                    );
                });

                if (isFuture && !isBooked && !isUnavailable) {
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
            customized: scheduleResult.customized,
            slots
        });

    } catch (error) {
        return serverError(
            res,
            "Impossible de récupérer les créneaux disponibles.",
            error,
            "Erreur disponibilité date :"
        );
    }
});

/* =========================================================
   12. DISPONIBILITÉS D'UN MOIS
========================================================= */

app.get("/api/creative-break/availability/month", async (req, res) => {
    try {
        if (!checkSupabase(res)) return;

        const { month } = req.query;

        if (
            typeof month !== "string" ||
            !/^\d{4}-\d{2}$/.test(month)
        ) {
            return res.status(400).json({
                success: false,
                message: "Format du mois invalide. Format attendu : YYYY-MM."
            });
        }

        const settings = await getProfessionalSettings();

        if (!settings) {
            return res.status(503).json({
                success: false,
                message: "Paramètres professionnels introuvables."
            });
        }

        const timezone = settings.timezone || DEFAULT_TIMEZONE;

        const monthStart = DateTime.fromISO(`${month}-01`, {
            zone: timezone
        }).startOf("month");

        if (!monthStart.isValid || monthStart.toFormat("yyyy-MM") !== month) {
            return res.status(400).json({
                success: false,
                message: "Le mois demandé est invalide."
            });
        }

        const monthEnd = monthStart.plus({ months: 1 });

        // Charger les horaires hebdomadaires
        const { data: weeklySchedules, error: weeklyError } = await supabase
            .from("availability")
            .select("weekday, start_time, end_time")
            .order("weekday")
            .order("start_time");

        if (weeklyError) throw weeklyError;

        // Charger les horaires personnalisés du mois
        const { data: overrides, error: overrideError } = await supabase
            .from("availability_overrides")
            .select("*")
            .gte("override_date", monthStart.toISODate())
            .lt("override_date", monthEnd.toISODate());

        if (overrideError) throw overrideError;

        // Charger les réservations du mois
        const { data: bookings, error: bookingError } = await supabase
            .from("bookings")
            .select("starts_at, ends_at")
            .in("status", ["pending", "accepted"])
            .lt("starts_at", monthEnd.toUTC().toISO())
            .gt("ends_at", monthStart.toUTC().toISO());

        if (bookingError) throw bookingError;

        // Charger les périodes d'indisponibilité du mois
        const { data: unavailable, error: unavailableError } = await supabase
            .from("unavailability_periods")
            .select("starts_at, ends_at")
            .lt("starts_at", monthEnd.toUTC().toISO())
            .gt("ends_at", monthStart.toUTC().toISO());

        if (unavailableError) throw unavailableError;

        const now = DateTime.now().setZone(timezone);
        const days = [];

        // Parcourir tous les jours du mois
        for (
            let currentDay = monthStart;
            currentDay < monthEnd;
            currentDay = currentDay.plus({ days: 1 })
        ) {
            const date = currentDay.toISODate();
            const weekday = currentDay.weekday;

            const override = (overrides || []).find(
                item => item.override_date === date
            );

            let daySchedules;

            if (override) {
                daySchedules = [];

                if (
                    override.morning_enabled &&
                    override.morning_start &&
                    override.morning_end
                ) {
                    daySchedules.push({
                        start_time: override.morning_start,
                        end_time: override.morning_end
                    });
                }

                if (
                    override.afternoon_enabled &&
                    override.afternoon_start &&
                    override.afternoon_end
                ) {
                    daySchedules.push({
                        start_time: override.afternoon_start,
                        end_time: override.afternoon_end
                    });
                }
            } else {
                daySchedules = (weeklySchedules || []).filter(
                    item => Number(item.weekday) === weekday
                );
            }

            const slots = [];

            for (const schedule of daySchedules) {
                let slotStart = currentDay.set(parseTime(schedule.start_time));
                const scheduleEnd = currentDay.set(parseTime(schedule.end_time));

                while (
                    slotStart.plus({ minutes: BOOKING_DURATION }) <= scheduleEnd
                ) {
                    const slotEnd = slotStart.plus({
                        minutes: BOOKING_DURATION
                    });

                    const isFuture = slotStart > now;

                    const isBooked = (bookings || []).some(booking => {
                        const start = toUtcDateTime(booking.starts_at);
                        const end = toUtcDateTime(booking.ends_at);

                        return (
                            slotStart.toUTC() < end &&
                            slotEnd.toUTC() > start
                        );
                    });

                    const isUnavailable = (unavailable || []).some(period => {
                        const start = toUtcDateTime(period.starts_at);
                        const end = toUtcDateTime(period.ends_at);

                        return (
                            slotStart.toUTC() < end &&
                            slotEnd.toUTC() > start
                        );
                    });

                    if (isFuture && !isBooked && !isUnavailable) {
                        slots.push({
                            time: slotStart.toFormat("HH:mm"),
                            startsAt: slotStart.toUTC().toISO(),
                            endsAt: slotEnd.toUTC().toISO()
                        });
                    }

                    slotStart = slotEnd;
                }
            }

            days.push({
                date,
                weekday,
                available: slots.length > 0,
                slotsCount: slots.length,
                customized: Boolean(override),
                slots
            });
        }

        return res.json({
            success: true,
            month,
            timezone,
            duration: BOOKING_DURATION,
            days
        });

    } catch (error) {
        return serverError(
            res,
            "Impossible de récupérer les disponibilités du mois.",
            error,
            "Erreur disponibilités mensuelles :"
        );
    }
});

/* =========================================================
   13. ENREGISTRER UNE RÉSERVATION
   CORRECTION DU FUSEAU HORAIRE
========================================================= */

app.post("/api/creative-break/bookings", async (req, res) => {
    try {
        if (!checkSupabase(res)) return;

        // Récupérer toutes les données envoyées par le frontend React
        const {
            clientName,
            clientPhone,
            clientEmail,
            projectDetails,
            startsAt: receivedStartsAt,
            date,
            time,
            visitorTimezone
        } = req.body || {};

        // Vérifier les champs obligatoires
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
            !isValidTime(time) ||
            typeof receivedStartsAt !== "string" ||
            !receivedStartsAt.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Veuillez vérifier toutes les informations du formulaire."
            });
        }

        // Vérifier l'adresse email
        if (!isValidEmail(clientEmail)) {
            return res.status(400).json({
                success: false,
                message: "Adresse email invalide."
            });
        }

        // Vérifier les longueurs des champs
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

        // Récupérer les paramètres professionnels
        const settings = await getProfessionalSettings();

        if (!settings) {
            return res.status(503).json({
                success: false,
                message: "Paramètres professionnels introuvables."
            });
        }

        // Le fuseau professionnel reste celui de Madagascar
        const timezone = DEFAULT_TIMEZONE;

        // Vérifier que le fuseau enregistré dans Supabase est cohérent
        if (
            settings.timezone &&
            settings.timezone !== DEFAULT_TIMEZONE
        ) {
            console.error(
                "Fuseau horaire Supabase incorrect :",
                settings.timezone
            );

            return res.status(503).json({
                success: false,
                message: "Le fuseau horaire professionnel doit être Indian/Antananarivo.",
                expectedTimezone: DEFAULT_TIMEZONE,
                configuredTimezone: settings.timezone
            });
        }

        // Vérifier le fuseau horaire du visiteur
        // Il sert à identifier son fuseau, mais ne modifie pas l'instant réservé.
        let visitorZone = timezone;

        if (visitorTimezone !== undefined && visitorTimezone !== null) {
            if (
                typeof visitorTimezone !== "string" ||
                !visitorTimezone.trim() ||
                visitorTimezone.length > 100 ||
                !DateTime.now().setZone(visitorTimezone).isValid
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Le fuseau horaire du visiteur est invalide."
                });
            }

            visitorZone = visitorTimezone;
        }

        // IMPORTANT :
        // startsAt contient l'instant exact choisi dans le calendrier.
        // Il doit obligatoirement contenir Z ou un décalage horaire.
        const receivedInstant = parseIsoWithTimezone(receivedStartsAt);

        if (!receivedInstant) {
            return res.status(400).json({
                success: false,
                message: "La date de réservation startsAt doit être une date ISO avec un fuseau horaire explicite."
            });
        }

        // Convertir l'instant reçu vers le fuseau de Madagascar.
        // Cette conversion conserve le même instant réel.
        const startsAt = receivedInstant.setZone(timezone);

        if (!startsAt.isValid) {
            return res.status(400).json({
                success: false,
                message: "Impossible de convertir la date de réservation."
            });
        }

        // Recalculer la date et l'heure professionnelles à Madagascar
        const professionalDate = startsAt.toISODate();
        const professionalTime = startsAt.toFormat("HH:mm");

        // Vérifier que date et time correspondent à startsAt
        if (
            date !== professionalDate ||
            time !== professionalTime
        ) {
            return res.status(400).json({
                success: false,
                message: "La date ou l'heure envoyée ne correspond pas au créneau professionnel sélectionné.",
                received: {
                    date,
                    time
                },
                expected: {
                    date: professionalDate,
                    time: professionalTime,
                    timezone
                }
            });
        }

        // Calculer la fin du rendez-vous : 30 minutes après le début
        const endsAt = startsAt.plus({
            minutes: BOOKING_DURATION
        });

        // Refuser les créneaux déjà passés
        if (startsAt.toMillis() <= DateTime.now().toMillis()) {
            return res.status(400).json({
                success: false,
                message: "Ce créneau est déjà passé."
            });
        }

        // Vérifier que le rendez-vous respecte les horaires professionnels
        if (!(await isWithinWorkingHours(startsAt, endsAt, timezone))) {
            return res.status(400).json({
                success: false,
                message: "Ce créneau ne correspond pas aux horaires de travail."
            });
        }

        // Vérifier que le rendez-vous correspond à un créneau proposé
        if (!(await isValidBookingSlot(startsAt, timezone))) {
            return res.status(400).json({
                success: false,
                message: "Veuillez sélectionner un créneau proposé dans le calendrier."
            });
        }

        // Vérifier les congés et les indisponibilités
        if (await hasUnavailabilityConflict(startsAt, endsAt)) {
            return res.status(409).json({
                success: false,
                message: "Ce créneau est bloqué pour cause d'indisponibilité."
            });
        }

        // Vérifier qu'une autre réservation n'occupe pas ce créneau
        if (await hasBookingConflict(startsAt, endsAt)) {
            return res.status(409).json({
                success: false,
                message: "Ce créneau vient d'être réservé. Choisissez-en un autre."
            });
        }

        // Enregistrer les dates en UTC dans Supabase.
        // Supabase conservera ainsi le même instant, quel que soit le fuseau du visiteur.
        const { data: booking, error } = await supabase
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

        if (error) throw error;

        // Retourner les informations de réservation au frontend
        return res.status(201).json({
            success: true,
            message: "Votre demande de rendez-vous a été enregistrée !",
            booking: {
                id: booking.id,
                startsAt: booking.starts_at,
                endsAt: booking.ends_at,
                date: professionalDate,
                time: professionalTime,
                status: booking.status,
                timezone,
                visitorTimezone: visitorZone,
                duration: BOOKING_DURATION
            }
        });

    } catch (error) {
        return serverError(
            res,
            "Impossible d'enregistrer votre réservation.",
            error,
            "Erreur création réservation :"
        );
    }
});

/* =========================================================
   14. ADMIN : LISTE DES RÉSERVATIONS
========================================================= */

app.get(
    "/api/creative-break/admin/bookings",
    requireAdmin,
    async (req, res) => {
        try {
            let query = supabase
                .from("bookings")
                .select("*")
                .order("starts_at", { ascending: false });

            // Afficher les archives uniquement si demandé
            if (req.query.archived === "true") {
                query = query.not("archived_at", "is", null);
            } else {
                query = query.is("archived_at", null);
            }

            const { data, error } = await query;

            if (error) throw error;

            return res.json({
                success: true,
                bookings: data || []
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de récupérer les réservations.",
                error,
                "Erreur chargement réservations :"
            );
        }
    }
);

/* =========================================================
   15. ADMIN : MODIFIER LE STATUT OU LE LIEN
========================================================= */

app.patch(
    "/api/creative-break/admin/bookings/:id",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);

            if (!isValidId(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant de réservation invalide."
                });
            }

            const { status, meeting_link } = req.body || {};
            const updateData = {};

            // Le statut peut être modifié indépendamment du lien
            if (status !== undefined) {
                if (!BOOKING_STATUSES.includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Statut de réservation invalide."
                    });
                }

                updateData.status = status;
            }

            // Le lien de visioconférence est facultatif
            if (meeting_link !== undefined) {
                if (
                    meeting_link !== null &&
                    meeting_link !== "" &&
                    !isValidHttpUrl(meeting_link)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Le lien de visioconférence est invalide."
                    });
                }

                updateData.meeting_link = meeting_link || null;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Aucune modification fournie."
                });
            }

            const { data, error } = await supabase
                .from("bookings")
                .update(updateData)
                .eq("id", bookingId)
                .is("archived_at", null)
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
            return serverError(
                res,
                "Impossible de modifier cette réservation.",
                error,
                "Erreur modification réservation :"
            );
        }
    }
);

/* =========================================================
   16. ADMIN : DÉPLACER UNE RÉSERVATION
========================================================= */

app.patch(
    "/api/creative-break/admin/bookings/:id/reschedule",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);
            const { date, time, message } = req.body || {};

            if (
                !isValidId(bookingId) ||
                !isValidDate(date) ||
                !isValidTime(time)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant, date ou heure invalide."
                });
            }

            // Récupérer la réservation actuelle
            const { data: booking, error: bookingError } = await supabase
                .from("bookings")
                .select("*")
                .eq("id", bookingId)
                .is("archived_at", null)
                .maybeSingle();

            if (bookingError) throw bookingError;

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Réservation introuvable."
                });
            }

            if (!["pending", "accepted"].includes(booking.status)) {
                return res.status(400).json({
                    success: false,
                    message: "Cette réservation ne peut pas être déplacée."
                });
            }

            const settings = await getProfessionalSettings();
            const timezone = settings?.timezone || DEFAULT_TIMEZONE;

            const startsAt = createLocalDateTime(date, time, timezone);

            if (!startsAt) {
                return res.status(400).json({
                    success: false,
                    message: "Nouvelle date ou heure invalide."
                });
            }

            const endsAt = startsAt.plus({
                minutes: BOOKING_DURATION
            });

            if (startsAt <= DateTime.now().setZone(timezone)) {
                return res.status(400).json({
                    success: false,
                    message: "La nouvelle date doit être dans le futur."
                });
            }

            if (!(await isWithinWorkingHours(startsAt, endsAt, timezone))) {
                return res.status(400).json({
                    success: false,
                    message: "La nouvelle heure ne correspond pas aux horaires de travail."
                });
            }

            if (!(await isValidBookingSlot(startsAt, timezone))) {
                return res.status(400).json({
                    success: false,
                    message: "La nouvelle heure doit correspondre à un créneau de 30 minutes."
                });
            }

            if (await hasUnavailabilityConflict(startsAt, endsAt)) {
                return res.status(409).json({
                    success: false,
                    message: "Cette période est bloquée par une indisponibilité."
                });
            }

            if (await hasBookingConflict(startsAt, endsAt, bookingId)) {
                return res.status(409).json({
                    success: false,
                    message: "Ce nouveau créneau est déjà réservé."
                });
            }

            // Mettre à jour la réservation
            const { data: updatedBooking, error: updateError } = await supabase
                .from("bookings")
                .update({
                    starts_at: startsAt.toUTC().toISO(),
                    ends_at: endsAt.toUTC().toISO()
                })
                .eq("id", bookingId)
                .select("*")
                .single();

            if (updateError) throw updateError;

            // Envoyer un email au client
            let emailResult = null;

            if (booking.client_email) {
                const customMessage = typeof message === "string"
                    ? message.trim().slice(0, 10000)
                    : "";

                const emailBody = [
                    `Bonjour ${booking.client_name || ""},`,
                    "",
                    "Votre rendez-vous a été reprogrammé.",
                    `Nouvelle date : ${startsAt.toFormat("dd/MM/yyyy")}`,
                    `Nouvelle heure : ${startsAt.toFormat("HH:mm")}`,
                    `Fuseau horaire : ${timezone}`,
                    "",
                    customMessage,
                    "",
                    "Cordialement,",
                    "Portfolio"
                ].filter(Boolean).join("\n");

                try {
                    emailResult = await sendAdminEmail({
                        recordType: "booking",
                        recordId: bookingId,
                        recipientEmail: booking.client_email,
                        subject: "Modification de votre rendez-vous",
                        body: emailBody,
                        emailType: "booking_rescheduled"
                    });
                } catch (emailError) {
                    emailResult = {
                        success: false,
                        message: emailError.message
                    };
                }
            }

            return res.json({
                success: true,
                message: "Réservation déplacée avec succès.",
                booking: updatedBooking,
                email: emailResult
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de déplacer cette réservation.",
                error,
                "Erreur déplacement réservation :"
            );
        }
    }
);

/* =========================================================
   17. ADMIN : ENVOYER UN EMAIL À UN CLIENT
========================================================= */

app.post(
    "/api/creative-break/admin/bookings/:id/email",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);
            const { subject, message, meeting_link } = req.body || {};

            if (!isValidId(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant de réservation invalide."
                });
            }

            const { data: booking, error } = await supabase
                .from("bookings")
                .select("*")
                .eq("id", bookingId)
                .maybeSingle();

            if (error) throw error;

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Réservation introuvable."
                });
            }

            if (
                typeof subject !== "string" ||
                typeof message !== "string" ||
                !subject.trim() ||
                !message.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Le sujet et le message sont obligatoires."
                });
            }

            if (subject.trim().length > 250 || message.trim().length > 15000) {
                return res.status(400).json({
                    success: false,
                    message: "Le sujet ou le message est trop long."
                });
            }

            let body = message.trim();

            if (meeting_link !== undefined && meeting_link !== "") {
                if (!isValidHttpUrl(meeting_link)) {
                    return res.status(400).json({
                        success: false,
                        message: "Le lien de visioconférence est invalide."
                    });
                }

                body += `\n\nLien de visioconférence : ${meeting_link}`;
            }

            const result = await sendAdminEmail({
                recordType: "booking",
                recordId: bookingId,
                recipientEmail: booking.client_email,
                subject: subject.trim(),
                body,
                emailType: "custom"
            });

            return res.json({
                success: true,
                message: "Email envoyé au client.",
                email: result
            });

        } catch (error) {
            return serverError(
                res,
                error.message || "Impossible d'envoyer l'email.",
                error,
                "Erreur email réservation :"
            );
        }
    }
);

/* =========================================================
   18. ADMIN : ARCHIVER UNE RÉSERVATION
========================================================= */

app.patch(
    "/api/creative-break/admin/bookings/:id/archive",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);

            if (!isValidId(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("bookings")
                .update({ archived_at: new Date().toISOString() })
                .eq("id", bookingId)
                .is("archived_at", null)
                .select("*")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Réservation introuvable ou déjà archivée."
                });
            }

            return res.json({
                success: true,
                message: "Réservation archivée.",
                booking: data
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible d'archiver la réservation.",
                error,
                "Erreur archivage réservation :"
            );
        }
    }
);

/* =========================================================
   19. ADMIN : RESTAURER UNE RÉSERVATION
========================================================= */

app.patch(
    "/api/creative-break/admin/bookings/:id/restore",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);

            if (!isValidId(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("bookings")
                .update({ archived_at: null })
                .eq("id", bookingId)
                .not("archived_at", "is", null)
                .select("*")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Réservation archivée introuvable."
                });
            }

            return res.json({
                success: true,
                message: "Réservation restaurée.",
                booking: data
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de restaurer la réservation.",
                error,
                "Erreur restauration réservation :"
            );
        }
    }
);

/* =========================================================
   20. ADMIN : SUPPRIMER DÉFINITIVEMENT UNE RÉSERVATION
========================================================= */

app.delete(
    "/api/creative-break/admin/bookings/:id",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);

            if (!isValidId(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("bookings")
                .delete()
                .eq("id", bookingId)
                .select("id")
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
                message: "Réservation supprimée définitivement."
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de supprimer la réservation.",
                error,
                "Erreur suppression réservation :"
            );
        }
    }
);

/* =========================================================
   21. ADMIN : HISTORIQUE EMAILS D'UNE RÉSERVATION
========================================================= */

app.get(
    "/api/creative-break/admin/bookings/:id/emails",
    requireAdmin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);

            if (!isValidId(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("admin_email_history")
                .select("*")
                .eq("record_type", "booking")
                .eq("record_id", String(bookingId))
                .order("created_at", { ascending: false });

            if (error) throw error;

            return res.json({
                success: true,
                emails: data || []
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de récupérer l'historique des emails.",
                error,
                "Erreur historique emails réservation :"
            );
        }
    }
);

/* =========================================================
   22. ADMIN : LIRE LES HORAIRES D'UNE DATE
========================================================= */

app.get(
    "/api/creative-break/admin/schedules/date",
    requireAdmin,
    async (req, res) => {
        try {
            const { date } = req.query;

            if (!isValidDate(date)) {
                return res.status(400).json({
                    success: false,
                    message: "Date invalide."
                });
            }

            const settings = await getProfessionalSettings();
            const timezone = settings?.timezone || DEFAULT_TIMEZONE;

            const result = await getSchedulesForDate(date, timezone);

            // Présenter les deux créneaux séparément
            const morning = result.customized
                ? {
                    enabled: result.override.morning_enabled,
                    start: result.override.morning_start || "",
                    end: result.override.morning_end || ""
                }
                : {
                    enabled: Boolean(result.schedules[0]),
                    start: result.schedules[0]?.start_time?.slice(0, 5) || "",
                    end: result.schedules[0]?.end_time?.slice(0, 5) || ""
                };

            const afternoon = result.customized
                ? {
                    enabled: result.override.afternoon_enabled,
                    start: result.override.afternoon_start || "",
                    end: result.override.afternoon_end || ""
                }
                : {
                    enabled: Boolean(result.schedules[1]),
                    start: result.schedules[1]?.start_time?.slice(0, 5) || "",
                    end: result.schedules[1]?.end_time?.slice(0, 5) || ""
                };

            return res.json({
                success: true,
                date,
                customized: result.customized,
                morning,
                afternoon
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de récupérer les horaires de cette date.",
                error,
                "Erreur lecture horaires date :"
            );
        }
    }
);

/* =========================================================
   23. ADMIN : ENREGISTRER LES HORAIRES D'UNE DATE
========================================================= */

app.put(
    "/api/creative-break/admin/schedules/date",
    requireAdmin,
    async (req, res) => {
        try {
            const {
                date,
                morning_enabled,
                morning_start,
                morning_end,
                afternoon_enabled,
                afternoon_start,
                afternoon_end
            } = req.body || {};

            if (!isValidDate(date)) {
                return res.status(400).json({
                    success: false,
                    message: "Date invalide."
                });
            }

            if (
                typeof morning_enabled !== "boolean" ||
                typeof afternoon_enabled !== "boolean"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Veuillez préciser l'état des deux créneaux."
                });
            }

            // Vérifier le créneau du matin
            if (
                morning_enabled &&
                (
                    !isValidTime(morning_start) ||
                    !isValidTime(morning_end) ||
                    morning_end <= morning_start
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Les horaires du matin sont invalides."
                });
            }

            // Vérifier le créneau de l'après-midi
            if (
                afternoon_enabled &&
                (
                    !isValidTime(afternoon_start) ||
                    !isValidTime(afternoon_end) ||
                    afternoon_end <= afternoon_start
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Les horaires de l'après-midi sont invalides."
                });
            }

            // Vérifier que l'après-midi commence après le matin
            if (
                morning_enabled &&
                afternoon_enabled &&
                timeToMinutes(afternoon_start) < timeToMinutes(morning_end)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "L'après-midi doit commencer après la fin du matin."
                });
            }

            // Préparer les horaires réellement activés
            const schedules = [];

            if (morning_enabled) {
                schedules.push({
                    start_time: morning_start,
                    end_time: morning_end
                });
            }

            if (afternoon_enabled) {
                schedules.push({
                    start_time: afternoon_start,
                    end_time: afternoon_end
                });
            }

            const settings = await getProfessionalSettings();
            const timezone = settings?.timezone || DEFAULT_TIMEZONE;

            // Ne pas invalider un rendez-vous déjà enregistré
            const incompatibleBookings =
                await checkExistingBookingsAgainstSchedules(
                    date,
                    schedules,
                    timezone
                );

            if (incompatibleBookings.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Certains rendez-vous existants ne correspondent plus aux nouveaux horaires.",
                    incompatibleBookings: incompatibleBookings.map(item => item.id)
                });
            }

            // Préparer les données à enregistrer
            const payload = {
                override_date: date,
                morning_enabled,
                morning_start: morning_enabled ? morning_start : null,
                morning_end: morning_enabled ? morning_end : null,
                afternoon_enabled,
                afternoon_start: afternoon_enabled ? afternoon_start : null,
                afternoon_end: afternoon_enabled ? afternoon_end : null,
                updated_at: new Date().toISOString()
            };

            // Créer ou remplacer la personnalisation
            const { data, error } = await supabase
                .from("availability_overrides")
                .upsert(payload, {
                    onConflict: "override_date"
                })
                .select("*")
                .single();

            if (error) throw error;

            return res.json({
                success: true,
                message: "Horaires personnalisés enregistrés.",
                schedule: data
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible d'enregistrer les horaires personnalisés.",
                error,
                "Erreur sauvegarde horaires :"
            );
        }
    }
);

/* =========================================================
   24. ADMIN : RÉINITIALISER LES HORAIRES D'UNE DATE
========================================================= */

app.delete(
    "/api/creative-break/admin/schedules/date/:date",
    requireAdmin,
    async (req, res) => {
        try {
            const { date } = req.params;

            if (!isValidDate(date)) {
                return res.status(400).json({
                    success: false,
                    message: "Date invalide."
                });
            }

            const settings = await getProfessionalSettings();
            const timezone = settings?.timezone || DEFAULT_TIMEZONE;

            // Récupérer les horaires hebdomadaires qui reprendront effet
            const day = DateTime.fromISO(date, { zone: timezone });

            const { data: weeklySchedules, error: weeklyError } = await supabase
                .from("availability")
                .select("start_time, end_time")
                .eq("weekday", day.weekday)
                .order("start_time");

            if (weeklyError) throw weeklyError;

            // Ne pas invalider les rendez-vous existants
            const incompatibleBookings =
                await checkExistingBookingsAgainstSchedules(
                    date,
                    weeklySchedules || [],
                    timezone
                );

            if (incompatibleBookings.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Les horaires habituels ne couvrent pas certains rendez-vous déjà enregistrés.",
                    incompatibleBookings: incompatibleBookings.map(item => item.id)
                });
            }

            const { error, count } = await supabase
                .from("availability_overrides")
                .delete({ count: "exact" })
                .eq("override_date", date);

            if (error) throw error;

            return res.json({
                success: true,
                message: "Les horaires habituels ont été restaurés.",
                deleted: count || 0
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de réinitialiser les horaires.",
                error,
                "Erreur réinitialisation horaires :"
            );
        }
    }
);

/* =========================================================
   25. ADMIN : CONSULTER LES INDISPONIBILITÉS
========================================================= */

app.get(
    "/api/creative-break/admin/unavailabilities",
    requireAdmin,
    async (req, res) => {
        try {
            const { data, error } = await supabase
                .from("unavailability_periods")
                .select("*")
                .order("starts_at", { ascending: true });

            if (error) throw error;

            return res.json({
                success: true,
                unavailabilities: data || []
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de récupérer les indisponibilités.",
                error,
                "Erreur liste indisponibilités :"
            );
        }
    }
);

/* =========================================================
   26. ADMIN : AJOUTER UN CONGÉ OU UNE INDISPONIBILITÉ
========================================================= */

app.post(
    "/api/creative-break/admin/unavailabilities",
    requireAdmin,
    async (req, res) => {
        try {
            const { starts_at, ends_at, description } = req.body || {};

            // Exiger des dates ISO avec un fuseau explicite
            const start = parseIsoWithTimezone(starts_at);
            const end = parseIsoWithTimezone(ends_at);

            if (
                !start ||
                !end ||
                end.toMillis() <= start.toMillis()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "La période d'indisponibilité est invalide. Utilisez des dates ISO avec fuseau horaire."
                });
            }

            if (
                description !== undefined &&
                (
                    typeof description !== "string" ||
                    description.length > 500
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "La description est trop longue."
                });
            }

            // Vérifier qu'aucun rendez-vous actif ne se trouve dans la période
            const { data: conflicts, error: conflictError } = await supabase
                .from("bookings")
                .select("id")
                .in("status", ["pending", "accepted"])
                .lt("starts_at", end.toUTC().toISO())
                .gt("ends_at", start.toUTC().toISO());

            if (conflictError) throw conflictError;

            if (conflicts?.length) {
                return res.status(409).json({
                    success: false,
                    message: "Cette période contient déjà un ou plusieurs rendez-vous.",
                    conflictingBookings: conflicts.map(item => item.id)
                });
            }

            // Enregistrer la période en UTC
            const { data, error } = await supabase
                .from("unavailability_periods")
                .insert({
                    starts_at: start.toUTC().toISO(),
                    ends_at: end.toUTC().toISO(),
                    description: description?.trim() ||
                        "Congé ou indisponibilité"
                })
                .select("*")
                .single();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                message: "Indisponibilité enregistrée.",
                unavailability: data
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible d'enregistrer cette indisponibilité.",
                error,
                "Erreur ajout indisponibilité :"
            );
        }
    }
);

/* =========================================================
   27. ADMIN : SUPPRIMER UNE INDISPONIBILITÉ
========================================================= */

app.delete(
    "/api/creative-break/admin/unavailabilities/:id",
    requireAdmin,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!isValidId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("unavailability_periods")
                .delete()
                .eq("id", id)
                .select("id")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Indisponibilité introuvable."
                });
            }

            return res.json({
                success: true,
                message: "Indisponibilité supprimée."
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de supprimer cette indisponibilité.",
                error,
                "Erreur suppression indisponibilité :"
            );
        }
    }
);

/* =========================================================
   28. ADMIN : CONSULTER LES MESSAGES
========================================================= */

app.get(
    "/api/creative-break/admin/messages",
    requireAdmin,
    async (req, res) => {
        try {
            let query = supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: false });

            if (req.query.archived === "true") {
                query = query.not("archived_at", "is", null);
            } else {
                query = query.is("archived_at", null);
            }

            const { data, error } = await query;

            if (error) throw error;

            return res.json({
                success: true,
                messages: data || []
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de récupérer les messages.",
                error,
                "Erreur chargement messages :"
            );
        }
    }
);

/* =========================================================
   29. ADMIN : MARQUER UN MESSAGE COMME LU
========================================================= */

app.patch(
    "/api/creative-break/admin/messages/:id/read",
    requireAdmin,
    async (req, res) => {
        try {
            const messageId = Number(req.params.id);

            if (!isValidId(messageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant de message invalide."
                });
            }

            const { data, error } = await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", messageId)
                .is("archived_at", null)
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
            return serverError(
                res,
                "Impossible de modifier le message.",
                error,
                "Erreur lecture message :"
            );
        }
    }
);

/* =========================================================
   30. ADMIN : RÉPONDRE À UN MESSAGE PAR EMAIL
========================================================= */

app.post(
    "/api/creative-break/admin/messages/:id/reply",
    requireAdmin,
    async (req, res) => {
        try {
            const messageId = Number(req.params.id);
            const { subject, message } = req.body || {};

            if (!isValidId(messageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant de message invalide."
                });
            }

            if (
                typeof subject !== "string" ||
                typeof message !== "string" ||
                !subject.trim() ||
                !message.trim() ||
                subject.trim().length > 250 ||
                message.trim().length > 15000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Le sujet ou la réponse est invalide."
                });
            }

            const { data: originalMessage, error } = await supabase
                .from("messages")
                .select("*")
                .eq("id", messageId)
                .maybeSingle();

            if (error) throw error;

            if (!originalMessage) {
                return res.status(404).json({
                    success: false,
                    message: "Message introuvable."
                });
            }

            const result = await sendAdminEmail({
                recordType: "message",
                recordId: messageId,
                recipientEmail: originalMessage.client_email,
                subject: subject.trim(),
                body: message.trim(),
                emailType: "message_reply"
            });

            // Marquer comme lu seulement après l'envoi réussi
            const { error: readError } = await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", messageId);

            if (readError) {
                console.error("Erreur marquage message lu :", readError);
            }

            return res.json({
                success: true,
                message: "Réponse envoyée au client.",
                email: result
            });

        } catch (error) {
            return serverError(
                res,
                error.message || "Impossible d'envoyer la réponse.",
                error,
                "Erreur réponse message :"
            );
        }
    }
);

/* =========================================================
   31. ADMIN : HISTORIQUE EMAILS D'UN MESSAGE
========================================================= */

app.get(
    "/api/creative-break/admin/messages/:id/emails",
    requireAdmin,
    async (req, res) => {
        try {
            const messageId = Number(req.params.id);

            if (!isValidId(messageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("admin_email_history")
                .select("*")
                .eq("record_type", "message")
                .eq("record_id", String(messageId))
                .order("created_at", { ascending: false });

            if (error) throw error;

            return res.json({
                success: true,
                emails: data || []
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de récupérer l'historique des emails.",
                error,
                "Erreur historique email message :"
            );
        }
    }
);

/* =========================================================
   32. ADMIN : ARCHIVER UN MESSAGE
========================================================= */

app.patch(
    "/api/creative-break/admin/messages/:id/archive",
    requireAdmin,
    async (req, res) => {
        try {
            const messageId = Number(req.params.id);

            if (!isValidId(messageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("messages")
                .update({ archived_at: new Date().toISOString() })
                .eq("id", messageId)
                .is("archived_at", null)
                .select("*")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Message introuvable ou déjà archivé."
                });
            }

            return res.json({
                success: true,
                message: "Message archivé.",
                data
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible d'archiver le message.",
                error,
                "Erreur archivage message :"
            );
        }
    }
);

/* =========================================================
   33. ADMIN : RESTAURER UN MESSAGE
========================================================= */

app.patch(
    "/api/creative-break/admin/messages/:id/restore",
    requireAdmin,
    async (req, res) => {
        try {
            const messageId = Number(req.params.id);

            if (!isValidId(messageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("messages")
                .update({ archived_at: null })
                .eq("id", messageId)
                .not("archived_at", "is", null)
                .select("*")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Message archivé introuvable."
                });
            }

            return res.json({
                success: true,
                message: "Message restauré.",
                data
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de restaurer le message.",
                error,
                "Erreur restauration message :"
            );
        }
    }
);

/* =========================================================
   34. ADMIN : SUPPRIMER DÉFINITIVEMENT UN MESSAGE
========================================================= */

app.delete(
    "/api/creative-break/admin/messages/:id",
    requireAdmin,
    async (req, res) => {
        try {
            const messageId = Number(req.params.id);

            if (!isValidId(messageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Identifiant invalide."
                });
            }

            const { data, error } = await supabase
                .from("messages")
                .delete()
                .eq("id", messageId)
                .select("id")
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
                message: "Message supprimé définitivement."
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de supprimer le message.",
                error,
                "Erreur suppression message :"
            );
        }
    }
);

/* =========================================================
   35. ADMIN : PARAMÈTRES PROFESSIONNELS
========================================================= */

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
            return serverError(
                res,
                "Impossible de récupérer les paramètres.",
                error,
                "Erreur paramètres :"
            );
        }
    }
);

/* =========================================================
   36. ADMIN : MODIFIER LE STATUT PROFESSIONNEL
========================================================= */

app.patch(
    "/api/creative-break/admin/settings/status",
    requireAdmin,
    async (req, res) => {
        try {
            const receivedStatus = req.body?.status;

            const status = typeof receivedStatus === "string"
                ? receivedStatus.trim()
                : "";

            if (!PROFESSIONAL_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Statut professionnel invalide.",
                    receivedStatus,
                    allowedStatuses: PROFESSIONAL_STATUSES
                });
            }

            const { data, error } = await supabase
                .from("professional_settings")
                .update({
                    professional_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq("id", 1)
                .select("professional_status, timezone")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Paramètres professionnels introuvables."
                });
            }

            return res.json({
                success: true,
                message: "Statut professionnel modifié avec succès.",
                settings: data
            });

        } catch (error) {
            return serverError(
                res,
                "Impossible de modifier le statut professionnel.",
                error,
                "Erreur modification statut :"
            );
        }
    }
);

/* =========================================================
   37. FORMULAIRE DE CONTACT
   ENREGISTREMENT SUPABASE + NOTIFICATION BREVO
========================================================= */

app.post("/api/contact", async (req, res) => {
    try {
        if (!checkSupabase(res)) return;

        const { name, email, message } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof message !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Veuillez remplir tous les champs."
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Veuillez fournir une adresse email valide."
            });
        }

        if (
            name.trim().length > 120 ||
            email.trim().length > 254 ||
            message.trim().length > 5000
        ) {
            return res.status(400).json({
                success: false,
                message: "Certains champs sont trop longs."
            });
        }

        // Enregistrer le message dans Supabase
        const { data: savedMessage, error } = await supabase
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

        if (error) throw error;

        // Le message reste enregistré même si Brevo n'est pas configuré
        if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
            return res.status(201).json({
                success: true,
                message: "Votre message a été enregistré avec succès !",
                id: savedMessage.id
            });
        }

        // Préparer la notification à l'administrateur
        const emailData = {
            sender: {
                name: "Portfolio",
                email: process.env.EMAIL_USER
            },
            to: [{ email: process.env.EMAIL_USER }],
            replyTo: { email: email.trim() },
            subject: `Nouveau message de ${name.trim()}`,
            textContent: [
                `Nom : ${name.trim()}`,
                `Email : ${email.trim()}`,
                "",
                "Message :",
                message.trim()
            ].join("\n")
        };

        try {
            const response = await fetch(
                "https://api.brevo.com/v3/smtp/email",
                {
                    method: "POST",
                    headers: {
                        accept: "application/json",
                        "api-key": process.env.BREVO_API_KEY,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify(emailData)
                }
            );

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                console.error(
                    "Notification Brevo non envoyée :",
                    result.message || response.status
                );
            }
        } catch (emailError) {
            // Ne pas perdre le message du client si Brevo est indisponible
            console.error("Erreur notification Brevo :", emailError.message);
        }

        return res.status(201).json({
            success: true,
            message: "Votre message a été envoyé avec succès !",
            id: savedMessage.id
        });

    } catch (error) {
        return serverError(
            res,
            "Une erreur est survenue lors de l'envoi du message.",
            error,
            "Erreur formulaire contact :"
        );
    }
});

/* =========================================================
   38. GESTION DES ERREURS ET DÉMARRAGE
========================================================= */

// Gérer les erreurs qui ne sont pas interceptées par les routes
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error("Erreur serveur non traitée :", error.message);

    return res.status(500).json({
        success: false,
        message: "Une erreur interne est survenue."
    });
});

// Démarrer le serveur
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend démarré sur le port ${PORT}`);
});
