// ==========================================
// STEP 1: INITIALIZE AND VIEW THE MAPS
// ==========================================

// 1. Define the center point of Bengaluru
var bengaluru = ee.Geometry.Point([77.5946, 12.9716]);

// 2. Load Landsat 8 Data (January to April 2024 to avoid monsoon clouds)
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(bengaluru)
    .filterDate('2024-01-01', '2024-04-01')
    .filter(ee.Filter.lt('CLOUD_COVER', 5)); // Only clear, cloud-free days

// 3. Create a single, clean mosaic image from the time period
var image = dataset.median();

// 4. Select the Visual Bands (Red, Green, Blue) -> This is your 'X' input for the AI
var rgb = image.select(['SR_B4', 'SR_B3', 'SR_B2']); 

// 5. Select the Thermal Band -> This will be used for your 'Y' target labels
var thermal = image.select('ST_B10'); 

// 6. Convert the raw thermal data into actual Celsius
var celsius = thermal.multiply(0.00341802).add(149.0).subtract(273.15);

// 7. Display the layers on your screen to inspect them
Map.centerObject(bengaluru, 11);
Map.addLayer(rgb, {min: 7000, max: 12000}, 'Bengaluru Visual');
Map.addLayer(celsius, {min: 25, max: 45, palette: ['blue', 'green', 'yellow', 'red']}, 'Bengaluru Heat Map');


// ==========================================
// STEP 2: EXPORT THE MAP FILES TO GOOGLE DRIVE
// ==========================================

// Export the Visual Image (X) 
Export.image.toDrive({
  image: rgb,
  description: 'Bengaluru_Visual_2024',
  folder: 'UHI_Project',
  region: bengaluru.buffer(20000).bounds(), // Captures the core city and outskirts
  scale: 30, // 30-meter spatial resolution (Landsat standard)
  maxPixels: 1e10
});

// Export the Heat Map (Y)
Export.image.toDrive({
  image: celsius,
  description: 'Bengaluru_Thermal_2024',
  folder: 'UHI_Project',
  region: bengaluru.buffer(20000).bounds(),
  scale: 30,
  maxPixels: 1e10
});