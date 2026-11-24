import type { FC } from 'react';

interface InventoryRow {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  price: number;
}

interface InventoryTableProps {
  rows: InventoryRow[];
}

export const InventoryTable: FC<InventoryTableProps> = ({ rows }) => (
  <div data-testid="inventory-table" className="overflow-x-auto">
    <table className="table-zebra table">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={5} className="text-base-content/40 text-center">
              No inventory
            </td>
          </tr>
        )}
        {rows.map((row) => {
          const low = row.quantity <= row.reorderLevel;
          return (
            <tr key={row.id}>
              <td className="font-medium">{row.name}</td>
              <td className="text-base-content/60">{row.sku}</td>
              <td>${row.price.toLocaleString()}</td>
              <td>{row.quantity}</td>
              <td>
                <span
                  className={`badge badge-sm ${
                    low ? 'badge-warning' : 'badge-success'
                  }`}>
                  {low ? 'Low stock' : 'In stock'}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

InventoryTable.displayName = 'InventoryTable';
