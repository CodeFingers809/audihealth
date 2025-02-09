import React, { useState, useEffect, useContext } from "react";
import ReactMarkdown from "react-markdown";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { Mic } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment-timezone";
import { AuthContext } from "../context/AuthContext";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>{children}</div>
);

const Button = ({ children, className = "", ...props }) => (
  <button className={`px-4 py-2 rounded-md font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Progress = ({ value, className = "" }) => (
  <div className={`w-full h-2 bg-gray-200 rounded-full ${className}`}>
    <div className="h-full bg-pink-500 rounded-full transition-all duration-300" style={{ width: `${value || 0}%` }} />
  </div>
);

const COLORS = ['#ec4899', '#f472b6', '#fbcfe8'];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
    const { user, logout } = useContext(AuthContext);
  

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/reports/dashboard-stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Failed to load data</div>;
  }

  const latestReport = dashboardData.recentReports?.[dashboardData.recentReports.length - 1] || {};

  // **Function to clean the findings**
  const cleanFindings = (text) => {
    if (!text || typeof text !== "string") return "";

    // Remove content inside <think> tags
    let cleanedText = text.replace(/<think>[\s\S]*?<\/think>/, "").trim();

    // Remove everything from "**Signature:**" onwards
    const signatureIndex = cleanedText.indexOf("**Signature:**");
    if (signatureIndex !== -1) {
      cleanedText = cleanedText.substring(0, signatureIndex).trim();
    }

    return cleanedText;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-pink-500">Welcome, {user.fullName}</h1>
            <h1 className="text-xl font-bold text-gray-800">Voice Health Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your vocal performance and health</p>
          </div>

          <Link to="/health">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              Start New Recording <Mic className="ml-2 h-4 w-4 inline" />
            </Button>
          </Link>
        </div>

        {/* Latest Report */}
        {latestReport && (
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <h2 className="text-xl font-semibold mb-4">Latest Analysis</h2>
            <p className="text-2xl font-bold mb-2">{latestReport.prediction || "N/A"}</p>
            <p className="opacity-80">
              Analyzed on: {latestReport.analysisDate ? moment(latestReport.analysisDate).format('MMMM D, YYYY') : "N/A"}
            </p>

            {/* Markdown Rendering & Cleaning Findings */}
            {latestReport.findings && (
              <div className="mt-4 text-sm opacity-90">
                <ReactMarkdown>{cleanFindings(latestReport.findings)}</ReactMarkdown>
              </div>
            )}
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Voice Stability</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Jitter</span>
                  <span className="font-semibold">
                    {dashboardData.averages?.avgJitter !== undefined
                      ? dashboardData.averages?.avgJitter.toFixed(2)
                      : "0"}%
                  </span>
                </div>
                <Progress value={dashboardData.averages?.avgJitter ? (dashboardData.averages.avgJitter / 3) * 100 : 0} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shimmer</span>
                  <span className="font-semibold">
                    {dashboardData.averages?.avgShimmer !== undefined
                      ? dashboardData.averages?.avgShimmer.toFixed(2)
                      : "0"}%
                  </span>
                </div>
                <Progress value={dashboardData.averages?.avgShimmer ? (dashboardData.averages.avgShimmer / 100) * 100 : 0} />
              </div>
            </div>
          </Card>

          {/* Prediction Distribution Pie Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Prediction Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(dashboardData.predictionDistribution || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {Object.entries(dashboardData.predictionDistribution || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Exercise Progress */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Exercise Progress</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">
                {dashboardData.exerciseProgress?.completed || 0} / {dashboardData.exerciseProgress?.total || 9}
              </div>
              <p className="text-gray-600">Exercises completed today</p>
              <Progress value={(dashboardData.exerciseProgress?.completed / dashboardData.exerciseProgress?.total) * 100} className="mt-4" />
            </div>
          </Card>
        </div>

        {/* Weekly Trends */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Weekly Voice Metrics</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dashboardData.weeklyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => moment(date).format('MMM D')} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="jitter" stroke="#ec4899" name="Jitter (%)" />
              <Line type="monotone" dataKey="shimmer" stroke="#f472b6" name="Shimmer (%)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
