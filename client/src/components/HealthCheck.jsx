import React, { useState } from "react";
import { ArrowRight, Menu, Mic } from "lucide-react";

const HealthCheck = () => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [file, setFile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check if the file is a WAV file and has a maximum length of 5 seconds
      const audio = new Audio(URL.createObjectURL(selectedFile));
      audio.onloadedmetadata = () => {
        if (audio.duration <= 5 && selectedFile.type === "audio/wav") {
          setFile(selectedFile);
        } else {
          alert("Please upload a WAV file with a maximum length of 5 seconds.");
          setFile(null);
        }
      };
    }
  };

  const handleDiagnose = () => {
    if (!file) {
      alert("Please upload a valid WAV file before diagnosing.");
      return;
    }
    setIsDiagnosing(true);
    // Simulate a delay for diagnosis
    setTimeout(() => {
      setReportReady(true);
      setIsDiagnosing(false);
    }, 3000); // 3 seconds delay
  };

  return (
    <div
      className="font-inter bg-white min-h-screen relative"
      style={{
        backgroundImage:
          "linear-gradient(to right, #FFE5EC 1px, transparent 1px), linear-gradient(to bottom, #FFE5EC 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        zIndex: -1,
      }}
    >
      {/* Grid Background */}
      <div />

      <div className="relative z-10">

        {/* Mobile Menu - Same as HomePage */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            <div className="p-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-pink-500"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col space-y-4 p-4">
                <a
                  href="/"
                  className="text-gray-800 font-medium hover:text-pink-500 transition-colors"
                >
                  Home
                </a>
                <a
                  href="/exercises"
                  className="text-gray-600 font-medium hover:text-pink-500 transition-colors"
                >
                  Exercises
                </a>
                <a
                  href="/reports"
                  className="text-gray-600 font-medium hover:text-pink-500 transition-colors"
                >
                  Reports
                </a>
                <button className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="pt-24 pb-16 min-h-screen">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {reportReady && (
              <div className="mb-8">
                <button className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
                  Export Report as PDF
                </button>
              </div>
            )}

            <div className="text-center space-y-4 animate-fadeInUp">
              <h1 className="text-5xl sm:text-6xl font-bold text-pink-500">
                Upload Your Audio File
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Please upload your audio file in WAV format for diagnosis.
                Maximum file size 5 seconds.
              </p>

              {/* Larger Choose File Section */}
              <div className="mt-8 bg-pink-100/50 p-8 rounded-lg border-2 border-dashed border-pink-500 flex flex-col items-center justify-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white font-medium py-4 px-8 rounded-lg transition duration-300 text-lg"
                >
                  Choose File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".wav"
                  onChange={handleFileChange}
                  disabled={isDiagnosing}
                  className="sr-only"
                />
                <span className="mt-4 text-gray-600 text-center">
                  {file ? file.name : "No file chosen"}
                </span>
              </div>

              <button
                onClick={handleDiagnose}
                className="mt-8 rounded-full px-8 py-3 text-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white inline-flex items-center shadow-md transition duration-300"
                disabled={isDiagnosing}
              >
                {isDiagnosing ? "Diagnosing..." : "Diagnose"}
                <ArrowRight className="ml-2" size={18} />
              </button>
            </div>

            {reportReady && (
              <div className="animate-fadeInUp space-y-8 mt-8">
                <div className="bg-white p-8 rounded-xl border border-pink-100 shadow-lg">
                  <div className="h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                    Spectrogram Placeholder
                  </div>
                  <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Integer nec odio. Praesent libero. Sed cursus ante dapibus
                    diam.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl border border-pink-100 shadow-lg">
                  <div className="h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                    Report Image Placeholder
                  </div>
                  <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Integer nec odio. Praesent libero. Sed cursus ante dapibus
                    diam.
                  </p>
                </div>
              </div>
            )}
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

export default HealthCheck;