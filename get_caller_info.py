import inspect

def get_caller_info():
    # Get the current stack frame
    frame = inspect.currentframe()
    try:
        # Move up three frames: current frame, caller frame, caller's caller frame
        caller_frame = frame.f_back.f_back.f_back
        caller_info = inspect.getframeinfo(caller_frame)
        
        # Extract the file name and line number from the caller's caller frame
        filename = caller_info.filename
        lineno = caller_info.lineno
        function_name = caller_info.function
        
        print(f"Caller information: File '{filename}', Function '{function_name}', Line {lineno}")
    finally:
        del frame  # Clean up to avoid reference cycles

def C():
    get_caller_info()

def B():
    C()

def A():
    B()

# Example usage
A()
