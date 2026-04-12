const mongoose = require('mongoose');
require('dotenv').config();

// Define models locally for the script to avoid complex imports
const CouponSchema = new mongoose.Schema({
    code: String,
    user_id: mongoose.Schema.Types.ObjectId,
    is_used: Boolean
});
const Coupon = mongoose.model('Coupon', CouponSchema);

const EnrollmentSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    course_id: mongoose.Schema.Types.ObjectId,
    applied_coupon: String,
    final_price: Number,
    enrolled_at: Date
});
const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

const CouponRedemptionSchema = new mongoose.Schema({
    coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    redeemed_at: Date,
    discounted_price: Number
});
const CouponRedemption = mongoose.model('CouponRedemption', CouponRedemptionSchema);

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const enrollmentsWithCoupons = await Enrollment.find({ 
            applied_coupon: { $ne: null } 
        });

        console.log(`Found ${enrollmentsWithCoupons.length} enrollments with coupons.`);

        let createdCount = 0;
        for (const enrollment of enrollmentsWithCoupons) {
            // Find the coupon
            const coupon = await Coupon.findOne({ 
                code: enrollment.applied_coupon,
                user_id: enrollment.user_id
            });

            if (coupon) {
                // Check if already logged
                const exists = await CouponRedemption.findOne({
                    coupon_id: coupon._id,
                    user_id: enrollment.user_id,
                    course_id: enrollment.course_id
                });

                if (!exists) {
                    await CouponRedemption.create({
                        coupon_id: coupon._id,
                        user_id: enrollment.user_id,
                        course_id: enrollment.course_id,
                        discounted_price: enrollment.final_price,
                        redeemed_at: enrollment.enrolled_at || new Date()
                    });
                    createdCount++;
                }
            }
        }

        console.log(`Migration complete. Created ${createdCount} redemption records.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
