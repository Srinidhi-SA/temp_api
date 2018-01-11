import json
from rest_framework.utils import humanize_datetime
from django.conf import settings





def convert_to_string(data):

    keys = ['meta_data', 'datasource_details']

    for key in keys:
        if key in data:
            value = data[key]
            if isinstance(value, str or unicode):
                pass
            elif isinstance(value, dict):
                data[key] = json.dumps(value)

    return data


def convert_to_json(data):
    keys = ['meta_data', 'datasource_details', 'preview']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = json.loads(value)
    return data


def convert_time_to_human(data):

    keys = ['created_on', 'updated_on']

    for key in keys:
        if key in data:
            value = data[key]
            data[key] = humanize_datetime.humanize_strptime(value)
    return data


def convert_metadata_according_to_transformation_setting(meta_data=None, transformation_setting=None):

    if meta_data is not None:
        uiMetaData = meta_data
    else:
        return {}

    ts = transformation_setting
    metaData = uiMetaData.get("metaDataUI")
    sampleData = uiMetaData.get("sampleDataUI")
    headers = uiMetaData.get("headersUI")
    columnData = uiMetaData.get("columnDataUI")

    read_and_change_metadata(
        ts=ts,
        metaData=metaData,
        headers=headers,
        columnData=columnData,
        sampleData=sampleData
    )
    uiMetaData['transformation_setting'] = transformation_setting
    uiMetaData['modified'] = True
    return uiMetaData


def read_and_change_metadata(ts, metaData, headers, columnData, sampleData):

    mdc = MetaDataChange(
        metaData=metaData,
        headers=headers,
        ts=ts,
        columnData=columnData,
        sampleData=sampleData
    )

    ts = ts.get('existingColumns')

    for col in ts:
        columnSetting_Temp = None
        if "columnSetting" in col:
            columnSetting = col.get("columnSetting")

            for colset in columnSetting:
                if colset.get("status") == True:

                    if colset.get("actionName") == "delete":

                        if 'modified' in colset:
                            if colset.get('modified') == True:
                                pass
                            else:
                                pass
                        else:
                            colset['modified'] = True

                        colset['displayName'] = 'UnDelete Column'

                        mdc.changes_on_delete(col.get("name"), type='delete')

                    if colset.get("actionName") == "rename":
                        colName = col.get('name')
                        newName = colset.get('newName')

                        if 'modified' in colset:
                            if colset.get('modified') == True:
                                colset['prevName'] = newName
                        else:
                            colset['modified'] = True
                            colset['prevName'] = colName
                        mdc.changes_on_rename(
                            colName=colName,
                            newName=newName
                        )
                    if colset.get("actionName") == "data_type":
                        listOfActions = colset.get('listOfActions')
                        data_type = {}
                        for data in listOfActions:
                            if data.get('status') == True:
                                mdc.changes_on_data_type(
                                    colName=col.get('name'),
                                    type=data.get('name')
                                )

                    if colset.get('actionName') == 'replace':
                        colName = col.get('name')
                        replacementValues = colset.get('replacementValues')
                        mdc.replace_values(
                            colName=colName,
                            replace_match_array=replacementValues
                        )

                elif colset.get("status") == False:

                    if colset.get("actionName") == "delete":

                        if 'modified' in colset:

                            if colset.get('modified') == True:
                                mdc.changes_on_delete(col.get("name"), type='undelete')
                                colset['modified'] = False
                                colset['displayName'] = 'Delete Column'

    return metaData, headers

#
# def changes_in_column_data_if_column_is_considered(self, col):
#     import copy
#     from django.conf import settings
#
#     transformation_settings = settings.TRANSFORMATION_SETTINGS_CONSTANT
#
#     columnSettingCopy = copy.deepcopy(transformation_settings.get('columnSetting'))
#     columnType = col.get('columnType')
#
#     if "dimension" == columnType:
#         head['columnSetting'] = columnSettingCopy[:4]
#     elif "boolean" == columnType:
#         head['columnSetting'] = columnSettingCopy[:4]
#     elif "measure" == columnType:
#         datatype_element = columnSettingCopy[4]
#         datatype_element['listOfActions'][0]["status"] = True
#         columnSettingCopy[5]['listOfActions'][0]["status"] = True
#         columnSettingCopy[6]['listOfActions'][0]["status"] = True
#
#         head['columnSetting'] = columnSettingCopy
#     elif "datetime" == columnType:
#         head['columnSetting'] = columnSettingCopy[:3]
#
#     transformation_settings_ignore = copy.deepcopy(settings.TRANSFORMATION_SETTINGS_IGNORE)
#     transformation_settings_ignore['status'] = True
#     transformation_settings_ignore['displayName'] = 'Consider for Analysis'
#     head['columnSetting'].append(transformation_settings_ignore)
#     head['consider'] = False
#     break

# from api.datasets.helper import *
# convert_metadata_according_to_transformation_setting()
class MetaDataChange(object):

    def __init__(self, **kwargs):

        self.metaData = kwargs.get("metaData")
        self.headers = kwargs.get("headers")
        self.ts = kwargs.get("ts")
        self.columnData = kwargs.get("columnData")
        self.sampleData = kwargs.get("sampleData")

    def changes_on_delete(self, colName=None, type='delete'):
        """
        metaData - *
        :return:
        """

        if colName is None:
            return

        self.change_col_from_noOfColumns(colName, type=type)
        self.changes_from_measure_or_dimension_or_timeDimension_also_count(colName, type=type)

    def change_col_from_noOfColumns(self, colName=None, type=None):

        for data in self.metaData:
            if data.get("name") == "noOfColumns":
                if type == 'delete':
                    data['value'] = data['value'] - 1
                elif type == 'undelete':
                    data['value'] = data['value'] + 1
                break

    def changes_from_measure_or_dimension_or_timeDimension_also_count(self, colName=None, type=None):
        indexes = {
            "measures": None,
            "dimensions": None,
            "timeDimension": None,
            "measureColumns": None,
            "dimensionColumns": None,
            "timeDimensionColumns": None

        }

        match_for_name = {
            "measure": 'measures',
            "dimension": 'dimensions',
            "timeDimension": 'timeDimension',
        }

        match_for_column = {
            "measures": 'measureColumns',
            "dimensions": 'dimensionColumns',
            "timeDimension": 'timeDimensionColumns',
            "measure": 'measureColumns',
            "dimension": 'dimensionColumns'
        }

        for i, data in enumerate(self.metaData):
            if data['name'] in indexes:
                indexes[data["name"]] = i

        measures_array = self.metaData[indexes["measureColumns"]].get("value")
        dimensions_array = self.metaData[indexes["dimensionColumns"]].get("value")
        time_dimensions_array = self.metaData[indexes["timeDimensionColumns"]].get("value")

        type_of_col = None
        if type == "undelete":
            for data in self.columnData:
                if data.get('name') == colName:
                    type_of_col = data.get('columnType')
                    break

        if type_of_col is not None:
            self.metaData[indexes[match_for_name[type_of_col]]]["value"] = self.metaData[indexes[match_for_name[type_of_col]]]["value"] + 1
            self.metaData[indexes[match_for_column[type_of_col]]]["value"].append(colName)
            return ""

        if colName in measures_array:
            if type == 'delete':
                measures_array.remove(colName)
                self.metaData[indexes["measures"]]["value"] = self.metaData[indexes["measures"]]["value"] - 1
        elif colName in dimensions_array:
            if type == 'delete':
                dimensions_array.remove(colName)
                self.metaData[indexes["dimensions"]]["value"] = self.metaData[indexes["dimensions"]]["value"] - 1
        elif colName in time_dimensions_array:
            if type == 'delete':
                time_dimensions_array.remove(colName)
                self.metaData[indexes["timeDimension"]]["value"] = self.metaData[indexes["timeDimension"]]["value"] - 1


    def changes_on_rename(self, colName=None, newName=None, type='name'):
        """
        metaData - *
        headers - *
        :return:
        """
        if colName is None:
            raise Exception("no col name>changes_on_rename")

        if newName is None:
            raise Exception("no new name>changes_on_rename")

        self.rename_in_measure_or_dimension_or_timeDimension(colName, newName)
        self.rename_in_headers(colName, newName)

    def rename_in_measure_or_dimension_or_timeDimension(self, colName=None, newName=None):
        if colName is None :
            raise Exception("no col name > rename_in_measure_or_dimension_or_timeDimension")

        if newName is None:
            raise Exception("no new name > rename_in_measure_or_dimension_or_timeDimension")

        indexes = {
            "measures": None,
            "dimensions": None,
            "timeDimension": None,
            "measureColumns": None,
            "dimensionColumns": None,
            "timeDimensionColumns": None
        }

        for i, data in enumerate(self.metaData):
            if data['name'] in indexes:
                indexes[data["name"]] = i

        measures_array = self.metaData[indexes["measureColumns"]].get("value")
        dimensions_array = self.metaData[indexes["dimensionColumns"]].get("value")
        time_dimensions_array = self.metaData[indexes["timeDimensionColumns"]].get("value")

        if colName in measures_array:
            for i, value in enumerate(measures_array):
                if value == colName:
                    measures_array[i] = newName
        elif colName in dimensions_array:
            for i, value in enumerate(dimensions_array):
                if value == colName:
                    dimensions_array[i] = newName
        elif colName in time_dimensions_array:
            for i, value in enumerate(time_dimensions_array):
                if value == colName:
                    time_dimensions_array[i] = newName

    def rename_in_headers(self, colName=None, newName=None):

        if colName is None or newName is None:
            raise Exception("no name")

        for head in self.columnData:

            if head.get('name') == colName:
                head['name'] = newName
                break

    def changes_on_data_type(self, colName=None, type=None):
        """
        metaData - *
        columnsData - *
        :return:
        """
        if colName is None or type is None:
            raise Exception("No colName or Type")

        match_in_columnstats = {
            'numeric': 'measure',
            'text': 'dimension'
        }

        match_in_row_metaData = {
            'numeric': 'measures',
            'text': 'dimensions'
        }

        match_in_array_metaData = {
            'numeric': 'measureColumns',
            'text': 'dimensionColumns'
        }

        for data in self.columnData:
            if data.get('name') == colName:
                if data['columnType'] == match_in_columnstats[type]:
                    return ""
                data['columnType'] = match_in_columnstats[type]
        
        if type == 'numeric':
            for data in self.metaData:
                if data.get('name') == 'measures':
                    data['value'] = data['value'] + 1
                if data.get('name') == 'measureColumns':
                    data['value'].append(colName)
                if data.get('name') == 'dimensions':
                    data['value'] = data['value'] - 1
                if data.get('name') == 'dimensionColumns':
                    if 'colName' in data['value']:
                        data['value'].remove(colName)
        elif type == 'text':
            for data in self.metaData:
                if data.get('name') == 'measures':
                    data['value'] = data['value'] - 1
                if data.get('name') == 'measureColumns':
                    if 'colName' in data['value']:
                        data['value'].remove(colName)
                if data.get('name') == 'dimensions':
                    data['value'] = data['value'] + 1
                if data.get('name') == 'dimensionColumns':
                    data['value'].append(colName)

    def replace_values(self, colName=None, replace_match_array=None):
        if replace_match_array is None:
            raise Exception('Nothing to replace. >> replace_values')
        if colName is None:
            raise Exception('No colname. >> replace_values')

        index = None
        for i, head in enumerate(self.headers):
            if head.get('name') == colName:
                index = i
                break

        for data in self.sampleData:
            for r in replace_match_array:
                replaceType = r.get('replaceType')
                if replaceType == "contains":
                    data[index] = data[index].replace(r['valueToReplace'], r['replacedValue'])
                elif replaceType == "startsWith":
                    if data[index].startswith(r['valueToReplace']):
                        data[index] = r['replacedValue']+data[index][len(r['valueToReplace']):]
                elif replaceType == "endsWith":
                    if data[index].endswith(r['valueToReplace']):
                        data[index] = data[index][:-len(r['valueToReplace'])]+r['replacedValue']
                elif replaceType == "equals":
                    if data[index] == r['valueToReplace']:
                        data[index] = data[index].replace(r['valueToReplace'], r['replacedValue'])
                elif replaceType == "":
                    pass

    def changes_on_consider_column(self, colName=None, make_it=None):
        for data in self.columnData:
            if data.get('name') == colName:
                data['consider'] = make_it
                # data['ignoreSuggestionFlag'] = not make_it
                break

    def changes_in_column_data_if_column_is_considered(self, colName):
        import copy
        from django.conf import settings
        for head in self.columnData:
            if head.get('name') == colName:
                transformation_settings = settings.TRANSFORMATION_SETTINGS_CONSTANT

                columnSettingCopy = copy.deepcopy(transformation_settings.get('columnSetting'))
                columnType = head.get('columnType')

                if "dimension" == columnType:
                    head['columnSetting'] = columnSettingCopy[:4]
                elif "boolean" == columnType:
                    head['columnSetting'] = columnSettingCopy[:4]
                elif "measure" == columnType:
                    datatype_element = columnSettingCopy[4]
                    datatype_element['listOfActions'][0]["status"] = True
                    columnSettingCopy[5]['listOfActions'][0]["status"] = True
                    columnSettingCopy[6]['listOfActions'][0]["status"] = True

                    head['columnSetting'] = columnSettingCopy
                elif "datetime" == columnType:
                    head['columnSetting'] = columnSettingCopy[:3]

                transformation_settings_ignore = copy.deepcopy(settings.TRANSFORMATION_SETTINGS_IGNORE)
                transformation_settings_ignore['status'] = True
                transformation_settings_ignore['displayName'] = 'Consider for Analysis'
                head['columnSetting'].append(transformation_settings_ignore)
                head['consider'] = False

                return head['columnSetting']

    def changes_in_column_data_if_column_is_ignore(self, colName):
        import copy
        from django.conf import settings
        for head in self.columnData:
            if head.get('name') == colName:
                transformation_settings = settings.TRANSFORMATION_SETTINGS_CONSTANT_DELETE
                columnSettingCopy = copy.deepcopy(transformation_settings.get('columnSetting'))
                head['columnSetting'] = columnSettingCopy

                transformation_settings_ignore = copy.deepcopy(settings.TRANSFORMATION_SETTINGS_IGNORE)
                transformation_settings_ignore['status'] = True
                transformation_settings_ignore['displayName'] = 'Consider for Analysis'
                head['columnSetting'].append(transformation_settings_ignore)
                head['consider'] = False
                return head['columnSetting']



