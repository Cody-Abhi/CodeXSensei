import { formatMinor } from '../../../shared/money';
import type { Currency, Vendor, VendorStatus } from '../../../shared/types';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { usePlanStore } from '../../store/planStore';
import './VendorSection.css';

export interface VendorSectionProps {
  vendors: Vendor[];
  currency: Currency;
  city: string;
}

const STATUS_LABEL: Record<VendorStatus, string> = {
  to_find: 'To find',
  contacted: 'Contacted',
  booked: 'Booked',
};

const STATUS_TONE: Record<VendorStatus, string> = {
  to_find: 'yellow',
  contacted: 'blue',
  booked: 'green',
};

function mapsLink(query: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} ${city}`)}`;
}

/**
 * Vendor checklist grouped by category with status cycling, progress bar,
 * and Google Maps search links (PRD §F5).
 *
 * @param props - Vendor data, currency, and city.
 * @returns The vendor section.
 */
export function VendorSection({ vendors, currency, city }: VendorSectionProps): React.JSX.Element {
  const cycleStatus = usePlanStore((s) => s.cycleVendorStatus);
  const bookedCount = vendors.filter((v) => v.status === 'booked').length;
  const categories = [...new Set(vendors.map((v) => v.category))];

  return (
    <Card title="Vendors" headerTone="pink">
      <div className="pp-vendors">
        <ProgressBar label="Vendors booked" value={bookedCount} max={vendors.length} tone="green" />
        {categories.map((cat) => (
          <div key={cat} className="pp-vendors__group">
            <h3 className="pp-vendors__cat">{cat}</h3>
            <ul className="pp-vendors__list">
              {vendors
                .filter((v) => v.category === cat)
                .map((vendor) => (
                  <li key={vendor.id} className="pp-vendors__card">
                    <div className="pp-vendors__head">
                      <strong>{vendor.name}</strong>
                      <button
                        type="button"
                        className={`pp-vendors__status tone-${STATUS_TONE[vendor.status]}`}
                        onClick={() => cycleStatus(vendor.id)}
                        aria-label={`${vendor.name}: ${STATUS_LABEL[vendor.status]}. Click to change status.`}
                      >
                        {STATUS_LABEL[vendor.status]}
                      </button>
                    </div>
                    {vendor.why && <p className="pp-vendors__why">{vendor.why}</p>}
                    {vendor.askThem && (
                      <p className="pp-vendors__ask">
                        <strong>Ask them:</strong> {vendor.askThem}
                      </p>
                    )}
                    <div className="pp-vendors__foot">
                      {vendor.costMinor !== undefined && vendor.costMinor > 0 && (
                        <span className="pp-vendors__cost">
                          {formatMinor(vendor.costMinor, currency)}
                        </span>
                      )}
                      <a
                        href={mapsLink(vendor.name, city)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pp-vendors__maps"
                        aria-label={`Find ${vendor.name} on Google Maps`}
                      >
                        Maps ↗
                      </a>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
