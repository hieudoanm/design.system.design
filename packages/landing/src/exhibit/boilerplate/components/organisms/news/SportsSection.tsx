import type { FC } from 'react';

interface SportsMatch {
  teamA: string;
  scoreA: number;
  teamB: string;
  scoreB: number;
  status: string;
}

interface SportsSectionProps {
  matches: SportsMatch[];
  title?: string;
}

export const SportsSection: FC<SportsSectionProps> = ({
  matches,
  title = 'Sports',
}) => (
  <section data-testid="sports-section" className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <div className="card bg-base-200 border-base-content/10 rounded-xl border p-4">
      <h3 className="card-title mb-3 text-sm">Today&apos;s Scores</h3>
      <table className="table-compact table">
        <thead>
          <tr>
            <th>Match</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td>
                {match.teamA} vs {match.teamB}
              </td>
              <td className="font-mono">
                {match.scoreA} - {match.scoreB}
              </td>
              <td>
                <span className="badge badge-ghost badge-sm">
                  {match.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="card bg-base-200 border-base-content/10 rounded-xl border p-4">
        <h3 className="card-title text-sm">Top Story</h3>
        <p className="text-base-content/70 text-sm">
          The championship race is wide open after an upset on the road.
        </p>
      </div>
      <div className="card bg-base-200 border-base-content/10 rounded-xl border p-4">
        <h3 className="card-title text-sm">Injury Report</h3>
        <p className="text-base-content/70 text-sm">
          Two starters return to practice ahead of the weekend fixture.
        </p>
      </div>
    </div>
  </section>
);
