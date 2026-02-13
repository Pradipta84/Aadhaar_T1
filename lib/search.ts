import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aadhaar_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

export interface SearchCriteria {
    aadhaarNumber?: string;
    name?: string;
    gender?: string;
    addressKeyword?: string;
    phoneNumber?: string;
    email?: string;
    dobFrom?: string;
    dobTo?: string;
    page?: number;
    pageSize?: number;
}

export interface SearchResult {
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Universal search function for Aadhaar details
 * Supports multiple search criteria and pagination
 */
export async function searchAadhaarDetails(criteria: SearchCriteria): Promise<SearchResult> {
    const client = await pool.connect();

    try {
        const { page = 1, pageSize = 10 } = criteria;
        const offset = (page - 1) * pageSize;

        // Build dynamic query
        let query = 'SELECT * FROM aadhaar_details WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) FROM aadhaar_details WHERE 1=1';
        const params: any[] = [];

        // Add search conditions
        if (criteria.aadhaarNumber) {
            params.push(criteria.aadhaarNumber);
            const condition = ` AND aadhaar_number = $${params.length}`;
            query += condition;
            countQuery += condition;
        }

        if (criteria.name) {
            params.push(`%${criteria.name}%`);
            const condition = ` AND LOWER(name) LIKE LOWER($${params.length})`;
            query += condition;
            countQuery += condition;
        }

        if (criteria.gender) {
            params.push(criteria.gender);
            const condition = ` AND LOWER(gender) = LOWER($${params.length})`;
            query += condition;
            countQuery += condition;
        }

        if (criteria.addressKeyword) {
            params.push(`%${criteria.addressKeyword}%`);
            const condition = ` AND LOWER(address) LIKE LOWER($${params.length})`;
            query += condition;
            countQuery += condition;
        }

        if (criteria.phoneNumber) {
            params.push(`%${criteria.phoneNumber}%`);
            const condition = ` AND phone_number LIKE $${params.length}`;
            query += condition;
            countQuery += condition;
        }

        if (criteria.email) {
            params.push(`%${criteria.email}%`);
            const condition = ` AND LOWER(email) LIKE LOWER($${params.length})`;
            query += condition;
            countQuery += condition;
        }

        if (criteria.dobFrom) {
            params.push(criteria.dobFrom);
            const condition = ` AND date_of_birth >= $${params.length}`;
            query += condition;
            countQuery += condition;
        }

        if (criteria.dobTo) {
            params.push(criteria.dobTo);
            const condition = ` AND date_of_birth <= $${params.length}`;
            query += condition;
            countQuery += condition;
        }

        // Get total count
        const countResult = await client.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / pageSize);

        // Add pagination
        query += ' ORDER BY created_at DESC';
        const paginationParams = [...params, pageSize, offset];
        query += ` LIMIT $${paginationParams.length - 1} OFFSET $${paginationParams.length}`;

        // Execute search
        const result = await client.query(query, paginationParams);

        return {
            data: result.rows,
            total,
            page,
            pageSize,
            totalPages
        };

    } catch (error) {
        console.error('Error searching Aadhaar details:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Quick search by Aadhaar number (most common use case)
 */
export async function quickSearchByAadhaar(aadhaarNumber: string) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM aadhaar_details WHERE aadhaar_number = $1',
            [aadhaarNumber]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in quick search:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Quick search by name (partial match)
 */
export async function quickSearchByName(name: string, limit: number = 10) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM aadhaar_details WHERE LOWER(name) LIKE LOWER($1) LIMIT $2',
            [`%${name}%`, limit]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in quick name search:', error);
        throw error;
    } finally {
        client.release();
    }
}

export default pool;
