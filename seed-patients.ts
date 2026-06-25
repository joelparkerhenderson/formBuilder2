import pg from 'pg';
import crypto from 'crypto';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

// 1. Welsh addresses generation helper variables
const welshTowns = [
  { town: 'Cardiff', area: 'Roath', pc: 'CF24' },
  { town: 'Cardiff', area: 'Canton', pc: 'CF5' },
  { town: 'Cardiff', area: 'Llandaff', pc: 'CF5' },
  { town: 'Cardiff', area: 'Lisvane', pc: 'CF14' },
  { town: 'Swansea', area: 'Mumbles', pc: 'SA3' },
  { town: 'Swansea', area: 'Sketty', pc: 'SA2' },
  { town: 'Swansea', area: 'Gorseinon', pc: 'SA4' },
  { town: 'Newport', area: 'Caerleon', pc: 'NP18' },
  { town: 'Newport', area: 'Duffryn', pc: 'NP10' },
  { town: 'Wrexham', area: 'Acton', pc: 'LL12' },
  { town: 'Wrexham', area: 'Rhosnesni', pc: 'LL13' },
  { town: 'Bangor', area: 'Garth', pc: 'LL57' },
  { town: 'Aberystwyth', area: 'Penparcau', pc: 'SY23' },
  { town: 'Llanelli', area: 'Felinfoel', pc: 'SA14' },
  { town: 'Barry', area: 'Colcot', pc: 'CF63' },
  { town: 'Bridgend', area: 'Coity', pc: 'CF31' },
  { town: 'Pontypridd', area: 'Treforest', pc: 'CF37' },
  { town: 'Merthyr Tydfil', area: 'Dowlais', pc: 'CF48' },
  { town: 'Tenby', area: 'Pembrokeshire Coast', pc: 'SA70' },
  { town: 'Brecon', area: 'Powys Lake District', pc: 'LD3' },
  { town: 'Haverfordwest', area: 'Prendergast', pc: 'SA61' },
  { town: 'Neath', area: 'Cadoxton', pc: 'SA10' },
  { town: 'Caernarfon', area: 'Gwynedd', pc: 'LL55' },
  { town: 'Llandudno', area: 'Great Orme', pc: 'LL30' }
];

const streetPrefixes = [
  'Heol', 'Ffordd', 'Llwyn', 'Clos', 'Rhiw', 'Maes', 'Afon', 'Bryn', 'Pen', 'Glan',
  'Castle', 'Church', 'Mill', 'Bridge', 'Grange', 'Priory', 'Meadow', 'Woodland', 'Railway'
];

const streetSuffixes = [
  'y Bont', 'y Coleg', 'y Coed', 'y Dre', 'y Delyn', 'y Glyn', 'y Mynydd', 'y Parc',
  'Road', 'Street', 'Avenue', 'Close', 'Drive', 'Gardens', 'Lane', 'View', 'Way', 'Rise'
];

function generateWelshAddress(index: number) {
  // Deterministic but highly diverse generation based on patient index
  const townObj = welshTowns[index % welshTowns.length];
  const prefix = streetPrefixes[(index * 7) % streetPrefixes.length];
  const suffix = streetSuffixes[(index * 13) % streetSuffixes.length];
  
  // Mixed English and Welsh streets
  let streetName = "";
  if (prefix.startsWith('Heol') || prefix.startsWith('Ffordd') || prefix.startsWith('Llwyn') || prefix.startsWith('Clos') || prefix.startsWith('Rhiw') || prefix.startsWith('Maes') || prefix.startsWith('Bryn')) {
    streetName = `${prefix} ${suffix}`;
  } else {
    streetName = `${prefix} ${suffix.endsWith('Road') || suffix.endsWith('Street') || suffix.endsWith('Avenue') || suffix.endsWith('Close') || suffix.endsWith('Drive') || suffix.endsWith('Gardens') || suffix.endsWith('Lane') || suffix.endsWith('View') || suffix.endsWith('Way') || suffix.endsWith('Rise') ? suffix : 'Road'}`;
  }

  const houseNum = (index % 120) + 1;
  const letters = "ABDEFGHJLNPQRSTUWXYZ";
  const pcTail = `${letters[(index * 3) % letters.length]}${letters[(index * 11) % letters.length]}`;
  const postcode = `${townObj.pc} ${(index % 9) + 1}${pcTail}`;

  return {
    address1: `${houseNum} ${streetName}`,
    address2: townObj.area,
    address3: townObj.town,
    address4: postcode
  };
}

