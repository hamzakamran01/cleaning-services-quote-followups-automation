import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import type { LineItem } from "@/lib/types/proposal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricePreviewProps {
  monthlyPrice: number;
  annualPrice: number;
  lineItems: LineItem[];
  discountApplied: number;
  priceLow?: number;
  priceHigh?: number;
}

export function PricePreview({
  monthlyPrice,
  annualPrice,
  lineItems,
  discountApplied,
  priceLow,
  priceHigh,
}: PricePreviewProps) {
  return (
    <Card className="sticky top-8 border-brand-primary/20 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <CardTitle className="text-base">Live Price Estimate</CardTitle>
        {discountApplied > 0 && (
          <Badge variant="success">{discountApplied}% discount applied</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {priceLow !== undefined && priceHigh !== undefined && priceLow !== priceHigh ? (
          <div>
            <p className="text-sm text-brand-muted">Estimated Range</p>
            <p className="text-2xl font-bold text-brand-primary">
              {formatCurrency(priceLow)} – {formatCurrency(priceHigh)}
            </p>
            <p className="text-xs text-brand-muted">Midpoint: {formatCurrency(monthlyPrice)}/mo</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-brand-muted">Estimated Monthly</p>
            <p className="text-3xl font-bold text-brand-primary">{formatCurrency(monthlyPrice)}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-brand-muted">Annual Value</p>
          <p className="text-lg font-semibold text-brand-text">{formatCurrency(annualPrice)}</p>
        </div>
        <div className="border-t border-brand-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-muted">
            Line Items
          </p>
          <ul className="space-y-2">
            {lineItems.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-brand-muted">{item.service}</span>
                <span className="font-medium">
                  {item.monthlyCost === 0 ? "Included" : formatCurrencyPrecise(item.monthlyCost)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-brand-muted">
          Internal estimate only. Final pricing appears on the generated proposal.
        </p>
      </CardContent>
    </Card>
  );
}
