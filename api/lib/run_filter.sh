
echo "Running the meta"

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

echo "HDFS HOST: $1"
echo "INPUT FILE: $2"
echo "OUTPUT FILE: $3"
echo "COLUMN_SETTINGS: $4"
echo "DIMENSION_FILTER: $5"
echo "MEASURE_FILTER: $6"


echo "Fixing permission on pem file"
chmod 0400 api/lib/emr.pem

# DO NOT FORGET TO UNCOMMENT THIS!!!!
echo "Running the filter"
#spark-submit --master yarn  --deploy-mode client /home/ankush/codebase/marlabs-bi/bi/scripts/metadata.py
#        --input "hdfs://$1:9000$2" --result "hdfs://$1:9000$3"

spark-submit --master yarn --deploy-mode client  \
        /home/ankush/codebase/marlabs-bi/bi/filter_cl.py \
        --input "hdfs://$1:9000$2" \
        --result "hdfs://$1:9000$3" \
        --consider_columns "$4" \
        --dimension_filter "$5" \
        --measure_filter "$6"