// 2. NHS indicator generator (Format: XXX XXX XXXX)
function generateNHSNumber(index: number): string {
  // NHS number prefix starts with high random series like 400 or 900
  const prefix = 300 + (index % 600);
  const part2 = String(100 + (index * 17) % 900);
  const part3 = String(1000 + (index * 31) % 9000);
  return `${prefix} ${part2} ${part3}`;
}

// 3. Hospital Number CRN Generator (Format: Capital letter [excluding O] + 7 digits)
function generateCRN(index: number): string {
  const letters = "ABCDEFGHIJKLMNPQRSTUVWXYZ"; // 'O' excluded
  const letter = letters[index % letters.length];
  // Generate a predictable but widespread 7 digit number
  const baseVal = 1010101 + (index * 4231) % 8900000;
  return `${letter}${baseVal}`;
}

// 4. Age calculator to Date of Birth
function generateDOB(age: number, index: number): string {
  const currentYear = 2026;
  const targetYear = currentYear - age;
  // Deterministic month and day based on index
  const month = String((index % 12) + 1).padStart(2, '0');
  // Simple safety ceiling for days in February / general months
  const dayVal = (index % 28) + 1;
  const day = String(dayVal).padStart(2, '0');
  return `${targetYear}-${month}-${day}`;
}

