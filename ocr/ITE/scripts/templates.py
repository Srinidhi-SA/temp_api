import simplejson as json
import sys


class Templates:

    def __init__(self, template, metadata):
        self.template = template
        self.template_number = self.get_template(metadata)

    def create_new_templates(self):

        # template_obgo to the admin pagej.template
        with open('./ocr/ITE/scripts/database/classified_templates.json', 'r') as f:
            templates = json.load(f)
            f.close()
        print('Total Templates : \n', templates.keys())

        with open('./metadata.json', 'w') as f:  # ALL THE PAGES OF THE DOC TEMPLATE DATA
            f.close()
        print('NEW Metadata FILE CREATED')

    def get_template(self, current_metadata):

        try:
            templates = self.template
            defined_pages = [templates[key]['Pages'] for key in templates.keys()]
            defined_pages = [page for sublist in defined_pages for page in sublist]
            current = list(current_metadata.values())[0]
            page = list(current_metadata.keys())[0]

            ctn = 1
            if page in defined_pages:
                defined_pages = [templates[key]['Pages'] for key in templates.keys()]
                template_number = ([True if page in sublist else False for sublist in defined_pages]).index(True)
                return 'T' + str(template_number + 1), 'match'

            else:
                for tem in templates:
                    reference = templates[tem]['meta']

                    current['table'] = {str(i): val for i, val in current['table'].items()}
                    match_output = self.match(reference, current)
                    if match_output == 'match':

                        if page not in templates[tem]['Pages']:
                            pages = templates[tem]['Pages']
                            pages.append(page)
                            templates[tem]['Pages'] = pages
                        return tem, match_output
                    else:
                        ctn = ctn + 1

            #### WHEN THERE IS NO MATCH
            templates['T' + str(ctn)] = {}
            templates['T' + str(ctn)]['Pages'] = [page]  ## SAVING PAGE NAME ONLY
            templates['T' + str(ctn)]['meta'] = current
            return 'T' + str(ctn), 'No Match'

        except:
            page = list(current_metadata.keys())[0]
            templates = {}
            ctn = 1

            templates['T' + str(ctn)] = {}
            templates['T' + str(ctn)]['Pages'] = [page]  ## SAVING PAGE NAME ONLY
            templates['T' + str(ctn)]['meta'] = current_metadata[page]
            return 'T1', 'No Match'

    """def match(self, reference, current):

        if len(reference['order']) > 0 and (reference['order'] == current['order']):
            return "match"

        elif (reference['no_of_tables'] == current['no_of_tables']) and \
                (current['no_of_tables'] > 0) and \
                abs(len(reference['order']) - len(current['order'])) <= 1.5 * max(len(reference['order']),
                                                                                  len(current['order'])):

            area_percent_difference = max([abs(reference['table'][str(i)][1] - current['table'][str(i)][1]) for i in
                                           range(1, reference['no_of_tables'] + 1)]) < 5
            relative_dist_difference = max([abs(reference['table'][str(i)][0] - current['table'][str(i)][0]) for i in
                                            range(1, reference['no_of_tables'] + 1)]) < 10
            total_relative_area_difference = abs(
                reference['total_relative_table_area'] - current['total_relative_table_area']) < 10

            favorable_cases = sum([area_percent_difference, relative_dist_difference, total_relative_area_difference])
            if favorable_cases == 3:
                return "match"
            elif favorable_cases == 2:
                return 0  ## CHECKS FOR PARAS
            else:
                return 0

            ## CHECK FOR PARA PARAMS  TODO
        #            cur_areas,ref_areas = reference['para_rel_area'].values(),current['para_rel_area'].values()

        elif reference['no_of_tables'] == 0 and current['no_of_tables'] == 0:
            word_density_match = len(set(reference['words']).intersection(set(current['words']))) / len(
                set(current['words']))
            # =============================================================================
            #             print('*'*50)
            #             print('MATCHING BASED ON WORDS AS THERE ARE NO TABLES : \n',word_density_match)
            #             print('*'*50)
            # =============================================================================
            if word_density_match > 0.8:
                return "match"
            else:
                return 0
        else:
            return 0"""

    """def match(self, reference, current):

        if len(reference['order']) > 0 and (reference['order'] == current['order']):
            return "match"



        elif (reference['no_of_tables'] == current['no_of_tables']) and \
                (current['no_of_tables'] > 0) and \
                abs(len(reference['order']) - len(current['order'])) <= 1.5 * max(len(reference['order']),
                                                                                  len(current['order'])):

            area_percent_difference = max([abs(reference['table'][str(i)][1] - current['table'][str(i)][1]) for i in
                                           range(1, reference['no_of_tables'] + 1)]) < 0.05
            relative_dist_difference = max([abs(reference['table'][str(i)][0] - current['table'][str(i)][0]) for i in
                                            range(1, reference['no_of_tables'] + 1)]) < 0.05
            total_relative_area_difference = abs(
                reference['total_relative_table_area'] - current['total_relative_table_area']) < 0.05

            favorable_cases = sum([area_percent_difference, relative_dist_difference, total_relative_area_difference])
            if favorable_cases == 3:
                return "match"
            elif favorable_cases == 2:
                return "match"  ## CHECKS FOR PARAS
            else:
                return 0

            ## CHECK FOR PARA PARAMS  TODO
        #            cur_areas,ref_areas = reference['para_rel_area'].values(),current['para_rel_area'].values()

        elif reference['no_of_tables'] == 0 and current['no_of_tables'] == 0:
            word_density_match = len(set(reference['words']).intersection(set(current['words']))) / len(
                set(current['words']))
            # =============================================================================
            #             print('*'*50)
            #             print('MATCHING BASED ON WORDS AS THERE ARE NO TABLES : \n',word_density_match)
            #             print('*'*50)
            # =============================================================================
            if word_density_match > 0.8:
                return "match"
            else:
                return 0
        else:
            return 0"""

    def match(self, reference, current):

        if (reference['no_of_tables'] == current['no_of_tables']) and \
                (current['no_of_tables'] > 0) and \
                abs(len(reference['order']) - len(current['order'])) <= 1.5 * max(len(reference['order']),
                                                                                  len(current['order'])):

            area_percent_difference = max(
                [abs(reference['table'][str(i)]['Stats'][1] - current['table'][str(i)]['Stats'][1]) for i in
                 range(1, reference['no_of_tables'] + 1)]) < 0.05
            relative_dist_difference = max(
                [abs(reference['table'][str(i)]['Stats'][0] - current['table'][str(i)]['Stats'][0]) for i in
                 range(1, reference['no_of_tables'] + 1)]) < 0.05
            total_relative_area_difference = abs(
                reference['total_relative_table_area'] - current['total_relative_table_area']) < 0.05

            ncols_difference = sum(
                [abs(reference['table'][str(i)]['ncols'] - current['table'][str(i)]['ncols']) for i in
                 range(1, reference['no_of_tables'] + 1)]) <= 1
            nrows_difference = sum(
                [abs(reference['table'][str(i)]['nrows'] - current['table'][str(i)]['nrows']) for i in
                 range(1, reference['no_of_tables'] + 1)]) <= 1

            favorable_cases = sum(
                [area_percent_difference, relative_dist_difference, total_relative_area_difference, nrows_difference,
                 ncols_difference])

            if favorable_cases == 5:
                return "match"
            else:
                return 0

        elif reference['no_of_tables'] == 0 and current['no_of_tables'] == 0:
            word_density_match = len(set(reference['words']).intersection(set(current['words']))) / len(
                set(current['words']))
            if word_density_match > 0.8:
                return "match"
            else:
                return 0
        else:
            return 0
