# Gusto — Payroll Service

Design a payroll processing system

**Difficulty:** Medium

**Tags:** finance

## Functional Requirements

- a payroll processing system
- compute pay with taxes and deductions?
- run monthly and semimonthly pay cycles?
- handle tax filing across jurisdictions?
- ensure compliance and auditability?

## Non-Functional Requirements

- Payroll is a batch-oriented, correctness-critical system: it computes wages,
  taxes, and deductions for every employee on a fixed schedule, files taxes across
  jurisdictions, and moves money to employees and government agencies.

- I would build it as a gateway in front of employee, payroll engine, tax,
  direct deposit, and reporting services, with a Payroll DB and notifications.
- The engine runs pay cycles as scheduled jobs, while the employee service
  maintains the authoritative roster and pay configuration.
- Because mistakes cause legal exposure and angry employees, payroll punishes
  errors far more than it rewards raw throughput.

A company admin onboards employees through the app; the payroll engine later
combines employee pay rates with hours, benefits, and deductions, and the tax
engine computes jurisdiction-specific taxes to produce net pay.

- Direct deposit transfers the net amount, the pay ledger records every payout,
  and reports and payslips are generated for both the company and each employee.
- Notifications deliver payslips and deposit confirmations.
- Wage garnishments, bonuses, and expense reimbursements are modeled as explicit
  earning lines so the payslip always ties back to its components.

The defining properties are determinism and auditability: the same inputs on the
same cycle must produce the same pay every time, and every amount must be
explainable.

- I would make each pay run a versioned computation with frozen input snapshots,
  so a mid-cycle change to an employee's rate affects the next run, not the
  current one.
- The tradeoff is that correctness work (validation, reconciliation, and review)
  dominates the timeline, so the pipeline is built for safe reruns rather than
  speed.
- A dry-run preview lets admins review a pay run before it commits, a release
  gate that prevents most costly errors..
- Pay cycles are scheduled batch jobs, and their hardest property is
  repeatability.

- I would implement a pay run as an immutable computation over frozen snapshots:
  the employee roster, time data, rates, and tax rules at the effective date,
  all captured before processing begins.
- The run has explicit states (draft, preview, committed, disbursed, archived)
  and a run that fails validation is quarantined for human review rather than
  partially disbursed.
- Each snapshot is hashed and stored, so an auditor can later prove exactly what
  the run saw.

Semimonthly cycles land on fixed dates that can fall on weekends and holidays,
so the scheduler advances the effective disbursement date while keeping the
computation period intact.

- I would separate the computation date, the payout date, and the pay period end
  date in the run's metadata so a shifted date never changes the math.
- Companies also have different cutoffs for hours approval; the engine waits for
  the cutoff, then freezes the time data before computing.
- Off-cycle runs like bonuses or corrections reuse the same pipeline with a
  different cycle type.

Concurrency matters when many companies run on the same cycle, producing a burst
of runs.

- I would parallelize runs across companies with bounded worker pools, each run
  isolated and idempotent so retrying a failed run never duplicates a deposit.
- The tradeoff is that the midnight batch window is the only moment of scale
  pressure, so the scheduler smooths start times and throttles worker count to
  protect both the compute cluster and the payment rails.
- Slack in the batch window absorbs overnight variance because payroll commits
  before the banks open..
- Tax filing means producing jurisdiction-correct returns and remittances for
  federal, state, and local agencies, each with its own formats, schedules, and
  deadlines.

- I would keep the tax engine's rules separate from a filing service that knows
  the mechanics: what form, which recipient, which filing channel, and when it
  is due.
- Every jurisdiction is a small configuration package, so adding a new tax
  regime is a rules update, not a code change.
- Electronic filing also requires identity and authorization registration per
  agency, so the filing service manages credentials and tokens per customer.

Filing is asynchronous and must be reliable.

- The filing service computes the amounts from committed pay runs, produces the
  required file formats, and submits through the official portal or a trusted
  tax partner, with each submission tracked by an id and reconciled against
  acknowledgements.
- If an agency rejects a file, the failure goes to a queue for corrections with
  the exact submission preserved, because the agency's acknowledgement is the
  only proof of filing.
- Deadlines in different jurisdictions can fall on different days, so the
  calendar must reflect the agency's timezone, not the company's.

Because amounts aggregate across many runs, the filing service must respect
annual thresholds and year-end reconciliations; W-2s and similar forms are
generated from year-to-date aggregates that the ledger guarantees.

