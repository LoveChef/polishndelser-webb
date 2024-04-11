import React from 'react';

const FilterComponent = ({ selectedFilter, onFilterChange }) => {
  const municipalities = ['Alla kommuner', /* ... Hämta kommuner från API eller hårdkoda */];

  return (
    <div className="filter-container">
      <h3>Välj filter:</h3>
      <select value={selectedFilter} onChange={(e) => onFilterChange(e.target.value)}>
        {municipalities.map((municipality) => (
          <option key={municipality} value={municipality}>
            {municipality}
          </option>
        ))}
      </select>
    </div>
  );
};
export default FilterComponent;
