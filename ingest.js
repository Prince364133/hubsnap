import fs from 'fs';
import path from 'path';

const xmlPath = 'C:/Users/hp/Desktop/explore based website/resources/temp_docx_extract/word/document.xml';
const outputPath = 'C:/Users/hp/Desktop/explore based website/src/data/tools.json';

function ingest() {
    console.log('--- Starting Ingestion Pipeline ---');

    if (!fs.existsSync(xmlPath)) {
        console.error('Error: document.xml not found at', xmlPath);
        return;
    }

    const xmlContent = fs.readFileSync(xmlPath, 'utf8');

    // Extract text from <w:t> tags
    const textMatches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (!textMatches) {
        console.error('Error: No text matches found in XML.');
        return;
    }

    const allText = textMatches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, ''));

    let tools = [];
    let currentCategory = '';
    let idCounter = 1;

    // Pattern detection:
    // 🔹 SECTION X: CATEGORY NAME
    // Tool Name — PRICING

    for (let i = 0; i < allText.length; i++) {
        const line = allText[i].trim();
        if (!line) continue;

        if (line.includes('🔹 SECTION')) {
            // Extract category name
            const parts = line.split(':');
            if (parts.length > 1) {
                currentCategory = parts[1].replace(/\(\d+–\d+\)/, '').trim();
            }
            continue;
        }

        if (line.includes('—')) {
            const parts = line.split('—');
            const name = parts[0].trim();
            const pricingStr = parts[1].trim().toUpperCase();

            let pricing_model = 'PAID';
            let badge_color = 'red';

            if (pricingStr.includes('FREE') && pricingStr.includes('PAID')) {
                pricing_model = 'FREE_PAID';
                badge_color = 'orange';
            } else if (pricingStr.includes('FREE')) {
                pricing_model = 'FREE';
                badge_color = 'green';
            }

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            tools.push({
                id: `tool-${idCounter++}`,
                name: name,
                slug: slug,
                short_description: `${name} is a powerful ${currentCategory.toLowerCase()} tool featured in our discovery platform.`,
                full_description: `${name} provides advanced capabilities for ${currentCategory.toLowerCase()} projects. It is widely used by content creators for efficient workflows.`,
                categories: [currentCategory],
                use_cases: [currentCategory],
                pricing_model: pricing_model,
                badge_color: badge_color,
                website_url: `https://www.google.com/search?q=${encodeURIComponent(name)}+AI+tool`,
                platforms_supported: ["Web", "API"],
                tags: [currentCategory, name.toLowerCase()],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(tools, null, 2));
    console.log(`--- Success: Ingested ${tools.length} tools into ${outputPath} ---`);
}

ingest();
