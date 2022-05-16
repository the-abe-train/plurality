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
        button: '#012733',
        primary1: '#FDFAF6',
        primary2: '#FFEAE0',
        secondary: '#2B1628',
        outline: '#808080'
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