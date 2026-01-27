/**
 * Nepali Names Utility
 * Provides categorized names based on ethnic groups (Brahmin, Chhetri, Janajati)
 */

const CATEGORIES = {
    BRAHMIN: 'brahmin',
    CHHETRI: 'chhetri',
    JANAJATI: 'janajati'
};

const SURNAME_MAPPING = {
    // Brahmin Surnames
    'Adhikari': CATEGORIES.BRAHMIN, 'Acharya': CATEGORIES.BRAHMIN, 'Aryal': CATEGORIES.BRAHMIN,
    'Bastola': CATEGORIES.BRAHMIN, 'Banskota': CATEGORIES.BRAHMIN, 'Bhattarai': CATEGORIES.BRAHMIN,
    'Dahal': CATEGORIES.BRAHMIN, 'Devkota': CATEGORIES.BRAHMIN, 'Gautam': CATEGORIES.BRAHMIN,
    'Ghimire': CATEGORIES.BRAHMIN, 'Khatiwada': CATEGORIES.BRAHMIN, 'Koirala': CATEGORIES.BRAHMIN,
    'Lamsal': CATEGORIES.BRAHMIN, 'Mainali': CATEGORIES.BRAHMIN, 'Neupane': CATEGORIES.BRAHMIN,
    'Oli': CATEGORIES.BRAHMIN, 'Pant': CATEGORIES.BRAHMIN, 'Paudel': CATEGORIES.BRAHMIN,
    'Poudel': CATEGORIES.BRAHMIN, 'Pokharel': CATEGORIES.BRAHMIN, 'Prasad': CATEGORIES.BRAHMIN,
    'Regmi': CATEGORIES.BRAHMIN, 'Rijal': CATEGORIES.BRAHMIN, 'Sharma': CATEGORIES.BRAHMIN,
    'Subedi': CATEGORIES.BRAHMIN, 'Tiwari': CATEGORIES.BRAHMIN, 'Upadhyaya': CATEGORIES.BRAHMIN,
    'Wagle': CATEGORIES.BRAHMIN, 'Pandey': CATEGORIES.BRAHMIN, 'Puran': CATEGORIES.BRAHMIN,

    // Chhetri Surnames
    'Thapa': CATEGORIES.CHHETRI, 'Karki': CATEGORIES.CHHETRI, 'Basnet': CATEGORIES.CHHETRI,
    'Khadka': CATEGORIES.CHHETRI, 'KC': CATEGORIES.CHHETRI, 'Bhandari': CATEGORIES.CHHETRI,
    'Bisht': CATEGORIES.CHHETRI, 'Bohara': CATEGORIES.CHHETRI, 'Chauhan': CATEGORIES.CHHETRI,
    'Hamal': CATEGORIES.CHHETRI, 'Kunwar': CATEGORIES.CHHETRI, 'Mahat': CATEGORIES.CHHETRI,
    'Rana': CATEGORIES.CHHETRI, 'Rawat': CATEGORIES.CHHETRI, 'Rokaya': CATEGORIES.CHHETRI,
    'Shah': CATEGORIES.CHHETRI, 'Thakuri': CATEGORIES.CHHETRI, 'Budhathoki': CATEGORIES.CHHETRI,
    'Rawal': CATEGORIES.CHHETRI, 'Malla': CATEGORIES.CHHETRI, 'Singh': CATEGORIES.CHHETRI,

    // Janajati Surnames
    'Gurung': CATEGORIES.JANAJATI, 'Magar': CATEGORIES.JANAJATI, 'Rai': CATEGORIES.JANAJATI,
    'Limbu': CATEGORIES.JANAJATI, 'Tamang': CATEGORIES.JANAJATI, 'Sherpa': CATEGORIES.JANAJATI,
    'Lama': CATEGORIES.JANAJATI, 'Ghale': CATEGORIES.JANAJATI, 'Thakali': CATEGORIES.JANAJATI,
    'Newar': CATEGORIES.JANAJATI, 'Sunuwar': CATEGORIES.JANAJATI, 'Chaudhary': CATEGORIES.JANAJATI,
    'Shrestha': CATEGORIES.JANAJATI, 'Maharjan': CATEGORIES.JANAJATI, 'Bajracharya': CATEGORIES.JANAJATI,
    'Shakya': CATEGORIES.JANAJATI, 'Manandhar': CATEGORIES.JANAJATI, 'Tuladhar': CATEGORIES.JANAJATI,
    'Pradhan': CATEGORIES.JANAJATI, 'Hada': CATEGORIES.JANAJATI, 'Malla': CATEGORIES.JANAJATI,
    'Dhamala': CATEGORIES.CHHETRI, // Often categorized similarly in data context
    'Gautam': CATEGORIES.BRAHMIN,
    'Pun': CATEGORIES.JANAJATI,
    'Gharti': CATEGORIES.JANAJATI,
    'Kumari': CATEGORIES.CHHETRI,
};

