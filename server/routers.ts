import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateEmailSequence } from "./emailGeneration";
import {
  getUserInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  getInvoiceEmails,
  getEmailById,
  createEmail,
  updateEmail,
  getEscalationSequence,
  createEscalationSequence,
  getUserSubscriptionStatus,
  updateUser,
  getUserById,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Invoice management
  invoices: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserInvoices(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const invoice = await getInvoiceById(input.id);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return invoice;
      }),

    create: protectedProcedure
      .input(
        z.object({
          clientName: z.string().min(1),
          clientFirstName: z.string().min(1),
          clientEmail: z.string().email(),
          invoiceNumber: z.string().min(1),
          amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
          dueDate: z.string().refine((date) => !isNaN(Date.parse(date))),
          services: z.string().min(1),
          tone: z.enum(["warm-professional", "strictly-professional", "direct"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check subscription limit for free tier
        const { isSubscribed, invoiceCount } = await getUserSubscriptionStatus(ctx.user.id);
        if (!isSubscribed && invoiceCount >= 1) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free tier limited to 1 active invoice. Upgrade to create more.",
          });
        }

        const result = await createInvoice({
          userId: ctx.user.id,
          clientName: input.clientName,
          clientFirstName: input.clientFirstName,
          clientEmail: input.clientEmail,
          invoiceNumber: input.invoiceNumber,
          amount: input.amount as any,
          dueDate: new Date(input.dueDate),
          services: input.services,
          tone: input.tone,
          status: "draft",
        });

        return { id: (result as any).insertId || 0 };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          clientName: z.string().optional(),
          clientFirstName: z.string().optional(),
          clientEmail: z.string().email().optional(),
          invoiceNumber: z.string().optional(),
          amount: z.string().optional(),
          dueDate: z.string().optional(),
          services: z.string().optional(),
          tone: z.enum(["warm-professional", "strictly-professional", "direct"]).optional(),
          status: z.enum(["draft", "active", "paid", "cancelled"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const invoice = await getInvoiceById(input.id);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const updateData: any = {};
        if (input.clientName) updateData.clientName = input.clientName;
        if (input.clientFirstName) updateData.clientFirstName = input.clientFirstName;
        if (input.clientEmail) updateData.clientEmail = input.clientEmail;
        if (input.invoiceNumber) updateData.invoiceNumber = input.invoiceNumber;
        if (input.amount) updateData.amount = input.amount;
        if (input.dueDate) updateData.dueDate = new Date(input.dueDate);
        if (input.services) updateData.services = input.services;
        if (input.tone) updateData.tone = input.tone;
        if (input.status) updateData.status = input.status;

        await updateInvoice(input.id, updateData);
        return { success: true };
      }),

    markPaid: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const invoice = await getInvoiceById(input.id);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await updateInvoice(input.id, { status: "paid" });

        // Cancel all pending emails
        const invoiceEmails = await getInvoiceEmails(input.id);
        for (const email of invoiceEmails) {
          if (email.status === "pending") {
            await updateEmail(email.id, { status: "cancelled" });
          }
        }

        return { success: true };
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const invoice = await getInvoiceById(input.id);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await updateInvoice(input.id, { status: "cancelled" });

        // Cancel all pending emails
        const invoiceEmails = await getInvoiceEmails(input.id);
        for (const email of invoiceEmails) {
          if (email.status === "pending") {
            await updateEmail(email.id, { status: "cancelled" });
          }
        }

        return { success: true };
      }),

    generateSequence: protectedProcedure
      .input(z.object({ invoiceId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const invoice = await getInvoiceById(input.invoiceId);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Generate emails using Claude
        const generatedEmails = await generateEmailSequence(invoice);

        // Calculate scheduled dates based on due date
        const dueDate = new Date(invoice.dueDate);
        const sendDays = [3, 7, 14, 30];

        // Store generated emails in database
        const emailIds = [];
        for (let i = 0; i < generatedEmails.length; i++) {
          const email = generatedEmails[i];
          const scheduledDate = new Date(dueDate);
          scheduledDate.setDate(scheduledDate.getDate() + sendDays[i]);

          const result = await createEmail({
            invoiceId: input.invoiceId,
            stage: email.stage,
            sendDay: sendDays[i],
            subject: email.subject,
            body: email.body,
            scheduledFor: scheduledDate,
            status: "pending",
          });

          emailIds.push((result as any).insertId || 0);
        }

        return { success: true, emails: generatedEmails, emailIds };
      }),

    activateSequence: protectedProcedure
      .input(z.object({ invoiceId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const invoice = await getInvoiceById(input.invoiceId);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Update invoice status to active
        await updateInvoice(input.invoiceId, {
          status: "active",
          sequenceActivatedAt: new Date(),
        });

        // Create or update escalation sequence
        let sequence = await getEscalationSequence(input.invoiceId);
        if (!sequence) {
          const result = await createEscalationSequence({
            invoiceId: input.invoiceId,
            currentStage: 0,
          });
          const sequenceId = (result as any).insertId || 0;
          sequence = { id: sequenceId, invoiceId: input.invoiceId, currentStage: 0, lastSentAt: null, createdAt: new Date(), updatedAt: new Date() };
        }

        return { success: true, sequenceId: sequence?.id || 0 };
      }),
  }),

  // Email management
  emails: router({
    getByInvoice: protectedProcedure
      .input(z.object({ invoiceId: z.number() }))
      .query(async ({ input, ctx }) => {
        const invoice = await getInvoiceById(input.invoiceId);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return getInvoiceEmails(input.invoiceId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const email = await getEmailById(input.id);
        if (!email) throw new TRPCError({ code: "NOT_FOUND" });

        const invoice = await getInvoiceById(email.invoiceId);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return email;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          subject: z.string().optional(),
          body: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const email = await getEmailById(input.id);
        if (!email) throw new TRPCError({ code: "NOT_FOUND" });

        const invoice = await getInvoiceById(email.invoiceId);
        if (!invoice || invoice.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const updateData: any = {};
        if (input.subject) updateData.subject = input.subject;
        if (input.body) updateData.body = input.body;

        await updateEmail(input.id, updateData);
        return { success: true };
      }),
  }),

  // Billing
  billing: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const { isSubscribed, invoiceCount } = await getUserSubscriptionStatus(ctx.user.id);

      return {
        isSubscribed,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        invoiceCount,
        invoiceLimit: isSubscribed ? Infinity : 1,
      };
    }),

    setStripeCustomer: protectedProcedure
      .input(z.object({ customerId: z.string(), subscriptionId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await updateUser(ctx.user.id, {
          stripeCustomerId: input.customerId,
          stripeSubscriptionId: input.subscriptionId,
          isSubscribed: true,
        });
        return { success: true };
      }),

    cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      await updateUser(ctx.user.id, {
        stripeSubscriptionId: null,
        isSubscribed: false,
      });
      return { success: true };
    }),
  }),

  // Gmail integration
  gmail: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        isConnected: user.gmailConnected,
      };
    }),

    disconnect: protectedProcedure.mutation(async ({ ctx }) => {
      await updateUser(ctx.user.id, {
        gmailAccessToken: null,
        gmailRefreshToken: null,
        gmailConnected: false,
      });
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
