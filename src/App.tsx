/**
 * Meilisearch Lightning Talk Presentation
 * Interactive SPA with executable API commands
 */

import { Presentation } from "@/components/presentation/Presentation";
import { presentationData } from "@/data/presentation-content";
import "./index.css";

export function App() {
  return <Presentation data={presentationData} />;
}

export { App as default };
