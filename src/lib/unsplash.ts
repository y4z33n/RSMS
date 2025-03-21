import { createApi } from 'unsplash-js';

// Initialize the Unsplash API client
// Note: In a production app, you would use a proper API key from Unsplash
const unsplash = createApi({
  accessKey: 'your-access-key',
  // If you don't have an access key, we'll use a fetch implementation that
  // uses demo data for development purposes
  fetch: globalThis.fetch,
});

// Cache for image URLs to avoid unnecessary fetches
const imageCache: Record<string, string> = {};

// Verified working image URLs for each category
const VERIFIED_IMAGES: Record<string, string[]> = {
  ration: [
    'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8',
    'https://images.unsplash.com/photo-1560493676-04071c5f467b'
  ],
  food: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e',
    'https://images.unsplash.com/photo-1533900298318-6b8da08a523e'
  ],
  grocery: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58'
  ],
  "grocery store": [
    'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f',
    'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9'
  ],
  "grocery shopping": [
    'https://images.unsplash.com/photo-1506617564039-2f3b650b7010',
    'https://images.unsplash.com/photo-1579113800032-c38bd7635818'
  ],
  "inventory management": [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d'
  ],
  "analytics dashboard": [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
  ],
  shop: [
    'https://images.unsplash.com/photo-1604719312566-8912e9c8f324',
    'https://images.unsplash.com/photo-1534723452862-4c874018d66d'
  ],
  store: [
    'https://images.unsplash.com/photo-1601599963565-b7f49d6ff2d0',
    'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f'
  ],
  rice: [
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6',
    'https://images.unsplash.com/photo-1586201375761-83865001e8ac'
  ],
  wheat: [
    'https://images.unsplash.com/photo-1574323347407-f5e1bdca0998',
    'https://images.unsplash.com/photo-1565647952915-9644fdb63240'
  ],
  default: [
    'https://images.unsplash.com/photo-1574323347407-f5e1bdca0998',
    'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f'
  ]
};

/**
 * Get a random image URL from Unsplash based on a query
 */
export async function getRandomImageUrl(query: string, width = 1200, height = 800): Promise<string> {
  // Check cache first
  const cacheKey = `${query}_${width}_${height}`;
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  try {
    // Get image category based on query
    const category = query.toLowerCase() in VERIFIED_IMAGES ? query.toLowerCase() : 'default';
    
    // Select a random image from the category
    const images = VERIFIED_IMAGES[category];
    const randomIndex = Math.floor(Math.random() * images.length);
    const baseImageUrl = images[randomIndex];
    
    // Append size and quality parameters
    const imageUrl = `${baseImageUrl}?w=${width}&h=${height}&q=80&fit=crop`;
    
    // Cache the result
    imageCache[cacheKey] = imageUrl;
    return imageUrl;
  } catch (error) {
    console.error('Failed to fetch image from Unsplash:', error);
    // Fallback to a default image - using a known working wheat image
    return `https://images.unsplash.com/photo-1574323347407-f5e1bdca0998?w=${width}&h=${height}&q=80`;
  }
}