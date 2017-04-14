
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
            for row in rows:
                if "" in row or " " in row:
                    continue

    def empty_file_check(self):
        if os.stat(self.input_file.path).st_size == 0:
            return  True

    def clean_column_names(self, colname_list):
        special_chars = [".", "*", "$", "#"]
        cleaned_list = []

        for col in colname_list:
            for x in special_chars:
                col = col.replace(x, "")
            col = col.strip(' ')
            cleaned_list.append(col)
        return cleaned_list

    # change function to much improvement needed
    def csv_header_clean(self):
        header = None
        first = 0
        OLD_DATA = []
        with open(self.input_file.path) as file:
            rows = csv.reader(file, delimiter=',')
            for row in rows:
                if first == 0:
                    header = row
                    print header
                    first = 1
                else:
                    OLD_DATA.append(row)

        cleaned_header = self.clean_column_names(header)

        with open(self.input_file.path, 'w') as file:
            writer = csv.writer(file, delimiter=',')
            writer.writerow(cleaned_header)

            for row in OLD_DATA:
                writer.writerow(row)

        return cleaned_header







