CREATE TABLE `video_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`coach_id` int NOT NULL,
	`video_url` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed') DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `video_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_annotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_analysis_id` int NOT NULL,
	`coach_id` int NOT NULL,
	`timestamp` int NOT NULL,
	`type` enum('arrow','circle','rectangle','text','line') NOT NULL,
	`data` json NOT NULL,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `video_annotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_markers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`video_analysis_id` int NOT NULL,
	`coach_id` int NOT NULL,
	`timestamp` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#FFD700',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `video_markers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `video_analyses` ADD CONSTRAINT `video_analyses_client_id_users_id_fk` FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_analyses` ADD CONSTRAINT `video_analyses_coach_id_users_id_fk` FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_annotations` ADD CONSTRAINT `video_annotations_video_analysis_id_video_analyses_id_fk` FOREIGN KEY (`video_analysis_id`) REFERENCES `video_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_annotations` ADD CONSTRAINT `video_annotations_coach_id_users_id_fk` FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_markers` ADD CONSTRAINT `video_markers_video_analysis_id_video_analyses_id_fk` FOREIGN KEY (`video_analysis_id`) REFERENCES `video_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_markers` ADD CONSTRAINT `video_markers_coach_id_users_id_fk` FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;