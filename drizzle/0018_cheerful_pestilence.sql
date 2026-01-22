CREATE TABLE `user_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`cookies_analytics` int NOT NULL DEFAULT 0,
	`cookies_functional` int NOT NULL DEFAULT 1,
	`cookies_marketing` int NOT NULL DEFAULT 0,
	`email_marketing` int NOT NULL DEFAULT 0,
	`sms_marketing` int NOT NULL DEFAULT 0,
	`consent_date` timestamp NOT NULL DEFAULT (now()),
	`ip_address` varchar(45),
	`user_agent` text,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;