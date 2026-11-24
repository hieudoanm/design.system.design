import type { FC } from 'react';

interface VitalsCardProps {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  spo2: number;
  title?: string;
}

export const VitalsCard: FC<VitalsCardProps> = ({
  bloodPressure,
  heartRate,
  temperature,
  spo2,
  title = 'Vitals',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="vitals-card">
    <div className="card-body gap-3">
      <h3 className="card-title text-base">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-base-200 rounded-xl p-3">
          <p className="text-base-content/50 text-xs">Blood pressure</p>
          <p className="text-lg font-semibold" data-testid="vitals-bp">
            {bloodPressure}
          </p>
        </div>
        <div className="bg-base-200 rounded-xl p-3">
          <p className="text-base-content/50 text-xs">Heart rate</p>
          <p className="text-lg font-semibold" data-testid="vitals-hr">
            {heartRate} bpm
          </p>
        </div>
        <div className="bg-base-200 rounded-xl p-3">
          <p className="text-base-content/50 text-xs">Temperature</p>
          <p className="text-lg font-semibold" data-testid="vitals-temp">
            {temperature}°C
          </p>
        </div>
        <div className="bg-base-200 rounded-xl p-3">
          <p className="text-base-content/50 text-xs">SpO₂</p>
          <p className="text-lg font-semibold" data-testid="vitals-spo2">
            {spo2}%
          </p>
        </div>
      </div>
    </div>
  </div>
);
