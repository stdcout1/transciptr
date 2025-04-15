export function parseTranscript(text) {
    // Remove extra spaces in the text
    text = text.replace(/\s+/g, " ").trim();

    console.log(text);

    function parseTranscript(text) {
        const result = {
            issued_to: "",
            student_info: {},
            transcript: []
        };

        // Extract "Issued To"
        const issuedToMatch = text.match(/Issued To:\s*(.+?)\s+Name:/);
        if (issuedToMatch) {
            result.issued_to = issuedToMatch[1].trim();
        }

        // Extract student info
        const studentInfoMatch = text.match(
            /Name:\s*Student ID No:\s*OEN:\s*Birth Day:\s*Print Date:\s*([\w\s]+?)\s+(\d+)\s*(?:([\d\w]*)\s+)?(\d+\s+\w+)\s+(\d+\s+\w+\s+\d+)/
        );
        if (studentInfoMatch) {
            result.student_info = {
                name: studentInfoMatch[1].trim(),
                student_id: studentInfoMatch[2].trim(),
                oen: studentInfoMatch[3] ? studentInfoMatch[3].trim() : null,
                birth_date: studentInfoMatch[4].trim(),
                print_date: studentInfoMatch[5].trim()
            };
        }

        // Split transcript into terms
        const terms = text.split(/---\s*(\d{4} (Fall|Winter))\s*---/);
        for (let i = 1; i < terms.length; i += 3) {
            const termYear = terms[i].trim();
            const termDetails = terms[i + 2].trim();

            const programMatch = termDetails.match(/Program:\s*(.+?) Plan:/);
            const planMatch = termDetails.match(/Plan:\s*(.+?) Course/);

            const termData = {
                term: termYear,
                program: programMatch ? programMatch[1].trim() : null,
                plan: planMatch ? planMatch[1].trim() : null,
                courses: [],
                totals: {}
            };

            // Extract courses
            const courseMatches = [...termDetails.matchAll(/([A-Z]+[A-Z0-9]+\s\d+[A-Z0-9]+)\s+(.+?)\s+(\d+\.\d+\/\d+\.\d+)\s+([A-Z+]+|COM)/g)];
            for (const course of courseMatches) {
                const [_, courseCode, title, units, grade] = course;
                termData.courses.push({
                    course_code: courseCode.trim(),
                    title: title.trim(),
                    units: units.trim(),
                    grade: grade.trim()
                });
            }

            // Extract term totals
            const totalsMatch = termDetails.match(
                /Term Totals\s+(\d+\.\d+\/\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)/
            );
            if (totalsMatch) {
                termData.totals = {
                    attm_earned_units: totalsMatch[1],
                    gpa_units: totalsMatch[2],
                    total_points: totalsMatch[3],
                    gpa: totalsMatch[4]
                };
            }

            result.transcript.push(termData);
        }

        return result;
    }

    const transcriptJson = parseTranscript(text);

    // Output the JSON
    return transcriptJson;

}
