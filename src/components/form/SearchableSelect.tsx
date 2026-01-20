"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Search, X, Loader2 } from "lucide-react";

export interface SearchableOption {
  value: string;
  label: string;
  searchText?: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  // Mode statique
  options?: SearchableOption[];
  
  // Mode asynchrone (recherche via API)
  onSearch?: (query: string) => Promise<SearchableOption[]>;
  initialOptions?: SearchableOption[];
  minSearchLength?: number;
  debounceMs?: number;
  
  // Props communes
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
}

export default function SearchableSelect({
  options = [],
  onSearch,
  initialOptions = [],
  minSearchLength = 2,
  debounceMs = 500,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "Type to search",
  noResultsMessage = "No results found",
  disabled = false,
  error = false,
  className = "",
  id,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayOptions, setDisplayOptions] = useState<SearchableOption[]>(
    options.length > 0 ? options : initialOptions
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOptionCache, setSelectedOptionCache] = useState<SearchableOption | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mémoriser le mode async
  const isAsyncMode = useMemo(() => !!onSearch, [onSearch]);

  // Mémoriser les options initiales
  const initialDisplayOptions = useMemo(
    () => (options.length > 0 ? options : initialOptions),
    [options.length, initialOptions.length]
  );

  // Mémoriser l'option sélectionnée (remplace useState + useEffect)
  const selectedOption = useMemo(() => {
    if (!value) return null;
    
    // Chercher d'abord dans le cache (option sélectionnée précédemment)
    if (selectedOptionCache && selectedOptionCache.value === value) {
      return selectedOptionCache;
    }
    
    // Chercher dans toutes les options disponibles
    return [...displayOptions, ...initialDisplayOptions].find(
      opt => opt.value === value
    ) || null;
  }, [value, displayOptions, initialDisplayOptions, selectedOptionCache]);

  // Mémoriser le label sélectionné
  const selectedLabel = useMemo(
    () => selectedOption?.label || placeholder,
    [selectedOption, placeholder]
  );

  // Mémoriser les classes CSS du trigger
  const triggerClasses = useMemo(() => {
    const baseClass = 'searchable-select-trigger';
    const stateClass = error ? 'searchable-select-trigger-error' : 'searchable-select-trigger-default';
    const textClass = selectedOption ? 'searchable-select-trigger-text-selected' : 'searchable-select-trigger-text-placeholder';
    return { baseClass, stateClass, textClass };
  }, [error, selectedOption]);

  // SEUL useEffect nécessaire: Recherche asynchrone avec debounce et AbortController
  useEffect(() => {
    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Mode statique - filtrage local optimisé
    if (!isAsyncMode) {
      if (!searchQuery) {
        setDisplayOptions(initialDisplayOptions);
      } else {
        const filtered = initialDisplayOptions.filter((option) => {
          const searchableText = `${option.label} ${option.searchText || ""}`.toLowerCase();
          return searchableText.includes(searchQuery.toLowerCase());
        });
        setDisplayOptions(filtered);
      }
      return;
    }

    // Mode asynchrone
    if (searchQuery === "") {
      setDisplayOptions(initialDisplayOptions);
      setIsSearching(false);
      return;
    }

    if (searchQuery.length < minSearchLength) {
      setDisplayOptions(initialDisplayOptions);
      setIsSearching(false);
      return;
    }

    // Lancer la recherche avec debounce et AbortController
    setIsSearching(true);
    const abortController = new AbortController();
    
    debounceTimerRef.current = setTimeout(async () => {
      if (!onSearch) {
        setIsSearching(false);
        return;
      }

      try {
        const results = await onSearch(searchQuery);
        // Vérifier si la requête n'a pas été annulée
        if (!abortController.signal.aborted) {
          setDisplayOptions(results);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Search error:", error);
          setDisplayOptions([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      abortController.abort();
    };
  }, [searchQuery, isAsyncMode, onSearch, minSearchLength, debounceMs, initialDisplayOptions]); // Dépendances stables

  // Gérer le clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: SearchableOption) => {
    setSelectedOptionCache(option); // Mettre en cache l'option sélectionnée
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${triggerClasses.baseClass} ${triggerClasses.stateClass}`}
      >
        <span className={`searchable-select-trigger-text ${triggerClasses.textClass}`}>
          {selectedLabel}
        </span>
        <ChevronsUpDown className="w-4 h-4 ml-2 shrink-0 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="searchable-select-dropdown">
          {/* Search Input */}
          <div className="p-3 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="searchable-select-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18191F] dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {isAsyncMode && minSearchLength > 0 && searchQuery.length > 0 && searchQuery.length < minSearchLength && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Type at least {minSearchLength} characters to search
              </p>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-75 overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-8 flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span>Searching...</span>
              </div>
            ) : displayOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {searchQuery.length >= minSearchLength || !isAsyncMode ? noResultsMessage : emptyMessage}
              </div>
            ) : (
              <div className="p-2">
                {displayOptions.map((option) => {
                  const isSelected = option.value === value;
                  const optionClass = isSelected 
                    ? "searchable-select-option searchable-select-option-selected"
                    : "searchable-select-option searchable-select-option-default";
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={optionClass}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{option.label}</div>
                        {option.subtitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {option.subtitle}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
