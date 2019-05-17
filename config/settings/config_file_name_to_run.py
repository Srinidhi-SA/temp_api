import environ
env = environ.Env(DEBUG=(bool, False),) # set default values and casting
environ.Env.read_env()
CONFIG_FILE_NAME = env('CONFIG_FILE_NAME')
UI_VERSION = '1537046'    

