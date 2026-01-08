# Meilisearch Lightning Talk Demo

An interactive demonstration of Meilisearch's core features and capabilities, built as a 15-minute lightning talk presentation. This demo showcases how to implement fast, developer-friendly search functionality using Meilisearch with a dataset of 50,000 financial transactions.

## What This Demo Covers

Meilisearch is an open-source search engine written in Rust that delivers lightning-fast search results (under 50ms response times). This demo explores:

- **Core Concepts**: Indexes, documents, REST API, search-as-you-type, and typo tolerance
- **Indexing**: Adding JSON and CSV documents to search indexes
- **Search Features**: Full-text search, filtering, sorting, faceted search, and range filtering
- **Advanced Queries**: Combining filters, sorting, and facets in complex search operations
- **Real-world Use Case**: Financial transaction search with multiple data formats

## Prerequisites

- [Bun](https://bun.sh) runtime
- Docker (for running Meilisearch locally)
- A secure 16-byte master key for Meilisearch authentication

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Start Meilisearch Locally

Run Meilisearch using Docker with persistent data storage:

```bash
docker run -it --rm \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY='your-secure-16-byte-master-key' \
  -e MEILI_ENV='development' \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:v1.31.0
```

**Important**: Replace `'your-secure-16-byte-master-key'` with an actual 16-byte (32 character) hexadecimal string for security.

### 3. Start the Demo Application

```bash
bun dev
```

The application will be available at `http://localhost:3000`.

### 4. Run in Production

```bash
bun start
```

## Demo Flow

The presentation is structured in three main sections:

1. **Introduction to Meilisearch**: Core concepts and how search works
2. **Live Demo**: Interactive examples with financial transaction data
3. **Advanced Features**: Facets, complex filtering, and multi-field sorting

Each demo section includes executable API commands that you can run against your local Meilisearch instance to see the results in real-time.

## Key Features Demonstrated

- **Document Indexing**: Upload and index 50,000+ JSON and CSV records
- **Full-Text Search**: Search across transaction descriptions with typo tolerance
- **Filtering**: Filter by status, currency, amount ranges, and other attributes
- **Sorting**: Sort results by amount, timestamp, risk score, etc.
- **Faceted Search**: Get real-time counts for categories, currencies, and statuses
- **Combined Queries**: Powerful combinations of search, filter, sort, and facets

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, and Shadcn/UI components
- **Runtime**: Bun for fast development and execution
- **Search Engine**: Meilisearch v1.31.0 running in Docker
- **Data**: 50,000 synthetic financial transactions in JSON and CSV formats

## API Endpoints Used

- `POST /indexes/{index}/documents` - Add documents to an index
- `PATCH /indexes/{index}/settings` - Configure filterable and sortable attributes
- `GET /indexes/{index}/search` - Perform search queries with filtering and sorting
- `POST /indexes/{index}/search` - Advanced search with facets and complex parameters

This demo serves as both an educational tool for understanding Meilisearch and a practical reference for implementing search functionality in applications.