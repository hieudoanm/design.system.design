import type { FC } from 'react';

type SubscriptionStatus = 'active' | 'canceled' | 'trial';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billing: string;
  status: SubscriptionStatus;
  nextBilling?: string;
}

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  currency?: string;
  title?: string;
}

const statusBadge: Record<SubscriptionStatus, string> = {
  active: 'badge-success',
  trial: 'badge-info',
  canceled: 'badge-neutral',
};

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

export const SubscriptionManager: FC<SubscriptionManagerProps> = ({
  subscriptions,
  currency = 'USD',
  title = 'Subscriptions',
}) => {
  const monthlyTotal = subscriptions
    .filter((subscription) => subscription.status === 'active')
    .reduce((sum, subscription) => sum + subscription.amount, 0);

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title">{title}</h3>
          <span className="badge badge-primary" data-testid="monthly-total">
            {formatAmount(monthlyTotal, currency)}/mo
          </span>
        </div>
        {subscriptions.map((subscription) => (
          <article
            key={subscription.id}
            className="bg-base-100 border-base-content/10 flex items-center gap-3 rounded-xl border p-4">
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{subscription.name}</span>
              <span className="text-base-content/50 text-xs">
                {formatAmount(subscription.amount, currency)}/
                {subscription.billing}
                {subscription.nextBilling
                  ? ` · renews ${subscription.nextBilling}`
                  : ''}
              </span>
            </div>
            <span
              className={`badge badge-sm ${statusBadge[subscription.status]}`}>
              {subscription.status}
            </span>
          </article>
        ))}
        {subscriptions.length === 0 && (
          <p className="text-base-content/40 text-sm" data-testid="empty">
            No subscriptions.
          </p>
        )}
      </div>
    </section>
  );
};
