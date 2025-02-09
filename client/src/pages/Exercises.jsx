import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, CheckCircle, Circle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

// Custom Card Component to encapsulate content with consistent styling
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

// Data for different exercise categories, each containing a list of exercises
const exerciseCategories = {
  breathing: {
    title: "Breathing Exercises",
    description: "Fundamental exercises to improve breath control and support",
    exercises: [
      {
        id: "b1",
        name: "Diaphragmatic Breathing",
        duration: "5 mins",
        instructions: "Lie down, place hand on belly, breathe deeply",
        details:
          "This foundational breathing technique helps strengthen your diaphragm, a key muscle for breathing, and improves your breath control for singing. Lie on your back with knees bent, placing one hand on your chest and the other on your abdomen. Inhale deeply through your nose, focusing on expanding your abdomen and feeling it rise, while keeping your chest relatively still. Exhale slowly and evenly through your mouth, feeling your abdomen fall.  Practice for 5 minutes daily.",
      },
      {
        id: "b2",
        name: "Square Breathing",
        duration: "3 mins",
        instructions: "Inhale 4s, hold 4s, exhale 4s, hold 4s",
        details:
          "Square breathing, also known as box breathing, is a rhythmic breathing exercise that promotes calmness, focus, and breath control.  Find a comfortable seated or lying down position. Inhale deeply for a count of four, hold your breath for a count of four, exhale slowly and completely for a count of four, and hold your breath again for a count of four. Repeat this cycle for 3 minutes.",
      },
      {
        id: "b3",
        name: "Sustained Breath",
        duration: "4 mins",
        instructions:
          "Take deep breath, sustain 'ah' sound as long as possible",
        details:
          "Sustaining a breath helps improve breath control and lung capacity, essential for singers.  Stand or sit upright with good posture. Inhale deeply, filling your lungs completely.  Exhale slowly and steadily while making an 'ah' sound.  Try to sustain the sound for as long as possible with a steady and controlled breath. Repeat 3-4 times.",
      },
    ],
  },
  pitch: {
    title: "Pitch Control",
    description: "Exercises to improve pitch accuracy and range",
    exercises: [
      {
        id: "p1",
        name: "Pitch Slides",
        duration: "4 mins",
        instructions: "Slide smoothly between high and low notes",
        details:
          "Pitch slides help improve your vocal flexibility and range.  Starting on a comfortable note, gradually slide your voice up to a higher note, then smoothly slide back down to the starting note. Repeat this slide pattern on different vowels, such as 'oo' or 'ee', for 4 minutes",
      },
      {
        id: "p2",
        name: "Scale Practice",
        duration: "5 mins",
        instructions: "Practice major scale ascending and descending",
        details:
          "Practicing scales is essential for developing pitch accuracy and ear training.  Choose a comfortable starting note and sing the major scale (do-re-mi-fa-so-la-ti-do) ascending and then descending.  Ensure each note is clear and accurate. Practice for 5 minutes.",
      },
      {
        id: "p3",
        name: "Interval Jumps",
        duration: "3 mins",
        instructions: "Practice jumping between specific intervals",
        details:
          "Interval jumps improve your ability to hit specific notes accurately.  Pick two notes that are an interval apart (e.g., a major third). Sing one note, then jump to the other note accurately. Repeat this with different intervals for 3 minutes.",
      },
    ],
  },
  articulation: {
    title: "Articulation Exercises",
    description: "Improve clarity and pronunciation",
    exercises: [
      {
        id: "a1",
        name: "Tongue Twisters",
        duration: "4 mins",
        instructions: "Practice specific tongue twisters slowly then speed up",
        details:
          "Tongue twisters are excellent for improving articulation and clarity, especially for singers. Choose a few tongue twisters and practice them slowly and clearly, focusing on precise pronunciation.  Gradually increase the speed while maintaining clarity. Practice for 4 minutes",
      },
      {
        id: "a2",
        name: "Lip Trills",
        duration: "3 mins",
        instructions: "Perform lip trills while changing pitch",
        details:
          "Lip trills help warm up the vocal cords and improve breath control. Gently close your lips together and blow air through them, creating a 'bbrrrr' sound.  While maintaining the lip trill, gradually change the pitch of the sound, moving up and down your vocal range for 3 minutes.",
      },
      {
        id: "a3",
        name: "Diction Practice",
        duration: "5 mins",
        instructions: "Practice clear consonant sounds",
        details:
          "Clear diction is crucial for singers to deliver lyrics with clarity. Select a passage of text or song lyrics.  Practice speaking or singing the words, paying close attention to pronouncing each consonant clearly and precisely. Focus on any consonants you find challenging. Practice for 5 minutes.",
      },
    ],
  },
};

