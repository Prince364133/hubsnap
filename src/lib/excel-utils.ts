import * as XLSX from 'xlsx';
import type { Tool } from './firestore';

/**
 * Excel Utilities for Tools Management
 * Handles template generation, export, and import of tools data
 */

// Column headers for the Excel template
const EXCEL_HEADERS = [
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
    'Locked (true/false)'
];

/**
 * Generate and download an Excel template for tools import
 */
export function downloadTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
        EXCEL_HEADERS,
        // Add sample row for reference
        [
            'ChatGPT',
            'AI conversational agent for writing, coding, and brainstorming.',
            'ChatGPT is an advanced language model developed by OpenAI. It can generate human-like text, answer questions, translate languages, and even write code.',
            'https://chat.openai.com',
            'Writing, Productivity, Coding',
            'Content Creation, Code Generation, Research',
            'FREE_PAID',
            'SUBSCRIPTION',
            'Web, App',
            '0',
            'false'
        ]
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools Template');

    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 20 },  // Name
        { wch: 40 },  // Short Description
        { wch: 60 },  // Full Description
        { wch: 30 },  // Website
        { wch: 30 },  // Categories
        { wch: 30 },  // Use Cases
        { wch: 30 },  // Pricing Model
        { wch: 30 },  // Access Type
        { wch: 20 },  // Platforms
        { wch: 10 },  // Price
        { wch: 10 }   // Locked
    ];

    // Generate file and trigger download
    XLSX.writeFile(workbook, 'tools_template.xlsx');
}

/**
 * Export current tools to Excel
 */
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
        tool.locked
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tools');

    // Set column widths
    worksheet['!cols'] = [
        { wch: 20 },
        { wch: 40 },
        { wch: 60 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 },
        { wch: 20 },
        { wch: 10 },
        { wch: 10 }
    ];

    // Generate file with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `tools_export_${timestamp}.xlsx`);
}

/**
 * Parse uploaded Excel file and convert to Tool objects
 */
export async function parseExcelFile(file: File): Promise<Partial<Tool>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                // Skip header row
                const rows = jsonData.slice(1);

                const tools: Partial<Tool>[] = rows
                    .filter(row => row[0]) // Filter out empty rows
                    .map(row => ({
                        name: row[0]?.toString() || '',
                        shortDesc: row[1]?.toString() || '',
                        fullDesc: row[2]?.toString() || '',
                        website: row[3]?.toString() || '',
                        categories: row[4]?.toString().split(',').map((c: string) => c.trim()).filter(Boolean) || [],
                        useCases: row[5]?.toString().split(',').map((u: string) => u.trim()).filter(Boolean) || [],
                        pricingModel: (row[6]?.toString() || 'FREE') as 'FREE' | 'PAID' | 'FREE_PAID',
                        accessType: (row[7]?.toString() || 'FREE') as 'FREE' | 'SUBSCRIPTION' | 'ONE_TIME_PURCHASE',
                        platforms: row[8]?.toString().split(',').map((p: string) => p.trim()).filter(Boolean) || [],
                        price: parseFloat(row[9]?.toString() || '0') || 0,
                        locked: row[10]?.toString().toLowerCase() === 'true',
                        isPublic: row[11]?.toString().toLowerCase() === 'true'
                    }));

                resolve(tools);
            } catch (error) {
                reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsBinaryString(file);
    });
}

/**
 * Excel Utilities for Guides Management
 */

// Column headers for the Guides Excel template
const GUIDE_EXCEL_HEADERS = [
    'Title',
    'Type (Freelancing Kit/Template/Blueprint)',
    'Category',
    'Content (Markdown)',
    'Difficulty (Beginner/Intermediate/Advanced)',
    'Premium (true/false)',
    'Access Type (FREE/SUBSCRIPTION/ONE_TIME_PURCHASE)',
    'Tags (comma-separated)',
    'Public (true/false)'
];

export function downloadGuideTemplate() {
    const worksheet = XLSX.utils.aoa_to_sheet([
        GUIDE_EXCEL_HEADERS,
        [
            'Freelancing Starter Kit',
            'Freelancing Kit',
            'Business',
            '# Introduction\nThis kit helps you start...',
            'Beginner',
            'false',
            'FREE',
            'freelance, business, money',
            'true'
        ]
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guides Template');
    XLSX.writeFile(workbook, 'guides_template.xlsx');
}

import type { Guide } from './firestore';

export async function parseGuidesExcelFile(file: File): Promise<Partial<Guide>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                const rows = jsonData.slice(1);

                const guides: Partial<Guide>[] = rows
                    .filter(row => row[0])
                    .map(row => ({
                        title: row[0]?.toString() || '',
                        type: (row[1]?.toString() || 'Template') as any,
                        category: row[2]?.toString() || '',
                        content: row[3]?.toString() || '',
                        difficulty: (row[4]?.toString() || 'Beginner') as any,
                        premium: row[5]?.toString().toLowerCase() === 'true',
                        accessType: (row[6]?.toString() || 'FREE') as any,
                        tags: row[7]?.toString().split(',').map((t: string) => t.trim()).filter(Boolean) || [],
                        isPublic: row[8]?.toString().toLowerCase() === 'true'
                    }));

                resolve(guides);
            } catch (error) {
                reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsBinaryString(file);
    });
}

/**
 * Validate tool data before import
 */
export function validateToolData(tool: Partial<Tool>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!tool.name || tool.name.trim() === '') {
        errors.push('Name is required');
    }

    if (!tool.website || tool.website.trim() === '') {
        errors.push('Website is required');
    } else {
        // Validate URL format
        try {
            new URL(tool.website);
        } catch {
            errors.push('Website must be a valid URL');
        }
    }

    if (!tool.categories || tool.categories.length === 0) {
        errors.push('At least one category is required');
    }

    // Validate pricing model
    const validPricingModels = ['FREE', 'PAID', 'FREE_PAID'];
    if (tool.pricingModel && !validPricingModels.includes(tool.pricingModel)) {
        errors.push('Pricing model must be FREE, PAID, or FREE_PAID');
    }

    // Validate access type
    const validAccessTypes = ['FREE', 'SUBSCRIPTION', 'ONE_TIME_PURCHASE'];
    if (tool.accessType && !validAccessTypes.includes(tool.accessType)) {
        errors.push('Access type must be FREE, SUBSCRIPTION, or ONE_TIME_PURCHASE');
    }

    // Validate price
    if (tool.price !== undefined && (isNaN(tool.price) || tool.price < 0)) {
        errors.push('Price must be a non-negative number');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Batch validate multiple tools
 */
export function validateToolsBatch(tools: Partial<Tool>[]): {
    valid: Partial<Tool>[];
    invalid: Array<{ tool: Partial<Tool>; errors: string[] }>;
} {
    const valid: Partial<Tool>[] = [];
    const invalid: Array<{ tool: Partial<Tool>; errors: string[] }> = [];

    tools.forEach(tool => {
        const validation = validateToolData(tool);
        if (validation.valid) {
            valid.push(tool);
        } else {
            invalid.push({ tool, errors: validation.errors });
        }
    });

    return { valid, invalid };
}
