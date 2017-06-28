import os
import subprocess

APP_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

APP_SPECIFICATION = {
    'APP_DESCRIPTION': {
        'name': 'Slurm Assist',
        'link': '/#/slurm',
        'description': 'An assistive interface for scheduling jobs with Slurm.',
    },
    'NG_MODULE_NAME': 'slurm',
    'NG_MODULE_STYLESHEETS': (
        'slurm.css',
    ),
    'NG_MODULE_SCRIPTS': (
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-smart-table/dist/smart-table.min.js',
        'slurm.js',
        'schedule.service.js',
        'schedule.controller.js',
        'status.service.js',
        'status.controller.js',
        'loadmodal.controller.js',
        'saveasmodal.controller.js',
        'overwritemodal.controller.js',
        'estimatemodal.controller.js',
        'submitmodal.controller.js',
        'sa-duration.directive.js',
        'sa-assistform/sa-assistform.directive.js',
        'sa-assistform/filepathselect.controller.js',
        'sa-sbatchscript/sa-sbatchscript.directive.js',
        'typeaheadfocus.directive.js',
    ),
}

account_cmd = 'sacctmgr list ass user=$(whoami) -P -n format=account'

try:
	user_accounts = subprocess.check_output(
        	                account_cmd,
        	                shell=True,
        	                ).split()
except:
	user_accounts = ["example account"]

