import { getImagePath } from './utils';

// Define companion types
export const companionTypes = [
  {
    id: 'romantic',
    name: 'Romantic Friend',
    image: getImagePath('types', 'romantic'),
    available: true
  },
  {
    id: 'supportive',
    name: 'Supportive Friend',
    image: getImagePath('types', 'supportive'),
    available: true
  },
  {
    id: 'study',
    name: 'Study Partner',
    image: getImagePath('types', 'study'),
    available: false
  },
  {
    id: 'fitness',
    name: 'Fitness Coach',
    image: getImagePath('types', 'fitness'),
    available: false
  },
  {
    id: 'psychologist',
    name: 'Psychologist',
    image: getImagePath('types', 'psychologist'),
    available: false
  }
];

// Define gender options
export const genderOptions = [
  { 
    id: 'male', 
    name: 'Male', 
    image: getImagePath('gender', 'male')
  },
  { 
    id: 'female', 
    name: 'Female', 
    image: getImagePath('gender', 'female')
  }
];

// Function to create age options with correct gender images
export const getAgeOptions = (gender?: string) => [
  { id: 'late-teen', name: 'Late Teen', image: getImagePath('age', 'late-teen', gender) },
  { id: 'early-twenties', name: 'Early Twenties', image: getImagePath('age', 'early-twenties', gender) },
  { id: 'late-twenties', name: 'Late Twenties', image: getImagePath('age', 'late-twenties', gender) },
  { id: '30s', name: '30s', image: getImagePath('age', '30s', gender) },
  { id: '40s', name: '40s', image: getImagePath('age', '40s', gender) },
  { id: '50s', name: '50s', image: getImagePath('age', '50s', gender) },
  { id: '60s', name: '60s', image: getImagePath('age', '60s', gender) },
  { id: '70s-plus', name: '70s+', image: getImagePath('age', '70s-plus', gender) }
];

// Function to create ethnicity options with correct gender images
export const getEthnicityOptions = (gender?: string) => [
  { id: 'south-asian', name: 'South Asian', image: getImagePath('ethnicity', 'south-asian', gender) },
  { id: 'russian', name: 'Russian', image: getImagePath('ethnicity', 'russian', gender) },
  { id: 'middle-eastern', name: 'Middle Eastern', image: getImagePath('ethnicity', 'middle-eastern', gender) },
  { id: 'african', name: 'African', image: getImagePath('ethnicity', 'african', gender) },
  { id: 'european', name: 'European', image: getImagePath('ethnicity', 'european', gender) },
  { id: 'east-asian', name: 'East Asian', image: getImagePath('ethnicity', 'east-asian', gender) },
  { id: 'latina', name: 'Latina', image: getImagePath('ethnicity', 'latina', gender) },
  { id: 'native-american', name: 'Native American', image: getImagePath('ethnicity', 'native-american', gender) }
];

// Function to create eye color options with correct gender images
export const getEyeColorOptions = (gender?: string) => [
  { id: 'brown', name: 'Brown', image: getImagePath('eyes', 'brown', gender) },
  { id: 'hazel', name: 'Hazel', image: getImagePath('eyes', 'hazel', gender) },
  { id: 'blue', name: 'Blue', image: getImagePath('eyes', 'blue', gender) },
  { id: 'grey', name: 'Grey', image: getImagePath('eyes', 'grey', gender) },
  { id: 'green', name: 'Green', image: getImagePath('eyes', 'green', gender) },
  { id: 'silver', name: 'Silver', image: getImagePath('eyes', 'silver', gender) }
];

// Function to create hair color options with correct gender images
export const getHairColorOptions = (gender?: string) => [
  { id: 'black', name: 'Black', image: getImagePath('hair-color', 'black', gender) },
  { id: 'brown', name: 'Brown', image: getImagePath('hair-color', 'brown', gender) },
  { id: 'light-brown', name: 'Light Brown', image: getImagePath('hair-color', 'light-brown', gender) },
  { id: 'blonde', name: 'Blonde', image: getImagePath('hair-color', 'blonde', gender) },
  { id: 'red', name: 'Red', image: getImagePath('hair-color', 'red', gender) },
  { id: 'white', name: 'White', image: getImagePath('hair-color', 'white', gender) }
];

