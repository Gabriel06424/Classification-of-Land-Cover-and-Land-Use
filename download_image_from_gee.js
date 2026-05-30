// ======================================================
// 1. ROI
// ======================================================

var roi = ee.FeatureCollection(
    'FAO/GAUL_SIMPLIFIED_500m/2015/level2')
    .filter(ee.Filter.eq('ADM1_NAME', 'Beijing Shi'))
    .first()
    .geometry();


// ======================================================
// 2. Time Range
// ======================================================

var start_date = '2024-06-01';
var end_date   = '2024-08-31';


// ======================================================
// 3. Band Settings
// ======================================================

var s2_bands = ['B2', 'B3', 'B4', 'B8'];


// ======================================================
// 4. Sentinel-2 Cloud Mask Function
// ======================================================

function maskS2Clouds(image) {

  // QA60 band
  var qa = image.select('QA60');

  // Bit masks
  var cloudBitMask  = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Cloud mask
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(
          qa.bitwiseAnd(cirrusBitMask).eq(0)
      );

  return image
      .updateMask(mask)
      .divide(10000)
      .copyProperties(
          image,
          ['system:time_start']
      );
}


// ======================================================
// 5. Sentinel-2 Processing
// ======================================================

var img_s2 = ee.ImageCollection(
    'COPERNICUS/S2_SR_HARMONIZED')

    .filterBounds(roi)

    .filterDate(
        start_date,
        end_date
    )

    .filter(
        ee.Filter.lt(
            'CLOUDY_PIXEL_PERCENTAGE',
            20
        )
    )

    .map(maskS2Clouds)

    .median()

    .select(s2_bands)

    .clip(roi);


// ======================================================
// 6. Sentinel-1 Processing
// ======================================================

var img_s1_col = ee.ImageCollection(
    'COPERNICUS/S1_GRD')

    .filterBounds(roi)

    .filterDate(
        start_date,
        end_date
    )

    .filter(
        ee.Filter.eq(
            'instrumentMode',
            'IW'
        )
    )

    .filter(
        ee.Filter.eq(
            'orbitProperties_pass',
            'ASCENDING'
        )
    )

    .filter(
        ee.Filter.listContains(
            'transmitterReceiverPolarisation',
            'VV'
        )
    )

    .filter(
        ee.Filter.listContains(
            'transmitterReceiverPolarisation',
            'VH'
        )
    );


// Median SAR composite
var img_s1 = img_s1_col
    .median()
    .clip(roi);


// ======================================================
// 7. SAR Ratio Feature
// ======================================================

// VV / VH ratio
var vv_vh_ratio = img_s1
    .select('VV')
    .divide(
        img_s1.select('VH')
    )
    .rename('VV_VH');


// Final S1 image
img_s1 = img_s1
    .select(['VV', 'VH'])
    .addBands(vv_vh_ratio);


// ======================================================
// 8. S1 + S2 Fusion
// ======================================================

var img_combined = img_s2

    .addBands(img_s1)

    .clip(roi)

    // IMPORTANT:
    // unify band datatype
    .toFloat();


// ======================================================
// 9. Check Band Types
// ======================================================

print(
    'Band Types:',
    img_combined.bandTypes()
);


// ======================================================
// 10. Visualization
// ======================================================

// RGB visualization
var vis_rgb = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3
};


// SAR visualization
var vis_sar = {
  min: -20,
  max: 5
};


Map.centerObject(roi, 9);


// Sentinel-2 RGB
Map.addLayer(
    img_s2,
    vis_rgb,
    'Sentinel-2 RGB'
);


// Sentinel-1 VV
Map.addLayer(
    img_s1.select('VV'),
    vis_sar,
    'Sentinel-1 VV'
);


// Combined image
Map.addLayer(
    img_combined,
    vis_rgb,
    'Combined Image'
);


// ROI boundary
Map.addLayer(
    roi,
    {},
    'ROI'
);


// ======================================================
// 11. Export Combined Image to Google Drive
// ======================================================

Export.image.toDrive({

  // image to export
  image: img_combined,

  // task name
  description:
      'Beijing_S1_S2_Combined_2024',

  // Google Drive folder
  folder:
      'GEE_Exports',

  // output filename
  fileNamePrefix:
      'beijing_s1_s2_combined_2024',

  // export region
  region: roi,

  // spatial resolution
  scale: 10,

  // CRS
  crs: 'EPSG:4326',

  // avoid pixel limit error
  maxPixels: 1e13,

  // output format
  fileFormat: 'GeoTIFF'
});
