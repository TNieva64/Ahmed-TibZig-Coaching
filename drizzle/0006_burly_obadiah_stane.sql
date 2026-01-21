CREATE TABLE `meal_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`nutrition_plan_id` int,
	`date` timestamp NOT NULL,
	`meal_type` varchar(50) NOT NULL,
	`food_items` text NOT NULL,
	`calories` int NOT NULL,
	`protein_grams` int NOT NULL,
	`carbs_grams` int NOT NULL,
	`fat_grams` int NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meal_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`daily_calories` int NOT NULL,
	`protein_grams` int NOT NULL,
	`carbs_grams` int NOT NULL,
	`fat_grams` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutrition_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`primary_goal` varchar(100),
	`specific_goals` text,
	`target_weight` int,
	`target_date` timestamp,
	`current_activity_level` varchar(50),
	`sports_history` text,
	`previous_injuries` text,
	`health_conditions` text,
	`medications` text,
	`dietary_restrictions` text,
	`available_equipment` text,
	`weekly_availability` int,
	`preferred_workout_time` varchar(50),
	`motivation_level` int,
	`motivation_factors` text,
	`obstacles` text,
	`completed_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `meal_logs` ADD CONSTRAINT `meal_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_logs` ADD CONSTRAINT `meal_logs_nutrition_plan_id_nutrition_plans_id_fk` FOREIGN KEY (`nutrition_plan_id`) REFERENCES `nutrition_plans`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nutrition_plans` ADD CONSTRAINT `nutrition_plans_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD CONSTRAINT `onboarding_responses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;