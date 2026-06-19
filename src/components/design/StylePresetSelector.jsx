import { useState }  from 'react';

/**
 * Style presets with detailed descriptions for prompt engineering
 */
const STYLE_PRESETS = [
  {
    id: 'modern',
    label: 'Modern',
    desc: 'Clean lines, neutral colors, minimalist furniture',
    icon: 'fas fa-couch',
    example: 'Think: sleek white sofa, glass coffee table, chrome accents',
    promptText: 'modern minimalist design with clean lines, neutral color palette, sleek furniture, open spaces',
  },
  {
    id: 'traditional-indian',
    label: 'Traditional Indian',
    desc: 'Rich colors, wooden furniture, ethnic patterns',
    icon: 'fas fa-mosque',
    example: 'Think: carved teak swing, brass lamps, jaali screens, silk cushions',
    promptText: 'traditional Indian design with rich warm colors, carved wooden furniture, ethnic patterns, brass accents, jaali work',
  },
  {
    id: 'contemporary',
    label: 'Contemporary',
    desc: 'Current trends, mixed materials, bold accents',
    icon: 'fas fa-shapes',
    example: 'Think: mixed metals, bold artwork, statement lighting',
    promptText: 'contemporary design with current trends, mixed materials, bold accent colors, statement pieces',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    desc: 'Simple, functional, clutter-free spaces',
    icon: 'fas fa-square',
    example: 'Think: white walls, hidden storage, a single statement plant',
    promptText: 'minimalist design with simple forms, functional furniture, clutter-free space, white and neutral tones',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    desc: 'High-end materials, elegant finishes',
    icon: 'fas fa-gem',
    example: 'Think: marble floors, gold trim, crystal chandelier, velvet',
    promptText: 'luxury design with high-end materials, marble, gold accents, elegant chandelier, plush furniture, premium finishes',
  },
  {
    id: 'scandinavian',
    label: 'Scandinavian',
    desc: 'Light woods, white walls, cozy textiles',
    icon: 'fas fa-leaf',
    example: 'Think: pale oak floors, knit throws, soft greys, hygge',
    promptText: 'Scandinavian design with light wood, white walls, cozy textiles, hygge atmosphere, natural light',
  },
  {
    id: 'industrial',
    label: 'Industrial',
    desc: 'Exposed brick, metal accents, raw materials',
    icon: 'fas fa-industry',
    example: 'Think: brick walls, edison bulbs, steel frames, concrete',
    promptText: 'industrial design with exposed brick walls, metal accents, raw materials, pendant lights, urban loft style',
  },
  {
    id: 'bohemian',
    label: 'Bohemian',
    desc: 'Eclectic mix, vibrant colors, global influences',
    icon: 'fas fa-palette',
    example: 'Think: macrame wall hangings, layered rugs, lots of plants',
    promptText: 'bohemian design with eclectic mix, vibrant colors, global patterns, plants, macrame, layered textiles',
  },
  {
    id: 'art-deco',
    label: 'Art Deco',
    desc: 'Geometric patterns, luxurious materials',
    icon: 'fas fa-star',
    example: 'Think: geometric mirrors, velvet emerald chairs, brass',
    promptText: 'art deco design with geometric patterns, luxurious materials, gold accents, velvet, glamorous aesthetic',
  },
  {
    id: 'rustic',
    label: 'Rustic',
    desc: 'Natural materials, warm tones, farmhouse charm',
    icon: 'fas fa-tree',
    example: 'Think: reclaimed barn wood, stone fireplace, warm earth tones',
    promptText: 'rustic design with natural wood, stone, warm earthy tones, farmhouse charm, vintage elements',
  },
  {
    id: 'mediterranean',
    label: 'Mediterranean',
    desc: 'Terracotta, blue accents, arched doorways',
    icon: 'fas fa-archway',
    example: 'Think: terracotta tiles, arched windows, whitewashed walls',
    promptText: 'Mediterranean design with terracotta tiles, blue accents, arched doorways, white walls, warm sunlight',
  },
  {
    id: 'japanese',
    label: 'Japanese',
    desc: 'Zen aesthetics, natural elements, sliding panels',
    icon: 'fas fa-torii-gate',
    example: 'Think: shoji screens, tatami mats, bamboo, low furniture',
    promptText: 'Japanese design with zen aesthetics, natural materials, shoji screens, tatami, minimalist arrangement, bamboo',
  },
];

/**
 * StylePresetSelector - Select design style with visual cards
 */
const StylePresetSelector = ({ value, onChange }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleStyles = showAll ? STYLE_PRESETS : STYLE_PRESETS.slice(0, 8);

  return (
    <div className="style-preset-selector">
      <label className="form-label mb-3">
        <i className="fas fa-paint-brush me-2"></i>
        Design Style
        <span className="text-danger ms-1">*</span>
      </label>

      <div className="style-preset-grid">
        {visibleStyles.map((style) => (
          <button
            key={style.id}
            type="button"
            className={`style-preset-card ${value === style.id ? 'active' : ''}`}
            onClick={() => onChange(style.id)}
            title={style.desc}
          >
            {/* AUDIT FIX (imp 3.9): style gallery icon + example */}
            <span className="style-icon"><i className={style.icon}></i></span>
            <span className="style-label">{style.label}</span>
            <span className="style-desc">{style.desc}</span>
            {style.example && <span className="style-example">{style.example}</span>}
            {value === style.id && (
              <div className="style-check">
                <i className="fas fa-check"></i>
              </div>
            )}
          </button>
        ))}
      </div>

      {STYLE_PRESETS.length > 8 && (
        <button
          type="button"
          className="btn btn-link text-main mt-2 p-0"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              <i className="fas fa-chevron-up me-1"></i>
              Show Less
            </>
          ) : (
            <>
              <i className="fas fa-chevron-down me-1"></i>
              Show More Styles ({STYLE_PRESETS.length - 8} more)
            </>
          )}
        </button>
      )}
    </div>
  );
};

export { STYLE_PRESETS };
export default StylePresetSelector;
