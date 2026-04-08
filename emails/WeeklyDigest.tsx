import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface FeedItemData {
  type: string;
  title: string;
  summary: string | null;
  sourceUrl: string | null;
  publishedAt: Date;
  company: { name: string; slug: string } | null;
}

interface WeeklyDigestProps {
  newSpinouts: FeedItemData[];
  fundingEvents: FeedItemData[];
  newsItems: FeedItemData[];
  totalSpinouts: number;
  appUrl: string;
}

const TYPE_LABELS: Record<string, string> = {
  new_spinout: "New Spinout",
  funding_round: "Funding",
  news: "News",
  event: "Event",
};

export function WeeklyDigest({
  newSpinouts,
  fundingEvents,
  newsItems,
  totalSpinouts,
  appUrl,
}: WeeklyDigestProps) {
  const hasContent = newSpinouts.length + fundingEvents.length + newsItems.length > 0;
  const weekStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Html>
      <Head />
      <Preview>
        Oxford Deal Flow — {newSpinouts.length > 0 ? `${newSpinouts.length} new spinout${newSpinouts.length > 1 ? "s" : ""} this week` : "Your weekly Oxford deal digest"}
      </Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif", margin: 0, padding: "40px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", maxWidth: "560px", margin: "0 auto", padding: "40px" }}>
          {/* Header */}
          <Text style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Weekly Digest · {weekStr}
          </Text>
          <Heading style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            Oxford Deal Flow
          </Heading>
          <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 32px" }}>
            Tracking {totalSpinouts}+ spinout companies from the University of Oxford.
          </Text>

          {!hasContent && (
            <Text style={{ fontSize: "14px", color: "#6b7280" }}>
              No new activity this week. Check back next Monday.
            </Text>
          )}

          {/* New Spinouts */}
          {newSpinouts.length > 0 && (
            <Section style={{ marginBottom: "28px" }}>
              <Text style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                🚀 New Spinouts ({newSpinouts.length})
              </Text>
              {newSpinouts.map((item, i) => (
                <div key={i} style={{ borderLeft: "3px solid #10b981", paddingLeft: "12px", marginBottom: "12px" }}>
                  <Text style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>
                    {item.sourceUrl ? <Link href={item.sourceUrl} style={{ color: "#111827", textDecoration: "none" }}>{item.title}</Link> : item.title}
                  </Text>
                  {item.summary && (
                    <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>{item.summary.slice(0, 120)}{item.summary.length > 120 ? "…" : ""}</Text>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Funding */}
          {fundingEvents.length > 0 && (
            <Section style={{ marginBottom: "28px" }}>
              <Text style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                💰 Funding Events ({fundingEvents.length})
              </Text>
              {fundingEvents.map((item, i) => (
                <div key={i} style={{ borderLeft: "3px solid #3b82f6", paddingLeft: "12px", marginBottom: "12px" }}>
                  <Text style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>
                    {item.sourceUrl ? <Link href={item.sourceUrl} style={{ color: "#111827", textDecoration: "none" }}>{item.title}</Link> : item.title}
                  </Text>
                  {item.company && (
                    <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>{item.company.name}</Text>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* News */}
          {newsItems.length > 0 && (
            <Section style={{ marginBottom: "28px" }}>
              <Text style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                📰 News ({newsItems.length})
              </Text>
              {newsItems.slice(0, 3).map((item, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <Text style={{ fontSize: "14px", color: "#374151", margin: "0" }}>
                    {item.sourceUrl ? <Link href={item.sourceUrl} style={{ color: "#2563eb" }}>{item.title}</Link> : item.title}
                  </Text>
                </div>
              ))}
            </Section>
          )}

          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const }}>
            <Link
              href={`${appUrl}/u/${process.env.NEXT_PUBLIC_DEFAULT_UNIVERSITY_SLUG ?? "oxford"}/feed`}
              style={{ backgroundColor: "#111827", color: "#ffffff", padding: "12px 28px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}
            >
              View Full Feed →
            </Link>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />
          <Text style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" as const }}>
            Oxford Deal Flow · <Link href={`${appUrl}/account`} style={{ color: "#9ca3af" }}>Manage preferences</Link> · <Link href={`${appUrl}/account`} style={{ color: "#9ca3af" }}>Unsubscribe</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WeeklyDigest;
