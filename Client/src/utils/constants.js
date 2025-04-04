// Color mappings for product colors
export const COLOR_MAP = {
  Blue: "#A1B7DA",
  White: "#FFFFFF",
  Black: "#000000",
  Gray: "#808080",
  Cream: "#F5F5DC",
  Red: "#FF0000",
  Pink: "#FFC0CB",
  Yellow: "#FFFF00",
  Green: "#008000",
  Purple: "#800080",
  Brown: "#A52A2A",
  Orange: "#FFA500",
  Navy: "#000080",
  // Add more colors as needed
};

// Function to get color hex value from color name
export const getColorHexValue = (colorName) => {
  return COLOR_MAP[colorName] || colorName; // Return the color name itself if not found in map
};
