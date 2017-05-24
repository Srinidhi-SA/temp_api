import csv
import os
import datetime
from django.utils import timezone


class CSVChecker(object):

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


class DateHelp:

    limited_days = 30

    @classmethod
    def restrict_days(cls, date_joined):
        current_date = timezone.now()
        user_joining_date = date_joined
        time_difference = current_date - user_joining_date
        print time_difference.days

        days = time_difference.days
        if days > cls.limited_days:
            return False
        return True


def tell_me_size_readable_format(num):

    name = "B"

    # assuming in B
    if num > 1024:
        num = num/1024
        name = "KB"
        if num > 1024:
            num = num/1024
            name = "MB"
            if num > 1024:
                num = num/1024
                name = "GB"
                return str(num) + " " + name
            else:
                return str(num) + " " + name
        else:
            return str(num) + " " + name

    else:
        return str(num) + " " + name


def generate_nested_list_from_nested_dict(nested_dict):
    data = nested_dict
    keys = data.keys()
    inner_keys = data[keys[0]].keys()
    out = []
    head_row = ["RANGE"]+inner_keys
    head_row = [h.title() for h in head_row]
    out.append(head_row)
    for val in keys:
        row = [val]
        for val2 in inner_keys:
            temp = data[val]
            row.append(temp.get(val2, 0))
        out.append(row)
    return out

def get_color_map():
    out = {"Outperform": "Red",
           "Underperform":"blue",
           "Stable":"green"
           }
    return out