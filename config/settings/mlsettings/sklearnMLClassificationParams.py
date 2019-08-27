
############################    Classification    ###############################
SKLEARN_ML_SUPPORTED_PENALTY_CLASSIFICATION = [
    {"name":"gini","selected":False,"displayName":"Gini Impurity"},
    {"name":"entropy","selected":False,"displayName":"Entropy"},
]
SKLEARN_ML_SUPPORTED_MULTICLASS_OPTION = [
    {"name":"ovr","selected":False,"displayName":"One Vs Rest"},
    {"name":"multinomial","selected":False,"displayName":"Multinomial"}
]
SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION = [
    {"name":"newton-cg","selected":False,"displayName":"newton-cg","penalty":"l2"},
    {"name":"lbfgs","selected":False,"displayName":"lbfgs","penalty":"l2"},
    {"name":"sag","selected":False,"displayName":"sag","penalty":"l2"},
    # {"name":"liblinear","selected":False,"displayName":"liblinear","penalty":"l1"},
    {"name":"saga","selected":False,"displayName":"saga","penalty":"l1"},

]
SKLEARN_ML_SUPPORTED_SPLIT_CRITERION_CLASSIFICATION = [
    {"name":"gini","selected":False,"displayName":"Gini Impurity"},
    {"name":"entropy","selected":False,"displayName":"Entropy"},
]

SKLEARN_ML_SUPPORTED_MAX_FEATURES = [
    {"name":"auto","selected":False,"displayName":"sqrt(n_features)"},
    {"name":"sqrt","selected":False,"displayName":"sqrt(n_features)"},
    {"name":"log2","selected":False,"displayName":"log2(n_features)"},
    {"name":None,"selected":False,"displayName":"n_features"}
]

##### NEURAL NETWORK PARAMETERS    ####

SKLEARN_ML_SUPPORTED_ACTIVATION_CLASSIFICATION = [
    {"name":"identity","selected":False,"displayName":"identity"},
    {"name":"logistic","selected":False,"displayName":"logistic"},
    {"name":"tanh","selected":False,"displayName":"tanh"},
    {"name":"relu","selected":False,"displayName":"relu"},

]

SKLEARN_ML_SUPPORTED_NNSOLVER_CLASSIFICATION = [
    {"name":"adam","selected":False,"displayName":"adam"},
    {"name":"lbfgs","selected":False,"displayName":"lbfgs"},
    {"name":"sgd","selected":False,"displayName":"sgd"},
]

SKLEARN_ML_SUPPORTED_LEARNING_RATE_CLASSIFICATION = [
    {"name":"constant","selected":False,"displayName":"constant"},
    {"name":"invscaling","selected":False,"displayName":"invscaling"},
    {"name":"adaptive","selected":False,"displayName":"adaptive"},

]



#########################################################

SKLEARN_ML_TREE_BASED_CLASSIFICATION_COMMON_PARAMS = [
               {
                    "name":"max_depth",
                    "displayName":"Max Depth",
                    "description":"The maximum depth of the tree",
                    "defaultValue":5,
                    "acceptedValue":None,
                    "valueRange":[2,20],
                    "paramType":"number",
                    "uiElemType":"slider",
                    "display":True,
                    "hyperpatameterTuningCandidate":True,
                    "expectedDataType": ["int",None],
                    "allowedDataType":["int",None]
                },
                {
                    "name":"min_samples_split",
                    "displayName":"Minimum Instances For Split",
                    "description":"The minimum number of samples required to split an internal node",
                    "defaultValue":2,
                    "acceptedValue":None,
                    "valueRange":[2,10],
                    "paramType":"number",
                    "uiElemType":"slider",
                    "display":True,
                    "hyperpatameterTuningCandidate":True,
                    "expectedDataType": ["int"],
                    "allowedDataType":["int", "float"]
                },
                {
                    "name":"min_samples_leaf",
                    "displayName":"Minimum Instances For Leaf Node",
                    "description":"The minimum number of samples required to be at a leaf node",
                    "defaultValue":1,
                    "acceptedValue":None,
                    "valueRange":[1,100],
                    "paramType":"number",
                    "uiElemType":"slider",
                    "display":True,
                    "hyperpatameterTuningCandidate":True,
                    "expectedDataType": ["int"],
                    "allowedDataType": ["int", "float"]
                },
                {
                    "name":"min_impurity_decrease",
                    "displayName":"Impurity Decrease cutoff for Split",
                    "description":"A node will be split if this split induces a decrease of the impurity greater than or equal to this value",
                    "defaultValue":0.0,
                    "acceptedValue":None,
                    "valueRange":[0.0,1.0],
                    "paramType":"number",
                    "uiElemType":"slider",
                    "display":True,
                    "hyperpatameterTuningCandidate":True,
                    "expectedDataType": ["float"],
                    "allowedDataType": ["float"]
                },
]

