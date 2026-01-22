CREATE TABLE `macro_adjustment_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`current_weight` decimal(5,2),
	`current_calories` int,
	`current_protein` int,
	`current_carbs` int,
	`current_fat` int,
	`proposed_weight` decimal(5,2),
	`proposed_calories` int NOT NULL,
	`proposed_protein` int NOT NULL,
	`proposed_carbs` int NOT NULL,
	`proposed_fat` int NOT NULL,
	`reason` text NOT NULL,
	`weight_change` decimal(5,2),
	`weeks_elapsed` int,
	`status` enum('pending','approved','rejected','modified') NOT NULL DEFAULT 'pending',
	`coach_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`reviewed_at` timestamp,
	`reviewed_by` int,
	CONSTRAINT `macro_adjustment_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `macro_adjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`proposal_id` int,
	`previous_calories` int,
	`previous_protein` int,
	`previous_carbs` int,
	`previous_fat` int,
	`new_calories` int NOT NULL,
	`new_protein` int NOT NULL,
	`new_carbs` int NOT NULL,
	`new_fat` int NOT NULL,
	`reason` text NOT NULL,
	`coach_notes` text,
	`is_automatic` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`applied_at` timestamp,
	CONSTRAINT `macro_adjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `macro_adjustment_proposals` ADD CONSTRAINT `macro_adjustment_proposals_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `macro_adjustment_proposals` ADD CONSTRAINT `macro_adjustment_proposals_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `macro_adjustments` ADD CONSTRAINT `macro_adjustments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `macro_adjustments` ADD CONSTRAINT `macro_adjustments_proposal_id_macro_adjustment_proposals_id_fk` FOREIGN KEY (`proposal_id`) REFERENCES `macro_adjustment_proposals`(`id`) ON DELETE no action ON UPDATE no action;