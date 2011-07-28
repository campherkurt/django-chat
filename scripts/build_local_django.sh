#!/bin/sh -ex
python scripts/virtualenv.py build

. ./build/bin/activate
chmod +x src/hello_xmpp/manage.py 
pip install --requirement `pwd`/libs/dependencies.txt
