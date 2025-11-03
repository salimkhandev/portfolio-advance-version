import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import { useProjects } from '../context/ProjectsContext';
import Project from "./Project";

const Projects = () => {
  const { projects, loading, error } = useProjects();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <section
      id="projects"
      className="min-h-[70vh] md:min-h-screen py-10 md:py-20 relative"
    >

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="max-w-6xl mx-auto md:bg-transparent md:backdrop-blur-sm rounded-3xl md:border md:border-white/10 md:shadow-2xl overflow-hidden"
          data-aos="fade-up"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center p-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Projects
          </h2>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-blue-400 text-xl">Loading projects...</div>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center py-20">
              <div className="text-red-400 text-xl">Error: {error}</div>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-400 text-xl">No projects found</div>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-6 rounded-b-3xl">
              {projects.map((proj, index) => {
                // Map all backend schema fields to frontend props
                const projectData = {
                  title: proj.title || '',
                  description: proj.description || '',
                  // Use deployedUrl for link button
                  link: proj.deployedUrl || '',
                  githubLink: proj.githubLink || '',
                  technologies: proj.tools || [],
                  // Keep image as fallback for old projects, but new ones use cloudinaryThumbnailUrl
                  image: '', // No longer used - cloudinaryVideoUrl and cloudinaryThumbnailUrl are used instead
                  features: proj.features || [],
                  duration: proj.duration || '',
                  challenges: proj.challenges || '',
                  cloudinaryVideoUrl: proj.cloudinaryVideoUrl || '',
                  cloudinaryThumbnailUrl: proj.cloudinaryThumbnailUrl || '',
                };

                return (
                  <Project
                    key={proj._id || index}
                    title={projectData.title}
                    description={projectData.description}
                    link={projectData.link}
                    githubLink={projectData.githubLink}
                    technologies={projectData.technologies}
                    image={projectData.image}
                    features={projectData.features}
                    duration={projectData.duration}
                    challenges={projectData.challenges}
                    cloudinaryVideoUrl={projectData.cloudinaryVideoUrl}
                    cloudinaryThumbnailUrl={projectData.cloudinaryThumbnailUrl}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
