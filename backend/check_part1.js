const mongoose = require('mongoose');

const mongoUri = "mongodb://nguyentran_db_user:O6PeK00zJ4VVMHag@ac-wsdt6c0-shard-00-00.acbjjhu.mongodb.net:27017,ac-wsdt6c0-shard-00-01.acbjjhu.mongodb.net:27017,ac-wsdt6c0-shard-00-02.acbjjhu.mongodb.net:27017/toeic_db?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const QuestionSchema = new mongoose.Schema({
  exam: mongoose.Schema.Types.ObjectId,
  part: Number,
  questionNumber: Number,
  imageUrl: String,
  answers: mongoose.Schema.Types.Mixed,
  correctAnswer: String,
  explanation: String,
  readingPassage: String
}, { collection: 'questions' });

async function run() {
  await mongoose.connect(mongoUri);
  const Question = mongoose.model('Question', QuestionSchema);

  const questions = await Question.find({
    exam: new mongoose.Types.ObjectId('6a3f63ae2b8d8717c9857974'),
    part: 1
  }).sort({ questionNumber: 1 });

  console.log('Part 1 questions count:', questions.length);
  for (const q of questions) {
    console.log(`Question ${q.questionNumber}:`);
    console.log(`  imageUrl: ${q.imageUrl}`);
    console.log(`  answers:`, q.answers);
    console.log(`  correctAnswer: ${q.correctAnswer}`);
    console.log(`  explanation: ${q.explanation}`);
    console.log(`  readingPassage: ${q.readingPassage}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
