import { FC, useState } from 'react';
import type { Card } from '@/exhibit/types/wallet';
import { useToast } from '@/exhibit/providers/wallet/ToastProvider';
import {
  FiLock,
  FiUnlock,
  FiAlertTriangle,
  FiRefreshCw,
  FiShield,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

interface CardActionsProps {
  card: Card;
  onToggleFreeze: () => void;
}

const CardActions: FC<CardActionsProps> = ({ card, onToggleFreeze }) => {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const actions = [
    {
      label: card.frozen ? 'Unfreeze Card' : 'Freeze Card',
      icon: card.frozen ? <FiUnlock /> : <FiLock />,
      onClick: onToggleFreeze,
      variant: card.frozen ? 'btn-primary' : 'btn-error btn-outline',
    },
    {
      label: 'Change PIN',
      icon: <FiShield />,
      onClick: () => showToast('PIN change is not available in demo', 'info'),
      variant: 'btn-neutral',
    },
    {
      label: 'Report Lost/Stolen',
      icon: <FiAlertTriangle />,
      onClick: () => showToast('Report submitted', 'success'),
      variant: 'btn-error btn-outline',
    },
    {
      label: 'Replace Card',
      icon: <FiRefreshCw />,
      onClick: () => showToast('Replacement request submitted', 'info'),
      variant: 'btn-neutral',
    },
  ];

  const visibleActions = expanded ? actions : actions.slice(0, 2);

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-3">
        <h3 className="card-title text-sm">Card Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {visibleActions.map((action) => (
            <button
              key={action.label}
              className={`btn btn-sm ${action.variant} justify-start gap-2`}
              onClick={action.onClick}>
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
        {actions.length > 2 && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <>
                <FiChevronUp /> Show less
              </>
            ) : (
              <>
                <FiChevronDown /> More actions
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CardActions;
