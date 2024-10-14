/** @type {import('prettier').Options} */
module.exports = {
  singleQuote: true,
  semi: false,
  tailwindFunctions: ['clsx'],
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
}
