const mongoose = require('mongoose');

const mongoUri = "mongodb://nguyentran_db_user:O6PeK00zJ4VVMHag@ac-wsdt6c0-shard-00-00.acbjjhu.mongodb.net:27017,ac-wsdt6c0-shard-00-01.acbjjhu.mongodb.net:27017,ac-wsdt6c0-shard-00-02.acbjjhu.mongodb.net:27017/toeic_db?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const ExamSchema = new mongoose.Schema({
  name: String,
  audioUrls: [String],
  partAudioUrls: {
    part1: String,
    part2: String,
    part3: String,
    part4: String
  }
}, { collection: 'exams' });

const QuestionSchema = new mongoose.Schema({
  exam: mongoose.Schema.Types.ObjectId,
  part: Number,
  questionNumber: Number,
  imageUrl: String
}, { collection: 'questions' });

async function run() {
  await mongoose.connect(mongoUri);
  const Exam = mongoose.model('Exam', ExamSchema);
  const Question = mongoose.model('Question', QuestionSchema);

  // Get the latest exam modified
  const exams = await Exam.find().sort({ updatedAt: -1 }).limit(3);
  console.log('--- LATEST EXAMS ---');
  for (const e of exams) {
    console.log(`Exam: ${e.name} (${e._id})`);
    console.log(`  audioUrls:`, e.audioUrls);
    console.log(`  partAudioUrls:`, e.partAudioUrls);
    
    // Find questions with images for this exam
    const questions = await Question.find({ exam: e._id, imageUrl: { $ne: "" } });
    console.log(`  Questions with images (${questions.length}):`);
    for (const q of questions) {
      console.log(`    Q${q.questionNumber} (Part ${q.part}): ${q.imageUrl}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
