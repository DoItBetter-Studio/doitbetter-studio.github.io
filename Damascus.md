# Damascus Engine

> **"Built from the ground up for maximum control, deterministic performance, and zero bloat."**

**Damascus** is a custom, low-level 3D game engine written in **pure C** and **OpenGL**. Designed specifically to power *Glyphborn* and its supporting tools, Damascus rejects heavy commercial framework bloat in favor of manual memory management, explicit cache-friendly data structures, and total runtime control.

---

## Architectural Highlights

### ⚡ Pure C & Modern OpenGL Core
* **Zero Engine Overhead:** Built without massive third-party abstractions, ensuring instant boot times, minimal memory footprints, and raw hardware efficiency.
* **Deterministic Execution:** Built around deterministic state updates, making multiplayer synchronization, 3D tile resolution, and system simulation rock-solid.

### 🌐 Dynamic World & Chunk Streaming
* **Massive Spatial Bounds:** Engineered to process massive matrix layouts (such as *Glyphborn's* 768×384 chunk system) through binary caching pipelines.
* **Seamless Streaming:** Dynamically loads and unloads map chunks in real-time, eliminating traditional loading screens across vast continental geographies.

### 📐 True 3D Tile & Voxel Trajectory Pipeline
* **Spatial 3D Tile Resolution:** Blends classic grid-based movement with full 3D spatial awareness—handling multi-layer elevation, vertical slopes, and 3D directional cones.
* **Voxel Trajectory Tracing:** Projectiles and line-of-sight checks step tile-by-tile through 3D space using fast voxel-style raycasting rather than expensive physics hitboxes.

---

## Unified Studio Ecosystem

Damascus isn't just an engine—it is the hub for DoItBetter Studio's entire software pipeline:

* **Steel Editor Suite Integration:** Interfaces natively with custom-built tools for map design, asset packing, UI layout, and animation pipelines.
* **Native XenoScript Virtual Machine:** Houses an embedded, compile-time sandboxed bytecode runner to execute modding logic safely and efficiently without compromising engine stability.

---

## Philosophy: Why Build Custom?

Commercial off-the-shelf engines come with unnecessary bloat, unpredictable licensing models, and restrictive architectural assumptions. **Damascus** was built to guarantee 100% ownership over every system, allowing the game, tools, and engine to evolve in complete lockstep.

---

### Resources & Technical Deep Dives
* 🛠️ **[Steel Editor Suite Overview]()**
* 📜 **[XenoScript Bytecode Specification]()**
* ⚔️ **[Glyphborn Integration Details]()**