---
id: 1
title: create-project-constitution
stage: constitution
date: 2026-01-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "governance", "standards"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - ".specify/memory/constitution.md"
tests: []
outcome: "Successfully created project constitution with TDD, Clean Code, Security, and Code Review standards"
evaluation: "Constitution template properly filled with all required principles and standards"
---

# PHR: Create Project Constitution

## Prompt Text
```
Create project organization rules and development standards for a Todo Full-Stack Web Application:

**Requirements:**
1. **Test-Driven Development (TDD)**
   - Write tests before implementation
   - Minimum 80% code coverage
   - Use pytest for backend, Jest/React Testing Library for frontend

2. **Clean Code Standards**
   - Follow Python standards (use: python-development-standards-skill)
   - TypeScript strict mode for frontend
   - Meaningful names, small functions, single responsibility
   - No code duplication

3. **Privacy & Security Policy**
   - User data isolation (each user sees only their data)
   - JWT token authentication required for all API endpoints
   - Environment variables for all secrets
   - HTTPS only in production
   - Password hashing with bcrypt (12+ rounds)
   - Rate limiting on authentication endpoints

4. **Code Review Checklist**
   - [ ] All tests passing
   - [ ] Type hints/types complete
   - [ ] Error handling implemented
   - [ ] Authentication verified
   - [ ] User data fi
```

## Response Text
Created a comprehensive constitution for the Todo Full-Stack Web Application with the following principles:
- Test-Driven Development (NON-NEGOTIABLE)
- Clean Code Standards
- Privacy & Security Policy (NON-NEGOTIABLE)
- Comprehensive Error Handling
- Type Safety & Validation
- Minimal Viable Changes

The constitution includes detailed development workflow standards, testing requirements, technology stack requirements, and governance policies.

## Summary
Successfully created a project constitution document that establishes clear development standards and governance for the Todo Full-Stack Web Application project.