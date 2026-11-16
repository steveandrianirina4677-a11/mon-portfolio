
/* ========================================
   1. IMPORTATION DES OUTILS ET DES ICÔNES
======================================== */

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./App.css";

import {
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCode,
  FaLaptopCode,
  FaDatabase,
  FaBars,
  FaTimes,
  FaPaperPlane,
  FaGraduationCap,
  FaBoxes,
  FaUser,
  FaPython,
  FaJs,
  FaNodeJs,
  FaReact,
  FaWhatsapp,
  FaShoppingCart,
  FaTags,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaComments,
  FaClipboardList,
  FaHandshake,
  FaCheckCircle,
  FaFileAlt
} from "react-icons/fa";


/* ========================================
   2. CONFIGURATION DU BACKEND
======================================== */

// Adresse du backend en local.
// En production, utiliser l'adresse de ton backend Render.

// En local, utiliser le serveur de développement.
// En ligne, utiliser le backend hébergé sur Render.
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://mon-portfolio-backend-twxs.onrender.com";

const API_URL = `${BACKEND_URL}/api/contact`;

const WHATSAPP_URL =
  "https://wa.me/261385990110?text=Bonjour%20Steve%2C%20je%20viens%20de%20visiter%20votre%20portfolio.";

// Fuseau horaire professionnel de Madagascar.
const TIMEZONE = "Indian/Antananarivo";

// Fuseau horaire détecté automatiquement sur l'appareil du visiteur.
const VISITOR_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone || TIMEZONE;


/* ========================================
   3. CONFIGURATION DES CINQ STATUTS
======================================== */

const STATUS_CONFIG = {
  "Disponible": {
    className: "status-available",
    icon: "🟢",
    message:
      "Je suis disponible pour les appels directs. Contactez-moi !",
    canCall: true
  },

  "En pause": {
    className: "status-break",
    icon: "🟡",
    message:
      "Je ne peux pas prendre d'appels pour le moment. Vous pouvez toujours m'envoyer un message ou réserver une visioconférence.",
    canCall: false
  },

  "En traitement": {
    className: "status-working",
    icon: "🔵",
    message:
      "Je suis occupé sur un projet et ne peux pas prendre d'appels actuellement. Vous pouvez m'envoyer un message ou réserver une visioconférence.",
    canCall: false
  },

  "En conférence": {
    className: "status-conference",
    icon: "🟣",
    message:
      "Je suis actuellement en conférence et ne peux pas prendre d'appels. Vous pouvez m'envoyer un message ou réserver une visioconférence.",
    canCall: false
  },

  "Hors ligne": {
    className: "status-offline",
    icon: "⚫",
    message:
      "Je suis actuellement indisponible pour les appels. Vous pouvez toujours m'envoyer un message ou réserver une visioconférence.",
    canCall: false
  }
};


/* ========================================
   4. FONCTIONS DE GESTION DES DATES
======================================== */

