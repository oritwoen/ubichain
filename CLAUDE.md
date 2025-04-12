# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## BUILD & TEST COMMANDS
- Build: `pnpm build`
- Run all tests: `pnpm dev`
- Run a single test: `pnpm vitest run path/to/test.ts -t "test name"`
- Dev mode with watch: `pnpm dev`

## CODE STYLE GUIDELINES
- Use 2-space indentation with semicolons
- Name variables by type: `keyPrivate`, `keyPublic` (not `privateKey`, `publicKey`)
- Document functions with JSDoc comments
- Prefer utility functions in separate modules over factory patterns
- Use TypeScript interfaces/types for all function parameters and returns
- Keep imports sorted: Node built-ins → external packages → local imports
- Write idiomatic, self-explanatory code with minimal comments
- Always include descriptive error messages in error handling
- Use pure functions where possible
- Keep each function focused on a single responsibility
- Prefer named exports over default exports except for blockchain implementations