dummy_meta_data = {
        "transformation_settings": [
            {
                "columnSetting": [
                    {
                        "status": True,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    },
                    {
                        "status": False,
                        "actionName": "set_variable",
                        "displayName": "Set Variable as",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "General",
                                "name": "general"
                            },
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Percentage",
                                "name": "percentage"
                            },
                            {
                                "status": False,
                                "displayName": "Index",
                                "name": "index"
                            },
                            {
                                "status": False,
                                "displayName": "Average",
                                "name": "average"
                            }
                        ]
                    },
                    {
                        "status": False,
                        "actionName": "set_polarity",
                        "displayName": "Set Polarity as",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Positive",
                                "name": "positive"
                            },
                            {
                                "status": False,
                                "displayName": "Negative",
                                "name": "negative"
                            }
                        ]
                    }

                ],
                "name": "Age",
                "slug": "e496c1e9f5c34edf8acbd17513a0deb6"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "BusinessTravel",
                "slug": "1c5de02a606d41c78992486926f42119"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "DailyRate",
                "slug": "0cd61cfb39784b688b64ab7a2c2489a2"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "Department",
                "slug": "e6b733e796b74c1ba39bc56a8681335a"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "DistanceFromHome",
                "slug": "e9c34c2654f142c7a6ac43ff3fe17545"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "Education",
                "slug": "b105c8bbedff4f9cabe6c3b810e57cf8"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "EducationField",
                "slug": "cafb6efad7aa4f07beecedb29e43308a"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "EmployeeCount",
                "slug": "f03a800c214742379f2f39426c7039ff"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "EmployeeNumber",
                "slug": "87151576eca84a0b8cf590b049bc61ca"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "EnvironmentSatisfaction",
                "slug": "d1301f9cb62d42fdbcfc2f6bd3818018"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "Gender",
                "slug": "ac0b1ba8f4904d24a0f798731b491355"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "HourlyRate",
                "slug": "e3ec2233033c4815aa9dfe940a398132"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "JobInvolvement",
                "slug": "aaf326bf52db420aa12d3713f559ae68"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "JobLevel",
                "slug": "c63b8d81757c4ba3a6f85553f8e6c945"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "JobRole",
                "slug": "202d81e591f749bd96a83071fffc0a26"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "JobSatisfaction",
                "slug": "e70aa467595e42c9881c9cbd0084c9d6"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "MaritalStatus",
                "slug": "522de90d92204c56b634620d9028d66f"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "MonthlyIncome",
                "slug": "081cf9a69cc242d790a8be5ba984381f"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "MonthlyRate",
                "slug": "443f81d7de464efd947ef0dd5a775ee5"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "NumCompaniesWorked",
                "slug": "cfaa93c0b2c9478ea57edef6dca792e3"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "Over18",
                "slug": "a5c9fe8252b84ac1afbc09f9dd26297a"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "OverTime",
                "slug": "e736d3aac11840d5b7fb35905ad8eb72"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "PercentSalaryHike",
                "slug": "0039a4437bc9458c8195d65b911f20d1"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "PerformanceRating",
                "slug": "e80a1e0c285449adb02eadd18ebba0d9"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "RelationshipSatisfaction",
                "slug": "37f41bff41c04fde80a5a555073c3c17"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "StandardHours",
                "slug": "976a0424969b4d2a9225b956d11235f4"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "StockOptionLevel",
                "slug": "17782e73ed7e4693beae6833069eab58"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "TotalWorkingYears",
                "slug": "5ef815674d134ed08b5c6b77ff1dbda6"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "TrainingTimesLastYear",
                "slug": "25d25cb6f2554474b36afe22b4aded59"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "WorkLifeBalance",
                "slug": "6a1ae8af702c4ab282a33e48ebaa0b30"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "YearsAtCompany",
                "slug": "553a8465f06a40848d64159339542286"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "YearsInCurrentRole",
                "slug": "f476ff7b68c147a98eac797c3535e95b"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "YearsSinceLastPromotion",
                "slug": "0bd56b0b1dfd4f9e934c81b0e7958cdd"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "YearsWithCurrManager",
                "slug": "89ee7c7fd7ca4e7ab8e0530eee20cd2e"
            },
            {
                "columnSetting": [
                    {
                        "status": False,
                        "actionName": "delete",
                        "displayName": "Delete Column"
                    },
                    {
                        "status": False,
                        "actionName": "rename",
                        "displayName": "Rename Column",
                        "newName": None
                    },
                    {
                        "status": False,
                        "actionName": "replace",
                        "displayName": "Replace Values",
                        "replacementValues": []
                    },
                    {
                        "status": False,
                        "actionName": "data_type",
                        "displayName": "Change Datatype",
                        "listOfActions": [
                            {
                                "status": False,
                                "displayName": "Numeric",
                                "name": "numeric"
                            },
                            {
                                "status": False,
                                "displayName": "Text",
                                "name": "text"
                            }
                        ]
                    }
                ],
                "name": "Attrition",
                "slug": "99dbd074205f43819fa922dc55b1ea0a"
            },
            {
                "new_columns": [
                    {
                        "orderedColNames": [],
                        "operators": [
                            {
                                "status": True,
                                "displayName": "Addition",
                                "name": "+"
                            },
                            {
                                "status": False,
                                "displayName": "Sub dsada",
                                "name": "-"
                            }
                        ],
                        "newColName": None
                    }
                ]
            }
        ],
        "possibleAnalysis": {
            "time_dimension": {
                "help_text": "Enable this analysis type only if date columns is present in selected variables",
                "display": "Trend",
                "name": "Trend",
                "id": "trend"
            },
            "target_variable": {
                "dimension": [
                    {
                        "display": "Overview",
                        "name": "Descriptive analysis",
                        "id": "descriptive-analysis"
                    },
                    {
                        "display": "Association",
                        "name": "Dimension vs. Dimension",
                        "id": "dimension-vs-dimension"
                    },
                    {
                        "display": "Prediction",
                        "name": "Predictive modeling",
                        "id": "predictive-modeling"
                    }
                ],
                "measure": [
                    {
                        "display": "Overview",
                        "name": "Descriptive analysis",
                        "id": "descriptive-analysis"
                    },
                    {
                        "display": "Performance",
                        "name": "Measure vs. Dimension",
                        "id": "measure-vs-dimension"
                    },
                    {
                        "display": "Influencer",
                        "name": "Measure vs. Measure",
                        "id": "measure-vs-measure"
                    },
                    {
                        "display": "Prediction",
                        "name": "Predictive modeling",
                        "id": "predictive-modeling"
                    }
                ]
            }
        },
        "sampleData": [
            [
                "32",
                "Travel_Frequently",
                "1005",
                "Research & Development",
                "2",
                "College",
                "Life Sciences",
                "1",
                "8",
                "Very High",
                "Male",
                "79",
                "High",
                "1",
                "Laboratory Technician",
                "Very High",
                "Single",
                "3068",
                "11864",
                "0",
                "Y",
                "No",
                "13",
                "Excellent",
                "High",
                "80",
                "0",
                "8",
                "2",
                "Good",
                "7",
                "7",
                "3",
                "6",
                "No"
            ],
            [
                "59",
                "Travel_Rarely",
                "1324",
                "Research & Development",
                "3",
                "Bachelor",
                "Medical",
                "1",
                "10",
                "High",
                "Female",
                "81",
                "Very High",
                "1",
                "Laboratory Technician",
                "Low",
                "Married",
                "2670",
                "9964",
                "4",
                "Y",
                "Yes",
                "20",
                "Outstanding",
                "Low",
                "80",
                "3",
                "12",
                "3",
                "Good",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "30",
                "Travel_Rarely",
                "1358",
                "Research & Development",
                "24",
                "Below College",
                "Life Sciences",
                "1",
                "11",
                "Very High",
                "Male",
                "67",
                "High",
                "1",
                "Laboratory Technician",
                "High",
                "Divorced",
                "2693",
                "13335",
                "1",
                "Y",
                "No",
                "22",
                "Outstanding",
                "Medium",
                "80",
                "1",
                "1",
                "2",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "34",
                "Travel_Rarely",
                "1346",
                "Research & Development",
                "19",
                "College",
                "Medical",
                "1",
                "18",
                "Medium",
                "Male",
                "93",
                "High",
                "1",
                "Laboratory Technician",
                "Very High",
                "Divorced",
                "2661",
                "8758",
                "0",
                "Y",
                "No",
                "11",
                "Excellent",
                "High",
                "80",
                "1",
                "3",
                "2",
                "Better",
                "2",
                "2",
                "1",
                "2",
                "No"
            ],
            [
                "29",
                "Travel_Rarely",
                "1389",
                "Research & Development",
                "21",
                "Master",
                "Life Sciences",
                "1",
                "20",
                "Medium",
                "Female",
                "51",
                "Very High",
                "3",
                "Manufacturing Director",
                "Low",
                "Divorced",
                "9980",
                "10195",
                "1",
                "Y",
                "No",
                "11",
                "Excellent",
                "High",
                "80",
                "1",
                "10",
                "1",
                "Better",
                "10",
                "9",
                "8",
                "8",
                "No"
            ],
            [
                "32",
                "Travel_Frequently",
                "1125",
                "Research & Development",
                "16",
                "Below College",
                "Life Sciences",
                "1",
                "33",
                "Medium",
                "Female",
                "72",
                "Low",
                "1",
                "Research Scientist",
                "Low",
                "Single",
                "3919",
                "4681",
                "1",
                "Y",
                "Yes",
                "22",
                "Outstanding",
                "Medium",
                "80",
                "0",
                "10",
                "5",
                "Better",
                "10",
                "2",
                "6",
                "7",
                "Yes"
            ],
            [
                "46",
                "Travel_Rarely",
                "705",
                "Sales",
                "2",
                "Master",
                "Marketing",
                "1",
                "38",
                "Medium",
                "Female",
                "83",
                "High",
                "5",
                "Manager",
                "Low",
                "Single",
                "18947",
                "22822",
                "3",
                "Y",
                "No",
                "12",
                "Excellent",
                "Very High",
                "80",
                "0",
                "22",
                "2",
                "Good",
                "2",
                "2",
                "2",
                "1",
                "No"
            ],
            [
                "34",
                "Non-Travel",
                "1065",
                "Sales",
                "23",
                "Master",
                "Marketing",
                "1",
                "60",
                "Medium",
                "Male",
                "72",
                "High",
                "2",
                "Sales Executive",
                "High",
                "Single",
                "4568",
                "10034",
                "0",
                "Y",
                "No",
                "20",
                "Outstanding",
                "High",
                "80",
                "0",
                "10",
                "2",
                "Better",
                "9",
                "5",
                "8",
                "7",
                "No"
            ],
            [
                "46",
                "Travel_Frequently",
                "1211",
                "Sales",
                "5",
                "Master",
                "Marketing",
                "1",
                "62",
                "Low",
                "Male",
                "98",
                "High",
                "2",
                "Sales Executive",
                "Very High",
                "Single",
                "5772",
                "20445",
                "4",
                "Y",
                "Yes",
                "21",
                "Outstanding",
                "High",
                "80",
                "0",
                "14",
                "4",
                "Better",
                "9",
                "6",
                "0",
                "8",
                "No"
            ],
            [
                "38",
                "Travel_Frequently",
                "653",
                "Research & Development",
                "29",
                "Doctor",
                "Life Sciences",
                "1",
                "79",
                "Very High",
                "Female",
                "50",
                "High",
                "2",
                "Laboratory Technician",
                "Very High",
                "Single",
                "2406",
                "5456",
                "1",
                "Y",
                "No",
                "11",
                "Excellent",
                "Very High",
                "80",
                "0",
                "10",
                "2",
                "Better",
                "10",
                "3",
                "9",
                "9",
                "No"
            ],
            [
                "31",
                "Travel_Rarely",
                "1082",
                "Research & Development",
                "1",
                "Master",
                "Medical",
                "1",
                "95",
                "High",
                "Male",
                "87",
                "High",
                "1",
                "Research Scientist",
                "Medium",
                "Single",
                "2501",
                "18775",
                "1",
                "Y",
                "No",
                "17",
                "Excellent",
                "Medium",
                "80",
                "0",
                "1",
                "4",
                "Better",
                "1",
                "1",
                "1",
                "0",
                "No"
            ],
            [
                "36",
                "Travel_Rarely",
                "132",
                "Research & Development",
                "6",
                "Bachelor",
                "Life Sciences",
                "1",
                "97",
                "Medium",
                "Female",
                "55",
                "Very High",
                "1",
                "Laboratory Technician",
                "Very High",
                "Married",
                "3038",
                "22002",
                "3",
                "Y",
                "No",
                "12",
                "Excellent",
                "Medium",
                "80",
                "0",
                "5",
                "3",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "45",
                "Travel_Rarely",
                "193",
                "Research & Development",
                "6",
                "Master",
                "Other",
                "1",
                "101",
                "Very High",
                "Male",
                "52",
                "High",
                "3",
                "Research Director",
                "Low",
                "Married",
                "13245",
                "15067",
                "4",
                "Y",
                "Yes",
                "14",
                "Excellent",
                "Medium",
                "80",
                "0",
                "17",
                "3",
                "Best",
                "0",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "51",
                "Travel_Rarely",
                "632",
                "Sales",
                "21",
                "Master",
                "Marketing",
                "1",
                "120",
                "High",
                "Male",
                "71",
                "High",
                "2",
                "Sales Executive",
                "Very High",
                "Single",
                "5441",
                "8423",
                "0",
                "Y",
                "Yes",
                "22",
                "Outstanding",
                "Very High",
                "80",
                "0",
                "11",
                "2",
                "Bad",
                "10",
                "7",
                "1",
                "0",
                "No"
            ],
            [
                "24",
                "Travel_Rarely",
                "1127",
                "Research & Development",
                "18",
                "Below College",
                "Life Sciences",
                "1",
                "150",
                "Medium",
                "Male",
                "52",
                "High",
                "1",
                "Laboratory Technician",
                "High",
                "Married",
                "2774",
                "13257",
                "0",
                "Y",
                "No",
                "12",
                "Excellent",
                "High",
                "80",
                "1",
                "6",
                "2",
                "Better",
                "5",
                "3",
                "1",
                "2",
                "No"
            ],
            [
                "34",
                "Travel_Rarely",
                "1031",
                "Research & Development",
                "6",
                "Master",
                "Life Sciences",
                "1",
                "151",
                "High",
                "Female",
                "45",
                "Medium",
                "2",
                "Research Scientist",
                "Medium",
                "Divorced",
                "4505",
                "15000",
                "6",
                "Y",
                "No",
                "15",
                "Excellent",
                "High",
                "80",
                "1",
                "12",
                "3",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "34",
                "Travel_Rarely",
                "1354",
                "Research & Development",
                "5",
                "Bachelor",
                "Medical",
                "1",
                "153",
                "High",
                "Female",
                "45",
                "Medium",
                "3",
                "Manager",
                "Low",
                "Single",
                "11631",
                "5615",
                "2",
                "Y",
                "No",
                "12",
                "Excellent",
                "Very High",
                "80",
                "0",
                "14",
                "6",
                "Better",
                "11",
                "10",
                "5",
                "8",
                "No"
            ],
            [
                "43",
                "Travel_Frequently",
                "394",
                "Sales",
                "26",
                "College",
                "Life Sciences",
                "1",
                "158",
                "High",
                "Male",
                "92",
                "High",
                "4",
                "Manager",
                "Very High",
                "Married",
                "16959",
                "19494",
                "1",
                "Y",
                "Yes",
                "12",
                "Excellent",
                "Very High",
                "80",
                "2",
                "25",
                "3",
                "Best",
                "25",
                "12",
                "4",
                "12",
                "No"
            ],
            [
                "33",
                "Non-Travel",
                "750",
                "Sales",
                "22",
                "College",
                "Marketing",
                "1",
                "160",
                "High",
                "Male",
                "95",
                "High",
                "2",
                "Sales Executive",
                "Medium",
                "Married",
                "6146",
                "15480",
                "0",
                "Y",
                "No",
                "13",
                "Excellent",
                "Low",
                "80",
                "1",
                "8",
                "2",
                "Best",
                "7",
                "7",
                "0",
                "7",
                "No"
            ],
            [
                "51",
                "Travel_Rarely",
                "684",
                "Research & Development",
                "6",
                "Bachelor",
                "Life Sciences",
                "1",
                "162",
                "Low",
                "Male",
                "51",
                "High",
                "5",
                "Research Director",
                "High",
                "Single",
                "19537",
                "6462",
                "7",
                "Y",
                "No",
                "13",
                "Excellent",
                "High",
                "80",
                "0",
                "23",
                "5",
                "Better",
                "20",
                "18",
                "15",
                "15",
                "No"
            ],
            [
                "26",
                "Travel_Rarely",
                "1355",
                "Human Resources",
                "25",
                "Below College",
                "Life Sciences",
                "1",
                "177",
                "High",
                "Female",
                "61",
                "High",
                "1",
                "Human Resources",
                "High",
                "Married",
                "2942",
                "8916",
                "1",
                "Y",
                "No",
                "23",
                "Outstanding",
                "Very High",
                "80",
                "1",
                "8",
                "3",
                "Better",
                "8",
                "7",
                "5",
                "7",
                "No"
            ],
            [
                "39",
                "Travel_Rarely",
                "1329",
                "Sales",
                "4",
                "Master",
                "Life Sciences",
                "1",
                "182",
                "Very High",
                "Female",
                "47",
                "Medium",
                "2",
                "Sales Executive",
                "High",
                "Married",
                "5902",
                "14590",
                "4",
                "Y",
                "No",
                "14",
                "Excellent",
                "High",
                "80",
                "1",
                "17",
                "1",
                "Best",
                "15",
                "11",
                "5",
                "9",
                "No"
            ],
            [
                "30",
                "Travel_Rarely",
                "1240",
                "Human Resources",
                "9",
                "Bachelor",
                "Human Resources",
                "1",
                "184",
                "High",
                "Male",
                "48",
                "High",
                "2",
                "Human Resources",
                "Very High",
                "Married",
                "6347",
                "13982",
                "0",
                "Y",
                "Yes",
                "19",
                "Excellent",
                "Very High",
                "80",
                "0",
                "12",
                "2",
                "Bad",
                "11",
                "9",
                "4",
                "7",
                "No"
            ],
            [
                "32",
                "Travel_Rarely",
                "1033",
                "Research & Development",
                "9",
                "Bachelor",
                "Medical",
                "1",
                "190",
                "Low",
                "Female",
                "41",
                "High",
                "1",
                "Laboratory Technician",
                "Low",
                "Single",
                "4200",
                "10224",
                "7",
                "Y",
                "No",
                "22",
                "Outstanding",
                "Low",
                "80",
                "0",
                "10",
                "2",
                "Best",
                "5",
                "4",
                "0",
                "4",
                "Yes"
            ],
            [
                "30",
                "Travel_Rarely",
                "1427",
                "Research & Development",
                "2",
                "Below College",
                "Medical",
                "1",
                "198",
                "Medium",
                "Male",
                "35",
                "Medium",
                "1",
                "Laboratory Technician",
                "Very High",
                "Single",
                "2720",
                "11162",
                "0",
                "Y",
                "No",
                "13",
                "Excellent",
                "Very High",
                "80",
                "0",
                "6",
                "3",
                "Better",
                "5",
                "3",
                "1",
                "2",
                "No"
            ],
            [
                "35",
                "Travel_Rarely",
                "662",
                "Sales",
                "1",
                "Doctor",
                "Marketing",
                "1",
                "204",
                "High",
                "Male",
                "94",
                "High",
                "3",
                "Sales Executive",
                "Medium",
                "Married",
                "7295",
                "11439",
                "1",
                "Y",
                "No",
                "13",
                "Excellent",
                "Low",
                "80",
                "2",
                "10",
                "3",
                "Better",
                "10",
                "8",
                "0",
                "6",
                "No"
            ],
            [
                "45",
                "Travel_Rarely",
                "194",
                "Research & Development",
                "9",
                "Bachelor",
                "Life Sciences",
                "1",
                "206",
                "Medium",
                "Male",
                "60",
                "High",
                "2",
                "Laboratory Technician",
                "Medium",
                "Divorced",
                "2348",
                "10901",
                "8",
                "Y",
                "No",
                "18",
                "Excellent",
                "High",
                "80",
                "1",
                "20",
                "2",
                "Bad",
                "17",
                "9",
                "0",
                "15",
                "No"
            ],
            [
                "58",
                "Travel_Rarely",
                "1145",
                "Research & Development",
                "9",
                "Bachelor",
                "Medical",
                "1",
                "214",
                "Medium",
                "Female",
                "75",
                "Medium",
                "1",
                "Research Scientist",
                "Medium",
                "Married",
                "3346",
                "11873",
                "4",
                "Y",
                "Yes",
                "20",
                "Outstanding",
                "Medium",
                "80",
                "1",
                "9",
                "3",
                "Good",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "30",
                "Non-Travel",
                "111",
                "Research & Development",
                "9",
                "Bachelor",
                "Medical",
                "1",
                "239",
                "High",
                "Male",
                "66",
                "High",
                "2",
                "Laboratory Technician",
                "Low",
                "Divorced",
                "3072",
                "11012",
                "1",
                "Y",
                "No",
                "11",
                "Excellent",
                "High",
                "80",
                "2",
                "12",
                "4",
                "Better",
                "12",
                "9",
                "6",
                "10",
                "No"
            ],
            [
                "46",
                "Travel_Rarely",
                "526",
                "Sales",
                "1",
                "College",
                "Marketing",
                "1",
                "244",
                "Medium",
                "Female",
                "92",
                "High",
                "3",
                "Sales Executive",
                "Low",
                "Divorced",
                "10453",
                "2137",
                "1",
                "Y",
                "No",
                "25",
                "Outstanding",
                "High",
                "80",
                "3",
                "24",
                "2",
                "Better",
                "24",
                "13",
                "15",
                "7",
                "No"
            ],
            [
                "31",
                "Travel_Rarely",
                "140",
                "Research & Development",
                "12",
                "Below College",
                "Medical",
                "1",
                "246",
                "High",
                "Female",
                "95",
                "High",
                "1",
                "Research Scientist",
                "Very High",
                "Married",
                "3929",
                "6984",
                "8",
                "Y",
                "Yes",
                "23",
                "Outstanding",
                "High",
                "80",
                "1",
                "7",
                "0",
                "Better",
                "4",
                "2",
                "0",
                "2",
                "No"
            ],
            [
                "55",
                "Travel_Rarely",
                "692",
                "Research & Development",
                "14",
                "Master",
                "Medical",
                "1",
                "254",
                "High",
                "Male",
                "61",
                "Very High",
                "5",
                "Research Director",
                "Medium",
                "Single",
                "18722",
                "13339",
                "8",
                "Y",
                "No",
                "11",
                "Excellent",
                "Very High",
                "80",
                "0",
                "36",
                "3",
                "Better",
                "24",
                "15",
                "2",
                "15",
                "No"
            ],
            [
                "37",
                "Travel_Rarely",
                "290",
                "Research & Development",
                "21",
                "Bachelor",
                "Life Sciences",
                "1",
                "267",
                "Medium",
                "Male",
                "65",
                "Very High",
                "1",
                "Research Scientist",
                "Low",
                "Married",
                "3564",
                "22977",
                "1",
                "Y",
                "Yes",
                "12",
                "Excellent",
                "Low",
                "80",
                "1",
                "8",
                "3",
                "Good",
                "8",
                "7",
                "1",
                "7",
                "No"
            ],
            [
                "54",
                "Travel_Rarely",
                "1147",
                "Sales",
                "3",
                "Bachelor",
                "Marketing",
                "1",
                "303",
                "Very High",
                "Female",
                "52",
                "High",
                "2",
                "Sales Executive",
                "Low",
                "Married",
                "5940",
                "17011",
                "2",
                "Y",
                "No",
                "14",
                "Excellent",
                "Very High",
                "80",
                "1",
                "16",
                "4",
                "Better",
                "6",
                "2",
                "0",
                "5",
                "No"
            ],
            [
                "29",
                "Travel_Rarely",
                "896",
                "Research & Development",
                "18",
                "Below College",
                "Medical",
                "1",
                "315",
                "High",
                "Male",
                "86",
                "Medium",
                "1",
                "Research Scientist",
                "Very High",
                "Single",
                "2389",
                "14961",
                "1",
                "Y",
                "Yes",
                "13",
                "Excellent",
                "High",
                "80",
                "0",
                "4",
                "3",
                "Good",
                "4",
                "3",
                "0",
                "1",
                "Yes"
            ],
            [
                "33",
                "Travel_Rarely",
                "813",
                "Research & Development",
                "14",
                "Bachelor",
                "Medical",
                "1",
                "325",
                "High",
                "Male",
                "58",
                "High",
                "1",
                "Laboratory Technician",
                "Very High",
                "Married",
                "2436",
                "22149",
                "5",
                "Y",
                "Yes",
                "13",
                "Excellent",
                "High",
                "80",
                "1",
                "8",
                "2",
                "Bad",
                "5",
                "4",
                "0",
                "4",
                "Yes"
            ],
            [
                "39",
                "Travel_Rarely",
                "1431",
                "Research & Development",
                "1",
                "Master",
                "Medical",
                "1",
                "332",
                "High",
                "Female",
                "96",
                "High",
                "1",
                "Laboratory Technician",
                "High",
                "Divorced",
                "2232",
                "15417",
                "7",
                "Y",
                "No",
                "14",
                "Excellent",
                "High",
                "80",
                "3",
                "7",
                "1",
                "Better",
                "3",
                "2",
                "1",
                "2",
                "No"
            ],
            [
                "40",
                "Travel_Rarely",
                "1300",
                "Research & Development",
                "24",
                "College",
                "Technical Degree",
                "1",
                "335",
                "Low",
                "Male",
                "62",
                "High",
                "2",
                "Research Scientist",
                "Very High",
                "Divorced",
                "3319",
                "24447",
                "1",
                "Y",
                "No",
                "17",
                "Excellent",
                "Low",
                "80",
                "2",
                "9",
                "3",
                "Better",
                "9",
                "8",
                "4",
                "7",
                "No"
            ],
            [
                "31",
                "Travel_Frequently",
                "1327",
                "Research & Development",
                "3",
                "Master",
                "Medical",
                "1",
                "337",
                "Medium",
                "Male",
                "73",
                "High",
                "3",
                "Research Director",
                "High",
                "Divorced",
                "13675",
                "13523",
                "9",
                "Y",
                "No",
                "12",
                "Excellent",
                "Low",
                "80",
                "1",
                "9",
                "3",
                "Better",
                "2",
                "2",
                "2",
                "2",
                "No"
            ],
            [
                "42",
                "Travel_Rarely",
                "269",
                "Research & Development",
                "2",
                "Bachelor",
                "Medical",
                "1",
                "351",
                "Very High",
                "Female",
                "56",
                "Medium",
                "1",
                "Laboratory Technician",
                "Low",
                "Divorced",
                "2593",
                "8007",
                "0",
                "Y",
                "Yes",
                "11",
                "Excellent",
                "High",
                "80",
                "1",
                "10",
                "4",
                "Better",
                "9",
                "6",
                "7",
                "8",
                "No"
            ],
            [
                "29",
                "Travel_Rarely",
                "1210",
                "Sales",
                "2",
                "Bachelor",
                "Medical",
                "1",
                "366",
                "Low",
                "Male",
                "78",
                "Medium",
                "2",
                "Sales Executive",
                "Medium",
                "Married",
                "6644",
                "3687",
                "2",
                "Y",
                "No",
                "19",
                "Excellent",
                "Medium",
                "80",
                "2",
                "10",
                "2",
                "Better",
                "0",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "37",
                "Travel_Rarely",
                "1372",
                "Research & Development",
                "1",
                "Bachelor",
                "Life Sciences",
                "1",
                "391",
                "Very High",
                "Female",
                "42",
                "High",
                "1",
                "Research Scientist",
                "Very High",
                "Single",
                "2115",
                "15881",
                "1",
                "Y",
                "No",
                "12",
                "Excellent",
                "Medium",
                "80",
                "0",
                "17",
                "3",
                "Better",
                "17",
                "12",
                "5",
                "7",
                "No"
            ],
            [
                "31",
                "Travel_Frequently",
                "444",
                "Sales",
                "5",
                "Bachelor",
                "Marketing",
                "1",
                "399",
                "Very High",
                "Female",
                "84",
                "High",
                "1",
                "Sales Representative",
                "Medium",
                "Divorced",
                "2789",
                "3909",
                "1",
                "Y",
                "No",
                "11",
                "Excellent",
                "High",
                "80",
                "1",
                "2",
                "5",
                "Good",
                "2",
                "2",
                "2",
                "2",
                "No"
            ],
            [
                "26",
                "Travel_Rarely",
                "950",
                "Sales",
                "4",
                "Master",
                "Marketing",
                "1",
                "401",
                "Very High",
                "Male",
                "48",
                "Medium",
                "2",
                "Sales Executive",
                "Very High",
                "Single",
                "5828",
                "8450",
                "1",
                "Y",
                "Yes",
                "12",
                "Excellent",
                "Medium",
                "80",
                "0",
                "8",
                "0",
                "Better",
                "8",
                "7",
                "7",
                "4",
                "Yes"
            ],
            [
                "31",
                "Travel_Rarely",
                "218",
                "Sales",
                "7",
                "Bachelor",
                "Technical Degree",
                "1",
                "416",
                "Medium",
                "Male",
                "100",
                "Very High",
                "2",
                "Sales Executive",
                "Very High",
                "Married",
                "6929",
                "12241",
                "4",
                "Y",
                "No",
                "11",
                "Excellent",
                "Medium",
                "80",
                "1",
                "10",
                "3",
                "Good",
                "8",
                "7",
                "7",
                "7",
                "No"
            ],
            [
                "36",
                "Non-Travel",
                "1105",
                "Research & Development",
                "24",
                "Master",
                "Life Sciences",
                "1",
                "419",
                "Medium",
                "Female",
                "47",
                "High",
                "2",
                "Laboratory Technician",
                "Medium",
                "Married",
                "5674",
                "6927",
                "7",
                "Y",
                "No",
                "15",
                "Excellent",
                "High",
                "80",
                "1",
                "11",
                "3",
                "Better",
                "9",
                "8",
                "0",
                "8",
                "No"
            ],
            [
                "31",
                "Travel_Rarely",
                "106",
                "Human Resources",
                "2",
                "Bachelor",
                "Human Resources",
                "1",
                "424",
                "Low",
                "Male",
                "62",
                "Medium",
                "2",
                "Human Resources",
                "Low",
                "Married",
                "6410",
                "17822",
                "3",
                "Y",
                "No",
                "12",
                "Excellent",
                "Very High",
                "80",
                "0",
                "9",
                "1",
                "Better",
                "2",
                "2",
                "1",
                "0",
                "No"
            ],
            [
                "27",
                "Travel_Rarely",
                "1377",
                "Sales",
                "2",
                "Bachelor",
                "Life Sciences",
                "1",
                "437",
                "Very High",
                "Male",
                "74",
                "High",
                "2",
                "Sales Executive",
                "High",
                "Single",
                "4478",
                "5242",
                "1",
                "Y",
                "Yes",
                "11",
                "Excellent",
                "Low",
                "80",
                "0",
                "5",
                "3",
                "Better",
                "5",
                "4",
                "0",
                "4",
                "No"
            ],
            [
                "32",
                "Travel_Rarely",
                "1018",
                "Research & Development",
                "2",
                "Master",
                "Medical",
                "1",
                "439",
                "Low",
                "Female",
                "74",
                "Very High",
                "2",
                "Research Scientist",
                "Very High",
                "Single",
                "5055",
                "10557",
                "7",
                "Y",
                "No",
                "16",
                "Excellent",
                "High",
                "80",
                "0",
                "10",
                "0",
                "Good",
                "7",
                "7",
                "0",
                "7",
                "No"
            ],
            [
                "29",
                "Travel_Rarely",
                "318",
                "Research & Development",
                "8",
                "Master",
                "Other",
                "1",
                "454",
                "Medium",
                "Male",
                "77",
                "Low",
                "1",
                "Laboratory Technician",
                "Low",
                "Married",
                "2119",
                "4759",
                "1",
                "Y",
                "Yes",
                "11",
                "Excellent",
                "Very High",
                "80",
                "0",
                "7",
                "4",
                "Good",
                "7",
                "7",
                "0",
                "7",
                "Yes"
            ],
            [
                "29",
                "Travel_Rarely",
                "738",
                "Research & Development",
                "9",
                "Doctor",
                "Other",
                "1",
                "455",
                "Medium",
                "Male",
                "30",
                "Medium",
                "1",
                "Laboratory Technician",
                "Very High",
                "Single",
                "3983",
                "7621",
                "0",
                "Y",
                "No",
                "17",
                "Excellent",
                "High",
                "80",
                "0",
                "4",
                "2",
                "Better",
                "3",
                "2",
                "2",
                "2",
                "No"
            ],
            [
                "27",
                "Travel_Rarely",
                "1130",
                "Sales",
                "8",
                "Master",
                "Marketing",
                "1",
                "458",
                "Medium",
                "Female",
                "56",
                "High",
                "2",
                "Sales Executive",
                "Medium",
                "Married",
                "6214",
                "3415",
                "1",
                "Y",
                "No",
                "18",
                "Excellent",
                "Low",
                "80",
                "1",
                "8",
                "3",
                "Better",
                "8",
                "7",
                "0",
                "7",
                "No"
            ],
            [
                "26",
                "Travel_Rarely",
                "933",
                "Sales",
                "1",
                "Bachelor",
                "Life Sciences",
                "1",
                "476",
                "High",
                "Male",
                "57",
                "High",
                "2",
                "Sales Executive",
                "High",
                "Married",
                "5296",
                "20156",
                "1",
                "Y",
                "No",
                "17",
                "Excellent",
                "Medium",
                "80",
                "1",
                "8",
                "3",
                "Better",
                "8",
                "7",
                "7",
                "7",
                "No"
            ],
            [
                "36",
                "Non-Travel",
                "845",
                "Sales",
                "1",
                "Doctor",
                "Medical",
                "1",
                "479",
                "Very High",
                "Female",
                "45",
                "High",
                "2",
                "Sales Executive",
                "Very High",
                "Single",
                "6653",
                "15276",
                "4",
                "Y",
                "No",
                "15",
                "Excellent",
                "Medium",
                "80",
                "0",
                "7",
                "6",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "36",
                "Travel_Frequently",
                "541",
                "Sales",
                "3",
                "Master",
                "Medical",
                "1",
                "481",
                "Low",
                "Male",
                "48",
                "Medium",
                "3",
                "Sales Executive",
                "Very High",
                "Married",
                "9699",
                "7246",
                "4",
                "Y",
                "No",
                "11",
                "Excellent",
                "Low",
                "80",
                "1",
                "16",
                "2",
                "Better",
                "13",
                "9",
                "1",
                "12",
                "No"
            ],
            [
                "21",
                "Travel_Rarely",
                "156",
                "Sales",
                "12",
                "Bachelor",
                "Life Sciences",
                "1",
                "494",
                "High",
                "Female",
                "90",
                "Very High",
                "1",
                "Sales Representative",
                "Medium",
                "Single",
                "2716",
                "25422",
                "1",
                "Y",
                "No",
                "15",
                "Excellent",
                "Very High",
                "80",
                "0",
                "1",
                "0",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "Yes"
            ],
            [
                "55",
                "Travel_Rarely",
                "1311",
                "Research & Development",
                "2",
                "Bachelor",
                "Life Sciences",
                "1",
                "505",
                "High",
                "Female",
                "97",
                "High",
                "4",
                "Manager",
                "Very High",
                "Single",
                "16659",
                "23258",
                "2",
                "Y",
                "Yes",
                "13",
                "Excellent",
                "High",
                "80",
                "0",
                "30",
                "2",
                "Better",
                "5",
                "4",
                "1",
                "2",
                "No"
            ],
            [
                "30",
                "Travel_Rarely",
                "202",
                "Sales",
                "2",
                "Below College",
                "Technical Degree",
                "1",
                "508",
                "High",
                "Male",
                "72",
                "High",
                "1",
                "Sales Representative",
                "Medium",
                "Married",
                "2476",
                "17434",
                "1",
                "Y",
                "No",
                "18",
                "Excellent",
                "Low",
                "80",
                "1",
                "1",
                "3",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "37",
                "Non-Travel",
                "1063",
                "Research & Development",
                "25",
                "Doctor",
                "Medical",
                "1",
                "529",
                "Medium",
                "Female",
                "72",
                "High",
                "2",
                "Research Scientist",
                "High",
                "Married",
                "4449",
                "23866",
                "3",
                "Y",
                "Yes",
                "15",
                "Excellent",
                "Low",
                "80",
                "2",
                "15",
                "2",
                "Better",
                "13",
                "11",
                "10",
                "7",
                "No"
            ],
            [
                "39",
                "Travel_Frequently",
                "1218",
                "Research & Development",
                "1",
                "Below College",
                "Life Sciences",
                "1",
                "531",
                "Medium",
                "Male",
                "52",
                "High",
                "5",
                "Manager",
                "High",
                "Divorced",
                "19197",
                "8213",
                "1",
                "Y",
                "Yes",
                "14",
                "Excellent",
                "High",
                "80",
                "1",
                "21",
                "3",
                "Better",
                "21",
                "8",
                "1",
                "6",
                "No"
            ],
            [
                "34",
                "Travel_Frequently",
                "296",
                "Sales",
                "6",
                "College",
                "Marketing",
                "1",
                "555",
                "Very High",
                "Female",
                "33",
                "Low",
                "1",
                "Sales Representative",
                "High",
                "Divorced",
                "2351",
                "12253",
                "0",
                "Y",
                "No",
                "16",
                "Excellent",
                "Very High",
                "80",
                "1",
                "3",
                "3",
                "Good",
                "2",
                "2",
                "1",
                "0",
                "Yes"
            ],
            [
                "40",
                "Travel_Rarely",
                "1398",
                "Sales",
                "2",
                "Master",
                "Life Sciences",
                "1",
                "558",
                "High",
                "Female",
                "79",
                "High",
                "5",
                "Manager",
                "High",
                "Married",
                "18041",
                "13022",
                "0",
                "Y",
                "No",
                "14",
                "Excellent",
                "Very High",
                "80",
                "0",
                "21",
                "2",
                "Better",
                "20",
                "15",
                "1",
                "12",
                "No"
            ],
            [
                "19",
                "Travel_Rarely",
                "489",
                "Human Resources",
                "2",
                "College",
                "Technical Degree",
                "1",
                "566",
                "Low",
                "Male",
                "52",
                "Medium",
                "1",
                "Human Resources",
                "Very High",
                "Single",
                "2564",
                "18437",
                "1",
                "Y",
                "No",
                "12",
                "Excellent",
                "High",
                "80",
                "0",
                "1",
                "3",
                "Best",
                "1",
                "0",
                "0",
                "0",
                "Yes"
            ],
            [
                "30",
                "Non-Travel",
                "1398",
                "Sales",
                "22",
                "Master",
                "Other",
                "1",
                "567",
                "High",
                "Female",
                "69",
                "High",
                "3",
                "Sales Executive",
                "Low",
                "Married",
                "8412",
                "2890",
                "0",
                "Y",
                "No",
                "11",
                "Excellent",
                "High",
                "80",
                "0",
                "10",
                "3",
                "Better",
                "9",
                "8",
                "7",
                "8",
                "No"
            ],
            [
                "50",
                "Travel_Rarely",
                "1099",
                "Research & Development",
                "29",
                "Master",
                "Life Sciences",
                "1",
                "569",
                "Medium",
                "Male",
                "88",
                "Medium",
                "4",
                "Manager",
                "High",
                "Married",
                "17046",
                "9314",
                "0",
                "Y",
                "No",
                "15",
                "Excellent",
                "Medium",
                "80",
                "1",
                "28",
                "2",
                "Better",
                "27",
                "10",
                "15",
                "7",
                "No"
            ],
            [
                "47",
                "Travel_Rarely",
                "983",
                "Research & Development",
                "2",
                "College",
                "Medical",
                "1",
                "574",
                "Low",
                "Female",
                "65",
                "High",
                "2",
                "Manufacturing Director",
                "Very High",
                "Divorced",
                "5070",
                "7389",
                "5",
                "Y",
                "No",
                "13",
                "Excellent",
                "High",
                "80",
                "3",
                "20",
                "2",
                "Better",
                "5",
                "0",
                "0",
                "4",
                "No"
            ],
            [
                "46",
                "Travel_Rarely",
                "1125",
                "Sales",
                "10",
                "Bachelor",
                "Marketing",
                "1",
                "580",
                "High",
                "Female",
                "94",
                "Medium",
                "3",
                "Sales Executive",
                "Very High",
                "Married",
                "9071",
                "11563",
                "2",
                "Y",
                "Yes",
                "19",
                "Excellent",
                "High",
                "80",
                "1",
                "15",
                "3",
                "Better",
                "3",
                "2",
                "1",
                "2",
                "No"
            ],
            [
                "33",
                "Travel_Rarely",
                "587",
                "Research & Development",
                "10",
                "Below College",
                "Medical",
                "1",
                "584",
                "Low",
                "Male",
                "38",
                "Low",
                "1",
                "Laboratory Technician",
                "Very High",
                "Divorced",
                "3408",
                "6705",
                "7",
                "Y",
                "No",
                "13",
                "Excellent",
                "Low",
                "80",
                "3",
                "8",
                "2",
                "Better",
                "4",
                "3",
                "1",
                "3",
                "Yes"
            ],
            [
                "48",
                "Travel_Rarely",
                "163",
                "Sales",
                "2",
                "Doctor",
                "Marketing",
                "1",
                "595",
                "Medium",
                "Female",
                "37",
                "High",
                "2",
                "Sales Executive",
                "Very High",
                "Married",
                "4051",
                "19658",
                "2",
                "Y",
                "No",
                "14",
                "Excellent",
                "Low",
                "80",
                "1",
                "14",
                "2",
                "Better",
                "9",
                "7",
                "6",
                "7",
                "No"
            ],
            [
                "41",
                "Non-Travel",
                "267",
                "Sales",
                "10",
                "College",
                "Life Sciences",
                "1",
                "599",
                "Very High",
                "Male",
                "56",
                "High",
                "2",
                "Sales Executive",
                "Very High",
                "Single",
                "6230",
                "13430",
                "7",
                "Y",
                "No",
                "14",
                "Excellent",
                "Very High",
                "80",
                "0",
                "16",
                "3",
                "Better",
                "14",
                "3",
                "1",
                "10",
                "No"
            ],
            [
                "45",
                "Travel_Rarely",
                "561",
                "Sales",
                "2",
                "Bachelor",
                "Other",
                "1",
                "606",
                "Very High",
                "Male",
                "61",
                "High",
                "2",
                "Sales Executive",
                "Medium",
                "Married",
                "4805",
                "16177",
                "0",
                "Y",
                "No",
                "19",
                "Excellent",
                "Medium",
                "80",
                "1",
                "9",
                "3",
                "Best",
                "8",
                "7",
                "3",
                "7",
                "No"
            ],
            [
                "26",
                "Travel_Rarely",
                "775",
                "Sales",
                "29",
                "College",
                "Medical",
                "1",
                "618",
                "Low",
                "Male",
                "45",
                "High",
                "2",
                "Sales Executive",
                "High",
                "Divorced",
                "4306",
                "4267",
                "5",
                "Y",
                "No",
                "12",
                "Excellent",
                "Low",
                "80",
                "2",
                "8",
                "5",
                "Better",
                "0",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "26",
                "Travel_Rarely",
                "471",
                "Research & Development",
                "24",
                "Bachelor",
                "Technical Degree",
                "1",
                "622",
                "High",
                "Male",
                "66",
                "Low",
                "1",
                "Laboratory Technician",
                "Very High",
                "Single",
                "2340",
                "23213",
                "1",
                "Y",
                "Yes",
                "18",
                "Excellent",
                "Medium",
                "80",
                "0",
                "1",
                "3",
                "Bad",
                "1",
                "0",
                "0",
                "0",
                "Yes"
            ],
            [
                "37",
                "Non-Travel",
                "142",
                "Sales",
                "9",
                "Master",
                "Medical",
                "1",
                "626",
                "Low",
                "Male",
                "69",
                "High",
                "3",
                "Sales Executive",
                "Medium",
                "Divorced",
                "8834",
                "24666",
                "1",
                "Y",
                "No",
                "13",
                "Excellent",
                "Very High",
                "80",
                "1",
                "9",
                "6",
                "Better",
                "9",
                "5",
                "7",
                "7",
                "No"
            ],
            [
                "20",
                "Travel_Rarely",
                "959",
                "Research & Development",
                "1",
                "Bachelor",
                "Life Sciences",
                "1",
                "657",
                "Very High",
                "Female",
                "83",
                "Medium",
                "1",
                "Research Scientist",
                "Medium",
                "Single",
                "2836",
                "11757",
                "1",
                "Y",
                "No",
                "13",
                "Excellent",
                "Very High",
                "80",
                "0",
                "1",
                "0",
                "Best",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "34",
                "Travel_Rarely",
                "204",
                "Sales",
                "14",
                "Bachelor",
                "Technical Degree",
                "1",
                "666",
                "High",
                "Female",
                "31",
                "High",
                "1",
                "Sales Representative",
                "High",
                "Divorced",
                "2579",
                "2912",
                "1",
                "Y",
                "Yes",
                "18",
                "Excellent",
                "Very High",
                "80",
                "2",
                "8",
                "3",
                "Better",
                "8",
                "2",
                "0",
                "6",
                "No"
            ],
            [
                "27",
                "Travel_Rarely",
                "1420",
                "Sales",
                "2",
                "Below College",
                "Marketing",
                "1",
                "667",
                "High",
                "Male",
                "85",
                "High",
                "1",
                "Sales Representative",
                "Low",
                "Divorced",
                "3041",
                "16346",
                "0",
                "Y",
                "No",
                "11",
                "Excellent",
                "Medium",
                "80",
                "1",
                "5",
                "3",
                "Better",
                "4",
                "3",
                "0",
                "2",
                "Yes"
            ],
            [
                "53",
                "Travel_Rarely",
                "238",
                "Sales",
                "1",
                "Below College",
                "Medical",
                "1",
                "682",
                "Very High",
                "Female",
                "34",
                "High",
                "2",
                "Sales Executive",
                "Low",
                "Single",
                "8381",
                "7507",
                "7",
                "Y",
                "No",
                "20",
                "Outstanding",
                "Very High",
                "80",
                "0",
                "18",
                "2",
                "Best",
                "14",
                "7",
                "8",
                "10",
                "No"
            ],
            [
                "34",
                "Travel_Rarely",
                "1397",
                "Research & Development",
                "1",
                "Doctor",
                "Life Sciences",
                "1",
                "683",
                "Medium",
                "Male",
                "42",
                "High",
                "1",
                "Research Scientist",
                "Very High",
                "Married",
                "2691",
                "7660",
                "1",
                "Y",
                "No",
                "12",
                "Excellent",
                "Very High",
                "80",
                "1",
                "10",
                "4",
                "Good",
                "10",
                "9",
                "8",
                "8",
                "No"
            ],
            [
                "35",
                "Non-Travel",
                "727",
                "Research & Development",
                "3",
                "Bachelor",
                "Life Sciences",
                "1",
                "704",
                "High",
                "Male",
                "41",
                "Medium",
                "1",
                "Laboratory Technician",
                "High",
                "Married",
                "1281",
                "16900",
                "1",
                "Y",
                "No",
                "18",
                "Excellent",
                "High",
                "80",
                "2",
                "1",
                "3",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "25",
                "Travel_Rarely",
                "810",
                "Sales",
                "8",
                "Bachelor",
                "Life Sciences",
                "1",
                "707",
                "Very High",
                "Male",
                "57",
                "Very High",
                "2",
                "Sales Executive",
                "Medium",
                "Married",
                "4851",
                "15678",
                "0",
                "Y",
                "No",
                "22",
                "Outstanding",
                "High",
                "80",
                "1",
                "4",
                "4",
                "Better",
                "3",
                "2",
                "1",
                "2",
                "No"
            ],
            [
                "37",
                "Travel_Rarely",
                "1225",
                "Research & Development",
                "10",
                "College",
                "Life Sciences",
                "1",
                "715",
                "Very High",
                "Male",
                "80",
                "Very High",
                "1",
                "Research Scientist",
                "Very High",
                "Single",
                "4680",
                "15232",
                "3",
                "Y",
                "No",
                "17",
                "Excellent",
                "Low",
                "80",
                "0",
                "4",
                "2",
                "Better",
                "1",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "50",
                "Travel_Frequently",
                "562",
                "Sales",
                "8",
                "College",
                "Technical Degree",
                "1",
                "723",
                "Medium",
                "Male",
                "50",
                "High",
                "2",
                "Sales Executive",
                "High",
                "Married",
                "6796",
                "23452",
                "3",
                "Y",
                "Yes",
                "14",
                "Excellent",
                "Low",
                "80",
                "1",
                "18",
                "4",
                "Better",
                "4",
                "3",
                "1",
                "3",
                "Yes"
            ],
            [
                "60",
                "Travel_Rarely",
                "1179",
                "Sales",
                "16",
                "Master",
                "Marketing",
                "1",
                "732",
                "Low",
                "Male",
                "84",
                "High",
                "2",
                "Sales Executive",
                "Low",
                "Single",
                "5405",
                "11924",
                "8",
                "Y",
                "No",
                "14",
                "Excellent",
                "Very High",
                "80",
                "0",
                "10",
                "1",
                "Better",
                "2",
                "2",
                "2",
                "2",
                "No"
            ],
            [
                "41",
                "Travel_Rarely",
                "314",
                "Human Resources",
                "1",
                "Bachelor",
                "Human Resources",
                "1",
                "734",
                "Very High",
                "Male",
                "59",
                "Medium",
                "5",
                "Manager",
                "High",
                "Married",
                "19189",
                "19562",
                "1",
                "Y",
                "No",
                "12",
                "Excellent",
                "Medium",
                "80",
                "1",
                "22",
                "3",
                "Better",
                "22",
                "7",
                "2",
                "10",
                "No"
            ],
            [
                "28",
                "Travel_Rarely",
                "654",
                "Research & Development",
                "1",
                "College",
                "Life Sciences",
                "1",
                "741",
                "Low",
                "Female",
                "67",
                "Low",
                "1",
                "Research Scientist",
                "Medium",
                "Single",
                "2216",
                "3872",
                "7",
                "Y",
                "Yes",
                "13",
                "Excellent",
                "Very High",
                "80",
                "0",
                "10",
                "4",
                "Better",
                "7",
                "7",
                "3",
                "7",
                "Yes"
            ],
            [
                "42",
                "Travel_Frequently",
                "933",
                "Research & Development",
                "19",
                "Bachelor",
                "Medical",
                "1",
                "752",
                "High",
                "Male",
                "57",
                "Very High",
                "1",
                "Research Scientist",
                "High",
                "Divorced",
                "2759",
                "20366",
                "6",
                "Y",
                "Yes",
                "12",
                "Excellent",
                "Very High",
                "80",
                "0",
                "7",
                "2",
                "Better",
                "2",
                "2",
                "2",
                "2",
                "Yes"
            ],
            [
                "23",
                "Travel_Rarely",
                "650",
                "Research & Development",
                "9",
                "Below College",
                "Medical",
                "1",
                "758",
                "Medium",
                "Male",
                "37",
                "High",
                "1",
                "Laboratory Technician",
                "Low",
                "Married",
                "2500",
                "4344",
                "1",
                "Y",
                "No",
                "14",
                "Excellent",
                "Very High",
                "80",
                "1",
                "5",
                "2",
                "Best",
                "4",
                "3",
                "0",
                "2",
                "No"
            ],
            [
                "38",
                "Travel_Rarely",
                "268",
                "Research & Development",
                "2",
                "Doctor",
                "Medical",
                "1",
                "773",
                "Very High",
                "Male",
                "92",
                "High",
                "1",
                "Research Scientist",
                "High",
                "Married",
                "3057",
                "20471",
                "6",
                "Y",
                "Yes",
                "13",
                "Excellent",
                "Medium",
                "80",
                "1",
                "6",
                "0",
                "Bad",
                "1",
                "0",
                "0",
                "1",
                "No"
            ],
            [
                "25",
                "Travel_Rarely",
                "883",
                "Sales",
                "26",
                "Below College",
                "Medical",
                "1",
                "781",
                "High",
                "Female",
                "32",
                "High",
                "2",
                "Sales Executive",
                "Very High",
                "Single",
                "6180",
                "22807",
                "1",
                "Y",
                "No",
                "23",
                "Outstanding",
                "Medium",
                "80",
                "0",
                "6",
                "5",
                "Good",
                "6",
                "5",
                "1",
                "4",
                "No"
            ],
            [
                "26",
                "Travel_Rarely",
                "1146",
                "Sales",
                "8",
                "Bachelor",
                "Technical Degree",
                "1",
                "796",
                "Very High",
                "Male",
                "38",
                "Medium",
                "2",
                "Sales Executive",
                "Low",
                "Single",
                "5326",
                "3064",
                "6",
                "Y",
                "No",
                "17",
                "Excellent",
                "High",
                "80",
                "0",
                "6",
                "2",
                "Good",
                "4",
                "3",
                "1",
                "2",
                "Yes"
            ],
            [
                "37",
                "Travel_Rarely",
                "571",
                "Research & Development",
                "10",
                "Below College",
                "Life Sciences",
                "1",
                "802",
                "Very High",
                "Female",
                "82",
                "High",
                "1",
                "Research Scientist",
                "Low",
                "Divorced",
                "2782",
                "19905",
                "0",
                "Y",
                "Yes",
                "13",
                "Excellent",
                "Medium",
                "80",
                "2",
                "6",
                "3",
                "Good",
                "5",
                "3",
                "4",
                "3",
                "No"
            ],
            [
                "35",
                "Travel_Rarely",
                "1258",
                "Research & Development",
                "1",
                "Master",
                "Life Sciences",
                "1",
                "826",
                "Very High",
                "Female",
                "40",
                "Very High",
                "1",
                "Research Scientist",
                "High",
                "Single",
                "2506",
                "13301",
                "3",
                "Y",
                "No",
                "13",
                "Excellent",
                "High",
                "80",
                "0",
                "7",
                "0",
                "Better",
                "2",
                "2",
                "2",
                "2",
                "No"
            ],
            [
                "34",
                "Travel_Frequently",
                "702",
                "Research & Development",
                "16",
                "Master",
                "Life Sciences",
                "1",
                "838",
                "High",
                "Female",
                "100",
                "Medium",
                "1",
                "Research Scientist",
                "Very High",
                "Single",
                "2553",
                "8306",
                "1",
                "Y",
                "No",
                "16",
                "Excellent",
                "High",
                "80",
                "0",
                "6",
                "3",
                "Better",
                "5",
                "2",
                "1",
                "3",
                "No"
            ],
            [
                "35",
                "Travel_Rarely",
                "950",
                "Research & Development",
                "7",
                "Bachelor",
                "Other",
                "1",
                "845",
                "High",
                "Male",
                "59",
                "High",
                "3",
                "Manufacturing Director",
                "High",
                "Single",
                "10221",
                "18869",
                "3",
                "Y",
                "No",
                "21",
                "Outstanding",
                "Medium",
                "80",
                "0",
                "17",
                "3",
                "Best",
                "8",
                "5",
                "1",
                "6",
                "No"
            ],
            [
                "26",
                "Travel_Frequently",
                "887",
                "Research & Development",
                "5",
                "College",
                "Medical",
                "1",
                "848",
                "High",
                "Female",
                "88",
                "Medium",
                "1",
                "Research Scientist",
                "High",
                "Married",
                "2366",
                "20898",
                "1",
                "Y",
                "Yes",
                "14",
                "Excellent",
                "Low",
                "80",
                "1",
                "8",
                "2",
                "Better",
                "8",
                "7",
                "1",
                "7",
                "Yes"
            ],
            [
                "27",
                "Non-Travel",
                "443",
                "Research & Development",
                "3",
                "Bachelor",
                "Medical",
                "1",
                "850",
                "Very High",
                "Male",
                "50",
                "High",
                "1",
                "Research Scientist",
                "Very High",
                "Married",
                "1706",
                "16571",
                "1",
                "Y",
                "No",
                "11",
                "Excellent",
                "High",
                "80",
                "3",
                "0",
                "6",
                "Good",
                "0",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "36",
                "Travel_Rarely",
                "928",
                "Sales",
                "1",
                "College",
                "Life Sciences",
                "1",
                "857",
                "Medium",
                "Male",
                "56",
                "High",
                "2",
                "Sales Executive",
                "Very High",
                "Married",
                "6201",
                "2823",
                "1",
                "Y",
                "Yes",
                "14",
                "Excellent",
                "Very High",
                "80",
                "1",
                "18",
                "1",
                "Good",
                "18",
                "14",
                "4",
                "11",
                "No"
            ],
            [
                "44",
                "Travel_Rarely",
                "986",
                "Research & Development",
                "8",
                "Master",
                "Life Sciences",
                "1",
                "874",
                "Low",
                "Male",
                "62",
                "Very High",
                "1",
                "Laboratory Technician",
                "Very High",
                "Married",
                "2818",
                "5044",
                "2",
                "Y",
                "Yes",
                "24",
                "Outstanding",
                "High",
                "80",
                "1",
                "10",
                "2",
                "Good",
                "3",
                "2",
                "0",
                "2",
                "No"
            ],
            [
                "32",
                "Travel_Rarely",
                "374",
                "Research & Development",
                "25",
                "Master",
                "Life Sciences",
                "1",
                "911",
                "Low",
                "Male",
                "87",
                "High",
                "1",
                "Laboratory Technician",
                "Very High",
                "Single",
                "2795",
                "18016",
                "1",
                "Y",
                "Yes",
                "24",
                "Outstanding",
                "High",
                "80",
                "0",
                "1",
                "2",
                "Bad",
                "1",
                "0",
                "0",
                "1",
                "Yes"
            ],
            [
                "21",
                "Travel_Rarely",
                "1427",
                "Research & Development",
                "18",
                "Below College",
                "Other",
                "1",
                "923",
                "Very High",
                "Female",
                "65",
                "High",
                "1",
                "Research Scientist",
                "Very High",
                "Single",
                "2693",
                "8870",
                "1",
                "Y",
                "No",
                "19",
                "Excellent",
                "Low",
                "80",
                "0",
                "1",
                "3",
                "Good",
                "1",
                "0",
                "0",
                "0",
                "Yes"
            ],
            [
                "42",
                "Travel_Rarely",
                "462",
                "Sales",
                "14",
                "College",
                "Medical",
                "1",
                "936",
                "High",
                "Female",
                "68",
                "Medium",
                "2",
                "Sales Executive",
                "High",
                "Single",
                "6244",
                "7824",
                "7",
                "Y",
                "No",
                "17",
                "Excellent",
                "Low",
                "80",
                "0",
                "10",
                "6",
                "Better",
                "5",
                "4",
                "0",
                "3",
                "No"
            ],
            [
                "26",
                "Travel_Frequently",
                "1283",
                "Sales",
                "1",
                "Bachelor",
                "Medical",
                "1",
                "956",
                "High",
                "Male",
                "52",
                "Medium",
                "2",
                "Sales Executive",
                "Low",
                "Single",
                "4294",
                "11148",
                "1",
                "Y",
                "No",
                "12",
                "Excellent",
                "Medium",
                "80",
                "0",
                "7",
                "2",
                "Better",
                "7",
                "7",
                "0",
                "7",
                "No"
            ],
            [
                "40",
                "Travel_Frequently",
                "1469",
                "Research & Development",
                "9",
                "Master",
                "Medical",
                "1",
                "964",
                "Very High",
                "Male",
                "35",
                "High",
                "1",
                "Research Scientist",
                "Medium",
                "Divorced",
                "3617",
                "25063",
                "8",
                "Y",
                "Yes",
                "14",
                "Excellent",
                "Very High",
                "80",
                "1",
                "3",
                "2",
                "Better",
                "1",
                "1",
                "0",
                "0",
                "No"
            ],
            [
                "32",
                "Travel_Rarely",
                "498",
                "Research & Development",
                "3",
                "Master",
                "Medical",
                "1",
                "966",
                "High",
                "Female",
                "93",
                "High",
                "2",
                "Manufacturing Director",
                "Low",
                "Married",
                "6725",
                "13554",
                "1",
                "Y",
                "No",
                "12",
                "Excellent",
                "High",
                "80",
                "1",
                "8",
                "2",
                "Best",
                "8",
                "7",
                "6",
                "3",
                "No"
            ],
            [
                "40",
                "Non-Travel",
                "1479",
                "Sales",
                "24",
                "Bachelor",
                "Life Sciences",
                "1",
                "986",
                "Medium",
                "Female",
                "100",
                "Very High",
                "4",
                "Sales Executive",
                "Medium",
                "Single",
                "13194",
                "17071",
                "4",
                "Y",
                "Yes",
                "16",
                "Excellent",
                "Very High",
                "80",
                "0",
                "22",
                "2",
                "Good",
                "1",
                "0",
                "0",
                "0",
                "Yes"
            ],
            [
                "41",
                "Travel_Frequently",
                "840",
                "Research & Development",
                "9",
                "Bachelor",
                "Medical",
                "1",
                "999",
                "Low",
                "Male",
                "64",
                "High",
                "5",
                "Research Director",
                "High",
                "Divorced",
                "19419",
                "3735",
                "2",
                "Y",
                "No",
                "17",
                "Excellent",
                "Medium",
                "80",
                "1",
                "21",
                "2",
                "Best",
                "18",
                "16",
                "0",
                "11",
                "No"
            ],
            [
                "27",
                "Travel_Rarely",
                "1134",
                "Research & Development",
                "16",
                "Master",
                "Technical Degree",
                "1",
                "1001",
                "High",
                "Female",
                "37",
                "High",
                "1",
                "Laboratory Technician",
                "Medium",
                "Married",
                "2811",
                "12086",
                "9",
                "Y",
                "No",
                "14",
                "Excellent",
                "Medium",
                "80",
                "1",
                "4",
                "2",
                "Better",
                "2",
                "2",
                "2",
                "2",
                "No"
            ],
            [
                "45",
                "Non-Travel",
                "248",
                "Research & Development",
                "23",
                "College",
                "Life Sciences",
                "1",
                "1002",
                "Very High",
                "Male",
                "42",
                "High",
                "2",
                "Laboratory Technician",
                "Low",
                "Married",
                "3633",
                "14039",
                "1",
                "Y",
                "Yes",
                "15",
                "Excellent",
                "High",
                "80",
                "1",
                "9",
                "2",
                "Better",
                "9",
                "8",
                "0",
                "8",
                "No"
            ],
            [
                "38",
                "Travel_Frequently",
                "1391",
                "Research & Development",
                "10",
                "Below College",
                "Medical",
                "1",
                "1006",
                "High",
                "Male",
                "66",
                "High",
                "1",
                "Research Scientist",
                "High",
                "Married",
                "2684",
                "12127",
                "0",
                "Y",
                "No",
                "17",
                "Excellent",
                "Medium",
                "80",
                "1",
                "3",
                "0",
                "Good",
                "2",
                "1",
                "0",
                "2",
                "No"
            ],
            [
                "18",
                "Non-Travel",
                "287",
                "Research & Development",
                "5",
                "College",
                "Life Sciences",
                "1",
                "1012",
                "Medium",
                "Male",
                "73",
                "High",
                "1",
                "Research Scientist",
                "Very High",
                "Single",
                "1051",
                "13493",
                "1",
                "Y",
                "No",
                "15",
                "Excellent",
                "Very High",
                "80",
                "0",
                "0",
                "2",
                "Better",
                "0",
                "0",
                "0",
                "0",
                "No"
            ],
            [
                "35",
                "Travel_Rarely",
                "802",
                "Research & Development",
                "10",
                "Bachelor",
                "Other",
                "1",
                "1028",
                "Medium",
                "Male",
                "45",
                "High",
                "1",
                "Laboratory Technician",
                "Very High",
                "Divorced",
                "3917",
                "9541",
                "1",
                "Y",
                "No",
                "20",
                "Outstanding",
                "Low",
                "80",
                "1",
                "3",
                "4",
                "Good",
                "3",
                "2",
                "1",
                "2",
                "No"
            ],
            [
                "53",
                "Travel_Frequently",
                "124",
                "Sales",
                "2",
                "Bachelor",
                "Marketing",
                "1",
                "1050",
                "High",
                "Female",
                "38",
                "Medium",
                "3",
                "Sales Executive",
                "Medium",
                "Married",
                "7525",
                "23537",
                "2",
                "Y",
                "No",
                "12",
                "Excellent",
                "Low",
                "80",
                "1",
                "30",
                "2",
                "Better",
                "15",
                "7",
                "6",
                "12",
                "No"
            ],
            [
                "26",
                "Travel_Frequently",
                "342",
                "Research & Development",
                "2",
                "Bachelor",
                "Life Sciences",
                "1",
                "1053",
                "Low",
                "Male",
                "57",
                "High",
                "1",
                "Research Scientist",
                "Low",
                "Married",
                "2042",
                "15346",
                "6",
                "Y",
                "Yes",
                "14",
                "Excellent",
                "Medium",
                "80",
                "1",
                "6",
                "2",
                "Better",
                "3",
                "2",
                "1",
                "2",
                "Yes"
            ],
            [
                "38",
                "Travel_Frequently",
                "1186",
                "Research & Development",
                "3",
                "Master",
                "Other",
                "1",
                "1060",
                "High",
                "Male",
                "44",
                "High",
                "1",
                "Research Scientist",
                "High",
                "Married",
                "2821",
                "2997",
                "3",
                "Y",
                "No",
                "16",
                "Excellent",
                "Low",
                "80",
                "1",
                "8",
                "2",
                "Better",
                "2",
                "2",
                "2",
                "2",
                "No"
            ],
            [
                "26",
                "Travel_Frequently",
                "921",
                "Research & Development",
                "1",
                "Below College",
                "Medical",
                "1",
                "1068",
                "Low",
                "Female",
                "66",
                "Medium",
                "1",
                "Research Scientist",
                "High",
                "Divorced",
                "2007",
                "25265",
                "1",
                "Y",
                "No",
                "13",
                "Excellent",
                "High",
                "80",
                "2",
                "5",
                "5",
                "Better",
                "5",
                "3",
                "1",
                "3",
                "No"
            ],
            [
                "56",
                "Travel_Frequently",
                "1240",
                "Research & Development",
                "9",
                "Bachelor",
                "Medical",
                "1",
                "1071",
                "Low",
                "Female",
                "63",
                "High",
                "1",
                "Research Scientist",
                "High",
                "Married",
                "2942",
                "12154",
                "2",
                "Y",
                "No",
                "19",
                "Excellent",
                "Medium",
                "80",
                "1",
                "18",
                "4",
                "Better",
                "5",
                "4",
                "0",
                "3",
                "No"
            ],
            [
                "21",
                "Travel_Rarely",
                "1334",
                "Research & Development",
                "10",
                "Bachelor",
                "Life Sciences",
                "1",
                "1079",
                "High",
                "Female",
                "36",
                "Medium",
                "1",
                "Laboratory Technician",
                "Low",
                "Single",
                "1416",
                "17258",
                "1",
                "Y",
                "No",
                "13",
                "Excellent",
                "Low",
                "80",
                "0",
                "1",
                "6",
                "Good",
                "1",
                "0",
                "1",
                "0",
                "Yes"
            ]
        ],
        "headers": [
            {
                "name": "Age",
                "slug": "e496c1e9f5c34edf8acbd17513a0deb6"
            },
            {
                "name": "BusinessTravel",
                "slug": "1c5de02a606d41c78992486926f42119"
            },
            {
                "name": "DailyRate",
                "slug": "0cd61cfb39784b688b64ab7a2c2489a2"
            },
            {
                "name": "Department",
                "slug": "e6b733e796b74c1ba39bc56a8681335a"
            },
            {
                "name": "DistanceFromHome",
                "slug": "e9c34c2654f142c7a6ac43ff3fe17545"
            },
            {
                "name": "Education",
                "slug": "b105c8bbedff4f9cabe6c3b810e57cf8"
            },
            {
                "name": "EducationField",
                "slug": "cafb6efad7aa4f07beecedb29e43308a"
            },
            {
                "name": "EmployeeCount",
                "slug": "f03a800c214742379f2f39426c7039ff"
            },
            {
                "name": "EmployeeNumber",
                "slug": "87151576eca84a0b8cf590b049bc61ca"
            },
            {
                "name": "EnvironmentSatisfaction",
                "slug": "d1301f9cb62d42fdbcfc2f6bd3818018"
            },
            {
                "name": "Gender",
                "slug": "ac0b1ba8f4904d24a0f798731b491355"
            },
            {
                "name": "HourlyRate",
                "slug": "e3ec2233033c4815aa9dfe940a398132"
            },
            {
                "name": "JobInvolvement",
                "slug": "aaf326bf52db420aa12d3713f559ae68"
            },
            {
                "name": "JobLevel",
                "slug": "c63b8d81757c4ba3a6f85553f8e6c945"
            },
            {
                "name": "JobRole",
                "slug": "202d81e591f749bd96a83071fffc0a26"
            },
            {
                "name": "JobSatisfaction",
                "slug": "e70aa467595e42c9881c9cbd0084c9d6"
            },
            {
                "name": "MaritalStatus",
                "slug": "522de90d92204c56b634620d9028d66f"
            },
            {
                "name": "MonthlyIncome",
                "slug": "081cf9a69cc242d790a8be5ba984381f"
            },
            {
                "name": "MonthlyRate",
                "slug": "443f81d7de464efd947ef0dd5a775ee5"
            },
            {
                "name": "NumCompaniesWorked",
                "slug": "cfaa93c0b2c9478ea57edef6dca792e3"
            },
            {
                "name": "Over18",
                "slug": "a5c9fe8252b84ac1afbc09f9dd26297a"
            },
            {
                "name": "OverTime",
                "slug": "e736d3aac11840d5b7fb35905ad8eb72"
            },
            {
                "name": "PercentSalaryHike",
                "slug": "0039a4437bc9458c8195d65b911f20d1"
            },
            {
                "name": "PerformanceRating",
                "slug": "e80a1e0c285449adb02eadd18ebba0d9"
            },
            {
                "name": "RelationshipSatisfaction",
                "slug": "37f41bff41c04fde80a5a555073c3c17"
            },
            {
                "name": "StandardHours",
                "slug": "976a0424969b4d2a9225b956d11235f4"
            },
            {
                "name": "StockOptionLevel",
                "slug": "17782e73ed7e4693beae6833069eab58"
            },
            {
                "name": "TotalWorkingYears",
                "slug": "5ef815674d134ed08b5c6b77ff1dbda6"
            },
            {
                "name": "TrainingTimesLastYear",
                "slug": "25d25cb6f2554474b36afe22b4aded59"
            },
            {
                "name": "WorkLifeBalance",
                "slug": "6a1ae8af702c4ab282a33e48ebaa0b30"
            },
            {
                "name": "YearsAtCompany",
                "slug": "553a8465f06a40848d64159339542286"
            },
            {
                "name": "YearsInCurrentRole",
                "slug": "f476ff7b68c147a98eac797c3535e95b"
            },
            {
                "name": "YearsSinceLastPromotion",
                "slug": "0bd56b0b1dfd4f9e934c81b0e7958cdd"
            },
            {
                "name": "YearsWithCurrManager",
                "slug": "89ee7c7fd7ca4e7ab8e0530eee20cd2e"
            },
            {
                "name": "Attrition",
                "slug": "99dbd074205f43819fa922dc55b1ea0a"
            }
        ],
        "columnData": [
            {
                "ignoreSuggestionFlag": False,
                "name": "Age",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "30.0 to 35.0",
                                    "35.0 to 40.0",
                                    "25.0 to 30.0",
                                    "40.0 to 45.0",
                                    "50.0 to 55.0",
                                    "45.0 to 50.0",
                                    "20.0 to 25.0",
                                    "55.0 to 60.0",
                                    "15.0 to 20.0"
                                ],
                                [
                                    "value",
                                    165,
                                    141,
                                    115,
                                    90,
                                    67,
                                    61,
                                    46,
                                    33,
                                    10
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "30.0 to 35.0",
                            "35.0 to 40.0",
                            "25.0 to 30.0",
                            "40.0 to 45.0",
                            "50.0 to 55.0",
                            "45.0 to 50.0",
                            "20.0 to 25.0",
                            "55.0 to 60.0",
                            "15.0 to 20.0"
                        ],
                        [
                            "value",
                            165,
                            141,
                            115,
                            90,
                            67,
                            61,
                            46,
                            33,
                            10
                        ]
                    ],
                    "download_url": "/api/download_data/bu6rjzmq6rotk9h3"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 18,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 60,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 43,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 9.47,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 36.69,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "e496c1e9f5c34edf8acbd17513a0deb6"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "BusinessTravel",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Travel_Rarely",
                                    "Travel_Frequently",
                                    "Non-Travel"
                                ],
                                [
                                    "value",
                                    526,
                                    131,
                                    71
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Travel_Rarely",
                            "Travel_Frequently",
                            "Non-Travel"
                        ],
                        [
                            "value",
                            526,
                            131,
                            71
                        ]
                    ],
                    "download_url": "/api/download_data/iduw2jnbt4mjadyc"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Non-Travel": 71,
                            "Travel_Frequently": 131,
                            "Travel_Rarely": 526
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Non-Travel",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 3,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Travel_Rarely",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "1c5de02a606d41c78992486926f42119"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "DailyRate",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "1260.0 to 1400.0",
                                    "560.0 to 700.0",
                                    "1120.0 to 1260.0",
                                    "840.0 to 980.0",
                                    "420.0 to 560.0",
                                    "140.0 to 280.0",
                                    "980.0 to 1120.0",
                                    "700.0 to 840.0",
                                    "280.0 to 420.0",
                                    "None",
                                    "0.0 to 140.0"
                                ],
                                [
                                    "value",
                                    84,
                                    79,
                                    79,
                                    78,
                                    74,
                                    73,
                                    68,
                                    65,
                                    60,
                                    45,
                                    23
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "1260.0 to 1400.0",
                            "560.0 to 700.0",
                            "1120.0 to 1260.0",
                            "840.0 to 980.0",
                            "420.0 to 560.0",
                            "140.0 to 280.0",
                            "980.0 to 1120.0",
                            "700.0 to 840.0",
                            "280.0 to 420.0",
                            "None",
                            "0.0 to 140.0"
                        ],
                        [
                            "value",
                            84,
                            79,
                            79,
                            78,
                            74,
                            73,
                            68,
                            65,
                            60,
                            45,
                            23
                        ]
                    ],
                    "download_url": "/api/download_data/wqleb3by0ccu9s6j"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 102,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 1499,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 564,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 405.45,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 809.51,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "0cd61cfb39784b688b64ab7a2c2489a2"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "Department",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Research & Development",
                                    "Sales",
                                    "Human Resources"
                                ],
                                [
                                    "value",
                                    458,
                                    244,
                                    26
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Research & Development",
                            "Sales",
                            "Human Resources"
                        ],
                        [
                            "value",
                            458,
                            244,
                            26
                        ]
                    ],
                    "download_url": "/api/download_data/i02076hldd9pcz6k"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Human Resources": 26,
                            "Research & Development": 458,
                            "Sales": 244
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Human Resources",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 3,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Research & Development",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "e6b733e796b74c1ba39bc56a8681335a"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "DistanceFromHome",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "0.0 to 3.0",
                                    "3.0 to 6.0",
                                    "6.0 to 9.0",
                                    "9.0 to 12.0",
                                    "24.0 to 27.0",
                                    "18.0 to 21.0",
                                    "21.0 to 24.0",
                                    "15.0 to 18.0",
                                    "27.0 to 30.0",
                                    "12.0 to 15.0"
                                ],
                                [
                                    "value",
                                    208,
                                    118,
                                    118,
                                    92,
                                    38,
                                    36,
                                    34,
                                    31,
                                    27,
                                    26
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "0.0 to 3.0",
                            "3.0 to 6.0",
                            "6.0 to 9.0",
                            "9.0 to 12.0",
                            "24.0 to 27.0",
                            "18.0 to 21.0",
                            "21.0 to 24.0",
                            "15.0 to 18.0",
                            "27.0 to 30.0",
                            "12.0 to 15.0"
                        ],
                        [
                            "value",
                            208,
                            118,
                            118,
                            92,
                            38,
                            36,
                            34,
                            31,
                            27,
                            26
                        ]
                    ],
                    "download_url": "/api/download_data/ua4xu9lkqy3jtsmy"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 29,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 29,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 8.03,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 8.9,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "e9c34c2654f142c7a6ac43ff3fe17545"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "Education",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Bachelor",
                                    "Master",
                                    "College",
                                    "Below College",
                                    "Doctor"
                                ],
                                [
                                    "value",
                                    270,
                                    187,
                                    152,
                                    95,
                                    24
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Bachelor",
                            "Master",
                            "College",
                            "Below College",
                            "Doctor"
                        ],
                        [
                            "value",
                            270,
                            187,
                            152,
                            95,
                            24
                        ]
                    ],
                    "download_url": "/api/download_data/6uwrr8xjcuce61zs"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Below College": 95,
                            "Bachelor": 270,
                            "College": 152,
                            "Master": 187,
                            "Doctor": 24
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Doctor",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 5,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Bachelor",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "b105c8bbedff4f9cabe6c3b810e57cf8"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "EducationField",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Life Sciences",
                                    "Medical",
                                    "Marketing",
                                    "Technical Degree",
                                    "Other",
                                    "Human Resources"
                                ],
                                [
                                    "value",
                                    298,
                                    227,
                                    89,
                                    61,
                                    41,
                                    12
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Life Sciences",
                            "Medical",
                            "Marketing",
                            "Technical Degree",
                            "Other",
                            "Human Resources"
                        ],
                        [
                            "value",
                            298,
                            227,
                            89,
                            61,
                            41,
                            12
                        ]
                    ],
                    "download_url": "/api/download_data/8wj6ttesrrkxenae"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Life Sciences": 298,
                            "Marketing": 89,
                            "Medical": 227,
                            "Human Resources": 12,
                            "Other": 41,
                            "Technical Degree": 61
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Human Resources",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 6,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Life Sciences",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "cafb6efad7aa4f07beecedb29e43308a"
            },
            {
                "ignoreSuggestionFlag": True,
                "name": "EmployeeCount",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "0.96 to 1.12"
                                ],
                                [
                                    "value",
                                    728
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "0.96 to 1.12"
                        ],
                        [
                            "value",
                            728
                        ]
                    ],
                    "download_url": "/api/download_data/o5rloeyypoz2u4tj"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": "Only one Unique Value",
                "slug": "f03a800c214742379f2f39426c7039ff"
            },
            {
                "ignoreSuggestionFlag": True,
                "name": "EmployeeNumber",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "444.0 to 555.0",
                                    "0.0 to 111.0",
                                    "333.0 to 444.0",
                                    "777.0 to 888.0",
                                    "222.0 to 333.0",
                                    "555.0 to 666.0",
                                    "111.0 to 222.0",
                                    "999.0 to 1110.0",
                                    "888.0 to 999.0",
                                    "666.0 to 777.0"
                                ],
                                [
                                    "value",
                                    81,
                                    80,
                                    75,
                                    74,
                                    73,
                                    73,
                                    72,
                                    71,
                                    69,
                                    60
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "444.0 to 555.0",
                            "0.0 to 111.0",
                            "333.0 to 444.0",
                            "777.0 to 888.0",
                            "222.0 to 333.0",
                            "555.0 to 666.0",
                            "111.0 to 222.0",
                            "999.0 to 1110.0",
                            "888.0 to 999.0",
                            "666.0 to 777.0"
                        ],
                        [
                            "value",
                            81,
                            80,
                            75,
                            74,
                            73,
                            73,
                            72,
                            71,
                            69,
                            60
                        ]
                    ],
                    "download_url": "/api/download_data/clcl0n4l2gf0ra3s"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 1107,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 320.53,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 542.3,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": "Index column (all values are distinct)",
                "slug": "87151576eca84a0b8cf590b049bc61ca"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "EnvironmentSatisfaction",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "High",
                                    "Very High",
                                    "Medium",
                                    "Low"
                                ],
                                [
                                    "value",
                                    226,
                                    209,
                                    151,
                                    142
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "High",
                            "Very High",
                            "Medium",
                            "Low"
                        ],
                        [
                            "value",
                            226,
                            209,
                            151,
                            142
                        ]
                    ],
                    "download_url": "/api/download_data/bqus0owb2u25v691"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "High": 226,
                            "Very High": 209,
                            "Medium": 151,
                            "Low": 142
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Low",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 4,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "High",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "d1301f9cb62d42fdbcfc2f6bd3818018"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "Gender",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Male",
                                    "Female"
                                ],
                                [
                                    "value",
                                    429,
                                    299
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Male",
                            "Female"
                        ],
                        [
                            "value",
                            429,
                            299
                        ]
                    ],
                    "download_url": "/api/download_data/muyu77ge4ww48gw2"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Male": 429,
                            "Female": 299
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Female",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 2,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Male",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "ac0b1ba8f4904d24a0f798731b491355"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "HourlyRate",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "42.0 to 49.0",
                                    "56.0 to 63.0",
                                    "70.0 to 77.0",
                                    "77.0 to 84.0",
                                    "49.0 to 56.0",
                                    "35.0 to 42.0",
                                    "63.0 to 70.0",
                                    "91.0 to 98.0",
                                    "84.0 to 91.0",
                                    "28.0 to 35.0",
                                    "None"
                                ],
                                [
                                    "value",
                                    86,
                                    84,
                                    76,
                                    73,
                                    69,
                                    67,
                                    65,
                                    65,
                                    62,
                                    46,
                                    35
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "42.0 to 49.0",
                            "56.0 to 63.0",
                            "70.0 to 77.0",
                            "77.0 to 84.0",
                            "49.0 to 56.0",
                            "35.0 to 42.0",
                            "63.0 to 70.0",
                            "91.0 to 98.0",
                            "84.0 to 91.0",
                            "28.0 to 35.0",
                            "None"
                        ],
                        [
                            "value",
                            86,
                            84,
                            76,
                            73,
                            69,
                            67,
                            65,
                            65,
                            62,
                            46,
                            35
                        ]
                    ],
                    "download_url": "/api/download_data/k1g72tpkjg8fuqdd"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 30,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 100,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 71,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 20.19,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 64.59,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "e3ec2233033c4815aa9dfe940a398132"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "JobInvolvement",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "High",
                                    "Medium",
                                    "Very High",
                                    "Low"
                                ],
                                [
                                    "value",
                                    441,
                                    182,
                                    68,
                                    37
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "High",
                            "Medium",
                            "Very High",
                            "Low"
                        ],
                        [
                            "value",
                            441,
                            182,
                            68,
                            37
                        ]
                    ],
                    "download_url": "/api/download_data/oa1tt77fi2pir441"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "High": 441,
                            "Very High": 68,
                            "Medium": 182,
                            "Low": 37
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Low",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 4,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "High",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "aaf326bf52db420aa12d3713f559ae68"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "JobLevel",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "0.8 to 1.2",
                                    "2.0 to 2.4",
                                    "2.8 to 3.2",
                                    "4.0 to 4.4",
                                    "None"
                                ],
                                [
                                    "value",
                                    296,
                                    239,
                                    105,
                                    49,
                                    39
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "0.8 to 1.2",
                            "2.0 to 2.4",
                            "2.8 to 3.2",
                            "4.0 to 4.4",
                            "None"
                        ],
                        [
                            "value",
                            296,
                            239,
                            105,
                            49,
                            39
                        ]
                    ],
                    "download_url": "/api/download_data/65ivlqr0y2gdb45o"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 5,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 5,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 1.14,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 2.03,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "c63b8d81757c4ba3a6f85553f8e6c945"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "JobRole",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Sales Executive",
                                    "Research Scientist",
                                    "Laboratory Technician",
                                    "Manufacturing Director",
                                    "Manager",
                                    "Sales Representative",
                                    "Research Director",
                                    "Human Resources"
                                ],
                                [
                                    "value",
                                    173,
                                    159,
                                    140,
                                    84,
                                    58,
                                    48,
                                    45,
                                    21
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Sales Executive",
                            "Research Scientist",
                            "Laboratory Technician",
                            "Manufacturing Director",
                            "Manager",
                            "Sales Representative",
                            "Research Director",
                            "Human Resources"
                        ],
                        [
                            "value",
                            173,
                            159,
                            140,
                            84,
                            58,
                            48,
                            45,
                            21
                        ]
                    ],
                    "download_url": "/api/download_data/1kmcr0y7tprwbq9e"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Sales Executive": 173,
                            "Laboratory Technician": 140,
                            "Sales Representative": 48,
                            "Research Director": 45,
                            "Human Resources": 21,
                            "Manager": 58,
                            "Manufacturing Director": 84,
                            "Research Scientist": 159
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Human Resources",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 8,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Sales Executive",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "202d81e591f749bd96a83071fffc0a26"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "JobSatisfaction",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Very High",
                                    "High",
                                    "Low",
                                    "Medium"
                                ],
                                [
                                    "value",
                                    242,
                                    221,
                                    137,
                                    128
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Very High",
                            "High",
                            "Low",
                            "Medium"
                        ],
                        [
                            "value",
                            242,
                            221,
                            137,
                            128
                        ]
                    ],
                    "download_url": "/api/download_data/9fln67iqyn5mqs0p"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "High": 221,
                            "Very High": 242,
                            "Medium": 128,
                            "Low": 137
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Medium",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 4,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Very High",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "e70aa467595e42c9881c9cbd0084c9d6"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "MaritalStatus",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Married",
                                    "Single",
                                    "Divorced"
                                ],
                                [
                                    "value",
                                    320,
                                    238,
                                    170
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Married",
                            "Single",
                            "Divorced"
                        ],
                        [
                            "value",
                            320,
                            238,
                            170
                        ]
                    ],
                    "download_url": "/api/download_data/2cnxbiyge1e5g9o7"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Single": 238,
                            "Married": 320,
                            "Divorced": 170
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Divorced",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 3,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Married",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "522de90d92204c56b634620d9028d66f"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "MonthlyIncome",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "1899.0 to 3798.0",
                                    "3798.0 to 5697.0",
                                    "5697.0 to 7596.0",
                                    "9495.0 to 11394.0",
                                    "7596.0 to 9495.0",
                                    "None",
                                    "11394.0 to 13293.0",
                                    "17091.0 to 18990.0",
                                    "13293.0 to 15192.0",
                                    "15192.0 to 17091.0",
                                    "0.0 to 1899.0"
                                ],
                                [
                                    "value",
                                    269,
                                    163,
                                    88,
                                    42,
                                    37,
                                    28,
                                    23,
                                    22,
                                    21,
                                    20,
                                    15
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "1899.0 to 3798.0",
                            "3798.0 to 5697.0",
                            "5697.0 to 7596.0",
                            "9495.0 to 11394.0",
                            "7596.0 to 9495.0",
                            "None",
                            "11394.0 to 13293.0",
                            "17091.0 to 18990.0",
                            "13293.0 to 15192.0",
                            "15192.0 to 17091.0",
                            "0.0 to 1899.0"
                        ],
                        [
                            "value",
                            269,
                            163,
                            88,
                            42,
                            37,
                            28,
                            23,
                            22,
                            21,
                            20,
                            15
                        ]
                    ],
                    "download_url": "/api/download_data/m1grciawn2t2tae5"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 1009,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 19999,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 687,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 4865.77,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 6417.48,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "081cf9a69cc242d790a8be5ba984381f"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "MonthlyRate",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "9960.0 to 12450.0",
                                    "22410.0 to 24900.0",
                                    "7470.0 to 9960.0",
                                    "4980.0 to 7470.0",
                                    "17430.0 to 19920.0",
                                    "14940.0 to 17430.0",
                                    "2490.0 to 4980.0",
                                    "19920.0 to 22410.0",
                                    "12450.0 to 14940.0",
                                    "None",
                                    "0.0 to 2490.0"
                                ],
                                [
                                    "value",
                                    86,
                                    85,
                                    79,
                                    75,
                                    75,
                                    74,
                                    71,
                                    70,
                                    60,
                                    43,
                                    10
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "9960.0 to 12450.0",
                            "22410.0 to 24900.0",
                            "7470.0 to 9960.0",
                            "4980.0 to 7470.0",
                            "17430.0 to 19920.0",
                            "14940.0 to 17430.0",
                            "2490.0 to 4980.0",
                            "19920.0 to 22410.0",
                            "12450.0 to 14940.0",
                            "None",
                            "0.0 to 2490.0"
                        ],
                        [
                            "value",
                            86,
                            85,
                            79,
                            75,
                            75,
                            74,
                            71,
                            70,
                            60,
                            43,
                            10
                        ]
                    ],
                    "download_url": "/api/download_data/t6jmzmdk10y5989j"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 2104,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 26999,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 720,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 7056.83,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 14315.44,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "443f81d7de464efd947ef0dd5a775ee5"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "NumCompaniesWorked",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "0.9 to 1.8",
                                    "0.0 to 0.9",
                                    "2.7 to 3.6",
                                    "3.6 to 4.5",
                                    "1.8 to 2.7",
                                    "4.5 to 5.4",
                                    "6.3 to 7.2",
                                    "5.4 to 6.3",
                                    "None",
                                    "7.2 to 8.1"
                                ],
                                [
                                    "value",
                                    273,
                                    94,
                                    71,
                                    68,
                                    64,
                                    37,
                                    36,
                                    35,
                                    32,
                                    18
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "0.9 to 1.8",
                            "0.0 to 0.9",
                            "2.7 to 3.6",
                            "3.6 to 4.5",
                            "1.8 to 2.7",
                            "4.5 to 5.4",
                            "6.3 to 7.2",
                            "5.4 to 6.3",
                            "None",
                            "7.2 to 8.1"
                        ],
                        [
                            "value",
                            273,
                            94,
                            71,
                            68,
                            64,
                            37,
                            36,
                            35,
                            32,
                            18
                        ]
                    ],
                    "download_url": "/api/download_data/6i1rb8i0ypd87l3y"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 9,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 10,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 2.53,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 2.7,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "cfaa93c0b2c9478ea57edef6dca792e3"
            },
            {
                "ignoreSuggestionFlag": True,
                "name": "Over18",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Y"
                                ],
                                [
                                    "value",
                                    728
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Y"
                        ],
                        [
                            "value",
                            728
                        ]
                    ],
                    "download_url": "/api/download_data/xze73uvkvb3p02p4"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Y": 728
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Y",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Y",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": "Only one Unique Value",
                "slug": "a5c9fe8252b84ac1afbc09f9dd26297a"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "OverTime",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "No",
                                    "Yes"
                                ],
                                [
                                    "value",
                                    513,
                                    215
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "No",
                            "Yes"
                        ],
                        [
                            "value",
                            513,
                            215
                        ]
                    ],
                    "download_url": "/api/download_data/miq4f1o8yonmtwum"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Yes": 215,
                            "No": 513
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Yes",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 2,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "No",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "e736d3aac11840d5b7fb35905ad8eb72"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "PercentSalaryHike",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "12.0 to 14.0",
                                    "14.0 to 16.0",
                                    "10.0 to 12.0",
                                    "18.0 to 20.0",
                                    "16.0 to 18.0",
                                    "20.0 to 22.0",
                                    "22.0 to 24.0",
                                    "24.0 to 26.0"
                                ],
                                [
                                    "value",
                                    193,
                                    148,
                                    103,
                                    88,
                                    79,
                                    51,
                                    50,
                                    16
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "12.0 to 14.0",
                            "14.0 to 16.0",
                            "10.0 to 12.0",
                            "18.0 to 20.0",
                            "16.0 to 18.0",
                            "20.0 to 22.0",
                            "22.0 to 24.0",
                            "24.0 to 26.0"
                        ],
                        [
                            "value",
                            193,
                            148,
                            103,
                            88,
                            79,
                            51,
                            50,
                            16
                        ]
                    ],
                    "download_url": "/api/download_data/zvfbu5z3fkrc2nqr"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 11,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 25,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 15,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 3.66,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 15.3,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "0039a4437bc9458c8195d65b911f20d1"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "PerformanceRating",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Excellent",
                                    "Outstanding"
                                ],
                                [
                                    "value",
                                    611,
                                    117
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Excellent",
                            "Outstanding"
                        ],
                        [
                            "value",
                            611,
                            117
                        ]
                    ],
                    "download_url": "/api/download_data/i8vy8luwzq968pvp"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Outstanding": 117,
                            "Excellent": 611
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Outstanding",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 2,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Excellent",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "e80a1e0c285449adb02eadd18ebba0d9"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "RelationshipSatisfaction",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "High",
                                    "Very High",
                                    "Medium",
                                    "Low"
                                ],
                                [
                                    "value",
                                    235,
                                    225,
                                    144,
                                    124
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "High",
                            "Very High",
                            "Medium",
                            "Low"
                        ],
                        [
                            "value",
                            235,
                            225,
                            144,
                            124
                        ]
                    ],
                    "download_url": "/api/download_data/ainijast54xo1jhc"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "High": 235,
                            "Very High": 225,
                            "Medium": 144,
                            "Low": 124
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Low",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 4,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "High",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "37f41bff41c04fde80a5a555073c3c17"
            },
            {
                "ignoreSuggestionFlag": True,
                "name": "StandardHours",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "80.0 to 80.16"
                                ],
                                [
                                    "value",
                                    728
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "80.0 to 80.16"
                        ],
                        [
                            "value",
                            728
                        ]
                    ],
                    "download_url": "/api/download_data/rpwaik9bw3c9jqvp"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 80,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 80,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 1,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 80,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": "Only one Unique Value",
                "slug": "976a0424969b4d2a9225b956d11235f4"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "StockOptionLevel",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "0.0 to 0.3",
                                    "0.9 to 1.2",
                                    "1.8 to 2.1",
                                    "None"
                                ],
                                [
                                    "value",
                                    321,
                                    302,
                                    72,
                                    33
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "0.0 to 0.3",
                            "0.9 to 1.2",
                            "1.8 to 2.1",
                            "None"
                        ],
                        [
                            "value",
                            321,
                            302,
                            72,
                            33
                        ]
                    ],
                    "download_url": "/api/download_data/vj95izxpnfawe7jb"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 3,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 4,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 0.81,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 0.75,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "17782e73ed7e4693beae6833069eab58"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "TotalWorkingYears",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "8.0 to 12.0",
                                    "4.0 to 8.0",
                                    "0.0 to 4.0",
                                    "12.0 to 16.0",
                                    "16.0 to 20.0",
                                    "20.0 to 24.0",
                                    "28.0 to 32.0",
                                    "24.0 to 28.0",
                                    "32.0 to 36.0",
                                    "36.0 to 40.0"
                                ],
                                [
                                    "value",
                                    202,
                                    187,
                                    91,
                                    69,
                                    64,
                                    56,
                                    23,
                                    17,
                                    12,
                                    7
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "8.0 to 12.0",
                            "4.0 to 8.0",
                            "0.0 to 4.0",
                            "12.0 to 16.0",
                            "16.0 to 20.0",
                            "20.0 to 24.0",
                            "28.0 to 32.0",
                            "24.0 to 28.0",
                            "32.0 to 36.0",
                            "36.0 to 40.0"
                        ],
                        [
                            "value",
                            202,
                            187,
                            91,
                            69,
                            64,
                            56,
                            23,
                            17,
                            12,
                            7
                        ]
                    ],
                    "download_url": "/api/download_data/gjmv53j37wu7x5by"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 40,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 39,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 7.9,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 11.02,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "5ef815674d134ed08b5c6b77ff1dbda6"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "TrainingTimesLastYear",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "1.8 to 2.4",
                                    "3.0 to 3.6",
                                    "4.8 to 5.4",
                                    "3.6 to 4.2",
                                    "0.6 to 1.2",
                                    "None",
                                    "0.0 to 0.6"
                                ],
                                [
                                    "value",
                                    261,
                                    245,
                                    63,
                                    57,
                                    46,
                                    29,
                                    27
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "1.8 to 2.4",
                            "3.0 to 3.6",
                            "4.8 to 5.4",
                            "3.6 to 4.2",
                            "0.6 to 1.2",
                            "None",
                            "0.0 to 0.6"
                        ],
                        [
                            "value",
                            261,
                            245,
                            63,
                            57,
                            46,
                            29,
                            27
                        ]
                    ],
                    "download_url": "/api/download_data/nnip4qpjlc4fb72t"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 6,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 7,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 1.3,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 2.77,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "25d25cb6f2554474b36afe22b4aded59"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "WorkLifeBalance",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "Better",
                                    "Good",
                                    "Best",
                                    "Bad"
                                ],
                                [
                                    "value",
                                    455,
                                    165,
                                    72,
                                    36
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "Better",
                            "Good",
                            "Best",
                            "Bad"
                        ],
                        [
                            "value",
                            455,
                            165,
                            72,
                            36
                        ]
                    ],
                    "download_url": "/api/download_data/6jynxgaijngukar0"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Better": 455,
                            "Bad": 36,
                            "Good": 165,
                            "Best": 72
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Bad",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 4,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "Better",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "6a1ae8af702c4ab282a33e48ebaa0b30"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "YearsAtCompany",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "0.0 to 4.0",
                                    "4.0 to 8.0",
                                    "8.0 to 12.0",
                                    "12.0 to 16.0",
                                    "20.0 to 24.0",
                                    "16.0 to 20.0",
                                    "24.0 to 28.0",
                                    "32.0 to 36.0",
                                    "28.0 to 32.0",
                                    "36.0 to 40.0"
                                ],
                                [
                                    "value",
                                    251,
                                    222,
                                    151,
                                    34,
                                    25,
                                    22,
                                    12,
                                    5,
                                    4,
                                    2
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "0.0 to 4.0",
                            "4.0 to 8.0",
                            "8.0 to 12.0",
                            "12.0 to 16.0",
                            "20.0 to 24.0",
                            "16.0 to 20.0",
                            "24.0 to 28.0",
                            "32.0 to 36.0",
                            "28.0 to 32.0",
                            "36.0 to 40.0"
                        ],
                        [
                            "value",
                            251,
                            222,
                            151,
                            34,
                            25,
                            22,
                            12,
                            5,
                            4,
                            2
                        ]
                    ],
                    "download_url": "/api/download_data/mu2ebmx1c4nwe07j"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 37,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 34,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 6.3,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 6.91,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "553a8465f06a40848d64159339542286"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "YearsInCurrentRole",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "2.0 to 4.0",
                                    "0.0 to 2.0",
                                    "6.0 to 8.0",
                                    "4.0 to 6.0",
                                    "8.0 to 10.0",
                                    "10.0 to 12.0",
                                    "12.0 to 14.0",
                                    "14.0 to 16.0",
                                    "16.0 to 18.0"
                                ],
                                [
                                    "value",
                                    249,
                                    153,
                                    125,
                                    75,
                                    71,
                                    21,
                                    17,
                                    9,
                                    8
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "2.0 to 4.0",
                            "0.0 to 2.0",
                            "6.0 to 8.0",
                            "4.0 to 6.0",
                            "8.0 to 10.0",
                            "10.0 to 12.0",
                            "12.0 to 14.0",
                            "14.0 to 16.0",
                            "16.0 to 18.0"
                        ],
                        [
                            "value",
                            249,
                            153,
                            125,
                            75,
                            71,
                            21,
                            17,
                            9,
                            8
                        ]
                    ],
                    "download_url": "/api/download_data/l3svriapkxcmfni9"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 18,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 19,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 3.7,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 4.21,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "f476ff7b68c147a98eac797c3535e95b"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "YearsSinceLastPromotion",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "0.0 to 2.0",
                                    "2.0 to 4.0",
                                    "6.0 to 8.0",
                                    "4.0 to 6.0",
                                    "8.0 to 10.0",
                                    "10.0 to 12.0",
                                    "14.0 to 16.0",
                                    "12.0 to 14.0"
                                ],
                                [
                                    "value",
                                    471,
                                    103,
                                    55,
                                    51,
                                    16,
                                    16,
                                    9,
                                    7
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "0.0 to 2.0",
                            "2.0 to 4.0",
                            "6.0 to 8.0",
                            "4.0 to 6.0",
                            "8.0 to 10.0",
                            "10.0 to 12.0",
                            "14.0 to 16.0",
                            "12.0 to 14.0"
                        ],
                        [
                            "value",
                            471,
                            103,
                            55,
                            51,
                            16,
                            16,
                            9,
                            7
                        ]
                    ],
                    "download_url": "/api/download_data/j03bkmpil6xds15r"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 15,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 16,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 3.14,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 2.09,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "0bd56b0b1dfd4f9e934c81b0e7958cdd"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "YearsWithCurrManager",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": {
                                "ratio": 0.5
                            }
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "2.0 to 4.0",
                                    "0.0 to 2.0",
                                    "6.0 to 8.0",
                                    "8.0 to 10.0",
                                    "4.0 to 6.0",
                                    "10.0 to 12.0",
                                    "12.0 to 14.0",
                                    "14.0 to 16.0",
                                    "16.0 to 18.0"
                                ],
                                [
                                    "value",
                                    235,
                                    176,
                                    117,
                                    91,
                                    64,
                                    19,
                                    16,
                                    6,
                                    4
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "2.0 to 4.0",
                            "0.0 to 2.0",
                            "6.0 to 8.0",
                            "8.0 to 10.0",
                            "4.0 to 6.0",
                            "10.0 to 12.0",
                            "12.0 to 14.0",
                            "14.0 to 16.0",
                            "16.0 to 18.0"
                        ],
                        [
                            "value",
                            235,
                            176,
                            117,
                            91,
                            64,
                            19,
                            16,
                            6,
                            4
                        ]
                    ],
                    "download_url": "/api/download_data/53ahnyugmnl7c9hd"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Count",
                        "name": "count",
                        "value": 728,
                        "display": True
                    },
                    {
                        "displayName": "Min",
                        "name": "min",
                        "value": 0,
                        "display": True
                    },
                    {
                        "displayName": "Max",
                        "name": "max",
                        "value": 17,
                        "display": True
                    },
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 18,
                        "display": True
                    },
                    {
                        "displayName": "Standard Deviation",
                        "name": "stddev",
                        "value": 3.58,
                        "display": True
                    },
                    {
                        "displayName": "Mean",
                        "name": "mean",
                        "value": 4.08,
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "measure",
                "ignoreSuggestionMsg": None,
                "slug": "89ee7c7fd7ca4e7ab8e0530eee20cd2e"
            },
            {
                "ignoreSuggestionFlag": False,
                "name": "Attrition",
                "chartData": {
                    "chart_c3": {
                        "bar": {
                            "width": 20
                        },
                        "point": None,
                        "color": {
                            "pattern": [
                                "#0fc4b5",
                                "#005662",
                                "#148071",
                                "#6cba86",
                                "#bcf3a2"
                            ]
                        },
                        "data": {
                            "x": "name",
                            "axes": {
                                "value": "y"
                            },
                            "type": "bar",
                            "columns": [
                                [
                                    "name",
                                    "No",
                                    "Yes"
                                ],
                                [
                                    "value",
                                    599,
                                    129
                                ]
                            ]
                        },
                        "legend": {
                            "show": False
                        },
                        "axis": {
                            "y": {
                                "tick": {
                                    "count": 7,
                                    "outer": False,
                                    "multiline": True,
                                    "format": ".2s"
                                },
                                "label": {
                                    "text": "",
                                    "position": "outer-middle"
                                }
                            },
                            "x": {
                                "tick": {
                                    "values": []
                                },
                                "type": "category",
                                "extent": None,
                                "label": {
                                    "text": "",
                                    "position": "outer-center"
                                }
                            }
                        }
                    },
                    "yformat": ".2s",
                    "table_c3": [
                        [
                            "name",
                            "No",
                            "Yes"
                        ],
                        [
                            "value",
                            599,
                            129
                        ]
                    ],
                    "download_url": "/api/download_data/ccxcbjykjnu8h2xn"
                },
                "dateSuggestionFlag": False,
                "columnStats": [
                    {
                        "displayName": "Not Nones",
                        "name": "numberOfNotNones",
                        "value": 728,
                        "display": False
                    },
                    {
                        "displayName": "LevelCount",
                        "name": "LevelCount",
                        "value": {
                            "Yes": 129,
                            "No": 599
                        },
                        "display": False
                    },
                    {
                        "displayName": "Min Level",
                        "name": "MinLevel",
                        "value": "Yes",
                        "display": True
                    },
                    {
                        "displayName": "Unique Values",
                        "name": "numberOfUniqueValues",
                        "value": 2,
                        "display": True
                    },
                    {
                        "displayName": "Max Level",
                        "name": "MaxLevel",
                        "value": "No",
                        "display": True
                    },
                    {
                        "displayName": "None Values",
                        "name": "numberOfNones",
                        "value": 0,
                        "display": True
                    }
                ],
                "columnType": "dimension",
                "ignoreSuggestionMsg": None,
                "slug": "99dbd074205f43819fa922dc55b1ea0a"
            }
        ],
        "metaData": [
            {
                "displayName": "Rows",
                "name": "noOfRows",
                "value": 728,
                "display": True
            },
            {
                "displayName": "Columns",
                "name": "noOfColumns",
                "value": 35,
                "display": True
            },
            {
                "displayName": "Measures",
                "name": "measures",
                "value": 19,
                "display": True
            },
            {
                "displayName": "Dimensions",
                "name": "dimensions",
                "value": 16,
                "display": True
            },
            {
                "displayName": "Time Dimension",
                "name": "timeDimension",
                "value": 0,
                "display": True
            },
            {
                "displayName": None,
                "name": "measureColumns",
                "value": [
                    "Age",
                    "DailyRate",
                    "DistanceFromHome",
                    "EmployeeCount",
                    "EmployeeNumber",
                    "HourlyRate",
                    "JobLevel",
                    "MonthlyIncome",
                    "MonthlyRate",
                    "NumCompaniesWorked",
                    "PercentSalaryHike",
                    "StandardHours",
                    "StockOptionLevel",
                    "TotalWorkingYears",
                    "TrainingTimesLastYear",
                    "YearsAtCompany",
                    "YearsInCurrentRole",
                    "YearsSinceLastPromotion",
                    "YearsWithCurrManager"
                ],
                "display": False
            },
            {
                "displayName": None,
                "name": "dimensionColumns",
                "value": [
                    "BusinessTravel",
                    "Department",
                    "Education",
                    "EducationField",
                    "EnvironmentSatisfaction",
                    "Gender",
                    "JobInvolvement",
                    "JobRole",
                    "JobSatisfaction",
                    "MaritalStatus",
                    "Over18",
                    "OverTime",
                    "PerformanceRating",
                    "RelationshipSatisfaction",
                    "WorkLifeBalance",
                    "Attrition"
                ],
                "display": False
            },
            {
                "displayName": None,
                "name": "timeDimensionColumns",
                "value": [],
                "display": False
            },
            {
                "displayName": None,
                "name": "ignoreColumnSuggestions",
                "value": [
                    "EmployeeCount",
                    "EmployeeNumber",
                    "Over18",
                    "StandardHours"
                ],
                "display": False
            },
            {
                "displayName": None,
                "name": "ignoreColumnReason",
                "value": [
                    "Only one Unique Value",
                    "Index column (all values are distinct)",
                    "Only one Unique Value",
                    "Only one Unique Value"
                ],
                "display": False
            },
            {
                "displayName": None,
                "name": "utf8ColumnSuggestion",
                "value": [],
                "display": False
            },
            {
                "displayName": None,
                "name": "dateTimeSuggestions",
                "value": {},
                "display": False
            }
        ],
        "advanced_settings": {
            "measures": {
                "trendSettings": [
                    {
                        "status": False,
                        "name": "Count"
                    },
                    {
                        "status": True,
                        "name": "Specific Measure",
                        "selectedMeasure": None
                    }
                ],
                "analysis": [
                    {
                        "status": False,
                        "noOfColumnsToUse": None,
                        "analysisSubTypes": [],
                        "displayName": "Overview",
                        "name": "overview"
                    },
                    {
                        "status": False,
                        "noOfColumnsToUse": None,
                        "analysisSubTypes": [
                            {
                                "status": False,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": False,
                                "displayName": "Factors that drive up",
                                "name": "factors that drive up"
                            },
                            {
                                "status": False,
                                "displayName": "Factors that drive down",
                                "name": "factors that drive down"
                            },
                            {
                                "status": False,
                                "displayName": "Forecast",
                                "name": "forecast"
                            }
                        ],
                        "displayName": "Trend",
                        "name": "trend"
                    },
                    {
                        "status": False,
                        "noOfColumnsToUse": [
                            {
                                "status": True,
                                "defaultValue": 3,
                                "displayName": "Low",
                                "name": "low"
                            },
                            {
                                "status": False,
                                "defaultValue": 5,
                                "displayName": "Medium",
                                "name": "medium"
                            },
                            {
                                "status": False,
                                "defaultValue": 8,
                                "displayName": "High",
                                "name": "high"
                            },
                            {
                                "status": False,
                                "defaultValue": 3,
                                "displayName": "Custom",
                                "name": "custom",
                                "value": None
                            }
                        ],
                        "analysisSubTypes": [
                            {
                                "status": False,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": False,
                                "displayName": "Top Sublevel",
                                "name": "Top Sublevel"
                            },
                            {
                                "status": False,
                                "displayName": "Trend for top Sublevel",
                                "name": "Trend for top Sublevel"
                            }
                        ],
                        "displayName": "Performance",
                        "name": "performance"
                    },
                    {
                        "status": False,
                        "noOfColumnsToUse": [
                            {
                                "status": True,
                                "defaultValue": 3,
                                "displayName": "Low",
                                "name": "low"
                            },
                            {
                                "status": False,
                                "defaultValue": 5,
                                "displayName": "Medium",
                                "name": "medium"
                            },
                            {
                                "status": False,
                                "defaultValue": 8,
                                "displayName": "High",
                                "name": "high"
                            },
                            {
                                "status": False,
                                "defaultValue": 3,
                                "displayName": "Custom",
                                "name": "custom",
                                "value": None
                            }
                        ],
                        "analysisSubTypes": [
                            {
                                "status": False,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": False,
                                "displayName": "Key areas of Impact",
                                "name": "Key areas of Impact"
                            },
                            {
                                "status": False,
                                "displayName": "Trend analysis",
                                "name": "Trend analysis"
                            }
                        ],
                        "displayName": "Influencer",
                        "name": "influencer"
                    },
                    {
                        "status": False,
                        "noOfColumnsToUse": None,
                        "analysisSubTypes": [],
                        "displayName": "Prediction",
                        "name": "prediction"
                    }
                ]
            },
            "dimensions": {
                "trendSettings": [
                    {
                        "status": True,
                        "name": "Count"
                    },
                    {
                        "status": False,
                        "name": "Specific Measure",
                        "selectedMeasure": None
                    }
                ],
                "targetLevels": [],
                "analysis": [
                    {
                        "status": False,
                        "noOfColumnsToUse": None,
                        "analysisSubTypes": [],
                        "displayName": "Overview",
                        "name": "overview"
                    },
                    {
                        "status": False,
                        "noOfColumnsToUse": None,
                        "analysisSubTypes": [
                            {
                                "status": False,
                                "displayName": "Overview",
                                "name": "overview"
                            },
                            {
                                "status": False,
                                "displayName": "Factors that drive up",
                                "name": "factors that drive up"
                            },
                            {
                                "status": False,
                                "displayName": "Factors that drive down",
                                "name": "factors that drive down"
                            },
                            {
                                "status": False,
                                "displayName": "Forecast",
                                "name": "forecast"
                            }
                        ],
                        "displayName": "Trend",
                        "name": "trend"
                    },
                    {
                        "status": False,
                        "noOfColumnsToUse": None,
                        "analysisSubTypes": [],
                        "displayName": "Prediction",
                        "name": "prediction"
                    },
                    {
                        "status": False,
                        "noOfColumnsToUse": [
                            {
                                "status": True,
                                "defaultValue": 3,
                                "displayName": "Low",
                                "name": "low"
                            },
                            {
                                "status": False,
                                "defaultValue": 5,
                                "displayName": "Medium",
                                "name": "medium"
                            },
                            {
                                "status": False,
                                "defaultValue": 8,
                                "displayName": "High",
                                "name": "high"
                            },
                            {
                                "status": False,
                                "defaultValue": 3,
                                "displayName": "Custom",
                                "name": "custom",
                                "value": None
                            }
                        ],
                        "analysisSubTypes": [],
                        "displayName": "Association",
                        "name": "association"
                    }
                ]
            }
        }
    }


