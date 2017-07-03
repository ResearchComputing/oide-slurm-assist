#!/bin/bash -l

#SBATCH -p regular
#SBATCH -N 64
#SBATCH -t 12:00:00
#SBATCH -L project
#SBATCH -C haswell

#to run with pure MPI
export OMP_NUM_THREADS=$SANDSTONE_NUM_THREADS
srun -n 20 -c 4 $SANDSTONE_SCRIPT_NAME   # -c is optional since this example is fully packed pure MPI (32 MPI tasks per node)
