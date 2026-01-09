/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Industrial template
        industrial: {
          charcoal: '#1a1a1a',
          steel: '#4a5568',
          copper: '#b87333',
        },
        // Clean template
        clean: {
          navy: '#1e3a5f',
          blue: '#3b82f6',
        },
        // Friendly template
        friendly: {
          blue: '#2563eb',
          cream: '#faf7f2',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        // Industrial
        'industrial-display': ['Oswald', 'sans-serif'],
        'industrial-body': ['Source Sans Pro', 'sans-serif'],
        // Clean
        'clean-display': ['Playfair Display', 'serif'],
        'clean-body': ['DM Sans', 'sans-serif'],
        // Friendly
        'friendly-display': ['Nunito', 'sans-serif'],
        'friendly-body': ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
