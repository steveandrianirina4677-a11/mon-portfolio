
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

// Adresse du backend hébergé sur Render
const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminDashboard({ session }) {

    // ============================================
    // 1. ÉTATS DE L'APPLICATION
    // ============================================

    // Liste des réservations
    const [bookings, setBookings] = useState([]);

    // Liste des messages reçus depuis le formulaire de contact
    const [messages, setMessages] = useState([]);

    // Paramètres professionnels
    const [settings, setSettings] = useState(null);

    // Liens de visioconférence
    const [meetingLinks, setMeetingLinks] = useState({});

    // Gestion du chargement et des notifications
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updating, setUpdating] = useState(null);

    // Jeton de connexion Supabase
    const token =
        session?.access_token ||
        session?.session?.access_token;

    // En-têtes envoyés au backend pour sécuriser les requêtes
    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    });


    // ============================================
    // 2. CHARGEMENT DU TABLEAU DE BORD
    // ============================================

    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            // Récupérer les réservations, les paramètres et les messages
            const [
                bookingsResponse,
                settingsResponse,
                messagesResponse
            ] = await Promise.all([

                fetch(
                    `${API_URL}/api/creative-break/admin/bookings`,
                    { headers: getHeaders() }
                ),

                fetch(
                    `${API_URL}/api/creative-break/admin/settings`,
                    { headers: getHeaders() }
                ),

                fetch(
                    `${API_URL}/api/creative-break/admin/messages`,
                    { headers: getHeaders() }
                )
            ]);

            // Convertir les réponses en JSON
            const bookingsData = await bookingsResponse.json();
            const settingsData = await settingsResponse.json();
            const messagesData = await messagesResponse.json();

            // Vérifier les réponses du serveur
            if (!bookingsResponse.ok) {
                throw new Error(
                    bookingsData.message || "Impossible de charger les réservations."
                );
            }

            if (!settingsResponse.ok) {
                throw new Error(
                    settingsData.message || "Impossible de charger les paramètres."
                );
            }

            if (!messagesResponse.ok) {
                throw new Error(
                    messagesData.message || "Impossible de charger les messages."
                );
            }

            // Enregistrer les données dans les états React
            setBookings(bookingsData.bookings || []);
            setSettings(settingsData.settings || null);
            setMessages(messagesData.messages || []);

        } catch (err) {
            setError(err.message || "Erreur de chargement du tableau de bord.");
        } finally {
            setLoading(false);
        }
    }


    // ============================================
    // 3. CHARGEMENT AUTOMATIQUE
    // ============================================

    useEffect(() => {
        if (token) {
            loadDashboard();
        } else {
            setError("Jeton de connexion introuvable.");
            setLoading(false);
        }
    }, [token]);


    // ============================================
    // 4. MODIFICATION D'UNE RÉSERVATION
    // ============================================

    async function updateBooking(id, status) {
        try {
            setUpdating(id);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/api/creative-break/admin/bookings/${id}`,
                {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({ status })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Modification impossible."
                );
            }

            setMessage(result.message || "Réservation modifiée.");

            await loadDashboard();

        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(null);
        }
    }


    // ============================================
    // 5. ENREGISTREMENT DU LIEN DE VISIOCONFÉRENCE
    // ============================================

    async function updateMeetingLink(booking) {

        // Récupérer le lien saisi
        const link = (
            meetingLinks[booking.id] ?? booking.meeting_link ?? ""
        ).trim();

        if (!link) {
            setError("Veuillez saisir un lien de visioconférence.");
            return;
        }

        try {
            // Vérifier que le lien est une URL valide
            new URL(link);

            setUpdating(`link-${booking.id}`);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/api/creative-break/admin/bookings/${booking.id}`,
                {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        status: booking.status,
                        meeting_link: link
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Impossible d'enregistrer le lien."
                );
            }

            setMessage("Lien de visioconférence enregistré.");

            await loadDashboard();

        } catch (err) {
            setError(
                err.message === "Invalid URL"
                    ? "Veuillez saisir une adresse URL valide."
                    : err.message
            );
        } finally {
            setUpdating(null);
        }
    }


    // ============================================
    // 6. MODIFICATION DU STATUT PROFESSIONNEL
    // ============================================

    async function updateProfessionalStatus(status) {
        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/api/creative-break/admin/settings/status`,
                {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({ status })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Impossible de modifier le statut."
                );
            }

            setSettings(result.settings || settings);
            setMessage(result.message || "Statut modifié.");

        } catch (err) {
            setError(err.message);
        }
    }


    // ============================================
    // 7. MARQUER UN MESSAGE COMME LU
    // ============================================

    async function markMessageAsRead(id) {
        try {
            setUpdating(`message-${id}`);
            setError("");
            setMessage("");

            // Envoyer la demande au backend
            const response = await fetch(
                `${API_URL}/api/creative-break/admin/messages/${id}/read`,
                {
                    method: "PATCH",
                    headers: getHeaders()
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Impossible de modifier le message."
                );
            }

            // Actualiser la liste des messages
            await loadDashboard();

            setMessage("Message marqué comme lu.");

        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(null);
        }
    }


    // ============================================
    // 8. FORMATAGE DES DATES
    // ============================================

    // Afficher les dates au format français
    function formatDate(date) {
        if (!date) return "Date inconnue";

        return new Date(date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Indian/Antananarivo"
        });
    }

    // Afficher les heures de Madagascar
    function formatTime(date) {
        if (!date) return "--:--";

        return new Intl.DateTimeFormat("fr-FR", {
            timeZone: "Indian/Antananarivo",
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(date));
    }

    // Afficher la date et l'heure de réception d'un message
    function formatMessageDate(date) {
        if (!date) return "Date inconnue";

        return new Date(date).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Indian/Antananarivo"
        });
    }


    // ============================================
    // 9. TRADUCTION DES STATUTS
    // ============================================

    function translateStatus(status) {
        const statuses = {
            pending: "En attente",
            accepted: "Accepté",
            rejected: "Refusé",
            cancelled: "Annulé"
        };

        return statuses[status] || status;
    }


    // ============================================
    // 10. CALCUL DES STATISTIQUES
    // ============================================

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        booking => booking.status === "pending"
    ).length;

    const acceptedBookings = bookings.filter(
        booking => booking.status === "accepted"
    ).length;

    // Nombre de messages reçus
    const totalMessages = messages.length;

    // Nombre de messages non lus
    const unreadMessages = messages.filter(
        item => !item.is_read
    ).length;


    // ============================================
    // 11. ÉCRAN DE CHARGEMENT
    // ============================================

    if (loading) {
        return (
            <div className="admin-loading">
                Chargement de votre espace administrateur...
            </div>
        );
    }


    // ============================================
    // 12. AFFICHAGE DU TABLEAU DE BORD
    // ============================================

    return (
        <div className="admin-dashboard">

            {/* En-tête du tableau de bord */}
            <header className="dashboard-header">

                <div>
                    <span className="dashboard-label">
                        CREATIVE BREAK
                    </span>

                    <h1>Tableau de bord</h1>

                    <p>
                        Gérez vos rendez-vous, vos messages
                        et votre disponibilité.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadDashboard}
                >
                    Actualiser
                </button>

            </header>


            {/* Notifications et erreurs */}
            {error && (
                <div className="dashboard-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="dashboard-alert success">
                    {message}
                </div>
            )}


            {/* ========================================
                13. STATISTIQUES
            ======================================== */}

            <section className="dashboard-stats">

                <div className="stat-card">
                    <span>Total des réservations</span>
                    <strong>{totalBookings}</strong>
                </div>

                <div className="stat-card">
                    <span>En attente</span>
                    <strong>{pendingBookings}</strong>
                </div>

                <div className="stat-card">
                    <span>Acceptées</span>
                    <strong>{acceptedBookings}</strong>
                </div>

                {/* Nouvelle statistique des messages */}
                <div className="stat-card">
                    <span>Messages reçus</span>
                    <strong>{totalMessages}</strong>
                </div>

            </section>


            {/* ========================================
                14. STATUT PROFESSIONNEL
            ======================================== */}

            <section className="professional-status-card">

                <div>
                    <h2>Mon statut professionnel</h2>

                    <p>
                        Contrôlez si les visiteurs peuvent réserver
                        un rendez-vous.
                    </p>
                </div>

                <div className="status-controls">

                    <span
                        className={
                            settings?.professional_status === "Disponible"
                                ? "status-indicator available"
                                : "status-indicator unavailable"
                        }
                    >
                        {settings?.professional_status || "Inconnu"}
                    </span>

                    {/* Les quatre statuts autorisés */}
                    <select
                        value={settings?.professional_status || ""}
                        onChange={event =>
                            updateProfessionalStatus(event.target.value)
                        }
                    >
                        <option value="Disponible">
                            Disponible
                        </option>

                        <option value="En pause">
                            En pause
                        </option>

                        <option value="Hors ligne">
                            Hors ligne
                        </option>

                        <option value="Indisponible">
                            Indisponible
                        </option>

                    </select>

                </div>

            </section>


            {/* ========================================
                15. GESTION DES RÉSERVATIONS
            ======================================== */}

            <section className="bookings-section">

                <div className="section-heading">

                    <div>
                        <h2>Mes réservations</h2>

                        <p>
                            Consultez et gérez les demandes de rendez-vous.
                        </p>
                    </div>

                </div>

                {bookings.length === 0 ? (

                    <div className="empty-bookings">
                        Aucune réservation pour le moment.
                    </div>

                ) : (

                    <div className="bookings-list">

                        {bookings.map(booking => (

                            <article
                                className="booking-card"
                                key={booking.id}
                            >

                                <div className="booking-top">

                                    <div>
                                        <h3>{booking.client_name}</h3>

                                        <span className="booking-id">
                                            Réservation #{booking.id}
                                        </span>
                                    </div>

                                    <span
                                        className={`booking-status ${booking.status}`}
                                    >
                                        {translateStatus(booking.status)}
                                    </span>

                                </div>


                                {/* Informations du client */}
                                <div className="booking-information">

                                    <p>
                                        <strong>Email :</strong>{" "}
                                        {booking.client_email}
                                    </p>

                                    <p>
                                        <strong>Téléphone :</strong>{" "}
                                        {booking.client_phone}
                                    </p>

                                    <p>
                                        <strong>Date :</strong>{" "}
                                        {formatDate(booking.starts_at)}
                                    </p>

                                    <p>
                                        <strong>Heure :</strong>{" "}
                                        {formatTime(booking.starts_at)}
                                        {" - "}
                                        {formatTime(booking.ends_at)}
                                        {" (Madagascar)"}
                                    </p>

                                    <p>
                                        <strong>Projet :</strong>
                                        <br />
                                        {booking.project_details}
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


                                {/* Boutons accepter et refuser */}
                                {booking.status === "pending" && (

                                    <div className="booking-actions">

                                        <button
                                            className="accept-button"
                                            disabled={updating === booking.id}
                                            onClick={() =>
                                                updateBooking(
                                                    booking.id,
                                                    "accepted"
                                                )
                                            }
                                        >
                                            Accepter
                                        </button>

                                        <button
                                            className="reject-button"
                                            disabled={updating === booking.id}
                                            onClick={() =>
                                                updateBooking(
                                                    booking.id,
                                                    "rejected"
                                                )
                                            }
                                        >
                                            Refuser
                                        </button>

                                    </div>

                                )}


                                {/* Ajouter le lien après acceptation */}
                                {booking.status === "accepted" && (

                                    <div className="meeting-link-form">

                                        <label>
                                            Lien de visioconférence
                                        </label>

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
                                            disabled={
                                                updating === `link-${booking.id}`
                                            }
                                            onClick={() =>
                                                updateMeetingLink(booking)
                                            }
                                        >
                                            {updating === `link-${booking.id}`
                                                ? "Enregistrement..."
                                                : "Enregistrer le lien"}
                                        </button>

                                    </div>

                                )}

                            </article>

                        ))}

                    </div>

                )}

            </section>


            {/* ========================================
                16. NOUVELLE RUBRIQUE : MESSAGES REÇUS
            ======================================== */}

            <section className="messages-section">

                <div className="section-heading">

                    <div>
                        <h2>Messages reçus</h2>

                        <p>
                            Consultez les messages envoyés
                            depuis le formulaire de contact.
                        </p>
                    </div>

                    {/* Compteur des messages non lus */}
                    <span className="unread-counter">
                        {unreadMessages} non lu(s)
                    </span>

                </div>


                {/* Vérifier si des messages existent */}
                {messages.length === 0 ? (

                    <div className="empty-bookings">
                        Aucun message reçu pour le moment.
                    </div>

                ) : (

                    <div className="messages-list">

                        {messages.map(item => (

                            <article
                                className={`message-card ${
                                    item.is_read ? "message-read" : "message-unread"
                                }`}
                                key={item.id}
                            >

                                {/* En-tête du message */}
                                <div className="message-top">

                                    <div>
                                        <h3>
                                            {item.name || "Nom non renseigné"}
                                        </h3>

                                        <span className="message-date">
                                            {formatMessageDate(item.created_at)}
                                        </span>
                                    </div>

                                    <span
                                        className={
                                            item.is_read
                                                ? "message-status read"
                                                : "message-status unread"
                                        }
                                    >
                                        {item.is_read ? "Lu" : "Non lu"}
                                    </span>

                                </div>


                                {/* Coordonnées de l'expéditeur */}
                                <div className="message-information">

                                    <p>
                                        <strong>Email :</strong>{" "}

                                        <a href={`mailto:${item.email}`}>
                                            {item.email}
                                        </a>
                                    </p>

                                </div>


                                {/* Contenu du message */}
                                <div className="message-content">

                                    <strong>Message :</strong>

                                    <p>
                                        {item.message}
                                    </p>

                                </div>


                                {/* Bouton pour marquer comme lu */}
                                {!item.is_read && (

                                    <div className="message-actions">

                                        <button
                                            className="mark-read-button"
                                            disabled={
                                                updating === `message-${item.id}`
                                            }
                                            onClick={() =>
                                                markMessageAsRead(item.id)
                                            }
                                        >
                                            {updating === `message-${item.id}`
                                                ? "Modification..."
                                                : "Marquer comme lu"}
                                        </button>

                                    </div>

                                )}

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}
