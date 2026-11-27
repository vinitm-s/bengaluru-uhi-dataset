# Bengaluru Urban Heat Island (UHI) Landsat 8 Dataset Export Script

Google Earth Engine (GEE) JavaScript pipeline used to acquire and export the co-registered optical RGB and thermal Land Surface Temperature (LST) rasters for the study:

> **Benchmarking Compact CNN and Lightweight U-Net Architectures for RGB-Based Urban Heat Island Prediction in Bengaluru**  

## Acquisition & Raster Specifications

* **Script:** `gee_export_bengaluru_2024.js`
* **Satellite Collection:** USGS Landsat 8 Collection 2 Tier 1 Level-2 (`LANDSAT/LC08/C02/T1_L2`)
* **Study Area:** 20 km buffer bounding box centered on Bengaluru (`77.5946°E, 12.9716°N`)
* **Temporal Window & Filtering:** Median composite from `2024-01-01` to `2024-04-01` with `< 5%` scene cloud cover
* **Spatial Grid & Resolution:** `1,336 × 1,363` pixels at `30 m` spatial resolution

## Exported GeoTIFF Files

1. **`Bengaluru_Visual_2024.tif`** — 3-band optical RGB surface reflectance composite (`SR_B4`, `SR_B3`, `SR_B2`).
2. **`Bengaluru_Thermal_2024.tif`** — Single-band thermal Land Surface Temperature target derived from `ST_B10` and radiometrically calibrated to degrees Celsius (`ST_B10 × 0.00341802 + 149.0 − 273.15`), spanning `25.87°C` to `56.68°C`.

## Usage

Open [Google Earth Engine Code Editor](https://code.earthengine.google.com/), paste the contents of `gee_export_bengaluru_2024.js`, click **Run**, and trigger both GeoTIFF export tasks in the **Tasks** tab to save the rasters to Google Drive.

## Modeling & Benchmark Summary

To prevent spatial autocorrelation leakage, the co-registered `1,336 × 1,363` rasters were partitioned along strict horizontal latitude rows into spatially disjoint northern training (`198` patches), central validation (`18` patches), and southern testing (`18` patches) subsets (`256 × 256` pixels, stride `64`), with Min-Max normalization bounds computed strictly on the training partition.

All neural models were trained in PyTorch for `40` epochs across three random seeds (`42`, `123`, and `999`) using minimum-validation-loss checkpointing:

| Model | Parameters | Normalized RMSE | Physical MAE (°C) | R² Score | Key Takeaway |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Training-Mean Baseline** | 0 | `0.10531` | `2.61°C` | `-0.46553` | Static pixel-wise training average |
| **Compact 4-Layer Sequential CNN** | 150,017 | `0.05767 ± 0.00212` | `1.36°C ± 0.05°C` | `0.56008 ± 0.03245` | Highest overall R² and lowest temperature error |
| **Lightweight U-Net** | 488,001 | `0.06234 ± 0.00056` | `1.49°C ± 0.01°C` | `0.48662 ± 0.00895` | `0.779 ms/patch` inference; ~4× lower cross-seed variance and sharper urban boundaries |

## Code Availability

The full PyTorch model architectures, training loops, and evaluation pipelines are maintained in a private repository while the accompanying manuscript is under peer review. Happy to walk through the complete codebase and experimental setup during technical interviews.
