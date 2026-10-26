# Security Policy

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report security issues privately via one of:

- **GitHub Security Advisories** for this repository — use *Security → Report a
  vulnerability* (preferred; it creates a private advisory and tracks the fix).
- Email the maintainer at **mmaulanayusuf777@gmail.com** with the subject
  prefix `[SECURITY] under-the-hood`.

Please include: the affected component/URL, steps to reproduce, the impact you
expect, and any suggested fix. You should receive an acknowledgement within a
few days; once a fix ships, we are happy to credit you in the advisory.

## Scope

This project is a fully static site (no server, no accounts, no data
collection). Typical in-scope issues include:

- Cross-site scripting through rendered content (e.g. the `{@html}` search
  palette pipeline).
- Supply-chain concerns in `pnpm-lock.yaml` or build tooling.
- Misleading or dangerous behavior in the deployed static output.

Out of scope: denial-of-service testing against the live deployment, social
engineering, and issues in third-party dependencies that are already tracked
by public advisories (please check `pnpm audit` first).

## Supported versions

Security fixes are applied to the `main` branch only; there are no versioned
release lines.
