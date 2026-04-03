/**
 * Import additional Oxford spinout companies from OUI full portfolio
 * and Oxford Capital Partners "Backing Founders" portfolio.
 *
 * These are earlier-stage companies (Pre-Seed, Seed) not in the OSE portfolio.
 * Source: https://innovation.ox.ac.uk/portfolio/companies-formed/
 *         https://www.oxcp.com/portfolio
 *
 * Run with: npx tsx scripts/import-oui-companies.ts
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

// OUI incubator companies — very early stage, just incorporated
const OUI_INCUBATOR: Array<{
  name: string
  description: string
  website?: string
  sector: string
  fundingStage: string
  tags: string[]
}> = [
  { name: 'Streamline', description: 'Music industry cloud-based media asset management system', sector: 'Deep Tech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'Music Tech', 'SaaS'] },
  { name: 'neurohaus', description: 'Consultancy identifying neurodiversity impact on consumer behaviour', sector: 'Deep Tech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'Neurodiversity', 'Consulting'] },
  { name: 'Allos AI', description: 'Automating the moving parts of healthcare', sector: 'HealthTech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'HealthTech', 'AI'] },
  { name: 'Sens Vue', description: 'Precision ophthalmological device for vision health', sector: 'HealthTech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'MedTech', 'Ophthalmology'] },
  { name: 'GaitQ', description: 'Wearable device treating Parkinson\'s gait disorders via neural cueing', sector: 'HealthTech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'MedTech', 'Neuroscience', 'Wearable'] },
  { name: 'Kiku Health', description: 'Digital breathing coach; wearable device for breathing habits and wellness', sector: 'HealthTech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'Digital Health', 'Wearable'] },
  { name: 'Vaximap', description: 'System for GPs to efficiently administer vaccinations and track immunisation', sector: 'HealthTech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'Digital Health', 'Vaccines'] },
  { name: 'Ujji', description: 'Gamification approach to personal and career development', sector: 'Deep Tech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'EdTech', 'Gamification'] },
  { name: 'aWonderland', description: 'AI image analysis tool for insurance crop damage assessment', sector: 'Deep Tech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'AgriTech', 'AI', 'InsurTech'] },
  { name: 'Biomo', description: 'App gathering and analysing health and wellness data using wearables', sector: 'HealthTech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'Digital Health', 'Data'] },
  { name: 'Agora', description: 'Global institutional collaboration platform for research communities', sector: 'Deep Tech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'Research', 'SaaS'] },
  { name: 'MariTest', description: 'Non-invasive rapid diagnostic test for malaria, StEP Ignite 2024 winner', sector: 'HealthTech', fundingStage: 'Pre-Seed', tags: ['Oxford Spinout', 'OUI Incubator', 'Diagnostics', 'Infectious Disease'] },
]

// Oxford Capital Partners "Backing Founders" — seed stage, investor-backed
const OXCP_BACKING_FOUNDERS: Array<{
  name: string
  description: string
  website?: string
  sector: string
  fundingStage: string
  tags: string[]
}> = [
  { name: 'Arcube', description: 'Helps airlines boost customer loyalty through personalised, real-time rewards', website: 'https://www.arcube.org', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'Travel Tech', 'Loyalty'] },
  { name: 'TurinTech', description: 'AI tools for developers to generate and optimise their code', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'AI', 'Developer Tools'] },
  { name: 'Ergodic', description: 'AI platform for enterprise decision-making under uncertainty', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'AI', 'Enterprise'] },
  { name: 'Egregious', description: 'Safeguarding enterprises against AI-driven deception, misinformation, and digital risks', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'AI', 'Cybersecurity'] },
  { name: 'FinCrime Dynamics', description: 'Powering AI for financial crime prevention and AML compliance', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'FinTech', 'AI', 'Compliance'] },
  { name: 'HealthKey', description: 'The integration layer for healthcare access and payments', sector: 'HealthTech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'HealthTech', 'FinTech'] },
  { name: 'Noggin', description: 'Enabling equitable access to credit for underserved communities', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'FinTech', 'Financial Inclusion'] },
  { name: 'Hoxton AI', description: 'Occupancy software to help optimise the use of buildings and public spaces', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'Proptech', 'AI', 'IoT'] },
  { name: 'Legislate', description: 'AI tools to help businesses create, manage and understand their critical documents', website: 'https://www.legislate.tech', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'LegalTech', 'AI'] },
  { name: 'Log My Care', description: 'Digital platform for the care sector to replace paper-based records', sector: 'HealthTech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'HealthTech', 'Digital Health', 'Care'] },
  { name: 'Bower Collective', description: 'Sustainable household and personal care products in reusable packaging', website: 'https://www.bowercollective.com', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'Sustainability', 'Consumer', 'CleanTech'] },
  { name: 'Blueberry Life', description: 'Life insurance for those with chronic illnesses, making coverage accessible', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'InsurTech', 'FinTech'] },
  { name: 'Zamna', description: 'Revolutionising digital identity verification for airlines and travel', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'Identity', 'Travel Tech'] },
  { name: 'Shuffle Finance', description: 'Growth capital to restaurants via a consumer rewards app', sector: 'Deep Tech', fundingStage: 'Seed', tags: ['Oxford Capital', 'Seed', 'FinTech', 'Hospitality'] },
  { name: 'Red Sift', description: 'Cybersecurity software to protect businesses from email-based attacks', website: 'https://redsift.com', sector: 'Deep Tech', fundingStage: 'Early Stage', tags: ['Oxford Capital', 'Growth', 'Cybersecurity', 'Email Security'] },
  { name: 'Oxford Biotherapeutics', description: 'Clinical stage immunotherapies targeting tumour-associated antigens for cancer', website: 'https://www.oxfordbiotherapeutics.com', sector: 'Life Sciences', fundingStage: 'Early Stage', tags: ['Oxford Capital', 'Growth', 'Oncology', 'Immunotherapy'] },
  { name: 'Attest', description: 'Digital platform to make consumer research faster, more accessible and actionable', website: 'https://www.askattest.com', sector: 'Deep Tech', fundingStage: 'Early Stage', tags: ['Oxford Capital', 'Growth', 'SaaS', 'Market Research'] },
]

// Sample OUI Technologies available for licensing — pre-company IP pipeline
// Source: https://innovation.ox.ac.uk/technologies-available/technology-licensing/
// These represent the very earliest stage investment signal — IP looking for commercialisation
const OUI_TECHNOLOGIES = [
  { title: 'Biomarker assay for predicting Alzheimer\'s risk from plasma proteins', sector: 'Life Sciences', tags: ['Diagnostics', 'Neuroscience', 'Biomarker'] },
  { title: 'Novel gene editing approach to increase BDNF expression for neurological disease', sector: 'Life Sciences', tags: ['Gene Editing', 'Neuroscience', 'Therapeutics'] },
  { title: 'Novel lithium alloy electrode for fast battery discharge', sector: 'Deep Tech', tags: ['Energy Storage', 'Battery', 'Materials'] },
  { title: 'Light magnesium alloying of lithium for solid-state battery performance', sector: 'Deep Tech', tags: ['Energy Storage', 'Battery', 'Materials'] },
  { title: 'Halogen-rich argyrodites for lithium-sulphur batteries', sector: 'Deep Tech', tags: ['Energy Storage', 'Battery', 'CleanTech'] },
  { title: 'Accurate and comprehensive analysis platform for top-down proteomics', sector: 'Life Sciences', tags: ['Proteomics', 'Drug Discovery', 'Software'] },
  { title: '10x faster blood oxygen saturation measurement with external pressure modulation', sector: 'HealthTech', tags: ['Diagnostics', 'MedTech', 'Wearable'] },
  { title: 'CD61-CD103 immune synapse platform for boosting tumour-killing T-cells', sector: 'Life Sciences', tags: ['Immunotherapy', 'Oncology', 'Cell Therapy'] },
  { title: 'CD1a-restricted T-cell receptor for novel immunotherapies', sector: 'Life Sciences', tags: ['Immunotherapy', 'T-Cell', 'Drug Discovery'] },
  { title: 'Internal blade structures for turbine cooling efficiency', sector: 'Deep Tech', tags: ['Engineering', 'CleanTech', 'Energy'] },
  { title: 'Universal optical modulator for photonic computing', sector: 'Deep Tech', tags: ['Photonics', 'Computing', 'Hardware'] },
  { title: 'CRISPR-based RNA therapeutics platform for genetic diseases', sector: 'Life Sciences', tags: ['Gene Therapy', 'RNA', 'Rare Disease'] },
  { title: 'AI system for high-stakes decision-making in unseen scenarios', sector: 'Deep Tech', tags: ['AI', 'Decision Systems', 'Enterprise'] },
  { title: 'Quantum random number generation from vacuum fluctuations', sector: 'Deep Tech', tags: ['Quantum', 'Cybersecurity', 'Hardware'] },
  { title: 'Non-invasive malaria rapid diagnostic via Raman spectroscopy', sector: 'HealthTech', tags: ['Diagnostics', 'Infectious Disease', 'Medical Devices'] },
  { title: 'Synthetic spider silk biopolymer for medical and industrial applications', sector: 'Deep Tech', tags: ['Biomaterials', 'Manufacturing', 'Medical Devices'] },
  { title: 'Chromatin modulation small molecules for cancer-linked disordered proteins', sector: 'Life Sciences', tags: ['Oncology', 'Drug Discovery', 'Epigenetics'] },
  { title: 'Photonic chip for AI inference at ultra-low energy consumption', sector: 'Deep Tech', tags: ['Photonics', 'AI', 'Semiconductors'] },
  { title: 'T-cell receptor mapping platform for personalised immunotherapy', sector: 'Life Sciences', tags: ['Immunology', 'Precision Medicine', 'Drug Discovery'] },
  { title: 'Quantum control systems for scalable qubit coherence', sector: 'Deep Tech', tags: ['Quantum', 'Hardware', 'Computing'] },
]

async function main() {
  console.log('Importing additional OUI and Oxford Capital companies...\n')

  const oxford = await prisma.university.upsert({
    where: { slug: 'oxford' },
    update: {},
    create: { slug: 'oxford', name: 'University of Oxford' },
  })

  // ── OUI Incubator companies ──
  console.log('Importing OUI Incubator companies (pre-seed)...')
  let incubatorCount = 0
  for (const co of OUI_INCUBATOR) {
    const slug = slugify(co.name)
    await prisma.company.upsert({
      where: { universityId_slug: { universityId: oxford.id, slug } },
      update: {
        description: co.description,
        tags: co.tags,
        sector: co.sector,
        segment: co.sector,
        fundingStage: co.fundingStage,
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
        fundingStage: co.fundingStage,
        isEcosystemOrg: false,
        newThisWeek: false,
      },
    })
    incubatorCount++
  }
  console.log(`  ✓ ${incubatorCount} OUI Incubator companies`)

  // ── Oxford Capital Backing Founders ──
  console.log('\nImporting Oxford Capital Backing Founders companies...')
  let oxcpCount = 0
  for (const co of OXCP_BACKING_FOUNDERS) {
    const slug = slugify(co.name)
    await prisma.company.upsert({
      where: { universityId_slug: { universityId: oxford.id, slug } },
      update: {
        description: co.description,
        tags: co.tags,
        sector: co.sector,
        segment: co.sector,
        fundingStage: co.fundingStage,
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
        fundingStage: co.fundingStage,
        isEcosystemOrg: false,
        newThisWeek: false,
      },
    })
    oxcpCount++
  }
  console.log(`  ✓ ${oxcpCount} Oxford Capital Backing Founders companies`)

  // ── OUI Technologies (pre-company IP pipeline) ──
  console.log('\nImporting OUI technology licensing pipeline...')
  let techCount = 0
  for (const tech of OUI_TECHNOLOGIES) {
    const existing = await prisma.technology.findFirst({
      where: { universityId: oxford.id, title: tech.title },
    })
    if (!existing) {
      await prisma.technology.create({
        data: {
          universityId: oxford.id,
          title: tech.title,
          sector: tech.sector,
          tags: tech.tags,
          status: 'available',
          sourceUrl: 'https://innovation.ox.ac.uk/technologies-available/technology-licensing/',
        },
      })
      techCount++
    }
  }
  console.log(`  ✓ ${techCount} OUI technologies created`)

  console.log(`
Import complete.
  OUI Incubator:         ${incubatorCount} companies (pre-seed)
  Oxford Capital:        ${oxcpCount} companies (seed/early stage)
  OUI Technologies:      ${techCount} pre-company IP listings
`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
