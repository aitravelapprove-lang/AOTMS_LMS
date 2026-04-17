const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Exam, QuestionBank, ExamResult } = require('../models/Exam');
const Course = mongoose.model('Course', new mongoose.Schema({}), 'courses'); // Minimal schema for linking

async function migrateData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // 1. Find all results that might need subjective grading
        const results = await ExamResult.find({ 
            $or: [
                { grading_status: { $ne: 'pending' } },
                { course_id: { $in: [null, undefined] } },
                { test_title: { $in: [null, undefined] } },
                { questions_snapshot: { $size: 0 } },
                { questions_snapshot: { $exists: false } }
            ]
        });
        
        console.log(`Checking ${results.length} results for subjective content...`);
        let updatedCount = 0;

        for (const result of results) {
            const answers = result.answers instanceof Map ? Object.fromEntries(result.answers) : result.answers;
            if (!answers) continue;
            
            const qIds = Object.keys(answers);
            if (qIds.length === 0) continue;

            const questions = await QuestionBank.find({ _id: { $in: qIds } }).lean();
            
            let hasSubjective = false;
            let resolvedCourseId = result.course_id;

            for (const q of questions) {
                if (['subjective', 'short_answer', 'long_answer', 'short', 'long', 'coding'].includes(q.type)) {
                    hasSubjective = true;
                }
                if (!resolvedCourseId && q.course_id) {
                    resolvedCourseId = q.course_id;
                }
            }

            // If we still don't have course_id, try to find it via Exam or MockPaper
            if (!resolvedCourseId) {
                if (result.exam_id) {
                    const exam = await Exam.findById(result.exam_id);
                    if (exam) resolvedCourseId = exam.course_id;
                }
            }

            let needsUpdate = false;

            // Capture test_title if null
            if (!result.test_title) {
                if (result.exam_id) {
                    const exam = await Exam.findById(result.exam_id);
                    if (exam) result.test_title = exam.title;
                } else if (result.mock_paper_id) {
                    const mock = await mongoose.model('MockPaper').findById(result.mock_paper_id);
                    if (mock) result.test_title = mock.title;
                }
                if (!result.test_title) result.test_title = "Exam Result";
                needsUpdate = true;
            }

            // Populate Questions Snapshot
            if (!result.questions_snapshot || result.questions_snapshot.length === 0) {
                result.questions_snapshot = questions.map(q => ({
                    question_id: q._id,
                    question_text: q.question_text,
                    type: q.type,
                    correct_answer: q.correct_answer || (q.options ? q.options.find(o => o.is_correct)?.text : ""),
                    marks: q.marks || 1,
                    student_answer: answers[q._id.toString()] || ""
                }));
                needsUpdate = true;
            }

            if (hasSubjective && result.grading_status !== 'graded' && result.grading_status !== 'reevaluation') {
                result.grading_status = 'pending';
                needsUpdate = true;
            }
            
            // Re-mark existing subjective results as pending if they were auto-graded incorrectly as 0
            if (hasSubjective && result.grading_status === 'graded') {
                 if (result.score === result.objective_score) {
                    result.grading_status = 'pending';
                    needsUpdate = true;
                 }
            }

            if (resolvedCourseId && String(result.course_id) !== String(resolvedCourseId)) {
                result.course_id = resolvedCourseId;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await result.save();
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} records.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateData();
