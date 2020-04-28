# -*- coding: utf-8 -*-
import cv2
import numpy as np


class structure_ex:

    def __init__(self, image):
        self.image = image
        self.scalev = 40
        self.scaleh = 20
        self.bw = self.extract_bw(self.image)
        
        
        
    def extract_bw(self,image):

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        bw = cv2.adaptiveThreshold(
            ~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2)
        
        return bw

    def extract_whitepage_mask(self,bw):

        scalev, scaleh = self.optimal_params(bw, task='table')

        horizontal = bw.copy()
        horizontalStructure = cv2.getStructuringElement(
            cv2.MORPH_RECT, (horizontal.shape[1] // int(scaleh), 1))
        horizontal = cv2.erode(horizontal, horizontalStructure, iterations=1)
        horizontal = cv2.dilate(horizontal, horizontalStructure, iterations=1)
        #horizontal = cv2.dilate(horizontal, np.ones((4, 4)))
        horizontal = horizontal + \
            cv2.morphologyEx(horizontal, cv2.MORPH_GRADIENT, np.ones((4, 4)))

        vertical = bw.copy()
        verticalStructure = cv2.getStructuringElement(
            cv2.MORPH_RECT, (1, vertical.shape[0] // int(scalev)))
        vertical = cv2.erode(vertical, verticalStructure, iterations=1)
        vertical = cv2.dilate(vertical, verticalStructure, iterations=1)
        #vertical = cv2.dilate(vertical, np.ones((4, 4)))
        # ADDDING OUTPUT TO ADDITIONAL LAYER OF EXO SKELETON OF THE LINES
        vertical = vertical + \
            cv2.morphologyEx(vertical, cv2.MORPH_GRADIENT, np.ones((4, 4)))

        mask = horizontal + vertical
        mask_white = cv2.cvtColor(cv2.bitwise_not(mask), cv2.COLOR_GRAY2RGB)
        return mask_white

    # OVERLAP OF HORIZONTAL AND VERTICAL MASKS
    def extract_mask(self,bw, scalev=40, scaleh=20):
       # Scalev and Scaleh are Used to increase/decrease the amount of lines to
       # be detected
        horizontal = bw.copy()
        horizontalStructure = cv2.getStructuringElement(
            cv2.MORPH_RECT, (horizontal.shape[1] // int(scaleh), 1))
        horizontal = cv2.erode(horizontal, horizontalStructure, iterations=1)
        horizontal = cv2.dilate(horizontal, horizontalStructure, iterations=1)
        #horizontal = cv2.dilate(horizontal, np.ones((4, 4)))
        horizontal = horizontal + \
            cv2.morphologyEx(horizontal, cv2.MORPH_GRADIENT, np.ones((4, 4)))

        vertical = bw.copy()
        verticalStructure = cv2.getStructuringElement(
            cv2.MORPH_RECT, (1, vertical.shape[0] // int(scalev)))
        vertical = cv2.erode(vertical, verticalStructure, iterations=1)
        vertical = cv2.dilate(vertical, verticalStructure, iterations=1)
        #vertical = cv2.dilate(vertical, np.ones((4, 4)))
        # ADDDING OUTPUT TO ADDITIONAL LAYER OF EXO SKELETON OF THE LINES
        vertical = vertical + \
            cv2.morphologyEx(vertical, cv2.MORPH_GRADIENT, np.ones((4, 4)))

        return horizontal, vertical

    def optimal_params(self,bw, scalev=40, scaleh=20, task='table'):

        if task == 'table':

            vals_v = {
                i: self.countour_count(
                    bw,
                    scalev=i,
                    scaleh=20,
                    task='table') for i in np.linspace(
                    30,
                    60,
                    10)}
            optimal_scalev = max(vals_v, key=vals_v.get)

            vals_h = {
                i: self.countour_count(
                    bw,
                    scalev=optimal_scalev,
                    scaleh=i,
                    task='table') for i in [
                    10,
                    20]}
            optimal_scaleh = max(vals_h, key=vals_h.get)

            return round(optimal_scalev), optimal_scaleh

        else:

            vals_v = {
                i: self.countour_count(
                    bw,
                    scalev=i,
                    scaleh=20,
                    task='cells') for i in np.linspace(
                    scalev,
                    scalev + 20,
                    5)}
            max_cnt = max(vals_v.values())
            optimal_scalev = min(
                [int(k) for k in vals_v.keys() if vals_v[k] == max_cnt])

            return optimal_scalev, 20

    def countour_count(self,bw, scalev=40, scaleh=20, task='table'):
        horizontal, vertical = self.extract_mask(bw, scalev=scalev, scaleh=20)
        mask = horizontal + vertical

        if task == 'table':
            contours, _ = cv2.findContours(
                mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            parent_area = mask.shape[0] * mask.shape[1]
            areaThr = 0.003 * parent_area
            count = 0
            table_count_dict = {}
            for cnt in contours:
                area = cv2.contourArea(cnt)
                x, y, width, height = cv2.boundingRect(cnt)
                # if  area > areaThr  and  min(width, height) > 12  and
                # is_single_celled(x, y, x+width, y+height,
                # intersection_coordinates):
                if area > areaThr and min(width, height) > 12:
                    table_count_dict[count] = [
                        x, y, x + width - 1, y + height - 1]
                    count += 1

            return count

        else:
            contours, _ = cv2.findContours(
                mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            areaThr = 1200
            count = 0
            table_count_dict = {}
            for cnt in contours:
                area = cv2.contourArea(cnt)
                x, y, width, height = cv2.boundingRect(cnt)
                # if  area > areaThr  and  min(width, height) > 12  and
                # is_single_celled(x, y, x+width, y+height,
                # intersection_coordinates):
                if area > areaThr and min(width, height) > 12:
                    table_count_dict[count] = [
                        x, y, x + width - 1, y + height - 1]
                    count += 1

            return count

    def set_bwimage(self, bw):
        self.bwimage = bw       
    def set_scalevh(self,scalev,scaleh):
        self.scalev = scalev
        self.scaleh = scaleh