def add_possible_analysis_to_ui_metadata(meta_data):
    return settings.ANALYSIS_FOR_TARGET_VARIABLE


def add_advanced_settings_to_ui_metadata(meta_data):
    return get_advanced_setting(meta_data)


def add_metaData_to_ui_metadata(meta_data):
    # metaDataUI = []
    # if "metaData" in meta_data:
    #     metaKeysUI = ["noOfRows", "noOfColumns", "measures", "dimensions", "timeDimension",
    #                   "measureColumns", "dimensionColumns"]
    #     metaDataUI = [x for x in meta_data["metaData"] if x["name"] in metaKeysUI]
    return meta_data['metaData']

def collect_slug_for_percentage_columns(meta_data):
    metaData = meta_data['metaData']
    name_list = []
    slug_list = []
    for data in metaData:
        if 'percentageColumns' == data['name']:
            name_list = data['value']

    columnData = meta_data['columnData']
    for name in name_list:
        for data in columnData:
            if name == data['name']:
                slug_list.append(data['slug'])

    return slug_list

def get_advanced_setting(metaData):

    time_count = 0
    try:
        for data in metaData:
            if data.get('name') == 'timeDimension':
                time_count += data.get('value')
            if data.get('name') == 'dateTimeSuggestions':
                time_count += len(data.get('value').keys())
    except:
        pass

    print "get_advanced_setting    ", time_count

    return add_trend_in_advanced_setting(time_count)


