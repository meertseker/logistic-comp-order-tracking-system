/**
 * Figma Design Tokens Export Script
 * 
 * Bu script, projedeki tasarım token'larını Figma'ya import edilebilir formatta export eder.
 * 
 * Kullanım:
 * node scripts/export-figma-tokens.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tasarım token'ları
const designTokens = {
  colors: {
    primary: {
      blue: '#0A84FF',
      blueLight: '#64D2FF',
      blueDark: '#007AFF',
    },
    system: {
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: '#64D2FF',
    },
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
      elevated: '#3A3A3C',
      glassCard: 'rgba(28, 28, 30, 0.68)',
      glassStrong: 'rgba(28, 28, 30, 0.85)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(235, 235, 245, 0.6)',
      tertiary: 'rgba(235, 235, 245, 0.3)',
      quaternary: 'rgba(235, 235, 245, 0.18)',
    },
    border: {
      default: 'rgba(84, 84, 88, 0.35)',
      focus: 'rgba(10, 132, 255, 0.5)',
      error: 'rgba(255, 69, 58, 0.5)',
      separator: 'rgba(84, 84, 88, 0.65)',
    },
    status: {
      blue: { color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.15)' },
      green: { color: '#30D158', bg: 'rgba(48, 209, 88, 0.15)' },
      red: { color: '#FF453A', bg: 'rgba(255, 69, 58, 0.15)' },
      yellow: { color: '#FFD60A', bg: 'rgba(255, 214, 10, 0.15)' },
      purple: { color: '#BF5AF2', bg: 'rgba(191, 90, 242, 0.15)' },
      orange: { color: '#FF9F0A', bg: 'rgba(255, 159, 10, 0.15)' },
    },
  },
  typography: {
    fontFamily: {
      primary: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto'",
      monospace: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New'",
    },
    fontSize: {
      xs: '11px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
  },
  borderRadius: {
    sm: '8px',
    base: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  shadows: {
    glassCard: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
    glassHover: '0 8px 24px 0 rgba(0, 0, 0, 0.35)',
    buttonPrimary: '0 4px 14px 0 rgba(10, 132, 255, 0.4)',
    buttonHover: '0 6px 20px 0 rgba(10, 132, 255, 0.5)',
  },
};

// Figma JSON formatına dönüştür
function convertToFigmaFormat(tokens) {
  const figmaTokens = {
    colors: {},
    typography: {},
    spacing: {},
    borderRadius: {},
    shadows: {},
  };

  // Colors
  Object.entries(tokens.colors).forEach(([category, values]) => {
    if (category === 'status') {
      Object.entries(values).forEach(([name, data]) => {
        figmaTokens.colors[`status/${name}`] = {
          value: data.color,
          type: 'color',
        };
        figmaTokens.colors[`status/${name}/bg`] = {
          value: data.bg,
          type: 'color',
        };
      });
    } else {
      Object.entries(values).forEach(([name, value]) => {
        figmaTokens.colors[`${category}/${name}`] = {
          value: value,
          type: 'color',
        };
      });
    }
  });

  // Typography
  Object.entries(tokens.typography.fontSize).forEach(([name, value]) => {
    figmaTokens.typography[`fontSize/${name}`] = {
      value: value,
      type: 'dimension',
    };
  });

  Object.entries(tokens.typography.fontWeight).forEach(([name, value]) => {
    figmaTokens.typography[`fontWeight/${name}`] = {
      value: value.toString(),
      type: 'number',
    };
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    figmaTokens.spacing[name] = {
      value: value,
      type: 'dimension',
    };
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([name, value]) => {
    figmaTokens.borderRadius[name] = {
      value: value,
      type: 'dimension',
    };
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([name, value]) => {
    figmaTokens.shadows[name] = {
      value: value,
      type: 'shadow',
    };
  });

  return figmaTokens;
}

// Markdown formatında dokümantasyon oluştur
function generateMarkdown(tokens) {
  let markdown = '# Figma Design Tokens\n\n';
  markdown += 'Bu dosya Figma\'ya import edilebilir tasarım token\'larını içerir.\n\n';

  // Colors
  markdown += '## Colors\n\n';
  Object.entries(tokens.colors).forEach(([category, values]) => {
    markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    if (typeof values === 'object' && !Array.isArray(values)) {
      Object.entries(values).forEach(([name, value]) => {
        if (typeof value === 'object' && value.color) {
          markdown += `- **${name}**: \`${value.color}\` (bg: \`${value.bg}\`)\n`;
        } else {
          markdown += `- **${name}**: \`${value}\`\n`;
        }
      });
      markdown += '\n';
    }
  });

  // Typography
  markdown += '## Typography\n\n';
  markdown += '### Font Sizes\n\n';
  Object.entries(tokens.typography.fontSize).forEach(([name, value]) => {
    markdown += `- **${name}**: \`${value}\`\n`;
  });
  markdown += '\n### Font Weights\n\n';
  Object.entries(tokens.typography.fontWeight).forEach(([name, value]) => {
    markdown += `- **${name}**: \`${value}\`\n`;
  });

  // Spacing
  markdown += '\n## Spacing\n\n';
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    markdown += `- **${name}**: \`${value}\`\n`;
  });

  // Border Radius
  markdown += '\n## Border Radius\n\n';
  Object.entries(tokens.borderRadius).forEach(([name, value]) => {
    markdown += `- **${name}**: \`${value}\`\n`;
  });

  return markdown;
}

// Export işlemi
function exportTokens() {
  const outputDir = path.join(__dirname, '..', 'docs');
  const figmaFormat = convertToFigmaFormat(designTokens);

  // JSON export
  const jsonPath = path.join(outputDir, 'figma-design-tokens.json');
  fs.writeFileSync(jsonPath, JSON.stringify(figmaFormat, null, 2));
  console.log(`✅ Figma tokens exported to: ${jsonPath}`);

  // Markdown export
  const mdPath = path.join(outputDir, 'FIGMA_TOKENS.md');
  const markdown = generateMarkdown(designTokens);
  fs.writeFileSync(mdPath, markdown);
  console.log(`✅ Markdown documentation exported to: ${mdPath}`);

  // Component specifications
  const componentSpecs = {
    button: {
      variants: ['primary', 'secondary', 'danger', 'success'],
      sizes: ['sm', 'md', 'lg'],
      states: ['default', 'hover', 'active', 'disabled'],
    },
    input: {
      states: ['default', 'focus', 'error'],
      features: ['label', 'helperText', 'errorMessage'],
    },
    card: {
      features: ['title', 'actions', 'hover'],
    },
    modal: {
      sizes: ['sm', 'md', 'lg', 'xl'],
    },
    statCard: {
      colors: ['blue', 'green', 'red', 'yellow', 'purple', 'orange'],
    },
  };

  const specsPath = path.join(outputDir, 'figma-component-specs.json');
  fs.writeFileSync(specsPath, JSON.stringify(componentSpecs, null, 2));
  console.log(`✅ Component specifications exported to: ${specsPath}`);

  console.log('\n📋 Next Steps:');
  console.log('1. Figma\'yı açın');
  console.log('2. Design → Colors → + ile renkleri ekleyin');
  console.log('3. Design → Text → + ile text stillerini ekleyin');
  console.log('4. Component\'leri oluşturmaya başlayın');
  console.log('\n📖 Detaylı rehber için: docs/FIGMA_COMPONENT_GUIDE.md');
}

// Script'i çalıştır
exportTokens();

export { designTokens, convertToFigmaFormat, exportTokens };

