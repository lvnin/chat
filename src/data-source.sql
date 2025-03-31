CREATE EVENT IF NOT EXISTS `chat_message_clean` ON SCHEDULE EVERY '1' DAY DISABLE DO
DELETE FROM `messages`
WHERE
    DATE(`created_at`) <= DATE(
        DATE_SUB(NOW(), INTERVAL 7 DAY)
    );