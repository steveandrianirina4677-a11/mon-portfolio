// ========================================
// 1. IMPORTATION DES OUTILS ET DES ICÔNES
// ========================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  FaVideo
} from "react-icons/fa";

// ========================================
// 2. CONFIGURATION DU BACKEND
// ========================================

// Adresse principale du backend hébergé sur Render.
// Les différentes fonctionnalités utilisent cette même adresse.
const BACKEND_URL =
  "https://mon-portfolio-backend-twxs.onrender.com";

// Adresse du formulaire de contact.
// On conserve exactement la route qui fonctionne déjà.
const API_URL = `${BACKEND_URL}/api/contact`;

// Lien WhatsApp utilisé sur le portfolio.
const WHATSAPP_URL =
  "https://wa.me/261385990110?text=Bonjour%20Steve%2C%20je%20viens%20de%20visiter%20votre%20portfolio.";

// Fuseau horaire utilisé pour les rendez-vous.
const TIMEZONE = "Indian/Antananarivo";

// ========================================
// 3. FONCTION POUR OBTENIR LA DATE LOCALE
// ========================================

// Cette fonction évite les erreurs de date liées au décalage UTC.
// Elle retourne une date au format YYYY-MM-DD à Madagascar.
function getLocalDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}`;
}

// ========================================
// 4. LISTE DES PROJETS
// ========================================

// Les quatre projets existants sont conservés.
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

// ========================================
// 5. CONFIGURATION DES ANIMATIONS
// ========================================

// Animation d'apparition progressive des éléments.
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

// Animation qui fait apparaître les cartes progressivement.
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Animation individuelle des cartes.
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

// ========================================
// 6. EFFET SCROLL REVEAL
// ========================================

// Ce composant fait apparaître son contenu
// lorsque l'utilisateur fait défiler la page.
function Reveal({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.2,
        margin: "0px 0px -50px 0px"
      }}
      style={{
        willChange: "transform, opacity"
      }}
    >
      {children}
    </motion.div>
  );
}

// ========================================
// 7. EFFET TEXTE QUI S'ÉCRIT AUTOMATIQUEMENT
// ========================================

// Le texte change automatiquement pour présenter
// les différents métiers et technologies.
function TypingEffect() {
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
  }, [text, deleting, wordIndex]);

  return (
    <h2 className="typing-title">
      {text}
      <span className="typing-cursor">|</span>
    </h2>
  );
}

// ========================================
// 8. EFFET ICÔNES TECHNOLOGIQUES FLOTTANTES
// ========================================

// Les icônes technologiques bougent doucement
// autour du contenu de la section d'accueil.
function FloatingIcons() {
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
          animate={{
            y: [0, -16, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
}

// ========================================
// 9. EFFET PARTICULES LUMINEUSES
// ========================================

// Création de petites particules animées.
function Particles() {
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
          animate={{
            opacity: [0.15, 0.8, 0.15],
            scale: [0.7, 1.3, 0.7],
            y: [0, -18, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// ========================================
// 10. BARRE DE NAVIGATION
// ========================================

// Menu de navigation avec affichage mobile.
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
          <li><a href="#accueil" onClick={closeMenu}>Accueil</a></li>
          <li><a href="#apropos" onClick={closeMenu}>À propos</a></li>
          <li><a href="#competences" onClick={closeMenu}>Compétences</a></li>
          <li><a href="#projets" onClick={closeMenu}>Mes projets</a></li>
          <li><a href="#offres" onClick={closeMenu}>Mes tarifs</a></li>

          {/* Nouveau lien vers l'agenda de réservation */}
          <li><a href="#reservation" onClick={closeMenu}>Réserver un rendez-vous</a></li>

          <li><a href="#contact" onClick={closeMenu}>Me contacter</a></li>
        </ul>

      </div>
    </nav>
  );
}

// ========================================
// 11. SECTION ACCUEIL AVEC VIDÉO
// ========================================

// La vidéo d'origine et la photo de profil sont conservées.
function Hero() {
  return (
    <section className="hero section" id="accueil">

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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >

        <p className="hero-subtitle">
          Bonjour, je suis
        </p>

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

      <motion.div
        className="hero-image"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0 }}
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

// ========================================
// 12. SECTION À PROPOS DE MOI
// ========================================

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

// ========================================
// 13. SECTION COMPÉTENCES
// ========================================

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

// ========================================
// 14. SECTION PROJETS
// ========================================

// Présentation des projets avec carrousel E-commerce
// et affichage des images en grand format.
function Projects() {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  // Afficher l'image précédente du carrousel.
  const previousImage = (images) => {
    setCurrentImage((previous) =>
      (previous - 1 + images.length) % images.length
    );
  };

  // Afficher l'image suivante du carrousel.
  const nextImage = (images) => {
    setCurrentImage((previous) =>
      (previous + 1) % images.length
    );
  };

  // Gérer les touches du clavier dans la fenêtre d'image agrandie.
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
            whileHover={{
              y: -10,
              rotateX: 2,
              rotateY: -2,
              scale: 1.015,
              transition: { duration: 0.3 }
            }}
            style={{ transformPerspective: 1000 }}
          >

            {/* Image des trois premiers projets */}
            {project.image && (
              <div className="project-image">
                <motion.img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  whileHover={{ scale: 1.07 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            {/* Carrousel réservé au projet E-commerce */}
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
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
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

                {/* Petits points permettant de choisir une image */}
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
                whileHover={{
                  rotate: 10,
                  scale: 1.12
                }}
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
                    whileHover={{
                      scale: 1.06,
                      y: -2
                    }}
                  >
                    {technology}
                  </motion.span>
                ))}
              </div>

            </div>

          </motion.article>

        ))}

      </motion.div>

      {/* Fenêtre d'agrandissement des images */}
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

// ========================================
// 15. SECTION MES OFFRES ET TARIFS
// ========================================

function Pricing() {
  // Les deux offres commerciales conservées.
  const offers = [
    {
      title: "Création de portfolio professionnel",

      description:
        "Je vais créer votre portfolio professionnel pour présenter votre profil, vos compétences, vos réalisations et attirer de nouveaux clients.",

      icon: <FaLaptopCode />,

      originalPrice: "250 €",
      discountedPrice: "212,50 €",

      features: [
        "Design moderne et personnalisé",
        "Présentation de votre activité",
        "Sections personnalisées",
        "Formulaire de contact",
        "Adaptation mobile et ordinateur"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par la création de votre portfolio professionnel. Je souhaite obtenir plus d'informations."
    },

    {
      title: "Boutique en ligne E-commerce",

      description:
        "Je vais créer votre boutique en ligne E-commerce pour présenter vos produits, recevoir des commandes et développer votre activité sur Internet.",

      icon: <FaShoppingCart />,

      originalPrice: "700 €",
      discountedPrice: "595 €",

      features: [
        "Design professionnel personnalisé",
        "Catalogue de produits avec photos",
        "Panier et système de commande",
        "Gestion des produits et des stocks",
        "Interface d'administration",
        "Adaptation mobile et ordinateur"
      ],

      message:
        "Bonjour Steve, je suis intéressé(e) par la création de votre boutique en ligne E-commerce. Je souhaite obtenir plus d'informations."
    }
  ];

  return (
    <section className="pricing section" id="offres">

      <Reveal>
        <h2 className="section-title">
          Mes offres et tarifs
        </h2>

        <p className="section-description">
          Vous avez un projet ? Je vous accompagne dans la création
          d'une solution numérique adaptée à vos besoins.
        </p>
      </Reveal>

      {/* Bannière promotionnelle */}
      <Reveal className="pricing-promo">

        <div className="pricing-promo-icon">
          <FaTags />
        </div>

        <div className="pricing-promo-content">

          <span className="pricing-promo-label">
            OFFRE DE LANCEMENT
          </span>

          <h3>
            15 % de réduction pour les 5 premières commandes validées !
          </h3>

          <p>
            Profitez de cette offre spéciale pour lancer votre projet
            numérique à un tarif avantageux.
          </p>

        </div>
      </Reveal>

      {/* Cartes des offres */}
      <motion.div
        className="pricing-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.15
        }}
      >

        {offers.map((offer) => (

          <motion.article
            className="pricing-card"
            key={offer.title}
            variants={cardVariants}
            whileHover={{
              y: -8,
              transition: { duration: 0.3 }
            }}
          >

            <div className="pricing-card-icon">
              {offer.icon}
            </div>

            <h3>{offer.title}</h3>

            <p className="pricing-description">
              {offer.description}
            </p>

            <div className="pricing-price">

              <span className="pricing-original">
                Tarif habituel : à partir de {offer.originalPrice}
              </span>

              <span className="pricing-discount">
                -15 %
              </span>

            </div>

            <div className="pricing-discounted">

              <span>
                Offre de lancement : à partir de
              </span>

              <strong>
                {offer.discountedPrice}
              </strong>

            </div>

            <ul className="pricing-features">

              {offer.features.map((feature, index) => (

                <li key={index}>
                  <span className="pricing-check">✓</span>
                  <span>{feature}</span>
                </li>

              ))}

            </ul>

            <a
              href={`https://wa.me/261385990110?text=${encodeURIComponent(
                offer.message
              )}`}
              className="pricing-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
              Commander cette offre
            </a>

          </motion.article>

        ))}

      </motion.div>

      <Reveal>
        <p className="pricing-note">
          Les tarifs affichés sont des prix de départ.
          Le prix final dépend des fonctionnalités et des besoins
          de votre projet. La réduction de 15 % est réservée aux
          cinq premières commandes validées.
        </p>
      </Reveal>

    </section>
  );
}

// ========================================
// 16. NOUVELLE SECTION : RÉSERVATION
// ========================================

// Cette section permet aux visiteurs de :
// 1. Choisir une date.
// 2. Consulter les créneaux disponibles depuis le backend.
// 3. Choisir un horaire.
// 4. Remplir leurs coordonnées.
// 5. Envoyer une demande de rendez-vous.

// Le backend reste responsable de vérifier la disponibilité
// et d'enregistrer le rendez-vous dans Supabase.

function Reservation() {

  // Date sélectionnée : aujourd'hui à Madagascar par défaut.
  const [date, setDate] = useState(getLocalDate);

  // Créneaux récupérés depuis le backend.
  const [slots, setSlots] = useState([]);

  // Horaire choisi par le visiteur.
  const [selectedTime, setSelectedTime] = useState("");

  // Informations demandées au visiteur.
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    projectDetails: ""
  });

  // États de chargement et de retour utilisateur.
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  // La date minimale est aujourd'hui à Madagascar.
  const minimumDate = getLocalDate();

  // ----------------------------------------
  // RÉCUPÉRATION DES CRÉNEAUX DISPONIBLES
  // ----------------------------------------

  useEffect(() => {
    // Lorsqu'on change de date, on réinitialise l'ancien horaire.
    setSelectedTime("");
    setSlots([]);

    setFeedback({
      type: "",
      message: ""
    });

    // Évite d'envoyer une date antérieure à aujourd'hui.
    if (date < minimumDate) {
      setFeedback({
        type: "error",
        message: "Veuillez sélectionner une date valide."
      });

      return;
    }

    // Permet d'annuler une ancienne requête si la date change.
    const controller = new AbortController();

    const fetchAvailability = async () => {
      setLoadingSlots(true);

      try {
        // Appel à la route GET déjà créée dans le backend.
        const response = await fetch(
          `${BACKEND_URL}/api/creative-break/availability?date=${encodeURIComponent(date)}`,
          {
            method: "GET",
            signal: controller.signal
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Impossible de récupérer les disponibilités."
          );
        }

        // Les créneaux sont fournis par le serveur.
        // On ne fabrique donc pas de disponibilités fictives.
        setSlots(Array.isArray(data.slots) ? data.slots : []);

      } catch (error) {

        // Une requête annulée lors d'un changement de date
        // ne doit pas afficher un message d'erreur.
        if (error.name !== "AbortError") {
          setSlots([]);

          setFeedback({
            type: "error",
            message:
              error.message ||
              "Erreur lors du chargement des disponibilités."
          });
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoadingSlots(false);
        }
      }
    };

    fetchAvailability();

    // Nettoyage de la requête si le composant est démonté
    // ou si l'utilisateur choisit une autre date.
    return () => controller.abort();

  }, [date]);

  // ----------------------------------------
  // MODIFICATION DES CHAMPS DU FORMULAIRE
  // ----------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ----------------------------------------
  // ENVOI DE LA DEMANDE DE RENDEZ-VOUS
  // ----------------------------------------

  const handleBooking = async (event) => {
    event.preventDefault();

    // Vérification de l'horaire sélectionné.
    if (!selectedTime) {
      setFeedback({
        type: "error",
        message: "Veuillez choisir un créneau horaire."
      });

      return;
    }

    setBookingLoading(true);

    setFeedback({
      type: "",
      message: ""
    });

    try {
      // Envoi des données avec les noms de champs attendus
      // par la route POST /api/creative-break/bookings.
      const response = await fetch(
        `${BACKEND_URL}/api/creative-break/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            clientName: formData.clientName,
            clientPhone: formData.clientPhone,
            clientEmail: formData.clientEmail,
            projectDetails: formData.projectDetails,
            date: date,
            time: selectedTime
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Impossible d'enregistrer votre réservation."
        );
      }

      // Confirmation affichée après la réponse positive du backend.
      setFeedback({
        type: "success",
        message:
          data.message ||
          "Votre demande de rendez-vous a été enregistrée !"
      });

      // Réinitialisation du formulaire après l'enregistrement.
      setFormData({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        projectDetails: ""
      });

      setSelectedTime("");

      // Actualisation des créneaux pour tenir compte
      // du rendez-vous qui vient d'être enregistré.
      const availabilityResponse = await fetch(
        `${BACKEND_URL}/api/creative-break/availability?date=${encodeURIComponent(date)}`
      );

      const availabilityData = await availabilityResponse.json();

      if (
        availabilityResponse.ok &&
        availabilityData.success &&
        Array.isArray(availabilityData.slots)
      ) {
        setSlots(availabilityData.slots);
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

  return (
    <section className="reservation section" id="reservation">

      {/* Présentation de la réservation */}
      <Reveal>
        <h2 className="section-title">
          Réserver un rendez-vous
        </h2>

        <p className="section-description">
          Vous avez un projet ou souhaitez discuter de vos besoins ?
          Choisissez une date et un horaire pour échanger avec moi.
        </p>
      </Reveal>

      <div className="reservation-layout">

        {/* Informations sur les rendez-vous */}
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
              <strong>Disponibilités habituelles</strong>
              <span>Du lundi au vendredi</span>
              <span>09h00–13h00 et 14h00–18h00</span>
            </div>
          </div>

          <p className="reservation-timezone">
            Horaires affichés selon l'heure de Madagascar.
          </p>

        </Reveal>

        {/* Formulaire de réservation */}
        <Reveal className="reservation-form-wrapper">

          <form
            className="reservation-form"
            onSubmit={handleBooking}
          >

            <h3>Vos informations</h3>

            {/* Choix de la date */}
            <label htmlFor="booking-date">
              Choisir une date
            </label>

            <input
              id="booking-date"
              type="date"
              value={date}
              min={minimumDate}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            {/* Affichage des créneaux */}
            <div className="slots-heading">
              <label>Choisir un horaire</label>

              {loadingSlots && (
                <span className="slots-loading">
                  Chargement...
                </span>
              )}
            </div>

            {loadingSlots ? (
              <p className="slots-message">
                Recherche des disponibilités...
              </p>
            ) : slots.length > 0 ? (

              <div className="reservation-slots">

                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    className={
                      selectedTime === slot.time
                        ? "slot-button selected"
                        : "slot-button"
                    }
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}

              </div>

            ) : (

              <p className="slots-message">
                Aucun créneau disponible pour cette date.
                Essayez une autre journée.
              </p>

            )}

            {/* Nom du visiteur */}
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

            {/* Téléphone du visiteur */}
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

            {/* Adresse email du visiteur */}
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

            {/* Description du projet */}
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

            {/* Confirmation ou message d'erreur */}
            {feedback.message && (
              <p
                className={`form-feedback ${feedback.type}`}
                role="status"
              >
                {feedback.message}
              </p>
            )}

            {/* Bouton d'envoi */}
            <button
              type="submit"
              className="reservation-submit"
              disabled={
                bookingLoading ||
                loadingSlots ||
                slots.length === 0 ||
                !selectedTime
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

// ========================================
// 17. SECTION CONTACT
// ========================================

// Le formulaire existant est conservé.
// Il continue d'utiliser /api/contact.
function Contact() {
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

  // Mise à jour des champs du formulaire.
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // Envoi du message vers le backend.
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

        {/* Coordonnées */}
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

          <div className="contact-item">
            <FaPhone />
            <a href="tel:+261385990110">
              +261 38 599 01 10
            </a>
          </div>

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

          {/* Contact WhatsApp */}
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

        {/* Formulaire de contact */}
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

// ========================================
// 18. PIED DE PAGE
// ========================================

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

// ========================================
// 19. COMPOSANT PRINCIPAL DE L'APPLICATION
// ========================================

// C'est ici que toutes les sections sont assemblées.
// La réservation est ajoutée après les tarifs,
// sans déplacer les autres sections.
function App() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Pricing />
        <Reservation />
        <Contact />
      </main>

      <Footer />
    </>
  );
}

// Exportation du composant pour le démarrage de React.
export default App;