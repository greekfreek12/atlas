/**
 * Generate service images using Wavespeed API (Google Nano Banana Pro)
 *
 * Usage: node scripts/generate-service-images.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
const API_ENDPOINT = 'https://api.wavespeed.ai/api/v3/google/nano-banana-pro/text-to-image';

// Plumber service images - NO PEOPLE, two variations each
const SERVICE_IMAGES = [
  // Emergency Plumbing
  {
    name: 'Emergency Plumbing',
    slug: 'emergency-plumbing-1',
    prompt: 'Burst copper pipe under kitchen sink spraying water dramatically, water droplets frozen in motion, modern kitchen cabinet interior, dramatic lighting, realistic photography, 35mm lens'
  },
  {
    name: 'Emergency Plumbing',
    slug: 'emergency-plumbing-2',
    prompt: 'Flooded bathroom floor with water pooling around base of toilet, emergency plumbing situation, wet tile reflections, cinematic lighting, realistic photography'
  },
  // Drain Cleaning
  {
    name: 'Drain Cleaning',
    slug: 'drain-cleaning-1',
    prompt: 'Close-up of chrome bathroom sink drain with professional drain snake tool inserted, clean white porcelain sink, soft lighting, realistic photography, detailed textures'
  },
  {
    name: 'Drain Cleaning',
    slug: 'drain-cleaning-2',
    prompt: 'Professional drain cleaning equipment and tools laid out on clean surface, coiled drain snake, inspection camera, modern plumbing tools, product photography style'
  },
  // Water Heater Services
  {
    name: 'Water Heater Services',
    slug: 'water-heater-services-1',
    prompt: 'Modern tankless water heater unit mounted on utility room wall, sleek white design with digital display, clean installation with copper pipes, warm lighting, realistic photography'
  },
  {
    name: 'Water Heater Services',
    slug: 'water-heater-services-2',
    prompt: 'Traditional tank water heater in basement utility area, white cylindrical tank with pipes and valves, industrial setting, soft overhead lighting, realistic photography'
  },
  // Leak Detection
  {
    name: 'Leak Detection',
    slug: 'leak-detection-1',
    prompt: 'Water stain spreading on white ceiling drywall, early signs of hidden leak damage, residential interior, natural daylight from window, realistic photography'
  },
  {
    name: 'Leak Detection',
    slug: 'leak-detection-2',
    prompt: 'Electronic leak detection equipment and moisture meter on countertop, professional diagnostic tools, modern technology, clean product photography style'
  },
  // Fixture Installation
  {
    name: 'Fixture Installation',
    slug: 'fixture-installation-1',
    prompt: 'Beautiful modern chrome faucet on white marble bathroom vanity, water droplets on polished surface, luxury bathroom detail, soft natural lighting, realistic photography'
  },
  {
    name: 'Fixture Installation',
    slug: 'fixture-installation-2',
    prompt: 'New rainfall showerhead installed in modern tiled shower, water streaming down, steam visible, spa-like bathroom atmosphere, cinematic lighting, realistic photography'
  },
  // Pipe Repair
  {
    name: 'Pipe Repair',
    slug: 'pipe-repair-1',
    prompt: 'Exposed copper pipes in basement ceiling with new soldered joint, industrial plumbing infrastructure, dramatic lighting highlighting metallic surfaces, realistic photography'
  },
  {
    name: 'Pipe Repair',
    slug: 'pipe-repair-2',
    prompt: 'Collection of copper pipe fittings, elbows, and connectors arranged on workbench, professional plumbing supplies, warm metallic tones, product photography style'
  },
  // Sewer Line Services
  {
    name: 'Sewer Line Services',
    slug: 'sewer-line-services-1',
    prompt: 'Sewer camera inspection monitor showing interior of clean pipe, diagnostic screen with pipeline view, professional equipment, technical photography style'
  },
  {
    name: 'Sewer Line Services',
    slug: 'sewer-line-services-2',
    prompt: 'Outdoor sewer cleanout access cap in residential lawn, green grass surrounding white PVC cap, suburban home exterior, natural daylight, realistic photography'
  },
  // Water Treatment
  {
    name: 'Water Treatment',
    slug: 'water-treatment-1',
    prompt: 'Modern whole-house water filtration system with blue tanks and white pipes installed in utility room, professional installation, bright clean lighting, realistic photography'
  },
  {
    name: 'Water Treatment',
    slug: 'water-treatment-2',
    prompt: 'Under-sink reverse osmosis water filter system with multiple canisters, modern kitchen cabinet interior, clean installation, soft lighting, realistic photography'
  }
];

async function generateImage(config) {
  console.log(`\nGenerating image for: ${config.name}`);
  console.log(`Prompt: ${config.prompt.substring(0, 80)}...`);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: config.prompt,
        aspect_ratio: '16:9',
        resolution: '2k',
        output_format: 'jpeg',
        enable_sync_mode: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      return null;
    }

    const result = await response.json();

    if (result.data.status === 'completed' && result.data.outputs?.[0]) {
      const imageUrl = result.data.outputs[0];
      console.log(`✓ Generated: ${imageUrl}`);
      return imageUrl;
    } else {
      console.error(`Generation failed with status: ${result.data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error generating image:`, error);
    return null;
  }
}

async function downloadImage(url, filename) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const outputDir = path.join(process.cwd(), 'public', 'images', 'services');

  fs.mkdirSync(outputDir, { recursive: true });

  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`✓ Saved: ${filepath}`);
}

async function main() {
  if (!WAVESPEED_API_KEY) {
    console.error('WAVESPEED_API_KEY not set in environment');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Service Image Generator - Google Nano Banana Pro');
  console.log('='.repeat(60));
  console.log(`API Key: ${WAVESPEED_API_KEY.substring(0, 8)}...`);

  const results = {};

  for (const config of SERVICE_IMAGES) {
    const imageUrl = await generateImage(config);

    if (imageUrl) {
      const filename = `${config.slug}.jpg`;
      await downloadImage(imageUrl, filename);
      results[config.slug] = `/images/services/${filename}`;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Generated Image Mapping:');
  console.log('='.repeat(60));
  console.log(JSON.stringify(results, null, 2));

  const mappingPath = path.join(process.cwd(), 'public', 'images', 'services', 'mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\nMapping saved to: ${mappingPath}`);
}

main().catch(console.error);
