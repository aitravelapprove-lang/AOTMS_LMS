const fs = require('fs');
const files = [
    'src/hooks/useStudentData.ts',
    'src/hooks/useManagerData.ts',
    'src/hooks/useInstructorData.ts',
    'src/hooks/useCourseBuilder.ts',
    'src/hooks/useAdminData.ts'
];

for (const f of files) {
    let c = fs.readFileSync(f, 'utf8');
    if (!c.includes("import { fetchWithAuth } from '@/lib/api';")) {
        c = "import { fetchWithAuth } from '@/lib/api';\n" + c;
    }

    c = c.replace(/const API_URL = 'http:\/\/localhost:5000\/api';[\r\n]*/g, '');

    const pattern = /const fetchWithAuth = async[^{]+\{[\s\S]+?\n\};\r?\n?/g;
    c = c.replace(pattern, '');

    fs.writeFileSync(f, c);
    console.log('Fixed ' + f);
}
