CREATE TABLE IF NOT EXISTS `nttuyen_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `password2` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `email2` varchar(45) DEFAULT NULL,
  `address` varchar(250) DEFAULT NULL,
  `birthday` bigint(20) DEFAULT NULL,
  `mobile` char(11) DEFAULT NULL,
  `favorite` varchar(250) DEFAULT NULL,
  `register_time` bigint(20) DEFAULT NULL,
  `last_access` bigint(20) DEFAULT NULL,
  `role` bigint(20) DEFAULT NULL,
  `meta` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `nttuyen_role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `permission` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `nttuyen_user_role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user` bigint(20) DEFAULT NULL,
  `role` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `nttuyen_music` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) DEFAULT NULL,
  `type` varchar(250) DEFAULT NULL,
  `author` varchar(50) DEFAULT NULL,
  `singer` varchar(45) DEFAULT NULL,
  `album` varchar(45) DEFAULT NULL,
  `media` varchar(250) DEFAULT NULL,
  `lyric` varchar(500) DEFAULT NULL,
  `downloaded` int(11) DEFAULT NULL,
  `modified` bigint(20) DEFAULT NULL,
  `meta` varchar(500) DEFAULT NULL,
  `rate` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `nttuyen_rating` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `music_id` bigint(20) DEFAULT NULL,
  `rate` int(11) DEFAULT NULL,
  `time` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `nttuyen_rating_predict` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `music_id` bigint(20) DEFAULT NULL,
  `rate` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `nttuyen_user`(`id`,`username`,`password`,`password2`,`name`,`email`,`email2`,`address`,`birthday`,`mobile`,`favorite`,`register_time`,`last_access`,`role`,`meta`)
        VALUES(1,'nttuyen','123456','123456','nttuyen','nttuyen_it@yahoo.com','nttuyen_it@yahoo.com','Ha Noi',UNIX_TIMESTAMP(),'0123456789','music',UNIX_TIMESTAMP(),UNIX_TIMESTAMP(),1,'');

