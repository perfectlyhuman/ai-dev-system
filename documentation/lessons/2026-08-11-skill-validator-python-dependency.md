# Skill validator requires an explicit Python dependency environment

## Context

The first v3 self-hosting pass validated source and installed skill packages with OpenAI's official `quick_validate.py` script using Codex's bundled Python runtime.

## Failed assumption

The presence of both the validator script and a bundled Python executable did not mean the validator was ready to run. The bundled environment did not include PyYAML, so the first invocation failed with `ModuleNotFoundError: No module named 'yaml'`.

The default `uv` cache and managed-Python directories were also inaccessible in the sandbox, so an otherwise correct dependency command could not use its normal storage locations.

## Resolution

Run the official script through `uv` with all transient state inside a workspace-owned temporary directory and declare the missing dependency explicitly:

```text
uv --cache-dir <workspace-temp> run --python <bundled-python> --with pyyaml <quick_validate.py> <skill-directory>
```

Project-contract validation similarly needs `jsonschema` declared when it is not already present. Remove the workspace-owned cache after validation.

## Prevention

- Treat `ModuleNotFoundError` from a provided validator as a runtime dependency problem, not evidence that the artifact is invalid.
- Keep temporary dependency caches inside an explicitly writable project or temp directory when sandboxed.
- During the root cutover, consider a project-owned deterministic validation command so future `finish` runs do not depend on reconstructing this environment manually.
