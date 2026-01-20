CREATE TABLE `clientPrograms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientPrograms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `programResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`type` enum('pdf','video') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programResources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('transformation','performance','inclusive') NOT NULL,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programs_id` PRIMARY KEY(`id`)
);
