import json
import random
from datetime import datetime

# Load existing tools
with open('data/tools.json', 'r', encoding='utf-8') as f:
    existing_tools = json.load(f)

print(f"Current tools count: {len(existing_tools)}")

# Expanded company data
companies = [
    {'name': 'OpenAI', 'founded': 2015}, {'name': 'Anthropic', 'founded': 2021},
    {'name': 'Google', 'founded': 1998}, {'name': 'Microsoft', 'founded': 1975},
    {'name': 'Meta', 'founded': 2004}, {'name': 'Stability AI', 'founded': 2020},
    {'name': 'Midjourney Inc', 'founded': 2021}, {'name': 'Runway ML', 'founded': 2018},
    {'name': 'Jasper AI', 'founded': 2021}, {'name': 'Copy.ai', 'founded': 2020},
    {'name': 'Writesonic', 'founded': 2021}, {'name': 'Descript', 'founded': 2017},
    {'name': 'Synthesia', 'founded': 2017}, {'name': 'ElevenLabs', 'founded': 2022},
    {'name': 'Adobe', 'founded': 1982}, {'name': 'Canva', 'founded': 2012},
    {'name': 'Notion Labs', 'founded': 2016}, {'name': 'Grammarly', 'founded': 2009},
    {'name': 'HubSpot', 'founded': 2006}, {'name': 'Semrush', 'founded': 2008},
    {'name': 'Salesforce', 'founded': 1999}, {'name': 'IBM', 'founded': 1911},
    {'name': 'Amazon', 'founded': 1994}, {'name': 'Oracle', 'founded': 1977},
    {'name': 'SAP', 'founded': 1972}, {'name': 'Atlassian', 'founded': 2002},
    {'name': 'Zoom', 'founded': 2011}, {'name': 'Slack', 'founded': 2013},
    {'name': 'Figma', 'founded': 2012}, {'name': 'Webflow', 'founded': 2013}
]

