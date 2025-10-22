# Accounting Guide

Learn how to manage company finances, record transactions, and run payroll in the CRM Platform.

## Table of Contents
1. [Managing Accounts](#managing-accounts)
2. [Recording Transactions](#recording-transactions)
3. [Invoicing](#invoicing)
4. [Financial Reports](#financial-reports)
5. [Payroll Execution](#payroll-execution)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Managing Accounts

### Viewing Accounts
**Navigate to**: Sidebar → Accounting → Accounts

See all bank, cash, and card accounts with balances, currencies, and statuses.

[Screenshot: Accounts overview]

**Filters & actions**:
- Filter by account type or currency
- Sort by balance or recent activity
- Toggle active/inactive accounts
- Export account list for audits

### Creating an Account
1. Click "New Account"
2. Select account type (Bank, Cash, Card)
3. Enter name, currency, and opening balance
4. Add optional details (bank name, account number)
5. Click "Create"

Accounts become immediately available for transaction posting.

### Editing or Archiving
- Use inline editing for balance adjustments (with audit log entries)
- Archive accounts that are no longer used; transactions remain visible in history

---

## Recording Transactions

### Adding Transactions Manually
1. Navigate to Accounting → Transactions
2. Click "+ New Transaction"
3. Select account and transaction type (Income, Expense, Transfer)
4. Enter amount, currency, category, and description
5. Attach receipts or documents as needed
6. Save to post immediately or schedule for later

### Bulk Upload
- Download the CSV template from the Transactions page
- Populate fields (date, account, type, amount, category, client)
- Upload and review the preview before confirming

### Approvals & Audit Trail
Configure dual approval for high-value transactions. All edits create immutable audit log entries accessible from the transaction detail view.

---

## Invoicing

### Creating Invoices
1. Go to Accounting → Invoices
2. Click "New Invoice"
3. Select client and add line items (description, quantity, rate)
4. Set issue date, due date, and payment terms
5. Add taxes or discounts if applicable
6. Save draft or send directly via email

### Managing Invoice Status
- Draft → Sent → Paid → Archived
- Automated reminders for upcoming or overdue invoices
- Record payments manually or through payment gateway integrations

### Templates & Branding
Customize templates with company logo, colors, and footer notes. Save multiple templates for different business units.

---

## Financial Reports

### Standard Reports
Access ready-made reports in Accounting → Reports:
- Profit & Loss
- Balance Sheet
- Cash Flow
- Accounts Receivable Aging
- Accounts Payable Aging

Each report supports date range filters, department segmentation, and export to PDF/CSV.

### Custom Dashboards
Use the analytics builder to create tailored dashboards:
- Choose metrics (revenue, expenses, net income)
- Add widgets (charts, tables, KPIs)
- Schedule automatic email delivery to stakeholders

---

## Payroll Execution

### Preparation
1. Confirm employee salary updates in HR module
2. Review time tracking and leave data
3. Import any bonuses or deductions from AI insights

### Running Payroll
1. Navigate to Accounting → Payroll
2. Select payroll cycle (weekly, bi-weekly, monthly)
3. Review calculated amounts per employee
4. Approve or adjust line items (with reason codes)
5. Generate payslips and export bank transfer files

### Post-Payroll
- Post payroll journal entries to the ledger automatically
- Notify employees via email with payslip links
- Archive payroll run and lock period to prevent changes

---

## Best Practices

- Reconcile accounts weekly using bank feed integrations
- Attach documentation to every transaction for audit readiness
- Automate invoice reminders to reduce overdue payments
- Review financial dashboards monthly with leadership
- Collaborate with HR on payroll changes and compliance checks

---

## Troubleshooting

### Transaction import errors
- Verify CSV headers match the template
- Check for missing required fields (account, amount, date)
- Ensure currency codes are valid (ISO 4217)

### Invoice not sending
- Confirm SMTP settings in Admin → Integrations
- Check recipient email address for typos
- Review email logs for bounce or spam issues

### Payroll discrepancies
- Compare payroll inputs with HR data
- Recalculate affected employees and rerun approval
- Contact support if ledger posting fails

---

Need more help? [Contact Support](mailto:support@yourcompany.com)
