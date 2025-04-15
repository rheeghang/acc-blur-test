/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-page1-bg',
    'bg-page2-bg',
    'bg-page3-bg',
    'bg-page4-bg',
    'bg-page5-bg',
    'bg-page6-bg',
    'bg-page7-bg',
    'bg-page8-bg',
    'text-page1-text',
    'text-page2-text',
    'text-page3-text',
    'text-page4-text',
    'text-page5-text',
    'text-page6-text',
    'text-page7-text',
    'text-page8-text',
    'text-stroke-thin',
    'text-stroke-white-thin'
  ],
  theme: {
    extend: {
      rotate: {
        '15': '15deg',
      },
      fontFamily: {
        sans: ['Koddi', 'sans-serif'],
        'koddi': ['Koddi', 'sans-serif'],
      },
      fontWeight: {
        normal: 450,
        medium: 510,
        semibold: 650,
      },
      colors: {
        'vivid-blue': '#0072BB',
        'exhibition-bg': '#FFFFFF',
        'exhibition': {
          bg: '#FFFFFF',
          text: '#000000',
        },
        'page1-bg': '#95FFBC',
        'page1-text': '#9B40CC',

        'page2-bg': '#FFF454',
        'page2-text': '#3B69B9',  

        'page3-bg': '#26277D',
        'page3-text': '#00E5FF', 

        'page4-bg': '#CAFEFF',
        'page4-text': '#782814',

        'page5-bg': '#360E00',
        'page5-text': '#FF89F5',

        'page6-bg': '#511EAA',
        'page6-text': '#CCFF66',

        'page7-bg': '#FF7728',
        'page7-text': '#15004A',

        'page8-bg': '#FFD2EA',
        'page8-text': '#006508',

        'base-color': '#E4E4E4',
        'key-color': '#FF5218',
      },
      lineHeight: {
        'base': '170%',
        'relaxed': '175%',
      },
      keyframes: {
        'rotate-left': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        wobble: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      animation: {
        'rotate-left': 'rotate-left 15s linear infinite',
        'fadeIn': 'fadeIn 2s ease-in forwards',
        'pulse-scale': 'pulse-scale 0.7s ease-in-out infinite',
        wobble: 'wobble 1.2s ease-in-out infinite'
      },
      textShadow: {
        'stroke-thin': '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000',
        'stroke-medium': '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
        'stroke-thick': '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
        'stroke-white-thin': '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'xl': '5px 15px 15px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        '2xl': '0 50px 50px -8px rgba(0, 0, 0, 0.7)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.6)',
        '4xl': '0 45px 70px -18px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'key-gradient': 'linear-gradient(to left, #FFEA7B, #FACFB9)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-stroke-thin': {
          textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000',
        },
        '.text-stroke-medium': {
          textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
        },
        '.text-stroke-thick': {
          textShadow: '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
        },
        '.text-stroke-white-thin': {
          textShadow: '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}; 