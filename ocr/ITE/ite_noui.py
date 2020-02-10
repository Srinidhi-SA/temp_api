from ocr.ITE.master_all import *

from ocr.ITE.ingestion import ingestion_1
from ocr.ITE.master_all import main_for_all_modules


def ite_noui_main(input_path):
    ingestion_1(input_path, os.getcwd() + "/pdf_to_images_folder")

    temporary_path = os.getcwd() + '/pdf_to_images_folder/'

    for i in os.listdir(temporary_path):
        # domain_classification_flag,needed_json_final,meta_data_of_the_page=main_for_all_modules(temporary_path+i)
        domain_classification_flag, needed_json_final, meta_data_of_the_page = main_for_all_modules(temporary_path + i)

# if __name__ == '__main__':
#    ite_noui_main(sys.argv[1])
