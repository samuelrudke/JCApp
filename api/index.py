import os
import sys

# Garante que a raiz do projeto esteja no PATH para importar main.py e models.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
