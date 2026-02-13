# Aadhaar Database Search Examples

This document provides examples of how to search for Aadhaar details in the PostgreSQL database.

## Quick Start

### Run the Demo Script

To see all search examples in action:

```bash
npx tsx scripts/search-examples.ts
```

## Available Search Methods

### 1. **Search by Aadhaar Number** (Exact Match)

```typescript
import { quickSearchByAadhaar } from './lib/search';

const aadhaar = '123456789012';
const result = await quickSearchByAadhaar(aadhaar);
console.log(result);
```

**SQL Query:**
```sql
SELECT * FROM aadhaar_details WHERE aadhaar_number = '123456789012';
```

---

### 2. **Search by Name** (Partial Match, Case-Insensitive)

```typescript
import { quickSearchByName } from './lib/search';

const results = await quickSearchByName('John', 10);
console.log(results);
```

**SQL Query:**
```sql
SELECT * FROM aadhaar_details 
WHERE LOWER(name) LIKE LOWER('%John%') 
LIMIT 10;
```

---

### 3. **Search by Gender**

```typescript
import { searchAadhaarDetails } from './lib/search';

const results = await searchAadhaarDetails({ 
    gender: 'Male' 
});
console.log(results.data);
```

**SQL Query:**
```sql
SELECT * FROM aadhaar_details 
WHERE LOWER(gender) = LOWER('Male');
```

---

### 4. **Search by Address** (Partial Match)

```typescript
import { searchAadhaarDetails } from './lib/search';

const results = await searchAadhaarDetails({ 
    addressKeyword: 'Mumbai' 
});
console.log(results.data);
```

**SQL Query:**
```sql
SELECT * FROM aadhaar_details 
WHERE LOWER(address) LIKE LOWER('%Mumbai%');
```

---

### 5. **Search by Date of Birth Range**

```typescript
import { searchAadhaarDetails } from './lib/search';

const results = await searchAadhaarDetails({
    dobFrom: '1990-01-01',
    dobTo: '2000-12-31'
});
console.log(results.data);
```

**SQL Query:**
```sql
SELECT * FROM aadhaar_details 
WHERE date_of_birth BETWEEN '1990-01-01' AND '2000-12-31';
```

---

### 6. **Advanced Multi-Criteria Search**

```typescript
import { searchAadhaarDetails } from './lib/search';

const results = await searchAadhaarDetails({
    gender: 'Female',
    addressKeyword: 'Delhi',
    dobFrom: '1995-01-01',
    dobTo: '2005-12-31',
    page: 1,
    pageSize: 10
});

console.log(`Found ${results.total} records`);
console.log(`Page ${results.page} of ${results.totalPages}`);
console.log(results.data);
```

---

### 7. **Search with Pagination**

```typescript
import { searchAadhaarDetails } from './lib/search';

// Get page 2 with 5 results per page
const results = await searchAadhaarDetails({
    page: 2,
    pageSize: 5
});

console.log(`Showing ${results.data.length} of ${results.total} records`);
```

---

## Using in API Routes

### Example API Route (Next.js)

Create `app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { searchAadhaarDetails } from '@/lib/search';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        
        const criteria = {
            aadhaarNumber: searchParams.get('aadhaar') || undefined,
            name: searchParams.get('name') || undefined,
            gender: searchParams.get('gender') || undefined,
            addressKeyword: searchParams.get('address') || undefined,
            phoneNumber: searchParams.get('phone') || undefined,
            email: searchParams.get('email') || undefined,
            dobFrom: searchParams.get('dobFrom') || undefined,
            dobTo: searchParams.get('dobTo') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            pageSize: parseInt(searchParams.get('pageSize') || '10'),
        };
        
        const results = await searchAadhaarDetails(criteria);
        
        return NextResponse.json({
            success: true,
            ...results
        });
        
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
```

### Using the API

```bash
# Search by name
curl "http://localhost:3000/api/search?name=John"

# Search by Aadhaar number
curl "http://localhost:3000/api/search?aadhaar=123456789012"

# Advanced search with pagination
curl "http://localhost:3000/api/search?gender=Male&address=Mumbai&page=1&pageSize=10"
```

---

## Raw SQL Examples

### Search by Phone Number

```sql
SELECT * FROM aadhaar_details 
WHERE phone_number LIKE '%9876%';
```

### Search by Email Domain

```sql
SELECT * FROM aadhaar_details 
WHERE email LIKE '%@gmail.com';
```

### Get Records Created in Last 7 Days

```sql
SELECT * FROM aadhaar_details 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Count Records by Gender

```sql
SELECT gender, COUNT(*) as count 
FROM aadhaar_details 
GROUP BY gender;
```

### Full-Text Search (PostgreSQL)

```sql
SELECT * FROM aadhaar_details 
WHERE to_tsvector('english', name || ' ' || address) @@ to_tsquery('english', 'Mumbai & John');
```

---

## Search Criteria Interface

The `searchAadhaarDetails` function accepts the following criteria:

```typescript
interface SearchCriteria {
    aadhaarNumber?: string;      // Exact match
    name?: string;                // Partial match (LIKE)
    gender?: string;              // Exact match (case-insensitive)
    addressKeyword?: string;      // Partial match (LIKE)
    phoneNumber?: string;         // Partial match (LIKE)
    email?: string;               // Partial match (LIKE)
    dobFrom?: string;             // Date range start (YYYY-MM-DD)
    dobTo?: string;               // Date range end (YYYY-MM-DD)
    page?: number;                // Page number (default: 1)
    pageSize?: number;            // Results per page (default: 10)
}
```

---

## Database Schema

```sql
CREATE TABLE aadhaar_details (
    id SERIAL PRIMARY KEY,
    aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(15),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aadhaar_number ON aadhaar_details(aadhaar_number);
```

---

## Performance Tips

1. **Use Indexes**: The `aadhaar_number` field has an index for fast lookups
2. **Limit Results**: Always use pagination for large datasets
3. **Specific Queries**: Prefer exact matches (aadhaar_number) over LIKE queries when possible
4. **Connection Pooling**: The app uses connection pooling for better performance

---

## Testing

Verify your database has test data:

```bash
npx tsx scripts/verify-test-data.ts
```

Add test data:

```bash
npx tsx scripts/add-test-data.ts
```

---

## Common Use Cases

### 1. Lookup by Aadhaar Card
```typescript
const person = await quickSearchByAadhaar('123456789012');
```

### 2. Find People in a City
```typescript
const results = await searchAadhaarDetails({ addressKeyword: 'Mumbai' });
```

### 3. Find People by Age Range
```typescript
const results = await searchAadhaarDetails({
    dobFrom: '1990-01-01',
    dobTo: '1995-12-31'
});
```

### 4. Search and Display Results
```typescript
const results = await searchAadhaarDetails({ name: 'John', page: 1, pageSize: 10 });

results.data.forEach(person => {
    console.log(`${person.name} - ${person.aadhaar_number}`);
});

console.log(`Showing page ${results.page} of ${results.totalPages}`);
console.log(`Total matches: ${results.total}`);
```

---

## Need Help?

- Check [README.md](./README.md) for project setup
- Review [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing information
- See [scripts/search-examples.ts](./scripts/search-examples.ts) for complete working examples
