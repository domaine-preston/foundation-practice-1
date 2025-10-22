import DomaineTWExtend from '@meetdomaine/tailwind-syrah'
import path from 'node:path'
import type { Config } from 'tailwindcss'
import { fileURLToPath } from 'node:url'

export default {
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/container-queries'), // Support for container queries https://github.com/tailwindlabs/tailwindcss-container-queries
    DomaineTWExtend({
      manifestFilePath: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        'design.manifest.json',
      ),
      fontMapping: {
        'GT Alpina': 'Primary',
        Graphik: 'Secondary',
        'NB Akademie Std': 'Tertiary',
        Inter: 'Quaternary',
      },
      fluidTypography: 'LIMITED_DESKTOP', // Disable fluid typography
      buttonVariants: [
        'primary',
        'secondary',
        'tertiary',
        'primary-inverse',
        'secondary-inverse',
        'tertiary-inverse',
      ],
      /*
      Provide custom font weight mapping if needed, the value is matched fontName.style from design manifest
        fontWeightMapping: {
          Primary: {
            'Light Italic': 300,
            Regular: 700,
          },
        },
      */
      // fontWeightMapping: {
      //   Primary: {
      //     Regular: 700,
      //   },
      // },
    }),
  ],
} satisfies Config
