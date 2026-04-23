# HNG14 Stage 2 Backend task

Intelligence Query Engine Assessment.

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
npx tsx src/scripts/seed.ts
npm run dev
```

Base URL: <http://localhost:5000>

## Parsing Approach

### How it works

- Convert the query to lowercase.
- Check for specific keywords.
- Map those keywords to Prisma filters.
- Return matching profiles with pagination.

### Supported keywords and mapping

| Keyword | Map |
| - | - |
| male / males | `gender = "male"` |
| female / females | `gender = "female"` |
| young | age 16–24 |
| teenager / teen | `age_group = "teenager"` |
| adult | `age_group = "adult"` |
| senior | `age_group = "senior"` |
| child | `age_group = "child"` |
| `above 30, over 25` | min_age = 30 |
| `below 40, under 40` | max_age = 40 |
| `nigeria, kenya, ghana, etc.` | `country_id = "NG"`, `"KE"`, etc." |

### Working example

- young males from nigeria
- females above 30
- adult males from kenya
- teenagers from ghana

### Limitations

- Only supports basic keyword combinations (AND logic)
- Does not support OR conditions, negative("not male"), or complex statements
- Country detection works only for common African + a few international coutries
