import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const HealthCheck = () => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [report, setReport] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
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

  const handleDiagnose = async () => {
    if (!file) {
      alert("Please upload a valid WAV file before diagnosing.");
      return;
    }

    setIsDiagnosing(true);
    setReport(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/diagnose", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Error processing your audio file. Please try again.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDownloadPDF = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `voice_pathology_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading the report. Please try again.");
    }
  };

  const openCloudinaryReport = () => {
    if (report?.PDF_URL) {
      window.open(report.PDF_URL, "_blank");
    } else {
      alert("Report is not available yet. Please diagnose first.");
    }
  };

  // Generate chart data for MFCC features
  const mfccChartData = report?.["Acoustic Features"]?.MFCC_Mean?.map((value, index) => ({
    feature: `MFCC ${index + 1}`,
    Mean: value,
    Std: report?.["Acoustic Features"]?.MFCC_Std?.[index] || 0,
  })) || [];

  // Generate chart data for Jitter and Shimmer
  const voiceQualityData = report
    ? [
        { metric: "Jitter", value: report["Acoustic Features"].Jitter_Percent },
        { metric: "Shimmer", value: report["Acoustic Features"].Shimmer_Percent },
      ]
    : [];

  return (
    <div className="font-inter bg-white min-h-screen relative">
      <div className="relative z-10">
        <main className="pt-24 pb-16 min-h-screen">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {report && (
              <div className="mb-8 flex gap-4">
                <button
                  onClick={openCloudinaryReport}
                  className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                >
                  View Full Report
                </button>
                <button
                  onClick={() => handleDownloadPDF(report.PDF_URL)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            )}

            <div className="text-center space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-pink-500">Voice Health Check</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your audio file in WAV format for diagnosis. Maximum length: 5 seconds.
              </p>

              <div className="mt-8 bg-pink-100/50 p-8 rounded-lg border-2 border-dashed border-pink-500 flex flex-col items-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white font-medium py-4 px-8 rounded-lg transition duration-300 text-lg"
                >
                  Choose File
                </label>
                <input id="file-upload" type="file" accept=".wav" onChange={handleFileChange} disabled={isDiagnosing} className="sr-only" />
                <span className="mt-4 text-gray-600 text-center">{file ? file.name : "No file chosen"}</span>
              </div>

              <button
                onClick={handleDiagnose}
                className="mt-8 rounded-full px-8 py-3 text-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white inline-flex items-center shadow-md transition duration-300"
                disabled={isDiagnosing}
              >
                {isDiagnosing ? "Diagnosing..." : "Start Diagnosis"}
                <ArrowRight className="ml-2" size={18} />
              </button>
            </div>

            {report && (
              <div className="space-y-8 mt-8">
                <div className="bg-white p-8 rounded-xl border border-pink-100 shadow-lg">
                  <h2 className="text-2xl font-semibold text-pink-500 mb-4">Diagnosis Result</h2>
                  <div className="text-xl font-medium text-gray-800 mb-4">
                    Predicted Condition: <span className="text-pink-500">{report.Prediction}</span>
                  </div>
                  <div className="text-gray-600 mb-4">Analysis Date: {report["Analysis Date"]}</div>
                </div>

                {/* Voice Quality Metrics */}
                <div className="bg-white p-8 rounded-xl border border-pink-100 shadow-lg">
                  <h2 className="text-2xl font-semibold text-pink-500 mb-4">Voice Quality Metrics</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={voiceQualityData}>
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ff6384" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* MFCC Analysis */}
                <div className="bg-white p-8 rounded-xl border border-pink-100 shadow-lg">
                  <h2 className="text-2xl font-semibold text-pink-500 mb-4">MFCC Feature Analysis</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mfccChartData}>
                      <XAxis dataKey="feature" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Mean" fill="#ff6384" />
                      <Bar dataKey="Std" fill="#36a2eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default HealthCheck;