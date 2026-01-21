CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`coachId` int NOT NULL,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`unreadCountClient` int NOT NULL DEFAULT 0,
	`unreadCountCoach` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`type` enum('text','image','video','file') NOT NULL DEFAULT 'text',
	`fileUrl` text,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
