# Future Development Tasks (Backlog)

This document contains a list of future tasks, features, and technical debt to be addressed in upcoming development cycles.

## Integrations
- [ ] **Gmail OAuth Integration**: Implement the full OAuth 2.0 flow for Gmail integration.
  - Set up Google Cloud Console project and obtain Client ID and Client Secret.
  - Implement backend callback endpoints to handle the OAuth redirect and token exchange.
  - Securely store refresh tokens.
  - Update the frontend to handle the redirect and success/error states.

## Testing & Quality Assurance
- [ ] Write end-to-end tests for critical CRM workflows (e.g., lead creation, deal stage updates).
- [ ] Implement unit tests for AI insight generation, scoring algorithms, and financial forecasting.

## Deployment & DevOps
- [ ] Set up CI/CD pipelines (e.g., GitHub Actions) for automated testing and deployment.
- [ ] Configure production environment variables and secrets management.
- [ ] Optimize Docker images for production (multi-stage builds, smaller footprint).

## UI/UX Polish
- [ ] Implement a comprehensive dark/light mode toggle that persists across all components.
- [ ] Add more micro-animations for interactive elements (e.g., hover states on cards, smooth transitions for modals).
