#!/usr/bin/env python3

from PIL import Image

from ocr.ITE.Functions import *

#!export GOOGLE_APPLICATION_CREDENTIALS="/home/athira/Downloads/My_ProjectOCR_2427.json"


# image_name_with_path= os.getcwd() + '/image_left.png'



os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="ocr/ITE/My_ProjectOCR_2427.json"
#
#
# analysis=text_from_Azure_API(image_name_with_path)
# google_response=detect_text(image_name_with_path)



#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jan  9 22:09:22 2020

@author: athira
"""

'''
import random
import math
import warnings
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
'''

import tkinter as tk
from tkinter import ttk
from tkinter import *
import numpy as np
from tkinter import messagebox
from PIL import ImageTk, Image
import pandas as pd
import json



# image_name_t =  '/Page4_mask0.png'

image_path1= os.getcwd() + '/ocr/ITE/demo_analysis/image_left.png'
foo_path = os.getcwd() + '/foo1.png'
def RPA(analysis,google_response,image,image_name_t=" "):



    # def RPA_Preprocess(analysis,google_response):
    #analysis=text_from_Azure_API(image_name_with_path)
    #google_response=detect_text(image_name_with_path)
    response_dict,d=fun1(analysis,google_response)

    data3=fun2(response_dict,d) #comparison

    data=write_to_Json(analysis) #Azure
    image_data = open(image_name_t, "rb").read()
    image_ = Image.open(BytesIO(image_data))
    data2=write_to_json2(data) # Converted

    mask=plot(image_,data3)

    #     return data2,data3,mask
    # data2,data3,mask=RPA_Preprocess(analysis,google_response)
    root = Toplevel()

    frame = Frame(root) # define upper frame

    ##############-------------------------------------------###########################
    '''ToolTip and Zoom In'''
    ##############-------------------------------------------###########################

    class CreateToolTip(object):
        """
        create a tooltip for a given widget
        """
        def __init__(self, widget, text='widget info'):
            self.waittime = 500     #miliseconds
            self.wraplength = 180   #pixels
            self.widget = widget
            self.text = text
            self.widget.bind("<Enter>", self.enter)
            self.widget.bind("<Leave>", self.leave)
            self.widget.bind("<ButtonPress>", self.leave)
            self.id = None
            self.tw = None

        def enter(self, event=None):
            self.schedule()

        def leave(self, event=None):
            self.unschedule()
            self.hidetip()

        def schedule(self):
            self.unschedule()
            self.id = self.widget.after(self.waittime, self.showtip)

        def unschedule(self):
            id = self.id
            self.id = None
            if id:
                self.widget.after_cancel(id)

        def showtip(self, event=None):
            x = y = 0
            x, y, cx, cy = self.widget.bbox("insert")
            x += self.widget.winfo_rootx() + 25
            y += self.widget.winfo_rooty() + 20
            # creates a toplevel window
            self.tw = tk.Toplevel(self.widget)
            # Leaves only the label and removes the app window
            self.tw.wm_overrideredirect(True)
            self.tw.wm_geometry("+%d+%d" % (x, y))
            label = tk.Label(self.tw, text=self.text, justify='left',
                           background="#ffffff", relief='solid', borderwidth=1,
                           wraplength = self.wraplength)
            label.pack(ipadx=1)

        def hidetip(self):
            tw = self.tw
            self.tw= None
            if tw:
                tw.destroy()
    # class AutoScrollbar(ttk.Scrollbar):
    #     """ A scrollbar that hides itself if it's not needed. Works only for grid geometry manager """
    #     def set(self, lo, hi):
    #         if float(lo) <= 0.0 and float(hi) >= 1.0:
    #             self.grid_remove()
    #         else:
    #             self.grid()
    #             ttk.Scrollbar.set(self, lo, hi)
    #
    #     def pack(self, **kw):
    #         raise tk.TclError('Cannot use pack with the widget ' + self.__class__.__name__)
    #
    #     def place(self, **kw):
    #         raise tk.TclError('Cannot use place with the widget ' + self.__class__.__name__)
    #
    # class CanvasImage:
    #     """ Display and zoom image """
    #     def __init__(self, placeholder, path):
    #         """ Initialize the ImageFrame """
    #         self.imscale = 1.0  # scale for the canvas image zoom, public for outer classes
    #         self.__delta = 1.3  # zoom magnitude
    #         self.__filter = Image.ANTIALIAS  # could be: NEAREST, BILINEAR, BICUBIC and ANTIALIAS
    #         self.__previous_state = 0  # previous state of the keyboard
    #         self.path = path  # path to the image, should be public for outer classes
    #         # Create ImageFrame in placeholder widget
    #         self.__imframe = ttk.Frame(placeholder)  # placeholder of the ImageFrame object
    #         # Vertical and horizontal scrollbars for canvas
    #         hbar = AutoScrollbar(self.__imframe, orient='horizontal')
    #         vbar = AutoScrollbar(self.__imframe, orient='vertical')
    #         hbar.grid(row=1, column=0, sticky='we')
    #         vbar.grid(row=0, column=1, sticky='ns')
    #         # Create canvas and bind it with scrollbars. Public for outer classes
    #         self.canvas = tk.Canvas(self.__imframe, highlightthickness=0,
    #                                 xscrollcommand=hbar.set, yscrollcommand=vbar.set)
    #         self.canvas.grid(row=0, column=0, sticky='nswe')
    #         self.canvas.update()  # wait till canvas is created
    #         hbar.configure(command=self.__scroll_x)  # bind scrollbars to the canvas
    #         vbar.configure(command=self.__scroll_y)
    #         # Bind events to the Canvas
    #         self.canvas.bind('<Configure>', lambda event: self.__show_image())  # canvas is resized
    #         self.canvas.bind('<ButtonPress-1>', self.__move_from)  # remember canvas position
    #         self.canvas.bind('<B1-Motion>',     self.__move_to)  # move canvas to the new position
    #         self.canvas.bind('<MouseWheel>', self.__wheel)  # zoom for Windows and MacOS, but not Linux
    #         self.canvas.bind('<Button-5>',   self.__wheel)  # zoom for Linux, wheel scroll down
    #         self.canvas.bind('<Button-4>',   self.__wheel)  # zoom for Linux, wheel scroll up
    #         # Handle keystrokes in idle mode, because program slows down on a weak computers,
    #         # when too many key stroke events in the same time
    #         self.canvas.bind('<Key>', lambda event: self.canvas.after_idle(self.__keystroke, event))
    #         # Decide if this image huge or not
    #         self.__huge = False  # huge or not
    #         self.__huge_size = 14000  # define size of the huge image
    #         self.__band_width = 1024  # width of the tile band
    #         Image.MAX_IMAGE_PIXELS = 1000000000  # suppress DecompressionBombError for the big image
    #         with warnings.catch_warnings():  # suppress DecompressionBombWarning
    #             warnings.simplefilter('ignore')
    #             self.__image = Image.open(self.path)  # open image, but down't load it
    #         self.imwidth, self.imheight = self.__image.size  # public for outer classes
    #         if self.imwidth * self.imheight > self.__huge_size * self.__huge_size and \
    #            self.__image.tile[0][0] == 'raw':  # only raw images could be tiled
    #             self.__huge = True  # image is huge
    #             self.__offset = self.__image.tile[0][2]  # initial tile offset
    #             self.__tile = [self.__image.tile[0][0],  # it have to be 'raw'
    #                            [0, 0, self.imwidth, 0],  # tile extent (a rectangle)
    #                            self.__offset,
    #                            self.__image.tile[0][3]]  # list of arguments to the decoder
    #         self.__min_side = min(self.imwidth, self.imheight)  # get the smaller image side
    #         # Create image pyramid
    #         self.__pyramid = [self.smaller()] if self.__huge else [Image.open(self.path)]
    #         # Set ratio coefficient for image pyramid
    #         self.__ratio = max(self.imwidth, self.imheight) / self.__huge_size if self.__huge else 1.0
    #         self.__curr_img = 0  # current image from the pyramid
    #         self.__scale = self.imscale * self.__ratio  # image pyramide scale
    #         self.__reduction = 2  # reduction degree of image pyramid
    #         w, h = self.__pyramid[-1].size
    #         while w > 512 and h > 512:  # top pyramid image is around 512 pixels in size
    #             w /= self.__reduction  # divide on reduction degree
    #             h /= self.__reduction  # divide on reduction degree
    #             self.__pyramid.append(self.__pyramid[-1].resize((int(w), int(h)), self.__filter))
    #         # Put image into container rectangle and use it to set proper coordinates to the image
    #         self.container = self.canvas.create_rectangle((0, 0, self.imwidth, self.imheight), width=0)
    #         self.__show_image()  # show image on the canvas
    #         self.canvas.focus_set()  # set focus on the canvas
    #
    #     def smaller(self):
    #         """ Resize image proportionally and return smaller image """
    #         w1, h1 = float(self.imwidth), float(self.imheight)
    #         w2, h2 = float(self.__huge_size), float(self.__huge_size)
    #         aspect_ratio1 = w1 / h1
    #         aspect_ratio2 = w2 / h2  # it equals to 1.0
    #         if aspect_ratio1 == aspect_ratio2:
    #             image = Image.new('RGB', (int(w2), int(h2)))
    #             k = h2 / h1  # compression ratio
    #             w = int(w2)  # band length
    #         elif aspect_ratio1 > aspect_ratio2:
    #             image = Image.new('RGB', (int(w2), int(w2 / aspect_ratio1)))
    #             k = h2 / w1  # compression ratio
    #             w = int(w2)  # band length
    #         else:  # aspect_ratio1 < aspect_ration2
    #             image = Image.new('RGB', (int(h2 * aspect_ratio1), int(h2)))
    #             k = h2 / h1  # compression ratio
    #             w = int(h2 * aspect_ratio1)  # band length
    #         i, j, n = 0, 1, round(0.5 + self.imheight / self.__band_width)
    #         while i < self.imheight:
    #             print('\rOpening image: {j} from {n}'.format(j=j, n=n), end='')
    #             band = min(self.__band_width, self.imheight - i)  # width of the tile band
    #             self.__tile[1][3] = band  # set band width
    #             self.__tile[2] = self.__offset + self.imwidth * i * 3  # tile offset (3 bytes per pixel)
    #             self.__image.close()
    #             self.__image = Image.open(self.path)  # reopen / reset image
    #             self.__image.size = (self.imwidth, band)  # set size of the tile band
    #             self.__image.tile = [self.__tile]  # set tile
    #             cropped = self.__image.crop((0, 0, self.imwidth, band))  # crop tile band
    #             image.paste(cropped.resize((w, int(band * k)+1), self.__filter), (0, int(i * k)))
    #             i += band
    #             j += 1
    #         print('\r' + 30*' ' + '\r', end='')  # hide printed string
    #         return image
    #
    #     def redraw_figures(self):
    #         """ Dummy function to redraw figures in the children classes """
    #         pass
    #
    #     def grid(self, **kw):
    #         """ Put CanvasImage widget on the parent widget """
    #         self.__imframe.grid(**kw)  # place CanvasImage widget on the grid
    #         self.__imframe.grid(sticky='nswe')  # make frame container sticky
    #         self.__imframe.rowconfigure(0, weight=1)  # make canvas expandable
    #         self.__imframe.columnconfigure(0, weight=1)
    #
    #     def pack(self, **kw):
    #         """ Exception: cannot use pack with this widget """
    #         raise Exception('Cannot use pack with the widget ' + self.__class__.__name__)
    #
    #     def place(self, **kw):
    #         """ Exception: cannot use place with this widget """
    #         raise Exception('Cannot use place with the widget ' + self.__class__.__name__)
    #
    #     # noinspection PyUnusedLocal
    #     def __scroll_x(self, *args, **kwargs):
    #         """ Scroll canvas horizontally and redraw the image """
    #         self.canvas.xview(*args)  # scroll horizontally
    #         self.__show_image()  # redraw the image
    #
    #     # noinspection PyUnusedLocal
    #     def __scroll_y(self, *args, **kwargs):
    #         """ Scroll canvas vertically and redraw the image """
    #         self.canvas.yview(*args)  # scroll vertically
    #         self.__show_image()  # redraw the image
    #
    #     def __show_image(self):
    #         """ Show image on the Canvas. Implements correct image zoom almost like in Google Maps """
    #         box_image = self.canvas.coords(self.container)  # get image area
    #         box_canvas = (self.canvas.canvasx(0),  # get visible area of the canvas
    #                       self.canvas.canvasy(0),
    #                       self.canvas.canvasx(self.canvas.winfo_width()),
    #                       self.canvas.canvasy(self.canvas.winfo_height()))
    #         box_img_int = tuple(map(int, box_image))  # convert to integer or it will not work properly
    #         # Get scroll region box
    #         box_scroll = [min(box_img_int[0], box_canvas[0]), min(box_img_int[1], box_canvas[1]),
    #                       max(box_img_int[2], box_canvas[2]), max(box_img_int[3], box_canvas[3])]
    #         # Horizontal part of the image is in the visible area
    #         if  box_scroll[0] == box_canvas[0] and box_scroll[2] == box_canvas[2]:
    #             box_scroll[0]  = box_img_int[0]
    #             box_scroll[2]  = box_img_int[2]
    #         # Vertical part of the image is in the visible area
    #         if  box_scroll[1] == box_canvas[1] and box_scroll[3] == box_canvas[3]:
    #             box_scroll[1]  = box_img_int[1]
    #             box_scroll[3]  = box_img_int[3]
    #         # Convert scroll region to tuple and to integer
    #         self.canvas.configure(scrollregion=tuple(map(int, box_scroll)))  # set scroll region
    #         x1 = max(box_canvas[0] - box_image[0], 0)  # get coordinates (x1,y1,x2,y2) of the image tile
    #         y1 = max(box_canvas[1] - box_image[1], 0)
    #         x2 = min(box_canvas[2], box_image[2]) - box_image[0]
    #         y2 = min(box_canvas[3], box_image[3]) - box_image[1]
    #         if int(x2 - x1) > 0 and int(y2 - y1) > 0:  # show image if it in the visible area
    #             if self.__huge and self.__curr_img < 0:  # show huge image
    #                 h = int((y2 - y1) / self.imscale)  # height of the tile band
    #                 self.__tile[1][3] = h  # set the tile band height
    #                 self.__tile[2] = self.__offset + self.imwidth * int(y1 / self.imscale) * 3
    #                 self.__image.close()
    #                 self.__image = Image.open(self.path)  # reopen / reset image
    #                 self.__image.size = (self.imwidth, h)  # set size of the tile band
    #                 self.__image.tile = [self.__tile]
    #                 image = self.__image.crop((int(x1 / self.imscale), 0, int(x2 / self.imscale), h))
    #             else:  # show normal image
    #                 image = self.__pyramid[max(0, self.__curr_img)].crop(  # crop current img from pyramid
    #                                     (int(x1 / self.__scale), int(y1 / self.__scale),
    #                                      int(x2 / self.__scale), int(y2 / self.__scale)))
    #             #
    #             imagetk = ImageTk.PhotoImage(image.resize((int(x2 - x1), int(y2 - y1)), self.__filter))
    #             imageid = self.canvas.create_image(max(box_canvas[0], box_img_int[0]),
    #                                                max(box_canvas[1], box_img_int[1]),
    #                                                anchor='nw', image=imagetk)
    #             self.canvas.lower(imageid)  # set image into background
    #             self.canvas.imagetk = imagetk  # keep an extra reference to prevent garbage-collection
    #
    #     def __move_from(self, event):
    #         """ Remember previous coordinates for scrolling with the mouse """
    #         self.canvas.scan_mark(event.x, event.y)
    #
    #     def __move_to(self, event):
    #         """ Drag (move) canvas to the new position """
    #         self.canvas.scan_dragto(event.x, event.y, gain=1)
    #         self.__show_image()  # zoom tile and show it on the canvas
    #
    #     def outside(self, x, y):
    #         """ Checks if the point (x,y) is outside the image area """
    #         bbox = self.canvas.coords(self.container)  # get image area
    #         if bbox[0] < x < bbox[2] and bbox[1] < y < bbox[3]:
    #             return False  # point (x,y) is inside the image area
    #         else:
    #             return True  # point (x,y) is outside the image area
    #
    #     def __wheel(self, event):
    #         """ Zoom with mouse wheel """
    #         x = self.canvas.canvasx(event.x)  # get coordinates of the event on the canvas
    #         y = self.canvas.canvasy(event.y)
    #         if self.outside(x, y): return  # zoom only inside image area
    #         scale = 1.0
    #         # Respond to Linux (event.num) or Windows (event.delta) wheel event
    #         if event.num == 5 or event.delta == -120:  # scroll down, smaller
    #             if round(self.__min_side * self.imscale) < 30: return  # image is less than 30 pixels
    #             self.imscale /= self.__delta
    #             scale        /= self.__delta
    #         if event.num == 4 or event.delta == 120:  # scroll up, bigger
    #             i = min(self.canvas.winfo_width(), self.canvas.winfo_height()) >> 1
    #             if i < self.imscale: return  # 1 pixel is bigger than the visible area
    #             self.imscale *= self.__delta
    #             scale        *= self.__delta
    #         # Take appropriate image from the pyramid
    #         k = self.imscale * self.__ratio  # temporary coefficient
    #         self.__curr_img = min((-1) * int(math.log(k, self.__reduction)), len(self.__pyramid) - 1)
    #         self.__scale = k * math.pow(self.__reduction, max(0, self.__curr_img))
    #         #
    #         self.canvas.scale('all', x, y, scale, scale)  # rescale all objects
    #         # Redraw some figures before showing image on the screen
    #         self.redraw_figures()  # method for child classes
    #         self.__show_image()
    #
    #     def __keystroke(self, event):
    #         """ Scrolling with the keyboard.
    #             Independent from the language of the keyboard, CapsLock, <Ctrl>+<key>, etc. """
    #         if event.state - self.__previous_state == 4:  # means that the Control key is pressed
    #             pass  # do nothing if Control key is pressed
    #         else:
    #             self.__previous_state = event.state  # remember the last keystroke state
    #             # Up, Down, Left, Right keystrokes
    #             if event.keycode in [68, 39, 102]:  # scroll right, keys 'd' or 'Right'
    #                 self.__scroll_x('scroll',  1, 'unit', event=event)
    #             elif event.keycode in [65, 37, 100]:  # scroll left, keys 'a' or 'Left'
    #                 self.__scroll_x('scroll', -1, 'unit', event=event)
    #             elif event.keycode in [87, 38, 104]:  # scroll up, keys 'w' or 'Up'
    #                 self.__scroll_y('scroll', -1, 'unit', event=event)
    #             elif event.keycode in [83, 40, 98]:  # scroll down, keys 's' or 'Down'
    #                 self.__scroll_y('scroll',  1, 'unit', event=event)
    #
    #     def crop(self, bbox):
    #         """ Crop rectangle from the image and return it """
    #         if self.__huge:  # image is huge and not totally in RAM
    #             band = bbox[3] - bbox[1]  # width of the tile band
    #             self.__tile[1][3] = band  # set the tile height
    #             self.__tile[2] = self.__offset + self.imwidth * bbox[1] * 3  # set offset of the band
    #             self.__image.close()
    #             self.__image = Image.open(self.path)  # reopen / reset image
    #             self.__image.size = (self.imwidth, band)  # set size of the tile band
    #             self.__image.tile = [self.__tile]
    #             return self.__image.crop((bbox[0], 0, bbox[2], band))
    #         else:  # image is totally in RAM
    #             return self.__pyramid[0].crop(bbox)
    #
    #     def destroy(self):
    #         """ ImageFrame destructor """
    #         self.__image.close()
    #         map(lambda i: i.close, self.__pyramid)  # close all pyramid images
    #         del self.__pyramid[:]  # delete pyramid list
    #         del self.__pyramid  # delete pyramid variable
    #         self.canvas.destroy()
    #         self.__imframe.destroy()
    #
    # class MainWindow(ttk.Frame):
    #     """ Main window class """
    #     def __init__(self, mainframe, path):
    #         """ Initialize the main Frame """
    #         ttk.Frame.__init__(self, master=mainframe)
    #         self.master.title('Advanced Zoom v3.0')
    #         self.master.geometry('800x600')  # size of the main window
    #         self.master.rowconfigure(0, weight=1)  # make the CanvasImage widget expandable
    #         self.master.columnconfigure(0, weight=1)
    #         canvas = CanvasImage(self.master, path)  # create widget
    #         canvas.grid(row=0, column=0)  # show widget


    #############--------------------------------------------###########################
    '''RPA'''
    #############-------------------------------------------############################

    #im = Image.open(pathToImage)
    #ph = ImageTk.PhotoImage(im)


    image = Image.open(foo_path)
    image1 = image.resize((700, 800), Image.ANTIALIAS)
    img2 = ImageTk.PhotoImage(image1)


    image = Image.open(image_path1)
    image = image.resize((700, 800), Image.ANTIALIAS)
    img = ImageTk.PhotoImage(image)


    '''
    with open('ConvertedCoords.json', 'r') as fp:
        data2 = json.load(fp)
    data2['b0']
    with open('comparison.json', 'r') as fp:
        data3 = json.load(fp)

    with open('listttttttt.json', 'r') as fp:
        liss = json.load(fp)

    '''

    def key(event):
        print ("pressed", repr(event.char))

    def callback(event): #NA ON right click
        print ("clicked at", event.x, event.y)
        entry1.delete(0, END)
        entry1.insert(0, "NA")


    def create_circle(canvas, x, y, x1,y1, **kwargs): #draw rectangles
        return canvas.create_rectangle(x, y, x1, y1, **kwargs)

    def some_callback():#Clear Button ## note that you must include the event as an arg, even if you don't use it.
        entry1.delete(0, "end")
        #entry2.delete(0, "end")
        return None

    def saveCoordinates(event): # function called when left-mouse-button is clicked
        global x_coordinate,y_coordinate
        x_coordinate = event.x  # save x and y coordinates selected by the user
        y_coordinate = event.y

        x_coordinate_click = img.width() +x_coordinate
        x_coordinate_click1=x_coordinate-img.width()
        print (x_coordinate, y_coordinate)

        def FindPoint1(x1, y1, x2,
                  y2, x, y) :

            global p1,p2,p3,p4
            if (x > x1 and x < x2 and
                y > y1 and y < y2) :
                entry1.delete(0, END)
                entry1.insert(0, data2['b'+str(i)][8])
                p1,p2,p3,p4=data2['b'+str(i)][0],data2['b'+str(i)][1],data2['b'+str(i)][4],data2['b'+str(i)][5]
                global act_point
                act_point=i
                print(data2['b'+str(i)][8])

        for i in range(len(data2)):
            FindPoint1(data2['b'+str(i)][0],data2['b'+str(i)][1],data2['b'+str(i)][4],data2['b'+str(i)][5],x_coordinate_click1,y_coordinate)

        create_circle(canvas, p1+img.width(), p2, p3+img.width(), p4,outline='blue')
        create_circle(canvas, p1, p2, p3, p4,outline='blue')

    print (img.width(), img.height())
    lis=[]


    def not_clear():
        user_input = str(entry1.get())# I ALSO TRIED WITHOUT str()

        data3['b'+str(act_point)][1]=user_input
        data3['b'+str(act_point)][3]='Not_Sure'
        # data2['b'+str(act_point)].append("Not_sure")


        with open('comparison (copy).json', 'w') as fp:

            json.dump(data3, fp,sort_keys=True, indent=4)

        messagebox.showinfo("Message", "Successfully Updated one Record !!! ")

        lis.append(['b'+str(act_point),{'boundingBox':data3['b'+str(act_point)][0],'text':user_input}])
        with open('listttttttt.json', 'w') as fp:
            json.dump(lis, fp)
    def create_new(): #Save the new words

            user_input = str(entry1.get())


            data3['b'+str(act_point)][1]=user_input
            data3['b'+str(act_point)][3]='True'

            with open('comparison (copy).json', 'w') as fp:

                json.dump(data3, fp,sort_keys=True, indent=4)


            lis.append(['b'+str(act_point),{'boundingBox':data3['b'+str(act_point)][0],'text':user_input}])

            with open('listttttttt.json', 'w') as fp:
                json.dump(lis, fp)

            messagebox.showinfo("Message", "Successfully Updated one Record !!! ")
    def updated_analysis(analysis,user_input):
        def Sort(list_):
    # reverse = None (Sorts in Ascending order)
    # key is set to sort using second element of
    # sublist lambda has been used
            list_.sort(key = lambda x: x[1]["boundingBox"][1])
            return list_
        def get_text_cor(analysis):
            text_cor = []
            for line in analysis["recognitionResults"][0]["lines"]:
                for word_dic in line["words"]:
                    text_cor.append(word_dic["boundingBox"][0:2])
            return  text_cor
        text_cor = get_text_cor(analysis)
        user_input = Sort(user_input)
        for new_text in user_input:
            for line in analysis["recognitionResults"][0]["lines"]:
#                     print(line["words"][-1]["boundingBox"])
                    for word_dic in line["words"]:
#                         print(word_dic["text"])
                        if word_dic["boundingBox"][0:2] == new_text[1]["boundingBox"][0:2] and line["text"] == word_dic["text"]:
                            line["text"] = new_text[1]["text"]
                            word_dic["text"] = new_text[1]["text"]
#                             print(word_dic["text"])
                            break
                        elif word_dic["boundingBox"][0:2] == new_text[1]["boundingBox"][0:2] and len(line["text"]) != len(word_dic["text"]):
                            line["text"] = " ".join([ new_text[1]["text"]  if x == word_dic["text"] else x for x in line["text"].split(" ")])
                            word_dic["text"] = new_text[1]["text"]
#                             print(word_dic["text"])
                            break
        #if new_text[1]["boundingBox"][0:2] not  in text_cor:
                #new_text[1]["words"] = [new_text[1].copy()]
                #analysis["recognitionResults"][0]["lines"].append(new_text[1])

        return analysis

    def Export():
        updated_analys=updated_analysis(analysis,lis)

        with open('Updated_Analysis.json', 'w') as fp:
            json.dump(updated_analys, fp,sort_keys=True, indent=4)
    def add_new():#Add Missing Texts
        user_input2 = str(entry1.get())
        data3['b'+str((len(data3)-1)+1)]=user_input2


        lis.append(['b'+str((len(data3)-1)+1),{'boundingBox':[x_coordinate,y_coordinate],'text':user_input2}])
        with open('listttttttt.json', 'w') as fp:
            json.dump(lis, fp)



        with open('comparison (copy).json', 'w') as fp:
                json.dump(data3, fp,sort_keys=True, indent=4)
        messagebox.showinfo("Message", "Successfully Updated one Record !!! ")

    canvas= Canvas(root, width=img.width()*2, height=img.height())


    canvas.grid(row=0, column=0)
    canvas.create_image(0, 0, image=img, anchor='nw')

    canvas.create_image(img.width(), 0, image=img2, anchor='nw')

    w = Label(root, text='Domain')
    canvas.create_window(80, 50, window=w)

    w = Label(root, text='Template')
    canvas.create_window(280, 50, window=w)

    DT = ["Time sheet", "Transcripts", "Healthcare"]
    DT2=['Template1','Template2','Template3']
    w1 = Spinbox(root,values=DT,width=15)
    canvas.create_window(170, 50, window=w1)

    w2 = Spinbox(root,values=DT2,width=15)
    canvas.create_window(385, 50, window=w2)

    entry1 = Entry (root,justify=CENTER)
    canvas.create_window(800, 50, window=entry1)

    clear_button = Button(root, text="Clear text", command=some_callback)
    canvas.create_window(950,50,window=clear_button)

    Save_button = Button(root, text = "SAVE",width=10,fg='white', bg='green',command=create_new)
    save_button = CreateToolTip(Save_button, "Click on 'Report' if you are not sure about the text")
    canvas.create_window(1050,50,window=Save_button)

    Save_button_1 = Button(root, text = "ADD",width=10, command=add_new)
    save_button_1 = CreateToolTip(Save_button_1, "Click to add new text")
    canvas.create_window(1250,50,window=Save_button_1)

    Save_button_2 = Button(root, text = "Report", width=10,fg='white', bg='red',command=not_clear)
    canvas.create_window(1150,50,window=Save_button_2)

    Save_button_4 = Button(root, text = "Done & Export",width=10, command=Export)
    canvas.create_window(1250,50,window=Save_button_4)


    canvas.bind("<Key>", key)
    canvas.bind("<Button-1>", saveCoordinates)

    canvas.bind("<Button>", some_callback)
    canvas.bind("<Button>", create_new)
    canvas.bind("<Button>", not_clear)
    canvas.bind("<Button-3>", callback)





    canvas.pack()

    root.mainloop()
    return analysis