# Massive tool expansion across all categories
tool_categories = {
    'Text Generation': {
        'tools': [
            'Bard AI', 'Bing Chat', 'YouChat', 'Perplexity Pro', 'Phind AI', 'Chatsonic Pro',
            'Claude Pro', 'GPT-4 Turbo', 'Llama 2 Chat', 'Falcon AI', 'Vicuna', 'Alpaca',
            'Dolly', 'StableLM', 'Bloom', 'OPT', 'FLAN-T5', 'T5', 'BERT', 'RoBERTa',
            'XLNet', 'ELECTRA', 'ALBERT', 'DistilBERT', 'MobileBERT', 'TinyBERT',
            'Megatron', 'GPT-J', 'GPT-NeoX', 'BLOOM-176B', 'Chinchilla', 'Gopher',
            'LaMDA', 'PaLM', 'Minerva', 'Codex', 'InstructGPT', 'ChatGPT Plus',
            'GPT-4 Vision', 'Gemini Ultra', 'Gemini Pro', 'Gemini Nano', 'Claude Instant',
            'Claude 2', 'Claude 2.1', 'Pi by Inflection', 'Character AI Plus', 'Replika Pro'
        ],
        'use_cases': ['Content Writing', 'Copywriting', 'Blog Posts', 'Social Media', 'Email Marketing', 'SEO Content'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Image Generation': {
        'tools': [
            'DALL-E 2', 'Stable Diffusion XL', 'Stable Diffusion 2.1', 'Stable Diffusion 1.5',
            'Midjourney V6', 'Midjourney V5', 'Midjourney V4', 'Leonardo Phoenix', 'Leonardo Alchemy',
            'Ideogram AI', 'Playground V2', 'BlueWillow AI', 'DreamStudio Pro', 'Craiyon Pro',
            'NightCafe Creator', 'Artbreeder Pro', 'Deep Dream Pro', 'Wombo Dream Pro', 'StarryAI Pro',
            'Fotor AI Pro', 'Pixlr AI Pro', 'Photoleap Pro', 'Lensa AI Pro', 'Remini Pro',
            'PicsArt AI', 'Prisma Pro', 'Meitu AI', 'BeautyPlus Pro', 'FaceApp Pro', 'Reface Pro',
            'Avatarify Pro', 'MyHeritage AI', 'DeepNostalgia Pro', 'Rosebud AI Pro', 'Generated Photos Pro',
            'Artflow AI Pro', 'Hotpot AI Pro', 'Designify Pro', 'Remove.bg Pro', 'Cleanup.pictures Pro',
            'Magic Eraser Pro', 'Photor Pro', 'Cutout.Pro Premium', 'Slazzer Pro', 'Unscreen Pro',
            'Kaleido AI Pro', 'Deep Art Effects Pro', 'Pikazo Pro', 'Neural.love Pro'
        ],
        'use_cases': ['Art Generation', 'Photo Editing', 'Design', 'Marketing Visuals', 'Social Media Graphics'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Video Editing': {
        'tools': [
            'Runway Gen-3', 'Pika 1.0', 'Sora Beta', 'HeyGen Pro', 'Synthesia Enterprise',
            'D-ID Studio', 'Elai.io Pro', 'Lumen5 Pro', 'Kapwing Pro', 'VEED.io Pro',
            'Clipchamp Premium', 'FlexClip Pro', 'Animoto Pro', 'Biteable Pro', 'Powtoon Pro',
            'Vyond Studio', 'Renderforest Pro', 'Moovly Pro', 'Wideo Pro', 'Animaker Pro',
            'Toonly Pro', 'Doodly Pro', 'VideoScribe Pro', 'Explaindio Pro', 'Camtasia Studio',
            'Filmora Pro', 'Shotcut Pro', 'OpenShot Pro', 'Kdenlive Pro', 'Lightworks Pro',
            'HitFilm Pro', 'Magisto Pro', 'Quik Pro', 'Splice Pro', 'KineMaster Pro',
            'PowerDirector Pro', 'VivaVideo Pro', 'FilmoraGo Pro', 'Adobe Rush Pro', 'LumaFusion Pro',
            'iMovie Pro', 'WeVideo Pro', 'InVideo Studio Pro', 'Pictory AI Pro', 'Descript Video Pro'
        ],
        'use_cases': ['Video Creation', 'Video Editing', 'Animation', 'Explainer Videos', 'Social Media Videos'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Audio & Voice': {
        'tools': [
            'ElevenLabs Pro', 'Murf AI Pro', 'Play.ht Pro', 'Resemble AI Pro', 'WellSaid Labs Pro',
            'Speechify Premium', 'Natural Reader Pro', 'Amazon Polly Pro', 'Google TTS Pro', 'Microsoft Azure TTS Pro',
            'IBM Watson TTS Pro', 'Replica Studios Pro', 'Respeecher Pro', 'iSpeech Pro', 'Voicemod Pro',
            'CereProc Pro', 'Acapela Pro', 'ReadSpeaker Pro', 'Nuance Pro', 'Lovo AI Pro',
            'Modulate Pro', 'Altered AI Pro', 'Veritone Voice Pro', 'Aflorithmic Pro', 'Coqui Pro',
            'Tortoise TTS Pro', 'Bark Pro', 'AudioCraft Pro', 'MusicGen Pro', 'Riffusion Pro',
            'Mubert Pro', 'AIVA Pro', 'Amper Music Pro', 'Soundraw Pro', 'Boomy Pro',
            'Loudly Pro', 'Beatoven.ai Pro', 'Ecrett Music Pro', 'Soundful Pro', 'Splash Pro',
            'Jukebox Pro', 'MuseNet Pro', 'Google Magenta Pro', 'LANDR Pro', 'iZotope Pro'
        ],
        'use_cases': ['Voice Synthesis', 'Text-to-Speech', 'Music Generation', 'Audio Editing', 'Podcasting'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'SEO & Marketing': {
        'tools': [
            'Surfer SEO Pro', 'Semrush Pro', 'Ahrefs Pro', 'Moz Pro Plus', 'Clearscope Pro',
            'MarketMuse Pro', 'Frase Pro', 'NeuralText Pro', 'Outranking Pro', 'Scalenut Pro',
            'GrowthBar Pro', 'LongShot AI Pro', 'ContentBot Pro', 'SEO.ai Pro', 'RankIQ Pro',
            'Page Optimizer Pro Plus', 'Cora Pro', 'Screaming Frog Pro', 'DeepCrawl Pro',
            'Sitebulb Pro', 'OnCrawl Pro', 'Botify Pro', 'Conductor Pro', 'BrightEdge Pro',
            'seoClarity Pro', 'Searchmetrics Pro', 'SE Ranking Pro', 'Serpstat Pro', 'SpyFu Pro',
            'Mangools Pro', 'Ubersuggest Pro', 'AnswerThePublic Pro', 'AlsoAsked Pro', 'Keywords Everywhere Pro',
            'SEOquake Pro', 'MozBar Pro', 'Ahrefs Toolbar Pro', 'Marketo Pro', 'Pardot Pro',
            'ActiveCampaign Pro', 'Mailchimp Premium', 'Constant Contact Pro', 'GetResponse Pro', 'AWeber Pro',
            'ConvertKit Pro', 'Drip Pro', 'Klaviyo Pro', 'Omnisend Pro', 'Sendinblue Pro'
        ],
        'use_cases': ['SEO Optimization', 'Keyword Research', 'Content Strategy', 'Email Marketing', 'Analytics'],
        'pricing': ['PAID', 'FREE_PAID']
    },
    'Code & Development': {
        'tools': [
            'GitHub Copilot Pro', 'Tabnine Pro', 'Codeium Pro', 'Amazon CodeWhisperer Pro', 'Replit Ghostwriter Pro',
            'Cursor Pro', 'Sourcegraph Cody Pro', 'Phind Pro', 'Gemini Code Assist Pro', 'CodeT5 Pro',
            'CodeGen Pro', 'AlphaCode Pro', 'PolyCoder Pro', 'CodeBERT Pro', 'GraphCodeBERT Pro',
            'UniXcoder Pro', 'CodeRL Pro', 'CERT Pro', 'Aider Pro', 'Continue.dev Pro',
            'Refact.ai Pro', 'Mutable AI Pro', 'Mintlify Pro', 'Stenography Pro', 'Buildt Pro',
            'Debuild Pro', 'v0.dev Pro', 'Galileo AI Pro', 'Uizard Pro', 'Figma Dev Mode',
            'Framer AI Pro', 'Dora AI Pro', 'Telepor AI Pro', 'Quest AI Pro', 'Anima Pro',
            'Locofy Pro', 'Bifrost Pro', 'Kombai Pro', 'Screenshot to Code Pro', 'Pix2Code Pro',
            'Sketch2Code Pro', 'Fronty Pro', 'Teleporthq Pro', 'Builder.io Pro', 'Webflow AI Pro'
        ],
        'use_cases': ['Code Generation', 'Code Completion', 'Debugging', 'Code Review', 'Documentation'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Data Analysis': {
        'tools': [
            'Tableau AI Pro', 'Power BI AI Pro', 'Looker Pro', 'Qlik Sense Pro', 'Domo Pro',
            'Sisense Pro', 'Thoughtspot Pro', 'Mode Analytics Pro', 'Metabase Pro', 'Redash Pro',
            'Superset Pro', 'Grafana Pro', 'DataRobot Pro', 'H2O.ai Pro', 'RapidMiner Pro',
            'KNIME Pro', 'Alteryx Pro', 'Dataiku Pro', 'Domino Data Lab Pro', 'Databricks Pro',
            'Snowflake Pro', 'BigQuery ML Pro', 'Azure ML Pro', 'AWS SageMaker Pro', 'Google Vertex AI Pro',
            'IBM Watson Studio Pro', 'Oracle ML Pro', 'SAP Analytics Cloud Pro', 'MicroStrategy Pro',
            'Yellowfin BI Pro', 'Zoho Analytics Pro', 'Klipfolio Pro', 'Grow Pro', 'Chartio Pro',
            'Periscope Data Pro', 'Holistics Pro', 'GoodData Pro', 'Birst Pro', 'Pentaho Pro',
            'TIBCO Spotfire Pro', 'QlikView Pro', 'Cognos Analytics Pro', 'Board Pro', 'Jedox Pro'
        ],
        'use_cases': ['Data Visualization', 'Business Intelligence', 'Predictive Analytics', 'Machine Learning'],
        'pricing': ['PAID', 'FREE_PAID']
    },
    'Productivity': {
        'tools': [
            'Zapier Pro', 'Make Pro', 'n8n Pro', 'Automate.io Pro', 'Workato Pro',
            'Tray.io Pro', 'Pipedream Pro', 'Parabola Pro', 'Bardeen Pro', 'Axiom Pro',
            'Browse AI Pro', 'Octoparse Pro', 'ParseHub Pro', 'Import.io Pro', 'Apify Pro',
            'Diffbot Pro', 'Scrapy Cloud Pro', 'Bright Data Pro', 'ScrapingBee Pro', 'ScrapeStack Pro',
            'Notion Pro', 'Coda Pro', 'Airtable Pro', 'Monday.com Pro', 'ClickUp Pro',
            'Asana Pro', 'Trello Pro', 'Jira Pro', 'Linear Pro', 'Height Pro',
            'Shortcut Pro', 'Basecamp Pro', 'Wrike Pro', 'Smartsheet Pro', 'Teamwork Pro',
            'Podio Pro', 'Zoho Projects Pro', 'Microsoft Project Pro', 'Confluence Pro', 'Slite Pro',
            'Nuclino Pro', 'Tettra Pro', 'Document360 Pro', 'GitBook Pro', 'ReadMe Pro'
        ],
        'use_cases': ['Workflow Automation', 'Task Management', 'Project Management', 'Documentation'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Design': {
        'tools': [
            'Canva Pro', 'Adobe Firefly Pro', 'Figma AI Pro', 'Framer Pro', 'Uizard Pro',
            'Galileo AI Pro', 'Dora AI Pro', 'Relume Pro', 'Magician Pro', 'Beautiful.ai Pro',
            'Pitch Pro', 'Gamma Pro', 'Tome Pro', 'Decktopus Pro', 'Slidebean Pro',
            'Visme Pro', 'Prezi Pro', 'Genially Pro', 'Haiku Deck Pro', 'Emaze Pro',
            'Zoho Show Pro', 'Google Slides AI Pro', 'Microsoft Designer Pro', 'Crello Pro', 'Stencil Pro',
            'Snappa Pro', 'Easil Pro', 'RelayThat Pro', 'Desygner Pro', 'VistaCreate Pro',
            'Piktochart Pro', 'Infogram Pro', 'Venngage Pro', 'Easelly Pro', 'Lucidpress Pro',
            'Marq Pro', 'Design Wizard Pro', 'Bannersnack Pro', 'Creatopy Pro', 'Bannerflow Pro',
            'Celtra Pro', 'Sizmek Pro', 'Flashtalking Pro', 'Thunder Pro', 'Adform Pro'
        ],
        'use_cases': ['Graphic Design', 'Presentation Design', 'UI/UX Design', 'Branding', 'Advertising'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Customer Service': {
        'tools': [
            'Zendesk AI Pro', 'Intercom Pro', 'Drift Pro', 'LivePerson Pro', 'Ada Pro',
            'Yellow.ai Enterprise', 'Boost.ai Enterprise', 'Haptik Enterprise', 'Acquire Pro', 'Aivo Pro',
            'Automat Pro', 'Botsify Enterprise', 'Chatbot.com Pro', 'Comm100 Pro', 'Conversica Pro',
            'Crisp Pro', 'Engati Pro', 'Flow XO Pro', 'Giosg Pro', 'Helpshift Pro',
            'Inbenta Pro', 'Kore.ai Pro', 'Landbot Pro', 'LiveChat Pro', 'ManyChat Pro',
            'MobileMonkey Pro', 'Octane AI Pro', 'Pandorabots Pro', 'Quriobot Pro', 'Rasa Pro',
            'Recime Pro', 'Reply.ai Pro', 'Rulai Pro', 'Salesforce Einstein Pro', 'ServisBOT Pro',
            'SmartAction Pro', 'Snatchbot Pro', 'Tars Pro', 'Tidio Pro', 'Ultimate.ai Pro',
            'Verloop Pro', 'VoiceGlow Pro', 'Wati Pro', 'Xenioo Pro', 'Yalo Pro'
        ],
        'use_cases': ['Customer Support', 'Lead Generation', 'Sales Automation', 'FAQ Automation'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    }
}

def generate_slug(name):
    return name.lower().replace(' ', '-').replace('.', '-').replace('(', '').replace(')', '')

def generate_tools():
    new_tools = []
    tool_id = len(existing_tools) + 1
    
    for category, data in tool_categories.items():
        for tool_name in data['tools']:
            company = random.choice(companies)
            pricing_model = random.choice(data['pricing'])
            badge_color = 'green' if pricing_model == 'FREE' else ('red' if pricing_model == 'PAID' else 'orange')
            launch_year = company['founded'] + random.randint(0, min(30, 2025 - company['founded']))
            
            tool = {
                'id': f'tool-{tool_id}',
                'name': tool_name,
                'slug': generate_slug(tool_name),
                'company': company['name'],
                'launch_year': launch_year,
                'short_description': f'{tool_name} is an advanced AI-powered {category.lower()} tool that helps {random.choice(data["use_cases"]).lower()}.',
                'full_description': f'{tool_name}, developed by {company["name"]}, is a cutting-edge {category.lower()} platform launched in {launch_year}. It leverages state-of-the-art AI technology to deliver exceptional results in {random.choice(data["use_cases"]).lower()}. Trusted by thousands of users worldwide, {tool_name} combines powerful features with an intuitive interface to streamline your workflow and boost productivity.',
                'categories': [category],
                'use_cases': [random.choice(data['use_cases'])],
                'pricing_model': pricing_model,
                'badge_color': badge_color,
                'website_url': f'https://www.google.com/search?q={tool_name.replace(" ", "+")}+AI+tool',
                'platforms_supported': ['Web', random.choice(['Mobile', 'API', 'Desktop'])],
                'tags': [category.lower(), tool_name.lower(), random.choice(data['use_cases']).lower()],
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            new_tools.append(tool)
            tool_id += 1
    
    return new_tools

# Generate new tools
new_tools = generate_tools()
all_tools = existing_tools + new_tools

# Save to file
with open('data/tools.json', 'w', encoding='utf-8') as f:
    json.dump(all_tools, f, indent=2, ensure_ascii=False)

print(f'✅ Successfully generated {len(new_tools)} new AI tools!')
print(f'📊 Total tools in database: {len(all_tools)}')
print(f'\n📁 File saved to: data/tools.json')
print(f'\n🔍 Categories covered:')
for cat, data in tool_categories.items():
    print(f'   - {cat}: {len(data["tools"])} tools')
