TO ADD:

CREATE TABLE tbl_submissions (
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
userId INT NOT NULL,
code LONGTEXT,
score INT NOT NULL,
submissionTime TEXT,
executionTime TEXT,
submissionCounter INT NOT NULL,
exercise_title VARCHAR(50) NOT NULL,
id_corso INT NOT NULL
) ENGINE=MyISAM;

ALTER TABLE tbl_tags ADD COLUMN idCorso INT;

ALTER TABLE tbl_submissions
ADD COLUMN IF NOT EXISTS titoloEsercizio VARCHAR(50),
ADD COLUMN IF NOT EXISTS id_corso INT;
ADD COLUMN IF NOT EXISTS executionTime TEXT;

TO UPDATE MODELS

npx typeorm-model-generator -d codingcontest2 -u username -x password -e mariadb -o .
