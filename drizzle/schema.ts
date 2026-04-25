import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, decimal, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  gmailAccessToken: text("gmailAccessToken"),
  gmailRefreshToken: text("gmailRefreshToken"),
  gmailConnected: boolean("gmailConnected").default(false).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  isSubscribed: boolean("isSubscribed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Invoices table - stores invoice data for each user
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientFirstName: varchar("clientFirstName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("dueDate").notNull(),
  services: text("services").notNull(),
  tone: mysqlEnum("tone", ["warm-professional", "strictly-professional", "direct"]).default("warm-professional").notNull(),
  status: mysqlEnum("status", ["draft", "active", "paid", "cancelled"]).default("draft").notNull(),
  sequenceActivatedAt: timestamp("sequenceActivatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Emails table - stores generated and sent emails for each invoice
 */
export const emails = mysqlTable("emails", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  stage: int("stage").notNull(), // 1, 2, 3, or 4
  sendDay: int("sendDay").notNull(), // 3, 7, 14, or 30
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  scheduledFor: date("scheduledFor").notNull(),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", ["pending", "sent", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

/**
 * Escalation sequences table - tracks the overall escalation sequence for each invoice
 */
export const escalationSequences = mysqlTable("escalationSequences", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull().unique(),
  currentStage: int("currentStage").default(0).notNull(),
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EscalationSequence = typeof escalationSequences.$inferSelect;
export type InsertEscalationSequence = typeof escalationSequences.$inferInsert;

/**
 * Email logs table - tracks delivery and errors for each email
 */
export const emailLogs = mysqlTable("emailLogs", {
  id: int("id").autoincrement().primaryKey(),
  emailId: int("emailId").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  deliveryStatus: mysqlEnum("deliveryStatus", ["success", "failed", "bounced"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  emails: many(emails),
  escalationSequence: one(escalationSequences, { fields: [invoices.id], references: [escalationSequences.invoiceId] }),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
  invoice: one(invoices, { fields: [emails.invoiceId], references: [invoices.id] }),
  logs: many(emailLogs),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  email: one(emails, { fields: [emailLogs.emailId], references: [emails.id] }),
}));

export const escalationSequencesRelations = relations(escalationSequences, ({ one }) => ({
  invoice: one(invoices, { fields: [escalationSequences.invoiceId], references: [invoices.id] }),
}));