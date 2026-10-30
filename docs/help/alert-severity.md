# Understanding Alert Severity

Alert severity combines model confidence with business impact.

## Severity Levels

- Low: informational signal; no immediate response.
- Medium: possible risk; analyst review required.
- High: likely malicious or risky activity.
- Critical: confirmed or near-certain high-impact event.

## Suggested Actions

1. Critical: isolate affected entities and notify stakeholders.
2. High: gather evidence and start an incident if needed.
3. Medium: enrich with additional telemetry before escalation.
4. Low: keep for trend analysis and model feedback.

## Escalation Rule

Escalate when the same entity triggers multiple medium alerts in a short window, or when one high alert correlates with known indicators of compromise.
