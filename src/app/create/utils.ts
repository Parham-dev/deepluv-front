/**
 * Get the appropriate image path based on option type and gender
 * @param type The type of option (e.g., 'age', 'ethnicity')
 * @param id The option ID
 * @param gender The selected gender (if applicable)
 * @returns Full image path
 */
export const getImagePath = (
  type: 'types' | 'gender' | 'age' | 'ethnicity' | 'eyes' | 'hair-color' | 'hair-style' | 
        'body-shape' | 'breast' | 'butt' | 'personality',
  id: string,
  gender?: string
): string => {
  // Step 1 options (types and gender) are unisex
  if (type === 'types' || type === 'gender') {
    return `/images/companions/${type}/${id}.webp`;
  }
  
  // Personality is unisex
  if (type === 'personality') {
    return `/images/companions/${type}/${id}.webp`;
  }
  
  // Female-only options
  if (type === 'breast') {
    return `/images/companions/body/${type}/${id}.webp`;
  }
  
  // Face-related options with gender variations
  if (type === 'eyes' || type === 'hair-color' || type === 'hair-style') {
    return `/images/companions/face/${type}/${gender || 'female'}/${id}.webp`;
  }
  
  // Body-related options with gender variations
  if (type === 'body-shape' || type === 'butt') {
    return `/images/companions/body/${type === 'body-shape' ? 'shape' : type}/${gender || 'female'}/${id}.webp`;
  }
  
  // Age and ethnicity
  return `/images/companions/${type}/${gender || 'female'}/${id}.webp`;
};

/**
 * Get a gender-specific image URL
 * @param baseUrl Base image URL
 * @param gender Selected gender
 * @returns Modified URL with gender suffix
 */
export const getGenderSpecificImage = (baseUrl: string, gender?: string): string => {
  return `${baseUrl}${gender ? `_${gender}` : ''}`;
};

/**
 * Filter options based on selected gender
 * @param options Array of options to filter
 * @param gender Selected gender
 * @param optionType Type of options being filtered
 * @returns Filtered array based on gender
 */
export const getGenderFilteredOptions = (
  options: any[], 
  gender?: string, 
  optionType?: 'ethnicity' | 'hair-style'
): any[] => {
  if (!gender) return options;
  
  // Filter ethnicity options - Latina only for female, etc.
  if (optionType === 'ethnicity') {
    return options.filter(option => {
      if (gender === 'female' && option.id === 'latina') return true;
      if (gender === 'male' && option.id === 'latina') return false;
      return true;
    });
  }
  
  // Filter hair style options - some styles may be gender-specific
  if (optionType === 'hair-style') {
    return options.filter(option => {
      if (gender === 'male' && ['pixie-cut', 'high-ponytail'].includes(option.id)) return false;
      return true;
    });
  }
  
  return options;
};

/**
 * Update preview parameters based on form selections
 * @param selections Object containing all form selections
 * @returns Array of parameter strings for preview image URL
 */
export const getPreviewParams = (selections: {
  gender?: string;
  age?: string;
  ethnicity?: string;
  eyeColor?: string;
  hairColor?: string;
  hairStyle?: string;
  bodyShape?: string;
  breastSize?: string;
  buttSize?: string;
}): string[] => {
  const params: string[] = [];
  const { 
    gender, age, ethnicity, eyeColor, hairColor, 
    hairStyle, bodyShape, breastSize, buttSize 
  } = selections;

  if (gender) params.push(`gender=${gender}`);
  if (age) params.push(`age=${age}`);
  if (ethnicity) params.push(`ethnicity=${ethnicity}`);
  
  // Add face attributes
  if (eyeColor) params.push(`eyeColor=${eyeColor}`);
  if (hairColor) params.push(`hairColor=${hairColor}`);
  if (hairStyle) params.push(`hairStyle=${hairStyle}`);
  
  // Add body attributes
  if (bodyShape) params.push(`bodyShape=${bodyShape}`);
  if (gender === 'female' && breastSize) params.push(`breastSize=${breastSize}`);
  if (buttSize) params.push(`buttSize=${buttSize}`);
  
  return params;
}; 