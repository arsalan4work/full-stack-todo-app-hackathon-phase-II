"""
Routes package initialization file.
"""
from . import auth
from . import tasks
from . import chat

__all__ = ['auth', 'tasks', 'chat']