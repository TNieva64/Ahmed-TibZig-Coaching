CREATE TABLE `missedSessionReschedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalSessionId` int NOT NULL,
	`newSessionId` int,
	`userId` int NOT NULL,
	`originalDate` timestamp NOT NULL,
	`proposedDate` timestamp NOT NULL,
	`status` enum('pending','accepted','rejected','auto_accepted') NOT NULL DEFAULT 'pending',
	`notificationSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	CONSTRAINT `missedSessionReschedules_id` PRIMARY KEY(`id`)
);