// Component representing a section of exercises within a category
const ExerciseSection = ({
  category,
  exercises,
  isOpen,
  onToggle,
  completedExercises = [],
  onExerciseToggle,
}) => {
  // Ensure completedExercises is always an array for safe operations
  const completed = Array.isArray(completedExercises) ? completedExercises : [];

  // State to manage which exercise's details are expanded
  const [expandedExercise, setExpandedExercise] = useState(null);

  // Function to toggle the visibility of exercise details
  const toggleExerciseDetails = (exerciseId) => {
    // If the same exercise ID is clicked, close the details; otherwise, open the clicked exercise details
    setExpandedExercise((prevId) =>
      prevId === exerciseId ? null : exerciseId
    );
  };

  return (
    <Card className="mb-4 overflow-hidden">
      {/* Section Header - clickable to toggle visibility */}
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between bg-white hover:bg-pink-50 transition-colors"
      >
        <div>
          {/* Category Title */}
          <h3 className="text-left text-xl font-semibold text-gray-800">
            {category.title}
          </h3>
          {/* Category Description */}
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
        </div>
        {/* Chevron Icon to indicate open/closed state */}
        {isOpen ? (
          <ChevronUp className="h-6 w-6 text-pink-500" />
        ) : (
          <ChevronDown className="h-6 w-6 text-pink-500" />
        )}
      </button>

      {/* Display exercises when the section is open */}
      {isOpen && (
        <div className="p-6 space-y-4">
          {exercises.map((exercise) => (
            // Individual Exercise Card
            <div
              key={exercise.id}
              className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              {/* Exercise Header and Completion Button */}
              <div className="flex items-center justify-between">
                {/* Exercise Name and Duration */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-800">
                      {exercise.name}
                    </h4>
                    <span className="text-sm text-pink-500">
                      {exercise.duration}
                    </span>
                  </div>
                  {/* Short Exercise Instructions */}
                  <p className="text-sm text-gray-600 mt-1">
                    {exercise.instructions}
                  </p>
                </div>
                {/* Exercise Completion Toggle Button */}
                <button
                  onClick={() => onExerciseToggle(exercise.id)}
                  className="ml-4 p-2 hover:bg-pink-50 rounded-full transition-colors"
                >
                  {/* Display checkmark if completed, otherwise a circle */}
                  {completed.includes(exercise.id) ? (
                    <CheckCircle className="h-6 w-6 text-pink-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Expandable Details Section */}
              {expandedExercise === exercise.id && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {/* Detailed Exercise Explanation */}
                  <p className="text-sm text-gray-700">{exercise.details}</p>
                </div>
              )}
              {/* Button to Show/Hide Details */}
              <button
                onClick={() => toggleExerciseDetails(exercise.id)}
                className="text-pink-500 text-sm mt-2"
              >
                {/* Toggle text based on expansion state */}
                {expandedExercise === exercise.id ? "Show Less" : "Learn More"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Main Component for the Exercises Page
const ExercisesPage = () => {
  // Access the user from the authentication context
  const { user } = useContext(AuthContext);

  // State to manage which exercise sections are open
  const [openSections, setOpenSections] = useState([]);
  // State to track completed exercises for the day
  const [completedExercises, setCompletedExercises] = useState([]);
  // Total number of exercises available
  const [totalExercises, setTotalExercises] = useState(0);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Effect to fetch initial data on component mount
  useEffect(() => {
    fetchExerciseProgress();
    calculateTotalExercises();
  }, []);

  // Calculate the total number of exercises from all categories
  const calculateTotalExercises = () => {
    const total = Object.values(exerciseCategories).reduce(
      (acc, cat) => acc + cat.exercises.length,
      0
    );
    setTotalExercises(total);
  };

  // Fetch the user's exercise progress for today from the backend
  const fetchExerciseProgress = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/exercises/progress",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Update completedExercises if the fetch is successful
      if (response.data.success) {
        const todayExercises =
          response.data.todayProgress?.completedExercises || [];
        setCompletedExercises(todayExercises);
      }
    } catch (error) {
      // Log errors and initialize completedExercises as an empty array
      console.error("Error fetching exercise progress:", error);
      setCompletedExercises([]);
    } finally {
      // Set loading to false after data is fetched or an error occurs
      setLoading(false);
    }
  };

  // Toggle the completion status of an exercise
  const toggleExercise = async (exerciseId) => {
    // Ensure currentCompleted is an array to avoid errors
    const currentCompleted = Array.isArray(completedExercises)
      ? completedExercises
      : [];

    // Check if the exercise is already in the completed list
    const updatedExercises = currentCompleted.includes(exerciseId)
      ? currentCompleted.filter((id) => id !== exerciseId) // Remove if already completed
      : [...currentCompleted, exerciseId]; // Add if not completed

    // Update the local state immediately for responsiveness
    setCompletedExercises(updatedExercises);

    try {
      // Send the updated exercise progress to the backend
      await axios.post(
        "http://localhost:8000/api/exercises/track",
        { completedExercises: updatedExercises },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
    } catch (error) {
      // Handle errors by reverting to the previous state and logging the error
      console.error("Error updating exercise progress:", error);
      setCompletedExercises(currentCompleted);
    }
  };

  // Show a loading message while fetching data
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen relative bg-gray-100 p-6">
      {/* Main Container */}
      <div className="container mx-auto space-y-6">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-800">Vocal Exercises</h1>
        {/* Page Description */}
        <p className="text-gray-600">
          Complete your daily vocal training routine
        </p>

        {/* Progress Card */}
        <Card className="px-6 py-4">
          <p className="text-sm text-gray-600">Today's Progress</p>
          {/* Display Progress */}
          <p className="text-2xl font-bold text-pink-500">
            {Array.isArray(completedExercises) ? completedExercises.length : 0}{" "}
            / {totalExercises}
          </p>
        </Card>

        {/* Exercise Categories Section */}
        <div className="space-y-4">
          {Object.entries(exerciseCategories).map(([key, category]) => (
            // Render each Exercise Section
            <ExerciseSection
              key={key}
              category={category}
              exercises={category.exercises}
              isOpen={openSections.includes(key)}
              onToggle={() =>
                setOpenSections((prev) =>
                  prev.includes(key)
                    ? prev.filter((sec) => sec !== key)
                    : [...prev, key]
                )
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
