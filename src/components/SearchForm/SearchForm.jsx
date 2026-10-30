import { useState } from "react";
import "./SearchForm.css";
import { EMPTY_SEARCH_MESSAGE } from "../../utils/constants";

function SearchForm({ onSearch }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(evt) {
    evt.preventDefault();
    const keyword = query.trim();
    if (!keyword) {
      setError(EMPTY_SEARCH_MESSAGE);
      return;
    }
    setError("");
    onSearch(keyword);
  }

  return (
    <form className="search-form" role="search" onSubmit={handleSubmit} noValidate>
      <input
        className="search-form__input"
        type="search"
        name="query"
        placeholder={error || "Search notes..."}
        aria-label="Search notes"
        aria-invalid={Boolean(error)}
        value={query}
        onChange={(evt) => {
          setQuery(evt.target.value);
          if (error) setError("");
        }}
      />
      <button className="search-form__button" type="submit">
        Search
      </button>
    </form>
  );
}

export default SearchForm;
