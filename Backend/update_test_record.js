require('dotenv').config();
const mongoose = require('mongoose');
const { Enrollment } = require('./models/Course');
const db = require('./config/db');

async function updateSpecificEnrollment() {
    try {
        await db();
        const enrollmentId = "69e21944ab5aa195f3874947";
        
        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) {
            console.log("Enrollment not found");
            process.exit(0);
        }

        // Apply the new requirement: Term 2 is triggered, 
        // student is deactivated, pay is pending (balance > 0)
        enrollment.category = "approve";
        enrollment.payment_term = "term2";
        enrollment.status = "deactivate";
        enrollment.remaining_balance = 14000; // 40% of 35000
        
        await enrollment.save();
        console.log("Specific Enrollment updated successfully for testing new flow!");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

updateSpecificEnrollment();
