# Premium Ad Video Pipeline (Apple-Style)

This document outlines the technology stack and workflow used to generate high-quality, "Apple-style" advertisement videos for the application.

## 🏗 Tech Stack

### Core (JavaScript/TypeScript)
- **Playwright**: Used for browser automation, high-fidelity rendering, and frame-by-frame capture. It drives the Electron app to simulate user interactions.
- **Electron**: The application runtime. We launch the actual app in a controlled environment to capture authentic UI.
- **Sharp**: Node.js image processing library. Used for resizing, cropping, and potentially adding overlays (watermarks, text) to the raw frames.
- **Fluent-FFmpeg**: (Requires FFmpeg installed) Node.js wrapper for FFmpeg to stitch frames into MP4 videos.

### Asset Generation
- **Director Script** (`scripts/take-screenshots.js`): A custom automation script that acts as a "Director".
    - **Scene Management**: Orchestrates distinct scenes (Dashboard, Orders, etc.).
    - **Actor Simulation**: Simulates human-like mouse movements (bezier curves/easing) and typing (character-by-character with delays).
    - **Frame Capture**: Captures a sequence of PNG frames at ~30fps equivalent steps to create smooth video assets.

### Video Production (Post-Processing)
- **FFmpeg**: The industry-standard tool for video encoding.
    - **Stitching**: Converts `frame-xxxx.png` sequences into `.mp4`.
    - **Effects**: Can handle fade-in/out, scaling, and overlays.
- **MoviePy (Python)**: *Optional alternative* for more complex non-linear editing if JS tools fall short on specific effects.

## 🎬 Workflow

1.  **Build the App**: Ensure the Electron main process and React renderer are built.
    ```bash
    npm run build
    ```

2.  **Generate Assets**: Run the Director script.
    ```bash
    npm run screenshots
    ```
    This will:
    - Launch the app in a clean state.
    - Execute defined scenes (`01_dashboard`, `02_orders`, etc.).
    - Generate thousands of frame images in `promo-assets/`.

3.  **Create Video**:
    (Requires FFmpeg installed on system)
    
    Run the following command in a scene directory to create a video clip:
    ```bash
    ffmpeg -framerate 30 -i frame-%04d.png -c:v libx264 -pix_fmt yuv420p out.mp4
    ```

    *Note: A future update can automate this step using `fluent-ffmpeg` within the script.*

## 🚀 Future Improvements
- **Motion Blur**: Add motion blur in post-processing (ffmpeg) to make mouse movements feel even smoother.
- **3D Transforms**: Use CSS/FFmpeg to add slight 3D tilts to the UI for that "floating screen" effect.
- **Automated Stitching**: Integrate FFmpeg calls directly into `scripts/take-screenshots.js`.


