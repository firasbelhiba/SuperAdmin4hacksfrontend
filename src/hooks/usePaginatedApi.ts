import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Types pour la réponse paginée de l'API
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Configuration du hook usePaginatedApi
 */
export interface UsePaginatedApiConfig<T, F> {
  fetchFn: (filters: F, page: number, limit: number) => Promise<PaginatedResponse<T>>;
  initialFilters?: Partial<F>;
  initialPage?: number;
  initialLimit?: number;
  debounceDelay?: number;
  enabled?: boolean;
}

/**
 * Valeur de retour du hook usePaginatedApi
 */
export interface UsePaginatedApiReturn<T, F> {
  // Données
  data: T[];
  meta: PaginatedResponse<T>["meta"] | null;
  
  // États
  loading: boolean;
  error: Error | null;
  
  // Filtres
  filters: Partial<F>;
  setFilter: <K extends keyof F>(key: K, value: F[K] | undefined) => void;
  setFilters: (filters: Partial<F>) => void;
  clearFilters: () => void;
  
  // Pagination
  page: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Actions
  refresh: () => void;
}

/**
 * Hook générique pour gérer la pagination et les filtres d'une API
 * 
 * @example
 * const { data, loading, filters, setFilter, nextPage } = usePaginatedApi({
 *   fetchFn: (filters, page, limit) => getHackathonRequests(filters, page, limit),
 *   initialFilters: { status: 'PENDING' },
 *   initialLimit: 10
 * });
 */
export function usePaginatedApi<T, F extends Record<string, any>>({
  fetchFn,
  initialFilters = {},
  initialPage = 1,
  initialLimit = 10,
  debounceDelay = 500,
  enabled = true,
}: UsePaginatedApiConfig<T, F>): UsePaginatedApiReturn<T, F> {
  // États
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<T>["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Filtres et pagination
  const [filters, setFiltersState] = useState<Partial<F>>(initialFilters);
  const [page, setPageState] = useState(initialPage);
  const [limit] = useState(initialLimit);
  
  // Refs pour gérer le debounce et éviter les race conditions
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);

  /**
   * Fonction de fetch avec gestion des erreurs et race conditions
   */
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau controller pour cette requête
    abortControllerRef.current = new AbortController();
    const currentFetchId = ++fetchIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(filters as F, page, limit);
      
      // Vérifier si cette requête est toujours la plus récente
      if (currentFetchId === fetchIdRef.current) {
        setData(response.data);
        setMeta(response.meta);
      }
    } catch (err) {
      // Ignorer les erreurs d'annulation
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      if (currentFetchId === fetchIdRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to fetch data"));
        setData([]);
        setMeta(null);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, filters, page, limit, enabled]);

  /**
   * Effet pour fetch les données avec debounce
   */
  useEffect(() => {
    if (!enabled) return;

    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Appliquer le debounce uniquement pour les filtres de recherche
    const hasSearchFilter = filters.search;
    
    if (hasSearchFilter && debounceDelay > 0) {
      debounceTimerRef.current = setTimeout(() => {
        fetchData();
      }, debounceDelay);
    } else {
      fetchData();
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchData, enabled, debounceDelay]);

  /**
   * Définir un filtre spécifique
   */
  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K] | undefined) => {
    setFiltersState(prev => {
      if (value === undefined || value === null || value === '') {
        const { [key]: _, ...rest } = prev;
        return rest as Partial<F>;
      }
      return { ...prev, [key]: value };
    });
    // Reset à la page 1 quand on change les filtres
    setPageState(1);
  }, []);

  /**
   * Définir plusieurs filtres en même temps
   */
  const setFilters = useCallback((newFilters: Partial<F>) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  /**
   * Réinitialiser tous les filtres
   */
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPageState(1);
  }, []);

  /**
   * Changer de page
   */
  const setPage = useCallback((newPage: number) => {
    if (meta && newPage >= 1 && newPage <= meta.totalPages) {
      setPageState(newPage);
    }
  }, [meta]);

  /**
   * Page suivante
   */
  const nextPage = useCallback(() => {
    if (meta?.hasNextPage) {
      setPageState(prev => prev + 1);
    }
  }, [meta]);

  /**
   * Page précédente
   */
  const prevPage = useCallback(() => {
    if (meta?.hasPrevPage) {
      setPageState(prev => prev - 1);
    }
  }, [meta]);

  /**
   * Aller à la première page
   */
  const goToFirstPage = useCallback(() => {
    setPageState(1);
  }, []);

  /**
   * Aller à la dernière page
   */
  const goToLastPage = useCallback(() => {
    if (meta) {
      setPageState(meta.totalPages);
    }
  }, [meta]);

  /**
   * Rafraîchir les données
   */
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Données
    data,
    meta,
    
    // États
    loading,
    error,
    
    // Filtres
    filters,
    setFilter,
    setFilters,
    clearFilters,
    
    // Pagination
    page,
    setPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    
    // Actions
    refresh,
  };
}
