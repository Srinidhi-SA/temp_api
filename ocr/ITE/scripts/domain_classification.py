# -*- coding: utf-8 -*-
import re


class Domain:

    def __init__(self):
        pass

    def process_domain(self, analysis, image):
        #     ## CHECKING FOR TABLES
        #     gray = cv2.cvtColor(image_table_extraction, cv2.COLOR_BGR2GRAY)
        #     bw = cv2.adaptiveThreshold(~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)
        # tables = countour_count(bw)           ## ADD VARIABLE AREA THRESHOLDS

        # CHECKING FOR PATTERNS
        shape = image.shape

        x_lines, y_lines = self.lines(analysis, shape)
        #        print(y_lines)
        #        import sys
        #        sys.exit()
        flag_hori = self.check_line(x_lines)
        flag_vert = self.check_line(y_lines)
        #        print(flag_hori)
        #        print(flag_vert)
        #
        if flag_hori == 'No match' and flag_vert == 'No match':
            return 'BASE MODULE'

        elif flag_hori == 'Time Sheet' or flag_vert == 'Time Sheet':
            return 'Time Sheet'
        # DECIDING THE MODULES

    #        if (self.check_line(x_lines) == 'No match') and (
    #                self.check_line(y_lines) == 'No match'):
    #            return 'BASE MODULE'
    #
    #        elif self.check_line(x_lines) == 'Time Sheet':
    #                    return 'Time Sheet'
    #
    #
    #        elif self.check_line(y_lines) == 'Time Sheet':
    #                return 'Time Sheet'

    #        else:
    #            x_check = [self.check_line(x_lines)]
    #            y_check = [self.check_line(y_lines)]
    #            l = x_check + y_check
    #            print("llllllllllllllllll",l)
    #            if "No match" in l:
    #                l.remove('No match')
    #            else:
    #                pass
    #            return l[0]

    def extract_metadata_timesheet(self, analysis, image):
        shape = image.shape
        x_lines, y_lines = self.lines(analysis, shape)

        # DECIDING THE MODULES
        if (self.check_line(x_lines) == 'Time Sheet'):
            return 'Vertical TS'
        else:
            return 'Horizontal TS'

    def lines(self, analysis, shape):

        # HORIZONTAL

        horizontal_lines = []
        clubbed_lines = []
        polygons = [(line["boundingBox"], line["text"])
                    for line in analysis["lines"]]
        lines_api = {}
        # {line_number: Content of that line}
        lines_api = {i + 1: polygons[i][1] for i in range(len(polygons))}

        p1_p3 = {}
        for line_number, line in enumerate(polygons):
            line_number = line_number + 1
            p1_p3[line_number] = line[0][:2], line[0][4:6]

        clubbed_lines = []
        current_depth = 0
        for line_number in p1_p3:

            if (line_number not in clubbed_lines):
                current_depth = int((p1_p3[line_number][1][1] + p1_p3[line_number][0][1]) * 0.5)

                cl = self.get_same_line_words_hori(
                    p1_p3, line_number, current_depth, shape[0])

                clubbed_lines = [line_number] + cl + clubbed_lines
                sl = [line_number] + cl  # SAME LINE NUMBERS
                x = [lines_api[line_number] for line_number in sl]  # LINE
                horizontal_lines.append(x)

        # VERTICAL

        vertical_lines = []
        clubbed_lines_vertical = []
        wc = {}
        for i, line in enumerate(analysis["lines"]):
            wc[i + 1] = [(word['boundingBox'], word['text'])
                         for word in line['words']]

        words_api = {i + 1: word[0][1] for i, word in enumerate(wc.values())}
        p1_p3_words = {i + 1: (word[0][0][:2], word[0][0][4:6])
                       for i, word in enumerate(list(wc.values()))}

        for word_number in p1_p3_words:

            if (word_number not in clubbed_lines_vertical):
                x1 = p1_p3_words[word_number][0][0]
                x2 = p1_p3_words[word_number][1][0]
                cl = self.get_same_line_words_vert(p1_p3_words, word_number, x1, x2, wc)

                clubbed_lines_vertical = [
                                             word_number] + cl + clubbed_lines_vertical
                sl = [word_number] + cl  # SAME LINE NUMBERS
                x = [words_api[word_number] for word_number in sl]  # LINE
                vertical_lines.append(x)
        return horizontal_lines, vertical_lines

    def check_line(self, lines):

        flag_list = []
        flag = 'No match'
        month_flag = "No match"
        transcript_header = set(['Attempted',
                                 'Scored',
                                 'Points',
                                 'Earned',
                                 'Course',
                                 'Description',
                                 'Attempted Earned Grade'])
        #        time_sheet_header = set(['MON',
        #                                 'TUE',
        #                                 'WED',
        #                                 'THU',
        #                                 'FRI',
        #                                 'SAT',
        #                                 'SUN',
        #                                 'Sun',
        #                                 'Mon',
        #                                 'Tue',
        #                                 'Wed',
        #                                 'Thu',
        #                                 'Fri',
        #                                 'Sat',
        #                          'Sun','M','T','W','F','S'])
        weekday_match = re.compile('mon|tue|wed|thu|fri|sat|sun|tot|sum|^m$|^t$|^w$|^f$|^s$|total')
        weekday_match2 = re.compile('^mo$|^tu$|^we$|^th$|^fr$|^sa$|^su$')
        date_match = re.compile(
            r'([(*]((\d{4})|(\d{2}))-(\d{1,2})-(\d{1,2})[)*])|([(*](\d{1,2})-(\d{1,2})-((\d{4})|(\d{2}))[)*])|(\d{1,2})/(\d{1,2})/(\d{4})|(\d{4})/(\d{1,2})/(\d{1,2})|([1-9]|1[0-2])/(\d{1,2})|(\d{1,2})/([1-9]|1[0-2])')

        date_match2 = re.compile(r'jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec')
        clean_lines = []
        for line in lines:

            current_line = line
            # print("herererer", current_line)
            for word in line:
                #   print("word",word)
                if len(word.split()) > 1:
                    split = word.split()
                    current_line.remove(word)
                    current_line = current_line + split
            #      print("current_line",current_line)
            #     print("split",split)
            clean_lines.append(current_line)
        # print(len(clean_lines))
        # print(clean_lines)
        # print("only twice it will come her")

        for line in clean_lines:
            # line = map(lambda x:x.lower(), line_)
            # print("lines",line)
            check_day = [True if weekday_match.search(word.lower()) or weekday_match2.search(word.lower()) else False
                         for word in line]
            check_date = [True if date_match.search(word.lower()) else False for word in line]
            check_date2 = [True if date_match2.search(word.lower()) else False for word in line]
            # print(check_date2)

            if len(transcript_header.intersection(set(line))) >= 2:
                flag = 'Transcript'
                break

            elif sum(check_date) >= 3:
                # print("*"*30)
                # print("lineecheckdate",line)
                month_flag = self.double_check(line)
                flag_list.append(month_flag)

            elif sum(check_date2) >= 3:
                # print("#"*30)
                month_flag = self.get_months(line)
                flag_list.append(month_flag)

            # elif len(time_sheet_header.intersection(set(line))) >= 3:
            #   print("aqqqqui",line)
            #  flag = 'Time Sheet'
            # break
            elif sum(check_day) >= 3 or month_flag == "Time Sheet":
                flag = 'Time Sheet'
                # print(flag)
                # print("it comes here")

                # print("check_day",check_day)
                # print("check_date",check_date)
                # print("check_date2",check_date2)
                flag_list.append(flag)
                break






            else:
                ("stucked here")
                pass

        if "Time Sheet" in flag_list:
            flag = "Time Sheet"
        else:
            pass
        # print("it will call the function now")
        return flag

    # In[7]:

    def get_same_line_words_vert(self, p1_p3_words, line_number, x1, x2, check):
        same_line = []
        for word_oi in p1_p3_words:

            # print("p1_p3_words",p1_p3_words[word_oi])
            # print("x1111111111",x1)
            # print(x2)
            # print(line_number)
            if (word_oi != line_number) and ((int(p1_p3_words[word_oi][0][0]) in range(
                    int(x1) - 2, int(x1) + 3)) or (int(p1_p3_words[word_oi][1][0]) in range(int(x2) - 2, int(x2) + 3))):
                same_line.append(word_oi)
        # print("same_line", same_line)
        return same_line

    def get_same_line_words_hori(self, p1_p3, line_number, dep, page_height):

        current_depth = dep
        same_line = []
        for line_oi in p1_p3:

            line_oi_depth = int((p1_p3[line_oi][1][1] + p1_p3[line_oi][0][1]) * 0.5)
            if page_height > 2000:
                if (line_oi != line_number) and (line_oi_depth in range(
                        int(current_depth) - 10, int(current_depth) + 12)):
                    same_line.append(line_oi)
                else:
                    pass
            else:
                if (line_oi != line_number) and (
                        p1_p3[line_oi][1][1] in range(int(current_depth) - 6, int(current_depth) + 7)):
                    same_line.append(line_oi)
                else:
                    pass
        return same_line

    def get_months(self, indi_lin):
        flag = "No match"
        singlemon = []
        months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        for m in months:
            for val in indi_lin:
                if m in val.lower():
                    singlemon.append(m)
                    # print("val",val)
        if len(singlemon) >= 3 and len(set(singlemon)) <= 2:
            # print("ittttttttttttttttt works")
            flag = "Time Sheet"
        return flag

    def double_check(self, datechk):
        dc_flag = "No match"
        date_list = []
        for i in range(len(datechk)):
            if " " in datechk[i]:
                spl_ = datechk[i].split(" ")
                for next_ind in range(i + 1, ):

                    if " " in datechk[next_ind]:
                        nex_spli = datechk[next_ind].split(" ")
                        # print(spl_,nex_spli)

                        if (spl_[0] == nex_spli[0] or spl_[-1] == nex_spli[-1]) and spl_ != nex_spli:
                            # print("here",nex_spli)
                            date_list.append(datechk[i])
                            date_list.append(datechk[next_ind])

            elif "/" in datechk[i]:
                spl_ = datechk[i].split("/")
                for next_ind in range(i + 1, ):

                    if "/" in datechk[next_ind]:
                        nex_spli = datechk[next_ind].split("/")
                        # print(spl_,nex_spli)

                        if (spl_[0] == nex_spli[0] or spl_[-1] == nex_spli[-1]) and spl_ != nex_spli:
                            # print("here",nex_spli)
                            date_list.append(datechk[i])
                            date_list.append(datechk[next_ind])


            elif "-" in datechk[i]:
                spl_ = datechk[i].split("-")
                for next_ind in range(i + 1, ):

                    if "-" in datechk[next_ind]:
                        nex_spli = datechk[next_ind].split("-")
                        # print(spl_,nex_spli)

                        if (spl_[0] == nex_spli[0] or spl_[-1] == nex_spli[-1]) and spl_ != nex_spli:
                            # print("here",nex_spli)
                            date_list.append(datechk[i])
                            date_list.append(datechk[next_ind])
        if (len(set(date_list))) >= 3:
            # print("date_list",set(date_list))
            dc_flag = "Time Sheet"

        else:
            pass
        return dc_flag
