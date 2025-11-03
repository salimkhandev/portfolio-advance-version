import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import { useEffect } from "react";
import "../App.css";
import SkillBar from "../components/SkillBar";

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section
      id="about"
      className="relative py-8 md:py-12 pb-6 md:pb-10"
    >

      <div className="container  mx-auto px-4 relative z-40">
        <div className="max-w-6xl mx-auto md:border md:border-white/10 rounded-3xl overflow-visible">
          {/* About Section Header */}
          {/* <div className="text-center p-8">
            <h2
              data-aos="fade-down"
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              About Me
            </h2>
          </div> */}

          {/* Content Container */}
          <div className="p-4 md:p-8 space-y-4 md:space-y-8 rounded-b-3xl">
            {/* Bio Section */}
            <div data-aos="fade-up" className="max-w-3xl mx-auto space-y-6">
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                Hi, I&apos;m{" "}
                <span className="font-semibold text-blue-400">Salim Khan</span>,
                a Software Engineering student in the final year of graduation
                at
                <span className="font-semibold text-purple-400">
                  {" "}
                  Islamia College University Peshawar
                </span>
                .
              </p>
            </div>

            {/* Skills Section */}
            <div data-aos="fade-up" className="space-y-2 md:space-y-6">
              <div className="skill-bar -mb-8">
                <SkillBar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
