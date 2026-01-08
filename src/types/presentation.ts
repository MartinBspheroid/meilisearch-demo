/**
 * TypeScript interfaces for the Meilisearch presentation SPA
 */

/** HTTP methods supported by Meilisearch API */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Command that can be executed against Meilisearch */
export interface ExecutableCommand {
  /** Unique identifier for this command */
  id: string;
  /** Display label for the command */
  label: string;
  /** Description of what the command does */
  description: string;
  /** HTTP method */
  method: HttpMethod;
  /** API endpoint (relative to base URL) */
  endpoint: string;
  /** HTTP headers to include */
  headers: Record<string, string>;
  /** Request body (string or object) */
  body?: string | Record<string, unknown>;
  /** Original curl command for display */
  curlCommand: string;
  /** Whether this command needs pre-loaded file data */
  requiresFileData?: "json" | "csv";
}

/** Section types for the presentation */
export type SectionType = "title" | "concept" | "demo";

/** Base section interface */
interface BaseSection {
  /** Unique identifier for this section */
  id: string;
  /** Section type */
  type: SectionType;
  /** Section title */
  title: string;
  /** Anchor ID for navigation */
  anchor: string;
}

/** Title/hero section for introductions */
export interface TitleSection extends BaseSection {
  type: "title";
  /** Optional subtitle */
  subtitle?: string;
  /** Bullet points to display */
  bullets?: string[];
  /** Memorable quote/soundbite */
  soundbite?: string;
}

/** Concept section for explanations */
export interface ConceptSection extends BaseSection {
  type: "concept";
  /** Main content (supports basic markdown) */
  content: string;
  /** Optional code example */
  codeExample?: {
    code: string;
    language: "bash" | "json" | "typescript" | "javascript";
  };
  /** Optional subsections */
  subsections?: Array<{
    title: string;
    content: string;
    codeExample?: {
      code: string;
      language: "bash" | "json" | "typescript" | "javascript";
    };
  }>;
}

/** Demo section with executable commands */
export interface DemoSection extends BaseSection {
  type: "demo";
  /** Commands to execute */
  commands: ExecutableCommand[];
  /** Additional notes to display */
  notes?: string[];
  /** Example expected response */
  expectedResponse?: string;
}

/** Union type for all section types */
export type Section = TitleSection | ConceptSection | DemoSection;

/** Main presentation data structure */
export interface PresentationData {
  /** Presentation title */
  title: string;
  /** Total duration */
  totalDuration: string;
  /** All sections in order */
  sections: Section[];
}

/** Result from executing a command */
export interface CommandResult {
  /** Command ID this result belongs to */
  commandId: string;
  /** Whether the request succeeded */
  success: boolean;
  /** Response data */
  data?: unknown;
  /** Error message if failed */
  error?: string;
  /** HTTP status code */
  status: number;
  /** Client-side measured processing time */
  processingTimeMs: number;
  /** When the command was executed */
  executedAt: Date;
}

/** Meilisearch connection state */
export interface MeilisearchConnection {
  /** Whether connected to Meilisearch */
  isConnected: boolean;
  /** Whether currently checking connection */
  isChecking: boolean;
  /** Last check timestamp */
  lastChecked: Date | null;
}

/** File data loaded from server */
export interface FileData {
  /** JSON transaction data */
  json: string | null;
  /** CSV transaction data */
  csv: string | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
}
