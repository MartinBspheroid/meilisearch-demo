/**
 * Presentation content data for the Meilisearch lightning talk
 * Based on PRESENTATION_PLAN.md
 */

import type { PresentationData, ExecutableCommand } from "@/types/presentation";

/** Default headers for Meilisearch API requests */
const jsonHeaders = {
  "Content-Type": "application/json",
  Authorization: "Bearer your-secure-16-byte-master-key",
};

const csvHeaders = {
  "Content-Type": "text/csv",
  Authorization: "Bearer your-secure-16-byte-master-key",
};

const authHeader = {
  Authorization: "Bearer your-secure-16-byte-master-key",
};

/**
 * All presentation content organized into sections
 */
export const presentationData: PresentationData = {
  title: "Meilisearch",
  totalDuration: "15 minutes",
  sections: [
    // ============================================
    // Part 1: What is Meilisearch & How It Works
    // ============================================
    {
      id: "intro",
      type: "title",
      title: "Meilisearch",
      anchor: "intro",
      subtitle: "Lightning-Fast Search Engine",
      bullets: [
        "Open-source search engine written in Rust",
        "55k+ GitHub stars",
        "Primary promise: blazing fast search (<50ms responses)",
        "Designed for developer experience and user experience",
        "Single-purpose: just search, nothing else",
      ],
      soundbite:
        "Meilisearch is built for two things: making developers' lives easier and users finding what they actually mean.",
    },
    {
      id: "core-concepts",
      type: "concept",
      title: "Core Concepts",
      anchor: "core-concepts",
      content: `Understanding Meilisearch starts with a few key terms:

**Index** - A container for your searchable documents (like a database table)

**Documents** - JSON objects that contain your data (movies, products, transactions, etc.)

**REST API** - Simple HTTP interface for all operations (no complex query language)

**Search-as-you-type** - Results update on each keystroke (prefix search)

**Typo tolerance** - Automatically handles misspellings

Think of an index like a highly optimized database table specifically designed for search.`,
    },
    {
      id: "how-search-works",
      type: "concept",
      title: "How Search Works",
      anchor: "how-search-works",
      content: `The search pipeline transforms user queries into relevant results:`,
      codeExample: {
        code: "User Query → Tokenization → Matching → Ranking (Bucket Sort) → Response",
        language: "bash",
      },
      subsections: [
        {
          title: "The Pipeline Steps",
          content: `1. **Indexing** - Documents are POSTed to \`/indexes/{uid}/documents\`
2. **Tokenization** - Text is broken into searchable terms
3. **Matching** - Find documents containing query terms
4. **Ranking** - Bucket sort algorithm applies rules in order
5. **Response** - Sorted results + metadata (hits count, processing time)`,
        },
        {
          title: "Default Ranking Rules (in order)",
          content: `1. \`words\` - Documents with all query words rank higher
2. \`typo\` - Fewer typos rank higher
3. \`proximity\` - Words closer together rank higher
4. \`attribute\` - Word appears in more important attributes
5. \`sort\` - User-defined sort order
6. \`exactness\` - Exact matches rank higher

The magic is in the bucket sort algorithm. Each rule acts as a tiebreaker, applied in order. First rule is most important, last rule is least.`,
        },
      ],
    },

    // ============================================
    // Part 2: Live Demo
    // ============================================
    {
      id: "demo-setup",
      type: "title",
      title: "Live Demo",
      anchor: "demo-setup",
      subtitle: "50,000 Financial Transactions",
      bullets: [
        "JSON format with UUIDs",
        "CSV format with numeric IDs",
        "Full-text search on descriptions",
        "Filtering by status, currency, amount",
        "Sorting by amount, timestamp",
      ],
    },
    {
      id: "demo-index-json",
      type: "demo",
      title: "Index JSON Documents",
      anchor: "demo-index-json",
      commands: [
        {
          id: "index-json",
          label: "Index 50k JSON Records",
          description:
            "Upload financial transaction records to Meilisearch. Watch how fast it indexes!",
          method: "POST",
          endpoint: "/indexes/transactions_json/documents",
          headers: jsonHeaders,
          requiresFileData: "json",
          curlCommand: `curl -X POST "http://localhost:7700/indexes/transactions_json/documents" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  --data-binary @transactions.json`,
        },
      ],
      notes: ["50k records indexed in seconds", "Observe the task queuing system"],
    },
    {
      id: "demo-index-csv",
      type: "demo",
      title: "Index CSV Documents",
      anchor: "demo-index-csv",
      commands: [
        {
          id: "index-csv",
          label: "Index CSV Records",
          description:
            "Meilisearch accepts CSV format and converts to JSON internally.",
          method: "POST",
          endpoint:
            "/indexes/transactions_csv/documents?csvDelimiter=,&primaryKey=client_id",
          headers: csvHeaders,
          requiresFileData: "csv",
          curlCommand: `curl -X POST "http://localhost:7700/indexes/transactions_csv/documents?csvDelimiter=,&primaryKey=client_id" \\
  -H "Content-Type: text/csv" \\
  -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  --data-binary @transactions.csv`,
        },
      ],
      notes: ["CSV is converted to JSON internally", "Primary key must be specified"],
    },
    {
      id: "demo-configure-settings",
      type: "demo",
      title: "Configure Filterable & Sortable Attributes",
      anchor: "demo-configure-settings",
      commands: [
        {
          id: "configure-json-settings",
          label: "Configure JSON Index Settings",
          description:
            "Enable filtering and sorting on specific attributes. This must be done before filtering/sorting works.",
          method: "PATCH",
          endpoint: "/indexes/transactions_json/settings",
          headers: jsonHeaders,
          body: JSON.stringify(
            {
              filterableAttributes: ["status", "currency", "transaction_type"],
              sortableAttributes: ["amount", "timestamp"],
            },
            null,
            2
          ),
          curlCommand: `curl -X PATCH "http://localhost:7700/indexes/transactions_json/settings" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  --data-binary '{
    "filterableAttributes": ["status", "currency", "transaction_type"],
    "sortableAttributes": ["amount", "timestamp"]
  }'`,
        },
        {
          id: "configure-csv-settings",
          label: "Configure CSV Index Settings",
          description: "Enable more attributes for the CSV index (advanced features).",
          method: "PATCH",
          endpoint: "/indexes/transactions_csv/settings",
          headers: jsonHeaders,
          body: JSON.stringify(
            {
              filterableAttributes: [
                "status",
                "currency",
                "category",
                "amount",
                "risk_score",
                "location_country",
                "payment_method",
                "device_type",
                "transaction_type",
              ],
              sortableAttributes: [
                "amount",
                "risk_score",
                "processing_time_ms",
                "balance_after",
                "timestamp",
              ],
            },
            null,
            2
          ),
          curlCommand: `curl -X PATCH "http://localhost:7700/indexes/transactions_csv/settings" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  --data-binary '{
    "filterableAttributes": ["status", "currency", "category", "amount", "risk_score", "location_country", "payment_method", "device_type", "transaction_type"],
    "sortableAttributes": ["amount", "risk_score", "processing_time_ms", "balance_after", "timestamp"]
  }'`,
        },
      ],
      notes: [
        "Attributes must be explicitly enabled for filtering/sorting",
        "This demonstrates Meilisearch's security model",
      ],
    },
    {
      id: "demo-basic-search",
      type: "demo",
      title: "Basic Full-Text Search",
      anchor: "demo-basic-search",
      commands: [
        {
          id: "search-payment",
          label: "Search for 'payment'",
          description: "Full-text search across all indexed fields.",
          method: "GET",
          endpoint: "/indexes/transactions_json/search?q=payment",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_json/search?q=payment"`,
        },
      ],
      notes: ["Sub-50ms response time", "Search works on description field"],
      expectedResponse: `{
  "hits": [...],
  "estimatedTotalHits": 1523,
  "processingTimeMs": 12,
  "query": "payment"
}`,
    },
    {
      id: "demo-filter",
      type: "demo",
      title: "Filter by Status",
      anchor: "demo-filter",
      commands: [
        {
          id: "filter-completed",
          label: "Filter Completed Transactions",
          description: "Return only transactions with status 'completed'.",
          method: "GET",
          endpoint: "/indexes/transactions_json/search?q=&filter=status='completed'",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_json/search?q=&filter=status='completed'"`,
        },
      ],
      notes: [
        "Returns only completed transactions",
        "Empty query string searches all fields",
      ],
    },
    {
      id: "demo-sort",
      type: "demo",
      title: "Sort by Amount",
      anchor: "demo-sort",
      commands: [
        {
          id: "sort-amount-desc",
          label: "Sort by Amount (Highest First)",
          description: "Get transactions sorted by amount in descending order.",
          method: "GET",
          endpoint: "/indexes/transactions_json/search?q=&sort=amount:desc",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_json/search?q=&sort=amount:desc"`,
        },
      ],
      notes: ["Results sorted by amount (highest first)", "Use :asc for ascending"],
    },
    {
      id: "demo-combined",
      type: "demo",
      title: "Combined Filter + Sort",
      anchor: "demo-combined",
      commands: [
        {
          id: "filter-sort-combined",
          label: "USD Transactions by Date",
          description: "Filter to USD currency and sort by most recent.",
          method: "GET",
          endpoint:
            "/indexes/transactions_json/search?q=&filter=currency='USD'&sort=timestamp:desc",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_json/search?q=&filter=currency='USD'&sort=timestamp:desc"`,
        },
      ],
      notes: [
        "Filter USD transactions",
        "Sort by most recent",
        "Powerful combination for real-world use cases",
      ],
    },
    {
      id: "demo-typo",
      type: "demo",
      title: "Typo Tolerance",
      anchor: "demo-typo",
      commands: [
        {
          id: "search-typo",
          label: "Search with Typo: 'trasnfer'",
          description:
            "Meilisearch automatically handles misspellings and still finds 'transfer'.",
          method: "GET",
          endpoint: "/indexes/transactions_json/search?q=trasnfer",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_json/search?q=trasnfer"`,
        },
      ],
      notes: [
        "Finds 'transfer' despite the typo",
        "Works out of the box, no configuration needed",
      ],
    },

    // ============================================
    // Part 3: Advanced Features
    // ============================================
    {
      id: "advanced-title",
      type: "title",
      title: "Advanced Search Features",
      anchor: "advanced-title",
      subtitle: "Facets, Complex Filters, Multi-Sort",
    },
    {
      id: "advanced-facets",
      type: "demo",
      title: "Faceted Search",
      anchor: "advanced-facets",
      commands: [
        {
          id: "facet-distributions",
          label: "Get Facet Distributions",
          description:
            "See counts for each category, currency, and status - great for building filter UIs.",
          method: "POST",
          endpoint: "/indexes/transactions_csv/search",
          headers: jsonHeaders,
          body: JSON.stringify(
            {
              q: "",
              facets: ["category", "currency", "status"],
            },
            null,
            2
          ),
          curlCommand: `curl -X POST "http://localhost:7700/indexes/transactions_csv/search" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  -d '{
    "q": "",
    "facets": ["category", "currency", "status"]
  }'`,
        },
      ],
      notes: [
        "Real-time facet counts across categories",
        "Enables dynamic filtering UI (category dropdowns, etc.)",
        "Shows data distribution at a glance",
      ],
    },
    {
      id: "advanced-range-filter",
      type: "demo",
      title: "Range Filtering",
      anchor: "advanced-range-filter",
      commands: [
        {
          id: "filter-amount-range",
          label: "Filter by Amount Range",
          description: "Find transactions between $10,000 and $50,000.",
          method: "GET",
          endpoint:
            "/indexes/transactions_csv/search?q=&filter=amount>=10000 AND amount<=50000",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_csv/search?q=&filter=amount>=10000 AND amount<=50000"`,
        },
        {
          id: "filter-high-risk",
          label: "High-Risk Transactions",
          description: "Find transactions with risk score above 70.",
          method: "GET",
          endpoint: "/indexes/transactions_csv/search?q=&filter=risk_score>70",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_csv/search?q=&filter=risk_score>70"`,
        },
      ],
      notes: [
        "Numeric range filtering with >= and <= operators",
        "Perfect for price range sliders and risk assessment",
      ],
    },
    {
      id: "advanced-multi-sort",
      type: "demo",
      title: "Multi-Field Sorting",
      anchor: "advanced-multi-sort",
      commands: [
        {
          id: "multi-sort",
          label: "Sort by Risk, then Amount",
          description: "Primary sort by risk score (low first), secondary by amount (high first).",
          method: "GET",
          endpoint:
            "/indexes/transactions_csv/search?q=&sort=risk_score:asc,amount:desc",
          headers: authHeader,
          curlCommand: `curl -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  "http://localhost:7700/indexes/transactions_csv/search?q=&sort=risk_score:asc,amount:desc"`,
        },
      ],
      notes: [
        "Multiple sort criteria (risk first, then amount)",
        "Comma-separated sort fields",
        "Complex prioritization logic",
      ],
    },
    {
      id: "advanced-combined-query",
      type: "demo",
      title: "Full Power Query",
      anchor: "advanced-combined-query",
      commands: [
        {
          id: "full-power-query",
          label: "Filter + Sort + Facets",
          description:
            "High-value USD transactions with category facets, sorted by amount.",
          method: "POST",
          endpoint: "/indexes/transactions_csv/search",
          headers: jsonHeaders,
          body: JSON.stringify(
            {
              q: "",
              filter: 'currency="USD" AND amount >= 25000',
              sort: ["amount:desc"],
              facets: ["category"],
              limit: 10,
            },
            null,
            2
          ),
          curlCommand: `curl -X POST "http://localhost:7700/indexes/transactions_csv/search" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-secure-16-byte-master-key" \\
  -d '{
    "q": "",
    "filter": "currency=\\"USD\\" AND amount >= 25000",
    "sort": ["amount:desc"],
    "facets": ["category"],
    "limit": 10
  }'`,
        },
      ],
      notes: [
        "Complete query combining all features",
        "Filter by currency and amount",
        "Sort by amount descending",
        "Get facet distribution for categories",
        "Limit results to top 10",
      ],
    },

    // ============================================
    // Takeaways
    // ============================================
    {
      id: "takeaways",
      type: "title",
      title: "Key Takeaways",
      anchor: "takeaways",
      bullets: [
        "Fast - Under 50ms responses, Rust-powered, instant setup",
        "Simple - REST API, Docker one-liner, minimal configuration",
        "User-friendly - Typo tolerance, search-as-you-type out of the box",
        "Self-hosted - Full control, Docker deployment, no vendor lock-in",
        "Production-ready - Multi-instance architecture for scaling and HA",
      ],
      soundbite:
        "Meilisearch: When you need search that just works, and works fast.",
    },
  ],
};
