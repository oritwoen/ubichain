# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## BUILD & TEST COMMANDS
- Build: `pnpm build`
- Run all tests: `pnpm dev`
- Run a single test: `pnpm vitest run path/to/test.ts -t "test name"`
- Lint code: `pnpm lint`
- Type check: `pnpm test:types`
- Run all checks: `pnpm test`

## CODE STYLE GUIDELINES
- Use 2-space indentation with semicolons
- Name variables by type: `keyPrivate`, `keyPublic` (not `privateKey`, `publicKey`)
- Document functions with JSDoc comments
- Sort imports: Node built-ins → external packages → local imports
- Use TypeScript interfaces/types for all parameters and returns
- Write idiomatic code with minimal comments
- Provide descriptive error messages in error handling
- Use pure functions wherever possible
- Follow single responsibility principle
- Prefer named exports except for blockchain implementations
- Include curve property in blockchain implementations
- Prefix 'get' for derivative functions (getKeyPublic, getAddress)
- Use 'generate' only for random creation (generateKeyPrivate)
- Follow blockchain implementation patterns in existing files