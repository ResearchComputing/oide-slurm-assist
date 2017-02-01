import tornado.web
import json

import sandstone.lib.decorators
from sandstone_slurm.mixins.slurm_mixin import SlurmCmdMixin
from sandstone.lib.handlers.base import BaseHandler
from sandstone_slurm.config_utils import ConfigLoader
from sandstone_slurm.script_template_utils import TemplateFinder
from sandstone import settings



class FormConfigHandler(BaseHandler):

    @sandstone.lib.decorators.authenticated
    def get(self):
        form_config = ConfigLoader.getFormConfig()
        ctx = {
            'formConfig': form_config
            }
        self.write(ctx)

class JobListHandler(BaseHandler,SlurmCmdMixin):

    @sandstone.lib.decorators.authenticated
    def get(self):
        # This method should return all sacct data for
        # the running user.
        sacct_out = self.run_sacct()
        json_obj = json.dumps(sacct_out)
        self.write(json_obj)


    @sandstone.lib.decorators.authenticated
    def post(self):
        # This method should take the filepath of an
        # sbatch file as an argument, and then schedule
        # a job with the indicated file using sbatch.
        # The jobid of the scheduled job should be returned.
        return_code, output = self.job_submit(filepath=json.loads(self.request.body)['content'])
        res = {'output': output}
    	if return_code != 0:
    	    self.set_status(500)
        self.write(res)

class JobHandler(BaseHandler,SlurmCmdMixin):

    @sandstone.lib.decorators.authenticated
    def get(self,jobid):
        # This method should retrieve sacct data
        # for the job specified by jobid
        sacct_out = self.run_sacct(jobid=jobid)
        self.write(sacct_out)

    @sandstone.lib.decorators.authenticated
    def delete(self,jobid):
        # This method should dequeue the job specified
        # by jobid, via scancel.
        pass

class ScriptTemplateHandler(BaseHandler):

    @sandstone.lib.decorators.authenticated
    def get(self):
        # get all the templates
        templates = TemplateFinder.find_all_templates()

        parsed_json = {
            'templates': []
        }

        for template in templates:
            # parse the template
            parsed_json['templates'].append(template.parse())

        self.write(parsed_json)
