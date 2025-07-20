import {
  bigint,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// New schema for SWOT analysis reports
export const reportSchema = pgTable('report', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  product: text('product').notNull(),
  objective: text('objective').notNull(),
  segment: text('segment').notNull(),
  status: text('status').default('draft').notNull(), // draft, completed, archived
  metadata: json('metadata'), // Additional metadata like tags, notes, etc.
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Schema for individual insights within a report
export const insightSchema = pgTable('insight', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').references(() => reportSchema.id).notNull(),
  category: text('category').notNull(), // Strengths, Weaknesses, Opportunities, Threats, etc.
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  modelVersion: text('model_version').notNull(),
  processingTime: integer('processing_time'), // in milliseconds
  score: integer('score'), // confidence score (1-100)
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Schema for comparison sessions
export const comparisonSchema = pgTable('comparison', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  reportIds: json('report_ids').notNull(), // Array of report IDs being compared
  comparisonType: text('comparison_type').notNull(), // 'segment', 'product', 'objective'
  metadata: json('metadata'), // Additional comparison settings
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
