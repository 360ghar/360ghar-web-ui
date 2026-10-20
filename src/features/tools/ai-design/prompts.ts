/**
 * Room types, style presets and the prompt text, same as the old site
 * (components/design/*, pages/tools/AIDesignStudio.jsx). Prompts stay in
 * English because the image models work best with English prompts.
 */

type L = { en: string; hi: string };
export type DesignType = 'interior' | 'exterior';
export type Mode = 'text' | 'image';

export const ROOMS: Record<DesignType, { id: string; label: L }[]> = {
  interior: [
    { id: 'living-room', label: { en: 'Living Room', hi: 'लिविंग रूम' } },
    { id: 'bedroom', label: { en: 'Bedroom', hi: 'बेडरूम' } },
    { id: 'kitchen', label: { en: 'Kitchen', hi: 'रसोई' } },
    { id: 'bathroom', label: { en: 'Bathroom', hi: 'बाथरूम' } },
    { id: 'dining-room', label: { en: 'Dining Room', hi: 'डाइनिंग रूम' } },
    { id: 'home-office', label: { en: 'Home Office', hi: 'होम ऑफ़िस' } },
    { id: 'pooja-room', label: { en: 'Pooja Room', hi: 'पूजा घर' } },
    { id: 'balcony', label: { en: 'Balcony', hi: 'बालकनी' } },
    { id: 'terrace', label: { en: 'Terrace', hi: 'छत' } },
    { id: 'entrance', label: { en: 'Entrance', hi: 'प्रवेश' } },
  ],
  exterior: [
    { id: 'facade', label: { en: 'House Facade', hi: 'घर का सामने का हिस्सा' } },
    { id: 'garden', label: { en: 'Garden', hi: 'बगीचा' } },
    { id: 'entrance-gate', label: { en: 'Entrance Gate', hi: 'मुख्य गेट' } },
    { id: 'balcony-exterior', label: { en: 'Balcony', hi: 'बालकनी' } },
    { id: 'terrace-garden', label: { en: 'Terrace Garden', hi: 'टैरेस गार्डन' } },
    { id: 'parking', label: { en: 'Parking Area', hi: 'पार्किंग' } },
    { id: 'swimming-pool', label: { en: 'Swimming Pool', hi: 'स्विमिंग पूल' } },
  ],
};

