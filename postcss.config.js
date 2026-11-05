const fs = require('fs');
const path = require('path');
const { compile } = require('tailwindcss');
const autoprefixer = require('autoprefixer');

function collectCandidates(dir, out = new Set()) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCandidates(fullPath, out);
    } else if (/\.(html|js|ts|jsx|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/[^\s"'`<>]+/g) || [];
      for (const token of matches) {
        out.add(token);
      }
    }
  }
  return out;
}

const tailwindV4CompatPlugin = () => ({
  postcssPlugin: 'tailwindcss-v4-compat',
  async Once(root, { result, parse }) {
    try {
      let cssInput = root.toString();
      if (cssInput.includes('@tailwind')) {
        cssInput = cssInput
          .replace(/@tailwind\s+base\s*;/g, '')
          .replace(/@tailwind\s+components\s*;/g, '')
          .replace(/@tailwind\s+utilities\s*;/g, '@import "tailwindcss";');
      }

      if (!cssInput.includes('@import "tailwindcss"')) return;

      const compiler = await compile(cssInput, {
        base: process.cwd(),
        loadStylesheet: async (id, base) => {
          if (id === 'tailwindcss') {
            const twIndex = path.resolve(process.cwd(), 'node_modules/tailwindcss/index.css');
            return {
              base: path.dirname(twIndex),
              content: fs.readFileSync(twIndex, 'utf8')
            };
          }
          const resolved = path.resolve(base, id);
          return {
            base: path.dirname(resolved),
            content: fs.readFileSync(resolved, 'utf8')
          };
        }
      });

      const candidates = Array.from(collectCandidates(process.cwd()));
      const compiledCss = compiler.build(candidates);
      const newRoot = parse(compiledCss, { from: result.opts.from });
      root.removeAll();
      root.append(newRoot);
    } catch (err) {
      console.warn('[PostCSS Tailwind v4 Compat]', err.message);
    }
  }
});
tailwindV4CompatPlugin.postcss = true;

module.exports = {
  plugins: [
    tailwindV4CompatPlugin(),
    autoprefixer()
  ]
};
