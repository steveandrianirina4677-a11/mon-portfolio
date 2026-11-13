
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminDashboard({ session }) {
    const [bookings, setBookings] = useState([]);
    const [settings, setSettings] = useState(null);
    const [meetingLinks, setMeetingLinks] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updating, setUpdating] = useState(null);

    const token =
        session?.access_token ||
        session?.session?.access_token;

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    });

    // Charger les réservations et les paramètres
    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            const [bookingsResponse, settingsResponse] =
                await Promise.all([
                    fetch(`${API_URL}/api/creative-break/admin/bookings`, {
                        headers: getHeaders()
                    }),
                    fetch(`${API_URL}/api/creative-break/admin/settings`, {
                        headers: getHeaders()
                    })
                ]);

            const bookingsData = await bookingsResponse.json();
            const settingsData = await settingsResponse.json();

            if (!bookingsResponse.ok) {
                throw new Error(bookingsData.message);
            }

            if (!settingsResponse.ok) {
                throw new Error(settingsData.message);
            }

            setBookings(bookingsData.bookings || []);
            setSettings(settingsData.settings || null);

        } catch (err) {
            setError(err.message || "Erreur de chargement.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            loadDashboard();
        } else {
            setError("Jeton de connexion introuvable.");
            setLoading(false);
        }
    }, [token]);

    // Accepter ou refuser une réservation
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
                throw new Error(result.message || "Modification impossible.");
            }

            setMessage(result.message || "Réservation modifiée.");
            await loadDashboard();

        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(null);
        }
    }

    // Enregistrer le lien de visioconférence
    async function updateMeetingLink(booking) {
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

    // Modifier le statut professionnel
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
                throw new Error(result.message);
            }

            setSettings(result.settings || settings);
            setMessage(result.message || "Statut modifié.");

        } catch (err) {
            setError(err.message);
        }
    }

    // Affichage des dates
    function formatDate(date) {
        return new Date(date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Indian/Antananarivo"
        });
    }

    // Affichage des heures de Madagascar
    function formatTime(date) {
        return new Intl.DateTimeFormat("fr-FR", {
            timeZone: "Indian/Antananarivo",
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(date));
    }

    function translateStatus(status) {
        const statuses = {
            pending: "En attente",
            accepted: "Accepté",
            rejected: "Refusé",
            cancelled: "Annulé"
        };

        return statuses[status] || status;
    }

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        booking => booking.status === "pending"
    ).length;

    const acceptedBookings = bookings.filter(
        booking => booking.status === "accepted"
    ).length;

    if (loading) {
        return (
            <div className="admin-loading">
                Chargement de votre espace administrateur...
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            <header className="dashboard-header">
                <div>
                    <span className="dashboard-label">CREATIVE BREAK</span>
                    <h1>Tableau de bord</h1>
                    <p>Gérez vos rendez-vous et votre disponibilité.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadDashboard}
                >
                    Actualiser
                </button>
            </header>

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

            {/* Statistiques */}
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
            </section>

            {/* Statut professionnel */}
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

                    <select
                        value={settings?.professional_status || ""}
                        onChange={event =>
                            updateProfessionalStatus(event.target.value)
                        }
                    >
                        <option value="Disponible">Disponible</option>
                        <option value="Indisponible">Indisponible</option>
                    </select>
                </div>
            </section>

            {/* Gestion des réservations */}
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

                                {/* Accepter ou refuser */}
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
        </div>
    );
}
