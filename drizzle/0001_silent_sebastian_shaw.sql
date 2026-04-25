CREATE TABLE `emailLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailId` int NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`deliveryStatus` enum('success','failed','bounced') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`stage` int NOT NULL,
	`sendDay` int NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`scheduledFor` date NOT NULL,
	`sentAt` timestamp,
	`status` enum('pending','sent','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalationSequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`currentStage` int NOT NULL DEFAULT 0,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escalationSequences_id` PRIMARY KEY(`id`),
	CONSTRAINT `escalationSequences_invoiceId_unique` UNIQUE(`invoiceId`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientFirstName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`invoiceNumber` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`dueDate` date NOT NULL,
	`services` text NOT NULL,
	`tone` enum('warm-professional','strictly-professional','direct') NOT NULL DEFAULT 'warm-professional',
	`status` enum('draft','active','paid','cancelled') NOT NULL DEFAULT 'draft',
	`sequenceActivatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `gmailAccessToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `gmailRefreshToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `gmailConnected` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isSubscribed` boolean DEFAULT false NOT NULL;