---
name: uv-project-management-skill
description: UV for Python project setup and dependency management in this hackathon.
---

## What is UV?
UV is an extremely fast Python package and project manager written in Rust. It replaces pip, virtualenv, poetry, and pyenv with a single tool that's 10-100x faster.

UV is already installed globally now just for project use this for adding packages, venv

## Installation

### Install UV
```bash
# macOS and Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Via pip (alternative)
pip install uv

# Via pipx (alternative)
pipx install uv
```

### Verify Installation
```bash
uv --version
```

### Update UV
```bash
# If installed via standalone installer
uv self update

# If installed via pip
pip install --upgrade uv
```

## Project Initialization

### Create New Project
```bash
# Basic application (default) - for scripts, CLI tools, web servers
uv init todo-console-app
cd todo-console-app

# Application with specific Python version
uv init todo-console-app --python 3.13

# Initialize in existing directory
mkdir my-project
cd my-project
uv init
```

### Project Structure Created by `uv init`
```
todo-console-app/
├── .python-version      # Pins Python version
├── README.md            # Project documentation
├── main.py              # Sample entry point
└── pyproject.toml       # Project metadata & dependencies
```

### After First Run Command (auto-created)
```
todo-console-app/
├── .venv/               # Virtual environment (auto-created)
│   ├── bin/
│   ├── lib/
│   └── pyvenv.cfg
├── .python-version
├── README.md
├── main.py
├── pyproject.toml
└── uv.lock             # Dependency lock file (auto-created)
```

## Python Version Management

### Install Specific Python Version
```bash
# Install Python 3.13
uv python install 3.13

# List available Python versions
uv python list

# Show installed Python versions
uv python list --only-installed
```

### Pin Python Version for Project
```bash
# Pin to Python 3.13
uv python pin 3.13

# This creates/updates .python-version file
```

### Verify Python Version
```bash
uv run python --version
```

## Project Structure Setup for This Hackathon

### Create Source Directory Structure
```bash
# Create all directories at once
mkdir -p src/models src/services src/ui src/utils

# Create __init__.py files
touch src/__init__.py
touch src/models/__init__.py
touch src/services/__init__.py
touch src/ui/__init__.py
touch src/utils/__init__.py

# Create main entry point
touch src/main.py
```

### Final Project Structure for Phase I
```
todo-console-app/
├── .venv/                    # Auto-created virtual environment
├── specs_history/            # Specification files (create manually)
├── src/
│   ├── __init__.py
│   ├── main.py              # Entry point
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py
│   ├── ui/
│   │   ├── __init__.py
│   │   └── cli.py
│   └── utils/
│       ├── __init__.py
│       ├── validators.py
│       └── formatters.py
├── .python-version
├── constitution.md
├── README.md
├── CLAUDE.md
├── pyproject.toml
└── uv.lock
```

## Dependency Management

### Add Dependencies
```bash
# Add a package (creates .venv and uv.lock automatically)
uv add package-name

# Add multiple packages
uv add requests pandas numpy

# Add with version constraint
uv add "requests>=2.31.0"

# Add development dependencies (for testing, linting, etc.)
uv add --dev pytest mypy ruff black

# Add optional dependency group
uv add --optional network httpx
```

### Install All Dependencies
```bash
# Sync environment with pyproject.toml and uv.lock
uv sync

# This installs/updates all dependencies
# Run this when cloning a project or after pulling changes
```

### Remove Dependencies
```bash
# Remove a package
uv remove package-name

# Remove development dependency
uv remove --dev pytest
```

### View Dependencies
```bash
# List installed packages
uv pip list

# Show dependency tree
uv tree

# Show outdated packages
uv pip list --outdated
```

### Lock Dependencies
```bash
# Update lock file
uv lock

# Update specific package
uv lock --upgrade-package requests
```

## Running Code

### Run Python Files
```bash
# Run with UV (automatically uses project's virtual environment)
uv run python src/main.py

# Run script directly
uv run src/main.py

# Run with arguments
uv run python src/main.py --verbose

# Run Python REPL
uv run python
```

### Run Without Virtual Environment Activation
UV automatically manages the virtual environment, so you don't need to activate it manually. Just prefix commands with `uv run`.

### Manual Virtual Environment Activation (Optional)
If you prefer traditional activation:
```bash
# Linux/macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate

# Deactivate
deactivate
```

## pyproject.toml Configuration

### Minimal Configuration for This Project
```toml
[project]
name = "todo-console-app"
version = "0.1.0"
description = "In-memory Todo console application"
readme = "README.md"
requires-python = ">=3.13"
dependencies = []

[project.scripts]
todo = "src.main:main"

[tool.uv]
dev-dependencies = []
```

### After Adding Dependencies
```toml
[project]
name = "todo-console-app"
version = "0.1.0"
description = "In-memory Todo console application"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    # Runtime dependencies will appear here
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "mypy>=1.8.0",
    "ruff>=0.1.0",
]
```

