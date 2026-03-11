const _usdFmt = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
})
const _usdPrecise = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
})
const _numFmt = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })
const _pctFmt = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export const fmtUSD = (n, precise = false) =>
  precise ? _usdPrecise.format(n) : _usdFmt.format(n)

export const fmtNum = (n) => _numFmt.format(n)
export const fmtPct = (n) => `${_pctFmt.format(n)}%`

export const fmtK = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return fmtUSD(n)
}

export const fmtKShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export const quarterLabel = (q) => {
  const match = q.match(/(\d{4})Q(\d)/)
  if (!match) return q
  return `Q${match[2]} ${match[1]}`
}