const NAMES_BY_CATEGORY = {
    [CATEGORIES.BRAHMIN]: {
        first: [
            'Hari', 'Ram', 'Krishna', 'Shiva', 'Bishnu', 'Gopal', 'Madhav', 'Keshav', 'Narayan', 'Bharat',
            'Sita', 'Gita', 'Laxmi', 'Saraswati', 'Parvati', 'Radha', 'Rukmini', 'Anju', 'Bimala', 'Kalpana',
            'Dipendra', 'Suresh', 'Ramesh', 'Mahesh', 'Umesh', 'Dinesh', 'Ganesh', 'Pradeep', 'Sunil', 'Anil',
            'Sushila', 'Sarita', 'Kamala', 'Sabitra', 'Radhika', 'Indira', 'Pabitra', 'Shanti', 'Tara', 'Maya',
            'Suman', 'Suraj', 'Santosh', 'Sanjay', 'Sandip', 'Sabin', 'Sagar', 'Samir', 'Saroj', 'Sujan'
        ],
        last: [
            'Adhikari', 'Acharya', 'Aryal', 'Bhattarai', 'Dahal', 'Devkota', 'Gautam', 'Ghimire', 'Khatiwada',
            'Koirala', 'Lamsal', 'Neupane', 'Oli', 'Paudel', 'Poudel', 'Pokharel', 'Regmi', 'Rijal', 'Sharma',
            'Subedi', 'Tiwari', 'Upadhyaya', 'Wagle', 'Pandey', 'Poudyal', 'Simkhada', 'Kafle', 'Poudel', 'Dhakal'
        ]
    },
    [CATEGORIES.CHHETRI]: {
        first: [
            'Bimal', 'Kushal', 'Nabin', 'Ramesh', 'Suman', 'Bikash', 'Arjun', 'Biran', 'Dipak', 'Prakash',
            'Saraswati', 'Bandana', 'Bimala', 'Sunita', 'Anita', 'Binita', 'Januka', 'Renu', 'Sushma', 'Gita',
            'Manish', 'Nishan', 'Pujan', 'Rajesh', 'Sagar', 'Tanka', 'Umesh', 'Yubaraj', 'Kul', 'Tek',
            'Maya', 'Sita', 'Lila', 'Mina', 'Shanti', 'Tara', 'Khari', 'Durga', 'Sabita', 'Rita',
            'Bhuwan', 'Amrit', 'Kiran', 'Deepak', 'Sanjeev', 'Kamal', 'Prem', 'Hem', 'Sher', 'Junga'
        ],
        last: [
            'Thapa', 'Karki', 'Basnet', 'Khadka', 'KC', 'Bhandari', 'Bisht', 'Bohara', 'Chauhan', 'Hamal',
            'Kunwar', 'Mahat', 'Rana', 'Rawat', 'Rokaya', 'Shah', 'Thakuri', 'Budhathoki', 'Rawal', 'Khetri',
            'Singh', 'Pariyar', 'Damai', 'Kami', 'Sarki', 'Malla', 'K.C.', 'Thakulla', 'Bhandari', 'Bogati'
        ]
    },
    [CATEGORIES.JANAJATI]: {
        first: [
            'Pasang', 'Pemba', 'Lhakpa', 'Mingma', 'Tashi', 'Dawa', 'Ang', 'Phurba', 'Sonam', 'Nuru',
            'Dolma', 'Pema', 'Ngawang', 'Tseten', 'Karma', 'Lobsang', 'Rigzin', 'Tenzin', 'Chhiring', 'Sangay',
            'Lama', 'Tamang', 'Sherpa', 'Gurung', 'Magar', 'Rai', 'Limbu', 'Newar', 'Hyolmo', 'Ghale',
            'Subba', 'Malla', 'Shrestha', 'Maharjan', 'Bajracharya', 'Shakya', 'Manandhar', 'Tuladhar', 'Pradhan', 'Hada',
            'Kancha', 'Maila', 'Saila', 'Kaila', 'Antara', 'Purnima', 'Sajani', 'Roshani', 'Sujata', 'Mina'
        ],
        last: [
            'Gurung', 'Magar', 'Rai', 'Limbu', 'Tamang', 'Sherpa', 'Lama', 'Ghale', 'Thakali', 'Chaudary',
            'Shrestha', 'Maharjan', 'Bajracharya', 'Shakya', 'Manandhar', 'Tuladhar', 'Pradhan', 'Hada', 'Malla',
            'Pun', 'Gharti', 'Sunar', 'Gaire', 'Lohani', 'Tamrakar', 'Karmacharya', 'Joshi', 'Rajbhandari', 'Amatya'
        ]
    }
};

/**
 * Returns the ethnic category based on the surname
 */
export const getCategoryBySurname = (surname) => {
    if (!surname) return CATEGORIES.CHHETRI; // Default

    const normalizedSurname = surname.trim().charAt(0).toUpperCase() + surname.trim().slice(1).toLowerCase();

    // Direct mapping
    if (SURNAME_MAPPING[normalizedSurname]) {
        return SURNAME_MAPPING[normalizedSurname];
    }

    // Heuristic fallbacks
    if (normalizedSurname.endsWith('el') || normalizedSurname.endsWith('ai') || normalizedSurname.endsWith('ma')) {
        return CATEGORIES.BRAHMIN;
    }

    if (normalizedSurname.endsWith('et') || normalizedSurname.endsWith('ka') || normalizedSurname.endsWith('ri')) {
        return CATEGORIES.CHHETRI;
    }

    return CATEGORIES.JANAJATI; // Default for others
};

/**
 * Returns a random name based on the ethnic category
 */
export const getRandomNameByCategory = (category) => {
    const lists = NAMES_BY_CATEGORY[category] || NAMES_BY_CATEGORY[CATEGORIES.CHHETRI];
    const first = lists.first[Math.floor(Math.random() * lists.first.length)];
    const last = lists.last[Math.floor(Math.random() * lists.last.length)];
    return `${first} ${last}`;
};

/**
 * Returns a set of unique names for a given category
 */
export const getUniqueNamesByCategory = (category, count) => {
    const names = new Set();
    let attempts = 0;
    while (names.size < count && attempts < count * 5) {
        names.add(getRandomNameByCategory(category));
        attempts++;
    }
    return Array.from(names);
};
