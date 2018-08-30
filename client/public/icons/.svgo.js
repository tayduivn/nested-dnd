{
  plugins: [
    { removeViewBox: false },
    { removeDimensions: true },
    { removeAttrs: { attrs: '(fill|stroke)' } },
    { removeHiddenElems: true }
  ]
}