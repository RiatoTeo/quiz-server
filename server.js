// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
const { Sequelize, DataTypes } = require("sequelize");

// Option 2: Passing parameters separately (sqlite)
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

const Quiz = sequelize.define(
  "Quiz",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nameOwner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Quizes",
  }
);

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer4: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fkQuiz: {
      type: DataTypes.INTEGER,
      references: {
        // This is a reference to another model
        model: Quiz,

        // This is the column name of the referenced model
        key: "id",
      },
    },
  },
  {
    tableName: "Questions",
  }
);

const Submit = sequelize.define(
  "Submit",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fkQuestion: {
      type: DataTypes.INTEGER,
      references: {
        // This is a reference to another model
        model: Question,

        // This is the column name of the referenced model
        key: "id",
      },
    },
  },
  {
    tableName: "Submission",
  }
);

Quiz.hasMany(Question, { 
  foreignKey: 'fkQuiz'
});
Question.belongsTo(Quiz,{ 
  foreignKey: 'fkQuiz'
});

Question.hasMany(Submit, { 
  foreignKey: 'fkQuestion'
});
Submit.belongsTo(Question,{ 
  foreignKey: 'fkQuestion'
});

// Declare a route
fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.get("/quiz/:idQuiz", async (request, reply) => {
  const { idQuiz } = request.params;
  const quiz = await Quiz.findByPk(idQuiz,{ include: Question });
  // statistiche

  // prendi tutte le submissio e fai il conto delle risposte corrette in base al nome

  return quiz;
});

fastify.put("/quiz/:name", async (request, reply) => {
  const { name } = request.params;
  const quiz = await Quiz.create({ nameOwner: name });
  return quiz;
});

fastify.put("/submission/:idQuestion/:name/:answer", async (request, reply) => {
  const { idQuestion, name, answer} = request.params;
  const quiz = await Submit.create({ answer: answer, name:name, fkQuestion:idQuestion });
  Question.findByPk() === answer
  return {giusto o sbagliato, {risposta correta}};
});

fastify.post("/quiz/:idQuiz", async (request, reply) => {
  const { idQuiz } = request.params;
  const { questions } = request.body;

  for (const question of questions) {
    console.log(question);
    const newQuestion = await Question.create({ ...question, fkQuiz: idQuiz });
  }
  console.log(questions);

  return { status: "ok" };
});

fastify.get("/quizes", async (request, reply) => {
  return Quiz.findAll({ include: Question });
});
fastify.get("/questions", async (request, reply) => {
  return Question.findAll();
});

// Run the server!
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  await Quiz.sync({ force: true });
  await Question.sync({ force: true });
  await Submit.sync({ force: true });

  const quiz0 = await Quiz.create({ nameOwner: "Jane" });

  try {
    await fastify.listen({ port: 30000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

// new quiz    -> PUT ()  -> codice_univoco
// save quiz    -> POST/UPDATE (Nome,{struttura}, codice_univoco)
// get quiz -> GET () -> struttura, risultati
// answer quiz -> (codice_unicovo,codice_domanda,answer,nome) -> giusta o sbagliata e risposta corretta

/*
quiz
- id
- domande
      - risposte
      - una giusta
- nomeProprietario

quiz
 - id
 - nameOwner

questions
 - id 556
 - fkQuiz: 
 - description : chi è il mio milgiore amico
 - answer1 : MArgo
 - answer2 : angelo
 - answer3 : giulio
 - answer4 : pippo
 - correct: 2


submission
- id 987
- nome: Mattero
- fkQuestion: 556
- risposta: 3



{
  quiz: 333,
  domanda: 1,
  risposta: 3,
  nome: "MarcoC"
}

*/
