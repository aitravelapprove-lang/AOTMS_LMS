import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LearningPathsHero from "@/components/learning-paths/LearningPathsHero";
import LearningPathCard from "@/components/learning-paths/LearningPathCard";
import PathDetailsPreview from "@/components/learning-paths/PathDetailsPreview";
import HowPathsWork from "@/components/learning-paths/HowPathsWork";
import PerformanceTracking from "@/components/learning-paths/PerformanceTracking";
import CareerOutcomes from "@/components/learning-paths/CareerOutcomes";
import LearningPathsCTA from "@/components/learning-paths/LearningPathsCTA";
import LowPolyBackground from "@/components/landing/LowPolyBackground";

const learningPaths = [
  {
    id: "fullstack",
    title: "Full Stack Web Developer",
    description: "Master frontend and backend development to build complete web applications from scratch.",
    level: "Beginner" as const,
    duration: "6 months",
    courseCount: 12,
    isPopular: true,
    details: {
      title: "Full Stack Web Developer",
      courses: [
        "HTML & CSS Fundamentals",
        "JavaScript Essentials",
        "React.js Development",
        "Node.js & Express",
        "Database Design (SQL & NoSQL)",
        "REST API Development",
      ],
      skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "MongoDB", "Git", "REST APIs", "Deployment"],
      tools: ["VS Code", "Git", "Postman", "MongoDB Compass", "Chrome DevTools"],
      practices: ["Live coding sessions", "Mini projects", "Mock interviews", "Portfolio building"],
      roles: ["Full Stack Developer", "Web Developer", "Software Engineer"],
    },
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    description: "Become an expert in creating beautiful, responsive, and interactive user interfaces.",
    level: "Beginner" as const,
    duration: "4 months",
    courseCount: 8,
    isPopular: true,
    details: {
      title: "Frontend Developer",
      courses: [
        "HTML5 & Semantic Web",
        "CSS3 & Modern Layouts",
        "JavaScript Deep Dive",
        "React.js Mastery",
        "State Management",
        "Testing & Performance",
      ],
      skills: ["HTML5", "CSS3", "JavaScript", "React", "TypeScript", "Responsive Design", "Accessibility"],
      tools: ["VS Code", "Figma", "Chrome DevTools", "Webpack", "npm"],
      practices: ["UI challenges", "Responsive projects", "Code reviews", "Design implementation"],
      roles: ["Frontend Developer", "UI Developer", "React Developer", "Web Designer"],
    },
  },
  {
    id: "python",
    title: "Python Developer",
    description: "Learn Python programming for web development, automation, and backend systems.",
    level: "Beginner" as const,
    duration: "5 months",
    courseCount: 10,
    isPopular: false,
    details: {
      title: "Python Developer",
      courses: [
        "Python Fundamentals",
        "Object-Oriented Python",
        "Django Framework",
        "Flask Microframework",
        "Database Integration",
        "API Development with Python",
      ],
      skills: ["Python", "Django", "Flask", "SQL", "REST APIs", "Testing", "Deployment"],
      tools: ["PyCharm", "Jupyter", "Postman", "Docker", "PostgreSQL"],
      practices: ["Coding exercises", "Web projects", "Automation scripts", "Backend APIs"],
      roles: ["Python Developer", "Backend Developer", "Django Developer", "Automation Engineer"],
    },
  },
  {
    id: "datascience",
    title: "Data Science & AI",
    description: "Master data analysis, machine learning, and artificial intelligence techniques.",
    level: "Intermediate" as const,
    duration: "8 months",
    courseCount: 15,
    isPopular: true,
    details: {
      title: "Data Science & AI",
      courses: [
        "Python for Data Science",
        "Statistics & Probability",
        "Data Visualization",
        "Machine Learning Fundamentals",
        "Deep Learning with TensorFlow",
        "Natural Language Processing",
      ],
      skills: ["Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Data Visualization", "SQL"],
      tools: ["Jupyter Notebook", "Google Colab", "Tableau", "Power BI", "Git"],
      practices: ["Data projects", "Kaggle competitions", "Model building", "Research papers"],
      roles: ["Data Scientist", "ML Engineer", "Data Analyst", "AI Developer"],
    },
  },
  {
    id: "placement",
    title: "Placement Readiness",
    description: "Comprehensive preparation for job interviews, aptitude tests, and soft skills.",
    level: "Beginner" as const,
    duration: "3 months",
    courseCount: 6,
    isPopular: false,
    details: {
      title: "Placement Readiness",
      courses: [
        "Aptitude & Reasoning",
        "Technical Interview Prep",
        "DSA for Interviews",
        "Communication Skills",
        "Resume Building",
        "Mock Interviews",
      ],
      skills: ["Problem Solving", "DSA", "Communication", "Aptitude", "Interview Skills", "Resume Writing"],
      tools: ["LeetCode", "HackerRank", "LinkedIn", "Resume Templates"],
      practices: ["Daily aptitude practice", "Mock interviews", "Group discussions", "Presentation skills"],
      roles: ["Software Engineer", "Associate Developer", "Graduate Trainee"],
    },
  },
  {
    id: "backend",
    title: "Backend Developer",
    description: "Specialize in server-side development, APIs, databases, and system architecture.",
    level: "Intermediate" as const,
    duration: "5 months",
    courseCount: 10,
    isPopular: false,
    details: {
      title: "Backend Developer",
      courses: [
        "Server-side Programming",
        "Database Design & SQL",
        "NoSQL Databases",
        "RESTful API Design",
        "Authentication & Security",
        "Cloud Deployment",
      ],
      skills: ["Node.js", "Python", "SQL", "MongoDB", "Redis", "Docker", "AWS", "Security"],
      tools: ["VS Code", "Postman", "Docker", "AWS Console", "pgAdmin"],
      practices: ["API projects", "Database optimization", "Security audits", "Cloud deployments"],
      roles: ["Backend Developer", "API Developer", "Database Administrator", "DevOps Engineer"],
    },
  },
];

const LearningPaths = () => {
  const [selectedPath, setSelectedPath] = useState<typeof learningPaths[0]["details"] | null>(null);

  const popularPaths = learningPaths.filter((path) => path.isPopular);
  const allPaths = learningPaths;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <LowPolyBackground />
      <Header />
      <main className="relative z-10 w-full pt-20">
        <LearningPathsHero />

        {/* Popular Learning Paths */}
        <section className="section-padding bg-transparent">
          <div className="container-width">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight font-heading">
                Popular <span className="text-[#0075CF]">Learning Paths</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our most chosen career paths by students across Vijayawada and beyond
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <LearningPathCard
                    {...path}
                    onViewPath={() => setSelectedPath(path.details)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* All Learning Paths */}
        <section className="section-padding bg-transparent">
          <div className="container-width">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight font-heading">
                All <span className="text-[#0075CF]">Learning Paths</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore all available career paths and find the one that matches your goals
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <LearningPathCard
                    {...path}
                    onViewPath={() => setSelectedPath(path.details)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <HowPathsWork />
        <PerformanceTracking />
        <CareerOutcomes />
        <LearningPathsCTA />
      </main>
      <Footer />

      <PathDetailsPreview
        path={selectedPath}
        onClose={() => setSelectedPath(null)}
      />
    </div>
  );
};

export default LearningPaths;
