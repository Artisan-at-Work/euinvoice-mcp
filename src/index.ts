#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";

const server = new McpServer({
  name: "euinvoice-mcp",
  version: "0.1.0",
});

registerTools(server);
registerResources(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("euinvoice-mcp server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
