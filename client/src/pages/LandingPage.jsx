import React from "react";
import { ArrowRight, Check, Menu, Mic, Heart, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import dashboardImg from "../assets/dashboard.png"
import wqr from "../assets/wqr.png"
// import Image from "react"

const LandingPage = () => {
  return (
    <div
      className="font-inter bg-white min-h-screen relative"
      style={{
        backgroundImage: `
            linear-gradient(to right, #FFE5EC 1px, transparent 1px),
            linear-gradient(to bottom, #FFE5EC 1px, transparent 1px)
          `,
        backgroundSize: "40px 40px",
        zIndex: 0,
      }}
    >
      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 pb-16">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 animate-fadeInUp">
              <div className="inline-flex items-center bg-pink-100 text-pink-600 rounded-full px-4 py-2 text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" />
                AI-Powered Voice Analysis
                <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white rounded-full text-xs">
                  New
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold">
                Your Voice Deserves{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">
                  Care
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl text-gray-600">
                Advanced{" "}
                <span className="text-pink-500 font-semibold">
                  Voice Pathology
                </span>{" "}
                Analysis & Exercises
              </p>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get accurate voice health reports and personalized vocal
                exercises to maintain and improve your vocal wellness.
              </p>
              <Link to={"/health"} className="flex justify-center gap-4 mt-8">
                <button className="rounded-full px-8 py-6 text-lg gap-2 bg-pink-500 hover:bg-pink-600 text-white inline-flex items-center">
                  Start Your Voice Journey{" "}
                  <ArrowRight className="ml-2" size={18} />
                </button>
              </Link>
            </div>

            {/* New Laptop Mockup Section */}
            <div className="mt-24 bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2">
                    <AlertCircle className="text-pink-500 w-6 h-6" />
                    <h2 className="text-3xl font-bold">
                      Why Voice Health Matters
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mt-1">
                        <span className="text-pink-500 font-semibold">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Early Detection
                        </h3>
                        <p className="text-gray-600">
                          Identify potential voice disorders before they become
                          serious issues
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mt-1">
                        <span className="text-pink-500 font-semibold">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Professional Performance
                        </h3>
                        <p className="text-gray-600">
                          Essential for speakers, singers, and professionals who
                          rely on their voice
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mt-1">
                        <span className="text-pink-500 font-semibold">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Overall Wellness
                        </h3>
                        <p className="text-gray-600">
                          Voice health is connected to physical and emotional
                          well-being
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  {/* Laptop Mockup */}
                  <div className="relative mx-auto max-w-[600px]">
                    <div className="relative">
                      {/* Laptop Frame */}
                      <div className="bg-gray-800 rounded-t-xl p-2 aspect-[16/10]">
                        {/* Screen Content */}
                        <div className="bg-white rounded-lg h-full p-4 overflow-hidden">
                          <img
                            src={dashboardImg}
                            alt="Voice Analysis Dashboard"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      </div>
                      {/* Laptop Base */}
                      <div className="bg-gray-800 h-4 rounded-b-lg transform perspective-1000 rotateX-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Integration Section */}
            <section className="mt-24 bg-pink-100 p-8 rounded-2xl border border-pink-500 shadow-lg z-50">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    {/* <Share2 className="text-black-600 w-8 h-8" /> */}
                    <h2 className="text-3xl font-semibold">
                      Get Reports Instantly
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Generate comprehensive reports and act immediately on your voice health.
                  </p>
                  <div className="bg-muted p-6 rounded-xl">
                    <p className="font-medium flex items-center gap-2">
                      <span className="text-black-600">➤</span> Send
                      <code className="mx-2 px-2 py-1 bg-primary/10 text-xl rounded">
                        join put-rice
                      </code>
                      to
                    </p>
                    <p className="text-xl font-bold mt-2 flex items-center">
                      <span className="bg-black-100 text-black-800 px-3 py-1 rounded-lg mr-2">
                        WhatsApp
                      </span>
                      +1 415 523 8886
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="rounded-xl border-2 border-purple-600 p-4 bg-white w-[220px] h-[220px] overflow-hidden ">
                    {/* Placeholder for QR Code */}
                    <img src={wqr} className="w-fit" />
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-24 grid md:grid-cols-3 gap-8 animate-fadeInUp">
              {[
                {
                  title: "Voice Analysis",
                  description:
                    "Advanced AI algorithms analyze your voice patterns to detect potential issues and track improvements",
                },
                {
                  title: "Personalized Exercises",
                  description:
                    "Get tailored vocal exercises based on your voice analysis results and goals",
                },
                {
                  title: "Progress Tracking",
                  description:
                    "Monitor your vocal health improvements over time with detailed progress reports",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl border border-pink-100 hover:shadow-xl transition-shadow"
                >
                  <Check className="text-pink-500 mb-4" size={24} />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </section>
          </section>

          <section className="bg-pink-500 text-white mt-24 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center animate-fadeInUp">
                <h2 className="text-3xl font-bold mb-4">
                  Share Your Voice Journey
                </h2>
                <p className="text-xl mb-8">
                  Help us improve by sharing your experience with AudiHealth
                </p>
                <button className="px-6 py-3 bg-white text-pink-500 rounded-full hover:bg-pink-50 transition-all duration-300 ease-in-out hover:scale-105">
                  Give Feedback
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-white border-t border-pink-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-8 h-8 text-pink-500" />
                  AudiHealth
                </h3>
                <p className="text-gray-600">
                  Empowering voices through technology
                  <br />
                  Your trusted voice health companion
                </p>
              </div>
              <div className="flex flex-col items-end">
                <h4 className="text-lg font-semibold mb-4">Connect with us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-pink-500 hover:text-pink-600">
                    Instagram
                  </a>
                  <a href="#" className="text-pink-500 hover:text-pink-600">
                    Twitter
                  </a>
                  <a href="#" className="text-pink-500 hover:text-pink-600">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
