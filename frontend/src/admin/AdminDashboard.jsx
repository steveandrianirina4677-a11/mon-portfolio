
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

// =====================================================
// 1. CONFIGURATION GÉNÉRALE
// =====================================================

// Adresse automatique du backend selon l'environnement.
const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://mon-portfolio-backend-twxs.onrender.com";
const TIMEZONE = "Indian/Antananarivo";

const BOOKING_STATUSES = {
    pending: "En attente",
    accepted: "Accepté",
    rejected: "Refusé",
    cancelled: "Annulé"
};

const PROFESSIONAL_STATUSES = [
    "Disponible",
    "En pause",
    "En traitement",
    "En conférence",
    "Hors ligne"
];

// Date actuelle au format YYYY-MM-DD, selon Madagascar.
function getToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

// Heure actuelle au format HH:mm.
function getCurrentTime() {
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(new Date());
}

// =====================================================
// 2. COMPOSANT PRINCIPAL
// =====================================================

export default function AdminDashboard({ session }) {

    // -------------------------------------------------
    // 2.1. États principaux
    // -------------------------------------------------

    const [bookings, setBookings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [settings, setSettings] = useState(null);
    const [unavailabilities, setUnavailabilities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // La page d'accueil est affichée en premier.
    const [activeTab, setActiveTab] = useState("overview");

    const [showArchivedBookings, setShowArchivedBookings] = useState(false);
    const [showArchivedMessages, setShowArchivedMessages] = useState(false);

    // Jeton de connexion Supabase.
    const token =
        session?.access_token ||
        session?.session?.access_token;

    // -------------------------------------------------
    // 2.2. États des formulaires
    // -------------------------------------------------

    const [meetingLinks, setMeetingLinks] = useState({});
    const [bookingEmails, setBookingEmails] = useState({});
    const [rescheduleForms, setRescheduleForms] = useState({});

    // Les réponses contiennent maintenant un sujet et un message.
    const [messageReplies, setMessageReplies] = useState({});

    const [emailHistory, setEmailHistory] = useState({});
    const [openedHistory, setOpenedHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [scheduleDate, setScheduleDate] = useState(getToday());

    const [scheduleForm, setScheduleForm] = useState({
        morning_enabled: true,
        morning_start: "09:00",
        morning_end: "13:00",
        afternoon_enabled: true,
        afternoon_start: "14:00",
        afternoon_end: "18:00"
    });

    const [scheduleCustomized, setScheduleCustomized] = useState(false);

    const [leaveForm, setLeaveForm] = useState({
        start_date: getToday(),
        start_time: "09:00",
        end_date: getToday(),
        end_time: "18:00",
        description: ""
    });

    // -------------------------------------------------
    // 2.3. Navigation du menu latéral
    // -------------------------------------------------

    const menuItems = [
        {
            id: "overview",
            icon: "⌂",
            title: "Accueil",
            description: "Indicateurs et progression de l’activité"
        },
        {
            id: "bookings",
            icon: "▣",
            title: "Gestion des rendez-vous",
            description: "Demandes, confirmations et modifications"
        },
        {
            id: "schedules",
            icon: "◷",
            title: "Gestion des disponibilités",
            description: "Horaires personnalisés par date"
        },
        {
            id: "leaves",
            icon: "▤",
            title: "Gestion des indisponibilités",
            description: "Congés et périodes bloquées"
        },
        {
            id: "messages",
            icon: "✉",
            title: "Centre de messagerie",
            description: "Messages clients et réponses"
        },
        {
            id: "history",
            icon: "↺",
            title: "Historique des communications",
            description: "Suivi des e-mails envoyés"
        },
        {
            id: "profile",
            icon: "◎",
            title: "Profil professionnel",
            description: "Statut et paramètres professionnels"
        }
    ];

    // -------------------------------------------------
    // 2.4. Requêtes sécurisées vers le backend
    // -------------------------------------------------

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        };
    }

    async function apiRequest(path, options = {}) {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...(options.headers || {})
            }
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.message || "Une erreur est survenue."
            );
        }

        return result;
    }

    // -------------------------------------------------
    // 2.5. Notifications
    // -------------------------------------------------

    function showSuccess(text) {
        setError("");
        setMessage(text);
    }

    function showError(err) {
        setMessage("");
        setError(
            typeof err === "string"
                ? err
                : err.message || "Une erreur est survenue."
        );
    }

    // -------------------------------------------------
    // 2.6. Chargement général des données
    // -------------------------------------------------

    async function loadDashboard(showLoader = true) {
        if (!token) {
            setError("Jeton de connexion introuvable.");
            setLoading(false);
            return;
        }

        try {
            if (showLoader) setLoading(true);
            setError("");

            const [
                bookingsData,
                settingsData,
                messagesData,
                leavesData
            ] = await Promise.all([
                apiRequest(
                    `/api/creative-break/admin/bookings${
                        showArchivedBookings ? "?archived=true" : ""
                    }`
                ),
                apiRequest("/api/creative-break/admin/settings"),
                apiRequest(
                    `/api/creative-break/admin/messages${
                        showArchivedMessages ? "?archived=true" : ""
                    }`
                ),
                apiRequest("/api/creative-break/admin/unavailabilities")
            ]);

            setBookings(
                Array.isArray(bookingsData.bookings)
                    ? bookingsData.bookings
                    : []
            );

            setSettings(settingsData.settings || null);

            setMessages(
                Array.isArray(messagesData.messages)
                    ? messagesData.messages
                    : []
            );

            setUnavailabilities(
                Array.isArray(leavesData.unavailabilities)
                    ? leavesData.unavailabilities
                    : []
            );

        } catch (err) {
            console.error("Erreur de chargement :", err);
            showError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, [token, showArchivedBookings, showArchivedMessages]);

    // -------------------------------------------------
    // 2.7. Fonctions de formatage
    // -------------------------------------------------

    function getClientName(item) {
        return String(
            item?.client_name ??
            item?.name ??
            "Nom non renseigné"
        ).trim();
    }

    function getClientEmail(item) {
        return String(
            item?.client_email ??
            item?.email ??
            ""
        ).trim();
    }

    function formatDate(date) {
        if (!date) return "Date inconnue";

        return new Date(date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: TIMEZONE
        });
    }

    function formatTime(date) {
        if (!date) return "--:--";

        return new Intl.DateTimeFormat("fr-FR", {
            timeZone: TIMEZONE,
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(date));
    }

    function formatMessageDate(date) {
        if (!date) return "Date inconnue";

        return new Date(date).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: TIMEZONE
        });
    }

    function translateStatus(status) {
        return BOOKING_STATUSES[status] || status || "Inconnu";
    }

    function formatPeriodDate(date) {
        return date ? formatMessageDate(date) : "Date inconnue";
    }

    // -------------------------------------------------
    // 2.8. Statistiques et progression
    // -------------------------------------------------

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        item => item.status === "pending"
    ).length;

    const acceptedBookings = bookings.filter(
        item => item.status === "accepted"
    ).length;

    const rejectedBookings = bookings.filter(
        item => item.status === "rejected"
    ).length;

    const totalMessages = messages.length;

    const unreadMessages = messages.filter(
        item => !item.is_read
    ).length;

    // Pourcentage de réservations acceptées.
    const acceptanceRate = totalBookings > 0
        ? Math.round((acceptedBookings / totalBookings) * 100)
        : 0;

    // Pourcentage de messages déjà lus.
    const readRate = totalMessages > 0
        ? Math.round(
            ((totalMessages - unreadMessages) / totalMessages) * 100
        )
        : 0;

    // -------------------------------------------------
    // 3. GESTION DES RÉSERVATIONS
    // -------------------------------------------------

    async function updateBooking(id, status) {
        try {
            setUpdating(`booking-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status })
                }
            );

            showSuccess(result.message || "Réservation modifiée.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // Enregistrer le lien de visioconférence.
    async function updateMeetingLink(booking) {
        const link = (
            meetingLinks[booking.id] ??
            booking.meeting_link ??
            ""
        ).trim();

        if (!link) {
            showError("Veuillez saisir un lien de visioconférence.");
            return;
        }

        try {
            new URL(link);

            setUpdating(`link-${booking.id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${booking.id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ meeting_link: link })
                }
            );

            showSuccess(result.message || "Lien enregistré.");
            await loadDashboard(false);

        } catch (err) {
            showError(
                err.message === "Invalid URL"
                    ? "Veuillez saisir une adresse URL valide."
                    : err
            );
        } finally {
            setUpdating(null);
        }
    }

    // Envoyer un e-mail personnalisé pour une réservation.
    async function sendBookingEmail(booking) {
        const email = bookingEmails[booking.id] || {};

        const subject = (email.subject || "").trim();
        const emailMessage = (email.message || "").trim();

        if (!subject || !emailMessage) {
            showError("Veuillez renseigner le sujet et le message.");
            return;
        }

        try {
            setUpdating(`email-${booking.id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${booking.id}/email`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        subject,
                        message: emailMessage
                    })
                }
            );

            showSuccess(result.message || "E-mail traité par le serveur.");

            setBookingEmails(previous => ({
                ...previous,
                [booking.id]: { subject: "", message: "" }
            }));

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // Déplacer un rendez-vous.
    // IMPORTANT : le backend attend date et time, pas starts_at et ends_at.
    async function rescheduleBooking(booking) {
        const form = rescheduleForms[booking.id] || {};

        if (!form.date || !form.time) {
            showError("Veuillez choisir une nouvelle date et une heure.");
            return;
        }

        try {
            setUpdating(`reschedule-${booking.id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${booking.id}/reschedule`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        date: form.date,
                        time: form.time,
                        message: form.message || ""
                    })
                }
            );

            showSuccess(result.message || "Rendez-vous déplacé.");

            setRescheduleForms(previous => ({
                ...previous,
                [booking.id]: {
                    date: "",
                    time: "",
                    message: ""
                }
            }));

            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function archiveBooking(id) {
        if (!window.confirm("Archiver cette réservation ?")) return;

        try {
            setUpdating(`archive-booking-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${id}/archive`,
                { method: "PATCH" }
            );

            showSuccess(result.message || "Réservation archivée.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function restoreBooking(id) {
        try {
            setUpdating(`restore-booking-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${id}/restore`,
                { method: "PATCH" }
            );

            showSuccess(result.message || "Réservation restaurée.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function deleteBooking(id) {
        if (!window.confirm("Supprimer définitivement cette réservation ?")) {
            return;
        }

        try {
            setUpdating(`delete-booking-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${id}`,
                { method: "DELETE" }
            );

            showSuccess(result.message || "Réservation supprimée.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // -------------------------------------------------
    // 4. HISTORIQUES DES E-MAILS
    // -------------------------------------------------

    async function loadBookingEmails(id) {
        try {
            setUpdating(`history-booking-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/bookings/${id}/emails`
            );

            setEmailHistory(previous => ({
                ...previous,
                [`booking-${id}`]: result.emails || []
            }));

            setOpenedHistory(`booking-${id}`);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function loadMessageEmails(id) {
        try {
            setUpdating(`history-message-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/messages/${id}/emails`
            );

            setEmailHistory(previous => ({
                ...previous,
                [`message-${id}`]: result.emails || []
            }));

            setOpenedHistory(`message-${id}`);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // Charger les historiques de chaque réservation et message.
    // Le backend ne possède pas encore de route globale d'historique.
    async function loadAllCommunicationHistory() {
        setHistoryLoading(true);
        setError("");

        try {
            const bookingHistoryRequests = bookings.map(async booking => {
                const result = await apiRequest(
                    `/api/creative-break/admin/bookings/${booking.id}/emails`
                );

                return {
                    key: `booking-${booking.id}`,
                    type: "Réservation",
                    client: getClientName(booking),
                    emails: result.emails || []
                };
            });

            const messageHistoryRequests = messages.map(async item => {
                const result = await apiRequest(
                    `/api/creative-break/admin/messages/${item.id}/emails`
                );

                return {
                    key: `message-${item.id}`,
                    type: "Message",
                    client: getClientName(item),
                    emails: result.emails || []
                };
            });

            const results = await Promise.allSettled([
                ...bookingHistoryRequests,
                ...messageHistoryRequests
            ]);

            const historyMap = {};
            const allHistory = [];

            results.forEach(result => {
                if (result.status !== "fulfilled") return;

                const item = result.value;
                historyMap[item.key] = item.emails;

                item.emails.forEach(email => {
                    allHistory.push({
                        ...email,
                        communication_type: item.type,
                        client_name: item.client,
                        source_key: item.key
                    });
                });
            });

            allHistory.sort((a, b) =>
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
            );

            setEmailHistory(historyMap);
            setGlobalHistory(allHistory);

        } catch (err) {
            showError(err);
        } finally {
            setHistoryLoading(false);
        }
    }

    const [globalHistory, setGlobalHistory] = useState([]);

    useEffect(() => {
        if (activeTab === "history" && token) {
            loadAllCommunicationHistory();
        }
    }, [activeTab, token, bookings, messages]);

    // -------------------------------------------------
    // 5. STATUT PROFESSIONNEL
    // -------------------------------------------------

    async function updateProfessionalStatus(status) {
        try {
            setUpdating("professional-status");

            const result = await apiRequest(
                "/api/creative-break/admin/settings/status",
                {
                    method: "PATCH",
                    body: JSON.stringify({ status })
                }
            );

            setSettings(result.settings || {
                ...settings,
                professional_status: status
            });

            showSuccess(result.message || "Statut professionnel modifié.");

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // -------------------------------------------------
    // 6. GESTION DES HORAIRES PERSONNALISÉS
    // -------------------------------------------------

    async function loadDateSchedule(date = scheduleDate) {
        if (!date) return;

        try {
            setUpdating("schedule");

            const result = await apiRequest(
                `/api/creative-break/admin/schedules/date?date=${encodeURIComponent(date)}`
            );

            // Le serveur renvoie morning et afternoon sous forme d'objets.
            // On les convertit vers les champs utilisés par le formulaire.
            const morning = result.morning || {};
            const afternoon = result.afternoon || {};

            setScheduleForm({
                morning_enabled: Boolean(morning.enabled),
                morning_start: morning.start || "09:00",
                morning_end: morning.end || "13:00",
                afternoon_enabled: Boolean(afternoon.enabled),
                afternoon_start: afternoon.start || "14:00",
                afternoon_end: afternoon.end || "18:00"
            });

            setScheduleCustomized(Boolean(result.customized));

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    useEffect(() => {
        if (token && scheduleDate) {
            loadDateSchedule(scheduleDate);
        }
    }, [token, scheduleDate]);

    function updateScheduleField(field, value) {
        setScheduleForm(previous => ({
            ...previous,
            [field]: value
        }));
    }

    async function saveDateSchedule() {
        if (!scheduleDate) {
            showError("Veuillez choisir une date.");
            return;
        }

        if (
            !scheduleForm.morning_enabled &&
            !scheduleForm.afternoon_enabled
        ) {
            showError(
                "Activez au moins une période ou utilisez la suppression de la personnalisation."
            );
            return;
        }

        try {
            setUpdating("schedule-save");

            const result = await apiRequest(
                "/api/creative-break/admin/schedules/date",
                {
                    method: "PUT",
                    body: JSON.stringify({
                        date: scheduleDate,
                        ...scheduleForm
                    })
                }
            );

            showSuccess(
                result.message || "Horaires personnalisés enregistrés."
            );

            setScheduleCustomized(true);
            await loadDateSchedule(scheduleDate);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function resetDateSchedule() {
        if (!window.confirm(
            "Revenir aux horaires habituels pour cette date ?"
        )) return;

        try {
            setUpdating("schedule-reset");

            const result = await apiRequest(
                `/api/creative-break/admin/schedules/date/${scheduleDate}`,
                { method: "DELETE" }
            );

            showSuccess(
                result.message || "Horaires habituels rétablis."
            );

            await loadDateSchedule(scheduleDate);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // -------------------------------------------------
    // 7. GESTION DES CONGÉS ET INDISPONIBILITÉS
    // -------------------------------------------------

    async function loadUnavailabilities() {
        try {
            const result = await apiRequest(
                "/api/creative-break/admin/unavailabilities"
            );

            setUnavailabilities(
                Array.isArray(result.unavailabilities)
                    ? result.unavailabilities
                    : []
            );
        } catch (err) {
            showError(err);
        }
    }

    async function addUnavailability(event) {
        event.preventDefault();

        const startsAt = new Date(
            `${leaveForm.start_date}T${leaveForm.start_time}:00+03:00`
        );

        const endsAt = new Date(
            `${leaveForm.end_date}T${leaveForm.end_time}:00+03:00`
        );

        if (
            Number.isNaN(startsAt.getTime()) ||
            Number.isNaN(endsAt.getTime()) ||
            endsAt <= startsAt
        ) {
            showError("La période d'indisponibilité est incorrecte.");
            return;
        }

        try {
            setUpdating("leave-save");

            const result = await apiRequest(
                "/api/creative-break/admin/unavailabilities",
                {
                    method: "POST",
                    body: JSON.stringify({
                        starts_at: startsAt.toISOString(),
                        ends_at: endsAt.toISOString(),
                        description: leaveForm.description
                    })
                }
            );

            showSuccess(
                result.message || "Indisponibilité enregistrée."
            );

            setLeaveForm({
                start_date: getToday(),
                start_time: "09:00",
                end_date: getToday(),
                end_time: "18:00",
                description: ""
            });

            await loadUnavailabilities();

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function deleteUnavailability(id) {
        if (!window.confirm("Supprimer cette indisponibilité ?")) return;

        try {
            setUpdating(`leave-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/unavailabilities/${id}`,
                { method: "DELETE" }
            );

            showSuccess(result.message || "Indisponibilité supprimée.");
            await loadUnavailabilities();

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // -------------------------------------------------
    // 8. GESTION DES MESSAGES
    // -------------------------------------------------

    async function markMessageAsRead(id) {
        try {
            setUpdating(`read-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/messages/${id}/read`,
                { method: "PATCH" }
            );

            showSuccess(result.message || "Message marqué comme lu.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // Le backend exige maintenant un sujet ET un message.
    async function replyToMessage(item) {
        const reply = messageReplies[item.id] || {};
        const subject = (reply.subject || "").trim();
        const replyMessage = (reply.message || "").trim();

        if (!subject || !replyMessage) {
            showError("Veuillez renseigner le sujet et la réponse.");
            return;
        }

        if (!getClientEmail(item)) {
            showError("Ce client ne possède pas d'adresse e-mail.");
            return;
        }

        try {
            setUpdating(`reply-${item.id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/messages/${item.id}/reply`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        subject,
                        message: replyMessage
                    })
                }
            );

            showSuccess(result.message || "Réponse traitée par le serveur.");

            setMessageReplies(previous => ({
                ...previous,
                [item.id]: { subject: "", message: "" }
            }));

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function archiveMessage(id) {
        if (!window.confirm("Archiver ce message ?")) return;

        try {
            setUpdating(`archive-message-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/messages/${id}/archive`,
                { method: "PATCH" }
            );

            showSuccess(result.message || "Message archivé.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function restoreMessage(id) {
        try {
            setUpdating(`restore-message-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/messages/${id}/restore`,
                { method: "PATCH" }
            );

            showSuccess(result.message || "Message restauré.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    async function deleteMessage(id) {
        if (!window.confirm("Supprimer définitivement ce message ?")) {
            return;
        }

        try {
            setUpdating(`delete-message-${id}`);

            const result = await apiRequest(
                `/api/creative-break/admin/messages/${id}`,
                { method: "DELETE" }
            );

            showSuccess(result.message || "Message supprimé.");
            await loadDashboard(false);

        } catch (err) {
            showError(err);
        } finally {
            setUpdating(null);
        }
    }

    // -------------------------------------------------
    // 9. AFFICHAGE D'UN HISTORIQUE
    // -------------------------------------------------

    function renderEmailHistory(historyKey) {
        const emails = emailHistory[historyKey] || [];

        return (
            <div className="email-history">
                <h4>Historique des e-mails</h4>

                {emails.length === 0 ? (
                    <p>Aucun e-mail enregistré.</p>
                ) : (
                    emails.map(email => (
                        <article key={email.id}>
                            <strong>{email.subject}</strong>
                            <p>{formatMessageDate(email.created_at)}</p>
                            <p>Statut : {email.email_status}</p>
                            <p>{email.body}</p>
                        </article>
                    ))
                )}
            </div>
        );
    }

    // -------------------------------------------------
    // 10. ÉCRAN DE CHARGEMENT
    // -------------------------------------------------

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-content">
                    <span className="admin-loader"></span>
                    <p>Chargement de votre espace administrateur...</p>
                </div>
            </div>
        );
    }

    // =====================================================
    // 11. AFFICHAGE PRINCIPAL
    // =====================================================

    return (
        <div className="admin-dashboard">

            {/* Menu latéral de navigation */}
            <aside className="admin-sidebar">

                <div className="sidebar-brand">
                    <div className="sidebar-logo">CB</div>
                    <div>
                        <strong>CREATIVE BREAK</strong>
                        <span>Administration</span>
                    </div>
                </div>

                <div className="sidebar-caption">
                    MENU PRINCIPAL
                </div>

                <nav className="sidebar-navigation">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={
                                activeTab === item.id
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                            onClick={() => {
                                setActiveTab(item.id);
                                setError("");
                                setMessage("");
                            }}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-link-text">
                                <strong>{item.title}</strong>
                                <small>{item.description}</small>
                            </span>

                            {item.id === "messages" && unreadMessages > 0 && (
                                <span className="sidebar-badge">
                                    {unreadMessages}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <span className="sidebar-status-dot"></span>
                    <span>Espace administrateur</span>
                </div>
            </aside>

            {/* Zone principale */}
            <main className="admin-main">

                {/* En-tête */}
                <header className="dashboard-header">

                    <div>
                        <span className="dashboard-label">
                            ESPACE ADMINISTRATEUR
                        </span>

                        <h1>
                            {menuItems.find(item => item.id === activeTab)?.title}
                        </h1>

                        <p>
                            {menuItems.find(item => item.id === activeTab)?.description}
                        </p>
                    </div>

                    <div className="header-actions">
                        <div className="header-date">
                            <span>{formatDate(new Date())}</span>
                            <strong>{getCurrentTime()} · Madagascar</strong>
                        </div>

                        <button
                            className="refresh-button"
                            onClick={() => loadDashboard()}
                            disabled={loading}
                        >
                            ↻ Actualiser
                        </button>
                    </div>
                </header>

                {/* Notifications */}
                {error && (
                    <div className="dashboard-alert error">
                        {error}
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {message && (
                    <div className="dashboard-alert success">
                        {message}
                        <button onClick={() => setMessage("")}>×</button>
                    </div>
                )}

                {/* =================================================
                    RUBRIQUE 1 : ACCUEIL
                ================================================= */}

                {activeTab === "overview" && (
                    <section className="overview-section">

                        <div className="welcome-panel">
                            <div>
                                <span className="welcome-eyebrow">
                                    VOTRE ESPACE DE PILOTAGE
                                </span>
                                <h2>Bienvenue dans votre espace administrateur</h2>
                                <p>
                                    Retrouvez ici les indicateurs de votre activité
                                    et accédez rapidement à vos outils de gestion.
                                </p>
                            </div>

                            <div className="welcome-symbol">✦</div>
                        </div>

                        <div className="dashboard-stats">

                            <div className="stat-card">
                                <span>Total des réservations</span>
                                <strong>{totalBookings}</strong>
                                <small>Toutes les réservations affichées</small>
                            </div>

                            <div className="stat-card">
                                <span>En attente</span>
                                <strong>{pendingBookings}</strong>
                                <small>Demandes à traiter</small>
                            </div>

                            <div className="stat-card">
                                <span>Rendez-vous acceptés</span>
                                <strong>{acceptedBookings}</strong>
                                <small>Réservations confirmées</small>
                            </div>

                            <div className="stat-card">
                                <span>Messages non lus</span>
                                <strong>{unreadMessages}</strong>
                                <small>Messages nécessitant votre attention</small>
                            </div>

                        </div>

                        <div className="progress-section">
                            <div className="section-heading">
                                <div>
                                    <h2>Progression de votre activité</h2>
                                    <p>Indicateurs calculés à partir des données chargées.</p>
                                </div>
                            </div>

                            <div className="progress-grid">

                                <article className="progress-card">
                                    <div className="progress-heading">
                                        <div>
                                            <strong>Taux d'acceptation</strong>
                                            <p>Réservations acceptées</p>
                                        </div>
                                        <strong>{acceptanceRate}%</strong>
                                    </div>

                                    <div className="progress-track">
                                        <div
                                            className="progress-fill blue"
                                            style={{ width: `${acceptanceRate}%` }}
                                        ></div>
                                    </div>

                                    <small>
                                        {acceptedBookings} acceptée(s) sur {totalBookings}
                                    </small>
                                </article>

                                <article className="progress-card">
                                    <div className="progress-heading">
                                        <div>
                                            <strong>Messages consultés</strong>
                                            <p>Messages déjà lus</p>
                                        </div>
                                        <strong>{readRate}%</strong>
                                    </div>

                                    <div className="progress-track">
                                        <div
                                            className="progress-fill green"
                                            style={{ width: `${readRate}%` }}
                                        ></div>
                                    </div>

                                    <small>
                                        {totalMessages - unreadMessages} lu(s) sur {totalMessages}
                                    </small>
                                </article>

                            </div>
                        </div>

                        <div className="overview-bottom-grid">

                            <article className="overview-card">
                                <h3>État des réservations</h3>

                                <div className="overview-line">
                                    <span>En attente</span>
                                    <strong>{pendingBookings}</strong>
                                </div>

                                <div className="overview-line">
                                    <span>Acceptées</span>
                                    <strong>{acceptedBookings}</strong>
                                </div>

                                <div className="overview-line">
                                    <span>Refusées</span>
                                    <strong>{rejectedBookings}</strong>
                                </div>
                            </article>

                            <article className="overview-card">
                                <h3>Accès rapide</h3>

                                <button onClick={() => setActiveTab("bookings")}>
                                    Gérer les rendez-vous →
                                </button>

                                <button onClick={() => setActiveTab("messages")}>
                                    Consulter les messages →
                                </button>

                                <button onClick={() => setActiveTab("schedules")}>
                                    Modifier mes disponibilités →
                                </button>
                            </article>

                        </div>

                    </section>
                )}

                {/* =================================================
                    RUBRIQUE 2 : RENDEZ-VOUS
                ================================================= */}

                {activeTab === "bookings" && (
                    <section className="bookings-section">

                        <div className="section-heading">
                            <div>
                                <h2>
                                    {showArchivedBookings
                                        ? "Réservations archivées"
                                        : "Mes réservations"}
                                </h2>
                                <p>
                                    Consultez les demandes, confirmez les rendez-vous
                                    et gérez les visioconférences.
                                </p>
                            </div>

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setShowArchivedBookings(previous => !previous)
                                }
                            >
                                {showArchivedBookings
                                    ? "Voir les réservations actives"
                                    : "Voir les archives"}
                            </button>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="empty-bookings">
                                Aucune réservation à afficher.
                            </div>
                        ) : (
                            <div className="bookings-list">

                                {bookings.map(booking => (
                                    <article className="booking-card" key={booking.id}>

                                        <div className="booking-top">
                                            <div>
                                                <h3>{getClientName(booking)}</h3>
                                                <span className="booking-id">
                                                    Réservation #{booking.id}
                                                </span>
                                            </div>

                                            <span className={`booking-status ${booking.status}`}>
                                                {translateStatus(booking.status)}
                                            </span>
                                        </div>

                                        <div className="booking-information">
                                            <p>
                                                <strong>Email :</strong>{" "}
                                                {getClientEmail(booking) || "Non renseigné"}
                                            </p>

                                            <p>
                                                <strong>Téléphone :</strong>{" "}
                                                {booking.client_phone || "Non renseigné"}
                                            </p>

                                            <p>
                                                <strong>Date :</strong>{" "}
                                                {formatDate(booking.starts_at)}
                                            </p>

                                            <p>
                                                <strong>Heure :</strong>{" "}
                                                {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                                                {" (Madagascar)"}
                                            </p>

                                            <p>
                                                <strong>Projet :</strong><br />
                                                {booking.project_details || "Aucune précision."}
                                            </p>

                                            {booking.meeting_link && (
                                                <p>
                                                    <strong>Visioconférence :</strong>{" "}
                                                    <a
                                                        href={booking.meeting_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Ouvrir le lien
                                                    </a>
                                                </p>
                                            )}
                                        </div>

                                        {!showArchivedBookings && (
                                            <>
                                                {booking.status === "pending" && (
                                                    <div className="booking-actions">
                                                        <button
                                                            className="accept-button"
                                                            disabled={updating === `booking-${booking.id}`}
                                                            onClick={() => updateBooking(booking.id, "accepted")}
                                                        >
                                                            Accepter
                                                        </button>

                                                        <button
                                                            className="reject-button"
                                                            disabled={updating === `booking-${booking.id}`}
                                                            onClick={() => updateBooking(booking.id, "rejected")}
                                                        >
                                                            Refuser
                                                        </button>
                                                    </div>
                                                )}

                                                {booking.status === "accepted" && (
                                                    <div className="meeting-link-form">
                                                        <h4>Visioconférence</h4>
                                                        <label>Lien Google Meet, Zoom ou autre</label>

                                                        <input
                                                            type="url"
                                                            placeholder="https://meet.google.com/..."
                                                            value={
                                                                meetingLinks[booking.id] ??
                                                                booking.meeting_link ??
                                                                ""
                                                            }
                                                            onChange={event =>
                                                                setMeetingLinks(previous => ({
                                                                    ...previous,
                                                                    [booking.id]: event.target.value
                                                                }))
                                                            }
                                                        />

                                                        <button
                                                            className="save-link-button"
                                                            disabled={updating === `link-${booking.id}`}
                                                            onClick={() => updateMeetingLink(booking)}
                                                        >
                                                            Enregistrer le lien
                                                        </button>
                                                    </div>
                                                )}

                                                {booking.status !== "rejected" &&
                                                    booking.status !== "cancelled" && (
                                                    <div className="admin-action-panel">
                                                        <h4>Déplacer le rendez-vous</h4>

                                                        <label>Nouvelle date</label>
                                                        <input
                                                            type="date"
                                                            min={getToday()}
                                                            value={rescheduleForms[booking.id]?.date || ""}
                                                            onChange={event =>
                                                                setRescheduleForms(previous => ({
                                                                    ...previous,
                                                                    [booking.id]: {
                                                                        ...previous[booking.id],
                                                                        date: event.target.value
                                                                    }
                                                                }))
                                                            }
                                                        />

                                                        <label>Nouvelle heure</label>
                                                        <input
                                                            type="time"
                                                            value={rescheduleForms[booking.id]?.time || ""}
                                                            onChange={event =>
                                                                setRescheduleForms(previous => ({
                                                                    ...previous,
                                                                    [booking.id]: {
                                                                        ...previous[booking.id],
                                                                        time: event.target.value
                                                                    }
                                                                }))
                                                            }
                                                        />

                                                        <label>Message à envoyer au client</label>
                                                        <textarea
                                                            rows="3"
                                                            placeholder="Expliquez le changement au client..."
                                                            value={rescheduleForms[booking.id]?.message || ""}
                                                            onChange={event =>
                                                                setRescheduleForms(previous => ({
                                                                    ...previous,
                                                                    [booking.id]: {
                                                                        ...previous[booking.id],
                                                                        message: event.target.value
                                                                    }
                                                                }))
                                                            }
                                                        />

                                                        <button
                                                            className="save-link-button"
                                                            disabled={updating === `reschedule-${booking.id}`}
                                                            onClick={() => rescheduleBooking(booking)}
                                                        >
                                                            Déplacer le rendez-vous
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="admin-action-panel">
                                                    <h4>Envoyer un e-mail au client</h4>

                                                    <label>Sujet de l'e-mail</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Sujet de l'e-mail"
                                                        value={bookingEmails[booking.id]?.subject || ""}
                                                        onChange={event =>
                                                            setBookingEmails(previous => ({
                                                                ...previous,
                                                                [booking.id]: {
                                                                    ...previous[booking.id],
                                                                    subject: event.target.value
                                                                }
                                                            }))
                                                        }
                                                    />

                                                    <label>Message</label>
                                                    <textarea
                                                        rows="4"
                                                        placeholder="Écrivez votre message..."
                                                        value={bookingEmails[booking.id]?.message || ""}
                                                        onChange={event =>
                                                            setBookingEmails(previous => ({
                                                                ...previous,
                                                                [booking.id]: {
                                                                    ...previous[booking.id],
                                                                    message: event.target.value
                                                                }
                                                            }))
                                                        }
                                                    />

                                                    <button
                                                        className="save-link-button"
                                                        disabled={updating === `email-${booking.id}`}
                                                        onClick={() => sendBookingEmail(booking)}
                                                    >
                                                        Envoyer l'e-mail
                                                    </button>
                                                </div>

                                                <div className="admin-card-actions">
                                                    <button
                                                        className="secondary-button"
                                                        onClick={() => loadBookingEmails(booking.id)}
                                                    >
                                                        Historique des e-mails
                                                    </button>

                                                    <button
                                                        className="secondary-button"
                                                        disabled={updating === `archive-booking-${booking.id}`}
                                                        onClick={() => archiveBooking(booking.id)}
                                                    >
                                                        Archiver
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {showArchivedBookings && (
                                            <div className="admin-card-actions">
                                                <button
                                                    className="accept-button"
                                                    onClick={() => restoreBooking(booking.id)}
                                                >
                                                    Restaurer
                                                </button>

                                                <button
                                                    className="reject-button"
                                                    onClick={() => deleteBooking(booking.id)}
                                                >
                                                    Supprimer définitivement
                                                </button>
                                            </div>
                                        )}

                                        {openedHistory === `booking-${booking.id}` &&
                                            renderEmailHistory(`booking-${booking.id}`)}

                                    </article>
                                ))}

                            </div>
                        )}
                    </section>
                )}

                {/* =================================================
                    RUBRIQUE 3 : DISPONIBILITÉS
                ================================================= */}

                {activeTab === "schedules" && (
                    <section className="schedule-section">

                        <div className="section-heading">
                            <div>
                                <h2>Horaires personnalisés</h2>
                                <p>
                                    Modifiez les horaires d'une date précise sans
                                    modifier les horaires habituels des autres jours.
                                </p>
                            </div>
                        </div>

                        <div className="admin-action-panel">
                            <label>Choisir une date</label>

                            <input
                                type="date"
                                value={scheduleDate}
                                onChange={event => setScheduleDate(event.target.value)}
                            />

                            <p className="schedule-info">
                                Les modifications concernent uniquement cette date.
                                Les horaires habituels restent inchangés pour les autres jours.
                            </p>

                            <div className="schedule-period">
                                <h3>Créneau du matin</h3>

                                <label className="schedule-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={scheduleForm.morning_enabled}
                                        onChange={event =>
                                            updateScheduleField("morning_enabled", event.target.checked)
                                        }
                                    />
                                    Activer le créneau du matin
                                </label>

                                {scheduleForm.morning_enabled && (
                                    <div className="schedule-time-fields">
                                        <div>
                                            <label>Heure de début</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.morning_start}
                                                onChange={event =>
                                                    updateScheduleField("morning_start", event.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label>Heure de fin</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.morning_end}
                                                onChange={event =>
                                                    updateScheduleField("morning_end", event.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="schedule-period">
                                <h3>Créneau de l'après-midi</h3>

                                <label className="schedule-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={scheduleForm.afternoon_enabled}
                                        onChange={event =>
                                            updateScheduleField("afternoon_enabled", event.target.checked)
                                        }
                                    />
                                    Activer le créneau de l'après-midi
                                </label>

                                {scheduleForm.afternoon_enabled && (
                                    <div className="schedule-time-fields">
                                        <div>
                                            <label>Heure de début</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.afternoon_start}
                                                onChange={event =>
                                                    updateScheduleField("afternoon_start", event.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label>Heure de fin</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.afternoon_end}
                                                onChange={event =>
                                                    updateScheduleField("afternoon_end", event.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="admin-card-actions">
                                <button
                                    className="save-link-button"
                                    disabled={updating === "schedule-save"}
                                    onClick={saveDateSchedule}
                                >
                                    Enregistrer les horaires
                                </button>

                                {scheduleCustomized && (
                                    <button
                                        className="reject-button"
                                        disabled={updating === "schedule-reset"}
                                        onClick={resetDateSchedule}
                                    >
                                        Rétablir les horaires habituels
                                    </button>
                                )}
                            </div>

                            {scheduleCustomized && (
                                <p className="schedule-info">
                                    Cette date possède des horaires personnalisés.
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* =================================================
                    RUBRIQUE 4 : INDISPONIBILITÉS
                ================================================= */}

                {activeTab === "leaves" && (
                    <section className="leave-section">

                        <div className="section-heading">
                            <div>
                                <h2>Congés et indisponibilités</h2>
                                <p>
                                    Bloquez une journée, plusieurs jours ou une partie
                                    d'une journée.
                                </p>
                            </div>
                        </div>

                        <form
                            className="admin-action-panel leave-form"
                            onSubmit={addUnavailability}
                        >
                            <h3>Ajouter une indisponibilité</h3>

                            <div className="schedule-time-fields">
                                <div>
                                    <label>Date de début</label>
                                    <input
                                        type="date"
                                        required
                                        value={leaveForm.start_date}
                                        onChange={event =>
                                            setLeaveForm(previous => ({
                                                ...previous,
                                                start_date: event.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Heure de début</label>
                                    <input
                                        type="time"
                                        required
                                        value={leaveForm.start_time}
                                        onChange={event =>
                                            setLeaveForm(previous => ({
                                                ...previous,
                                                start_time: event.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Date de fin</label>
                                    <input
                                        type="date"
                                        required
                                        min={leaveForm.start_date}
                                        value={leaveForm.end_date}
                                        onChange={event =>
                                            setLeaveForm(previous => ({
                                                ...previous,
                                                end_date: event.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Heure de fin</label>
                                    <input
                                        type="time"
                                        required
                                        value={leaveForm.end_time}
                                        onChange={event =>
                                            setLeaveForm(previous => ({
                                                ...previous,
                                                end_time: event.target.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <label>Motif (facultatif)</label>
                            <input
                                type="text"
                                placeholder="Exemple : congé, rendez-vous personnel..."
                                value={leaveForm.description}
                                onChange={event =>
                                    setLeaveForm(previous => ({
                                        ...previous,
                                        description: event.target.value
                                    }))
                                }
                            />

                            <button
                                type="submit"
                                className="save-link-button"
                                disabled={updating === "leave-save"}
                            >
                                Enregistrer l'indisponibilité
                            </button>
                        </form>

                        <div className="section-heading">
                            <h3>Mes périodes bloquées</h3>
                        </div>

                        {unavailabilities.length === 0 ? (
                            <div className="empty-bookings">
                                Aucune indisponibilité enregistrée.
                            </div>
                        ) : (
                            <div className="leave-list">
                                {unavailabilities.map(item => (
                                    <article className="leave-card" key={item.id}>
                                        <div>
                                            <h4>{item.description || "Indisponibilité"}</h4>
                                            <p>
                                                <strong>Début :</strong>{" "}
                                                {formatPeriodDate(item.starts_at)}
                                            </p>
                                            <p>
                                                <strong>Fin :</strong>{" "}
                                                {formatPeriodDate(item.ends_at)}
                                            </p>
                                        </div>

                                        <button
                                            className="reject-button"
                                            disabled={updating === `leave-${item.id}`}
                                            onClick={() => deleteUnavailability(item.id)}
                                        >
                                            Supprimer
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* =================================================
                    RUBRIQUE 5 : MESSAGERIE
                ================================================= */}

                {activeTab === "messages" && (
                    <section className="messages-section">

                        <div className="section-heading">
                            <div>
                                <h2>
                                    {showArchivedMessages
                                        ? "Messages archivés"
                                        : "Messages reçus"}
                                </h2>
                                <p>
                                    Consultez les messages et répondez aux clients.
                                </p>
                            </div>

                            <div className="admin-card-actions">
                                <span className="unread-counter">
                                    {unreadMessages} non lu(s)
                                </span>

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowArchivedMessages(previous => !previous)
                                    }
                                >
                                    {showArchivedMessages
                                        ? "Voir les messages actifs"
                                        : "Voir les archives"}
                                </button>
                            </div>
                        </div>

                        {messages.length === 0 ? (
                            <div className="empty-bookings">
                                Aucun message à afficher.
                            </div>
                        ) : (
                            <div className="messages-list">
                                {messages.map(item => {
                                    const clientName = getClientName(item);
                                    const clientEmail = getClientEmail(item);
                                    const reply = messageReplies[item.id] || {};

                                    return (
                                        <article
                                            className={`message-card ${
                                                item.is_read ? "message-read" : "message-unread"
                                            }`}
                                            key={item.id}
                                        >
                                            <div className="message-top">
                                                <div>
                                                    <h3>{clientName}</h3>
                                                    <span className="message-date">
                                                        {formatMessageDate(item.created_at)}
                                                    </span>
                                                </div>

                                                <span className={
                                                    item.is_read
                                                        ? "message-status read"
                                                        : "message-status unread"
                                                }>
                                                    {item.is_read ? "Lu" : "Non lu"}
                                                </span>
                                            </div>

                                            <div className="message-information">
                                                <p>
                                                    <strong>Email :</strong>{" "}
                                                    {clientEmail ? (
                                                        <a href={`mailto:${clientEmail}`}>
                                                            {clientEmail}
                                                        </a>
                                                    ) : "Non renseigné"}
                                                </p>

                                                {item.client_phone && (
                                                    <p>
                                                        <strong>Téléphone :</strong>{" "}
                                                        {item.client_phone}
                                                    </p>
                                                )}

                                                {item.subject && (
                                                    <p>
                                                        <strong>Sujet :</strong>{" "}
                                                        {item.subject}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="message-content">
                                                <strong>Message :</strong>
                                                <p>{item.message || "Message vide"}</p>
                                            </div>

                                            {!showArchivedMessages && (
                                                <>
                                                    {!item.is_read && (
                                                        <button
                                                            className="mark-read-button"
                                                            disabled={updating === `read-${item.id}`}
                                                            onClick={() => markMessageAsRead(item.id)}
                                                        >
                                                            Marquer comme lu
                                                        </button>
                                                    )}

                                                    <div className="admin-action-panel">
                                                        <h4>Répondre par e-mail</h4>
                                                        <p>
                                                            Destinataire : {clientEmail || "E-mail non renseigné"}
                                                        </p>

                                                        <label>Sujet de la réponse</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Sujet de votre réponse"
                                                            value={reply.subject || ""}
                                                            onChange={event =>
                                                                setMessageReplies(previous => ({
                                                                    ...previous,
                                                                    [item.id]: {
                                                                        ...previous[item.id],
                                                                        subject: event.target.value
                                                                    }
                                                                }))
                                                            }
                                                        />

                                                        <label>Votre réponse</label>
                                                        <textarea
                                                            rows="5"
                                                            placeholder="Écrivez votre réponse..."
                                                            value={reply.message || ""}
                                                            onChange={event =>
                                                                setMessageReplies(previous => ({
                                                                    ...previous,
                                                                    [item.id]: {
                                                                        ...previous[item.id],
                                                                        message: event.target.value
                                                                    }
                                                                }))
                                                            }
                                                        />

                                                        <button
                                                            className="save-link-button"
                                                            disabled={
                                                                updating === `reply-${item.id}` ||
                                                                !clientEmail
                                                            }
                                                            onClick={() => replyToMessage(item)}
                                                        >
                                                            Envoyer la réponse
                                                        </button>
                                                    </div>

                                                    <div className="admin-card-actions">
                                                        <button
                                                            className="secondary-button"
                                                            onClick={() => loadMessageEmails(item.id)}
                                                        >
                                                            Historique des e-mails
                                                        </button>

                                                        <button
                                                            className="secondary-button"
                                                            disabled={updating === `archive-message-${item.id}`}
                                                            onClick={() => archiveMessage(item.id)}
                                                        >
                                                            Archiver
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {showArchivedMessages && (
                                                <div className="admin-card-actions">
                                                    <button
                                                        className="accept-button"
                                                        onClick={() => restoreMessage(item.id)}
                                                    >
                                                        Restaurer
                                                    </button>

                                                    <button
                                                        className="reject-button"
                                                        onClick={() => deleteMessage(item.id)}
                                                    >
                                                        Supprimer définitivement
                                                    </button>
                                                </div>
                                            )}

                                            {openedHistory === `message-${item.id}` &&
                                                renderEmailHistory(`message-${item.id}`)}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* =================================================
                    RUBRIQUE 6 : HISTORIQUE DES COMMUNICATIONS
                ================================================= */}

                {activeTab === "history" && (
                    <section className="messages-section">

                        <div className="section-heading">
                            <div>
                                <h2>Historique des communications</h2>
                                <p>
                                    Retrouvez les e-mails envoyés depuis les réservations
                                    et les réponses aux messages.
                                </p>
                            </div>

                            <button
                                className="secondary-button"
                                onClick={loadAllCommunicationHistory}
                                disabled={historyLoading}
                            >
                                {historyLoading ? "Chargement..." : "Actualiser l'historique"}
                            </button>
                        </div>

                        <p className="schedule-info">
                            Cet historique regroupe les e-mails enregistrés pour
                            chaque réservation et chaque message.
                        </p>

                        {historyLoading ? (
                            <div className="empty-bookings">
                                Chargement des historiques...
                            </div>
                        ) : globalHistory.length === 0 ? (
                            <div className="empty-bookings">
                                Aucun e-mail enregistré pour le moment.
                            </div>
                        ) : (
                            <div className="messages-list">
                                {globalHistory.map((email, index) => (
                                    <article
                                        className="history-card"
                                        key={email.id || `${email.source_key}-${index}`}
                                    >
                                        <div className="history-card-top">
                                            <div>
                                                <span className="history-type">
                                                    {email.communication_type}
                                                </span>
                                                <h3>{email.subject || "Sans sujet"}</h3>
                                                <p>
                                                    Destinataire / client : {email.client_name}
                                                </p>
                                            </div>

                                            <span className="history-email-status">
                                                {email.email_status || "Statut inconnu"}
                                            </span>
                                        </div>

                                        <p className="message-date">
                                            {formatMessageDate(email.created_at)}
                                        </p>

                                        <div className="message-content">
                                            <p>{email.body || "Contenu indisponible."}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* =================================================
                    RUBRIQUE 7 : PROFIL PROFESSIONNEL
                ================================================= */}

                {activeTab === "profile" && (
                    <section className="profile-section">

                        <div className="section-heading">
                            <div>
                                <h2>Profil professionnel</h2>
                                <p>
                                    Gérez votre statut professionnel et consultez
                                    les paramètres disponibles.
                                </p>
                            </div>
                        </div>

                        <article className="profile-status-panel">
                            <div className="profile-status-icon">◎</div>

                            <div className="profile-status-content">
                                <h3>Mon statut professionnel</h3>
                                <p>
                                    Ce statut contrôle uniquement la disponibilité
                                    des appels directs. Il ne bloque pas les
                                    réservations de l'agenda.
                                </p>

                                <span className="status-indicator">
                                    {settings?.professional_status || "Inconnu"}
                                </span>
                            </div>
                        </article>

                        <div className="admin-action-panel profile-form">
                            <label>Modifier mon statut</label>

                            <select
                                value={settings?.professional_status || ""}
                                disabled={updating === "professional-status"}
                                onChange={event =>
                                    updateProfessionalStatus(event.target.value)
                                }
                            >
                                {PROFESSIONAL_STATUSES.map(status => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>

                            <p className="schedule-info">
                                Les statuts disponibles sont ceux autorisés par
                                le serveur : Disponible, En pause, En traitement,
                                En conférence et Hors ligne.
                            </p>
                        </div>

                        <div className="overview-card profile-summary">
                            <h3>Résumé de votre espace</h3>

                            <div className="overview-line">
                                <span>Réservations chargées</span>
                                <strong>{totalBookings}</strong>
                            </div>

                            <div className="overview-line">
                                <span>Messages chargés</span>
                                <strong>{totalMessages}</strong>
                            </div>

                            <div className="overview-line">
                                <span>Indisponibilités enregistrées</span>
                                <strong>{unavailabilities.length}</strong>
                            </div>
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
}
