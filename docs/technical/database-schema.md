# Database Schema

This document describes the relational data model for the CRM platform. The diagram is defined using [dbdiagram.io](https://dbdiagram.io) syntax to support easy visualization and collaboration.

## ER Diagram (DBML)

```dbml
// Database Schema

Table users {
  id uuid [pk]
  email varchar [unique, not null]
  password_hash varchar [not null]
  role varchar [not null] // admin, manager, operator, accountant, hr, viewer
  is_active boolean [default: true]
  last_login timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table employees {
  id uuid [pk]
  user_id uuid [ref: - users.id]
  first_name varchar [not null]
  last_name varchar [not null]
  position varchar
  department varchar
  hire_date date
  salary decimal
  phone varchar
  avatar_url varchar
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table clients {
  id uuid [pk]
  name varchar [not null]
  email varchar
  phone varchar
  company varchar
  industry varchar
  status varchar // lead, active, inactive, lost
  assigned_to uuid [ref: > employees.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp

  indexes {
    (status, assigned_to)
    email
  }
}

Table deals {
  id uuid [pk]
  client_id uuid [ref: > clients.id]
  title varchar [not null]
  value decimal
  currency varchar [default: 'USD']
  stage varchar // lead, contact_made, qualification, proposal, negotiation, closed_won, closed_lost
  probability integer // 0-100
  expected_close_date date
  assigned_to uuid [ref: > employees.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp

  indexes {
    (stage, assigned_to)
    client_id
  }
}

Table activities {
  id uuid [pk]
  client_id uuid [ref: > clients.id]
  deal_id uuid [ref: > deals.id]
  type varchar // call, meeting, email, note, task
  subject varchar
  description text
  date timestamp
  duration integer // minutes
  created_by uuid [ref: > employees.id]
  created_at timestamp [default: `now()`]

  indexes {
    (client_id, date)
    deal_id
  }
}

Table accounts {
  id uuid [pk]
  name varchar [not null]
  type varchar // bank, cash, card
  currency varchar [default: 'USD']
  balance decimal [default: 0]
  bank_name varchar
  account_number varchar
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table transactions {
  id uuid [pk]
  account_id uuid [ref: > accounts.id]
  type varchar // income, expense, transfer
  amount decimal [not null]
  currency varchar
  category varchar
  description text
  date date [not null]
  client_id uuid [ref: > clients.id]
  created_at timestamp [default: `now()`]

  indexes {
    (account_id, date)
    (type, category, date)
  }
}

Table invoices {
  id uuid [pk]
  invoice_number varchar [unique, not null]
  client_id uuid [ref: > clients.id]
  amount decimal [not null]
  currency varchar [default: 'USD']
  status varchar // draft, sent, paid, overdue, cancelled
  issue_date date
  due_date date
  paid_date date
  created_by uuid [ref: > employees.id]
  created_at timestamp [default: `now()`]

  indexes {
    (status, due_date)
    client_id
    invoice_number
  }
}
```

## Table Descriptions

### users

Stores authentication credentials and access roles for every person interacting with the platform. Passwords are stored as bcrypt hashes and users can be activated or suspended via the `is_active` flag.

### employees

Extends the `users` table with HR-related metadata (profile, department, salary) to support HR workflows, time tracking, and assignments in CRM and accounting modules.

### clients

Represents organizations or individuals the company engages with. Tracks ownership through `assigned_to`, industry classification, and CRM-specific status for pipeline segmentation.

### deals

Captures opportunities across the sales pipeline, including stage progression, expected close dates, and assigned sales representatives. Links back to the owning client for reporting.

### activities

Logs all interactions with clients and deals—calls, meetings, emails, notes, and tasks. Provides a chronological history and supports productivity analytics.

### accounts

Defines financial accounts (bank, cash, card) used for accounting entries. Maintains running balances, activation state, and metadata required for reconciliation.

### transactions

Records financial transactions for accounting and reporting. Supports categorization, client association, and time-based queries through targeted indexes.

### invoices

Stores billing documents and their lifecycle states. Tracks issuance, payment, and overdue status along with responsible employees for audit purposes.

Use this schema as the source of truth for designing migrations, building ORM models, and generating analytics datasets.
