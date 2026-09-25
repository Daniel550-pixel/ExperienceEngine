export type CodeLanguage = {
  id: string;
  name: string;
  family: string;
  extensions: string[];
  runtimes: string[];
  packageManagers: string[];
  paradigms: string[];
  strengths: string[];
};

export const CODE_LANGUAGE_LIBRARY: CodeLanguage[] = [
  { id: "typescript", name: "TypeScript", family: "JavaScript ecosystem", extensions: [".ts", ".tsx"], runtimes: ["Node.js", "Deno", "Bun", "browser"], packageManagers: ["npm", "pnpm", "yarn", "bun"], paradigms: ["multi-paradigm", "object-oriented", "functional"], strengths: ["web applications", "full-stack", "tooling", "APIs", "type-safe systems"] },
  { id: "javascript", name: "JavaScript", family: "JavaScript ecosystem", extensions: [".js", ".jsx", ".mjs", ".cjs"], runtimes: ["browser", "Node.js", "Deno", "Bun"], packageManagers: ["npm", "pnpm", "yarn", "bun"], paradigms: ["multi-paradigm", "event-driven", "functional"], strengths: ["web", "interactive UI", "servers", "automation"] },
  { id: "python", name: "Python", family: "Python ecosystem", extensions: [".py"], runtimes: ["CPython", "PyPy"], packageManagers: ["pip", "uv", "poetry", "conda"], paradigms: ["multi-paradigm", "object-oriented", "functional"], strengths: ["AI/ML", "data science", "automation", "scientific computing", "backend"] },
  { id: "java", name: "Java", family: "JVM", extensions: [".java"], runtimes: ["JVM"], packageManagers: ["Maven", "Gradle"], paradigms: ["object-oriented", "generic", "functional"], strengths: ["enterprise", "backend", "Android", "distributed systems"] },
  { id: "kotlin", name: "Kotlin", family: "JVM", extensions: [".kt", ".kts"], runtimes: ["JVM", "Android", "Kotlin/Native"], packageManagers: ["Gradle", "Maven"], paradigms: ["multi-paradigm", "object-oriented", "functional"], strengths: ["Android", "JVM backend", "multiplatform"] },
  { id: "scala", name: "Scala", family: "JVM", extensions: [".scala"], runtimes: ["JVM"], packageManagers: ["sbt", "mill", "Maven"], paradigms: ["functional", "object-oriented"], strengths: ["distributed data", "JVM systems", "Spark"] },
  { id: "groovy", name: "Groovy", family: "JVM", extensions: [".groovy"], runtimes: ["JVM"], packageManagers: ["Gradle", "Maven"], paradigms: ["dynamic", "object-oriented", "functional"], strengths: ["automation", "JVM scripting", "build systems"] },
  { id: "c", name: "C", family: "systems", extensions: [".c", ".h"], runtimes: ["native"], packageManagers: ["system package managers"], paradigms: ["procedural", "imperative"], strengths: ["embedded", "OS", "systems", "high-performance native code"] },
  { id: "cpp", name: "C++", family: "systems", extensions: [".cpp", ".cc", ".cxx", ".hpp"], runtimes: ["native"], packageManagers: ["CMake", "Conan", "vcpkg"], paradigms: ["multi-paradigm", "generic", "object-oriented"], strengths: ["games", "simulation", "embedded", "high-performance systems"] },
  { id: "csharp", name: "C#", family: ".NET", extensions: [".cs"], runtimes: [".NET"], packageManagers: ["NuGet", "dotnet CLI"], paradigms: ["multi-paradigm", "object-oriented", "functional"], strengths: ["enterprise", "games", "desktop", "backend", "Unity"] },
  { id: "fsharp", name: "F#", family: ".NET", extensions: [".fs", ".fsx"], runtimes: [".NET"], packageManagers: ["NuGet", "dotnet CLI"], paradigms: ["functional", "object-oriented"], strengths: ["data", "domain modeling", ".NET systems"] },
  { id: "go", name: "Go", family: "systems/cloud", extensions: [".go"], runtimes: ["native"], packageManagers: ["go modules"], paradigms: ["procedural", "concurrent"], strengths: ["cloud services", "networking", "CLI tools", "distributed systems"] },
  { id: "rust", name: "Rust", family: "systems", extensions: [".rs"], runtimes: ["native", "WASM"], packageManagers: ["Cargo"], paradigms: ["multi-paradigm", "ownership", "functional"], strengths: ["systems", "security", "performance", "WASM"] },
  { id: "swift", name: "Swift", family: "Apple", extensions: [".swift"], runtimes: ["Apple platforms", "Linux"], packageManagers: ["Swift Package Manager"], paradigms: ["multi-paradigm", "protocol-oriented"], strengths: ["iOS", "macOS", "Apple platform apps"] },
  { id: "objective-c", name: "Objective-C", family: "Apple", extensions: [".m", ".mm", ".h"], runtimes: ["Apple platforms"], packageManagers: ["CocoaPods", "Swift Package Manager"], paradigms: ["object-oriented", "procedural"], strengths: ["legacy Apple applications", "native APIs"] },
  { id: "dart", name: "Dart", family: "Flutter", extensions: [".dart"], runtimes: ["Dart VM", "native", "browser"], packageManagers: ["pub"], paradigms: ["object-oriented", "asynchronous"], strengths: ["Flutter", "cross-platform UI"] },
  { id: "ruby", name: "Ruby", family: "scripting/web", extensions: [".rb", ".rake"], runtimes: ["CRuby", "JRuby"], packageManagers: ["RubyGems", "Bundler"], paradigms: ["object-oriented", "functional", "metaprogramming"], strengths: ["web", "automation", "DSLs"] },
  { id: "php", name: "PHP", family: "web", extensions: [".php"], runtimes: ["PHP"], packageManagers: ["Composer"], paradigms: ["multi-paradigm", "object-oriented"], strengths: ["web backends", "CMS", "server-rendered applications"] },
  { id: "perl", name: "Perl", family: "scripting", extensions: [".pl", ".pm"], runtimes: ["Perl"], packageManagers: ["CPAN"], paradigms: ["multi-paradigm", "text processing"], strengths: ["text processing", "automation", "legacy systems"] },
  { id: "lua", name: "Lua", family: "embedded scripting", extensions: [".lua"], runtimes: ["Lua"], packageManagers: ["LuaRocks"], paradigms: ["procedural", "functional", "table-oriented"], strengths: ["embedded scripting", "games", "configuration"] },
  { id: "r", name: "R", family: "data/statistics", extensions: [".r", ".R"], runtimes: ["R"], packageManagers: ["CRAN", "renv"], paradigms: ["functional", "vectorized"], strengths: ["statistics", "data analysis", "visualization"] },
  { id: "matlab", name: "MATLAB", family: "scientific computing", extensions: [".m", ".mlx"], runtimes: ["MATLAB"], packageManagers: ["MATLAB toolboxes"], paradigms: ["array-oriented", "procedural"], strengths: ["engineering", "simulation", "numerical computing"] },
  { id: "julia", name: "Julia", family: "scientific computing", extensions: [".jl"], runtimes: ["Julia"], packageManagers: ["Pkg"], paradigms: ["multi-paradigm", "multiple dispatch"], strengths: ["scientific computing", "numerical simulation", "data science"] },
  { id: "fortran", name: "Fortran", family: "scientific/HPC", extensions: [".f", ".f90", ".f95", ".f03", ".f08"], runtimes: ["native"], packageManagers: ["fpm"], paradigms: ["imperative", "array-oriented"], strengths: ["HPC", "numerical simulation", "scientific legacy"] },
  { id: "haskell", name: "Haskell", family: "functional", extensions: [".hs"], runtimes: ["GHC"], packageManagers: ["Cabal", "Stack"], paradigms: ["pure functional", "lazy"], strengths: ["language research", "correctness", "functional systems"] },
  { id: "elixir", name: "Elixir", family: "BEAM", extensions: [".ex", ".exs"], runtimes: ["BEAM/OTP"], packageManagers: ["Mix", "Hex"], paradigms: ["functional", "concurrent", "actor"], strengths: ["distributed systems", "real-time services", "fault tolerance"] },
  { id: "erlang", name: "Erlang", family: "BEAM", extensions: [".erl", ".hrl"], runtimes: ["BEAM/OTP"], packageManagers: ["rebar3", "Hex"], paradigms: ["functional", "actor", "concurrent"], strengths: ["telecom", "distributed systems", "fault tolerance"] },
  { id: "clojure", name: "Clojure", family: "JVM/functional", extensions: [".clj", ".cljs"], runtimes: ["JVM", "JavaScript"], packageManagers: ["deps.edn", "Leiningen"], paradigms: ["functional", "immutable"], strengths: ["data-oriented systems", "JVM", "interactive development"] },
  { id: "ocaml", name: "OCaml", family: "functional", extensions: [".ml", ".mli"], runtimes: ["native", "bytecode", "JavaScript"], packageManagers: ["opam"], paradigms: ["functional", "static typing", "modules"], strengths: ["compilers", "formal methods", "systems"] },
  { id: "zig", name: "Zig", family: "systems", extensions: [".zig"], runtimes: ["native"], packageManagers: ["zig build"], paradigms: ["imperative", "manual memory"], strengths: ["systems", "embedded", "low-level tooling"] },
  { id: "nim", name: "Nim", family: "systems", extensions: [".nim"], runtimes: ["native", "JavaScript"], packageManagers: ["Nimble"], paradigms: ["multi-paradigm", "metaprogramming"], strengths: ["systems", "CLI", "performance"] },
  { id: "v", name: "V", family: "systems", extensions: [".v"], runtimes: ["native", "WASM"], packageManagers: ["vpm"], paradigms: ["imperative", "compiled"], strengths: ["systems", "simple native applications"] },
  { id: "assembly", name: "Assembly", family: "low-level", extensions: [".asm", ".s"], runtimes: ["CPU-specific"], packageManagers: ["toolchain-specific"], paradigms: ["imperative", "machine-level"], strengths: ["embedded", "reverse engineering", "bootloaders", "performance-critical code"] },
  { id: "solidity", name: "Solidity", family: "smart contracts", extensions: [".sol"], runtimes: ["EVM"], packageManagers: ["npm", "Foundry", "Hardhat"], paradigms: ["contract-oriented"], strengths: ["Ethereum smart contracts", "on-chain applications"] },
  { id: "move", name: "Move", family: "smart contracts", extensions: [".move"], runtimes: ["Move VM"], packageManagers: ["toolchain-specific"], paradigms: ["resource-oriented"], strengths: ["blockchain smart contracts", "asset safety"] },
  { id: "sql", name: "SQL", family: "database", extensions: [".sql"], runtimes: ["database engines"], packageManagers: ["engine-specific"], paradigms: ["declarative", "relational"], strengths: ["queries", "data modeling", "analytics"] },
  { id: "plsql", name: "PL/SQL", family: "database", extensions: [".sql", ".pls", ".pkb", ".pks"], runtimes: ["Oracle Database"], packageManagers: ["Oracle tooling"], paradigms: ["procedural", "SQL"], strengths: ["Oracle database logic", "stored procedures"] },
  { id: "graphql", name: "GraphQL", family: "API query language", extensions: [".graphql", ".gql"], runtimes: ["GraphQL servers/clients"], packageManagers: ["ecosystem-specific"], paradigms: ["declarative"], strengths: ["API schemas", "data querying"] },
  { id: "bash", name: "Bash", family: "shell", extensions: [".sh", ".bash"], runtimes: ["Bash"], packageManagers: ["OS package managers"], paradigms: ["command-oriented", "imperative"], strengths: ["Linux automation", "CI/CD", "systems scripting"] },
  { id: "powershell", name: "PowerShell", family: "shell", extensions: [".ps1", ".psm1", ".psd1"], runtimes: ["PowerShell 7", "Windows PowerShell"], packageManagers: ["PowerShell Gallery", "winget"], paradigms: ["object-oriented shell", "pipeline"], strengths: ["Windows automation", "DevOps", "administration"] },
  { id: "html", name: "HTML", family: "web markup", extensions: [".html", ".htm"], runtimes: ["browser"], packageManagers: [], paradigms: ["declarative markup"], strengths: ["web document structure", "accessible interfaces"] },
  { id: "css", name: "CSS", family: "web styling", extensions: [".css"], runtimes: ["browser"], packageManagers: [], paradigms: ["declarative"], strengths: ["layout", "visual design", "responsive interfaces"] },
  { id: "scss", name: "SCSS", family: "web styling", extensions: [".scss"], runtimes: ["Sass compiler"], packageManagers: ["npm"], paradigms: ["declarative", "preprocessor"], strengths: ["structured CSS", "design systems"] },
  { id: "wasm", name: "WebAssembly", family: "portable binary", extensions: [".wasm"], runtimes: ["browser", "WASI", "server runtimes"], packageManagers: ["toolchain-specific"], paradigms: ["low-level", "portable binary"], strengths: ["browser performance", "portable native modules"] },
  { id: "verilog", name: "Verilog", family: "hardware description", extensions: [".v", ".vh"], runtimes: ["HDL simulators", "FPGA toolchains"], packageManagers: ["toolchain-specific"], paradigms: ["hardware description"], strengths: ["digital hardware", "FPGA", "ASIC design"] },
  { id: "vhdl", name: "VHDL", family: "hardware description", extensions: [".vhd", ".vhdl"], runtimes: ["HDL simulators", "FPGA toolchains"], packageManagers: ["toolchain-specific"], paradigms: ["hardware description"], strengths: ["digital hardware", "FPGA", "ASIC design"] },
  { id: "solidity-yul", name: "Yul", family: "EVM low-level", extensions: [".yul"], runtimes: ["EVM toolchains"], packageManagers: ["Foundry", "Solidity toolchain"], paradigms: ["low-level", "stack-oriented"], strengths: ["EVM optimization", "low-level smart contracts"] }
];