SKLEARN_ML_DTREE_CLASSIFICATION_PARAMS = SKLEARN_ML_TREE_BASED_CLASSIFICATION_COMMON_PARAMS + [
        {
            "name":"max_features",
            "displayName":"Maximum Features for Split",
            "description":"The number of features to consider when looking for the best split",
            "defaultValue":[obj if obj["name"] != None else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_MAX_FEATURES],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType":["string"],
            "allowedDataType":["string"]
        },
        {
            "name":"splitter",
            "displayName":"Node Split Strategy",
            "description":"The strategy used to choose the split at each node",
            "defaultValue":[
             {
                 "name":"best",
                 "selected":True,
                 "displayName":"Best split"
             },
             {
                 "name":"random",
                 "selected":False,
                 "displayName":"Best random split"
             }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["string"],
            "allowedDataType":["bool"]
        },
        {
             "name":"presort",
             "displayName":"Pre Sort",
             "description":"Presort the data to speed up the finding of best splits in fitting",
             "defaultValue":[
             {
                 "name":"false",
                 "selected":True,
                 "displayName":"False"
             },
             {
                 "name":"true",
                 "selected":False,
                 "displayName":"True"
             }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":False,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["bool"],
            "allowedDataType":["bool"]
         },


]

SKLEANR_ML_RF_CLASSIFICATION_PARAMS = SKLEARN_ML_TREE_BASED_CLASSIFICATION_COMMON_PARAMS + [
        {
            "name":"n_estimators",
            "displayName":"No of Estimators",
            "description":"The number of trees in the forest",
            "defaultValue":10,
            "acceptedValue":None,
            "valueRange":[10,1000],
            "paramType":"number",
            "uiElemType":"slider",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]
        },
        {
                "name": "n_jobs",
                "displayName": "No Of Jobs",
                "description": "Number of CPU cores to be used when parallelizing over classes",
                "defaultValue": [
                    {
                        "name": -1,
                        "selected": True,
                        "displayName": "All"
                    },
                    {
                        "name": 1,
                        "selected": False,
                        "displayName": "1 core"
                    },
                    {
                        "name": 2,
                        "selected": False,
                        "displayName": "2 cores"
                    },
                    {
                        "name": 3,
                        "selected": False,
                        "displayName": "3 cores"
                    },
                    {
                        "name": 4,
                        "selected": False,
                        "displayName": "4 cores"
                    },
                ],
                "paramType": "list",
                "uiElemType": "checkbox",
                "display": True,
                "hyperpatameterTuningCandidate": False,
                "expectedDataType": ["int"],
                "allowedDataType": ["int"]
            },
        {
            "name":"criterion",
            "displayName":"Criterion",
            "description":"The function to measure the quality of a split",
            # "defaultValue":[obj if obj["name"] != "gini" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_SPLIT_CRITERION_CLASSIFICATION],
            "defaultValue":[obj for obj in SKLEARN_ML_SUPPORTED_SPLIT_CRITERION_CLASSIFICATION],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType":["string"],
            "allowedDataType":["string"]
        },
        {
            "name":"max_leaf_nodes",
            "displayName":"Max Leaf Nodes",
            "description":"The maximum of number of leaf nodes",
            "defaultValue":None,
            "acceptedValue":None,
            "valueRange":[],
            "paramType":"number",
            "uiElemType":"textBox",
            "display":True,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["int", None],
            "allowedDataType": ["int",None]
        },
        {
         "name":"random_state",
         "displayName":"Random Seed",
         "description":"The seed of the pseudo random number generator to use when shuffling the data",
         "defaultValue":None,
         "acceptedValue":None,
         "valueRange":[1,100],
         "paramType":"number",
         "uiElemType":"textBox",
         "display":True,
         "hyperpatameterTuningCandidate":False,
         "expectedDataType": ["int", None],
         "allowedDataType": ["int", None]
        },
        {
            "name":"bootstrap",
            "displayName":"Bootstrap Sampling",
            "description":"It defines whether bootstrap samples are used when building trees",
            "defaultValue":[
             {
                 "name":"false",
                 "selected":False,
                 "displayName":"False"
             },
             {
                 "name":"true",
                 "selected":False,
                 "displayName":"True"
             }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["bool"],
            "allowedDataType": ["bool"]
        },
        {
            "name":"oob_score",
            "displayName":"use out-of-bag samples",
            "description":"It defines whether to use out-of-bag samples to estimate the R^2 on unseen data",
            "defaultValue":[
             {
                 "name":"false",
                 "selected":True,
                 "displayName":"False"
             },
             {
                 "name":"true",
                 "selected":False,
                 "displayName":"True"
             }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":False,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["bool"],
            "allowedDataType": ["bool"]
        },
        {
            "name":"warm_start",
            "displayName":"Warm Start",
            "description":"When set to True, reuse the solution of the previous call to fit as initialization",
            "defaultValue":[
             {
                 "name":"false",
                 "selected":True,
                 "displayName":"False"
             },
             {
                 "name":"true",
                 "selected":False,
                 "displayName":"True"
             }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":False,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["bool"],
            "allowedDataType": ["bool"]
        },
]

SKLEARN_ML_LOGISTIC_REGRESSION_PARAMS = [
        {
            "name":"max_iter",
            "displayName":"Maximum Solver Iterations",
            "description": "Maximum number of iterations to be attempted for solver operations",
            "defaultValue":100,
            "acceptedValue":None,
            "valueRange":[10,400],
            "paramType":"number",
            "uiElemType":"slider",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]
        },
        {
                "name": "n_jobs",
                "displayName": "No Of Jobs",
                "description": "Number of CPU cores to be used when parallelizing over classes",
                "defaultValue": [
                    {
                        "name": -1,
                        "selected": True,
                        "displayName": "All"
                    },
                    {
                        "name": 1,
                        "selected": False,
                        "displayName": "1 core"
                    },
                    {
                        "name": 2,
                        "selected": False,
                        "displayName": "2 cores"
                    },
                    {
                        "name": 3,
                        "selected": False,
                        "displayName": "3 cores"
                    },
                    {
                        "name": 4,
                        "selected": False,
                        "displayName": "4 cores"
                    },
                ],
                "paramType": "list",
                "uiElemType": "checkbox",
                "display": True,
                "hyperpatameterTuningCandidate": False,
                "expectedDataType": ["int"],
                "allowedDataType": ["int"]
            },
        {
            "name":"tol",
            "displayName":"Convergence tolerance of iterations(e^-n)",
           "description": "Tolerance for the stopping criteria",
            "defaultValue":4,
            "acceptedValue":None,
            "valueRange":[3,10],
            "paramType":"number",
            "uiElemType":"slider",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]

        },
        {
            "name":"fit_intercept",
            "displayName":"Fit Intercept",
            "description":"Specifies if a constant(a.k.a bias or intercept) should be added to the decision function",
            "defaultValue":[
                 {
                     "name":"false",
                     "selected":False,
                     "displayName":"False"
                 },
                 {
                     "name":"true",
                     "selected":False,
                     "displayName":"True"
                 }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["bool"],
            "allowedDataType":["bool"]
         },
        {
            "name":"solver",
            "displayName":"Solver Used",
            "description": "Algorithm to use in the Optimization",
            # "defaultValue":[obj if obj["name"] != "lbfgs" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION],
            "defaultValue":[obj for obj in SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["string"],
            "allowedDataType":["string"]
        },
        {
            "name":"multi_class",
            "displayName":"Multiclass Option",
            "description": "Nature of multiclass modeling options for classification",
            "defaultValue":[obj if obj["name"] != "ovr" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_MULTICLASS_OPTION],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["string"],
            "allowedDataType":["string"]
        },
        {
            "name":"warm_start",
            "displayName":"Warm Start",
            "description": "It reuses the solution of the previous call to fit as initialization",
            "defaultValue":[
             {
                 "name":"false",
                 "selected":True,
                 "displayName":"False"
             },
             {
                 "name":"true",
                 "selected":False,
                 "displayName":"True"
             }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["bool"],
            "allowedDataType":["bool"]
        },
         {
             "name":"random_state",
             "displayName":"Random Seed",
            "description": "The seed of the pseudo random number generator to use when shuffling the data",
             "defaultValue":None,
             "acceptedValue":None,
             "valueRange":[1,100],
             "paramType":"number",
             "uiElemType":"textBox",
             "display":True,
             "hyperpatameterTuningCandidate":False,
             "expectedDataType": ["int"],
             "allowedDataType":["int"]
         },
         {
             "name":"C",
             "displayName":"Inverse of regularization strength",
            "description": "It refers to the inverse of regularization strength",
             "defaultValue":1.0,
             "acceptedValue":None,
             "valueRange":[0.1,20.0],
             "paramType":"number",
             "uiElemType":"textBox",
             "display":True,
             "hyperpatameterTuningCandidate":True,
             "expectedDataType": ["float","int"],
             "allowedDataType":["float"]
         },
]

SKLEARN_ML_NEURAL_NETWORK_PARAMS = [
        {
            "name":"hidden_layer_sizes",
            "displayName":"Hidden Layer Size",
            "description": "Number of neurons in the ith hidden layer.",
            "defaultValue":100,
            "acceptedValue":None,
            "valueRange":[0,100],
            "paramType":"tuple",
            "uiElemType":"slider",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]
        },
        {
            "name":"activation",
            "displayName":"Activation",
            "description": "Activation function for the hidden layer.",
            # "defaultValue":[obj if obj["name"] != "lbfgs" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION],
            "defaultValue":[obj for obj in SKLEARN_ML_SUPPORTED_ACTIVATION_CLASSIFICATION],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["string"],
            "allowedDataType":["string"]
        },
        {
            "name":"solver",
            "displayName":"Solver Used",
            "description": "The solver for weight optimization.",
            # "defaultValue":[obj if obj["name"] != "lbfgs" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION],
            "defaultValue":[obj for obj in SKLEARN_ML_SUPPORTED_NNSOLVER_CLASSIFICATION],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["string"],
            "allowedDataType":["string"]
        },
        {
            "name":"alpha",
            "displayName":"Alpha",
            "description": "L2 penalty (regularization term) parameter.",
            "defaultValue":0.0001,
            "acceptedValue":None,
            "valueRange":[0.1,20.0],
            "paramType":"number",
            "uiElemType":"textBox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["float"],
            "allowedDataType":["float"]
        },
        {
            "name":"batch_size",
            "displayName":"Batch Size",
	        "description": "Size of minibatches for stochastic optimizers.",
            # "defaultValue":[obj if obj["name"] != "lbfgs" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj  in SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION],
            "defaultValue":"auto",
            "acceptedValue":None,
            "valueRange":[],
            "paramType":"number",
            "uiElemType":"textBox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]
        },
       # {
           # "name":"batchss_size",
            #"displayName":"Batchss Size",
           # "description": "Size of minibaaatches for stochastic optimizers.",
            # "defaultValue":[obj if obj["name"] != "lbfgs" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION],
           # "defaultValue":5,
           # "acceptedValue":None,
           # "valueRange":[],
           # "paramType":"number",
           # "uiElemType":"textbox",
           # "display":True,
           # "hyperpatameterTuningCandidate":True,
           # "expectedDataType": ["int"],
           # "allowedDataType":["int"]
       # },
        {
            "name":"learning_rate",
            "displayName":"Learning Rate",
            "description": "Learning rate schedule for weight updates.",
            # "defaultValue":[obj if obj["name"] != "lbfgs" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_SOLVER_CLASSIFICATION],
            "defaultValue":[obj for obj in SKLEARN_ML_SUPPORTED_LEARNING_RATE_CLASSIFICATION],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True if SKLEARN_ML_SUPPORTED_NNSOLVER_CLASSIFICATION[2]["selected"]==True else False,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["string"],
            "allowedDataType":["string"]
        },
        {
            "name":"learning_rate_init",
            "displayName":"Learning Rate Initialize",
            "description": "Controls the step-size in updating the weights.",
            "defaultValue":0.001,
            "acceptedValue":None,
            "valueRange":[0.1,20.0],
            "paramType":"number",
            "uiElemType":"textBox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["double"],
            "allowedDataType":["double"]
        },
        {
            "name":"power_t",
            "displayName":"Power T",
            "description": "The exponent for inverse scaling learning rate.",
            "defaultValue":0.5,
            "acceptedValue":None,
            "valueRange":[0.1,20.0],
            "paramType":"number",
            "uiElemType":"textBox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["float"],
            "allowedDataType":["float"]
        },
        {
            "name":"max_iter",
            "displayName":"Maximum Solver Iterations",
            "description": "Maximum number of iterations to be attempted for solver operations",
            "defaultValue":200,
            "acceptedValue":None,
            "valueRange":[10,400],
            "paramType":"number",
            "uiElemType":"slider",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]
        },
        {
            "name":"shuffle",
            "displayName":"Shuffle",
            "description":"Whether to shuffle samples in each iteration.",
            "defaultValue":[
                 {
                     "name":"false",
                     "selected":False,
                     "displayName":"False"
                 },
                 {
                     "name":"true",
                     "selected":True,
                     "displayName":"True"
                 }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["bool"],
            "allowedDataType":["bool"]
         },
        {
            "name":"random_state",
            "displayName":"Random Seed",
           "description": "The seed of the pseudo random number generator to use when shuffling the data",
            "defaultValue":None,
            "acceptedValue":None,
            "valueRange":[1,100],
            "paramType":"number",
            "uiElemType":"textBox",
            "display":True,
            "hyperpatameterTuningCandidate":False,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]
        },
        {
            "name":"tol",
            "displayName":"Convergence tolerance of iterations(e^-n)",
            "description": "Tolerance for the stopping criteria",
            "defaultValue":4,
            "acceptedValue":None,
            "valueRange":[3,10],
            "paramType":"number",
            "uiElemType":"slider",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["int"],
            "allowedDataType":["int"]

        },
        {
            "name":"verbose",
            "displayName":"Verbose",
            "description":"Whether to print progress messages to stdout.",
            "defaultValue":[
                 {
                     "name":"false",
                     "selected":False,
                     "displayName":"False"
                 },
                 {
                     "name":"true",
                     "selected":False,
                     "displayName":"True"
                 }
            ],
            "paramType":"list",
            "uiElemType":"checkbox",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["bool"],
            "allowedDataType":["bool"]
         },
         {
             "name":"warm_start",
             "displayName":"Warm Start",
             "description": "It reuses the solution of the previous call to fit as initialization",
             "defaultValue":[
              {
                  "name":"false",
                  "selected":False,
                  "displayName":"False"
              },
              {
                  "name":"true",
                  "selected":False,
                  "displayName":"True"
              }
             ],
             "paramType":"list",
             "uiElemType":"checkbox",
             "display":True,
             "hyperpatameterTuningCandidate":False,
             "expectedDataType": ["bool"],
             "allowedDataType":["bool"]
         },
         {
             "name":"momentum",
             "displayName":"Momentum",
             "description": "Momentum for gradient descent update.",
             "defaultValue":0.9,
             "acceptedValue":None,
             "valueRange":[0,1],
             "paramType":"number",
             "uiElemType":"textBox",
             "display":True,
             "hyperpatameterTuningCandidate":True,
             "expectedDataType": ["float"],
             "allowedDataType":["float"]
         },
         {
             "name":"nesterovs_momentum",
             "displayName":"Nesterovs momentum",
             "description": "Whether to use Nesterovs momentum.",
             "defaultValue":[
              {
                  "name":"false",
                  "selected":False,
                  "displayName":"False"
              },
              {
                  "name":"true",
                  "selected":True,
                  "displayName":"True"
              }
             ],
             "paramType":"list",
             "uiElemType":"checkbox",
             "display":True,
             "hyperpatameterTuningCandidate":False,
             "expectedDataType": ["bool"],
             "allowedDataType":["bool"]
         },
         {
             "name":"early_stopping",
             "displayName":"Early Stop",
             "description": "Whether to use early stopping to terminate training when validation score is not improving.",
             "defaultValue":[
              {
                  "name":"false",
                  "selected":False,
                  "displayName":"False"
              },
              {
                  "name":"true",
                  "selected":False,
                  "displayName":"True"
              }
             ],
             "paramType":"list",
             "uiElemType":"checkbox",
             "display":True,
             "hyperpatameterTuningCandidate":False,
             "expectedDataType": ["bool"],
             "allowedDataType":["bool"]
         },
         {
             "name":"validation_fraction",
             "displayName":"Validation Fraction",
             "description": "The proportion of training data to set aside as validation set for early stopping.",
             "defaultValue":0.1,
             "acceptedValue":None,
             "valueRange":[0,1],
             "paramType":"number",
             "uiElemType":"textBox",
             "display":True,
             "hyperpatameterTuningCandidate":True,
             "expectedDataType": ["float"],
             "allowedDataType":["float"]
         },
         {
             "name":"beta_1 ",
             "displayName":"Beta 1",
             "description": "Exponential decay rate for estimates of first moment vector in adam.",
             "defaultValue":0.9,
             "acceptedValue":None,
             "valueRange":[0,1],
             "paramType":"number",
             "uiElemType":"textBox",
             "display":True,
             "hyperpatameterTuningCandidate":True,
             "expectedDataType": ["float"],
             "allowedDataType":["float"]
         },
         {
             "name":"beta_2 ",
             "displayName":"Beta 2",
             "description": "Exponential decay rate for estimates of second moment vector in adam.",
             "defaultValue":0.999,
             "acceptedValue":None,
             "valueRange":[0,1],
             "paramType":"number",
             "uiElemType":"textBox",
             "display":True,
             "hyperpatameterTuningCandidate":True,
             "expectedDataType": ["float"],
             "allowedDataType":["float"]
         },
         {
             "name":"epsilon",
             "displayName":"Epsilon",
             "description": "Value for numerical stability in adam.",
             "defaultValue":8,
             "acceptedValue":None,
             "valueRange":[3,10],
             "paramType":"number",
             "uiElemType":"slider",
             "display":True,
             "hyperpatameterTuningCandidate":True,
             "expectedDataType": ["int"],
             "allowedDataType":["int"]
         },
          {
              "name":"n_iter_no_change",
              "displayName":"No of Iteration",
              "description": "Maximum number of epochs to not meet tol improvement.",
              "defaultValue":10,
              "acceptedValue":None,
              "valueRange":[3,10],
              "paramType":"number",
              "uiElemType":"slider",
              "display":True,
              "hyperpatameterTuningCandidate":True,
              "expectedDataType": ["int"],
              "allowedDataType":["int"]
          },

]

SKLEARN_ML_SUPPORTED_XGB_BOOSTER = [
    {"name":"gbtree","selected":False,"displayName":"gbtree"},
    {"name":"dart","selected":False,"displayName":"dart"},
    {"name":"gblinear","selected":False,"displayName":"gblinear"},
]

SKLEARN_ML_SUPPORTED_XGB_TREE_ALGORITHMS = [
    {"name":"auto","selected":False,"displayName":"auto"},
    {"name":"exact","selected":False,"displayName":"exact"},
    {"name":"approx","selected":False,"displayName":"approx"},
    {"name":"hist","selected":False,"displayName":"hist"},
    {"name":"gpu_exact","selected":False,"displayName":"gpu_exact"},
    {"name":"gpu_hist","selected":False,"displayName":"gpu_hist"},

]

SKLEARN_ML_XGBOOST_CLASSIFICATION_PARAMS = [
    {
        "name":"eta",
        "displayName":"Learning Rate",
        "description" : "It is the step size shrinkage used to prevent Overfitting",
        "defaultValue":0.3,
        "acceptedValue":None,
        "valueRange":[0.0,1.0],
        "paramType":"number",
        "uiElemType":"slider",
        "display":True,
        "hyperpatameterTuningCandidate":True,
        "expectedDataType": ["float"],
        "allowedDataType":["float"]
    },
    {
        "name":"gamma",
        "displayName":"Minimum Loss Reduction",
        "description" : "It is the minimum loss reduction required to make a further partition on a leaf node of the tree",
        "defaultValue":0,
        "acceptedValue":None,
        "valueRange":[0,100],
        "paramType":"number",
        "uiElemType":"slider",
        "display":True,
        "hyperpatameterTuningCandidate":True,
        "expectedDataType": ["int"],
        "allowedDataType":["int"]
    },
    {
        "name":"max_depth",
        "displayName":"Maximum Depth",
        "description" : "The maximum depth of a tree",
        "defaultValue":6,
        "acceptedValue":None,
        "valueRange":[0,100],
        "paramType":"number",
        "uiElemType":"slider",
        "display":True,
        "hyperpatameterTuningCandidate":True,
        "expectedDataType": ["int"],
        "allowedDataType":["int"]
    },
    {
        "name":"min_child_weight",
        "displayName":"Minimum Child Weight",
        "description":"The Minimum sum of Instance weight needed in a child node",
        "defaultValue":1,
        "acceptedValue":None,
        "valueRange":[0,100],
        "paramType":"number",
        "uiElemType":"slider",
        "display":True,
        "hyperpatameterTuningCandidate":False,
        "expectedDataType": ["int"],
        "allowedDataType":["int"]
    },
    {
        "name":"subsample",
        "displayName":"Subsampling Ratio",
        "description":"It is the subsample ratio of the training instance",
        "defaultValue":1.0,
        "acceptedValue":None,
        "valueRange":[0.1,1.0],
        "paramType":"number",
        "uiElemType":"slider",
        "display":True,
        "hyperpatameterTuningCandidate":True,
        "expectedDataType": ["float"],
        "allowedDataType":["float"]
    },
    {
        "name":"colsample_bytree",
        "displayName":"subsample ratio of columns for each tree",
        "description":"It is the subsample ratio of columns when constructing each tree",
        "defaultValue":1.0,
        "acceptedValue":None,
        "valueRange":[0.1,1.0],
        "paramType":"number",
        "uiElemType":"slider",
        "display":True,
        "hyperpatameterTuningCandidate":True,
        "expectedDataType": ["float"],
        "allowedDataType":["float"]
    },
    {
        "name":"colsample_bylevel",
        "displayName":"subsample ratio of columns for each split",
        "description":"Subsample ratio of columns for each split in each level",
        "defaultValue":1.0,
        "acceptedValue":None,
        "valueRange":[0.1,1.0],
        "paramType":"number",
        "uiElemType":"slider",
        "display":True,
        "hyperpatameterTuningCandidate":False,
        "expectedDataType": ["float"],
        "allowedDataType":["float"]
    },
    {
        "name":"booster",
        "displayName" : "Booster Function",
        "description" : "The booster function to be used",
        # "defaultValue":[obj if obj["name"] != "gbtree" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_XGB_BOOSTER],
        "defaultValue":[obj for obj in SKLEARN_ML_SUPPORTED_XGB_BOOSTER],
        "paramType":"list",
        "uiElemType":"checkbox",
        "display":True,
        "hyperpatameterTuningCandidate":True,
        "expectedDataType": ["string"],
        "allowedDataType":["string"]
    },
    {
        "name":"tree_method",
        "displayName":"Tree Construction Algorithm",
        "description":"The Tree construction algorithm used in XGBoost",
        # "defaultValue":[obj if obj["name"] != "auto" else {"name":obj["name"],"selected":True,"displayName":obj["displayName"]} for obj in SKLEARN_ML_SUPPORTED_XGB_TREE_ALGORITHMS],
        "defaultValue":[obj for obj in SKLEARN_ML_SUPPORTED_XGB_TREE_ALGORITHMS],
        "paramType":"list",
        "uiElemType":"checkbox",
        "display":True,
        "hyperpatameterTuningCandidate":True,
        "expectedDataType": ["string"],
        "allowedDataType": ["string"]
    },
    {
        "name":"process_type",
        "displayName":"Process Type",
        "description":"Boosting process to run",
        "defaultValue":[{"name":"default","selected":True,"displayName":"Create New Trees"},
                {"name":"update","selected":True,"displayName":"Update Trees"}
            ],
        "paramType":"list",
        "uiElemType":"checkbox",
        "display":True,
        "hyperpatameterTuningCandidate":False,
        "expectedDataType": ["string"],
        "allowedDataType": ["string"]
    },
    {
        "name":"silent",
        "displayName":"Print Messages on Console",
        "description" : "Runtime Message Printing",
        "defaultValue":[{"name":0,"selected":False,"displayName":"True"},{"name":1,"selected":True,"displayName":"False"}],
        "paramType":"list",
        "uiElemType":"checkbox",
        "display":False,
        "hyperpatameterTuningCandidate":False,
        "expectedDataType": ["int"],
        "allowedDataType":["int"]
    },
    {
        "name":"predictor",
        "displayName":"Type of Predictor Algorithm",
        "description":"The type of predictor algorithm to use",
        "defaultValue":[{"name":"cpu_predictor","selected":True,"displayName":"Multicore CPU prediction algorithm"},
                {"name":"gpu_predictor","selected":True,"displayName":"Prediction using GPU"}
            ],
        "paramType":"list",
        "uiElemType":"checkbox",
        "display":False,
        "hyperpatameterTuningCandidate":False,
        "expectedDataType": ["string"],
        "allowedDataType": ["string"]
    },
]

SKLEARN_ML_NAIVE_BAYES_PARAMS = [
         {
            "name":"alpha",
            "displayName":"Alpha",
            "description" : "Additive (Laplace/Lidstone) smoothing parameter (0 for no smoothing).",
            "defaultValue":1.0,
            "acceptedValue":None,
            "valueRange":[0.0,1.0],
            "paramType":"number",
            "uiElemType":"slider",
            "display":True,
            "hyperpatameterTuningCandidate":True,
            "expectedDataType": ["float"],
            "allowedDataType":["float"]
        },
    ]
