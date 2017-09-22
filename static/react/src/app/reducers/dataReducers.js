{/*let dummyDataPreview = {
  "input_file": "/media/datasets/myTestFile_pYdOEyb.csv",
  "name": "myTestFile.csv",
  "slug": "mytestfilecsv-u9wwhuqff7",
  "auto_update": false,
  "auto_update_duration": 99999,
  "datasource_type": "fileUpload",
  "datasource_details": {},
  "preview": {},
  "meta_data": {
    "headers": [
      {
        "name": "age",
        "slug": "891c467e5751415292670ac2abb2a883"
      }, {
        "name": "workclass",
        "slug": "68b37b19e7824bdf83f992d886fe56e0"
      }, {
        "name": "fnlwgt",
        "slug": "ae6db8f2f55e419a971af960e43f15e6"
      }, {
        "name": "education",
        "slug": "c438f7b5d0464630968d8df260ac4c40"
      }, {
        "name": "education-num",
        "slug": "a272264c253447108f3057f0a830bcfb"
      }, {
        "name": "marital-status",
        "slug": "0edb91dcb0e14d63bf53eac025dcedf3"
      }, {
        "name": "sex",
        "slug": "76b2770e578d44f8949831106b59b7f7"
      }, {
        "name": "Capital-gain",
        "slug": "0660b13bdaeb42c2966d8be84e7c2a1d"
      }, {
        "name": "hours-per-week",
        "slug": "c30a862fe752454180189f10c9b5a3fa"
      }, {
        "name": "native-country",
        "slug": "22da3e590eab4684a0f8b7caddf67959"
      }
    ],
    "sampleData": [
      [
        "25",
        " Private",
        "226802",
        " 11th",
        "7",
        " Never-married",
        " Male",
        "0",
        "40",
        " United-States"
      ],
      [
        "38",
        " Private",
        "89814",
        " HS-grad",
        "9",
        " Married-civ-spouse",
        " Male",
        "0",
        "50",
        " United-States"
      ],
      [
        "28",
        " Local-gov",
        "336951",
        " Assoc-acdm",
        "12",
        " Married-civ-spouse",
        " Male",
        "0",
        "40",
        " United-States"
      ],
      [
        "44",
        " Private",
        "160323",
        " Some-college",
        "10",
        " Married-civ-spouse",
        " Male",
        "7688",
        "40",
        " United-States"
      ],
      [
        "18",
        " ?",
        "103497",
        " Some-college",
        "10",
        " Never-married",
        " Female",
        "0",
        "30",
        " United-States"
      ],
      [
        "34",
        " Private",
        "198693",
        " 10th",
        "6",
        " Never-married",
        " Male",
        "0",
        "30",
        " United-States"
      ],
      [
        "29",
        " ?",
        "227026",
        " HS-grad",
        "9",
        " Never-married",
        " Male",
        "0",
        "40",
        " United-States"
      ],
      [
        "63",
        " Self-emp-not-inc",
        "104626",
        " Prof-school",
        "15",
        " Married-civ-spouse",
        " Male",
        "3103",
        "32",
        " United-States"
      ],
      [
        "24",
        " Private",
        "369667",
        " Some-college",
        "10",
        " Never-married",
        " Female",
        "0",
        "40",
        " United-States"
      ]
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
          }, {
            "display": "Association",
            "name": "Dimension vs. Dimension",
            "id": "dimension-vs-dimension"
          }, {
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
          }, {
            "display": "Performance",
            "name": "Measure vs. Dimension",
            "id": "measure-vs-dimension"
          }, {
            "display": "Influencer",
            "name": "Measure vs. Measure",
            "id": "measure-vs-measure"
          }, {
            "display": "Prediction",
            "name": "Predictive modeling",
            "id": "predictive-modeling"
          }
        ]
      }
    },
    "columnData": [
      {
        "ignoreSuggestionFlag": true,
        "name": "age",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": {
                "ratio": 0.5
              }
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
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
                  "25.0 to 30.0",
                  "15.0 to 20.0",
                  "20.0 to 25.0",
                  "30.0 to 35.0",
                  "35.0 to 40.0",
                  "40.0 to 45.0",
                  "60.0 to 65.0"
                ],
                [
                  "value",
                  3,
                  1,
                  1,
                  1,
                  1,
                  1,
                  1
                ]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "25.0 to 30.0",
              "15.0 to 20.0",
              "20.0 to 25.0",
              "30.0 to 35.0",
              "35.0 to 40.0",
              "40.0 to 45.0",
              "60.0 to 65.0"
            ],
            [
              "value",
              3,
              1,
              1,
              1,
              1,
              1,
              1
            ]
          ],
          "download_url": "/api/download_data/37s945r1w1tdo7nb"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Count",
            "name": "count",
            "value": 9,
            "display": true
          }, {
            "displayName": "Min",
            "name": "min",
            "value": 18,
            "display": true
          }, {
            "displayName": "Max",
            "name": "max",
            "value": 63,
            "display": true
          }, {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 9,
            "display": true
          }, {
            "displayName": "Standard Deviation",
            "name": "stddev",
            "value": 13.48,
            "display": true
          }, {
            "displayName": "Mean",
            "name": "mean",
            "value": 33.67,
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 1000
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },

        "columnType": "measure",
        "ignoreSuggestionMsg": "Index column (all values are distinct)",
        "slug": "891c467e5751415292670ac2abb2a883"
      }, {
        "ignoreSuggestionFlag": false,
        "name": "workclass",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": {
                "ratio": 0.5
              }
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
            },
            "data": {
              "x": "name",
              "axes": {
                "value": "y"
              },
              "type": "bar",
              "columns": [
                [
                  "name", " Private", " ?", " Self-emp-not-inc", " Local-gov"
                ],
                ["value", 5, 2, 1, 1]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "name", " Private", " ?", " Self-emp-not-inc", " Local-gov"
            ],
            ["value", 5, 2, 1, 1]
          ],
          "download_url": "/api/download_data/9kw032xe7g46170c"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "LevelCount",
            "name": "LevelCount",
            "value": {
              " Self-emp-not-inc": 1,
              " Local-gov": 1,
              " ?": 2,
              " Private": 5
            },
            "display": false
          }, {
            "displayName": "Min Level",
            "name": "MinLevel",
            "value": " Self-emp-not-inc",
            "display": true
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 4,
            "display": true
          }, {
            "displayName": "Max Level",
            "name": "MaxLevel",
            "value": " Private",
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 100
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "dimension",
        "ignoreSuggestionMsg": null,
        "slug": "68b37b19e7824bdf83f992d886fe56e0"
      }, {
        "ignoreSuggestionFlag": true,
        "name": "fnlwgt",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": {
                "ratio": 0.5
              }
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
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
                  "83958.0 to 111944.0",
                  "223888.0 to 251874.0",
                  "139930.0 to 167916.0",
                  "195902.0 to 223888.0",
                  "335832.0 to 363818.0",
                  "null"
                ],
                [
                  "value",
                  3,
                  2,
                  1,
                  1,
                  1,
                  1
                ]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "83958.0 to 111944.0",
              "223888.0 to 251874.0",
              "139930.0 to 167916.0",
              "195902.0 to 223888.0",
              "335832.0 to 363818.0",
              "null"
            ],
            [
              "value",
              3,
              2,
              1,
              1,
              1,
              1
            ]
          ],
          "download_url": "/api/download_data/vt2owswgxuuuybuq"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Count",
            "name": "count",
            "value": 9,
            "display": true
          }, {
            "displayName": "Min",
            "name": "min",
            "value": 89814,
            "display": true
          }, {
            "displayName": "Max",
            "name": "max",
            "value": 369667,
            "display": true
          }, {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 9,
            "display": true
          }, {
            "displayName": "Standard Deviation",
            "name": "stddev",
            "value": 100674.93,
            "display": true
          }, {
            "displayName": "Mean",
            "name": "mean",
            "value": 201933.22,
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 1034
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "measure",
        "ignoreSuggestionMsg": "Index column (all values are distinct)",
        "slug": "ae6db8f2f55e419a971af960e43f15e6"
      }, {
        "ignoreSuggestionFlag": false,
        "name": "education",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": {
                "ratio": 0.5
              }
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
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
                  " Some-college",
                  " HS-grad",
                  " Prof-school",
                  " Assoc-acdm",
                  " 10th",
                  " 11th"
                ],
                [
                  "value",
                  3,
                  2,
                  1,
                  1,
                  1,
                  1
                ]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              " Some-college",
              " HS-grad",
              " Prof-school",
              " Assoc-acdm",
              " 10th",
              " 11th"
            ],
            [
              "value",
              3,
              2,
              1,
              1,
              1,
              1
            ]
          ],
          "download_url": "/api/download_data/rsufp2pkkpq9q35f"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "LevelCount",
            "name": "LevelCount",
            "value": {
              " Prof-school": 1,
              " Assoc-acdm": 1,
              " Some-college": 3,
              " 10th": 1,
              " 11th": 1,
              " HS-grad": 2
            },
            "display": false
          }, {
            "displayName": "Min Level",
            "name": "MinLevel",
            "value": " Prof-school",
            "display": true
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 6,
            "display": true
          }, {
            "displayName": "Max Level",
            "name": "MaxLevel",
            "value": " Some-college",
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 16565
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "dimension",
        "ignoreSuggestionMsg": null,
        "slug": "c438f7b5d0464630968d8df260ac4c40"
      }, {
        "ignoreSuggestionFlag": false,
        "name": "education-num",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": {
                "ratio": 0.5
              }
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
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
                  "9.9 to 10.8",
                  "9.0 to 9.9",
                  "5.4 to 6.3",
                  "6.3 to 7.2",
                  "11.7 to 12.6",
                  "null"
                ],
                [
                  "value",
                  3,
                  2,
                  1,
                  1,
                  1,
                  1
                ]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "9.9 to 10.8",
              "9.0 to 9.9",
              "5.4 to 6.3",
              "6.3 to 7.2",
              "11.7 to 12.6",
              "null"
            ],
            [
              "value",
              3,
              2,
              1,
              1,
              1,
              1
            ]
          ],
          "download_url": "/api/download_data/78onb86sfnqg5pdx"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Count",
            "name": "count",
            "value": 9,
            "display": true
          }, {
            "displayName": "Min",
            "name": "min",
            "value": 6,
            "display": true
          }, {
            "displayName": "Max",
            "name": "max",
            "value": 15,
            "display": true
          }, {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 6,
            "display": true
          }, {
            "displayName": "Standard Deviation",
            "name": "stddev",
            "value": 2.64,
            "display": true
          }, {
            "displayName": "Mean",
            "name": "mean",
            "value": 9.78,
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 143434
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "measure",
        "ignoreSuggestionMsg": null,
        "slug": "a272264c253447108f3057f0a830bcfb"
      }, {
        "ignoreSuggestionFlag": false,
        "name": "marital-status",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": 20
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
            },
            "data": {
              "x": "name",
              "axes": {
                "value": "y"
              },
              "type": "bar",
              "columns": [
                [
                  "name", " Never-married", " Married-civ-spouse"
                ],
                ["value", 5, 4]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "name", " Never-married", " Married-civ-spouse"
            ],
            ["value", 5, 4]
          ],
          "download_url": "/api/download_data/8lpjy0svryobxcid"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "LevelCount",
            "name": "LevelCount",
            "value": {
              " Married-civ-spouse": 4,
              " Never-married": 5
            },
            "display": false
          }, {
            "displayName": "Min Level",
            "name": "MinLevel",
            "value": " Married-civ-spouse",
            "display": true
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 2,
            "display": true
          }, {
            "displayName": "Max Level",
            "name": "MaxLevel",
            "value": " Never-married",
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 1003
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "dimension",
        "ignoreSuggestionMsg": null,
        "slug": "0edb91dcb0e14d63bf53eac025dcedf3"
      }, {
        "ignoreSuggestionFlag": false,
        "name": "sex",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": 20
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
            },
            "data": {
              "x": "name",
              "axes": {
                "value": "y"
              },
              "type": "bar",
              "columns": [
                [
                  "name", " Male", " Female"
                ],
                ["value", 7, 2]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "name", " Male", " Female"
            ],
            ["value", 7, 2]
          ],
          "download_url": "/api/download_data/sss1harn98ajg5me"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "LevelCount",
            "name": "LevelCount",
            "value": {
              " Male": 7,
              " Female": 2
            },
            "display": false
          }, {
            "displayName": "Min Level",
            "name": "MinLevel",
            "value": " Female",
            "display": true
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 2,
            "display": true
          }, {
            "displayName": "Max Level",
            "name": "MaxLevel",
            "value": " Male",
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 100545
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "dimension",
        "ignoreSuggestionMsg": null,
        "slug": "76b2770e578d44f8949831106b59b7f7"
      }, {
        "ignoreSuggestionFlag": false,
        "name": "Capital-gain",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": 20
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
            },
            "data": {
              "x": "name",
              "axes": {
                "value": "y"
              },
              "type": "bar",
              "columns": [
                [
                  "name", "0.0 to 769.0", "3076.0 to 3845.0", "6921.0 to 7690.0"
                ],
                ["value", 7, 1, 1]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "name", "0.0 to 769.0", "3076.0 to 3845.0", "6921.0 to 7690.0"
            ],
            ["value", 7, 1, 1]
          ],
          "download_url": "/api/download_data/7dj907xa2cn1uraq"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Count",
            "name": "count",
            "value": 9,
            "display": true
          }, {
            "displayName": "Min",
            "name": "min",
            "value": 0,
            "display": true
          }, {
            "displayName": "Max",
            "name": "max",
            "value": 7688,
            "display": true
          }, {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 3,
            "display": true
          }, {
            "displayName": "Standard Deviation",
            "name": "stddev",
            "value": 2640.92,
            "display": true
          }, {
            "displayName": "Mean",
            "name": "mean",
            "value": 1199,
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 10
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "measure",
        "ignoreSuggestionMsg": null,
        "slug": "0660b13bdaeb42c2966d8be84e7c2a1d"
      }, {
        "ignoreSuggestionFlag": false,
        "name": "hours-per-week",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": {
                "ratio": 0.5
              }
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
            },
            "data": {
              "x": "name",
              "axes": {
                "value": "y"
              },
              "type": "bar",
              "columns": [
                [
                  "name", "40.0 to 42.0", "30.0 to 32.0", "32.0 to 34.0", "48.0 to 50.0"
                ],
                ["value", 5, 2, 1, 1]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "name", "40.0 to 42.0", "30.0 to 32.0", "32.0 to 34.0", "48.0 to 50.0"
            ],
            ["value", 5, 2, 1, 1]
          ],
          "download_url": "/api/download_data/gg5cuehul4ekeq0h"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Count",
            "name": "count",
            "value": 9,
            "display": true
          }, {
            "displayName": "Min",
            "name": "min",
            "value": 30,
            "display": true
          }, {
            "displayName": "Max",
            "name": "max",
            "value": 50,
            "display": true
          }, {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 4,
            "display": true
          }, {
            "displayName": "Standard Deviation",
            "name": "stddev",
            "value": 6.4,
            "display": true
          }, {
            "displayName": "Mean",
            "name": "mean",
            "value": 38,
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 1000
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "measure",
        "ignoreSuggestionMsg": null,
        "slug": "c30a862fe752454180189f10c9b5a3fa"
      }, {
        "ignoreSuggestionFlag": true,
        "name": "native-country",
        "chartData": {
          "chart_c3": {
            "bar": {
              "width": 20
            },
            "point": null,
            "color": {
              "pattern": ["#0fc4b5", "#005662", "#148071", "#6cba86", "#bcf3a2"]
            },
            "data": {
              "x": "name",
              "axes": {
                "value": "y"
              },
              "type": "bar",
              "columns": [
                [
                  "name", " United-States"
                ],
                ["value", 9]
              ]
            },
            "legend": {
              "show": false
            },
            "axis": {
              "y": {
                "tick": {
                  "count": 7,
                  "outer": false,
                  "multiline": true,
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
                "extent": null,
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
              "name", " United-States"
            ],
            ["value", 9]
          ],
          "download_url": "/api/download_data/tplffwp0rwow7u9y"
        },
        "dateSuggestionFlag": false,
        "columnStats": [
          {
            "displayName": "Not Nulls",
            "name": "numberOfNotNulls",
            "value": 9,
            "display": false
          }, {
            "displayName": "LevelCount",
            "name": "LevelCount",
            "value": {
              " United-States": 9
            },
            "display": false
          }, {
            "displayName": "Min Level",
            "name": "MinLevel",
            "value": " United-States",
            "display": true
          }, {
            "displayName": "Unique Values",
            "name": "numberOfUniqueValues",
            "value": 1,
            "display": true
          }, {
            "displayName": "Max Level",
            "name": "MaxLevel",
            "value": " United-States",
            "display": true
          }, {
            "displayName": "Null Values",
            "name": "numberOfNulls",
            "value": 0,
            "display": true
          }
        ],
        "subsetting": {
          "measureSetting": {
            minimumValue: 0,
            maxValue: 1007
          },
          "dimentionSetting": {
            uniqueDimentions: {}
          }
        },
        "columnType": "dimension",
        "ignoreSuggestionMsg": "Only one Unique Value",
        "slug": "22da3e590eab4684a0f8b7caddf67959"
      }
    ],
    "metaData": [
      {
        "displayName": "Rows",
        "name": "noOfRows",
        "value": 9,
        "display": true
      }, {
        "displayName": "Columns",
        "name": "noOfColumns",
        "value": 10,
        "display": true
      }, {
        "displayName": "Measures",
        "name": "measures",
        "value": 5,
        "display": true
      }, {
        "displayName": "Dimensions",
        "name": "dimensions",
        "value": 5,
        "display": true
      }, {
        "displayName": "Time Dimension",
        "name": "timeDimension",
        "value": 0,
        "display": true
      }, {
        "displayName": null,
        "name": "measureColumns",
        "value": [
          "age", "fnlwgt", "education-num", "Capital-gain", "hours-per-week"
        ],
        "display": false
      }, {
        "displayName": null,
        "name": "dimensionColumns",
        "value": [
          "workclass", "education", "marital-status", "sex", "native-country"
        ],
        "display": false
      }, {
        "displayName": null,
        "name": "timeDimensionColumns",
        "value": [],
        "display": false
      }, {
        "displayName": null,
        "name": "ignoreColumnSuggestions",
        "value": [
          "age", "fnlwgt", "native-country"
        ],
        "display": false
      }, {
        "displayName": null,
        "name": "ignoreColumnReason",
        "value": [
          "Index column (all values are distinct)", "Index column (all values are distinct)", "Only one Unique Value"
        ],
        "display": false
      }, {
        "displayName": null,
        "name": "utf8ColumnSuggestion",
        "value": [],
        "display": false
      }, {
        "displayName": null,
        "name": "dateTimeSuggestions",
        "value": {},
        "display": false
      }
    ]
  },
  "created_at": "2017-09-20T12:14:55.873625Z",
  "deleted": false,
  "bookmarked": false,
  "file_remote": "hdfs",
  "analysis_done": true,
  "status": "SUCCESS",
  "created_by": {
    "username": "marlabs",
    "first_name": "Ankush",
    "last_name": "Patel",
    "email": "ankush.patel@marlabs.com",
    "date_joined": "2017-08-16T11:46:35Z"
  },
  "job": 1134
}
*/}
let default_updatedSubSetting = {
          "measureColumnFilters" : [],
          "dimensionColumnFilters" : [],
          "timeDimensionColumnFilters" : []
  }
