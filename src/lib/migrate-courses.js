import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { MOCK_COURSES } from './mock-data';

export async function migrateCourses() {
    try {
        for (const course of MOCK_COURSES) {
            const courseRef = doc(db, 'courses', course.id);
            await setDoc(courseRef, {
                ...course,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`Migrated course: ${course.name}`);
        }
        console.log('All courses migrated successfully!');
        return { success: true, count: MOCK_COURSES.length };
    } catch (error) {
        console.error('Error migrating courses:', error);
        return { success: false, error: error.message };
    }
}
