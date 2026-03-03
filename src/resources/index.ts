import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

function loadJSON(filename: string) {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8"));
}

export function registerResources(server: McpServer) {
  server.resource(
    "vat-rates",
    "euinvoice://data/vat-rates",
    {
      description: "Complete VAT rates database for EU-27 + UK, Norway, Switzerland, Iceland",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "euinvoice://data/vat-rates",
          mimeType: "application/json",
          text: JSON.stringify(loadJSON("vat-rates.json"), null, 2),
        },
      ],
    })
  );

  server.resource(
    "einvoicing-requirements",
    "euinvoice://data/einvoicing-requirements",
    {
      description: "E-invoicing mandates, systems, and requirements per country",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "euinvoice://data/einvoicing-requirements",
          mimeType: "application/json",
          text: JSON.stringify(loadJSON("einvoicing-requirements.json"), null, 2),
        },
      ],
    })
  );

  server.resource(
    "invoice-formats",
    "euinvoice://data/invoice-formats",
    {
      description: "E-invoicing format specifications (UBL, CII, Factur-X, XRechnung, FatturaPA, etc.)",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "euinvoice://data/invoice-formats",
          mimeType: "application/json",
          text: JSON.stringify(loadJSON("invoice-formats.json"), null, 2),
        },
      ],
    })
  );

  server.resource(
    "validation-rules",
    "euinvoice://data/validation-rules",
    {
      description: "Invoice validation rules, required fields, reverse charge rules, and OSS scheme details",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "euinvoice://data/validation-rules",
          mimeType: "application/json",
          text: JSON.stringify(loadJSON("validation-rules.json"), null, 2),
        },
      ],
    })
  );
}