export default function reducer(state = {
  dataList: {},
  selectedDataSet: "",
  current_page: 1,
  dataPreview: null,
  allDataSets: {},
  selectedDimensions: [],
  selectedMeasures: [],
  selectedTimeDimensions: "",
  dataPreviewFlag: false,
  selectedAnalysis: [],
  selectedVariablesCount: 0,
  signalMeta: {},
  curUrl: "",
  dataUploadLoaderModal: false,
  dULoaderValue: 10,
  data_search_element: "",
  dataSetMeasures: [],
  dataSetDimensions: [],
  dataSetTimeDimensions: [],
  ImmutableMeasures: [],
  ImmutableDimension: [],
  ImmutableTimeDimension: [],
  measureAllChecked: true,
  measureChecked: [],
  dimensionAllChecked: true,
  dimensionChecked: [],
  dateTimeChecked: [],
  updatedSubSetting:default_updatedSubSetting
}, action) {
  console.log("In DATA reducer!!");
  console.log(action);

  switch (action.type) {
    case "DATA_LIST":
      {
        return {
          ...state,
          dataList: action.data,
          current_page: action.current_page
        }
      }
      break;

    case "DATA_LIST_ERROR":
      {
        throw new Error("Unable to fetch data list!!");
      }
      break;
    case "DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreview: action.dataPreview,
          dataPreviewFlag: true,
          selectedDataSet: action.slug
        }
      }
      break;
    case "DATA_PREVIEW_FOR_LOADER":
      {
        return {
          ...state,
          dataPreview: action.dataPreview,
          selectedDataSet: action.slug
        }
      }
      break;

    case "DATA_PREVIEW_ERROR":
      {
        throw new Error("Fetching of Data failed!!");
      }
      break;
    case "DATA_ALL_LIST":
      {
        return {
          ...state,
          allDataSets: action.data,
          selectedDataSet: action.slug
        }
      }
      break;

    case "DATA_ALL_LIST_ERROR":
      {
        throw new Error("Unable to fetch data list!!");
      }
      break;
    case "SELECTED_ANALYSIS_TYPE":
      {
        return {
          ...state,
          selectedAnalysis: state.selectedAnalysis.concat(action.selectedAnalysis)
        }
      }
      break;
    case "UNSELECT_ANALYSIS_TYPE":
      {
        return {
          ...state,
          selectedAnalysis: state.selectedAnalysis.filter(item => action.selectedAnalysis !== item)
        }
      }
      break;

    case "UNSELECT_All_ANALYSIS_TYPE":
      {
        return {
          ...state,
          selectedAnalysis: action.unselectAll
        }
      }
      break;

    case "SELECTED_MEASURES":
      {
        return {
          ...state,
          selectedMeasures: state.selectedMeasures.concat(action.variableName),
          selectedVariablesCount: state.selectedVariablesCount + 1,
          measureChecked: action.meaChkBoxList,
          measureAllChecked: action.isAllChecked

        }
      }
      break;
    case "SHOW_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreviewFlag: true
        }
      }
      break;
    case "HIDE_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreviewFlag: false
        }
      }
      break;
    case "UNSELECT_MEASURES":
      {
        return {
          ...state,
          selectedMeasures: state.selectedMeasures.filter(item => action.variableName !== item),
          selectedVariablesCount: state.selectedVariablesCount - 1,
          measureChecked: action.meaChkBoxList,
          measureAllChecked: action.isAllChecked

        }
      }
      break;
    case "SELECTED_DIMENSIONS":
      {
        return {
          ...state,
          selectedDimensions: state.selectedDimensions.concat(action.variableName),
          selectedVariablesCount: state.selectedVariablesCount + 1,
          dimensionAllChecked: action.isAllChecked,
          dimensionChecked: action.dimChkBoxList
        }
      }
      break;
    case "UNSELECT_DIMENSION":
      {
        return {
          ...state,
          selectedDimensions: state.selectedDimensions.filter(item => action.variableName !== item),
          selectedVariablesCount: state.selectedVariablesCount - 1,
          dimensionAllChecked: action.isAllChecked,
          dimensionChecked: action.dimChkBoxList
        }
      }
      break;
    case "SELECTED_TIMEDIMENSION":
      {
        return {
          ...state,
          selectedTimeDimensions: action.variableName,
          selectedVariablesCount: state.selectedVariablesCount,
          dateTimeChecked: action.timeChkBoxList
        }
      }
      break;
    case "UNSELECT_TIMEDIMENSION":
      {
        return {
          ...state,
          selectedTimeDimensions: action.variableName,
          selectedVariablesCount: state.selectedVariablesCount - 1,
          dateTimeChecked: action.timeChkBoxList
        }
      }
      break;
    case "STORE_SIGNAL_META":
      {
        return {
          ...state,
          signalMeta: action.signalMeta,
          curUrl: action.curUrl
        }
      }
      break;
    case "SELECTED_DATASET":
      {
        return {
          ...state,
          selectedDataSet: action.dataset
        }
      }
      break;
    case "RESET_VARIABLES":
      {
        return {
          ...state,
          selectedDimensions: [],
          selectedTimeDimensions: [],
          selectedVariablesCount: 0,
          selectedMeasures: []
        }
      }
      break;
    case "SET_VARIABLES":
      {
        return {
          ...state,
          selectedDimensions: action.dimensions,
          selectedTimeDimensions: action.timeDimension,
          selectedMeasures: action.measures,
          selectedVariablesCount: action.count
        }
      }
      break;
    case "SHOW_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreviewFlag: true
        }
      }
      break;
    case "DATA_UPLOAD_LOADER":
      {
        return {
          ...state,
          dataUploadLoaderModal: true
        }
      }
      break;
    case "HIDE_DATA_UPLOAD_LOADER":
      {
        return {
          ...state,
          dataUploadLoaderModal: false
        }
      }
      break;
    case "DATA_UPLOAD_LOADER_VALUE":
      {
        return {
          ...state,
          dULoaderValue: action.value
        }
      }
      break;
    case "CLEAR_DATA_PREVIEW":
      {
        return {
          ...state,
          dataPreview: {},
          dataPreviewFlag: false,
          selectedDataSet: ""
        }
      }
      break;
    case "SEARCH_DATA":
      {
        return {
          ...state,
          data_search_element: action.search_element
        }
      }
      break;
    case "DATASET_VARIABLES":
      {
        return {
          ...state,
          dataSetMeasures: action.measures,
          dataSetDimensions: action.dimensions,
          dataSetTimeDimensions: action.timeDimensions,
          ImmutableMeasures: action.measures,
          ImmutableDimension: action.dimensions,
          ImmutableTimeDimension: action.timeDimensions,
          measureChecked: action.measureChkBoxList,
          dimensionChecked: action.dimChkBoxList,
          measureAllChecked: true,
          dimensionAllChecked: true,
          dateTimeChecked: action.dateTimeChkBoxList
        }
      }
      break;

    case "SEARCH_MEASURE":
      {
        return {
          ...state,
          dataSetMeasures: state.ImmutableMeasures.filter((item) => item.toLowerCase().includes(action.name.toLowerCase()))
        }
      }
      break;
    case "SORT_MEASURE":
      {
        return {
          ...state,
          dataSetMeasures: action.measures,
          measureChecked: action.checkBoxList
        }
      }
      break;

    case "SORT_DIMENSION":
      {
        return {
          ...state,
          dataSetDimensions: action.dimensions,
          dimensionChecked: action.checkBoxList1
        }
      }
      break;

    case "SORT_TIMEDIMENSION":
      {
        return {
          ...state,
          dataSetTimeDimensions: action.timedimensions,
          dateTimeChecked: action.checkBoxList2
        }
      }
      break;

    case "SEARCH_DIMENSION":
      {
        return {
          ...state,
          dataSetDimensions: state.ImmutableDimension.filter((item) => item.toLowerCase().includes(action.name.toLowerCase()))
        }
      }
      break;

    case "SEARCH_TIMEDIMENSION":
      {
        return {
          ...state,
          dataSetTimeDimensions: state.ImmutableTimeDimension.filter((item) => item.toLowerCase().includes(action.name.toLowerCase()))
        }
      }
      break;

    case "SELECT_ALL_MEASURES":
      {
        return {
          ...state,
          selectedMeasures: action.measures,
          measureAllChecked: true,
          measureChecked: action.meaChkBoxList,
          selectedVariablesCount: state.selectedDimensions.length + action.measures.length + action.dataTimeCount,
          dataSetMeasures: action.measures

        }
      }
      break;
    case "UNSELECT_ALL_MEASURES":
      {
        return {
          ...state,
          selectedMeasures: [],
          measureAllChecked: false,
          measureChecked: action.meaChkBoxList,
          selectedVariablesCount: state.selectedVariablesCount - state.selectedMeasures.length,
          dataSetMeasures: state.ImmutableMeasures
        }
      }
      break;

    case "SELECT_ALL_DIMENSION":
      {
        return {
          ...state,
          selectedDimensions: action.dimension,
          dimensionAllChecked: true,
          dimensionChecked: action.diaChkBoxList,
          selectedVariablesCount: state.selectedMeasures.length + action.dimension.length + action.dataTimeCount,
          dataSetDimensions: action.dimension
        }
      }
      break;
    case "UNSELECT_ALL_DIMENSION":
      {
        return {
          ...state,
          selectedDimensions: [],
          dimensionAllChecked: false,
          dimensionChecked: action.diaChkBoxList,
          selectedVariablesCount: state.selectedVariablesCount - state.selectedDimensions.length,
          dataSetDimensions: state.ImmutableDimension
        }
      }
      break;
    case "UPDATE_SUBSETTING":
    {
      return{
        ...state,
        updatedSubSetting: action.updatedSubSetting
      }
    }
    break;
  }

  return state
}