def add_trend_in_advanced_setting(time_count):
    import copy
    from django.conf import settings
    if time_count > 0:
        main_setting = copy.deepcopy(settings.ADVANCED_SETTINGS_FOR_POSSIBLE_ANALYSIS_WITHOUT_TREND)
        trend_setting = copy.deepcopy(settings.ADANCED_SETTING_FOR_POSSIBLE_ANALYSIS_TREND)

        main_setting["dimensions"]["analysis"].insert(1, trend_setting)
        main_setting["measures"]["analysis"].insert(1, trend_setting)
        return main_setting
    else:
        return settings.ADVANCED_SETTINGS_FOR_POSSIBLE_ANALYSIS_WITHOUT_TREND


def add_transformation_setting_to_ui_metadata(meta_data):
    transformation_final_obj = {"existingColumns": None, "newColumns": None}
    transformation_data = []

    if 'columnData' in meta_data:
        columnData = meta_data['columnData']
        transformation_settings = settings.TRANSFORMATION_SETTINGS_CONSTANT

        percentage_slug_list = collect_slug_for_percentage_columns(meta_data)

        for head in columnData:
            import copy
            temp = dict()
            temp['name'] = head.get('name')
            temp['slug'] = head.get('slug')
            columnSettingCopy = copy.deepcopy(transformation_settings.get('columnSetting'))
            columnType = head.get('columnType')

            if "dimension" == columnType:
                temp['columnSetting'] = columnSettingCopy[:4]
            elif "boolean" == columnType:
                temp['columnSetting'] = columnSettingCopy[:4]
            elif "measure" == columnType:
                datatype_element = columnSettingCopy[4]
                datatype_element['listOfActions'][0]["status"] = True
                columnSettingCopy[5]['listOfActions'][0]["status"] = True
                columnSettingCopy[6]['listOfActions'][0]["status"] = True

                temp['columnSetting'] = columnSettingCopy
            elif "datetime" == columnType:
                temp['columnSetting'] = columnSettingCopy[:3]



            if head['slug'] in percentage_slug_list:
                for colSet in temp['columnSetting']:
                    if 'set_variable' == colSet['actionName']:
                        colSet['status'] = True
                        if 'listOfActions' in colSet:
                            for listAct in colSet['listOfActions']:
                                if 'percentage' == listAct['name']:
                                    listAct['status'] = True
                                else:
                                    listAct['status'] = False

            transformation_data.append(temp)
        transformation_final_obj["existingColumns"] = transformation_data
        transformation_final_obj["newColumns"] = transformation_settings.get('new_columns')
    return transformation_final_obj