// Obtenir une date YYYY-MM-DD dans un fuseau horaire précis.
function getDateInTimezone(timezone, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}`;
}

// Date professionnelle de référence : Madagascar.
function getLocalDate() {
  return getDateInTimezone(TIMEZONE);
}

// Afficher un instant dans le fuseau horaire demandé.
function formatDateTimeInTimezone(isoDate, timezone) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(isoDate));
}

// Obtenir la date locale d'un instant.
function getInstantDate(isoDate, timezone) {
  return getDateInTimezone(timezone, new Date(isoDate));
}

// Obtenir l'heure locale d'un instant.
function getInstantTime(isoDate, timezone) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(isoDate));
}


/* ========================================
   5. LISTE DES PROJETS
======================================== */

const projects = [
  {
    title: "Application de gestion d'établissement scolaire",
    description:
      "Une application permettant de faciliter la gestion des élèves, des enseignants, des inscriptions, des paiements et des résultats scolaires.",
    image: "/images/gestiondecole.png",
    icon: <FaGraduationCap />,
    technologies: [
      "JavaScript",
      "React.js",
      "Node.js",
      "MySQL",
      "HTML",
      "CSS"
    ]
  },

  {
    title: "Site vitrine avec gestion de stock",
    description:
      "Un site vitrine professionnel accompagné d'une interface de gestion permettant de suivre les produits, les ventes et le stock.",
    image: "/images/pv.png",
    icon: <FaBoxes />,
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "MySQL"
    ]
  },

  {
    title: "Portfolio personnel",
    description:
      "Un portfolio moderne présentant mes compétences, mes réalisations et mes services en développement web et logiciel.",
    image: "/images/portf.png",
    icon: <FaUser />,
    technologies: [
      "JavaScript",
      "React.js",
      "Node.js",
      "CSS"
    ]
  },

  {
    title: "Boutique en ligne E-commerce",
    description:
      "Une boutique en ligne moderne permettant de découvrir les produits, consulter le catalogue, gérer son panier et passer des commandes depuis un téléphone ou un ordinateur.",
    images: [
      {
        src: "/images/BoutiqueE-commerce-sur-mobile.png",
        alt: "Boutique E-commerce sur mobile"
      },
      {
        src: "/images/BoutiqueE-commerce-sur-ordinateur.png",
        alt: "Boutique E-commerce sur ordinateur"
      },
      {
        src: "/images/Catalogue-de-produits.png",
        alt: "Catalogue de produits"
      },
      {
        src: "/images/Panier-et-commande.png",
        alt: "Panier et commande"
      }
    ],
    icon: <FaShoppingCart />,
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "React.js"
    ]
  }
];


/* ========================================
   6. CONFIGURATION DES ANIMATIONS
======================================== */

// Animation d'apparition des sections.
const revealVariants = {
  hidden: {
    opacity: 0,
    y: 35
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Apparition progressive des éléments d'une grille.
const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Animation des cartes.
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 45,
    scale: 0.96
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: "easeOut"
    }
  }
};

// Animation spéciale des étapes du déroulement.
const processCardVariants = {
  hidden: {
    opacity: 0,
    y: 55,
    scale: 0.92,
    rotateX: 8
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
};


/* ========================================
   7. EFFET SCROLL REVEAL
======================================== */

function Reveal({ children, className = "" }) {
  // Respecte le réglage de réduction des animations du navigateur.
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? {} : revealVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{
        once: true,
        amount: 0.2,
        margin: "0px 0px -50px 0px"
      }}
      style={{
        willChange: reduceMotion ? "auto" : "transform, opacity"
      }}
    >
      {children}
    </motion.div>
  );
}


/* ========================================
   8. EFFET TEXTE QUI S'ÉCRIT AUTOMATIQUEMENT
======================================== */

function TypingEffect() {
  const reduceMotion = useReducedMotion();

  const words = [
    "Développeur Full Stack",
    "Développeur Web",
    "React.js",
    "Python",
    "JavaScript"
  ];

  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // En mode réduction des animations, afficher un texte fixe.
    if (reduceMotion) {
      setText(words[0]);
      return;
    }

    const currentWord = words[wordIndex];

    let delay = deleting ? 45 : 85;

    if (!deleting && text === currentWord) {
      delay = 1300;
    }

    if (deleting && text === "") {
      delay = 350;
    }

    const timer = setTimeout(() => {
      if (!deleting && text === currentWord) {
        setDeleting(true);
      } else if (deleting && text === "") {
        setDeleting(false);
        setWordIndex((previous) => (previous + 1) % words.length);
      } else if (deleting) {
        setText(currentWord.substring(0, text.length - 1));
      } else {
        setText(currentWord.substring(0, text.length + 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex, reduceMotion]);

  return (
    <h2 className="typing-title">
      {text}
      {!reduceMotion && (
        <span className="typing-cursor">|</span>
      )}
    </h2>
  );
}


/* ========================================
   9. EFFET ICÔNES TECHNOLOGIQUES FLOTTANTES
======================================== */

function FloatingIcons() {
  const reduceMotion = useReducedMotion();

  const icons = [
    {
      icon: <FaPython />,
      className: "floating-python",
      duration: 4
    },
    {
      icon: <FaReact />,
      className: "floating-react",
      duration: 5
    },
    {
      icon: <FaJs />,
      className: "floating-js",
      duration: 4.5
    },
    {
      icon: <FaDatabase />,
      className: "floating-database",
      duration: 5.5
    }
  ];

  return (
    <div className="floating-icons" aria-hidden="true">
      {icons.map((item, index) => (
        <motion.div
          key={index}
          className={`floating-icon ${item.className}`}
          animate={
            reduceMotion
              ? {}
              : {
                  y: [0, -16, 0],
                  rotate: [0, 5, -5, 0]
                }
          }
          transition={{
            duration: item.duration,
            repeat: reduceMotion ? 0 : Infinity,
            ease: "easeInOut"
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
}


/* ========================================
   10. EFFET PARTICULES LUMINEUSES
======================================== */

function Particles() {
  const reduceMotion = useReducedMotion();

  const particles = Array.from({ length: 22 }, (_, index) => ({
    id: index,
    left: `${(index * 37 + 11) % 100}%`,
    top: `${(index * 53 + 7) % 100}%`,
    delay: (index % 7) * 0.35,
    duration: 3 + (index % 5)
  }));

  return (
    <div className="particles" aria-hidden="true">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            top: particle.top
          }}
          animate={
            reduceMotion
              ? { opacity: 0.35 }
              : {
                  opacity: [0.15, 0.8, 0.15],
                  scale: [0.7, 1.3, 0.7],
                  y: [0, -18, 0]
                }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: reduceMotion ? 0 : Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}


/* ========================================
   11. BARRE DE NAVIGATION
======================================== */

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">

        <a href="#accueil" className="logo" onClick={closeMenu}>
          Steve<span>.</span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={menuOpen ? "nav-links active" : "nav-links"}>

          <li>
            <a href="#accueil" onClick={closeMenu}>Accueil</a>
          </li>

          <li>
            <a href="#deroulement" onClick={closeMenu}>
              Déroulement
            </a>
          </li>

          <li>
            <a href="#apropos" onClick={closeMenu}>À propos</a>
          </li>

          <li>
            <a href="#competences" onClick={closeMenu}>Compétences</a>
          </li>

          <li>
            <a href="#projets" onClick={closeMenu}>Mes projets</a>
          </li>

          <li>
            <a href="#offres" onClick={closeMenu}>Mes tarifs</a>
          </li>

          <li>
            <a href="#reservation" onClick={closeMenu}>
              Réserver un rendez-vous
            </a>
          </li>

          <li>
            <a href="#contact" onClick={closeMenu}>Me contacter</a>
          </li>

          <li>
            <a
              href="/admin"
              onClick={closeMenu}
              className="admin-login-link"
            >
              Se connecter
            </a>
          </li>

        </ul>

      </div>
    </nav>
  );
}


/* ========================================
   12. SECTION ACCUEIL AVEC STATUT ET VIDÉO
======================================== */

function Hero({ professionalStatus }) {
  const reduceMotion = useReducedMotion();
  const statusInfo = STATUS_CONFIG[professionalStatus];

  return (
    <section className="hero section" id="accueil">

      {/* Vidéo originale conservée sans modification. */}
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge la vidéo.
      </video>

      <div className="hero-overlay" aria-hidden="true"></div>

      <Particles />
      <FloatingIcons />

      <motion.div
        className="hero-content"
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 1
        }}
      >

        <p className="hero-subtitle">
          Bonjour, je suis
        </p>

        <div
          className={`professional-status ${
            statusInfo ? statusInfo.className : "status-loading"
          }`}
          aria-live="polite"
        >

          <div className="status-badge">

            <span className="status-indicator">
              {statusInfo ? statusInfo.icon : "⚪"}
            </span>

            <span>
              {professionalStatus || "Vérification du statut..."}
            </span>

          </div>

          <p className="status-message">
            {statusInfo
              ? statusInfo.message
              : "Veuillez patienter pendant la récupération de mon statut professionnel."
            }
          </p>

        </div>

        <h1>
          Steve <span>Andrianirina</span>
        </h1>

        <TypingEffect />

        <p className="hero-description">
          Je conçois des sites web, des applications et des logiciels
          sur mesure pour aider les entreprises et les particuliers
          à simplifier leurs activités et gagner du temps.
        </p>

        <div className="hero-buttons">

          <a href="#projets" className="btn-primary">
            Découvrir mes projets
          </a>

          <a href="#contact" className="btn-secondary">
            Me contacter
          </a>

          <a href="#reservation" className="btn-secondary">
            <FaCalendarAlt />
            Réserver une visioconférence
          </a>

          {statusInfo?.canCall && (
            <a
              href="tel:+261385990110"
              className="btn-secondary direct-call-button"
            >
              <FaPhone />
              Appeler directement
            </a>
          )}

        </div>

        <div className="social-links">

          <a
            href="https://www.linkedin.com/in/steve-andrianirina-922a17448/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <FaLinkedin />
          </a>

          <a
            href="mailto:steveandrianirina4677@gmail.com"
            aria-label="Email"
            title="Email"
          >
            <FaEnvelope />
          </a>

          <a
            href={WHATSAPP_URL}
            className="whatsapp-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="Me contacter sur WhatsApp"
          >
            <FaWhatsapp />
          </a>

        </div>

      </motion.div>

      {/* Photo de profil conservée. */}
      <motion.div
        className="hero-image"
        initial={reduceMotion ? false : { opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.35
        }}
      >
        <img
          src="/images/profil.png"
          alt="Steve Andrianirina"
          className="profile-photo"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width="340"
          height="340"
        />
      </motion.div>

    </section>
  );
}


/* ========================================
   13. SECTION DÉROULEMENT DE LA COLLABORATION
======================================== */

function WorkProcess() {
  const reduceMotion = useReducedMotion();

  // Les six étapes de la collaboration avec le client.
  const steps = [
    {
      number: "01",
      icon: <FaCalendarAlt />,
      title: "Réservation d'un rendez-vous",
      description:
        "Choisissez une date et un créneau disponible dans mon agenda pour organiser notre premier échange.",
      detail:
        "Rendez-vous gratuit de 30 minutes en visioconférence."
    },
    {
      number: "02",
      icon: <FaComments />,
      title: "Échange et découverte du projet",
      description:
        "Nous discutons de votre activité, de vos besoins, de vos objectifs et des fonctionnalités souhaitées.",
      detail:
        "Je prends le temps de comprendre votre idée."
    },
    {
      number: "03",
      icon: <FaClipboardList />,
      title: "Analyse et proposition",
      description:
        "J'étudie votre demande afin de vous proposer une solution adaptée à votre projet et à votre budget.",
      detail:
        "Vous recevez une proposition avec les fonctionnalités, le tarif et le délai estimé."
    },
    {
      number: "04",
      icon: <FaHandshake />,
      title: "Validation et démarrage",
      description:
        "Après votre accord sur la proposition, nous validons ensemble les conditions et les détails du projet.",
      detail:
        "Le développement commence après validation."
    },
    {
      number: "05",
      icon: <FaFileAlt />,
      title: "Développement et suivi",
      description:
        "Je réalise votre solution et vous tiens informé de son avancement tout au long du développement.",
      detail:
        "Nous échangeons sur les ajustements nécessaires."
    },
    {
      number: "06",
      icon: <FaCheckCircle />,
      title: "Livraison du projet",
      description:
        "Après les vérifications et votre validation finale, je vous livre votre site web ou votre application.",
      detail:
        "Votre solution est prête à être utilisée."
    }
  ];

  return (
    <section
      className="work-process section"
      id="deroulement"
    >

      {/* Titre et introduction avec Scroll Reveal. */}
      <Reveal>

        <h2 className="section-title">
          Comment se déroule notre collaboration ?
        </h2>

        <p className="section-description">
          De la première prise de contact jusqu'à la livraison,
          découvrez les différentes étapes pour concrétiser
          votre projet dans les meilleures conditions.
        </p>

      </Reveal>

      {/* Grille avec apparition progressive des six cartes. */}
      <motion.div
        className="work-process-grid"
        variants={reduceMotion ? {} : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{
          once: true,
          amount: 0.1
        }}
      >

        {steps.map((step, index) => (

          <motion.article
            className="work-process-card"
            key={step.number}
            variants={reduceMotion ? {} : processCardVariants}
            initial={reduceMotion ? false : undefined}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -10,
                    scale: 1.025,
                    rotateX: 2,
                    rotateY: index % 2 === 0 ? 2 : -2,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut"
                    }
                  }
            }
            style={{
              transformPerspective: 1000
            }}
          >

            <div className="work-process-top">

              {/* Numéro avec apparition en zoom. */}
              <motion.span
                className="work-process-number"
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.5
                      }
                }
                whileInView={{
                  opacity: 1,
                  scale: 1
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : index * 0.08
                }}
              >
                {step.number}
              </motion.span>

              {/* Icône avec rotation et effet de flottement. */}
              <motion.div
                className="work-process-icon"
                animate={
                  reduceMotion
                    ? {}
                    : {
                        y: [0, -5, 0],
                        rotate: [0, 4, -4, 0]
                      }
                }
                transition={{
                  duration: 4 + index * 0.25,
                  repeat: reduceMotion ? 0 : Infinity,
                  ease: "easeInOut",
                  delay: index * 0.15
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.18,
                        rotate: 12,
                        transition: { duration: 0.25 }
                      }
                }
              >
                {step.icon}
              </motion.div>

            </div>

            <h3>{step.title}</h3>

            <p>{step.description}</p>

            <div className="work-process-detail">
              {step.detail}
            </div>

          </motion.article>

        ))}

      </motion.div>

      {/* Bouton final avec animation lumineuse au survol. */}
      <Reveal className="work-process-cta">

        <p>
          Vous avez déjà une idée ou un projet en tête ?
        </p>

        <motion.a
          href="#reservation"
          className="btn-primary"
          whileHover={
            reduceMotion
              ? undefined
              : {
                  scale: 1.06,
                  y: -3
                }
          }
          whileTap={
            reduceMotion
              ? undefined
              : {
                  scale: 0.97
                }
          }
          transition={{ duration: 0.2 }}
        >
          <FaCalendarAlt />
          Discutons de votre projet
        </motion.a>

      </Reveal>

    </section>
  );
}


/* ========================================
   14. SECTION À PROPOS DE MOI
======================================== */

function About() {
  return (
    <section className="about section" id="apropos">

      <Reveal>
        <h2 className="section-title">
          À propos de moi
        </h2>
      </Reveal>

      <div className="about-content">

        <Reveal className="about-text">
          <>
            <p>
              Je suis développeur Full Stack passionné par la création
              de solutions numériques modernes et adaptées aux besoins
              des entreprises et des particuliers.
            </p>

            <p>
              Mon objectif est de concevoir des applications et des
              logiciels pratiques pour faciliter votre quotidien,
              améliorer votre organisation et vous faire gagner du temps.
            </p>
          </>
        </Reveal>

        <motion.div
          className="about-cards"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >

          <motion.div className="about-card" variants={cardVariants}>
            <div className="about-icon"><FaLaptopCode /></div>
            <h3>Développement Web</h3>
            <p>Création de sites et d'applications modernes.</p>
          </motion.div>

          <motion.div className="about-card" variants={cardVariants}>
            <div className="about-icon"><FaCode /></div>
            <h3>Développement logiciel</h3>
            <p>
              Création du logiciel pour faciliter la gestion de vos
              tâches et gain de temps.
            </p>
          </motion.div>

          <motion.div className="about-card" variants={cardVariants}>
            <div className="about-icon"><FaDatabase /></div>
            <h3>Gestion de données</h3>
            <p>Conception et gestion de bases de données.</p>
          </motion.div>

        </motion.div>

        <Reveal className="about-button">
          <a href="#contact" className="btn-primary">
            Travaillons ensemble
          </a>
        </Reveal>

      </div>
    </section>
  );
}


/* ========================================
   15. SECTION COMPÉTENCES
======================================== */

function Skills() {
  const skills = [
    { name: "Python", icon: <FaPython /> },
    { name: "JavaScript", icon: <FaJs /> },
    { name: "Node.js", icon: <FaNodeJs /> },
    { name: "React.js", icon: <FaReact /> },
    { name: "HTML / CSS", icon: <FaCode /> },
    { name: "MySQL", icon: <FaDatabase /> }
  ];

  return (
    <section className="skills section" id="competences">

      <Reveal>

        <h2 className="section-title">
          Mes compétences
        </h2>

        <p className="section-description">
          Les technologies que j'utilise pour concevoir des solutions
          numériques modernes et performantes.
        </p>

      </Reveal>

      <motion.div
        className="skills-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >

        {skills.map((skill, index) => (

          <motion.div
            className="skill-card"
            key={index}
            variants={cardVariants}
            whileHover={{
              y: -8,
              scale: 1.04
            }}
            transition={{ duration: 0.25 }}
          >
            <div className="skill-icon">{skill.icon}</div>
            <h3>{skill.name}</h3>
          </motion.div>

        ))}

      </motion.div>

    </section>
  );
}


/* ========================================
   16. SECTION PROJETS
======================================== */

function Projects() {
  const reduceMotion = useReducedMotion();

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  // Passer à l'image précédente.
  const previousImage = (images) => {
    setCurrentImage((previous) =>
      (previous - 1 + images.length) % images.length
    );
  };

  // Passer à l'image suivante.
  const nextImage = (images) => {
    setCurrentImage((previous) =>
      (previous + 1) % images.length
    );
  };

  // Navigation au clavier dans la visionneuse.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (selectedImage && event.key === "ArrowRight") {
        setSelectedImage((previous) => ({
          ...previous,
          index: (previous.index + 1) % previous.images.length
        }));
      }

      if (selectedImage && event.key === "ArrowLeft") {
        setSelectedImage((previous) => ({
          ...previous,
          index:
            (previous.index - 1 + previous.images.length) %
            previous.images.length
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <section className="projects section" id="projets">

      <Reveal>

        <h2 className="section-title">
          Mes projets récents
        </h2>

        <p className="section-description">
          Découvrez quelques réalisations qui illustrent mes compétences
          en développement web et logiciel.
        </p>

      </Reveal>

      <motion.div
        className="projects-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.15
        }}
      >

        {projects.map((project) => (

          <motion.article
            className="project-card"
            key={project.title}
            variants={cardVariants}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -10,
                    rotateX: 2,
                    rotateY: -2,
                    scale: 1.015,
                    transition: { duration: 0.3 }
                  }
            }
            style={{ transformPerspective: 1000 }}
          >

            {/* Image des trois premiers projets. */}
            {project.image && (
              <div className="project-image">
                <motion.img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  whileHover={reduceMotion ? undefined : { scale: 1.07 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            {/* Carrousel du projet E-commerce. */}
            {project.images && (
              <div className="project-carousel">

                <button
                  type="button"
                  className="carousel-arrow carousel-prev"
                  onClick={() => previousImage(project.images)}
                  aria-label="Image précédente"
                >
                  <FaChevronLeft />
                </button>

                <button
                  type="button"
                  className="carousel-image-button"
                  onClick={() =>
                    setSelectedImage({
                      images: project.images,
                      index: currentImage
                    })
                  }
                  aria-label={`Agrandir ${project.images[currentImage].alt}`}
                >
                  <motion.img
                    key={project.images[currentImage].src}
                    src={project.images[currentImage].src}
                    alt={project.images[currentImage].alt}
                    className="carousel-image"
                    loading="lazy"
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 0.97 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.35
                    }}
                  />
                </button>

                <button
                  type="button"
                  className="carousel-arrow carousel-next"
                  onClick={() => nextImage(project.images)}
                  aria-label="Image suivante"
                >
                  <FaChevronRight />
                </button>

                <div className="carousel-indicators">

                  {project.images.map((image, index) => (
                    <button
                      type="button"
                      key={image.src}
                      className={
                        currentImage === index
                          ? "carousel-dot active"
                          : "carousel-dot"
                      }
                      onClick={() => setCurrentImage(index)}
                      aria-label={`Afficher l'image ${index + 1}`}
                    />
                  ))}

                </div>

                <span className="carousel-counter">
                  {currentImage + 1} / {project.images.length}
                </span>

              </div>
            )}

            <div className="project-content">

              <motion.div
                className="project-icon"
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        rotate: 10,
                        scale: 1.12
                      }
                }
                transition={{ duration: 0.3 }}
              >
                {project.icon}
              </motion.div>

              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <div className="project-technologies">

                {project.technologies.map((technology, index) => (
                  <motion.span
                    key={index}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            scale: 1.06,
                            y: -2
                          }
                    }
                  >
                    {technology}
                  </motion.span>
                ))}

              </div>

            </div>

          </motion.article>

        ))}

      </motion.div>

      {/* Visionneuse des images E-commerce. */}
      {selectedImage && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Agrandissement des images E-commerce"
          onClick={() => setSelectedImage(null)}
        >

          <button
            type="button"
            className="lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Fermer l'image"
          >
            <FaTimes />
          </button>

          <button
            type="button"
            className="lightbox-arrow lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();

              setSelectedImage((previous) => ({
                ...previous,
                index:
                  (previous.index - 1 + previous.images.length) %
                  previous.images.length
              }));
            }}
            aria-label="Image précédente"
          >
            <FaChevronLeft />
          </button>

          <img
            src={selectedImage.images[selectedImage.index].src}
            alt={selectedImage.images[selectedImage.index].alt}
            onClick={(event) => event.stopPropagation()}
          />

          <button
            type="button"
            className="lightbox-arrow lightbox-next"
            onClick={(event) => {
              event.stopPropagation();

              setSelectedImage((previous) => ({
                ...previous,
                index: (previous.index + 1) % previous.images.length
              }));
            }}
            aria-label="Image suivante"
          >
            <FaChevronRight />
          </button>

          <p className="lightbox-caption">
            {selectedImage.images[selectedImage.index].alt}
          </p>

          <span className="lightbox-counter">
            {selectedImage.index + 1} / {selectedImage.images.length}
          </span>

        </div>
      )}

    </section>
  );
}


