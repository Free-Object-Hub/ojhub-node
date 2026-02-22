-- Adminer 5.2.1 MariaDB 10.3.39-MariaDB dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `actions`;
CREATE TABLE `actions` (
  `actionId` int(11) NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `gdps` tinyint(1) DEFAULT NULL,
  `user` tinyint(1) DEFAULT NULL,
  `author` int(11) NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  PRIMARY KEY (`actionId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


DROP TABLE IF EXISTS `alarms`;
CREATE TABLE `alarms` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) NOT NULL,
  `text` varchar(3000) NOT NULL,
  `userId` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `adminName` varchar(255) NOT NULL,
  `adminId` int(11) NOT NULL,
  `public` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(2000) NOT NULL,
  `whereIz` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  `date` int(11) NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `disls` int(11) NOT NULL DEFAULT 0,
  `channel` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


SET NAMES utf8mb4;

DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL DEFAULT 0,
  `userAgent` varchar(511) NOT NULL DEFAULT '',
  `ip` varchar(15) NOT NULL DEFAULT '',
  `country` varchar(127) NOT NULL DEFAULT '',
  `city` varchar(127) NOT NULL DEFAULT '',
  `platform` varchar(127) NOT NULL DEFAULT '',
  `browser` varchar(127) NOT NULL DEFAULT '',
  `staticFp` varchar(64) NOT NULL DEFAULT '',
  `dynamicFp` varchar(4096) NOT NULL,
  `addDate` int(11) NOT NULL DEFAULT 0,
  `lastJoin` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `droppass`;
CREATE TABLE `droppass` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `date` int(11) NOT NULL,
  `email` varchar(256) NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `isUsed` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `forumPosts`;
CREATE TABLE `forumPosts` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `forumId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '???',
  `userId` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `text` varchar(3000) NOT NULL,
  `date` int(11) NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `disls` int(11) NOT NULL DEFAULT 0,
  `commsCount` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `forums`;
CREATE TABLE `forums` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `wikiId` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `checked` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `gdpses`;
CREATE TABLE `gdpses` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `channel` int(11) NOT NULL,
  `description` varchar(4096) NOT NULL,
  `short` varchar(255) NOT NULL DEFAULT '',
  `link` varchar(255) NOT NULL,
  `database` varchar(255) NOT NULL DEFAULT '',
  `img` varchar(255) NOT NULL,
  `ban` varchar(255) NOT NULL,
  `author` int(11) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `tags` varchar(512) NOT NULL,
  `os` varchar(512) NOT NULL,
  `mask` int(11) NOT NULL DEFAULT 0,
  `checked` tinyint(1) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL DEFAULT 0,
  `disls` int(11) NOT NULL DEFAULT 0,
  `commsCount` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 0,
  `hasLgbt` tinyint(4) NOT NULL DEFAULT 0,
  `freejoin` int(11) NOT NULL DEFAULT 0,
  `points` int(11) NOT NULL DEFAULT 0,
  `language` varchar(31) NOT NULL DEFAULT 'RU',
  `connectedWiki` int(11) NOT NULL DEFAULT 0,
  `editCount` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


DROP TABLE IF EXISTS `guides`;
CREATE TABLE `guides` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `wikiTag` varchar(255) NOT NULL DEFAULT '',
  `title` varchar(255) NOT NULL,
  `aftertext` varchar(255) NOT NULL,
  `img` varchar(255) NOT NULL,
  `guidetext` mediumtext NOT NULL,
  `language` varchar(16) NOT NULL DEFAULT 'RU',
  `templates` varchar(2048) NOT NULL,
  `checked` tinyint(4) NOT NULL DEFAULT 0,
  `date` int(11) NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `disls` int(11) NOT NULL DEFAULT 0,
  `commsCount` int(11) NOT NULL DEFAULT 0,
  `wikiChannel` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `joinlog`;
CREATE TABLE `joinlog` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `gdpsId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  `joinDate` int(11) NOT NULL,
  `joinData` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `whereIz` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `channel` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS `logger`;
CREATE TABLE `logger` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `time` int(11) NOT NULL,
  `ip` varchar(64) NOT NULL,
  `ua` varchar(512) NOT NULL,
  `build` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(8000) NOT NULL,
  `title` varchar(300) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  `gdpsId` int(11) NOT NULL,
  `date` int(11) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL DEFAULT 0,
  `disls` int(11) NOT NULL DEFAULT 0,
  `checked` tinyint(4) NOT NULL DEFAULT 0,
  `commsCount` int(11) NOT NULL DEFAULT 0,
  `hasFile` varchar(16) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS `points`;
CREATE TABLE `points` (
  `pointId` int(11) NOT NULL AUTO_INCREMENT,
  `gdpsId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  PRIMARY KEY (`pointId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS `soowners`;
CREATE TABLE `soowners` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `gdpsId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  `channel` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  `commTime` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mail` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `activated` int(11) NOT NULL DEFAULT 0,
  `code` varchar(6) NOT NULL DEFAULT '000000',
  `priority` tinyint(4) NOT NULL,
  `token` varchar(128) NOT NULL,
  `resume` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `socials` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


DROP TABLE IF EXISTS `vacans`;
CREATE TABLE `vacans` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `tags` varchar(255) NOT NULL,
  `mask` int(11) NOT NULL DEFAULT 0,
  `text` varchar(3000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `gdpsId` int(11) NOT NULL,
  `checked` tinyint(4) NOT NULL,
  `hasLgbt` tinyint(4) NOT NULL,
  `date` int(11) NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `disls` int(11) NOT NULL DEFAULT 0,
  `commsCount` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `vacsApplies`;
CREATE TABLE `vacsApplies` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `vacId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `wikis`;
CREATE TABLE `wikis` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `checked` int(11) NOT NULL DEFAULT 0,
  `userId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `text` varchar(1000) NOT NULL,
  `img` varchar(512) NOT NULL,
  `language` varchar(16) NOT NULL,
  `date` int(11) NOT NULL,
  `likes` int(11) DEFAULT 0,
  `disls` int(11) NOT NULL DEFAULT 0,
  `hasLgbt` tinyint(4) NOT NULL DEFAULT 0,
  `connectedGdps` int(11) NOT NULL DEFAULT 0,
  `forumId` int(11) NOT NULL DEFAULT 0,
  `mainWiki` int(11) NOT NULL DEFAULT 0,
  `files` varchar(8000) NOT NULL,
  `filesSize` int(11) NOT NULL DEFAULT 0,
  `colors` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `wikisoowners`;
CREATE TABLE `wikisoowners` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `wikiId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `permLevel` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS `wikiTemplates`;
CREATE TABLE `wikiTemplates` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `wikiId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `args` varchar(255) NOT NULL,
  `method` varchar(255) NOT NULL,
  `content` varchar(8192) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2026-02-22 07:38:51 UTC
