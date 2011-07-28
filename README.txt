Django-chat is an IM client written in Python, Django, strophe, flXHR and jquery.
The whole point was to test out the Strophe js library. The project itself will be evolving continually until i'm happy with overall product.

There is a script available to set it all up in one go. Then move onto localhost:8001/hello 
Steps to set up:
1. In the root directory run ./scripts/build_local_django.sh
2. cd src/hello_xmpp
3. ./manage.py runserver 8000
4. In your browser goto http://localhost:8000/hello

That should do it.

Feel free to fork and make some changes. And let me know about improvements.
