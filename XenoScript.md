# XenoScript

> **"Deterministic, compile-time sandboxed scripting built for absolute modding safety and performance."**

**XenoScript** is a proprietary scripting framework and virtual bytecode machine written entirely in **pure C**. Developed from the ground up specifically for the **Damascus Engine**, XenoScript provides a high-performance, secure modding pipeline that enables creators to extend gameplay mechanics, write custom quests, and author complex world systems without compromising engine stability or security.

---

## Architectural Highlights

### 🛡️ Compile-Time Sandboxed Execution
* **Strict Safety Boundaries:** Enforces memory and resource limits at compile time, ensuring modder-written scripts cannot crash the host process, leak memory, or breach host security.
* **Zero Native Pointer Exposure:** Protects core engine state by managing all object and system references through a tightly controlled VM register interface.

### ⚡ Pure C Bytecode Engine
* **Minimal Memory Overhead:** Engineered without heavy external runtimes or unpredictable garbage collection pauses, delivering predictable, lightweight VM performance.
* **Seamless Tooling Integration:** Hooks natively into the **Steel Editor Suite**, supporting rapid iteration and live script debugging.

### ⏱️ Deterministic State Synchronization
* **Multiplayer-Safe Logic:** Executes in complete lockstep with Damascus' 3D tile grid and system matrix, guaranteeing deterministic results across client sessions and multiplayer servers.
* **Execution Budgets:** Imposes bounded instruction limits per tick to prevent script-induced framerate stutters or infinite execution loops.

---

## Modding Capability in Glyphborn

XenoScript serves as the primary gateway for community extensibility in *Glyphborn*:

* **Systems & Mechanics:** Script custom combat techniques, survival rules, crafting algorithms, and trade logic.
* **Dynamic Content & Quests:** Author intricate dialogue structures, regional events, local law enforcement triggers, and Seer vision sequences.
* **World Expansion:** Create custom content bundles that hook directly into Damascus' regional and local tileset streaming systems.

---

### Resources & Technical Deep Dives
* 🛠️ **<a href="#" data-file="SteelEditorSuite.md">Steel Editor Suite Overview</a>**
* 🌐 **<a href="#" data-file="Damascus.md">Damascus Engine Architecture</a>**
* ⚔️ **[Glyphborn Modding Documentation]()**