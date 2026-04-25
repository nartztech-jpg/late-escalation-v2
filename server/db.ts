import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, invoices, emails, escalationSequences, emailLogs, InsertInvoice, InsertEmail, InsertEscalationSequence } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

// Invoice queries
export async function getUserInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data);
  return result;
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(invoices).set({ ...data, updatedAt: new Date() }).where(eq(invoices.id, id));
}

// Email queries
export async function getInvoiceEmails(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emails).where(eq(emails.invoiceId, invoiceId)).orderBy(emails.stage);
}

export async function getEmailById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emails).where(eq(emails.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEmail(data: InsertEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emails).values(data);
  return result;
}

export async function updateEmail(id: number, data: Partial<InsertEmail>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(emails).set(data).where(eq(emails.id, id));
}

export async function getDueEmails(beforeDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emails).where(
    and(
      eq(emails.status, "pending"),
      lte(emails.scheduledFor, beforeDate)
    )
  );
}

// Escalation sequence queries
export async function getEscalationSequence(invoiceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(escalationSequences).where(eq(escalationSequences.invoiceId, invoiceId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEscalationSequence(data: InsertEscalationSequence) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(escalationSequences).values(data);
  return result;
}

export async function updateEscalationSequence(id: number, data: Partial<InsertEscalationSequence>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(escalationSequences).set({ ...data, updatedAt: new Date() }).where(eq(escalationSequences.id, id));
}

// Email log queries
export async function createEmailLog(data: { emailId: number; deliveryStatus: 'success' | 'failed' | 'bounced'; errorMessage?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(emailLogs).values(data);
}

export async function getEmailLogs(emailId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailLogs).where(eq(emailLogs.emailId, emailId)).orderBy(desc(emailLogs.createdAt));
}

// Subscription queries
export async function getUserSubscriptionStatus(userId: number) {
  const db = await getDb();
  if (!db) return { isSubscribed: false, invoiceCount: 0 };
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) return { isSubscribed: false, invoiceCount: 0 };
  
  const invoiceCount = await db.select().from(invoices).where(
    and(
      eq(invoices.userId, userId),
      eq(invoices.status, "active")
    )
  );
  
  return {
    isSubscribed: user[0].isSubscribed,
    invoiceCount: invoiceCount.length,
  };
}
