module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        header: ['"Amaranth"', 'sans-serif'],
        sans: ['"Kanit"', 'sans-serif']
      },
      colors: {
        primary1: '#FDFAF6',   // Baby Powder
        primary2: '#FFEAE0',   // Champagne Pink
        secondary: '#2B1628',  // Dark Purple
        outline: '#808080',    // Gray Web
        accent: '#C43661'      // Rose Red
      },
      dropShadow: {
        'block': "0px 4px 4px rgba(0, 0, 0, 0.25)",
        'nav': "0px 2px 6px rgba(0, 0, 0, 0.4)"
      },
      container: {
        center: true
      },
      gridTemplateColumns: {
        hompage: "5fr 5fr 2fr"
      },
      spacing: {
        survey: "350px"
      },
      maxWidth: {
        survey: "350px"
      }
    },
  },
  plugins: [],
}