- The tradeoff is coverage versus effort: every jurisdiction adds edge cases, so
  the platform prioritizes the highest-volume jurisdictions first and clearly
  labels estimated liability where exact filing is not yet supported.
- Compliance calendars drive scheduling and alert the customer about upcoming
  deadlines.
- Penalties for missed filings make the calendar and the acknowledgement
  tracking non-optional product features..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Payroll
company: Company Admin
app: Payroll App
gateway: API Gateway
employee: Employee Service
pay: Payroll Engine
tax: Tax Engine
deposit: Direct Deposit
ledger: Pay Ledger
report: Reports
notify: Notifications
db: Payroll DB

company ─► app ─► add employee
app ─► gateway ─► onboard
gateway ─► employee ─► save
gateway ─► pay ─► run payroll
pay ─► tax ─► compute
pay ─► employee ─► hours
tax ─► deposit ─► amount
deposit ─► ledger ─► pay
pay ─► report ─► generate
pay ─► notify ─► payslips
pay ─► db ─► store
```

## Design

### Design a payroll processing system

Payroll is a batch-oriented, correctness-critical system: it computes wages,
taxes, and deductions for every employee on a fixed schedule, files taxes across
jurisdictions, and moves money to employees and government agencies.

- I would build it as a gateway in front of employee, payroll engine, tax,
  direct deposit, and reporting services, with a Payroll DB and notifications.
- The engine runs pay cycles as scheduled jobs, while the employee service
  maintains the authoritative roster and pay configuration.
- Because mistakes cause legal exposure and angry employees, payroll punishes
  errors far more than it rewards raw throughput.

A company admin onboards employees through the app; the payroll engine later
combines employee pay rates with hours, benefits, and deductions, and the tax
engine computes jurisdiction-specific taxes to produce net pay.

- Direct deposit transfers the net amount, the pay ledger records every payout,
  and reports and payslips are generated for both the company and each employee.
- Notifications deliver payslips and deposit confirmations.
- Wage garnishments, bonuses, and expense reimbursements are modeled as explicit
  earning lines so the payslip always ties back to its components.

The defining properties are determinism and auditability: the same inputs on the
same cycle must produce the same pay every time, and every amount must be
explainable.

- I would make each pay run a versioned computation with frozen input snapshots,
  so a mid-cycle change to an employee's rate affects the next run, not the
  current one.
- The tradeoff is that correctness work (validation, reconciliation, and review)
  dominates the timeline, so the pipeline is built for safe reruns rather than
  speed.
- A dry-run preview lets admins review a pay run before it commits, a release
  gate that prevents most costly errors.

### How do you compute pay with taxes and deductions?

Computing net pay is a deterministic pipeline over structured inputs: gross
earnings, pre-tax deductions, taxes, and post-tax deductions.

- Gross earnings come from salary proration or hours times rate, with overtime
  rules applied; deductions include benefits, retirement contributions, and
  garnishments.
- I would model each employee as a configuration of earning and deduction lines,
  each with effective dates and rules, so the engine composes net pay without
  bespoke code per company.
- Deduction ordering matters legally, so the engine applies pre-tax deductions,
  then taxes, then post-tax deductions in the regulatory order.

Taxes are the hardest part because each jurisdiction has its own rates,
brackets, and rounding rules.

- The tax engine holds a versioned rule table keyed by jurisdiction and
  effective date, computes federal, state, and local withholdings in order, and
  respects annual thresholds like Social Security wage caps.
- Because rules change, the table is versioned and each pay run records which
  rule version it used, so historical pay can always be re-derived.
- Mid-year rate changes and new-hire mid-cycle pay are handled by
  effective-dated lines, never by editing a past run.

Rounding is where systems disagree, and regulators care about pennies.

- I would apply each jurisdiction's official rounding method (per-employee,
  per-payroll cumulative, or aggregated) rather than a global rule, and
  reconcile computed totals against expected amounts at run end.
- The tradeoff is between a flexible generic engine and a fast bespoke one:
  flexibility wins here because supporting many companies with one codebase is
  the entire business model.
- The engine also computes year-to-date aggregates per pay run so annual limits
  and W-2s come out correct.

### How do you run monthly and semimonthly pay cycles?

Pay cycles are scheduled batch jobs, and their hardest property is
repeatability.

- I would implement a pay run as an immutable computation over frozen snapshots:
  the employee roster, time data, rates, and tax rules at the effective date,
  all captured before processing begins.
- The run has explicit states (draft, preview, committed, disbursed, archived)
  and a run that fails validation is quarantined for human review rather than
  partially disbursed.
- Each snapshot is hashed and stored, so an auditor can later prove exactly what
  the run saw.

Semimonthly cycles land on fixed dates that can fall on weekends and holidays,
so the scheduler advances the effective disbursement date while keeping the
computation period intact.

- I would separate the computation date, the payout date, and the pay period end
  date in the run's metadata so a shifted date never changes the math.
- Companies also have different cutoffs for hours approval; the engine waits for
  the cutoff, then freezes the time data before computing.
- Off-cycle runs like bonuses or corrections reuse the same pipeline with a
  different cycle type.

Concurrency matters when many companies run on the same cycle, producing a burst
of runs.

- I would parallelize runs across companies with bounded worker pools, each run
  isolated and idempotent so retrying a failed run never duplicates a deposit.
- The tradeoff is that the midnight batch window is the only moment of scale
  pressure, so the scheduler smooths start times and throttles worker count to
  protect both the compute cluster and the payment rails.
- Slack in the batch window absorbs overnight variance because payroll commits
  before the banks open.

### How do you handle tax filing across jurisdictions?

Tax filing means producing jurisdiction-correct returns and remittances for
federal, state, and local agencies, each with its own formats, schedules, and
deadlines.

- I would keep the tax engine's rules separate from a filing service that knows
  the mechanics: what form, which recipient, which filing channel, and when it
  is due.
- Every jurisdiction is a small configuration package, so adding a new tax
  regime is a rules update, not a code change.
- Electronic filing also requires identity and authorization registration per
  agency, so the filing service manages credentials and tokens per customer.

Filing is asynchronous and must be reliable.

- The filing service computes the amounts from committed pay runs, produces the
  required file formats, and submits through the official portal or a trusted
  tax partner, with each submission tracked by an id and reconciled against
  acknowledgements.
- If an agency rejects a file, the failure goes to a queue for corrections with
  the exact submission preserved, because the agency's acknowledgement is the
  only proof of filing.
- Deadlines in different jurisdictions can fall on different days, so the
  calendar must reflect the agency's timezone, not the company's.

Because amounts aggregate across many runs, the filing service must respect
annual thresholds and year-end reconciliations; W-2s and similar forms are
generated from year-to-date aggregates that the ledger guarantees.

- The tradeoff is coverage versus effort: every jurisdiction adds edge cases, so
  the platform prioritizes the highest-volume jurisdictions first and clearly
  labels estimated liability where exact filing is not yet supported.
- Compliance calendars drive scheduling and alert the customer about upcoming
  deadlines.
- Penalties for missed filings make the calendar and the acknowledgement
  tracking non-optional product features.

### How do you ensure compliance and auditability?

Compliance means an outsider can verify every dollar: who was paid, what taxes
were withheld, and when money moved.

- I would make the pay ledger the spine of this guarantee, recording every
  payout, tax payment, and fee as append-only entries with hashes chained so
  tampering is detectable.
- Every entry references its pay run, which references its frozen input
  snapshot, so any amount can be walked back to source data.
- The hash chain is cheap to compute but makes silent deletion or rewriting of a
  payout trivially detectable in a review.

Auditability also requires identity and access control: the system logs who
viewed or edited employee records, and sensitive data like social security
numbers is encrypted with role-based access.

- I would retain records per regulatory requirement and expose read-only audit
  exports to administrators and accountants.
- Versioned rule tables for tax and policy mean a compliance review can
  reconstruct which rules applied to a given payroll period.
- Multi-factor authentication is required for disbursement and filing actions,
  the two places a single mistake is most expensive.

The tradeoff is that strict auditability costs operational complexity:
append-only stores grow, and every correction becomes a compensating entry
rather than an edit.

- I would tier the storage and archive old runs while keeping their hashes, so
  the chain stays verifiable without the hot database ballooning.
- Continuous reconciliation between the pay ledger, the payroll engine's totals,
  and the bank's actual deposit statements closes the loop daily, catching any
  drift before it reaches a regulator.
- Reports are signed exports, so an accountant's copy can be authenticated
  against the ledger rather than trusted at face value.

## Source

```text
title: Payroll
node company: Company Admin [round, icon=browser]
node app: Payroll App [icon=browser]
node gateway: API Gateway [icon=server]
node employee: Employee Service [icon=users]
node pay: Payroll Engine [icon=compute]
node tax: Tax Engine [icon=compute]
node deposit: Direct Deposit [icon=shield]
node ledger: Pay Ledger [cylinder, icon=database]
node report: Reports [icon=file]
node notify: Notifications [icon=message]
node db: Payroll DB [cylinder, icon=database]

