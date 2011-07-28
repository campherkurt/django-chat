#!/bin/sh -ex
python scripts/virtualenv.py build/test

. ./build/test/bin/activate

pip install --requirement `pwd`/libs/dependencies.txt
