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

interface DealAlertCompany {
  name: string;
  slug: string;
  sector: string | null;
  description: string | null;
}

interface DealAlertProps {
  newCompanies: DealAlertCompany[];
  appUrl: string;
}

export function DealAlert({ newCompanies, appUrl }: DealAlertProps) {
  const count = newCompanies.length;

  return (
    <Html>
      <Head />
      <Preview>
        {`${count} new Oxford spinout${count !== 1 ? "s" : ""} match your watchlist`}
      </Preview>
      <Body
        style={{
          backgroundColor: "#f9fafb",
          fontFamily: "sans-serif",
          margin: 0,
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            maxWidth: "560px",
            margin: "0 auto",
            padding: "40px",
          }}
        >
          {/* Header */}
          <Text
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "8px",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}
          >
            Deal Alert · Oxford Deal Flow
          </Text>
          <Heading
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 8px",
            }}
          >
            New Spinouts on Your Radar
          </Heading>
          <Text
            style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 32px" }}
          >
            {count} new Oxford spinout{count !== 1 ? "s" : ""}{" "}
            {count !== 1 ? "match" : "matches"} your watchlist criteria.
          </Text>

          {/* Company list */}
          <Section style={{ marginBottom: "28px" }}>
            {newCompanies.map((company, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "3px solid #10b981",
                  paddingLeft: "12px",
                  marginBottom: "16px",
                }}
              >
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: "0 0 2px",
                  }}
                >
                  <Link
                    href={`${appUrl}/u/${process.env.NEXT_PUBLIC_DEFAULT_UNIVERSITY_SLUG ?? "oxford"}/companies/${company.slug}`}
                    style={{ color: "#111827", textDecoration: "none" }}
                  >
                    {company.name}
                  </Link>
                </Text>
                {company.sector && (
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0 0 2px",
                    }}
                  >
                    {company.sector}
                  </Text>
                )}
                {company.description && (
                  <Text
                    style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}
                  >
                    {company.description.slice(0, 140)}
                    {company.description.length > 140 ? "…" : ""}
                  </Text>
                )}
              </div>
            ))}
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const }}>
            <Link
              href={`${appUrl}/u/${process.env.NEXT_PUBLIC_DEFAULT_UNIVERSITY_SLUG ?? "oxford"}/watchlist`}
              style={{
                backgroundColor: "#111827",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View Watchlist →
            </Link>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />
          <Text
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center" as const,
            }}
          >
            Oxford Deal Flow ·{" "}
            <Link href={`${appUrl}/account`} style={{ color: "#9ca3af" }}>
              Manage preferences
            </Link>{" "}
            ·{" "}
            <Link href={`${appUrl}/account`} style={{ color: "#9ca3af" }}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DealAlert;
