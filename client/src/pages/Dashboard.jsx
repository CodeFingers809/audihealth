import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Mic,
  Activity,
  Search,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link } from "react-router-dom";

// Sample data
const sampleData = {
  weekly_metrics: [
    { date: "2024-02-01", pitch: 220, volume: 65, clarity: 80 },
    { date: "2024-02-02", pitch: 225, volume: 68, clarity: 82 },
    { date: "2024-02-03", pitch: 218, volume: 70, clarity: 85 },
    { date: "2024-02-04", pitch: 222, volume: 67, clarity: 83 },
    { date: "2024-02-05", pitch: 228, volume: 72, clarity: 87 },
    { date: "2024-02-06", pitch: 230, volume: 75, clarity: 88 },
    { date: "2024-02-07", pitch: 226, volume: 71, clarity: 86 },
  ],
};

// Custom Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// Custom Button Component
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Custom Progress Bar Component
const Progress = ({ value, className = "" }) => (
  <div className={`w-full h-2 bg-gray-200 rounded-full ${className}`}>
    <div
      className="h-full bg-pink-500 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

const MetricCard = ({ title, value, change, icon: Icon, description }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const bgColor = isPositive ? "bg-pink-50" : "bg-red-50";
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${bgColor}`}>
            <Icon className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center mt-1">
              <span className="text-2xl font-bold">{value}</span>
              <div className={`ml-2 flex items-center ${changeColor}`}>
                <ChangeIcon className="h-4 w-4" />
                <span className="text-sm font-medium ml-1">
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </Card>
  );
};

// Custom Tabs Components
const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = React.Children.map(children, (child) => {
    if (child.type === TabsContent) {
      return React.cloneElement(child, {
        active: child.props.value === activeTab,
      });
    }
    if (child.type === TabsList) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    return child;
  });

  return <div className="space-y-6">{tabs}</div>;
};

const TabsList = ({ children, activeTab, setActiveTab }) => (
  <div className="grid w-full grid-cols-1 md:grid-cols-3 bg-pink-50 rounded-lg p-1">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        active: child.props.value === activeTab,
        onClick: () => setActiveTab(child.props.value),
      })
    )}
  </div>
);

const TabsTrigger = ({ children, value, active, onClick }) => (
  <button
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
      ${
        active
          ? "bg-white text-pink-500 shadow-sm"
          : "text-gray-600 hover:text-pink-500"
      }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TabsContent = ({ children, active }) => (
  <div className={`${active ? "block" : "hidden"}`}>{children}</div>
);

export default function Dashboard() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, #FFE5EC 1px, transparent 1px),
          linear-gradient(to bottom, #FFE5EC 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="relative z-10">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Voice Health Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track your vocal performance and health
              </p>
            </div>

            <Link to={"/health"}>
              <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                Start New Recording
                <Mic className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>  

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Average Pitch"
              value="225 Hz"
              change={2.5}
              icon={Activity}
              description="Weekly average fundamental frequency"
            />
            <MetricCard
              title="Volume Level"
              value="72 dB"
              change={5.0}
              icon={Activity}
              description="Weekly average volume"
            />
            <MetricCard
              title="Voice Clarity"
              value="85%"
              change={3.2}
              icon={Activity}
              description="Voice clarity score"
            />
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <h3 className="font-semibold mb-4">Overall Health Score</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Voice Health</span>
                    <span className="text-sm font-bold">88%</span>
                  </div>
                  <Progress value={88} className="bg-pink-100" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultTab="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="exercises">Recommended Exercises</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampleData.weekly_metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString()
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="clarity"
                        stroke="#ec4899"
                        fill="#fce7f3"
                        name="Voice Clarity"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-xl font-semibold mb-4">Pitch Analysis</h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sampleData.weekly_metrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString()
                          }
                        />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="pitch"
                          stroke="#ec4899"
                          name="Pitch"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-xl font-semibold mb-4">
                    Volume Analysis
                  </h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sampleData.weekly_metrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString()
                          }
                        />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="volume"
                          stroke="#ec4899"
                          name="Volume"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="exercises">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Breathing Exercises", "Pitch Control", "Articulation"].map(
                  (exercise, index) => (
                    <Card key={index}>
                      <h2 className="text-lg font-semibold mb-4">{exercise}</h2>
                      <div className="space-y-2">
                        <Progress value={75} className="bg-pink-100" />
                        <p className="text-sm text-gray-600">
                          3 exercises completed this week
                        </p>
                        <Button className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white">
                          Start Exercise
                        </Button>
                      </div>
                    </Card>
                  )
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}