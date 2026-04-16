const mongoose = require('mongoose');

// Define Simple Batch Schema just for this script
const BatchSchema = new mongoose.Schema({
    batch_name: String,
    batch_type: String,
    start_time: String,
    end_time: String,
    course_id: mongoose.Schema.Types.ObjectId,
    instructor_id: mongoose.Schema.Types.ObjectId,
    max_students: Number,
    is_active: Boolean,
    status: String,
    batch_category: String
}, { collection: 'batches' });

const Batch = mongoose.model('BatchMigrate', BatchSchema);

async function run() {
    try {
        await mongoose.connect('mongodb+srv://Aotms:Aotms@aotms.pskqemf.mongodb.net/lms?retryWrites=true&w=majority'); 
        console.log('Connected to DB');

        const allBatches = await Batch.find({ batch_type: 'all' });
        console.log(`Found ${allBatches.length} batches of type "all"`);

        for (const b of allBatches) {
            console.log(`Splitting batch: ${b.batch_name} (${b._id})`);

            const slots = [
                { type: 'morning', start: '07:00', end: '09:00', label: 'Morning' },
                { type: 'afternoon', start: '13:00', end: '15:00', label: 'Afternoon' },
                { type: 'evening', start: '18:00', end: '20:00', label: 'Evening' }
            ];

            // Update existing record to 'morning'
            b.batch_type = slots[0].type;
            b.batch_name = `${b.batch_name} (Morning)`;
            b.start_time = slots[0].start;
            b.end_time = slots[0].end;
            b.batch_category = 'remove';
            await b.save();
            console.log('  -> Updated original record to Morning');

            // Create Afternoon and Evening
            await Batch.create({
                batch_name: b.batch_name.replace('(Morning)', '(Afternoon)'),
                batch_type: slots[1].type,
                start_time: slots[1].start,
                end_time: slots[1].end,
                course_id: b.course_id,
                instructor_id: b.instructor_id,
                max_students: b.max_students,
                is_active: b.is_active,
                status: b.status,
                batch_category: 'remove'
            });
            console.log('  -> Created Afternoon batch');

            await Batch.create({
                batch_name: b.batch_name.replace('(Morning)', '(Evening)'),
                batch_type: slots[2].type,
                start_time: slots[2].start,
                end_time: slots[2].end,
                course_id: b.course_id,
                instructor_id: b.instructor_id,
                max_students: b.max_students,
                is_active: b.is_active,
                status: b.status,
                batch_category: 'remove'
            });
            console.log('  -> Created Evening batch');
        }

        console.log('Migration finished successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
