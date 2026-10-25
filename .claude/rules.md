# Claude Agent Guidelines

## Core Principles
1. **Test-Driven Development (TDD) is strictly required.**
   - Write tests BEFORE implementing features.
   - Maintain high unit test coverage (Target: 90% - 100%).
2. **Code Structure & Quality**
   - Keep nesting shallow (return early).
   - Write clean, readable, and maintainable code.
   - For Rust: Prefer static memory allocation where applicable and idiomatic, avoid unnecessary cloning.
3. **Tech Stack**
   - Frontend: TypeScript, React
   - Backend: Rust, Tauri v2
   - Testing: Vitest (TS), cargo test (Rust)
