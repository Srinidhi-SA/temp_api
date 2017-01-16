echo "Running the meta"

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

echo "input file Arg1 $1"
echo "output directory Arg2 $2"

echo "Fixing permission on pem file"
chmod 0400 api/lib/mAdviser_key_pair.pem


# DO NOT FORGET TO UNCOMMENT THIS!!!!
echo "Running the meta"
ssh -i api/lib/mAdviser_key_pair.pem hadoop@ec2-54-88-153-37.compute-1.amazonaws.com spark-submit --master yarn  --deploy-mode client /home/hadoop/codebase/marlabs-bi/bi/scripts/metadata.py --input "hdfs://ip-172-31-3-88.ec2.internal:8020/$1" --result "hdfs://ip-172-31-3-88.ec2.internal:8020$2/meta.json"
