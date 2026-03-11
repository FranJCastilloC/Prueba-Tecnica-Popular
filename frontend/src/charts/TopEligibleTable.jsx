import { useData } from '../providers/DataProvider'
import { fmtUSD } from '../utils/formatters'

const SEG_CLASSES = {
  PYME:        { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  Corporativo: { text: 'text-amber-400',   bg: 'bg-amber-400/10' },
  Retail:      { text: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
}

export default function TopEligibleTable() {
  const data = useData()
  const ELIGIBLE_CLIENTS = data.cross_sell.ELIGIBLE_CLIENTS
  const CROSSSELL_SUMMARY = data.cross_sell.CROSSSELL_SUMMARY

  return (
    <div className="flex flex-col gap-3">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="text-left pb-2 pr-3 font-semibold">Cliente</th>
              <th className="text-left pb-2 pr-3 font-semibold">Segmento</th>
              <th className="text-center pb-2 pr-3 font-semibold">Prods.</th>
              <th className="text-left pb-2 pr-3 font-semibold">Recomendar</th>
              <th className="text-right pb-2 pr-3 font-semibold">Prob.</th>
              <th className="text-right pb-2 font-semibold">Ingreso est.</th>
            </tr>
          </thead>
          <tbody>
            {ELIGIBLE_CLIENTS.map((c) => {
              const segCls = SEG_CLASSES[c.segmento] || SEG_CLASSES.Retail
              return (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 pr-3 text-white font-mono font-semibold">{c.id}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${segCls.text} ${segCls.bg}`}>
                      {c.segmento}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-center">
                    <span className="text-slate-400">{c.n_productos}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <span className="text-cyan-300 font-medium">{c.next_product}</span>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${c.prob * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-300">{(c.prob * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2 text-right text-emerald-400 font-semibold">
                    {fmtUSD(c.ingreso_estimado)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
        <span>{CROSSSELL_SUMMARY.eligible_clients} clientes elegibles (≤2 productos)</span>
        <span className="text-emerald-400 font-semibold">
          Potencial base: {fmtUSD(CROSSSELL_SUMMARY.ingreso_potencial_base)}
        </span>
      </div>
    </div>
  )
}
