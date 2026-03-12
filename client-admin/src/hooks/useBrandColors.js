import { useEffect } from 'react'

// Lightweight color extractor: computes average RGB and sets CSS vars
// Ensures sufficient contrast for text by adjusting brightness and setting a text color var
const useBrandColors = (logoUrl) => {
  useEffect(() => {
    if (!logoUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = logoUrl
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const w = 100
        const h = 100
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data
        let r = 0, g = 0, b = 0, count = 0
        // sample every 4th pixel to reduce work
        for (let i = 0; i < data.length; i += 16) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        const toRgb = (rr, gg, bb) => `rgb(${rr}, ${gg}, ${bb})`

        // Relative luminance helper
        const luminance = (rr, gg, bb) => {
          const srgb = [rr, gg, bb].map((v) => {
            const s = v / 255
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
          })
          return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
        }

        // contrast ratio between two colors
        const contrastRatio = (c1, c2) => {
          const L1 = luminance(...c1)
          const L2 = luminance(...c2)
          return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
        }

        // darken until contrast against white is >= 4.5 (WCAG AA) or max attempts
        const darken = (val, factor) => Math.max(0, Math.round(val * factor))

        let rr = r, gg = g, bb = b
        let attempts = 0
        while (attempts < 6 && contrastRatio([rr, gg, bb], [255, 255, 255]) < 4.5) {
          rr = darken(rr, 0.8)
          gg = darken(gg, 0.8)
          bb = darken(bb, 0.8)
          attempts++
        }

        const color1 = toRgb(rr, gg, bb)

        // second gradient stop slightly darker
        const shade = (v) => Math.max(0, Math.round(v * 0.7))
        const color2 = toRgb(shade(rr), shade(gg), shade(bb))

        document.documentElement.style.setProperty('--brand-color1', color1)
        document.documentElement.style.setProperty('--brand-color2', color2)

        // decide text color (white for dark backgrounds, dark for light)
        const whiteContrast = contrastRatio([rr, gg, bb], [255, 255, 255])
        const brandText = whiteContrast >= 4.5 ? '#ffffff' : '#0f1724'
        document.documentElement.style.setProperty('--brand-text-color', brandText)
      } catch (err) {
        // ignore - fallbacks in CSS will apply
      }
    }
  }, [logoUrl])
}

export default useBrandColors
