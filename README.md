# euinvoice-mcp

An MCP server for European invoicing rules. Query VAT rates, e-invoicing requirements, format specifications, and compliance rules for EU-27 + EEA countries — directly from your AI assistant.

## Why

European invoicing is fragmented. Every country has different VAT rates, e-invoicing mandates, accepted formats, and compliance rules. This MCP server puts all of that knowledge at your fingertips.

## What's included

**10 tools** covering the full EU invoicing landscape:

| Tool | Description |
|------|-------------|
| `get_vat_rates` | VAT rates for any country (standard, reduced, super-reduced, parking) |
| `list_vat_rates` | Compare standard VAT rates across all countries |
| `get_einvoicing_requirements` | E-invoicing mandates, systems, and formats per country |
| `get_invoice_format` | Format specs (UBL, CII, Factur-X, XRechnung, FatturaPA, Peppol BIS) |
| `validate_invoice_fields` | Required fields per country and transaction type (B2B/B2G/B2C) |
| `get_reverse_charge_rules` | When and how to apply reverse charge |
| `get_oss_rules` | One-Stop Shop rules for cross-border B2C sales |
| `get_b2b_mandate_status` | B2B e-invoicing mandate timeline across all countries |
| `get_en16931_info` | EN 16931 standard details and CIUS extensions |
| `compare_countries` | Side-by-side comparison of two countries |

**4 resources** for direct data access:

- `euinvoice://data/vat-rates` — Complete VAT rates database
- `euinvoice://data/einvoicing-requirements` — E-invoicing requirements per country
- `euinvoice://data/invoice-formats` — Format specifications
- `euinvoice://data/validation-rules` — Validation rules, reverse charge, OSS

## Coverage

EU-27 + United Kingdom, Norway, Switzerland, Iceland.

Data current as of January 2025.

## Installation

```bash
npm install -g euinvoice-mcp
```

Or run directly:

```bash
npx euinvoice-mcp
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "euinvoice": {
      "command": "npx",
      "args": ["-y", "euinvoice-mcp"]
    }
  }
}
```

### Cursor / VS Code

Add to your MCP settings:

```json
{
  "euinvoice": {
    "command": "npx",
    "args": ["-y", "euinvoice-mcp"]
  }
}
```

### From source

```bash
git clone https://github.com/Artisan-at-Work/euinvoice-mcp.git
cd euinvoice-mcp
npm install
npm run build
```

Then point your MCP client to:

```json
{
  "euinvoice": {
    "command": "node",
    "args": ["/path/to/euinvoice-mcp/dist/index.js"]
  }
}
```

## Usage examples

Once connected, ask your AI assistant:

> "What are the VAT rates in Germany?"

> "What e-invoicing format do I need for B2G invoices in Italy?"

> "Compare the invoicing requirements between France and Germany"

> "When does the B2B e-invoicing mandate start in Poland?"

> "What fields are required on a cross-border invoice to Spain?"

> "Explain the reverse charge mechanism for intra-EU B2B services"

## Data accuracy

The data covers current (2024/2025) rules including:

- Finland's standard rate increase to 25.5% (Sep 2024)
- Estonia's standard rate increase to 22% (Jan 2024)
- Germany's B2B e-invoicing mandate (receiving: Jan 2025, sending: 2027/2028)
- Slovakia's rate increase to 23% (2025)
- Czech Republic's merged reduced rate of 12% (2024)
- Romania's B2B clearance mandate (Jan 2024)
- France's B2B mandate timeline (Sep 2026 onwards)
- Poland's KSeF mandate (Feb 2026)

## Contributing

Contributions welcome. Areas that would benefit from help:

- Additional country-specific validation rules
- SAF-T reporting requirements
- Withholding tax rules
- VIES validation integration
- More detailed sector-specific reduced rates

## License

MIT