edge company -> app: add employee
edge app -> gateway: onboard
edge gateway -> employee: save
edge gateway -> pay: run payroll
edge pay -> tax: compute
edge pay -> employee: hours
edge tax -> deposit: amount
edge deposit -> ledger: pay
edge pay -> report: generate
edge pay -> notify: payslips
edge pay -> db: store
```

## Q&A

### Q: Design a payroll processing system

**A:** Payroll is a batch-oriented, correctness-critical system: it computes wages,
taxes, and deductions for every employee on a fixed schedule, files taxes across
jurisdictions, and moves money to employees and government agencies.

- I would build it as a gateway in front of employee, payroll engine, tax,
  direct deposit, and reporting services, with a Payroll DB and notifications.
- The engine runs pay cycles as scheduled jobs, while the employee service
  maintains the authoritative roster and pay configuration.
- Because mistakes cause legal exposure and angry employees, payroll punishes
  errors far more than it rewards raw throughput.

A company admin onboards employees through the app; the payroll engine later
combines employee pay rates with hours, benefits, and deductions, and the tax
engine computes jurisdiction-specific taxes to produce net pay.

- Direct deposit transfers the net amount, the pay ledger records every payout,
  and reports and payslips are generated for both the company and each employee.
- Notifications deliver payslips and deposit confirmations.
- Wage garnishments, bonuses, and expense reimbursements are modeled as explicit
  earning lines so the payslip always ties back to its components.

The defining properties are determinism and auditability: the same inputs on the
same cycle must produce the same pay every time, and every amount must be
explainable.

- I would make each pay run a versioned computation with frozen input snapshots,
  so a mid-cycle change to an employee's rate affects the next run, not the
  current one.
- The tradeoff is that correctness work (validation, reconciliation, and review)
  dominates the timeline, so the pipeline is built for safe reruns rather than
  speed.
- A dry-run preview lets admins review a pay run before it commits, a release
  gate that prevents most costly errors.

### Q: How do you compute pay with taxes and deductions?

**A:** Computing net pay is a deterministic pipeline over structured inputs: gross
earnings, pre-tax deductions, taxes, and post-tax deductions.

- Gross earnings come from salary proration or hours times rate, with overtime
  rules applied; deductions include benefits, retirement contributions, and
  garnishments.
- I would model each employee as a configuration of earning and deduction lines,
  each with effective dates and rules, so the engine composes net pay without
  bespoke code per company.
- Deduction ordering matters legally, so the engine applies pre-tax deductions,
  then taxes, then post-tax deductions in the regulatory order.

Taxes are the hardest part because each jurisdiction has its own rates,
brackets, and rounding rules.

- The tax engine holds a versioned rule table keyed by jurisdiction and
  effective date, computes federal, state, and local withholdings in order, and
  respects annual thresholds like Social Security wage caps.
- Because rules change, the table is versioned and each pay run records which
  rule version it used, so historical pay can always be re-derived.
- Mid-year rate changes and new-hire mid-cycle pay are handled by
  effective-dated lines, never by editing a past run.

Rounding is where systems disagree, and regulators care about pennies.

- I would apply each jurisdiction's official rounding method (per-employee,
  per-payroll cumulative, or aggregated) rather than a global rule, and
  reconcile computed totals against expected amounts at run end.
- The tradeoff is between a flexible generic engine and a fast bespoke one:
  flexibility wins here because supporting many companies with one codebase is
  the entire business model.
- The engine also computes year-to-date aggregates per pay run so annual limits
  and W-2s come out correct.

### Q: How do you run monthly and semimonthly pay cycles?

**A:** Pay cycles are scheduled batch jobs, and their hardest property is
repeatability.

- I would implement a pay run as an immutable computation over frozen snapshots:
  the employee roster, time data, rates, and tax rules at the effective date,
  all captured before processing begins.
- The run has explicit states (draft, preview, committed, disbursed, archived)
  and a run that fails validation is quarantined for human review rather than
  partially disbursed.
- Each snapshot is hashed and stored, so an auditor can later prove exactly what
  the run saw.

Semimonthly cycles land on fixed dates that can fall on weekends and holidays,
so the scheduler advances the effective disbursement date while keeping the
computation period intact.

- I would separate the computation date, the payout date, and the pay period end
  date in the run's metadata so a shifted date never changes the math.
- Companies also have different cutoffs for hours approval; the engine waits for
  the cutoff, then freezes the time data before computing.
- Off-cycle runs like bonuses or corrections reuse the same pipeline with a
  different cycle type.

Concurrency matters when many companies run on the same cycle, producing a burst
of runs.

- I would parallelize runs across companies with bounded worker pools, each run
  isolated and idempotent so retrying a failed run never duplicates a deposit.
- The tradeoff is that the midnight batch window is the only moment of scale
  pressure, so the scheduler smooths start times and throttles worker count to
  protect both the compute cluster and the payment rails.
- Slack in the batch window absorbs overnight variance because payroll commits
  before the banks open.

### Q: How do you handle tax filing across jurisdictions?

**A:** Tax filing means producing jurisdiction-correct returns and remittances for
federal, state, and local agencies, each with its own formats, schedules, and
deadlines.

- I would keep the tax engine's rules separate from a filing service that knows
  the mechanics: what form, which recipient, which filing channel, and when it
  is due.
- Every jurisdiction is a small configuration package, so adding a new tax
  regime is a rules update, not a code change.
- Electronic filing also requires identity and authorization registration per
  agency, so the filing service manages credentials and tokens per customer.

Filing is asynchronous and must be reliable.

- The filing service computes the amounts from committed pay runs, produces the
  required file formats, and submits through the official portal or a trusted
  tax partner, with each submission tracked by an id and reconciled against
  acknowledgements.
- If an agency rejects a file, the failure goes to a queue for corrections with
  the exact submission preserved, because the agency's acknowledgement is the
  only proof of filing.
- Deadlines in different jurisdictions can fall on different days, so the
  calendar must reflect the agency's timezone, not the company's.

Because amounts aggregate across many runs, the filing service must respect
annual thresholds and year-end reconciliations; W-2s and similar forms are
generated from year-to-date aggregates that the ledger guarantees.

- The tradeoff is coverage versus effort: every jurisdiction adds edge cases, so
  the platform prioritizes the highest-volume jurisdictions first and clearly
  labels estimated liability where exact filing is not yet supported.
- Compliance calendars drive scheduling and alert the customer about upcoming
  deadlines.
- Penalties for missed filings make the calendar and the acknowledgement
  tracking non-optional product features.

### Q: How do you ensure compliance and auditability?

**A:** Compliance means an outsider can verify every dollar: who was paid, what taxes
were withheld, and when money moved.

- I would make the pay ledger the spine of this guarantee, recording every
  payout, tax payment, and fee as append-only entries with hashes chained so
  tampering is detectable.
- Every entry references its pay run, which references its frozen input
  snapshot, so any amount can be walked back to source data.
- The hash chain is cheap to compute but makes silent deletion or rewriting of a
  payout trivially detectable in a review.

Auditability also requires identity and access control: the system logs who
viewed or edited employee records, and sensitive data like social security
numbers is encrypted with role-based access.

- I would retain records per regulatory requirement and expose read-only audit
  exports to administrators and accountants.
- Versioned rule tables for tax and policy mean a compliance review can
  reconstruct which rules applied to a given payroll period.
- Multi-factor authentication is required for disbursement and filing actions,
  the two places a single mistake is most expensive.

The tradeoff is that strict auditability costs operational complexity:
append-only stores grow, and every correction becomes a compensating entry
rather than an edit.

- I would tier the storage and archive old runs while keeping their hashes, so
  the chain stays verifiable without the hot database ballooning.
- Continuous reconciliation between the pay ledger, the payroll engine's totals,
  and the bank's actual deposit statements closes the loop daily, catching any
  drift before it reaches a regulator.
- Reports are signed exports, so an accountant's copy can be authenticated
  against the ledger rather than trusted at face value.

## Source

```text
title: Payroll
node company: Company Admin [round, icon=browser]
node app: Payroll App [icon=browser]
node gateway: API Gateway [icon=server]
node employee: Employee Service [icon=users]
node pay: Payroll Engine [icon=compute]
node tax: Tax Engine [icon=compute]
node deposit: Direct Deposit [icon=shield]
node ledger: Pay Ledger [cylinder, icon=database]
node report: Reports [icon=file]
node notify: Notifications [icon=message]
node db: Payroll DB [cylinder, icon=database]

edge company -> app: add employee
edge app -> gateway: onboard
edge gateway -> employee: save
edge gateway -> pay: run payroll
edge pay -> tax: compute
edge pay -> employee: hours
edge tax -> deposit: amount
edge deposit -> ledger: pay
edge pay -> report: generate
edge pay -> notify: payslips
edge pay -> db: store
```
