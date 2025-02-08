import React, { useState } from "react";
import { Mic, ChevronDown, ChevronUp, CheckCircle, Circle } from "lucide-react";

// Custom Card Component to replace shadcn Card
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const exerciseCategories = {
  breathing: {
    title: "Breathing Exercises",
    description: "Fundamental exercises to improve breath control",
    exercises: [
      {
        id: "b1",
        name: "Diaphragmatic Breathing",
        duration: "5 mins",
        instructions: "Lie down, place hand on belly, breathe deeply",
      },
      {
        id: "b2",
        name: "Square Breathing",
        duration: "3 mins",
        instructions: "Inhale 4s, hold 4s, exhale 4s, hold 4s",
      },
      {
        id: "b3",
        name: "Sustained Breath",
        duration: "4 mins",
        instructions:
          "Take deep breath, sustain 'ah' sound as long as possible",
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
      },
      {
        id: "p2",
        name: "Scale Practice",
        duration: "5 mins",
        instructions: "Practice major scale ascending and descending",
      },
      {
        id: "p3",
        name: "Interval Jumps",
        duration: "3 mins",
        instructions: "Practice jumping between specific intervals",
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
      },
      {
        id: "a2",
        name: "Lip Trills",
        duration: "3 mins",
        instructions: "Perform lip trills while changing pitch",
      },
      {
        id: "a3",
        name: "Diction Practice",
        duration: "5 mins",
        instructions: "Practice clear consonant sounds",
      },
    ],
  },
};

const ExerciseSection = ({
  category,
  exercises,
  isOpen,
  onToggle,
  completedExercises,
  onExerciseToggle,
}) => {
  return (
    <Card className="mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between bg-white hover:bg-pink-50 transition-colors"
      >
        <div>
          <h3 className="text-left text-xl font-semibold text-gray-800">
            {category.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-6 w-6 text-pink-500" />
        ) : (
          <ChevronDown className="h-6 w-6 text-pink-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-6 space-y-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-800">
                      {exercise.name}
                    </h4>
                    <span className="text-sm text-pink-500">
                      {exercise.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {exercise.instructions}
                  </p>
                </div>
                <button
                  onClick={() => onExerciseToggle(exercise.id)}
                  className="ml-4 p-2 hover:bg-pink-50 rounded-full transition-colors"
                >
                  {completedExercises.includes(exercise.id) ? (
                    <CheckCircle className="h-6 w-6 text-pink-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
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
  const [exerciseHistory, setExerciseHistory] = useState(() => {
    const savedHistory = localStorage.getItem("exerciseHistory");
    return savedHistory ? JSON.parse(savedHistory) : {};
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) =>
      prev.includes(sectionKey)
        ? prev.filter((key) => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const toggleExercise = (exerciseId) => {
    const currentDate = getCurrentDate();
    const updatedHistory = { ...exerciseHistory };

    if (!updatedHistory[currentDate]) {
      updatedHistory[currentDate] = [];
    }

    if (updatedHistory[currentDate].includes(exerciseId)) {
      updatedHistory[currentDate] = updatedHistory[currentDate].filter(
        (id) => id !== exerciseId
      );
    } else {
      updatedHistory[currentDate] = [
        ...updatedHistory[currentDate],
        exerciseId,
      ];
    }

    setExerciseHistory(updatedHistory);
    localStorage.setItem("exerciseHistory", JSON.stringify(updatedHistory));
  };

  const getCompletedExercises = () => {
    const currentDate = getCurrentDate();
    return exerciseHistory[currentDate] || [];
  };

  const totalExercises = Object.values(exerciseCategories).reduce(
    (acc, cat) => acc + cat.exercises.length,
    0
  );

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
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Vocal Exercises
            </h1>
            <p className="text-gray-600 mt-1">
              Complete your daily vocal training routine
            </p>
          </div>
          <Card className="px-6 py-4">
            <p className="text-sm text-gray-600">Today's Progress</p>
            <p className="text-2xl font-bold text-pink-500">
              {getCompletedExercises().length} / {totalExercises}
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          {Object.entries(exerciseCategories).map(([key, category]) => (
            <ExerciseSection
              key={key}
              category={category}
              exercises={category.exercises}
              isOpen={openSections.includes(key)}
              onToggle={() => toggleSection(key)}
              completedExercises={getCompletedExercises()}
              onExerciseToggle={toggleExercise}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExercisesPage;