// The core 200 universally recognized fictional characters
const fictionalCharacters = [
  // Harry Potter
  { forenames: "Harry", surname: "POTTER", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Hermione", surname: "GRANGER", title: "Miss", sex: "Female", age: 45 },
  { forenames: "Ron", surname: "WEASLEY", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Albus", surname: "DUMBLEDORE", title: "Professor", sex: "Male", age: 98 },
  { forenames: "Severus", surname: "SNAPE", title: "Mr", sex: "Male", age: 66 },
  { forenames: "Rubeus", surname: "HAGRID", title: "Mr", sex: "Male", age: 80 },
  { forenames: "Lord", surname: "VOLDEMORT", title: "Mr", sex: "Male", age: 85 },
  { forenames: "Draco", surname: "MALFOY", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Luna", surname: "LOVEGOOD", title: "Miss", sex: "Female", age: 42 },
  { forenames: "Sirius", surname: "BLACK", title: "Mr", sex: "Male", age: 66 },

  // Star Wars
  { forenames: "Luke", surname: "SKYWALKER", title: "Mr", sex: "Male", age: 60 },
  { forenames: "Leia", surname: "ORGANA", title: "Princess", sex: "Female", age: 60 },
  { forenames: "Han", surname: "SOLO", title: "Mr", sex: "Male", age: 65 },
  { forenames: "Darth", surname: "VADER", title: "Mr", sex: "Male", age: 75 },
  { forenames: "Obi-Wan", surname: "KENOBI", title: "Mr", sex: "Male", age: 82 },
  { forenames: "Master", surname: "YODA", title: "Mr", sex: "Male", age: 99 },
  { forenames: "Lando", surname: "CALRISSIAN", title: "Mr", sex: "Male", age: 64 },
  { forenames: "Rey", surname: "SKYWALKER", title: "Ms", sex: "Female", age: 28 },
  { forenames: "Finn", surname: "STRYKER", title: "Mr", sex: "Male", age: 30 },
  { forenames: "Poe", surname: "DAMERON", title: "Mr", sex: "Male", age: 35 },

  // DC Comics / Batman
  { forenames: "Bruce", surname: "WAYNE", title: "Mr", sex: "Male", age: 44 },
  { forenames: "Clark", surname: "KENT", title: "Mr", sex: "Male", age: 42 },
  { forenames: "Diana", surname: "PRINCE", title: "Miss", sex: "Female", age: 38 },
  { forenames: "Lois", surname: "LANE", title: "Mrs", sex: "Female", age: 40 },
  { forenames: "Lex", surname: "LUTHOR", title: "Mr", sex: "Male", age: 48 },
  { forenames: "Arthur", surname: "CURRY", title: "Mr", sex: "Male", age: 39 },
  { forenames: "Selina", surname: "KYLE", title: "Ms", sex: "Female", age: 36 },
  { forenames: "The", surname: "JOKER", title: "Mr", sex: "Male", age: 50 },
  { forenames: "Harley", surname: "QUINN", title: "Dr", sex: "Female", age: 32 },
  { forenames: "Alfred", surname: "PENNYWORTH", title: "Mr", sex: "Male", age: 72 },

  // Marvel Comics
  { forenames: "Peter", surname: "PARKER", title: "Mr", sex: "Male", age: 24 },
  { forenames: "Tony", surname: "STARK", title: "Mr", sex: "Male", age: 52 },
  { forenames: "Steve", surname: "ROGERS", title: "Captain", sex: "Male", age: 99 },
  { forenames: "Bruce", surname: "BANNER", title: "Dr", sex: "Male", age: 49 },
  { forenames: "Natasha", surname: "ROMANOFF", title: "Miss", sex: "Female", age: 38 },
  { forenames: "Clint", surname: "BARTON", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Wanda", surname: "MAXIMOFF", title: "Miss", sex: "Female", age: 31 },
  { forenames: "Stephen", surname: "STRANGE", title: "Dr", sex: "Male", age: 47 },
  { forenames: "Thor", surname: "ODINSON", title: "Mr", sex: "Male", age: 40 },
  { forenames: "Logan", surname: "WOLVERINE", title: "Mr", sex: "Male", age: 95 },
  { forenames: "Charles", surname: "XAVIER", title: "Professor", sex: "Male", age: 70 },
  { forenames: "Erik", surname: "LEHNSHERR", title: "Mr", sex: "Male", age: 72 },

  // Lord of the Rings
  { forenames: "Frodo", surname: "BAGGINS", title: "Mr", sex: "Male", age: 50 },
  { forenames: "Samwise", surname: "GAMGEE", title: "Mr", sex: "Male", age: 38 },
  { forenames: "Aragorn", surname: "ELLYSAR", title: "Mr", sex: "Male", age: 87 },
  { forenames: "Gandalf", surname: "GREY", title: "Mr", sex: "Male", age: 99 },
  { forenames: "Legolas", surname: "GREENLEAF", title: "Mr", sex: "Male", age: 90 },
  { forenames: "Gimli", surname: "GLOIN", title: "Mr", sex: "Male", age: 82 },
  { forenames: "Bilbo", surname: "BAGGINS", title: "Mr", sex: "Male", age: 99 },
  { forenames: "Gollum", surname: "SMEAGOL", title: "Mr", sex: "Male", age: 95 },
  { forenames: "Peregrin", surname: "TOOK", title: "Mr", sex: "Male", age: 29 },
  { forenames: "Meriadoc", surname: "BRANDYBUCK", title: "Mr", sex: "Male", age: 30 },

  // Sherlock Holmes
  { forenames: "Sherlock", surname: "HOLMES", title: "Mr", sex: "Male", age: 54 },
  { forenames: "John", surname: "WATSON", title: "Dr", sex: "Male", age: 52 },
  { forenames: "James", surname: "MORIARTY", title: "Professor", sex: "Male", age: 55 },
  { forenames: "Irene", surname: "ADLER", title: "Miss", sex: "Female", age: 35 },
  { forenames: "Mycroft", surname: "HOLMES", title: "Mr", sex: "Male", age: 60 },

  // James Bond
  { forenames: "James", surname: "BOND", title: "Mr", sex: "Male", age: 42 },
  { forenames: "Ernst", surname: "BLOFLD", title: "Mr", sex: "Male", age: 65 },
  { forenames: "Miss", surname: "MONEYPENNY", title: "Miss", sex: "Female", age: 35 },

  // Disney Cartoon Classics
  { forenames: "Mickey", surname: "MOUSE", title: "Mr", sex: "Male", age: 97 },
  { forenames: "Minnie", surname: "MOUSE", title: "Miss", sex: "Female", age: 97 },
  { forenames: "Donald", surname: "DUCK", title: "Mr", sex: "Male", age: 92 },
  { forenames: "Daisy", surname: "DUCK", title: "Miss", sex: "Female", age: 92 },
  { forenames: "Goofy", surname: "DAWG", title: "Mr", sex: "Male", age: 94 },
  { forenames: "Scrooge", surname: "MCDUCK", title: "Mr", sex: "Male", age: 99 },

  // The Simpsons
  { forenames: "Homer", surname: "SIMPSON", title: "Mr", sex: "Male", age: 40 },
  { forenames: "Marge", surname: "SIMPSON", title: "Mrs", sex: "Female", age: 38 },
  { forenames: "Bart", surname: "SIMPSON", title: "Master", sex: "Male", age: 10 },
  { forenames: "Lisa", surname: "SIMPSON", title: "Miss", sex: "Female", age: 8 },
  { forenames: "Maggie", surname: "SIMPSON", title: "Miss", sex: "Female", age: 1 },
  { forenames: "Ned", surname: "FLANDERS", title: "Mr", sex: "Male", age: 44 },
  { forenames: "Montgomery", surname: "BURNS", title: "Mr", sex: "Male", age: 99 },
  { forenames: "Waylon", surname: "SMITHERS", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Barney", surname: "GUMBLE", title: "Mr", sex: "Male", age: 42 },
  { forenames: "Seymour", surname: "SKINNER", title: "Principal", sex: "Male", age: 50 },

  // Family Guy
  { forenames: "Peter", surname: "GRIFFIN", title: "Mr", sex: "Male", age: 43 },
  { forenames: "Lois", surname: "GRIFFIN", title: "Mrs", sex: "Female", age: 41 },
  { forenames: "Meg", surname: "GRIFFIN", title: "Miss", sex: "Female", age: 18 },
  { forenames: "Chris", surname: "GRIFFIN", title: "Master", sex: "Male", age: 15 },
  { forenames: "Stewie", surname: "GRIFFIN", title: "Master", sex: "Male", age: 2 },
  { forenames: "Glenn", surname: "QUAGMIRE", title: "Mr", sex: "Male", age: 45 },

  // SpongeBob
  { forenames: "SpongeBob", surname: "SQUAREPANTS", title: "Mr", sex: "Male", age: 25 },
  { forenames: "Patrick", surname: "STAR", title: "Mr", sex: "Male", age: 25 },
  { forenames: "Squidward", surname: "TENTACLES", title: "Mr", sex: "Male", age: 40 },
  { forenames: "Sandy", surname: "CHEEKS", title: "Miss", sex: "Female", age: 24 },
  { forenames: "Eugene", surname: "KRABS", title: "Mr", sex: "Male", age: 60 },
  { forenames: "Sheldon", surname: "PLANKTON", title: "Mr", sex: "Male", age: 55 },

  // Shrek
  { forenames: "Shrek", surname: "OGRE", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Fiona", surname: "OGRE", title: "Princess", sex: "Female", age: 30 },
  { forenames: "Donkey", surname: "EQUUS", title: "Mr", sex: "Male", age: 25 },
  { forenames: "Lord", surname: "FARQUAAD", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Puss", surname: "BOOTS", title: "Mr", sex: "Male", age: 20 },

  // Toy Story
  { forenames: "Sheriff", surname: "WOODY", title: "Mr", sex: "Male", age: 30 },
  { forenames: "Buzz", surname: "LIGHTYEAR", title: "Mr", sex: "Male", age: 28 },
  { forenames: "Jessie", surname: "YODELER", title: "Miss", sex: "Female", age: 26 },
  { forenames: "Andy", surname: "DAVIS", title: "Mr", sex: "Male", age: 22 },

  // Game of Thrones
  { forenames: "Jon", surname: "SNOW", title: "Mr", sex: "Male", age: 32 },
  { forenames: "Daenerys", surname: "TARGARYEN", title: "Miss", sex: "Female", age: 28 },
  { forenames: "Tyrion", surname: "LANNISTER", title: "Mr", sex: "Male", age: 40 },
  { forenames: "Arya", surname: "STARK", title: "Miss", sex: "Female", age: 18 },
  { forenames: "Sansa", surname: "STARK", title: "Miss", sex: "Female", age: 24 },
  { forenames: "Eddard", surname: "STARK", title: "Mr", sex: "Male", age: 48 },
  { forenames: "Cersei", surname: "LANNISTER", title: "Mrs", sex: "Female", age: 45 },
  { forenames: "Jaime", surname: "LANNISTER", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Joffrey", surname: "BARATHEON", title: "Mr", sex: "Male", age: 19 },
  { forenames: "Sandor", surname: "CLEGANE", title: "Mr", sex: "Male", age: 42 },

  // Breaking Bad
  { forenames: "Walter", surname: "WHITE", title: "Mr", sex: "Male", age: 50 },
  { forenames: "Jesse", surname: "PINKMAN", title: "Mr", sex: "Male", age: 28 },
  { forenames: "Saul", surname: "GOODMAN", title: "Mr", sex: "Male", age: 46 },
  { forenames: "Gustavo", surname: "FRING", title: "Mr", sex: "Male", age: 55 },
  { forenames: "Mike", surname: "EHRMANTRAUT", title: "Mr", sex: "Male", age: 68 },
  { forenames: "Skyler", surname: "WHITE", title: "Mrs", sex: "Female", age: 42 },
  { forenames: "Hank", surname: "SCHRADER", title: "Mr", sex: "Male", age: 45 },

  // House M.D.
  { forenames: "Gregory", surname: "HOUSE", title: "Dr", sex: "Male", age: 52 },
  { forenames: "James", surname: "WILSON", title: "Dr", sex: "Male", age: 50 },
  { forenames: "Lisa", surname: "CUDDY", title: "Dr", sex: "Female", age: 47 },
  { forenames: "Eric", surname: "FOREMAN", title: "Dr", sex: "Male", age: 42 },

  // The Office US
  { forenames: "Michael", surname: "SCOTT", title: "Mr", sex: "Male", age: 48 },
  { forenames: "Dwight", surname: "SCHRUTE", title: "Mr", sex: "Male", age: 44 },
  { forenames: "Jim", surname: "HALPERT", title: "Mr", sex: "Male", age: 36 },
  { forenames: "Pam", surname: "BEESLY", title: "Mrs", sex: "Female", age: 35 },
  { forenames: "Ryan", surname: "HOWARD", title: "Mr", sex: "Male", age: 33 },
  { forenames: "Angela", surname: "MARTIN", title: "Mrs", sex: "Female", age: 41 },

  // Big Bang Theory
  { forenames: "Sheldon", surname: "COOPER", title: "Dr", sex: "Male", age: 36 },
  { forenames: "Leonard", surname: "HOFSTADTER", title: "Dr", sex: "Male", age: 36 },
  { forenames: "Penny", surname: "TELLER", title: "Mrs", sex: "Female", age: 32 },
  { forenames: "Howard", surname: "WOLOWITZ", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Rajesh", surname: "KOOTHRAPPALI", title: "Dr", sex: "Male", age: 35 },
  { forenames: "Amy", surname: "FOWLER", title: "Dr", sex: "Female", age: 36 },

  // Super Mario
  { forenames: "Mario", surname: "MARIO", title: "Mr", sex: "Male", age: 40 },
  { forenames: "Luigi", surname: "MARIO", title: "Mr", sex: "Male", age: 38 },
  { forenames: "Princess", surname: "PEACH", title: "Miss", sex: "Female", age: 30 },
  { forenames: "Bowser", surname: "KOOPA", title: "Mr", sex: "Male", age: 50 },
  { forenames: "Wario", surname: "WARIO", title: "Mr", sex: "Male", age: 42 },

  // Sonic the Hedgehog
  { forenames: "Sonic", surname: "HEDGEHOG", title: "Mr", sex: "Male", age: 18 },
  { forenames: "Miles", surname: "TAILS", title: "Mr", sex: "Male", age: 8 },
  { forenames: "Knuckles", surname: "ECHIDNA", title: "Mr", sex: "Male", age: 19 },
  { forenames: "Ivo", surname: "ROBOTNIK", title: "Doctor", sex: "Male", age: 55 },

  // Indiana Jones
  { forenames: "Indiana", surname: "JONES", title: "Dr", sex: "Male", age: 55 },
  { forenames: "Marion", surname: "RAVENWOOD", title: "Mrs", sex: "Female", age: 52 },
  { forenames: "Henry", surname: "JONES", title: "Professor", sex: "Male", age: 80 },

  // Pirates of the Caribbean
  { forenames: "Jack", surname: "SPARROW", title: "Captain", sex: "Male", age: 44 },
  { forenames: "Elizabeth", surname: "SWANN", title: "Miss", sex: "Female", age: 32 },
  { forenames: "Will", surname: "TURNER", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Hector", surname: "BARBOSSA", title: "Captain", sex: "Male", age: 60 },

  // Hitchhiker's Guide
  { forenames: "Arthur", surname: "DENT", title: "Mr", sex: "Male", age: 38 },
  { forenames: "Ford", surname: "PREFECT", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Zaphod", surname: "BEEBLEBROX", title: "Mr", sex: "Male", age: 50 },

  // Hunger Games
  { forenames: "Katniss", surname: "EVERDEEN", title: "Miss", sex: "Female", age: 22 },
  { forenames: "Peeta", surname: "MELLARK", title: "Mr", sex: "Male", age: 22 },
  { forenames: "Gale", surname: "HAWTHORNE", title: "Mr", sex: "Male", age: 24 },
  { forenames: "Haymitch", surname: "ABERNATHY", title: "Mr", sex: "Male", age: 50 },

  // Classics
  { forenames: "Alice", surname: "WONDERLAND", title: "Miss", sex: "Female", age: 12 },
  { forenames: "Peter", surname: "PAN", title: "Master", sex: "Male", age: 10 },
  { forenames: "Captain", surname: "HOOK", title: "Mr", sex: "Male", age: 52 },
  { forenames: "Dorothy", surname: "GALE", title: "Miss", sex: "Female", age: 14 },
  { forenames: "Willy", surname: "WONKA", title: "Mr", sex: "Male", age: 48 },
  { forenames: "Charlie", surname: "BUCKET", title: "Master", sex: "Male", age: 11 },
  { forenames: "Ebenezer", surname: "SCROOGE", title: "Mr", sex: "Male", age: 75 },
  { forenames: "Bob", surname: "CRATCHIT", title: "Mr", sex: "Male", age: 42 },
  { forenames: "Romeo", surname: "MONTAGUE", title: "Mr", sex: "Male", age: 17 },
  { forenames: "Juliet", surname: "CAPULET", title: "Miss", sex: "Female", age: 16 },

  // Winnie the Pooh / Muppets / Peanuts
  { forenames: "Winnie", surname: "POOH", title: "Mr", sex: "Male", age: 30 },
  { forenames: "Christopher", surname: "ROBIN", title: "Master", sex: "Male", age: 8 },
  { forenames: "Kermit", surname: "FROG", title: "Mr", sex: "Male", age: 50 },
  { forenames: "Miss", surname: "PIGGY", title: "Miss", sex: "Female", age: 46 },
  { forenames: "Charlie", surname: "BROWN", title: "Master", sex: "Male", age: 9 },
  { forenames: "Lucy", surname: "VANPELT", title: "Miss", sex: "Female", age: 10 },

  // Scooby-Doo
  { forenames: "Norville", surname: "ROGERS", title: "Mr", sex: "Male", age: 21 },
  { forenames: "Fred", surname: "JONES", title: "Mr", sex: "Male", age: 22 },
  { forenames: "Daphne", surname: "BLAKE", title: "Miss", sex: "Female", age: 21 },
  { forenames: "Velma", surname: "DINKLEY", title: "Miss", sex: "Female", age: 21 },

  // Pokemon / Literary Icons
  { forenames: "Ash", surname: "KETCHUM", title: "Master", sex: "Male", age: 12 },
  { forenames: "Tintin", surname: "BELGIUM", title: "Mr", sex: "Male", age: 22 },
  { forenames: "Captain", surname: "HADDOCK", title: "Mr", sex: "Male", age: 55 },
  { forenames: "Tony", surname: "SOPRANO", title: "Mr", sex: "Male", age: 48 },
  { forenames: "Michael", surname: "CORLEONE", title: "Mr", sex: "Male", age: 51 },
  { forenames: "Ted", surname: "LASSO", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Rebecca", surname: "WELTON", title: "Ms", sex: "Female", age: 47 },
  { forenames: "Neil", surname: "NEO", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Marty", surname: "MCFLY", title: "Mr", sex: "Male", age: 18 },
  { forenames: "Emmett", surname: "BROWN", title: "Doc", sex: "Male", age: 65 },
  { forenames: "Forrest", surname: "GUMP", title: "Mr", sex: "Male", age: 44 },
  { forenames: "Ferris", surname: "BUELLER", title: "Mr", sex: "Male", age: 18 },
  { forenames: "Jay", surname: "GATSBY", title: "Mr", sex: "Male", age: 32 },
  { forenames: "Atticus", surname: "FINCH", title: "Mr", sex: "Male", age: 50 },
  { forenames: "Tom", surname: "SAWYER", title: "Master", sex: "Male", age: 12 },
  { forenames: "Elizabeth", surname: "BENNET", title: "Miss", sex: "Female", age: 20 },
  { forenames: "Edward", surname: "ROCHESTER", title: "Mr", sex: "Male", age: 40 },
  { forenames: "Oliver", surname: "TWIST", title: "Master", sex: "Male", age: 10 },
  { forenames: "Robinson", surname: "CRUSOE", title: "Mr", sex: "Male", age: 45 },

  // 70 further household fictional identifiers to achieve exactly or ~200 entries
  { forenames: "Barack", surname: "OBAMA", title: "Mr", sex: "Male", age: 64 },
  { forenames: "Winston", surname: "CHURCHILL", title: "Mr", sex: "Male", age: 90 },
  { forenames: "William", surname: "SHAKESPEARE", title: "Mr", sex: "Male", age: 52 },
  { forenames: "Albert", surname: "EINSTEIN", title: "Professor", sex: "Male", age: 76 },
  { forenames: "Marie", surname: "CURIE", title: "Professor", sex: "Female", age: 66 },
  { forenames: "Cleopatra", surname: "EGYPT", title: "Queen", sex: "Female", age: 39 },
  { forenames: "Julius", surname: "CAESAR", title: "Mr", sex: "Male", age: 55 },
  { forenames: "Napoleon", surname: "BONAPARTE", title: "Mr", sex: "Male", age: 51 },
  { forenames: "Abraham", surname: "LINCOLN", title: "Mr", sex: "Male", age: 56 },
  { forenames: "George", surname: "WASHINGTON", title: "Mr", sex: "Male", age: 67 },
  { forenames: "Luke", surname: "CAGE", title: "Mr", sex: "Male", age: 38 },
  { forenames: "Matt", surname: "MURDOCK", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Jessica", surname: "JONES", title: "Ms", sex: "Female", age: 33 },
  { forenames: "Danny", surname: "RAND", title: "Mr", sex: "Male", age: 32 },
  { forenames: "Frank", surname: "CASTLE", title: "Mr", sex: "Male", age: 46 },
  { forenames: "Nick", surname: "FURY", title: "Director", sex: "Male", age: 60 },
  { forenames: "Phil", surname: "COULSON", title: "Agent", sex: "Male", age: 52 },
  { forenames: "Daisy", surname: "JOHNSON", title: "Miss", sex: "Female", age: 28 },
  { forenames: "Melinda", surname: "MAY", title: "Agent", sex: "Female", age: 50 },
  { forenames: "Jemma", surname: "SIMMONS", title: "Dr", sex: "Female", age: 32 },
  { forenames: "Leo", surname: "FITZ", title: "Dr", sex: "Male", age: 33 },
  { forenames: "Peggy", surname: "CARTER", title: "Agent", sex: "Female", age: 38 },
  { forenames: "Bucky", surname: "BARNES", title: "Mr", sex: "Male", age: 95 },
  { forenames: "Sam", surname: "WILSON", title: "Mr", sex: "Male", age: 40 },
  { forenames: "James", surname: "RHODES", title: "Colonel", sex: "Male", age: 48 },
  { forenames: "Pietro", surname: "MAXIMOFF", title: "Mr", sex: "Male", age: 26 },
  { forenames: "Vision", surname: "SYNTH", title: "Mr", sex: "Male", age: 3 },
  { forenames: "Carol", surname: "DANVERS", title: "Captain", sex: "Female", age: 35 },
  { forenames: "TChalla", surname: "WAKANDA", title: "King", sex: "Male", age: 38 },
  { forenames: "Shuri", surname: "WAKANDA", title: "Princess", sex: "Female", age: 22 },
  { forenames: "Scott", surname: "LANG", title: "Mr", sex: "Male", age: 41 },
  { forenames: "Hope", surname: "DYNE", title: "Ms", sex: "Female", age: 38 },
  { forenames: "Hank", surname: "PYM", title: "Dr", sex: "Male", age: 75 },
  { forenames: "Janet", surname: "DYNE", title: "Dr", sex: "Female", age: 72 },
  { forenames: "Peter", surname: "QUILL", title: "Mr", sex: "Male", age: 39 },
  { forenames: "Gamora", surname: "ZEN", title: "Miss", sex: "Female", age: 32 },
  { forenames: "Drax", surname: "DESTROYER", title: "Mr", sex: "Male", age: 42 },
  { forenames: "Groot", surname: "TREE", title: "Mr", sex: "Male", age: 10 },
  { forenames: "Rocket", surname: "RACCOON", title: "Mr", sex: "Male", age: 15 },
  { forenames: "Mantis", surname: "EMPATH", title: "Miss", sex: "Female", age: 28 },
  { forenames: "Nebula", surname: "CYBORG", title: "Miss", sex: "Female", age: 30 },
  { forenames: "Loki", surname: "LAUFEYSON", title: "Mr", sex: "Male", age: 40 },
  { forenames: "Valkyrie", surname: "SCION", title: "Miss", sex: "Female", age: 34 },
  { forenames: "Heimdall", surname: "ASGARD", title: "Mr", sex: "Male", age: 80 },
  { forenames: "Odin", surname: "ASGARD", title: "King", sex: "Male", age: 99 },
  { forenames: "Frigga", surname: "ASGARD", title: "Queen", sex: "Female", age: 95 },
  { forenames: "Hela", surname: "ASGARD", title: "Miss", sex: "Female", age: 50 },
  { forenames: "Korg", surname: "STONE", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Meek", surname: "INSECT", title: "Mr", sex: "Male", age: 12 },
  { forenames: "Wong", surname: "SORCERER", title: "Mr", sex: "Male", age: 44 },
  { forenames: "Kaecilius", surname: "ZEALOT", title: "Mr", sex: "Male", age: 45 },
  { forenames: "Ancient", surname: "ONE", title: "Master", sex: "Female", age: 99 },
  { forenames: "Karl", surname: "MORDO", title: "Mr", sex: "Male", age: 42 },
  { forenames: "Christine", surname: "PALMER", title: "Dr", sex: "Female", age: 38 },
  { forenames: "Everett", surname: "ROSS", title: "Mr", sex: "Male", age: 46 },
  { forenames: "Ulysses", surname: "KLAUE", title: "Mr", sex: "Male", age: 51 },
  { forenames: "Zuri", surname: "ELDER", title: "Mr", sex: "Male", age: 64 },
  { forenames: "Okoye", surname: "WARRIOR", title: "General", sex: "Female", age: 34 },
  { forenames: "Nakia", surname: "SPY", title: "Miss", sex: "Female", age: 31 },
  { forenames: "M Baku", surname: "JABARI", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Ramonda", surname: "WAKANDA", title: "Queen", sex: "Female", age: 67 },
  { forenames: "W Kabi", surname: "CAPTAIN", title: "Mr", sex: "Male", age: 36 },
  { forenames: "Aisha", surname: "DJINN", title: "Mrs", sex: "Female", age: 40 },
  { forenames: "Kamala", surname: "KHAN", title: "Miss", sex: "Female", age: 16 },
  { forenames: "Marc", surname: "SPECTOR", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Steven", surname: "GRANT", title: "Mr", sex: "Male", age: 35 },
  { forenames: "Layla", surname: "ELFAOLY", title: "Miss", sex: "Female", age: 31 },
  { forenames: "Arthur", surname: "HARROW", title: "Mr", sex: "Male", age: 55 },
  { forenames: "Kate", surname: "BISHOP", title: "Miss", sex: "Female", age: 22 },
  { forenames: "Eleanor", surname: "BISHOP", title: "Mrs", sex: "Female", age: 46 },
  { forenames: "Jack", surname: "DUQUESNE", title: "Mr", sex: "Male", age: 48 },
  { forenames: "Maya", surname: "LOPEZ", title: "Miss", sex: "Female", age: 26 },
  { forenames: "Kazimierz", surname: "KAZI", title: "Mr", sex: "Male", age: 28 },
  { forenames: "Wilson", surname: "FISK", title: "Mr", sex: "Male", age: 52 },
  { forenames: "Leland", surname: "OWSLEY", title: "Mr", sex: "Male", age: 60 },
  { forenames: "Vanessa", surname: "MARIANNA", title: "Mrs", sex: "Female", age: 44 },
  { forenames: "James", surname: "WESLEY", title: "Mr", sex: "Male", age: 38 },
  { forenames: "Ben", surname: "URICH", title: "Mr", sex: "Male", age: 58 },
  { forenames: "Karen", surname: "PAGE", title: "Miss", sex: "Female", age: 29 },
  { forenames: "Franklin", surname: "FOGGY", title: "Mr", sex: "Male", age: 32 },
  { forenames: "Claire", surname: "TEMPLE", title: "Nurse", sex: "Female", age: 36 },
  { forenames: "Shirley", surname: "HOLMES", title: "Mrs", sex: "Female", age: 80 }
];

async function seedFictionalPatients() {
  const client = new Client({
    connectionString: connectionString.split('?')[0],
    ssl: connectionString.includes('74.220.19.171') || connectionString.includes('supabase') || connectionString.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined
  });

  console.log("Connecting securely to database to seed 200 patients...");
  await client.connect();

  console.log("Cascade deleting existing patients to clear registry...");
  await client.query("TRUNCATE TABLE patients CASCADE");
  console.log("Database patients table cleared.");

  console.log(`Mapping ${fictionalCharacters.length} household fictional names to Welsh properties...`);

  // Insert loop of deterministic seed records
  let count = 0;
  for (let i = 0; i < fictionalCharacters.length; i++) {
    const char = fictionalCharacters[i];
    const uuid = crypto.randomUUID();
    const address = generateWelshAddress(i);
    const nhs = generateNHSNumber(i);
    const crn = generateCRN(i);
    const dob = generateDOB(char.age, i);

    await client.query(`
      INSERT INTO patients (
        uuid, version, nhs_number, surname, forenames, title,
        address_line1, address_line2, address_line3, address_line4,
        crn, date_of_birth, sex, updated_at
      ) VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    `, [
      uuid,
      nhs,
      char.surname,
      char.forenames,
      char.title,
      address.address1,
      address.address2,
      address.address3,
      address.address4,
      crn,
      dob,
      char.sex
    ]);
    count++;
  }

  console.log(`Success! Seeded ${count} highly-identifiable fictional patients with Welsh addresses.`);
  await client.end();
}

seedFictionalPatients().catch((err) => {
  console.error("Failed to seed 200 patients:", err);
  process.exit(1);
});
