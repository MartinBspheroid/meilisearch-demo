/**
 * Utility functions to parse curl commands and convert them to fetch options
 */

export interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  isFileUpload: boolean;
  fileType?: "json" | "csv";
}

export interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Parse a curl command string into structured data.
 * Handles common curl flags: -X, -H, -d, --data-binary
 */
export function parseCurl(curlCommand: string): ParsedCurl {
  // Normalize multiline commands (join lines ending with \)
  const normalized = curlCommand.replace(/\\\n\s*/g, " ").trim();

  let method = "GET";
  let url = "";
  const headers: Record<string, string> = {};
  let body: string | undefined;
  let isFileUpload = false;
  let fileType: "json" | "csv" | undefined;

  // Extract method (-X METHOD)
  const methodMatch = normalized.match(/-X\s+(\w+)/);
  if (methodMatch?.[1]) {
    method = methodMatch[1];
  }

  // Extract URL - look for quoted URL after curl or -X METHOD
  const urlMatches = [
    // URL in double quotes
    normalized.match(/curl[^"]*"(https?:\/\/[^"]+)"/),
    // URL in single quotes
    normalized.match(/curl[^']*'(https?:\/\/[^']+)'/),
    // Unquoted URL
    normalized.match(/curl\s+(?:-[^\s]+\s+)*(\S+https?:\/\/\S+)/),
  ];

  for (const match of urlMatches) {
    if (match?.[1]) {
      url = match[1];
      break;
    }
  }

  // If still no URL, try to find any http URL
  if (!url) {
    const anyUrlMatch = normalized.match(/(https?:\/\/[^\s"']+)/);
    if (anyUrlMatch?.[1]) {
      url = anyUrlMatch[1];
    }
  }

  // Extract headers (-H "Header: Value")
  const headerRegex = /-H\s+["']([^"']+)["']/g;
  let headerMatch;
  while ((headerMatch = headerRegex.exec(normalized)) !== null) {
    const headerValue = headerMatch[1];
    if (headerValue) {
      const [key, ...valueParts] = headerValue.split(":");
      if (key && valueParts.length > 0) {
        headers[key.trim()] = valueParts.join(":").trim();
      }
    }
  }

  // Extract body data (-d or --data-binary)
  const bodyPatterns = [
    // --data-binary with file reference
    /--data-binary\s+@(\S+)/,
    // -d with file reference
    /-d\s+@(\S+)/,
    // --data-binary with quoted content
    /--data-binary\s+['"]([^'"]+)['"]/,
    // -d with quoted content
    /-d\s+['"]([^'"]+)['"]/,
    // --data-binary with JSON object (single quotes around JSON)
    /--data-binary\s+'(\{[^']+\})'/,
  ];

  for (const pattern of bodyPatterns) {
    const match = normalized.match(pattern);
    const content = match?.[1];
    if (content) {
      // Check if it's a file reference
      if (content.startsWith("@") || pattern.source.includes("@")) {
        const filename = content.replace("@", "");
        isFileUpload = true;
        fileType = filename.endsWith(".csv") ? "csv" : "json";
      } else {
        body = content;
      }
      break;
    }
  }

  // Handle POST/PUT/PATCH without explicit body - might have file upload
  if (!body && !isFileUpload && ["POST", "PUT", "PATCH"].includes(method)) {
    const fileMatch = normalized.match(/@(\S+\.(json|csv))/);
    if (fileMatch) {
      isFileUpload = true;
      fileType = fileMatch[2] as "json" | "csv";
    }
  }

  return { method, url, headers, body, isFileUpload, fileType };
}

/**
 * Convert parsed curl data to fetch options.
 * Optionally inject file data for uploads.
 */
export function curlToFetchOptions(
  parsed: ParsedCurl,
  fileData?: string
): FetchOptions {
  const options: FetchOptions = {
    method: parsed.method,
    headers: { ...parsed.headers },
  };

  if (parsed.isFileUpload && fileData) {
    options.body = fileData;
  } else if (parsed.body) {
    options.body = parsed.body;
  }

  return options;
}

/**
 * Generate a displayable JavaScript fetch code snippet from curl.
 * Useful for showing users the equivalent JS code.
 */
export function curlToFetchCode(curlCommand: string): string {
  const parsed = parseCurl(curlCommand);

  const headersStr = Object.entries(parsed.headers)
    .map(([k, v]) => `    "${k}": "${v}"`)
    .join(",\n");

  let code = `const response = await fetch("${parsed.url}", {
  method: "${parsed.method}",
  headers: {
${headersStr}
  }`;

  if (parsed.body && !parsed.isFileUpload) {
    // Try to format JSON body nicely
    try {
      const jsonBody = JSON.parse(parsed.body);
      code += `,\n  body: JSON.stringify(${JSON.stringify(jsonBody, null, 2).split("\n").join("\n  ")})`;
    } catch {
      code += `,\n  body: ${JSON.stringify(parsed.body)}`;
    }
  } else if (parsed.isFileUpload) {
    code += `,\n  body: fileData // loaded from ${parsed.fileType} file`;
  }

  code += `\n});

const data = await response.json();`;

  return code;
}

/**
 * Extract the endpoint path from a full URL.
 * Useful for displaying cleaner command descriptions.
 */
export function extractEndpoint(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // If URL parsing fails, try to extract path manually
    const match = url.match(/https?:\/\/[^\/]+(\/.*)/);
    return match?.[1] ?? url;
  }
}
