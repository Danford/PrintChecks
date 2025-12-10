// Comprehensive font collection for PrintChecks - ALL FONTS
const expandedFonts = [
  // System Sans-Serif Fonts (Enhanced Collection)
  {
    name: 'Arial, sans-serif',
    displayName: 'Arial',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Clean, professional sans-serif'
  },
  {
    name: 'Helvetica, Arial, sans-serif',
    displayName: 'Helvetica',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Classic Swiss design'
  },
  {
    name: 'Verdana, sans-serif',
    displayName: 'Verdana',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Highly readable screen font'
  },
  {
    name: 'Tahoma, sans-serif',
    displayName: 'Tahoma',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Compact and clear'
  },
  {
    name: 'Trebuchet MS, sans-serif',
    displayName: 'Trebuchet MS',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Humanist sans-serif'
  },
  {
    name: 'Calibri, sans-serif',
    displayName: 'Calibri',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Modern Microsoft font'
  },
  {
    name: 'Segoe UI, sans-serif',
    displayName: 'Segoe UI',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Windows system font'
  },
  {
    name: 'Lucida Grande, sans-serif',
    displayName: 'Lucida Grande',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'macOS system font'
  },

  // System Serif Fonts (Enhanced Collection)
  {
    name: 'Times New Roman, serif',
    displayName: 'Times New Roman',
    category: 'serif',
    variants: ['normal', 'bold', 'italic'],
    isWebFont: false,
    description: 'Traditional serif typeface'
  },
  {
    name: 'Georgia, serif',
    displayName: 'Georgia',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Elegant serif for screens'
  },
  {
    name: 'Book Antiqua, serif',
    displayName: 'Book Antiqua',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Classic book-style serif'
  },
  {
    name: 'Palatino, serif',
    displayName: 'Palatino',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Renaissance-inspired serif'
  },
  {
    name: 'Garamond, serif',
    displayName: 'Garamond',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Classic French serif'
  },
  {
    name: 'Cambria, serif',
    displayName: 'Cambria',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Modern serif for screens'
  },

  // Monospace Fonts (Enhanced Collection)
  {
    name: 'Courier New, monospace',
    displayName: 'Courier New',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Traditional typewriter font'
  },
  {
    name: 'Consolas, monospace',
    displayName: 'Consolas',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Modern programming font'
  },
  {
    name: 'Monaco, monospace',
    displayName: 'Monaco',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'macOS monospace font'
  },
  {
    name: 'Lucida Console, monospace',
    displayName: 'Lucida Console',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: false,
    description: 'Windows console font'
  },
  {
    name: 'MICR E13B Banking, monospace',
    displayName: 'MICR E13B (Banking)',
    category: 'banking',
    variants: ['normal'],
    isWebFont: false,
    description: 'Official banking check font'
  },

  // Google Web Fonts - Professional Sans-Serif (Massive Collection)
  {
    name: 'Open Sans, sans-serif',
    displayName: 'Open Sans',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap',
    description: 'Friendly and readable'
  },
  {
    name: 'Roboto, sans-serif',
    displayName: 'Roboto',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
    description: 'Modern and geometric'
  },
  {
    name: 'Lato, sans-serif',
    displayName: 'Lato',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
    description: 'Humanist sans-serif'
  },
  {
    name: 'Montserrat, sans-serif',
    displayName: 'Montserrat',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
    description: 'Urban inspired design'
  },
  {
    name: 'Source Sans Pro, sans-serif',
    displayName: 'Source Sans Pro',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap',
    description: 'Adobe\'s first open source font'
  },
  {
    name: 'Nunito, sans-serif',
    displayName: 'Nunito',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
    description: 'Rounded sans-serif'
  },
  {
    name: 'Poppins, sans-serif',
    displayName: 'Poppins',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap',
    description: 'Geometric sans-serif'
  },
  {
    name: 'Inter, sans-serif',
    displayName: 'Inter',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
    description: 'Designed for computer screens'
  },
  {
    name: 'Work Sans, sans-serif',
    displayName: 'Work Sans',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap',
    description: 'Optimized for on-screen text'
  },
  {
    name: 'Fira Sans, sans-serif',
    displayName: 'Fira Sans',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
    description: 'Mozilla\'s signature typeface'
  },
  {
    name: 'PT Sans, sans-serif',
    displayName: 'PT Sans',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap',
    description: 'Russian type foundry design'
  },
  {
    name: 'Rubik, sans-serif',
    displayName: 'Rubik',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap',
    description: 'Slightly rounded corners'
  },
  {
    name: 'Oxygen, sans-serif',
    displayName: 'Oxygen',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Oxygen:wght@400;700&display=swap',
    description: 'Created for KDE desktop'
  },
  {
    name: 'Ubuntu, sans-serif',
    displayName: 'Ubuntu',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap',
    description: 'Canonical\'s signature font'
  },
  {
    name: 'Raleway, sans-serif',
    displayName: 'Raleway',
    category: 'sans-serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap',
    description: 'Elegant sans-serif'
  },

  // Google Web Fonts - Professional Serif (Massive Collection)
  {
    name: 'Playfair Display, serif',
    displayName: 'Playfair Display',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
    description: 'High-contrast serif'
  },
  {
    name: 'Merriweather, serif',
    displayName: 'Merriweather',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    description: 'Designed for screens'
  },
  {
    name: 'Crimson Text, serif',
    displayName: 'Crimson Text',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap',
    description: 'Inspired by old-style serif'
  },
  {
    name: 'Libre Baskerville, serif',
    displayName: 'Libre Baskerville',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
    description: 'Based on American Type Founder\'s Baskerville'
  },
  {
    name: 'Lora, serif',
    displayName: 'Lora',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
    description: 'Well-balanced contemporary serif'
  },
  {
    name: 'PT Serif, serif',
    displayName: 'PT Serif',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap',
    description: 'Transitional serif for text'
  },
  {
    name: 'Source Serif Pro, serif',
    displayName: 'Source Serif Pro',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;700&display=swap',
    description: 'Adobe\'s serif companion'
  },
  {
    name: 'Cormorant Garamond, serif',
    displayName: 'Cormorant Garamond',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&display=swap',
    description: 'Display serif inspired by Garamond'
  },
  {
    name: 'Vollkorn, serif',
    displayName: 'Vollkorn',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Vollkorn:wght@400;700&display=swap',
    description: 'Quiet, modest serif'
  },
  {
    name: 'Bitter, serif',
    displayName: 'Bitter',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;700&display=swap',
    description: 'Contemporary slab serif'
  },
  {
    name: 'Rokkitt, serif',
    displayName: 'Rokkitt',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Rokkitt:wght@400;700&display=swap',
    description: 'Slab serif with personality'
  },
  {
    name: 'Arvo, serif',
    displayName: 'Arvo',
    category: 'serif',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&display=swap',
    description: 'Geometric slab serif'
  },

  // Google Web Fonts - Handwriting & Signature Styles (Massive Collection)
  {
    name: 'Caveat, cursive',
    displayName: 'Caveat',
    category: 'handwriting',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap',
    description: 'Casual handwritten style'
  },
  {
    name: 'Dancing Script, cursive',
    displayName: 'Dancing Script',
    category: 'handwriting',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
    description: 'Elegant script font'
  },
  {
    name: 'Great Vibes, cursive',
    displayName: 'Great Vibes',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    description: 'Formal signature style'
  },
  {
    name: 'Pacifico, cursive',
    displayName: 'Pacifico',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
    description: 'Friendly brush script'
  },
  {
    name: 'Satisfy, cursive',
    displayName: 'Satisfy',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
    description: 'Casual marker style'
  },
  {
    name: 'Kaushan Script, cursive',
    displayName: 'Kaushan Script',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap',
    description: 'Acrylic brush lettering'
  },
  {
    name: 'Allura, cursive',
    displayName: 'Allura',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Allura&display=swap',
    description: 'Flowing script'
  },
  {
    name: 'Alex Brush, cursive',
    displayName: 'Alex Brush',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap',
    description: 'Connecting script'
  },
  {
    name: 'Amatic SC, cursive',
    displayName: 'Amatic SC',
    category: 'handwriting',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap',
    description: 'Hand-drawn marker style'
  },
  {
    name: 'Indie Flower, cursive',
    displayName: 'Indie Flower',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
    description: 'Friendly handwriting'
  },
  {
    name: 'Shadows Into Light, cursive',
    displayName: 'Shadows Into Light',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap',
    description: 'Marker pen style'
  },
  {
    name: 'Permanent Marker, cursive',
    displayName: 'Permanent Marker',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap',
    description: 'Bold marker style'
  },
  {
    name: 'Courgette, cursive',
    displayName: 'Courgette',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Courgette&display=swap',
    description: 'Casual script'
  },
  {
    name: 'Lobster, cursive',
    displayName: 'Lobster',
    category: 'handwriting',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap',
    description: 'Bold script with flair'
  },

  // Google Web Fonts - Monospace (Enhanced Collection)
  {
    name: 'Roboto Mono, monospace',
    displayName: 'Roboto Mono',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
    description: 'Modern monospace'
  },
  {
    name: 'Source Code Pro, monospace',
    displayName: 'Source Code Pro',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap',
    description: 'Adobe\'s coding font'
  },
  {
    name: 'Fira Code, monospace',
    displayName: 'Fira Code',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap',
    description: 'Programming ligatures'
  },
  {
    name: 'JetBrains Mono, monospace',
    displayName: 'JetBrains Mono',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
    description: 'Developer-focused monospace'
  },
  {
    name: 'Space Mono, monospace',
    displayName: 'Space Mono',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
    description: 'Retro-futuristic monospace'
  },
  {
    name: 'Inconsolata, monospace',
    displayName: 'Inconsolata',
    category: 'monospace',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
    description: 'Humanist monospace'
  },

  // Display & Decorative Fonts
  {
    name: 'Oswald, sans-serif',
    displayName: 'Oswald',
    category: 'display',
    variants: ['normal', 'bold'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap',
    description: 'Condensed sans-serif'
  },
  {
    name: 'Bebas Neue, cursive',
    displayName: 'Bebas Neue',
    category: 'display',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    description: 'All caps display font'
  },
  {
    name: 'Anton, sans-serif',
    displayName: 'Anton',
    category: 'display',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
    description: 'Bold impact font'
  },
  {
    name: 'Righteous, cursive',
    displayName: 'Righteous',
    category: 'display',
    variants: ['normal'],
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
    description: 'Retro display font'
  }
];

export default expandedFonts;

