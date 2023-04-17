TO ADD:

CREATE TABLE `tbl_submissions` (
`userId` INT NOT NULL,
`exerciseId` INT NOT NULL,
`code` LONGTEXT NOT NULL,
`score` INT NOT NULL DEFAULT '0',
`submissionTime` TEXT NOT NULL,
`submissionCounter` INT NOT NULL DEFAULT '0'
) ENGINE=MyISAM;

ALTER TABLE tbl_tags ADD COLUMN idCorso INT;


TO UPDATE MODELS

npx typeorm-model-generator -d codingcontest2 -u username -x password -e mariadb -o .
