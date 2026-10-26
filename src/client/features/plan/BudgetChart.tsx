import { formatMinor } from '../../../shared/money';
import type { BudgetItem, Currency } from '../../../shared/types';

const BAR_TONES = ['green', 'blue', 'yellow', 'pink', 'purple', 'orange'] as const;

export interface BudgetChartProps {
  budget: BudgetItem[];
  currency: Currency;
}

/**
 * Horizontal SVG bar chart of budget items with a visually-hidden data-table
 * fallback for assistive technology (PRD §F3).
 *
 * @param props - Budget items and currency.
 * @returns The chart and its accessible fallback.
 */
export function BudgetChart({ budget, currency }: BudgetChartProps): React.JSX.Element {
  const maxAmount = Math.max(...budget.map((b) => b.amountMinor), 1);
  const barHeight = 28;
  const gap = 8;
  const labelWidth = 140;
  const barArea = 260;
  const valueWidth = 120;
  const svgWidth = labelWidth + barArea + valueWidth;
  const svgHeight = budget.length * (barHeight + gap) - gap + 4;

  return (
    <div className="pp-budget-chart">
      <svg
        role="img"
        aria-hidden="true"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="pp-budget-chart__svg"
      >
        {budget.map((item, i) => {
          const y = i * (barHeight + gap);
          const width = (item.amountMinor / maxAmount) * barArea;
          return (
            <g key={item.category}>
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2 + 5}
                textAnchor="end"
                className="pp-budget-chart__label"
              >
                {item.category}
              </text>
              <rect
                x={labelWidth}
                y={y}
                width={Math.max(width, 2)}
                height={barHeight}
                className={`pp-budget-chart__bar tone-${BAR_TONES[i % BAR_TONES.length]}`}
              />
              <text
                x={labelWidth + Math.max(width, 2) + 6}
                y={y + barHeight / 2 + 5}
                className="pp-budget-chart__value"
              >
                {formatMinor(item.amountMinor, currency)}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="visually-hidden">
        <caption>Budget breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {budget.map((item) => (
            <tr key={item.category}>
              <td>{item.category}</td>
              <td>{formatMinor(item.amountMinor, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
