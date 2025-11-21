export const MOCK_COURSES = [
    {
        id: 'c1',
        name: 'Club de Campo Villa de Madrid (Negro)',
        holes: 18,
        par: 71,
        tees: [
            { name: 'Blancas', slope: 135, rating: 73.2 },
            { name: 'Amarillas', slope: 132, rating: 71.5 },
            { name: 'Azules', slope: 128, rating: 73.8 }, // Damas Pro
            { name: 'Rojas', slope: 125, rating: 71.0 }   // Damas
        ],
        data: [
            { number: 1, par: 4, handicap: 5, distance: 380 },
            { number: 2, par: 3, handicap: 17, distance: 150 },
            { number: 3, par: 4, handicap: 1, distance: 410 },
            { number: 4, par: 5, handicap: 9, distance: 490 },
            { number: 5, par: 4, handicap: 13, distance: 360 },
            { number: 6, par: 3, handicap: 15, distance: 160 },
            { number: 7, par: 5, handicap: 3, distance: 510 },
            { number: 8, par: 4, handicap: 11, distance: 390 },
            { number: 9, par: 4, handicap: 7, distance: 400 },
            { number: 10, par: 4, handicap: 6, distance: 385 },
            { number: 11, par: 3, handicap: 18, distance: 145 },
            { number: 12, par: 5, handicap: 2, distance: 520 },
            { number: 13, par: 4, handicap: 10, distance: 370 },
            { number: 14, par: 4, handicap: 14, distance: 350 },
            { number: 15, par: 3, handicap: 16, distance: 170 },
            { number: 16, par: 4, handicap: 8, distance: 395 },
            { number: 17, par: 5, handicap: 4, distance: 500 },
            { number: 18, par: 4, handicap: 12, distance: 365 },
        ]
    },
    {
        id: 'c2',
        name: 'Real Club de Golf El Prat (Rosa)',
        holes: 18,
        par: 72,
        tees: [
            { name: 'Blancas', slope: 138, rating: 74.1 },
            { name: 'Amarillas', slope: 134, rating: 72.3 },
            { name: 'Rojas', slope: 126, rating: 71.5 }
        ],
        data: Array.from({ length: 18 }, (_, i) => ({
            number: i + 1,
            par: [3, 5, 4, 4].at(i % 4) || 4,
            handicap: i + 1,
            distance: 300 + (i * 10)
        }))
    }
];
