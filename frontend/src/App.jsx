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
  FaDownload,
  FaBars,
  FaTimes,
  FaPaperPlane,
  FaCheckCircle
} from "react-icons/fa";

// ================================
// BARRE DE NAVIGATION
// ================================
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    ["Accueil", "#accueil"],
    ["À propos", "#apropos"],
    ["Compétences", "#competences"],
    ["Projets", "#projets"],
    ["Contact", "#contact"]
  ];

  return (
    <nav className="navbar">
      <a href="#accueil" className="logo">
        Steve<span>.</span>
      </a>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Ouvrir le menu"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ================================
// SECTION ACCUEIL
// ================================
function Hero() {
  return (
    <section className="hero" id="accueil">
      <div className="hero-content">
        <span className="hero-badge">
          <FaCode /> Développeur Full Stack
        </span>

        <h1>
          Bonjour, je suis <span>Steve Andrianirina</span>
        </h1>

        <h2>Développeur Web & Python</h2>

        <p>
          Je conçois des applications web modernes, des solutions
          numériques et des outils de gestion adaptés aux besoins
          des entreprises et des particuliers.
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

          <a href="mailto:steveandrianirina4677@gmail.com">
            <FaEnvelope />
          </a>
        </div>
      </div>

      <div className="hero-image">
        <img src="/photo.png" alt="Steve Andrianirina" />
      </div>
    </section>
  );
}

// ================================
// SECTION À PROPOS
// ================================
function About() {
  return (
    <section className="about section" id="apropos">
      <div className="section-title">
        <span>Qui suis-je ?</span>
        <h2>À propos de moi</h2>
      </div>

      <div className="about-content">
        <div className="about-text">
          <h3>Passionné par le développement informatique</h3>

          <p>
            Je suis Steve Andrianirina, développeur orienté
            développement web et programmation Python.
          </p>

          <p>
            J'aime concevoir des applications utiles, simples
            à utiliser et adaptées aux besoins réels des utilisateurs.
            Mon objectif est de transformer les idées en solutions
            numériques efficaces.
          </p>

          <a href="#contact" className="btn-primary">
            Travaillons ensemble
          </a>
        </div>

        <div className="about-cards">
          <div className="about-card">
            <FaLaptopCode />
            <h3>Développement Web</h3>
            <p>Création de sites et applications modernes.</p>
          </div>

          <div className="about-card">
            <FaDatabase />
            <h3>Gestion de données</h3>
            <p>Conception et gestion de bases de données.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ================================
// SECTION COMPÉTENCES
// ================================
function Skills() {
  const skills = [
    { name: "HTML", level: "Intermédiaire" },
    { name: "CSS", level: "Intermédiaire" },
    { name: "JavaScript", level: "Intermédiaire" },
    { name: "React.js", level: "Intermédiaire" },
    { name: "Python", level: "Intermédiaire" },
    { name: "Node.js", level: "En apprentissage" },
    { name: "MySQL", level: "Intermédiaire" }
  ];

  return (
    <section className="skills section" id="competences">
      <div className="section-title">
        <span>Mon savoir-faire</span>
        <h2>Mes compétences</h2>
      </div>

      <div className="skills-grid">
        {skills.map((skill) => (
          <div className="skill-card" key={skill.name}>
            <FaCode />
            <h3>{skill.name}</h3>
            <p>{skill.level}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ================================
// SECTION PROJETS
// ================================
function Projects() {
  const projects = [
    {
      number: "01",
      title: "Application de gestion",
      description:
        "Application de gestion permettant d'organiser les informations, les opérations et les données d'une activité.",
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
      number: "02",
      title: "Portfolio personnel",
      description:
        "Site web personnel présentant mes compétences, mon parcours et mes réalisations.",
      technologies: [
        "JavaScript",
        "React.js",
        "HTML",
        "CSS"
      ]
    },
    {
      number: "03",
      title: "Application Python",
      description:
        "Développement d'une application en Python avec une base de données MySQL.",
      technologies: [
        "Python",
        "MySQL"
      ]
    }
  ];

  return (
    <section className="projects section" id="projets">
      <div className="section-title">
        <span>Ce que je réalise</span>
        <h2>Mes projets récents</h2>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.number}>
            <span className="project-number">{project.number}</span>

            <h3>{project.title}</h3>

            <p>{project.description}</p>

            <div className="project-technologies">
              {project.technologies.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ================================
// SECTION CONTACT
// ================================
function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setStatus("");
    setLoading(true);

    try {
      // Envoi du message vers le backend hébergé sur Render.
      const response = await fetch(
        "https://mon-portfolio-backend-twxs.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue.");
      }

      setStatus(data.message || "Votre message a été envoyé avec succès !");

      setFormData({
        name: "",
        email: "",
        message: ""
      });
    } catch (error) {
      console.error("Erreur :", error);

      setStatus(
        error.message || "Impossible d'envoyer le message. Réessayez."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="contact section" id="contact">
      <div className="section-title">
        <span>Entrons en contact</span>
        <h2>Me contacter</h2>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h3>Discutons de votre projet</h3>

          <p>
            Vous avez un projet web ou une application à développer ?
            N'hésitez pas à me contacter.
          </p>

          <div className="contact-item">
            <FaEnvelope />
            <span>steveandrianirina4677@gmail.com</span>
          </div>

          <div className="contact-item">
            <FaMapMarkerAlt />
            <span>Madagascar</span>
          </div>

          <div className="contact-item">
            <FaPhone />
            <span>Disponible pour vos projets</span>
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
            placeholder="Votre message..."
            rows="6"
            value={formData.message}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer le message"}
            {!loading && <FaPaperPlane />}
          </button>

          {status && (
            <p className="form-status" role="status">
              {status}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

// ================================
// PIED DE PAGE
// ================================
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
      </div>
    </footer>
  );
}

// ================================
// COMPOSANT PRINCIPAL
// ================================
export default function App() {
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