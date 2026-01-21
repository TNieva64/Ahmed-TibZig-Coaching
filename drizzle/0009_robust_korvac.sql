CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrer_id` int NOT NULL,
	`referred_id` int,
	`referral_code` varchar(20) NOT NULL,
	`referred_email` varchar(255),
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`reward_type` varchar(50),
	`reward_value` int,
	`reward_granted` int NOT NULL DEFAULT 0,
	`click_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`rewarded_at` timestamp,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referral_code_unique` UNIQUE(`referral_code`)
);
--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_users_id_fk` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_id_users_id_fk` FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;