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
    },
    {
        id: 'c3',
        name: 'Las Lomas Bosque',
        holes: 18,
        par: 72,
        tees: [
            { name: 'Negras', slope: 135, rating: 73.2 },
            { name: 'Blancas', slope: 132, rating: 71.5 },
            { name: 'Amarillas', slope: 128, rating: 69.8 },
            { name: 'Azules', slope: 126, rating: 72.0 }, // Damas Pro
            { name: 'Rojas', slope: 123, rating: 69.5 }   // Damas
        ],
        data: [
            { number: 1, par: 5, handicap: 1, distance: 480 },
            { number: 2, par: 3, handicap: 18, distance: 82 },
            { number: 3, par: 4, handicap: 3, distance: 395 },
            { number: 4, par: 4, handicap: 6, distance: 370 },
            { number: 5, par: 3, handicap: 13, distance: 157 },
            { number: 6, par: 4, handicap: 9, distance: 345 },
            { number: 7, par: 5, handicap: 12, distance: 454 },
            { number: 8, par: 4, handicap: 14, distance: 286 },
            { number: 9, par: 4, handicap: 16, distance: 301 },
            { number: 10, par: 4, handicap: 2, distance: 386 },
            { number: 11, par: 4, handicap: 5, distance: 390 },
            { number: 12, par: 4, handicap: 7, distance: 395 },
            { number: 13, par: 4, handicap: 8, distance: 382 },
            { number: 14, par: 3, handicap: 17, distance: 165 },
            { number: 15, par: 4, handicap: 4, distance: 401 },
            { number: 16, par: 5, handicap: 10, distance: 527 },
            { number: 17, par: 3, handicap: 15, distance: 169 },
            { number: 18, par: 5, handicap: 11, distance: 456 },
        ]
    },
    {
        id: 'c4',
        name: 'La Faisanera',
        holes: 18,
        par: 71,
        tees: [
            { name: 'Amarillas', slope: 125, rating: 69.7 }
        ],
        data: [
            { number: 1, par: 5, handicap: 8, distance: 492 },
            { number: 2, par: 3, handicap: 18, distance: 126 },
            { number: 3, par: 4, handicap: 4, distance: 363 },
            { number: 4, par: 3, handicap: 14, distance: 149 },
            { number: 5, par: 4, handicap: 2, distance: 388 },
            { number: 6, par: 5, handicap: 10, distance: 470 },
            { number: 7, par: 3, handicap: 12, distance: 179 },
            { number: 8, par: 4, handicap: 6, distance: 363 },
            { number: 9, par: 4, handicap: 16, distance: 268 },
            { number: 10, par: 3, handicap: 13, distance: 155 },
            { number: 11, par: 4, handicap: 1, distance: 407 },
            { number: 12, par: 3, handicap: 17, distance: 122 },
            { number: 13, par: 5, handicap: 7, distance: 486 },
            { number: 14, par: 4, handicap: 3, distance: 401 },
            { number: 15, par: 5, handicap: 15, distance: 494 },
            { number: 16, par: 4, handicap: 9, distance: 365 },
            { number: 17, par: 3, handicap: 11, distance: 144 },
            { number: 18, par: 5, handicap: 5, distance: 443 },
        ]
    }
];
