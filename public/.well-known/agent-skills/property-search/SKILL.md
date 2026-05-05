# Property Search

Search verified property listings on 360Ghar.

## Endpoint

```
GET https://api.360ghar.com/api/v1/properties/
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Text search query (e.g., "2 BHK in DLF Phase 3") |
| `city` | string | City filter (e.g., "gurgaon") |
| `purpose` | string | "buy", "rent", or "pg" |
| `property_type[]` | string[] | "apartment", "villa", "builder_floor", "plot", "penthouse", "studio" |
| `price_min` | number | Minimum price in INR |
| `price_max` | number | Maximum price in INR |
| `bedrooms_min` | number | Minimum bedrooms |
| `bedrooms_max` | number | Maximum bedrooms |
| `amenities[]` | string[] | Amenity filters |
| `sort_by` | string | "price_asc", "price_desc", "newest" |

## Response

Returns a paginated JSON array of property objects with fields: `id`, `title`, `price`, `locality`, `bedrooms`, `bathrooms`, `area`, `images`, `virtual_tour_url`.

## Example

```bash
curl "https://api.360ghar.com/api/v1/properties/?city=gurgaon&purpose=rent&property_type[]=apartment&bedrooms_min=2&price_max=35000"
```

## Authentication

Public endpoint. No authentication required for basic search.