## Common UV Commands Reference

### Project Commands
```bash
uv init [name]              # Create new project
uv init --python 3.13       # Create with specific Python version
uv run [command]            # Run command in project environment
uv sync                     # Sync environment with lock file
uv lock                     # Update lock file
```

### Dependency Commands
```bash
uv add [package]            # Add dependency
uv add --dev [package]      # Add dev dependency
uv remove [package]         # Remove dependency
uv pip list                 # List installed packages
uv tree                     # Show dependency tree
```

### Python Version Commands
```bash
uv python install [version] # Install Python version
uv python pin [version]     # Pin project to Python version
uv python list              # List available versions
```

### Environment Commands
```bash
uv venv                     # Create virtual environment manually
uv venv --python 3.13       # Create with specific Python version
```

## Best Practices for This Hackathon

### 1. Always Use `uv run` for Commands
```bash
# ✅ Correct - Uses project environment
uv run python src/main.py
uv run pytest
uv run mypy src/

# ❌ Wrong - May use wrong Python/environment
python src/main.py
pytest
```

### 2. Pin Python Version
```bash
# Do this at project start
uv python pin 3.13
```

### 3. Keep Dependencies Minimal
For Phase I, we don't need external dependencies (standard library only). Don't add unnecessary packages.
```bash
# Only add if absolutely needed
uv add package-name
```

### 4. Regular Syncing
After pulling code or switching branches:
```bash
uv sync
```

### 5. Check Lock File into Git
The `uv.lock` file ensures reproducible environments. Always commit it:
```bash
git add uv.lock
git commit -m "Update dependencies"
```

## Troubleshooting

### Problem: Python version not found
```bash
# Install the required version
uv python install 3.13
```

### Problem: Package conflicts
```bash
# Clear cache and reinstall
uv cache clean
uv sync --reinstall
```

### Problem: Virtual environment issues
```bash
# Remove and recreate
rm -rf .venv
uv sync
```

### Problem: Permission denied (Linux/macOS)
```bash
# Change ownership of UV home directory
sudo chown -R $USER ~/.local/share/uv
```

### Problem: Old dependencies after update
```bash
# Force update all dependencies
uv lock --upgrade
uv sync
```

## UV vs Other Tools

### UV vs pip
- **Speed**: 10-100x faster than pip
- **Lock files**: Built-in dependency locking
- **Python management**: Can install Python versions
- **Virtual environments**: Automatic management

### UV vs Poetry
- **Speed**: Significantly faster
- **Simpler**: Less configuration needed
- **Compatible**: Uses same pyproject.toml format
- **Migration**: Easy to switch from Poetry

### UV vs Conda
- **Speed**: Much faster installation
- **Size**: Smaller footprint
- **Python-only**: Focused on Python packages
- **Standards**: Uses standard Python packaging

## Important Notes for This Project

### For Phase I Specifically:
1. **No external dependencies needed** - Use Python standard library only
2. **Structure matters** - Follow the src/ layout specified above
3. **Always use uv run** - Ensures consistent environment
4. **Pin Python 3.13+** - Required by constitution
5. **Keep pyproject.toml minimal** - Only essential metadata

### Files to Create Manually:
- `constitution.md` - Project governance
- `specs_history/` directory - Store all specs
- `CLAUDE.md` - Claude Code instructions
- `README.md` - Project documentation (UV creates basic one)

### Files Auto-Created by UV:
- `.venv/` - Virtual environment
- `uv.lock` - Dependency lock file
- `.python-version` - Python version pin
- `pyproject.toml` - Project configuration (basic)

## Quick Start Checklist for This Hackathon

- [ ] Install UV: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- [ ] Verify installation: `uv --version`
- [ ] Create project: `uv init todo-console-app`
- [ ] Navigate to project: `cd todo-console-app`
- [ ] Pin Python version: `uv python pin 3.13`
- [ ] Create directory structure: `mkdir -p src/{models,services,ui,utils}`
- [ ] Create __init__.py files: `touch src/__init__.py src/models/__init__.py ...`
- [ ] Create specs directory: `mkdir specs_history`
- [ ] Create constitution: `touch constitution.md`
- [ ] Create Claude instructions: `touch CLAUDE.md`
- [ ] Test run: `uv run python src/main.py`

## Summary

UV simplifies Python project management:
- **One command to rule them all**: Replaces pip, virtualenv, pyenv, poetry
- **Blazing fast**: 10-100x faster than traditional tools
- **Auto-magic**: Automatically creates and manages virtual environments
- **Lock files**: Ensures reproducible environments across machines
- **Python management**: Installs and manages Python versions
- **Standard-compliant**: Works with standard pyproject.toml format

For this hackathon, UV handles all project setup, dependency management, and command execution efficiently.