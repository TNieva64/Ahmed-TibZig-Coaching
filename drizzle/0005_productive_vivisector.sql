CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`category` enum('workout','nutrition','streak','milestone','special') NOT NULL,
	`requirement` text,
	`points` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('cardio','strength','flexibility','hiit','endurance','recovery') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced','expert') NOT NULL,
	`videoUrl` varchar(500),
	`thumbnailUrl` varchar(500),
	`duration` int,
	`equipment` text,
	`muscleGroups` text,
	`instructions` text,
	`tips` text,
	`isAdaptedForDisability` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` varchar(500) NOT NULL,
	`thumbnailUrl` varchar(500),
	`exerciseType` varchar(100),
	`status` enum('pending','reviewed','archived') NOT NULL DEFAULT 'pending',
	`coachFeedback` text,
	`annotations` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `formVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userFavoriteExercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userFavoriteExercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userStreaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActivityDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userStreaks_id` PRIMARY KEY(`id`),
	CONSTRAINT `userStreaks_userId_unique` UNIQUE(`userId`)
);
