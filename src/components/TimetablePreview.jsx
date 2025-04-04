const TimetablePreview = ({ extractedTimetable }) => {
    if (!extractedTimetable) {
        return <p className="text-center text-gray-500">No timetable extracted yet.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="table w-full border">
                <thead>
                <tr>
                    <th>Day</th>
                    {extractedTimetable.subjects.map((subject, index) => (
                        <th key={index}>{subject.code}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {extractedTimetable.days.map((day, dayIndex) => (
                    <tr key={dayIndex}>
                        <td>{day}</td>
                        {extractedTimetable.subjects.map((subject, subIndex) => {
                            const timing = subject.timings.find((t) => t.day === day);
                            return (
                                <td key={subIndex}>
                                    {timing ? timing.start : "-"}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TimetablePreview;
