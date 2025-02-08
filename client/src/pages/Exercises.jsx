import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // 🔹 Import js-cookie
import { ChevronDown, ChevronUp, CheckCircle, Circle } from "lucide-react";

// Custom Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

// API Base URL
const API_URL = "http://localhost:8000/api"; // Change this if your backend is deployed

// 🔹 Define exerciseCategories
const exerciseCategories = {
  breathing: {
    title: "Breathing Exercises",
    description: "Fundamental exercises to improve breath control",
    exercises: [
      { id: "b1", name: "Diaphragmatic Breathing", duration: "5 mins", instructions: "Lie down, place hand on belly, breathe deeply" },
      { id: "b2", name: "Square Breathing", duration: "3 mins", instructions: "Inhale 4s, hold 4s, exhale 4s, hold 4s" },
      { id: "b3", name: "Sustained Breath", duration: "4 mins", instructions: "Take deep breath, sustain 'ah' sound as long as possible" },
    ],
  },
  pitch: {
    title: "Pitch Control",
    description: "Exercises to improve pitch accuracy and range",
    exercises: [
      { id: "p1", name: "Pitch Slides", duration: "4 mins", instructions: "Slide smoothly between high and low notes" },
      { id: "p2", name: "Scale Practice", duration: "5 mins", instructions: "Practice major scale ascending and descending" },
      { id: "p3", name: "Interval Jumps", duration: "3 mins", instructions: "Practice jumping between specific intervals" },
    ],
  },
  articulation: {
    title: "Articulation Exercises",
    description: "Improve clarity and pronunciation",
    exercises: [
      { id: "a1", name: "Tongue Twisters", duration: "4 mins", instructions: "Practice specific tongue twisters slowly then speed up" },
      { id: "a2", name: "Lip Trills", duration: "3 mins", instructions: "Perform lip trills while changing pitch" },
      { id: "a3", name: "Diction Practice", duration: "5 mins", instructions: "Practice clear consonant sounds" },
    ],
  },
};

const ExerciseSection = ({ category, exercises, isOpen, onToggle, completedExercises, onExerciseToggle }) => {
  return (
    <Card className="mb-4 overflow-hidden">
      <button onClick={onToggle} className="w-full p-6 flex items-center justify-between bg-white hover:bg-pink-50 transition-colors">
        <div>
          <h3 className="text-left text-xl font-semibold text-gray-800">{category.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
        </div>
        {isOpen ? <ChevronUp className="h-6 w-6 text-pink-500" /> : <ChevronDown className="h-6 w-6 text-pink-500" />}
      </button>

      {isOpen && (
        <div className="p-6 space-y-4">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-800">{exercise.name}</h4>
                    <span className="text-sm text-pink-500">{exercise.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                </div>
                <button onClick={() => onExerciseToggle(exercise.id)} className="ml-4 p-2 hover:bg-pink-50 rounded-full transition-colors">
                  {completedExercises.includes(exercise.id) ? <CheckCircle className="h-6 w-6 text-pink-500" /> : <Circle className="h-6 w-6 text-gray-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const ExercisesPage = () => {
  const [openSections, setOpenSections] = useState([]);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const userId = Cookies.get("userId"); // 🔹 Get userId from cookies
  const token = Cookies.get("token"); // 🔹 Get JWT token from cookies

  useEffect(() => {
    fetchExerciseProgress();
  }, []);

  const fetchExerciseProgress = async () => {
    try {
      if (!userId || !token) {
        console.warn("User not logged in!");
        return;
      }

      const response = await axios.get(`${API_URL}/exercises/progress/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const todayProgress = response.data.find((entry) => entry.date === new Date().toISOString().split("T")[0]);
      setCompletedExercises(todayProgress ? todayProgress.completedExercises : []);
      setTotalExercises(Object.values(exerciseCategories).reduce((acc, cat) => acc + cat.exercises.length, 0));
    } catch (error) {
      console.error("Error fetching exercise progress:", error);
    }
  };

  const toggleExercise = async (exerciseId) => {
    try {
      if (!userId || !token) {
        console.warn("User not logged in!");
        return;
      }

      const updatedExercises = completedExercises.includes(exerciseId)
        ? completedExercises.filter((id) => id !== exerciseId)
        : [...completedExercises, exerciseId];

      setCompletedExercises(updatedExercises);

      await axios.post(
        `${API_URL}/exercises/track`,
        { userId, completedExercises: updatedExercises },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating exercise:", error);
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-100 p-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Vocal Exercises</h1>
        <p className="text-gray-600">Complete your daily vocal training routine</p>

        <Card className="px-6 py-4">
          <p className="text-sm text-gray-600">Today's Progress</p>
          <p className="text-2xl font-bold text-pink-500">
            {completedExercises.length} / {totalExercises}
          </p>
        </Card>

        <div className="space-y-4">
          {Object.entries(exerciseCategories).map(([key, category]) => (
            <ExerciseSection
              key={key}
              category={category}
              exercises={category.exercises}
              isOpen={openSections.includes(key)}
              onToggle={() =>
                setOpenSections((prev) => (prev.includes(key) ? prev.filter((sec) => sec !== key) : [...prev, key]))
              }
              completedExercises={completedExercises}
              onExerciseToggle={toggleExercise}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExercisesPage;