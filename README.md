# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Troubleshooting / Known Issues

### CUDA / GPU Acceleration Issues (faster-whisper)

**Problem**: 
When running the Speech-to-Text (STT) feature, you might encounter issues where `faster-whisper` falls back to the CPU instead of using the GPU, or fails to find the correct CUDA libraries. By default, package managers might fetch the CPU-only version of PyTorch on Windows.

**Solution**: 
To ensure the backend uses GPU acceleration, the PyTorch CUDA 12.8 wheel index is explicitly defined in `src-backend/pyproject.toml`. When using `uv` to install dependencies, it will fetch the correct GPU-enabled version.

If you are setting this up from scratch or encountering CUDA errors, make sure your `src-backend/pyproject.toml` includes:

```toml
[tool.uv.sources]
torch = [{ index = "pytorch-cu128" }]

[[tool.uv.index]]
name = "pytorch-cu128"
url = "https://download.pytorch.org/whl/cu128"
explicit = true
```

*Note: If you still encounter DLL load errors (e.g., `cublas64_12.dll` not found), ensure that you have the appropriate NVIDIA CUDA 12 toolkit installed on your Windows system and that its `bin` directory is in your system `%PATH%`.*
