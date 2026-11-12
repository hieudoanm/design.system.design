import { FC } from 'react';
import { FiSend } from 'react-icons/fi';

interface QuickPayFormProps {
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
}

const presets = ['10', '25', '50', '100', '200', '500'];

const QuickPayForm: FC<QuickPayFormProps> = ({
  amount,
  onAmountChange,
  onSubmit,
}) => {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        <h3 className="card-title">Quick Pay</h3>

        <label className="floating-label">
          <span>Amount</span>
          <input
            type="number"
            placeholder="0.00"
            className="input input-bordered w-full"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </label>

        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              className="btn btn-neutral btn-sm"
              onClick={() => onAmountChange(preset)}>
              ${preset}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary w-full gap-2"
          disabled={!amount}
          onClick={onSubmit}>
          <FiSend /> Send Payment
        </button>
      </div>
    </div>
  );
};

export default QuickPayForm;
