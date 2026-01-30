import json
import random
from datetime import datetime

# Load existing tools
with open('data/tools.json', 'r', encoding='utf-8') as f:
    existing_tools = json.load(f)

# Company data
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
    {'name': 'HubSpot', 'founded': 2006}, {'name': 'Semrush', 'founded': 2008}
]

# Tool categories with tools
tool_categories = {
    'Text Generation': {
        'tools': ['Perplexity AI', 'You.com', 'Character.AI', 'Pi AI', 'Poe', 'Cohere', 'AI21 Labs',
                  'Llama Chat', 'Mistral AI', 'Replika', 'Chai', 'Rasa', 'Botpress', 'Dialogflow',
                  'Amazon Lex', 'IBM Watson', 'Azure Bot', 'Landbot', 'ManyChat', 'Chatfuel',
                  'Tidio', 'Intercom Bot', 'Drift Bot', 'LivePerson', 'Zendesk Bot', 'Freshchat',
                  'Salesforce Einstein', 'Oracle Assistant', 'SAP AI', 'Boost.ai', 'Yellow.ai',
                  'Haptik', 'Ada', 'Acquire', 'Aivo', 'Automat', 'Botsify', 'Chatbot.com',
                  'Comm100', 'Conversica', 'Crisp', 'Engati', 'Flow XO', 'Giosg', 'Helpshift',
                  'Inbenta', 'Kore.ai', 'Octane AI', 'Pandorabots', 'Quriobot', 'Reply.ai'],
        'use_cases': ['Content Writing', 'Copywriting', 'Blog Posts', 'Social Media', 'Email Marketing'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Image Generation': {
        'tools': ['DALL-E 3', 'Leonardo.ai', 'Ideogram', 'Playground AI', 'BlueWillow', 'DreamStudio',
                  'Craiyon', 'NightCafe', 'Artbreeder', 'Deep Dream', 'Wombo Dream', 'StarryAI',
                  'Fotor AI', 'Pixlr AI', 'Photoleap', 'Lensa AI', 'Remini', 'PicsArt AI',
                  'Prisma', 'Meitu', 'BeautyPlus', 'FaceApp', 'Reface', 'Avatarify',
                  'MyHeritage', 'DeepNostalgia', 'Rosebud AI', 'Generated Photos', 'Artflow AI',
                  'Hotpot AI', 'Designify', 'Remove.bg', 'Cleanup.pictures', 'Magic Eraser',
                  'Inpaint', 'Photor', 'Cutout.Pro', 'Slazzer', 'Unscreen', 'Runway Green Screen',
                  'Kaleido AI', 'Deep Art Effects', 'Prisma Labs', 'Pikazo', 'Ostagram',
                  'DeepArt.io', 'Neural.love', 'Artisto', 'Prisma Photo'],
        'use_cases': ['Art Generation', 'Photo Editing', 'Design', 'Marketing Visuals', 'Social Media Graphics'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Video Editing': {
        'tools': ['Pika Labs', 'HeyGen', 'D-ID', 'Elai.io', 'Lumen5', 'Kapwing', 'VEED.io',
                  'Clipchamp', 'FlexClip', 'Animoto', 'Biteable', 'Powtoon', 'Vyond',
                  'Renderforest', 'Moovly', 'Wideo', 'Animaker', 'Toonly', 'Doodly',
                  'VideoScribe', 'Explaindio', 'Easy Sketch Pro', 'Camtasia', 'Filmora',
                  'Shotcut', 'OpenShot', 'Kdenlive', 'Lightworks', 'HitFilm', 'Magisto',
                  'Quik', 'Splice', 'KineMaster', 'PowerDirector', 'VivaVideo', 'FilmoraGo',
                  'Adobe Rush', 'LumaFusion', 'iMovie', 'WeVideo', 'InVideo Studio',
                  'Pictory AI', 'Synthesia Studio', 'Descript Video', 'Runway Studio'],
        'use_cases': ['Video Creation', 'Video Editing', 'Animation', 'Explainer Videos', 'Social Media Videos'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Audio & Voice': {
        'tools': ['Play.ht', 'Resemble AI', 'WellSaid Labs', 'Speechify', 'Natural Reader',
                  'Amazon Polly', 'Google TTS', 'Microsoft Azure TTS', 'IBM Watson TTS',
                  'Replica Studios', 'Respeecher', 'iSpeech', 'Voicemod', 'Lyrebird',
                  'CereProc', 'Acapela', 'ReadSpeaker', 'Nuance', 'Lovo AI', 'Sonantic',
                  'Modulate', 'Altered AI', 'Veritone Voice', 'Aflorithmic', 'Coqui',
                  'Tortoise TTS', 'Bark', 'AudioCraft', 'MusicGen', 'Riffusion', 'Mubert',
                  'AIVA', 'Amper Music', 'Soundraw', 'Boomy', 'Loudly', 'Beatoven.ai',
                  'Ecrett Music', 'Soundful', 'Splash Pro', 'Jukebox', 'MuseNet',
                  'Google Magenta', 'LANDR', 'iZotope', 'Accusonus', 'Descript Audio'],
        'use_cases': ['Voice Synthesis', 'Text-to-Speech', 'Music Generation', 'Audio Editing', 'Podcasting'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'SEO & Marketing': {
        'tools': ['Ahrefs', 'Moz Pro', 'Clearscope', 'MarketMuse', 'ContentBot', 'SEO.ai',
                  'RankIQ', 'Page Optimizer Pro', 'Cora', 'Screaming Frog', 'DeepCrawl',
                  'Sitebulb', 'OnCrawl', 'Botify', 'Conductor', 'BrightEdge', 'seoClarity',
                  'Searchmetrics', 'SE Ranking', 'Serpstat', 'SpyFu', 'Mangools',
                  'Ubersuggest', 'AnswerThePublic', 'AlsoAsked', 'Keywords Everywhere',
                  'SEOquake', 'MozBar', 'Ahrefs Toolbar', 'Marketo', 'Pardot',
                  'ActiveCampaign', 'Mailchimp AI', 'Constant Contact', 'GetResponse',
                  'AWeber', 'ConvertKit', 'Drip', 'Klaviyo', 'Omnisend', 'Sendinblue',
                  'Campaign Monitor', 'Emma', 'Mad Mimi', 'HubSpot AI', 'Semrush AI'],
        'use_cases': ['SEO Optimization', 'Keyword Research', 'Content Strategy', 'Email Marketing', 'Analytics'],
        'pricing': ['PAID', 'FREE_PAID']
    },
    'Code & Development': {
        'tools': ['Tabnine', 'Codeium', 'Amazon CodeWhisperer', 'Replit Ghostwriter', 'Cursor',
                  'Sourcegraph Cody', 'Phind', 'Bard Dev', 'Gemini Code', 'CodeT5', 'CodeGen',
                  'AlphaCode', 'PolyCoder', 'CodeBERT', 'GraphCodeBERT', 'UniXcoder',
                  'CodeRL', 'CERT', 'Aider', 'Continue.dev', 'Refact.ai', 'Mutable AI',
                  'Mintlify', 'Stenography', 'Buildt', 'Debuild', 'v0.dev', 'Galileo AI Dev',
                  'Uizard Dev', 'Figma Dev', 'Framer Dev', 'Dora AI Dev', 'Telepor AI',
                  'Quest AI', 'Anima', 'Locofy', 'Bifrost', 'Kombai', 'Screenshot to Code',
                  'Pix2Code', 'Sketch2Code', 'Fronty', 'Teleporthq', 'Builder.io', 'Webflow AI'],
        'use_cases': ['Code Generation', 'Code Completion', 'Debugging', 'Code Review', 'Documentation'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Data Analysis': {
        'tools': ['Tableau AI', 'Power BI AI', 'Looker', 'Qlik Sense', 'Domo', 'Sisense',
                  'Thoughtspot', 'Mode Analytics', 'Metabase', 'Redash', 'Superset', 'Grafana',
                  'DataRobot', 'H2O.ai', 'RapidMiner', 'KNIME', 'Alteryx', 'Dataiku',
                  'Domino Data Lab', 'Databricks', 'Snowflake', 'BigQuery ML', 'Azure ML',
                  'AWS SageMaker', 'Google Vertex AI', 'IBM Watson Studio', 'Oracle ML',
                  'SAP Analytics', 'MicroStrategy', 'Yellowfin BI', 'Zoho Analytics',
                  'Klipfolio', 'Grow', 'Chartio', 'Periscope Data', 'Holistics', 'GoodData',
                  'Birst', 'Pentaho', 'TIBCO Spotfire', 'QlikView', 'Cognos Analytics',
                  'Board', 'Jedox', 'Adaptive Insights', 'Anaplan', 'Planful'],
        'use_cases': ['Data Visualization', 'Business Intelligence', 'Predictive Analytics', 'Machine Learning'],
        'pricing': ['PAID', 'FREE_PAID']
    },
    'Productivity': {
        'tools': ['Make', 'n8n', 'Automate.io', 'Workato', 'Tray.io', 'Pipedream', 'Parabola',
                  'Bardeen', 'Axiom', 'Browse AI', 'Octoparse', 'ParseHub', 'Import.io',
                  'Apify', 'Diffbot', 'Scrapy Cloud', 'Bright Data', 'ScrapingBee',
                  'ScrapeStack', 'Coda', 'Airtable', 'Monday.com', 'ClickUp', 'Asana',
                  'Trello', 'Jira', 'Linear', 'Height', 'Shortcut', 'Basecamp', 'Wrike',
                  'Smartsheet', 'Teamwork', 'Podio', 'Zoho Projects', 'Microsoft Project',
                  'Confluence', 'Slite', 'Nuclino', 'Tettra', 'Document360', 'GitBook',
                  'ReadMe', 'Archbee', 'Almanac', 'Slab', 'Zapier AI'],
        'use_cases': ['Workflow Automation', 'Task Management', 'Project Management', 'Documentation'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Design': {
        'tools': ['Beautiful.ai', 'Pitch', 'Gamma', 'Tome', 'Decktopus', 'Slidebean',
                  'Visme', 'Prezi', 'Genially', 'Haiku Deck', 'Emaze', 'Zoho Show',
                  'Google Slides AI', 'Microsoft Designer', 'Crello', 'Stencil', 'Snappa',
                  'Easil', 'RelayThat', 'Desygner', 'VistaCreate', 'Piktochart', 'Infogram',
                  'Venngage', 'Easelly', 'Lucidpress', 'Marq', 'Design Wizard', 'Bannersnack',
                  'Creatopy', 'Bannerflow', 'Celtra', 'Sizmek', 'Flashtalking', 'Thunder',
                  'Adform', 'Innovid', 'Canva Pro', 'Adobe Express', 'Figma Design'],
        'use_cases': ['Graphic Design', 'Presentation Design', 'UI/UX Design', 'Branding', 'Advertising'],
        'pricing': ['FREE', 'PAID', 'FREE_PAID']
    },
    'Customer Service': {
        'tools': ['Zendesk AI', 'Acquire', 'Helpshift', 'Kore.ai', 'Octane AI', 'Pandorabots',
                  'Quriobot', 'Recime', 'Rulai', 'ServisBOT', 'SmartAction', 'Snatchbot',
                  'Tars', 'Ultimate.ai', 'Verloop', 'VoiceGlow', 'Wati', 'Xenioo', 'Yalo',
                  'Zoho SalesIQ', 'LiveChat AI', 'Intercom AI', 'Drift AI', 'Ada AI',
                  'Yellow.ai Pro', 'Boost.ai Pro', 'Haptik Pro', 'Aivo Pro', 'Automat Pro',
                  'Botsify Pro', 'Chatbot.com Pro', 'Comm100 Pro', 'Conversica Pro',
                  'Crisp Pro', 'Engati Pro', 'Flow XO Pro', 'Giosg Pro'],
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
            launch_year = company['founded'] + random.randint(0, 2025 - company['founded'])
            
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