/* ========================================
   17. SECTION MES OFFRES ET TARIFS
======================================== */

function Pricing() {
  const reduceMotion = useReducedMotion();

  // Les trois formules de création de portfolio.
  const portfolioOffers = [
    {
      title: "STARTER",
      description:
        "Un portfolio professionnel et élégant pour présenter votre profil, vos compétences et vos premières réalisations.",

      originalPrice: "150 €",
      discountedPrice: "127,50 €",

      features: [
        "Design moderne et professionnel",
        "Présentation de votre profil",
        "Section compétences",
        "Présentation de vos projets",
        "Formulaire de contact",
        "Adaptation mobile et ordinateur",
        "Mise en ligne du portfolio"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par votre formule Portfolio STARTER à 127,50 €. Je souhaite obtenir plus d'informations."
    },

    {
      title: "PROFESSIONNEL",
      description:
        "Un portfolio plus complet et personnalisé pour valoriser votre image professionnelle et attirer de nouveaux clients.",

      originalPrice: "250 €",
      discountedPrice: "212,50 €",

      features: [
        "Toutes les fonctionnalités STARTER",
        "Design personnalisé selon votre activité",
        "Animations modernes et fluides",
        "Sections supplémentaires personnalisées",
        "Intégration des réseaux sociaux",
        "Optimisation de l'expérience mobile",
        "Mise en valeur de vos réalisations"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par votre formule Portfolio PROFESSIONNEL à 212,50 €. Je souhaite obtenir plus d'informations."
    },

    {
      title: "PREMIUM",
      description:
        "Une solution avancée et sur mesure avec des fonctionnalités évoluées pour une présence professionnelle complète.",

      originalPrice: "350 €",
      discountedPrice: "297,50 €",
      premium: true,

      features: [
        "Toutes les fonctionnalités PROFESSIONNEL",
        "Animations avancées et effets visuels",
        "Fonctionnalités personnalisées",
        "Backend et base de données selon les besoins",
        "Système de réservation de rendez-vous",
        "Espace d'administration si nécessaire",
        "Accompagnement personnalisé"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par votre formule Portfolio PREMIUM à 297,50 €. Je souhaite obtenir plus d'informations."
    }
  ];

  // Les trois formules de création de boutique en ligne.
  const ecommerceOffers = [
    {
      title: "STARTER",
      description:
        "Une première boutique en ligne pour présenter vos produits et permettre à vos clients de découvrir votre catalogue.",

      originalPrice: "300 €",
      discountedPrice: "255 €",

      features: [
        "Design professionnel et responsive",
        "Catalogue de produits",
        "Présentation des produits avec photos",
        "Panier d'achat",
        "Système de commande",
        "Navigation adaptée aux mobiles",
        "Mise en ligne de la boutique"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par votre formule Boutique en ligne STARTER à 255 €. Je souhaite obtenir plus d'informations."
    },

    {
      title: "PROFESSIONNELLE",
      description:
        "Une boutique complète avec des outils de gestion pour organiser vos produits, vos commandes et votre stock.",

      originalPrice: "500 €",
      discountedPrice: "425 €",

      features: [
        "Toutes les fonctionnalités STARTER",
        "Gestion des produits",
        "Gestion des commandes",
        "Interface d'administration",
        "Gestion du stock",
        "Suivi des ventes",
        "Gestion des informations de la boutique"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par votre formule Boutique en ligne PROFESSIONNELLE à 425 €. Je souhaite obtenir plus d'informations."
    },

    {
      title: "PREMIUM",
      description:
        "Une solution e-commerce avancée pour développer votre activité avec des outils de vente, de suivi et de gestion personnalisés.",

      originalPrice: "700 €",
      discountedPrice: "595 €",
      premium: true,

      features: [
        "Toutes les fonctionnalités PROFESSIONNELLE",
        "Intégration du paiement en ligne",
        "Gestion avancée des commandes",
        "Statistiques et suivi des ventes",
        "Fonctionnalités personnalisées",
        "Amélioration du parcours client",
        "Accompagnement personnalisé"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par votre formule Boutique en ligne PREMIUM à 595 €. Je souhaite obtenir plus d'informations."
    }
  ];

  // Composant réutilisable pour afficher les cartes d'une catégorie.
  const renderOfferCards = (offers, categoryName) => (
    <motion.div
      className="pricing-grid"
      variants={reduceMotion ? {} : containerVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{
        once: true,
        amount: 0.1
      }}
    >

      {offers.map((offer) => (

        <motion.article
          className={`pricing-card ${offer.premium ? "pricing-card-premium" : ""}`}
          key={`${categoryName}-${offer.title}`}
          variants={reduceMotion ? {} : cardVariants}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -9,
                  scale: 1.015,
                  transition: { duration: 0.3 }
                }
          }
        >

          {/* Badge PREMIUM affiché uniquement sur la formule concernée. */}
          {offer.premium && (
            <span className="pricing-premium-badge">
              PREMIUM
            </span>
          )}

          {/* Icône de la formule. */}
          <div className="pricing-card-icon">
            {categoryName === "portfolio"
              ? <FaLaptopCode />
              : <FaShoppingCart />
            }
          </div>

          <h3>{offer.title}</h3>

          <p className="pricing-description">
            {offer.description}
          </p>

          {/* Affichage du tarif habituel et de la réduction. */}
          <div className="pricing-price">

            <span className="pricing-original">
              {offer.originalPrice}
            </span>

            <span className="pricing-discount">
              -15 %
            </span>

          </div>

          {/* Prix final après réduction. */}
          <div className="pricing-discounted">

            <span>Prix promotionnel</span>

            <strong>
              {offer.discountedPrice}
            </strong>

          </div>

          {/* Liste des caractéristiques de la formule. */}
          <ul className="pricing-features">

            {offer.features.map((feature, index) => (
              <li key={index}>
                <span className="pricing-check">✓</span>
                <span>{feature}</span>
              </li>
            ))}

          </ul>

          {/* Bouton de commande WhatsApp. */}
          <a
            href={`https://wa.me/261385990110?text=${encodeURIComponent(
              offer.message
            )}`}
            className="pricing-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp />
            Choisir cette formule
          </a>

        </motion.article>

      ))}

    </motion.div>
  );

  return (
    <section className="pricing section" id="offres">

      {/* Titre principal de la section. */}
      <Reveal>

        <h2 className="section-title">
          Mes offres et tarifs
        </h2>

        <p className="section-description">
          Des solutions adaptées à votre activité, à vos objectifs
          et à votre budget. Choisissez la formule qui correspond
          à votre projet.
        </p>

      </Reveal>


      {/* ========================================
          BANDEAU PROMOTIONNEL
      ======================================== */}

      <Reveal className="pricing-promo">

        <div className="pricing-promo-icon">
          <FaTags />
        </div>

        <div className="pricing-promo-content">

          <span className="pricing-promo-label">
            OFFRE DE LANCEMENT
          </span>

          <h3>
            15 % DE RÉDUCTION
          </h3>

          <p className="pricing-promo-highlight">
            Pour les 5 premières commandes validées !
          </p>

          <p>
            Profitez de cette offre spéciale pour lancer
            votre projet numérique à un tarif avantageux.
          </p>

        </div>

      </Reveal>


      {/* ========================================
          PREMIÈRE CATÉGORIE : PORTFOLIO
      ======================================== */}

      <div className="pricing-category pricing-portfolio-category">

        <Reveal className="pricing-category-heading">

          <div className="pricing-category-icon">
            <FaLaptopCode />
          </div>

          <h3 className="pricing-category-title">
            Création de portfolio
          </h3>

          <p className="pricing-category-description">
            Présentez votre profil, vos compétences et vos réalisations
            avec un portfolio professionnel qui valorise votre image
            auprès de vos futurs clients ou recruteurs.
          </p>

        </Reveal>

        {renderOfferCards(portfolioOffers, "portfolio")}

      </div>


      {/* ========================================
          DEUXIÈME CATÉGORIE : BOUTIQUE EN LIGNE
      ======================================== */}

      <div className="pricing-category pricing-ecommerce-category">

        <Reveal className="pricing-category-heading">

          <div className="pricing-category-icon">
            <FaShoppingCart />
          </div>

          <h3 className="pricing-category-title">
            Création de boutique en ligne
          </h3>

          <p className="pricing-category-description">
            Développez votre activité sur Internet grâce à une boutique
            en ligne adaptée à vos produits, à vos clients et à votre
            organisation commerciale.
          </p>

        </Reveal>

        {renderOfferCards(ecommerceOffers, "ecommerce")}

      </div>


      {/* ========================================
          CONDITIONS D'HÉBERGEMENT
      ======================================== */}

      <Reveal className="pricing-hosting">

        <div className="pricing-hosting-icon">
          <FaCheckCircle />
        </div>

        <div className="pricing-hosting-content">

          <h3>
            Hébergement offert au lancement
          </h3>

          <p className="pricing-hosting-intro">
            Pour vous aider à démarrer votre activité dans les
            meilleures conditions, une période d'hébergement
            est offerte selon votre ordre de commande.
          </p>

          <div className="pricing-hosting-benefits">

            <div className="pricing-hosting-item">

              <strong>12 mois offerts</strong>

              <span>
                : Pour les 5 premiers clients.
              </span>

            </div>

            <div className="pricing-hosting-item">

              <strong>6 mois offerts</strong>

              <span>
                : Pour les clients suivants.
              </span>

            </div>

          </div>

          <p className="pricing-hosting-condition">
            Après la période offerte, le renouvellement de
            l'hébergement est à la charge du client.
          </p>

          {/* NOUVEAU : estimation du coût après la période offerte. */}
          <p className="pricing-hosting-condition">
            Le coût de renouvellement de l'hébergement est estimé
            entre 3 et 10 € par mois. Il est conseillé de prévoir
            un budget de 5 à 10 € par mois, selon l'hébergement
            choisi et les besoins du site.
          </p>

          <p className="pricing-hosting-condition">
            Le nom de domaine et les services externes payants,
            lorsqu'ils sont nécessaires, ne sont pas compris
            dans les tarifs affichés.
          </p>

        </div>

      </Reveal>


      {/* ========================================
          NOTE ET CONDITIONS GÉNÉRALES
      ======================================== */}

      <Reveal>

        <p className="pricing-note">
          Les tarifs présentés correspondent aux formules décrites.
          Les fonctionnalités supplémentaires ou les besoins
          particuliers peuvent faire l'objet d'un devis personnalisé.
          La réduction de 15 % est réservée aux cinq premières
          commandes validées. L'offre d'hébergement dépend de l'ordre
          de validation des commandes et ne constitue pas un
          hébergement gratuit à vie.
        </p>

      </Reveal>

    </section>
  );
}


/* ========================================
   18. SECTION RÉSERVATION AVEC CALENDRIER
======================================== */

function Reservation() {
  // Date professionnelle actuelle à Madagascar.
  const today = getLocalDate();

  // Mois affiché dans le calendrier.
  const [currentMonth, setCurrentMonth] = useState(
    today.slice(0, 7)
  );

  // Date sélectionnée selon le calendrier du visiteur.
  const [date, setDate] = useState(today);

  // Disponibilités renvoyées par le backend.
  const [days, setDays] = useState([]);

  // Informations du visiteur.
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    projectDetails: ""
  });

  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Instant exact du créneau sélectionné.
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });


  /* ----------------------------------------
     CONSTRUCTION DU CALENDRIER
  ---------------------------------------- */

  const [year, month] = currentMonth.split("-").map(Number);

  const daysInMonth = new Date(year, month, 0).getDate();

  const firstDayOffset =
    (new Date(year, month - 1, 1).getDay() + 6) % 7;

  const calendarCells = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1
    )
  ];

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const weekdays = [
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
    "Dim"
  ];

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE
  }).format(new Date(Date.UTC(year, month - 1, 15, 12)));


  /* ----------------------------------------
     CHARGEMENT DES DISPONIBILITÉS
  ---------------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    const fetchMonthAvailability = async () => {
      setLoadingCalendar(true);
      setDays([]);
      setSelectedSlot(null);

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/creative-break/availability/month?month=${encodeURIComponent(currentMonth)}`,
          {
            method: "GET",
            signal: controller.signal
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Impossible de récupérer les disponibilités du calendrier."
          );
        }

        if (!controller.signal.aborted) {
          setDays(
            Array.isArray(data.days) ? data.days : []
          );
        }

      } catch (error) {
        if (error.name !== "AbortError") {
          setDays([]);

          setFeedback({
            type: "error",
            message:
              error.message ||
              "Erreur lors du chargement du calendrier."
          });
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoadingCalendar(false);
        }
      }
    };

    fetchMonthAvailability();

    return () => controller.abort();

  }, [currentMonth]);


  /* ----------------------------------------
     CRÉNEAUX AFFICHÉS DANS LE FUSEAU VISITEUR
  ---------------------------------------- */

  // Vérifier si un instant est encore dans le futur.
  const isSlotInFuture = (slot) => {
    return (
      slot?.startsAt &&
      new Date(slot.startsAt).getTime() > Date.now()
    );
  };

  // Tous les créneaux correspondant à la date affichée
  // dans le fuseau horaire du visiteur.
  const displayedSlots = days.flatMap((day) =>
    (day.slots || [])
      .filter((slot) => {
        if (!slot.startsAt) return false;

        return (
          getInstantDate(slot.startsAt, VISITOR_TIMEZONE) === date &&
          isSlotInFuture(slot)
        );
      })
      .map((slot) => ({
        ...slot,
        professionalDate: day.date,
        localTime: getInstantTime(slot.startsAt, VISITOR_TIMEZONE),
        localDate: getInstantDate(slot.startsAt, VISITOR_TIMEZONE)
      }))
  );


  /* ----------------------------------------
     NAVIGATION ENTRE LES MOIS
  ---------------------------------------- */

  const changeMonth = (direction) => {
    const [currentYear, currentMonthNumber] =
      currentMonth.split("-").map(Number);

    const newDate = new Date(
      currentYear,
      currentMonthNumber - 1 + direction,
      1
    );

    const newYear = newDate.getFullYear();

    const newMonth = String(
      newDate.getMonth() + 1
    ).padStart(2, "0");

    const newMonthValue = `${newYear}-${newMonth}`;

    if (newMonthValue < today.slice(0, 7)) {
      return;
    }

    setCurrentMonth(newMonthValue);
    setDate("");
    setSelectedSlot(null);

    setFeedback({
      type: "",
      message: ""
    });
  };


  /* ----------------------------------------
     SÉLECTION D'UNE JOURNÉE
  ---------------------------------------- */

  const handleDateSelection = (dayNumber) => {
    if (!dayNumber) return;

    const day = String(dayNumber).padStart(2, "0");
    const selectedDate = `${currentMonth}-${day}`;

    const availableSlots = days.flatMap((dayInfo) =>
      (dayInfo.slots || []).filter((slot) => {
        if (!slot.startsAt) return false;

        return (
          getInstantDate(slot.startsAt, VISITOR_TIMEZONE) === selectedDate &&
          isSlotInFuture(slot)
        );
      })
    );

    if (availableSlots.length === 0) {
      return;
    }

    setDate(selectedDate);
    setSelectedSlot(null);

    setFeedback({
      type: "",
      message: ""
    });
  };


  /* ----------------------------------------
     MODIFICATION DES CHAMPS
  ---------------------------------------- */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  /* ----------------------------------------
     ENVOI DE LA RÉSERVATION
  ---------------------------------------- */

  const handleBooking = async (event) => {
    event.preventDefault();

    if (!date || !selectedSlot?.startsAt) {
      setFeedback({
        type: "error",
        message:
          "Veuillez choisir une date et un horaire disponibles."
      });

      return;
    }

    if (!isSlotInFuture(selectedSlot)) {
      setFeedback({
        type: "error",
        message:
          "Ce créneau est déjà passé. Veuillez en choisir un autre."
      });

      setSelectedSlot(null);
      return;
    }

    setBookingLoading(true);

    setFeedback({
      type: "",
      message: ""
    });

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/creative-break/bookings`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          // startsAt est l'instant ISO du créneau.
          // Le backend doit prendre en charge ce champ pour
          // garantir la conversion correcte entre fuseaux.
          body: JSON.stringify({
            clientName: formData.clientName,
            clientPhone: formData.clientPhone,
            clientEmail: formData.clientEmail,
            projectDetails: formData.projectDetails,

            startsAt: selectedSlot.startsAt,
            visitorTimezone: VISITOR_TIMEZONE,

            // Informations de compatibilité avec l'ancienne route.
            date: selectedSlot.professionalDate,
            time: selectedSlot.time
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Impossible d'enregistrer votre réservation."
        );
      }

      setFeedback({
        type: "success",
        message:
          data.message ||
          "Votre demande de rendez-vous a été enregistrée avec succès !"
      });

      setFormData({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        projectDetails: ""
      });

      setSelectedSlot(null);

      // Actualiser les disponibilités après la réservation.
      const availabilityResponse = await fetch(
        `${BACKEND_URL}/api/creative-break/availability/month?month=${encodeURIComponent(currentMonth)}`
      );

      const availabilityData =
        await availabilityResponse.json();

      if (
        availabilityResponse.ok &&
        availabilityData.success &&
        Array.isArray(availabilityData.days)
      ) {
        setDays(availabilityData.days);
      }

    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Une erreur est survenue. Veuillez réessayer."
      });

    } finally {
      setBookingLoading(false);
    }
  };


  /* ----------------------------------------
     AFFICHAGE DE LA RÉSERVATION
  ---------------------------------------- */

  return (
    <section className="reservation section" id="reservation">

      <Reveal>

        <h2 className="section-title">
          Réserver un rendez-vous
        </h2>

        <p className="section-description">
          Vous avez un projet ou souhaitez discuter de vos besoins ?
          Choisissez une journée et un horaire pour échanger avec moi.
        </p>

      </Reveal>

      <div className="reservation-layout">

        <Reveal className="reservation-info">

          <div className="reservation-info-icon">
            <FaCalendarAlt />
          </div>

          <h3>Planifions votre projet</h3>

          <p>
            Réservez gratuitement un rendez-vous en visioconférence
            pour discuter de votre projet et de vos besoins.
          </p>

          <div className="reservation-detail">

            <FaClock />

            <div>
              <strong>Durée du rendez-vous</strong>
              <span>30 minutes</span>
            </div>

          </div>

          <div className="reservation-detail">

            <FaVideo />

            <div>
              <strong>Type de rendez-vous</strong>
              <span>Visioconférence gratuite</span>
            </div>

          </div>

          <div className="reservation-detail">

            <FaCalendarAlt />

            <div>
              <strong>Mes horaires habituels</strong>

              <span>Lundi, mardi, mercredi et vendredi</span>
              <span>09h00–13h00 et 14h00–18h00</span>
              <span>Jeudi : 08h00–12h00</span>
              <span>Samedi et dimanche : fermé</span>
            </div>

          </div>

          <p className="reservation-timezone">
            Les horaires sont affichés selon le fuseau horaire
            de votre appareil : {VISITOR_TIMEZONE}.
            Les disponibilités professionnelles sont définies
            selon l'heure de Madagascar ({TIMEZONE}).
          </p>

        </Reveal>


        <Reveal className="reservation-form-wrapper">

          <form
            className="reservation-form"
            onSubmit={handleBooking}
          >

            <h3>Choisissez votre rendez-vous</h3>


            {/* CALENDRIER MENSUEL */}

            <div className="calendar-container">

              <div className="calendar-header">

                <button
                  type="button"
                  className="calendar-nav-button"
                  onClick={() => changeMonth(-1)}
                  disabled={currentMonth <= today.slice(0, 7)}
                  aria-label="Mois précédent"
                >
                  <FaChevronLeft />
                </button>

                <h4>{monthLabel}</h4>

                <button
                  type="button"
                  className="calendar-nav-button"
                  onClick={() => changeMonth(1)}
                  aria-label="Mois suivant"
                >
                  <FaChevronRight />
                </button>

              </div>

              <div className="calendar-weekdays">

                {weekdays.map((weekday) => (
                  <span key={weekday}>
                    {weekday}
                  </span>
                ))}

              </div>

              <div className="calendar-grid">

                {calendarCells.map((dayNumber, index) => {

                  if (!dayNumber) {
                    return (
                      <div
                        className="calendar-empty"
                        key={`empty-${index}`}
                      />
                    );
                  }

                  const day = String(dayNumber).padStart(2, "0");
                  const dateValue = `${currentMonth}-${day}`;

                  // Recherche des créneaux disponibles à cette date
                  // dans le fuseau horaire du visiteur.
                  const localDaySlots = days.flatMap((dayInfo) =>
                    (dayInfo.slots || []).filter((slot) => {
                      if (!slot.startsAt) return false;

                      return (
                        getInstantDate(
                          slot.startsAt,
                          VISITOR_TIMEZONE
                        ) === dateValue &&
                        isSlotInFuture(slot)
                      );
                    })
                  );

                  const isPast =
                    dateValue < getDateInTimezone(VISITOR_TIMEZONE);

                  const isAvailable =
                    !isPast && localDaySlots.length > 0;

                  const isSelected = date === dateValue;

                  const isToday =
                    dateValue === getDateInTimezone(VISITOR_TIMEZONE);

                  let dayClass = "calendar-day";

                  if (
                    isPast ||
                    (!loadingCalendar && !isAvailable)
                  ) {
                    dayClass += " unavailable";
                  }

                  if (isAvailable) {
                    dayClass += " available";
                  }

                  if (isSelected) {
                    dayClass += " selected";
                  }

                  if (isToday) {
                    dayClass += " today";
                  }

                  return (
                    <button
                      type="button"
                      key={dateValue}
                      className={dayClass}
                      onClick={() => handleDateSelection(dayNumber)}
                      disabled={!isAvailable || loadingCalendar}
                      aria-label={`${dayNumber} ${monthLabel}, ${
                        isAvailable ? "disponible" : "indisponible"
                      }`}
                      aria-pressed={isSelected}
                    >

                      <span>{dayNumber}</span>

                      {isAvailable && (
                        <span className="calendar-day-indicator" />
                      )}

                    </button>
                  );
                })}

              </div>

              <div className="calendar-legend">

                <span>
                  <i className="legend-dot legend-available" />
                  Disponible
                </span>

                <span>
                  <i className="legend-dot legend-unavailable" />
                  Indisponible
                </span>

                <span>
                  <i className="legend-dot legend-selected" />
                  Sélectionné
                </span>

              </div>

              {loadingCalendar && (
                <p className="calendar-loading">
                  Chargement des disponibilités...
                </p>
              )}

            </div>


            {/* CRÉNEAUX HORAIRES */}

            <div className="slots-section">

              <div className="slots-heading">
                <label>Choisir un horaire</label>
              </div>

              {!date ? (

                <p className="slots-message">
                  Sélectionnez une journée disponible dans le calendrier.
                </p>

              ) : loadingCalendar ? (

                <p className="slots-message">
                  Chargement des horaires...
                </p>

              ) : displayedSlots.length > 0 ? (

                <div className="reservation-slots">

                  {displayedSlots.map((slot) => {

                    const isSelected =
                      selectedSlot?.startsAt === slot.startsAt;

                    return (
                      <button
                        key={slot.startsAt}
                        type="button"
                        className={
                          isSelected
                            ? "slot-button selected"
                            : "slot-button"
                        }
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.localTime}
                      </button>
                    );
                  })}

                </div>

              ) : (

                <p className="slots-message">
                  Aucun créneau disponible pour cette journée.
                  Choisissez une autre date.
                </p>

              )}

              {selectedSlot && (
                <p className="selected-slot-information">
                  Rendez-vous choisi :{" "}
                  {formatDateTimeInTimezone(
                    selectedSlot.startsAt,
                    VISITOR_TIMEZONE
                  )}
                </p>
              )}

            </div>


            {/* INFORMATIONS DU VISITEUR */}

            <h3 className="booking-form-title">
              Vos informations
            </h3>

            <label htmlFor="booking-name">
              Nom complet
            </label>

            <input
              id="booking-name"
              type="text"
              name="clientName"
              placeholder="Votre nom complet"
              value={formData.clientName}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <label htmlFor="booking-phone">
              Numéro de téléphone
            </label>

            <input
              id="booking-phone"
              type="tel"
              name="clientPhone"
              placeholder="Votre numéro de téléphone"
              value={formData.clientPhone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />

            <label htmlFor="booking-email">
              Adresse email
            </label>

            <input
              id="booking-email"
              type="email"
              name="clientEmail"
              placeholder="Votre adresse email"
              value={formData.clientEmail}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label htmlFor="booking-project">
              Parlez-moi de votre projet
            </label>

            <textarea
              id="booking-project"
              name="projectDetails"
              placeholder="Décrivez brièvement votre projet ou le sujet du rendez-vous..."
              rows="4"
              value={formData.projectDetails}
              onChange={handleChange}
              required
            />

            {feedback.message && (
              <p
                className={`form-feedback ${feedback.type}`}
                role="status"
              >
                {feedback.message}
              </p>
            )}

            <button
              type="submit"
              className="reservation-submit"
              disabled={
                bookingLoading ||
                loadingCalendar ||
                !selectedSlot ||
                !isSlotInFuture(selectedSlot)
              }
            >

              {bookingLoading
                ? "Enregistrement en cours..."
                : "Confirmer ma demande"
              }

              {!bookingLoading && <FaCalendarAlt />}

            </button>

            <p className="reservation-note">
              Votre demande sera enregistrée avec le statut
              « en attente ». Le rendez-vous sera confirmé
              après validation.
            </p>

          </form>

        </Reveal>

      </div>

    </section>
  );
}


/* ========================================
   19. SECTION CONTACT
======================================== */

function Contact({ professionalStatus }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    setFeedback({
      type: "",
      message: ""
    });

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Une erreur est survenue."
        );
      }

      setFeedback({
        type: "success",
        message: "Votre message a été envoyé avec succès !"
      });

      setFormData({
        name: "",
        email: "",
        message: ""
      });

    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Impossible d'envoyer votre message. Veuillez réessayer."
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact section" id="contact">

      <Reveal>

        <h2 className="section-title">
          Me contacter
        </h2>

        <p className="section-description">
          Vous avez un projet ou besoin d'un logiciel sur mesure ?
          N'hésitez pas à me contacter.
        </p>

      </Reveal>

      <motion.div
        className="contact-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.15
        }}
      >

        <motion.div
          className="contact-info"
          variants={cardVariants}
        >

          <h3>Parlons de votre projet</h3>

          <p>
            Je suis disponible pour échanger sur vos besoins et vous
            proposer des solutions adaptées à votre activité.
          </p>

          <div className="contact-item">
            <FaEnvelope />

            <a href="mailto:steveandrianirina4677@gmail.com">
              steveandrianirina4677@gmail.com
            </a>
          </div>

          {professionalStatus === "Disponible" && (
            <div className="contact-item">
              <FaPhone />

              <a href="tel:+261385990110">
                +261 38 599 01 10
              </a>
            </div>
          )}

          {professionalStatus &&
            professionalStatus !== "Disponible" && (
              <div className="contact-item">
                <FaPhone />

                <span>
                  Appels directs momentanément indisponibles.
                  Vous pouvez toujours m'envoyer un message.
                </span>
              </div>
          )}

          <div className="contact-item">
            <FaMapMarkerAlt />
            <span>Madagascar</span>
          </div>

          <div className="contact-item">

            <FaLinkedin />

            <a
              href="https://www.linkedin.com/in/steve-andrianirina-922a17448/"
              target="_blank"
              rel="noreferrer"
            >
              Mon LinkedIn
            </a>

          </div>

          <div className="whatsapp-contact">

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
              Me contacter sur WhatsApp
            </a>

          </div>

        </motion.div>

        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          variants={cardVariants}
        >

          <input
            type="text"
            name="name"
            placeholder="Votre nom"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Votre adresse email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Décrivez votre projet ou votre message..."
            rows="6"
            value={formData.message}
            onChange={handleChange}
            required
          />

          {feedback.message && (
            <p
              className={`form-feedback ${feedback.type}`}
              role="status"
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >

            {loading
              ? "Envoi en cours..."
              : "Envoyer le message"
            }

            {!loading && <FaPaperPlane />}

          </button>

        </motion.form>

      </motion.div>

    </section>
  );
}


/* ========================================
   20. PIED DE PAGE
======================================== */

function Footer() {
  return (
    <footer className="footer">

      <p>
        © {new Date().getFullYear()} Steve Andrianirina.
        Tous droits réservés.
      </p>

      <div className="footer-socials">

        <a
          href="https://www.linkedin.com/in/steve-andrianirina-922a17448/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>

        <a
          href="mailto:steveandrianirina4677@gmail.com"
          aria-label="Email"
        >
          <FaEnvelope />
        </a>

      </div>

    </footer>
  );
}


/* ========================================
   21. COMPOSANT PRINCIPAL
======================================== */

function App() {
  const [professionalStatus, setProfessionalStatus] =
    useState(null);

  // Récupérer le statut professionnel depuis le backend.
  useEffect(() => {
    let isMounted = true;

    const fetchProfessionalStatus = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/creative-break/status`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            "Impossible de récupérer le statut."
          );
        }

        if (
          isMounted &&
          STATUS_CONFIG[data.status]
        ) {
          setProfessionalStatus(data.status);
        }

      } catch (error) {
        console.error(
          "Erreur de récupération du statut professionnel :",
          error
        );
      }
    };

    fetchProfessionalStatus();

    // Actualiser le statut toutes les minutes.
    const interval = setInterval(
      fetchProfessionalStatus,
      60000
    );

    // Actualiser aussi lorsque le visiteur revient sur la page.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchProfessionalStatus();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      isMounted = false;

      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };

  }, []);


  /* ----------------------------------------
     AFFICHAGE DES SECTIONS
  ---------------------------------------- */

  return (
    <>

      <Navbar />

      <main>

        {/* Accueil avec la vidéo originale conservée. */}
        <Hero
          professionalStatus={professionalStatus}
        />

        {/* Nouvelle section de collaboration. */}
        <WorkProcess />

        <About />

        <Skills />

        <Projects />

        <Pricing />

        {/* Réservation indépendante du statut professionnel. */}
        <Reservation />

        {/* Contact contrôlé par le statut professionnel. */}
        <Contact
          professionalStatus={professionalStatus}
        />

      </main>

      <Footer />

    </>
  );
}


// ========================================
// EXPORTATION DU COMPOSANT PRINCIPAL
// ========================================

export default App;
