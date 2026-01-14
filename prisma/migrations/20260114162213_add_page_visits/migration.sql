-- CreateTable
CREATE TABLE `page_visits` (
    `id` VARCHAR(191) NOT NULL,
    `visitor_id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `page_path` VARCHAR(500) NOT NULL,
    `referrer` VARCHAR(500) NOT NULL,
    `user_agent` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `country` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `device_type` VARCHAR(50) NULL,
    `browser` VARCHAR(100) NULL,
    `os` VARCHAR(100) NULL,
    `screen_resolution` VARCHAR(50) NULL,
    `language` VARCHAR(10) NULL,
    `visited_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `page_visits_visited_at_idx`(`visited_at`),
    INDEX `page_visits_page_path_idx`(`page_path`),
    INDEX `page_visits_visitor_id_idx`(`visitor_id`),
    INDEX `page_visits_session_id_idx`(`session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
