#!/usr/bin/env python3
"""
Test runner for agent behavior and MCP tools tests.
"""
import subprocess
import sys
import os

def run_tests():
    """Run all tests for agent behavior and MCP tools."""
    print("Running agent behavior and MCP tools tests...")

    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)

    # Run all tests
    result = subprocess.run([
        sys.executable, '-m', 'pytest',
        'tests/', '-v', '--tb=short'
    ])

    return result.returncode

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)