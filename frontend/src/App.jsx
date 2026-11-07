
import { useState } from "react";

import {
  FaPython,
  FaNodeJs,
  FaReact,
  FaGithub,
  FaDatabase,
  FaJs,
  FaLinkedin,
  FaEnvelope,
  FaCode,
  FaLaptopCode,
  FaBars,
  FaTimes,
  FaExternalLinkAlt
} from "react-icons/fa";

// ========================================
// COORDONNEES PERSONNELLES
// ========================================

const personalInfo = {
  name: "Steve Andrianirina",
  github: "https://github.com/steveandrianirina4677-a11",
  linkedin: "https://www.linkedin.com/in/steve-andrianirina-922a17448/",
  email: "steveandrianirina4677@gmail.com"
};

// ========================================
// COMPETENCES
// ========================================

const skills = [
  {
    name: "Python",
    level: "Avancé",
    icon: <FaPython />
  },
  {
    name: "SQL / MySQL",
    level: "Intermédiaire",
    icon: <FaDatabase />
  },
  {
    name: "JavaScript",
    level: "Avancé",
    icon: <FaJs />
  },
  {
    name: "Node.js",
    level: "Intermédiaire",
    icon: <FaNodeJs />
  },
  {
    name: "React.js",
    level: "Intermédiaire",
    icon: <FaReact />
  },
  {
    name: "GitHub",
    level: "Intermédiaire",
    icon: <FaGithub />
  }
];

// ========================================
// PROJETS RECENTS
// ========================================

const projects = [
  {
    number: "01",
    title: "Application de gestion",
    description:
      "Développement d'une application de gestion permettant d'organiser les informations, gérer les données et simplifier les tâches quotidiennes.",

    tech: [
      "JavaScript",
      "React.js",
      "Node.js",
      "MySQL",
      "HTML",
      "CSS"
    ],

    github: personalInfo.github,
    demo: "#"
  },

  {
    number: "02",
    title: "Portfolio personnel",
    description:
      "Création d'un portfolio moderne et responsive pour présenter mes compétences, mes réalisations et mes services en développement web.",

    tech: [
      "JavaScript",
      "React.js",
      "HTML",
      "CSS"
    ],

    github: personalInfo.github,
    demo: "#"
  },

  {
    number: "03",
    title: "Application Python",
    description:
      "Développement d'une application Python destinée à automatiser certaines tâches et faciliter la gestion des informations.",

    tech: [
      "Python",
      "MySQL"
    ],

    github: personalInfo.github,
    demo: "#"
  }
];

// ========================================
// NAVIGATION
// ========================================

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      <a
        href="#accueil"
        className="logo"
        onClick={closeMenu}
      >
        Steve<span>.</span>
      </a>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Ouvrir ou fermer le menu"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>

        <li>
          <a href="#accueil" onClick={closeMenu}>
            Accueil
          </a>
        </li>

        <li>
          <a href="#apropos" onClick={closeMenu}>
            À propos
          </a>
        </li>

        <li>
          <a href="#competences" onClick={closeMenu}>
            Compétences
          </a>
        </li>

        <li>
          <a href="#projets" onClick={closeMenu}>
            Projets
          </a>
        </li>

        <li>
          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
        </li>

      </ul>

    </nav>
  );
}

// ========================================
// SECTION ACCUEIL
// ========================================