def add_columnData_to_ui_metatdata(meta_data):
    columnDataUI = []
    if 'columnData' in meta_data:
        columnData = meta_data['columnData']

        for head in columnData:
            colDataUI = {}
            colDataUI["name"] = head["name"]
            colDataUI["slug"] = head["slug"]
            colDataUI["columnType"] = head["columnType"]
            colDataUI["dateSuggestionFlag"] = head["dateSuggestionFlag"]
            colDataUI["ignoreSuggestionFlag"] = head["ignoreSuggestionFlag"]
            colDataUI["ignoreSuggestionMsg"] = head["ignoreSuggestionMsg"]
            if "actualColumnType" in head:
                colDataUI["actualColumnType"] = head["actualColumnType"]
            else:
                colDataUI["actualColumnType"] = None

            if head.get('ignoreSuggestionFlag') is True:
                # transformation_settings_ignore = copy.deepcopy(settings.TRANSFORMATION_SETTINGS_IGNORE)
                # transformation_settings_ignore['status'] = True
                # # transformation_settings_ignore['displayName'] = 'Consider for Analysis'
                # temp['columnSetting'].append(transformation_settings_ignore)
                colDataUI['consider'] = False
            else:
                # transformation_settings_ignore = copy.deepcopy(settings.TRANSFORMATION_SETTINGS_IGNORE)
                # transformation_settings_ignore['status'] = False
                # # transformation_settings_ignore['displayName'] = 'Ignore for Analysis'
                # temp['columnSetting'].append(transformation_settings_ignore)
                colDataUI['consider'] = True

            columnDataUI.append(colDataUI)
    return columnDataUI


def add_sampleData_to_ui_metadata(meta_data):
    if 'sampleData' in meta_data:
        return meta_data['sampleData']


def add_modified_to_ui_metadata(value=False):
    return value


def add_headers_to_ui_metadata(meta_data):
    if 'headers' in meta_data:
        return meta_data['headers']


def add_ui_metadata_to_metadata(meta_data):
    return {
        'possibleAnalysis': add_possible_analysis_to_ui_metadata(meta_data),
        'advanced_settings': add_advanced_settings_to_ui_metadata(meta_data),
        'transformation_settings': add_transformation_setting_to_ui_metadata(meta_data),
        'metaDataUI': add_metaData_to_ui_metadata(meta_data),
        'columnDataUI': add_columnData_to_ui_metatdata(meta_data),
        'sampleDataUI': add_sampleData_to_ui_metadata(meta_data),
        'headersUI': add_headers_to_ui_metadata(meta_data),
        'modified': add_modified_to_ui_metadata()
    }