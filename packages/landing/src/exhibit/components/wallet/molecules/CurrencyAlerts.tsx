import { FC, useState } from 'react';
import type { CurrencyAlert, CurrencyRate } from '@/exhibit/types/wallet';
import { FiPlus, FiTrash2, FiBell, FiBellOff } from 'react-icons/fi';

interface CurrencyAlertsProps {
  alerts: CurrencyAlert[];
  rates: CurrencyRate[];
  onAdd: (alert: CurrencyAlert) => void;
  onUpdate: (alert: CurrencyAlert) => void;
  onDelete: (id: string) => void;
}

const CurrencyAlerts: FC<CurrencyAlertsProps> = ({
  alerts,
  rates,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [targetRate, setTargetRate] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  console.log('[CurrencyAlerts] render', { count: alerts.length });

  const handleAdd = () => {
    if (!targetRate || Number(targetRate) <= 0) return;

    const alert: CurrencyAlert = {
      id: String(Date.now()),
      fromCurrency,
      toCurrency,
      targetRate: Number(targetRate),
      direction,
      active: true,
    };

    onAdd(alert);
    setTargetRate('');
    setShowForm(false);
  };

  const getCurrentRate = (from: string, to: string): number => {
    const fromRate = rates.find((r) => r.code === from)?.rate ?? 1;
    const toRate = rates.find((r) => r.code === to)?.rate ?? 1;
    return toRate / fromRate;
  };

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((alert) => {
        const currentRate = getCurrentRate(
          alert.fromCurrency,
          alert.toCurrency
        );
        const triggered =
          (alert.direction === 'above' && currentRate >= alert.targetRate) ||
          (alert.direction === 'below' && currentRate <= alert.targetRate);

        return (
          <div
            key={alert.id}
            className={`card shadow-sm ${triggered ? 'bg-success/10 ring-success ring-2' : 'bg-base-200'}`}>
            <div className="card-body flex-row items-center gap-3 p-3">
              <div
                className={`rounded-full p-2 ${alert.active ? 'bg-primary/10' : 'bg-base-300'}`}>
                {alert.active ? (
                  <FiBell className="text-primary text-lg" />
                ) : (
                  <FiBellOff className="text-base-content/40 text-lg" />
                )}
              </div>

              <div className="flex-1">
                <span className="font-medium">
                  {alert.fromCurrency} → {alert.toCurrency}
                </span>
                <div className="text-base-content/60 text-sm">
                  {alert.direction === 'above' ? 'Above' : 'Below'}{' '}
                  {alert.targetRate.toFixed(4)}
                  {triggered && (
                    <span className="badge badge-success badge-sm ml-2">
                      Triggered
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Current: {currentRate.toFixed(4)}
                </span>
                <button
                  className={`btn btn-sm btn-circle ${alert.active ? 'btn-primary' : 'btn-neutral'}`}
                  onClick={() => onUpdate({ ...alert, active: !alert.active })}>
                  {alert.active ? (
                    <FiBell className="text-sm" />
                  ) : (
                    <FiBellOff className="text-sm" />
                  )}
                </button>
                <button
                  className="btn btn-sm btn-circle btn-error btn-outline"
                  onClick={() => onDelete(alert.id)}>
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {showForm && (
        <div className="card bg-base-200 shadow-md">
          <div className="card-body gap-3">
            <h3 className="card-title text-lg">New Alert</h3>

            <div className="flex gap-3">
              <label className="floating-label flex-1">
                <span>From</span>
                <select
                  className="select select-bordered w-full"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}>
                  {rates.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} - {r.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="floating-label flex-1">
                <span>To</span>
                <select
                  className="select select-bordered w-full"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}>
                  {rates.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} - {r.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-3">
              <label className="floating-label flex-1">
                <span>Target Rate</span>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={targetRate}
                  onChange={(e) => setTargetRate(e.target.value)}
                  step="0.0001"
                  min="0"
                />
              </label>

              <label className="floating-label">
                <span>Direction</span>
                <select
                  className="select select-bordered"
                  value={direction}
                  onChange={(e) =>
                    setDirection(e.target.value as 'above' | 'below')
                  }>
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                className="btn btn-neutral flex-1"
                onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1"
                disabled={!targetRate || Number(targetRate) <= 0}
                onClick={handleAdd}>
                Add Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          className="btn btn-primary btn-outline w-full gap-2"
          onClick={() => setShowForm(true)}>
          <FiPlus /> Add Currency Alert
        </button>
      )}
    </div>
  );
};

export default CurrencyAlerts;
