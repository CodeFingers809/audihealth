import React from 'react'

export function SearchBox({ searchTerm, setSearchTerm, suggestions, loading, onLocationSelect, showSuggestions, setShowSuggestions }) {
  return (
    <div className="search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setShowSuggestions(true)
        }}
        placeholder="Search location..."
        className="search-input"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="suggestion-item"
              onClick={() => onLocationSelect(suggestion)}
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
      {loading && <div className="loading">Searching...</div>}
    </div>
  )
}