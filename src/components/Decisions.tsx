import { ACTIVITY_META, ACTIVITY_TYPES } from "../lib/carbon";

export default function Decisions() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Decision points</h2>
        <p className="mb-6 text-sm text-slate-500">
          The three product decisions behind this prototype, and why we made them.
        </p>

        <div className="space-y-5">
          <DecisionCard
            code="DP1"
            emoji="💬"
            title="The nudge — warn & encourage, never shame or block"
            body={
              <>
                When the weekly target is crossed, the app shows a clear red state with the exact
                overage, paired with an <strong>encouraging, actionable suggestion</strong> (take
                the bus, choose a veg meal). We never block logging — blocking would corrupt the
                data and defeat the purpose of tracking. And shame is known to reduce long-term
                engagement; awareness plus a concrete next step is what actually changes behaviour.
                We also add an amber "ahead of pace" warning <em>before</em> the target is crossed,
                so the red state rarely comes as a surprise.
              </>
            }
          />
          <DecisionCard
            code="DP2"
            emoji="🤔"
            title="Absurd input — soft confirmation, hard ceiling"
            body={
              <>
                An entry above a per-type sanity threshold (e.g. 2,000 km of car travel in a day)
                triggers a friendly <strong>"are you sure?" confirmation</strong> instead of a
                silent accept or a hard rejection. Unusual values can be legitimate (long road
                trips, transatlantic flights), so the user gets the final say. Only physically
                impossible values (over 1,000,000 units, negatives, zero, future dates) are hard
                rejected, because they can only be errors and would poison the dashboard.
              </>
            }
          />
          <DecisionCard
            code="DP3"
            emoji="📅"
            title="The week — Monday start, pro-rated pace marker"
            body={
              <>
                A week runs <strong>Monday 00:00 to Sunday 23:59</strong> (ISO-8601), matching how
                most people mentally frame "this week" and how commute-heavy emissions actually
                cluster. Mid-week progress is shown two ways: percentage of the total weekly
                budget, plus a <strong>pace tick</strong> on the progress bar marking where an even
                daily spend (target ÷ 7 × days elapsed) would put you — so on Wednesday you know
                whether 60% used is fine or a problem.
              </>
            }
          />
        </div>
      </div>

      {/* Emission factors reference */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Emission factors</h2>
        <p className="mb-4 text-sm text-slate-500">
          Fixed factors used for every calculation in this app.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-4">Activity</th>
                <th className="pb-2 pr-4">Unit</th>
                <th className="pb-2 text-right">kg CO₂ / unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTIVITY_TYPES.map((t) => {
                const m = ACTIVITY_META[t];
                return (
                  <tr key={t}>
                    <td className="py-2.5 pr-4 font-medium text-slate-800">
                      {m.emoji} {m.label}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{m.unitShort}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      {m.factor.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DecisionCard({
  code,
  emoji,
  title,
  body,
}: {
  code: string;
  emoji: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-2 flex items-center gap-3">
        <span className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
          {code}
        </span>
        <span className="text-lg">{emoji}</span>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
