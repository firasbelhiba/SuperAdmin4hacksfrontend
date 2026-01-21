import dynamic, { Loader } from "next/dynamic";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * Crée un composant Chart avec configuration optimisée
 * (ssr: false, texte "Loading chart...")
 * 
 * @example
 * const LineChart = createDynamicChart(() => import("@/components/chart/LineChart").then(mod => ({ default: mod.LineChart })));
 */
export function createDynamicChart<P = {}>(loader: Loader<P>) {
  return dynamic(loader, {
    loading: () => <LoadingSpinner text="Loading chart..." size="sm" />,
    ssr: false,
  });
}

/**
 * Crée un Modal avec configuration optimisée
 * (ssr: false, spinner petit)
 * 
 * @example
 * const ConfirmModal = createDynamicModal(() => import("@/components/ui/ConfirmModal"));
 */
export function createDynamicModal<P = {}>(loader: Loader<P>) {
  return dynamic(loader, {
    loading: () => <LoadingSpinner size="sm" />,
    ssr: false,
  });
}

/**
 * Crée un Form avec configuration optimisée
 * (ssr: false, texte "Loading form...")
 * 
 * @example
 * const SubscriptionForm = createDynamicForm(() => import("@/components/form/SubscriptionForm"));
 */
export function createDynamicForm<P = {}>(loader: Loader<P>) {
  return dynamic(loader, {
    loading: () => <LoadingSpinner text="Loading form..." size="md" />,
    ssr: false,
  });
}

/**
 * Crée un Dropdown avec configuration optimisée
 * (ssr: false, spinner petit)
 * 
 * @example
 * const UserDropdown = createDynamicDropdown(() => import("@/components/header/UserDropdown"));
 */
export function createDynamicDropdown<P = {}>(loader: Loader<P>) {
  return dynamic(loader, {
    loading: () => <LoadingSpinner size="sm" />,
    ssr: false,
  });
}

/**
 * Crée un composant avec import dynamique et options personnalisables
 * Utilise un objet littéral pour les options (requis par next/dynamic)
 * 
 * @example
 * const MyComponent = createDynamicComponent(() => import("@/components/MyComponent"), "Loading...", "md", false);
 */
export function createDynamicComponent<P = {}>(
  loader: Loader<P>,
  loadingText: string = "Loading...",
  loadingSize: "sm" | "md" | "lg" = "md",
  ssr: boolean = false
) {
  return dynamic(loader, {
    loading: () => <LoadingSpinner text={loadingText} size={loadingSize} />,
    ssr,
  });
}
