import type { FC } from 'react';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault?: boolean;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  title?: string;
}

export const PaymentMethods: FC<PaymentMethodsProps> = ({
  methods,
  title = 'Payment methods',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-3">
      <h3 className="card-title">{title}</h3>
      {methods.map((method) => (
        <article
          key={method.id}
          className="bg-base-100 border-base-content/10 flex items-center gap-3 rounded-xl border p-4">
          <span aria-hidden="true" className="text-2xl">
            💳
          </span>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{method.brand}</span>
              {method.isDefault && (
                <span className="badge badge-primary badge-sm">Default</span>
              )}
            </div>
            <p className="text-base-content/60 text-xs">
              •••• {method.last4} · Expires {method.expiry}
            </p>
          </div>
        </article>
      ))}
      {methods.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No payment methods saved.
        </p>
      )}
    </div>
  </section>
);
