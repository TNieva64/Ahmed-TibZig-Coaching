CREATE TABLE `exercise_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`is_public` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exercise_playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlist_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlist_id` int NOT NULL,
	`exercise_id` int NOT NULL,
	`order_index` int NOT NULL DEFAULT 0,
	`sets` int,
	`reps` int,
	`duration` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `playlist_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `exercise_playlists` ADD CONSTRAINT `exercise_playlists_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playlist_exercises` ADD CONSTRAINT `playlist_exercises_playlist_id_exercise_playlists_id_fk` FOREIGN KEY (`playlist_id`) REFERENCES `exercise_playlists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playlist_exercises` ADD CONSTRAINT `playlist_exercises_exercise_id_exercises_id_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE cascade ON UPDATE no action;