CREATE TABLE `ai_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`insight_type` enum('trend_analysis','prediction','alert','recommendation','milestone') NOT NULL,
	`category` enum('workout','nutrition','recovery','progress','health') NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`is_read` int NOT NULL DEFAULT 0,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`overall_score` int NOT NULL,
	`workout_score` int NOT NULL,
	`nutrition_score` int NOT NULL,
	`recovery_score` int NOT NULL,
	`consistency_score` int NOT NULL,
	`calculated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`goal_id` int,
	`predicted_date` timestamp NOT NULL,
	`confidence_level` int NOT NULL,
	`current_trend` varchar(50) NOT NULL,
	`weekly_change_rate` decimal(10,2),
	`recommended_actions` text,
	`calculated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_insights` ADD CONSTRAINT `ai_insights_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `health_scores` ADD CONSTRAINT `health_scores_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `progress_predictions` ADD CONSTRAINT `progress_predictions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `progress_predictions` ADD CONSTRAINT `progress_predictions_goal_id_progressGoals_id_fk` FOREIGN KEY (`goal_id`) REFERENCES `progressGoals`(`id`) ON DELETE cascade ON UPDATE no action;