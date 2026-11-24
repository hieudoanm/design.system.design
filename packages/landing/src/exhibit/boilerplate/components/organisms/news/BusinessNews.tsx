import type { FC } from 'react';

interface MarketQuote {
  symbol: string;
  name: string;
  price: string;
  change: string;
}

interface BusinessHeadline {
  title: string;
  source: string;
}

interface BusinessNewsProps {
  market: MarketQuote[];
  headlines: BusinessHeadline[];
  title?: string;
}

export const BusinessNews: FC<BusinessNewsProps> = ({
  market,
  headlines,
  title = 'Business',
}) => (
  <section data-testid="business-news" className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <div className="card bg-base-200 border-base-content/10 rounded-xl border p-4">
      <h3 className="card-title mb-3 text-sm">Market Watch</h3>
      <table className="table-compact table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {market.map((quote, index) => (
            <tr key={index}>
              <td className="font-mono">{quote.symbol}</td>
              <td>{quote.name}</td>
              <td className="font-mono">{quote.price}</td>
              <td>
                <span
                  className={
                    quote.change.startsWith('-')
                      ? 'text-error font-mono'
                      : 'text-success font-mono'
                  }>
                  {quote.change}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <ul className="flex w-full flex-col gap-2">
      {headlines.map((item, index) => (
        <li
          key={index}
          className="border-base-content/10 flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="text-sm font-medium">{item.title}</span>
          <span className="badge badge-neutral badge-sm">{item.source}</span>
        </li>
      ))}
    </ul>
  </section>
);