function Hero() {
  return (
    <section className="hero" id="accueil">

      <div className="hero-content">

        <p className="welcome">
          BIENVENUE SUR MON PORTFOLIO
        </p>

        <h1>
          Bonjour, je suis
          <br />
          <span>{personalInfo.name}</span>
        </h1>

        <h2>
          Développeur Full Stack
        </h2>

        <p className="hero-description">
          Je conçois des applications web modernes,
          performantes et adaptées aux besoins des
          entreprises et des particuliers.
        </p>

        <div className="hero-buttons">

          <a href="#projets" className="btn primary">
            Voir mes projets
          </a>

          <a href="#contact" className="btn secondary">
            Me contacter
          </a>

        </div>

        <div className="social-links">

          <a
            href={personalInfo.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>

          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>

          <a
            href={`mailto:${personalInfo.email}`}
            aria-label="Email"
          >
            <FaEnvelope />
          </a>

        </div>

      </div>

      <div className="hero-visual">

        <div className="profile-container">

          <img
            src="/photo.png"
            alt="Photo de Steve Andrianirina"
            className="profile-photo"
          />

          <div className="profile-badge">
            <FaCode />
            <span>Full Stack Developer</span>
          </div>

        </div>

      </div>

    </section>
  );
}

// ========================================
// SECTION A PROPOS
// ========================================

function About() {
  return (
    <section className="section about" id="apropos">

      <h2 className="section-title">
        À propos de moi
      </h2>

      <div className="about-content">

        <div className="about-icon">
          <FaLaptopCode />
        </div>

        <p>
          Je suis développeur passionné par la création
          d'applications web et de solutions informatiques.

          Je travaille avec Python, JavaScript, React,
          Node.js et MySQL pour concevoir des projets
          modernes, pratiques et adaptés aux besoins
          des utilisateurs.

          Mon objectif est de transformer les idées
          en solutions numériques efficaces.
        </p>

      </div>

    </section>
  );
}

// ========================================
// SECTION COMPETENCES
// ========================================

function Skills() {
  return (
    <section className="section skills" id="competences">

      <h2 className="section-title">
        Mes compétences
      </h2>

      <div className="skills-grid">

        {skills.map((skill, index) => (

          <div className="skill-card" key={index}>

            <div className="skill-icon">
              {skill.icon}
            </div>

            <h3>{skill.name}</h3>

            <p>{skill.level}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

// ========================================
// SECTION PROJETS
// ========================================

function Projects() {
  return (
    <section className="section projects" id="projets">

      <h2 className="section-title">
        Mes projets récents
      </h2>

      <div className="projects-grid">

        {projects.map((project, index) => (

          <div className="project-card" key={index}>

            <div className="project-number">
              {project.number}
            </div>

            <div className="project-icon">
              <FaLaptopCode />
            </div>

            <h3>{project.title}</h3>

            <p>{project.description}</p>

            <div className="tech-list">

              {project.tech.map((technology, techIndex) => (

                <span key={techIndex}>
                  {technology}
                </span>

              ))}

            </div>

            <div className="project-links">

              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub />
                Code source
              </a>

              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
              >
                <FaExternalLinkAlt />
                Démo
              </a>

            </div>

          </div>

        ))}

      </div>

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

  const [status, setStatus] = useState("");

  // Mise à jour des champs du formulaire
  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });

  };

  // Envoi du formulaire au serveur
  const handleSubmit = async (event) => {

    event.preventDefault();

    setStatus("Envoi en cours...");

    try {

      const response = await fetch(
        "http://localhost:5000/api/contact",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }

      setStatus(
        "Votre message a été envoyé avec succès !"
      );

      setFormData({
        name: "",
        email: "",
        message: ""
      });

    } catch (error) {

      setStatus(
        "Impossible d'envoyer le message. Vérifiez que le serveur est démarré."
      );

    }

  };

  return (
    <section className="section contact" id="contact">

      <h2 className="section-title">
        Contactez-moi
      </h2>

      <div className="contact-container">

        <div className="contact-info">

          <h3>
            Travaillons ensemble
          </h3>

          <p>
            Vous avez un projet ou une idée ?
            Contactez-moi pour discuter de vos besoins.
          </p>

          <p>
            <FaEnvelope />

            <a href={`mailto:${personalInfo.email}`}>
              {personalInfo.email}
            </a>
          </p>

          <p>
            <FaLinkedin />

            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              Mon profil LinkedIn
            </a>
          </p>

          <p>
            <FaGithub />

            <a
              href={personalInfo.github}
              target="_blank"
              rel="noreferrer"
            >
              Mon profil GitHub
            </a>
          </p>

        </div>

        <form
          className="contact-form"
          onSubmit={handleSubmit}
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
            placeholder="Votre message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="btn primary"
          >
            Envoyer le message
          </button>

          {status && (
            <p className="form-status">
              {status}
            </p>
          )}

        </form>

      </div>

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
        © {new Date().getFullYear()} {personalInfo.name}.
        Tous droits réservés.
      </p>

    </footer>
  );
}

// ========================================
// APPLICATION PRINCIPALE
// ========================================

function App() {

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </>
  );

}

export default App;
