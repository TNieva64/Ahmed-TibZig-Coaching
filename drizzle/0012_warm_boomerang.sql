CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`template_id` int,
	`template_name` text NOT NULL,
	`recipient_email` text NOT NULL,
	`subject` text NOT NULL,
	`status` text NOT NULL,
	`sent_at` timestamp,
	`failed_reason` text,
	`opened_at` timestamp,
	`clicked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`html_body` text NOT NULL,
	`text_body` text,
	`category` text NOT NULL,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_unsubscribes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email` text NOT NULL,
	`category` text NOT NULL,
	`unsubscribed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_unsubscribes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `email_logs` ADD CONSTRAINT `email_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_logs` ADD CONSTRAINT `email_logs_template_id_email_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_unsubscribes` ADD CONSTRAINT `email_unsubscribes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;