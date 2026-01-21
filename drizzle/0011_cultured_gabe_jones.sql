CREATE TABLE `mealPlanRecipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mealPlanId` int NOT NULL,
	`recipeId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`servings` int NOT NULL DEFAULT 1,
	CONSTRAINT `mealPlanRecipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mealPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`goal` enum('weight_loss','muscle_gain','maintenance','endurance') NOT NULL,
	`targetCalories` int NOT NULL,
	`targetProtein` int NOT NULL,
	`targetCarbs` int NOT NULL,
	`targetFat` int NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mealPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(500),
	`category` enum('breakfast','lunch','dinner','snack','dessert') NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`prepTime` int NOT NULL,
	`cookTime` int NOT NULL,
	`servings` int NOT NULL DEFAULT 1,
	`calories` int NOT NULL,
	`protein` int NOT NULL,
	`carbs` int NOT NULL,
	`fat` int NOT NULL,
	`fiber` int,
	`isVegetarian` int NOT NULL DEFAULT 0,
	`isVegan` int NOT NULL DEFAULT 0,
	`isGlutenFree` int NOT NULL DEFAULT 0,
	`isDairyFree` int NOT NULL DEFAULT 0,
	`isKeto` int NOT NULL DEFAULT 0,
	`isLowCarb` int NOT NULL DEFAULT 0,
	`isHighProtein` int NOT NULL DEFAULT 0,
	`goal` enum('weight_loss','muscle_gain','maintenance','endurance') NOT NULL,
	`ingredients` text NOT NULL,
	`instructions` text NOT NULL,
	`tips` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userFavoriteRecipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipeId` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userFavoriteRecipes_id` PRIMARY KEY(`id`)
);
