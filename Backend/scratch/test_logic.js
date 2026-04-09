const mongoose = require('mongoose');
const { QuestionBank, StudentExamAccess, Exam, ExamResult } = require('../models/Exam');
const { Enrollment } = require('../models/Course');
const { User } = require('../models/User');
require('dotenv').config();

async function testLogic() {
    await mongoose.connect('mongodb+srv://Aotms:Aotms@aotms.pskqemf.mongodb.net/lms?retryWrites=true&w=majority');
    const studentId = '69bc3fee4ad1dcfab384f509';

    try {
        console.log('Testing accessible-exams logic...');
        
        const explicitAccess = await StudentExamAccess.find({ student_id: studentId })
            .populate('exam_id')
            .populate('mock_paper_id')
            .lean();
        console.log('Explicit Access count:', explicitAccess.length);

        // Simulate logic
        const explicitQBTopics = explicitAccess
            .filter(a => a.access_type === 'question_bank' && a.question_bank_topic)
            .map(a => a.question_bank_topic);
        console.log('Explicit QB Topics:', explicitQBTopics);

        const qbs = await QuestionBank.find({
            $or: [
                { topic: { $in: explicitQBTopics }, approval_status: 'approved' }
            ]
        }).lean();
        console.log('Found QBs:', qbs.length);

        if (qbs.length > 0) {
            console.log('First QB topic:', qbs[0].topic);
        }

        const topicMap = new Map();
        qbs.forEach(qb => {
            if (!topicMap.has(qb.topic)) {
                topicMap.set(qb.topic, {
                    id: `qb_${qb.topic}`,
                    mock_paper_id: `qb_${qb.topic}`,
                    mock_papers: { title: qb.topic, question_count: 0 }
                });
            }
            topicMap.get(qb.topic).mock_papers.question_count++;
        });

        console.log('Result topics:', Array.from(topicMap.keys()));

    } catch (err) {
        console.error('Logic failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testLogic();
