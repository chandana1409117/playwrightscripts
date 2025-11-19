/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Primary reading font
        sans: [
          'Inter',              // Optimized for screens
          'Roboto',            // Excellent readability
          'Open Sans',         // Great for long-form reading
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        // Monospace for code or specific content
        mono: [
          'JetBrains Mono',    // Developer-friendly
          'Consolas',
          'Monaco',
          'monospace'
        ]
      },
      colors: {
        primary: {
          deep: '#2C5282',    // Softer blue
          medium: '#4299E1',  // Calming blue
          light: '#63B3ED',   // Gentle light blue
        },
        gray: {
          light: '#F8FAFC',    // Slightly warmer white for main background
          medium: '#E2E8F0',   // Keep as is
          dark: '#4A5568',     // Keep as is
        },
        accent: {
          teal: '#4FD1C5',    // Soothing teal
          navy: '#2A4365',    // Softer navy
        },
        text: {
          primary: '#2D3748',   // Softer black
          secondary: '#718096', // Gentle gray
        },
        // Enhanced background colors for better eye comfort
        background: {
          primary: '#F8FAFC',    
          secondary: '#FFFFFF',   
          tertiary: '#F1F5F9',   
          sidebar: '#F7FAFC',    
          hover: '#F4F5F7',     
          active: '#E5EFFF',   
          activeHover: '#E5EFFF',
          activeBg: '#FAFBFC'
        }
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-out',
        progress: 'progress 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};