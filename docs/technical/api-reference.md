# API Reference

The CRM Platform exposes a RESTful API documented using the OpenAPI 3.0 specification. Use this specification to generate client SDKs, power API explorers, and validate requests during integration.

## Getting Started

- **Production base URL**: `https://api.yourcompany.com/v1`
- **Development base URL**: `http://localhost:3001/api/v1`
- **Authentication**: Bearer tokens issued via the `/auth/login` endpoint.

All endpoints require a valid JWT access token unless explicitly noted.

## OpenAPI Specification

Save the following specification as `swagger.yaml` or import it directly into your preferred API tooling (Swagger UI, Postman, Insomnia, Stoplight, etc.).

```yaml
openapi: 3.0.0
info:
  title: CRM Platform API
  version: 1.0.0
  description: API for integrated CRM platform

servers:
  - url: https://api.yourcompany.com/v1
    description: Production
  - url: http://localhost:3001/api/v1
    description: Development

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Client:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
        phone:
          type: string
        company:
          type: string
        status:
          type: string
          enum: [lead, active, inactive, lost]
        assigned_to:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string

security:
  - bearerAuth: []

paths:
  /auth/login:
    post:
      summary: User login
      tags: [Authentication]
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
              required: [email, password]
      responses:
        '200':
          description: Successful login
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  user:
                    type: object
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /crm/clients:
    get:
      summary: Get all clients
      tags: [CRM]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of clients
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Client'
                  pagination:
                    type: object
                    properties:
                      page:
                        type: integer
                      limit:
                        type: integer
                      total:
                        type: integer
    post:
      summary: Create client
      tags: [CRM]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Client'
      responses:
        '201':
          description: Client created
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

## Usage Notes

- Use refresh tokens to obtain new access tokens without forcing users to re-authenticate.
- Paginated responses include a `pagination` object with `page`, `limit`, and `total` counts.
- Expand the specification with additional endpoints as modules evolve; keep schemas reusable to ensure consistency.

For a complete list of endpoints, extend this document with module-specific sections (CRM, HR, Accounting, Communications, AI) and keep the OpenAPI file version-controlled in `docs/technical/swagger.yaml` or similar for automated publishing.
