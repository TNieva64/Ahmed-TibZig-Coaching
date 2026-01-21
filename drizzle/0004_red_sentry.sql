CREATE TABLE `workoutCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`duration` int,
	`notes` text,
	`rating` int,
	`caloriesBurned` int,
	`heartRateAvg` int,
	`heartRateMax` int,
	CONSTRAINT `workoutCompletions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workoutReminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`reminderTime` timestamp NOT NULL,
	`isSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workoutReminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workoutSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('cardio','strength','flexibility','hiit','endurance','recovery') NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`duration` int,
	`difficulty` enum('easy','medium','hard','extreme') DEFAULT 'medium',
	`instructions` text,
	`videoUrl` varchar(500),
	`isCompleted` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workoutSessions_id` PRIMARY KEY(`id`)
);
