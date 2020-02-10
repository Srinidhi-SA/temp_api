#!/usr/bin/env python3


import tkinter as tk
from tkinter.filedialog import askopenfilename
from ingestion import *
from master_all import *
# from rp import *

LARGE_FONT= ("Verdana", 12)


# export GOOGLE_APPLICATION_CREDENTIALS="My_ProjectOCR_2427.json"
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="My_ProjectOCR_2427.json"

# self represents the current object. This is a common first parameter for any method of a class.
# As you suggested, it's similar to Java's this.
#
# parent represents a widget to act as the parent of the current object.
# All widgets in tkinter except the root window require a parent (sometimes also called a master)
#
# controller represents some other object that is designed to act as a common point of interaction
# for several pages of widgets. It is an attempt to decouple the pages. That is to say,
# each page doesn't need to know about the other pages. If it wants to interact with another page,
# such as causing it to be visible, it can ask the controller to make it visible.











class SeaofBTCapp(tk.Tk):

    def __init__(self, *args, **kwargs):

        tk.Tk.__init__(self, *args, **kwargs)
        container = tk.Frame(self)

        container.pack(side="top", fill="both", expand = True)

        container.grid_rowconfigure(0, weight=1)
        container.grid_columnconfigure(0, weight=1)

        self.frames = {}

        for F in (StartPage, PageOne, PageTwo,PageThree):

            frame = F(container, self)

            self.frames[F] = frame

            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame(StartPage)

    def show_frame(self, cont):

        frame = self.frames[cont]
        frame.tkraise()


class StartPage(tk.Frame):

    def __init__(self, parent, controller):
        tk.Frame.__init__(self,parent)
        label = tk.Label(self, text="Intelligent Image Extractor", font=LARGE_FONT)
        label.pack(pady=10,padx=10)

# =============================================================================
#         button = tk.Button(self, text="Visit Page 1",
#                             command=lambda: controller.show_frame(PageOne))
#         button.pack()
# =============================================================================
        label1 = tk.Label(self, text="Powered by mAdvisor", font=LARGE_FONT)
        label1.pack(pady=10,padx=10)
        button2 = tk.Button(self, text="Visit Page 1",
                            command=lambda: controller.show_frame(PageOne))
        button2.pack()


class PageOne(tk.Frame):


    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        label = tk.Label(self, text="Select file to process", font=LARGE_FONT)
        label.pack(pady=10,padx=10)

        button1 = tk.Button(self, text="Back to Home",
                            command=lambda: controller.show_frame(StartPage))
        button1.pack()

        button2 = tk.Button(self, text="Page Two",
                            command=lambda: controller.show_frame(PageTwo))
        button2.pack()

        button3 = tk.Button(self, text="Click Here To Upload File",
                            command=self.file_upload_window)
        button3.pack()
    def ingestion_module_function(self,input_path):

        ingestion_1(input_path,os.getcwd() + "/pdf_to_images_folder")

    def file_upload_window(self):
        #global temper1234
        global filepath
        print("this is running")
        filepath = askopenfilename()
        print(filepath)
        self.ingestion_module_function(filepath)

        #temper1234=filepath
        #return filepath


class PageTwo(tk.Frame):

    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        label = tk.Label(self, text="Analysis running page", font=LARGE_FONT)
        label.pack(pady=10,padx=10)

        button1 = tk.Button(self, text="Back to Home",
                            command=lambda: controller.show_frame(StartPage))
        button1.pack()

        button2 = tk.Button(self, text="RUN ALL",
                            command=self.run_all_functions)
        button2.pack()

        button3 = tk.Button(self, text="Page Three",
                            command=lambda: controller.show_frame(PageThree))
        button3.pack()

    def run_all_functions(self):
        global domain_classification_flag,needed_json_final,meta_data_of_the_page,analysis,google_response
        temporary_path= os.getcwd() + '/pdf_to_images_folder/'

        for i in os.listdir(temporary_path):

            # domain_classification_flag,needed_json_final,meta_data_of_the_page=main_for_all_modules(temporary_path+i)
                domain_classification_flag,needed_json_final,meta_data_of_the_page=main_for_all_modules(temporary_path+i)

        print("Run Success")


class PageThree(tk.Frame):

    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        label = tk.Label(self, text="Page Three!!!", font=LARGE_FONT)
        label.pack(pady=10,padx=10)

        button1 = tk.Button(self, text="Back to Home",
                            command=lambda: controller.show_frame(StartPage))
        button1.pack()

        button2 = tk.Button(self, text="Page Two",
                            command=lambda: controller.show_frame(PageTwo))
        button2.pack()

    #     button3 = tk.Button(self, text="Rpa",
    #                         command=self.run_rpa_function)
    #     button3.pack()
    #
    # def run_rpa_function(self):
    #     RPA(analysis,google_response,os.getcwd() + '/image_1.jpeg',os.getcwd() + '/foo1.png')
    #     print("Rpa is working")


app = SeaofBTCapp()
app.geometry("1400x800")
app.mainloop()
