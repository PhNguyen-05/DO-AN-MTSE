const test = require('node:test');
const assert = require('node:assert/strict');
const { parseQuestionsFromText } = require('../src/services/questionImportService');

test('parses Part 6 inline-numbered text completion questions', () => {
  const text = `Questions 131-134 refer to the following email.
To: All Staff
From: Human Resources
Date: June 28, 2026
Subject: Annual Health Check-up
We are pleased to announce that this year's annual health check-up will be held next month. All employees are (131) ------- to participate. The check-up is completely free and will be conducted by a reputable hospital.
Please (132) ------- the attached form and return it to HR by July 5. You can choose your preferred date and time from the available slots.
We believe that taking care of your health is essential (133) ------- maintaining high productivity at work. If you have any questions, please feel free to contact Ms. Lan in HR.
Thank you for your attention.
(134)
Human Resources Department
Question 131
(A) requested
(B) required
(C) invited
(D) applied
Question 132
(A) complete
(B) to complete
(C) completing
(D) completed
Question 133
(A) to
(B) for
(C) with
(D) by
Question 134
(A) Best wishes
(B) Regards
(C) Sincerely
(D) Yours faithfully`;

  const questions = parseQuestionsFromText(text);

  assert.equal(questions.length, 4);
  assert.deepEqual(questions.map((question) => question.questionNumber), [131, 132, 133, 134]);
  assert.equal(questions[0].part, 6);
  assert.match(questions[0].readingPassage, /All employees/i);
  assert.equal(questions[0].answers.C, 'invited');
});

test('parses question headers written as 1. or Câu 1', () => {
  const text = `Part 5
1. Choose the best answer.
(A) one
(B) two
(C) three
(D) four
Câu 2
(A) five
(B) six
(C) seven
(D) eight`;

  const questions = parseQuestionsFromText(text);

  assert.equal(questions.length, 2);
  assert.deepEqual(questions.map((question) => question.questionNumber), [1, 2]);
  assert.equal(questions[0].part, 5);
  assert.equal(questions[0].answers.A, 'one');
  assert.equal(questions[1].answers.A, 'five');
});
