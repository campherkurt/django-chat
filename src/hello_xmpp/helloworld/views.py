from django.shortcuts import render_to_response

def hello(request):
    return render_to_response('hello.html', {})
    
