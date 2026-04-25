import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("invoices router", () => {
  describe("create", () => {
    it("should create a new invoice with valid input", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.invoices.create({
        clientName: "Acme Corp",
        clientFirstName: "John",
        clientEmail: "john@acme.com",
        invoiceNumber: "INV-001",
        amount: "1000.00",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: "Consulting services",
        tone: "warm-professional",
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
      expect(result.id).toBeGreaterThan(0);
    });

    it("should reject invalid email format", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.invoices.create({
          clientName: "Acme Corp",
          clientFirstName: "John",
          clientEmail: "invalid-email",
          invoiceNumber: "INV-001",
          amount: "1000.00",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          services: "Consulting services",
          tone: "warm-professional",
        })
      ).rejects.toThrow();
    });

    it("should reject invalid amount format", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.invoices.create({
          clientName: "Acme Corp",
          clientFirstName: "John",
          clientEmail: "john@acme.com",
          invoiceNumber: "INV-001",
          amount: "not-a-number",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          services: "Consulting services",
          tone: "warm-professional",
        })
      ).rejects.toThrow();
    });

    it("should reject empty required fields", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.invoices.create({
          clientName: "",
          clientFirstName: "John",
          clientEmail: "john@acme.com",
          invoiceNumber: "INV-001",
          amount: "1000.00",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          services: "Consulting services",
          tone: "warm-professional",
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should return empty list for user with no invoices", async () => {
      const ctx = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.invoices.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("markPaid", () => {
    it("should mark invoice as paid", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create invoice first
      const created = await caller.invoices.create({
        clientName: "Acme Corp",
        clientFirstName: "John",
        clientEmail: "john@acme.com",
        invoiceNumber: "INV-001",
        amount: "1000.00",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: "Consulting services",
        tone: "warm-professional",
      });

      // Mark as paid
      const result = await caller.invoices.markPaid({ id: created.id });

      expect(result).toEqual({ success: true });
    });

    it("should not allow marking someone else's invoice as paid", async () => {
      const ctx1 = createAuthContext(1);
      const ctx2 = createAuthContext(2);
      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      // Create invoice with user 1
      const created = await caller1.invoices.create({
        clientName: "Acme Corp",
        clientFirstName: "John",
        clientEmail: "john@acme.com",
        invoiceNumber: "INV-001",
        amount: "1000.00",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: "Consulting services",
        tone: "warm-professional",
      });

      // Try to mark as paid with user 2
      await expect(caller2.invoices.markPaid({ id: created.id })).rejects.toThrow();
    });
  });

  describe("cancel", () => {
    it("should cancel an invoice", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create invoice
      const created = await caller.invoices.create({
        clientName: "Acme Corp",
        clientFirstName: "John",
        clientEmail: "john@acme.com",
        invoiceNumber: "INV-001",
        amount: "1000.00",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: "Consulting services",
        tone: "warm-professional",
      });

      // Cancel
      const result = await caller.invoices.cancel({ id: created.id });

      expect(result).toEqual({ success: true });
    });
  });

  describe("generateSequence", () => {
    it("should generate email sequence for invoice", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create invoice
      const created = await caller.invoices.create({
        clientName: "Acme Corp",
        clientFirstName: "John",
        clientEmail: "john@acme.com",
        invoiceNumber: "INV-001",
        amount: "1000.00",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: "Consulting services",
        tone: "warm-professional",
      });

      // Generate sequence
      const result = await caller.invoices.generateSequence({ invoiceId: created.id });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("emails");
      expect(Array.isArray(result.emails)).toBe(true);
      expect(result.emails.length).toBe(4);

      // Verify email stages
      expect(result.emails[0].stage).toBe(1); // polite reminder
      expect(result.emails[1].stage).toBe(2); // firm notice
      expect(result.emails[2].stage).toBe(3); // final warning
      expect(result.emails[3].stage).toBe(4); // legal notice

      // Verify all emails have subject and body
      result.emails.forEach((email) => {
        expect(email).toHaveProperty("subject");
        expect(email).toHaveProperty("body");
        expect(typeof email.subject).toBe("string");
        expect(typeof email.body).toBe("string");
        expect(email.subject.length).toBeGreaterThan(0);
        expect(email.body.length).toBeGreaterThan(0);
      });
    });

    it("should not allow generating sequence for someone else's invoice", async () => {
      const ctx1 = createAuthContext(1);
      const ctx2 = createAuthContext(2);
      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      // Create invoice with user 1
      const created = await caller1.invoices.create({
        clientName: "Acme Corp",
        clientFirstName: "John",
        clientEmail: "john@acme.com",
        invoiceNumber: "INV-001",
        amount: "1000.00",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: "Consulting services",
        tone: "warm-professional",
      });

      // Try to generate sequence with user 2
      await expect(caller2.invoices.generateSequence({ invoiceId: created.id })).rejects.toThrow();
    });
  });

  describe("activateSequence", () => {
    it("should activate escalation sequence", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create invoice
      const created = await caller.invoices.create({
        clientName: "Acme Corp",
        clientFirstName: "John",
        clientEmail: "john@acme.com",
        invoiceNumber: "INV-001",
        amount: "1000.00",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: "Consulting services",
        tone: "warm-professional",
      });

      // Generate sequence first
      await caller.invoices.generateSequence({ invoiceId: created.id });

      // Activate sequence
      const result = await caller.invoices.activateSequence({ invoiceId: created.id });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("sequenceId");
      expect(typeof result.sequenceId).toBe("number");
      expect(result.sequenceId).toBeGreaterThan(0);
    });
  });
});
