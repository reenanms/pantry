# Coding Conventions

This document defines the coding standards and organizational structure for the application.

## Directory Structure

The repository is organized into the following main directories:

- `web/`: Frontend application for managing the system.
- `api/`: Backend application.
- `docs/`: All documentation (using Markdown `.md` files).

### Internal Project Structure
Each project (e.g., `web/`, `api/`) should follow this internal structure:
- `src/`: Source code.
- `tst/`: Test suites.
- `scripts/`: Automation and utility scripts.

## Language

- **Everything in English**: All source code (variables, functions, classes), commit messages, comments, and documentation must be written in English.

## Best Practices

To ensure high-quality, maintainable, and readable code, the following principles must be followed:

### Principles
- **SOLID**: Apply SOLID principles to software design.
- **DRY (Don't Repeat Yourself)**: Avoid duplication by abstracting common logic.

### Readability and Flow
- **Early Returns**: Use early returns to handle edge cases or error conditions at the beginning of functions. This reduces indentation and makes the main logic easier to follow.
- **Main Flow Visibility**: The "happy path" or main execution flow should be clearly visible.
- **Exceptions for Deviations**: Raise exceptions when the execution goes outside the expected flow. This helps in separating error handling from business logic and improves readability.

### Functions
- **Small Functions**: Keep functions small and focused on a single responsibility.
- **Meaningful Naming**: Use names that are easy to understand and clearly describe the function's purpose.
