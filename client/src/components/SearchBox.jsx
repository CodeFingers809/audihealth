import React from "react";
import { Search, Loader2 } from "lucide-react";

export function SearchBox({
  searchTerm,
  setSearchTerm,
  suggestions,
  loading,
  onLocationSelect,
  showSuggestions,
  setShowSuggestions,
}) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-4 z-[1000]">
      <div className="flex items-center bg-white shadow-md rounded-2xl overflow-hidden">
        <Search className="w-5 h-5 text-gray-500 ml-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="Search location..."
          className="w-full py-2 px-3 focus:outline-none text-gray-700 bg-transparent"
        />
      </div>

      {/* Suggestions List */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="p-3 cursor-pointer hover:bg-gray-100 transition-colors text-sm text-gray-700"
              onClick={() => onLocationSelect(suggestion)}
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute right-4 top-2">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
}
