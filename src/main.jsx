import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Code2,
  Contact,
  Cpu,
  Download,
  Mail,
  MoveRight,
  Wrench,
} from "lucide-react";
import "./styles.css";

const projects = [
  {
    status: "Prototype",
    title: "Robotic Hand Gesture Controller",
    description:
      "Computer vision pipeline that maps human hand poses to servo-driven finger movement.",
    stack: "Python · OpenCV · Arduino · CAD · Servo Control",
  },
  {
    status: "Deployed",
    title: "Autonomous Rover Navigation",
    description:
      "Sensor fusion and planning stack for reliable indoor navigation under noisy conditions.",
    stack: "ROS · C++ · LiDAR · Path Planning",
  },
  {
    status: "Research",
    title: "Mechatronics Lab Notes",
    description:
      "A collection of mechanisms, electronics experiments, and small control systems.",
    stack: "Embedded C · Fusion 360 · PCB Design",
  },
];

const skills = [
  "Robotics",
  "Control Systems",
  "Computer Vision",
  "Embedded Systems",
  "React",
  "Python",
  "C++",
  "CAD",
];

function App() {
  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#home">
          <Cpu size={18} />
          Kevin Shen
        </a>
        <div className="navLinks">
          <a href="#projects">Projects</a>
          <a href="#resume">Resume</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="heroCopy">
          <p className="eyebrow">Robotics · Software · Mechatronics</p>
          <h1>Kevin Shen</h1>
          <p className="intro">
            I build intelligent systems across code, hardware, sensors, and
            mechanical design.
          </p>
          <div className="actions">
            <a className="button primary" href="#projects">
              View Projects <MoveRight size={17} />
            </a>
            <a className="button secondary" href="/resume.pdf">
              Resume <Download size={17} />
            </a>
          </div>
        </div>

        <div className="handPanel" aria-label="Robotic hand schematic">
          <div className="readout top">SERVO ARRAY: ONLINE</div>
          <div className="robotHand">
            <span className="finger f1" />
            <span className="finger f2" />
            <span className="finger f3" />
            <span className="finger f4" />
            <span className="thumb" />
            <span className="palm" />
            <span className="wrist" />
          </div>
          <div className="readout bottom">GRIP FORCE: 42N · SIGNAL: STABLE</div>
        </div>
      </section>

      <section className="ticker" aria-label="Technical skills">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </section>

      <section className="section" id="projects">
        <div className="sectionHeader">
          <p className="eyebrow">Selected Builds</p>
          <h2>Projects</h2>
        </div>
        <div className="projectGrid">
          {projects.map((project) => (
            <article className="projectCard" key={project.title}>
              <div className="cardMeta">
                <span>{project.status}</span>
                <ArrowUpRight size={18} />
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="stack">{project.stack}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="section twoColumn" id="resume">
        <div>
          <p className="eyebrow">Technical Profile</p>
          <h2>Resume</h2>
          <p className="sectionText">
            A focused snapshot of education, engineering experience, technical
            tools, and shipped work. Replace this text with your current resume
            summary when you are ready.
          </p>
        </div>
        <div className="specSheet">
          <div>
            <span>Focus</span>
            <strong>Robotics systems, full-stack software, embedded control</strong>
          </div>
          <div>
            <span>Tools</span>
            <strong>Python, C++, React, ROS, CAD, microcontrollers</strong>
          </div>
          <div>
            <span>Resume PDF</span>
            <strong>Add `public/resume.pdf` to enable download</strong>
          </div>
        </div>
      </section>

      <section className="section" id="experience">
        <div className="sectionHeader">
          <p className="eyebrow">Timeline</p>
          <h2>Experience</h2>
        </div>
        <div className="timeline">
          <div className="timelineItem">
            <span className="node" />
            <div>
              <h3>Engineering Experience</h3>
              <p>
                Add internships, research roles, hackathons, clubs, and build
                logs here with measurable outcomes.
              </p>
            </div>
          </div>
          <div className="timelineItem">
            <span className="node" />
            <div>
              <h3>Project Leadership</h3>
              <p>
                Highlight systems you owned end to end: requirements,
                prototyping, testing, iteration, and demos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Let’s build something precise.</h2>
        </div>
        <div className="contactLinks">
          <a href="mailto:hello@kevinshen.com"><Mail size={18} /> Email</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            <Code2 size={18} /> GitHub
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
            <Contact size={18} /> LinkedIn
          </a>
        </div>
      </section>

      <footer>
        <Wrench size={16} />
        <span>Designed as a robotics control surface for Kevin Shen.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
