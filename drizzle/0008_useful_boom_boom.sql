CREATE TABLE `monthly_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`total_workouts` int NOT NULL,
	`total_duration` int NOT NULL,
	`total_calories_burned` int NOT NULL,
	`average_rating` decimal(3,2),
	`current_streak` int NOT NULL,
	`weight_start` decimal(5,2),
	`weight_end` decimal(5,2),
	`weight_change` decimal(5,2),
	`nutrition_compliance` int,
	`average_calories` int,
	`overall_score` int,
	`coach_comment` text,
	`coach_recommendations` text,
	`pdf_url` varchar(500),
	`generated_at` timestamp NOT NULL DEFAULT (now()),
	`sent_at` timestamp,
	`is_read` int NOT NULL DEFAULT 0,
	CONSTRAINT `monthly_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `monthly_reports` ADD CONSTRAINT `monthly_reports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;