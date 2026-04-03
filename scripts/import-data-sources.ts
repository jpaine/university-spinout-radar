/**
 * Import data from Oxford Founders Guide, Oxford Equinox,
 * and Oxford Science Enterprises portfolio.
 *
 * Run with: npx tsx scripts/import-data-sources.ts
 * Safe to re-run — all operations use upsert.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// ─── OSE Portfolio — Real Investable Spinout Companies ────────────────────────
// Source: https://www.oxfordscienceenterprises.com/portfolio
// Oxford Science Enterprises' portfolio of Oxford University spinouts.

const OSE_SPINOUTS: Array<{
  name: string
  description: string
  sector: string
  website?: string
  tags: string[]
  fundingStage?: string
}> = [
  { name: 'Acionna Therapeutics', description: "Harnessing the neuroimmune system to tackle Alzheimer's", sector: 'Life Sciences', tags: ['Life Sciences', 'Therapeutics', 'Neuroscience'], fundingStage: 'Early Stage' },
  { name: 'Alethio Therapeutics', description: 'Developing breakthrough therapies for chronic blood cancer', sector: 'Life Sciences', tags: ['Life Sciences', 'Therapeutics', 'Oncology'], fundingStage: 'Early Stage' },
  { name: 'Alloyed', description: 'Stronger, lighter, faster — the future of advanced metals', sector: 'Deep Tech', tags: ['Deep Tech', 'Materials', 'Manufacturing'], fundingStage: 'Growth' },
  { name: 'Alveogene', description: 'Inhaled gene therapy for rare respiratory diseases', sector: 'Life Sciences', tags: ['Life Sciences', 'Gene Therapy', 'Rare Disease'], fundingStage: 'Early Stage' },
  { name: 'Amber Therapeutics', description: 'Intelligent implants restoring bladder control for millions of women', sector: 'HealthTech', tags: ['HealthTech', 'MedTech', "Women's Health"], fundingStage: 'Growth' },
  { name: 'Archangel Lightworks', description: 'Bridging the digital divide by providing data coverage via Earth-to-space lasers', sector: 'Deep Tech', tags: ['Deep Tech', 'Space', 'Communications'], fundingStage: 'Early Stage' },
  { name: 'Ascension', description: 'Unlocking volcanic glass as a sustainable supply of critical minerals', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Materials'], fundingStage: 'Early Stage' },
  { name: 'Barinthus Biotherapeutics', description: 'Guiding the immune system to treat complex diseases', sector: 'Life Sciences', tags: ['Life Sciences', 'Immunotherapy'], fundingStage: 'Growth', website: 'https://www.barinthus.com' },
  { name: 'Base Genomics', description: 'Detecting cancer earlier through precision DNA methylation', sector: 'Life Sciences', tags: ['Life Sciences', 'Diagnostics', 'Genomics', 'Oncology'], fundingStage: 'Early Stage' },
  { name: 'Beacon Therapeutics', description: 'Saving and restoring sight in patients with blinding diseases', sector: 'Life Sciences', tags: ['Life Sciences', 'Gene Therapy', 'Ophthalmology'], fundingStage: 'Growth' },
  { name: 'BibliU', description: 'Giving universal access to essential learning materials for students', sector: 'Deep Tech', tags: ['EdTech', 'SaaS'], fundingStage: 'Growth', website: 'https://www.bibliu.com' },
  { name: 'Caristo Diagnostics', description: "Revealing hidden heart risk before it's too late", sector: 'HealthTech', tags: ['HealthTech', 'Diagnostics', 'Cardiology', 'AI'], fundingStage: 'Early Stage' },
  { name: 'Circadian Therapeutics', description: "Resetting the body's internal clock to restore health", sector: 'Life Sciences', tags: ['Life Sciences', 'Therapeutics'], fundingStage: 'Early Stage' },
  { name: 'Credo Therapies', description: 'Bringing evidence-based care to overlooked eating disorders', sector: 'HealthTech', tags: ['HealthTech', 'Mental Health', 'Digital Health'], fundingStage: 'Early Stage' },
  { name: 'Dark Blue Therapeutics', description: "Exposing cancer's hidden vulnerabilities", sector: 'Life Sciences', tags: ['Life Sciences', 'Oncology', 'Therapeutics'], fundingStage: 'Early Stage' },
  { name: 'Densix', description: 'Ultra-dense power converters for next-generation infrastructure', sector: 'Deep Tech', tags: ['Deep Tech', 'Energy', 'Hardware'], fundingStage: 'Early Stage' },
  { name: 'DiffBlue', description: "Automating coding's most tedious tasks with AI", sector: 'Deep Tech', tags: ['Deep Tech', 'AI', 'Developer Tools'], fundingStage: 'Growth', website: 'https://www.diffblue.com' },
  { name: 'DJS Antibodies', description: 'Engineering next-generation treatments for inflammatory disease', sector: 'Life Sciences', tags: ['Life Sciences', 'Immunology', 'Therapeutics'], fundingStage: 'Early Stage' },
  { name: 'EndLyz Therapeutics', description: "Clearing cellular waste to combat neurodegenerative diseases such as Parkinson's", sector: 'Life Sciences', tags: ['Life Sciences', 'Neuroscience', 'Therapeutics'], fundingStage: 'Early Stage' },
  { name: 'Evolito', description: 'Powering electric flight with ultra-light motors', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Aviation', 'Electric'], fundingStage: 'Growth' },
  { name: 'Evox Therapeutics', description: "Delivering drugs where others can't — with exosomes", sector: 'Life Sciences', tags: ['Life Sciences', 'Drug Delivery', 'Therapeutics'], fundingStage: 'Growth', website: 'https://www.evoxtherapeutics.com' },
  { name: 'First Light Fusion', description: 'Making fusion and extreme conditions work for real-world progress', sector: 'Deep Tech', tags: ['Deep Tech', 'Energy', 'Fusion', 'CleanTech'], fundingStage: 'Growth', website: 'https://firstlightfusion.com' },
  { name: 'Fluorok', description: 'Eliminating dangerous hydrogen fluoride from production of essential fluorochemicals', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Chemistry'], fundingStage: 'Early Stage' },
  { name: 'Fractile', description: 'Powering the AI revolution with faster, smarter chips', sector: 'Deep Tech', tags: ['Deep Tech', 'AI', 'Semiconductors'], fundingStage: 'Early Stage' },
  { name: 'Genomics plc', description: 'Unlocking the power of DNA to transform healthcare', sector: 'Life Sciences', tags: ['Life Sciences', 'Genomics', 'AI'], fundingStage: 'Growth', website: 'https://www.genomicsplc.com' },
  { name: 'Grey Wolf Therapeutics', description: 'Novel antigen modulation technology to guide the immune system', sector: 'Life Sciences', tags: ['Life Sciences', 'Immunotherapy', 'Oncology'], fundingStage: 'Early Stage' },
  { name: 'Ground Truth Labs', description: 'Decoding bone marrow to transform how we diagnose and predict disease', sector: 'HealthTech', tags: ['HealthTech', 'Diagnostics', 'AI'], fundingStage: 'Early Stage' },
  { name: 'HEXR', description: 'Rethinking safety tech to prevent life-changing brain injuries', sector: 'Deep Tech', tags: ['Deep Tech', 'Consumer', '3D Printing'], fundingStage: 'Growth' },
  { name: 'Iota Sciences', description: 'Delivering single cells to advance research and medicine', sector: 'Life Sciences', tags: ['Life Sciences', 'Lab Tech', 'Cell Biology'], fundingStage: 'Early Stage' },
  { name: 'ISOgenix', description: 'Rewriting the rules of precision medicine with protein isoforms', sector: 'Life Sciences', tags: ['Life Sciences', 'Precision Medicine', 'Proteomics'], fundingStage: 'Early Stage' },
  { name: 'Kesmalea', description: 'Shrinking breakthrough medicines to reach the brain', sector: 'Life Sciences', tags: ['Life Sciences', 'Drug Delivery', 'Neuroscience'], fundingStage: 'Early Stage' },
  { name: 'Kneu Health', description: "Reimagining care for dementia and Parkinson's", sector: 'HealthTech', tags: ['HealthTech', 'Digital Health', 'Neuroscience'], fundingStage: 'Early Stage' },
  { name: 'Latent Logic', description: 'Teaching driverless cars to understand human behaviour', sector: 'Deep Tech', tags: ['Deep Tech', 'AI', 'Autonomous Vehicles'], fundingStage: 'Acquired' },
  { name: 'Living Optics', description: 'Revealing the invisible with hyperspectral vision', sector: 'Deep Tech', tags: ['Deep Tech', 'Computer Vision', 'Hardware'], fundingStage: 'Growth', website: 'https://www.livingoptics.com' },
  { name: 'Marley Health', description: 'Better care for pets, peace of mind for owners', sector: 'HealthTech', tags: ['HealthTech', 'VetTech', 'Consumer'], fundingStage: 'Early Stage' },
  { name: 'MatchBio', description: 'Enhancing the sensitivity of CAR-T therapies for cancer and autoimmune diseases', sector: 'Life Sciences', tags: ['Life Sciences', 'Cell Therapy', 'Oncology'], fundingStage: 'Early Stage' },
  { name: 'Mind Foundry', description: 'Machine learning for defence and national security', sector: 'Deep Tech', tags: ['Deep Tech', 'AI', 'Defence'], fundingStage: 'Growth', website: 'https://www.mindfoundry.ai' },
  { name: 'MiroBio', description: 'Switching off autoimmunity by restoring natural immune balance', sector: 'Life Sciences', tags: ['Life Sciences', 'Immunology', 'Autoimmune'], fundingStage: 'Acquired' },
  { name: 'Mixergy', description: 'Smarter hot water, lower bills, cleaner energy', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Energy', 'IoT'], fundingStage: 'Growth', website: 'https://www.mixergy.co.uk' },
  { name: 'Moa Technology', description: 'Fighting weeds to protect global food security', sector: 'Deep Tech', tags: ['Deep Tech', 'AgriTech', 'CleanTech'], fundingStage: 'Growth' },
  { name: 'Mode Labs', description: 'Lab-grade environmental monitoring in real time, anywhere in the world', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'IoT', 'Sensors'], fundingStage: 'Early Stage' },
  { name: 'Natcap', description: 'Empowering businesses with nature intelligence', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'ESG', 'AI'], fundingStage: 'Early Stage' },
  { name: 'NavLive', description: 'Real-time, AI-powered, 2D/3D mapping for high-stakes environments', sector: 'Deep Tech', tags: ['Deep Tech', 'AI', 'Mapping', 'Defence'], fundingStage: 'Early Stage' },
  { name: 'Nucleome Therapeutics', description: 'Cracking the code of the non-coding genome', sector: 'Life Sciences', tags: ['Life Sciences', 'Genomics', 'Drug Discovery'], fundingStage: 'Growth' },
  { name: 'Oath Surgical', description: 'A new operating system for surgery', sector: 'HealthTech', tags: ['HealthTech', 'MedTech', 'Surgical'], fundingStage: 'Early Stage' },
  { name: 'Odqa Renewable Energy Technologies', description: 'Decarbonising industrial heat with the sun', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Solar', 'Energy'], fundingStage: 'Early Stage' },
  { name: 'OMass Therapeutics', description: 'Making the undruggable druggable with native mass spectrometry', sector: 'Life Sciences', tags: ['Life Sciences', 'Drug Discovery', 'Proteomics'], fundingStage: 'Growth' },
  { name: 'Opsydia', description: 'Enabling the next generation of photonic computing', sector: 'Deep Tech', tags: ['Deep Tech', 'Photonics', 'Computing'], fundingStage: 'Early Stage' },
  { name: 'Orbit Discovery', description: 'Fast-tracking the search for peptide drugs', sector: 'Life Sciences', tags: ['Life Sciences', 'Drug Discovery', 'Peptides'], fundingStage: 'Growth' },
  { name: 'Orca Computing', description: 'Scalable quantum computing, using light to process information', sector: 'Deep Tech', tags: ['Deep Tech', 'Quantum', 'Photonics'], fundingStage: 'Growth', website: 'https://www.orcacomputing.com' },
  { name: 'ORFonyx', description: 'Reprogramming cells to treat diseases at the genetic level', sector: 'Life Sciences', tags: ['Life Sciences', 'Gene Therapy', 'Therapeutics'], fundingStage: 'Early Stage' },
  { name: 'Osler Diagnostics', description: 'Bringing lab-quality diagnostics to the point of care', sector: 'HealthTech', tags: ['HealthTech', 'Diagnostics', 'MedTech'], fundingStage: 'Growth' },
  { name: 'Oxford Endovascular', description: 'A new way to treat brain aneurysms and prevent strokes', sector: 'HealthTech', tags: ['HealthTech', 'MedTech', 'Neuroscience'], fundingStage: 'Growth' },
  { name: 'Oxford Flow', description: 'Smarter valves for water, oil, and gas infrastructure that reduce fugitive emissions to zero', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Industrial'], fundingStage: 'Growth' },
  { name: 'Oxford Ionics', description: 'High-fidelity quantum computing — scalable and real-world ready', sector: 'Deep Tech', tags: ['Deep Tech', 'Quantum'], fundingStage: 'Acquired', website: 'https://www.oxfordionics.com' },
  { name: 'Oxford Nanoimaging', description: 'Making molecular biology visible with super-resolution microscopy', sector: 'Deep Tech', tags: ['Deep Tech', 'Life Sciences', 'Imaging'], fundingStage: 'Growth', website: 'https://www.oni.bio' },
  { name: 'Oxford Quantum Circuits', description: 'Quantum computing you can access today', sector: 'Deep Tech', tags: ['Deep Tech', 'Quantum', 'Cloud'], fundingStage: 'Growth', website: 'https://www.oqc.tech' },
  { name: 'Oxford Semantic Technologies', description: 'Turning complex data into actionable insights', sector: 'Deep Tech', tags: ['Deep Tech', 'AI', 'Knowledge Graph'], fundingStage: 'Acquired' },
  { name: 'PepGen', description: 'Delivering genetic medicines deep into muscle and brain', sector: 'Life Sciences', tags: ['Life Sciences', 'Gene Therapy', 'Drug Delivery'], fundingStage: 'Growth', website: 'https://www.pepgen.com' },
  { name: 'Perspectum', description: 'Imaging to detect diseases of vital organs earlier and manage them better', sector: 'HealthTech', tags: ['HealthTech', 'Diagnostics', 'Imaging', 'AI'], fundingStage: 'Growth', website: 'https://www.perspectum.com' },
  { name: 'Porpoise Power', description: 'Clean, reliable energy from the tide, inspired by nature', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Renewable Energy'], fundingStage: 'Early Stage' },
  { name: 'PQShield', description: 'Protecting global data in the quantum era', sector: 'Deep Tech', tags: ['Deep Tech', 'Cybersecurity', 'Quantum'], fundingStage: 'Growth', website: 'https://www.pqshield.com' },
  { name: 'Prolific', description: 'High-quality human data for faster, smarter research', sector: 'Deep Tech', tags: ['Deep Tech', 'AI', 'Research', 'Data'], fundingStage: 'Growth', website: 'https://www.prolific.co' },
  { name: 'Quantum Motion', description: 'Quantum computing built on silicon, designed to scale', sector: 'Deep Tech', tags: ['Deep Tech', 'Quantum', 'Semiconductors'], fundingStage: 'Growth' },
  { name: 'Refeyn', description: 'Weighing molecules to accelerate drug discovery', sector: 'Life Sciences', tags: ['Life Sciences', 'Lab Tech', 'Drug Discovery'], fundingStage: 'Growth', website: 'https://www.refeyn.com' },
  { name: 'Salience Labs', description: 'Photonic switch chips for faster, energy efficient AI infrastructure', sector: 'Deep Tech', tags: ['Deep Tech', 'Photonics', 'AI', 'Semiconductors'], fundingStage: 'Early Stage' },
  { name: 'Scenic Biotech', description: 'Turning genetic resilience into a new class of medicines', sector: 'Life Sciences', tags: ['Life Sciences', 'Drug Discovery', 'Genomics'], fundingStage: 'Growth' },
  { name: 'Scripta', description: 'Pioneering novel neuro-focused therapeutics', sector: 'Life Sciences', tags: ['Life Sciences', 'Neuroscience', 'Therapeutics'], fundingStage: 'Early Stage' },
  { name: 'Seloxium', description: 'Turning industrial waste into valuable metals', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Recycling'], fundingStage: 'Early Stage' },
  { name: 'Sitryx', description: 'Harnessing immune cell metabolism to develop oral therapies for autoimmune disorders', sector: 'Life Sciences', tags: ['Life Sciences', 'Immunology', 'Autoimmune'], fundingStage: 'Growth' },
  { name: 'Snowfox Discovery', description: 'Unlocking the potential of natural hydrogen for a net zero future', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'Energy', 'Hydrogen'], fundingStage: 'Early Stage' },
  { name: 'SpyBiotech', description: 'Accelerating vaccine development with protein superglues', sector: 'Life Sciences', tags: ['Life Sciences', 'Vaccines', 'Infectious Disease'], fundingStage: 'Growth' },
  { name: 'Stateful Robotics', description: 'Decision intelligence for autonomous mobile robots', sector: 'Deep Tech', tags: ['Deep Tech', 'Robotics', 'AI'], fundingStage: 'Early Stage' },
  { name: 'T-Cypher Bio', description: 'Mapping the immune system to design next-gen therapies', sector: 'Life Sciences', tags: ['Life Sciences', 'Immunology', 'Drug Discovery'], fundingStage: 'Early Stage' },
  { name: 'Thelior Bio', description: 'Healing barrier tissues to treat chronic inflammatory disease', sector: 'Life Sciences', tags: ['Life Sciences', 'Therapeutics', 'Gut Health'], fundingStage: 'Early Stage' },
  { name: 'Theolytics', description: 'Viruses engineered to fight cancer', sector: 'Life Sciences', tags: ['Life Sciences', 'Oncology', 'Oncolytic Virus'], fundingStage: 'Growth' },
  { name: 'Ultromics', description: 'Using AI to augment echocardiography — detecting heart disease earlier', sector: 'HealthTech', tags: ['HealthTech', 'AI', 'Cardiology', 'Diagnostics'], fundingStage: 'Growth' },
  { name: 'Vivid Dx', description: 'Diagnosing infections in hours, not days', sector: 'HealthTech', tags: ['HealthTech', 'Diagnostics', 'Infectious Disease'], fundingStage: 'Early Stage' },
  { name: 'Wild Bioscience', description: 'Reprogramming crops for bigger yields and lower emissions', sector: 'Deep Tech', tags: ['Deep Tech', 'AgriTech', 'CleanTech', 'Synthetic Biology'], fundingStage: 'Early Stage' },
  { name: 'YASA', description: 'Smaller, lighter, more powerful motors for electric vehicles', sector: 'Deep Tech', tags: ['Deep Tech', 'CleanTech', 'EV', 'Electric'], fundingStage: 'Acquired' },
]

// ─── Oxford Founders Guide — Ecosystem Support Organisations ──────────────────
// Source: https://oxfordfoundersguide.com/
// Curated by Zero Founders Network, organised by entrepreneurship stage.

const FOUNDERS_GUIDE_ORGS: Array<{
  name: string
  description: string
  website?: string
  stage: string
  tags: string[]
}> = [
  // Pre-Startup
  { name: 'Pitch @ the Pub', description: 'Casual pitch nights for feedback and early-stage networking opportunities', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Networking', 'Pitching'] },
  { name: 'All-Innovate', description: 'Innovation challenges and community events for aspiring entrepreneurs', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Innovation'] },
  { name: 'Oxford Founders Society', description: 'Peer mentoring, meetups, and pitch practice sessions', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Mentoring', 'Community'] },
  { name: 'Oxford Entrepreneurs', description: 'Mentorship programs and entrepreneurial events for students', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Student', 'Mentoring'] },
  { name: 'Oxford AI Society (OxAI)', description: 'Hackathons, pitch nights, and AI-focused education programs', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'AI', 'Student'] },
  { name: 'OSBES', description: 'Sustainable and social entrepreneurship community and resources', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Sustainability', 'Social Impact'] },
  { name: 'FemTech Oxford Society', description: "Women's health technology focus and networking opportunities", stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'FemTech', 'HealthTech'] },
  { name: 'Oxford Hub', description: 'Project support and community for social innovation initiatives', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Social Impact', 'Community'] },
  { name: 'Oxford Edge', description: 'College-based competitions, mentoring, and entrepreneurship support', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Competition', 'Mentoring'] },
  { name: 'Oxford Scholastica', description: 'Business bootcamps and entrepreneurship programs for high schoolers', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Education'] },
  { name: 'Oxford Summer Courses', description: 'Fundamentals and leadership training in entrepreneurship', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Education'] },
  { name: 'MSc Sustainability Enterprise and the Environment', description: 'Advanced program combining sustainability, enterprise, and environmental studies', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Sustainability', 'Education'] },
  { name: 'Oxford MBA Program', description: 'Advanced academic program in business administration and entrepreneurship', stage: 'Pre-Startup', tags: ['Ecosystem', 'Pre-Startup', 'Education', 'MBA'] },
  // Early-Stage
  { name: 'Building a Business', description: 'Structured business skills workshops and development programs', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Education'] },
  { name: 'Oxford Invention Fund (OIF)', description: 'Early-stage grants for prototyping and validating new ideas', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Grants', 'Deep Tech'] },
  { name: 'Oxford Venture Builder', description: 'Comprehensive support program for Oxford researchers and academics', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Venture Builder', 'Research'] },
  { name: 'ARC Accelerator', description: '£50k funding, mentoring, and bootcamp programs for social science ventures', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Accelerator', 'Social Impact'] },
  { name: 'OUI Accelerator Programme', description: 'Comprehensive pitch coaching and mentorship for early-stage spinouts', website: 'https://innovation.ox.ac.uk', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Accelerator', 'Spinout'] },
  { name: 'BioEscalator', description: 'Specialised facilities and lab support for biotech ventures', website: 'https://bioescalator.com', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'BioTech', 'Lab Space'] },
  { name: 'Oxford Brookes Enterprise Centre', description: 'Alumni and student incubation with business development support', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Incubator', 'Student'] },
  { name: 'FAB Accelerator', description: 'Structured funding and mentorship for early-stage ventures', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Accelerator'] },
  { name: 'STEP Ignite', description: 'Mentoring and funding specifically for social impact startups', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Social Impact', 'Mentoring'] },
  { name: 'eScalate', description: 'Comprehensive funding and business support for early-stage ventures', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Accelerator'] },
  { name: 'Panacea Stars', description: 'Specialised mentorship for health and impact-focused startups', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'HealthTech', 'Social Impact'] },
  { name: 'Oxford-Harrington Therapeutics Accelerator', description: 'Focused on rare disease therapeutics development and commercialisation', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'BioTech', 'Therapeutics', 'Accelerator'] },
  { name: 'MPLS Enterprise Programme', description: 'Commercialisation training specifically for STEM researchers', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Deep Tech', 'Research', 'STEM'] },
  { name: 'Business and Intellectual Property Centre (BIPC)', description: 'Business support, IP guidance, and resources for entrepreneurs and startups', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'IP', 'Legal'] },
  { name: 'Social Shifters Challenge', description: 'Global challenge program for young social entrepreneurs', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Social Impact', 'Competition'] },
  { name: 'Sterling Road Grant', description: 'Seed grants for innovative projects and early-stage ventures', stage: 'Early-Stage', tags: ['Ecosystem', 'Early-Stage', 'Grants'] },
  // Angel
  { name: 'Isis Angels Network (IAN)', description: 'Investor network providing early-stage capital for Oxford spinouts', stage: 'Angel', tags: ['Ecosystem', 'Angel', 'Investment', 'Spinout'] },
  { name: 'Oxford Angel Network (OAN)', description: 'Angel investment network for Oxford University spinouts and startups', stage: 'Angel', tags: ['Ecosystem', 'Angel', 'Investment', 'Spinout'] },
  { name: 'Oxford Entrepreneurs Angel Fund', description: 'Angel investment fund connected to Oxford Entrepreneurs network', stage: 'Angel', tags: ['Ecosystem', 'Angel', 'Investment'] },
  { name: 'Oxbridge Angels', description: 'Angel network focusing on Oxford and Cambridge university entrepreneurs', stage: 'Angel', tags: ['Ecosystem', 'Angel', 'Investment'] },
  { name: 'Oxford Investment Opportunity Network (OION)', description: 'Investment opportunity network for Oxford-connected ventures', stage: 'Angel', tags: ['Ecosystem', 'Angel', 'Investment'] },
  // Seed
  { name: 'Oxford Seed Fund', description: 'Student-managed fund investing up to £50k in Oxford-affiliated startups', stage: 'Seed', tags: ['Ecosystem', 'Seed', 'Investment', 'Student'] },
  { name: 'Oxford Capital Partners', description: 'Investment fund providing seed and early-stage capital for startups', stage: 'Seed', tags: ['Ecosystem', 'Seed', 'Investment', 'VC'] },
  { name: 'Oxonian Ventures Fund', description: 'Alumni-managed venture capital for Oxford-linked startups', stage: 'Seed', tags: ['Ecosystem', 'Seed', 'Investment', 'VC'] },
  { name: 'Oxford Science Enterprises', description: 'Investment fund focused on Oxford University science and technology ventures', website: 'https://www.oxfordscienceenterprises.com', stage: 'Seed', tags: ['Ecosystem', 'Seed', 'Investment', 'Deep Tech', 'VC'] },
  { name: 'Oxford Technology Management', description: 'Enterprise Investment Scheme fund providing seed capital for qualifying startups', stage: 'Seed', tags: ['Ecosystem', 'Seed', 'Investment', 'EIS'] },
  { name: 'Oxford Capital', description: 'Pre-seed and seed investment fund for early-stage startups', website: 'https://www.oxcp.com', stage: 'Seed', tags: ['Ecosystem', 'Seed', 'Investment', 'VC'] },
  { name: 'Acclimate Ventures', description: 'Venture capital fund focused on climate and sustainability startups', stage: 'Seed', tags: ['Ecosystem', 'Seed', 'Investment', 'VC', 'Sustainability', 'Climate'] },
  // Growth / Scale-Up
  { name: 'Skoll Centre for Social Entrepreneurship', description: 'Global hub for social entrepreneurship research and advanced programs', website: 'https://www.sbs.ox.ac.uk/research/skoll-centre', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Social Impact', 'Research'] },
  { name: 'SBS Founders and Funders', description: 'High-level networking, speakers, and research-focused community', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Networking', 'Investment'] },
  { name: 'Oxford Spin-out Equity Management (OSEM)', description: 'Professional spinout equity governance and management services', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Spinout', 'Equity'] },
  { name: 'EnSpire', description: 'Comprehensive research innovation support and commercialisation', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Research', 'Commercialisation'] },
  { name: 'Oxford Innovation Society (OIS)', description: 'High-level talks, partner access, and collaboration events', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Networking', 'Community'] },
  { name: 'Begbroke Science Park', description: 'High-tech lab space, offices, and scaling infrastructure', website: 'https://www.begbroke.ox.ac.uk', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Lab Space', 'Deep Tech'] },
  { name: 'Oxford Science Enterprise Centre (OSEC)', description: 'Commercial and technical support for science-based growth companies', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Deep Tech', 'Commercialisation'] },
  { name: 'OX1 Incubator', description: "Coworking and events in Oxford's innovation quarter", stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Incubator', 'Coworking'] },
  { name: 'Future Leaders Innovation Programme (FLIP)', description: 'Advanced leadership and project training for scaling ventures', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Leadership', 'Education'] },
  { name: '#StartedinOxford Showcase', description: 'Annual event for startup exposure and high-level networking', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Networking', 'Community'] },
  { name: 'Zero Founders Network', description: 'Peer support network for founders in Climate Tech', website: 'https://oxfordfoundersguide.com', stage: 'Growth', tags: ['Ecosystem', 'Growth', 'Community', 'Climate', 'Networking'] },
]

// ─── Oxford Equinox Team ──────────────────────────────────────────────────────
// Source: https://www.oxfordequinox.com/team

const EQUINOX_TEAM: Array<{
  firstName: string
  lastName: string
  role: string
}> = [
  { firstName: 'Olga', lastName: 'Kozlova', role: 'Director of Innovation and Engagement' },
  { firstName: 'Murray', lastName: 'Gardner', role: 'Head of Strategic Engagement and Regional Partnerships' },
  { firstName: 'Monica', lastName: 'Finlayson', role: 'Head of Operations and Delivery' },
  { firstName: 'Simon', lastName: 'Guillaumé', role: 'Regional Engagement and Innovation Manager' },
  { firstName: 'Dorota', lastName: 'Nawrot', role: 'Strategic Engagement and Innovation Manager' },
  { firstName: 'Bridget', lastName: 'Holligan', role: 'Community Engagement Manager' },
  { firstName: 'Callum', lastName: 'Coleman', role: 'Public Affairs Manager' },
  { firstName: 'Alison', lastName: 'Tobin', role: 'Innovation Communications Manager' },
  { firstName: 'Emily', lastName: 'Parkes', role: 'Marketing and Communications Specialist' },
  { firstName: 'Justine', lastName: 'Shepperson', role: 'Events Manager' },
  { firstName: 'Jodie', lastName: 'Tafin', role: 'Finance and Operations Coordinator' },
]

// ─── Recent News — Seed the Activity Feed ─────────────────────────────────────
// Source: https://innovation.ox.ac.uk/news/

const OUI_NEWS: Array<{
  title: string
  summary: string
  type: string
  sourceUrl: string
  publishedAt: string // ISO date
  companySlug?: string // link to a company if relevant
}> = [
  {
    title: 'Oxford Ionics acquired by IonQ for $1.075 billion',
    summary: 'Oxford Ionics has been acquired by US-listed IonQ in a landmark $1.075 billion deal — the largest quantum acquisition to emerge from the University of Oxford to date.',
    type: 'funding_round',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2025-09-17',
    companySlug: 'oxford-ionics',
  },
  {
    title: 'OrganOx acquired by Terumo for record $1.5bn',
    summary: 'Oxford University Innovation spinout OrganOx is set to be acquired by Terumo Corporation in a landmark $1.5 billion deal — the largest acquisition of an Oxford spinout to date.',
    type: 'funding_round',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2025-08-25',
  },
  {
    title: 'OrganOx wins MacRobert Award 2025',
    summary: 'OrganOx has been awarded the UK\'s most prestigious engineering prize for its organ preservation technology that is transforming transplant outcomes worldwide.',
    type: 'news',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2025-07-11',
  },
  {
    title: 'Thelior Bio: rethinking gut health from the inside out',
    summary: 'Thelior Bio working on new class of therapies for chronic inflammatory disease.',
    type: 'new_spinout',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2025-07-09',
    companySlug: 'thelior-bio',
  },
  {
    title: 'Medhesion wins StEP Ignite 2025',
    summary: 'From biotech to quantum and AI-driven music tech, this year\'s StEP Ignite cohort proved Oxford\'s next generation of innovators are building bold solutions.',
    type: 'event',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2025-07-30',
  },
  {
    title: 'OUI marks UCSF Silver Anniversary with almost £3 billion raised by spinouts',
    summary: 'For 25 years, Oxford\'s University Challenge Seed Fund has helped to create almost 100 companies.',
    type: 'news',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2025-09-30',
  },
  {
    title: 'Investing in Oxford: showcasing life sciences during JPM week',
    summary: 'OUI hosted its third annual Investing in Oxford event during the J.P. Morgan Healthcare Conference week, bringing together international investors, corporates and Oxford spinouts.',
    type: 'event',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2026-01-16',
  },
  {
    title: 'ImpactU secures €300,000 for health-focused social ventures',
    summary: 'ImpactU received €300,000 from Financière de Tubize to expand support for university-linked social ventures developing sustainable health solutions.',
    type: 'funding_round',
    sourceUrl: 'https://innovation.ox.ac.uk/news/',
    publishedAt: '2025-12-01',
  },
  {
    title: 'Building a more inclusive innovation ecosystem in Oxfordshire',
    summary: 'Oxford Equinox initiative to drive equitable innovation across the region.',
    type: 'news',
    sourceUrl: 'https://www.oxfordequinox.com/articles/building-a-more-inclusive-innovation-ecosystem-in-oxfordshire',
    publishedAt: '2026-03-31',
  },
  {
    title: 'Development Corporation for Greater Oxford announced',
    summary: 'New development corporation to accelerate innovation infrastructure across Greater Oxford.',
    type: 'news',
    sourceUrl: 'https://www.oxfordequinox.com/articles/development-corporation-for-greater-oxford',
    publishedAt: '2026-03-17',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Importing data sources into Oxford university...\n')

  const oxford = await prisma.university.upsert({
    where: { slug: 'oxford' },
    update: {},
    create: { slug: 'oxford', name: 'University of Oxford' },
  })

  // ── OSE Spinouts — Real investable companies ──
  console.log('Importing OSE portfolio spinouts...')
  let spinoutCount = 0
  for (const co of OSE_SPINOUTS) {
    const slug = slugify(co.name)
    await prisma.company.upsert({
      where: { universityId_slug: { universityId: oxford.id, slug } },
      update: {
        description: co.description,
        tags: co.tags,
        sector: co.sector,
        fundingStage: co.fundingStage ?? null,
        website: co.website ?? null,
        isEcosystemOrg: false,
      },
      create: {
        universityId: oxford.id,
        slug,
        name: co.name,
        description: co.description,
        website: co.website ?? null,
        tags: co.tags,
        sector: co.sector,
        segment: co.sector,
        fundingStage: co.fundingStage ?? null,
        isEcosystemOrg: false,
        newThisWeek: false,
      },
    })
    spinoutCount++
  }
  console.log(`  ✓ ${spinoutCount} spinout companies from OSE portfolio`)

  // ── Founders Guide — Ecosystem support orgs ──
  console.log('\nImporting Oxford Founders Guide ecosystem orgs...')
  let ecosystemCount = 0
  for (const org of FOUNDERS_GUIDE_ORGS) {
    const slug = slugify(org.name)
    await prisma.company.upsert({
      where: { universityId_slug: { universityId: oxford.id, slug } },
      update: {
        description: org.description,
        tags: org.tags,
        segment: `${org.stage} Support`,
        website: org.website ?? null,
        isEcosystemOrg: true,
      },
      create: {
        universityId: oxford.id,
        slug,
        name: org.name,
        description: org.description,
        website: org.website ?? null,
        tags: org.tags,
        segment: `${org.stage} Support`,
        isEcosystemOrg: true,
        newThisWeek: false,
      },
    })
    ecosystemCount++
  }
  console.log(`  ✓ ${ecosystemCount} ecosystem orgs from Oxford Founders Guide`)

  // ── Oxford Equinox — Ecosystem org + team ──
  console.log('\nImporting Oxford Equinox...')
  const equinox = await prisma.company.upsert({
    where: { universityId_slug: { universityId: oxford.id, slug: 'oxford-equinox' } },
    update: {
      description: 'Driving equitable, high-impact growth for Oxfordshire by connecting universities, industry, investors and communities.',
      website: 'https://www.oxfordequinox.com',
      tags: ['Ecosystem', 'Innovation', 'Investment', 'Community'],
      segment: 'Ecosystem',
      isEcosystemOrg: true,
    },
    create: {
      universityId: oxford.id,
      slug: 'oxford-equinox',
      name: 'Oxford Equinox',
      description: 'Driving equitable, high-impact growth for Oxfordshire by connecting universities, industry, investors and communities.',
      website: 'https://www.oxfordequinox.com',
      tags: ['Ecosystem', 'Innovation', 'Investment', 'Community'],
      segment: 'Ecosystem',
      isEcosystemOrg: true,
      newThisWeek: false,
    },
  })

  let teamCount = 0
  for (const member of EQUINOX_TEAM) {
    const slug = slugify(`${member.firstName} ${member.lastName}`)
    await prisma.person.upsert({
      where: { universityId_slug: { universityId: oxford.id, slug } },
      update: { companyId: equinox.id, tags: ['Ecosystem', 'Innovation'], segment: member.role },
      create: {
        universityId: oxford.id,
        companyId: equinox.id,
        slug,
        firstName: member.firstName,
        lastName: member.lastName,
        tags: ['Ecosystem', 'Innovation'],
        segment: member.role,
        otherUrls: ['https://www.oxfordequinox.com/team'],
        newThisWeek: false,
      },
    })
    teamCount++
  }
  console.log(`  ✓ Oxford Equinox: 1 org + ${teamCount} team members`)

  // ── Activity Feed ──
  console.log('\nSeeding activity feed...')
  let feedCount = 0
  for (const item of OUI_NEWS) {
    // Find linked company if specified
    let companyId: string | null = null
    if (item.companySlug) {
      const co = await prisma.company.findUnique({
        where: { universityId_slug: { universityId: oxford.id, slug: item.companySlug } },
      })
      if (co) companyId = co.id
    }

    // Deduplicate by title — skip if already exists
    const existing = await prisma.feedItem.findFirst({
      where: { universityId: oxford.id, title: item.title },
    })
    if (!existing) {
      await prisma.feedItem.create({
        data: {
          universityId: oxford.id,
          companyId,
          type: item.type,
          title: item.title,
          summary: item.summary,
          sourceUrl: item.sourceUrl,
          publishedAt: new Date(item.publishedAt),
        },
      })
      feedCount++
    }
  }
  console.log(`  ✓ ${feedCount} feed items created`)

  console.log(`
Import complete.
  OSE Spinouts:          ${spinoutCount} companies
  Ecosystem Orgs:        ${ecosystemCount} organisations
  Oxford Equinox:        1 org + ${teamCount} people
  Activity Feed:         ${feedCount} items
  Total companies:       ${spinoutCount + ecosystemCount + 1}
`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
