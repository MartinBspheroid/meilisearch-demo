/**
 * Meilisearch API client wrapper
 */

/** Default Meilisearch configuration */
export const MEILISEARCH_BASE_URL = "http://localhost:7700";
export const MEILISEARCH_API_KEY = "your-secure-16-byte-master-key";

/** Response from executing a Meilisearch request */
export interface MeilisearchResponse {
  /** Whether the request succeeded (2xx status) */
  success: boolean;
  /** Response data from Meilisearch */
  data?: unknown;
  /** Error message if request failed */
  error?: string;
  /** HTTP status code */
  status: number;
  /** Client-side measured processing time in ms */
  processingTimeMs: number;
}

/** Options for executing a request */
export interface ExecuteOptions {
  /** HTTP method */
  method: string;
  /** API endpoint (relative to base URL) */
  endpoint: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: string;
}

/**
 * Execute a Meilisearch API request.
 *
 * @example
 * ```ts
 * const result = await executeMeilisearchRequest({
 *   method: 'GET',
 *   endpoint: '/indexes/movies/search?q=batman',
 * });
 * ```
 */
export async function executeMeilisearchRequest(
  options: ExecuteOptions
): Promise<MeilisearchResponse> {
  const startTime = performance.now();

  const url = `${MEILISEARCH_BASE_URL}${options.endpoint}`;

  const fetchOptions: RequestInit = {
    method: options.method,
    headers: {
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      ...options.headers,
    },
  };

  if (options.body) {
    fetchOptions.body = options.body;
  }

  try {
    const response = await fetch(url, fetchOptions);
    const endTime = performance.now();

    let data: unknown;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      success: response.ok,
      data,
      status: response.status,
      processingTimeMs: Math.round(endTime - startTime),
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: 0,
      processingTimeMs: Math.round(endTime - startTime),
    };
  }
}

/**
 * Check if Meilisearch is reachable by calling the health endpoint.
 *
 * @returns true if Meilisearch responds with a successful health check
 */
export async function checkMeilisearchConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${MEILISEARCH_BASE_URL}/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get Meilisearch version information.
 *
 * @returns Version info or null if request failed
 */
export async function getMeilisearchVersion(): Promise<{
  commitSha: string;
  commitDate: string;
  pkgVersion: string;
} | null> {
  try {
    const response = await fetch(`${MEILISEARCH_BASE_URL}/version`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}
