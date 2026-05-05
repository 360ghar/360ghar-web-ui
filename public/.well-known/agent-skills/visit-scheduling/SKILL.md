# Visit Scheduling

Schedule property visits on 360Ghar.

## Endpoint

```
POST https://api.360ghar.com/api/v1/visits/
```

## Request Body

```json
{
  "property_id": "string",
  "scheduled_date": "YYYY-MM-DD",
  "special_requirements": "string (optional)"
}
```

## Response

Returns the created visit object with `id`, `property_id`, `scheduled_date`, `status`.

## Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/visits/` | List all visits |
| GET | `/visits/upcoming/` | List upcoming visits |
| GET | `/visits/past/` | List past visits |
| GET | `/visits/{id}` | Get visit details |
| PUT | `/visits/{id}` | Update visit |
| POST | `/visits/{id}/reschedule` | Reschedule visit |
| POST | `/visits/{id}/cancel` | Cancel visit |

## Authentication

Requires Bearer token (Supabase JWT). Obtain via:

1. Open `https://360ghar.com/mcp/login?redirect_uri=<your_callback>`
2. User authenticates with phone + password
3. Redirect includes `access_token` parameter

## Example

```bash
curl -X POST "https://api.360ghar.com/api/v1/visits/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"property_id": "abc123", "scheduled_date": "2025-06-15"}'
```
