# Roadmap

## v0.2 — Invoice Generation
- [ ] `generate_invoice` tool — generate compliant UBL 2.1 / CII XML from structured input
- [ ] `generate_invoice_pdf` — PDF rendering of generated invoices
- [ ] Country-specific validation before generation
- [ ] Template support (Factur-X, XRechnung, FatturaPA wrappers)

## v0.3 — Validation & Linting
- [ ] `validate_invoice_xml` — validate existing UBL/CII files against EN 16931
- [ ] Schematron rule checking
- [ ] Human-readable error messages

## Ideas
- Peppol network lookup (participant IDs)
- Exchange rate integration (ECB rates for multi-currency invoices)
- Invoice format conversion (UBL ↔ CII)
