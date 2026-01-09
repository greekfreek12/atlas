/**
 * Generate service images using Wavespeed API (Google Nano Banana Pro)
 *
 * Usage: npx ts-node scripts/generate-service-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
const API_ENDPOINT = 'https://api.wavespeed.ai/api/v3/google/nano-banana-pro/text-to-image';

interface ServiceImageConfig {
  name: string;
  slug: string;
  prompt: string;
}

// Plumber service images with carefully crafted prompts
const SERVICE_IMAGES: ServiceImageConfig[] = [
  {
    name: 'Emergency Plumbing',
    slug: 'emergency-plumbing',
    prompt: 'Professional plumber in blue uniform urgently repairing a burst pipe under a kitchen sink, water spraying, dramatic lighting, realistic photography, 35mm lens, shallow depth of field'
  },
  {
    name: 'Drain Cleaning',
    slug: 'drain-cleaning',
    prompt: 'Close-up of a professional plumber using a drain snake tool on a bathroom sink drain, clean modern bathroom, soft natural lighting, realistic photography, detailed textures'
  },
  {
    name: 'Water Heater Services',
    slug: 'water-heater-services',
    prompt: 'Professional technician inspecting a modern tankless water heater mounted on a utility room wall, wearing safety gear, warm lighting, realistic photography, clean composition'
  },
  {
    name: 'Leak Detection',
    slug: 'leak-detection-repair',
    prompt: 'Plumber using electronic leak detection equipment on a wall, professional tools visible, modern home interior, focused lighting on the work area, realistic photography'
  },
  {
    name: 'Fixture Installation',
    slug: 'fixture-installation',
    prompt: 'Hands of a professional plumber installing a modern chrome faucet on a white bathroom vanity, clean bright bathroom, close-up detail shot, realistic photography'
  },
  {
    name: 'Pipe Repair',
    slug: 'pipe-repair-replacement',
    prompt: 'Professional plumber welding copper pipes in a basement, sparks visible, safety equipment, industrial lighting, realistic photography, wide angle shot'
  },
  {
    name: 'Sewer Line Services',
    slug: 'sewer-line-services',
    prompt: 'Professional plumber operating a sewer camera inspection system, monitor showing pipe interior, outdoor residential setting, realistic photography, natural daylight'
  },
  {
    name: 'Water Treatment',
    slug: 'water-treatment',
    prompt: 'Modern whole-house water filtration system installed in a clean utility room, blue tanks and white pipes, professional installation, realistic photography, bright clean lighting'
  }
];

interface WavespeedResponse {
  data: {
    id: string;
    status: string;
    outputs?: string[];
  };
}

async function generateImage(config: ServiceImageConfig): Promise<string | null> {
  console.log(`\nGenerating image for: ${config.name}`);
  console.log(`Prompt: ${config.prompt.substring(0, 80)}...`);

  try {
    // Submit generation request
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: config.prompt,
        aspect_ratio: '16:9', // Good for hero/banner images
        resolution: '2k',
        output_format: 'jpeg',
        enable_sync_mode: true // Wait for completion
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      return null;
    }

    const result: WavespeedResponse = await response.json();

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

async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const outputDir = path.join(process.cwd(), 'public', 'images', 'services');

  // Ensure directory exists
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

  const results: Record<string, string> = {};

  for (const config of SERVICE_IMAGES) {
    const imageUrl = await generateImage(config);

    if (imageUrl) {
      // Download and save locally
      const filename = `${config.slug}.jpg`;
      await downloadImage(imageUrl, filename);
      results[config.slug] = `/images/services/${filename}`;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Output the mapping for use in code
  console.log('\n' + '='.repeat(60));
  console.log('Generated Image Mapping:');
  console.log('='.repeat(60));
  console.log(JSON.stringify(results, null, 2));

  // Save mapping to file
  const mappingPath = path.join(process.cwd(), 'public', 'images', 'services', 'mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\nMapping saved to: ${mappingPath}`);
}

main().catch(console.error);
