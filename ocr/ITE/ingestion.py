#!/usr/bin/env python3
# -*- coding: utf-8 -*-


from pdf2image import convert_from_path
import os, shutil
from PIL import Image


# file_full_path="/home/abishek/ocr/demo"
def ingestion_1(file_full_path, path):
    """
    function for converting pdf to png or jpg

    inputs:
        file_full_path:path of the file to process
        path:the path to which the image has to be stored

    output:
        converted images in pdf_to_images_folder inside the path

    if pdf contains multiples pages,individual pages will be stored with the following naming convention
    pdf_file_name+page number

    """
    try:
        shutil.rmtree("./ocr/ITE/pdf_to_images_folder")
    except:
        pass
    try:
        os.makedirs("./ocr/ITE/pdf_to_images_folder")
    except:
        pass
    filename, file_extension = os.path.splitext(file_full_path)
    print("ingestion module running")
    if file_extension:
        if file_extension == ".pdf":
            pages = convert_from_path(file_full_path)
            index = 1
            for page in pages:
                page.save(path + "/" + filename.split("/")[-1] + '_page_' + str(index) + '.jpg', 'JPEG')
                # page.save("/home/abishek/ocr/final_demo_file/image_1.png", 'PNG')
                print(index)
                index = index + 1

        elif file_extension == ".jpg" or file_extension == ".png" or file_extension == ".jpeg":
            shutil.copy(file_full_path, "./ocr/ITE/pdf_to_images_folder/")
            # =============================================================================
            #             image_temp_to_save = Image.open(file_full_path)
            #             image_temp_to_save.save("/home/abishek/ocr/final_demo_file/image_1.png", 'PNG')
            # =============================================================================
            print("no conversion needed")

            pass

    else:
        for i in os.listdir(file_full_path):

            filename, file_extension = os.path.splitext(i)
            print(i, filename, file_extension)
            if file_extension == ".pdf":
                pages = convert_from_path(file_full_path + "/" + i)
                index = 1
                for page in pages:
                    page.save(path + "/" + filename.split("/")[-1] + '_page_' + str(index) + '.jpg', 'JPEG')
                    # page.save("/home/abishek/ocr/final_demo_file/image_1.png", 'PNG')
                    print(index)
                    index = index + 1

            elif file_extension == ".jpg" or file_extension == ".png" or file_extension == ".jpeg":
                shutil.copy(file_full_path + "/" + i, "./ocr/ITE/pdf_to_images_folder/")
                print(file_full_path + "/" + i)
                # =============================================================================
                #             image_temp_to_save = Image.open(file_full_path)
                #             image_temp_to_save.save("/home/abishek/ocr/final_demo_file/image_1.png", 'PNG')
                # =============================================================================
                print("no conversion needed")

                pass

# ingestion_1('/home/abishek/ocr/Figure_1.png',"/home/abishek/ocr/")


# =============================================================================
# file_full_path="xmlacrec.png"
# filename, file_extension=os.path.splitext(file_full_path)
# =============================================================================
