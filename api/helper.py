
import csv


class CSVChecker:

    def __init__(self, input_file):
        self.input_file = input_file

    def csv_checker(self):
        try:
            self.open_and_read_file()
            return True
        except Exception as error:
            print "lol"
            return False

    def open_and_read_file(self):
        with open(self.input_file.path) as file:
            print "IN"
            rows = csv.reader(file, delimiter=',')
            # for row in itertools.islice(rows, 20):
            for row in rows:
                if "" in row or " " in row:
                    continue

    def empty_file_check(self):
        pass


def measure_filter_helper_true_getter(diction):
    pass