export const STYLES: { id: string; label: L; desc: L; prompt: string }[] = [
  {
    id: 'modern',
    label: { en: 'Modern', hi: 'मॉडर्न' },
    desc: { en: 'Clean lines, neutral colours, simple furniture.', hi: 'सीधी रेखाएँ, हल्के रंग, सादा फ़र्नीचर।' },
    prompt: 'modern minimalist design with clean lines, neutral color palette, sleek furniture, open spaces',
  },
  {
    id: 'traditional-indian',
    label: { en: 'Traditional Indian', hi: 'पारंपरिक भारतीय' },
    desc: { en: 'Rich colours, carved wood, brass and jaali work.', hi: 'गहरे रंग, नक्काशीदार लकड़ी, पीतल और जाली का काम।' },
    prompt: 'traditional Indian design with rich warm colors, carved wooden furniture, ethnic patterns, brass accents, jaali work',
  },
  {
    id: 'contemporary',
    label: { en: 'Contemporary', hi: 'कंटेम्पररी' },
    desc: { en: 'Mixed materials, bold accents, statement pieces.', hi: 'मिले-जुले मटीरियल, गहरे रंग के लहजे, ख़ास चीज़ें।' },
    prompt: 'contemporary design with current trends, mixed materials, bold accent colors, statement pieces',
  },
  {
    id: 'minimalist',
    label: { en: 'Minimalist', hi: 'मिनिमलिस्ट' },
    desc: { en: 'Simple, useful and free of clutter.', hi: 'सादा, काम का और बिना भीड़-भाड़।' },
    prompt: 'minimalist design with simple forms, functional furniture, clutter-free space, white and neutral tones',
  },
  {
    id: 'luxury',
    label: { en: 'Luxury', hi: 'लग्ज़री' },
    desc: { en: 'Marble, gold trim, a chandelier, plush seating.', hi: 'संगमरमर, सुनहरी किनारी, झूमर, आरामदेह बैठक।' },
    prompt: 'luxury design with high-end materials, marble, gold accents, elegant chandelier, plush furniture, premium finishes',
  },
  {
    id: 'scandinavian',
    label: { en: 'Scandinavian', hi: 'स्कैंडिनेवियन' },
    desc: { en: 'Light wood, white walls, soft textiles.', hi: 'हल्की लकड़ी, सफ़ेद दीवारें, मुलायम कपड़े।' },
    prompt: 'Scandinavian design with light wood, white walls, cozy textiles, hygge atmosphere, natural light',
  },
  {
    id: 'industrial',
    label: { en: 'Industrial', hi: 'इंडस्ट्रियल' },
    desc: { en: 'Exposed brick, metal and raw materials.', hi: 'खुली ईंट, धातु और कच्चा मटीरियल।' },
    prompt: 'industrial design with exposed brick walls, metal accents, raw materials, pendant lights, urban loft style',
  },
  {
    id: 'bohemian',
    label: { en: 'Bohemian', hi: 'बोहेमियन' },
    desc: { en: 'Eclectic mix, bright colours, many plants.', hi: 'रंग-बिरंगा मेल, चटक रंग, ढेर सारे पौधे।' },
    prompt: 'bohemian design with eclectic mix, vibrant colors, global patterns, plants, macrame, layered textiles',
  },
  {
    id: 'art-deco',
    label: { en: 'Art Deco', hi: 'आर्ट डेको' },
    desc: { en: 'Geometric patterns, velvet and brass.', hi: 'ज्यामितीय पैटर्न, मखमल और पीतल।' },
    prompt: 'art deco design with geometric patterns, luxurious materials, gold accents, velvet, glamorous aesthetic',
  },
  {
    id: 'rustic',
    label: { en: 'Rustic', hi: 'रस्टिक' },
    desc: { en: 'Natural wood and stone, warm earth tones.', hi: 'प्राकृतिक लकड़ी और पत्थर, मिट्टी जैसे गर्म रंग।' },
    prompt: 'rustic design with natural wood, stone, warm earthy tones, farmhouse charm, vintage elements',
  },
  {
    id: 'mediterranean',
    label: { en: 'Mediterranean', hi: 'मेडिटेरेनियन' },
    desc: { en: 'Terracotta, blue accents, arched doorways.', hi: 'टेराकोटा, नीले लहजे, मेहराबदार दरवाज़े।' },
    prompt: 'Mediterranean design with terracotta tiles, blue accents, arched doorways, white walls, warm sunlight',
  },
  {
    id: 'japanese',
    label: { en: 'Japanese', hi: 'जापानी' },
    desc: { en: 'Calm, natural materials, sliding panels.', hi: 'शांत, प्राकृतिक मटीरियल, सरकने वाले पैनल।' },
    prompt: 'Japanese design with zen aesthetics, natural materials, shoji screens, tatami, minimalist arrangement, bamboo',
  },
];

export const MAX_PROMPT = 500;

/** Text-to-image prompt (old buildPrompt). */
export function buildPrompt(o: { designType: DesignType; room: string; style: string; custom: string }): string {
  const room = ROOMS[o.designType].find((r) => r.id === o.room)?.label.en ?? o.room;
  const style = STYLES.find((s) => s.id === o.style)?.prompt ?? o.style;
  const base = o.designType === 'interior' ? `Interior design of a ${room}` : `Exterior design of a ${room}`;
  return [
    base,
    style,
    o.custom.trim(),
    'Professional architectural visualization',
    'high quality',
    'photorealistic',
    'well-lit',
    'detailed textures',
    '8K resolution',
  ]
    .filter(Boolean)
    .join(', ');
}

/** Image-to-image prompt (old buildReimaginePrompt): keep the room, restyle the surfaces. */
export function buildReimaginePrompt(o: { style: string; custom: string }): string {
  const style = STYLES.find((s) => s.id === o.style)?.prompt ?? '';
  const custom = o.custom.trim();
  return [
    'STRICT RULES. You MUST follow every rule below:',
    '1. The uploaded image is the REFERENCE. Reproduce its exact room layout, architecture, walls, windows, doors, ceiling, floor plan, and furniture positions pixel-for-pixel.',
    '2. Do NOT add, remove, or relocate any furniture, walls, doors, or windows.',
    '3. Do NOT change the camera angle, perspective, lens distortion, or viewpoint.',
    '4. ONLY change: surface colors, materials, textures, fabrics, finishes, decor accessories, wall art, plants, and styling.',
    '5. Maintain the exact same lighting direction, shadow angles, and natural light sources.',
    style ? `6. Apply a ${style} interior design style to all surfaces and decor.` : null,
    '7. Output a photorealistic, professional interior design rendering.',
    '8. The result must look like the SAME room photographed from the SAME angle, just restyled.',
    custom ? `Additional user instructions: ${custom}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
