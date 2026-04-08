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

interface WelcomeEmailProps {
  firstName: string;
  appUrl: string;
}

export function WelcomeEmail({ firstName, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to Oxford Deal Flow — your Oxford spinout intelligence platform
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
          <Heading
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 8px",
            }}
          >
            Oxford Deal Flow
          </Heading>
          <Text
            style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 32px" }}
          >
            Welcome aboard, {firstName}!
          </Text>

          <Text style={{ fontSize: "15px", color: "#374151", margin: "0 0 24px" }}>
            You now have access to the most complete tracking platform for
            University of Oxford spinout companies. Here&apos;s what you can
            explore:
          </Text>

          {/* Feature: Directory */}
          <Section style={{ marginBottom: "20px" }}>
            <div
              style={{
                borderLeft: "3px solid #10b981",
                paddingLeft: "12px",
                marginBottom: "12px",
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
                🔍 Complete Directory
              </Text>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
                Browse 500+ spinouts filtered by sector, funding stage, and
                founding date.
              </Text>
            </div>
          </Section>

          {/* Feature: Feed */}
          <Section style={{ marginBottom: "20px" }}>
            <div
              style={{
                borderLeft: "3px solid #3b82f6",
                paddingLeft: "12px",
                marginBottom: "12px",
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
                ⚡ Activity Feed
              </Text>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
                Funding rounds, new spinouts, and ecosystem events as they
                happen.
              </Text>
            </div>
          </Section>

          {/* Feature: IP Pipeline */}
          <Section style={{ marginBottom: "28px" }}>
            <div
              style={{
                borderLeft: "3px solid #8b5cf6",
                paddingLeft: "12px",
                marginBottom: "12px",
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
                🧬 IP Pipeline
              </Text>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
                Pre-company Oxford University Innovation technologies available
                for licensing.
              </Text>
            </div>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const }}>
            <Link
              href={`${appUrl}/u/${process.env.NEXT_PUBLIC_DEFAULT_UNIVERSITY_SLUG ?? "oxford"}/directory`}
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
              Explore the Directory →
            </Link>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />

          <Text
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: "0 0 8px",
            }}
          >
            Want founder emails, outreach templates, and deal alerts?{" "}
            <Link href={`${appUrl}/pricing`} style={{ color: "#2563eb" }}>
              Upgrade to Pro
            </Link>
            .
          </Text>

          <Text
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center" as const,
              margin: "16px 0 0",
            }}
          >
            Oxford Deal Flow ·{" "}
            <Link
              href={`${appUrl}/account`}
              style={{ color: "#9ca3af" }}
            >
              Manage preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
