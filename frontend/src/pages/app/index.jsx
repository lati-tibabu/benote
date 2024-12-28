import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer1 from "../../components/_footers/footer1";
import { AiOutlineArrowRight } from "react-icons/ai";

function Home() {
  const arrow = document.getElementById("arrow");
  const location = useLocation();

  const page = location.pathname;

  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <div className="flex flex-col bg-gray-100 text-gray-800 min-h-screen">
      {/* logo section */}
      <div className="p-4 shadow-sm w-full flex flex-row justify-between items-center">
        <img src="rect19.png" alt="" className="w-14" />
        <Link to="/auth/login">
          <button className="btn btn-outline btn-black text-white bg-black hover:bg-gray-700 hover:text-gray-50">
            Get Started
          </button>
        </Link>
      </div>
      {/* Idk what to call lets call this a hero */}
      <div className="h-screen/2 xl:h-fit text-center m-3 flex flex-row">
        <div className="flex-1 flex flex-col justify-center items-center bg-transparent">
          <h1 className="text-4xl font-bold mb-6">Student Productivity Hub</h1>
          <Link to="/auth/login">
            <button
              className="btn btn-outline btn-black text-black"
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              Get Started
              <div id="arrow">
                <AiOutlineArrowRight
                  className={`${
                    buttonHovered ? "w-6 h-6" : "w-0"
                  } transition-all`}
                />
              </div>
            </button>
          </Link>
        </div>

        <div
          className="hidden md:block flex-1 rounded-l-full bg-clip-content overflow-hidden right-0"
          title="the picture"
        >
          <img
            src="/productivity/happy-user-male.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* info about the project or the app */}
      {/* guys the following needs a lot of tailwinding so, :) i am keeping for (either someone css ish or myself to finish it up) */}
      {/* just commented them up */}
      {/* <div>
        <div className="flex flex-col md:flex-row justify-between items-center p-8 md:p-16 gap-8">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">
              Boost Your Academic Performance
            </h2>
            <p className="text-lg text-gray-600">
              Our platform provides a range of tools and resources to help
              students improve their productivity and achieve their academic
              goals.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <img
              src="/productivity/undraw_academic_research_re_g0ik.svg"
              alt="Productivity tools"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div>
          <div className="body-content">
            <section className="about-section">
              <h2>Welcome to the Student Productivity Hub</h2>
              <p>
                The Student Productivity Hub is an innovative platform designed
                to help university students improve their academic productivity.
                With features powered by artificial intelligence (AI), the
                platform assists students in managing their tasks, collaborating
                with peers, and creating personalized study plans to optimize
                their learning experience.
              </p>
              <img src="path/to/your/image.jpg" alt="Student Productivity" />
            </section>

            <section className="features-section">
              <h3>Key Features</h3>
              <div className="feature-item">
                <h4>Task Management</h4>
                <p>
                  Stay organized and on top of your academic responsibilities by
                  creating and managing tasks, setting deadlines, and receiving
                  AI-powered recommendations for task prioritization.
                </p>
              </div>
              <div className="feature-item">
                <h4>AI-Powered Study Planner</h4>
                <p>
                  Create personalized study plans with the help of AI, ensuring
                  efficient use of time and improved academic performance.
                </p>
              </div>
              <div className="feature-item">
                <h4>Collaboration Tools</h4>
                <p>
                  Work seamlessly with your peers on group projects, track
                  progress, and communicate effectively with integrated chat and
                  file-sharing features.
                </p>
              </div>
              <div className="feature-item">
                <h4>Real-Time Notifications</h4>
                <p>
                  Get timely reminders for deadlines, tasks, and study goals,
                  ensuring you never miss an important deadline.
                </p>
              </div>
            </section>

            <section className="call-to-action">
              <h3>Start Boosting Your Productivity Today</h3>
              <p>
                Join the Student Productivity Hub and take control of your
                academic journey. Start managing your tasks, collaborating with
                classmates, and improving your study habits with ease.
              </p>
              <button>Get Started</button>
            </section>
          </div>
        </div>
      </div> */}
      {/* footer */}
      <Footer1 />
    </div>
  );
}

export default Home;
