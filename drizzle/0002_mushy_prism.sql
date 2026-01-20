CREATE TABLE `progressGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientProgramId` int NOT NULL,
	`goalType` enum('weight','bodyFat','performance','custom') NOT NULL,
	`targetValue` decimal(10,2) NOT NULL,
	`unit` varchar(50),
	`startValue` decimal(10,2),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `progressGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progressMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientProgramId` int NOT NULL,
	`metricType` enum('weight','bodyFat','performance','energy','custom') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`unit` varchar(50),
	`notes` text,
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progressMetrics_id` PRIMARY KEY(`id`)
);
