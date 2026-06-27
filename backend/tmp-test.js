const { parseQuestionsFromText } = require('./src/services/questionImportService');
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
console.log(JSON.stringify(questions, null, 2));
