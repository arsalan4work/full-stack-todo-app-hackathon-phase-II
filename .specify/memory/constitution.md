<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Added sections: Test-Driven Development, Clean Code Standards, Privacy & Security Policy, Code Review Checklist
Removed sections: None
Templates requiring updates: N/A
Follow-up TODOs: None
-->
# Todo Full-Stack Web Application Constitution

## Core Principles

### Test-Driven Development (NON-NEGOTIABLE)
All tests must be written before implementation code. A minimum of 80% code coverage is required for all code submissions. Backend tests use pytest, frontend tests use Jest/React Testing Library. The Red-Green-Refactor cycle is strictly enforced: write failing test → implement code to pass test → refactor as needed.

### Clean Code Standards
All code must follow established standards: Python code follows PEP 8 and modern Python conventions with proper type hints, TypeScript code uses strict mode with comprehensive type definitions. Functions must have single responsibility, use meaningful names, and avoid code duplication. Code must be self-documenting through clear naming and small, focused functions.

### Privacy & Security Policy (NON-NEGOTIABLE)
User data isolation is mandatory - each user can only access their own data. JWT token authentication is required for all API endpoints. All secrets must be stored in environment variables. Production deployments must use HTTPS only. Passwords must be hashed with bcrypt (12+ rounds minimum). Rate limiting is required on authentication endpoints to prevent abuse.

### Comprehensive Error Handling
All code must implement proper error handling with appropriate HTTP status codes. Error responses must be consistent and informative without exposing internal system details. Every API endpoint must handle expected error cases and return appropriate error responses. Client-side error handling must provide user-friendly messages.

### Type Safety & Validation
All API requests and responses must be validated using Pydantic models on the backend and TypeScript interfaces on the frontend. Input validation must occur at system boundaries. Type hints are mandatory for all Python functions and TypeScript code must use strict typing to prevent runtime errors.

### Minimal Viable Changes
All code submissions must follow the smallest viable change principle. No unrelated refactoring or "improvements" should be included in feature pull requests. Changes must be focused and testable. Unrelated changes should be submitted as separate pull requests to maintain clarity and reviewability.

## Development Workflow Standards

### Code Review Checklist
All pull requests must pass the following checklist before merging:
- [ ] All tests passing (backend and frontend)
- [ ] Type hints/types complete and correct
- [ ] Error handling implemented for all code paths
- [ ] Authentication verified for all API endpoints
- [ ] User data isolation confirmed (users only see their data)
- [ ] Security best practices followed
- [ ] Code duplication eliminated
- [ ] Performance considerations addressed
- [ ] Documentation updated if applicable

### Testing Requirements
- Backend: pytest with minimum 80% coverage
- Frontend: Jest/React Testing Library with minimum 80% coverage
- Integration tests for API endpoints
- Unit tests for business logic
- End-to-end tests for critical user flows
- Security tests for authentication and authorization

### Technology Stack Requirements
- Backend: Python 3.10+, FastAPI, SQLModel, Neon PostgreSQL
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Authentication: JWT tokens with refresh mechanism
- Database: SQLModel with proper relationships and constraints
- Testing: pytest (backend), Jest/React Testing Library (frontend)

## Governance

This constitution supersedes all other development practices and standards within the project. All code submissions must comply with these principles. Amendments to this constitution require explicit documentation, team approval, and migration planning for existing code. All pull requests and code reviews must verify compliance with these principles. Complexity must be justified with clear business value. New features must include appropriate tests, documentation, and security considerations.

**Version**: 1.0.0 | **Ratified**: 2026-01-05 | **Last Amended**: 2026-01-05