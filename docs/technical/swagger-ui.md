# Swagger UI quick start

Install `swagger-ui-express` (or serve the static bundle) in the backend, then mount it to an endpoint with the generated spec:

```ts
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
const spec = YAML.load('swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
```

Run the backend and open `http://localhost:3000/api/docs` to browse the interactive API documentation.
