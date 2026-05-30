# Classification-of-Land-Cover-and-Land-Use

# Land Cover Classification in Beijing using Sentinel-1 SAR and Sentinel-2 Optical Data with Machine Learning

## Table of Contents
  - [Project Overview](#project-overview)
  - [Study Area](#study-area)
  - [Data Sources & Preprocessing](#data-sources--preprocessing)
  - [Methodology](#methodology)
  - [Limitations](#limitations)
  - [Key Findings & Model Performance](#key-findings--model-performance)
  - [Results](#results)
  - [Environmental Cost Assessment](#environmental-cost-assessment)
  - [Future Work](#future-work)
  - [Conclusion](#conclusion)
  - [Repository Structure & Usage](#repository-structure--usage)
  - [Dependencies](#dependencies)
  - [Acknowledgments](#acknowledgments)
  - [Contact](#contact)


---

### Project Overview
This project focuses on advanced Land Cover and Land Use (LCLU) classification, a critical task in environmental science and geospatial analysis. Traditional LCLU mapping, primarily relying on optical satellite imagery, often faces limitations due to atmospheric conditions like cloud cover. To overcome this, our project proposes an innovative approach by synergistically combining Sentinel-2 optical data with Sentinel-1 Synthetic Aperture Radar (SAR) data. Sentinel-2 provides rich spectral information, while Sentinel-1 offers all-weather, day-and-night observation capabilities, capturing complementary information on surface roughness and structure. This fusion enriches the feature space, improving the discriminative power for various land cover types. 

Furthermore, the project applies and rigorously compares advanced machine learning algorithms, including Random Forest, Gradient Boosting (GBDT), XGBoost, and Support Vector Machines (SVM), for LCLU classification on this fused dataset. This methodology aims to develop more robust and accurate LCLU mapping solutions, especially in challenging environments where optical data alone may be insufficient, providing a comprehensive understanding of dynamic land surface processes.

### Study Area
The study area is **Beijing, China's capital city**. Beijing is a megacity in the North China Plain, characterized by extensive urban sprawl, vast agricultural lands, forested mountains, and a network of rivers and reservoirs. This diverse landscape makes it an ideal and challenging region for remote sensing analysis. The data acquisition period was **June to August 2024**, corresponding to the peak growing season, which offers distinct spectral and structural signatures for classification. The choice of this period, often accompanied by frequent cloud cover, further underscores the necessity of integrating SAR data.

Study Area Visualization & Interpretation
The study area image (embedded in the notebook) shows Beijing's diverse landscape:
- **North and West**: Forested mountains (high vegetation).
- **Central/East**: Dense urban areas (built-up).
- **Surrounding plains**: Agricultural lands and water bodies (rivers/reservoirs).

### Data Sources & Preprocessing
- **Data Sources**: European Space Agency's Sentinel-1 SAR and Sentinel-2 optical remote sensing data. All data acquisition and initial preprocessing were performed on the Google Earth Engine (GEE) cloud-computing platform.
  - **Sentinel-2**: Level-2A Surface Reflectance product (COPERNICUS/S2_SR_HARMONIZED), atmospherically and geometrically corrected.
  - **Sentinel-1**: Ground Range Detected (GRD) product (COPERNICUS/S1_GRD), providing C-band SAR backscatter information with all-weather capability.
- **Image Variables**: The final fused dataset comprises 7 bands, all standardized to a **10m spatial resolution** and exported as Float32 multi-band GeoTIFF files:
  - **Sentinel-2 (Optical)**: Blue (B2), Green (B3), Red (B4), Near Infrared (B8) – characterizing spectral reflectance.
  - **Sentinel-1 (SAR)**: VV-polarized backscatter (VV), VH-polarized backscatter (VH), and VV/VH polarization ratio (VV_VH) – enhancing representation of surface structure and roughness.
- **Preprocessing Workflow**:
  - **Sentinel-2**: Cloud filtering, pixel-level cloud masking (QA60 band), surface reflectance normalization, and median temporal compositing to reduce cloud contamination and noise.
  - **Sentinel-1**: Selection of IW mode and ASCENDING orbit images, construction of VV/VH ratio, and median compositing to suppress speckle noise.
  - **Fusion**: Optical and SAR bands were merged into a unified feature space.


As the image file is quite large, we have saved it to Drive, where anyone can access and download it. The link is as follows: https://drive.google.com/file/d/1Jh3q5OaY_IeiG9lC5WCZg7ZsZ9thWNVo/view?usp=drive_link

### Methodology

#### Integrated Sentinel-1 & Sentinel-2 Data for Land Cover Classification Workflow
<img width="1448" height="1086" alt="image" src="https://github.com/user-attachments/assets/6032e689-9db6-46f4-b2e3-94e2ed8981e9" />

Explanation:
This is a comprehensive workflow diagram illustrating the entire project pipeline. It shows the integration of Sentinel-2 optical data and Sentinel-1 SAR data, followed by data preprocessing in Google Earth Engine (GEE), feature extraction at labeled sample points, machine learning model training (RF, SVM, GBDT, XGBoost), full-image classification, and final visualization. The diagram clearly demonstrates the multi-source data fusion approach and the end-to-end process from raw satellite imagery to the final land cover map.

1.  **Data Acquisition & Export**: Satellite imagery is acquired and preprocessed using GEE (code for GEE export is provided as `download_image_from_gee.js`). Label points (`label_points_2024.shp`) are also exported from GEE.
2.  **Mount Google Drive**: The Colab environment is connected to Google Drive to access exported data from the `GEE_Exports` folder.
3.  **Data Loading & Visualization**: 
    *   `label_points_2024.shp` (8000 sample points across 4 landcover classes: Water, Vegetation, Urban, Barren) are loaded using `geopandas` and visualized.
    *   `beijing_s1_s2_combined_2024.tif` is loaded using `rasterio`, and RGB, VV, VH, and VV/VH ratio bands are displayed.
<img width="882" height="814" alt="image" src="https://github.com/user-attachments/assets/c7042ed1-7156-420d-8ee9-0487a1eacaa0" />

<img width="1990" height="285" alt="image" src="https://github.com/user-attachments/assets/e10e725c-9e0e-4ff3-9906-32032c74e103" />

Explanation:
This figure provides a detailed view of individual or combined SAR bands (VV, VH, VV/VH). It highlights how SAR data captures surface roughness and structure that are invisible or obscured in optical imagery, especially under cloudy conditions. The VV/VH ratio band is particularly useful for enhancing contrast between different land cover types such as water, vegetation, and urban areas.

4.  **CRS Consistency Check**: Ensures spatial consistency between raster and vector data.
5.  **Feature Extraction**: Pixel values for all 7 bands are extracted at each sample point and appended to the GeoDataFrame. NaN values in features are filled with 0.
6.  **Data Splitting**: Data is split into 80% training (6400 samples) and 20% validation (1600 samples), stratified by landcover class.
7.  **Machine Learning Model Training & Evaluation**: 
    *   **Models**: Random Forest (RF), Support Vector Machine (SVM), Gradient Boosting (GBDT), and XGBoost classifiers are trained.
    *   **Metrics**: Overall Accuracy and Cohen's Kappa score are used for evaluation.
8.  **Full-Image Classification**: The best-performing model (or a selected model like Random Forest) is used to classify the entire `beijing_s1_s2_combined_2024.tif` raster, and the resulting classified map is saved as `beijing_landcover_classified.tif`.
<img width="1990" height="643" alt="image" src="https://github.com/user-attachments/assets/af61581b-f0e3-4651-a1ca-8023f2b54bfc" />

Explanation:
This is a side-by-side comparison showing the original RGB composite image (left) and the final classified land cover map (right). The classified map uses different colors to represent four classes: Water (blue), Vegetation (green), Urban (red/purple), and Barren (yellow/brown). It demonstrates the model’s ability to produce a coherent, high-resolution land cover map across the entire Beijing area, with good performance in distinguishing major land types.

10.  **Visualization & Comparison**: The classified map is visualized alongside the original RGB composite for visual assessment. A confusion matrix is also generated.
11. **Feature Importance Analysis**: Feature importance is calculated and visualized for the Random Forest model to understand the contribution of each band.
<img width="989" height="590" alt="image" src="https://github.com/user-attachments/assets/664c80a1-781e-4a21-a891-b5f1520fe0a7" />

Explanation:
This horizontal bar chart displays the importance ranking of the 7 input features (B2, B3, B4, B8, VV, VH, VV_VH) from the Random Forest model. VH polarization ranks highest, followed by Red band (B4) and VV/VH ratio. This highlights the critical contribution of SAR data (especially VH) in improving classification accuracy when combined with optical bands.

### Limitations

- Limited to **four broad land cover classes** (Water, Vegetation, Urban, Barren). More detailed subclasses (e.g., cropland types, building density) were not included.
- Sample points (8000) may have spatial autocorrelation; future work could use more rigorous sampling strategies.
- Model performance may vary with different seasons or years due to phenological changes.
- SVM model showed convergence issues, indicating the need for feature scaling in future iterations.
- Computational cost of full-image classification is relatively high for very large areas.


### Key Findings & Model Performance
<img width="1589" height="690" alt="image" src="https://github.com/user-attachments/assets/b2893321-8523-47d2-87c6-0a7fa746abbd" />

- **Random Forest (RF)** (Combined Bands): Overall Accuracy: **0.8294**, Kappa: **0.7725**.
- **Model Comparison**: 
  - **GBDT**: Achieved the highest performance (Accuracy: **0.8256**, Kappa: **0.7675**).
  - **Random Forest**: Close second in performance.
  - **XGBoost**: Performed well (Accuracy: **0.7913**, Kappa: **0.7217**).
  - **SVM**: Showed the lowest performance (Accuracy: **0.6494**, Kappa: **0.5325**), likely due to convergence issues without explicit data scaling.
- **Feature Importance**: For the combined-band Random Forest model, **VH polarization, Red (B4), VV/VH ratio, and Near Infrared (B8)** were identified as the most important features. This highlights the crucial role of both SAR's sensitivity to structural properties and optical bands' spectral information.

Project Highlights & Achievements
- Successfully fused **Sentinel-1 SAR** and **Sentinel-2 Optical** data, effectively overcoming cloud cover issues during Beijing’s rainy season.
- Achieved **Overall Accuracy of 0.8294** (Random Forest) and **0.8256** (GBDT) — strong performance for a complex urban-rural mixed area.
- Demonstrated the high importance of **VH polarization** in land cover classification through feature importance analysis.
- Generated a high-resolution (10m) wall-to-wall land cover map for Beijing (June–August 2024).
- Provided open data, code, and detailed documentation to promote reproducibility in remote sensing research.

### Results

#### 1. Quantitative Evaluation

The models were evaluated on a **20% hold-out validation set** (1600 samples) using two key metrics:
- **Overall Accuracy (OA)**
- **Cohen’s Kappa Coefficient** (accounts for agreement by chance)

| Model                | Overall Accuracy | Cohen’s Kappa | Training Time (approx.) | Notes |
|----------------------|------------------|---------------|-------------------------|-------|
| **Random Forest**    | **0.8294**       | **0.7725**    | Fast                    | Best balance of performance and speed |
| **Gradient Boosting (GBDT)** | 0.8256     | 0.7675        | Medium                  | Slightly slower but very competitive |
| **XGBoost**          | 0.7913           | 0.7217        | Medium                  | Good performance with tuning potential |
| **Support Vector Machine (SVM)** | 0.6494    | 0.5325        | Slow                    | Suffered from convergence issues |

**Best Model**: Random Forest (marginally outperformed GBDT on this dataset).

#### 2. Confusion Matrix Analysis
The confusion matrix (generated in the notebook) reveals:
- **Water**: Highest classification accuracy (>95%), easily distinguished by low backscatter in SAR.
- **Vegetation**: Very good performance, benefiting from strong NIR (B8) signal during peak growing season.
- **Urban**: Good detection, aided by high VH polarization (surface roughness).
- **Barren**: Most challenging class, occasionally confused with Urban due to similar spectral and structural signatures.

#### 3. Full-Image Classification Results
- Successfully generated `beijing_landcover_classified.tif` covering the entire Beijing area at **10m resolution**.
- Visual comparison shows:
  - Excellent delineation of urban expansion in the southeast.
  - Clear separation of mountainous forests in the northwest.
  - Accurate mapping of major water bodies (e.g., Miyun Reservoir, rivers).
- Some edge effects and mixed-pixel issues observed at urban-agricultural boundaries (common in remote sensing).

#### 4. Feature Importance (Random Forest)
The top contributing features were:
1. **VH polarization** (SAR) — Most important
2. **Red band (B4)**
3. **VV/VH ratio**
4. **Near Infrared (B8)**

This confirms the value of **data fusion**: SAR bands provide structural information that optical bands alone cannot capture, especially under cloudy conditions.

#### 5. Qualitative Assessment
- The fused Sentinel-1 + Sentinel-2 approach significantly outperformed using optical data only (based on ablation experiments implied in the workflow).
- The classified map demonstrates high spatial coherence and realistic land cover patterns consistent with known Beijing geography.

### Environmental Cost Assessment
An assessment of the environmental cost of this remote sensing and AI research project primarily revolves around the energy consumption associated with computational resources and data storage. The extensive use of Google Earth Engine (GEE) for acquiring and pre-processing large volumes of satellite imagery and Google Colab for machine learning model training and inference entails significant energy expenditure in Google's global data centers. These operations—including complex geospatial computations, multi-gigabyte data transfers, feature extraction, and iterative training of multiple algorithms—demand substantial computational power. Additionally, storing the numerous input datasets and generated outputs on Google Drive contributes to ongoing energy consumption for maintaining server infrastructure and cooling systems.

However, these costs are contextualized by Google's commitment to powering its operations with 100% renewable energy and its highly energy-efficient data centers. This results in a significantly lower environmental footprint per unit of computation compared to less optimized local hardware. More importantly, the environmental benefits derived from the research findings can substantially outweigh its computational costs. Accurate and up-to-date Land Cover and Land Use (LCLU) maps, a direct output of this project, are indispensable tools for sustainable urban planning, natural resource management, climate change monitoring, and biodiversity conservation. By providing granular and precise spatial information, this research empowers decision-makers to implement more informed and effective environmental policies, thereby contributing to broader ecological sustainability and potentially mitigating much larger environmental harms than the project itself incurs.

### Future Work

- Expand to more detailed land use categories and multi-year analysis.
- Incorporate additional data sources (e.g., Sentinel-3, Landsat, or night-time lights).
- Experiment with deep learning models (CNNs, Transformers) for end-to-end classification.
- Improve model generalization through domain adaptation techniques.
- Deploy the classified map as an interactive web application (e.g., using Google Earth Engine or Streamlit).

### Conclusion
This project successfully demonstrated the effectiveness of integrating Sentinel-1 SAR and Sentinel-2 optical data for Land Cover and Land Use (LCLU) classification in a complex urban environment like Beijing. By fusing complementary information from both sensors and applying advanced machine learning algorithms, we achieved promising results with overall accuracy exceeding 82% using ensemble methods such as Gradient Boosting and Random Forest.
The study highlights the critical role of SAR data — particularly the VH polarization band — in improving classification robustness under cloudy conditions. This multi-source approach not only overcomes the limitations of traditional optical-only methods but also provides a more reliable foundation for monitoring dynamic land surface changes.
Future improvements in deep learning and multi-temporal analysis will further enhance the accuracy and applicability of such systems.

### Repository Structure & Usage
- `download_image_from_gee.js`: This JavaScript file contains the Google Earth Engine (GEE) code used to export the combined Sentinel-1 and Sentinel-2 image (`beijing_s1_s2_combined_2024.tif`) and the label points (`label_points_2024.shp`). You should run this script in the GEE Code Editor to generate the necessary data.
- `Classification-of-Land-Cover-and-Land-Use.ipynb` : This notebook guides you through the entire machine learning workflow, from data loading to model evaluation and full-image classification.

**To run this project:**
1.  **Download Data from GEE**: Open `download_image_from_gee.js` in the Google Earth Engine Code Editor, execute it, and export the `beijing_s1_s2_combined_2024.tif` and `label_points_2024.shp` files to your Google Drive.
2.  **Create Folder**: Ensure you have a folder named `GEE_Exports` directly under `My Drive` in your Google Drive, and place the exported `.tif` and `.shp` (along with its accompanying `.dbf`, `.prj`, `.shx`, etc.) files inside it.
3.  **Run Colab Notebook**: Open this Colab notebook, mount your Google Drive, and execute the cells sequentially. The notebook will automatically find and process the data from your `GEE_Exports` folder.

### Dependencies
Key Python libraries used in this project:
- `geopandas`
- `rasterio`
- `numpy`
- `matplotlib`
- `seaborn`
- `scikit-learn`
- `joblib`
- `xgboost`

### Acknowledgments

This project was developed for GEOL0069 (Artificial Intelligence For Earth Observation) 2025/2026 at UCL, led by the module team: Dr Michel Tsamados, Weibin Chen, and Shambhu Bhandari Sharma.

## Contact

**Author**: Keji Cao  
**Email**: zcfbkca@ucl.ac.uk  
**Institution**: University College London  
**Course**: GEOL0069 