// Function to create hair style options with correct gender images
export const getHairStyleOptions = (gender?: string) => [
  { id: 'straight', name: 'Straight', image: getImagePath('hair-style', 'straight', gender) },
  { id: 'curly', name: 'Curly', image: getImagePath('hair-style', 'curly', gender) },
  { id: 'afro', name: 'Afro', image: getImagePath('hair-style', 'afro', gender) },
  { id: 'pixie-cut', name: 'Pixie Cut', image: getImagePath('hair-style', 'pixie-cut', gender) },
  { id: 'short-bob', name: 'Short Bob', image: getImagePath('hair-style', 'short-bob', gender) },
  { id: 'braid', name: 'Braid', image: getImagePath('hair-style', 'braid', gender) },
  { id: 'dreadlock', name: 'Dreadlock', image: getImagePath('hair-style', 'dreadlock', gender) },
  { id: 'high-ponytail', name: 'High Ponytail', image: getImagePath('hair-style', 'high-ponytail', gender) }
];

// Function to create body shape options with correct gender images
export const getBodyShapeOptions = (gender?: string) => [
  { id: 'slim', name: 'Slim', image: getImagePath('body-shape', 'slim', gender) },
  { id: 'athlete', name: 'Athlete', image: getImagePath('body-shape', 'athlete', gender) },
  { id: 'body-builder', name: 'Body Builder', image: getImagePath('body-shape', 'body-builder', gender) },
  { id: 'full-thick', name: 'Full / Thick', image: getImagePath('body-shape', 'full-thick', gender) },
  { id: 'plus', name: 'Plus', image: getImagePath('body-shape', 'plus', gender) }
];

// For breast size (female only)
export const breastSizeOptions = [
  { id: 'small', name: 'Small', image: getImagePath('breast', 'small') },
  { id: 'average', name: 'Average', image: getImagePath('breast', 'average') },
  { id: 'medium', name: 'Medium', image: getImagePath('breast', 'medium') },
  { id: 'large', name: 'Large', image: getImagePath('breast', 'large') }
];

// Function to create butt size options with correct gender images
export const getButtSizeOptions = (gender?: string) => [
  { id: 'small', name: 'Small', image: getImagePath('butt', 'small', gender) },
  { id: 'average', name: 'Average', image: getImagePath('butt', 'average', gender) },
  { id: 'medium', name: 'Medium', image: getImagePath('butt', 'medium', gender) },
  { id: 'large', name: 'Large', image: getImagePath('butt', 'large', gender) }
];

// For personality (gender-neutral)
export const personalityOptions = [
  { id: 'caring', name: 'Caring', image: getImagePath('personality', 'caring') },
  { id: 'funny', name: 'Funny', image: getImagePath('personality', 'funny') },
  { id: 'intelligent', name: 'Intelligent', image: getImagePath('personality', 'intelligent') },
  { id: 'outgoing', name: 'Outgoing', image: getImagePath('personality', 'outgoing') },
  { id: 'shy', name: 'Shy', image: getImagePath('personality', 'shy') },
  { id: 'confident', name: 'Confident', image: getImagePath('personality', 'confident') }
];

// Legacy options for backward compatibility
export const ageOptions = getAgeOptions();
export const ethnicityOptions = getEthnicityOptions();
export const eyeColorOptions = getEyeColorOptions();
export const hairColorOptions = getHairColorOptions();
export const hairStyleOptions = getHairStyleOptions();
export const bodyShapeOptions = getBodyShapeOptions();
export const buttSizeOptions = getButtSizeOptions();

// Legacy face and body options
export const faceOptions = [
  { id: 'face1', name: 'Face 1', image: '/images/companions/face/face1.jpg' },
  { id: 'face2', name: 'Face 2', image: '/images/companions/face/face2.jpg' },
  { id: 'face3', name: 'Face 3', image: '/images/companions/face/face3.jpg' },
  { id: 'face4', name: 'Face 4', image: '/images/companions/face/face4.jpg' }
];

export const bodyOptions = [
  { id: 'athletic', name: 'Athletic', image: '/images/companions/body/athletic.jpg' },
  { id: 'slim', name: 'Slim', image: '/images/companions/body/slim.jpg' },
  { id: 'curvy', name: 'Curvy', image: '/images/companions/body/curvy.jpg' },
  { id: 'muscular', name: 'Muscular', image: '/images/companions/body/muscular.jpg' }
];

// Define the steps
export const formSteps = [
  { name: 'Type & Gender', number: 1 },
  { name: 'Age & Ethnicity', number: 2 },
  { name: 'Face', number: 3 },
  { name: 'Body', number: 4 },
  { name: 'Name', number: 5 },
  { name: 'Personality', number: 6 }
]; 