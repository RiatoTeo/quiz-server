SELECT count(*), fkQuiz from Questions where fkQuiz = 1;

SELECT * from Questions where fkQuiz = 1;


SELECT sum((answer = correct)) as numCorrect,
(SELECT count(*) from Questions where fkQuiz = 1) as totQuestions,
name as namePlayer
from Submission INNER JOIN Questions ON fkQuestion = Questions.id
where fkQuiz = 1
GROUP by namePlayer;
