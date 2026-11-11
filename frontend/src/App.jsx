
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
  FaWhatsapp
} from "react-icons/fa";

// ========================================
// INFORMATIONS PERSONNELLES
// ========================================

const API_URL =
  "https://mon-portfolio-backend-twxs.onrender.com/api/contact";

const WHATSAPP_URL =
  "https://wa.me/261385990110?text=Bonjour%20Steve%2C%20je%20viens%20de%20visiter%20votre%20portfolio.";

// ========================================
// LISTE DES PROJETS
// ========================================

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
  }
];

// ========================================
// ANIMATIONS GÉNÉRALES
// ========================================

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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

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
// EFFET 2 : SCROLL REVEAL
// APPARITION PROGRESSIVE AU DÉFILEMENT
// ========================================

function Reveal({ children, className = "" }) {
  return (
    <motion.div
      className={className}

      // Animation de départ et d'arrivée
      variants={revealVariants}

      // L'élément commence invisible
      initial="hidden"

      // L'animation démarre lorsque l'élément apparaît à l'écran
      whileInView="visible"

      // L'animation ne se répète pas
      viewport={{
        once: true,
        amount: 0.2,
        margin: "0px 0px -50px 0px"
      }}

      // Optimisation de l'animation
      style={{
        willChange: "transform, opacity"
      }}
    >
      {children}
    </motion.div>
  );
}

// ========================================
// EFFET 1 : TEXTE QUI S'ÉCRIT AUTOMATIQUEMENT
// ========================================

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
// EFFET 4 : ICÔNES TECHNOLOGIQUES FLOTTANTES
// ========================================

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
// EFFET 6 : PARTICULES LUMINEUSES
// ========================================

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
// BARRE DE NAVIGATION
// ========================================

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
          <li><a href="#contact" onClick={closeMenu}>Me contacter</a></li>
        </ul>

      </div>
    </nav>
  );
}

// ========================================
// SECTION ACCUEIL AVEC VIDÉO CONSERVÉE
// ========================================

function Hero() {
  return (
    <section className="hero section" id="accueil">

      {/* VIDÉO ORIGINALE : CONSERVÉE SANS MODIFICATION */}
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

      {/* VOILE SOMBRE */}
      <div className="hero-overlay" aria-hidden="true"></div>

      {/* PARTICULES LUMINEUSES */}
      <Particles />

      {/* ICÔNES TECHNOLOGIQUES */}
      <FloatingIcons />

      {/* PRÉSENTATION */}
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

        {/* RÉSEAUX SOCIAUX */}
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

      {/* PHOTO DE PROFIL */}
      <motion.div
        className="hero-image"
        initial={{ opacity: 0, x: 35 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.25 }}
      >
        <img
          src="/images/profil.png"
          alt="Steve Andrianirina"
          className="profile-photo"
        />
      </motion.div>

    </section>
  );
}

// ========================================
// SECTION À PROPOS DE MOI
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
// SECTION COMPÉTENCES
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
// SECTION PROJETS
// ========================================

function Projects() {
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

            {/* IMAGE DU PROJET */}
            <div className="project-image">
              <motion.img
                src={project.image}
                alt={project.title}
                loading="lazy"
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* CONTENU DU PROJET */}
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

              {/* TECHNOLOGIES UTILISÉES */}
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

    </section>
  );
}

// ========================================
// SECTION CONTACT
// ========================================

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

  // Gestion des changements dans les champs
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // Envoi du formulaire vers le backend
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
        viewport={{ once: true, amount: 0.15 }}
      >

        {/* COORDONNÉES */}
        <motion.div className="contact-info" variants={cardVariants}>

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

          {/* CONTACT WHATSAPP */}
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

        {/* FORMULAIRE DE CONTACT */}
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

          {/* MESSAGE DE CONFIRMATION OU ERREUR */}
          {feedback.message && (
            <p className={`form-feedback ${feedback.type}`} role="status">
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
// PIED DE PAGE
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
// COMPOSANT PRINCIPAL
// ========================================

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default App;
