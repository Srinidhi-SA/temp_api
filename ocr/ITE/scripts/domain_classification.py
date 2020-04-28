# -*- coding: utf-8 -*-
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

        # DECIDING THE MODULES
        if (self.check_line(x_lines) == 'No match') and (
                self.check_line(y_lines) == 'No match'):
            return 'BASE MODULE'

        else:
            l = [self.check_line(x_lines)] + [self.check_line(y_lines)]
            l.remove('No match')
            return l[0]

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

                current_depth = p1_p3[line_number][1][1]

                cl = self.get_same_line_words_hori(
                    p1_p3, line_number, current_depth,shape[0])

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

                cl = self.get_same_line_words_vert(p1_p3_words, word_number, x1, x2)
                clubbed_lines_vertical = [
                    word_number] + cl + clubbed_lines_vertical
                sl = [word_number] + cl  # SAME LINE NUMBERS
                x = [words_api[word_number] for word_number in sl]  # LINE
                vertical_lines.append(x)

        return horizontal_lines, vertical_lines

    def check_line(self, lines):

        flag = 'No match'
        transcript_header = set(['Attempted',
                                 'Scored',
                                 'Points',
                                 'Earned',
                                 'Course',
                                 'Description',
                                 'Attempted Earned Grade'])
        time_sheet_header = set(['Mon',
                                 'Tue',
                                 'Wed',
                                 'Thu',
                                 'Fri',
                                 'Sat',
                                 'Sun',
                                 'Mon,',
                                 'Tue,',
                                 'Wed,',
                                 'Thu,',
                                 'Fri,',
                                 'Sat,',
                                 'Sun,'])

        clean_lines = []
        for line in lines:
            current_line = line
            for word in line:
                if len(word.split()) > 1:
                    split = word.split()
                    current_line.remove(word)
                    current_line = current_line + split
            clean_lines.append(current_line)

        for line in clean_lines:
            if len(transcript_header.intersection(set(line))) >= 2:
                flag = 'Transcript'
                break
            elif len(time_sheet_header.intersection(set(line))) >= 3:
                flag = 'Time Sheet'
                break
            else:
                pass

        return flag


    # In[7]:

    def get_same_line_words_vert(self, p1_p3_words, line_number, x1, x2):

        same_line = []
        for word_oi in p1_p3_words:
            #         print(p1_p3_words[word_oi])
            if (word_oi != line_number) and ((int(p1_p3_words[word_oi][0][0]) in range(
                    int(x1) - 2, int(x1) + 3)) or (int(p1_p3_words[word_oi][1][0]) in range(int(x2) - 2, int(x2) + 3))):
                same_line.append(word_oi)
        return same_line

    def get_same_line_words_hori(self, p1_p3, line_number, dep, page_height):

        current_depth = dep
        same_line = []
        for line_oi in p1_p3:

            if page_height > 2000:
                if (line_oi != line_number) and (int(p1_p3[line_oi][1][1]) in range(
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
