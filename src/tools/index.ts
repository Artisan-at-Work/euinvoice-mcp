import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

function loadJSON(filename: string) {
  return JSON.parse(readFileSync(join(dataDir, filename), "utf-8"));
}

// Lazy-load data
let vatData: any;
let einvoicingData: any;
let formatsData: any;
let validationData: any;

function getVatData() {
  if (!vatData) vatData = loadJSON("vat-rates.json");
  return vatData;
}
function getEinvoicingData() {
  if (!einvoicingData) einvoicingData = loadJSON("einvoicing-requirements.json");
  return einvoicingData;
}
function getFormatsData() {
  if (!formatsData) formatsData = loadJSON("invoice-formats.json");
  return formatsData;
}
function getValidationData() {
  if (!validationData) validationData = loadJSON("validation-rules.json");
  return validationData;
}

export function registerTools(server: McpServer) {
  // 1. Get VAT rates for a country
  server.tool(
    "get_vat_rates",
    "Get VAT rates (standard, reduced, super-reduced, parking) for an EU/EEA country. Returns current rates with notes.",
    {
      countryCode: z.string().length(2).describe("ISO 3166-1 alpha-2 country code (e.g., DE, FR, IT)"),
    },
    async ({ countryCode }) => {
      const data = getVatData();
      const country = data.countries[countryCode.toUpperCase()];
      if (!country) {
        return {
          content: [{ type: "text", text: `Country code '${countryCode}' not found. Use ISO 3166-1 alpha-2 codes (e.g., DE, FR, NL).` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(country, null, 2) }],
      };
    }
  );

  // 2. List all VAT rates
  server.tool(
    "list_vat_rates",
    "List VAT standard rates for all supported countries, sorted by rate. Useful for comparison.",
    {},
    async () => {
      const data = getVatData();
      const summary = Object.values(data.countries as Record<string, any>)
        .map((c) => ({
          code: c.code,
          country: c.name,
          standard: c.standard,
          reduced: c.reduced,
          currency: c.currency,
        }))
        .sort((a, b) => a.standard - b.standard);
      return {
        content: [{ type: "text", text: JSON.stringify({ lastUpdated: data.lastUpdated, countries: summary }, null, 2) }],
      };
    }
  );

  // 3. Get e-invoicing requirements
  server.tool(
    "get_einvoicing_requirements",
    "Get e-invoicing requirements for a country: mandates (B2G, B2B, B2C), systems, formats, Peppol readiness, clearance model.",
    {
      countryCode: z.string().length(2).describe("ISO 3166-1 alpha-2 country code"),
    },
    async ({ countryCode }) => {
      const data = getEinvoicingData();
      const country = data.countries[countryCode.toUpperCase()];
      if (!country) {
        return {
          content: [{ type: "text", text: `Country code '${countryCode}' not found.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(country, null, 2) }],
      };
    }
  );

  // 4. Get invoice format details
  server.tool(
    "get_invoice_format",
    "Get details about an e-invoicing format/standard (UBL, CII, Factur-X, XRechnung, FatturaPA, Peppol BIS, etc.).",
    {
      format: z.string().describe("Format name (e.g., UBL, CII, Factur-X, XRechnung, FatturaPA, Facturae, Peppol BIS, ebInterface)"),
    },
    async ({ format }) => {
      const data = getFormatsData();
      // Try exact match first, then case-insensitive search
      let found = data.formats[format];
      if (!found) {
        const key = Object.keys(data.formats).find(
          (k) => k.toLowerCase() === format.toLowerCase() || data.formats[k].name.toLowerCase().includes(format.toLowerCase())
        );
        if (key) found = data.formats[key];
      }
      if (!found) {
        return {
          content: [{
            type: "text",
            text: `Format '${format}' not found. Available: ${Object.keys(data.formats).join(", ")}`,
          }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(found, null, 2) }],
      };
    }
  );

  // 5. Validate invoice fields
  server.tool(
    "validate_invoice_fields",
    "Check which fields are required for an invoice in a specific country. Returns common EU requirements plus country-specific fields.",
    {
      countryCode: z.string().length(2).describe("ISO 3166-1 alpha-2 country code"),
      transactionType: z.enum(["B2B", "B2G", "B2C"]).optional().describe("Transaction type (defaults to B2B)"),
    },
    async ({ countryCode, transactionType = "B2B" }) => {
      const data = getValidationData();
      const code = countryCode.toUpperCase();
      const result: any = {
        country: code,
        transactionType,
        commonRequiredFields: data.commonRequiredFields.fields,
        countrySpecificFields: data.countrySpecificFields[code]?.additionalRequired || [],
      };

      // Add e-invoicing context
      const einv = getEinvoicingData().countries[code];
      if (einv) {
        const mandateKey = transactionType.toLowerCase().replace("2", "") as string;
        result.einvoicingContext = {
          mandated: einv[`b2${transactionType[2].toLowerCase()}Mandate`] ?? false,
          system: einv[`b2${transactionType[2].toLowerCase()}System`] ?? einv.b2gSystem,
          acceptedFormats: einv.acceptedFormats,
          clearanceModel: einv.clearanceModel,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 6. Get reverse charge rules
  server.tool(
    "get_reverse_charge_rules",
    "Get reverse charge mechanism rules for EU cross-border transactions. Explains when and how to apply reverse charge.",
    {},
    async () => {
      const data = getValidationData();
      return {
        content: [{ type: "text", text: JSON.stringify(data.reverseCharge, null, 2) }],
      };
    }
  );

  // 7. Get OSS rules
  server.tool(
    "get_oss_rules",
    "Get One-Stop Shop (OSS/IOSS) rules for EU cross-border B2C sales. Covers Union OSS, Non-Union OSS, and Import OSS.",
    {},
    async () => {
      const data = getValidationData();
      return {
        content: [{ type: "text", text: JSON.stringify(data.oss, null, 2) }],
      };
    }
  );

  // 8. Check B2B mandate status
  server.tool(
    "get_b2b_mandate_status",
    "Get the B2B e-invoicing mandate status across all countries. Shows which countries have mandates, planned dates, and systems.",
    {},
    async () => {
      const data = getEinvoicingData();
      const mandates = Object.values(data.countries as Record<string, any>)
        .map((c) => ({
          code: c.name,
          b2bMandate: c.b2bMandate,
          b2bMandateDate: c.b2bMandateDate,
          b2bSystem: c.b2bSystem,
          clearanceModel: c.clearanceModel,
        }))
        .sort((a, b) => {
          if (a.b2bMandate && !b.b2bMandate) return -1;
          if (!a.b2bMandate && b.b2bMandate) return 1;
          return (a.b2bMandateDate || "9999").localeCompare(b.b2bMandateDate || "9999");
        });
      return {
        content: [{ type: "text", text: JSON.stringify(mandates, null, 2) }],
      };
    }
  );

  // 9. Get EN 16931 standard info
  server.tool(
    "get_en16931_info",
    "Get information about the EN 16931 European e-invoicing standard, its core syntaxes, and CIUS extensions.",
    {},
    async () => {
      const data = getFormatsData();
      return {
        content: [{ type: "text", text: JSON.stringify(data.enStandard, null, 2) }],
      };
    }
  );

  // 10. Country comparison
  server.tool(
    "compare_countries",
    "Compare e-invoicing requirements and VAT rates between two countries.",
    {
      countryA: z.string().length(2).describe("First country code"),
      countryB: z.string().length(2).describe("Second country code"),
    },
    async ({ countryA, countryB }) => {
      const a = countryA.toUpperCase();
      const b = countryB.toUpperCase();
      const vat = getVatData();
      const einv = getEinvoicingData();

      const vatA = vat.countries[a];
      const vatB = vat.countries[b];
      const einvA = einv.countries[a];
      const einvB = einv.countries[b];

      if (!vatA || !vatB) {
        return {
          content: [{ type: "text", text: `One or both country codes not found: ${a}, ${b}` }],
          isError: true,
        };
      }

      const comparison = {
        [a]: {
          name: vatA.name,
          vatStandard: vatA.standard,
          vatReduced: vatA.reduced,
          currency: vatA.currency,
          b2bMandate: einvA?.b2bMandate ?? false,
          b2bMandateDate: einvA?.b2bMandateDate,
          b2gMandate: einvA?.b2gMandate ?? false,
          peppolReady: einvA?.peppolReady ?? false,
          clearanceModel: einvA?.clearanceModel,
          acceptedFormats: einvA?.acceptedFormats ?? [],
        },
        [b]: {
          name: vatB.name,
          vatStandard: vatB.standard,
          vatReduced: vatB.reduced,
          currency: vatB.currency,
          b2bMandate: einvB?.b2bMandate ?? false,
          b2bMandateDate: einvB?.b2bMandateDate,
          b2gMandate: einvB?.b2gMandate ?? false,
          peppolReady: einvB?.peppolReady ?? false,
          clearanceModel: einvB?.clearanceModel,
          acceptedFormats: einvB?.acceptedFormats ?? [],
        },
      };

      return {
        content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }],
      };
    }
  );
}
