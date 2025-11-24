'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { migrateCourses } from '@/lib/migrate-courses';

export default function CoursesManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        holes: 18,
        par: 72,
        tees: [{ name: 'Amarillas', slope: 113, rating: 72.0 }],
        data: []
    });

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesData = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMigrate = async () => {
        if (!confirm('¿Migrar campos desde mock-data a Firestore? Esto sobrescribirá los campos existentes con los mismos IDs.')) {
            return;
        }

        setLoading(true);
        const result = await migrateCourses();
        if (result.success) {
            alert(`${result.count} campos migrados exitosamente`);
            loadCourses();
        } else {
            alert('Error al migrar campos: ' + result.error);
        }
        setLoading(false);
    };

    const generateHoleData = (holes, defaultPar) => {
        const data = [];
        for (let i = 1; i <= holes; i++) {
            data.push({
                number: i,
                par: defaultPar || (i % 3 === 0 ? 3 : i % 5 === 0 ? 5 : 4),
                handicap: i,
                distance: 350
            });
        }
        return data;
    };

    const handleNewCourse = () => {
        setEditingCourse(null);
        setFormData({
            name: '',
            holes: 18,
            par: 72,
            tees: [{ name: 'Amarillas', slope: 113, rating: 72.0 }],
            data: generateHoleData(18)
        });
        setShowForm(true);
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            holes: course.holes,
            par: course.par,
            tees: course.tees || [{ name: 'Amarillas', slope: 113, rating: 72.0 }],
            data: course.data || generateHoleData(course.holes)
        });
        setShowForm(true);
    };

    const handleSaveCourse = async () => {
        if (!formData.name.trim()) {
            alert('El nombre del campo es obligatorio');
            return;
        }

        if (formData.tees.length === 0) {
            alert('Debe haber al menos un tee');
            return;
        }

        try {
            const courseData = {
                ...formData,
                updatedAt: new Date().toISOString()
            };

            if (editingCourse) {
                // Update existing
                await setDoc(doc(db, 'courses', editingCourse.id), courseData);
                alert('Campo actualizado correctamente');
            } else {
                // Create new
                courseData.createdAt = new Date().toISOString();
                await addDoc(collection(db, 'courses'), courseData);
                alert('Campo creado correctamente');
            }

            setShowForm(false);
            loadCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Error al guardar el campo: ' + error.message);
        }
    };

    const handleDeleteCourse = async (courseId, courseName) => {
        if (!confirm(`¿Eliminar el campo "${courseName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'courses', courseId));
            alert('Campo eliminado correctamente');
            loadCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error al eliminar el campo: ' + error.message);
        }
    };

    const updateFormField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // If holes changed, regenerate hole data
        if (field === 'holes') {
            setFormData(prev => ({
                ...prev,
                data: generateHoleData(value, prev.par / value)
            }));
        }
    };

    const addTee = () => {
        setFormData(prev => ({
            ...prev,
            tees: [...prev.tees, { name: '', slope: 113, rating: 72.0 }]
        }));
    };

    const updateTee = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            tees: prev.tees.map((tee, i) => i === index ? { ...tee, [field]: value } : tee)
        }));
    };

    const removeTee = (index) => {
        setFormData(prev => ({
            ...prev,
            tees: prev.tees.filter((_, i) => i !== index)
        }));
    };

    const updateHole = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            data: prev.data.map((hole, i) => i === index ? { ...hole, [field]: parseInt(value) || 0 } : hole)
        }));
    };

    if (loading) {
        return <div>Cargando campos...</div>;
    }

    return (
        <div>
            <style jsx>{`
                .header-section {
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .header-buttons {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .header-section {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .header-buttons {
                        width: 100%;
                    }

                    .header-buttons button {
                        flex: 1;
                        min-width: 140px;
                    }
                }

                .course-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    padding: 24px;
                    margin-bottom: 16px;
                }

                .course-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .course-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .course-actions button {
                        flex: 1;
                        min-width: 120px;
                    }
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justif-content: center;
                    z-index: 1000;
                    padding: 20px;
                    overflow-y: auto;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    padding: 32px;
                    max-width: 900px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    margin: auto;
                }

                @media (max-width: 768px) {
                    .modal-content {
                        padding: 20px;
                        max-height: 95vh;
                    }
                }

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                @media (max-width: 768px) {
                    .form-grid-2 {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="header-section">
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#333' }}>
                        Gestión de Campos
                    </h1>
                    <p style={{ color: '#666' }}>Total de campos: {courses.length}</p>
                </div>
                <div className="header-buttons">
                    {courses.length === 0 && (
                        <button onClick={handleMigrate} className="btn btn-secondary">
                            📥 Migrar desde Mock Data
                        </button>
                    )}
                    <button onClick={handleNewCourse} className="btn btn-primary">
                        + Nuevo Campo
                    </button>
                </div>
            </div>

            {/* Course Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>
                            {editingCourse ? 'Editar Campo' : 'Nuevo Campo'}
                        </h2>

                        {/* Basic Info */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Nombre del Campo *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateFormField('name', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px'
                                }}
                                placeholder="Ej: Club de Campo Villa de Madrid"
                            />
                        </div>

                        <div className="form-grid-2">
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Número de Hoyos *
                                </label>
                                <input
                                    type="number"
                                    value={formData.holes}
                                    onChange={(e) => updateFormField('holes', parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px'
                                    }}
                                    min="9"
                                    max="18"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Par del Campo *
                                </label>
                                <input
                                    type="number"
                                    value={formData.par}
                                    onChange={(e) => updateFormField('par', parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px'
                                    }}
                                    min="27"
                                    max="90"
                                />
                            </div>
                        </div>

                        {/* Tees Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                    Tees/Salidas
                                </label>
                                <button
                                    onClick={addTee}
                                    style={{
                                        padding: '6px 12px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    + Añadir Tee
                                </button>
                            </div>

                            {formData.tees.map((tee, index) => (
                                <div key={index} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr auto',
                                    gap: '12px',
                                    marginBottom: '12px',
                                    padding: '12px',
                                    background: '#f9f9f9',
                                    borderRadius: '8px'
                                }}>
                                    <input
                                        type="text"
                                        value={tee.name}
                                        onChange={(e) => updateTee(index, 'name', e.target.value)}
                                        placeholder="Nombre (ej: Amarillas)"
                                        style={{
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <input
                                        type="number"
                                        value={tee.slope}
                                        onChange={(e) => updateTee(index, 'slope', parseFloat(e.target.value))}
                                        placeholder="Slope"
                                        style={{
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={tee.rating}
                                        onChange={(e) => updateTee(index, 'rating', parseFloat(e.target.value))}
                                        placeholder="Rating"
                                        style={{
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <button
                                        onClick={() => removeTee(index)}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Holes Data - Simplified View */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontWeight: '600', fontSize: '1.1rem', display: 'block', marginBottom: '12px' }}>
                                Configuración de Hoyos
                            </label>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5' }}>
                                        <tr>
                                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Hoyo</th>
                                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Par</th>
                                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>HCP</th>
                                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Distancia (m)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.data.map((hole, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{hole.number}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <input
                                                        type="number"
                                                        value={hole.par}
                                                        onChange={(e) => updateHole(index, 'par', e.target.value)}
                                                        style={{
                                                            width: '60px',
                                                            padding: '4px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}
                                                        min="3"
                                                        max="5"
                                                    />
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    <input
                                                        type="number"
                                                        value={hole.handicap}
                                                        onChange={(e) => updateHole(index, 'handicap', e.target.value)}
                                                        style={{
                                                            width: '60px',
                                                            padding: '4px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}
                                                        min="1"
                                                        max="18"
                                                    />
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    <input
                                                        type="number"
                                                        value={hole.distance}
                                                        onChange={(e) => updateHole(index, 'distance', e.target.value)}
                                                        style={{
                                                            width: '80px',
                                                            padding: '4px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }}
                                                        min="50"
                                                        max="600"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    padding: '10px 20px',
                                    background: '#e0e0e0',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveCourse}
                                className="btn"
                            >
                                {editingCourse ? 'Actualizar Campo' : 'Crear Campo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Courses List */}
            <div style={{
                display: 'grid',
                gap: '20px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}>
                {courses.map((course) => (
                    <div key={course.id} className="course-card">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#333' }}>
                            {course.name}
                        </h3>
                        <div className="course-info">
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                <div>🏌️ {course.holes} hoyos</div>
                            </div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                <div>📊 Par {course.par}</div>
                            </div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                <div>🎯 {course.tees?.length || 0} tees</div>
                            </div>
                        </div>
                        <div className="course-actions">
                            <button
                                onClick={() => handleEditCourse(course)}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    background: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                ✏️ Editar
                            </button>
                            <button
                                onClick={() => handleDeleteCourse(course.id, course.name)}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '60px',
                    textAlign: 'center',
                    color: '#999'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⛳</div>
                    <p style={{ fontSize: '1.2rem', marginBottom: '24px' }}>No hay campos de golf registrados</p>
                    <button onClick={handleMigrate} className="btn">
                        📥 Migrar Campos desde Mock Data
                    </button>
                </div>
            )}
        </div>
    );
}
