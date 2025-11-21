'use client';

export default function HoleInput({ label, value, onChange, min = 1 }) {
    return (
        <div className="hole-input mb-4">
            <label className="text-sm block mb-2">{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    className="btn btn-secondary"
                    style={{ width: '60px', height: '60px', padding: 0, fontSize: '1.5rem' }}
                    onClick={() => onChange(Math.max(min, value - 1))}
                >
                    -
                </button>
                <div className="text-xl" style={{ flex: 1, textAlign: 'center', fontSize: '2.5rem' }}>
                    {value}
                </div>
                <button
                    className="btn btn-secondary"
                    style={{ width: '60px', height: '60px', padding: 0, fontSize: '1.5rem' }}
                    onClick={() => onChange(value + 1)}
                >
                    +
                </button>
            </div>
        </div>
    );
}
