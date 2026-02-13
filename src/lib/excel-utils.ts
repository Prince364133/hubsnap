import * as XLSX from 'xlsx';
import type { Tool, Guide, Blog } from './firestore';

/**
 * Excel Utilities for Admin Management
 * Handles template generation, export, and import of data
 */

// --- Shared Helpers ---

const cleanString = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val).trim();
};

const cleanArray = (val: any): string[] => {
    if (!val) return [];
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
};

const cleanBoolean = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    return String(val).toLowerCase() === 'true';
};

const cleanDate = (val: any): Date => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
}

// --- Tools ---

const TOOL_HEADERS = [
    'Name',
    'Short Description',
    'Full Description',
    'Website',
    'Categories (comma-separated)',
    'Use Cases (comma-separated)',
    'Pricing Model (FREE/PAID/FREE_PAID)',
    'Access Type (FREE/SUBSCRIPTION/ONE_TIME_PURCHASE)',
    'Platforms (comma-separated)',
    'Price (number)',
    'Locked (true/false)',
    'Public (true/false)'
];

export function downloadTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
        TOOL_HEADERS,
        [
            'ChatGPT',
            'AI conversational agent...',
            'Full description here...',
            'https://chat.openai.com',
            'Writing, Coding',
            'Content Creation',
            'FREE_PAID',
            'SUBSCRIPTION',
            'Web',
            '0',
            'false',
            'true'
        ]
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools Template');
    XLSX.writeFile(workbook, 'tools_template.xlsx');
}

export function exportToolsToExcel(tools: Tool[]) {
    const data = tools.map(tool => [
        tool.name,
        tool.shortDesc || '',
        tool.fullDesc || '',
        tool.website,
        tool.categories?.join(', ') || '',
        tool.useCases?.join(', ') || '',
        tool.pricingModel,
        tool.accessType,
        tool.platforms?.join(', ') || '',
        tool.price,
        tool.locked,
        tool.isPublic
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([TOOL_HEADERS, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');
    XLSX.writeFile(workbook, `tools_export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export async function parseExcelFile(file: File): Promise<Partial<Tool>[]> {
    return parseExcelGeneric<Tool>(file, (row) => ({
        name: cleanString(row[0]),
        shortDesc: cleanString(row[1]),
        fullDesc: cleanString(row[2]),
        website: cleanString(row[3]),
        categories: cleanArray(row[4]),
        useCases: cleanArray(row[5]),
        pricingModel: (cleanString(row[6]) || 'FREE') as any,
        accessType: (cleanString(row[7]) || 'FREE') as any,
        platforms: cleanArray(row[8]),
        price: parseFloat(cleanString(row[9])) || 0,
        locked: cleanBoolean(row[10]),
        isPublic: cleanBoolean(row[11])
    }));
}

export function validateToolsBatch(tools: Partial<Tool>[]): {
    valid: Partial<Tool>[];
    invalid: Array<{ tool: Partial<Tool>; errors: string[] }>;
} {
    const valid: Partial<Tool>[] = [];
    const invalid: Array<{ tool: Partial<Tool>; errors: string[] }> = [];

    tools.forEach(tool => {
        const errors: string[] = [];
        if (!tool.name) errors.push('Name is required');
        if (!tool.website) errors.push('Website is required');

        if (errors.length === 0) valid.push(tool);
        else invalid.push({ tool, errors });
    });

    return { valid, invalid };
}

// --- Guides ---

const GUIDE_HEADERS = [
    'Title',
    'Type',
    'Category',
    'Content',
    'Difficulty',
    'Premium',
    'Access Type',
    'Tags',
    'Public'
];

export function downloadGuideTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
        GUIDE_HEADERS,
        [
            'Freelancing Kit',
            'Template',
            'Business',
            '# Markdown Content',
            'Beginner',
            'false',
            'FREE',
            'money, business',
            'true'
        ]
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guides Template');
    XLSX.writeFile(workbook, 'guides_template.xlsx');
}

export async function parseGuidesExcelFile(file: File): Promise<Partial<Guide>[]> {
    return parseExcelGeneric<Guide>(file, (row) => ({
        title: cleanString(row[0]),
        type: (cleanString(row[1]) || 'Template') as any,
        category: cleanString(row[2]),
        content: cleanString(row[3]),
        difficulty: (cleanString(row[4]) || 'Beginner') as any,
        premium: cleanBoolean(row[5]),
        accessType: (cleanString(row[6]) || 'FREE') as any,
        tags: cleanArray(row[7]),
        isPublic: cleanBoolean(row[8])
    }));
}

// --- Blogs ---

const BLOG_HEADERS = [
    'Title',
    'Slug',
    'Excerpt',
    'Content',
    'Cover Image',
    'Category',
    'Tags',
    'Keywords',
    'Author Name',
    'Read Time',
    'Published',
    'Featured'
];

export function downloadBlogTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
        BLOG_HEADERS,
        [
            'My First Blog',
            'my-first-blog',
            'A short summary...',
            '# Hello World\nThis is markdown content.',
            'https://example.com/image.jpg',
            'Technology',
            'tech, coding',
            'seo, google',
            'HubSnap Team',
            '5',
            'false',
            'false'
        ]
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Blog Template');
    XLSX.writeFile(workbook, 'blog_template.xlsx');
}

export async function parseBlogExcelFile(file: File): Promise<Partial<Blog>[]> {
    return parseExcelGeneric<Blog>(file, (row) => {
        const title = cleanString(row[0]);
        const content = cleanString(row[3]);

        return {
            title,
            slug: cleanString(row[1]) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            excerpt: cleanString(row[2]),
            content,
            coverImage: cleanString(row[4]),
            category: cleanString(row[5]) || 'Uncategorized',
            tags: cleanArray(row[6]),
            seo: {
                keywords: cleanArray(row[7]),
                metaTitle: title,
                metaDescription: cleanString(row[2])
            },
            author: {
                id: 'admin',
                name: cleanString(row[8]) || 'HubSnap Team'
            },
            readTime: parseInt(cleanString(row[9])) || 5,
            published: cleanBoolean(row[10]),
            featured: cleanBoolean(row[11]),
            views: 0,
            likes: 0,
            commentsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        } as any;
    });
}

// --- Generic Parser ---

function parseExcelGeneric<T>(
    file: File,
    mapper: (row: any[]) => Partial<T>
): Promise<Partial<T>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                // Skip header (row 0) and map rest
                const result = jsonData.slice(1)
                    .filter(row => row && row.length > 0 && row.some((cell: any) => !!cell))
                    .map(mapper);

                resolve(result);
            } catch (error) {
                reject(new Error('Failed to parse Excel: ' + (error as Error).message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
    });
}
