
import csv
import os


class CSVChecker:

    def __init__(self, input_file):
        self.input_file = input_file

    def csv_checker(self):
        try:
            self.open_and_read_file()
            return True
        except Exception as error:
            return False

    def open_and_read_file(self):
        with open(self.input_file.path) as file:
            rows = csv.reader(file, delimiter=',')
            # for row in itertools.islice(rows, 20):

            for row in rows:
                if "" in row or " " in row:
                    continue


    def empty_file_check(self):
        if os.stat(self.input_file).st_size == 0:
            return  False
