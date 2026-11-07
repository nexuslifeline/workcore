/**
 * List of available font names (visit the url `/settings/appearance`).
 * This array is used to generate dynamic font classes (e.g., `font-inter`, `font-manrope`).
 *
 * 📝 How to Add a New Font (Next.js + Tailwind v4+):
 * 1. Add the font name here.
 * 2. Import and configure the font in 'app/layout.tsx' using `next/font/google` (or `next/font/local` for local fonts).
 * 3. Add the font variable to the body className in 'app/layout.tsx'.
 * 4. Add the new font family to 'styles/theme.css' using the `@theme inline` block and `font-family` CSS variable.
 *
 * Example:
 * fonts.ts           → Add 'roboto' to this array.
 * app/layout.tsx     → Import: `import { Roboto } from 'next/font/google'`
 *                      Configure: `const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto' })`
 *                      Add to body: `className={`${inter.variable} ${manrope.variable} ${roboto.variable}`}`
 * styles/theme.css → Add in @theme inline block:
 *                        --font-roboto: 'Roboto', 'sans-serif';
 */
export const fonts = ['inter', 'manrope', 'system'] as const
