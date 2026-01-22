CREATE TABLE `onboarding_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`step` varchar(50) NOT NULL,
	`completed_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `onboarding_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `onboarding_progress` ADD CONSTRAINT `onboarding_progress_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;