BASE_CONFIG = {
        "type": "object",
        "title": "SlurmConfig",
        "properties": {
            "account": {
                'title': "account",
                "type":"string",
                "enum": user_accounts,
                'description': 'Charge resources used by this job to specified account. The account is an arbitrary string. The account name may be changed after job submission using the scontrol command.',
            },
            "acct-freq": {
                "title": "acct-freq",
                "type": "string",
                'description': '',
            },
            "array": {
                "title": "array",
                "type": "string",
                "pattern": "^((\d+-)?(\d+:)?(\d+%)?\d+,)*((\d+-)?(\d+:)?(\d+%)?\d+)$",
                'description': 'Submit a job array, multiple jobs to be executed with identical parameters. The indexes specification identifies what array index values should be used. Multiple values may be specified using a comma separated list and/or a range of values with a "-" separator. For example, "--array=0-15" or "--array=0,6,16-32". A step function can also be specified with a suffix containing a colon and number. For example, "--array=0-15:4" is equivalent to "--array=0,4,8,12". A maximum number of simultaneously running tasks from the job array may be specified using a "%" separator. For example "--array=0-15%4" will limit the number of simultaneously running tasks from this job array to 4. The minimum index value is 0. the maximum value is one less than the configuration parameter MaxArraySize.',
            },
            "bb": {
                "title": "bb",
                "type": "string",
                "description": 'Burst buffer specification. The form of the specification is system dependent.',
            },
            "begin": {
                "title": "begin",
                "type": "string",
                'description': 'Submit the batch script to the SLURM controller immediately, like normal, but tell the controller to defer the allocation of the job until the specified time. Time may be of the form HH:MM:SS to run a job at a specific time of day (seconds are optional). (If that time is already past, the next day is assumed.) You may also specify midnight, noon, fika (3 PM) or teatime (4 PM) and you can have a time-of-day suffixed with AM or PM for running in the morning or the evening. You can also say what day the job will be run, by specifying a date of the form MMDDYY or MM/DD/YY YYYY-MM-DD. Combine date and time using the following format YYYY-MM-DD[THH:MM[:SS]]. You can also give times like now + count time-units, where the time-units can be seconds (default), minutes, hours, days, or weeks and you can tell SLURM to run the job today with the keyword today and to run the job tomorrow with the keyword tomorrow. The value may be changed after job submission using the scontrol command. For example: --begin=16:00 , --begin=now+1hour, --begin=now+60 (seconds by default), --begin=2016-01-20T12:34:00, Notes on date/time specifications: - Although the \'seconds\' field of the HH:MM:SS time specification is allowed by the code, note that the poll time of the SLURM scheduler is not precise enough to guarantee dispatch of the job on the exact second. The job will be eligible to start on the next poll following the specified time. The exact poll interval depends on the SLURM scheduler (e.g., 60 seconds with the default sched/builtin).- If no time (HH:MM:SS) is specified, the default is (00:00:00). - If a date is specified without a year (e.g., MM/DD) then the current year is assumed, unless the combination of MM/DD and HH:MM:SS has already passed for that year, in which case the next year is used.',
            },
            "checkpoint": {
                "title": "checkpoint",
                "type": "string",
                "subtype": "duration",
                "pattern": "^(\d+-)?(\d+:)?(\d+:)?(\d+)$",
                'description': 'Specifies the interval between creating checkpoints of the job step. By default, the job step will have no checkpoints created. Acceptable time formats include "minutes", "minutes:seconds", "hours:minutes:seconds", and "days-hours:minutes:seconds".',
            },
            "checkpoint-dir": {
                "title": "checkpoint-dir",
                "type": "string",
                "subtype": "filepath",
                "dironly": True,
                "pattern": "^(\/.*\/)*(.*)(\/)?$",
                'description': 'Specifies the directory into which the job or job step\'s checkpoint should be written (used by the checkpoint/blcrm and checkpoint/xlch plugins only). The default value is the current working directory. Checkpoint files will be of the form "<job_id>.ckpt" for jobs and "<job_id>.<step_id>.ckpt" for job steps.',
            },
            "cluster": {
                "title": "cluster",
                "type": "string",
                "description": 'Cluster to issue commands to.',
            },
            "constraint": {
                "title": "constraint",
                "type": "string",
                "description": 'Nodes can have features assigned to them by the Slurm administrator. Users can specify which of these features are required by their job using the constraint option. Only nodes having features matching the job constraints will be used to satisfy the request. Multiple constraints may be specified with AND, OR, matching OR, resource counts, etc. (some operators are not supported on all system types).',
            },
            "contiguous": {
                "title": "contiguous",
                "type": "boolean",
                "description": 'If set, then the allocated nodes must form a contiguous set. Not honored with the topology/tree or topology/3d_torus plugins, both of which can modify the node ordering.',
            },
            "cores-per-socket": {
                "title": "cores-per-socket",
                "type": "string",
                "description": 'Restrict node selection to nodes with at least the specified number of cores per socket. See additional information under -B option above when task/affinity plugin is enabled.',
            },
            "core-spec": {
                "title": "core-spec",
                "type": "number",
                "minimum": 0,
                "description": 'Count of specialized cores per node reserved by the job for system operations and not used by the application. The application will not use these cores, but will be charged for their allocation. Default value is dependent upon the node\'s configured CoreSpecCount value. If a value of zero is designated and the Slurm configuration option AllowSpecResourcesUsage is enabled, the job will be allowed to override CoreSpecCount and use the specialized resources on nodes it is allocated. This option can not be used with the --thread-spec option.',
            },
            "cpu-freq": {
                "title": "cpu-freq",
                "type": "string",
                "description": 'Request that job steps initiated by srun commands inside this sbatch script be run at some requested frequency if possible, on the CPUs selected for the step on the compute node(s).',
            },
            "cpus-per-task": {
                "title": "cpus-per-task",
                "type": "integer",
                "minimum":1,
                'description': 'Advise the SLURM controller that ensuing job steps will require ncpus number of processors per task. Without this option, the controller will just try to allocate one processor per task. For instance, consider an application that has 4 tasks, each requiring 3 processors. If our cluster is comprised of quad-processors nodes and we simply ask for 12 processors, the controller might give us only 3 nodes. However, by using the --cpus-per-task=3 options, the controller knows that each task requires 3 processors on the same node, and the controller will grant an allocation of 4 nodes, one for each of the 4 tasks.',
            },
            "deadline": {
                "title": "deadline",
                "type": "string",
                "description": 'remove the job if no ending is possible before this deadline (start > (deadline - time[-min])). Default is no deadline. Valid time formats are: \nHH:MM[:SS] [AM|PM]\nMMDD[YY] or MM/DD[/YY] or MM.DD[.YY]\nMM/DD[/YY]-HH:MM[:SS]\nYYYY-MM-DD[THH:MM[:SS]]]',
            },
            "dependency": {
                "title": "dependency",
                "type": "string",
                "description": 'Defer the start of this job until the specified dependencies have been satisfied completed. <dependency_list> is of the form <type:job_id[:job_id][,type:job_id[:job_id]]> or <type:job_id[:job_id][?type:job_id[:job_id]]>. All dependencies must be satisfied if the "," separator is used. Any dependency may be satisfied if the "?" separator is used. Many jobs can share the same dependency and these jobs may even belong to different users. The value may be changed after job submission using the scontrol command. Once a job dependency fails due to the termination state of a preceding job, the dependent job will never be run, even if the preceding job is requeued and has a different termination state in a subsequent execution.',
            },
            "distribution": {
                "title": "distribution",
                "type": "string",
                "description": 'arbitrary|<block|cyclic|plane=<options>[:block|cyclic|fcyclic]>\nSpecify alternate distribution methods for remote processes. In sbatch, this only sets environment variables that will be used by subsequent srun requests. This option controls the assignment of tasks to the nodes on which resources have been allocated, and the distribution of those resources to tasks for binding (task affinity). The first distribution method (before the ":") controls the distribution of resources across nodes. The optional second distribution method (after the ":") controls the distribution of resources across sockets within a node. Note that with select/cons_res, the number of cpus allocated on each socket and node may be different. Refer to the mc_support document for more information on resource allocation, assignment of tasks to nodes, and binding of tasks to CPUs.',
            },
            "error": {
                "title": "error",
                "type": "string",
                "subtype": "filepath",
                'description': 'Instruct SLURM to connect the batch script\'s standard error directly to the file name specified in the "filename pattern". By default both standard output and standard error are directed to the same file. For job arrays, the default file name is "slurm-%A_%a.out", "%A" is replaced by the job ID and "%a" with the array index. For other jobs, the default file name is "slurm-%j.out", where the "%j" is replaced by the job ID. See the --input option for filename specification options.',
            },
            "exclusive": {
                "title": "exclusive",
                "type": "string",
                "pattern": "^(user|mcs)$",
                "description": 'The job allocation can not share nodes with other running jobs (or just other users with the "user" option or with the "mcs" option). The default shared/exclusive behavior depends on system configuration and the partition\'s OverSubscribe option takes precedence over the job\'s option.',
            },
            "exclude": {
                "title": "exclude",
                "type": "string",
                "description": 'Explicitly exclude certain nodes from the resources granted to the job.',
            },
            "export": {
                "title": "export",
                "type": "string",
                "pattern": "^((.+)=(.+),)*((.+)=(.+))$",
                'description': 'Identify which environment variables are propagated to the batch job. Multiple environment variable names should be comma separated. Environment variable names may be specified to propagate the current value of those variables (e.g. "--export=EDITOR") or specific values for the variables may be exported (e.g.. "--export=EDITOR=/bin/vi") in addition to the environment variables that would otherwise be set. This option particularly important for jobs that are submitted on one cluster and execute on a different cluster (e.g. with different paths). By default all environment variables are propagated. If the argument is NONE or specific environment variable names, then the --get-user-env option will implicitly be set to load other environment variables based upon the user\'s configuration on the cluster which executes the job.',
            },
            "export-file": {
                "title": "export-file",
                "type": "string",
                "subtype": "filepath",
                'description': 'If a number between 3 and OPEN_MAX is specified as the argument to this option, a readable file descriptor will be assumed (STDIN and STDOUT are not supported as valid arguments). Otherwise a filename is assumed. Export environment variables defined in <filename> or read from <fd> to the job\'s execution environment. The content is one or more environment variable definitions of the form NAME=value, each separated by a null character. This allows the use of special characters in environment definitions.',
            },
            "extra-node-info": {
                "title": "extra-node-info",
                "type": "string",
                "description": 'Request a specific allocation of resources with details as to the number and type of computational resources within a cluster: number of sockets (or physical processors) per node, cores per socket, and threads per core. The total amount of resources being requested is the product of all of the terms. Each value specified is considered a minimum. An asterisk (*) can be used as a placeholder indicating that all available resources of that type are to be utilized. As with nodes, the individual levels can also be specified in separate options if desired.',
            },
            "get-user-env": {
                "title": "get-user-env",
                "type": "string",
                "pattern": "^(\d+)?([SL])$",
                'description': 'This option will tell sbatch to retrieve the login environment variables for the user specified in the --uid option. The environment variables are retrieved by running something of this sort "su - <username> -c /usr/bin/env" and parsing the output. Be aware that any environment variables already set in sbatch\'s environment will take precedence over any environment variables in the user\'s login environment. Clear any environment variables before calling sbatch that you do not want propagated to the spawned program. The optional timeout value is in seconds. Default value is 8 seconds. The optional mode value control the "su" options. With a mode value of "S", "su" is executed without the "-" option. With a mode value of "L", "su" is executed with the "-" option, replicating the login environment. If mode not specified, the mode established at SLURM build time is used. Example of use include "--get-user-env"(in this case, write "no option" to the input field), "--get-user-env=10" "--get-user-env=10L", and "--get-user-env=S". This option was originally created for use by Moab.',
            },
            "gid": {
                "title": "gid",
                "type": "string",
                "description": 'If sbatch is run as root, and the --gid option is used, submit the job with group\'s group access permissions. group may be the group name or the numerical group ID.',
            },
            "gres": {
                "title": "gres",
                "type": "string",
                "description": 'Specifies a comma delimited list of generic consumable resources. The format of each entry on the list is "name[[:type]:count]". The name is that of the consumable resource. The count is the number of those resources with a default value of 1. The specified resources will be allocated to the job on each node. The available generic consumable resources is configurable by the system administrator. A list of available generic consumable resources will be printed and the command will exit if the option argument is "help". Examples of use include "--gres=gpu:2,mic=1", "--gres=gpu:kepler:2", and "--gres=help".',
            },
            "gres-flags": {
                "title": "gres-flags",
                "type": "boolean",
                "description": 'If set, the only CPUs available to the job will be those bound to the selected GRES (i.e. the CPUs identifed in the gres.conf file will be strictly enforced rather than advisory). This option may result in delayed initiation of a job. For example a job requiring two GPUs and one CPU will be delayed until both GPUs on a single socket are available rather than using GPUs bound to separate sockets, however the application performance may be improved due to improved communication speed. Requires the node to be configured with more than one socket and resource filtering will be performed on a per-socket basis.',
            },
            "hold": {
                "title": "hold",
                "type": "boolean",
                "description": 'Specify the job is to be submitted in a held state (priority of zero). A held job can now be released using scontrol to reset its priority (e.g. "scontrol release <job_id>").',
            },
            "hint": {
                "title": "hint",
                "type": "string",
                "pattern": "^(compute_bound|memory_bound|(no)?multithread)$",
                "description": 'Bind tasks according to application hints.\ncompute_bound: Select settings for compute bound applications: use all cores in each socket, one thread per core.\nmemory_bound: Select settings for memory bound applications: use only one core in each socket, one thread per core.\n[no]multithread: [don\'t] use extra threads with in-core multi-threading which can benefit communication intensive applications. Only supported with the task/affinity plugin.',
            },
            "immediate": {
                "title": "immediate",
                "type": "boolean",
                'description': 'Specifies the directory into which the job or job step\'s checkpoint should be written (used by the checkpoint/blcrm and checkpoint/xlch plugins only). The default value is the current working directory. Checkpoint files will be of the form "<job_id>.ckpt" for jobs and "<job_id>.<step_id>.ckpt" for job steps.',
            },
            "ignore-pbs": {
                "title": "ignore-pbs",
                "type": "boolean",
                "description": 'Ignore any "#PBS" options specified in the batch script.',
            },
            "input": {
                "title": "input",
                "type": "string",
                "subtype": "filepath",
                'description': 'Instruct SLURM to connect the batch script\'s standard input directly to the file name specified in the "filename pattern". By default, "/dev/null" is open on the batch script\'s standard input and both standard output and standard error are directed to a file of the name "slurm-%j.out", where the "%j" is replaced with the job allocation number, as described below. The filename pattern may contain one or more replacement symbols, which are a percent sign "%" followed by a letter (e.g. %j). Supported replacement symbols are: %A:Job array\'s master job allocation number. %a:Job array ID (index) number. %j:Job allocation number.%N:Node name. Only one file is created, so %N will be replaced by the name of the first node in the job, which is the one that runs the script.%u:User name.',
            },
            "job-name": {
                "title": "job-name",
                "type": "string",
                "pattern": "^\S*$",
                'description': 'Specify a name for the job allocation. The specified name will appear along with the job id number when querying running jobs on the system. The default is the name of the batch script, or just "sbatch" if the script is read on sbatch\'s standard input.',
            },
            "kill-on-invalid-dep": {
                "title": "kill-on-invalid-dep",
                "type": "string",
                "pattern": "^(yes|no)$",
                "description": '(yes|no) If a job has an invalid dependency and it can never run this parameter tells Slurm to terminate it or not. A terminated job state will be JOB_CANCELLED. If this option is not specified the system wide behavior applies. By default the job stays pending with reason DependencyNeverSatisfied or if the kill_invalid_depend is specified in slurm.conf the job is terminated.',
            },
            "licenses": {
                "title": "licenses",
                "type": "string",
                'description': 'Specification of licenses (or other resources available on all nodes of the cluster) which must be allocated to this job. License names can be followed by a colon and count (the default count is one). Multiple license names should be comma separated (e.g. "--licenses=foo:4,bar"). To submit jobs using remote licenses, those served by the slurmdbd, specify the name of the server providing the licenses. For example "--license=nastran@slurmdb:12".',
            },
            "mail-type": {
                "title": "mail-type",
                "type": "string",
                "pattern": "^((BEGIN|END|FAIL|REQUEUE|ALL|TIME_LIMIT(_[589]0)?),)*(BEGIN|END|FAIL|REQUEUE|ALL|TIME_LIMIT(_[589]0)?)$",
                'description': 'Notify user by email when certain event types occur. Valid type values are BEGIN, END, FAIL, REQUEUE, ALL (equivalent to BEGIN, END, FAIL and REQUEUE), TIME_LIMIT, TIME_LIMIT_90 (reached 90 percent of time limit), TIME_LIMIT_80 (reached 80 percent of time limit), and TIME_LIMIT_50 (reached 50 percent of time limit). Multiple type values may be specified in a comma separated list. The user to be notified is indicated with --mail-user.',
            },
            "mail-user": {
                "title": "mail-user",
                "type": "string",
                'description': 'User to receive email notification of state changes as defined by --mail-type. The default value is the submitting user.',
            },
            "mcs-label": {
                "title": "mcs-label",
                "type": "string",
                "description": 'Used only when the mcs/group plugin is enabled. This parameter is a group among the groups of the user. Default value is calculated by the Plugin mcs if it\'s enabled.',
            },
            "mem": {
                "title": "mem",
                "type": "number",
                "minimum":1,
                'description': 'Specify the real memory required per node in MegaBytes. Default value is DefMemPerNode and the maximum value is MaxMemPerNode. If configured, both parameters can be seen using the scontrol show config command. This parameter would generally be used if whole nodes are allocated to jobs (SelectType=select/linear). Also see --mem-per-cpu. --mem and --mem-per-cpu are mutually exclusive. NOTE: A memory size specification is treated as a special case and grants the job access to all of the memory on each node. NOTE: Enforcement of memory limits currently relies upon the task/cgroup plugin or enabling of accounting, which samples memory use on a periodic basis (data need not be stored, just collected). In both cases memory use is based upon the job\'s Resident Set Size (RSS). A task may exceed the memory limit until the next periodic accounting sample.',
            },
            "mem-per-cpu": {
                "title": "mem-per-cpu",
                "type": "number",
                "minimum":1,
                'description': 'Mimimum memory required per allocated CPU in MegaBytes. Default value is DefMemPerCPU and the maximum value is MaxMemPerCPU (see exception below). If configured, both parameters can be seen using the scontrol show config command. Note that if the job\'s --mem-per-cpu value exceeds the configured MaxMemPerCPU, then the user\'s limit will be treated as a memory limit per task; --mem-per-cpu will be reduced to a value no larger than MaxMemPerCPU; --cpus-per-task will be set and the value of --cpus-per-task multiplied by the new --mem-per-cpu value will equal the original --mem-per-cpu value specified by the user. This parameter would generally be used if individual processors are allocated to jobs (SelectType=select/cons_res). If resources are allocated by the core, socket or whole nodes; the number of CPUs allocated to a job may be higher than the task count and the value of --mem-per-cpu should be adjusted accordingly. Also see --mem. --mem and --mem-per-cpu are mutually exclusive.',
            },
            "mem_bind": {
                "title": "mem_bind",
                "type": "string",
                "description": 'Bind tasks to memory. Used only when the task/affinity plugin is enabled and the NUMA memory functions are available. Note that the resolution of CPU and memory binding may differ on some architectures. For example, CPU binding may be performed at the level of the cores within a processor while memory binding will be performed at the level of nodes, where the definition of "nodes" may differ from system to system. The use of any type other than "none" or "local" is not recommended. If you want greater control, try running a simple test code with the options "--mem_bind=verbose,none" to determine the specific configuration.',
            },
            "mincpus": {
                "title": "mincpus",
                "type": "number",
                "minimum": 0,
                "description": 'Specify a minimum number of logical cpus/processors per node.',
            },
            "nodes": {
                "title": "nodes",
                "type": "number",
                "minimum":1,
                'description': 'Request that a minimum of minnodes nodes be allocated to this job. A maximum node count may also be specified with maxnodes. If only one number is specified, this is used as both the minimum and maximum node count. The partition\'s node limits supersede those of the job. If a job\'s node limits are outside of the range permitted for its associated partition, the job will be left in a PENDING state. This permits possible execution at a later time, when the partition limit is changed. If a job node limit exceeds the number of nodes configured in the partition, the job will be rejected. Note that the environment variable SLURM_NNODES will be set to the count of nodes actually allocated to the job. See the ENVIRONMENT VARIABLES section for more information. If -N is not specified, the default behavior is to allocate enough nodes to satisfy the requirements of the -n and -c options. The job will be allocated as many nodes as possible within the range specified and without delaying the initiation of the job. The node count specification may include a numeric value followed by a suffix of "k" (multiplies numeric value by 1,024) or "m" (multiplies numeric value by 1,048,576).',
            },
            "no-kill": {
                "title": "no-kill",
                "type": "boolean",
                'description': 'Do not automatically terminate a job if one of the nodes it has been allocated fails. The user will assume the responsibilities for fault-tolerance should a node fail. When there is a node failure, any active job steps (usually MPI jobs) on that node will almost certainly suffer a fatal error, but with --no-kill, the job allocation will not be revoked so the user may launch new job steps on the remaining nodes in their allocation. By default SLURM terminates the entire job allocation if any node fails in its range of allocated nodes.',
            },
            "no-requeue": {
                "title": "no-requeue",
                "type": "boolean",
                'description': 'Specifies that the batch job should not be requeued after node failure. Setting this option will prevent system administrators from being able to restart the job (for example, after a scheduled downtime). When a job is requeued, the batch script is initiated from its beginning. Also see the --requeue option. The JobRequeue configuration parameter controls the default behavior on the cluster.',
            },
            "nodefile": {
                "title": "nodefile",
                "type": "string",
                "subtype": "filepath",
                "pattern": "^(\/.*\/)*(.*)(\/)?$",
                'description': 'Much like --nodelist, but the list is contained in a file of name node file. The node names of the list may also span multiple lines in the file. Duplicate node names in the file will be ignored. The order of the node names in the list is not important; the node names will be sorted by SLURM.',
            },
            "nodelist": {
                "title": "nodelist",
                "type": "string",
                'description': 'Request a specific list of hosts. The job will contain all of these hosts and possibly additional hosts as needed to satisfy resource requirements. The list may be specified as a comma-separated list of hosts, a range of hosts (host[1-5,7,...] for example), or a filename. The host list will be assumed to be a filename if it contains a "/" character. If you specify a minimum node or processor count larger than can be satisfied by the supplied host list, additional resources will be allocated on other nodes as needed. Duplicate node names in the list will be ignored. The order of the node names in the list is not important; the node names will be sorted by Slurm.',
            },
            "ntasks": {
                "title": "ntasks",
                "type": "number",
                "minimum": 0,
                "description": 'sbatch does not launch tasks, it requests an allocation of resources and submits a batch script. This option advises the Slurm controller that job steps run within the allocation will launch a maximum of number tasks and to provide for sufficient resources. The default is one task per node, but note that the --cpus-per-task option will change this default.',
            },
            "ntasks-per-core": {
                "title": "ntasks-per-core",
                "type": "number",
                "minimum": 0,
                "description": 'Request the maximum ntasks be invoked on each core. Meant to be used with the --ntasks option. Related to --ntasks-per-node except at the core level instead of the node level. NOTE: This option is not supported unless SelectTypeParameters=CR_Core or SelectTypeParameters=CR_Core_Memory is configured.',
            },
            "ntasks-per-socket": {
                "title": "ntasks-per-socket",
                "type": "number",
                "minimum": 0,
                "description": 'Request the maximum ntasks be invoked on each socket. Meant to be used with the --ntasks option. Related to --ntasks-per-node except at the socket level instead of the node level. NOTE: This option is not supported unless SelectTypeParameters=CR_Socket or SelectTypeParameters=CR_Socket_Memory is configured.',
            },
            "ntasks-per-node": {
                "title": "ntasks-per-node",
                "type": "number",
                "minimum": 0,
                "description": 'Request that ntasks be invoked on each node. If used with the --ntasks option, the --ntasks option will take precedence and the --ntasks-per-node will be treated as a maximum count of tasks per node. Meant to be used with the --nodes option. This is related to --cpus-per-task=ncpus, but does not require knowledge of the actual number of cpus on each node. In some cases, it is more convenient to be able to request that no more than a specific number of tasks be invoked on each node. Examples of this include submitting a hybrid MPI/OpenMP app where only one MPI "task/rank" should be assigned to each node while allowing the OpenMP portion to utilize all of the parallelism present in the node, or submitting a single setup/cleanup/monitoring job to each node of a pre-existing allocation as one step in a larger job script.',
            },
            "network": {
                "title": "network",
                "type": "string",
                "description": 'Specify information pertaining to the switch or network. The interpretation of type is system dependent. This option is supported when running Slurm on a Cray natively. It is used to request using Network Performace Counters. Only one value per request is valid. All options are case in-sensitive.',
            },
            "nice": {
                "title": "nice",
                "type": "number",
                "minimum": -10000,
                "maximum": 10000,
                "description": 'Run the job with an adjusted scheduling priority within Slurm. With no adjustment value the scheduling priority is decreased by 100. The adjustment range is from -10000 (highest priority) to 10000 (lowest priority). Only privileged users can specify a negative adjustment. NOTE: This option is presently ignored if SchedulerType=sched/wiki or SchedulerType=sched/wiki2.',
            },
            "overcommit": {
                "title": "overcommit",
                "type": "boolean",
                "description": 'Overcommit resources. When applied to job allocation, only one CPU is allocated to the job per node and options used to specify the number of tasks per node, socket, core, etc. are ignored. When applied to job step allocations (the srun command when executed within an existing job allocation), this option can be used to launch more than one task per CPU. Normally, srun will not allocate more than one process per CPU. By specifying --overcommit you are explicitly allowing more than one process per CPU. However no more than MAX_TASKS_PER_NODE tasks are permitted to execute per node. NOTE: MAX_TASKS_PER_NODE is defined in the file slurm.h and is not a variable, it is set at Slurm build time.',
            },
            "oversubscribe": {
                "title": "oversubscribe",
                "type": "boolean",
                "description": 'The job allocation can over-subscribe resources with other running jobs. The resources to be over-subscribed can be nodes, sockets, cores, and/or hyperthreads depending upon configuration. The default over-subscribe behavior depends on system configuration and the partition\'s OverSubscribe option takes precedence over the job\'s option. This option may result in the allocation being granted sooner than if the --oversubscribe option was not set and allow higher system utilization, but application performance will likely suffer due to competition for resources. Also see the --exclusive option.',
            },
            "output": {
                "title": "output",
                "type": "string",
                "subtype": "filepath",
                "pattern": "^(\/.*\/)*(.*)(\/)?$",
                'description': 'Instruct SLURM to connect the batch script\'s standard output directly to the file name specified in the "filename pattern". By default both standard output and standard error are directed to the same file. For job arrays, the default file name is "slurm-%A_%a.out", "%A" is replaced by the job ID and "%a" with the array index. For other jobs, the default file name is "slurm-%j.out", where the "%j" is replaced by the job ID. See the --input option for filename specification options.',
            },
            "open-mode": {
                "title": "open-mode",
                "type": "string",
                "pattern": "^(append|truncate)$",
                "description": '(append|truncate) Open the output and error files using append or truncate mode as specified. The default value is specified by the system configuration parameter JobFileAppend.',
            },
            "partition": {
                "title": "partition",
                "type": "string",
                'description': 'Request a specific partition for the resource allocation. If not specified, the default behavior is to allow the slurm controller to select the default partition as designated by the system administrator. If the job can use more than one partition, specify their names in a comma separate list and the one offering earliest initiation will be used with no regard given to the partition name ordering (although higher priority partitions will be considered first). When the job is initiated, the name of the partition used will be placed first in the job record partition string.',
            },
            "power": {
                "title": "power",
                "type": "string",
                "description": 'Comma separated list of power management plugin options. Currently available flags include: level (all nodes allocated to the job should have identical power caps, may be disabled by the Slurm configuration option PowerParameters=job_no_level).',
            },
            "profile": {
                "title": "profile",
                "type": "string",
                "description": 'enables detailed data collection by the acct_gather_profile plugin. Detailed data are typically time-series that are stored in an HDF5 file for the job.\nAll: All data types are collected. (Cannot be combined with other values.)\nNone: No data types are collected. This is the default. (Cannot be combined with other values.)\nEnergy: Energy data is collected.\nTask: Task (I/O, Memory, ...) data is collected.\nLustre: Lustre data is collected.\nNetwork: Network (InfiniBand) data is collected.',
            },
            "propagate": {
                "title": "propagate",
                "type": "string",
                "description": 'Allows users to specify which of the modifiable (soft) resource limits to propagate to the compute nodes and apply to their jobs. If rlimits is not specified, then all resource limits will be propagated. The following rlimit names are supported by Slurm (although some options may not be supported on some systems):\nALL: All limits listed below\nAS: The maximum address space for a process\nCORE: The maximum size of core file\nCPU: The maximum amount of CPU time\nDATA: The maximum size of a process\'s data segment\nFSIZE: The maximum size of files created. Note that if the user sets FSIZE to less than the current size of the slurmd.log, job launches will fail with a \'File size limit exceeded\' error.\nMEMLOCK: The maximum size that may be locked into memory\nNOFILE: The maximum number of open files\nNPROC: The maximum number of processes available\nRSS: The maximum resident set size\nSTACK: The maximum stack size',
            },
            "qos": {
                "title": "qos",
                "type": "string",
                'description': "Request a quality of service for the job. QOS values can be defined for each user/cluster/account association in the Slurm database. Users will be limited to their association's defined set of qos's when the Slurm configuration parameter, AccountingStorageEnforce, includes 'qos' in it's definition.",
            },
            "reboot": {
                "title": "reboot",
                "type": "boolean",
                'description': 'Force the allocated nodes to reboot before starting the job. This is only supported with some system configurations and will otherwise be silently ignored.',
            },
            "requeue": {
                "title": "requeue",
                "type": "boolean",
                'description': 'Specifies that the batch job should eligible to being requeue. The job may be requeued explicitly by a system administrator, after node failure, or upon preemption by a higher priority job. When a job is requeued, the batch script is initiated from its beginning. Also see the --no-requeue option. The JobRequeue configuration parameter controls the default behavior on the cluster.',
            },
            "reservation": {
                "title": "reservation",
                "type": "string",
                'description': 'Allocate resources for the job from the named reservation.',
            },
            "signal": {
                "title": "signal",
                "type": "string",
                'description': 'When a job is within sig_time seconds of its end time, send it the signal sig_num. Due to the resolution of event handling by Slurm, the signal may be sent up to 60 seconds earlier than specified. sig_num may either be a signal number or name (e.g. "10" or "USR1"). sig_time must have an integer value between 0 and 65535. By default, no signal is sent before the job\'s end time. If a sig_num is specified without any sig_time, the default time will be 60 seconds. Use the "B:" option to signal only the batch shell, none of the other processes will be signaled. By default all job steps will be signalled, but not the batch shell itself.',
            },
            "sockets-per-node": {
                "title": "sockets-per-node",
                "type": "number",
                "minimum": 0,
                'description': 'Restrict node selection to nodes with at least the specified number of sockets. See additional information under -B option above when task/affinity plugin is enabled.',
            },
            "switches": {
                "title": "switches",
                "type": "string",
                'description': 'When a tree topology is used, this defines the maximum count of switches desired for the job allocation and optionally the maximum time to wait for that number of switches. If Slurm finds an allocation containing more switches than the count specified, the job remains pending until it either finds an allocation with desired switch count or the time limit expires. It there is no switch count limit, there is no delay in starting the job. Acceptable time formats include "minutes", "minutes:seconds", "hours:minutes:seconds", "days-hours", "days-hours:minutes" and "days-hours:minutes:seconds". The job\'s maximum time delay may be limited by the system administrator using the SchedulerParameters configuration parameter with the max_switch_wait parameter option. The default max-time is the max_switch_wait SchedulerParameters.',
            },
            "time": {
                "title": "time",
                "type": "string",
                "subtype": "duration",
                "pattern": '^(\d+-)?(\d+):(\d+):(\d+)$',
                "minDuration": 0,
                'description': 'Set a limit on the total run time of the job allocation. If the requested time limit exceeds the partition\'s time limit, the job will be left in a PENDING state (possibly indefinitely). The default time limit is the partition\'s default time limit. When the time limit is reached, each task in each job step is sent SIGTERM followed by SIGKILL. The interval between signals is specified by the SLURM configuration parameter KillWait. A time limit of zero requests that no time limit be imposed. Acceptable time formats are "DD-HH:MM:SS" or "HH:MM:SS".',
            },
            "time-min": {
                "title": "time-min",
                "type": "string",
                "pattern": '^(\d+-)?(\d+):(\d+):(\d+)$',
                "minDuration": 0,
                'description': 'Set a minimum time limit on the job allocation. If specified, the job may have it\'s --time limit lowered to a value no lower than --time-min if doing so permits the job to begin execution earlier than otherwise possible. The job\'s time limit will not be changed after the job is allocated resources. This is performed by a backfill scheduling algorithm to allocate resources otherwise reserved for higher priority jobs. Acceptable time formats include "hours:minutes:seconds" and "days-hours:minutes:seconds".',
            },
            "tasks-per-node": {
                "title": "tasks-per-node",
                "type": "number",
                "minimum": 0,
                'description': 'Specify the number of tasks to be launched per node. Equivalent to --ntasks-per-node.',
            },
            "test-only": {
                "title": "test-only",
                "type": "boolean",
                "minimum": 0,
                'description': 'Validate the batch script and return an estimate of when a job would be scheduled to run given the current job queue and all the other arguments specifying the job requirements. No job is actually submitted.',
            },
            "thread-spec": {
                "title": "thread-spec",
                "type": "number",
                "minimum": 0,
                'description': 'Count of specialized threads per node reserved by the job for system operations and not used by the application. The application will not use these threads, but will be charged for their allocation. This option can not be used with the --core-spec option.',
            },
            "threads-per-core": {
                "title": "threads-per-core",
                "type": "number",
                "minimum": 0,
                'description': 'Restrict node selection to nodes with at least the specified number of threads per core. NOTE: "Threads" refers to the number of processing units on each core rather than the number of application tasks to be launched per core. See additional information under -B option above when task/affinity plugin is enabled.',
            },
            "tmp": {
                "title": "tmp",
                "type": "number",
                'description': '(MB) Specify a minimum amount of temporary disk space.',
            },
            "uid": {
                "title": "uid",
                "type": "string",
                'description': 'Attempt to submit and/or run a job as user instead of the invoking user id. The invoking user\'s credentials will be used to check access permissions for the target partition. User root may use this option to run jobs as a normal user in a RootOnly partition for example. If run as root, sbatch will drop its permissions to the uid specified after node allocation is successful. user may be the user name or numerical user ID.',
            },
            "wait": {
                "title": "wait",
                "type": "boolean",
                "description": 'Do not exit until the submitted job terminates. The exit code of the sbatch command will be the same as the exit code of the submitted job. If the job terminated due to a signal rather than a normal exit, the exit code will be set to 1. In the case of a job array, the exit code recorded will be the highest value for any task in the job array.',
            },
            "wait-all-nodes": {
                "title": "wait-all-nodes",
                "type": "integer",
                "minimum": 0,
                "maximum": 1,
                "description": 'Controls when the execution of the command begins. By default the job will begin execution as soon as the allocation is made.\n0: Begin execution as soon as allocation can be made. Do not wait for all nodes to be ready for use (i.e. booted).\n1: Do not begin execution until all nodes are ready for use.',
            },
            "wckey": {
                "title": "wckey",
                "type": "string",
                'description': 'Specify wckey to be used with job. If TrackWCKey=no (default) in the slurm.conf this value is ignored.',
            },
            "workdir": {
                "title": "workdir",
                "type": "string",
                "subtype": "filepath",
                "dironly": True,
                "pattern": "^(\/)?(.*\/)*(.*)(\/)?$",
                'description': 'Set the working directory of the batch script to directory before it is executed. The path can be specified as full path or relative path to the directory where the command is executed.',
            },
        }
    }

FORM_CONFIG = {
    # [<str: feature1>, <str: feature2>]
    'features': [],
    # [(<str: gname>, <str: type>, <int (optional): count>), ...]
    'gres': [],
    # Site-specific queue config
    'profiles': {
        # Key off of <str: profile_name>
    },
}