export const CODE_LANGUAGE_LIBRARY_VERSION = "1.0.0";

export function buildLanguageSystemPrompt(): string {
  const compact = CODE_LANGUAGE_LIBRARY.map((language) =>
    [
      language.id,
      language.name,
      language.family,
      language.extensions.join(","),
      language.runtimes.join(","),
      language.packageManagers.join(",") || "none",
      language.paradigms.join(","),
      language.strengths.join(";")
    ].join(" | ")
  ).join("\n");

  return [
    "EXPERIENCEENGINE CODE LANGUAGE LIBRARY",
    `Library version: ${CODE_LANGUAGE_LIBRARY_VERSION}`,
    "",
    "Use this registry as the language-selection and implementation reference.",
    "It is metadata and engineering guidance, not a replacement for the model's general programming knowledge.",
    "Select the most appropriate language from the registry when the user specifies or implies a target.",
    "If the user explicitly names a language, framework, runtime, file extension, or toolchain, obey it.",
    "If the user does not specify one, choose the language that minimizes implementation friction and matches the requested environment.",
    "Do not force everything into TypeScript.",
    "When a request spans multiple languages, emit the primary implementation language and clearly structure additional files when the API permits them.",
    "Prefer real APIs and idiomatic syntax for the selected language. Never invent syntax.",
    "",
    "FORMAT:",
    "id | name | family | extensions | runtimes | package managers | paradigms | strengths",
    "",
    compact
  ].join("\n");
}
