
import { useState } from "react";

import {
  FaGithub,
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
  FaReact
} from "react-icons/fa";

// ========================================
// INFORMATIONS PERSONNELLES
// ========================================

const API_URL =
  "https://mon-portfolio-backend-twxs.onrender.com/api/contact";

const projects = [
  {
    title: "Application de gestion d'établissement scolaire",
    description:
      "Une application permettant de faciliter la gestion des élèves, des enseignants, des inscriptions, des paiements et des résultats scolaires.",
    image: "/images/gestiondecole.png",
    icon: <FaGraduationCap />,
    technologies: ["JavaScript", "React.js", "Node.js", "MySQL", "HTML", "CSS"]
  },
  {
    title: "Site vitrine avec gestion de stock",
    description:
      "Un site vitrine professionnel accompagné d'une interface de gestion permettant de suivre les produits, les ventes et le stock.",
    image: "/images/pv.png",
    icon: <FaBoxes />,
    technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"]
  },
  {
    title: "Portfolio personnel",
    description:
      "Un portfolio moderne présentant mes compétences, mes réalisations et mes services en développement web et logiciel.",
    image: "/images/portf.png",
    icon: <FaUser />,
    technologies: ["JavaScript", "React.js", "Node.js", "CSS"]
  }
];

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
          aria-label="Ouvrir le menu"
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
// SECTION ACCUEIL
// ========================================

function Hero() {
  return (
    <section className="hero section" id="accueil">
      <div className="hero-content">
        <p className="hero-subtitle">Bonjour, je suis</p>

        <h1>
          Steve <span>Andrianirina</span>
        </h1>

        <h2>Développeur Full Stack</h2>

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
            href="https://github.com/steveandrianirina4677-a11"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>

          <a
            href="https://www.linkedin.com/in/steve-andrianirina-922a17448/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>

          <a href="mailto:steveandrianirina4677@gmail.com" aria-label="Email">
            <FaEnvelope />
          </a>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="/images/profil.png"
          alt="Steve Andrianirina"
          className="profile-photo"
        />
      </div>
    </section>
  );
}

// ========================================
// SECTION À PROPOS DE MOI
// ========================================

function About() {
  return (
    <section className="about section" id="apropos">
      <h2 className="section-title">À propos de moi</h2>

      <div className="about-content">
        <div className="about-text">
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
        </div>

        <div className="about-cards">
          <div className="about-card">
            <div className="about-icon">
              <FaLaptopCode />
            </div>

            <h3>Développement Web</h3>

            <p>
              Création de sites et d'applications modernes.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <FaCode />
            </div>

            <h3>Développement logiciel</h3>

            <p>
              Création du logiciel pour faciliter la gestion de vos
              tâches et gain de temps.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <FaDatabase />
            </div>

            <h3>Gestion de données</h3>

            <p>
              Conception et gestion de bases de données.
            </p>
          </div>
        </div>

        <div className="about-button">
          <a href="#contact" className="btn-primary">
            Travaillons ensemble
          </a>
        </div>
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
      <h2 className="section-title">Mes compétences</h2>

      <p className="section-description">
        Les technologies que j'utilise pour concevoir des solutions
        numériques modernes et performantes.
      </p>

      <div className="skills-grid">
        {skills.map((skill, index) => (
          <div className="skill-card" key={index}>
            <div className="skill-icon">{skill.icon}</div>
            <h3>{skill.name}</h3>
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
    <section className="projects section" id="projets">
      <h2 className="section-title">Mes projets récents</h2>

      <p className="section-description">
        Découvrez quelques réalisations qui illustrent mes compétences
        en développement web et logiciel.
      </p>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={index}>
            <div className="project-image">
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
              />
            </div>

            <div className="project-content">
              <div className="project-icon">
                {project.icon}
              </div>

              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <div className="project-technologies">
                {project.technologies.map((technology, techIndex) => (
                  <span key={techIndex}>{technology}</span>
                ))}
              </div>
            </div>
          </article>
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
    setFeedback({ type: "", message: "" });

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
        throw new Error(data.message || "Une erreur est survenue.");
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
      <h2 className="section-title">Me contacter</h2>

      <p className="section-description">
        Vous avez un projet ou besoin d'un logiciel sur mesure ?
        N'hésitez pas à me contacter.
      </p>

      <div className="contact-container">
        <div className="contact-info">
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
            <FaMapMarkerAlt />
            <span>Madagascar</span>
          </div>

          <div className="contact-item">
            <FaGithub />
            <a
              href="https://github.com/steveandrianirina4677-a11"
              target="_blank"
              rel="noreferrer"
            >
              Mon GitHub
            </a>
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
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
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
            <p className={`form-feedback ${feedback.type}`}>
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Envoi en cours..." : "Envoyer le message"}
            {!loading && <FaPaperPlane />}
          </button>
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
        © {new Date().getFullYear()} Steve Andrianirina.
        Tous droits réservés.
      </p>

      <div className="footer-socials">
        <a
          href="https://github.com/steveandrianirina4677-a11"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>

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
