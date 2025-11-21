'use client';

import { MOCK_COURSES } from '@/lib/mock-data';

export default function CourseSelect({ onSelect }) {
    return (
        <div className="course-list">
            {MOCK_COURSES.map(course => (
                <button
                    key={course.id}
                    className="card course-item"
                    onClick={() => onSelect(course)}
                    style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                    <h3 className="text-xl">{course.name}</h3>
                    <p className="text-sm">
                        {course.holes} Hoyos • Par {course.par} • {course.teeBox}
                    </p>
                </button>
            ))}
        </div>
    );
}
