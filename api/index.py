"""
Vercel Serverless Entrypoint for ECDAT
"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from app import ECDATRequestHandler

class handler(ECDATRequestHandler):
    pass
