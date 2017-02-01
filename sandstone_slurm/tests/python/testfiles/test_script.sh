#!/bin/bash
#SBATCH --job-name test-job
#SBATCH --nodes 2
#SBATCH --account=crcsupport
#SBATCH --output output.out
#python main.py

python $SANDSTONE_FILENAME
